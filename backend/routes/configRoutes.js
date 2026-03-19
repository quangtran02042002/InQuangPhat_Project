const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getPaperSizes, createPaperSize, deletePaperSize,
    getPaperWeights, createPaperWeight, deletePaperWeight,
    getSurcharges, createSurcharge, deleteSurcharge
} = require('../controllers/configController');

router.use(protect, admin); // Bảo vệ API

// Chú ý: Đây là /paper-sizes (Khổ giấy), khác với /paper-prices (Giá giấy)
router.route('/paper-sizes').get(getPaperSizes).post(createPaperSize);
router.route('/paper-sizes/:id').delete(deletePaperSize);

router.route('/paper-weights').get(getPaperWeights).post(createPaperWeight);
router.route('/paper-weights/:id').delete(deletePaperWeight);

router.route('/surcharges').get(getSurcharges).post(createSurcharge);
router.route('/surcharges/:id').delete(deleteSurcharge);

module.exports = router;