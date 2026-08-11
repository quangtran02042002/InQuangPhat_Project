const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getOrders,
  createOrder,
  updateOrder,
  toggleDelivered,
  deleteOrder,
} = require('../controllers/materialOrderController');

router.route('/')
  .get(protect, admin, getOrders)
  .post(protect, admin, createOrder);

router.route('/:id')
  .put(protect, admin, updateOrder)
  .delete(protect, admin, deleteOrder);

router.route('/:id/toggle-delivered')
  .put(protect, admin, toggleDelivered);

module.exports = router;
