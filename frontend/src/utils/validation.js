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
};// 6. Validate Mã Số Thuế (VN: thường là 10 số hoặc 13 số có gạch nối)
// VD: 0101234567 hoặc 0101234567-001
export const validateTaxCode = (code) => {
  // Nếu rỗng thì bỏ qua (vì trường này không bắt buộc, tùy logic của bạn)
  if (!code || code.trim() === '') return true; 

  const cleanCode = code.trim();
  // Regex: 10 chữ số, tùy chọn thêm (- và 3 chữ số đuôi)
  const re = /^\d{10}(-\d{3})?$/;
  return re.test(cleanCode);
};

// 7. Validate Tên Công Ty / Doanh Nghiệp
// Khác với tên người, tên công ty được phép chứa số và ký tự đặc biệt như . , - &
export const validateTextMixed = (text) => {
  if (!text) return false;
  // Chỉ cần không rỗng và độ dài >= 2 ký tự
  return text.trim().length >= 2;
};