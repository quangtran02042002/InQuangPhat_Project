// backend/controllers/supplierController.js
const Supplier = require('../models/Supplier');

// 1. Lấy danh sách (Chỉ Admin)
exports.getSuppliers = async (req, res) => {
  try {
    // Sắp xếp mới nhất lên đầu
    const suppliers = await Supplier.find({}).sort({ createdAt: -1 });
    res.json({ success: true, suppliers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Lấy chi tiết 1 NCC
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (supplier) {
      res.json(supplier);
    } else {
      res.status(404).json({ message: 'Không tìm thấy nhà cung cấp' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Tạo mới
exports.createSupplier = async (req, res) => {
  try {
    const { name, taxCode, contactName, phone, address, productsProvided, note } = req.body;
    
    const supplier = new Supplier({
      name, taxCode, contactName, phone, address, productsProvided, note,
      user: req.user._id // Lấy ID của admin đang đăng nhập
    });

    const createdSupplier = await supplier.save();
    res.status(201).json(createdSupplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Cập nhật
exports.updateSupplier = async (req, res) => {
  try {
    const { name, taxCode, contactName, phone, address, productsProvided, note } = req.body;
    const supplier = await Supplier.findById(req.params.id);

    if (supplier) {
      supplier.name = name;
      supplier.taxCode = taxCode;
      supplier.contactName = contactName;
      supplier.phone = phone;
      supplier.address = address;
      supplier.productsProvided = productsProvided;
      supplier.note = note;

      const updatedSupplier = await supplier.save();
      res.json(updatedSupplier);
    } else {
      res.status(404).json({ message: 'Không tìm thấy' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Xóa
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (supplier) {
      await supplier.deleteOne();
      res.json({ message: 'Đã xóa nhà cung cấp' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};