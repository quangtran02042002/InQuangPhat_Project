const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const { v2: cloudinary } = require('cloudinary');
const { protect, admin } = require('../middleware/authMiddleware');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const allowedMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (req, file, callback) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      callback(null, true);
      return;
    }
    callback(new Error('Chi ho tro PDF, JPG, PNG, WEBP'));
  },
});

const router = express.Router();

const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'finance_documents',
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );

    stream.end(file.buffer);
  });

router.post('/', protect, admin, upload.array('files', 10), async (req, res) => {
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    const uploaded = await Promise.all(
      files.map(async (file) => {
        const result = await uploadToCloudinary(file);
        return {
          url: result.secure_url,
          publicId: result.public_id,
          originalName: file.originalname,
          resourceType: result.resource_type,
          format: result.format,
          bytes: result.bytes,
        };
      })
    );

    res.json(uploaded);
  } catch (error) {
    console.error('[Finance Upload]', error);
    res.status(500).json({ message: error.message || 'Loi tai tep tai chinh' });
  }
});

module.exports = router;
