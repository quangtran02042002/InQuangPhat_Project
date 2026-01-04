const express = require('express');
const router = express.Router();
const { getProducts, getProductById } = require('../controllers/productController');

// Đường dẫn gốc là /api/products (sẽ khai báo ở server.js)
router.route('/').get(getProducts);
router.route('/:id').get(getProductById);

module.exports = router;