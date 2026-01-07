import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './slices/apiSlice';
// Nếu bạn có authSlice hay cartSlice thì import thêm vào đây, tạm thời dùng apiSlice trước
// import authSliceReducer from './slices/authSlice'; 

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    // auth: authSliceReducer, // Bỏ comment nếu đã có file này
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

export default store;