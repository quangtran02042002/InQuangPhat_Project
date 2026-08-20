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
const FinanceVoucher = require('../models/FinanceVoucher');
const FinanceCategory = require('../models/FinanceCategory');
const CashBook = require('../models/CashBook');
const AdminQuote = require('../models/AdminQuote');

// ============================================================================
// HELPER: THỰC THI TÁC VỤ AI (AI ACTIONS) TRỰC TIẾP LÊN DATABASE
// ============================================================================
const handleDirectActions = async (message, user) => {
  const lower = message.toLowerCase().trim();
  const userName = user?.name || 'Admin';

  // 1. Tác vụ: TẠO TASK / TODO VỚI ĐẦY ĐỦ THÔNG TIN MODAL
  if (lower.startsWith('tạo task') || lower.startsWith('tạo việc') || lower.startsWith('thêm task') || lower.startsWith('thêm việc') || lower.startsWith('lập task')) {
    let rawText = message.replace(/^(tạo task|tạo việc|thêm task|thêm việc|lập task)[:\s]*/i, '').trim();
    if (!rawText) rawText = 'Công việc mới cần xử lý';

    // 1.1 Trích xuất Mức độ ưu tiên (Priority)
    let priority = 'medium';
    if (lower.includes('khẩn cấp') || lower.includes('gấp') || lower.includes('urgent') || lower.includes('hỏa tốc')) {
      priority = 'urgent';
    } else if (lower.includes('ưu tiên cao') || lower.includes('quan trọng') || lower.includes('mức cao') || lower.includes('ưu tiên: cao')) {
      priority = 'high';
    } else if (lower.includes('ưu tiên thấp') || lower.includes('mức thấp') || lower.includes('thấp') || lower.includes('ưu tiên: thấp')) {
      priority = 'low';
    }

    // 1.2 Trích xuất Phân loại Danh mục (Category)
    let category = 'general';
    if (lower.includes('sản xuất') || lower.includes('máy in') || lower.includes('in offset') || lower.includes('in lụa') || lower.includes('bài in') || lower.includes('khuôn') || lower.includes('kẽm') || lower.includes('loại: sản xuất')) {
      category = 'production';
    } else if (lower.includes('mua hàng') || lower.includes('đặt hàng') || lower.includes('vật tư') || lower.includes('nhà cung cấp') || lower.includes('ncc') || lower.includes('loại: mua hàng')) {
      category = 'purchasing';
    } else if (lower.includes('tài chính') || lower.includes('tiền') || lower.includes('thu nợ') || lower.includes('chi tiền') || lower.includes('công nợ') || lower.includes('hóa đơn') || lower.includes('loại: tài chính')) {
      category = 'finance';
    }

    // 1.3 Trích xuất Người phụ trách (AssignedTo)
    let assignedTo = userName;
    const assignMatch = message.match(/(?:gán cho|giao cho|phụ trách|cho|người làm|phụ trách:)\s+([a-zA-ZÀ-ỹ0-9\s]+?)(?:\||,|\.|\s+ưu tiên|\s+hạn|\s+loại|\s+ngày|$)/i);
    if (assignMatch && assignMatch[1].trim().length >= 2) {
      assignedTo = assignMatch[1].trim();
    }

    // 1.4 Trích xuất Hạn hoàn thành (DueDate)
    let dueDate = null;
    const now = new Date();
    if (lower.includes('sáng mai') || lower.includes('8h sáng mai') || lower.includes('sáng ngày mai')) {
      dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8, 0, 0);
    } else if (lower.includes('chiều mai') || lower.includes('chiều ngày mai')) {
      dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 14, 0, 0);
    } else if (lower.includes('ngày mai') || lower.includes('hạn mai')) {
      dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 17, 0, 0);
    } else if (lower.includes('hôm nay') || lower.includes('trong ngày')) {
      dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);
    } else {
      const dateMatch = message.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?/);
      if (dateMatch) {
        const d = parseInt(dateMatch[1], 10);
        const m = parseInt(dateMatch[2], 10) - 1;
        const y = dateMatch[3] ? parseInt(dateMatch[3], 10) : now.getFullYear();
        dueDate = new Date(y, m, d, 17, 0, 0);
      }
    }

    // 1.5 Trích xuất Tiêu đề sạch (Clean Title) & Mô tả
    let cleanTitle = rawText
      .replace(/\|/g, ' ')
      .replace(/(?:ưu tiên|mức độ|độ ưu tiên)[:\s]*(?:khẩn cấp|cao|trung bình|thấp|urgent|high|medium|low)/gi, '')
      .replace(/(?:gán cho|giao cho|phụ trách)[:\s]*[a-zA-ZÀ-ỹ0-9\s]+/gi, '')
      .replace(/(?:loại|danh mục|phân loại)[:\s]*(?:sản xuất|mua hàng|tài chính|chung)/gi, '')
      .replace(/(?:hạn|deadline|hạn chót)[:\s]*[a-zA-Z0-9\s\/\-]+/gi, '')
      .trim();

    if (!cleanTitle || cleanTitle.length < 3) {
      cleanTitle = rawText;
    }

    const newTodo = await Todo.create({
      title: cleanTitle,
      description: `Khởi tạo bởi AI Agent: ${message}`,
      priority,
      category,
      assignedTo,
      dueDate: dueDate || undefined,
      status: 'pending',
    });

    const priorityLabel = {
      urgent: '🔥 Khẩn cấp',
      high: '🔶 Cao',
      medium: '🔵 Trung bình',
      low: '⚪ Thấp',
    }[priority];

    const categoryLabel = {
      production: '🏭 Sản xuất & Máy in',
      purchasing: '🛒 Mua hàng & NVL',
      finance: '💰 Tài chính & Quỹ',
      general: '📋 Công việc chung',
    }[category];

    const dueFormatted = dueDate
      ? dueDate.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
      : 'Chưa đặt hạn chót';

    let reply = `✅ **ĐÃ TẠO THÀNH CÔNG CÔNG VIỆC MỚI VÀO TODO LIST!**\n\n`;
    reply += `📋 **Chi tiết thông tin đã lưu vào hệ thống:**\n`;
    reply += `- 📌 **Tiêu đề:** **${newTodo.title}**\n`;
    reply += `- ⏰ **Hạn hoàn thành:** ${dueFormatted}\n`;
    reply += `- 🏷️ **Mức độ ưu tiên:** ${priorityLabel}\n`;
    reply += `- 📂 **Phân loại danh mục:** ${categoryLabel}\n`;
    reply += `- 👤 **Người phụ trách:** ${assignedTo}\n`;
    reply += `- 📊 **Trạng thái:** ⏳ Đang chờ thực hiện (0%)\n\n`;
    reply += `💡 *Mẹo: Nếu cần chỉnh sửa thêm, bạn có thể nói "Xong task [Tên]" hoặc quản lý trực tiếp tại mục [Quản lý Nhiệm vụ](/admin/tasks).*`;

    return {
      handled: true,
      action: 'create_todo',
      data: newTodo,
      response: reply,
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

  // 12. Tác vụ: THÊM KHÁCH HÀNG MỚI (INTERACTIVE DIALOG)
  // Schema yêu cầu: name (required), address (required), group (required), contacts[].name, contacts[].phone (required)
  if (lower.startsWith('thêm khách hàng') || lower.startsWith('tạo khách hàng') || lower.startsWith('thêm khách') || lower.startsWith('thêm kh')) {
    const rawCust = message.replace(/^(thêm khách hàng|tạo khách hàng|thêm khách|thêm kh)[:\s]*/i, '').trim();

    // Bóc tách các thông tin từ câu lệnh
    let custName = '';
    let custPhone = '';
    let custAddress = '';
    let custGroup = '';
    let custTaxCode = '';
    let custEmail = '';

    // Hỗ trợ cú pháp có dấu phân cách |
    if (rawCust.includes('|')) {
      const parts = rawCust.split('|').map(p => p.trim());
      parts.forEach(part => {
        const partLower = part.toLowerCase();
        if (partLower.startsWith('đc:') || partLower.startsWith('địa chỉ:') || partLower.startsWith('dc:')) {
          custAddress = part.replace(/^(đc|địa chỉ|dc)[:\s]*/i, '').trim();
        } else if (partLower.startsWith('sđt:') || partLower.startsWith('sdt:') || partLower.startsWith('đt:') || partLower.startsWith('phone:') || partLower.startsWith('số:')) {
          custPhone = part.replace(/^(sđt|sdt|đt|phone|số)[:\s]*/i, '').trim();
        } else if (partLower.startsWith('nhóm:') || partLower.startsWith('loại:') || partLower.startsWith('group:')) {
          const groupVal = part.replace(/^(nhóm|loại|group)[:\s]*/i, '').trim().toLowerCase();
          if (groupVal.includes('vải') || groupVal.includes('garment')) custGroup = 'garment';
          else if (groupVal.includes('cả hai') || groupVal.includes('mixed')) custGroup = 'mixed';
          else custGroup = 'offset';
        } else if (partLower.startsWith('mst:') || partLower.startsWith('mã số thuế:') || partLower.startsWith('tax:')) {
          custTaxCode = part.replace(/^(mst|mã số thuế|tax)[:\s]*/i, '').trim();
        } else if (partLower.startsWith('email:')) {
          custEmail = part.replace(/^email[:\s]*/i, '').trim();
        } else if (!custName) {
          custName = part;
        }
      });
    } else {
      // Regex bóc tách từ câu tự nhiên
      const phoneMatch = rawCust.match(/(0\d{9,10})/);
      if (phoneMatch) custPhone = phoneMatch[1];

      const addrMatch = rawCust.match(/(?:địa chỉ|đc|ở|tại)\s+([^,|]+)/i);
      if (addrMatch) custAddress = addrMatch[1].trim();

      custName = rawCust
        .replace(/(0\d{9,10})/g, '')
        .replace(/(?:sđt|sdt|số điện thoại|đt|phone)[:\s]*/gi, '')
        .replace(/(?:địa chỉ|đc|ở|tại)\s+[^,|]+/gi, '')
        .replace(/(?:nhóm|loại)[:\s]*\S+/gi, '')
        .trim();
    }

    if (!custName) custName = rawCust.split(/[,|]/)[0]?.trim() || '';

    // Kiểm tra đủ thông tin bắt buộc chưa
    const missingFields = [];
    if (!custName || custName.length < 2) missingFields.push('name');
    if (!custAddress) missingFields.push('address');
    if (!custPhone) missingFields.push('phone');

    if (missingFields.length > 0) {
      // Trả về INLINE FORM để người dùng điền bổ sung
      const formFields = [
        { key: 'name', label: '🏢 Tên khách hàng / Công ty', type: 'text', required: true, value: custName || '', placeholder: 'VD: Công ty TNHH Bao Bì Việt' },
        { key: 'address', label: '📍 Địa chỉ', type: 'text', required: true, value: custAddress || '', placeholder: 'VD: 45 Hùng Vương, TP Huế' },
        { key: 'phone', label: '📞 Số điện thoại liên hệ', type: 'text', required: true, value: custPhone || '', placeholder: 'VD: 0905123456' },
        { key: 'group', label: '🏷️ Nhóm khách hàng', type: 'select', required: true, value: custGroup || 'offset', options: [
          { value: 'offset', label: '📄 In giấy (Offset)' },
          { value: 'garment', label: '👕 In vải (Garment)' },
          { value: 'mixed', label: '🔀 Cả hai (Mixed)' },
        ]},
        { key: 'taxCode', label: '📋 Mã số thuế', type: 'text', required: false, value: custTaxCode || '', placeholder: 'Không bắt buộc' },
        { key: 'email', label: '📧 Email', type: 'text', required: false, value: custEmail || '', placeholder: 'Không bắt buộc' },
      ];

      const filledSummary = [];
      if (custName) filledSummary.push(`✅ **Tên:** ${custName}`);
      if (custPhone) filledSummary.push(`✅ **SĐT:** ${custPhone}`);
      if (custAddress) filledSummary.push(`✅ **Địa chỉ:** ${custAddress}`);

      let promptText = `📝 **TẠO HỒ SƠ KHÁCH HÀNG MỚI**\n\n`;
      if (filledSummary.length > 0) {
        promptText += `Tôi đã nhận diện được:\n${filledSummary.join('\n')}\n\n`;
      }
      promptText += `Vui lòng điền đầy đủ các thông tin bên dưới rồi bấm **"Tạo khách hàng"**:`;

      return {
        handled: true,
        action: 'form_collect',
        formAction: 'create_customer',
        formFields,
        response: promptText,
      };
    }

    // Đủ thông tin → Tạo luôn
    const newCustomer = await Customer.create({
      name: custName,
      address: custAddress,
      group: custGroup || 'offset',
      taxCode: custTaxCode || '',
      generalEmail: custEmail || '',
      contacts: [{
        name: custName,
        phone: custPhone,
      }],
    });

    return {
      handled: true,
      action: 'create_customer',
      data: newCustomer,
      response: `👥 **ĐÃ TẠO HỒ SƠ KHÁCH HÀNG MỚI THÀNH CÔNG!**\n\n- 🏢 **Tên:** ${newCustomer.name}\n- 📍 **Địa chỉ:** ${newCustomer.address}\n- 📞 **SĐT:** ${custPhone}\n- 🏷️ **Nhóm:** ${newCustomer.group === 'offset' ? '📄 In giấy' : newCustomer.group === 'garment' ? '👕 In vải' : '🔀 Cả hai'}\n${custTaxCode ? `- 📋 **MST:** ${custTaxCode}\n` : ''}\n*Đã lưu vào [Danh sách Khách hàng](/admin/customerlist).*`,
    };
  }

  // ================================================================
  // 13. Tác vụ: XỬ LÝ FORM DATA TỪ INLINE FORM (UNIVERSAL HANDLER)
  // ================================================================
  if (lower.startsWith('__form_submit__')) {
    try {
      const jsonStr = message.replace('__form_submit__', '').trim();
      const formData = JSON.parse(jsonStr);
      const { _formAction, ...fields } = formData;

      // 13A. Tạo Khách hàng từ form
      if (_formAction === 'create_customer') {
        if (!fields.name || !fields.address || !fields.phone) {
          return { handled: true, action: 'form_error', response: '❌ Vui lòng điền đầy đủ **Tên**, **Địa chỉ** và **SĐT** để tạo khách hàng.' };
        }
        const newCustomer = await Customer.create({
          name: fields.name,
          address: fields.address,
          group: fields.group || 'offset',
          taxCode: fields.taxCode || '',
          generalEmail: fields.email || '',
          contacts: [{ name: fields.name, phone: fields.phone }],
        });
        return {
          handled: true,
          action: 'create_customer',
          data: newCustomer,
          response: `👥 **ĐÃ TẠO HỒ SƠ KHÁCH HÀNG MỚI THÀNH CÔNG!**\n\n- 🏢 **Tên:** ${newCustomer.name}\n- 📍 **Địa chỉ:** ${newCustomer.address}\n- 📞 **SĐT:** ${fields.phone}\n- 🏷️ **Nhóm:** ${newCustomer.group === 'offset' ? '📄 In giấy' : newCustomer.group === 'garment' ? '👕 In vải' : '🔀 Cả hai'}\n${fields.taxCode ? `- 📋 **MST:** ${fields.taxCode}\n` : ''}\n*Đã lưu vào [Danh sách Khách hàng](/admin/customerlist).*`,
        };
      }

      // 13B. Lập phiếu Thu/Chi từ form
      if (_formAction === 'create_finance_voucher') {
        if (!fields.type || !fields.amount || !fields.cashBookId) {
          return { handled: true, action: 'form_error', response: '❌ Vui lòng điền đầy đủ **Loại phiếu**, **Số tiền** và **Tài khoản/Quỹ**.' };
        }

        const amount = parseFloat(String(fields.amount).replace(/[.,]/g, ''));
        const cashBook = await CashBook.findById(fields.cashBookId);
        if (!cashBook) {
          return { handled: true, action: 'form_error', response: '❌ Không tìm thấy tài khoản/quỹ đã chọn.' };
        }

        // Tìm category nếu có
        let categoryId = null;
        if (fields.categoryId) {
          categoryId = fields.categoryId;
        }

        // Tạo mã phiếu tự động
        const now = new Date();
        const prefix = fields.type === 'income' ? 'PT' : 'PC';
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(100 + Math.random() * 900);
        const voucherNo = `${prefix}-${dateStr}-${randomSuffix}`;

        const voucher = await FinanceVoucher.create({
          voucherNo,
          type: fields.type,
          amount,
          fromAccountId: cashBook._id,
          categoryId: categoryId || undefined,
          counterpartyNameSnapshot: fields.counterpartyName || '',
          notes: fields.notes || `Tạo bởi AI Agent`,
          transactionDate: now,
          createdBy: user?._id,
        });

        // Cập nhật số dư tài khoản
        if (fields.type === 'income') {
          cashBook.currentBalance = (cashBook.currentBalance || 0) + amount;
        } else {
          cashBook.currentBalance = (cashBook.currentBalance || 0) - amount;
        }
        await cashBook.save();

        const typeLabel = fields.type === 'income' ? '📥 PHIẾU THU' : '📤 PHIẾU CHI';
        return {
          handled: true,
          action: 'create_finance_voucher',
          data: voucher,
          response: `✅ **ĐÃ TẠO ${typeLabel} THÀNH CÔNG!**\n\n- 📄 **Mã phiếu:** \`${voucher.voucherNo}\`\n- 💰 **Số tiền:** **${amount.toLocaleString('vi-VN')} VNĐ**\n- 🏦 **Tài khoản:** ${cashBook.name}\n- 👤 **Đối tác:** ${fields.counterpartyName || 'Không chỉ định'}\n- 📝 **Ghi chú:** ${fields.notes || '—'}\n- 💵 **Số dư sau GD:** **${cashBook.currentBalance.toLocaleString('vi-VN')} VNĐ**\n\n*Đã cập nhật vào [Sổ Quỹ & Dòng tiền](/admin/finance).*`,
        };
      }

      // 13C. Tạo Bảng Báo Giá từ form
      if (_formAction === 'create_quotation') {
        if (!fields.customerName) {
          return { handled: true, action: 'form_error', response: '❌ Vui lòng nhập **Tên khách hàng** để tạo báo giá.' };
        }

        const items = [];
        if (fields.style || fields.quantity || fields.unitPrice) {
          const qty = parseInt(String(fields.quantity || '0').replace(/[.,]/g, ''), 10) || 0;
          const price = parseInt(String(fields.unitPrice || '0').replace(/[.,]/g, ''), 10) || 0;
          items.push({
            style: fields.style || '',
            printTechnique: fields.printTechnique || '',
            priceTiers: qty > 0 || price > 0 ? [{ quantity: qty, unitPrice: price }] : [],
            note: fields.note || '',
          });
        }

        const newQuotation = await Quotation.create({
          customerName: fields.customerName,
          items: items.length > 0 ? items : [],
          grandTotal: items.length > 0 ? (items[0].priceTiers?.[0]?.quantity || 0) * (items[0].priceTiers?.[0]?.unitPrice || 0) : 0,
          createdBy: user?._id,
          status: 'draft',
        });

        return {
          handled: true,
          action: 'create_quotation',
          data: newQuotation,
          response: `📋 **ĐÃ TẠO BẢNG BÁO GIÁ MỚI THÀNH CÔNG!**\n\n- 📄 **Mã BG:** \`${newQuotation.quotationCode}\`\n- 🏢 **Khách hàng:** ${newQuotation.customerName}\n- 📦 **Số hạng mục:** ${newQuotation.items.length} sản phẩm\n- 💰 **Tổng giá trị:** ${newQuotation.grandTotal.toLocaleString('vi-VN')} VNĐ\n- 📊 **Trạng thái:** Bản nháp (Draft)\n\n*Xem và chỉnh sửa chi tiết tại [Bảng Báo Giá](/admin/quotations).*`,
        };
      }

      return { handled: true, action: 'form_error', response: '❌ Không nhận diện được loại form. Vui lòng thử lại.' };
    } catch (parseErr) {
      console.error('Form parse error:', parseErr);
      return { handled: true, action: 'form_error', response: '❌ Lỗi xử lý dữ liệu form: ' + parseErr.message };
    }
  }

  // ================================================================
  // 14. Tác vụ: LẬP PHIẾU THU / CHI (INTERACTIVE FORM)
  // ================================================================
  if (lower.startsWith('lập phiếu thu') || lower.startsWith('lập phiếu chi') || lower.startsWith('tạo phiếu thu') || lower.startsWith('tạo phiếu chi') || lower.startsWith('thu tiền') || lower.startsWith('chi tiền')) {
    const isIncome = lower.includes('thu');
    const typeLabel = isIncome ? 'Thu' : 'Chi';
    const typeVal = isIncome ? 'income' : 'expense';

    // Bóc tách số tiền
    let amount = 0;
    const amtMatch = message.match(/(\d+(?:[.,]\d+)?)\s*(?:triệu|tr|trieu)/i);
    if (amtMatch) {
      amount = parseFloat(amtMatch[1].replace(',', '.')) * 1000000;
    } else {
      const amtMatch2 = message.match(/(\d{1,3}(?:[.,]\d{3})*(?:\d+)?)\s*(?:đ|đồng|vnd)?/i);
      if (amtMatch2) {
        const numStr = amtMatch2[1].replace(/[.,]/g, '');
        if (parseInt(numStr, 10) >= 10000) amount = parseInt(numStr, 10);
      }
    }

    // Bóc tách đối tác
    let counterpartyName = '';
    const cpMatch = message.match(/(?:từ khách|khách hàng|khách|cho ncc|ncc|từ|cho)\s+([a-zA-ZÀ-ỹ0-9\s]+?)(?:\||,|\.|vào|qua|tài khoản|quỹ|$)/i);
    if (cpMatch) counterpartyName = cpMatch[1].trim();

    // Bóc tách tài khoản
    let cashBookName = '';
    const accMatch = message.match(/(?:vào|qua|từ|tài khoản|quỹ|tk)\s+([a-zA-ZÀ-ỹ0-9\s]+?)(?:\||,|\.|danh mục|$)/i);
    if (accMatch) cashBookName = accMatch[1].trim();

    // Lấy danh sách CashBook để render trong form select
    const cashBooks = await CashBook.find({ isActive: true }).lean().catch(() => []);
    const categories = await FinanceCategory.find({ direction: typeVal, isActive: true }).lean().catch(() => []);

    // Nếu đủ thông tin cơ bản (amount + cashbook) → thử tạo trực tiếp
    let matchedCashBook = null;
    if (cashBookName) {
      matchedCashBook = cashBooks.find(cb => cb.name.toLowerCase().includes(cashBookName.toLowerCase()));
    }

    if (amount > 0 && matchedCashBook) {
      // Tạo trực tiếp
      const now = new Date();
      const prefix = isIncome ? 'PT' : 'PC';
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const voucherNo = `${prefix}-${dateStr}-${randomSuffix}`;

      const voucher = await FinanceVoucher.create({
        voucherNo,
        type: typeVal,
        amount,
        fromAccountId: matchedCashBook._id,
        counterpartyNameSnapshot: counterpartyName || '',
        notes: `Tạo bởi AI Agent: ${message}`,
        transactionDate: now,
        createdBy: user?._id,
      });

      if (isIncome) {
        matchedCashBook.currentBalance = (matchedCashBook.currentBalance || 0) + amount;
      } else {
        matchedCashBook.currentBalance = (matchedCashBook.currentBalance || 0) - amount;
      }
      await CashBook.findByIdAndUpdate(matchedCashBook._id, { currentBalance: matchedCashBook.currentBalance });

      return {
        handled: true,
        action: 'create_finance_voucher',
        data: voucher,
        response: `✅ **ĐÃ TẠO PHIẾU ${typeLabel.toUpperCase()} THÀNH CÔNG!**\n\n- 📄 **Mã phiếu:** \`${voucher.voucherNo}\`\n- 💰 **Số tiền:** **${amount.toLocaleString('vi-VN')} VNĐ**\n- 🏦 **Tài khoản:** ${matchedCashBook.name}\n- 👤 **Đối tác:** ${counterpartyName || 'Không chỉ định'}\n- 💵 **Số dư sau GD:** **${matchedCashBook.currentBalance.toLocaleString('vi-VN')} VNĐ**\n\n*Đã cập nhật vào [Sổ Quỹ & Dòng tiền](/admin/finance).*`,
      };
    }

    // Thiếu thông tin → Trả inline form
    const formFields = [
      { key: 'type', label: '📋 Loại phiếu', type: 'select', required: true, value: typeVal, options: [
        { value: 'income', label: '📥 Phiếu Thu (Tiền vào)' },
        { value: 'expense', label: '📤 Phiếu Chi (Tiền ra)' },
      ]},
      { key: 'amount', label: '💰 Số tiền (VNĐ)', type: 'number', required: true, value: amount > 0 ? String(amount) : '', placeholder: 'VD: 15000000' },
      { key: 'cashBookId', label: '🏦 Tài khoản / Quỹ', type: 'select', required: true, value: '', options: cashBooks.map(cb => ({
        value: cb._id.toString(),
        label: `${cb.type === 'bank' ? '🏦' : '💵'} ${cb.name} (${(cb.currentBalance || 0).toLocaleString('vi-VN')}đ)`,
      }))},
      { key: 'categoryId', label: '📂 Danh mục', type: 'select', required: false, value: '', options: [
        { value: '', label: '— Không chọn —' },
        ...categories.map(c => ({ value: c._id.toString(), label: c.name })),
      ]},
      { key: 'counterpartyName', label: '👤 Đối tác (Khách/NCC)', type: 'text', required: false, value: counterpartyName || '', placeholder: 'VD: Công ty Bao Bì Việt' },
      { key: 'notes', label: '📝 Ghi chú', type: 'text', required: false, value: '', placeholder: 'Nội dung phiếu thu/chi' },
    ];

    const filledInfo = [];
    if (amount > 0) filledInfo.push(`✅ **Số tiền:** ${amount.toLocaleString('vi-VN')} VNĐ`);
    if (counterpartyName) filledInfo.push(`✅ **Đối tác:** ${counterpartyName}`);

    let promptText = `📝 **LẬP PHIẾU ${typeLabel.toUpperCase()} MỚI**\n\n`;
    if (filledInfo.length > 0) {
      promptText += `Tôi đã nhận diện:\n${filledInfo.join('\n')}\n\n`;
    }
    promptText += `Vui lòng điền đầy đủ thông tin bên dưới rồi bấm **"Tạo phiếu ${typeLabel}"**:`;

    return {
      handled: true,
      action: 'form_collect',
      formAction: 'create_finance_voucher',
      formFields,
      response: promptText,
    };
  }

  // ================================================================
  // 15. Tác vụ: GHI NHẬN THANH TOÁN CÔNG NỢ PHẢI THU (RECEIVABLE PAYMENT)
  // ================================================================
  if ((lower.includes('thanh toán') || lower.includes('trả tiền') || lower.includes('trả nợ') || lower.includes('thu nợ')) && (lower.includes('khách') || lower.includes('phải thu'))) {
    // Bóc tách tên khách hàng
    const custMatch = message.match(/(?:khách hàng|khách|từ)\s+([a-zA-ZÀ-ỹ0-9\s]+?)(?:\s+thanh toán|\s+trả|\s+số|\s+\d|$)/i);
    const custName = custMatch ? custMatch[1].trim() : '';

    // Bóc tách số tiền
    let payAmount = 0;
    const payAmtMatch = message.match(/(\d+(?:[.,]\d+)?)\s*(?:triệu|tr)/i);
    if (payAmtMatch) {
      payAmount = parseFloat(payAmtMatch[1].replace(',', '.')) * 1000000;
    } else {
      const payAmtMatch2 = message.match(/(\d{1,3}(?:[.,]\d{3})*(?:\d+)?)\s*(?:đ|đồng|vnd)?/i);
      if (payAmtMatch2) {
        const numStr = payAmtMatch2[1].replace(/[.,]/g, '');
        if (parseInt(numStr, 10) >= 10000) payAmount = parseInt(numStr, 10);
      }
    }

    if (custName.length >= 2 && payAmount > 0) {
      // Tìm khoản phải thu
      const receivable = await Receivable.findOne({
        customerName: { $regex: custName, $options: 'i' },
        status: { $ne: 'paid' },
      }).sort({ outstandingAmount: -1 });

      if (receivable) {
        const oldPaid = receivable.paidAmount || 0;
        receivable.paidAmount = oldPaid + payAmount;
        await receivable.save(); // pre('save') tự tính lại outstandingAmount & status

        return {
          handled: true,
          action: 'receivable_payment',
          data: receivable,
          response: `✅ **ĐÃ GHI NHẬN THANH TOÁN CÔNG NỢ PHẢI THU!**\n\n- 🏢 **Khách hàng:** ${receivable.customerName}\n- 💰 **Số tiền thanh toán:** **${payAmount.toLocaleString('vi-VN')} VNĐ**\n- 📊 **Đã thanh toán tổng:** ${receivable.paidAmount.toLocaleString('vi-VN')} / ${receivable.totalAmount.toLocaleString('vi-VN')} VNĐ\n- 💸 **Còn nợ lại:** **${receivable.outstandingAmount.toLocaleString('vi-VN')} VNĐ**\n- 📋 **Trạng thái:** ${receivable.status === 'paid' ? '🟢 Đã thanh toán đủ' : '🟡 Thanh toán một phần'}\n\n*Đã cập nhật vào [Công nợ Phải thu](/admin/finance).*`,
        };
      } else {
        return {
          handled: true,
          action: 'receivable_not_found',
          response: `⚠️ Không tìm thấy khoản công nợ phải thu của khách hàng **"${custName}"** đang còn nợ.\n\nVui lòng kiểm tra lại tên khách hàng hoặc xem danh sách tại [Công nợ Phải thu](/admin/finance).`,
        };
      }
    }
  }

  // ================================================================
  // 16. Tác vụ: THANH TOÁN CÔNG NỢ PHẢI TRẢ (PAYABLE PAYMENT)
  // ================================================================
  if ((lower.includes('trả tiền ncc') || lower.includes('thanh toán ncc') || lower.includes('trả nợ ncc') || lower.includes('trả tiền nhà cung cấp') || lower.includes('thanh toán cho ncc')) && !lower.includes('khách')) {
    const suppMatch = message.match(/(?:ncc|nhà cung cấp)\s+([a-zA-ZÀ-ỹ0-9\s]+?)(?:\s+số|\s+\d|$)/i);
    const suppName = suppMatch ? suppMatch[1].trim() : '';

    let payAmount = 0;
    const payAmtMatch = message.match(/(\d+(?:[.,]\d+)?)\s*(?:triệu|tr)/i);
    if (payAmtMatch) {
      payAmount = parseFloat(payAmtMatch[1].replace(',', '.')) * 1000000;
    } else {
      const payAmtMatch2 = message.match(/(\d{1,3}(?:[.,]\d{3})*(?:\d+)?)\s*(?:đ|đồng|vnd)?/i);
      if (payAmtMatch2) {
        const numStr = payAmtMatch2[1].replace(/[.,]/g, '');
        if (parseInt(numStr, 10) >= 10000) payAmount = parseInt(numStr, 10);
      }
    }

    if (suppName.length >= 2 && payAmount > 0) {
      const payable = await Payable.findOne({
        supplierName: { $regex: suppName, $options: 'i' },
        status: { $ne: 'paid' },
      }).sort({ outstandingAmount: -1 });

      if (payable) {
        const oldPaid = payable.paidAmount || 0;
        payable.paidAmount = oldPaid + payAmount;
        await payable.save();

        return {
          handled: true,
          action: 'payable_payment',
          data: payable,
          response: `✅ **ĐÃ GHI NHẬN THANH TOÁN CHO NHÀ CUNG CẤP!**\n\n- 🏭 **NCC:** ${payable.supplierName}\n- 💰 **Số tiền thanh toán:** **${payAmount.toLocaleString('vi-VN')} VNĐ**\n- 📊 **Đã trả tổng:** ${payable.paidAmount.toLocaleString('vi-VN')} / ${payable.totalAmount.toLocaleString('vi-VN')} VNĐ\n- 💸 **Còn phải trả:** **${payable.outstandingAmount.toLocaleString('vi-VN')} VNĐ**\n- 📋 **Trạng thái:** ${payable.status === 'paid' ? '🟢 Đã thanh toán đủ' : '🟡 Thanh toán một phần'}\n\n*Đã cập nhật vào [Công nợ Phải trả](/admin/finance).*`,
        };
      } else {
        return {
          handled: true,
          action: 'payable_not_found',
          response: `⚠️ Không tìm thấy khoản công nợ phải trả cho NCC **"${suppName}"** đang còn nợ.\n\nVui lòng kiểm tra lại tên NCC hoặc xem danh sách tại [Công nợ Phải trả](/admin/finance).`,
        };
      }
    }
  }

  // ================================================================
  // 17. Tác vụ: TẠO BẢNG BÁO GIÁ (QUOTATION) — INTERACTIVE FORM
  // ================================================================
  if (lower.startsWith('tạo báo giá') || lower.startsWith('lập báo giá') || lower.startsWith('tạo bảng báo giá') || lower.startsWith('lập bảng báo giá')) {
    const rawBG = message.replace(/^(tạo bảng báo giá|lập bảng báo giá|tạo báo giá|lập báo giá)[:\s]*/i, '').trim();

    let customerName = '';
    let style = '';
    let quantity = '';
    let unitPrice = '';
    let printTechnique = '';

    if (rawBG.includes('|')) {
      const parts = rawBG.split('|').map(p => p.trim());
      parts.forEach(part => {
        const pLower = part.toLowerCase();
        if (pLower.startsWith('khách:') || pLower.startsWith('kh:')) {
          customerName = part.replace(/^(khách|kh)[:\s]*/i, '').trim();
        } else if (pLower.startsWith('mã:') || pLower.startsWith('mã hàng:') || pLower.startsWith('style:')) {
          style = part.replace(/^(mã|mã hàng|style)[:\s]*/i, '').trim();
        } else if (pLower.startsWith('sl:') || pLower.startsWith('số lượng:')) {
          quantity = part.replace(/^(sl|số lượng)[:\s]*/i, '').trim();
        } else if (pLower.startsWith('giá:') || pLower.startsWith('đơn giá:')) {
          unitPrice = part.replace(/^(giá|đơn giá)[:\s]*/i, '').trim();
        } else if (pLower.startsWith('in:') || pLower.startsWith('kỹ thuật:')) {
          printTechnique = part.replace(/^(in|kỹ thuật)[:\s]*/i, '').trim();
        } else if (!customerName) {
          customerName = part;
        }
      });
    } else {
      // Trích xuất từ câu tự nhiên
      const custMatch = rawBG.match(/(?:cho khách|khách hàng|khách|cho)\s+([a-zA-ZÀ-ỹ0-9\s]+?)(?:\s+mã|\s+in\s|\s+\d|:|$)/i);
      if (custMatch) customerName = custMatch[1].trim();
      else customerName = rawBG.split(/[,|]/)[0]?.trim() || '';

      const qtyMatch = rawBG.match(/(\d+(?:[.,]\d+)?)\s*(?:cái|hộp|tờ|cuốn|bộ|sp|sản phẩm|pcs)/i);
      if (qtyMatch) quantity = qtyMatch[1];

      const priceMatch = rawBG.match(/(?:đơn giá|giá)\s*(\d+(?:[.,]\d+)?)\s*(?:đ|đồng|vnd)?/i);
      if (priceMatch) unitPrice = priceMatch[1];

      if (lower.includes('in offset') || lower.includes('offset')) printTechnique = 'In Offset';
      else if (lower.includes('in lụa') || lower.includes('lụa') || lower.includes('silk')) printTechnique = 'In Lụa';
      else if (lower.includes('kỹ thuật số') || lower.includes('digital')) printTechnique = 'In Kỹ thuật số';
    }

    // Kiểm tra đủ thông tin tối thiểu chưa
    if (!customerName || customerName.length < 2) {
      const formFields = [
        { key: 'customerName', label: '🏢 Tên khách hàng', type: 'text', required: true, value: customerName || '', placeholder: 'VD: Công ty Dược Phẩm Huế' },
        { key: 'style', label: '🏷️ Mã hàng / Style', type: 'text', required: false, value: style || '', placeholder: 'VD: AA-123' },
        { key: 'printTechnique', label: '🖨️ Kỹ thuật in', type: 'select', required: false, value: printTechnique || '', options: [
          { value: '', label: '— Chưa chọn —' },
          { value: 'In Offset', label: '🖨️ In Offset' },
          { value: 'In Lụa', label: '🎨 In Lụa (Silk Screen)' },
          { value: 'In Kỹ thuật số', label: '💻 In Kỹ thuật số (Digital)' },
        ]},
        { key: 'quantity', label: '📦 Số lượng', type: 'number', required: false, value: quantity || '', placeholder: 'VD: 10000' },
        { key: 'unitPrice', label: '💰 Đơn giá (VNĐ)', type: 'number', required: false, value: unitPrice || '', placeholder: 'VD: 450' },
        { key: 'note', label: '📝 Ghi chú', type: 'text', required: false, value: '', placeholder: 'Quy cách, kích thước...' },
      ];

      return {
        handled: true,
        action: 'form_collect',
        formAction: 'create_quotation',
        formFields,
        response: `📋 **TẠO BẢNG BÁO GIÁ MỚI**\n\nVui lòng điền thông tin sản phẩm bên dưới rồi bấm **"Tạo báo giá"**:`,
      };
    }

    // Đủ khách hàng → Tạo luôn
    const items = [];
    if (style || quantity || unitPrice) {
      const qty = parseInt(String(quantity || '0').replace(/[.,]/g, ''), 10) || 0;
      const price = parseInt(String(unitPrice || '0').replace(/[.,]/g, ''), 10) || 0;
      items.push({
        style: style || '',
        printTechnique: printTechnique || '',
        priceTiers: qty > 0 || price > 0 ? [{ quantity: qty, unitPrice: price }] : [],
      });
    }

    const newQuotation = await Quotation.create({
      customerName,
      items,
      grandTotal: items.length > 0 ? (items[0].priceTiers?.[0]?.quantity || 0) * (items[0].priceTiers?.[0]?.unitPrice || 0) : 0,
      createdBy: user?._id,
      status: 'draft',
    });

    return {
      handled: true,
      action: 'create_quotation',
      data: newQuotation,
      response: `📋 **ĐÃ TẠO BẢNG BÁO GIÁ MỚI THÀNH CÔNG!**\n\n- 📄 **Mã BG:** \`${newQuotation.quotationCode}\`\n- 🏢 **Khách hàng:** ${newQuotation.customerName}\n- 📦 **Số hạng mục:** ${newQuotation.items.length} sản phẩm\n- 💰 **Tổng giá trị:** ${newQuotation.grandTotal.toLocaleString('vi-VN')} VNĐ\n- 📊 **Trạng thái:** Bản nháp (Draft)\n\n*Xem và chỉnh sửa chi tiết tại [Bảng Báo Giá](/admin/quotations).*`,
    };
  }

  // ================================================================
  // 18. Tác vụ: ĐỔI TRẠNG THÁI YÊU CẦU BÁO GIÁ WEBSITE
  // ================================================================
  if (lower.includes('đã liên hệ') && (lower.includes('báo giá') || lower.includes('bg') || lower.includes('quote'))) {
    const custMatch = message.match(/(?:khách|cho|với)\s+([a-zA-ZÀ-ỹ0-9\s]+?)(?:\.|,|$)/i);
    const custName = custMatch ? custMatch[1].trim() : '';

    if (custName.length >= 2) {
      const quote = await Quote.findOne({
        name: { $regex: custName, $options: 'i' },
        status: { $ne: 'Done' },
      }).sort({ createdAt: -1 });

      if (quote) {
        quote.status = 'Contacted';
        await quote.save();

        return {
          handled: true,
          action: 'update_quote_status',
          data: quote,
          response: `✅ **Đã cập nhật trạng thái yêu cầu báo giá:**\n\n- 👤 **Khách hàng:** ${quote.name}\n- 📞 **SĐT:** ${quote.phone}\n- 📦 **Sản phẩm:** ${quote.productName || '—'}\n- 📊 **Trạng thái:** Mới → **Đã liên hệ** ✅\n\n*Đã cập nhật tại [Yêu cầu Báo giá](/admin/quotes).*`,
        };
      }
    }
  }

  // ================================================================
  // 19. Tác vụ: TRA CỨU LỊCH SỬ & CÔNG NỢ KHÁCH HÀNG
  // ================================================================
  if (lower.includes('lịch sử khách') || lower.includes('tra cứu khách') || lower.includes('thông tin khách') || (lower.includes('khách hàng') && lower.includes('chi tiết'))) {
    const custMatch = message.match(/(?:khách hàng|khách)\s+([a-zA-ZÀ-ỹ0-9\s]+?)(?:\.|,|$)/i);
    const custName = custMatch ? custMatch[1].trim() : '';

    if (custName.length >= 2) {
      const customer = await Customer.findOne({
        name: { $regex: custName, $options: 'i' },
      });

      if (customer) {
        // Tìm công nợ liên quan
        const receivables = await Receivable.find({
          customerName: { $regex: custName, $options: 'i' },
        }).sort({ createdAt: -1 }).limit(5).lean().catch(() => []);

        const totalDebt = receivables.reduce((sum, r) => sum + (r.outstandingAmount || 0), 0);
        const totalRevenue = receivables.reduce((sum, r) => sum + (r.totalAmount || 0), 0);

        let reply = `👤 **THÔNG TIN CHI TIẾT KHÁCH HÀNG:**\n\n`;
        reply += `- 🏢 **Tên:** ${customer.name}\n`;
        reply += `- 📍 **Địa chỉ:** ${customer.address || 'Chưa cập nhật'}\n`;
        reply += `- 🏷️ **Nhóm:** ${customer.group === 'offset' ? '📄 In giấy' : customer.group === 'garment' ? '👕 In vải' : '🔀 Cả hai'}\n`;
        if (customer.contacts?.length > 0) {
          reply += `- 📞 **Liên hệ:** ${customer.contacts[0].name} — ${customer.contacts[0].phone}\n`;
        }
        reply += `\n💰 **Tổng quan Công nợ & Doanh số:**\n`;
        reply += `- Tổng doanh số: **${totalRevenue.toLocaleString('vi-VN')} VNĐ** (${receivables.length} khoản)\n`;
        reply += `- Còn nợ: **${totalDebt.toLocaleString('vi-VN')} VNĐ**\n`;

        if (receivables.length > 0) {
          reply += `\n📋 **Các khoản phải thu gần đây:**\n`;
          receivables.forEach((r, i) => {
            reply += `${i + 1}. \`${r.documentCode || '—'}\` — Tổng: ${(r.totalAmount || 0).toLocaleString('vi-VN')}đ | Nợ: **${(r.outstandingAmount || 0).toLocaleString('vi-VN')}đ** (${r.status})\n`;
          });
        }

        return {
          handled: true,
          action: 'customer_lookup',
          data: { customer, receivables },
          response: reply,
        };
      } else {
        return {
          handled: true,
          action: 'customer_not_found',
          response: `⚠️ Không tìm thấy khách hàng **"${custName}"** trong danh bạ.\n\nBạn có muốn tôi **thêm khách hàng mới**? Hãy nói: *"Thêm khách hàng ${custName}"*`,
        };
      }
    }
  }

  // ================================================================
  // 20. Tác vụ: CẬP NHẬT THÔNG TIN KHÁCH HÀNG
  // ================================================================
  if ((lower.includes('đổi sđt khách') || lower.includes('cập nhật sđt khách') || lower.includes('đổi số điện thoại khách') || lower.includes('đổi địa chỉ khách') || lower.includes('cập nhật địa chỉ khách'))) {
    const custMatch = message.match(/(?:khách hàng|khách)\s+([a-zA-ZÀ-ỹ0-9\s]+?)(?:\s+thành|\s+sang|\s+là|\s+:\s*)/i);
    const custName = custMatch ? custMatch[1].trim() : '';
    const newValue = message.match(/(?:thành|sang|là|:\s*)\s*(.+)$/i);
    const value = newValue ? newValue[1].trim() : '';

    if (custName.length >= 2 && value) {
      const customer = await Customer.findOne({
        name: { $regex: custName, $options: 'i' },
      });

      if (customer) {
        if (lower.includes('địa chỉ')) {
          customer.address = value;
          await customer.save();
          return {
            handled: true,
            action: 'update_customer',
            data: customer,
            response: `✅ **Đã cập nhật địa chỉ khách hàng:**\n- 🏢 **Khách:** ${customer.name}\n- 📍 **Địa chỉ mới:** ${value}\n\n*Đã lưu vào [Danh sách Khách hàng](/admin/customerlist).*`,
          };
        } else {
          // Cập nhật SĐT
          const phoneVal = value.match(/(0\d{9,10})/) ? value.match(/(0\d{9,10})/)[1] : value;
          if (customer.contacts?.length > 0) {
            customer.contacts[0].phone = phoneVal;
          } else {
            customer.contacts = [{ name: customer.name, phone: phoneVal }];
          }
          await customer.save();
          return {
            handled: true,
            action: 'update_customer',
            data: customer,
            response: `✅ **Đã cập nhật SĐT khách hàng:**\n- 🏢 **Khách:** ${customer.name}\n- 📞 **SĐT mới:** ${phoneVal}\n\n*Đã lưu vào [Danh sách Khách hàng](/admin/customerlist).*`,
          };
        }
      } else {
        return {
          handled: true,
          action: 'customer_not_found',
          response: `⚠️ Không tìm thấy khách hàng **"${custName}"** trong danh bạ.`,
        };
      }
    }
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
        formFields: actionResult.formFields || null,
        formAction: actionResult.formAction || null,
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

QUY TẮC TRẢ LỜI & XỬ LÝ AGENT:
1. Trả lời bằng tiếng Việt tự nhiên, lịch sự, chuyên nghiệp, súc tích và có định dạng Markdown đẹp mắt (dùng gạch đầu dòng, in đậm số liệu, emoji phù hợp).
2. Khi người dùng hỏi về số liệu, hãy dùng chính xác số liệu trong Database ở trên.
3. QUY TRÌNH HỖ TRỢ TẠO CÔNG VIỆC (TODO):
   - Khi người dùng muốn tạo việc mới (ví dụ: "Sáng mai 8h kiểm tra máy in"), hãy:
     a) Bóc tách các thông tin đã có (Tiêu đề: Kiểm tra máy in, Hạn chót: 8h sáng mai, Phân loại: Sản xuất).
     b) Hỏi lịch sự người dùng có muốn bổ sung thêm các thông tin còn thiếu trong Modal Todo không:
        * 🏷️ Mức độ ưu tiên: Khẩn cấp 🔥 / Cao 🔶 / Trung bình 🔵 / Thấp ⚪ (Mặc định: Trung bình)
        * 📂 Phân loại danh mục: Sản xuất 🏭 / Mua hàng 🛒 / Tài chính 💰 / Chung 📋 (Mặc định: Tự động nhận diện)
        * 👤 Người phụ trách: Gán cho ai?
     c) Hoặc hướng dẫn người dùng cú pháp tạo nhanh đầy đủ: "Tạo task: [Tiêu đề] | Hạn: [Giờ/Ngày] | Ưu tiên: [Cao/Gấp] | Phụ trách: [Tên]" để AI lập tức tạo bản ghi vào hệ thống.
