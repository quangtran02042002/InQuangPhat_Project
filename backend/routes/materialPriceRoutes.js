const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getMaterialPrices, createMaterialPrice, updateMaterialPrice, deleteMaterialPrice } = require('../controllers/materialPriceController');

router.route('/').get(protect, getMaterialPrices).post(protect, admin, createMaterialPrice);
router.route('/:id').put(protect, admin, updateMaterialPrice).delete(protect, admin, deleteMaterialPrice);

module.exports = router;
