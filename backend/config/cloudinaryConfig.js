// backend/config/cloudinaryConfig.js
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

// 1. Cấu hình tài khoản
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Cấu hình Storage (Nơi lưu)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'upload_anh_sp', // Đặt tên folder chung
    // QUAN TRỌNG: 'auto' giúp Cloudinary tự nhận diện là Ảnh hay Video
    resource_type: 'auto', 
    // Thêm định dạng video (mp4, mov, avi) vào danh sách cho phép
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'mov', 'avi'], 
  },
});

const upload = multer({ storage });

module.exports = upload;