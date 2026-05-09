import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import { toast } from 'react-toastify';
import axios from 'axios';
import Meta from '../components/Meta';
import useScrollReveal from '../hooks/useScrollReveal';

const ContactScreen = () => {
  const sectionRef = useScrollReveal();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/quotes', {
        name,
        phone,
        note: message,
        productName: 'Yêu cầu từ trang Liên Hệ',
        quantity: 0,
      });
      setSubmitted(true);
      toast.success('Gửi yêu cầu thành công! Chúng tôi sẽ gọi lại ngay.');
      setName('');
      setPhone('');
      setMessage('');
    } catch (error) {
      toast.error('Lỗi kết nối. Vui lòng thử lại hoặc gọi hotline.');
    } finally {
      setLoading(false);
    }
  };

  const contactItems = [
    {
      icon: <FaMapMarkerAlt />,
      bg: 'bg-rose-50',
      color: 'text-rose-500',
      label: 'Địa chỉ xưởng',
      value: 'Số 5, Đường số 4, cụm CN An Hoà, phường Hương An, Huế, Việt Nam',
      sub: '(Có chỗ đỗ ô tô cho khách hàng)',
    },
    {
      icon: <FaPhoneAlt />,
      bg: 'bg-green-50',
      color: 'text-green-500',
      label: 'Hotline / Zalo',
      value: '0903.597.686 (Mr. Tấn)',
      sub: '0935.110.639 (Quang)',
    },
    {
      icon: <FaEnvelope />,
      bg: 'bg-amber-50',
      color: 'text-amber-500',
      label: 'Email báo giá',
      value: 'inquangphat@gmail.com',
    },
    {
      icon: <FaClock />,
      bg: 'bg-brand-50',
      color: 'text-brand-600',
      label: 'Giờ làm việc',
      value: 'Thứ 2 — Thứ 7: 7:30 – 17:00',
      sub: 'Chủ nhật: Nghỉ (Nhận file online)',
    },
  ];

  const trustBadges = [
    '✓ Báo giá trong vòng 2 giờ',
    '✓ Miễn phí thiết kế',
    '✓ Cam kết đúng hẹn',
    '✓ Hỗ trợ giao hàng toàn quốc',
  ];

  return (
    <div ref={sectionRef} className="min-h-screen bg-surface font-display text-gray-900">
      <Meta title="Liên hệ - Báo giá | In Quang Phát" />

      {/* HERO BANNER */}
      <div className="relative bg-white border-b border-gray-100 py-20 md:py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/60 to-transparent pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-100 rounded-full opacity-30 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 max-w-3xl relative z-10">
          <div className="reveal">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-brand-50 text-brand-600 uppercase tracking-widest border border-brand-100 mb-5">
              Liên hệ & Báo giá
            </span>
          </div>
          <h1 className="reveal delay-100 text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Bắt đầu dự án <span className="text-gradient-brand">của bạn</span>
          </h1>
          <p className="reveal delay-200 text-gray-500 text-lg">
            Hãy để lại thông tin — chúng tôi sẽ liên hệ và tư vấn miễn phí trong vòng 2 giờ!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* LEFT: Contact info + Map */}
          <div className="space-y-6">
            {/* Info cards */}
            <div className="bg-white rounded-3xl border border-gray-100 p-7 md:p-8 shadow-ambient">
              <h2 className="reveal text-xl font-extrabold text-gray-900 mb-7">Thông tin kết nối</h2>
              <div className="space-y-6">
                {contactItems.map((item, i) => (
                  <div key={i} className="reveal flex items-start gap-4" style={{ transitionDelay: `${i * 80}ms` }}>
                    <div className={`w-11 h-11 ${item.bg} ${item.color} rounded-xl flex items-center justify-center flex-shrink-0 text-lg`}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{item.label}</div>
                      <div className="font-bold text-gray-800">{item.value}</div>
                      {item.sub && <div className="text-gray-400 text-sm mt-0.5">{item.sub}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="reveal bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-ambient h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.340057007297!2d107.5456783152865!3d16.45828803326127!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3141a14c36a6e52b%3A0x74271089855502f6!2zQ8O0bmcgVHkgVE5ISCBNVEMgSW4gUXVhbmcgUGjDoXQ!5e0!3m2!1svi!2s!4v1646731200000!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Bản đồ In Quang Phát"
              />
            </div>

            {/* Direct contact buttons */}
            <div className="reveal flex flex-wrap gap-3">
              <a
                href="https://zalo.me/0903597686"
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-3.5 rounded-2xl font-bold transition-all duration-300 text-sm shadow-ambient"
              >
                <SiZalo size={18} /> Chat Zalo ngay
              </a>
              <a
                href="tel:0903597686"
                className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-brand-600 hover:text-brand-600 text-gray-700 py-3.5 rounded-2xl font-bold transition-all duration-300 text-sm"
              >
                <FaPhoneAlt size={14} /> 0903.597.686
              </a>
            </div>
          </div>

          {/* RIGHT: Contact form */}
          <div className="reveal-right">
            <div className="bg-white rounded-3xl border border-gray-100 p-7 md:p-9 shadow-ambient">
              {submitted ? (
                /* Success state */
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <FaCheckCircle className="text-brand-600 text-4xl" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Đã nhận yêu cầu!</h3>
                  <p className="text-gray-500 text-sm">Chúng tôi sẽ liên hệ với bạn trong vòng 2 giờ. Cảm ơn!</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-brand-600 font-bold text-sm hover:underline"
                  >
                    Gửi yêu cầu khác
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-extrabold text-gray-900 mb-2">Gửi yêu cầu báo giá</h2>
                  <p className="text-gray-400 text-sm mb-7">Điền thông tin và nhận báo giá trong 2 giờ.</p>

                  <form onSubmit={submitHandler} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        Họ và tên <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-gray-200 bg-surface-low px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none text-gray-800 text-sm placeholder-gray-400"
                        placeholder="Nhập họ và tên..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        Số điện thoại / Zalo <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full border border-gray-200 bg-surface-low px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none text-gray-800 text-sm placeholder-gray-400"
                        placeholder="Số điện thoại để chúng tôi gọi lại..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        Nội dung cần tư vấn <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows="4"
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full border border-gray-200 bg-surface-low px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none text-gray-800 text-sm placeholder-gray-400 resize-none"
                        placeholder="VD: Tôi cần in 500 hộp giấy kích thước 20×10×5cm..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-ambient hover:shadow-floating ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                    >
                      {loading ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang gửi...</>
                      ) : (
                        <><FaPaperPlane /> Gửi yêu cầu báo giá ngay</>
                      )}
                    </button>
                  </form>

                  {/* Trust badges */}
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-2">
                      {trustBadges.map((badge, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                          <span className="text-brand-600 font-bold">{badge.split(' ').slice(0, 1)}</span>
                          {badge.split(' ').slice(1).join(' ')}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactScreen;