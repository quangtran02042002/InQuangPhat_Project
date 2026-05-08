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

        // 1. Kiểm tra tính hợp lệ của TẤT CẢ mặt hàng trước khi xử lý
        const chemicalDocs = [];
        for (const item of dispatchList) {
            if (Number(item.quantity) <= 0) {
                return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
            }
            const chemical = await Chemical.findById(item.chemicalId);
            if (!chemical) {
                return res.status(404).json({ message: `Không tìm thấy hóa chất ID: ${item.chemicalId}` });
            }
            if (type === 'xuat' && Number(item.quantity) > chemical.quantity) {
                return res.status(400).json({
                    message: `Không đủ tồn kho! Hóa chất "${chemical.name}" hiện còn ${chemical.quantity} ${chemical.unit}, bạn đang xuất ${item.quantity}.`
                });
            }
            chemicalDocs.push({ chemical, quantity: Number(item.quantity) });
        }

        // 2. Thực hiện cập nhật tồn kho và chuẩn bị dữ liệu phiếu
        const dispatchItems = [];
        const lowStockChemicals = [];

        for (const doc of chemicalDocs) {
            const { chemical, quantity } = doc;

            // Cộng / Trừ tồn kho
            if (type === 'nhap') {
                chemical.quantity += quantity;
            } else {
                chemical.quantity -= quantity;
            }
            await chemical.save();

            dispatchItems.push({
                chemical: chemical._id,
                chemicalName: chemical.name,
                chemicalUnit: chemical.unit,
                quantity: quantity,
                quantityAfter: chemical.quantity,
            });

            // Ghi nhận mặt hàng sắp hết
            if (chemical.quantity <= chemical.minStock && type === 'xuat') {
                lowStockChemicals.push(chemical);
            }
        }

        // 3. Lưu 1 phiếu (Dispatch) duy nhất chứa tất cả các items
        const dispatch = new ChemicalDispatch({
            type,
            items: dispatchItems,
            recipient: recipient || '',
            note: note || '',
            createdBy: createdBy || 'Admin',
        });
        const savedDispatch = await dispatch.save();

        // 4. Xử lý gửi thông báo BẤT ĐỒNG BỘ (chạy ngầm, không block API)
        if (lowStockChemicals.length > 0) {
            // Không dùng await ở đây để API trả về ngay
            (async () => {
                for (const chemical of lowStockChemicals) {
                    try {
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
                    } catch (e) {
                        console.error('[ChemicalDispatch Alert Error]', e.message);
                    }
                }
            })();
        }

        res.status(201).json({
            dispatches: [savedDispatch], // Trả về mảng cho tương thích frontend cũ (nếu cần)
            isLow: lowStockChemicals.length > 0,
            message: `Tạo thành công phiếu ${type === 'nhap' ? 'nhập' : 'xuất'} với ${dispatchItems.length} mặt hàng!`
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