const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const productRoutes = require('./routes/productRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const newsRoutes = require('./routes/newsRoutes');
const machineRoutes = require('./routes/machineRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const materialRoutes = require('./routes/materialRoutes');
const financeUploadRoutes = require('./routes/financeUploadRoutes');

const customerRoutes = require('./routes/customerRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chemicalRoutes = require('./routes/chemicalRoutes');
const paperPriceRoutes = require('./routes/paperPriceRoutes');
const configRoutes = require('./routes/configRoutes');
const inkPriceRoutes = require('./routes/inkPriceRoutes');
const materialPriceRoutes = require('./routes/materialPriceRoutes');

const printFormulaRoutes = require('./routes/printFormulaRoutes');
const productionOrderRoutes = require('./routes/productionOrderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const adminQuoteRoutes = require('./routes/adminQuoteRoutes');
const finishingPriceRoutes = require('./routes/finishingPriceRoutes');
const financeRoutes = require('./routes/financeRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const todoRoutes = require('./routes/todoRoutes');
const materialOrderRoutes = require('./routes/materialOrderRoutes');

dotenv.config();
const app = express();
connectDB();

// ============================================================
// BẢO MẬT — Security Middleware
// ============================================================

// 1. Helmet: Thêm các HTTP security headers (XSS, Clickjacking, MIME sniffing...)
app.use(helmet());

// 2. CORS: Chỉ cho phép domain frontend truy cập API
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Cho phép requests không có origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Không được phép truy cập từ domain này (CORS)'));
  },
  credentials: true
}));

// 3. Rate Limiting: Giới hạn số request để chống brute-force & DDoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 200, // Tối đa 200 requests / 15 phút / IP
  message: { message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Rate limit chặt hơn cho login (chống brute-force mật khẩu)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Chỉ cho 10 lần đăng nhập sai / 15 phút
  message: { message: 'Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 15 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/users/login', loginLimiter);

// 4. Body parser với giới hạn kích thước
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// ROUTES — API Endpoints
// ============================================================

app.use('/api/products', productRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/upload/finance', financeUploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/v1', machineRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chemicals', chemicalRoutes);
app.use('/api/paper-prices', paperPriceRoutes);
app.use('/api/config', configRoutes);
app.use('/api/ink-prices', inkPriceRoutes);
app.use('/api/material-prices', materialPriceRoutes);

app.use('/api/print-formulas', printFormulaRoutes);
app.use('/api/production-orders', productionOrderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/admin-quotes', adminQuoteRoutes);
app.use('/api/finishing-prices', finishingPriceRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/material-orders', materialOrderRoutes);

// Health check endpoint (để hosting platform kiểm tra server còn sống)
app.get('/', (req, res) => {
  res.send('API In Quang Phát đang chạy...');
});

// ============================================================
// ERROR HANDLING — Xử lý lỗi toàn cục
// ============================================================

// 1. Bắt route không tồn tại (404)
app.use((req, res, next) => {
  res.status(404).json({ message: `Không tìm thấy: ${req.originalUrl}` });
});

// 2. Xử lý lỗi toàn cục (ẩn stack trace khi production)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// ============================================================
// START SERVER
// ============================================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT} (${process.env.NODE_ENV || 'development'})`);
});
