const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Thư viện mã hóa mật khẩu

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false }, // false là user thường, true là Admin
  phone: { type: String },
}, {
  timestamps: true // Tự động tạo createdAt, updatedAt
});

// Trước khi lưu User vào DB, hãy mã hóa mật khẩu
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  // Tạo muối (salt) để mã hóa
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Hàm kiểm tra mật khẩu khi đăng nhập
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;