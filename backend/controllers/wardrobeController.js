const WardrobeItem = require('../models/WardrobeItem');

// GET /api/wardrobe
exports.getWardrobe = async (req, res) => {
  try {
    const items = await WardrobeItem.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ count: items.length, items });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch wardrobe', error: err.message });
  }
};

// POST /api/wardrobe
exports.addWardrobeItem = async (req, res) => {
  try {
    const { name, category, color, image, occasionTags, sourceProduct } = req.body;
    if (!name || !category) {
      return res.status(400).json({ message: 'name and category are required' });
    }

    const item = await WardrobeItem.create({
      user: req.user._id,
      name,
      category,
      color,
      image,
      occasionTags,
      sourceProduct,
    });

    res.status(201).json({ item });
  } catch (err) {
    res.status(400).json({ message: 'Could not add item', error: err.message });
  }
};

// PUT /api/wardrobe/:id/worn  (mark as worn today, feeds "what haven't I worn" logic)
exports.markWorn = async (req, res) => {
  try {
    const item = await WardrobeItem.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $inc: { timesWorn: 1 }, lastWornAt: new Date() },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ item });
  } catch (err) {
    res.status(500).json({ message: 'Could not update item', error: err.message });
  }
};

// DELETE /api/wardrobe/:id
exports.deleteWardrobeItem = async (req, res) => {
  try {
    const item = await WardrobeItem.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete item', error: err.message });
  }
};
