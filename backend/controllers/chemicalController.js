const Chemical = require('../models/Chemical');
const ChemicalDispatch = require('../models/ChemicalDispatch');
const createNotification = require('../utils/createNotification');
const sendAlertEmail = require('../utils/sendAlertEmail');
const sendTelegramAlert = require('../utils/sendTelegramAlert');

// =============================================
// KHO TỒN KHO
// =============================================

const getChemicals = async (req, res) => {
    const chemicals = await Chemical.find({}).sort({ createdAt: -1 });
    res.json(chemicals);
};

const createChemical = async (req, res) => {
    try {
        const { name, unit, quantity, minStock, safetyNote, supplier } = req.body;
        
        // Kiểm tra hóa chất trùng tên
        const existingChemical = await Chemical.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
        if (existingChemical) {
            return res.status(400).json({ message: 'Danh mục hóa chất này đã tồn tại! Vui lòng chuyển sang tab "Cấp Phát Hóa Chất" -> "Nhập Kho" để nhập thêm số lượng.' });
        }

        const chemical = new Chemical({ 
            name: name.trim(), 
            unit, 
            quantity: Number(quantity) || 0, 
            minStock, 
            safetyNote, 
            supplier 
        });
        const createdChemical = await chemical.save();

        // Tự động tạo phiếu nhập kho nếu có tồn kho ban đầu
        const initQty = Number(quantity);
        if (initQty > 0) {
            const dispatch = new ChemicalDispatch({
                chemical: createdChemical._id,
                chemicalName: createdChemical.name,
                chemicalUnit: createdChemical.unit,
                type: 'nhap',
                quantity: initQty,
                recipient: 'Hệ thống',
                note: 'Tồn kho ban đầu khi tạo danh mục mới',
                createdBy: 'Admin',
                quantityAfter: initQty,
                status: 'approved', // Tồn kho ban đầu luôn được duyệt
                approvedBy: 'Hệ thống',
                approvedAt: new Date(),
            });
            await dispatch.save();
        }

        res.status(201).json(createdChemical);
    } catch (error) {
        console.error('[createChemical] Lỗi:', error);
        res.status(500).json({ message: 'Lỗi server khi tạo hóa chất' });
    }
};

const updateChemical = async (req, res) => {
    const { quantity } = req.body;
    const chemical = await Chemical.findById(req.params.id);

    if (chemical) {
        chemical.quantity = quantity;
        const updatedChemical = await chemical.save();

        // Cảnh báo nếu sắp hết hóa chất (chỉnh sửa thủ công)
        if (updatedChemical.quantity <= updatedChemical.minStock) {
            await createNotification({
                title: '⚠️ Cảnh báo Kho Hóa Chất',
                message: `Hóa chất ${chemical.name} sắp hết (Còn ${chemical.quantity} ${chemical.unit}).`,
                type: 'stock',
                link: '/admin/chemicals'
            });
        }
        res.json(updatedChemical);
    } else {
        res.status(404);
        throw new Error('Không tìm thấy hóa chất');
    }
};

const deleteChemical = async (req, res) => {
    const chemical = await Chemical.findById(req.params.id);
    if (chemical) {
        await chemical.deleteOne();
        res.json({ message: 'Đã xóa hóa chất' });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy');
    }
};

// =============================================
// CẤP PHÁT (DISPATCH)
// =============================================

/**
 * GET /api/chemicals/dispatches
 * Lấy lịch sử cấp phát hóa chất (có lọc theo chemical ID)
 */
const getDispatches = async (req, res) => {
    try {
        const filter = {};
        if (req.query.chemical) {
            filter.chemical = req.query.chemical;
        }
        const limit = parseInt(req.query.limit) || 100;
        const dispatches = await ChemicalDispatch.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('chemical', 'name unit quantity minStock');
        res.json(dispatches);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tải lịch sử cấp phát', error: error.message });
    }
};

/**
 * POST /api/chemicals/dispatches
 * Tạo phiếu nhập/xuất
 * - NHẬP KHO: Đã được xác nhận qua modal ở frontend → status 'approved', trừ/cộng kho ngay
 * - XUẤT KHO: status 'pending', KHÔNG cộng/trừ kho. Chờ người phụ trách phê duyệt.
 */
