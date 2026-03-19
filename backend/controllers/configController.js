const PaperSize = require('../models/PaperSize'); // Import model mới
const PaperWeight = require('../models/PaperWeight');
const Surcharge = require('../models/Surcharge');

// ================= KHỔ GIẤY (PAPER SIZES) =================
const getPaperSizes = async (req, res) => {
    const sizes = await PaperSize.find({});
    res.json(sizes);
};
const createPaperSize = async (req, res) => {
    const { name, description } = req.body;
    const paperSize = new PaperSize({ name, description }); // Không còn bleed
    const createdSize = await paperSize.save();
    res.status(201).json(createdSize);
};
const deletePaperSize = async (req, res) => {
    const paperSize = await PaperSize.findById(req.params.id);
    if (paperSize) {
        await paperSize.deleteOne();
        res.json({ message: 'Đã xóa khổ giấy' });
    } else {
        res.status(404); throw new Error('Không tìm thấy khổ giấy');
    }
};

// ================= ĐỊNH LƯỢNG (PAPER WEIGHTS) =================
const getPaperWeights = async (req, res) => {
    const weights = await PaperWeight.find({});
    res.json(weights);
};
const createPaperWeight = async (req, res) => {
    const { weight, description } = req.body;
    const paperWeight = new PaperWeight({ weight, description });
    const createdWeight = await paperWeight.save();
    res.status(201).json(createdWeight);
};
const deletePaperWeight = async (req, res) => {
    const paperWeight = await PaperWeight.findById(req.params.id);
    if (paperWeight) {
        await paperWeight.deleteOne();
        res.json({ message: 'Đã xóa định lượng' });
    } else {
        res.status(404); throw new Error('Không tìm thấy định lượng');
    }
};

// ================= PHỤ PHÍ (SURCHARGES) =================
const getSurcharges = async (req, res) => {
    const surcharges = await Surcharge.find({});
    res.json(surcharges);
};
const createSurcharge = async (req, res) => {
    const { name, unit, price, minPrice } = req.body;
    const surcharge = new Surcharge({ name, unit, price, minPrice });
    const createdSurcharge = await surcharge.save();
    res.status(201).json(createdSurcharge);
};
const deleteSurcharge = async (req, res) => {
    const surcharge = await Surcharge.findById(req.params.id);
    if (surcharge) {
        await surcharge.deleteOne();
        res.json({ message: 'Đã xóa phụ phí' });
    } else {
        res.status(404); throw new Error('Không tìm thấy phụ phí');
    }
};

module.exports = {
    getPaperSizes, createPaperSize, deletePaperSize,
    getPaperWeights, createPaperWeight, deletePaperWeight,
    getSurcharges, createSurcharge, deleteSurcharge
};