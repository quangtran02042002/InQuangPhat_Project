const axios = require('axios');
const Material = require('../models/Material');
const Chemical = require('../models/Chemical');
const MaterialDispatch = require('../models/MaterialDispatch');
const MaterialOrder = require('../models/MaterialOrder');
const ProductionOrder = require('../models/ProductionOrder');
const FinanceAccount = require('../models/FinanceAccount');
const Receivable = require('../models/Receivable');
const Payable = require('../models/Payable');
const Todo = require('../models/Todo');
const QCInspection = require('../models/QCInspection');
const Quote = require('../models/Quote');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');

// ============================================================================
// HELPER: LẤY TOÀN BỘ NGỮ CẢNH DỮ LIỆU THỰC TẾ TỪ DATABASE (LIVE CONTEXT)
// ============================================================================
const getLiveDatabaseContext = async () => {
  try {
    const [
      materials,
      chemicals,
      recentProductionOrders,
      financeAccounts,
      pendingReceivables,
      pendingPayables,
      pendingTodos,
      pendingMaterialOrders,
      recentQCs,
    ] = await Promise.all([
      Material.find({}).lean().catch(() => []),
      Chemical.find({}).lean().catch(() => []),
      ProductionOrder.find({}).sort({ createdAt: -1 }).limit(10).lean().catch(() => []),
      FinanceAccount.find({}).lean().catch(() => []),
      Receivable.find({ status: { $ne: 'paid' } }).sort({ outstandingAmount: -1 }).limit(6).lean().catch(() => []),
      Payable.find({ status: { $ne: 'paid' } }).sort({ outstandingAmount: -1 }).limit(6).lean().catch(() => []),
      Todo.find({ status: { $ne: 'done' } }).sort({ priority: 1, dueDate: 1 }).limit(8).lean().catch(() => []),
      MaterialOrder.find({ isDelivered: false }).sort({ orderDate: -1 }).limit(6).lean().catch(() => []),
      QCInspection.find({}).sort({ createdAt: -1 }).limit(5).lean().catch(() => []),
    ]);

    // Thống kê tồn kho
    const lowStockMaterials = materials.filter(m => (m.quantity || 0) <= 5);
    const totalBalance = financeAccounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);

    return {
      materials,
      chemicals,
      lowStockMaterials,
      recentProductionOrders,
      financeAccounts,
      totalBalance,
      pendingReceivables,
      pendingPayables,
      pendingTodos,
      pendingMaterialOrders,
      recentQCs,
    };
  } catch (error) {
    console.error('Error getting live DB context:', error);
    return {};
  }
};

const User = require('../models/User');
const Quotation = require('../models/Quotation');

