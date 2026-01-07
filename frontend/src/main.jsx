import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
// 1. IMPORT HAI MÓN NÀY
import { Provider } from 'react-redux';
import store from './store';

import App from './App.jsx';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      {/* 2. BỌC PROVIDER Ở ĐÂY */}
      <Provider store={store}>
        <App />
      </Provider>
    </HelmetProvider>
  </React.StrictMode>,
);