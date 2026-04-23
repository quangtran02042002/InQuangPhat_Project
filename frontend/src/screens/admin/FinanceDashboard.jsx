import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  FaChartLine,
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaBars,
  FaFileInvoiceDollar,
  FaTruckLoading,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import {
  formatCurrency,
  getAuthConfig,
  getUserInfo,
} from '../../utils/financeHelpers';

const COLORS = ['#006B4D', '#E67E22', '#0EA5E9', '#E11D48', '#7C3AED'];

const StatCard = ({ icon, label, value, accent }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm ${accent}`}>
      {icon}
    </div>
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</div>
      <div className="text-2xl font-black text-[#111827] mt-1">{value}</div>
    </div>
  </div>
);

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const userInfo = getUserInfo();
  const authConfig = getAuthConfig();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [cashflow, setCashflow] = useState(null);
  const [pnl, setPnl] = useState(null);
  const [receivables, setReceivables] = useState(null);
  const [payables, setPayables] = useState(null);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [overviewRes, cashflowRes, pnlRes, receivablesRes, payablesRes] = await Promise.all([
          axios.get('/api/finance/reports/overview', authConfig),
          axios.get('/api/finance/reports/cashflow?days=30', authConfig),
          axios.get('/api/finance/reports/pnl', authConfig),
          axios.get('/api/finance/reports/receivables', authConfig),
          axios.get('/api/finance/reports/payables', authConfig),
        ]);

        setOverview(overviewRes.data);
        setCashflow(cashflowRes.data);
        setPnl(pnlRes.data);
        setReceivables(receivablesRes.data);
        setPayables(payablesRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authConfig, navigate, userInfo]);

  const pnlChartData = useMemo(() => {
    if (!pnl?.items) return [];
    return pnl.items.slice(0, 6).map((item) => ({
      name: item.categoryName,
      total: item.total,
      type: item.type,
    }));
  }, [pnl]);

  const agingChartData = useMemo(() => {
    if (!receivables?.summary?.aging || !payables?.summary?.aging) return [];
    return [
      {
        name: 'Hiện tại',
        receivable: receivables.summary.aging.current,
        payable: payables.summary.aging.current,
      },
      {
        name: '1-30',
        receivable: receivables.summary.aging.overdue1To30,
        payable: payables.summary.aging.overdue1To30,
      },
      {
        name: '31-60',
        receivable: receivables.summary.aging.overdue31To60,
        payable: payables.summary.aging.overdue31To60,
      },
      {
        name: '61-90',
        receivable: receivables.summary.aging.overdue61To90,
        payable: payables.summary.aging.overdue61To90,
      },
      {
        name: '>90',
        receivable: receivables.summary.aging.overdue90Plus,
        payable: payables.summary.aging.overdue90Plus,
      },
    ];
  }, [payables, receivables]);

  const pieData = useMemo(() => {
    if (!overview) return [];
    return [
      {
        name: 'Phải thu',
        value: overview.receivables?.totalOutstanding || 0,
      },
      {
        name: 'Phải trả',
        value: overview.payables?.totalOutstanding || 0,
      },
    ];
  }, [overview]);

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans text-[#111827] relative">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-[#111827]/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 h-full transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0 lg:block`}>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col w-full overflow-hidden">
        <AdminHeader title="Finance Dashboard" onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#111827] text-white flex items-center justify-center text-2xl shadow-lg">
                <FaChartLine />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#111827]">Tổng quan tài chính</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Báo cáo cashflow, công nợ và P&amp;L nội bộ theo tiền thực thu/chi.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 border-4 border-[#006B4D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <div className="font-medium text-gray-500">Đang tải dashboard tài chính...</div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <StatCard
                    icon={<FaWallet />}
                    label="Tổng tiền hiện có"
                    value={formatCurrency(overview?.accountSummary?.totalBalance)}
                    accent="bg-[#006B4D]"
                  />
                  <StatCard
                    icon={<FaArrowUp />}
                    label="Thu 30 ngày"
                    value={formatCurrency(overview?.movementSummary?.last30Days?.inflow)}
                    accent="bg-[#0EA5E9]"
                  />
                  <StatCard
                    icon={<FaArrowDown />}
                    label="Chi 30 ngày"
                    value={formatCurrency(overview?.movementSummary?.last30Days?.outflow)}
                    accent="bg-[#E67E22]"
                  />
                  <StatCard
                    icon={<FaFileInvoiceDollar />}
                    label="P&L cash-based"
                    value={formatCurrency(pnl?.summary?.net)}
                    accent="bg-[#7C3AED]"
                  />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-black">Cashflow 30 ngày</h2>
                        <p className="text-sm text-gray-500">Thu - chi đã ghi sổ theo ngày</p>
                      </div>
                    </div>
                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={cashflow?.items || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis tickFormatter={(value) => `${Math.round(value / 1000000)}tr`} tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Area type="monotone" dataKey="inflow" stroke="#006B4D" fill="#006B4D22" strokeWidth={2} />
                          <Area type="monotone" dataKey="outflow" stroke="#E67E22" fill="#E67E2220" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <h2 className="text-lg font-black">Cân đối công nợ</h2>
                    <p className="text-sm text-gray-500 mb-4">Tổng phải thu vs phải trả còn mở</p>
                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={4}>
                            {pieData.map((item, index) => (
                              <Cell key={item.name} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <h2 className="text-lg font-black">P&amp;L theo danh mục</h2>
                    <p className="text-sm text-gray-500 mb-4">Chỉ tính từ phiếu đã ghi sổ</p>
                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={pnlChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tickFormatter={(value) => `${Math.round(value / 1000000)}tr`} tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Bar dataKey="total">
                            {pnlChartData.map((entry, index) => (
                              <Cell key={`${entry.name}-${index}`} fill={entry.type === 'income' ? '#006B4D' : '#E67E22'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <h2 className="text-lg font-black">Aging công nợ</h2>
                    <p className="text-sm text-gray-500 mb-4">Phân bổ phải thu / phải trả theo tuổi nợ</p>
                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={agingChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tickFormatter={(value) => `${Math.round(value / 1000000)}tr`} tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Bar dataKey="receivable" fill="#006B4D" name="Phải thu" />
                          <Bar dataKey="payable" fill="#E67E22" name="Phải trả" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#E6F0ED] text-[#006B4D] flex items-center justify-center">
                        <FaFileInvoiceDollar />
                      </div>
                      <div>
                        <h2 className="text-lg font-black">Top khách nợ</h2>
                        <p className="text-sm text-gray-500">Các khoản phải thu lớn nhất</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {(overview?.receivables?.topItems || []).map((item) => (
                        <div key={item._id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#F9FAFB] px-4 py-3">
                          <div>
                            <div className="font-bold text-[#111827]">{item.counterpartyNameSnapshot}</div>
                            <div className="text-xs text-gray-400">{item.documentNo}</div>
                          </div>
                          <div className="font-black text-[#006B4D]">{formatCurrency(item.outstandingAmount)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                        <FaTruckLoading />
                      </div>
                      <div>
                        <h2 className="text-lg font-black">Top nhà cung cấp cần trả</h2>
                        <p className="text-sm text-gray-500">Các khoản phải trả lớn nhất</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {(overview?.payables?.topItems || []).map((item) => (
                        <div key={item._id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#F9FAFB] px-4 py-3">
                          <div>
                            <div className="font-bold text-[#111827]">{item.counterpartyNameSnapshot}</div>
                            <div className="text-xs text-gray-400">{item.documentNo}</div>
                          </div>
                          <div className="font-black text-orange-500">{formatCurrency(item.outstandingAmount)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#006B4D] text-white rounded-full shadow-xl flex items-center justify-center z-30 hover:bg-[#00543c] transition-all active:scale-95"
          >
            <FaBars size={24} />
          </button>
        </main>
      </div>
    </div>
  );
};

export default FinanceDashboard;
