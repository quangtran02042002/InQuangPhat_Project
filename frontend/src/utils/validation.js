// frontend/src/utils/validation.js

// 1. Validate Tên (Họ tên người thật)
export const validateName = (name) => {
  // Regex này chỉ chấp nhận: Chữ cái (bao gồm tiếng Việt có dấu) và khoảng trắng
  // \p{L} đại diện cho mọi chữ cái Unicode (a-z, à, á, ô, đ...)
  // u flag ở cuối để bật chế độ Unicode
  const re = /^[\p{L}\s]+$/u; 

  // Kiểm tra 1: Phải khớp pattern trên (chỉ chữ và khoảng trắng)
  if (!re.test(name)) return false;

  // Kiểm tra 2: Chặn trường hợp nhập toàn khoảng trắng hoặc quá ngắn
  if (name.trim().length < 2) return false;

  return true;
};

// 2. Validate Số điện thoại (Chuẩn Việt Nam)
export const validatePhone = (phone) => {
  // Bước 1: Loại bỏ mọi khoảng trắng thừa (nếu khách nhập "0909 123 456")
  const cleanPhone = phone.replace(/\s/g, '');

  // Bước 2: Kiểm tra xem có chứa ký tự không phải số không?
  // Nếu chứa chữ cái (ví dụ "0909abc") -> Loại ngay
  if (/\D/.test(cleanPhone)) return false;

  // Bước 3: Kiểm tra độ dài (Chỉ chấp nhận 10 hoặc 11 số)
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) return false;

  // Bước 4: Kiểm tra đầu số nhà mạng Việt Nam
  // 03, 05, 07, 08, 09 (Di động) hoặc 02 (Máy bàn)
  const re = /^(03|05|07|08|09|02)+([0-9]{8,9})\b/;
  return re.test(cleanPhone);
};

// 3. Validate Email (Chuẩn quốc tế)
export const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

// 4. Validate Giá tiền & Số lượng (Số dương)
export const validateNumberInfo = (num) => {
  // Phải là số, không được để trống, không âm, lớn hơn 0
  return !isNaN(num) && Number(num) > 0;
};

// 5. Validate Số lượng tồn kho (Số không âm - có thể bằng 0)
export const validateStock = (num) => {
  return !isNaN(num) && Number(num) >= 0;
};