// ============================================================================
// HELPER: THỰC THI TÁC VỤ AI (AI ACTIONS) TRỰC TIẾP LÊN DATABASE
// ============================================================================
const handleDirectActions = async (message, user) => {
  const lower = message.toLowerCase().trim();
  const userName = user?.name || 'Admin';

  // 1. Tác vụ: TẠO TASK / TODO
  if (lower.startsWith('tạo task') || lower.startsWith('tạo việc') || lower.startsWith('thêm task') || lower.startsWith('thêm việc')) {
    let taskTitle = message.replace(/^(tạo task|tạo việc|thêm task|thêm việc)[:\s]*/i, '').trim();
    let priority = 'medium';
    if (lower.includes('khẩn cấp') || lower.includes('gấp') || lower.includes('urgent')) priority = 'urgent';
    else if (lower.includes('ưu tiên cao') || lower.includes('quan trọng')) priority = 'high';

    if (!taskTitle) taskTitle = 'Công việc mới cần xử lý';

    const newTodo = await Todo.create({
      title: taskTitle,
      priority,
      category: 'general',
      assignedTo: userName,
      status: 'pending',
    });

    return {
      handled: true,
      action: 'create_todo',
      data: newTodo,
      response: `✅ **Đã tạo thành công công việc mới:**\n- **Nội dung:** ${newTodo.title}\n- **Mức độ:** ${priority === 'urgent' ? '🔥 Khẩn cấp' : priority === 'high' ? '🔶 Cao' : '🔵 Trung bình'}\n- **Người phụ trách:** ${userName}\n\n*Bạn có thể xem chi tiết tại mục [Quản lý Nhiệm vụ](/admin/tasks).*`,
    };
  }

  // 2. Tác vụ: ĐÁNH DẤU HOÀN THÀNH TASK / TODO
  if (lower.startsWith('xong task') || lower.startsWith('hoàn thành task') || lower.startsWith('xong việc') || lower.startsWith('hoàn thành việc') || lower.startsWith('đã xong việc') || lower.startsWith('đánh dấu xong')) {
    const taskQuery = message.replace(/^(xong task|hoàn thành task|xong việc|hoàn thành việc|đã xong việc|đánh dấu xong)[:\s]*/i, '').trim();
    if (taskQuery.length >= 2) {
      const todo = await Todo.findOne({
        title: { $regex: taskQuery, $options: 'i' },
        status: { $ne: 'done' },
      });

      if (todo) {
        todo.status = 'done';
        todo.progress = 100;
        await todo.save();
        return {
          handled: true,
          action: 'complete_todo',
          data: todo,
          response: `🎉 **Đã đánh dấu hoàn thành công việc:**\n- **Tên việc:** ${todo.title}\n- **Trạng thái:** ✅ Hoàn thành (100%)\n\n*Đã cập nhật vào [Quản lý Nhiệm vụ](/admin/tasks).*`,
        };
      }
    }
  }

  // 3. Tác vụ: XÓA TASK / TODO
  if (lower.startsWith('xóa task') || lower.startsWith('hủy task') || lower.startsWith('xóa việc') || lower.startsWith('hủy việc')) {
    const taskQuery = message.replace(/^(xóa task|hủy task|xóa việc|hủy việc)[:\s]*/i, '').trim();
    if (taskQuery.length >= 2) {
      const todo = await Todo.findOneAndDelete({
        title: { $regex: taskQuery, $options: 'i' },
      });
      if (todo) {
        return {
          handled: true,
          action: 'delete_todo',
          data: todo,
          response: `🗑️ **Đã xóa công việc khỏi danh sách:**\n- **Nội dung:** ${todo.title}\n\n*Danh sách công việc đã được cập nhật.*`,
        };
      }
    }
  }

  // 4. Tác vụ: TẠO ĐƠN ĐẶT NGUYÊN VẬT LIỆU
  if (lower.startsWith('đặt nvl') || lower.startsWith('tạo đơn đặt') || lower.startsWith('đặt hàng nvl') || lower.startsWith('mua nvl') || lower.startsWith('đặt mua')) {
    const orderText = message.replace(/^(đặt nvl|tạo đơn đặt|đặt hàng nvl|mua nvl|đặt mua)[:\s]*/i, '').trim();
    const qtyMatch = orderText.match(/(\d+(?:\.\d+)?)/);
    const qty = qtyMatch ? parseFloat(qtyMatch[1]) : 10;
    
    // Tìm tên vật tư
    let matName = orderText.replace(/(\d+(?:\.\d+)?)\s*(ram|kg|thùng|hộp|cuộn)?/i, '').replace(/(từ|ncc|của|ở).*/i, '').trim();
    if (!matName) matName = 'Vật tư theo yêu cầu';

    // Tìm nhà cung cấp nếu có
    const suppMatch = orderText.match(/(?:từ|ncc|của)\s+([a-zA-Z0-9\s\-_]+)/i);
    const supplierName = suppMatch ? suppMatch[1].trim() : 'NCC Chỉ định';

    const newOrder = await MaterialOrder.create({
      materialName: matName,
      materialUnit: 'Ram',
      quantity: qty,
      supplier: supplierName,
      orderDate: new Date(),
      isOrdered: true,
      isDelivered: false,
      note: `Tạo tự động bởi AI Agent: ${message}`,
      createdBy: userName,
    });

    return {
      handled: true,
      action: 'create_material_order',
      data: newOrder,
      response: `🛒 **Đã lên đơn đặt hàng NVL mới:**\n- **Mã đơn:** \`${newOrder.orderCode || 'Đang tạo'}\`\n- **Vật tư:** ${newOrder.materialName}\n- **Số lượng đặt:** ${newOrder.quantity} ${newOrder.materialUnit}\n- **Nhà cung cấp:** ${newOrder.supplier}\n- **Trạng thái:** Đã đặt hàng (Chờ hàng về)\n\n*Khi hàng về kho, bạn có thể nói "Đơn ${newOrder.materialName} đã về" để tôi tự động cộng vào tồn kho.*`,
    };
  }

  // 5. Tác vụ: XÁC NHẬN ĐƠN NVL ĐÃ VỀ & TỰ ĐỘNG CỘNG TỒN KHO
  if (lower.includes('hàng về') || lower.includes('đã về') || lower.includes('nhận hàng nvl') || lower.includes('xác nhận đơn nvl') || lower.includes('hàng đã về kho')) {
    const searchTerms = lower.replace(/(hàng về|đã về|nhận hàng nvl|xác nhận đơn nvl|hàng đã về kho|đơn|giấy|vật tư|nhé|ạ|nha)/gi, '').trim();
    
    // Tìm đơn hàng NVL chưa giao
    let order = null;
    if (searchTerms.length >= 2) {
      order = await MaterialOrder.findOne({
        materialName: { $regex: searchTerms, $options: 'i' },
        isDelivered: false,
      }).sort({ createdAt: -1 });
    } else {
      order = await MaterialOrder.findOne({ isDelivered: false }).sort({ createdAt: -1 });
    }

    if (order) {
      order.isDelivered = true;
      order.actualDeliveryDate = new Date();
      await order.save();

      // Tự động tìm vật tư tương ứng trong kho để cộng dồn
      let material = await Material.findOne({
        name: { $regex: order.materialName, $options: 'i' },
      });

      let oldQty = 0;
      let newQty = 0;

      if (material) {
        oldQty = material.quantity || 0;
        newQty = oldQty + order.quantity;
        material.quantity = newQty;
        await material.save();

        await MaterialDispatch.create({
          material: material._id,
          materialName: material.name,
          quantity: order.quantity,
          unit: material.unit || order.materialUnit || 'Ram',
          type: 'import',
          notes: `Nhận hàng tự động từ đơn đặt NVL ${order.orderCode || ''}`,
          performedBy: userName,
        }).catch(() => {});
      }

      return {
        handled: true,
        action: 'receive_material_order',
        data: { order, material, oldQty, newQty },
        response: `📥 **Đã xác nhận nhận hàng & Tự động cộng kho:**\n- **Đơn hàng NVL:** ${order.materialName} (${order.quantity} ${order.materialUnit})\n- **Trạng thái đơn:** Đã giao hàng về kho\n${material ? `- **Tồn kho vật tư "${material.name}":** ${oldQty} ➔ **${newQty} ${material.unit}** (+${order.quantity})` : '- *Chưa tìm thấy mã vật tư tương ứng để cộng tự động, bạn có thể kiểm tra kho.*'}\n\n*Đã ghi nhật ký kho thành công.*`,
      };
    }
  }

  // 6. Tác vụ: BÁO CÁO TÓM TẮT HÔM NAY (EXECUTIVE DASHBOARD BRIEFING)
  if (lower.startsWith('tóm tắt hôm nay') || lower.startsWith('tình hình xưởng hôm nay') || lower.startsWith('báo cáo hôm nay') || lower.startsWith('báo cáo nhanh') || lower.startsWith('tổng quan xưởng') || lower.startsWith('dashboard hôm nay')) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalQuotes, activeOrders, lowMaterials, pendingTodos, accounts] = await Promise.all([
      Quote.countDocuments(),
      ProductionOrder.countDocuments({ status: { $ne: 'completed' } }),
      Material.countDocuments({ quantity: { $lte: 5 } }),
      Todo.find({ status: 'pending' }).sort({ priority: -1 }).limit(3),
      FinanceAccount.find({ isActive: true }),
    ]);

    const totalMoney = accounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);

    let briefing = `📊 **BÁO CÁO TỔNG QUAN TÌNH HÌNH XƯỞNG HÔM NAY (${new Date().toLocaleDateString('vi-VN')}):**\n\n`;
    briefing += `1. 🏭 **Sản xuất & Đơn hàng:**\n`;
    briefing += `   - Đang có **${activeOrders}** Lệnh sản xuất đang chạy trong xưởng.\n`;
    briefing += `   - Tổng cộng **${totalQuotes}** yêu cầu báo giá từ khách hàng.\n\n`;
    briefing += `2. 💰 **Tài chính & Quỹ:**\n`;
    briefing += `   - Tổng tiền quỹ khả dụng: **${totalMoney.toLocaleString('vi-VN')} VNĐ** (${accounts.length} tài khoản).\n\n`;
    briefing += `3. 📦 **Kho & Cảnh báo vật tư:**\n`;
    briefing += `   - ${lowMaterials > 0 ? `⚠️ Có **${lowMaterials}** loại vật tư sắp hết hàng (tồn <= 5).` : `✅ Toàn bộ vật tư trong kho đều ở mức an toàn.`}\n\n`;
    briefing += `4. 📝 **Nhiệm vụ cần làm hôm nay:**\n`;
    if (pendingTodos.length === 0) {
      briefing += `   - 🎉 Không có công việc nào đang tồn đọng!\n`;
    } else {
      pendingTodos.forEach((t, i) => {
        const p = t.priority === 'urgent' ? '🔥 Khẩn cấp' : t.priority === 'high' ? '🔶 Cao' : '🔵';
        briefing += `   - ${i + 1}. ${t.title} (${p})\n`;
      });
    }
    briefing += `\n*Chúc bạn một ngày làm việc hiệu quả và thành công!*`;

    return {
      handled: true,
      action: 'dashboard_briefing',
      data: { totalQuotes, activeOrders, lowMaterials, totalMoney },
      response: briefing,
    };
  }

  // 7. Tác vụ: TRA CỨU HỒ SƠ & QUYỀN HẠN CỦA TÔI (PROFILE & ROLE)
  if (lower.includes('hồ sơ của tôi') || lower.includes('thông tin tài khoản') || lower.includes('quyền của tôi') || lower.includes('vai trò của tôi') || lower.includes('tôi có quyền gì')) {
    const roleLabels = {
      director: '👑 Giám Đốc (Toàn quyền quản trị hệ thống)',
      accountant: '💼 Kế Toán (Quản lý Kinh doanh, Báo giá, Quản lý Dòng tiền & Công nợ)',
      production: '🏭 Quản Lý Sản Xuất (Quản lý Kho bãi, Lệnh sản xuất, Phiếu QC)',
      user: '👤 Nhân Viên / Khách hàng',
    };

    let reply = `👤 **THÔNG TIN TÀI KHOẢN CỦA BẠN:**\n\n`;
    reply += `- **Họ tên:** ${user?.name || 'Chưa cập nhật'}\n`;
    reply += `- **Email:** ${user?.email || 'Chưa cập nhật'}\n`;
    reply += `- **Số điện thoại:** ${user?.phone || 'Chưa cập nhật'}\n`;
    reply += `- **Vai trò:** ${roleLabels[user?.role] || user?.role || 'Nhân viên'}\n`;
    reply += `- **Quyền quản trị cấp cao (Admin):** ${user?.isAdmin ? '✅ Có' : '❌ Không'}\n\n`;
    reply += `*Bạn có thể xem và chỉnh sửa thông tin chi tiết tại trang [Hồ sơ cá nhân](/admin/profile).*`;

    return {
      handled: true,
      action: 'view_profile',
      data: user,
      response: reply,
    };
  }

  // 8. Tác vụ: CẬP NHẬT SỐ ĐIỆN THOẠI CÁ NHÂN
  if (lower.startsWith('cập nhật sđt') || lower.startsWith('đổi số điện thoại') || lower.startsWith('cập nhật số điện thoại') || lower.startsWith('đổi sđt')) {
    const phoneMatch = message.match(/(0\d{9,10})/);
    if (phoneMatch && user?._id) {
      const newPhone = phoneMatch[1];
      await User.findByIdAndUpdate(user._id, { phone: newPhone });
      return {
        handled: true,
        action: 'update_phone',
        data: { phone: newPhone },
        response: `📱 **Đã cập nhật số điện thoại thành công:**\n- **Số mới:** **${newPhone}**\n\n*Thông tin đã được lưu vào hồ sơ cá nhân của bạn.*`,
      };
    }
  }

  // 9. Tác vụ: XUẤT KHO / TRỪ TỒN KHO VẬT TƯ
  const exportMatch = lower.match(/(?:xuất|trừ)\s+(\d+(?:\.\d+)?)\s*(ram|kg|thùng|hộp|cuộn|bình|cái|tờ)?\s*(?:giấy|vật tư|kho)?\s*([a-zA-Z0-9\s\-_]+)/i);
  if (exportMatch && (lower.includes('xuất') || lower.includes('trừ kho') || lower.includes('trừ tồn'))) {
    const qty = parseFloat(exportMatch[1]);
    const unit = exportMatch[2] || '';
    const matNameQuery = exportMatch[3].replace(/(cho|đơn|khách|hàng|nhé|nha|ạ).*/i, '').trim();

    if (qty > 0 && matNameQuery.length >= 2) {
      const material = await Material.findOne({
        name: { $regex: matNameQuery, $options: 'i' },
      });

      if (material) {
        const oldQty = material.quantity || 0;
        const newQty = Math.max(0, oldQty - qty);
        material.quantity = newQty;
        await material.save();

        // Ghi log MaterialDispatch
        await MaterialDispatch.create({
          material: material._id,
          materialName: material.name,
          quantity: qty,
          unit: material.unit || unit || 'Ram',
          type: 'export',
          notes: `AI Assistant xuất kho: ${message}`,
          performedBy: userName,
        }).catch(() => {});

        return {
          handled: true,
          action: 'export_material',
          data: { material, oldQty, newQty, qty },
          response: `📦 **Đã trừ kho thành công vật tư "${material.name}":**\n- **Số lượng xuất:** ${qty} ${material.unit}\n- **Tồn kho trước:** ${oldQty} ${material.unit}\n- **Tồn kho hiện tại:** **${newQty} ${material.unit}**\n\n*Đã tự động lưu vào lịch sử xuất kho.*`,
        };
      }
    }
  }

  // 10. Tác vụ: NHẬP KHO / CỘNG TỒN KHO VẬT TƯ
  const importMatch = lower.match(/(?:nhập|cộng|thêm)\s+(\d+(?:\.\d+)?)\s*(ram|kg|thùng|hộp|cuộn|bình|cái|tờ)?\s*(?:giấy|vật tư|kho)?\s*([a-zA-Z0-9\s\-_]+)/i);
  if (importMatch && (lower.includes('nhập kho') || lower.includes('cộng kho') || lower.includes('thêm kho') || lower.startsWith('nhập '))) {
    const qty = parseFloat(importMatch[1]);
    const unit = importMatch[2] || '';
    const matNameQuery = importMatch[3].replace(/(từ|ncc|của|nhé|nha|ạ).*/i, '').trim();

    if (qty > 0 && matNameQuery.length >= 2) {
      const material = await Material.findOne({
        name: { $regex: matNameQuery, $options: 'i' },
      });

      if (material) {
        const oldQty = material.quantity || 0;
        const newQty = oldQty + qty;
        material.quantity = newQty;
        await material.save();

        await MaterialDispatch.create({
          material: material._id,
          materialName: material.name,
          quantity: qty,
          unit: material.unit || unit || 'Ram',
          type: 'import',
          notes: `AI Assistant nhập kho: ${message}`,
          performedBy: userName,
        }).catch(() => {});

        return {
          handled: true,
          action: 'import_material',
          data: { material, oldQty, newQty, qty },
          response: `📥 **Đã cộng kho thành công vật tư "${material.name}":**\n- **Số lượng nhập:** +${qty} ${material.unit}\n- **Tồn kho trước:** ${oldQty} ${material.unit}\n- **Tồn kho hiện tại:** **${newQty} ${material.unit}**\n\n*Đã cập nhật dữ liệu tồn kho.*`,
        };
      }
    }
  }

  // 11. Tác vụ: TẠO LỆNH SẢN XUẤT (PRODUCTION ORDER)
  if (lower.startsWith('tạo lệnh sản xuất') || lower.startsWith('tạo lệnh sx') || lower.startsWith('thêm lệnh sx') || lower.startsWith('lập lệnh sx')) {
    const rawOrder = message.replace(/^(tạo lệnh sản xuất|tạo lệnh sx|thêm lệnh sx|lập lệnh sx)[:\s]*/i, '').trim();
    const qtyMatch = rawOrder.match(/(\d+(?:[.,]\d+)?)\s*(hộp|cái|tờ|cuốn|bộ|sp|sản phẩm)?/i);
    const qty = qtyMatch ? parseInt(qtyMatch[1].replace(/[.,]/g, ''), 10) : 1000;

    const isSilk = lower.includes('lụa') || lower.includes('in lụa') || lower.includes('silk');
    const printType = isSilk ? 'silk' : 'offset';

    // Tạo mã lệnh sản xuất tự động
    const today = new Date();
    const dateStr = today.toISOString().slice(2, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const orderCode = `LSX-${dateStr}-${randomSuffix}`;

    let orderName = rawOrder
      .replace(/(\d+(?:[.,]\d+)?)\s*(hộp|cái|tờ|cuốn|bộ|sp|sản phẩm)?/i, '')
      .replace(/(in offset|in lụa|offset|lụa)/gi, '')
      .trim();
    if (!orderName) orderName = 'Đơn hàng in ấn mới';

    const newProdOrder = await ProductionOrder.create({
      orderCode,
      orderName,
      totalQuantity: qty,
      printType,
      printJobs: [
        {
          jobName: orderName,
          quantity: qty,
          printColors: isSilk ? 'In lụa 1 màu' : 'In Offset 4 màu CMYK',
          notes: `Khởi tạo nhanh bởi AI Agent: ${message}`,
        },
      ],
      status: 'pending',
    });

    return {
      handled: true,
      action: 'create_production_order',
      data: newProdOrder,
      response: `🏭 **Đã tạo thành công Lệnh Sản Xuất mới:**\n- **Mã lệnh:** \`${newProdOrder.orderCode}\`\n- **Tên đơn:** ${newProdOrder.orderName}\n- **Số lượng:** ${newProdOrder.totalQuantity.toLocaleString('vi-VN')} SP\n- **Kỹ thuật in:** ${printType === 'offset' ? '🖨️ In Offset' : '🎨 In Lụa'}\n\n*Bạn có thể xem và quản lý chi tiết tại trang [Lệnh Sản Xuất](/admin/production-orders).*`,
    };
  }

  // 12. Tác vụ: THÊM KHÁCH HÀNG MỚI (CUSTOMER)
  if (lower.startsWith('thêm khách hàng') || lower.startsWith('tạo khách hàng') || lower.startsWith('thêm khách')) {
    const rawCust = message.replace(/^(thêm khách hàng|tạo khách hàng|thêm khách)[:\s]*/i, '').trim();
    const phoneMatch = rawCust.match(/(0\d{9,10})/);
    const phone = phoneMatch ? phoneMatch[1] : '';

    let name = rawCust.replace(/(0\d{9,10})/g, '').replace(/(sđt|số điện thoại|sdt|đt)[:\s]*/gi, '').trim();
    if (!name) name = 'Khách hàng mới';

    const newCustomer = await Customer.create({
      name,
      phone: phone || 'Chưa cập nhật',
      address: 'Chưa cập nhật',
    });

    return {
      handled: true,
      action: 'create_customer',
      data: newCustomer,
      response: `👥 **Đã thêm khách hàng mới thành công:**\n- **Tên khách:** ${newCustomer.name}\n- **Số điện thoại:** ${newCustomer.phone}\n\n*Đã lưu vào danh bạ khách hàng của hệ thống.*`,
    };
  }

  return { handled: false };
};

