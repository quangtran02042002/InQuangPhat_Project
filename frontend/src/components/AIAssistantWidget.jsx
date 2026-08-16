import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  FaRobot, FaTimes, FaPaperPlane, FaTrash, FaUndo,
  FaBoxes, FaExclamationTriangle, FaWallet, FaIndustry,
  FaUsers, FaTasks, FaShoppingCart, FaClipboardCheck,
  FaCalculator, FaChevronDown, FaCheckCircle, FaMinus
} from 'react-icons/fa';

// Các gợi ý câu hỏi nhanh (luôn hiển thị cố định)
const QUICK_PROMPTS = [
  { id: 'stock', label: '📦 Tồn kho', query: 'Kiểm tra tồn kho các loại giấy chính' },
  { id: 'low_stock', label: '⚠️ Sắp hết', query: 'Những vật tư nào sắp hết hàng?' },
  { id: 'finance', label: '💰 Số dư quỹ', query: 'Tổng tiền quỹ và số dư tài khoản hiện có bao nhiêu?' },
  { id: 'production', label: '🏭 Lệnh SX', query: 'Tiến độ các lệnh sản xuất gần đây' },
  { id: 'debt', label: '👥 Công nợ', query: 'Tình hình công nợ khách hàng và nhà cung cấp' },
  { id: 'todo', label: '📝 Việc cần làm', query: 'Danh sách công việc chưa hoàn thành' },
  { id: 'qc', label: '🔍 Duyệt QC', query: 'Kết quả các phiếu duyệt mẫu QC gần đây' },
  { id: 'calc', label: '📐 Chia khổ in', query: 'Khổ in 65x86 cm chia được bao nhiêu con A4?' },
];

const INITIAL_MESSAGE = {
  id: 'welcome',
  sender: 'ai',
  text: `👋 **Chào bạn! Tôi là Trợ lý AI Xưởng In Quang Phát.**\n\nTôi có thể hỗ trợ bạn trực tiếp các tác vụ:\n- 📦 **Tra cứu & Cảnh báo tồn kho** giấy, mực, kẽm, hóa chất\n- 🔄 **Thao tác trừ/cộng kho** nhanh *(VD: "Xuất 10 ram Couche 300")*\n- 🛒 **Tạo đơn đặt NVL** *(VD: "Đặt 50 ram Couche 250")*\n- 🏭 **Báo cáo tiến độ Lệnh Sản Xuất**\n- 💰 **Kiểm tra số dư quỹ & công nợ**\n- 📝 **Tạo nhanh việc cần làm (Todo)** *(VD: "Tạo task: Gọi NCC giấy")*\n- 🔍 **Tra cứu kết quả duyệt mẫu QC**\n\n*Bạn hãy bấm các nút gợi ý phía dưới hoặc gõ câu hỏi để bắt đầu nhé!*`,
  time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
};

// Simple Markdown Formatter Helper
const formatMarkdown = (text) => {
  if (!text) return '';

  // Xử lý từng dòng
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    // Bold: **text**
    let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#111827]">$1</strong>');
    // Inline code: `text`
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-emerald-50 text-[#006B4D] font-mono text-[11px] rounded border border-emerald-200">$1</code>');

    // Bullet point
    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      const content = formatted.replace(/^[\s•-]+/, '');
      return (
        <div key={lineIdx} className="flex items-start gap-1.5 ml-1 my-0.5">
          <span className="text-[#006B4D] font-bold text-xs mt-0.5">•</span>
          <span className="flex-1" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      );
    }

    // Tiêu đề dạng emoji hoặc chữ hoa
    if (line.startsWith('✅') || line.startsWith('⚠️') || line.startsWith('📦') || line.startsWith('💰') || line.startsWith('🏭') || line.startsWith('👥') || line.startsWith('📝') || line.startsWith('🔍') || line.startsWith('🛒') || line.startsWith('📥')) {
      return (
        <div key={lineIdx} className="font-bold text-[#006B4D] my-1 text-xs sm:text-sm" dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    }

    if (line.trim() === '') {
      return <div key={lineIdx} className="h-1.5" />;
    }

    return (
      <p key={lineIdx} className="my-0.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />
    );
  });
};

