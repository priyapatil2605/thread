const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { getOrCreateCart } = require('./cartController');

const FREE_SHIPPING_THRESHOLD = 150;
const FLAT_SHIPPING_FEE = 6.99;

// Stand-in for a real payment gateway. Always "succeeds" so the checkout
// flow can be exercised end-to-end. Swap this out for a real Razorpay/
// Stripe charge call later — same shape of return value (status + id)
// is all createOrder needs from it.
function simulatePayment({ paymentMethod, card }) {
  const transactionId = 'sim_' + crypto.randomBytes(8).toString('hex');
  if (paymentMethod === 'cod') {
    return { status: 'pending', transactionId, last4: undefined };
  }
  return {
    status: 'paid',
    transactionId,
    last4: paymentMethod === 'card' && card?.number ? card.number.slice(-4) : undefined,
  };
}

// POST /api/orders/checkout  { shippingAddress, paymentMethod, card? }
exports.checkout = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, card } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'shippingAddress and paymentMethod are required' });
    }
    const requiredAddr = ['fullName', 'line1', 'city', 'state', 'postalCode', 'country', 'phone'];
    for (const field of requiredAddr) {
      if (!shippingAddress[field]) {
        return res.status(400).json({ message: `Missing shipping field: ${field}` });
      }
    }
    if (paymentMethod === 'card') {
      if (!card?.number || !card?.expiry || !card?.cvv) {
        return res.status(400).json({ message: 'Card details are incomplete' });
      }
    }

    const cart = await getOrCreateCart(req.user._id);
    if (!cart.items.length) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    // Re-check stock at checkout time, not just at add-to-cart time
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product || product.stock < item.quantity) {
        return res.status(409).json({ message: `${item.name} no longer has enough stock` });
      }
    }

    const itemsTotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingFee = itemsTotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
    const total = Number((itemsTotal + shippingFee).toFixed(2));

    const payment = simulatePayment({ paymentMethod, card });
    if (payment.status === 'failed') {
      return res.status(402).json({ message: 'Payment failed, please try another method' });
    }

    const order = await Order.create({
      user: req.user._id,
      items: cart.items.map((i) => ({
        product: i.product,
        name: i.name,
        image: i.image,
        price: i.price,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
      })),
      shippingAddress,
      paymentMethod,
      payment,
      itemsTotal: Number(itemsTotal.toFixed(2)),
      shippingFee,
      total,
      status: 'placed',
    });

    // Decrement stock now that the order is confirmed
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    cart.items = [];
    await cart.save();

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Checkout failed', error: err.message });
  }
};

// GET /api/orders  (current user's order history)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch orders', error: err.message });
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch order', error: err.message });
  }
};