4. CÁC HÀNH ĐỘNG HỆ THỐNG TRỰC TIẾP KHÁC:
   - Hoàn thành việc: "Xong task [Tên việc]" hoặc "Xóa task [Tên việc]"
   - Đặt mua NVL: "Đặt 50 ram giấy Couche 250 từ [Tên NCC]"
   - Xác nhận hàng về: "Đơn [Tên vật tư] đã về" (AI tự động cộng kho)
   - Lập Lệnh sản xuất: "Tạo lệnh sản xuất [Số lượng] [Tên sản phẩm] in offset / in lụa"
   - Xuất / Nhập kho: "Xuất 10 ram Couche 300", "Nhập 20 ram Ivory 350"
   - Thêm khách hàng: "Thêm KH: [Tên] | ĐC: [Địa chỉ] | SĐT: [Số] | Nhóm: offset" (Nếu thiếu thông tin → AI hiện form điền)
   - Báo cáo xưởng: "Tóm tắt hôm nay"
   - Hồ sơ & Quyền hạn: "Hồ sơ của tôi", "Cập nhật SĐT [Số ĐT]"
5. NHÓM 2 - KINH DOANH & TÀI CHÍNH:
   - Lập phiếu thu/chi: "Lập phiếu thu 15 triệu từ khách [Tên] vào quỹ tiền mặt" (Nếu thiếu → AI hiện form điền)
   - Thanh toán công nợ: "Khách [Tên] thanh toán 20 triệu" hoặc "Trả tiền NCC [Tên] 10 triệu"
   - Tạo báo giá: "Tạo báo giá cho khách [Tên KH]: mã [Style] in offset 10000 cái giá 450đ" (Nếu thiếu → AI hiện form điền)
   - Đổi TT yêu cầu BG: "Đã liên hệ báo giá cho khách [Tên]"
   - Tra cứu KH: "Lịch sử khách hàng [Tên]" hoặc "Thông tin khách [Tên]"
   - Cập nhật KH: "Đổi SĐT khách [Tên] thành [Số mới]" hoặc "Đổi địa chỉ khách [Tên] thành [Địa chỉ mới]"
6. Trả lời trực tiếp vào vấn đề, súc tích, không dài dòng.`;

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
