import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  FaRobot, FaTimes, FaPaperPlane, FaTrash, FaUndo,
  FaBoxes, FaExclamationTriangle, FaWallet, FaIndustry,
  FaUsers, FaTasks, FaShoppingCart, FaClipboardCheck,
  FaCalculator, FaChevronDown, FaCheckCircle, FaMinus,
  FaThLarge, FaLightbulb, FaChevronLeft, FaChevronRight,
  FaArrowRight, FaMagic
} from 'react-icons/fa';

// Phân nhóm danh mục gợi ý tác vụ chuyên nghiệp
const CATEGORIZED_PROMPTS = [
  {
    category: 'Kho & Vật tư',
    icon: FaBoxes,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    items: [
      { id: 'stock', title: 'Tồn kho giấy & mực', query: 'Kiểm tra tồn kho các loại giấy chính', desc: 'Tra cứu số lượng giấy, kẽm, mực' },
      { id: 'low_stock', title: 'Cảnh báo sắp hết', query: 'Những vật tư nào sắp hết hàng?', desc: 'Vật tư dưới ngưỡng an toàn' },
    ],
  },
  {
    category: 'Tài chính & Quỹ',
    icon: FaWallet,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    items: [
      { id: 'finance', title: 'Tổng số dư quỹ', query: 'Tổng tiền quỹ và số dư tài khoản hiện có bao nhiêu?', desc: 'Tiền mặt & Ngân hàng' },
      { id: 'debt', title: 'Công nợ tổng hợp', query: 'Tình hình công nợ khách hàng và nhà cung cấp', desc: 'Khoản phải thu & phải trả' },
    ],
  },
  {
    category: 'Sản xuất & Đơn hàng',
    icon: FaIndustry,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    items: [
      { id: 'production', title: 'Tiến độ Lệnh SX', query: 'Tiến độ các lệnh sản xuất gần đây', desc: 'Trạng thái bài in, công đoạn' },
      { id: 'material_order', title: 'Đơn đặt NVL', query: 'Danh sách các đơn đặt nguyên vật liệu đang chờ hàng về', desc: 'Theo dõi hàng đã đặt' },
    ],
  },
  {
    category: 'Nhiệm vụ & QC',
    icon: FaTasks,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    items: [
      { id: 'todo', title: 'Việc chưa xong', query: 'Danh sách công việc chưa hoàn thành', desc: 'Todo list và mức ưu tiên' },
      { id: 'qc', title: 'Duyệt mẫu QC', query: 'Kết quả các phiếu duyệt mẫu QC gần đây', desc: 'Mẫu in lụa đạt / hỏng' },
    ],
  },
  {
    category: 'Kỹ thuật in ấn',
    icon: FaCalculator,
    color: 'text-rose-600 bg-rose-50 border-rose-200',
    items: [
      { id: 'calc', title: 'Chia khổ giấy in', query: 'Khổ in 65x86 cm chia được bao nhiêu con A4?', desc: 'Tính toán khổ cắt tối ưu' },
    ],
  },
];

const INITIAL_MESSAGE = {
  id: 'welcome',
  sender: 'ai',
  text: `👋 **Chào bạn! Tôi là Trợ lý AI Xưởng In Quang Phát.**\n\nTôi có thể hỗ trợ bạn trực tiếp các tác vụ:\n- 📦 **Tra cứu & Cảnh báo tồn kho** giấy, mực, kẽm, hóa chất\n- 🔄 **Thao tác trừ/cộng kho** nhanh *(VD: "Xuất 10 ram Couche 300")*\n- 🛒 **Tạo đơn đặt NVL** *(VD: "Đặt 50 ram Couche 250")*\n- 🏭 **Báo cáo tiến độ Lệnh Sản Xuất**\n- 💰 **Kiểm tra số dư quỹ & công nợ**\n- 📝 **Tạo nhanh việc cần làm (Todo)** *(VD: "Tạo task: Gọi NCC giấy")*\n- 🔍 **Tra cứu kết quả duyệt mẫu QC**\n\n*Bạn hãy bấm các gợi ý bên cạnh hoặc gõ câu hỏi để bắt đầu nhé!*`,
  time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
};

