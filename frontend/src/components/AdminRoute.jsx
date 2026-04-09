import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  // Lấy thông tin từ bộ nhớ trình duyệt
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // Cho phép mọi user đã đăng nhập vào khung Admin, 
  // việc ẩn button báo quyền sẽ do từng màn hình tự quyết định dựa theo userInfo.isAdmin.
  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;