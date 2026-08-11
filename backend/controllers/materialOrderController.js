const MaterialOrder = require('../models/MaterialOrder');
const Material = require('../models/Material');
const MaterialDispatch = require('../models/MaterialDispatch');
const createNotification = require('../utils/createNotification');

// Hàm sinh mã đơn PO-YYYYMMDD-XXX
const generateOrderCode = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `PO-${dateStr}-`;

  // Tìm đơn mới nhất hôm nay
  const lastOrder = await MaterialOrder.findOne({ orderCode: { $regex: `^${prefix}` } })
    .sort({ orderCode: -1 });

  let seq = 1;
  if (lastOrder) {
    const lastSeq = parseInt(lastOrder.orderCode.split('-').pop(), 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }
  return `${prefix}${String(seq).padStart(3, '0')}`;
};

// @desc    Lấy danh sách đơn đặt NVL
// @route   GET /api/material-orders
const getOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status === 'pending') {
      filter.isOrdered = false;
      filter.isDelivered = false;
    } else if (req.query.status === 'ordered') {
      filter.isOrdered = true;
      filter.isDelivered = false;
    } else if (req.query.status === 'delivered') {
      filter.isDelivered = true;
    }

    const orders = await MaterialOrder.find(filter)
      .sort({ createdAt: -1 })
      .populate('material', 'name unit quantity minStock');

    res.json(orders);
  } catch (error) {
    console.error('[getOrders]', error);
    res.status(500).json({ message: 'Lỗi tải danh sách đơn đặt hàng' });
  }
};

// @desc    Tạo đơn đặt hàng NVL
// @route   POST /api/material-orders
const createOrder = async (req, res) => {
  try {
    const {
      materialId, materialName, materialUnit, quantity,
      supplier, unitPrice, orderDate, expectedDate, note,
      createdBy, isNewMaterial
    } = req.body;

    if (!materialName || !materialUnit || !quantity) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ: tên vật tư, đơn vị, số lượng' });
    }

    let linkedMaterialId = materialId || null;

    // Nếu là vật tư mới chưa có trong kho → tạo mới Material
    if (isNewMaterial || !materialId) {
      // Kiểm tra xem đã tồn tại chưa (theo tên)
      const existing = await Material.findOne({
        name: { $regex: new RegExp(`^${materialName.trim()}$`, 'i') }
      });

      if (existing) {
        linkedMaterialId = existing._id;
      } else {
        // Tạo mới Material với số lượng = 0 (sẽ cộng khi hàng về)
        const newMaterial = await Material.create({
          name: materialName.trim(),
          unit: materialUnit,
          quantity: 0,
          minStock: 10,
          note: 'Tự động tạo từ đơn đặt hàng NVL',
        });
        linkedMaterialId = newMaterial._id;
      }
    }

    const orderCode = await generateOrderCode();
    const qty = Number(quantity);

    const order = await MaterialOrder.create({
      orderCode,
      material: linkedMaterialId,
      materialName: materialName.trim(),
      materialUnit,
      quantity: qty,
      supplier: supplier || '',
      unitPrice: Number(unitPrice) || 0,
      totalPrice: qty * (Number(unitPrice) || 0),
      orderDate: orderDate ? new Date(orderDate) : new Date(),
      expectedDate: expectedDate ? new Date(expectedDate) : null,
      note: note || '',
      createdBy: createdBy || 'Admin',
      isOrdered: false,
      isDelivered: false,
    });

    const populated = await MaterialOrder.findById(order._id)
      .populate('material', 'name unit quantity minStock');

    res.status(201).json(populated);
  } catch (error) {
    console.error('[createOrder]', error);
    res.status(500).json({ message: 'Lỗi tạo đơn đặt hàng: ' + error.message });
  }
};

// @desc    Cập nhật đơn đặt hàng
// @route   PUT /api/material-orders/:id
const updateOrder = async (req, res) => {
  try {
    const order = await MaterialOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt hàng' });
    }

    // Không cho sửa nếu đã delivered
    if (order.isDelivered) {
      return res.status(400).json({ message: 'Không thể sửa đơn đã nhận hàng. Vui lòng bỏ tick "Hàng đã về" trước.' });
    }

    const {
      materialName, materialUnit, quantity, supplier,
      unitPrice, orderDate, expectedDate, note, isOrdered
    } = req.body;

    if (materialName !== undefined) order.materialName = materialName.trim();
    if (materialUnit !== undefined) order.materialUnit = materialUnit;
    if (quantity !== undefined) {
      order.quantity = Number(quantity);
      order.totalPrice = order.quantity * (order.unitPrice || 0);
    }
    if (supplier !== undefined) order.supplier = supplier;
    if (unitPrice !== undefined) {
      order.unitPrice = Number(unitPrice);
      order.totalPrice = order.quantity * order.unitPrice;
    }
    if (orderDate !== undefined) order.orderDate = new Date(orderDate);
    if (expectedDate !== undefined) order.expectedDate = expectedDate ? new Date(expectedDate) : null;
    if (note !== undefined) order.note = note;
    if (isOrdered !== undefined) order.isOrdered = isOrdered;

    const updated = await order.save();
    const populated = await MaterialOrder.findById(updated._id)
      .populate('material', 'name unit quantity minStock');

    res.json(populated);
  } catch (error) {
    console.error('[updateOrder]', error);
    res.status(500).json({ message: 'Lỗi cập nhật đơn: ' + error.message });
  }
};

