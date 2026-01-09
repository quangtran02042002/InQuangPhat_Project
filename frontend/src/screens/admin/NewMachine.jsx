import React, { useState } from 'react';
import axios from 'axios'; // Đảm bảo bạn đã cài axios: npm install axios

const NewMachine = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [video, setVideo] = useState('');
  const [images, setImages] = useState([]); // Chứa file dạng base64 để gửi đi
  const [imagesPreview, setImagesPreview] = useState([]); // Chứa link để hiển thị preview
  const [loading, setLoading] = useState(false);

  const categories = [
    "Máy in Offset",
    "Máy gia công sau in", 
    "Máy in vải",
    "Khác"
  ];

  // Xử lý khi Submit form
  const createMachineSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    const myForm = {
        name,
        category,
        description,
        video,
        images // Gửi mảng ảnh base64
    };

    try {
      const config = { headers: { "Content-Type": "application/json" } };
      
      // Thay đổi URL dưới đây theo đúng port backend của bạn (ví dụ localhost:4000)
      await axios.post('/api/v1/admin/machine/new', myForm, config);
      
      alert('Thêm máy thành công!');
      // Reset form
      setName('');
      setCategory('');
      setImages([]);
      setImagesPreview([]);
      setVideo('');
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi chọn ảnh
  const createMachineImagesChange = (e) => {
    const files = Array.from(e.target.files);

    setImages([]);
    setImagesPreview([]);

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.readyState === 2) {
          setImagesPreview((old) => [...old, reader.result]);
          setImages((old) => [...old, reader.result]);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: '#004aad' }}>Thêm Máy Mới</h2>
      
      <form onSubmit={createMachineSubmitHandler} encType="multipart/form-data">
        
        {/* Tên Máy */}
        <div style={{ marginBottom: '15px' }}>
          <label>Tên Máy:</label>
          <input
            type="text"
            placeholder="Ví dụ: Máy in Offset 6 màu..."
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '10px' }}
          />
        </div>

        {/* Danh Mục */}
        <div style={{ marginBottom: '15px' }}>
          <label>Danh Mục:</label>
          <select 
            onChange={(e) => setCategory(e.target.value)} 
            style={{ width: '100%', padding: '10px' }}
            required
          >
            <option value="">Chọn danh mục</option>
            {categories.map((cate) => (
              <option key={cate} value={cate}>{cate}</option>
            ))}
          </select>
        </div>

        {/* Video & Mô tả */}
        <div style={{ marginBottom: '15px' }}>
            <label>Link Video (Youtube/Drive):</label>
            <input
                type="text"
                placeholder="https://..."
                value={video}
                onChange={(e) => setVideo(e.target.value)}
                style={{ width: '100%', padding: '10px' }}
            />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Mô tả ngắn:</label>
          <textarea
            placeholder="Mô tả khả năng của máy..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            style={{ width: '100%', padding: '10px' }}
          />
        </div>

        {/* Chọn Ảnh */}
        <div style={{ marginBottom: '15px' }}>
          <label>Hình Ảnh (Chọn nhiều ảnh):</label>
          <input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={createMachineImagesChange}
            multiple
            style={{ display: 'block', marginTop: '5px' }}
          />
        </div>

        {/* Preview Ảnh */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '20px' }}>
          {imagesPreview.map((img, index) => (
            <img key={index} src={img} alt="Preview" style={{ height: '80px' }} />
          ))}
        </div>

        <button 
            type="submit" 
            disabled={loading}
            style={{ 
                backgroundColor: loading ? '#ccc' : '#e63946', 
                color: 'white', 
                padding: '12px 24px', 
                border: 'none', 
                cursor: 'pointer',
                width: '100%',
                fontSize: '16px'
            }}
        >
          {loading ? 'Đang xử lý...' : 'Tạo Máy Mới'}
        </button>
      </form>
    </div>
  );
};

export default NewMachine;