// ============================================================================
// ENGINE 2: RULE-BASED INTENT & LIVE QUERY (FALLBACK TỨC THÌ 100% RELIABLE)
// ============================================================================
const runRuleBasedEngine = async (message, context) => {
  const lower = message.toLowerCase().trim();

  // 1. TỒN KHO & CẢNH BÁO
  if (
    lower.includes('tồn kho') ||
    lower.includes('kiểm tra kho') ||
    lower.includes('xem kho') ||
    lower.includes('hết hàng') ||
    lower.includes('sắp hết') ||
    lower.includes('còn bao nhiêu') ||
    lower.includes('giấy') ||
    lower.includes('mực') ||
    lower.includes('kẽm') ||
    lower.includes('hóa chất')
  ) {
    // Trường hợp kiểm tra vật tư sắp hết
    if (lower.includes('sắp hết') || lower.includes('hết hàng') || lower.includes('cảnh báo')) {
      const lowItems = context.lowStockMaterials || [];
      if (lowItems.length === 0) {
        return `✅ **Tuyệt vời!** Hiện tại không có vật tư nào dưới mức báo động (tất cả đều tồn kho > 5 đơn vị).`;
      }
      let reply = `⚠️ **CẢNH BÁO TỒN KHO THẤP (Dưới 5 đơn vị):**\n\n`;
      lowItems.forEach((m, idx) => {
        reply += `${idx + 1}. **${m.name}**: Còn **${m.quantity} ${m.unit}** (Quy cách: ${m.specification || 'Chuẩn'})\n`;
      });
      reply += `\n💡 *Gợi ý: Bạn có thể yêu cầu "Tạo đơn đặt 50 ram [Tên vật tư]" để tôi lập đơn đặt hàng ngay.*`;
      return reply;
    }

    // Kiểm tra tìm kiếm vật tư cụ thể
    const queryWords = lower.replace(/(kiểm tra|tồn kho|xem|còn|bao nhiêu|giấy|trong kho|hỏi|ạ|nhé)/gi, '').trim();
    if (queryWords.length >= 2) {
      const matched = (context.materials || []).filter(m => m.name.toLowerCase().includes(queryWords));
      const matchedChem = (context.chemicals || []).filter(c => c.name.toLowerCase().includes(queryWords));

      if (matched.length > 0 || matchedChem.length > 0) {
        let reply = `📦 **KẾT QUẢ TRA CỨU TỒN KHO:**\n\n`;
        matched.forEach((m) => {
          const statusIcon = m.quantity <= 5 ? '🔴 Sắp hết' : m.quantity <= 20 ? '🟡 Ổn định' : '🟢 Dồi dào';
          reply += `• **${m.name}**: **${m.quantity} ${m.unit}** (${statusIcon})\n`;
        });
        matchedChem.forEach((c) => {
          reply += `• **[Hóa chất] ${c.name}**: **${c.quantity} ${c.unit}** (Vị trí: ${c.location || 'Kho phụ'})\n`;
        });
        return reply;
      }
    }

    // Tổng quan kho
    const topMaterials = (context.materials || []).slice(0, 8);
    let reply = `📦 **TỔNG QUAN TỒN KHO VẬT TƯ CHÍNH:**\n\n`;
    topMaterials.forEach((m) => {
      reply += `• **${m.name}**: ${m.quantity} ${m.unit}\n`;
    });
    reply += `\n*Tổng số loại vật tư quản lý: ${context.materials?.length || 0} loại. Có ${context.lowStockMaterials?.length || 0} loại tồn thấp.*`;
    return reply;
  }

  // 2. TÀI CHÍNH, QUỸ, DÒNG TIỀN
  if (lower.includes('tài chính') || lower.includes('tiền') || lower.includes('quỹ') || lower.includes('số dư') || lower.includes('cashflow') || lower.includes('ngân hàng')) {
    const formattedTotal = (context.totalBalance || 0).toLocaleString('vi-VN') + ' đ';
    let reply = `💰 **BÁO CÁO NHANH TÀI CHÍNH & SỐ DƯ QUỸ:**\n\n`;
    reply += `💵 **Tổng tiền khả dụng hiện có:** **${formattedTotal}**\n\n`;
    reply += `📊 **Chi tiết các tài khoản / quỹ:**\n`;
    (context.financeAccounts || []).forEach((acc) => {
      const bal = (acc.currentBalance || 0).toLocaleString('vi-VN') + ' đ';
      reply += `• **${acc.accountName}** (${acc.accountType === 'bank' ? 'Ngân hàng' : 'Tiền mặt'}): **${bal}**\n`;
    });
    reply += `\n*Xem báo cáo P&L và Cashflow đầy đủ tại mục [Quản lý Dòng tiền](/admin/finance).*`;
    return reply;
  }

  // 3. CÔNG NỢ PHẢI THU / PHẢI TRẢ
  if (lower.includes('công nợ') || lower.includes('nợ') || lower.includes('phải thu') || lower.includes('phải trả')) {
    let reply = `👥 **TÌNH HÌNH CÔNG NỢ HIỆN TẠI:**\n\n`;
    
    reply += `🔺 **Top khoản phải thu khách hàng:**\n`;
    if ((context.pendingReceivables || []).length === 0) {
      reply += `• Không có khoản nợ khó đòi nào đang mở.\n`;
    } else {
      (context.pendingReceivables || []).forEach((r) => {
        const amt = (r.outstandingAmount || 0).toLocaleString('vi-VN') + ' đ';
        reply += `• **${r.counterpartyNameSnapshot || 'Khách hàng'}**: còn nợ **${amt}** (Hạn: ${r.dueDate ? new Date(r.dueDate).toLocaleDateString('vi-VN') : '—'})\n`;
      });
    }

    reply += `\n🔻 **Top khoản cần thanh toán nhà cung cấp:**\n`;
    if ((context.pendingPayables || []).length === 0) {
      reply += `• Đã thanh toán đầy đủ các nhà cung cấp.\n`;
    } else {
      (context.pendingPayables || []).forEach((p) => {
        const amt = (p.outstandingAmount || 0).toLocaleString('vi-VN') + ' đ';
        reply += `• **${p.counterpartyNameSnapshot || 'Nhà cung cấp'}**: cần trả **${amt}**\n`;
      });
    }
    return reply;
  }

  // 4. LỆNH SẢN XUẤT (PRODUCTION ORDERS)
  if (lower.includes('lệnh sản xuất') || lower.includes('tiến độ') || lower.includes('đơn hàng') || lower.includes('lsx') || lower.includes('bài in')) {
    const orders = context.recentProductionOrders || [];
    if (orders.length === 0) {
      return `🏭 Hiện chưa có Lệnh Sản Xuất nào được tạo trong hệ thống.`;
    }

    let reply = `🏭 **TIẾN ĐỘ CÁC LỆNH SẢN XUẤT GẦN ĐÂY:**\n\n`;
    orders.slice(0, 5).forEach((ord) => {
      const statusText = ord.status === 'completed' ? '🟢 Hoàn thành' : ord.status === 'in_progress' ? '🔵 Đang in' : '⏳ Chờ chuẩn bị';
      reply += `• **[${ord.orderCode || 'LSX'}] ${ord.orderName}**\n`;
      reply += `  - Số lượng: **${(ord.totalQuantity || 0).toLocaleString('vi-VN')}** | Loại in: **${ord.printType === 'silk' ? 'In lụa' : 'In offset'}**\n`;
      reply += `  - Trạng thái: ${statusText}\n`;
    });
    reply += `\n*Xem chi tiết toàn bộ lệnh tại [Lệnh Sản Xuất](/admin/production-orders).*`;
    return reply;
  }

  // 5. NHIỆM VỤ / TODO
  if (lower.includes('nhiệm vụ') || lower.includes('todo') || lower.includes('công việc') || lower.includes('việc cần làm')) {
    const todos = context.pendingTodos || [];
    if (todos.length === 0) {
      return `🎉 **Tuyệt vời!** Hiện tại bạn không có nhiệm vụ nào chưa hoàn thành. Tất cả công việc đều đã xong!`;
    }
    let reply = `📝 **DANH SÁCH CÔNG VIỆC CHƯA XONG:**\n\n`;
    todos.forEach((t, i) => {
      const prio = t.priority === 'urgent' ? '🔥 Khẩn cấp' : t.priority === 'high' ? '🔶 Cao' : '🔵';
      reply += `${i + 1}. **${t.title}** (${prio}) - Tiến độ: **${t.progress || 0}%**\n`;
    });
    reply += `\n💡 *Gõ "Tạo task: [Tên việc]" để tôi tạo thêm công việc mới cho bạn.*`;
    return reply;
  }

  // 6. DUYỆT MẪU QC
  if (lower.includes('qc') || lower.includes('duyệt mẫu') || lower.includes('kiểm tra mẫu') || lower.includes('đầu chuyền')) {
    const qcs = context.recentQCs || [];
    if (qcs.length === 0) {
      return `🔍 Chưa có phiếu kiểm duyệt mẫu QC nào gần đây. Bạn có thể mở mục **Duyệt mẫu QC** trên thanh menu để lập phiếu mới.`;
    }
    let reply = `🔍 **KẾT QUẢ DUYỆT MẪU QC GẦN ĐÂY:**\n\n`;
    qcs.forEach((q) => {
      const vText = q.verdict === 'approved' ? '🟢 ĐẠT' : q.verdict === 'rejected' ? '🔴 KHÔNG ĐẠT' : '🟡 CÓ ĐIỀU KIỆN';
      reply += `• **[${q.inspectionCode || 'QC'}] ${q.orderName}** -> Kết luận: **${vText}** (QC: ${q.inspector || '—'})\n`;
    });
    return reply;
  }

  // CÂU HỎI MẶC ĐỊNH
  return `🤖 **Chào bạn! Tôi là Trợ lý AI Xưởng In Quang Phát.**\n\nTôi có thể hỗ trợ bạn tức thì các tác vụ sau:\n1. 📦 **Tra cứu & cảnh báo kho:** *"Kiểm tra tồn kho giấy Couche 300"*, *"Vật tư nào sắp hết?"*\n2. 🔄 **Thao tác kho nhanh:** *"Xuất 15 ram Couche 300"*, *"Nhập 50 ram Bristol 250"*\n3. 🛒 **Đặt NVL:** *"Đặt 100 ram giấy Couche 250 từ NCC Tiến Đạt"*\n4. 🏭 **Lệnh sản xuất:** *"Tiến độ các đơn hàng đang in"*\n5. 💰 **Tài chính & Quỹ:** *"Tổng tiền hiện có bao nhiêu?"*, *"Công nợ khách hàng"*\n6. 📝 **Tạo việc nhanh:** *"Tạo task: Gọi NCC mực in lúc 15h"*\n\n*Hãy nhập yêu cầu của bạn hoặc bấm các gợi ý bên dưới để thử nghiệm!*`;
};

