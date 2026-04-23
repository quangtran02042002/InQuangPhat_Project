const express = require('express');
const router = express.Router();
const {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
} = require('../controllers/quotationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, admin, createQuotation)
  .get(protect, admin, getQuotations);

router.route('/:id')
  .get(protect, admin, getQuotationById)
  .put(protect, admin, updateQuotation)
  .delete(protect, admin, deleteQuotation);

module.exports = router;
