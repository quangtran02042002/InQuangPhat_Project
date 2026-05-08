import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/Product.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 8;
  const page = Number(req.query.pageNumber) || 1;

  // 1. Tìm kiếm theo Tên (Name)
  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: 'i' } }
    : {};

  // 2. Lọc theo Danh mục (Category)
  const category = req.query.category
    ? { category: req.query.category }
    : {};

  // 3. Lọc theo Nhóm (Group: offset/garment)
  const group = req.query.group
    ? { group: req.query.group }
    : {};

  // 4. Kết hợp điều kiện
  const query = { ...keyword, ...category, ...group };

  const count = await Product.countDocuments(query);

  const products = await Product.find(query)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    return res.json(product);
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    images,
    priceTable,
    category,
    group,
    // countInStock, <--- XÓA DÒNG NÀY
  } = req.body;

  if (!images || images.length === 0) {
     res.status(400);
     throw new Error('Vui lòng tải lên ít nhất 1 ảnh sản phẩm');
  }

  const product = new Product({
    user: req.user._id,
    name,
    images,
    priceTable,
    description,
    category,
    group: group || 'offset',
    // countInStock, <--- XÓA DÒNG NÀY (Không lưu vào DB nữa)
    numReviews: 0,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    images,
    priceTable,
    category,
    group,
    // countInStock, <--- XÓA DÒNG NÀY
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.description = description;
    product.category = category;
    product.group = group;
    product.images = images;
    product.priceTable = priceTable;
    
    // product.countInStock = countInStock; <--- XÓA DÒNG NÀY

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});
// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.status(200).json({ message: 'Product deleted' });
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);
  res.json(products);
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getTopProducts,
};