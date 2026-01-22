const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

const productRoutes = require('./routes/productRoutes'); 
const quoteRoutes = require('./routes/quoteRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const newsRoutes = require('./routes/newsRoutes');
const machineRoutes = require('./routes/machineRoutes');
const supplierRoutes = require('./routes/supplierRoutes');

// --- SỬA DÒNG NÀY (Đổi import thành require) ---
const customerRoutes = require('./routes/customerRoutes'); 
// -----------------------------------------------

dotenv.config(); 
const app = express(); 
connectDB();

app.use(cors()); 
app.use(express.json()); 

app.use('/api/products', productRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/v1', machineRoutes);
app.use('/api/v1/suppliers', supplierRoutes);

// Route Customer
app.use('/api/customers', customerRoutes);

app.get('/', (req, res) => {
  res.send('API In Quang Phát đang chạy...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});