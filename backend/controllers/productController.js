const Product = require('../models/Product');

// GET /api/products?category=top&occasion=formal&skinTone=olive
exports.getProducts = async (req, res) => {
  try {
    const { category, occasion, skinTone, undertone, bodyType, q } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (occasion) filter.occasionTags = occasion;
    if (skinTone) filter.skinToneTags = skinTone;
    if (undertone) filter.undertoneTags = undertone;
    if (bodyType) filter.bodyTypeTags = bodyType;
    if (q) filter.name = { $regex: q, $options: 'i' };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ count: products.length, products });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch products', error: err.message });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch product', error: err.message });
  }
};

// POST /api/products  (admin/seed use)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ product });
  } catch (err) {
    res.status(400).json({ message: 'Could not create product', error: err.message });
  }
};
