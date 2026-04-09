import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaPaperPlane, FaFacebook } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import { toast } from 'react-toastify';
import axios from 'axios'; // 1. Import axios
import Meta from '../components/Meta';

const ContactScreen = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Thêm state loading để khóa nút khi đang gửi

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        // 2. GỌI API GỬI VỀ SERVER
        // Lưu ý: Form này là liên hệ chung, nên productName mình để mặc định
        await axios.post('/api/quotes', {
            name,
            phone,
            note: message, // Map 'message' từ form sang 'note' trong DB
            productName: 'Yêu cầu từ trang Liên Hệ', // Đánh dấu nguồn
            quantity: 0 // Mặc định
        });

        toast.success('Gửi yêu cầu thành công! Chúng tôi sẽ gọi lại ngay.');
        
        // Reset form
        setName('');
        setPhone('');
        setMessage('');
    } catch (error) {
        toast.error('Lỗi kết nối. Vui lòng thử lại hoặc gọi hotline.');
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-[#111827]">
      <Meta title="Liên hệ - Báo giá | In Quang Phát" />

      {/* HEADER BANNER - Tối giản */}
      <div className="bg-white border-b border-gray-200 py-16 md:py-24 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#E6F0ED] text-[#006B4D] uppercase tracking-widest mb-4">
                Liên hệ
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#111827] mb-4 tracking-tight">Liên Hệ Với Chúng Tôi</h1>
            <p className="text-[#6B7280] text-lg">Hãy để lại lời nhắn hoặc ghé thăm xưởng in để được tư vấn trực tiếp</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* CỘT TRÁI: THÔNG TIN */}
          <div className="space-y-8">
            <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100">
                <h2 className="text-2xl font-extrabold text-[#111827] mb-8">Thông tin kết nối</h2>
                
                <div className="space-y-8">
                    <div className="flex items-start gap-5">
                        <div className="w-12 h-12 bg-[#E6F0ED] rounded-xl flex items-center justify-center text-[#006B4D] text-xl shrink-0 border border-[#006B4D]/10">
                            <FaMapMarkerAlt />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#111827] mb-1">Địa chỉ xưởng/Văn phòng:</h3>
                            <p className="text-[#6B7280] leading-relaxed">Số 5, Đường Số 4, Cụm công nghiệp An Hoà, P.Hương An, Huế</p>
                            <p className="text-[#6B7280] text-sm italic mt-1">(Có chỗ đỗ ô tô cho khách hàng)</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-5">
                        <div className="w-12 h-12 bg-[#E6F0ED] rounded-xl flex items-center justify-center text-[#006B4D] text-xl shrink-0 border border-[#006B4D]/10">
                            <FaPhoneAlt />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#111827] mb-1">Hotline / Zalo:</h3>
                            <p className="text-[#006B4D] font-extrabold text-xl">0903.597.686 (Mr. Tấn)</p>
                            <p className="text-[#6B7280] mt-1">0935.110.639 (Quang)</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-5">
                        <div className="w-12 h-12 bg-[#E6F0ED] rounded-xl flex items-center justify-center text-[#006B4D] text-xl shrink-0 border border-[#006B4D]/10">
                            <FaEnvelope />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#111827] mb-1">Email báo giá:</h3>
                            <p className="text-[#6B7280]">inquangphat@gmail.com</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-5">
                        <div className="w-12 h-12 bg-[#E6F0ED] rounded-xl flex items-center justify-center text-[#006B4D] text-xl shrink-0 border border-[#006B4D]/10">
                            <FaClock />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#111827] mb-1">Giờ làm việc:</h3>
                            <p className="text-[#6B7280]">Thứ 2 - Thứ 7: 7:30 - 17:00</p>
                            <p className="text-[#6B7280] text-sm mt-1">Chủ nhật: Nghỉ (Nhận file online)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* BẢN ĐỒ GOOGLE MAPS */}
            <div className="bg-white p-2 rounded-2xl border border-gray-100 h-80 overflow-hidden">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.340057007297!2d107.5456783152865!3d16.45828803326127!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3141a14c36a6e52b%3A0x74271089855502f6!2zQ8O0bmcgVHkgVE5ISCBNVEMgSW4gUXVhbmcgUGjDoXQ!5e0!3m2!1svi!2s!4v1646731200000!5m2!1svi!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                title="Map"
                className="rounded-xl"
                ></iframe>
            </div>
          </div>

          {/* CỘT PHẢI: FORM LIÊN HỆ */}
          <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100 h-fit">
             <h2 className="text-2xl font-extrabold text-[#111827] mb-8">Gửi yêu cầu báo giá nhanh</h2>
             <form onSubmit={submitHandler} className="space-y-6">
                 <div>
                     <label className="block text-[#111827] font-bold mb-2">Họ và tên của bạn</label>
                     <input 
                       type="text" required 
                       value={name} onChange={(e) => setName(e.target.value)}
                       className="w-full border border-gray-200 bg-[#F9FAFB] px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#006B4D] focus:border-[#006B4D] transition-all outline-none text-[#111827]"
                       placeholder="Nhập tên..."
                     />
                 </div>
                 <div>
                     <label className="block text-[#111827] font-bold mb-2">Số điện thoại / Zalo</label>
                     <input 
                       type="text" required 
                       value={phone} onChange={(e) => setPhone(e.target.value)}
                       className="w-full border border-gray-200 bg-[#F9FAFB] px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#006B4D] focus:border-[#006B4D] transition-all outline-none text-[#111827]"
                       placeholder="Nhập số điện thoại để chúng tôi gọi lại..."
                     />
                 </div>
                 <div>
                     <label className="block text-[#111827] font-bold mb-2">Nội dung cần tư vấn</label>
                     <textarea 
                       rows="5" required
                       value={message} onChange={(e) => setMessage(e.target.value)}
                       className="w-full border border-gray-200 bg-[#F9FAFB] px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#006B4D] focus:border-[#006B4D] transition-all outline-none text-[#111827]"
                       placeholder="Ví dụ: Tôi cần in 500 hộp giấy kích thước 20x10x5cm..."
                     ></textarea>
                 </div>

                 <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full bg-[#006B4D] hover:bg-[#00553d] text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                     {loading ? 'Đang gửi...' : <><FaPaperPlane className="mr-2" /> GỬI YÊU CẦU NGAY</>}
                 </button>

                 <p className="text-center text-[#6B7280] text-sm mt-6">
                    Hoặc chat nhanh qua Zalo: 
                    <a href="https://zalo.me/0903597686" target="_blank" rel="noreferrer" className="text-[#006B4D] font-bold hover:underline inline-flex items-center gap-1 ml-1">
                        <SiZalo /> Chat ngay
                    </a>
                </p>
                 
             </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactScreen;