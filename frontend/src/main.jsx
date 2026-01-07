import React from 'react';
import ReactDOM from 'react-dom/client';
// 1. Import HelmetProvider
import { HelmetProvider } from 'react-helmet-async'; 
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Bọc App bằng HelmetProvider */}
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);