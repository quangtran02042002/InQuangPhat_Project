import React from 'react';
import { Link } from 'react-router-dom';
import { 
    FaArrowRight, 
    // Icon nhóm Offset
    FaStickyNote, FaGift, FaBoxOpen, FaFolderOpen, FaBookOpen, FaTag, FaShoppingBag, FaEnvelope,
    // Icon nhóm Vải
    FaTint, FaLayerGroup, FaFillDrip, FaFireAlt, FaCube, FaStar, FaHandHoldingWater, FaCloud
} from 'react-icons/fa';

const CategoryGrid = () => {
  // 1. DATA NHÓM OFFSET (Đã khôi phục màu sắc đa dạng)
  const offsetCategories = [
    { id: 1, name: 'In Decal, Tem Nhãn', slug: 'Tem nhãn', icon: <FaStickyNote />, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'hover:border-yellow-300', desc: 'Tem vỡ, decal nhựa, tem bảo hành.', group: 'offset' },
    { id: 2, name: 'Hộp Cứng, Hộp Quà', slug: 'Hộp cứng', icon: <FaGift />, color: 'text-red-600', bg: 'bg-red-50', border: 'hover:border-red-300', desc: 'Hộp carton lạnh, nắp âm dương cao cấp.', group: 'offset' },
    { id: 3, name: 'In Hộp Mềm', slug: 'Hộp giấy', icon: <FaBoxOpen />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-300', desc: 'Hộp giấy Ivory, Duplex. In Offset giá rẻ.', group: 'offset' },
    { id: 4, name: 'Kẹp File / Folder', slug: 'Kẹp file', icon: <FaFolderOpen />, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'hover:border-cyan-300', desc: 'Kẹp tài liệu, Profile công ty chuyên nghiệp.', group: 'offset' },
    { id: 5, name: 'Sách / Catalogue', slug: 'Catalogue', icon: <FaBookOpen />, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'hover:border-indigo-300', desc: 'Catalogue, kỷ yếu, tạp chí. Đóng gáy keo.', group: 'offset' },
    { id: 6, name: 'In Hang Tag', slug: 'Hang tag', icon: <FaTag />, color: 'text-pink-600', bg: 'bg-pink-50', border: 'hover:border-pink-300', desc: 'Thẻ treo quần áo, mác treo bế hình.', group: 'offset' },
    { id: 7, name: 'In Túi Xách Giấy', slug: 'Túi giấy', icon: <FaShoppingBag />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-300', desc: 'Túi Kraft, túi Shop thời trang sang trọng.', group: 'offset' },
    { id: 8, name: 'In Phong Bì', slug: 'Phong bì', icon: <FaEnvelope />, color: 'text-slate-600', bg: 'bg-slate-50', border: 'hover:border-slate-300', desc: 'Phong bì thư A4, A5, A6. Giấy Ford, Offset.', group: 'offset' },
  ];

  // 2. DATA NHÓM GARMENT (Đã khôi phục màu sắc đa dạng)
  const garmentCategories = [
    { id: 9, name: 'Mực nước (Waterbased)', slug: 'Waterbased', icon: <FaTint />, color: 'text-sky-500', bg: 'bg-sky-50', border: 'hover:border-sky-300', desc: 'Mềm mịn, thoáng khí, an toàn cho da.', group: 'garment' },
    { id: 10, name: 'In Rubber (Mực Cao Su)', slug: 'In rubber', icon: <FaLayerGroup />, color: 'text-orange-600', bg: 'bg-orange-50', border: 'hover:border-orange-300', desc: 'Co giãn tốt, che phủ cao trên vải tối màu.', group: 'garment' },
    { id: 11, name: 'In Mực Dầu (Plastisol)', slug: 'In mực dầu', icon: <FaFillDrip />, color: 'text-gray-700', bg: 'bg-gray-100', border: 'hover:border-gray-300', desc: 'Bám dính tốt, màu sắc rực rỡ, in tram nét.', group: 'garment' },
    { id: 12, name: 'In Chuyển Nhiệt (PET)', slug: 'In chuyển nhiệt', icon: <FaFireAlt />, color: 'text-rose-600', bg: 'bg-rose-50', border: 'hover:border-rose-300', desc: 'In hình đa sắc, chuyển màu 3D sắc nét.', group: 'garment' },
    { id: 13, name: 'High Density (Cao Thành)', slug: 'High density', icon: <FaCube />, color: 'text-purple-600', bg: 'bg-purple-50', border: 'hover:border-purple-300', desc: 'Hiệu ứng nổi 3D vuông thành sắc cạnh.', group: 'garment' },
    { id: 14, name: 'In Foil (Ép Kim/Nhũ)', slug: 'In foil', icon: <FaStar />, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'hover:border-yellow-300', desc: 'Hiệu ứng ánh kim loại Vàng/Bạc rực rỡ.', group: 'garment' },
    { id: 15, name: 'In Silicone', slug: 'In silicone', icon: <FaHandHoldingWater />, color: 'text-teal-600', bg: 'bg-teal-50', border: 'hover:border-teal-300', desc: 'Siêu bền, đàn hồi cao, chống nhiễm màu.', group: 'garment' },
    { id: 16, name: 'In Puff (In Nổi Phồng)', slug: 'In puff', icon: <FaCloud />, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50', border: 'hover:border-fuchsia-300', desc: 'Hiệu ứng mực nở phồng xốp mềm mại.', group: 'garment' },
  ];

  // Component Thẻ nhỏ (Compact Card) - Đã sửa để dùng màu riêng
  const MiniCard = ({ cat }) => (
    <Link 
        to={`/category/${cat.slug}?group=${cat.group}`} 
        // Thêm cat.border để viền đổi màu khi hover
        className={`flex items-start p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md ${cat.border} transition-all duration-200 group`}
    >
        {/* Icon dùng màu riêng (cat.bg, cat.color) */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 mr-3 ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform`}>
            {cat.icon}
        </div>
        
        {/* Nội dung bên phải */}
        <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-800 truncate transition">
                {cat.name}
            </h4>
            <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                {cat.desc}
            </p>
        </div>
        
        {/* Mũi tên nhỏ */}
        <div className="mt-1 ml-2 text-gray-300 group-hover:text-blue-500 transition">
             <FaArrowRight size={12}/>
        </div>
    </Link>
  );

  return (
    <div className="bg-white py-12 border-b border-gray-100" id="danh-muc-san-pham">
      <div className="container mx-auto px-4">
        
        {/* Layout chia đôi: Grid 1 cột trên Mobile, 2 cột trên Desktop (lg) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* === CỘT TRÁI: IN OFFSET (Nền tổng thể vẫn màu Xanh) === */}
            <div className="bg-blue-50/60 rounded-3xl p-6 lg:p-8 border border-blue-100/50">
                <div className="flex items-center mb-6 pb-4 border-b border-blue-200/30">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4 shadow-sm">
                        <FaBoxOpen size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-blue-900 uppercase tracking-wider">In Offset & Bao Bì</h3>
                        <p className="text-sm text-blue-600/80 font-medium">Giải pháp bao bì giấy chuyên nghiệp</p>
                    </div>
                </div>
                
                {/* Lưới 2 cột nhỏ bên trong */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {offsetCategories.map((cat) => (
                        <MiniCard key={cat.id} cat={cat} />
                    ))}
                </div>
            </div>

            {/* === CỘT PHẢI: IN GARMENT (Nền tổng thể vẫn màu Cam) === */}
            <div className="bg-orange-50/60 rounded-3xl p-6 lg:p-8 border border-orange-100/50">
                <div className="flex items-center mb-6 pb-4 border-b border-orange-200/30">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mr-4 shadow-sm">
                        <FaTint size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-orange-900 uppercase tracking-wider">In Vải & Công Nghệ</h3>
                        <p className="text-sm text-orange-600/80 font-medium">Kỹ thuật in xuất khẩu tiêu chuẩn cao</p>
                    </div>
                </div>

                {/* Lưới 2 cột nhỏ bên trong */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {garmentCategories.map((cat) => (
                        <MiniCard key={cat.id} cat={cat} />
                    ))}
                </div>
            </div>

        </div>

      </div>
    </div>
  );
};

export default CategoryGrid;