// ============================================================================
// CHÍNH: XỬ LÝ MESSAGE BẰNG GOOGLE GEMINI AI (KÈM DUAL-ENGINE FALLBACK)
// ============================================================================
const processChatMessage = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập nội dung tin nhắn' });
    }

    const user = req.user;
    const cleanMsg = message.trim();

    // 1. Kiểm tra xem người dùng có yêu cầu thực hiện Action trực tiếp không
    const actionResult = await handleDirectActions(cleanMsg, user);
    if (actionResult.handled) {
      return res.json({
        reply: actionResult.response,
        engine: 'action_executor',
        action: actionResult.action,
        data: actionResult.data,
      });
    }

    // 2. Thu thập dữ liệu thực tế từ Database
    const liveContext = await getLiveDatabaseContext();

    // 3. Nếu có cấu hình GEMINI_API_KEY, thử gọi Gemini AI
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey.trim()) {
      try {
        // Chuẩn bị System Prompt với Context giàu chi tiết
        const systemPrompt = `Bạn là Trợ lý AI chuyên nghiệp, thông minh của Công ty In Quang Phát (xưởng in offset và in lụa chuyên nghiệp).
Nhiệm vụ của bạn là hỗ trợ ban giám đốc, quản lý sản xuất và kế toán trả lời nhanh các câu hỏi về:
- Tồn kho giấy, mực, kẽm, hóa chất.
- Tiến độ các lệnh sản xuất, bài in, công đoạn gia công.
- Tình hình tài chính, quỹ tiền mặt, ngân hàng, công nợ phải thu/phải trả.
- Công việc todo, duyệt mẫu QC đầu chuyền.
- Kiến thức kỹ thuật in ấn, chia khổ giấy, tính giá in.

DƯỚI ĐÂY LÀ DỮ LIỆU THỰC TẾ TRONG DATABASE HỆ THỐNG HIỆN TẠI:
- TỔNG TIỀN QUỸ KHẢ DỤNG: ${liveContext.totalBalance?.toLocaleString('vi-VN')} VNĐ.
- CHI TIẾT TÀI KHOẢN: ${JSON.stringify(liveContext.financeAccounts?.map(a => ({ tên: a.accountName, loại: a.accountType, số_dư: a.currentBalance })))}
- TỒN KHO VẬT TƯ CHÍNH: ${JSON.stringify(liveContext.materials?.slice(0, 15).map(m => ({ tên: m.name, số_lượng: m.quantity, đơn_vị: m.unit })))}
- VẬT TƯ CẢNH BÁO SẮP HẾT: ${JSON.stringify(liveContext.lowStockMaterials?.map(m => ({ tên: m.name, còn: m.quantity, đv: m.unit })))}
- HÓA CHẤT & MỰC: ${JSON.stringify(liveContext.chemicals?.slice(0, 10).map(c => ({ tên: c.name, tồn: c.quantity, đv: c.unit })))}
- LỆNH SẢN XUẤT GẦN ĐÂY: ${JSON.stringify(liveContext.recentProductionOrders?.map(o => ({ mã: o.orderCode, tên: o.orderName, số_lượng: o.totalQuantity, kỹ_thuật: o.printType, trạng_thái: o.status })))}
- CÔNG NỢ PHẢI THU (KHÁCH HÀNG): ${JSON.stringify(liveContext.pendingReceivables?.map(r => ({ khách: r.counterpartyNameSnapshot, nợ: r.outstandingAmount })))}
- CÔNG NỢ PHẢI TRẢ (NCC): ${JSON.stringify(liveContext.pendingPayables?.map(p => ({ ncc: p.counterpartyNameSnapshot, nợ: p.outstandingAmount })))}
- CÔNG VIỆC CHƯA XONG (TODOS): ${JSON.stringify(liveContext.pendingTodos?.map(t => ({ tiêu_đề: t.title, ưu_tiên: t.priority, tiến_độ: t.progress })))}
- PHIẾU QC GẦN ĐÂY: ${JSON.stringify(liveContext.recentQCs?.map(q => ({ mã: q.inspectionCode, đơn: q.orderName, kết_luận: q.verdict })))}

QUY TẮC TRẢ LỜI:
1. Trả lời bằng tiếng Việt tự nhiên, lịch sự, chuyên nghiệp, súc tích và có định dạng Markdown đẹp mắt (dùng gạch đầu dòng, in đậm số liệu, emoji phù hợp).
2. Khi người dùng hỏi về số liệu, hãy dùng chính xác số liệu trong Database ở trên.
3. Nếu người dùng muốn thực hiện các hành động trực tiếp, hãy hướng dẫn hoặc nhắc nhở cú pháp ngắn gọn:
   - Tạo việc Todo: "Tạo task: [Tên việc] (gấp/ưu tiên cao)"
   - Hoàn thành việc: "Xong task [Tên việc]" hoặc "Xóa task [Tên việc]"
   - Đặt mua NVL: "Đặt 50 ram giấy Couche 250 từ [Tên NCC]"
   - Xác nhận hàng về: "Đơn [Tên vật tư] đã về" (AI tự động cộng kho)
   - Lập Lệnh sản xuất: "Tạo lệnh sản xuất [Số lượng] [Tên sản phẩm] in offset / in lụa"
   - Xuất / Nhập kho: "Xuất 10 ram Couche 300", "Nhập 20 ram Ivory 350"
   - Thêm khách hàng: "Thêm khách hàng [Tên khách] SĐT [Số ĐT]"
   - Báo cáo xưởng: "Tóm tắt hôm nay"
   - Hồ sơ & Quyền hạn: "Hồ sơ của tôi", "Cập nhật SĐT [Số ĐT]"
4. Trả lời trực tiếp vào vấn đề, súc tích, không dài dòng.`;

        // Danh sách model Google Gemini thế hệ mới nhất đang hoạt động
        const modelsToTry = [
          'gemini-3.5-flash',
          'gemini-3.5-flash-lite',
          'gemini-3.1-flash-lite',
          'gemini-3.7-flash',
          'gemini-3-flash-preview',
        ];
        let geminiResponseText = null;

        for (const model of modelsToTry) {
          try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
            
            const payload = {
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\nNgười dùng hỏi: "${cleanMsg}"` }],
                },
              ],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 1500,
              },
            };

            const response = await axios.post(endpoint, payload, { timeout: 12000 });
            if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
              geminiResponseText = response.data.candidates[0].content.parts[0].text;
              return res.json({
                reply: geminiResponseText,
                engine: `Gemini AI (${model})`,
                isOnlineAI: true,
                model: model,
              });
            }
          } catch (modelErr) {
            console.warn(`Gemini model ${model} failed (${modelErr.response?.status || modelErr.message}), trying next...`);
          }
        }
      } catch (geminiError) {
        console.error('Gemini API call encountered error, falling back to rule-based engine:', geminiError.message);
      }
    }

    // 4. Nếu Gemini không khả dụng hoặc lỗi -> Chạy Rule-based Engine
    const ruleReply = await runRuleBasedEngine(cleanMsg, liveContext);
    return res.json({
      reply: ruleReply,
      engine: 'offline_rule_engine',
      isOnlineAI: false,
    });
  } catch (error) {
    console.error('Error in processChatMessage:', error);
    res.status(500).json({ message: 'Lỗi khi xử lý tin nhắn AI: ' + error.message });
  }
};

// ============================================================================
// STATUS ENDPOINT: KIỂM TRA TRẠNG THÁI AI ENGINE
// ============================================================================
const getAIAssistantStatus = async (req, res) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const hasGeminiKey = !!(geminiKey && geminiKey.trim());

  res.json({
    status: 'online',
    isOnlineAI: hasGeminiKey,
    activeEngine: hasGeminiKey ? 'Google Gemini AI (Gemini 3.5 Flash) + Live Database' : 'Offline Rule-based Engine',
    model: hasGeminiKey ? 'Gemini 3.5 Flash' : 'Offline Fallback',
    features: [
      'Tra cứu tồn kho & cảnh báo vật tư',
      'Thao tác trừ / cộng kho nhanh qua lệnh chat',
      'Tạo đơn đặt hàng Nguyên vật liệu tự động',
      'Báo cáo tiến độ Lệnh sản xuất',
      'Thống kê số dư quỹ & công nợ',
      'Tạo nhanh nhiệm vụ Todo List',
      'Tra cứu phiếu duyệt mẫu QC In lụa',
      'Tư vấn kỹ thuật in ấn & chia khổ giấy',
    ],
  });
};

module.exports = {
  processChatMessage,
  getAIAssistantStatus,
};
