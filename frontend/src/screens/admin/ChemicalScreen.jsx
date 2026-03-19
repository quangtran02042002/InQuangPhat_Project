import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaFlask, FaTrash, FaPlus, FaExclamationTriangle, FaEdit } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import ConfirmModal from '../../components/ConfirmModal';

const ChemicalScreen = () => {
  const [chemicals, setChemicals] = useState([]);
  const [formData, setFormData] = useState({ name: '', unit: '', quantity: 0, minStock: 5, safetyNote: '', supplier: '' });
  const [editQuantity, setEditQuantity] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { fetchChemicals(); }, []);

  const fetchChemicals = async () => {
    try {
      const { data } = await axios.get('/api/chemicals');
      setChemicals(data);
    } catch (error) { toast.error("Lỗi tải dữ liệu"); }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
        await axios.post('/api/chemicals', formData);
        toast.success('Đã thêm hóa chất mới');
        setFormData({ name: '', unit: '', quantity: 0, minStock: 5, safetyNote: '', supplier: '' });
        fetchChemicals();
    } catch (error) { toast.error('Lỗi khi thêm'); }
  };

  const updateQuantity = async (id, currentQty) => {
      const newQty = editQuantity[id];
      if (newQty === undefined || newQty === currentQty) return;
      
      try {
          await axios.put(`/api/chemicals/${id}`, { quantity: newQty });
          toast.success('Cập nhật tồn kho thành công');
          fetchChemicals();
      } catch (error) { toast.error('Lỗi cập nhật'); }
  };

  const deleteHandler = async () => {
     try {
         await axios.delete(`/api/chemicals/${deleteId}`);
         setChemicals(chemicals.filter(x => x._id !== deleteId));
         setIsModalOpen(false);
         toast.success('Đã xóa hóa chất');
     } catch (error) { toast.error('Lỗi khi xóa'); }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="h-full flex-shrink-0">
         <Sidebar />
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center uppercase">
                <FaFlask className="mr-3 text-purple-600" /> Quản lý Kho Hóa Chất / Mực In
            </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* CỘT TRÁI: FORM THÊM MỚI */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 h-fit">
                <h3 className="font-bold text-lg mb-5 text-gray-800 border-b border-purple-100 pb-2 flex items-center">
                    <FaPlus className="text-purple-500 mr-2"/> Thêm Danh Mục Mới
                </h3>
                <form onSubmit={submitHandler} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Tên hóa chất / Mực in</label>
                        <input type="text" required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="VD: Mực UV xanh, Dung môi Xylene..."/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Đơn vị</label>
                            <input type="text" required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={formData.unit} onChange={e=>setFormData({...formData, unit: e.target.value})} placeholder="Can, Lít, Kg..."/>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Cảnh báo hết (Min)</label>
                            <input type="number" required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={formData.minStock} onChange={e=>setFormData({...formData, minStock: parseInt(e.target.value)})}/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Cảnh báo An toàn / Bảo quản</label>
                        <input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none placeholder-red-300" value={formData.safetyNote} onChange={e=>setFormData({...formData, safetyNote: e.target.value})} placeholder="VD: Dễ cháy, để nơi thoáng mát..."/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nhà cung cấp</label>
                        <input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={formData.supplier} onChange={e=>setFormData({...formData, supplier: e.target.value})}/>
                    </div>
                    <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition shadow-md">
                        + Tạo danh mục
                    </button>
                </form>
            </div>

            {/* CỘT PHẢI: DANH SÁCH HÓA CHẤT */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 font-bold text-gray-700 bg-gray-50 flex justify-between items-center">
                    <span>Danh sách Tồn kho Hóa chất</span>
                    <span className="text-sm font-normal text-gray-500 bg-white px-3 py-1 rounded-full border">
                        Tổng: {chemicals.length} mã
                    </span>
                </div>
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                    <table className="min-w-full leading-normal">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase sticky top-0 z-10">
                            <tr>
                                <th className="px-5 py-3 text-left">Tên Hóa Chất</th>
                                <th className="px-5 py-3 text-center">Đơn vị</th>
                                <th className="px-5 py-3 text-center">Tồn kho hiện tại</th>
                                <th className="px-5 py-3 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chemicals.map((item) => (
                                <tr key={item._id} className="border-b border-gray-50 hover:bg-purple-50 transition">
                                    <td className="px-5 py-4">
                                        <div className="font-bold text-gray-800">{item.name}</div>
                                        {item.safetyNote && (
                                            <div className="text-[11px] text-red-500 mt-1 flex items-center font-medium">
                                                <FaExclamationTriangle className="mr-1"/> {item.safetyNote}
                                            </div>
                                        )}
                                        <div className="text-[11px] text-gray-400 mt-0.5">NCC: {item.supplier || 'Chưa cập nhật'}</div>
                                    </td>
                                    <td className="px-5 py-4 text-center text-sm font-bold text-gray-600">
                                        {item.unit}
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <input 
                                                type="number" 
                                                className={`w-20 text-center border p-1.5 rounded outline-none font-bold ${item.quantity <= item.minStock ? 'border-red-400 text-red-600 bg-red-50' : 'border-gray-300 focus:border-purple-500'}`}
                                                defaultValue={item.quantity}
                                                onChange={(e) => setEditQuantity({...editQuantity, [item._id]: e.target.value})}
                                                onBlur={() => updateQuantity(item._id, item.quantity)}
                                            />
                                        </div>
                                        {item.quantity <= item.minStock && (
                                            <div className="text-[10px] text-red-500 font-bold mt-1">Sắp hết! (Dưới {item.minStock})</div>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                         <button onClick={()=>{setDeleteId(item._id); setIsModalOpen(true)}} className="p-2 text-gray-400 hover:text-red-500 bg-white rounded-full hover:shadow transition">
                                             <FaTrash/>
                                         </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>

      <ConfirmModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} onConfirm={deleteHandler} title="Xóa hóa chất" message="Hóa chất này sẽ bị xóa khỏi danh mục kho. Bạn chắc chắn chứ?" />
    </div>
  );
};
export default ChemicalScreen;