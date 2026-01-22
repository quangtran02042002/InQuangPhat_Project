const express = require('express');
const router = express.Router();
const {
  getCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getCustomers)
  .post(protect, admin, createCustomer);

router.route('/:id')
  .get(protect, admin, getCustomerById)
  .put(protect, admin, updateCustomer)
  .delete(protect, admin, deleteCustomer);

module.exports = router;