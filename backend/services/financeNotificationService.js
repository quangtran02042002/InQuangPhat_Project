const Notification = require('../models/Notification');
const sendTelegram = require('../utils/sendTelegram');
const sendEmail = require('../utils/sendEmail');

const escapeMarkdown = (text) =>
  String(text).replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');

const formatVND = (n) =>
  new Intl.NumberFormat('vi-VN').format(Math.round(n)) + 'đ';

/**
 * Send debt reminder via 3 channels: Notification, Telegram, Email
 * @param {{ type: 'receivable'|'payable', doc: MongooseDocument }} opts
 */
const sendDebtReminder = async ({ type, doc }) => {
  const isReceivable = type === 'receivable';
  const partyName = isReceivable ? doc.customerName : doc.supplierName;
  const amount = doc.outstandingAmount;
  const dueDate = doc.dueDate ? new Date(doc.dueDate).toLocaleDateString('vi-VN') : 'Chưa có';
  const daysOverdue = doc.debtAgeDays || 0;
  const docCode = doc.documentCode;

  const title = isReceivable
    ? `⚠️ Thu nợ: ${partyName} - ${formatVND(amount)}`
    : `⚠️ Trả nợ: ${partyName} - ${formatVND(amount)}`;

  const message = isReceivable
    ? `Khách hàng ${partyName} còn nợ ${formatVND(amount)} (${docCode}). Hạn: ${dueDate}. Quá hạn ${daysOverdue} ngày.`
    : `Phải trả ${partyName} số tiền ${formatVND(amount)} (${docCode}). Hạn: ${dueDate}. Quá hạn ${daysOverdue} ngày.`;

  // 1. Internal Notification
  try {
    await Notification.create({
      title,
      message,
      type: 'debt',
      link: '/admin/finance',
    });
  } catch (e) {
    console.error('[FinanceNotif] Notification error:', e.message);
  }

  // 2. Telegram
  try {
    const p = escapeMarkdown;
    const tgMsg = isReceivable
      ? `⚠️ *NHẮC NỢ PHẢI THU*\n` +
        `👤 Khách hàng: *${p(partyName)}*\n` +
        `💰 Còn nợ: *${p(formatVND(amount))}*\n` +
        `📄 Mã CT: \`${p(docCode)}\`\n` +
        `📅 Hạn thanh toán: ${p(dueDate)}\n` +
        `⏰ Quá hạn: *${p(daysOverdue)} ngày*`
      : `⚠️ *NHẮC NỢ PHẢI TRẢ*\n` +
        `🏭 Nhà cung cấp: *${p(partyName)}*\n` +
        `💰 Phải trả: *${p(formatVND(amount))}*\n` +
        `📄 Mã CT: \`${p(docCode)}\`\n` +
        `📅 Hạn thanh toán: ${p(dueDate)}\n` +
        `⏰ Quá hạn: *${p(daysOverdue)} ngày*`;

    await sendTelegram(tgMsg);
  } catch (e) {
    console.error('[FinanceNotif] Telegram error:', e.message);
  }

  // 3. Email (optional — customer must have email)
  try {
    let emailTarget = null;
    if (isReceivable && doc.customer && doc.customer.contacts && doc.customer.contacts.length > 0) {
      const contact = doc.customer.contacts.find(c => c.email) || doc.customer.contacts[0];
      emailTarget = contact?.email;
    }
    if (emailTarget) {
      await sendEmail({
        email: emailTarget,
        subject: `[In Quang Phát] Nhắc nhở thanh toán - ${docCode}`,
        message: `
          <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
            <h2 style="color:#006B4D">Nhắc nhở thanh toán</h2>
            <p>Kính gửi <strong>${partyName}</strong>,</p>
            <p>Chúng tôi xin nhắc nhở về khoản công nợ chưa thanh toán:</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr><td style="padding:8px;background:#f9fafb;font-weight:bold">Mã chứng từ:</td><td style="padding:8px">${docCode}</td></tr>
              <tr><td style="padding:8px;background:#f9fafb;font-weight:bold">Số tiền còn nợ:</td><td style="padding:8px;color:#dc2626;font-weight:bold">${formatVND(amount)}</td></tr>
              <tr><td style="padding:8px;background:#f9fafb;font-weight:bold">Hạn thanh toán:</td><td style="padding:8px">${dueDate}</td></tr>
            </table>
            <p>Vui lòng thanh toán sớm để tránh phát sinh thêm. Xin cảm ơn!</p>
            <p style="color:#6b7280;font-size:12px">In Quang Phát — 📞 Liên hệ khi cần hỗ trợ</p>
          </div>
        `,
      });
    }
  } catch (e) {
    console.error('[FinanceNotif] Email error:', e.message);
  }
};

/**
 * Check and send automated reminders for overdue debts
 * Should be called periodically (cron)
 */
const sendAutoReminders = async () => {
  const Receivable = require('../models/Receivable');
  const Payable = require('../models/Payable');
  try {
    // Overdue receivables not reminded in last 3 days
    const overdue = await Receivable.find({
      status: { $in: ['overdue', 'partial'] },
      debtAgeGroup: { $in: ['16-30', '31-60', '61-90', 'over90'] },
      $or: [
        { lastReminderSentAt: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } },
        { lastReminderSentAt: { $exists: false } },
      ],
    }).populate('customer');

    for (const rec of overdue) {
      await sendDebtReminder({ type: 'receivable', doc: rec });
      rec.lastReminderSentAt = new Date();
      rec.reminderCount = (rec.reminderCount || 0) + 1;
      await rec.save();
    }
    console.log(`[FinanceNotif] Sent ${overdue.length} auto reminders`);
  } catch (e) {
    console.error('[FinanceNotif] Auto reminder error:', e.message);
  }
};

module.exports = { sendDebtReminder, sendAutoReminders };
