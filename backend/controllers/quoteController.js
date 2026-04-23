const Quote = require('../models/Quote');
const createNotification = require('../utils/createNotification');
const sendEmail = require('../utils/sendEmail'); // <--- 1. NHỚ IMPORT

const createQuote = async (req, res) => {
  const { name, phone, email, productName, quantity, note } = req.body;

  if (!name || !phone) {
    res.status(400);
    throw new Error('Vui lòng nhập Tên và Số điện thoại');
  }

  const finalProductName = productName || 'Khách liên hệ chung';
  const finalQuantity = quantity || 0;

  const quote = new Quote({
    name,
    phone,
    email: email || '',
    productName: finalProductName,
    quantity: finalQuantity,
    note,
    status: 'New'
  });

  const createdQuote = await quote.save();

  // --- 2. TẠO THÔNG BÁO (NOTIFICATION) ---
  try {
    await createNotification({
        title: '💰 Yêu cầu Báo giá Mới',
        message: `${name} - ${finalProductName}`, 
        type: 'quote',
        link: '/admin/quotes'
    });
  } catch (error) { console.log('Lỗi tạo notif:', error); }

  // --- 3. GỬI EMAIL (PHẦN QUAN TRỌNG) ---
  try {
    const message = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #1e40af;">🚀 Có Yêu cầu Báo giá Mới!</h2>
        <p>Hệ thống vừa nhận được thông tin từ khách hàng:</p>
        <hr />
        <p><strong>👤 Khách hàng:</strong> ${name}</p>
        <p><strong>📞 SĐT:</strong> <a href="tel:${phone}" style="color: red; font-weight: bold;">${phone}</a></p>
        <p><strong>📦 Sản phẩm:</strong> ${finalProductName}</p>
        <p><strong>🔢 Số lượng:</strong> ${finalQuantity}</p>
        <p><strong>📝 Ghi chú:</strong> ${note || 'Không có'}</p>
        <hr />
        <p style="font-size: 12px; color: #666;">Đây là email tự động từ hệ thống quản trị In Quang Phát.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/quotes" style="background-color: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Xử lý ngay</a>
      </div>
    `;

    await sendEmail({
      email: process.env.ADMIN_EMAIL, // Gửi về cho Admin
      subject: `[BÁO GIÁ MỚI] ${name} - ${finalProductName}`,
      message,
    });
    console.log('✅ [EMAIL] Đã gửi email báo giá thành công');
  } catch (error) {
    console.log('❌ [EMAIL ERROR] Không gửi được mail:', error.message);
    // Không throw error để app không bị crash
  }
  // --------------------------------------

  res.status(201).json(createdQuote);
};
const getQuotes = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const [quotes, total] = await Promise.all([
      Quote.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Quote.countDocuments()
    ]);
    res.json({ quotes, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách' });
  }
};

// @desc    Cập nhật trạng thái báo giá
// @route   PUT /api/quotes/:id/status
// @access  Private/Admin
const updateQuoteStatus = async (req, res) => {
  const { status } = req.body; 

  try {
    const quote = await Quote.findById(req.params.id);

    if (quote) {
      quote.status = status;
      const updatedQuote = await quote.save();
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