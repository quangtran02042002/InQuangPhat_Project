const News = require('../models/News');

// @desc    Lấy tất cả bài viết (Có phân trang nếu cần)
// @route   GET /api/news
// @access  Public
const getNews = async (req, res) => {
  try {
    const newsList = await News.find({}).sort({ createdAt: -1 }); // Mới nhất lên đầu
    res.json(newsList);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi tải tin tức' });
  }
};

// @desc    Lấy 1 bài viết theo ID
// @route   GET /api/news/:id
// @access  Public
const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (news) {
      // Tăng lượt xem lên 1 mỗi khi có người đọc
      news.views = news.views + 1;
      await news.save();
      res.json(news);
    } else {
      res.status(404).json({ message: 'Không tìm thấy bài viết' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Tạo bài viết mới
// @route   POST /api/news
// @access  Private/Admin
const createNews = async (req, res) => {
  const { title, image, description, content } = req.body;

  const news = new News({
    user: req.user._id,
    title,
    image,
    description,
    content,
  });

  const createdNews = await news.save();
  res.status(201).json(createdNews);
};

// @desc    Cập nhật bài viết
// @route   PUT /api/news/:id
// @access  Private/Admin
const updateNews = async (req, res) => {
  const { title, image, description, content } = req.body;
  const news = await News.findById(req.params.id);

  if (news) {
    news.title = title || news.title;
    news.image = image || news.image;
    news.description = description || news.description;
    news.content = content || news.content;

    const updatedNews = await news.save();
    res.json(updatedNews);
  } else {
    res.status(404).json({ message: 'Không tìm thấy bài viết' });
  }
};

// @desc    Xóa bài viết
// @route   DELETE /api/news/:id
// @access  Private/Admin
const deleteNews = async (req, res) => {
  const news = await News.findById(req.params.id);
  if (news) {
    await news.deleteOne();
    res.json({ message: 'Đã xóa bài viết' });
  } else {
    res.status(404).json({ message: 'Không tìm thấy bài viết' });
  }
};

module.exports = { getNews, getNewsById, createNews, updateNews, deleteNews };