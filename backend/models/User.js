const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },

    // Profile data used to drive AI outfit matching
    profile: {
      heightCm: { type: Number },
      skinTone: {
        type: String,
        enum: ['fair', 'light', 'medium', 'olive', 'tan', 'deep'],
      },
      undertone: {
        type: String,
        enum: ['warm', 'cool', 'neutral'],
      },
      bodyType: {
        type: String,
        enum: ['slim', 'athletic', 'average', 'curvy', 'plus'],
      },
      gender: {
        type: String,
        enum: ['male', 'female', 'nonbinary', 'unspecified'],
        default: 'unspecified',
      },
      photoUrl: { type: String }, // reference photo for future try-on rendering

      // Tailor-style measurements — drive the per-garment fit engine
      // (how a given size chart will actually sit on this body).
      measurements: {
        chestCm: { type: Number },
        waistCm: { type: Number },
        hipCm: { type: Number },
        shoulderCm: { type: Number },
      },
    },

    avatarUrl: { type: String },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Used by the frontend to decide whether to route someone into the
// "complete your profile" step, and by the outfit/fit engines to know
// whether they have enough signal to work with.
UserSchema.methods.isProfileComplete = function () {
  const p = this.profile || {};
  const m = p.measurements || {};
  return Boolean(
    p.heightCm && p.skinTone && p.undertone && p.bodyType &&
    m.chestCm && m.waistCm && m.hipCm && m.shoulderCm
  );
};

module.exports = mongoose.model('User', UserSchema);
