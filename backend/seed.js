require('dotenv').config();
const connectDB = require('./config/db');
const Product = require('./models/Product');
const productImages = require('./product-images/productImages');

const sampleProducts = [
  {
    name: 'Tailored Wool Blazer',
    description: 'Structured single-breasted blazer in brushed wool.',
    category: 'outerwear',
    price: 189,
    images: [productImages.blazer],
    colors: ['charcoal', 'deep burgundy'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    occasionTags: ['business', 'formal'],
    skinToneTags: ['medium', 'olive', 'tan'],
    undertoneTags: ['warm', 'neutral'],
    bodyTypeTags: ['athletic', 'average', 'slim'],
  },
  {
    name: 'Silk Slip Evening Dress',
    description: 'Bias-cut silk slip dress with adjustable straps.',
    category: 'dress',
    price: 229,
    images: [productImages.dress],
    colors: ['emerald', 'black'],
    sizes: ['XS', 'S', 'M', 'L'],
    occasionTags: ['evening', 'wedding'],
    skinToneTags: ['fair', 'light', 'medium'],
    undertoneTags: ['cool', 'neutral'],
    bodyTypeTags: ['slim', 'average', 'curvy'],
  },
  {
    name: 'Relaxed Linen Trousers',
    description: 'High-rise wide-leg trousers in washed linen.',
    category: 'bottom',
    price: 98,
    images: [productImages.trousers],
    colors: ['sand', 'olive'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    occasionTags: ['casual', 'streetwear'],
    skinToneTags: ['medium', 'olive', 'tan', 'deep'],
    undertoneTags: ['warm', 'neutral'],
    bodyTypeTags: ['average', 'curvy', 'plus'],
  },
  {
    name: 'Merino Crew Sweater',
    description: 'Lightweight merino knit, ribbed cuffs and hem.',
    category: 'top',
    price: 79,
    images: [productImages.sweater],
    colors: ['cream', 'navy'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    occasionTags: ['casual', 'business'],
    skinToneTags: ['fair', 'light', 'medium', 'olive'],
    undertoneTags: ['cool', 'warm', 'neutral'],
    bodyTypeTags: ['slim', 'athletic', 'average'],
  },
  {
    name: 'Leather Ankle Boots',
    description: 'Block-heel ankle boots in supple leather.',
    category: 'footwear',
    price: 159,
    images: [productImages.boots],
    colors: ['black', 'cognac'],
    sizes: ['36', '37', '38', '39', '40', '41'],
    occasionTags: ['casual', 'business', 'evening'],
    skinToneTags: ['fair', 'light', 'medium', 'olive', 'tan', 'deep'],
    undertoneTags: ['warm', 'cool', 'neutral'],
    bodyTypeTags: ['slim', 'athletic', 'average', 'curvy', 'plus'],
  },
];

(async () => {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(sampleProducts);
  console.log(`Seeded ${sampleProducts.length} products`);
  process.exit(0);
})();
