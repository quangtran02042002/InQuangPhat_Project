const InkPrice = require('../models/InkPrice');

const getInkPrices = async (req, res) => {
    try {
        const prices = await InkPrice.find({}).sort({ inkType: 1 });
        res.json(prices);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy giá mực' });
    }
};

const createInkPrice = async (req, res) => {
    try {
        const { inkType, brand, unit, price, supplier, note } = req.body;
        const inkPrice = new InkPrice({ inkType, brand, unit, price, supplier, note });
        const createdPrice = await inkPrice.save();
        res.status(201).json(createdPrice);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi thêm giá mực' });
    }
};

const updateInkPrice = async (req, res) => {
    try {
        const { inkType, brand, unit, price, supplier, note } = req.body;
        const inkPrice = await InkPrice.findById(req.params.id);

        if (inkPrice) {
            inkPrice.inkType = inkType || inkPrice.inkType;
            inkPrice.brand = brand || inkPrice.brand;
            inkPrice.unit = unit || inkPrice.unit;
            if (price !== undefined) inkPrice.price = price;
            inkPrice.supplier = supplier || inkPrice.supplier;
            inkPrice.note = note !== undefined ? note : inkPrice.note;
            
            const updatedPrice = await inkPrice.save();
            res.json(updatedPrice);
        } else {
            res.status(404).json({ message: 'Không tìm thấy loại mực này' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi cập nhật giá mực' });
    }
};

const deleteInkPrice = async (req, res) => {
    try {
        const inkPrice = await InkPrice.findById(req.params.id);
        if (inkPrice) {
            await inkPrice.deleteOne();
            res.json({ message: 'Đã xóa giá mực' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi xóa giá mực' });
    }
};

module.exports = { getInkPrices, createInkPrice, updateInkPrice, deleteInkPrice };
