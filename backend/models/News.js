const mongoose = require('mongoose');

const newsSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Người viết bài (Admin)
    },
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String, // Ảnh đại diện bài viết (Thumbnail)
      required: true,
    },
    description: {
      type: String, // Mô tả ngắn (hiện ở trang chủ)
      required: true,
    },
    content: {
      type: String, // Nội dung chi tiết (HTML từ ReactQuill)
      required: true,
    },
    views: {
      type: Number,
      default: 0, // Đếm lượt xem
    },
  },
  {
    timestamps: true, // Tự động có ngày tạo (createdAt)
  }
);

const News = mongoose.model('News', newsSchema);

module.exports = News;