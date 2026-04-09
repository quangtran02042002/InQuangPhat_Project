const express = require('express');
const router = express.Router();
const {
    getMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    getDispatches,
    createDispatch,
} = require('../controllers/materialController');

// Cấp phát (dispatch) — PHẢI đặt TRƯỚC /:id để tránh conflict
router.route('/dispatches').get(getDispatches).post(createDispatch);

// Kho tồn kho vật tư
router.route('/').get(getMaterials).post(createMaterial);
router.route('/:id').put(updateMaterial).delete(deleteMaterial);

module.exports = router;