// Simple Markdown Formatter Helper
const formatMarkdown = (text) => {
  if (!text) return '';

  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#111827]">$1</strong>');
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-emerald-50 text-[#006B4D] font-mono text-[11px] rounded border border-emerald-200">$1</code>');

    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      const content = formatted.replace(/^[\s•-]+/, '');
      return (
        <div key={lineIdx} className="flex items-start gap-1.5 ml-1 my-0.5">
          <span className="text-[#006B4D] font-bold text-xs mt-0.5">•</span>
          <span className="flex-1" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      );
    }

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
  const [showSidePanel, setShowSidePanel] = useState(true); // Mặc định mở thanh gợi ý phụ bên cạnh
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

      {/* 2. CỬA SỔ CHAT + THANH PHỤ GỢI Ý (DUAL-PANE WIDGET) */}
      {isOpen && (
        <div className="fixed z-50 bottom-3 right-3 sm:bottom-5 sm:right-5 w-[calc(100vw-24px)] md:w-auto h-[88vh] sm:h-[630px] max-h-[720px] flex items-stretch shadow-2xl rounded-3xl overflow-hidden border border-emerald-100/80 bg-white/95 backdrop-blur-xl animate-fade-in-up transition-all">
          
          {/* ============================================================ */}
          {/* THANH PHỤ GỢI Ý TÁC VỤ (SIDE PANEL) - NẰM BÊN CẠNH KHUNG CHAT */}
          {/* ============================================================ */}
          {showSidePanel && (
            <div className="w-full md:w-[250px] bg-slate-50/95 border-r border-gray-200/80 flex flex-col shrink-0 animate-fade-in-left">
              {/* Header thanh gợi ý */}
              <div className="p-3.5 bg-gradient-to-r from-slate-100 to-emerald-50/50 border-b border-gray-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#006B4D] text-white flex items-center justify-center shadow-xs">
                    <FaLightbulb className="text-xs" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-[#111827]">Tác Vụ Gợi Ý</h4>
                    <p className="text-[10px] text-gray-500">Chạm để hỏi ngay</p>
                  </div>
                </div>
                {/* Nút đóng side panel trên mobile */}
                <button
                  onClick={() => setShowSidePanel(false)}
                  className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                  title="Đóng gợi ý"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>

              {/* Danh sách các nhóm tác vụ dạng thẻ dọc (không bị tràn ngang) */}
              <div className="flex-1 p-2.5 overflow-y-auto space-y-3 custom-scrollbar text-xs">
                {CATEGORIZED_PROMPTS.map((group, gIdx) => {
                  const IconComp = group.icon;
                  return (
                    <div key={gIdx} className="space-y-1">
                      <div className="flex items-center gap-1.5 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                        <IconComp className="text-[9px]" />
                        <span>{group.category}</span>
                      </div>
                      <div className="space-y-1">
                        {group.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              handleSendMessage(item.query);
                              // Trên mobile tự động chuyển về màn chat sau khi bấm
                              if (window.innerWidth < 768) {
                                setShowSidePanel(false);
                              }
                            }}
                            disabled={loading}
                            className="w-full text-left p-2 rounded-xl bg-white hover:bg-emerald-50/80 border border-gray-100 hover:border-emerald-200 transition-all duration-150 group shadow-2xs hover:shadow-xs active:scale-98"
                          >
                            <div className="font-bold text-[#111827] group-hover:text-[#006B4D] text-[11px] leading-tight">
                              {item.title}
                            </div>
                            <div className="text-[9px] text-gray-400 mt-0.5 leading-snug truncate">
                              {item.desc}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer thanh gợi ý */}
              <div className="p-2.5 bg-white border-t border-gray-100 text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
                <FaMagic className="text-emerald-500 text-[9px]" />
                <span>AI xử lý số liệu tự động</span>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* KHUNG CHAT CHÍNH (MAIN CHAT BOX) */}
          {/* ============================================================ */}
          <div className={`w-full md:w-[410px] flex flex-col bg-white shrink-0 ${!showSidePanel ? 'w-full md:w-[460px]' : ''}`}>
            
            {/* HEADER KHUNG CHAT */}
            <div className="bg-gradient-to-r from-[#00543c] via-[#006B4D] to-[#00875A] text-white px-3.5 py-3 flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-inner">
                  <FaRobot className="text-base" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-xs sm:text-sm tracking-tight leading-none">Trợ lý AI Quang Phát</h3>
                    <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
                  </div>
                  <p className="text-[9px] text-emerald-100/90 font-medium mt-0.5 truncate max-w-[180px]">
                    {aiStatus?.activeEngine || 'Google Gemini AI + Live Database'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Nút Bật/Tắt thanh gợi ý bên cạnh */}
                <button
                  onClick={() => setShowSidePanel(!showSidePanel)}
                  className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    showSidePanel
                      ? 'bg-white/20 text-white'
                      : 'bg-emerald-700/80 hover:bg-white/20 text-emerald-100 hover:text-white'
                  }`}
                  title={showSidePanel ? 'Ẩn thanh gợi ý' : 'Mở thanh gợi ý tác vụ'}
                >
                  <FaLightbulb className="text-xs" />
                  <span className="text-[10px] hidden sm:inline">Gợi ý</span>
                </button>

                <button
                  onClick={handleClearHistory}
                  className="p-1.5 hover:bg-white/15 rounded-lg text-emerald-100 hover:text-white transition active:scale-95"
                  title="Xóa lịch sử chat"
                >
                  <FaTrash className="text-xs" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/15 rounded-lg text-emerald-100 hover:text-white transition active:scale-95"
                  title="Đóng hộp thoại"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            </div>

            {/* STREAM TIN NHẮN */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar bg-slate-50/60 text-xs sm:text-[13px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 shadow-xs ${
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
                      <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded font-mono border border-emerald-100">
                        {msg.engine}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading animation */}
              {loading && (
                <div className="flex flex-col items-start">
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-xs flex items-center gap-2 text-gray-500 text-xs">
                    <div className="w-2 h-2 bg-[#006B4D] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[#006B4D] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[#006B4D] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[11px] font-bold text-gray-400 ml-1">AI đang suy nghĩ & tra cứu...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* THANH GỢI Ý THU GỌN (Nếu side panel đang ẩn) */}
            {!showSidePanel && (
              <div className="bg-emerald-50/50 border-t border-emerald-100 px-3 py-1.5 flex items-center justify-between text-[11px] shrink-0">
                <span className="text-gray-500 font-medium flex items-center gap-1">
                  <FaLightbulb className="text-amber-500 text-[10px]" />
                  <span>Gợi ý tác vụ nhanh:</span>
                </span>
                <button
                  onClick={() => setShowSidePanel(true)}
                  className="text-[#006B4D] font-bold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Mở bảng gợi ý</span>
                  <FaChevronRight className="text-[9px]" />
                </button>
              </div>
            )}

            {/* Ô NHẬP LIỆU (INPUT BAR) */}
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

        </div>
      )}
    </aside>
  );
};

export default AIAssistantWidget;
