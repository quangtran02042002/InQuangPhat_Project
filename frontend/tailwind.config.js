/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Các cấu hình màu sắc, font chữ riêng của bạn (nếu có)
    },
  },
  // --- QUAN TRỌNG: THÊM DÒNG NÀY VÀO MẢNG PLUGINS ---
  plugins: [
    require('@tailwindcss/typography'), 
  ],
}