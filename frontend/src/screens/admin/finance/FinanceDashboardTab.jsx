import React from 'react';
import {
  FaWallet, FaArrowDown, FaArrowUp, FaExchangeAlt,
  FaExclamationTriangle, FaCheckCircle, FaSpinner,
  FaChartBar, FaPiggyBank, FaChevronRight,
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { useGetFinanceDashboardQuery, useGetCashflowReportQuery } from '../../../slices/financeApiSlice';

const fmt = (n) => {
  if (!n && n !== 0) return '—';
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' tr';
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(0) + 'k';
  return new Intl.NumberFormat('vi-VN').format(n);
};

const fmtFull = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0)) + 'đ';

const DEBT_COLORS = {
  'current':  'bg-emerald-100 text-emerald-800',
  '1-15':     'bg-yellow-100 text-yellow-800',
  '16-30':    'bg-orange-100 text-orange-800',
  '31-60':    'bg-red-100 text-red-700',
  '61-90':    'bg-red-200 text-red-800',
  'over90':   'bg-gray-800 text-white',
};

const StatCard = ({ label, value, sub, color = 'emerald', icon: Icon, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-start gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition' : ''}`}
  >
    <div className={`w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center text-${color}-600 text-xl shrink-0`}>
      <Icon />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-extrabold text-gray-900 truncate">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {fmt(p.value)}đ
        </p>
      ))}
    </div>
  );
};

