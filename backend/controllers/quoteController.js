const Quote = require('../models/Quote');

// @desc    Tạo yêu cầu báo giá mới
// @route   POST /api/quotes
// @access  Public
const createQuote = async (req, res) => {
  const { name, phone, email, productName, quantity, message } = req.body;

  if (!name || !phone) {
    res.status(400);
    throw new Error('Vui lòng điền tên và số điện thoại');
  }

  try {
    const quote = await Quote.create({
      name,
      phone,
      email,
      productName,
      quantity,
      message,
    });

    res.status(201).json(quote);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi tạo báo giá' });
  }
};
const getQuotes = async (req, res) => {
  try {
    // Lấy tất cả và sắp xếp cái mới nhất lên đầu (sort -1)
    const quotes = await Quote.find({}).sort({ createdAt: -1 });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách' });
  }
};
// @desc    Cập nhật trạng thái báo giá
// @route   PUT /api/quotes/:id/status
// @access  Private/Admin
const updateQuoteStatus = async (req, res) => {
  const { status } = req.body; // Lấy trạng thái mới từ Frontend gửi lên

  try {
    const quote = await Quote.findById(req.params.id);

    if (quote) {
      quote.status = status; // Cập nhật trạng thái
      const updatedQuote = await quote.save(); // Lưu vào DB
      res.json(updatedQuote);
    } else {
      res.status(404).json({ message: 'Không tìm thấy yêu cầu báo giá này' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái' });
  }
};
module.exports = { 
    createQuote, 
    getQuotes,
    updateQuoteStatus, 
};