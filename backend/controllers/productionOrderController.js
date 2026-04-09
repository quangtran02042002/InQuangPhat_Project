const asyncHandler = require('../middleware/asyncHandler');
const ProductionOrder = require('../models/ProductionOrder');
const createNotification = require('../utils/createNotification');
const sendTelegram = require('../utils/sendTelegram');


// @desc    Lấy tất cả lệnh sản xuất
// @route   GET /api/production-orders
// @access  Private/Admin
const getProductionOrders = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 50;
  const page = Number(req.query.pagenumber) || 1;
  const keyword = req.query.keyword
    ? {
        $or: [
          { orderName: { $regex: req.query.keyword, $options: 'i' } },
          { orderCode: { $regex: req.query.keyword, $options: 'i' } },
          { 'printJobs.jobName': { $regex: req.query.keyword, $options: 'i' } }
        ],
      }
    : {};
    
  const printTypeFilter = req.query.printType && req.query.printType !== 'all' ? { printType: req.query.printType } : {};
  const statusFilter = req.query.status && req.query.status !== 'all' ? { status: req.query.status } : {};

  const query = { ...keyword, ...printTypeFilter, ...statusFilter };
  const count = await ProductionOrder.countDocuments(query);

  const orders = await ProductionOrder.find(query)
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .populate('createdBy', 'name');

  res.json({ orders, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Lấy chi tiết 1 lệnh sản xuất
// @route   GET /api/production-orders/:id
// @access  Private/Admin
const getProductionOrderById = asyncHandler(async (req, res) => {
  const order = await ProductionOrder.findById(req.params.id).populate('createdBy', 'name');
  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy Lệnh sản xuất');
  }
});

// @desc    Tạo lệnh sản xuất
// @route   POST /api/production-orders
// @access  Private/Admin
const createProductionOrder = asyncHandler(async (req, res) => {
  const order = new ProductionOrder({ ...req.body, createdBy: req.user?._id });
  // if req.user is undefined in tests, it will just insert without it because createdBy required: false
  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

// @desc    Cập nhật toàn bộ lệnh sản xuất
// @route   PUT /api/production-orders/:id
// @access  Private/Admin
const updateProductionOrder = asyncHandler(async (req, res) => {
  const order = await ProductionOrder.findById(req.params.id);

  if (order) {
    const oldStatus = order.status;
    order.orderName = req.body.orderName || order.orderName;
    order.printType = req.body.printType || order.printType;
    order.totalQuantity = req.body.totalQuantity !== undefined ? req.body.totalQuantity : order.totalQuantity;
    order.printJobs = req.body.printJobs || order.printJobs;
    order.status = req.body.status || order.status;
    order.notes = req.body.notes !== undefined ? req.body.notes : order.notes;
    
    // We intentionally don't update progress flags here to prevent accidental overwrites,
    // or we can allow them to be updated if passed. Let's allow if passed.
    if (req.body.isPaperOrdered !== undefined) order.isPaperOrdered = req.body.isPaperOrdered;
    if (req.body.isPlateOutput !== undefined) order.isPlateOutput = req.body.isPlateOutput;
    if (req.body.isMoldOutput !== undefined) order.isMoldOutput = req.body.isMoldOutput;
    if (req.body.isOffsetLamination !== undefined) order.isOffsetLamination = req.body.isOffsetLamination;
    if (req.body.isTicketPrinted !== undefined) order.isTicketPrinted = req.body.isTicketPrinted;

    // Silk flags
    if (req.body.isSilkInkColor !== undefined) order.isSilkInkColor = req.body.isSilkInkColor;
    if (req.body.isSilkFilm !== undefined) order.isSilkFilm = req.body.isSilkFilm;
    if (req.body.isSilkFrame !== undefined) order.isSilkFrame = req.body.isSilkFrame;
    if (req.body.isSilkPattern !== undefined) order.isSilkPattern = req.body.isSilkPattern;
    if (req.body.isSilkFabric !== undefined) order.isSilkFabric = req.body.isSilkFabric;

    const updatedOrder = await order.save();

    // --- CẢNH BÁO HỦY ĐƠN HÀNG KHẨN CẤP ---
    if (req.body.status === 'cancelled' && oldStatus !== 'cancelled') {
      try {
        const title = '⛔ LỆNH ĐÌNH CHỈ SẢN XUẤT';
        const msg = `Dừng ngay máy lệnh ${order.orderCode} - ${order.orderName}`;
        
        await createNotification({
          title,
          message: msg,
          type: 'order',
          link: `/admin/production-orders`
        });

        const escapeTG = (str) => String(str).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
        await sendTelegram(`⛔ *LỆNH ĐÌNH CHỈ KHẨN CẤP* ⛔\n\nYêu cầu xưởng dừng ngay lập tức đơn hàng:\n📦 *Mã lệnh:* \`${escapeTG(order.orderCode)}\`\n📋 *Tên:* ${escapeTG(order.orderName)}\n❗ *Lý do:* Khách yêu cầu dừng / Hủy đơn.`);
      } catch (err) { console.error(err); }
    }
    // ----------------------------------------

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy Lệnh sản xuất');
  }
});

// @desc    Cập nhật cờ tiến độ (Progress flag) nhanh
// @route   PATCH /api/production-orders/:id/progress
// @access  Private/Admin
const updateProductionOrderProgress = asyncHandler(async (req, res) => {
  const { flag, value } = req.body;
  
  const validFlags = [
    'isPaperOrdered', 'isPlateOutput', 'isMoldOutput', 'isOffsetLamination', 'isTicketPrinted',
    'isSilkInkColor', 'isSilkFilm', 'isSilkFrame', 'isSilkPattern', 'isSilkFabric'
  ];

  if (!validFlags.includes(flag)) {
    res.status(400);
    throw new Error('Cờ tiến độ không hợp lệ');
  }

  const order = await ProductionOrder.findById(req.params.id);
  if (order) {
    const oldVal = order[flag];
    order[flag] = value;
    const updatedOrder = await order.save();

    // --- THÔNG BÁO CHUYỂN GIAO CÔNG ĐOẠN ---
    if (value === true && oldVal !== true) {
      try {
        const flagNames = {
          'isPaperOrdered': 'Giấy đã về', 'isPlateOutput': 'Đã xuất kẽm', 'isMoldOutput': 'Đã xuất khuôn', 
          'isOffsetLamination': 'Đã cán màng', 'isTicketPrinted': 'Đã in xong (chuẩn bị gia công)',
          'isSilkInkColor': 'Pha mực xong', 'isSilkFilm': 'Xuất film lụa xong', 'isSilkFrame': 'Chụp bản xong', 
          'isSilkPattern': 'Phơi bản xong', 'isSilkFabric': 'Cắt vải/Sẵn sàng in'
        };
        const stName = flagNames[flag] || flag;
        
        await createNotification({
          title: '🔄 Cập nhật Tiến độ',
          message: `Lệnh ${order.orderCode} vừa hoàn thành: ${stName}`,
          type: 'process',
          link: `/admin/production-orders`
        });
      } catch (err) { console.error(err); }
    }
    // ----------------------------------------

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy Lệnh sản xuất');
  }
});

// @desc    Xóa lệnh sản xuất
// @route   DELETE /api/production-orders/:id
// @access  Private/Admin
const deleteProductionOrder = asyncHandler(async (req, res) => {
  const order = await ProductionOrder.findById(req.params.id);

  if (order) {
    await ProductionOrder.deleteOne({ _id: order._id });
    res.json({ message: 'Đã xóa Lệnh sản xuất' });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy Lệnh sản xuất');
  }
});

module.exports = {
  getProductionOrders,
  getProductionOrderById,
  createProductionOrder,
  updateProductionOrder,
  updateProductionOrderProgress,
  deleteProductionOrder,
};
