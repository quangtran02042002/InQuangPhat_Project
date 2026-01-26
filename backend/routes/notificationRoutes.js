const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Lấy danh sách thông báo (20 cái mới nhất)
// @route   GET /api/notifications
router.get('/', protect, admin, async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 }) // Mới nhất lên đầu
      .limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải thông báo' });
  }
});

// @desc    Đánh dấu tất cả là đã đọc
// @route   PUT /api/notifications/mark-read
router.put('/mark-read', protect, admin, async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ message: 'Đã đánh dấu đọc tất cả' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật' });
  }
});

module.exports = router;