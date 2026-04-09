const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getPaperPrices, createPaperPrice, updatePaperPrice, deletePaperPrice } = require('../controllers/paperPriceController');

router.route('/').get(protect, getPaperPrices).post(protect, admin, createPaperPrice);
router.route('/:id').put(protect, admin, updatePaperPrice).delete(protect, admin, deletePaperPrice);

module.exports = router;