const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Đăng nhập & Lấy Token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  // 1. Tìm user trong DB theo email
  const user = await User.findOne({ email });

  // 2. Nếu user tồn tại VÀ mật khẩu khớp (hàm matchPassword ta đã viết trong Model User)
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id), // Trả về "thẻ từ"
    });
  } else {
    res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  }
};

module.exports = { authUser };