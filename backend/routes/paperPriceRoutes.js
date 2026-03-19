const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getPaperPrices, createPaperPrice, updatePaperPrice, deletePaperPrice } = require('../controllers/paperPriceController');

router.use(protect, admin); // Bảo vệ API

router.route('/').get(getPaperPrices).post(createPaperPrice);
router.route('/:id').put(updatePaperPrice).delete(deletePaperPrice);

module.exports = router;