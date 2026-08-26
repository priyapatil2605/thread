const mongoose = require('mongoose');

const OutfitSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String },
    occasion: { type: String },
    // An outfit can mix items already owned (wardrobe) and shop products (wishlist-style)
    wardrobeItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WardrobeItem' }],
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    matchScore: { type: Number }, // score returned by the recommendation engine at save time
    aiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Outfit', OutfitSchema);
