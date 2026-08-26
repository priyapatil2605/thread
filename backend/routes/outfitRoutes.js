const express = require('express');
const router = express.Router();
const { suggestOutfit, saveOutfit, getOutfits } = require('../controllers/outfitController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/suggest', suggestOutfit);
router.post('/', saveOutfit);
router.get('/', getOutfits);

module.exports = router;
