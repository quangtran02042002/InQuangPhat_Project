const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');
const { protect } = require('../middleware/authMiddleware');

dotenv.config();
const router = express.Router();

// 1. Cấu hình Cloudinary (Lấy từ file .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Cấu hình nơi lưu trữ (Storage)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'upload_anh_sp', // Tên thư mục trên Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Định dạng cho phép
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// SỬA: Đổi từ single('image') sang array('images', 10)
router.post('/', protect, upload.array('images', 10), (req, res) => {
  const urls = req.files.map(file => file.path);
  res.send(urls); // Trả về dạng mảng ['link1', 'link2']
});

module.exports = router;