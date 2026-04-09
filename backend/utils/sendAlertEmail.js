const nodemailer = require('nodemailer');

/**
 * Gửi email cảnh báo kho hóa chất sắp hết
 * @param {object} params
 * @param {string} params.chemicalName - Tên hóa chất
 * @param {number} params.currentQty   - Số lượng hiện còn
 * @param {string} params.unit         - Đơn vị (Can, Lít, ...)
 * @param {number} params.minStock     - Ngưỡng cảnh báo
 */
const sendAlertEmail = async ({ chemicalName, currentQty, unit, minStock }) => {
    if (process.env.ALERT_EMAIL_ENABLED !== 'true') return;

    const from = process.env.ALERT_EMAIL_FROM;
    const password = process.env.ALERT_EMAIL_PASSWORD;
    const to = process.env.ALERT_EMAIL_TO;

    if (!from || !password || !to) {
        console.warn('[Email Alert] Thiếu cấu hình email trong .env, bỏ qua.');
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: from, pass: password },
        });

        const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        const urgencyColor = currentQty <= 0 ? '#DC2626' : '#F59E0B';
        const urgencyText = currentQty <= 0 ? '🚨 HẾT HÀNG' : '⚠️ SẮP HẾT';

        const htmlBody = `
<!DOCTYPE html>
<html lang="vi">
<body style="margin:0;padding:0;background:#F3F4F6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#006B4D,#10B981);padding:32px;text-align:center;">
            <div style="font-size:40px;margin-bottom:8px;">⚗️</div>
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;">Cảnh Báo Kho Hóa Chất</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:13px;">In Quảng Phát – Hệ thống quản lý kho</p>
          </td>
        </tr>
        <!-- BODY -->
        <tr>
          <td style="padding:32px;">
            <div style="background:${urgencyColor}15;border:2px solid ${urgencyColor};border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
              <span style="font-size:28px;font-weight:900;color:${urgencyColor};">${urgencyText}</span>
              <p style="color:${urgencyColor};margin:4px 0 0;font-size:13px;font-weight:600;">Cần nhập kho sớm</p>
            </div>
            <table width="100%" cellpadding="12" cellspacing="0" style="border-collapse:collapse;background:#F9FAFB;border-radius:12px;overflow:hidden;">
              <tr style="border-bottom:1px solid #E5E7EB;">
                <td style="color:#6B7280;font-size:13px;font-weight:600;">Hóa chất</td>
                <td style="color:#111827;font-size:15px;font-weight:800;">${chemicalName}</td>
              </tr>
              <tr style="border-bottom:1px solid #E5E7EB;">
                <td style="color:#6B7280;font-size:13px;font-weight:600;">Tồn kho hiện tại</td>
                <td style="color:${urgencyColor};font-size:18px;font-weight:900;">${currentQty} ${unit}</td>
              </tr>
              <tr>
                <td style="color:#6B7280;font-size:13px;font-weight:600;">Ngưỡng cảnh báo</td>
                <td style="color:#111827;font-size:13px;font-weight:600;">${minStock} ${unit}</td>
              </tr>
            </table>
            <p style="color:#9CA3AF;font-size:12px;margin:20px 0 0;text-align:right;">📅 ${now}</p>
            <div style="text-align:center;margin-top:24px;">
              <a href="http://localhost:3000/admin/chemicals" style="display:inline-block;background:#006B4D;color:#fff;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;">
                Xem Kho Hóa Chất →
              </a>
            </div>
          </td>
        </tr>
        <!-- FOOTER -->
        <tr>
          <td style="background:#F9FAFB;padding:16px;text-align:center;border-top:1px solid #E5E7EB;">
            <p style="color:#9CA3AF;font-size:11px;margin:0;">Email tự động từ Hệ thống In Quảng Phát • Không trả lời email này</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

        await transporter.sendMail({
            from: `"🏭 Kho In Quảng Phát" <${from}>`,
            to,
            subject: `${urgencyText}: ${chemicalName} còn ${currentQty} ${unit}`,
            html: htmlBody,
        });

        console.log(`[Email Alert] Đã gửi cảnh báo "${chemicalName}" đến ${to}`);
    } catch (err) {
        console.error('[Email Alert] Lỗi gửi email:', err.message);
    }
};

module.exports = sendAlertEmail;
