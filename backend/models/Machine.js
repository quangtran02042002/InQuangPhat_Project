// backend/models/Machine.js
const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: String,
  
  // --- SỬA PHẦN NÀY ---
  // Thay vì video: String, ta đổi thành mảng object
  videos: [
    {
      public_id: String, // Để sau này xóa video trên Cloudinary
      url: String        // Link video
    }
  ],
  // --------------------

  images: [
    {
      public_id: String,
      url: String
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Machine', machineSchema);