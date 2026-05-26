const express = require('express');
const router = express.Router();
const { createQuote, getQuotes, updateQuoteStatus, deleteQuote } = require('../controllers/quoteController');
const { protect, admin, authorize } = require('../middleware/authMiddleware'); // <--- Import lính gác

router.route('/')
  .post(createQuote) // Khách gửi thì ai cũng gửi được (Public)
  .get(protect, admin, authorize('director', 'accountant'), getQuotes); // Xem danh sách thì phải có Token + là Admin
router.route('/:id/status').put(protect, admin, authorize('director', 'accountant'), updateQuoteStatus);
router.route('/:id').delete(protect, admin, authorize('director', 'accountant'), deleteQuote);
module.exports = router;