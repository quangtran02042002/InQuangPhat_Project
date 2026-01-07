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
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/login', authUser);

// Route quản lý User (Chỉ Admin mới được vào)
router.route('/')
.post(registerUser)
  .get(protect, admin, getUsers);

router.route('/:id')
  .delete(protect, admin, deleteUser);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
module.exports = router;