const createDispatch = async (req, res) => {
    try {
        const { type, recipient, note, createdBy, items, chemicalId, quantity } = req.body;

        if (!['nhap', 'xuat'].includes(type)) {
            return res.status(400).json({ message: 'Loại phiếu phải là "nhap" hoặc "xuat"' });
        }

        let dispatchList = [];
        if (items && items.length > 0) {
            dispatchList = items;
        } else if (chemicalId && quantity) {
            dispatchList = [{ chemicalId, quantity }];
        } else {
            return res.status(400).json({ message: 'Thiếu thông tin hàng hóa' });
        }

        // Validate tất cả mặt hàng
        const chemicalDocs = [];
        for (const item of dispatchList) {
            if (Number(item.quantity) <= 0) {
                return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
            }
            const chemical = await Chemical.findById(item.chemicalId);
            if (!chemical) {
                return res.status(404).json({ message: `Không tìm thấy hóa chất ID: ${item.chemicalId}` });
            }
            // Kiểm tra tồn kho chỉ với phiếu NHẬP (vì phiếu xuất sẽ kiểm tra lúc duyệt)
            if (type === 'nhap' && Number(item.quantity) <= 0) {
                return res.status(400).json({ message: 'Số lượng nhập phải lớn hơn 0' });
            }
            chemicalDocs.push({ chemical, quantity: Number(item.quantity) });
        }

        // ─────────────────────────────────────────────────────────
        // PHIẾU NHẬP KHO: Đã xác nhận, cộng kho ngay, status = approved
        // ─────────────────────────────────────────────────────────
        if (type === 'nhap') {
            const dispatchItems = [];
            for (const doc of chemicalDocs) {
                const { chemical, quantity } = doc;
                chemical.quantity += quantity;
                await chemical.save();
                dispatchItems.push({
                    chemical: chemical._id,
                    chemicalName: chemical.name,
                    chemicalUnit: chemical.unit,
                    quantity: quantity,
                    quantityAfter: chemical.quantity,
                });
            }

            const dispatch = new ChemicalDispatch({
                type: 'nhap',
                items: dispatchItems,
                recipient: recipient || '',
                note: note || '',
                createdBy: createdBy || 'Admin',
                status: 'approved',
                approvedBy: createdBy || 'Admin',
                approvedAt: new Date(),
            });
            const savedDispatch = await dispatch.save();

            return res.status(201).json({
                dispatches: [savedDispatch],
                isLow: false,
                message: `✅ Nhập kho thành công ${dispatchItems.length} mặt hàng!`,
            });
        }

        // ─────────────────────────────────────────────────────────
        // PHIẾU XUẤT KHO: Lưu với status = pending, CHƯA trừ kho
        // ─────────────────────────────────────────────────────────
        const pendingItems = chemicalDocs.map(({ chemical, quantity }) => ({
            chemical: chemical._id,
            chemicalName: chemical.name,
            chemicalUnit: chemical.unit,
            quantity: quantity,
            quantityAfter: null, // Chưa biết vì chưa trừ
        }));

        const dispatch = new ChemicalDispatch({
            type: 'xuat',
            items: pendingItems,
            recipient: recipient || '',
            note: note || '',
            createdBy: createdBy || 'Admin',
            status: 'pending', // Chờ người phụ trách kho duyệt
        });
        const savedDispatch = await dispatch.save();

        return res.status(201).json({
            dispatches: [savedDispatch],
            isLow: false,
            message: `📋 Đã tạo phiếu yêu cầu xuất kho cho ${pendingItems.length} mặt hàng! Đang chờ người phụ trách phê duyệt.`,
        });

    } catch (error) {
        console.error('[createDispatch] Lỗi:', error);
        res.status(500).json({ message: 'Lỗi khi tạo phiếu cấp phát', error: error.message });
    }
};

/**
 * PATCH /api/chemicals/dispatches/:id/status
 * Phê duyệt hoặc hủy một phiếu xuất kho đang pending
 * - action = 'approve': Kiểm tra tồn kho, nếu đủ thì trừ kho và đổi status → 'approved'
 * - action = 'cancel': Xóa phiếu khỏi database
 */
