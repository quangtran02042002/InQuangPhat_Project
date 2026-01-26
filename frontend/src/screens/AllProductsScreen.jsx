import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaBoxOpen, FaFilter, FaArrowRight, FaChevronRight, FaTags, FaLayerGroup, FaCheckCircle, FaCogs, FaInfoCircle } from 'react-icons/fa';
import Paginate from '../components/Paginate';
import Loader from '../components/Loader';

// --- 1. DỮ LIỆU CẤU HÌNH (DANH MỤC & TỪ KHÓA) ---
const CATEGORY_GROUPS = [
    {
        title: "IN OFFSET & BAO BÌ",
        items: [
            { name: "Hộp Cứng, Hộp Quà", keywords: ["hộp cứng", "hộp quà", "carton lạnh", "quà tặng"] },
            { name: "In Hộp Mềm", keywords: ["hộp mềm", "hộp giấy", "ivory", "duplex", "bao bì giấy"] },
            { name: "In Decal, Tem Nhãn", keywords: ["decal", "tem", "nhãn", "sticker"] },
            { name: "Kẹp File / Folder", keywords: ["kẹp file", "folder", "tài liệu"] },
            { name: "Sách / Catalogue", keywords: ["sách", "tạp chí", "catalogue", "kỷ yếu"] },
            { name: "In Túi Xách Giấy", keywords: ["túi", "kraft", "shop"] },
            { name: "In Phong Bì", keywords: ["phong bì", "bao thư"] },
            { name: "In Hang Tag", keywords: ["tag", "thẻ", "mác"] }
        ]
    },
    {
        title: "IN VẢI & CÔNG NGHỆ",
        items: [
            { name: "In Lụa / Vải", keywords: ["lụa", "vải", "áo"] },
            { name: "In Chuyển Nhiệt (Pet)", keywords: ["chuyển nhiệt", "pet"] },
            { name: "In Cao Thành (High Density)", keywords: ["cao thành", "nổi", "3d"] },
            { name: "In Foil (Ép Kim/Nhũ)", keywords: ["ép kim", "nhũ", "foil"] },
            { name: "Mực nước (Waterbased)", keywords: ["mực nước", "waterbased"] }
        ]
    }
];

