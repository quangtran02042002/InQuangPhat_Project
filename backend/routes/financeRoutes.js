const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Lấy danh sách
router.get('/', async (req, res) => {
  const transactions = await Transaction.find({}).sort({ date: -1 });
  res.json(transactions);
});

// Thêm giao dịch
router.post('/', async (req, res) => {
  const { type, amount, category, description, date } = req.body;
  const transaction = new Transaction({ type, amount, category, description, date });
  const created = await transaction.save();
  res.status(201).json(created);
});

// Xóa
router.delete('/:id', async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;