const express = require('express');
const router = express.Router();
const { protect, admin, authorize } = require('../middleware/authMiddleware');
const { getTransactions, createTransaction, deleteTransaction } = require('../controllers/inventoryController');

router.route('/')
  .get(protect, admin, authorize('director', 'production'), getTransactions)
  .post(protect, admin, authorize('director', 'production'), createTransaction);

router.route('/:id')
  .delete(protect, admin, authorize('director', 'production'), deleteTransaction);

module.exports = router;
