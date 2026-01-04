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

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<HomeScreen />} />
            <Route path="/search/:keyword" element={<HomeScreen />} /> {/* Tìm kiếm */}
            <Route path="/page/:pageNumber" element={<HomeScreen />} /> {/* Phân trang */}
            <Route path="/search/:keyword/page/:pageNumber" element={<HomeScreen />} /> {/* Tìm + Phân trang */}
            
            <Route path="/product/:id" element={<ProductScreen />} />
            <Route path="/contact" element={<ContactScreen />} />
            <Route path="/login" element={<LoginScreen />} />

            {/* ADMIN ROUTES */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<DashboardScreen />} />
              <Route path="/admin/quotes" element={<QuoteListScreen />} />
              <Route path="/admin/productlist" element={<ProductListScreen />} />
              <Route path="/admin/productlist/:pageNumber" element={<ProductListScreen />} />
              <Route path="/admin/product/create" element={<ProductEditScreen />} />
              <Route path="/admin/product/:id/edit" element={<ProductEditScreen />} />
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