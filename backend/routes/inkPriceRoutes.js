const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getInkPrices, createInkPrice, updateInkPrice, deleteInkPrice } = require('../controllers/inkPriceController');

router.route('/').get(protect, getInkPrices).post(protect, admin, createInkPrice);
router.route('/:id').put(protect, admin, updateInkPrice).delete(protect, admin, deleteInkPrice);

module.exports = router;
