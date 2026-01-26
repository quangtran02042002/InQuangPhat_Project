import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaWarehouse, FaPlus, FaTrash, FaEdit, FaExclamationTriangle } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import ConfirmModal from '../../components/ConfirmModal';
import AdminHeader from '../../components/AdminHeader';
const MaterialScreen = () => {
  const [materials, setMaterials] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', unit: '', quantity: 0, minStock: 10, note: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => { fetchMaterials(); }, []);

  const fetchMaterials = async () => {
    const { data } = await axios.get('/api/materials');
    setMaterials(data);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
        await axios.post('/api/materials', formData);
        toast.success('Đã thêm vật tư');
        setIsFormOpen(false);
        setFormData({ name: '', unit: '', quantity: 0, minStock: 10, note: '' });
        fetchMaterials();
    } catch (error) { toast.error('Lỗi'); }
  };

  const deleteHandler = async () => {
     await axios.delete(`/api/materials/${deleteId}`);
     setMaterials(materials.filter(x => x._id !== deleteId));
     setIsModalOpen(false);
     toast.success('Đã xóa');
  };

  const updateQuantity = async (id, currentQty, change) => {
      const newQty = parseInt(currentQty) + change;
      if(newQty < 0) return;
      await axios.put(`/api/materials/${id}`, { quantity: newQty });
      fetchMaterials();
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <AdminHeader title="Kho Vật Tư" />
        <div className="flex justify-between items-center mb-6">
            
            <button onClick={() => setIsFormOpen(!isFormOpen)} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 flex items-center">
                <FaPlus className="mr-2"/> Nhập vật tư mới
            </button>
        </div>

        {/* FORM THÊM NHANH */}
        {isFormOpen && (
            <form onSubmit={submitHandler} className="bg-white p-6 rounded-xl shadow-md mb-6 border border-blue-100 animate-fade-in-down">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <input type="text" placeholder="Tên vật tư (VD: Giấy A4)" className="border p-2 rounded" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
                    <input type="text" placeholder="Đơn vị (Ram, Kg)" className="border p-2 rounded" required value={formData.unit} onChange={e=>setFormData({...formData, unit: e.target.value})} />
                    <input type="number" placeholder="Số lượng ban đầu" className="border p-2 rounded" value={formData.quantity} onChange={e=>setFormData({...formData, quantity: e.target.value})} />
                    <input type="number" placeholder="Cảnh báo khi dưới..." className="border p-2 rounded" value={formData.minStock} onChange={e=>setFormData({...formData, minStock: e.target.value})} />
                    <button type="submit" className="bg-green-600 text-white rounded font-bold hover:bg-green-700">Lưu lại</button>
                </div>
            </form>
        )}

        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            <table className="min-w-full leading-normal">
                <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white text-xs font-bold uppercase">
                    <tr>
                        <th className="px-5 py-4 text-left">Tên vật tư</th>
                        <th className="px-5 py-4 text-center">Tồn kho</th>
                        <th className="px-5 py-4 text-center">Đơn vị</th>
                        <th className="px-5 py-4 text-center">Trạng thái</th>
                        <th className="px-5 py-4 text-center">Điều chỉnh</th>
                        <th className="px-5 py-4 text-center">Xóa</th>
                    </tr>
                </thead>
                <tbody>
                    {materials.map((item) => (
                        <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-5 py-4 font-bold text-gray-700">{item.name}</td>
                            <td className="px-5 py-4 text-center text-lg font-mono font-bold text-blue-600">{item.quantity}</td>
                            <td className="px-5 py-4 text-center text-sm text-gray-500">{item.unit}</td>
                            <td className="px-5 py-4 text-center">
                                {item.quantity <= item.minStock ? (
                                    <span className="flex items-center justify-center text-red-500 text-xs font-bold bg-red-50 py-1 px-2 rounded border border-red-100 animate-pulse">
                                        <FaExclamationTriangle className="mr-1"/> Sắp hết
                                    </span>
                                ) : <span className="text-green-600 text-xs bg-green-50 py-1 px-2 rounded">Ổn định</span>}
                            </td>
                            <td className="px-5 py-4 text-center">
                                <div className="flex justify-center space-x-2">
                                    <button onClick={()=>updateQuantity(item._id, item.quantity, -1)} className="w-8 h-8 bg-red-100 text-red-600 rounded hover:bg-red-200 font-bold">-</button>
                                    <button onClick={()=>updateQuantity(item._id, item.quantity, 1)} className="w-8 h-8 bg-green-100 text-green-600 rounded hover:bg-green-200 font-bold">+</button>
                                </div>
                            </td>
                            <td className="px-5 py-4 text-center">
                                <button onClick={()=>{setDeleteId(item._id); setIsModalOpen(true)}} className="text-red-400 hover:text-red-600"><FaTrash/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
      <ConfirmModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} onConfirm={deleteHandler} title="Xóa vật tư" message="Bạn chắc chắn muốn xóa?" />
    </div>
  );
};
export default MaterialScreen;