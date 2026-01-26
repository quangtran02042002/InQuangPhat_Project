const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const sendEmail = require('../utils/sendEmail'); // Import
const createNotification = require('../utils/createNotification');
// Lấy danh sách
router.get('/', async (req, res) => {
  const materials = await Material.find({}).sort({ name: 1 });
  res.json(materials);
});

// Thêm / Sửa (Dùng chung logic update nếu trùng tên hoặc tạo mới)
router.post('/', async (req, res) => {
  const { name, unit, quantity, minStock, note } = req.body;
  const material = new Material({ name, unit, quantity, minStock, note });
  const created = await material.save();
  res.status(201).json(created);
});

// Xóa
router.delete('/:id', async (req, res) => {
  await Material.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Cập nhật số lượng (Nhập/Xuất kho)
router.put('/:id', async (req, res) => {
  const { quantity } = req.body; // Số lượng mới
  const material = await Material.findById(req.params.id);
  if(material) {
      material.quantity = quantity;
      const updated = await material.save();
      res.json(updated);
  } else {
      res.status(404).json({ message: 'Not found' });
  }
});
// Cập nhật số lượng
router.put('/:id', async (req, res) => {
  const { quantity } = req.body;
  const material = await Material.findById(req.params.id);
  
  if(material) {
      material.quantity = quantity;
      const updated = await material.save();
      
      // --- LOGIC CẢNH BÁO ---
      if (updated.quantity <= updated.minStock) {
          await createNotification({
            title: '⚠️ Cảnh báo Kho',
            message: `Vật tư "${updated.name}" sắp hết (Còn ${updated.quantity} ${updated.unit})`,
            type: 'stock',
            link: '/admin/materials'
          });
      }
      // ----------------------

      res.json(updated);
  } else {
      res.status(404).json({ message: 'Not found' });
  }
});

module.exports = router;
module.exports = router;