// @desc    Toggle trạng thái "Hàng đã về"
// @route   PUT /api/material-orders/:id/toggle-delivered
const toggleDelivered = async (req, res) => {
  try {
    const order = await MaterialOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt hàng' });
    }

    const newDelivered = !order.isDelivered;

    if (newDelivered) {
      // === ĐÁNH DẤU HÀNG ĐÃ VỀ ===

      // Đảm bảo material tồn tại
      let material = null;
      if (order.material) {
        material = await Material.findById(order.material);
      }

      // Nếu material chưa tồn tại (hoặc đã bị xóa) → tạo mới
      if (!material) {
        const existing = await Material.findOne({
          name: { $regex: new RegExp(`^${order.materialName.trim()}$`, 'i') }
        });

        if (existing) {
          material = existing;
          order.material = existing._id;
        } else {
          material = await Material.create({
            name: order.materialName.trim(),
            unit: order.materialUnit,
            quantity: 0,
            minStock: 10,
            note: `Tự động tạo khi nhận hàng đơn ${order.orderCode}`,
          });
          order.material = material._id;
        }
      }

      // Cộng số lượng vào kho
      material.quantity += order.quantity;
      await material.save();

      // Tạo phiếu nhập kho MaterialDispatch
      const dispatch = await MaterialDispatch.create({
        type: 'nhap',
        items: [{
          material: material._id,
          materialName: material.name,
          materialUnit: material.unit,
          quantity: order.quantity,
          quantityAfter: material.quantity,
        }],
        recipient: order.supplier || 'NCC',
        note: `Nhập kho từ đơn đặt hàng ${order.orderCode}`,
        createdBy: order.createdBy || 'Admin',
      });

      order.isDelivered = true;
      order.isOrdered = true; // Đảm bảo đã đặt
      order.deliveredDispatch = dispatch._id;

      // Gửi thông báo
      try {
        await createNotification({
          title: '📦 NVL đã nhận về kho',
          message: `Đơn ${order.orderCode}: ${order.quantity} ${order.materialUnit} "${order.materialName}" từ ${order.supplier || 'NCC'}`,
          type: 'stock',
          link: '/admin/material-orders',
        });
      } catch (e) { console.error('[Noti MaterialOrder]', e); }

    } else {
      // === BỎ TICK HÀNG ĐÃ VỀ → Trừ lại kho ===

      if (order.material) {
        const material = await Material.findById(order.material);
        if (material) {
          material.quantity = Math.max(0, material.quantity - order.quantity);
          await material.save();
        }
      }

      // Xóa phiếu dispatch tương ứng
      if (order.deliveredDispatch) {
        await MaterialDispatch.findByIdAndDelete(order.deliveredDispatch);
      }

      order.isDelivered = false;
      order.deliveredDispatch = null;
    }

    const updated = await order.save();
    const populated = await MaterialOrder.findById(updated._id)
      .populate('material', 'name unit quantity minStock');

    res.json({
      order: populated,
      message: newDelivered
        ? `✅ Đã nhận hàng & nhập kho ${order.quantity} ${order.materialUnit} "${order.materialName}"`
        : `↩️ Đã hoàn tác nhận hàng & trừ kho ${order.quantity} ${order.materialUnit}`,
    });
  } catch (error) {
    console.error('[toggleDelivered]', error);
    res.status(500).json({ message: 'Lỗi cập nhật trạng thái: ' + error.message });
  }
};

// @desc    Xóa đơn đặt hàng
// @route   DELETE /api/material-orders/:id
const deleteOrder = async (req, res) => {
  try {
    const order = await MaterialOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt hàng' });
    }

    // Nếu đã delivered → trừ kho trước khi xóa
    if (order.isDelivered && order.material) {
      const material = await Material.findById(order.material);
      if (material) {
        material.quantity = Math.max(0, material.quantity - order.quantity);
        await material.save();
      }
      // Xóa dispatch
      if (order.deliveredDispatch) {
        await MaterialDispatch.findByIdAndDelete(order.deliveredDispatch);
      }
    }

    await order.deleteOne();
    res.json({ message: 'Đã xóa đơn đặt hàng' });
  } catch (error) {
    console.error('[deleteOrder]', error);
    res.status(500).json({ message: 'Lỗi khi xóa đơn đặt hàng' });
  }
};

module.exports = { getOrders, createOrder, updateOrder, toggleDelivered, deleteOrder };
