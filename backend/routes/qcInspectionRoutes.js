const express = require('express');
const router = express.Router();
const { protect, admin, authorize } = require('../middleware/authMiddleware');
const {
  getInspections,
  getInspectionById,
  createInspection,
  updateInspection,
  deleteInspection,
  verifyQCPin,
  setQCPin,
  getPinStatus,
} = require('../controllers/qcInspectionController');

// PIN management
router.route('/pin').put(protect, admin, setQCPin);
router.route('/pin-status').get(protect, getPinStatus);
router.route('/verify-pin').post(protect, verifyQCPin);

// CRUD
router
  .route('/')
  .get(protect, admin, getInspections)
  .post(protect, admin, createInspection);

router
  .route('/:id')
  .get(protect, admin, getInspectionById)
  .put(protect, admin, updateInspection)
  .delete(protect, admin, deleteInspection);

module.exports = router;
