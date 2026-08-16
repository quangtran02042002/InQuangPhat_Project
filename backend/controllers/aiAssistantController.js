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

  // 2. Tác vụ: XUẤT KHO / TRỪ TỒN KHO VẬT TƯ
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

  // 3. Tác vụ: NHẬP KHO / CỘNG TỒN KHO VẬT TƯ
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

  // 4. Tác vụ: TẠO ĐƠN ĐẶT NGUYÊN VẬT LIỆU
  if (lower.startsWith('đặt nvl') || lower.startsWith('tạo đơn đặt') || lower.startsWith('đặt hàng nvl') || lower.startsWith('mua nvl')) {
    const orderText = message.replace(/^(đặt nvl|tạo đơn đặt|đặt hàng nvl|mua nvl)[:\s]*/i, '').trim();
    const qtyMatch = orderText.match(/(\d+(?:\.\d+)?)/);
    const qty = qtyMatch ? parseFloat(qtyMatch[1]) : 10;
    
    // Tìm tên vật tư
    let matName = orderText.replace(/(\d+(?:\.\d+)?)\s*(ram|kg|thùng|hộp|cuộn)?/i, '').trim();
    if (!matName) matName = 'Vật tư theo yêu cầu';

    const newOrder = await MaterialOrder.create({
      materialName: matName,
      materialUnit: 'Ram',
      quantity: qty,
      supplier: 'NCC Chỉ định',
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
      response: `🛒 **Đã lên đơn đặt hàng NVL mới:**\n- **Mã đơn:** \`${newOrder.orderCode || 'Đang tạo'}\`\n- **Vật tư:** ${newOrder.materialName}\n- **Số lượng đặt:** ${newOrder.quantity} ${newOrder.materialUnit}\n- **Trạng thái:** Đã đặt hàng (Chờ hàng về)\n\n*Khi hàng về kho, bạn có thể tick xác nhận tại trang [Đặt Nguyên vật liệu](/admin/tasks) để tự động cộng vào kho.*`,
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
3. Nếu người dùng muốn xuất kho, nhập kho, tạo task hoặc đặt hàng NVL, hãy nhắc nhở cú pháp ngắn gọn (ví dụ: "Tạo task: ...", "Xuất 10 ram Couche 300").
4. Trả lời trực tiếp vào vấn đề, không dài dòng.`;

        // Thử model gemini-1.5-pro, nếu lỗi thử tiếp gemini-1.5-flash
        const modelsToTry = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash'];
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
                maxOutputTokens: 1200,
              },
            };

            const response = await axios.post(endpoint, payload, { timeout: 10000 });
            if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
              geminiResponseText = response.data.candidates[0].content.parts[0].text;
              return res.json({
                reply: geminiResponseText,
                engine: `gemini (${model})`,
              });
            }
          } catch (modelErr) {
            console.warn(`Gemini model ${model} failed, trying next...`, modelErr.message);
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
      engine: 'rule_based_fallback',
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
  const hasGeminiKey = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  res.json({
    status: 'online',
    activeEngine: hasGeminiKey ? 'Google Gemini AI (Model 1.5 Pro / Flash) + Live Database' : 'Rule-based Live DB Engine',
    hasGeminiKey,
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
