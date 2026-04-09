const MaterialPrice = require('../models/MaterialPrice');

const getMaterialPrices = async (req, res) => {
    try {
        const prices = await MaterialPrice.find({}).sort({ category: 1, name: 1 });
        res.json(prices);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy giá vật liệu' });
    }
};

const createMaterialPrice = async (req, res) => {
    try {
        const { category, name, unit, price, supplier, note } = req.body;
        const materialPrice = new MaterialPrice({ category, name, unit, price, supplier, note });
        const createdPrice = await materialPrice.save();
        res.status(201).json(createdPrice);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi thêm giá vật liệu' });
    }
};

const updateMaterialPrice = async (req, res) => {
    try {
        const { category, name, unit, price, supplier, note } = req.body;
        const materialPrice = await MaterialPrice.findById(req.params.id);

        if (materialPrice) {
            materialPrice.category = category || materialPrice.category;
            materialPrice.name = name || materialPrice.name;
            materialPrice.unit = unit || materialPrice.unit;
            if (price !== undefined) materialPrice.price = price;
            materialPrice.supplier = supplier !== undefined ? supplier : materialPrice.supplier;
            materialPrice.note = note !== undefined ? note : materialPrice.note;
            
            const updatedPrice = await materialPrice.save();
            res.json(updatedPrice);
        } else {
            res.status(404).json({ message: 'Không tìm thấy vật liệu này' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi cập nhật giá vật liệu' });
    }
};

const deleteMaterialPrice = async (req, res) => {
    try {
        const materialPrice = await MaterialPrice.findById(req.params.id);
        if (materialPrice) {
            await materialPrice.deleteOne();
            res.json({ message: 'Đã xóa vật liệu' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi xóa giá vật liệu' });
    }
};

module.exports = { getMaterialPrices, createMaterialPrice, updateMaterialPrice, deleteMaterialPrice };
