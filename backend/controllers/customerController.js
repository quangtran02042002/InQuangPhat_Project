const Customer = require('../models/Customer');

// @desc    Lấy danh sách khách hàng
// @route   GET /api/customers
// @access  Private/Admin
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi tải danh sách khách hàng' });
  }
};

// @desc    Lấy chi tiết 1 khách hàng
// @route   GET /api/customers/:id
// @access  Private/Admin
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Tạo khách hàng mới
// @route   POST /api/customers
// @access  Private/Admin
const createCustomer = async (req, res) => {
  try {
    const { name, address, taxCode, generalEmail, contacts, group, productsInterested } = req.body;

    const customer = new Customer({
      name,
      address,
      taxCode,
      generalEmail,
      contacts,
      group: group || 'offset', // Mặc định là offset nếu không chọn
      productsInterested
    });

    const createdCustomer = await customer.save();
    res.status(201).json(createdCustomer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi tạo khách hàng' });
  }
};

// @desc    Cập nhật khách hàng
// @route   PUT /api/customers/:id
// @access  Private/Admin
const updateCustomer = async (req, res) => {
  try {
    const { name, address, taxCode, generalEmail, contacts, group, productsInterested } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (customer) {
      customer.name = name || customer.name;
      customer.address = address || customer.address;
      customer.taxCode = taxCode || customer.taxCode;
      customer.generalEmail = generalEmail || customer.generalEmail;
      customer.contacts = contacts || customer.contacts;
      customer.group = group || customer.group;
      customer.productsInterested = productsInterested || customer.productsInterested;

      const updatedCustomer = await customer.save();
      res.json(updatedCustomer);
    } else {
      res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật khách hàng' });
  }
};

// @desc    Xóa khách hàng
// @route   DELETE /api/customers/:id
// @access  Private/Admin
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (customer) {
      await customer.deleteOne();
      res.json({ message: 'Đã xóa khách hàng thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi xóa khách hàng' });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};