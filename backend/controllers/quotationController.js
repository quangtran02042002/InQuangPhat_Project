const Quotation = require('../models/Quotation');

// @desc    Tạo bảng báo giá mới
// @route   POST /api/quotations
// @access  Private/Admin
const createQuotation = async (req, res) => {
  try {
    const { customerName, quoteDate, items, grandTotal, status } = req.body;

    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({ message: 'Cần có tên khách hàng và ít nhất 1 danh mục' });
    }

    const quotation = new Quotation({
      customerName,
      quoteDate: quoteDate || Date.now(),
      items,
      grandTotal: grandTotal || items.reduce((sum, it) => sum + ((it.quantity || 0) * (it.unitPrice || 0)), 0),
      status: status || 'draft',
      createdBy: req.user._id,
    });

    const created = await quotation.save();
    const populated = await Quotation.findById(created._id).populate('createdBy', 'name');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Lỗi tạo báo giá:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo báo giá' });
  }
};

// @desc    Lấy danh sách tất cả báo giá
// @route   GET /api/quotations
// @access  Private/Admin
const getQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find({})
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách báo giá' });
  }
};

// @desc    Lấy chi tiết 1 báo giá
// @route   GET /api/quotations/:id
// @access  Private/Admin
const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate('createdBy', 'name');
    if (!quotation) {
      return res.status(404).json({ message: 'Không tìm thấy báo giá' });
    }
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Cập nhật báo giá (chỉnh sửa)
// @route   PUT /api/quotations/:id
// @access  Private/Admin
const updateQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ message: 'Không tìm thấy báo giá' });
    }

    const { customerName, quoteDate, items, grandTotal, status } = req.body;

    quotation.customerName = customerName || quotation.customerName;
    quotation.quoteDate = quoteDate || quotation.quoteDate;
    quotation.items = items || quotation.items;
    quotation.grandTotal = grandTotal ?? items?.reduce((sum, it) => sum + ((it.quantity || 0) * (it.unitPrice || 0)), 0) ?? quotation.grandTotal;
    quotation.status = status || quotation.status;

    const updated = await quotation.save();
    const populated = await Quotation.findById(updated._id).populate('createdBy', 'name');
    res.json(populated);
  } catch (error) {
    console.error('Lỗi cập nhật báo giá:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật' });
  }
};

// @desc    Xóa báo giá
// @route   DELETE /api/quotations/:id
// @access  Private/Admin
const deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ message: 'Không tìm thấy báo giá' });
    }
    await Quotation.deleteOne({ _id: req.params.id });
    res.json({ message: 'Đã xóa báo giá thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi xóa' });
  }
};

module.exports = {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
};
