const express = require('express');
const router = express.Router();
const {
  createAdminQuote,
  getAdminQuotes,
  getAdminQuoteById,
  deleteAdminQuote,
} = require('../controllers/adminQuoteController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, admin, createAdminQuote)
  .get(protect, admin, getAdminQuotes);

router.route('/:id')
  .get(protect, admin, getAdminQuoteById)
  .delete(protect, admin, deleteAdminQuote);

module.exports = router;
