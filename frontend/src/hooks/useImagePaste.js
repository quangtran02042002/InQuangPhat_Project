import { useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useImagePaste = ({ onImageUploaded, containerRef, enabled = true }) => {
  const uploadImage = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('images', file);
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const toastId = toast.loading('Đang dán ảnh từ clipboard...');
    try {
      const { data } = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`
        }
      });
      toast.update(toastId, { render: '✅ Đã dán ảnh thành công!', type: 'success', isLoading: false, autoClose: 2000 });
      return data[0]; // URL string
    } catch (err) {
      toast.update(toastId, { render: '❌ Lỗi dán ảnh: ' + (err.response?.data?.message || err.message), type: 'error', isLoading: false, autoClose: 3000 });
      return null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const handler = async (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();
          const file = items[i].getAsFile();
          const url = await uploadImage(file);
          if (url) onImageUploaded(url);
          break; // Chỉ xử lý 1 ảnh mỗi lần dán
        }
      }
    };
    
    // Nếu truyền ref cụ thể thì chỉ lắng nghe trên ref đó, ngược lại lắng nghe toàn cục
    const el = containerRef?.current || document;
    el.addEventListener('paste', handler);
    return () => el.removeEventListener('paste', handler);
  }, [enabled, onImageUploaded, containerRef, uploadImage]);
};
