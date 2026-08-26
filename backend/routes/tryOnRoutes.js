const express = require('express');
const router = express.Router();
const { generateTryOn } = require('../controllers/tryOnController');
const { protect } = require('../middleware/auth');

router.post('/', protect, generateTryOn);

module.exports = router;
