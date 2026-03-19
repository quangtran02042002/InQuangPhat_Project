const Chemical = require('../models/Chemical');
const createNotification = require('../utils/createNotification');

const getChemicals = async (req, res) => {
    const chemicals = await Chemical.find({}).sort({ createdAt: -1 });
    res.json(chemicals);
};

const createChemical = async (req, res) => {
    const { name, unit, quantity, minStock, safetyNote, supplier } = req.body;
    const chemical = new Chemical({ name, unit, quantity, minStock, safetyNote, supplier });
    const createdChemical = await chemical.save();
    res.status(201).json(createdChemical);
};

const updateChemical = async (req, res) => {
    const { quantity } = req.body;
    const chemical = await Chemical.findById(req.params.id);

    if (chemical) {
        chemical.quantity = quantity;
        const updatedChemical = await chemical.save();

        // Cảnh báo nếu sắp hết hóa chất
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

module.exports = { getChemicals, createChemical, updateChemical, deleteChemical };