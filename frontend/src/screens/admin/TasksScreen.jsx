import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import { FaListAlt, FaShoppingCart, FaBars } from 'react-icons/fa';
import TodoTab from './tasks/TodoTab';
import MaterialOrderTab from './tasks/MaterialOrderTab';

const TABS = [
  { id: 'todo', label: 'Công việc (Todo)', icon: FaListAlt },
  { id: 'material-orders', label: 'Đặt Nguyên vật liệu', icon: FaShoppingCart },
];

const TasksScreen = ({ initialTab }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    initialTab || location.state?.tab || 'todo'
  );
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
          title="Quản lý Nhiệm vụ"
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center px-4 md:px-6 overflow-x-auto">
            <button
              className="lg:hidden text-gray-500 mr-3 py-3"
              onClick={() => setIsSidebarOpen(true)}
            >
              <FaBars />
            </button>

            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === id
                    ? 'text-[#006B4D] border-[#006B4D]'
                    : 'text-gray-500 border-transparent hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <Icon className="text-xs shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'todo' && <TodoTab />}
          {activeTab === 'material-orders' && <MaterialOrderTab />}
        </main>
      </div>
    </div>
  );
};

export default TasksScreen;
