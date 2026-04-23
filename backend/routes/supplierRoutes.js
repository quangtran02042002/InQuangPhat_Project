// backend/routes/supplierRoutes.js
const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  createSupplier,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplierController');
// Import Middleware bảo vệ
const { protect, admin, authorize } = require('../middleware/authMiddleware');

// Áp dụng bảo vệ cho tất cả routes bên dưới
router.use(protect);
router.use(admin);
router.use(authorize('director', 'accountant'));

router.route('/').get(getSuppliers).post(createSupplier);
router.route('/:id').get(getSupplierById).put(updateSupplier).delete(deleteSupplier);

module.exports = router;