import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  // Lấy thông tin từ bộ nhớ trình duyệt
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // Kiểm tra: Có user không? VÀ User đó có phải là Admin không?
  // Nếu ĐÚNG: Trả về <Outlet /> (nghĩa là cho phép hiển thị nội dung bên trong)
  // Nếu SAI: Dùng <Navigate /> để chuyển hướng về trang Login
  return userInfo && userInfo.isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;