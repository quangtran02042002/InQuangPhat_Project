import React, { useState } from 'react';
import axios from 'axios';
import { FaPhoneAlt, FaMapMarkerAlt, FaEnvelope, FaPaperPlane } from 'react-icons/fa';

const ContactScreen = () => {
  // State lưu trữ dữ liệu form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    productName: '',
    quantity: '',
    message: ''
  });
  
  const [status, setStatus] = useState(null); // null, 'success', 'error'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/quotes', formData);
      setStatus('success');
      setFormData({ name: '', phone: '', email: '', productName: '', quantity: '', message: '' }); // Reset form
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-10 uppercase">Liên hệ & Báo giá in ấn</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-lg overflow-hidden">
          
          {/* CỘT TRÁI: THÔNG TIN LIÊN HỆ */}
          <div className="bg-blue-800 text-white p-10 flex flex-col justify-center">
            <h3 className="text-2xl font-bold mb-6">Thông tin liên hệ</h3>
            <p className="mb-6 text-blue-100">Hãy để lại thông tin, nhân viên kinh doanh của In Quang Phát sẽ gọi lại tư vấn chi tiết và báo giá tốt nhất cho bạn trong vòng 30 phút.</p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <FaMapMarkerAlt className="text-2xl mr-4 mt-1 text-yellow-400" />
                <div>
                  <h4 className="font-bold">Địa chỉ xưởng:</h4>
                  <p className="text-sm text-blue-100">Số 123, Đường ABC, Quận Cầu Giấy, Hà Nội</p>
                </div>
              </div>

              <div className="flex items-start">
                <FaPhoneAlt className="text-2xl mr-4 mt-1 text-yellow-400" />
                <div>
                  <h4 className="font-bold">Hotline / Zalo:</h4>
                  <p className="text-lg font-bold text-yellow-400">0909.123.456</p>
                </div>
              </div>

              <div className="flex items-start">
                <FaEnvelope className="text-2xl mr-4 mt-1 text-yellow-400" />
                <div>
                  <h4 className="font-bold">Email:</h4>
                  <p className="text-sm text-blue-100">baogia@inquangphat.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: FORM ĐIỀN */}
          <div className="p-10">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Gửi yêu cầu báo giá</h3>
            
            {status === 'success' && (
              <div className="bg-green-100 text-green-700 p-4 rounded mb-4 border border-green-200">
                ✅ Đã gửi thành công! Chúng tôi sẽ liên hệ lại sớm nhất.
              </div>
            )}
            {status === 'error' && (
              <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
                ❌ Có lỗi xảy ra. Vui lòng thử lại hoặc gọi hotline.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                  <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" placeholder="Nguyễn Văn A" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                  <input required name="phone" value={formData.phone} onChange={handleChange} type="text" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" placeholder="09xxxxxxx" />
                </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm quan tâm</label>
                  <input name="productName" value={formData.productName} onChange={handleChange} type="text" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" placeholder="VD: Hộp giấy Kraft, Túi giấy..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (nếu có)</label>
                    <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" placeholder="email@example.com" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng dự kiến</label>
                    <input name="quantity" value={formData.quantity} onChange={handleChange} type="text" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" placeholder="VD: 1000 cái" />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quy cách / Ghi chú</label>
                <textarea name="message" value={formData.message} onChange={handleChange} rows="4" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" placeholder="VD: Kích thước 20x20, cán màng mờ, ép kim logo..."></textarea>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded shadow transition flex items-center justify-center">
                <FaPaperPlane className="mr-2" /> GỬI YÊU CẦU NGAY
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactScreen;