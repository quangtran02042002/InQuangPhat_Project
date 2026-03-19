const PaperPrice = require('../models/PaperPrice');

const getPaperPrices = async (req, res) => {
    const prices = await PaperPrice.find({}).sort({ paperType: 1 });
    res.json(prices);
};

const createPaperPrice = async (req, res) => {
    const { paperType, sizes, supplier } = req.body;
    const paperPrice = new PaperPrice({ paperType, sizes, supplier });
    const createdPrice = await paperPrice.save();
    res.status(201).json(createdPrice);
};

const updatePaperPrice = async (req, res) => {
    const { paperType, sizes, supplier } = req.body;
    const paperPrice = await PaperPrice.findById(req.params.id);

    if (paperPrice) {
        paperPrice.paperType = paperType || paperPrice.paperType;
        paperPrice.sizes = sizes || paperPrice.sizes;
        paperPrice.supplier = supplier || paperPrice.supplier;
        
        const updatedPrice = await paperPrice.save();
        res.json(updatedPrice);
    } else {
        res.status(404);
        throw new Error('Không tìm thấy loại giấy này');
    }
};

const deletePaperPrice = async (req, res) => {
    const paperPrice = await PaperPrice.findById(req.params.id);
    if (paperPrice) {
        await paperPrice.deleteOne();
        res.json({ message: 'Đã xóa giá giấy' });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy');
    }
};

module.exports = { getPaperPrices, createPaperPrice, updatePaperPrice, deletePaperPrice };