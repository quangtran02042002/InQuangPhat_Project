const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // Tạo ra một chuỗi mã hóa chứa ID của người dùng
  // Mã này sẽ hết hạn sau 30 ngày
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;