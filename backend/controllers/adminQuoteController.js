const AdminQuote = require('../models/AdminQuote');

// @desc    Tạo báo giá nội bộ admin
// @route   POST /api/admin-quotes
// @access  Private/Admin
const createAdminQuote = async (req, res) => {
  try {
    const { customerName, items, grandTotal, notes } = req.body;

    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({ message: 'Cần có tên khách hàng và ít nhất 1 hạng mục' });
    }

    const quote = new AdminQuote({
      customerName,
      items,
      grandTotal,
      notes,
      createdBy: req.user._id,
    });

    const created = await quote.save();
    res.status(201).json(created);
  } catch (error) {
    console.error('Lỗi tạo báo giá:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo báo giá' });
  }
};

// @desc    Lấy danh sách báo giá
// @route   GET /api/admin-quotes
// @access  Private/Admin
const getAdminQuotes = async (req, res) => {
  try {
    const quotes = await AdminQuote.find({})
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách báo giá' });
  }
};

// @desc    Lấy chi tiết 1 báo giá
// @route   GET /api/admin-quotes/:id
// @access  Private/Admin
const getAdminQuoteById = async (req, res) => {
  try {
    const quote = await AdminQuote.findById(req.params.id).populate('createdBy', 'name');
    if (!quote) {
      return res.status(404).json({ message: 'Không tìm thấy báo giá' });
    }
    res.json(quote);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Xóa báo giá
// @route   DELETE /api/admin-quotes/:id
// @access  Private/Admin
const deleteAdminQuote = async (req, res) => {
  try {
    const quote = await AdminQuote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: 'Không tìm thấy báo giá' });
    }
    await AdminQuote.deleteOne({ _id: req.params.id });
    res.json({ message: 'Đã xóa báo giá' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi xóa' });
  }
};

module.exports = {
  createAdminQuote,
  getAdminQuotes,
  getAdminQuoteById,
  deleteAdminQuote,
};
