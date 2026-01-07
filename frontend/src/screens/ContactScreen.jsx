import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaPaperPlane, FaFacebook } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Meta from '../components/Meta';
import { SiZalo } from 'react-icons/si';
const ContactScreen = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const submitHandler = (e) => {
    e.preventDefault();
    // Ở đây sau này có thể gọi API gửi mail
    toast.success('Cảm ơn bạn! Chúng tôi đã nhận được thông tin và sẽ liên hệ lại sớm nhất.');
    setName('');
    setPhone('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Meta title="Liên hệ - Báo giá | In Quang Phát" />

      {/* HEADER BANNER */}
      <div className="bg-blue-900 text-white py-16 text-center">
        <h1 className="text-4xl font-bold uppercase mb-2">Liên Hệ Với Chúng Tôi</h1>
        <p className="text-blue-200">Hãy để lại lời nhắn hoặc ghé thăm xưởng in để được tư vấn trực tiếp</p>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* CỘT TRÁI: THÔNG TIN LIÊN HỆ */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Thông tin kết nối</h2>
                
                <div className="space-y-6">
                    <div className="flex items-start">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl mr-4 flex-shrink-0">
                            <FaMapMarkerAlt />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-700">Địa chỉ xưởng/Văn phòng:</h3>
                            <p className="text-gray-600">Số 123 Đường Cầu Giấy, Quận Cầu Giấy, Hà Nội</p>
                            <p className="text-gray-500 text-sm italic">(Có chỗ đỗ ô tô cho khách hàng)</p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl mr-4 flex-shrink-0">
                            <FaPhoneAlt />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-700">Hotline / Zalo:</h3>
                            <p className="text-red-600 font-bold text-lg">0909.123.456 (Mr. Quang)</p>
                            <p className="text-gray-600">0988.888.999 (Kinh doanh)</p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xl mr-4 flex-shrink-0">
                            <FaEnvelope />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-700">Email báo giá:</h3>
                            <p className="text-gray-600">inquangphat@gmail.com</p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xl mr-4 flex-shrink-0">
                            <FaClock />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-700">Giờ làm việc:</h3>
                            <p className="text-gray-600">Thứ 2 - Thứ 7: 8:00 - 17:30</p>
                            <p className="text-gray-500 text-sm">Chủ nhật: Nghỉ (Nhận file online)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* BẢN ĐỒ GOOGLE MAPS (EMBED) */}
            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 h-80 overflow-hidden">
                <iframe 
                    title="Ban do"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.863981044734!2d105.78913331476343!3d21.03812778599329!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab354920c233%3A0x5d0313a3bfdc4f37!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBTxrAgcGjhuqFtIEjDoCBO4buZaQ!5e0!3m2!1svi!2s!4v1647850000000!5m2!1svi!2s" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy"
                ></iframe>
            </div>
          </div>

          {/* CỘT PHẢI: FORM LIÊN HỆ */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
             <h2 className="text-2xl font-bold text-gray-800 mb-6">Gửi yêu cầu báo giá nhanh</h2>
             <form onSubmit={submitHandler} className="space-y-6">
                 <div>
                     <label className="block text-gray-700 font-medium mb-2">Họ và tên của bạn</label>
                     <input 
                        type="text" required 
                        value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Nhập tên..."
                     />
                 </div>
                 <div>
                     <label className="block text-gray-700 font-medium mb-2">Số điện thoại / Zalo</label>
                     <input 
                        type="text" required 
                        value={phone} onChange={(e) => setPhone(e.target.value)}
                        className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Nhập số điện thoại để chúng tôi gọi lại..."
                     />
                 </div>
                 <div>
                     <label className="block text-gray-700 font-medium mb-2">Nội dung cần tư vấn</label>
                     <textarea 
                        rows="5" required
                        value={message} onChange={(e) => setMessage(e.target.value)}
                        className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ví dụ: Tôi cần in 500 hộp giấy kích thước 20x10x5cm..."
                     ></textarea>
                 </div>

                 <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center">
                     <FaPaperPlane className="mr-2" /> GỬI YÊU CẦU NGAY
                 </button>

                 <p className="text-center text-gray-500 text-sm mt-4">
    Hoặc chat nhanh qua Zalo: 
    <a href="https://zalo.me/0909123456" target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline flex items-center justify-center gap-1">
        <SiZalo /> Chat ngay {/* <--- Dùng SiZalo ở đây */}
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