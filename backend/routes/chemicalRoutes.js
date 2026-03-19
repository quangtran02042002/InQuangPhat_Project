const express = require('express');
const router = express.Router();
const { getChemicals, createChemical, updateChemical, deleteChemical } = require('../controllers/chemicalController');
// const { protect, admin } = require('../middleware/authMiddleware'); // Thêm bảo mật nếu cần

router.route('/').get(getChemicals).post(createChemical);
router.route('/:id').put(updateChemical).delete(deleteChemical);

module.exports = router;