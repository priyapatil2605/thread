const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function sanitize(user) {
  const obj = user.toObject();
  delete obj.password;
  obj.profileComplete = user.isProfileComplete();
  return obj;
}

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({ token, user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    const token = signToken(user._id);
    res.json({ token, user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ user: sanitize(req.user) });
};

// PUT /api/auth/profile  (skin tone, height, body type, measurements — feeds the AI matcher + fit engine)
exports.updateProfile = async (req, res) => {
  try {
    const { heightCm, skinTone, undertone, bodyType, gender, photoUrl, measurements } = req.body;

    const user = await User.findById(req.user._id);
    const currentMeasurements = (user.profile.measurements && user.profile.measurements.toObject)
      ? user.profile.measurements.toObject()
      : (user.profile.measurements || {});

    user.profile = {
      ...user.profile.toObject(),
      ...(heightCm !== undefined && { heightCm }),
      ...(skinTone && { skinTone }),
      ...(undertone && { undertone }),
      ...(bodyType && { bodyType }),
      ...(gender && { gender }),
      ...(photoUrl && { photoUrl }),
      ...(measurements && {
        measurements: {
          ...currentMeasurements,
          ...(measurements.chestCm !== undefined && { chestCm: measurements.chestCm }),
          ...(measurements.waistCm !== undefined && { waistCm: measurements.waistCm }),
          ...(measurements.hipCm !== undefined && { hipCm: measurements.hipCm }),
          ...(measurements.shoulderCm !== undefined && { shoulderCm: measurements.shoulderCm }),
        },
      }),
    };
    await user.save();

    res.json({ user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: 'Could not update profile', error: err.message });
  }
};
