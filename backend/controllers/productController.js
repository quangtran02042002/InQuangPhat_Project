const Product = require('../models/Product');

// @desc    Lấy tất cả sản phẩm (Có Tìm kiếm & Phân trang)
// @route   GET /api/products?keyword=abc&pageNumber=1
// @access  Public
// @desc    Lấy tất cả sản phẩm (Có tìm kiếm & Phân trang & Lọc Category)
// @route   GET /api/products
// @access  Public
// @desc    Lấy tất cả sản phẩm (Hỗ trợ tìm kiếm Tên + Lọc Danh mục + Phân trang)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const pageSize = 8; // Số lượng sản phẩm trên 1 trang
  const page = Number(req.query.pageNumber) || 1;

  // 1. Xử lý điều kiện lọc
  let query = {}; // Mặc định là lấy hết

  if (req.query.category) {
    // Nếu trên URL có ?category=Hộp giấy -> Lọc chính xác theo trường category
    query = { category: req.query.category };
  } else if (req.query.keyword) {
    // Nếu trên URL có ?keyword=abc -> Tìm kiếm tương đối theo tên (name)
    query = {
      name: {
        $regex: req.query.keyword,
        $options: 'i', // 'i' nghĩa là không phân biệt hoa thường
      },
    };
  }

  try {
    // 2. Đếm tổng số sản phẩm thỏa mãn điều kiện (để tính số trang)
    const count = await Product.countDocuments(query);

    // 3. Lấy danh sách sản phẩm (có phân trang)
    const products = await Product.find(query)
      .sort({ createdAt: -1 }) // Sắp xếp mới nhất lên đầu
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    // 4. Trả kết quả về cho Frontend
    res.json({ products, page, pages: Math.ceil(count / pageSize) });
    
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi tải danh sách sản phẩm' });
  }
};
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Đã xóa sản phẩm thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi xóa sản phẩm' });
  }
};

// @desc    Tạo sản phẩm
// @desc    Tạo sản phẩm mới
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    // 1. Lấy dữ liệu từ Frontend
    const { name, price, images, category, countInStock, description } = req.body;

    // 2. Log ra terminal để kiểm tra (Bước này giúp bạn xem dữ liệu gửi lên là gì)
    console.log("Dữ liệu nhận được:", req.body);

    // 3. Xử lý chuẩn hóa mảng hình ảnh
    // Frontend gửi: ['link1', 'link2'] -> Backend chuyển thành: [{ url: 'link1' }, { url: 'link2' }]
    let imagesFormatted = [];
    if (images && Array.isArray(images)) {
        imagesFormatted = images.map(img => ({ url: img }));
    }

    // 4. Xử lý bảng giá (Đảm bảo price là số)
    const numericPrice = Number(price);
    const priceTable = [
      { minQuantity: 100, price: numericPrice * 1.5 }, // Logic giá của bạn
      { minQuantity: 500, price: numericPrice * 1.2 },
      { minQuantity: 1000, price: numericPrice },
    ];

    // 5. Tạo đối tượng sản phẩm
    const product = new Product({
      user: req.user._id,
      name,
      images: imagesFormatted, // Lưu mảng object đã chuẩn hóa
      category,
      description,
      countInStock: Number(countInStock), // Ép kiểu về số cho chắc chắn
      priceTable,
    });

    // 6. Lưu vào Database
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);

  } catch (error) {
    // Nếu có lỗi, in chi tiết ra Terminal của Backend để biết đường sửa
    console.error("LỖI TẠO SẢN PHẨM:", error);
    res.status(500).json({ message: "Lỗi Server: " + error.message });
  }
};

// @desc    Cập nhật sản phẩm
const updateProduct = async (req, res) => {
  const { name, price, images, category, countInStock, description } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.description = description;
    product.category = category;
    product.countInStock = countInStock;
    
    // Nếu có gửi ảnh mới lên thì cập nhật, không thì giữ nguyên
    if(images && images.length > 0) {
        product.images = images.map(img => ({ url: img }));
    }

    // Cập nhật giá (Logic cũ)
    if (price) {
        product.priceTable = [
            { minQuantity: 100, price: Number(price) * 1.5 },
            { minQuantity: 500, price: Number(price) * 1.2 },
            { minQuantity: 1000, price: Number(price) },
        ];
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
};

module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
};