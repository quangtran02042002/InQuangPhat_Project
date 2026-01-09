const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// --- THÊM DÒNG NÀY (1) ---
const productRoutes = require('./routes/productRoutes'); 
const quoteRoutes = require('./routes/quoteRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const newsRoutes = require('./routes/newsRoutes');
const machineRoutes = require('./routes/machineRoutes');
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
// Quote 
app.use('/api/quotes', quoteRoutes);
//User 
app.use('/api/users', userRoutes);
// upload anh
app.use('/api/upload', uploadRoutes);
// dashboard
app.use('/api/dashboard', dashboardRoutes);
// news
app.use('/api/news', newsRoutes);
// -------------------------
app.use('/api/v1', machineRoutes);
//
// 4. Route kiểm tra
app.get('/', (req, res) => {
  res.send('API In Quang Phát đang chạy...');
});

// 5. Lắng nghe port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});