const express = require('express');
const router  = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getFormulas,
  getFormulaById,
  createFormula,
  updateFormula,
  deleteFormula,
  createNextVersion,
  approveFormula,
  getVersionHistory,
} = require('../controllers/printFormulaController');

router.route('/')
  .get(protect, getFormulas)
  .post(protect, admin, createFormula);

// Lịch sử phiên bản của 1 nhóm mẫu
router.get('/group/:sampleGroup', protect, getVersionHistory);

router.route('/:id')
  .get(protect, getFormulaById)
  .put(protect, admin, updateFormula)
  .delete(protect, admin, deleteFormula);

// Tạo phiên bản tiếp theo (v2, v3, v4...)
router.post('/:id/next-version', protect, admin, createNextVersion);

// Chốt mẫu (approve)
router.post('/:id/approve', protect, admin, approveFormula);

module.exports = router;
