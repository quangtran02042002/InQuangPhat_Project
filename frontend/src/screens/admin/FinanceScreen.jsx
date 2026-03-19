import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaWallet, FaTrash, FaPrint, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import ConfirmModal from '../../components/ConfirmModal';

const FinanceScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({ type: 'income', amount: '', category: '', description: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => {
    const { data } = await axios.get('/api/finance');
    setTransactions(data);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
        await axios.post('/api/finance', formData);
        toast.success('Đã lưu giao dịch');
        setFormData({ type: 'income', amount: '', category: '', description: '' });
        fetchTransactions();
    } catch (error) { toast.error('Lỗi khi lưu giao dịch'); }
  };

  const deleteHandler = async () => {
     await axios.delete(`/api/finance/${deleteId}`);
     setTransactions(transactions.filter(x => x._id !== deleteId));
     setIsModalOpen(false);
     toast.success('Đã xóa');
  };

  const filteredTransactions = transactions.filter(t => {
      if (!startDate && !endDate) return true; 
      
      const txDate = new Date(t.date);
      txDate.setHours(0, 0, 0, 0); 

      const start = startDate ? new Date(startDate) : null;
      if (start) start.setHours(0, 0, 0, 0);
      
      const end = endDate ? new Date(endDate) : null;
      if (end) end.setHours(23, 59, 59, 999);

      if (start && end) return txDate >= start && txDate <= end;
      if (start) return txDate >= start;
      if (end) return txDate <= end;
      return true;
  });

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="print:hidden h-full flex-shrink-0">
         <Sidebar />
      </div>

      <div className="flex-1 p-8 overflow-y-auto print:p-0 print:overflow-visible print:bg-white w-full">
        
        <div className="flex justify-between items-center mb-6 print:hidden">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center uppercase">
                <FaWallet className="mr-3 text-blue-600" /> Quản lý Thu Chi
            </h1>
            <button 
                onClick={handlePrint}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-900 flex items-center font-bold transition"
            >
                <FaPrint className="mr-2" /> Xuất PDF / In báo cáo
            </button>
        </div>

        <div className="hidden print:block text-center mb-8 pt-8">
            <h1 className="text-3xl font-bold uppercase mb-2">Báo Cáo Thu Chi Nội Bộ</h1>
            <p className="text-gray-600 italic">Công ty TNHH In Quang Phát</p>
            {startDate || endDate ? (
                <p className="font-bold mt-2">
                    Kỳ báo cáo: {startDate ? new Date(startDate).toLocaleDateString('vi-VN') : '...'} - {endDate ? new Date(endDate).toLocaleDateString('vi-VN') : 'Nay'}
                </p>
            ) : (
                <p className="font-bold mt-2">Kỳ báo cáo: Tất cả thời gian</p>
            )}
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap items-end gap-4 print:hidden">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Từ ngày</label>
                <div className="relative">
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-sm"
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Đến ngày</label>
                <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-sm"
                />
            </div>
            {(startDate || endDate) && (
                <button 
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    className="flex items-center text-red-500 hover:text-red-700 text-sm font-bold px-2 py-2"
                >
                    <FaTimes className="mr-1"/> Xóa bộ lọc
                </button>
            )}
            
            <div className="ml-auto text-sm text-gray-500 italic bg-blue-50 px-3 py-1.5 rounded-full flex items-center">
                <FaCalendarAlt className="mr-2 text-blue-500"/>
                Đang hiển thị {filteredTransactions.length} giao dịch
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:mb-10">
            <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500 print:shadow-none print:border print:border-l-4">
                <div className="text-gray-500 text-xs uppercase font-bold mb-1">Tổng Thu (Trong kỳ)</div>
                <div className="text-3xl font-bold text-green-600">+{totalIncome.toLocaleString()}đ</div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-500 print:shadow-none print:border print:border-l-4">
                <div className="text-gray-500 text-xs uppercase font-bold mb-1">Tổng Chi (Trong kỳ)</div>
                <div className="text-3xl font-bold text-red-600">-{totalExpense.toLocaleString()}đ</div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500 print:shadow-none print:border print:border-l-4">
                <div className="text-gray-500 text-xs uppercase font-bold mb-1">Tồn Quỹ (Lợi nhuận)</div>
                <div className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {balance > 0 ? '+' : ''}{balance.toLocaleString()}đ
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* FORM NHẬP (Bị ẩn khi in) */}
            <div className="bg-white p-6 rounded-xl shadow border border-gray-100 h-fit print:hidden">
                <h3 className="font-bold text-lg mb-5 text-gray-800 border-b pb-2">Tạo giao dịch mới</h3>
                <form onSubmit={submitHandler} className="space-y-5">
                    
                    {/* --- ĐÃ ĐỔI TỪ DROPDOWN SANG TOGGLE BUTTONS --- */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Loại giao dịch</label>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, type: 'income'})}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all duration-200 ${
                                    formData.type === 'income' 
                                    ? 'bg-green-500 text-white shadow-sm' 
                                    : 'text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                                + Thu (Vào quỹ)
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, type: 'expense'})}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all duration-200 ${
                                    formData.type === 'expense' 
                                    ? 'bg-red-500 text-white shadow-sm' 
                                    : 'text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                                - Chi (Ra khỏi quỹ)
                            </button>
                        </div>
                    </div>
                    {/* --------------------------------------------- */}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Số tiền (VNĐ)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                placeholder="0" 
                                className="w-full border border-gray-300 p-2.5 pl-4 pr-12 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg text-gray-800" 
                                required 
                                value={formData.amount} 
                                onChange={e=>setFormData({...formData, amount: parseInt(e.target.value)})} 
                            />
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">VNĐ</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Danh mục / Lý do</label>
                        <input type="text" placeholder="VD: Thu tiền cọc đơn A, Trả tiền điện..." className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Ghi chú chi tiết</label>
                        <textarea className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows="2" placeholder="Ghi chú thêm (không bắt buộc)..." value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})}></textarea>
                    </div>
                    <button type="submit" className={`w-full text-white py-3 rounded-lg font-bold transition shadow-md ${formData.type === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                        Lưu giao dịch {formData.type === 'income' ? 'Thu' : 'Chi'}
                    </button>
                </form>
            </div>

            {/* DANH SÁCH LỊCH SỬ */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:col-span-3 print:shadow-none print:border-none">
                <div className="p-4 border-b border-gray-100 font-bold text-gray-700 bg-gray-50 print:bg-white print:px-0">
                    Chi tiết giao dịch trong kỳ
                </div>
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar print:max-h-none print:overflow-visible">
                    <table className="min-w-full leading-normal">
                        <thead className="bg-gray-100 text-xs font-bold text-gray-500 uppercase sticky top-0 print:bg-gray-200">
                            <tr>
                                <th className="px-5 py-3 text-left w-24">Ngày</th>
                                <th className="px-5 py-3 text-left">Nội dung / Lý do</th>
                                <th className="px-5 py-3 text-right">Thu (+)</th>
                                <th className="px-5 py-3 text-right">Chi (-)</th>
                                <th className="px-5 py-3 text-center print:hidden w-16">Xóa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-10 text-gray-400">Không có giao dịch nào.</td></tr>
                            ) : (
                                filteredTransactions.map((t) => (
                                    <tr key={t._id} className="border-b border-gray-50 hover:bg-blue-50 transition print:border-gray-200">
                                        <td className="px-5 py-4 text-sm text-gray-600 font-medium">
                                            {new Date(t.date).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-gray-800">{t.category}</div>
                                            {t.description && <div className="text-xs text-gray-500 mt-1">{t.description}</div>}
                                        </td>
                                        <td className="px-5 py-4 text-right font-bold text-green-600">
                                            {t.type === 'income' ? `+${t.amount.toLocaleString()}` : ''}
                                        </td>
                                        <td className="px-5 py-4 text-right font-bold text-red-500">
                                            {t.type === 'expense' ? `-${t.amount.toLocaleString()}` : ''}
                                        </td>
                                        <td className="px-5 py-4 text-center print:hidden">
                                             <button onClick={()=>{setDeleteId(t._id); setIsModalOpen(true)}} className="text-gray-300 hover:text-red-500 transition">
                                                 <FaTrash/>
                                             </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {/* TỔNG KẾT KHI IN */}
                        <tfoot className="hidden print:table-footer-group bg-gray-50 font-bold text-gray-800">
                            <tr>
                                <td colSpan="2" className="px-5 py-3 text-right uppercase text-sm">Tổng cộng kỳ này:</td>
                                <td className="px-5 py-3 text-right text-green-600">{totalIncome.toLocaleString()}đ</td>
                                <td className="px-5 py-3 text-right text-red-600">{totalExpense.toLocaleString()}đ</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
      </div>

      <ConfirmModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} onConfirm={deleteHandler} title="Xóa giao dịch" message="Giao dịch này sẽ bị xóa khỏi sổ quỹ. Bạn chắc chắn chứ?" />
    </div>
  );
};
export default FinanceScreen;