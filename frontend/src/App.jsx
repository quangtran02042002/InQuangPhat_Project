import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// Screens Khách hàng
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import ContactScreen from './screens/ContactScreen';
import LoginScreen from './screens/LoginScreen';

// Admin Components
import AdminRoute from './components/AdminRoute';
import DashboardScreen from './screens/admin/DashboardScreen'; // Import Dashboard mới
import QuoteListScreen from './screens/admin/QuoteListScreen';
function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Logic Header: Nếu đang ở trang Admin thì có thể ẩn Header chính đi (tùy chọn), ở đây ta cứ để tạm */}
        <Header />
        
        <main className="flex-grow">
          <Routes>
            {/* --- PUBLIC ROUTES (Ai cũng xem được) --- */}
            <Route path="/" element={<HomeScreen />} />
            <Route path="/product/:id" element={<ProductScreen />} />
            <Route path="/contact" element={<ContactScreen />} />
            <Route path="/login" element={<LoginScreen />} />

            {/* --- ADMIN ROUTES (Phải có Token Admin mới vào được) --- */}
            <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<DashboardScreen />} />
            <Route path="/admin/quotes" element={<QuoteListScreen />} /> {/* <--- THÊM ROUTE NÀY */}
         </Route>

          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;