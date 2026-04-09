const InventoryTransaction = require('../models/InventoryTransaction');
const createNotification = require('../utils/createNotification');

// @desc    Lấy danh sách giao dịch
// @route   GET /api/inventory
const getTransactions = async (req, res) => {
  try {
    const transactions = await InventoryTransaction.find({}).sort({ date: -1, createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi tải dữ liệu' });
  }
};

// @desc    Tạo giao dịch nhập/xuất (nhiều mặt hàng)
// @route   POST /api/inventory
const createTransaction = async (req, res) => {
  const { type, factoryName, orderCustomer, deliveryAddress, reason, items, date } = req.body;

  if (!factoryName || !items || items.length === 0) {
    return res.status(400).json({ message: 'Cần nhập Tên nhà may/kho và ít nhất 1 mặt hàng.' });
  }

  // Validate từng dòng hàng
  for (const item of items) {
    if (!item.itemCode || !item.itemName || !item.color || !(item.quantity > 0)) {
      return res.status(400).json({ message: `Dòng hàng "${item.itemCode || '?'}" - ${item.itemName || '?'} thiếu thông tin hoặc số lượng không hợp lệ.` });
    }
  }

  try {
    // Kiểm tra tồn kho cho từng mặt hàng khi XUẤT
    if (type === 'export') {
      for (const item of items) {
        // Lấy tất cả giao dịch của mã + màu này
        const allTrans = await InventoryTransaction.find({
          'items.itemCode': item.itemCode,
          'items.color': item.color,
        });

        let stock = 0;
        allTrans.forEach(tx => {
          tx.items.forEach(txItem => {
            if (txItem.itemCode === item.itemCode && txItem.color === item.color) {
              if (tx.type === 'import') stock += txItem.quantity;
              if (tx.type === 'export') stock -= txItem.quantity;
            }
          });
        });

        if (item.quantity > stock) {
          return res.status(400).json({
            message: `Mã "${item.itemCode}" màu "${item.color}": Không đủ tồn kho. Hiện còn: ${stock} ${item.unit || 'cái'}.`,
          });
        }
      }
    }

    const transaction = await InventoryTransaction.create({
      type,
      factoryName,
      orderCustomer: orderCustomer || '',
      deliveryAddress: deliveryAddress || '',
      reason: reason || '',
      items,
      date: date ? new Date(date) : new Date(),
    });

    // --- NOTIFICATION VẬT TƯ NHẬP KHO ---
    if (type === 'import') {
      try {
        await createNotification({
          title: '📦 Vật tư đã về xưởng',
          message: `Nhập ${items.length} kiện hàng từ ${factoryName}`,
          type: 'stock',
          link: '/admin/inventory'
        });
      } catch (err) { console.error('[Noti Inventory] Lỗi:', err); }
    }
    // ------------------------------------

    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi tạo giao dịch: ' + error.message });
  }
};

// @desc    Xóa giao dịch
// @route   DELETE /api/inventory/:id
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await InventoryTransaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
    }
    res.json({ message: 'Đã xóa giao dịch' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa giao dịch' });
  }
};

module.exports = { getTransactions, createTransaction, deleteTransaction };
