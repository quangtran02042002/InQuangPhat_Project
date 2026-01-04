const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  deleteProduct,
  createProduct,
  updateProduct 
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct); // <--- POST: Tạo mới (Chỉ Admin)

router.route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct); // <--- PUT: Cập nhật (Chỉ Admin)

module.exports = router;