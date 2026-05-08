import React, { useState, useEffect, useCallback } from 'react';
import { FaPaperclip, FaSpinner, FaTimes, FaFileAlt } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const getToken = () => ({
  headers: {
    Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo'))?.token}`,
  },
});

const FinanceAttachmentUploader = ({ attachments = [], setAttachments }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Define handleFiles so it can be called from paste and input
  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    try {
      const { data } = await axios.post('/api/upload/finance', formData, {
        headers: {
          ...getToken().headers,
          'Content-Type': 'multipart/form-data',
        },
      });
      // data is an array of uploaded objects
      setAttachments((prev) => [...prev, ...data]);
      toast.success('Tải tệp lên thành công');
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tải tệp đính kèm');
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Handle Ctrl+V global Paste event
  const handlePaste = useCallback((e) => {
    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
      const hasFiles = Array.from(e.clipboardData.files).some(f => f.type.startsWith('image/') || f.type.includes('pdf'));
      if (hasFiles) {
        e.preventDefault();
        handleFiles(e.clipboardData.files);
      }
    }
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    // We attach it to window so pasting anywhere in the modal works
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-xl p-4 md:p-6 text-center transition-all ${
          isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
        }`}
      >
        <input 
          type="file" 
          multiple 
          onChange={(e) => handleFiles(e.target.files)} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-2 pointer-events-none">
          {isUploading ? (
            <FaSpinner className="animate-spin text-2xl text-emerald-600" />
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm">
                <FaPaperclip />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700">Tải lên chứng từ</p>
                <p className="text-xs text-gray-500 mt-1">Kéo thả, bấm chọn, hoặc dán (Ctrl+V) hình ảnh</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Attachment List Preview */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-3">
          {attachments.map((att, i) => (
            <div key={i} className="relative group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <button 
                type="button"
                onClick={() => removeAttachment(i)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition z-10 shadow"
              >
                <FaTimes size={10} />
              </button>
              
              {att.resourceType === 'image' || att.format?.match(/jpg|jpeg|png|webp|gif/i) ? (
                <a href={att.url} target="_blank" rel="noreferrer" className="block aspect-square bg-gray-100 overflow-hidden relative group/img">
                  <img src={att.url} alt="attachment" className="w-full h-full object-cover transition transform group-hover/img:scale-105" />
                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition" />
                </a>
              ) : (
                <a href={att.url} target="_blank" rel="noreferrer" className="block aspect-square bg-gray-50 hover:bg-gray-100 transition flex flex-col items-center justify-center text-gray-500">
                  <FaFileAlt className="text-2xl mb-2 text-indigo-400" />
                  <span className="text-[9px] font-mono px-2 truncate w-full text-center">
                    {att.originalName || 'TaiLieu.pdf'}
                  </span>
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FinanceAttachmentUploader;
