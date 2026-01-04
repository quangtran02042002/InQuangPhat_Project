const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
// --- THÊM DÒNG NÀY (1) ---
const productRoutes = require('./routes/productRoutes'); 
// -------------------------

// 1. Cấu hình
dotenv.config(); 
const app = express(); 

// 2. Kết nối Database
connectDB();

// 3. Middleware
app.use(cors()); 
app.use(express.json()); 

// --- THÊM DÒNG NÀY (2) ---
// Dòng này có nghĩa là: Bất cứ ai vào đường dẫn /api/products thì sẽ chuyển cho productRoutes xử lý
app.use('/api/products', productRoutes);
// -------------------------

// 4. Route kiểm tra
app.get('/', (req, res) => {
  res.send('API In Quang Phát đang chạy...');
});

// 5. Lắng nghe port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});