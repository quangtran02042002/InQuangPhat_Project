const mongoose = require('mongoose');
const dotenv = require('dotenv');
// const users = require('./data/users'); // Chúng ta sẽ tạo user cứng ở đây
const products = require('./data/products');
const User = require('./models/User');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // 1. Xóa sạch dữ liệu cũ để tránh trùng lặp
    // await Order.deleteMany(); // Nếu chưa có Model Order thì comment dòng này lại
    await Product.deleteMany();
    await User.deleteMany();

    // 2. Tạo Admin User
    // Lưu ý: Password này sẽ được mã hóa nhờ middleware trong User.js
    const createdUsers = await User.create([
      {
        name: 'Admin Quang Phat',
        email: 'admin@quangphat.com',
        password: '123456', // Mật khẩu mặc định
        isAdmin: true,
      },
      {
        name: 'Khach Hang Mau',
        email: 'khach@example.com',
        password: '123456',
        isAdmin: false,
      }
    ]);

    const adminUser = createdUsers[0]._id;

    // 3. Gán Admin là người tạo sản phẩm (nếu cần) và Import Sản phẩm
    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUser }; 
    });

    await Product.insertMany(sampleProducts);

    console.log('--- Đã nhập dữ liệu mẫu thành công! ---');
    process.exit();
  } catch (error) {
    console.error(`Lỗi: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();
    console.log('--- Đã xóa sạch dữ liệu! ---');
    process.exit();
  } catch (error) {
    console.error(`Lỗi: ${error.message}`);
    process.exit(1);
  }
};

// Kiểm tra tham số dòng lệnh để quyết định nhập hay xóa
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}