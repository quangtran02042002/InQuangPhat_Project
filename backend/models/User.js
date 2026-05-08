const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    role: {
      type: String,
      enum: ['director', 'accountant', 'production', 'user'],
      default: 'user',
    },
    phone: { type: String },
  },
  {
    timestamps: true,
  }
);


// --- PHẦN SỬA LỖI Ở ĐÂY ---
// Trước khi lưu User vào DB, hãy mã hóa mật khẩu
// LƯU Ý: Không dùng tham số 'next' khi dùng async function
userSchema.pre('save', async function () {
  // Nếu mật khẩu không bị thay đổi (ví dụ chỉ đổi tên), thì bỏ qua việc mã hóa lại
  if (!this.isModified('password')) {
    return;
  }

  // Tạo muối (salt) để mã hóa
  const salt = await bcrypt.genSalt(10);
  // Mã hóa mật khẩu
  this.password = await bcrypt.hash(this.password, salt);
});

// Phương thức kiểm tra mật khẩu khi đăng nhập
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;