const mongoose = require('mongoose');

const WardrobeItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['top', 'bottom', 'dress', 'outerwear', 'footwear', 'accessory'],
    },
    color: { type: String },
    image: { type: String }, // photo of the actual owned item
    occasionTags: [
      {
        type: String,
        enum: ['casual', 'formal', 'business', 'evening', 'wedding', 'athletic', 'streetwear'],
      },
    ],
    // If this item was bought through the shop, link back to the product
    sourceProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    timesWorn: { type: Number, default: 0 },
    lastWornAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WardrobeItem', WardrobeItemSchema);
