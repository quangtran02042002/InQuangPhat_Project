const https = require('https');

/**
 * Gửi tin nhắn Telegram cảnh báo kho hóa chất
 * @param {object} params
 * @param {string} params.chemicalName
 * @param {number} params.currentQty
 * @param {string} params.unit
 * @param {number} params.minStock
 * @param {string} params.type - 'nhap' | 'xuat'
 */
const sendTelegramAlert = async ({ chemicalName, currentQty, unit, minStock, type }) => {
    if (process.env.TELEGRAM_ENABLED !== 'true') return;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.warn('[Telegram Alert] Thiếu TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID trong .env');
        return;
    }

    const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const urgencyEmoji = currentQty <= 0 ? '🚨' : '⚠️';
    const urgencyText = currentQty <= 0 ? 'HẾT HÀNG' : 'SẮP HẾT';

    const message = `${urgencyEmoji} *CẢNH BÁO KHO HÓA CHẤT*

📦 *Hóa chất:* ${chemicalName}
📉 *Tồn kho hiện tại:* \`${currentQty} ${unit}\`
🔔 *Ngưỡng cảnh báo:* \`${minStock} ${unit}\`
📋 *Thao tác:* ${type === 'xuat' ? 'Xuất kho' : 'Cập nhật tồn kho'}

❗ *Trạng thái:* ${urgencyText} — Cần nhập thêm ngay\\!

🕐 _${now}_
🔗 [Xem kho hóa chất](http://localhost:3000/admin/chemicals)`;

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const body = JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: false,
    });

    return new Promise((resolve) => {
        const req = https.request(
            url,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body),
                },
            },
            (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.ok) {
                            console.log(`[Telegram Alert] Đã gửi cảnh báo "${chemicalName}"`);
                        } else {
                            console.error('[Telegram Alert] API lỗi:', parsed.description);
                        }
                    } catch (_) {}
                    resolve();
                });
            }
        );

        req.on('error', (err) => {
            console.error('[Telegram Alert] Lỗi kết nối:', err.message);
            resolve();
        });

        req.write(body);
        req.end();
    });
};

module.exports = sendTelegramAlert;
