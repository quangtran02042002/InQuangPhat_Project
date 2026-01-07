// 1. Dùng import thay vì require (Nhớ thêm đuôi .js)
import Product from '../models/Product.js';
import Quote from '../models/Quote.js'; // Hoặc Order.js nếu bạn dùng Order
import User from '../models/User.js';

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
    const statusStats = await Quote.aggregate([
      {
        $group: {
          _id: '$status', 
          count: { $sum: 1 }, 
        },
      },
    ]);

    // Chuẩn hóa dữ liệu cho Frontend
    const chartData = statusStats.map((item) => {
        let name = item._id;
        // Đảm bảo tên khớp với dữ liệu trong DB của bạn
        if(name === 'New' || name === 'Mới') name = 'Mới';
        if(name === 'Contacted' || name === 'Đang xử lý') name = 'Đang xử lý';
        if(name === 'Done' || name === 'Hoàn thành') name = 'Hoàn thành';
        // Fallback nếu không khớp case nào
        if (!name) name = 'Khác'; 
        
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
    res.status(500).json({ message: 'Lỗi server khi lấy thống kê: ' + error.message });
  }
};

// 2. Dùng export thay vì module.exports
export { getDashboardStats };