const express = require('express');
const router = express.Router();
const { createQuote, getQuotes, updateQuoteStatus } = require('../controllers/quoteController');
const { protect, admin } = require('../middleware/authMiddleware'); // <--- Import lính gác

router.route('/')
  .post(createQuote) // Khách gửi thì ai cũng gửi được (Public)
  .get(protect, admin, getQuotes); // Xem danh sách thì phải có Token + là Admin
router.route('/:id/status').put(protect, admin, updateQuoteStatus);
module.exports = router;