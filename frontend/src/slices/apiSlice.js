import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  // 1. QUAN TRỌNG: Cho phép gửi Cookie/Token đi kèm
  credentials: 'include', 
  
  // 2. PHÒNG HỜ: Nếu bạn dùng Token Bearer trong LocalStorage
  prepareHeaders: (headers) => {
    const userInfo = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo')) 
      : null;
    
    if (userInfo && userInfo.token) {
      headers.set('authorization', `Bearer ${userInfo.token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['Product', 'Order', 'User'],
  endpoints: (builder) => ({}),
});