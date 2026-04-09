const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getFinishingPrices,
    updateFinishingPrice,
    bulkUpdateFinishingPrices,
    createFinishingPrice,
    deleteFinishingPrice,
    seedFinishingPrices
} = require('../controllers/finishingPriceController');

// GET all / POST create
router.route('/').get(protect, getFinishingPrices).post(protect, admin, createFinishingPrice);

// Bulk update (phải đặt trước /:id để không bị conflict)
router.route('/bulk-update').put(protect, admin, bulkUpdateFinishingPrices);

// Seed default data
router.route('/seed').post(protect, admin, seedFinishingPrices);

// Update / Delete single
router.route('/:id').put(protect, admin, updateFinishingPrice).delete(protect, admin, deleteFinishingPrice);

module.exports = router;
