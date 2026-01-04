const express = require('express');
const router = express.Router();
const { createQuote, getQuotes } = require('../controllers/quoteController');
const { protect, admin } = require('../middleware/authMiddleware'); // <--- Import lính gác

router.route('/')
  .post(createQuote) // Khách gửi thì ai cũng gửi được (Public)
  .get(protect, admin, getQuotes); // Xem danh sách thì phải có Token + là Admin

module.exports = router;