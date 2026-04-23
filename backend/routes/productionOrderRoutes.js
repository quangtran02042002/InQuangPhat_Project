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
const { protect, admin, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, authorize('director', 'production'), getProductionOrders)
  .post(protect, admin, authorize('director', 'production'), createProductionOrder);

router.route('/:id')
  .get(protect, admin, authorize('director', 'production'), getProductionOrderById)
  .put(protect, admin, authorize('director', 'production'), updateProductionOrder)
  .delete(protect, admin, authorize('director', 'production'), deleteProductionOrder);

router.route('/:id/progress')
  .patch(protect, admin, authorize('director', 'production'), updateProductionOrderProgress);

module.exports = router;
