const express = require('express');
const router = express.Router();
const {
    getChemicals,
    createChemical,
    updateChemical,
    deleteChemical,
    getDispatches,
    createDispatch,
    updateDispatchStatus,
} = require('../controllers/chemicalController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

// Cấp phát (dispatch) — PHẢI đặt TRƯỚC /:id để tránh conflict
router.use(protect, admin, authorize('director', 'production'));
router.route('/dispatches').get(getDispatches).post(createDispatch);

// Route phê duyệt / hủy phiếu xuất kho
router.route('/dispatches/:id/status').patch(updateDispatchStatus);

// Kho tồn kho
router.route('/').get(getChemicals).post(createChemical);
router.route('/:id').put(updateChemical).delete(deleteChemical);

module.exports = router;