const AIAssistantWidget = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('ai_assistant_history');
    return saved ? JSON.parse(saved) : [INITIAL_MESSAGE];
  });
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const messagesEndRef = useRef(null);

  // Lưu lịch sử tin nhắn
  useEffect(() => {
    localStorage.setItem('ai_assistant_history', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Kiểm tra trạng thái AI Engine
  useEffect(() => {
    if (userInfo?.token) {
      axios
        .get('/api/ai-assistant/status', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        })
        .then((res) => setAiStatus(res.data))
        .catch(() => {});
    }
  }, [userInfo?.token]);

  // Gửi tin nhắn
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post('/api/ai-assistant/chat', { message: query }, config);

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply,
        engine: data.engine,
        action: data.action,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `❌ **Đã xảy ra lỗi:** ${err.response?.data?.message || 'Không thể kết nối với máy chủ AI. Vui lòng thử lại sau.'}`,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Xóa lịch sử chat
  const handleClearHistory = () => {
    if (window.confirm('Bạn có chắc muốn xóa lịch sử trò chuyện cùng AI?')) {
      setMessages([INITIAL_MESSAGE]);
      localStorage.removeItem('ai_assistant_history');
    }
  };

  return (
    <aside aria-label="Khung trò chuyện Trợ lý AI Quang Phát" className="font-sans">
      {/* 1. NÚT NỔI TRIGGER (FLOATING BUTTON) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 bg-gradient-to-r from-[#00543c] to-[#006B4D] hover:from-[#004230] hover:to-[#00543c] text-white p-3.5 sm:p-4 rounded-full shadow-2xl flex items-center gap-2.5 transition-all duration-300 transform hover:scale-105 active:scale-95 group border-2 border-emerald-400/40"
          title="Mở Trợ lý AI Quang Phát"
        >
          <div className="relative">
            <FaRobot className="text-xl sm:text-2xl animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-white animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-white" />
          </div>
          <span className="hidden md:inline font-extrabold text-xs tracking-wide">
            Trợ lý AI
          </span>
        </button>
      )}

      {/* 2. CỬA SỔ CHAT DRAWER / WIDGET */}
      {isOpen && (
        <div className="fixed z-50 bottom-3 right-3 sm:bottom-5 sm:right-5 w-[calc(100vw-24px)] sm:w-[430px] h-[85vh] sm:h-[620px] max-h-[700px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100 flex flex-col overflow-hidden animate-fade-in-up transition-all">
          
          {/* HEADER */}
          <div className="bg-gradient-to-r from-[#00543c] via-[#006B4D] to-[#00875A] text-white px-4 py-3.5 flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-inner">
                <FaRobot className="text-lg" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm tracking-tight leading-none">Trợ lý AI Quang Phát</h3>
                  <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
                </div>
                <p className="text-[10px] text-emerald-100/90 font-medium mt-0.5">
                  {aiStatus?.activeEngine || 'Google Gemini AI + Live Database'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                className="p-2 hover:bg-white/15 rounded-xl text-emerald-100 hover:text-white transition active:scale-95"
                title="Xóa lịch sử chat"
              >
                <FaTrash className="text-xs" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/15 rounded-xl text-emerald-100 hover:text-white transition active:scale-95"
                title="Đóng hộp thoại"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
          </div>

          {/* STREAM TIN NHẮN */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 custom-scrollbar bg-slate-50/50 text-xs sm:text-[13px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#006B4D] text-white rounded-br-sm'
                      : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div>{formatMarkdown(msg.text)}</div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1 px-1">
                  <span className="text-[9px] text-gray-400 font-medium">{msg.time}</span>
                  {msg.engine && (
                    <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded font-mono">
                      {msg.engine}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Loading animation */}
            {loading && (
              <div className="flex flex-col items-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2 text-gray-500 text-xs">
                  <div className="w-2 h-2 bg-[#006B4D] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#006B4D] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#006B4D] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[11px] font-bold text-gray-400 ml-1">AI đang xử lý...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 3. THANH GỢI Ý CÂU HỎI NHANH (PINNED - LUÔN XUẤT HIỆN CỐ ĐỊNH PHÍA TRÊN INPUT) */}
          <div className="bg-white border-t border-emerald-50 px-2.5 py-2 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {QUICK_PROMPTS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSendMessage(item.query)}
                  disabled={loading}
                  className="shrink-0 bg-emerald-50/80 hover:bg-[#E6F0ED] active:bg-[#006B4D] active:text-white text-[#006B4D] border border-emerald-200/80 rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all duration-150 shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Ô NHẬP LIỆU (INPUT BAR) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Nhập yêu cầu hoặc câu hỏi..."
              disabled={loading}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none transition"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="w-10 h-10 rounded-2xl bg-[#006B4D] hover:bg-[#00543c] disabled:bg-gray-200 disabled:text-gray-400 text-white flex items-center justify-center transition shadow-md active:scale-95 shrink-0"
              title="Gửi tin nhắn"
            >
              <FaPaperPlane className="text-xs" />
            </button>
          </form>

        </div>
      )}
    </aside>
  );
};

export default AIAssistantWidget;
