const Material = require('../models/Material');
const MaterialDispatch = require('../models/MaterialDispatch');
const createNotification = require('../utils/createNotification');
const sendAlertEmail = require('../utils/sendAlertEmail');
const sendTelegramAlert = require('../utils/sendTelegramAlert');

// =============================================
// KHO TỒN KHO VẬT TƯ
// =============================================

/**
 * GET /api/materials
 */
const getMaterials = async (req, res) => {
    try {
        const materials = await Material.find({}).sort({ createdAt: -1 });
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tải danh sách vật tư', error: error.message });
    }
};

/**
 * POST /api/materials
 * Tạo danh mục vật tư mới – chặn trùng tên
 */
const createMaterial = async (req, res) => {
    try {
        const { name, unit, quantity, minStock, note } = req.body;

        // Kiểm tra vật tư trùng tên
        const existing = await Material.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
        if (existing) {
            return res.status(400).json({
                message: 'Danh mục vật tư này đã tồn tại! Vui lòng chuyển sang tab "Cấp Phát Vật Tư" → "Nhập Kho" để nhập thêm số lượng.',
            });
        }

        const material = new Material({
            name: name.trim(),
            unit,
            quantity: Number(quantity) || 0,
            minStock: Number(minStock) || 10,
            note,
        });
        const created = await material.save();

        // Tự động tạo phiếu nhập kho nếu có tồn kho ban đầu
        const initQty = Number(quantity);
        if (initQty > 0) {
            const dispatch = new MaterialDispatch({
                material: created._id,
                materialName: created.name,
                materialUnit: created.unit,
                type: 'nhap',
                quantity: initQty,
                recipient: 'Hệ thống',
                note: 'Tồn kho ban đầu khi tạo danh mục mới',
                createdBy: 'Admin',
                quantityAfter: initQty,
            });
            await dispatch.save();
        }

        res.status(201).json(created);
    } catch (error) {
        console.error('[createMaterial] Lỗi:', error);
        res.status(500).json({ message: 'Lỗi server khi tạo vật tư' });
    }
};

/**
 * PUT /api/materials/:id
 */
const updateMaterial = async (req, res) => {
    try {
        const { quantity } = req.body;
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({ message: 'Không tìm thấy vật tư' });
        }

        material.quantity = quantity;
        const updated = await material.save();

        // Cảnh báo nếu sắp hết vật tư
        if (updated.quantity <= updated.minStock) {
            await createNotification({
                title: '⚠️ Cảnh báo Kho Vật Tư',
                message: `Vật tư "${updated.name}" sắp hết (Còn ${updated.quantity} ${updated.unit})`,
                type: 'stock',
                link: '/admin/materials',
            });
        }

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật vật tư' });
    }
};

/**
 * DELETE /api/materials/:id
 */
const deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        if (!material) {
            return res.status(404).json({ message: 'Không tìm thấy vật tư' });
        }
        await material.deleteOne();
        res.json({ message: 'Đã xóa vật tư' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa vật tư' });
    }
};

// =============================================
// CẤP PHÁT VẬT TƯ (DISPATCH)
// =============================================

/**
 * GET /api/materials/dispatches
 */
const getDispatches = async (req, res) => {
    try {
        const filter = {};
        if (req.query.material) {
            filter.material = req.query.material;
        }
        const limit = parseInt(req.query.limit) || 100;
        const dispatches = await MaterialDispatch.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('material', 'name unit quantity minStock');
        res.json(dispatches);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tải lịch sử cấp phát vật tư', error: error.message });
    }
};

/**
 * POST /api/materials/dispatches
 * Tạo phiếu nhập/xuất vật tư, tự động cộng/trừ tồn kho
 */
const createDispatch = async (req, res) => {
    try {
        const { materialId, type, quantity, recipient, note, createdBy } = req.body;

        if (!materialId || !type || !quantity) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (materialId, type, quantity)' });
        }
        if (!['nhap', 'xuat'].includes(type)) {
            return res.status(400).json({ message: 'Loại phiếu phải là "nhap" hoặc "xuat"' });
        }
        if (Number(quantity) <= 0) {
            return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
        }

        const material = await Material.findById(materialId);
        if (!material) {
            return res.status(404).json({ message: 'Không tìm thấy vật tư' });
        }

        // Kiểm tra không được xuất quá tồn kho
        if (type === 'xuat' && Number(quantity) > material.quantity) {
            return res.status(400).json({
                message: `Không đủ tồn kho! Hiện còn ${material.quantity} ${material.unit}, bạn đang xuất ${quantity}.`,
            });
        }

        // Cộng / Trừ tồn kho
        if (type === 'nhap') {
            material.quantity += Number(quantity);
        } else {
            material.quantity -= Number(quantity);
        }
        await material.save();

        // Tạo bản ghi dispatch
        const dispatch = new MaterialDispatch({
            material: material._id,
            materialName: material.name,
            materialUnit: material.unit,
            type,
            quantity: Number(quantity),
            recipient: recipient || '',
            note: note || '',
            createdBy: createdBy || 'Admin',
            quantityAfter: material.quantity,
        });
        const savedDispatch = await dispatch.save();

        // ============ CẢNH BÁO TỒN KHO THẤP ============
        const isLow = material.quantity <= material.minStock;

        if (isLow && type === 'xuat') {
            // 1. Notification trong hệ thống
            await createNotification({
                title: '⚠️ Cảnh báo Kho Vật Tư',
                message: `[XUẤT KHO] ${material.name} xuống còn ${material.quantity} ${material.unit} (ngưỡng: ${material.minStock})`,
                type: 'stock',
                link: '/admin/materials',
            });

            // 2. Gửi email alert
            try {
                await sendAlertEmail({
                    chemicalName: material.name,
                    currentQty: material.quantity,
                    unit: material.unit,
                    minStock: material.minStock,
                });
            } catch (emailErr) {
                console.error('[MaterialDispatch] Email alert error:', emailErr.message);
            }

            // 3. Gửi Telegram alert
            try {
                await sendTelegramAlert({
                    chemicalName: material.name,
                    currentQty: material.quantity,
                    unit: material.unit,
                    minStock: material.minStock,
                    type,
                });
            } catch (tgErr) {
                console.error('[MaterialDispatch] Telegram alert error:', tgErr.message);
            }
        }

        res.status(201).json({
            dispatch: savedDispatch,
            updatedQuantity: material.quantity,
            isLow,
        });
    } catch (error) {
        console.error('[createMaterialDispatch] Lỗi:', error);
        res.status(500).json({ message: 'Lỗi khi tạo phiếu cấp phát vật tư', error: error.message });
    }
};

module.exports = {
    getMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    getDispatches,
    createDispatch,
};
