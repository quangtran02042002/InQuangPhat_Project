const express = require('express');
const router = express.Router();
const { 
  authUser, 
  getUsers, 
  deleteUser, 
  getUserProfile,     // <--- THÊM
  updateUserProfile,
  registerUser,   // <--- THÊM
} = require('../controllers/userController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

router.post('/login', authUser);

// Route quản lý User (Chỉ Admin mới được vào)
router.route('/')
.post(registerUser)
  .get(protect, admin, authorize('director'), getUsers);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/:id')
  .delete(protect, admin, authorize('director'), deleteUser);

module.exports = router;