const express = require('express');
const router = express.Router();
const {
  getProductionOrders,
  getProductionOrderById,
  createProductionOrder,
  updateProductionOrder,
  updateProductionOrderProgress,
  deleteProductionOrder,
} = require('../controllers/productionOrderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getProductionOrders)
  .post(protect, admin, createProductionOrder);

router.route('/:id')
  .get(protect, getProductionOrderById)
  .put(protect, admin, updateProductionOrder)
  .delete(protect, admin, deleteProductionOrder);

router.route('/:id/progress')
  .patch(protect, updateProductionOrderProgress);

module.exports = router;
