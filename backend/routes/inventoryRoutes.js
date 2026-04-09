const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getTransactions, createTransaction, deleteTransaction } = require('../controllers/inventoryController');

router.route('/')
  .get(protect, getTransactions)
  .post(protect, admin, createTransaction);

router.route('/:id')
  .delete(protect, admin, deleteTransaction);

module.exports = router;