// --- 2. DỮ LIỆU CHI TIẾT DANH MỤC (NỘI DUNG SEO/BÀI VIẾT) ---
// Bạn có thể thêm các danh mục khác tương tự
const CATEGORY_DETAILS = {
    // ================= NHÓM OFFSET & BAO BÌ =================
    "In Hộp Mềm": {
        title: "In Hộp Giấy Mềm (Bao Bì Giấy) - Tối Ưu Chi Phí & Hiệu Quả Marketing",
        description: "Hộp giấy mềm là giải pháp bao bì phổ biến nhất cho các ngành hàng tiêu dùng nhanh (FMCG), dược phẩm, mỹ phẩm phổ thông. Với ưu điểm giá thành rẻ khi in số lượng lớn, dễ dàng thiết kế hình ảnh bắt mắt và gọn nhẹ trong vận chuyển.",
        benefits: [
            "Chứa đựng và bảo vệ sản phẩm ở mức độ cơ bản.",
            "Diện tích in ấn lớn, truyền tải đầy đủ thông điệp Marketing.",
            "Giá thành thấp, tối ưu chi phí đóng gói.",
            "Thân thiện với môi trường, dễ dàng tái chế."
        ],
        process: [
            "Chọn chất liệu & Định lượng giấy (Ví dụ: Ivory 300gsm)",
            "Thiết kế bao bì & Ra khuôn bế (Khuôn dao)",
            "In Offset chất lượng cao (CMYK / Pantone)",
            "Gia công sau in: Cán màng, ép kim, bế dán thành phẩm"
        ]
    },
    "Hộp Cứng, Hộp Quà": {
        title: "Hộp Cứng Cao Cấp - Nâng Tầm Giá Trị Quà Tặng",
        description: "Hộp cứng (Carton lạnh) mang lại cảm giác sang trọng, chắc chắn, thường dùng cho yến sào, đông trùng, trang sức hoặc quà tết doanh nghiệp. Đây là lựa chọn hàng đầu để nâng tầm giá trị sản phẩm.",
        benefits: [
            "Bảo vệ sản phẩm tuyệt đối nhờ kết cấu cứng cáp.",
            "Tạo cảm giác cao cấp, sang trọng ngay từ cái chạm đầu tiên.",
            "Tăng giá trị cảm nhận của món quà bên trong.",
            "Độ bền cao, khách hàng thường giữ lại để tái sử dụng."
        ],
        process: [
            "In lớp giấy bồi (Giấy Couche hoặc Giấy Mỹ thuật)",
            "Cắt và phay rãnh định hình cốt Carton lạnh",
            "Gia công bồi giấy lên carton bằng máy tự động",
            "Gia công phụ kiện: Nắp nam châm, khay định hình, nơ"
        ]
    },
    "In Decal, Tem Nhãn": {
        title: "In Tem Nhãn Decal - Định Danh & Bảo Vệ Thương Hiệu",
        description: "Tem nhãn là yếu tố đầu tiên khách hàng nhìn thấy. Chúng tôi cung cấp giải pháp in decal đa dạng từ tem giấy giá rẻ, tem nhựa bền bỉ chống nước đến tem vỡ bảo hành, giúp sản phẩm nổi bật trên kệ hàng.",
        benefits: [
            "Nhận diện thương hiệu và cung cấp thông tin sản phẩm.",
            "Tem nhựa chống nước, bền bỉ trong môi trường lạnh.",
            "Tem vỡ giúp niêm phong, chống hàng giả.",
            "Chi phí thấp nhưng hiệu quả quảng bá cao."
        ],
        process: [
            "Tư vấn chất liệu (Decal giấy, nhựa, xi bạc)",
            "Thiết kế & Chế bản in",
            "In Offset hoặc Flexo (dạng cuộn)",
            "Gia công: Cán màng, bế đờ-mi (bế nửa) thành phẩm"
        ]
    },
    "Kẹp File / Folder": {
        title: "In Kẹp File (Folder) - Sự Chuyên Nghiệp Trong Từng Cuộc Họp",
        description: "Kẹp file tài liệu (Folder) không chỉ giúp bảo quản hồ sơ gọn gàng mà còn là bộ mặt của doanh nghiệp khi gặp gỡ đối tác. Một bộ Sales Kit chuyên nghiệp bắt đầu từ chiếc kẹp file ấn tượng.",
        benefits: [
            "Sắp xếp hợp đồng, báo giá, tài liệu gọn gàng.",
            "Có khe cài danh thiếp (Namecard) tiện lợi.",
            "Tăng sự tin cậy và chuyên nghiệp trong mắt đối tác.",
            "Đồng bộ nhận diện thương hiệu văn phòng."
        ],
        process: [
            "Thiết kế khuôn bế (Tai cài) và hình ảnh",
            "In Offset 2 mặt trên giấy dày (C300, C250)",
            "Cán màng mờ/bóng để tăng độ bền và thẩm mỹ",
            "Bế hình, gấp và dán tai cài hoàn thiện"
        ]
    },
    "Sách / Catalogue": {
        title: "In Catalogue, Kỷ Yếu - Vũ Khí Bán Hàng Uy Lực",
        description: "Catalogue là cuốn cẩm nang giới thiệu toàn bộ năng lực, sản phẩm và dịch vụ của bạn. Chất lượng in ấn sắc nét và màu sắc trung thực là yếu tố then chốt để thuyết phục khách hàng qua ấn phẩm này.",
        benefits: [
            "Trình bày thông tin sản phẩm một cách hệ thống, trực quan.",
            "Thể hiện quy mô và sự uy tín của doanh nghiệp.",
            "Công cụ hỗ trợ đắc lực cho nhân viên kinh doanh (Sales Kit).",
            "Lưu giữ thông tin lâu dài hơn so với quảng cáo online."
        ],
        process: [
            "Dàn trang thiết kế & Chỉnh sửa màu sắc hình ảnh",
            "In Proof (bản mẫu) để duyệt màu",
            "In Offset hàng loạt (Ruột C150, Bìa C250)",
            "Gia công đóng cuốn: Gim lồng, Keo nhiệt hoặc Lò xo"
        ]
    },
    "In Túi Xách Giấy": {
        title: "In Túi Giấy - Biển Quảng Cáo Di Động",
        description: "Túi giấy vừa là bao bì đựng sản phẩm tiện lợi, vừa là công cụ marketing di động hiệu quả. Một chiếc túi đẹp sẽ được khách hàng tái sử dụng nhiều lần, mang thương hiệu của bạn đi khắp nơi.",
        benefits: [
            "Nâng cao giá trị và sự sang trọng của sản phẩm.",
            "Quảng bá thương hiệu tự nhiên, hiệu quả.",
            "Thân thiện với môi trường (đặc biệt là túi Kraft).",
            "Tái sử dụng nhiều lần, tăng điểm chạm thương hiệu."
        ],
        process: [
            "Lựa chọn giấy (Kraft, Ivory, Couche) & Kích thước",
            "In ấn & Gia công bề mặt (Ép kim, phủ UV)",
            "Bế, gấp và dán thành phẩm",
            "Đóng mắt cáo, xỏ dây (Dây dù, ruy băng, quai giấy)"
        ]
    },
    "In Phong Bì": {
        title: "In Phong Bì Thư - Đồng Bộ Nhận Diện Văn Phòng",
        description: "Phong bì thư dùng để gửi công văn, hóa đơn, hợp đồng... thể hiện sự chỉn chu và tôn trọng đối với người nhận. In phong bì đồng bộ logo giúp tăng tính chuyên nghiệp cho doanh nghiệp.",
        benefits: [
            "Bảo mật tài liệu, thư từ bên trong.",
            "Đồng bộ hệ thống nhận diện thương hiệu.",
            "Tạo ấn tượng chuyên nghiệp khi gửi hồ sơ cho đối tác.",
            "Chi phí thấp, hiệu quả hình ảnh cao."
        ],
        process: [
            "Thiết kế theo kích thước chuẩn (A6, A5, A4)",
            "In Offset trên giấy Ford (giấy ốp)",
            "Bế hình và gấp dán thành phẩm bằng máy tự động",
            "Dán keo chờ ở nắp (nếu có yêu cầu)"
        ]
    },
    "In Hang Tag": {
        title: "In Hang Tag (Thẻ Treo) - Điểm Nhấn Ngành Thời Trang",
        description: "Thẻ treo (Mác quần áo) là tiếng nói định vị thương hiệu thời trang. Ngoài việc cung cấp giá và size, một chiếc tag được thiết kế độc đáo, in ấn sắc nét sẽ làm tăng giá trị sản phẩm lên đáng kể.",
        benefits: [
            "Khẳng định thương hiệu, chống hàng giả.",
            "Cung cấp thông tin: Size, Giá, Mã SP, Hướng dẫn giặt.",
            "Tăng tính thẩm mỹ cho quần áo, phụ kiện.",
            "Tạo dấu ấn riêng biệt cho nhãn hàng."
        ],
        process: [
            "In Offset hoặc In Kỹ thuật số trên giấy dày",
            "Gia công ép kim, bồi dày, cán màng",
            "Bế hình dáng đặc biệt (Tròn, Vuông, Die-cut)",
            "Khoan lỗ và xỏ dây treo"
        ]
    },

    // ================= NHÓM IN VẢI & CÔNG NGHỆ =================
    "In Lụa / Vải": {
        title: "In Lụa Truyền Thống & Hiện Đại - Bền Bỉ Với Thời Gian",
        description: "Kỹ thuật in lưới (in lụa) là phương pháp phổ biến nhất trong in ấn thời trang nhờ độ bền màu cao, chi phí hợp lý và khả năng in trên nhiều chất liệu vải khác nhau.",
        benefits: [
            "Độ bền màu cao, giặt máy thoải mái.",
            "Chi phí thấp khi in số lượng lớn.",
            "In được trên nhiều loại vải (Cotton, Poly, Canvas...).",
            "Màu sắc tươi sáng, đa dạng hiệu ứng."
        ],
        process: [
            "Xuất phim và chụp bản lụa (khuôn in)",
            "Pha màu mực theo công thức Pantone",
            "In từng lớp màu lên vải (gạt tay hoặc máy)",
            "Sấy khô hoàn thiện để mực bám chắc"
        ]
    },
    "In Chuyển Nhiệt (Pet)": {
        title: "In Chuyển Nhiệt (PET KTS) - Không Giới Hạn Màu Sắc",
        description: "Công nghệ in PET chuyển nhiệt cho phép in mọi hình ảnh đa sắc, chuyển màu phức tạp (gradient) mà in lụa khó làm được. Hình in mỏng, sắc nét, không cần làm khuôn, phù hợp cả số lượng ít.",
        benefits: [
            "In được ảnh thật, màu chuyển sắc phức tạp.",
            "Không tốn chi phí làm khuôn in.",
            "Hình in mỏng, sắc nét, chi tiết cao.",
            "Thời gian sản xuất nhanh chóng."
        ],
        process: [
            "In hình ảnh lên màng PET bằng máy in KTS",
            "Phủ keo chuyển nhiệt và sấy khô màng",
            "Ép nhiệt màng in lên áo/vải",
            "Bóc màng PET và ép lại để tăng độ bền"
        ]
    },
    "In Cao Thành (High Density)": {
        title: "In Cao Thành (High Density) - Hiệu Ứng 3D Sắc Nét",
        description: "Kỹ thuật in chồng nhiều lớp mực tạo độ dày, làm hình in nổi lên khỏi mặt vải với các cạnh vuông vức, sắc nét. Thường dùng để in Logo thương hiệu nhằm tạo vẻ mạnh mẽ, sang trọng.",
        benefits: [
            "Tạo hiệu ứng 3D nổi bật, ấn tượng.",
            "Cạnh hình in sắc nét, vuông vức (vuông thành sắc cạnh).",
            "Tăng giá trị và sự độc đáo cho áo thun.",
            "Độ bền cao, không bị xẹp sau khi giặt."
        ],
        process: [
            "Chụp bản in với lớp keo dày đặc biệt",
            "In chồng liên tục nhiều lớp mực (10-20 lớp)",
            "Sấy khô giữa các lớp in",
            "Hoàn thiện bề mặt (Láng mịn hoặc Nhám)"
        ]
    },
    "In Foil (Ép Kim/Nhũ)": {
        title: "In Foil (Ép Kim/Nhũ) - Hiệu Ứng Ánh Kim Sang Trọng",
        description: "Sử dụng màng foil kim loại (Vàng, Bạc, Đồng...) ép lên vải thông qua lớp keo chuyên dụng. Tạo hiệu ứng phản quang rực rỡ (Metallic), mang lại vẻ ngoài đắt tiền cho sản phẩm thời trang.",
        benefits: [
            "Hiệu ứng ánh kim loại rực rỡ, bắt mắt.",
            "Tạo cảm giác sang trọng, cao cấp.",
            "Đa dạng màu foil: Vàng, Bạc, Hologram...",
            "Nổi bật thương hiệu vào ban đêm hoặc dưới ánh đèn."
        ],
        process: [
            "In lớp keo chuyên dụng lên vải theo hình thiết kế",
            "Sấy khô bán phần lớp keo",
            "Dùng máy ép nhiệt ép màng foil lên keo",
            "Bóc lớp màng thừa sau khi nguội"
        ]
    },
    "Mực nước (Waterbased)": {
        title: "In Mực Nước (Waterbased) - Mềm Mịn & Thoáng Khí",
        description: "Mực nước thấm sâu vào sớ vải thay vì nằm trên bề mặt, tạo cảm giác 'in như không in'. Rất thích hợp cho hàng thời trang trẻ em và quần áo mặc nhà nhờ tính an toàn và thoáng mát.",
        benefits: [
            "Bề mặt in cực kỳ mềm mại, không dày cộm.",
            "Thoáng khí, thấm hút mồ hôi tốt.",
            "An toàn, thân thiện với da và môi trường.",
            "Không bị nứt hình khi kéo giãn."
        ],
        process: [
            "Sử dụng vải Cotton 100% hoặc vải sáng màu",
            "In nhiều lượt mực nước để màu thấm vào vải",
            "Sấy khô kỹ để mực bám chết vào sợi vải",
            "Xử lý làm mềm bề mặt (nếu cần)"
        ]
    },
    "In Rubber (Mực Cao Su)": {
        title: "In Rubber (Mực Dẻo) - Giải Pháp Cho Vải Tối Màu",
        description: "Sử dụng mực gốc cao su có độ co giãn tốt và độ che phủ cao. Đây là lựa chọn số 1 khi in trên vải đen hoặc vải tối màu, đảm bảo hình in lên màu chuẩn xác và bền bỉ.",
        benefits: [
            "Màu sắc tươi sáng, chuẩn xác trên nền vải đen.",
            "Độ co giãn cao, không bị nứt khi kéo vải.",
            "Bề mặt in láng mịn, thẩm mỹ.",
            "Độ bền giặt tẩy tốt."
        ],
        process: [
            "In lớp lót (nền trắng) để chắn màu vải",
            "In chồng các lớp màu theo thiết kế",
            "Sấy khô từng lớp",
            "Ép nhiệt hoàn thiện để mặt in láng mịn"
        ]
    },
    "In Silicone": {
        title: "In Silicone - Đỉnh Cao Độ Bền & Đàn Hồi",
        description: "Công nghệ in cao cấp nhất cho đồ thể thao (Sportwear). Mực Silicone siêu bền, đàn hồi cực cao, chịu nhiệt tốt và đặc biệt là khả năng chống nhiễm màu (sublimation) từ vải nhuộm.",
        benefits: [
            "Siêu bền, không bao giờ bị nứt gãy.",
            "Chống nhiễm màu vải (đùn màu) tuyệt đối.",
            "Bề mặt in lì (Matte) sang trọng hoặc bóng cao cấp.",
            "An toàn, không độc hại, thân thiện với da."
        ],
        process: [
            "Pha mực Silicone 2 thành phần",
            "In lớp nền chống nhiễm",
            "In các lớp màu và sấy ở nhiệt độ cao",
            "Lưu hóa hoàn toàn để đạt độ bền tối đa"
        ]
    },
    "In Puff (In Nổi Phồng)": {
        title: "In Puff (In Nổi Phồng) - Hiệu Ứng 3D Mềm Mại",
        description: "Mực in chứa thành phần gây nở, khi gặp nhiệt sẽ phồng lên tạo hiệu ứng 3D với bề mặt xốp, các đường nét bo tròn mềm mại. Rất được ưa chuộng trong thời trang Streetwear và Hoodie.",
        benefits: [
            "Hiệu ứng 3D nổi bật nhưng mềm mại, xốp nhẹ.",
            "Cảm giác sờ tay (hand-feel) thú vị, độc đáo.",
            "Tạo phong cách trẻ trung, năng động.",
            "Che khuyết điểm mặt vải tốt."
        ],
        process: [
            "Pha mực in với phụ gia gây nở (Puff)",
            "In lớp mực dày lên vải",
            "Sấy ở nhiệt độ chính xác để mực nở phồng đều",
            "Kiểm tra độ đều và độ bền của bề mặt xốp"
        ]
    }
};

