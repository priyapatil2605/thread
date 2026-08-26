const Product = require('../models/Product');
const WardrobeItem = require('../models/WardrobeItem');
const Outfit = require('../models/Outfit');

/**
 * Scores how well a product matches a user's profile + requested occasion.
 * This is a transparent, rule-based v1 of the "AI stylist" — swap this
 * function out later for a trained ranking model without touching the API shape.
 */
function scoreProduct(product, profile, occasion) {
  let score = 0;

  if (occasion && product.occasionTags?.includes(occasion)) score += 3;
  if (profile.skinTone && product.skinToneTags?.includes(profile.skinTone)) score += 2;
  if (profile.undertone && product.undertoneTags?.includes(profile.undertone)) score += 2;
  if (profile.bodyType && product.bodyTypeTags?.includes(profile.bodyType)) score += 2;

  // Height-based nudge: taller frames get a small bump for longer/outerwear layers,
  // shorter frames get a bump for cropped/fitted categories. Simple heuristic, not gospel.
  if (profile.heightCm) {
    if (profile.heightCm >= 178 && product.category === 'outerwear') score += 1;
    if (profile.heightCm < 165 && ['top', 'dress'].includes(product.category)) score += 1;
  }

  return score;
}

// GET /api/outfits/suggest?occasion=formal
exports.suggestOutfit = async (req, res) => {
  try {
    const { occasion } = req.query;
    const profile = req.user.profile || {};

    const candidates = await Product.find(occasion ? { occasionTags: occasion } : {});

    const ranked = candidates
      .map((p) => ({ product: p, score: scoreProduct(p, profile, occasion) }))
      .sort((a, b) => b.score - a.score);

    // Build one outfit: try to pick a top+bottom+footwear combo, or a single dress
    const byCategory = (cat) => ranked.find((r) => r.product.category === cat);

    const dress = byCategory('dress');
    let picks;
    if (dress && dress.score > 0) {
      picks = [dress, byCategory('footwear'), byCategory('accessory')].filter(Boolean);
    } else {
      picks = [byCategory('top'), byCategory('bottom'), byCategory('footwear'), byCategory('outerwear')].filter(
        Boolean
      );
    }

    const totalScore = picks.reduce((sum, p) => sum + p.score, 0);

    res.json({
      occasion: occasion || 'any',
      basedOn: {
        skinTone: profile.skinTone,
        undertone: profile.undertone,
        bodyType: profile.bodyType,
        heightCm: profile.heightCm,
      },
      matchScore: totalScore,
      outfit: picks.map((p) => p.product),
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not generate outfit suggestion', error: err.message });
  }
};

// POST /api/outfits  (save a chosen outfit, from wardrobe items and/or products)
exports.saveOutfit = async (req, res) => {
  try {
    const { name, occasion, wardrobeItems = [], products = [], matchScore, aiGenerated } = req.body;

    const outfit = await Outfit.create({
      user: req.user._id,
      name,
      occasion,
      wardrobeItems,
      products,
      matchScore,
      aiGenerated: !!aiGenerated,
    });

    res.status(201).json({ outfit });
  } catch (err) {
    res.status(400).json({ message: 'Could not save outfit', error: err.message });
  }
};

// GET /api/outfits
exports.getOutfits = async (req, res) => {
  try {
    const outfits = await Outfit.find({ user: req.user._id })
      .populate('wardrobeItems')
      .populate('products')
      .sort({ createdAt: -1 });
    res.json({ count: outfits.length, outfits });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch outfits', error: err.message });
  }
};
