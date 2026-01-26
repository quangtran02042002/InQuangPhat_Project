const Notification = require('../models/Notification');

const createNotification = async ({ title, message, type, link }) => {
  try {
    await Notification.create({ title, message, type, link });
    console.log(`[NOTIFICATION] Created: ${title}`);
  } catch (error) {
    console.error('Lỗi tạo thông báo:', error);
  }
};

module.exports = createNotification;