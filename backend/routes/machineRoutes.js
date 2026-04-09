// backend/routes/machineRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinaryConfig'); 
const { protect, admin } = require('../middleware/authMiddleware');

// Nhớ thêm getSingleMachine vào dòng import này
const { 
    createMachine, 
    getAllMachines, 
    deleteMachine,
    getSingleMachine, // <--- THÊM VÀO ĐÂY
    updateMachine // <-- Nhớ import hàm mới
} = require('../controllers/machineController');

// Route lấy danh sách tất cả
router.route('/machines').get(getAllMachines);

// --- THÊM ROUTE NÀY ---
// Route lấy chi tiết 1 máy (QUAN TRỌNG: Phải đặt params là :id)
router.route('/machines/:id').get(getSingleMachine);
// ----------------------

// Route tạo mới (Admin)
router.route('/admin/machine/new').post(
    protect, admin,
    upload.fields([
        { name: 'images', maxCount: 10 }, 
        { name: 'videos', maxCount: 5 }
    ]), 
    createMachine
);
router.route('/admin/machine/:id')
    .get(getSingleMachine)
    .delete(protect, admin, deleteMachine)
    .put(
        protect, admin,
        upload.fields([
            { name: 'images', maxCount: 10 }, 
            { name: 'videos', maxCount: 5 }
        ]), 
        updateMachine // <-- Gắn hàm update vào method PUT
    );

module.exports = router;