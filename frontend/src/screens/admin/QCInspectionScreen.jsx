import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import QCInspectionTab from './tasks/QCInspectionTab';

const QCInspectionScreen = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans text-[#111827] relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-[#111827]/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 h-full transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0 lg:block`}>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col w-full overflow-hidden">
        {/* Admin Header */}
        <AdminHeader
          title="Duyệt mẫu QC"
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <QCInspectionTab />
        </main>
      </div>
    </div>
  );
};

export default QCInspectionScreen;
