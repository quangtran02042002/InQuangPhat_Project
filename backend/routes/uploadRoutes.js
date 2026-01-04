const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cấu hình tài khoản Cloudinary (Đây là key demo, dùng tạm ok)
// Sau này bạn nên đăng ký tài khoản riêng tại cloudinary.com để lấy key riêng
cloudinary.config({
  cloud_name: 'dchd7k8hi', 
  api_key: '646439247784334', 
  api_secret: 'R_9oJ2-2-H6g4jX8a5V2n3W-jxs' 
});

// Cấu hình nơi lưu trữ
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'InQuangPhat_Products', // Tên thư mục trên mây
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Chỉ cho phép ảnh
  },
});

const upload = multer({ storage: storage });

// Route upload: Chỉ cần gọi vào đây, nó sẽ trả về đường link ảnh
router.post('/', upload.single('image'), (req, res) => {
  // Trả về đường dẫn ảnh online (path)
  res.send(`/${req.file.path}`);
});

module.exports = router;