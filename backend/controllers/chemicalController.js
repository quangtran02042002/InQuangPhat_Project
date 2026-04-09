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
 * Tạo phiếu nhập/xuất, tự động cộng/trừ tồn kho
 */
const createDispatch = async (req, res) => {
    try {
        const { chemicalId, type, quantity, recipient, note, createdBy } = req.body;

        if (!chemicalId || !type || !quantity) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (chemicalId, type, quantity)' });
        }
        if (!['nhap', 'xuat'].includes(type)) {
            return res.status(400).json({ message: 'Loại phiếu phải là "nhap" hoặc "xuat"' });
        }
        if (Number(quantity) <= 0) {
            return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
        }

        const chemical = await Chemical.findById(chemicalId);
        if (!chemical) {
            return res.status(404).json({ message: 'Không tìm thấy hóa chất' });
        }

        // Kiểm tra không được xuất quá tồn kho
        if (type === 'xuat' && Number(quantity) > chemical.quantity) {
            return res.status(400).json({
                message: `Không đủ tồn kho! Hiện còn ${chemical.quantity} ${chemical.unit}, bạn đang xuất ${quantity}.`
            });
        }

        // Cộng / Trừ tồn kho
        if (type === 'nhap') {
            chemical.quantity += Number(quantity);
        } else {
            chemical.quantity -= Number(quantity);
        }
        await chemical.save();

        // Tạo bản ghi dispatch
        const dispatch = new ChemicalDispatch({
            chemical: chemical._id,
            chemicalName: chemical.name,
            chemicalUnit: chemical.unit,
            type,
            quantity: Number(quantity),
            recipient: recipient || '',
            note: note || '',
            createdBy: createdBy || 'Admin',
            quantityAfter: chemical.quantity,
        });
        const savedDispatch = await dispatch.save();

        // ============ CẢNH BÁO TỒN KHO THẤP ============
        const isLow = chemical.quantity <= chemical.minStock;
        
        if (isLow && type === 'xuat') {
            // 1. Notification trong hệ thống
            await createNotification({
                title: '⚠️ Cảnh báo Kho Hóa Chất',
                message: `[XUẤT KHO] ${chemical.name} xuống còn ${chemical.quantity} ${chemical.unit} (ngưỡng: ${chemical.minStock})`,
                type: 'stock',
                link: '/admin/chemicals'
            });

            // 2. Gửi email alert
            await sendAlertEmail({
                chemicalName: chemical.name,
                currentQty: chemical.quantity,
                unit: chemical.unit,
                minStock: chemical.minStock,
            });

            // 3. Gửi Telegram alert
            await sendTelegramAlert({
                chemicalName: chemical.name,
                currentQty: chemical.quantity,
                unit: chemical.unit,
                minStock: chemical.minStock,
                type,
            });
        }

        res.status(201).json({
            dispatch: savedDispatch,
            updatedQuantity: chemical.quantity,
            isLow,
        });
    } catch (error) {
        console.error('[createDispatch] Lỗi:', error);
        res.status(500).json({ message: 'Lỗi khi tạo phiếu cấp phát', error: error.message });
    }
};

module.exports = {
    getChemicals,
    createChemical,
    updateChemical,
    deleteChemical,
    getDispatches,
    createDispatch,
};