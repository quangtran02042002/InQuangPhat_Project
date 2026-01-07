import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/Product.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 8; // Số sản phẩm trên 1 trang
  const page = Number(req.query.pageNumber) || 1;

  // 1. Xử lý tìm kiếm theo Từ khóa (Keyword)
  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: 'i' } }
    : {};

  // 2. Xử lý lọc theo Danh mục (Category) - MỚI
  // Nếu trên URL có ?category=Hộp cứng thì sẽ lọc theo nó
  const category = req.query.category
    ? { category: req.query.category }
    : {};

  // 3. Kết hợp điều kiện lọc (Tìm kiếm + Danh mục)
  const count = await Product.countDocuments({ ...keyword, ...category });

  const products = await Product.find({ ...keyword, ...category })
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

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  // --- CODE CŨ: Tự tạo mẫu (XÓA BỎ) ---
  // const product = new Product({ ...sample ... }) 

  // --- CODE MỚI: Nhận dữ liệu từ client gửi lên ---
  const {
    name,
    price,
    description,
    image, // Ảnh đại diện
    images, // Album ảnh
    brand,
    category,
    group,
    countInStock,
  } = req.body;

  const product = new Product({
    name,
    price,
    user: req.user._id,
    image,
    images,
    brand,
    category,
    group: group || 'offset', // Mặc định là offset nếu không chọn
    countInStock,
    numReviews: 0,
    description,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    image,
    brand,
    category,
    group, // <--- MỚI: Nhận biến group từ Frontend gửi lên
    countInStock,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.group = group; // <--- MỚI: Lưu biến group vào Database
    product.countInStock = countInStock;

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

// @desc    Create a new review
// @route   POST /api/products/:id/reviews
// @access  Private
// const createProductReview = asyncHandler(async (req, res) => {
//   const { rating, comment } = req.body;

//   const product = await Product.findById(req.params.id);

//   if (product) {
//     const alreadyReviewed = product.reviews.find(
//       (review) => review.user.toString() === req.user._id.toString()
//     );

//     if (alreadyReviewed) {
//       res.status(400);
//       throw new Error('Product already reviewed');
//     }

//     const review = {
//       name: req.user.name,
//       rating: Number(rating),
//       comment,
//       user: req.user._id,
//     };

//     product.reviews.push(review);

//     product.numReviews = product.reviews.length;

//     product.rating =
//       product.reviews.reduce((acc, review) => acc + review.rating, 0) /
//       product.reviews.length;

//     await product.save();
//     res.status(201).json({ message: 'Review added' });
//   } else {
//     res.status(404);
//     throw new Error('Resource not found');
//   }
// });

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