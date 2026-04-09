import React from 'react';
import { FaClipboardList, FaPencilRuler, FaFileInvoiceDollar, FaTruckMoving, FaRegComments, FaCogs, FaShippingFast, FaLongArrowAltRight } from 'react-icons/fa';

const OrderProcess = () => {
  const steps = [
    {
      id: 1,
      icon: <FaClipboardList />,
      title: "1. Chọn quy cách sản phẩm",
      desc: "Quý khách tham khảo mẫu mã trên website hoặc gửi trực tiếp mẫu cần in qua Zalo cho chúng tôi.",
      color: "bg-[#E6F0ED] text-[#006B4D]"
    },
    {
      id: 2,
      icon: <FaPencilRuler />,
      title: "2. Chốt thiết kế & Số lượng",
      desc: "Đội ngũ Designer sẽ lên mẫu demo miễn phí. Quý khách duyệt maket, chỉnh sửa đến khi ưng ý.",
      color: "bg-pink-100 text-pink-600"
    },
    {
      id: 3,
      icon: <FaFileInvoiceDollar />,
      title: "3. Báo giá & Đặt cọc",
      desc: "Nhận báo giá chi tiết. Quý khách tiến hành đặt cọc 50% đơn hàng để xưởng bắt đầu sản xuất.",
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      id: 4,
      icon: <FaTruckMoving />,
      title: "4. Giao hàng & Thanh toán",
      desc: "Sau khi in xong, hàng được giao tận nơi. Quý khách kiểm tra chất lượng và thanh toán phần còn lại.",
      color: "bg-green-100 text-green-600"
    }
  ];

  return (
    <div className="py-16 bg-gradient-to-b from-[#E6F0ED]/50 to-white overflow-hidden relative">
      {/* Hình nền trang trí mờ phía sau */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#006B4D]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Tiêu đề Section */}
        <div className="text-center mb-16">
            <h4 className="text-[#006B4D] font-bold uppercase tracking-widest mb-2">Làm việc chuyên nghiệp</h4>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">QUY TRÌNH ĐẶT HÀNG TẠI IN QUANG PHÁT</h2>
            <div className="w-20 h-1 bg-[#006B4D] mx-auto rounded mt-4"></div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12">
            
            {/* --- CỘT TRÁI MỚI: MINH HỌA VECTOR QUY TRÌNH --- */}
            <div className="w-full lg:w-5/12 flex justify-center mb-8 lg:mb-0">
                <div className="relative w-full max-w-md h-80 flex items-center justify-center p-6 rounded-3xl overflow-hidden bg-[#E6F0ED]/50 border border-[#006B4D]/10 shadow-sm">
                    
                    {/* Các hình tròn trang trí mờ làm nền */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-[#006B4D]/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                    
                    {/* TỔ HỢP ICON QUY TRÌNH (Vector Illustration) */}
                    <div className="relative z-10 flex items-center justify-between w-full text-[#006B4D]/40">
                        
                        {/* Bước đầu: Tư vấn */}
                        <div className="flex flex-col items-center group">
                            <FaRegComments size={80} className="mb-2 transform group-hover:scale-110 transition-transform duration-300 text-[#006B4D]/60" />
                            <span className="text-sm font-bold uppercase tracking-wider text-[#006B4D]">Tư vấn</span>
                        </div>

                        {/* Mũi tên nối */}
                        <div className="flex-1 flex justify-center px-2 opacity-50">
                            <FaLongArrowAltRight size={40} className="animate-pulse"/>
                        </div>

                        {/* Bước giữa: Sản xuất */}
                        <div className="flex flex-col items-center group">
                            {/* Thêm class 'animate-spin-slow' nếu bạn muốn nó quay chậm (cần config tailwind) */}
                            <FaCogs size={100} className="mb-2 transform group-hover:rotate-12 transition-transform duration-300 text-[#006B4D]/70" />
                            <span className="text-sm font-bold uppercase tracking-wider text-[#006B4D]">Sản xuất</span>
                        </div>

                        {/* Mũi tên nối */}
                        <div className="flex-1 flex justify-center px-2 opacity-50">
                            <FaLongArrowAltRight size={40} className="animate-pulse animation-delay-1000"/>
                        </div>

                        {/* Bước cuối: Giao hàng */}
                        <div className="flex flex-col items-center group">
                             <FaShippingFast size={80} className="mb-2 transform group-hover:-translate-y-1 transition-transform duration-300 text-[#006B4D]/60" />
                             <span className="text-sm font-bold uppercase tracking-wider text-[#006B4D]">Vận chuyển</span>
                        </div>

                    </div>
                    
                    {/* Chữ chìm làm nền */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-4xl font-extrabold text-[#006B4D]/10 uppercase tracking-[0.2em] opacity-50 select-none">
                        Workflow
                    </div>
                </div>
            </div>

            {/* CỘT PHẢI: DANH SÁCH BƯỚC */}
            <div className="w-full lg:w-7/12">
                <div className="grid gap-6">
                    {steps.map((step) => (
                        <div key={step.id} className="flex items-start p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                            {/* Icon Bước */}
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 mr-6 ${step.color}`}>
                                {step.icon}
                            </div>
                            
                            {/* Nội dung Bước */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">{step.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default OrderProcess;