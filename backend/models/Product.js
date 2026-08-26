const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      required: true,
      enum: ['top', 'bottom', 'dress', 'outerwear', 'footwear', 'accessory'],
    },
    price: { type: Number, required: true },
    images: [{ type: String }], // product photo URLs, front-facing for try-on overlay
    colors: [{ type: String }],
    sizes: [{ type: String }],

    // Tags that power the AI-style matching engine
    occasionTags: [
      {
        type: String,
        enum: ['casual', 'formal', 'business', 'evening', 'wedding', 'athletic', 'streetwear'],
      },
    ],
    skinToneTags: [
      { type: String, enum: ['fair', 'light', 'medium', 'olive', 'tan', 'deep'] },
    ],
    undertoneTags: [{ type: String, enum: ['warm', 'cool', 'neutral'] }],
    bodyTypeTags: [
      { type: String, enum: ['slim', 'athletic', 'average', 'curvy', 'plus'] },
    ],

    stock: { type: Number, default: 100 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
