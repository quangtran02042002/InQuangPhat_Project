import React from 'react';
import { SiZalo } from 'react-icons/si';
import { FaPhoneAlt } from 'react-icons/fa';

const FloatingContact = () => {
  const CONTACT_INFO = {
    phone: '0903597686',
    zalo: '0903597686',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end group">

      {/* Zalo Button */}
      <div className="relative">
        {/* Pulse rings */}
        <span className="absolute inset-0 rounded-full bg-brand-600/40 animate-pulse-ring" />
        <span className="absolute inset-0 rounded-full bg-brand-600/20 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />

        <a
          href={`https://zalo.me/${CONTACT_INFO.zalo}`}
          target="_blank"
          rel="noreferrer"
          className="relative w-14 h-14 bg-brand-600 hover:bg-brand-700 rounded-full flex items-center justify-center text-white shadow-floating hover:shadow-glow-brand hover:scale-110 transition-all duration-300 border-2 border-white"
          title="Chat Zalo"
          aria-label="Chat Zalo"
        >
          <SiZalo size={26} />
        </a>

        {/* Tooltip */}
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-brand-600 text-white text-xs font-bold px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-lg pointer-events-none">
          💬 Chat Zalo ngay
          <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-brand-600" />
        </span>

        {/* Online indicator */}
        <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
      </div>

      {/* Phone Button */}
      <a
        href={`tel:${CONTACT_INFO.phone}`}
        className="relative w-12 h-12 bg-accent hover:bg-accent-dark rounded-full flex items-center justify-center text-white shadow-elevation hover:scale-110 transition-all duration-300 border-2 border-white"
        title="Gọi điện"
        aria-label="Gọi điện"
      >
        <FaPhoneAlt size={16} />

        {/* Tooltip */}
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs font-bold px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-lg pointer-events-none" style={{ transitionDelay: '50ms' }}>
          📞 Gọi ngay
          <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-800" />
        </span>
      </a>
    </div>
  );
};

export default FloatingContact;