const AllProductsScreen = () => {
  const { pageNumber } = useParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  
  const [activeCategory, setActiveCategory] = useState({ name: 'Tất cả', keywords: [] });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/products?pageNumber=${pageNumber || 1}`);
        setProducts(data.products);
        setPage(data.page);
        setPages(data.pages);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [pageNumber]);

  // Logic lọc
  const filteredProducts = activeCategory.name === 'Tất cả'
    ? products
    : products.filter(p => {
        const dbCategory = p.category ? p.category.toLowerCase() : '';
        return activeCategory.keywords.some(k => dbCategory.includes(k.toLowerCase()));
    });

  // Lấy thông tin chi tiết của danh mục đang chọn
  const currentDetail = CATEGORY_DETAILS[activeCategory.name];

  return (
    <div className="bg-gray-50 min-h-screen pb-12 font-sans">
      
      {/* BANNER */}
      <div className="bg-blue-900 text-white py-8 shadow-md">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
             <div className="text-xs text-blue-300 mb-2 uppercase font-bold tracking-widest">Trang chủ / Sản phẩm</div>
             <h1 className="text-3xl font-bold uppercase">Kho Sản Phẩm & Mẫu In</h1>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* SIDEBAR */}
            <div className="w-full lg:w-1/5 shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
                    <div className="flex items-center gap-2 font-bold text-gray-800 text-lg border-b border-gray-100 pb-3 mb-4">
                        <FaFilter className="text-blue-600"/> DANH MỤC
                    </div>
                    
                    <button 
                        onClick={() => setActiveCategory({ name: 'Tất cả', keywords: [] })}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all mb-2 ${activeCategory.name === 'Tất cả' ? 'bg-blue-600 text-white shadow-md font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                        <span>Tất cả sản phẩm</span>
                        <FaLayerGroup />
                    </button>

                    <div className="space-y-6 mt-4">
                        {CATEGORY_GROUPS.map((group, index) => (
                            <div key={index}>
                                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3 ml-2 flex items-center">
                                    {index === 0 ? <FaBoxOpen className="mr-1"/> : <FaTags className="mr-1"/>} 
                                    {group.title}
                                </h4>
                                <ul className="space-y-1">
                                    {group.items.map((item) => (
                                        <li key={item.name}>
                                            <button
                                                onClick={() => setActiveCategory(item)}
                                                className={`w-full text-left px-4 py-2 rounded-lg text-sm flex items-center justify-between transition-colors group ${
                                                    activeCategory.name === item.name 
                                                    ? 'bg-blue-50 text-blue-700 font-bold' 
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                                }`}
                                            >
                                                {item.name}
                                                {activeCategory.name === item.name && <FaChevronRight className="text-xs"/>}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* NỘI DUNG CHÍNH */}
            <div className="w-full lg:w-4/5">
                
                {/* --- PHẦN MỚI: HIỂN THỊ CHI TIẾT DANH MỤC (RICH CONTENT) --- */}
                {/* Chỉ hiện khi không phải là tab "Tất cả" và có dữ liệu trong CATEGORY_DETAILS */}
                {activeCategory.name !== 'Tất cả' && currentDetail && (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-blue-100 mb-8 animate-fade-in-down">
                        <div className="border-l-4 border-blue-600 pl-4 mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">{currentDetail.title}</h2>
                        </div>
                        <p className="text-gray-600 mb-6 leading-relaxed">{currentDetail.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-xl">
                            <div>
                                <h4 className="font-bold text-blue-700 mb-3 flex items-center"><FaInfoCircle className="mr-2"/> VAI TRÒ & LỢI ÍCH</h4>
                                <ul className="space-y-2">
                                    {currentDetail.benefits.map((b, i) => (
                                        <li key={i} className="flex items-start text-sm text-gray-700">
                                            <FaCheckCircle className="text-green-500 mr-2 mt-1 shrink-0"/> {b}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-orange-600 mb-3 flex items-center"><FaCogs className="mr-2"/> QUY TRÌNH SẢN XUẤT</h4>
                                <ul className="space-y-2">
                                    {currentDetail.process.map((p, i) => (
                                        <li key={i} className="flex items-start text-sm text-gray-700">
                                            <span className="bg-orange-100 text-orange-600 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5 shrink-0">{i+1}</span>
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
                {/* ----------------------------------------------------------- */}

                {/* Header Kết quả Search */}
                <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-800 flex items-center">
                        <span className="text-gray-400 font-normal mr-2">Danh sách mẫu:</span> 
                        <span className="text-blue-600 text-lg">{activeCategory.name}</span>
                    </h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {filteredProducts.length} sản phẩm
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20 bg-white rounded-xl shadow-sm"><Loader /></div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="text-6xl mb-4 text-gray-200">📦</div>
                        <p className="text-gray-500 text-lg">Chưa tìm thấy mẫu nào trong mục này.</p>
                        <p className="text-sm text-gray-400 mt-1">Đang tìm từ khóa: {activeCategory.keywords.join(', ')}</p>
                        <button onClick={() => setActiveCategory({ name: 'Tất cả', keywords: [] })} className="mt-4 text-blue-600 font-bold hover:underline">
                            Xem tất cả sản phẩm
                        </button>
                    </div>
                ) : (
                    <>
                        {/* GRID SẢN PHẨM */}
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <div key={product._id} className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-200 transition duration-300 flex flex-col h-full">
                                    <Link to={`/product/${product._id}`} className="block relative">
                                        <div className="h-48 sm:h-56 overflow-hidden bg-gray-100 relative">
                                            <img 
                                                src={product.images && product.images.length > 0 ? product.images[0].url : ''} 
                                                alt={product.name} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                            />
                                            {product.category && (
                                                <span className="absolute bottom-0 left-0 bg-blue-600 text-white text-[10px] px-3 py-1 rounded-tr-lg uppercase font-bold tracking-wide">
                                                    {product.category}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                    
                                    <div className="p-4 flex flex-col flex-1 justify-between">
                                        <div>
                                            <Link to={`/product/${product._id}`}>
                                                <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-2 group-hover:text-blue-600 transition" title={product.name}>
                                                    {product.name}
                                                </h3>
                                            </Link>
                                        </div>

                                        <div className="flex items-end justify-between mt-3 pt-3 border-t border-gray-50">
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Giá liên hệ</p>
                                                <p className="text-red-600 font-bold text-sm">
                                                    {product.priceTable && product.priceTable.length > 0 
                                                        ? `${product.priceTable[0].price.toLocaleString()}đ` 
                                                        : 'Liên hệ'}
                                                </p>
                                            </div>
                                            <Link to={`/product/${product._id}`} className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition transform group-hover:rotate-45">
                                                <FaArrowRight className="text-xs" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {activeCategory.name === 'Tất cả' && (
                            <div className="mt-12 flex justify-center">
                                <Paginate pages={pages} page={page} />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AllProductsScreen;