const updateDispatchStatus = async (req, res) => {
    try {
        const { action } = req.body; // 'approve' | 'cancel'
        const approvedBy = req.user?.name || req.body.approvedBy || 'Admin';

        if (!['approve', 'cancel'].includes(action)) {
            return res.status(400).json({ message: 'Hành động không hợp lệ. Chỉ chấp nhận "approve" hoặc "cancel".' });
        }

        const dispatch = await ChemicalDispatch.findById(req.params.id);
        if (!dispatch) {
            return res.status(404).json({ message: 'Không tìm thấy phiếu' });
        }

        if (dispatch.status !== 'pending') {
            return res.status(400).json({ message: `Phiếu đã ở trạng thái "${dispatch.status}", không thể thay đổi.` });
        }

        // ── HỦY: Xóa phiếu khỏi database ──
        if (action === 'cancel') {
            await dispatch.deleteOne();
            return res.json({ message: 'Đã hủy và xóa phiếu xuất kho.' });
        }

        // ── DUYỆT: Kiểm tra tồn kho, sau đó trừ kho ──
        if (dispatch.type !== 'xuat') {
            return res.status(400).json({ message: 'Chỉ phiếu xuất kho mới cần phê duyệt.' });
        }

        // Bước 1: Kiểm tra TOÀN BỘ tồn kho trước khi thực hiện bất cứ thay đổi nào
        const chemicalDocs = [];
        for (const item of dispatch.items) {
            const chemical = await Chemical.findById(item.chemical);
            if (!chemical) {
                return res.status(404).json({
                    message: `Không tìm thấy hóa chất "${item.chemicalName}" trong kho (có thể đã bị xóa).`
                });
            }
            if (Number(item.quantity) > chemical.quantity) {
                return res.status(400).json({
                    message: `⚠️ Không đủ tồn kho để duyệt! "${chemical.name}" hiện còn ${chemical.quantity} ${chemical.unit}, phiếu yêu cầu ${item.quantity} ${chemical.unit}.`
                });
            }
            chemicalDocs.push({ chemical, quantity: Number(item.quantity) });
        }

        // Bước 2: Tất cả hợp lệ → Thực hiện trừ kho
        const lowStockChemicals = [];
        for (let i = 0; i < chemicalDocs.length; i++) {
            const { chemical, quantity } = chemicalDocs[i];
            chemical.quantity -= quantity;
            await chemical.save();

            // Cập nhật lại quantityAfter trong item của phiếu
            dispatch.items[i].quantityAfter = chemical.quantity;

            if (chemical.quantity <= chemical.minStock) {
                lowStockChemicals.push(chemical);
            }
        }

        // Bước 3: Đổi trạng thái phiếu
        dispatch.status = 'approved';
        dispatch.approvedBy = approvedBy;
        dispatch.approvedAt = new Date();
        await dispatch.save();

        // Bước 4: Gửi thông báo cảnh báo sắp hết kho (bất đồng bộ)
        if (lowStockChemicals.length > 0) {
            (async () => {
                for (const chemical of lowStockChemicals) {
                    try {
                        await createNotification({
                            title: '⚠️ Cảnh báo Kho Hóa Chất',
                            message: `[XUẤT KHO] ${chemical.name} xuống còn ${chemical.quantity} ${chemical.unit} (ngưỡng: ${chemical.minStock})`,
                            type: 'stock',
                            link: '/admin/chemicals'
                        });
                        await sendAlertEmail({
                            chemicalName: chemical.name,
                            currentQty: chemical.quantity,
                            unit: chemical.unit,
                            minStock: chemical.minStock,
                        });
                        await sendTelegramAlert({
                            chemicalName: chemical.name,
                            currentQty: chemical.quantity,
                            unit: chemical.unit,
                            minStock: chemical.minStock,
                            type: 'xuat',
                        });
                    } catch (e) {
                        console.error('[ApproveDispatch Alert Error]', e.message);
                    }
                }
            })();
        }

        res.json({
            dispatch,
            isLow: lowStockChemicals.length > 0,
            message: `✅ Đã duyệt phiếu xuất kho thành công! ${lowStockChemicals.length > 0 ? '⚠️ Có mặt hàng xuống dưới ngưỡng an toàn.' : ''}`,
        });

    } catch (error) {
        console.error('[updateDispatchStatus] Lỗi:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái phiếu', error: error.message });
    }
};

module.exports = {
    getChemicals,
    createChemical,
    updateChemical,
    deleteChemical,
    getDispatches,
    createDispatch,
    updateDispatchStatus,
};