const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  deleteProduct,
  createProduct,
  updateProduct,
  getRandomProducts 
} = require('../controllers/productController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, admin, authorize('director'), createProduct); // <--- POST: Tạo mới (Chỉ Admin)

// Random products for homepage carousel (MUST be before /:id)
router.get('/random', getRandomProducts);

router.route('/:id')
  .get(getProductById)
  .delete(protect, admin, authorize('director'), deleteProduct)
  .put(protect, admin, authorize('director'), updateProduct); // <--- PUT: Cập nhật (Chỉ Admin)

module.exports = router;