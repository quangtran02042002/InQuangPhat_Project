const FinishingPrice = require('../models/FinishingPrice');

// @desc    Lấy toàn bộ danh sách giá gia công
// @route   GET /api/finishing-prices
// @access  Protected
const getFinishingPrices = async (req, res) => {
    try {
        const prices = await FinishingPrice.find({}).sort({ category: 1, name: 1 });
        res.json(prices);
    } catch (error) {
        console.error('Lỗi getFinishingPrices:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy giá gia công' });
    }
};

// @desc    Cập nhật giá 1 công đoạn
// @route   PUT /api/finishing-prices/:id
// @access  Admin
const updateFinishingPrice = async (req, res) => {
    try {
        const { name, description, unit, price, icon, color, isActive } = req.body;
        const item = await FinishingPrice.findById(req.params.id);

        if (item) {
            if (name !== undefined) item.name = name;
            if (description !== undefined) item.description = description;
            if (unit !== undefined) item.unit = unit;
            if (price !== undefined) item.price = price;
            if (icon !== undefined) item.icon = icon;
            if (color !== undefined) item.color = color;
            if (isActive !== undefined) item.isActive = isActive;

            const updated = await item.save();
            res.json(updated);
        } else {
            res.status(404).json({ message: 'Không tìm thấy công đoạn này' });
        }
    } catch (error) {
        console.error('Lỗi updateFinishingPrice:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật giá' });
    }
};

// @desc    Cập nhật hàng loạt (bulk update)
// @route   PUT /api/finishing-prices/bulk-update
// @access  Admin
const bulkUpdateFinishingPrices = async (req, res) => {
    try {
        const { updates } = req.body; // [{ _id, price, unit, ... }, ...]
        if (!updates || !Array.isArray(updates)) {
            return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
        }

        const results = [];
        for (const update of updates) {
            const item = await FinishingPrice.findById(update._id);
            if (item) {
                if (update.price !== undefined) item.price = update.price;
                if (update.unit !== undefined) item.unit = update.unit;
                if (update.name !== undefined) item.name = update.name;
                if (update.description !== undefined) item.description = update.description;
                if (update.isActive !== undefined) item.isActive = update.isActive;
                const saved = await item.save();
                results.push(saved);
            }
        }

        res.json({ message: `Đã cập nhật ${results.length} công đoạn`, data: results });
    } catch (error) {
        console.error('Lỗi bulkUpdateFinishingPrices:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật hàng loạt' });
    }
};

// @desc    Tạo mới 1 công đoạn (Admin)
// @route   POST /api/finishing-prices
// @access  Admin
const createFinishingPrice = async (req, res) => {
    try {
        const { processId, name, description, category, categoryName, unit, price, icon, color } = req.body;

        const exists = await FinishingPrice.findOne({ processId });
        if (exists) {
            return res.status(400).json({ message: `Công đoạn "${processId}" đã tồn tại` });
        }

        const item = new FinishingPrice({ processId, name, description, category, categoryName, unit, price, icon, color });
        const created = await item.save();
        res.status(201).json(created);
    } catch (error) {
        console.error('Lỗi createFinishingPrice:', error);
        res.status(500).json({ message: 'Lỗi server khi tạo công đoạn' });
    }
};

