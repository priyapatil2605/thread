const Cart = require('../models/Cart');
const Product = require('../models/Product');

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

function withTotals(cart) {
  const obj = cart.toObject();
  obj.subtotal = obj.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  obj.itemCount = obj.items.reduce((sum, i) => sum + i.quantity, 0);
  return obj;
}

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    res.json({ cart: withTotals(cart) });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch cart', error: err.message });
  }
};

// POST /api/cart  { productId, size, color, quantity }
exports.addToCart = async (req, res) => {
  try {
    const { productId, size, color, quantity } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId is required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const qty = Math.max(1, Number(quantity) || 1);
    const cart = await getOrCreateCart(req.user._id);

    // Same product + size + color already in the bag → bump quantity instead of duplicating the row
    const existing = cart.items.find(
      (i) => i.product.toString() === productId && i.size === (size || undefined) && i.color === (color || undefined)
    );

    if (existing) {
      existing.quantity += qty;
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0],
        price: product.price,
        size: size || undefined,
        color: color || undefined,
        quantity: qty,
      });
    }

    await cart.save();
    res.status(201).json({ cart: withTotals(cart) });
  } catch (err) {
    res.status(500).json({ message: 'Could not add to cart', error: err.message });
  }
};

// PUT /api/cart/:itemId  { quantity }
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    if (quantity <= 0) {
      item.deleteOne();
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json({ cart: withTotals(cart) });
  } catch (err) {
    res.status(500).json({ message: 'Could not update cart item', error: err.message });
  }
};

// DELETE /api/cart/:itemId
exports.removeCartItem = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.id(req.params.itemId);
    if (item) item.deleteOne();
    await cart.save();
    res.json({ cart: withTotals(cart) });
  } catch (err) {
    res.status(500).json({ message: 'Could not remove cart item', error: err.message });
  }
};

// DELETE /api/cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    res.json({ cart: withTotals(cart) });
  } catch (err) {
    res.status(500).json({ message: 'Could not clear cart', error: err.message });
  }
};

exports.getOrCreateCart = getOrCreateCart;
exports.withTotals = withTotals;
