import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaWallet, FaArrowUp, FaArrowDown, FaTrash, FaPlus } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import ConfirmModal from '../../components/ConfirmModal';
import AdminHeader from '../../components/AdminHeader';
const FinanceScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({ type: 'income', amount: '', category: '', description: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    } catch (error) { toast.error('Lỗi'); }
  };

  const deleteHandler = async () => {
     await axios.delete(`/api/finance/${deleteId}`);
     setTransactions(transactions.filter(x => x._id !== deleteId));
     setIsModalOpen(false);
     toast.success('Đã xóa');
  };

  // Tính toán tổng
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <AdminHeader title="Quản Lí Thu Chi" />

        {/* THỐNG KÊ NHANH */}
        <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-5 rounded-xl shadow border-l-4 border-green-500">
                <div className="text-gray-500 text-xs uppercase font-bold">Tổng Thu</div>
                <div className="text-2xl font-bold text-green-600">+{totalIncome.toLocaleString()}đ</div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow border-l-4 border-red-500">
                <div className="text-gray-500 text-xs uppercase font-bold">Tổng Chi</div>
                <div className="text-2xl font-bold text-red-600">-{totalExpense.toLocaleString()}đ</div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow border-l-4 border-blue-500">
                <div className="text-gray-500 text-xs uppercase font-bold">Lợi nhuận ròng</div>
                <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {balance.toLocaleString()}đ
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* FORM NHẬP */}
            <div className="bg-white p-6 rounded-xl shadow border border-gray-100 h-fit">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Tạo giao dịch mới</h3>
                <form onSubmit={submitHandler} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Loại giao dịch</label>
                        <select className="w-full border p-2 rounded" value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})}>
                            <option value="income">Thu (Tiền vào)</option>
                            <option value="expense">Chi (Tiền ra)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Số tiền (VNĐ)</label>
                        <input type="number" className="w-full border p-2 rounded" required value={formData.amount} onChange={e=>setFormData({...formData, amount: parseInt(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Danh mục / Lý do</label>
                        <input type="text" placeholder="VD: Tiền điện tháng 10" className="w-full border p-2 rounded" required value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Ghi chú thêm</label>
                        <textarea className="w-full border p-2 rounded" rows="3" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})}></textarea>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition">Lưu giao dịch</button>
                </form>
            </div>

            {/* DANH SÁCH LỊCH SỬ */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 font-bold text-gray-700">Lịch sử giao dịch gần đây</div>
                <div className="max-h-[500px] overflow-y-auto">
                    <table className="min-w-full leading-normal">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                            <tr>
                                <th className="px-5 py-3 text-left">Nội dung</th>
                                <th className="px-5 py-3 text-center">Ngày</th>
                                <th className="px-5 py-3 text-right">Số tiền</th>
                                <th className="px-5 py-3 text-center">Xóa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((t) => (
                                <tr key={t._id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="px-5 py-3">
                                        <div className="font-bold text-gray-800">{t.category}</div>
                                        <div className="text-xs text-gray-500">{t.description}</div>
                                    </td>
                                    <td className="px-5 py-3 text-center text-xs text-gray-500">
                                        {new Date(t.date).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className={`px-5 py-3 text-right font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                                        {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}đ
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                         <button onClick={()=>{setDeleteId(t._id); setIsModalOpen(true)}} className="text-gray-400 hover:text-red-500"><FaTrash/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
      <ConfirmModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} onConfirm={deleteHandler} title="Xóa giao dịch" message="Bạn chắc chắn muốn xóa giao dịch này?" />
    </div>
  );
};
export default FinanceScreen;