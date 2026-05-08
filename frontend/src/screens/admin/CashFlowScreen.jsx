import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import {
  FaChartLine, FaWallet, FaArrowDown, FaArrowUp,
  FaCog, FaFileAlt, FaBars,
} from 'react-icons/fa';
import FinanceDashboardTab from './finance/FinanceDashboardTab';
import CashBookTab from './finance/CashBookTab';
import ReceivableTab from './finance/ReceivableTab';
import PayableTab from './finance/PayableTab';
import FinanceReportTab from './finance/FinanceReportTab';
import FinanceSettingsTab from './finance/FinanceSettingsTab';

const TABS = [
  { id: 'dashboard',   label: 'Dashboard',    icon: FaChartLine },
  { id: 'cashbook',    label: 'Sổ quỹ',       icon: FaWallet },
  { id: 'receivable',  label: 'Phải thu',     icon: FaArrowDown },
  { id: 'payable',     label: 'Phải trả',     icon: FaArrowUp },
  { id: 'reports',     label: 'Báo cáo',      icon: FaFileAlt },
  { id: 'settings',   label: 'Cài đặt',       icon: FaCog },
];

const CashFlowScreen = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':  return <FinanceDashboardTab onNavigate={setActiveTab} />;
      case 'cashbook':   return <CashBookTab />;
      case 'receivable': return <ReceivableTab />;
      case 'payable':    return <PayableTab />;
      case 'reports':    return <FinanceReportTab />;
      case 'settings':   return <FinanceSettingsTab />;
      default:           return <FinanceDashboardTab onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans text-[#111827] relative">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
      <div className={`fixed inset-y-0 left-0 z-50 h-full transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0`}>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col w-full overflow-hidden">
        <AdminHeader title="Quản lý Dòng Tiền" />

        {/* TAB NAV */}
        <div className="bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center px-4 md:px-6 overflow-x-auto">
            <button className="lg:hidden text-gray-500 mr-3 py-3" onClick={() => setIsSidebarOpen(true)}>
              <FaBars />
            </button>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === id
                    ? 'text-emerald-700 border-emerald-600'
                    : 'text-gray-500 border-transparent hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <Icon className="text-xs" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {renderTab()}
        </main>
      </div>
    </div>
  );
};

export default CashFlowScreen;
