import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  FaPlus, FaTimes, FaEdit, FaTrash, FaCheck, FaUndo,
  FaListAlt, FaFilter, FaCalendarAlt, FaUser,
  FaExclamationTriangle, FaClock, FaCheckCircle, FaSpinner,
  FaChevronDown, FaChevronUp, FaSave, FaFire, FaArrowUp, FaArrowDown, FaMinus
} from 'react-icons/fa';

const PRIORITY_MAP = {
  urgent: { label: 'Khẩn cấp', color: 'bg-red-500', text: 'text-red-600', border: 'border-red-300', bg: 'bg-red-50', icon: <FaFire className="text-[10px]" /> },
  high: { label: 'Cao', color: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-300', bg: 'bg-orange-50', icon: <FaArrowUp className="text-[10px]" /> },
  medium: { label: 'Trung bình', color: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-300', bg: 'bg-blue-50', icon: <FaMinus className="text-[10px]" /> },
  low: { label: 'Thấp', color: 'bg-gray-400', text: 'text-gray-500', border: 'border-gray-300', bg: 'bg-gray-50', icon: <FaArrowDown className="text-[10px]" /> },
};

const CATEGORY_MAP = {
  production: { label: 'Sản xuất', color: 'bg-emerald-100 text-emerald-700' },
  purchasing: { label: 'Mua hàng', color: 'bg-purple-100 text-purple-700' },
  finance: { label: 'Tài chính', color: 'bg-amber-100 text-amber-700' },
  general: { label: 'Chung', color: 'bg-gray-100 text-gray-700' },
};

const TodoTab = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = useMemo(() => ({ headers: { Authorization: `Bearer ${userInfo?.token}` } }), [userInfo?.token]);

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);

  // Filters
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Form
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium', dueDate: '',
    category: 'general', assignedTo: '', targetQuantity: 0, autoCompleteThreshold: 90,
  });

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/todos', config);
      setTodos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTodos(); }, []);

  // Tách active & completed
  const activeTodos = useMemo(() => {
    let filtered = todos.filter(t => t.status !== 'done');
    if (filterPriority) filtered = filtered.filter(t => t.priority === filterPriority);
    if (filterCategory) filtered = filtered.filter(t => t.category === filterCategory);
    return filtered;
  }, [todos, filterPriority, filterCategory]);

  const completedTodos = useMemo(() => {
    let filtered = todos.filter(t => t.status === 'done');
    if (filterPriority) filtered = filtered.filter(t => t.priority === filterPriority);
    if (filterCategory) filtered = filtered.filter(t => t.category === filterCategory);
    return filtered;
  }, [todos, filterPriority, filterCategory]);

  const pendingCount = todos.filter(t => t.status !== 'done').length;

  const openCreate = () => {
    setEditingTodo(null);
    setForm({ title: '', description: '', priority: 'medium', dueDate: '', category: 'general', assignedTo: '', targetQuantity: 0, autoCompleteThreshold: 90 });
    setShowModal(true);
  };

  const openEdit = (todo) => {
    setEditingTodo(todo);
    setForm({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 10) : '',
      category: todo.category,
      assignedTo: todo.assignedTo || '',
      targetQuantity: todo.targetQuantity || 0,
      autoCompleteThreshold: todo.autoCompleteThreshold || 90,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTodo) {
        await axios.put(`/api/todos/${editingTodo._id}`, form, config);
      } else {
        await axios.post('/api/todos', form, config);
      }
      setShowModal(false);
      fetchTodos();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi');
    }
  };

  const handleToggleDone = async (todo) => {
    try {
      const newStatus = todo.status === 'done' ? 'in_progress' : 'done';
      await axios.put(`/api/todos/${todo._id}`, { status: newStatus }, config);
      fetchTodos();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi');
    }
  };

  const handleUpdateProgress = async (todo, completedQuantity) => {
    try {
      await axios.put(`/api/todos/${todo._id}`, { completedQuantity }, config);
      fetchTodos();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi');
    }
  };

  const handleUpdateManualProgress = async (todo, progress) => {
    try {
      await axios.put(`/api/todos/${todo._id}`, { progress }, config);
      fetchTodos();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa công việc này?')) return;
    try {
      await axios.delete(`/api/todos/${id}`, config);
      fetchTodos();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi');
    }
  };

  const isOverdue = (todo) => {
    if (!todo.dueDate || todo.status === 'done') return false;
    return new Date(todo.dueDate) < new Date();
  };

  // --- RENDER TODO CARD ---
  const renderTodoCard = (todo, showUndoBtn = false) => {
    const prio = PRIORITY_MAP[todo.priority] || PRIORITY_MAP.medium;
    const cat = CATEGORY_MAP[todo.category] || CATEGORY_MAP.general;
    const overdue = isOverdue(todo);
    const hasQuantity = todo.targetQuantity > 0;

    return (
      <div
        key={todo._id}
        className={`bg-white rounded-2xl border ${overdue ? 'border-red-300 bg-red-50/30' : 'border-gray-200'} 
          p-4 shadow-sm hover:shadow-md transition-all group relative ${todo.status === 'done' ? 'opacity-75' : ''}`}
      >
        {/* Overdue badge */}
        {overdue && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
            <FaExclamationTriangle /> Quá hạn
          </div>
        )}

        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => handleToggleDone(todo)}
            className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all
              ${todo.status === 'done'
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-gray-300 hover:border-emerald-400 text-transparent hover:text-emerald-400'
              }`}
          >
            <FaCheck className="text-xs" />
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className={`font-bold text-sm ${todo.status === 'done' ? 'line-through text-gray-400' : 'text-[#111827]'}`}>
                {todo.title}
              </h3>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${prio.bg} ${prio.text} flex items-center gap-1`}>
                {prio.icon} {prio.label}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cat.color}`}>
                {cat.label}
              </span>
            </div>

            {todo.description && (
              <p className="text-xs text-gray-500 mb-2 line-clamp-2">{todo.description}</p>
            )}

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                <span className="font-bold">Tiến độ: {todo.progress}%</span>
                {hasQuantity && (
                  <span>{todo.completedQuantity || 0} / {todo.targetQuantity}</span>
                )}
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    todo.progress >= 90 ? 'bg-emerald-500' :
                    todo.progress >= 50 ? 'bg-blue-500' :
                    todo.progress >= 25 ? 'bg-amber-500' : 'bg-gray-300'
                  }`}
                  style={{ width: `${todo.progress}%` }}
                />
              </div>

              {/* Quick progress update (quantity mode) */}
              {hasQuantity && todo.status !== 'done' && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    min="0"
                    max={todo.targetQuantity}
                    defaultValue={todo.completedQuantity || 0}
                    className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateProgress(todo, Number(e.target.value));
                      }
                    }}
                    onBlur={(e) => {
                      const val = Number(e.target.value);
                      if (val !== (todo.completedQuantity || 0)) {
                        handleUpdateProgress(todo, val);
                      }
                    }}
                  />
                  <span className="text-[10px] text-gray-400">/ {todo.targetQuantity} (Enter để lưu)</span>
                </div>
              )}

              {/* Manual progress slider (no quantity mode) */}
              {!hasQuantity && todo.status !== 'done' && (
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={todo.progress}
                  onChange={(e) => handleUpdateManualProgress(todo, Number(e.target.value))}
                  className="w-full h-1.5 mt-1 accent-emerald-500 cursor-pointer"
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 text-[10px] text-gray-400 flex-wrap">
              {todo.dueDate && (
                <span className={`flex items-center gap-1 ${overdue ? 'text-red-500 font-bold' : ''}`}>
                  <FaCalendarAlt /> {new Date(todo.dueDate).toLocaleDateString('vi-VN')}
                </span>
              )}
              {todo.assignedTo && (
                <span className="flex items-center gap-1">
                  <FaUser /> {todo.assignedTo}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {showUndoBtn && (
              <button
                onClick={() => handleToggleDone(todo)}
                title="Hoàn tác"
                className="p-2 rounded-xl text-amber-500 hover:bg-amber-50 transition"
              >
                <FaUndo className="text-xs" />
              </button>
            )}
            <button
              onClick={() => openEdit(todo)}
              title="Sửa"
              className="p-2 rounded-xl text-blue-500 hover:bg-blue-50 transition"
            >
              <FaEdit className="text-xs" />
            </button>
            <button
              onClick={() => handleDelete(todo._id)}
              title="Xóa"
              className="p-2 rounded-xl text-red-400 hover:bg-red-50 transition"
            >
              <FaTrash className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#E6F0ED] rounded-2xl flex items-center justify-center text-[#006B4D] text-lg sm:text-xl shadow-sm">
            <FaListAlt />
          </div>
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-[#111827] flex items-center gap-2 flex-wrap">
              Danh sách Công việc
              {pendingCount > 0 && (
                <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                  {pendingCount} chưa xong
                </span>
              )}
            </h2>
            <p className="text-[#6B7280] text-[11px] mt-0.5">Quản lý & theo dõi tiến độ công việc</p>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#006B4D] hover:bg-[#00543c] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md active:scale-95"
        >
          <FaPlus /> Thêm công việc
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex items-center gap-1 text-[11px] text-gray-500">
          <FaFilter /> Lọc:
        </div>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="border border-gray-200 rounded-xl px-2 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs focus:ring-1 focus:ring-[#006B4D] outline-none bg-white"
        >
          <option value="">Tất cả ưu tiên</option>
          <option value="urgent">🔥 Khẩn cấp</option>
          <option value="high">🔶 Cao</option>
          <option value="medium">🔵 Trung bình</option>
          <option value="low">⬜ Thấp</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border border-gray-200 rounded-xl px-2 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs focus:ring-1 focus:ring-[#006B4D] outline-none bg-white"
        >
          <option value="">Tất cả phân loại</option>
          <option value="production">Sản xuất</option>
          <option value="purchasing">Mua hàng</option>
          <option value="finance">Tài chính</option>
          <option value="general">Chung</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006B4D] mx-auto mb-4" />
          <div className="text-gray-500 font-medium">Đang tải...</div>
        </div>
      ) : (
        <>
          {/* ACTIVE TODOS */}
          <div className="space-y-3 mb-8">
            {activeTodos.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <FaCheckCircle className="text-4xl text-emerald-300 mx-auto mb-3" />
                <p className="font-bold text-gray-500">Không có công việc nào đang chờ</p>
                <p className="text-xs text-gray-400 mt-1">Nhấn "Thêm công việc" để bắt đầu</p>
              </div>
            ) : (
              activeTodos.map((todo) => renderTodoCard(todo, false))
            )}
          </div>

          {/* COMPLETED TODOS */}
          {completedTodos.length > 0 && (
            <div>
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#111827] transition mb-3 w-full"
              >
                {showCompleted ? <FaChevronUp /> : <FaChevronDown />}
                <FaCheckCircle className="text-emerald-500" />
                Đã hoàn thành ({completedTodos.length})
                <div className="flex-1 border-t border-gray-200 ml-2" />
              </button>

              {showCompleted && (
                <div className="space-y-3 animate-fade-in-down">
                  {completedTodos.map((todo) => renderTodoCard(todo, true))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-3 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-extrabold text-base text-[#111827]">
                {editingTodo ? '✏️ Sửa công việc' : '➕ Thêm công việc mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition">
                <FaTimes className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-3 py-3 sm:p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Tiêu đề *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="VD: Gọi NCC giấy Couche báo giá"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Chi tiết công việc..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Ưu tiên</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none"
                  >
                    <option value="low">⬜ Thấp</option>
                    <option value="medium">🔵 Trung bình</option>
                    <option value="high">🔶 Cao</option>
                    <option value="urgent">🔥 Khẩn cấp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Phân loại</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none"
                  >
                    <option value="general">Chung</option>
                    <option value="production">Sản xuất</option>
                    <option value="purchasing">Mua hàng</option>
                    <option value="finance">Tài chính</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Hạn hoàn thành</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Người phụ trách</label>
                  <input
                    type="text"
                    value={form.assignedTo}
                    onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                    placeholder="VD: Anh Phát"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#006B4D]/20 focus:border-[#006B4D] outline-none"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs font-bold text-gray-600 mb-2">📊 Theo dõi tiến độ theo số lượng <span className="font-normal text-gray-400">(tùy chọn)</span></p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Mục tiêu số lượng</label>
                    <input
                      type="number"
                      min="0"
                      value={form.targetQuantity}
                      onChange={(e) => setForm({ ...form, targetQuantity: e.target.value })}
                      placeholder="VD: 1000"
                      className="w-full border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#006B4D] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Ngưỡng tự động xong (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={form.autoCompleteThreshold}
                      onChange={(e) => setForm({ ...form, autoCompleteThreshold: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#006B4D] outline-none"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5">Khi hoàn thành ≥ {form.autoCompleteThreshold}% → tự động đánh dấu "Hoàn thành"</p>
              </div>

              <button
                type="submit"
                className="w-full bg-[#006B4D] hover:bg-[#00543c] text-white font-bold py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 active:scale-95"
              >
                <FaSave /> {editingTodo ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoTab;
