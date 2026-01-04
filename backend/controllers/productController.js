const Product = require('../models/Product');

// @desc    Lấy tất cả sản phẩm (Có Tìm kiếm & Phân trang)
// @route   GET /api/products?keyword=abc&pageNumber=1
// @access  Public
const getProducts = async (req, res) => {
  try {
    // 1. Cấu hình phân trang
    const pageSize = 8; // Số sản phẩm trên 1 trang (Bạn có thể sửa số này tùy thích)
    const page = Number(req.query.pageNumber) || 1; // Trang hiện tại (mặc định là 1)

    // 2. Cấu hình tìm kiếm (Keyword)
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword, // Tìm gần đúng
            $options: 'i', // Không phân biệt hoa thường
          },
        }
      : {};

    // 3. Đếm tổng số sản phẩm khớp với từ khóa
    const count = await Product.countDocuments({ ...keyword });

    // 4. Lấy dữ liệu theo trang
    const products = await Product.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 }); // Mới nhất lên đầu

    // 5. Trả về: Danh sách, trang hiện tại, tổng số trang
    res.json({ products, page, pages: Math.ceil(count / pageSize) });
    
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi tải sản phẩm' });
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

const createProduct = async (req, res) => {
  const { name, price, description, image, category, countInStock } = req.body;

  if (!name || !price || !category) {
    res.status(400);
    throw new Error('Vui lòng điền đầy đủ các trường bắt buộc');
  }

  const product = new Product({
    name,
    price,
    user: req.user._id,
    image,
    category,
    countInStock,
    numReviews: 0,
    description,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
};

const updateProduct = async (req, res) => {
  const { name, price, description, image, category, countInStock } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.image = image || product.image;
    product.category = category || product.category;
    product.countInStock = countInStock || product.countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy sản phẩm');
  }
};

module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
};