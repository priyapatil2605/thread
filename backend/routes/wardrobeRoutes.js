const express = require('express');
const router = express.Router();
const {
  getWardrobe,
  addWardrobeItem,
  markWorn,
  deleteWardrobeItem,
} = require('../controllers/wardrobeController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getWardrobe);
router.post('/', addWardrobeItem);
router.put('/:id/worn', markWorn);
router.delete('/:id', deleteWardrobeItem);

module.exports = router;