const FinanceDashboardTab = ({ onNavigate }) => {
  const { data: dash, isLoading } = useGetFinanceDashboardQuery(undefined, { pollingInterval: 60000 });
  const { data: cashflow } = useGetCashflowReportQuery({ days: 30, groupBy: 'day' });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-3xl text-emerald-600" />
      </div>
    );
  }

  const d = dash || {};
  const today = d.today || {};
  const thisMonth = d.thisMonth || {};
  const series = cashflow?.series?.slice(-14) || [];

  const chartData = series.map(s => ({
    date: s.date?.slice(5), // MM-DD
    'Thu vào': Math.round(s.income / 1000),
    'Chi ra': Math.round(s.expense / 1000),
  }));

  const totalBalance = d.totalBalance || 0;
  const netDebt = d.netDebt || 0;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* STAT CARDS ROW 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Tổng số dư quỹ"
          value={fmt(totalBalance) + 'đ'}
          sub={`${d.cashBooks?.length || 0} tài khoản`}
          color="emerald"
          icon={FaWallet}
          onClick={() => onNavigate('cashbook')}
        />
        <StatCard
          label="Thu hôm nay"
          value={'+ ' + fmt(today.income) + 'đ'}
          sub={`Tháng này: +${fmt(thisMonth.income)}đ`}
          color="blue"
          icon={FaArrowDown}
          onClick={() => onNavigate('cashbook')}
        />
        <StatCard
          label="Chi hôm nay"
          value={'- ' + fmt(today.expense) + 'đ'}
          sub={`Tháng này: -${fmt(thisMonth.expense)}đ`}
          color="red"
          icon={FaArrowUp}
          onClick={() => onNavigate('cashbook')}
        />
        <StatCard
          label="Công nợ ròng"
          value={(netDebt >= 0 ? '+' : '') + fmt(netDebt) + 'đ'}
          sub={`PT: ${fmt(d.receivable?.total)}đ | PP: ${fmt(d.payable?.total)}đ`}
          color={netDebt >= 0 ? 'emerald' : 'red'}
          icon={FaExchangeAlt}
          onClick={() => onNavigate('receivable')}
        />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* CASHFLOW CHART */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-gray-800 flex items-center gap-2">
              <FaChartBar className="text-emerald-600" /> Tiền vào/ra (14 ngày gần nhất)
            </h2>
            <span className="text-xs text-gray-400">đơn vị: nghìn đ</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Thu vào" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Chi ra" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400 text-sm">
              Chưa có dữ liệu giao dịch
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          {/* CashBook Cards */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-gray-700 flex items-center gap-2">
                <FaWallet className="text-emerald-500" /> Các quỹ tiền
              </h3>
              <button onClick={() => onNavigate('cashbook')} className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                Xem tất cả <FaChevronRight className="text-[10px]" />
              </button>
            </div>
            <div className="space-y-2">
              {(d.cashBooks || []).slice(0, 4).map(book => (
                <div key={book._id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-800">{book.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{book.type} · {book.currency}</p>
                  </div>
                  <p className={`font-bold ${book.currentBalance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {fmt(book.currentBalance)}đ
                  </p>
                </div>
              ))}
              {(!d.cashBooks || d.cashBooks.length === 0) && (
                <p className="text-xs text-gray-400 text-center py-4">Chưa có sổ quỹ nào</p>
              )}
            </div>
          </div>

          {/* Emergency Fund */}
          {d.emergencyFund && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaPiggyBank className="text-amber-500" />
                <h3 className="font-bold text-sm text-amber-800">Quỹ dự phòng</h3>
              </div>
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-amber-700">Hiện có</span>
                <span className="font-bold text-amber-900">{fmt(d.emergencyFund.currentAmount)}đ</span>
              </div>
              <div className="w-full bg-amber-100 rounded-full h-2 mb-1">
                <div
                  className="bg-amber-400 h-2 rounded-full"
                  style={{
                    width: d.emergencyFund.targetAmount
                      ? `${Math.min(100, (d.emergencyFund.currentAmount / d.emergencyFund.targetAmount) * 100)}%`
                      : '0%',
                  }}
                />
              </div>
              <p className="text-xs text-amber-600">
                Mục tiêu: {fmt(d.emergencyFund.targetAmount)}đ ({d.emergencyFund.targetMonths} tháng OPEX)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* P&L MINI */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-700 rounded-2xl p-5 text-white">
        <h2 className="font-extrabold text-base mb-4 flex items-center gap-2">
          <FaChartBar /> P&L Thu gọn — Tháng này
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-emerald-300 text-xs mb-1">Doanh thu</p>
            <p className="text-xl font-black">{fmt(thisMonth.income)}đ</p>
          </div>
          <div>
            <p className="text-emerald-300 text-xs mb-1">Chi tiêu</p>
            <p className="text-xl font-black">- {fmt(thisMonth.expense)}đ</p>
          </div>
          <div>
            <p className="text-emerald-300 text-xs mb-1">Chênh lệch</p>
            <p className={`text-xl font-black ${thisMonth.net >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {thisMonth.net >= 0 ? '+' : ''}{fmt(thisMonth.net)}đ
            </p>
          </div>
          <div>
            <p className="text-emerald-300 text-xs mb-1">Xem báo cáo</p>
            <button
              onClick={() => onNavigate('reports')}
              className="mt-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition flex items-center gap-1 mx-auto"
            >
              P&L chi tiết <FaChevronRight className="text-[10px]" />
            </button>
          </div>
        </div>
      </div>

      {/* OVERDUE ALERTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Overdue Receivables */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-red-700 flex items-center gap-2">
              <FaExclamationTriangle className="text-red-500" /> Nợ quá hạn phải thu
            </h3>
            <button onClick={() => onNavigate('receivable')} className="text-xs text-emerald-600 hover:underline">
              Xem tất cả
            </button>
          </div>
          {(d.overdueReceivables || []).length === 0 ? (
            <div className="text-center py-6">
              <FaCheckCircle className="text-emerald-400 text-2xl mx-auto mb-1" />
              <p className="text-xs text-gray-400">Không có nợ quá hạn</p>
            </div>
          ) : (
            <div className="space-y-2">
              {d.overdueReceivables.map(rec => (
                <div key={rec._id} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2">
                  <div>
                    <p className="font-medium text-gray-800">{rec.customerName}</p>
                    <p className="text-xs text-red-500">Quá hạn {rec.debtAgeDays} ngày</p>
                  </div>
                  <p className="font-bold text-red-600">{fmt(rec.outstandingAmount)}đ</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Due-soon Payables */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-orange-700 flex items-center gap-2">
              <FaExclamationTriangle className="text-orange-400" /> Sắp đến hạn trả (7 ngày)
            </h3>
            <button onClick={() => onNavigate('payable')} className="text-xs text-emerald-600 hover:underline">
              Xem tất cả
            </button>
          </div>
          {(d.dueSoonPayables || []).length === 0 ? (
            <div className="text-center py-6">
              <FaCheckCircle className="text-emerald-400 text-2xl mx-auto mb-1" />
              <p className="text-xs text-gray-400">Không có khoản sắp đến hạn</p>
            </div>
          ) : (
            <div className="space-y-2">
              {d.dueSoonPayables.map(p => (
                <div key={p._id} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2">
                  <div>
                    <p className="font-medium text-gray-800">{p.supplierName}</p>
                    <p className="text-xs text-orange-500">
                      Đến hạn: {new Date(p.dueDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <p className="font-bold text-orange-600">{fmt(p.outstandingAmount)}đ</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboardTab;
