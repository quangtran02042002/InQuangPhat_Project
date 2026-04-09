const https = require('https');

/**
 * Gửi tin nhắn Telegram linh hoạt
 * @param {string} message - Tin nhắn cần gửi, hỗ trợ định dạng MarkdownV2. Chú ý các ký tự đặc biệt như -, ., +, =, (, ) cần được escape bằng \ (ví dụ \-)
 */
const sendTelegram = async (message) => {
    if (process.env.TELEGRAM_ENABLED !== 'true') return;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.warn('[Telegram] Thiếu TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID trong .env');
        return;
    }

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
                        if (!parsed.ok) {
                            console.error('[Telegram] API lỗi:', parsed.description);
                        }
                    } catch (_) {}
                    resolve();
                });
            }
        );

        req.on('error', (err) => {
            console.error('[Telegram] Lỗi kết nối:', err.message);
            resolve();
        });

        req.write(body);
        req.end();
    });
};

module.exports = sendTelegram;
