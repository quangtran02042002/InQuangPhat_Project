const Product = require('../models/Product');
const Quote = require('../models/Quote');
const User = require('../models/User');

// @desc    Lấy số liệu thống kê cho Dashboard
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // 1. Đếm tổng số lượng (Chạy song song cho nhanh)
    const [productCount, userCount, quoteCount] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Quote.countDocuments(),
    ]);

    // 2. Thống kê trạng thái báo giá để vẽ biểu đồ
    // Đếm xem có bao nhiêu cái Mới, bao nhiêu cái Đang xử lý...
    const statusStats = await Quote.aggregate([
      {
        $group: {
          _id: '$status', // Nhóm theo trạng thái
          count: { $sum: 1 }, // Đếm số lượng
        },
      },
    ]);

    // Chuẩn hóa dữ liệu cho Frontend dễ dùng (Recharts cần format này)
    // Kết quả mong muốn: [{ name: 'Mới', value: 5 }, { name: 'Hoàn thành', value: 10 }]
    const chartData = statusStats.map((item) => {
        let name = item._id;
        if(name === 'New') name = 'Mới';
        if(name === 'Contacted') name = 'Đang xử lý';
        if(name === 'Done') name = 'Hoàn thành';
        return { name, value: item.count };
    });

    res.json({
      productCount,
      userCount,
      quoteCount,
      chartData,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy thống kê' });
  }
};

module.exports = { getDashboardStats };