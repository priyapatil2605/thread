const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    size: { type: String },
    color: { type: String },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],

    shippingAddress: {
      fullName: { type: String, required: true },
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },

    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'cod'],
      required: true,
    },
    // No real gateway is wired in — this simulates a successful charge and
    // stores a fake reference id. Swap this block out for a real provider
    // (Razorpay/Stripe) behind the same createOrder endpoint later.
    payment: {
      status: { type: String, enum: ['paid', 'pending', 'failed'], default: 'pending' },
      transactionId: { type: String },
      last4: { type: String }, // for card payments, last 4 digits only — never store full card numbers
    },

    itemsTotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },

    status: {
      type: String,
      enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
