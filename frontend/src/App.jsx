import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'; // Thêm useLocation
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import FloatingContact from './components/FloatingContact'; // Import nút chat nổi

// Import Screens (Giữ nguyên)
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import ContactScreen from './screens/ContactScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import NewsDetailScreen from './screens/NewsDetailScreen';
import InfrastructureScreen from './screens/InfrastructureScreen';
import MachineDetailPublicScreen from './screens/MachineDetailPublicScreen';
import AllProductsScreen from './screens/AllProductsScreen';
import AboutScreen from './screens/AboutScreen';
import NewsListScreenUser from './screens/NewsListScreenUser';

// Import Admin Screens (Giữ nguyên)
import AdminRoute from './components/AdminRoute';
import DashboardScreen from './screens/admin/DashboardScreen';
import QuoteListScreen from './screens/admin/QuoteListScreen';
import ProductListScreen from './screens/admin/ProductListScreen';
import ProductEditScreen from './screens/admin/ProductEditScreen';
import UserListScreen from './screens/admin/UserListScreen';
import ProfileScreen from './screens/admin/ProfileScreen';
import NewsListScreen from './screens/admin/NewsListScreen';
import NewsEditScreen from './screens/admin/NewsEditScreen';
import MachineListScreen from './screens/admin/MachineListScreen';
import MachineEditScreen from './screens/admin/MachineEditScreen';
import SupplierListScreen from './screens/admin/SupplierListScreen';
import SupplierEditScreen from './screens/admin/SupplierEditScreen';
import CustomerListScreen from './screens/admin/CustomerListScreen';
import CustomerEditScreen from './screens/admin/CustomerEditScreen';
import MaterialScreen from './screens/admin/MaterialScreen';
// import FinanceScreen from './screens/admin/FinanceScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import ChemicalScreen from './screens/admin/ChemicalScreen';
import PaperPriceScreen from './screens/admin/PaperPriceScreen';
import InkPriceScreen from './screens/admin/InkPriceScreen';
import MaterialPriceScreen from './screens/admin/MaterialPriceScreen';
// import DebtScreen from './screens/admin/DebtScreen';
import PrintFormulaScreen from './screens/admin/PrintFormulaScreen';
import ProductionOrderScreen from './screens/admin/ProductionOrderScreen';
import InventoryScreen from './screens/admin/InventoryScreen';
import PrintPriceCalcScreen from './screens/admin/PrintPriceCalcScreen';
import FinishingPriceScreen from './screens/admin/FinishingPriceScreen';
import CashFlowScreen from './screens/admin/CashFlowScreen';
import QuotationScreen from './screens/admin/QuotationScreen';
import TasksScreen from './screens/admin/TasksScreen';
// Admin screens loaded ✓

// --- TẠO COMPONENT CON ĐỂ XỬ LÝ LOGIC ẨN/HIỆN ---
const AppContent = () => {
  const location = useLocation(); // Hook này chỉ hoạt động bên trong Router

  // Kiểm tra xem có đang ở trang admin không
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">

      {/* 1. Ẩn Header nếu là trang Admin */}
      {!isAdminRoute && <Header />}

      <main className="flex-grow">
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<HomeScreen />} />
          <Route path="/search/:keyword" element={<HomeScreen />} />
          <Route path="/search/:keyword/page/:pageNumber" element={<HomeScreen />} />
          {/* Product Routing */}
          <Route path="/products" element={<AllProductsScreen />} />
          <Route path="/products/:group" element={<AllProductsScreen />} />
          <Route path="/products/:group/page/:pageNumber" element={<AllProductsScreen />} />
          <Route path="/products/:group/category/:category" element={<AllProductsScreen />} />
          <Route path="/products/:group/category/:category/page/:pageNumber" element={<AllProductsScreen />} />

          <Route path="/product/:id" element={<ProductScreen />} />
          <Route path="/contact" element={<ContactScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />

          <Route path="/news" element={<NewsListScreenUser />} />
          <Route path="/news/:id" element={<NewsDetailScreen />} />

          <Route path="/infrastructure" element={<InfrastructureScreen />} />
          <Route path="/infrastructure/:id" element={<MachineDetailPublicScreen />} />

          <Route path="/about" element={<AboutScreen />} />
          <Route path="/profile" element={<UserProfileScreen />} />
          {/* ADMIN ROUTES */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<DashboardScreen />} />
            <Route path="/admin/quotes" element={<QuoteListScreen />} />

            <Route path="/admin/productlist" element={<ProductListScreen />} />
            <Route path="/admin/productlist/:pageNumber" element={<ProductListScreen />} />
            <Route path="/admin/product/create" element={<ProductEditScreen />} />
            <Route path="/admin/product/:id/edit" element={<ProductEditScreen />} />

            <Route path="/admin/users" element={<UserListScreen />} />
            <Route path="/admin/profile" element={<ProfileScreen />} />

            <Route path="/admin/newslist" element={<NewsListScreen />} />
            <Route path="/admin/news/create" element={<NewsEditScreen />} />
            <Route path="/admin/news/:id/edit" element={<NewsEditScreen />} />

            <Route path="/admin/machinelist" element={<MachineListScreen />} />
            <Route path="/admin/machine/new" element={<MachineEditScreen />} />
            <Route path="/admin/machine/:id/edit" element={<MachineEditScreen />} />

            <Route path="/admin/supplierlist" element={<SupplierListScreen />} />
            <Route path="/admin/supplier/new" element={<SupplierEditScreen />} />
            <Route path="/admin/supplier/:id/edit" element={<SupplierEditScreen />} />

            <Route path="/admin/customerlist" element={<CustomerListScreen />} />
            <Route path="/admin/customer/create" element={<CustomerEditScreen />} />
            <Route path="/admin/customer/:id/edit" element={<CustomerEditScreen />} />
            <Route path="/admin/materials" element={<MaterialScreen />} />
            {/* <Route path="/admin/finance" element={<FinanceScreen />} /> */}
            <Route path="/admin/chemicals" element={<ChemicalScreen />} />
            <Route path="/admin/paper-prices" element={<PaperPriceScreen />} />
            <Route path="/admin/ink-prices" element={<InkPriceScreen />} />
            <Route path="/admin/material-prices" element={<MaterialPriceScreen />} />
            {/* <Route path="/admin/debts" element={<DebtScreen />} /> */}
            <Route path="/admin/print-formulas" element={<PrintFormulaScreen />} />
            <Route path="/admin/print-price-calc" element={<PrintPriceCalcScreen />} />
            <Route path="/admin/finishing-prices" element={<FinishingPriceScreen />} />
            <Route path="/admin/production-orders" element={<ProductionOrderScreen />} />
            <Route path="/admin/inventory" element={<InventoryScreen />} />
            <Route path="/admin/finance" element={<CashFlowScreen />} />
            <Route path="/admin/quotations" element={<QuotationScreen />} />
            <Route path="/admin/tasks" element={<TasksScreen />} />
            <Route path="/admin/todos" element={<TasksScreen initialTab="todo" />} />
            <Route path="/admin/material-orders" element={<TasksScreen initialTab="material-orders" />} />
          </Route>
        </Routes>
      </main>

      {/* 2. Ẩn Footer nếu là trang Admin */}
      {!isAdminRoute && <Footer />}

      {/* 3. Ẩn Nút Chat Nổi nếu là trang Admin */}
      {!isAdminRoute && <FloatingContact />}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

// --- COMPONENT CHÍNH ---
function App() {
  return (
    <Router>
      <ScrollToTop />
      {/* Gọi AppContent bên trong Router để useLocation hoạt động */}
      <AppContent />
    </Router>
  );
}

export default App;