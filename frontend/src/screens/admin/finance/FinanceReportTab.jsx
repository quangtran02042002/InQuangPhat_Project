import React, { useState } from 'react';
import {
  FaChartLine, FaSpinner, FaDownload, FaFilePdf,
} from 'react-icons/fa';
import {
  exportCashflowPDF, exportNetDebtPDF, exportPnLPDF, exportFullReportPDF,
} from '../../../utils/financeReportExport';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import {
  useGetCashflowReportQuery, useGetNetDebtReportQuery, useGetPnLReportQuery,
} from '../../../slices/financeApiSlice';

const fmt = (n) => {
  if (!n && n !== 0) return '—';
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + ' tỷ';
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'tr';
  return new Intl.NumberFormat('vi-VN').format(Math.round(n));
};

const TABS = ['Lưu chuyển tiền tệ', 'Công nợ ròng', 'P&L'];
const PIE_COLORS = ['#10b981','#f59e0b','#f97316','#ef4444','#b91c1c','#374151'];

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

const FinanceReportTab = () => {
  const [activeTab, setActiveTab] = useState('Lưu chuyển tiền tệ');
  const [cashflowDays, setCashflowDays] = useState(30);
  const [groupBy, setGroupBy] = useState('day');
  const [pnlRange, setPnlRange] = useState({ startDate: '', endDate: '' });

  const { data: cashflow, isLoading: loadCF } = useGetCashflowReportQuery({ days: cashflowDays, groupBy });
  const { data: netDebt, isLoading: loadND } = useGetNetDebtReportQuery();
  const { data: pnl, isLoading: loadPnl } = useGetPnLReportQuery(pnlRange);

  const cfSeries = (cashflow?.series || []).map(s => ({
    date: s.date,
    'Thu vào': Math.round((s.income || 0) / 1000),
    'Chi ra': Math.round((s.expense || 0) / 1000),
    'Ròng': Math.round((s.net || 0) / 1000),
  }));

  const debtAgeLabels = {
    'current': 'Chưa đến hạn', '1-15': '1-15 ngày', '16-30': '16-30 ngày',
    '31-60': '31-60 ngày', '61-90': '61-90 ngày', 'over90': '>90 ngày',
  };
  const agingData = (netDebt?.receivableByAge || []).map((g, i) => ({
    name: debtAgeLabels[g._id] || g._id,
    'Phải thu': g.total,
    fill: PIE_COLORS[i],
  }));
  const agingPayData = (netDebt?.payableByAge || []).map((g, i) => ({
    name: debtAgeLabels[g._id] || g._id,
    'Phải trả': g.total,
    fill: PIE_COLORS[i],
  }));

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* SUB TABS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-white shadow text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={() => exportFullReportPDF({ cashflow, netDebt, pnl, cashflowDays, groupBy, pnlRange })}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-emerald-200 hover:shadow-emerald-300"
        >
          <FaFilePdf /> Xuất Báo cáo Tổng hợp (PDF)
        </button>
      </div>

      {/* ── TAB 1: CASHFLOW ──────────────────────────────── */}
      {activeTab === 'Lưu chuyển tiền tệ' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex-wrap">
            <label className="text-sm font-semibold text-gray-700">Hiển thị:</label>
            {[7, 14, 30, 90].map(d => (
              <button key={d} onClick={() => setCashflowDays(d)}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition ${cashflowDays === d ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {d} ngày
              </button>
            ))}
            <div className="border-l border-gray-200 pl-3 flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-700">Nhóm theo:</label>
              <select value={groupBy} onChange={e => setGroupBy(e.target.value)}
                className="border border-gray-200 rounded-xl px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
                <option value="day">Ngày</option>
                <option value="month">Tháng</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaChartLine className="text-emerald-600" /> Lưu chuyển tiền tệ — {cashflowDays} ngày (đơn vị: nghìn đ)
            </h2>
            <button
              onClick={() => exportCashflowPDF(cashflow, { days: cashflowDays, groupBy })}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl text-xs font-bold transition"
            >
              <FaDownload className="text-[10px]" /> Xuất PDF
            </button>
            {loadCF ? <div className="flex justify-center h-60 items-center"><FaSpinner className="animate-spin text-2xl text-emerald-500" /></div> :
              cfSeries.length === 0 ? <div className="h-60 flex items-center justify-center text-gray-400 text-sm">Chưa có dữ liệu</div> : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cfSeries} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Thu vào" fill="#10b981" radius={[3,3,0,0]} />
                    <Bar dataKey="Chi ra" fill="#f87171" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
          </div>

          {/* Net flow line */}
          {cfSeries.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-4">Dòng tiền ròng (nghìn đ)</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={cfSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="Ròng" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: CÔNG NỢ RÒNG ─────────────────────────── */}
      {activeTab === 'Công nợ ròng' && (
        <div className="space-y-6">
          {loadND ? <div className="flex justify-center h-40 items-center"><FaSpinner className="animate-spin text-2xl text-emerald-500" /></div> : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-700">Tổng quan công nợ</h3>
                <button
                  onClick={() => exportNetDebtPDF(netDebt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl text-xs font-bold transition"
                >
                  <FaDownload className="text-[10px]" /> Xuất PDF
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center">
                  <p className="text-xs font-semibold text-emerald-600 mb-1">Tổng phải thu</p>
                  <p className="text-2xl font-black text-emerald-800">{fmt(netDebt?.totalReceivable)}đ</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
                  <p className="text-xs font-semibold text-red-600 mb-1">Tổng phải trả</p>
                  <p className="text-2xl font-black text-red-800">{fmt(netDebt?.totalPayable)}đ</p>
                </div>
                <div className={`rounded-2xl p-5 text-center border ${(netDebt?.netDebt || 0) >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                  <p className={`text-xs font-semibold mb-1 ${(netDebt?.netDebt || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Công nợ ròng</p>
                  <p className={`text-2xl font-black ${(netDebt?.netDebt || 0) >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                    {(netDebt?.netDebt || 0) >= 0 ? '+' : ''}{fmt(netDebt?.netDebt)}đ
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-700 mb-3">Phải thu theo tuổi nợ</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={agingData} dataKey="Phải thu" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                        {agingData.map((g, i) => <Cell key={g.name} fill={g.fill} />)}
                      </Pie>
                      <Tooltip formatter={v => fmt(v) + 'đ'} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-700 mb-3">Phải trả theo tuổi nợ</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={agingPayData} dataKey="Phải trả" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                        {agingPayData.map((g, i) => <Cell key={g.name} fill={g.fill} />)}
                      </Pie>
                      <Tooltip formatter={v => fmt(v) + 'đ'} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB 3: P&L ──────────────────────────────────── */}
      {activeTab === 'P&L' && (
        <div className="space-y-6">
          {/* Date range filter */}
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex-wrap">
            <div>
              <label className="text-xs font-semibold text-gray-600 mr-1">Từ:</label>
              <input type="date" value={pnlRange.startDate} onChange={e => setPnlRange(r => ({ ...r, startDate: e.target.value }))}
                className="border border-gray-200 rounded-xl px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mr-1">Đến:</label>
              <input type="date" value={pnlRange.endDate} onChange={e => setPnlRange(r => ({ ...r, endDate: e.target.value }))}
                className="border border-gray-200 rounded-xl px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
            </div>
          </div>

          {loadPnl ? <div className="flex justify-center h-40 items-center"><FaSpinner className="animate-spin text-2xl text-emerald-500" /></div> : pnl && (
            <>
              {/* P&L Summary */}
              <div className="bg-gradient-to-br from-emerald-900 to-emerald-700 rounded-2xl p-6 text-white">
                <h2 className="font-extrabold text-lg mb-5 flex items-center justify-between">
                <span>Báo cáo lãi lỗ (P&L)</span>
                <button
                  onClick={() => exportPnLPDF(pnl, pnlRange)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition"
                >
                  <FaDownload className="text-[10px]" /> Xuất PDF
                </button>
              </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-emerald-600">
                    <span className="text-emerald-200 font-medium">Doanh thu thuần</span>
                    <span className="text-xl font-black text-white">{fmt(pnl.revenue)}đ</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-emerald-600">
                    <span className="text-emerald-200 font-medium">Giá vốn hàng bán (COGS)</span>
                    <span className="text-xl font-black text-red-300">- {fmt(pnl.cogs)}đ</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-emerald-600 bg-emerald-800/30 px-3 rounded-xl">
                    <div>
                      <span className="text-white font-bold text-lg">Lợi nhuận gộp</span>
                      <span className="text-emerald-300 text-sm ml-2">(Gross Profit)</span>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-black ${pnl.grossProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>{fmt(pnl.grossProfit)}đ</p>
                      <p className="text-emerald-300 text-xs">Biên lợi nhuận gộp: {pnl.grossMargin}%</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-emerald-600">
                    <span className="text-emerald-200 font-medium">Chi phí hoạt động (OPEX)</span>
                    <span className="text-xl font-black text-red-300">- {fmt(pnl.opex)}đ</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-white/10 px-3 rounded-xl">
                    <div>
                      <span className="text-white font-extrabold text-xl">Lợi nhuận ròng</span>
                      <span className="text-emerald-300 text-sm ml-2">(Net Profit)</span>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-black ${pnl.netProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {pnl.netProfit >= 0 ? '+' : ''}{fmt(pnl.netProfit)}đ
                      </p>
                      <p className="text-emerald-300 text-xs">Biên lợi nhuận ròng: {pnl.netMargin}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category breakdown */}
              {pnl.byCategory && pnl.byCategory.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b">
                    <h3 className="font-bold text-gray-700">Chi tiết theo danh mục</h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <th className="px-4 py-3 text-left">Danh mục</th>
                        <th className="px-4 py-3 text-left">Nhóm</th>
                        <th className="px-4 py-3 text-right">Số tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pnl.byCategory.map((c, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-700">{c.categoryName || 'Không phân loại'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              c.group === 'revenue' ? 'bg-green-100 text-green-700' :
                              c.group === 'cogs' ? 'bg-orange-100 text-orange-700' :
                              c.group === 'opex' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                            }`}>{c.group?.toUpperCase() || '—'}</span>
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${c.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                            {c.type === 'income' ? '+' : '-'}{fmt(c.total)}đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FinanceReportTab;
