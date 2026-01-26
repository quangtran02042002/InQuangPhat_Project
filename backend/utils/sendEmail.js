const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Tạo transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Cấu hình nội dung mail
  const mailOptions = {
    from: `"Hệ thống In Quang Phát" <${process.env.EMAIL_USERNAME}>`, // Tên người gửi hiển thị
    to: options.email, // Gửi đến ai
    subject: options.subject, // Tiêu đề
    html: options.message, // Nội dung HTML
  };

  // 3. Gửi
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;