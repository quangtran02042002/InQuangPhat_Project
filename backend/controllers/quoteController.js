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

module.exports = { 
    createQuote, 
    getQuotes  // <--- Bạn kiểm tra xem dòng này đã có chưa?
};