// @desc    Xóa 1 công đoạn (Admin)
// @route   DELETE /api/finishing-prices/:id
// @access  Admin
const deleteFinishingPrice = async (req, res) => {
    try {
        const item = await FinishingPrice.findById(req.params.id);
        if (item) {
            await item.deleteOne();
            res.json({ message: 'Đã xóa công đoạn' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy' });
        }
    } catch (error) {
        console.error('Lỗi deleteFinishingPrice:', error);
        res.status(500).json({ message: 'Lỗi server khi xóa' });
    }
};

// @desc    Seed dữ liệu mặc định (chỉ khi DB rỗng)
// @route   POST /api/finishing-prices/seed
// @access  Admin
const seedFinishingPrices = async (req, res) => {
    try {
        const count = await FinishingPrice.countDocuments();
        if (count > 0) {
            return res.json({ message: `Đã có ${count} công đoạn trong DB, không cần seed.` });
        }

        const defaultData = [
            { processId: 'lam_bong', name: 'Cán màng bóng', description: 'Phủ lớp màng polyme bóng, tăng độ sáng bề mặt, chống nước, chống xước.', category: 'surface', categoryName: 'Gia công bề mặt', unit: 'đ/tờ in', price: 500, icon: '✨', color: '#8B5CF6' },
            { processId: 'lam_mo', name: 'Cán màng mờ', description: 'Phủ lớp màng mờ mịn, tạo cảm giác mềm mại và sang trọng.', category: 'surface', categoryName: 'Gia công bề mặt', unit: 'đ/tờ in', price: 500, icon: '🌫️', color: '#8B5CF6' },
            { processId: 'uv_toan_phan', name: 'Phủ UV toàn phần', description: 'Phủ vecni UV kín bề mặt, tăng độ bóng bẩy và bảo vệ mực in.', category: 'surface', categoryName: 'Gia công bề mặt', unit: 'đ/tờ in', price: 800, icon: '💎', color: '#06B6D4' },
            { processId: 'uv_cuc_bo', name: 'Phủ UV cục bộ', description: 'Phủ UV lên chi tiết riêng (logo, hình ảnh) tạo điểm nhấn nổi bật.', category: 'surface', categoryName: 'Gia công bề mặt', unit: 'đ/tổng', price: 1500000, icon: '🔮', color: '#06B6D4' },
            { processId: 'ep_kim', name: 'Ép kim / Ép nhũ', description: 'Ép lớp nhũ vàng, bạc, đồng lên giấy bằng khuôn nóng - sang trọng tối đa.', category: 'surface', categoryName: 'Gia công bề mặt', unit: 'đ/tổng', price: 2000000, icon: '👑', color: '#F59E0B' },
            { processId: 'thuc_noi', name: 'Thúc nổi / Dập chìm', description: 'Ép bề mặt giấy nhô lên hoặc lõm xuống, tạo hiệu ứng 3D xúc giác.', category: 'surface', categoryName: 'Gia công bề mặt', unit: 'đ/tổng', price: 1500000, icon: '🎭', color: '#EC4899' },
            { processId: 'can_gan', name: 'Cán gân', description: 'Tạo họa tiết sần trên bề mặt qua trục lăn khắc vân, giả lập giấy mỹ thuật.', category: 'surface', categoryName: 'Gia công bề mặt', unit: 'đ/tờ in', price: 300, icon: '🪵', color: '#78716C' },

            { processId: 'can_be', name: 'Cấn bế (Die-cutting)', description: 'Dùng khuôn bế dập cắt và tạo đường gấp theo thiết kế hộp.', category: 'shaping', categoryName: 'Gia công định hình', unit: 'đ/tổng', price: 2500000, icon: '📐', color: '#F97316' },
            { processId: 'gap_dan', name: 'Gấp dán hộp', description: 'Quét keo và dán mép, định hình thành hộp hoàn chỉnh (tự động hoặc thủ công).', category: 'shaping', categoryName: 'Gia công định hình', unit: 'đ/SP', price: 200, icon: '📦', color: '#F97316' },
            { processId: 'dan_cua_so', name: 'Dán cửa sổ', description: 'Bế khoảng trống và dán màng nhìn xuyên (PET/mica) lên mặt hộp.', category: 'shaping', categoryName: 'Gia công định hình', unit: 'đ/SP', price: 500, icon: '🪟', color: '#F97316' },

            { processId: 'boi_giay', name: 'Bồi giấy (Mounting)', description: 'Dán bồi lớp giấy in mỏng lên cốt carton lạnh/sóng cứng cáp.', category: 'rigid', categoryName: 'Hộp cứng cao cấp', unit: 'đ/SP', price: 1000, icon: '🧱', color: '#059669' },
            { processId: 'phay_ranh', name: 'Phay rãnh (V-grooving)', description: 'Rạch rãnh chữ V trên carton lạnh để gấp hộp cứng vuông vức hoàn hảo.', category: 'rigid', categoryName: 'Hộp cứng cao cấp', unit: 'đ/SP', price: 500, icon: '🔧', color: '#059669' },
            { processId: 'boc_hop', name: 'Bọc hộp (Wrapping)', description: 'Gấp dán lớp giấy in áo ôm sát các góc cạnh carton lạnh đã phay.', category: 'rigid', categoryName: 'Hộp cứng cao cấp', unit: 'đ/SP', price: 1500, icon: '🎁', color: '#059669' },
            { processId: 'khay_dinh_hinh', name: 'Gia công khay định hình', description: 'Bế mút xốp EVA, khay giấy, bọc lụa, phủ nhung cố định sản phẩm trong hộp.', category: 'rigid', categoryName: 'Hộp cứng cao cấp', unit: 'đ/SP', price: 3000, icon: '🧶', color: '#059669' },

            { processId: 'dong_kim', name: 'Đóng kim / Bấm gáy', description: 'Bấm ghim kim loại giữa gáy, phù hợp ấn phẩm mỏng (catalog, brochure).', category: 'book', categoryName: 'Sách, Tạp chí, Catalog', unit: 'đ/cuốn', price: 200, icon: '📎', color: '#3B82F6' },
            { processId: 'gay_keo_nhiet', name: 'Đóng gáy keo nhiệt', description: 'Phay xước gáy, quét keo nóng dán bìa - phổ biến cho sách dày, tạp chí.', category: 'book', categoryName: 'Sách, Tạp chí, Catalog', unit: 'đ/cuốn', price: 1000, icon: '📕', color: '#3B82F6' },
            { processId: 'khau_chi', name: 'Khâu chỉ gáy keo', description: 'Khâu chỉ liền tay sách trước dán keo - độ bền tuyệt đối, mở phẳng 180°.', category: 'book', categoryName: 'Sách, Tạp chí, Catalog', unit: 'đ/cuốn', price: 2000, icon: '🧵', color: '#3B82F6' },
            { processId: 'gay_lo_xo', name: 'Đóng gáy lò xo', description: 'Đục lỗ xỏ dây lò xo nhựa/kim loại - dùng cho lịch, sổ tay, menu.', category: 'book', categoryName: 'Sách, Tạp chí, Catalog', unit: 'đ/cuốn', price: 1500, icon: '🗓️', color: '#3B82F6' },

            { processId: 'cat_xen', name: 'Cắt xén (Trimming)', description: 'Cắt bỏ lề dư, xén cạnh đúng kích thước thành phẩm cuối cùng.', category: 'finishing', categoryName: 'Hoàn thiện phụ trợ', unit: 'đ/SP', price: 100, icon: '✂️', color: '#64748B' },
            { processId: 'khoan_lo', name: 'Khoan lỗ / Đóng mắt cáo', description: 'Đục lỗ tròn, dập khoen kim loại gia cố - cho túi giấy, thẻ treo, mác.', category: 'finishing', categoryName: 'Hoàn thiện phụ trợ', unit: 'đ/SP', price: 300, icon: '⭕', color: '#64748B' },
            { processId: 'rang_cua', name: 'Đục lỗ răng cưa', description: 'Tạo đường đứt nét để xé dễ dàng - áp dụng cho voucher, vé, hóa đơn.', category: 'finishing', categoryName: 'Hoàn thiện phụ trợ', unit: 'đ/SP', price: 200, icon: '🎫', color: '#64748B' },
            { processId: 'so_nhay', name: 'Đóng số nhảy', description: 'Đóng dãy số seri liên tiếp - dùng trên hóa đơn, vé, tem bảo hành.', category: 'finishing', categoryName: 'Hoàn thiện phụ trợ', unit: 'đ/SP', price: 50, icon: '🔢', color: '#64748B' },
        ];

        const created = await FinishingPrice.insertMany(defaultData);
        res.status(201).json({ message: `Đã tạo ${created.length} công đoạn mặc định`, data: created });
    } catch (error) {
        console.error('Lỗi seed:', error);
        res.status(500).json({ message: 'Lỗi khi seed dữ liệu' });
    }
};

module.exports = { getFinishingPrices, updateFinishingPrice, bulkUpdateFinishingPrices, createFinishingPrice, deleteFinishingPrice, seedFinishingPrices };
