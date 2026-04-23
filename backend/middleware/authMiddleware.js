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

// 2. Kiểm tra quyền Admin/Nhân viên (Vào khu vực Admin)
const admin = (req, res, next) => {
  if (req.user && (req.user.isAdmin || ['director', 'accountant', 'production'].includes(req.user.role))) {
    return next();
  } else {
    return res.status(401).json({ message: 'Chỉ nhân viên nội bộ mới có quyền truy cập' });
  }
};

// 3. Phân quyền chi tiết (RBAC) cho các chức năng cụ thể
const authorize = (...roles) => {
  return (req, res, next) => {
    // Nếu là admin thì luôn cho qua
    if (req.user && req.user.isAdmin) {
      return next();
    }
    // Nếu có role nằm trong danh sách cho phép
    if (req.user && roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ message: `Tài khoản của bạn (${req.user.role}) không có quyền thực hiện thao tác này` });
  };
};

module.exports = { protect, admin, authorize };