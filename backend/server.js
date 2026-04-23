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
const materialRoutes = require('./routes/materialRoutes');
const financeUploadRoutes = require('./routes/financeUploadRoutes');

// --- SỬA DÒNG NÀY (Đổi import thành require) ---
const customerRoutes = require('./routes/customerRoutes');
// -----------------------------------------------
const notificationRoutes = require('./routes/notificationRoutes');
const chemicalRoutes = require('./routes/chemicalRoutes');
const paperPriceRoutes = require('./routes/paperPriceRoutes')
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


dotenv.config();
const app = express();
connectDB();

app.use(cors());
app.use(express.json());

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
// Route Customer
app.use('/api/customers', customerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chemicals', chemicalRoutes);
app.use('/api/paper-prices', paperPriceRoutes); // API Bảng giá chính
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


app.get('/', (req, res) => {
  res.send('API In Quang Phát đang chạy...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
