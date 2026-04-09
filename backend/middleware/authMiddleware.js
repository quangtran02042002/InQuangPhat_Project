const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. Kiểm tra đăng nhập (Có Token không?)
const protect = async (req, res, next) => {
  let token;

  // Token thường được gửi dạng: "Bearer eyJhbGciOi..."
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; // Lấy chuỗi mã sau chữ Bearer
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Giải mã

      // Tìm user trong DB và gán vào biến req.user (để các hàm sau dùng)
      req.user = await User.findById(decoded.id).select('-password');
      return next(); 
    } catch (error) {
      return res.status(401).json({ message: 'Token không hợp lệ, vui lòng đăng nhập lại' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Không có quyền truy cập, thiếu Token' });
  }
};

// 2. Kiểm tra quyền Admin (Có phải sếp không?)
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  } else {
    return res.status(401).json({ message: 'Chỉ Admin mới có quyền này' });
  }
};

module.exports = { protect, admin };