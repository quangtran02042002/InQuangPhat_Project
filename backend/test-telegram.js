require('dotenv').config();
const sendTelegram = require('./utils/sendTelegram');

async function test() {
    console.log("Kiểm tra Token:", process.env.TELEGRAM_BOT_TOKEN ? "Đã điền" : "Trống");
    console.log("Kiểm tra Chat ID:", process.env.TELEGRAM_CHAT_ID ? "Đã điền" : "Trống");
    console.log("Đang kích hoạt gửi tin nhắn...");
    
    try {
        await sendTelegram("✅ *THÔNG BÁO TỪ HỆ THỐNG*\n\nKết nối Telegram thành công\\! Bot này đã sẵn sàng phục vụ In Quảng Phát\\.");
        console.log("✅ Gắn tín hiệu gửi XONG! Hãy kiểm tra điện thoại.");
    } catch (error) {
        console.error("❌ Lỗi:", error);
    }
}
test();
