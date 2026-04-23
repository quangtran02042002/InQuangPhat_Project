require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connect DB
mongoose.connect(process.env.MONGO_URI);

// Product model (inline for seed)
const productSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  images: [{ url: String }],
  category: String,
  group: { type: String, enum: ['offset', 'garment'], default: 'offset' },
  description: String,
  priceTable: [{ minQuantity: Number, price: String }],
  reviews: [],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Upload helper
async function uploadImage(localPath) {
  const result = await cloudinary.uploader.upload(localPath, { folder: 'quangphat_products' });
  return result.secure_url;
}

const IMAGES_DIR = 'C:\\Users\\admin\\.gemini\\antigravity\\brain\\0fcf21d4-231c-47ed-9d42-7c57efea6f78';

async function seed() {
  // 1. Find admin user
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ isAdmin: Boolean }));
  const admin = await User.findOne({ isAdmin: true });
  if (!admin) { console.error('No admin user found!'); process.exit(1); }
  const userId = admin._id;

  // 2. Delete all existing products
  const deleted = await Product.deleteMany({});
  console.log(`✓ Deleted ${deleted.deletedCount} old products`);

  // 3. Upload images
  console.log('Uploading images to Cloudinary...');
  const imgs = {};
  const files = {
    hop_giay: 'product_hop_giay_1776877788723.png',
    tui_giay: 'product_tui_giay_1776877802382.png',
    tem_nhan: 'product_tem_nhan_1776877817758.png',
    catalogue: 'product_catalogue_1776877831038.png',
    hop_cung: 'product_hop_cung_1776877860293.png',
    hang_tag: 'product_hang_tag_1776877874041.png',
    ao_waterbased: 'product_ao_waterbased_1776877888543.png',
    ao_rubber: 'product_ao_rubber_1776877904377.png',
    phong_bi: 'product_phong_bi_1776877931326.png',
    tui_xach: 'product_tui_xach_giay_1776877945372.png',
    ao_offset: 'product_ao_offset_1776877959018.png',
  };

  for (const [key, filename] of Object.entries(files)) {
    const fullPath = path.join(IMAGES_DIR, filename);
    if (fs.existsSync(fullPath)) {
      imgs[key] = await uploadImage(fullPath);
      console.log(`  ✓ Uploaded ${key}`);
    } else {
      console.warn(`  ✗ Missing: ${filename}`);
      imgs[key] = 'https://via.placeholder.com/600x400?text=In+Quang+Phat';
    }
  }

  // 4. Product data
  const products = [
    // ── OFFSET & BAO BÌ ──────────────────────────────────────────────
    {
      user: userId, group: 'offset',
      name: 'Hộp Giấy Cứng Cao Cấp',
      category: 'Hộp Cứng, Hộp Quà',
      images: [{ url: imgs.hop_cung }, { url: imgs.hop_giay }],
      description: `<h2>Hộp Giấy Cứng Cao Cấp – Sang Trọng & Bền Bỉ</h2>
<p>Hộp cứng (Rigid Box) được sản xuất từ giấy bìa cứng dày 1.5–2.5mm, bọc ngoài bằng giấy couche hoặc kraft, tạo nên sự sang trọng tuyệt đối cho sản phẩm bên trong.</p>
<h2>Ứng dụng phổ biến</h2>
<ul><li>Hộp quà tặng cao cấp (nước hoa, đồng hồ, trang sức)</li><li>Hộp đựng mỹ phẩm, dược phẩm</li><li>Hộp đựng quần áo, phụ kiện thời trang</li></ul>
<h2>Thông số kỹ thuật</h2>
<table><thead><tr><th>Thông số</th><th>Chi tiết</th></tr></thead><tbody>
<tr><td>Chất liệu</td><td>Bìa cứng 1.5–2.5mm + Giấy bọc Couche 157gsm</td></tr>
<tr><td>Kích thước</td><td>Thiết kế theo yêu cầu khách hàng</td></tr>
<tr><td>Gia công</td><td>Ép kim, Dập nổi, Phủ UV, Cán bóng/Mờ</td></tr>
<tr><td>In ấn</td><td>Offset 4 màu CMYK + Pantone</td></tr>
<tr><td>Số lượng tối thiểu</td><td>100 hộp/đơn</td></tr>
</tbody></table>`,
      priceTable: [{ minQuantity: 100, price: '100' }, { minQuantity: 500, price: '95' }, { minQuantity: 1000, price: '90' }, { minQuantity: 3000, price: '85' }],
    },
    {
      user: userId, group: 'offset',
      name: 'Hộp Giấy Gấp Offset 4 Màu',
      category: 'Hộp Cứng, Hộp Quà',
      images: [{ url: imgs.hop_giay }, { url: imgs.hop_cung }],
      description: `<h2>Hộp Giấy Gấp (Folding Carton) – Giải Pháp Bao Bì Tối Ưu</h2>
<p>Hộp giấy gấp được in Offset 4 màu trên giấy Duplex hoặc Couche, cán màng, bế hộp và ghép keo tự động. Phù hợp với sản xuất hàng loạt số lượng lớn, giá thành tối ưu.</p>
<h2>Ứng dụng</h2>
<ul><li>Hộp thực phẩm, bánh kẹo, trà</li><li>Hộp mỹ phẩm, dược phẩm</li><li>Hộp đồ chơi, điện tử</li></ul>
<table><thead><tr><th>Thông số</th><th>Chi tiết</th></tr></thead><tbody>
<tr><td>Chất liệu</td><td>Duplex 300–450gsm hoặc Couche 250gsm</td></tr>
<tr><td>In ấn</td><td>Offset 4 màu CMYK</td></tr>
<tr><td>Gia công</td><td>Cán bóng/mờ, Bế hộp, Ghép keo</td></tr>
<tr><td>MOQ</td><td>500 hộp/đơn</td></tr>
</tbody></table>`,
      priceTable: [{ minQuantity: 500, price: '100' }, { minQuantity: 1000, price: '92' }, { minQuantity: 3000, price: '88' }, { minQuantity: 5000, price: '80' }],
    },
    {
      user: userId, group: 'offset',
      name: 'Túi Giấy Kraft Cao Cấp',
      category: 'In Túi Xách Giấy',
      images: [{ url: imgs.tui_xach }, { url: imgs.tui_giay }],
      description: `<h2>Túi Giấy Kraft – Bền Đẹp & Thân Thiện Môi Trường</h2>
<p>Túi giấy Kraft được sản xuất từ giấy Kraft nguyên sinh 120–200gsm, thân thiện môi trường, chịu tải tốt. Quai xách dây thừng cotton hoặc dây PP bền chắc.</p>
<h2>Ứng dụng</h2>
<ul><li>Túi đựng quà tặng, đồ lưu niệm</li><li>Túi mua sắm thời trang, boutique</li><li>Túi đựng thực phẩm, rượu vang</li></ul>
<table><thead><tr><th>Thông số</th><th>Chi tiết</th></tr></thead><tbody>
<tr><td>Chất liệu</td><td>Giấy Kraft 120–200gsm</td></tr>
<tr><td>Quai xách</td><td>Dây thừng cotton hoặc PP</td></tr>
<tr><td>In ấn</td><td>Offset 1–4 màu hoặc in lưới</td></tr>
<tr><td>Gia công</td><td>Cán bóng/mờ, Ép kim, Dập nổi</td></tr>
<tr><td>MOQ</td><td>200 cái/đơn</td></tr>
</tbody></table>`,
      priceTable: [{ minQuantity: 200, price: '100' }, { minQuantity: 500, price: '90' }, { minQuantity: 1000, price: '85' }, { minQuantity: 3000, price: '80' }],
    },
    {
      user: userId, group: 'offset',
      name: 'Túi Giấy Couche Laminate',
      category: 'In Túi Xách Giấy',
      images: [{ url: imgs.tui_giay }, { url: imgs.tui_xach }],
      description: `<h2>Túi Giấy Couche Cán Màng – Sang Trọng & Đẳng Cấp</h2>
<p>Túi giấy in Offset 4 màu trên giấy Couche 200–250gsm, cán màng bóng hoặc mờ, tạo vẻ sang trọng tuyệt vời. Thích hợp cho các thương hiệu cao cấp.</p>
<table><thead><tr><th>Thông số</th><th>Chi tiết</th></tr></thead><tbody>
<tr><td>Chất liệu</td><td>Couche 200–250gsm</td></tr>
<tr><td>In ấn</td><td>Offset 4 màu CMYK + Pantone</td></tr>
<tr><td>Gia công</td><td>Cán bóng/mờ, Ép kim vàng/bạc</td></tr>
<tr><td>Quai</td><td>Dây thừng cotton cao cấp</td></tr>
<tr><td>MOQ</td><td>300 cái/đơn</td></tr>
</tbody></table>`,
      priceTable: [{ minQuantity: 300, price: '100' }, { minQuantity: 1000, price: '95' }, { minQuantity: 3000, price: '90' }],
    },
    {
      user: userId, group: 'offset',
      name: 'Tem Nhãn Mỹ Phẩm Cao Cấp',
      category: 'InDecal, Tem Nhãn',
      images: [{ url: imgs.tem_nhan }],
      description: `<h2>Tem Nhãn Mỹ Phẩm – In Offset Chất Lượng Cao</h2>
<p>Tem nhãn sản phẩm được in Offset độ phân giải cao, màu sắc chính xác. Giấy tự dán, chống nước, chống tia UV, phù hợp cho sản phẩm mỹ phẩm, thực phẩm chức năng.</p>
<h2>Ứng dụng</h2>
<ul><li>Nhãn chai lọ mỹ phẩm, nước hoa</li><li>Nhãn thực phẩm chức năng, dược phẩm</li><li>Tem truy xuất nguồn gốc, QR Code</li></ul>
<table><thead><tr><th>Thông số</th><th>Chi tiết</th></tr></thead><tbody>
<tr><td>Chất liệu</td><td>Giấy Decal Bóng/Mờ/Trong suốt</td></tr>
<tr><td>In ấn</td><td>Offset 4–6 màu + Phủ UV cục bộ</td></tr>
<tr><td>Hình dạng</td><td>Tròn, Oval, Chữ nhật, Bất kỳ</td></tr>
<tr><td>Keo dán</td><td>Keo vĩnh cửu hoặc tháo được</td></tr>
<tr><td>MOQ</td><td>1000 tem/đơn</td></tr>
</tbody></table>`,
      priceTable: [{ minQuantity: 1000, price: '100' }, { minQuantity: 5000, price: '90' }, { minQuantity: 10000, price: '85' }, { minQuantity: 50000, price: '75' }],
    },
    {
      user: userId, group: 'offset',
      name: 'Catalogue & Brochure Công Ty',
      category: 'Sách / Catalogue',
      images: [{ url: imgs.catalogue }],
      description: `<h2>Catalogue & Brochure – In Ấn Chuyên Nghiệp</h2>
<p>Catalogue, brochure công ty được in Offset 4 màu độ phân giải cao trên giấy Couche cao cấp. Bìa cán bóng hoặc mờ, đóng ghim hoặc đóng keo nhiệt.</p>
<h2>Các loại ấn phẩm</h2>
<ul><li>Catalogue sản phẩm (8–100 trang)</li><li>Brochure gấp đôi, gấp ba</li><li>Hồ sơ năng lực công ty</li><li>Tờ rơi quảng cáo</li></ul>
<table><thead><tr><th>Thông số</th><th>Chi tiết</th></tr></thead><tbody>
<tr><td>Giấy ruột</td><td>Couche 100–150gsm</td></tr>
<tr><td>Giấy bìa</td><td>Couche 200–300gsm</td></tr>
<tr><td>In ấn</td><td>Offset 4 màu CMYK</td></tr>
<tr><td>Đóng sách</td><td>Ghim kim, Keo nhiệt, Xoắn ốc</td></tr>
<tr><td>MOQ</td><td>100 cuốn/đơn</td></tr>
</tbody></table>`,
      priceTable: [{ minQuantity: 100, price: '100' }, { minQuantity: 300, price: '95' }, { minQuantity: 500, price: '90' }, { minQuantity: 1000, price: '85' }],
    },
    {
      user: userId, group: 'offset',
      name: 'Phong Bì Thư Cao Cấp',
      category: 'In Phong Bì',
      images: [{ url: imgs.phong_bi }],
      description: `<h2>Phong Bì Thư In Offset – Chuyên Nghiệp & Tinh Tế</h2>
<p>Phong bì thư in Offset logo thương hiệu, địa chỉ công ty. Nhiều kích thước chuẩn quốc tế: C4, C5, DL, B4. Giấy định lượng 80–120gsm.</p>
<h2>Ứng dụng</h2>
<ul><li>Phong bì công ty, văn phòng phẩm</li><li>Phong bì hóa đơn, hợp đồng</li><li>Phong bì quà tặng sự kiện</li></ul>
<table><thead><tr><th>Thông số</th><th>Chi tiết</th></tr></thead><tbody>
<tr><td>Chất liệu</td><td>Giấy Ford hoặc Couche 80–120gsm</td></tr>
<tr><td>Kích thước phổ biến</td><td>DL (110×220mm), C5 (162×229mm)</td></tr>
<tr><td>In ấn</td><td>Offset 1–4 màu</td></tr>
<tr><td>MOQ</td><td>500 cái/đơn</td></tr>
</tbody></table>`,
      priceTable: [{ minQuantity: 500, price: '100' }, { minQuantity: 1000, price: '90' }, { minQuantity: 5000, price: '80' }, { minQuantity: 10000, price: '75' }],
    },
    {
      user: userId, group: 'offset',
      name: 'Hang Tag Thời Trang',
      category: 'In Hang Tag',
      images: [{ url: imgs.hang_tag }],
      description: `<h2>Hang Tag Thời Trang – Dấu Ấn Thương Hiệu</h2>
<p>Hang tag (thẻ treo quần áo) in Offset cao cấp trên giấy Kraft, Couche hoặc giấy tái chế. Gia công ép kim, dập nổi, đục lỗ. Thể hiện đẳng cấp thương hiệu trên từng sản phẩm.</p>
<h2>Ứng dụng</h2>
<ul><li>Thẻ treo quần áo thời trang</li><li>Tag sản phẩm thủ công, handmade</li><li>Thẻ bảo hành, thẻ hướng dẫn sử dụng</li></ul>
<table><thead><tr><th>Thông số</th><th>Chi tiết</th></tr></thead><tbody>
<tr><td>Chất liệu</td><td>Kraft 250gsm, Couche 300gsm, Bìa cứng</td></tr>
<tr><td>Hình dạng</td><td>Chữ nhật, Oval, Tùy chỉnh</td></tr>
<tr><td>Gia công</td><td>Ép kim, Dập nổi, Đục lỗ, Buộc dây</td></tr>
<tr><td>MOQ</td><td>500 cái/đơn</td></tr>
</tbody></table>`,
      priceTable: [{ minQuantity: 500, price: '100' }, { minQuantity: 1000, price: '95' }, { minQuantity: 5000, price: '85' }, { minQuantity: 10000, price: '80' }],
    },

    // ── GARMENT ───────────────────────────────────────────────────────
    {
      user: userId, group: 'garment',
      name: 'In Áo Waterbased – Mực Nước Cao Cấp',
      category: 'Waterbased (Mực Nước)',
      images: [{ url: imgs.ao_waterbased }],
      description: `<h2>In Áo Waterbased – Mềm Mại & Thân Thiện Da</h2>
<p>Công nghệ in lụa bằng mực nước (Waterbased ink) cho cảm giác mềm mại khi chạm vào, không cứng màng, không bong tróc. Đặc biệt phù hợp với áo xuất khẩu đòi hỏi tiêu chuẩn Oeko-Tex 100.</p>
<h2>Ưu điểm nổi bật</h2>
<ul><li>Màng mực mỏng, thoáng khí, thân thiện da</li><li>Không chứa PVC, đạt tiêu chuẩn xuất khẩu EU, US</li><li>Màu sắc tươi sáng, bền màu sau nhiều lần giặt</li><li>Phù hợp in trên vải Cotton, CVC, Dryfit</li></ul>
<table><thead><tr><th>Thông số</th><th>Chi tiết</th></tr></thead><tbody>
<tr><td>Loại mực</td><td>Waterbased (Mực nước) nhập khẩu</td></tr>
<tr><td>Số màu tối đa</td><td>10 màu/thiết kế</td></tr>
<tr><td>Chất liệu vải</td><td>Cotton 100%, CVC, Polyester</td></tr>
<tr><td>Tiêu chuẩn</td><td>Oeko-Tex 100, GOTS</td></tr>
<tr><td>MOQ</td><td>50 áo/màu sắc</td></tr>
</tbody></table>`,
      priceTable: [{ minQuantity: 50, price: '100' }, { minQuantity: 200, price: '95' }, { minQuantity: 500, price: '90' }, { minQuantity: 1000, price: '85' }],
    },
    {
      user: userId, group: 'garment',
      name: 'In Áo Rubber – Mực Dẻo Đặc',
      category: 'Rubber (Mực Cao Su)',
      images: [{ url: imgs.ao_rubber }],
      description: `<h2>In Áo Rubber – Màu Sắc Rực Rỡ & Độ Phủ Cao</h2>
<p>In lụa bằng mực Rubber (plastisol) tạo ra màng mực dày, màu sắc tươi rực rỡ, phủ tốt trên mọi màu nền. Đặc biệt hiệu quả khi in màu sáng trên nền vải tối.</p>
<h2>Ưu điểm</h2>
<ul><li>Độ phủ màu xuất sắc trên vải màu đậm</li><li>Màu sắc sặc sỡ, bền màu lâu dài</li><li>In được hiệu ứng 3D, Puff, Crack</li><li>Giá thành cạnh tranh cho số lượng lớn</li></ul>
<table><thead><tr><th>Thông số</th><th>Chi tiết</th></tr></thead><tbody>
<tr><td>Loại mực</td><td>Rubber / Plastisol</td></tr>
<tr><td>Số màu tối đa</td><td>10 màu/thiết kế</td></tr>
<tr><td>Hiệu ứng đặc biệt</td><td>Puff 3D, Crack, Glow in dark</td></tr>
<tr><td>Chất liệu vải</td><td>Cotton, Polyester, Pha</td></tr>
<tr><td>MOQ</td><td>50 áo/màu sắc</td></tr>
</tbody></table>`,
      priceTable: [{ minQuantity: 50, price: '100' }, { minQuantity: 200, price: '95' }, { minQuantity: 500, price: '90' }, { minQuantity: 1000, price: '85' }],
    },
    {
      user: userId, group: 'garment',
      name: 'In Áo Offset – In Chuyển Nhiệt',
      category: 'In áo Offset',
      images: [{ url: imgs.ao_offset }],
      description: `<h2>In Áo Offset – Chuyển Nhiệt Chất Lượng Cao</h2>
<p>Công nghệ in Offset kết hợp chuyển nhiệt (heat transfer) cho phép in hình ảnh siêu chi tiết, photographic quality lên áo. Phù hợp cho số lượng nhỏ, mẫu phức tạp nhiều màu.</p>
<h2>Ưu điểm</h2>
<ul><li>In được hình ảnh chất lượng ảnh (photographic)</li><li>Số lượng tối thiểu thấp, không cần tách màng</li><li>Thời gian sản xuất nhanh 1–3 ngày</li><li>Phù hợp áo đồng phục công ty, sự kiện</li></ul>
<table><thead><tr><th>Thông số</th><th>Chi tiết</th></tr></thead><tbody>
<tr><td>Công nghệ</td><td>In Offset + Ép nhiệt</td></tr>
<tr><td>Chất lượng in</td><td>300 DPI – Photographic</td></tr>
<tr><td>Kích thước in</td><td>Tối đa A3 (42×29.7cm)</td></tr>
<tr><td>Chất liệu vải</td><td>Cotton 100% (tốt nhất), Polyester</td></tr>
<tr><td>MOQ</td><td>10 áo/đơn</td></tr>
</tbody></table>`,
      priceTable: [{ minQuantity: 10, price: '100' }, { minQuantity: 50, price: '95' }, { minQuantity: 200, price: '90' }, { minQuantity: 500, price: '85' }],
    },
  ];

  // 5. Insert products
  for (const p of products) {
    await Product.create(p);
    console.log(`  ✓ Created: ${p.name}`);
  }

  console.log(`\n✅ Seeded ${products.length} products successfully!`);
  mongoose.connection.close();
}

seed().catch(err => { console.error(err); mongoose.connection.close(); process.exit(1); });
