/**
 * Seed data cho 15 danh mục tài chính mặc định
 * Được dùng bởi script seedFinanceDefaults.js và API /api/finance/categories/seed
 */
const DEFAULT_CATEGORIES = [
  // REVENUE — Thu nhập
  { code: 'REV-IN',     name: 'Doanh thu in ấn',      direction: 'income',  group: 'revenue', sortOrder: 1,  isSystem: true,  description: 'Tiền thu từ đơn hàng in ấn' },
  { code: 'REV-DESIGN', name: 'Doanh thu thiết kế',    direction: 'income',  group: 'revenue', sortOrder: 2,  isSystem: true,  description: 'Phí thiết kế ấn phẩm' },
  { code: 'REV-SUBCON', name: 'Doanh thu gia công',    direction: 'income',  group: 'revenue', sortOrder: 3,  isSystem: true,  description: 'Gia công cán, bế, dán thuê cho bên ngoài' },
  { code: 'REV-OTHER',  name: 'Doanh thu khác',        direction: 'income',  group: 'revenue', sortOrder: 4,  isSystem: false, description: 'Các khoản thu nhập phát sinh khác' },

  // COGS — Giá vốn (Nguyên vật liệu & Sản xuất)
  { code: 'COGS-PAPER',    name: 'Chi phí mua giấy',       direction: 'expense', group: 'cogs', sortOrder: 10, isSystem: true,  description: 'Giấy Coucher, Ivory, Offset, Ford, Duplex...' },
  { code: 'COGS-INK',      name: 'Chi phí mua mực in',     direction: 'expense', group: 'cogs', sortOrder: 11, isSystem: true,  description: 'Mực offset 4 màu, mực pha, mực phủ bóng' },
  { code: 'COGS-PLATE',    name: 'Chi phí kẽm in',         direction: 'expense', group: 'cogs', sortOrder: 12, isSystem: true,  description: 'Ghi kẽm, phơi kẽm, xuất bản in' },
  { code: 'COGS-CHEMICAL', name: 'Chi phí hóa chất',       direction: 'expense', group: 'cogs', sortOrder: 13, isSystem: true,  description: 'Nước rửa lô, cồn, thuốc hiện kẽm' },
  { code: 'COGS-SUBCON',   name: 'Chi phí gia công ngoài', direction: 'expense', group: 'cogs', sortOrder: 14, isSystem: true,  description: 'Cán màng, bế, dán hộp, phủ UV, ép nhũ thuê ngoài' },
  { code: 'COGS-SUPPLY',   name: 'Vật tư phụ in ấn',       direction: 'expense', group: 'cogs', sortOrder: 15, isSystem: false, description: 'Băng keo, màng co, dây đai, phấn chống dính' },

  // OPEX — Chi phí vận hành
  { code: 'OPEX-SALARY',   name: 'Lương & nhân sự',        direction: 'expense', group: 'opex', sortOrder: 20, isSystem: true,  description: 'Lương NV, thợ in, BHXH, phụ cấp' },
  { code: 'OPEX-RENT',     name: 'Thuê mặt bằng xưởng',    direction: 'expense', group: 'opex', sortOrder: 21, isSystem: true,  description: 'Tiền thuê xưởng sản xuất, văn phòng' },
  { code: 'OPEX-UTILITY',  name: 'Điện nước sản xuất',     direction: 'expense', group: 'opex', sortOrder: 22, isSystem: true,  description: 'Hóa đơn điện 3 pha, điện chiếu sáng, nước' },
  { code: 'OPEX-MAINT',    name: 'Bảo trì máy in offset',  direction: 'expense', group: 'opex', sortOrder: 23, isSystem: true,  description: 'Sửa chữa, thay thế linh kiện máy in, máy bế, máy xén' },
  { code: 'OPEX-LOGIST',   name: 'Vận chuyển & Giao hàng', direction: 'expense', group: 'opex', sortOrder: 24, isSystem: true,  description: 'Chi phí thuê xe tải, cước giao nhận ấn phẩm' },
  { code: 'OPEX-DEPREC',   name: 'Khấu hao máy móc',       direction: 'expense', group: 'opex', sortOrder: 25, isSystem: true,  description: 'Phân bổ khấu hao thiết bị cố định' },
  { code: 'OPEX-OTHER',    name: 'Chi phí vận hành khác',  direction: 'expense', group: 'opex', sortOrder: 26, isSystem: false, description: 'Văn phòng phẩm, internet, tiếp khách...' },
];

module.exports = DEFAULT_CATEGORIES;
