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
      role: user.role,
      token: generateToken(user._id), // Trả về "thẻ từ"
    });
  } else {
    res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  }
};
// @desc    Lấy tất cả user
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}); // Lấy hết sạch user
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách user' });
  }
};

// @desc    Xóa user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // BẢO VỆ: Không cho phép tự xóa chính mình (Admin đang đăng nhập)
      if (user._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('Bạn không thể tự xóa tài khoản Admin của chính mình!');
      }

      await user.deleteOne();
      res.json({ message: 'Đã xóa user thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy user' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Lỗi server khi xóa user' });
  }
};
// @desc    Lấy thông tin profile người dùng đang đăng nhập
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Cập nhật thông tin profile (Tên, Mật khẩu)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Cập nhật tên hoặc giữ nguyên nếu không gửi lên
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Chỉ cập nhật mật khẩu nếu người dùng có nhập mật khẩu mới
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    // Trả về token mới (để frontend cập nhật lại ngay lập tức)
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};
// @desc    Đăng ký tài khoản mới
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Kiểm tra xem email đã tồn tại chưa
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('Email này đã được đăng ký');
  }

  // 2. Tạo user mới
  const user = await User.create({
    name,
    email,
    password, // Password sẽ tự động được mã hóa nhờ middleware trong Model
  });

  // 3. Nếu tạo thành công, trả về thông tin + Token luôn (để tự đăng nhập)
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Thông tin người dùng không hợp lệ');
  }
};
module.exports = {
  authUser,
  getUsers,     // <--- THÊM
  deleteUser,   // <--- THÊM
  getUserProfile,    // <--- THÊM
  updateUserProfile, 
  registerUser,// <--- THÊM
};