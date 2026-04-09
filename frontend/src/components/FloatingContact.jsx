import React from 'react';
import { FaPhoneAlt, FaFacebookMessenger } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si'; // Cần cài react-icons: npm install react-icons

const FloatingContact = () => {
  const CONTACT_INFO = {
    phone: "0935110639",
    zalo: "0935110639", // Số điện thoại đăng ký Zalo
    messengerId: "inquangphat" // ID Fanpage hoặc Profile (nếu có)
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 items-end group">
      
      {/* 1. Nút Messenger (Màu xanh dương) - Optional */}
      {/* <a 
        href={`https://m.me/${CONTACT_INFO.messengerId}`}
        target="_blank" 
        rel="noreferrer"
        className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition duration-300 relative"
        title="Chat Messenger"
      >
        <FaFacebookMessenger className="text-2xl" />
        <span className="absolute right-full mr-3 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
            Chat Facebook
        </span>
      </a> 
      */}

      {/* 2. Nút Zalo (Màu xanh Zalo) */}
      <a 
        href={`https://zalo.me/${CONTACT_INFO.zalo}`}
        target="_blank" 
        rel="noreferrer"
        className="w-14 h-14 bg-[#006B4D] rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition duration-300 relative border-2 border-white animate-bounce-slow"
        title="Chat Zalo"
      >
        {/* Icon Zalo từ thư viện SiZalo hoặc dùng Text nếu chưa cài icon */}
        <SiZalo className="text-3xl" />
        
        {/* Tooltip hiển thị khi hover */}
        <span className="absolute right-full mr-3 bg-[#006B4D] text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition duration-300 whitespace-nowrap shadow-md">
            Chat Zalo ngay
        </span>
        
        {/* Chấm xanh online */}
        <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
      </a>

      {/* 3. Nút Gọi điện (Màu đỏ - Rung lắc mạnh) */}

    </div>
  );
};

export default FloatingContact;