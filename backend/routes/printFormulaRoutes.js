const express = require('express');
const router  = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getFormulas,
  getFormulaById,
  createFormula,
  updateFormula,
  deleteFormula,
  duplicateFormula,
} = require('../controllers/printFormulaController');

router.route('/')
  .get(protect, getFormulas)
  .post(protect, admin, createFormula);

router.route('/:id')
  .get(protect, getFormulaById)
  .put(protect, admin, updateFormula)
  .delete(protect, admin, deleteFormula);

router.put('/:id/duplicate', protect, admin, duplicateFormula);

module.exports = router;
