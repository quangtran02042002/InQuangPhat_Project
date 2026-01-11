import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Footer from './components/Footer';

import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import ContactScreen from './screens/ContactScreen';
import LoginScreen from './screens/LoginScreen';

import AdminRoute from './components/AdminRoute';
import DashboardScreen from './screens/admin/DashboardScreen';
import QuoteListScreen from './screens/admin/QuoteListScreen';
import ProductListScreen from './screens/admin/ProductListScreen';
import ProductEditScreen from './screens/admin/ProductEditScreen';
import UserListScreen from './screens/admin/UserListScreen';
import ProfileScreen from './screens/admin/ProfileScreen';
import NewsListScreen from './screens/admin/NewsListScreen';
import NewsEditScreen from './screens/admin/NewsEditScreen';
import NewsDetailScreen from './screens/NewsDetailScreen';
import RegisterScreen from './screens/RegisterScreen';
import ScrollToTop from './components/ScrollToTop';
import MachineListScreen from './screens/admin/MachineListScreen';
import MachineEditScreen from './screens/admin/MachineEditScreen';
import InfrastructureScreen from './screens/InfrastructureScreen';
import MachineDetailPublicScreen from './screens/MachineDetailPublicScreen';
import AllProductsScreen from './screens/AllProductsScreen';
import SupplierListScreen from './screens/admin/SupplierListScreen';
import SupplierEditScreen from './screens/admin/SupplierEditScreen';
import AboutScreen from './screens/AboutScreen';
function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow">
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<HomeScreen />} />
            <Route path="/search/:keyword" element={<HomeScreen />} /> {/* Tìm kiếm */}
            <Route path="/page/:pageNumber" element={<HomeScreen />} /> {/* Phân trang */}
            <Route path="/search/:keyword/page/:pageNumber" element={<HomeScreen />} /> {/* Tìm + Phân trang */}
            <Route path="/category/:category" element={<HomeScreen />} />
            <Route path="/category/:category/page/:pageNumber" element={<HomeScreen />} />
            <Route path="/product/:id" element={<ProductScreen />} />
            <Route path="/contact" element={<ContactScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/news/:id" element={<NewsDetailScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/infrastructure" element={<InfrastructureScreen />} />
            <Route path="/infrastructure/:id" element={<MachineDetailPublicScreen />} />
            <Route path="/products" element={<AllProductsScreen />} />
            <Route path="/about" element={<AboutScreen />} />
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
            </Route>
          </Routes>
        </main>

        <Footer />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;