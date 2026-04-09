const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const News = require('./models/News');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

// ============================================================
//  HELPER: Tạo block hình ảnh inline có caption
// ============================================================
const img = (src, caption) => `
<div style="text-align:center; margin: 32px 0;">
  <img src="${src}" alt="${caption}" style="max-width:100%; border-radius:12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" />
  <p style="color:#6B7280; font-size:13px; margin-top:10px; font-style:italic;">${caption}</p>
</div>`;

// HELPER: Tạo bảng HTML styled - Premium version
const tableHead = (cols) => `
<div style="overflow:hidden; border-radius:14px; box-shadow:0 4px 20px rgba(0,107,77,0.12); margin:28px 0; border:1px solid rgba(0,107,77,0.18);">
<table style="width:100%; border-collapse:collapse; font-size:14.5px;">
  <thead>
    <tr style="background:linear-gradient(90deg,#005a3f 0%,#008a5a 100%);">
      ${cols.map(c => `<th style="padding:15px 20px; text-align:left; color:#ffffff; font-weight:700; letter-spacing:0.04em; font-size:12.5px; text-transform:uppercase;">${c}</th>`).join('')}
    </tr>
  </thead>
  <tbody>`;
const tableRow = (cells, isLast = false, rowIndex = 0) =>
  `<tr style="background-color:${isLast ? '#f0fdfb' : (rowIndex % 2 === 0 ? '#ffffff' : '#f8fdfb')}; border-bottom:${isLast ? 'none' : '1px solid #e2f0ea'}; transition:background .2s;">
   ${cells.map((c, i) => `<td style="padding:13px 20px; color:#374151; line-height:1.55; ${i === 0 ? 'font-weight:700; color:#006B4D;' : ''}">${c}</td>`).join('')}
   </tr>`;
const tableEnd = `</tbody></table></div>`;

// HELPER: Tạo blockquote styled
const quote = (text) => `
<blockquote style="border-left:4px solid #006B4D; padding:16px 20px; background:#E6F0ED; margin:24px 0; border-radius:0 8px 8px 0; font-style:italic; line-height:1.7;">
  ${text}
</blockquote>`;

// HELPER: Tip box
const tipBox = (title, text) => `
<div style="background:linear-gradient(135deg, #E6F0ED 0%, #f0faf6 100%); border:1px solid rgba(0,107,77,0.15); border-radius:12px; padding:20px 24px; margin:24px 0;">
  <p style="font-weight:700; color:#006B4D; margin-bottom:8px; font-size:15px;">💡 ${title}</p>
  <p style="color:#374151; margin:0; line-height:1.7;">${text}</p>
</div>`;

// ============================================================
//  8 BÀI VIẾT
// ============================================================
const newsData = [

  // ===== 1. IN OFFSET =====
  {
    title: 'In Offset là gì? Tìm hiểu kỹ thuật in offset trong sản xuất bao bì',
    image: '/images/news/offset.png',
    description: 'Khám phá toàn diện về kỹ thuật in offset – phương pháp in ấn công nghiệp phổ biến nhất cho bao bì, hộp giấy, catalogue với chi phí tối ưu khi sản xuất số lượng lớn.',
    content: `
<h2>In Offset là gì?</h2>
<p><strong>In offset</strong>, hay còn gọi là in lithography, là kỹ thuật in gián tiếp được sử dụng rộng rãi nhất trong ngành công nghiệp in ấn hiện đại. Nguyên lý cơ bản dựa trên sự tương tác giữa nước và mực dầu: phần có hình ảnh trên bản in sẽ nhận mực, phần không có hình ảnh sẽ đẩy mực ra.</p>
<p>Thay vì in trực tiếp từ bản in lên giấy, mực được chuyển từ <strong>bản kẽm (plate)</strong> sang một <strong>tấm cao su (blanket)</strong>, sau đó mới ép lên bề mặt giấy. Chính vì vậy kỹ thuật này có tên "offset" – nghĩa là "gián tiếp".</p>

${img('/images/news/inline-offset-machine.png', 'Hệ thống máy in offset 6 màu tại xưởng In Quang Phát')}

<h2>Quy trình in offset diễn ra như thế nào?</h2>
<p>Quy trình in offset tại <strong>Xưởng In Quang Phát</strong> gồm các bước chính sau:</p>
<ol>
  <li><strong>Thiết kế & Chế bản:</strong> File thiết kế được tách thành 4 bản kẽm riêng biệt cho 4 màu CMYK (Cyan, Magenta, Yellow, Black).</li>
  <li><strong>Gắn bản kẽm:</strong> Các bản kẽm nhôm mỏng được gắn lên các ống trục (cylinder) trên máy in.</li>
  <li><strong>In ấn:</strong> Giấy chạy qua từng trạm màu, mỗi trạm sẽ in một lớp màu. Sau 4 lượt, hình ảnh hoàn chỉnh CMYK hiện ra.</li>
  <li><strong>Gia công sau in:</strong> Cán màng (mờ/bóng), dập nổi, bế, dán hộp... tùy yêu cầu.</li>
</ol>

${tipBox('Bạn có biết?', 'Máy in offset 6 màu có thể in hơn 15.000 tờ/giờ với độ phân giải lên đến 2400 DPI – tương đương chất lượng ảnh chuyên nghiệp.')}

<h2>Ưu điểm vượt trội của in offset</h2>
${tableHead(['Tiêu chí', 'Chi tiết'])}
${tableRow(['<strong>Chất lượng</strong>', 'Hình ảnh sắc nét, độ phân giải lên đến 2400 DPI'])}
${tableRow(['<strong>Màu sắc</strong>', 'Màu trung thực, đồng đều trên toàn bộ lô hàng'])}
${tableRow(['<strong>Chi phí</strong>', 'Giá cực rẻ khi in từ 1.000 sản phẩm trở lên'])}
${tableRow(['<strong>Đa dạng vật liệu</strong>', 'In được trên giấy, carton, nhựa, kim loại'])}
${tableRow(['<strong>Tốc độ</strong>', 'Sản xuất hàng chục nghìn sản phẩm mỗi ngày'], true)}
${tableEnd}

${img('/images/news/offset.png', 'Sản phẩm in offset cao cấp: hộp giấy, catalogue, bao bì')}

<h2>Ứng dụng phổ biến của in offset</h2>
<ul>
  <li>In hộp giấy, bao bì sản phẩm (mỹ phẩm, thực phẩm, dược phẩm)</li>
  <li>In túi giấy, túi xách quà tặng</li>
  <li>In catalogue, brochure, tờ rơi quảng cáo</li>
  <li>In sách, tạp chí, kỷ yếu</li>
  <li>In tem nhãn, decal sản phẩm</li>
</ul>

<h2>Tại sao nên chọn In Quang Phát?</h2>
<p>Với hơn <strong>12 năm kinh nghiệm</strong> và hệ thống máy in offset 6 màu thế hệ mới, In Quang Phát cam kết mang đến sản phẩm in ấn chất lượng cao nhất với giá thành hợp lý nhất. Tư vấn miễn phí và hỗ trợ thiết kế.</p>
${quote('"Đầu tư vào bao bì chất lượng chính là đầu tư vào ấn tượng đầu tiên của khách hàng về thương hiệu của bạn."')}
    `,
    views: 342,
  },

  // ===== 2. IN LỤA =====
  {
    title: 'Kỹ thuật In Lụa (Silk Screen): Từ truyền thống đến hiện đại',
    image: '/images/news/silkscreen.png',
    description: 'Hướng dẫn chi tiết về kỹ thuật in lụa – phương pháp in ấn linh hoạt nhất, ứng dụng trên vải, nhựa, kim loại và nhiều chất liệu khác.',
    content: `
<h2>In lụa là gì?</h2>
<p><strong>In lụa</strong> (Screen Printing) là kỹ thuật in ấn sử dụng tấm lưới mịn (polyester hoặc nylon) để chuyển mực in lên bề mặt vật liệu. Đây là phương pháp in lâu đời nhất nhưng vẫn cực kỳ phổ biến nhờ tính linh hoạt vượt trội.</p>

${img('/images/news/inline-silkscreen-process.png', 'Xưởng in lụa với các khung lưới và sản phẩm đang được hoàn thiện')}

<h2>Quy trình in lụa chuyên nghiệp</h2>

<h3>Bước 1: Chuẩn bị khung lưới</h3>
<p>Lưới polyester được căng đều trên khung nhôm. Độ mịn của lưới (mesh count) được chọn tùy độ chi tiết: lưới thưa (80-110 mesh) cho hình đơn giản, lưới mịn (200-300 mesh) cho chi tiết cao.</p>

<h3>Bước 2: Chụp bản (Phơi khuôn)</h3>
<p>Keo cảm quang phủ lên lưới, đặt phim in và chiếu tia UV. Phần bị che giữ nguyên keo mềm, được rửa trôi bằng nước, tạo thành khuôn in.</p>

<h3>Bước 3: Pha mực & In</h3>
<p>Mực pha theo mã Pantone. Sử dụng <strong>dao gạt (squeegee)</strong> kéo mực qua lưới, mực xuyên qua phần đã rửa và in lên sản phẩm.</p>

${tipBox('Lưu ý quan trọng', 'Mỗi màu cần một khung lưới riêng. Bài in 4 màu sẽ cần 4 khung, mỗi khung phải được căn chỉnh chính xác (registration) để các lớp màu khớp nhau hoàn hảo.')}

<h3>Bước 4: Sấy khô</h3>
<p>Sản phẩm đưa qua <strong>máy sấy băng chuyền</strong> ở 160-180°C để mực bám chắc và bền màu.</p>

<h3>Bước 5: Kiểm tra chất lượng</h3>
<p>Từng sản phẩm được kiểm tra độ sắc nét, độ bám mực, và màu sắc trước khi đóng gói.</p>

${img('/images/news/silkscreen.png', 'Kỹ thuật gạt mực qua khung lưới – bước quan trọng nhất trong in lụa')}

<h2>Các kỹ thuật in lụa phổ biến</h2>
${tableHead(['Kỹ thuật', 'Đặc điểm', 'Ứng dụng'])}
${tableRow(['<strong>In Chuyển Nhiệt (PET)</strong>', 'In trên film, dùng nhiệt ép lên vải', 'Áo thun, túi vải'])}
${tableRow(['<strong>In Cao Thành (High Density)</strong>', 'Nhiều lớp mực tạo hiệu ứng 3D nổi', 'Logo nổi trên áo'])}
${tableRow(['<strong>In Foil (Ép Kim)</strong>', 'Hiệu ứng ánh kim vàng/bạc sang trọng', 'Áo sự kiện, quà tặng'])}
${tableRow(['<strong>In Puff (Nổi Phồng)</strong>', 'Mực nở phồng khi sấy', 'Áo thời trang'])}
${tableRow(['<strong>In Silicone</strong>', 'Mực silicon mềm, co giãn', 'Đồ thể thao'], true)}
${tableEnd}

${quote('In lụa là lựa chọn tối ưu khi bạn cần màu sắc rực rỡ, lớp mực dày bền bỉ, và khả năng in trên hầu hết mọi loại bề mặt.')}
    `,
    views: 287,
  },

  // ===== 3. KRAFT (CÓ 2 INLINE IMAGES MỚI) =====
  {
    title: 'Hộp giấy Kraft: Giải pháp bao bì bền vững cho thương hiệu hiện đại',
    image: '/images/news/eco.png',
    description: 'Xu hướng sử dụng vật liệu tái chế đang lên ngôi. Khám phá lý do hộp giấy Kraft là lựa chọn hàng đầu cho các thương hiệu quan tâm đến môi trường.',
    content: `
<h2>Giấy Kraft là gì? Tại sao Kraft lại đặc biệt?</h2>
<p><strong>Giấy Kraft</strong> (từ tiếng Đức "Kraft" = "sức mạnh") là loại giấy sản xuất từ bột gỗ mềm qua quy trình hóa học Kraft. Đặc trưng: <strong>màu nâu tự nhiên</strong>, độ dai cao, khả năng chịu lực tốt và <strong>phân hủy hoàn toàn trong tự nhiên</strong>.</p>

${img('/images/news/inline-kraft-types.png', 'Ba loại giấy Kraft phổ biến: Kraft Nhật (nâu sẫm), Kraft Âu (nâu sáng), và Kraft trắng')}

<h2>Phân loại giấy Kraft phổ biến</h2>
<ul>
  <li><strong>Kraft Nhật (Nâu sẫm):</strong> Bề mặt mịn, dai, phù hợp in túi xách, bao bì cao cấp. Định lượng 120-300gsm.</li>
  <li><strong>Kraft Âu (Nâu sáng):</strong> Màu sáng hơn, dùng cho hộp thực phẩm, mỹ phẩm organic.</li>
  <li><strong>Kraft trắng:</strong> Giữ nguyên độ dai, bề mặt trắng dễ in hình ảnh đa dạng.</li>
</ul>

${tipBox('Xu hướng 2025-2026', 'Theo khảo sát của Nielsen, 73% người tiêu dùng Gen Z sẵn sàng trả thêm 15-20% cho sản phẩm có bao bì thân thiện môi trường. Kraft là lựa chọn số 1.')}

<h2>Ứng dụng hộp giấy Kraft trong kinh doanh</h2>
${tableHead(['Ngành hàng', 'Sản phẩm Kraft', 'Ưu điểm'])}
${tableRow(['Mỹ phẩm', 'Hộp Kraft in logo, túi giấy', 'Sang trọng, thân thiện'])}
${tableRow(['Thực phẩm', 'Hộp đựng bánh, cà phê', 'An toàn thực phẩm'])}
${tableRow(['Thời trang', 'Túi xách giấy, tag quần áo', 'Phong cách vintage'])}
${tableRow(['Quà tặng', 'Hộp quà, bao thư', 'Ấm áp, gần gũi'], true)}
${tableEnd}

${img('/images/news/inline-kraft-products.png', 'Bộ sưu tập sản phẩm Kraft: túi giấy cà phê, hộp mỹ phẩm, hộp thực phẩm')}

<h2>Gia công phổ biến trên giấy Kraft</h2>
<ul>
  <li><strong>In offset 1-2 màu:</strong> Phong cách tối giản, tiết kiệm chi phí.</li>
  <li><strong>In lụa:</strong> Lớp mực dày, bám chắc trên bề mặt kraft thô.</li>
  <li><strong>Ép kim vàng/bạc:</strong> Tạo điểm nhấn sang trọng trên nền nâu mộc mạc.</li>
  <li><strong>Dập nổi logo:</strong> Hiệu ứng 3D tinh tế, không cần mực in.</li>
</ul>

${quote('"Sử dụng bao bì Kraft không chỉ bảo vệ trái đất mà còn giúp thương hiệu ghi điểm trong mắt khách hàng về sự tử tế và trách nhiệm xã hội."')}

<h2>Liên hệ In Quang Phát</h2>
<p>Chúng tôi cung cấp giải pháp in ấn trên giấy Kraft với <strong>số lượng tối thiểu chỉ từ 100 sản phẩm</strong>. Hỗ trợ thiết kế, tư vấn chất liệu và giao hàng tận nơi tại Hà Nội.</p>
    `,
    views: 415,
  },

  // ===== 4. HỘP CỨNG =====
  {
    title: 'In hộp cứng cao cấp: Quy trình sản xuất và ứng dụng thực tế',
    image: '/images/news/hop-cung.png',
    description: 'Tìm hiểu chi tiết quy trình sản xuất hộp cứng (rigid box) cao cấp, từ khâu thiết kế đến gia công hoàn thiện cho sản phẩm quà tặng và mỹ phẩm.',
    content: `
<h2>Hộp cứng là gì?</h2>
<p><strong>Hộp cứng</strong> (Rigid Box / Set-up Box) là loại hộp làm từ bìa cứng dày (carton sóng hoặc greyboard 1.5-2.5mm), bọc ngoài bằng giấy in offset, và dán lót bên trong. Đây là dạng bao bì <strong>cao cấp nhất</strong> trong ngành hộp giấy.</p>

${img('/images/news/hop-cung.png', 'Bộ sưu tập hộp cứng cao cấp với các kỹ thuật gia công: ép kim, dập nổi, cán mờ')}

<h2>Quy trình sản xuất hộp cứng tại In Quang Phát</h2>

<h3>Bước 1: Thiết kế kết cấu (Structural Design)</h3>
<p>Kỹ sư tạo bản vẽ kỹ thuật 2D/3D cho hộp với kích thước, kiểu nắp (nắp gài, nam châm, nắp lật...), rãnh gập, và vị trí dán.</p>

<h3>Bước 2: In ấn bề mặt</h3>
<p>Giấy bọc ngoài (couche 128-200gsm) được in offset 4 màu + màu đặc biệt nếu cần.</p>

${img('/images/news/inline-hop-cung-process.png', 'Quy trình sản xuất hộp cứng: từ bìa phẳng → bế → gấp dán → thành phẩm')}

<h3>Bước 3: Gia công sau in</h3>
<ul>
  <li><strong>Cán màng:</strong> Mờ (matte) hoặc bóng (glossy) bảo vệ và tạo hiệu ứng.</li>
  <li><strong>Ép kim (Hot foil stamping):</strong> Chữ/logo ánh vàng, bạc sang trọng.</li>
  <li><strong>Dập nổi / Dập chìm (Emboss/Deboss):</strong> Hiệu ứng 3D trên bề mặt.</li>
  <li><strong>Phủ UV cục bộ:</strong> Làm nổi bật vùng nhất định trên hộp.</li>
</ul>

<h3>Bước 4: Bế, gập & dán hộp</h3>
<p>Bìa cứng cắt theo khuôn bế, gập thành hình hộp, bọc giấy in và dán lót dentro. Gắn nam châm, ruy-băng nếu có.</p>

${tipBox('Chi phí tham khảo', 'Hộp cứng nắp lật nam châm kích thước 20x15x8cm, in offset 4 màu, cán mờ + ép kim vàng: từ 25.000đ/hộp (đặt từ 500 hộp).')}

<h2>Phân loại hộp cứng phổ biến</h2>
${tableHead(['Loại hộp', 'Đặc điểm', 'Ứng dụng'])}
${tableRow(['<strong>Hộp nắp rời</strong>', 'Nắp và thân tách rời, cao cấp', 'Quà tặng, mỹ phẩm'])}
${tableRow(['<strong>Hộp nắp lật (cứng)</strong>', 'Bản lề gập, nam châm đóng', 'Điện thoại, đồng hồ'])}
${tableRow(['<strong>Hộp kéo (drawer)</strong>', 'Ngăn kéo trượt ra/vào', 'Trà, chocolate'])}
${tableRow(['<strong>Hộp hình đặc biệt</strong>', 'Tròn, lục giác, hình trái tim', 'Quà Valentine, hoa'], true)}
${tableEnd}

${quote('Hộp cứng mang đến trải nghiệm "unboxing" đẳng cấp, tạo ấn tượng mạnh mẽ ngay từ lần đầu tiên khách hàng chạm vào sản phẩm.')}
    `,
    views: 156,
  },

  // ===== 5. HỘP MỀM (CÓ 2 INLINE IMAGES MỚI) =====
  {
    title: 'In hộp mềm (Folding Carton): Giải pháp bao bì phổ thông hiệu quả',
    image: '/images/news/hop-mem.png',
    description: 'Hộp mềm là dạng bao bì gập phẳng sử dụng rộng rãi nhất. Tìm hiểu về chất liệu, kết cấu và quy trình sản xuất hộp mềm tại In Quang Phát.',
    content: `
<h2>Hộp mềm là gì?</h2>
<p><strong>Hộp mềm</strong> (Folding Carton) là loại hộp sản xuất từ một tấm giấy/bìa duy nhất, đã được in ấn, bế (die-cut) theo khuôn, giao cho khách ở dạng <strong>phẳng (flat)</strong>. Khi dùng chỉ cần gấp và gài nắp là có hộp thành phẩm.</p>
<p>So với hộp cứng: <strong>chi phí thấp hơn rất nhiều</strong>, tiết kiệm không gian lưu trữ, và vẫn đảm bảo tính thẩm mỹ.</p>

${img('/images/news/inline-hop-mem-types.png', 'Các kiểu hộp mềm phổ biến: hộp nắp gài, hộp đáy tự khóa, hộp cửa sổ, hộp sleeve')}

<h2>Chất liệu giấy phổ biến cho hộp mềm</h2>
${tableHead(['Loại giấy', 'Định lượng', 'Đặc tính'])}
${tableRow(['<strong>Giấy Ivory</strong>', '250-350gsm', 'Trắng 2 mặt, mịn, in offset đẹp'])}
${tableRow(['<strong>Giấy Duplex</strong>', '250-400gsm', 'Mặt trắng + mặt xám, giá rẻ'])}
${tableRow(['<strong>Giấy Couche</strong>', '250-350gsm', 'Bóng hoặc mờ, in hình sắc nét'])}
${tableRow(['<strong>Giấy Kraft</strong>', '200-350gsm', 'Nâu tự nhiên, thân thiện MTrường'], true)}
${tableEnd}

<h2>Các kiểu kết cấu hộp mềm</h2>
<ul>
  <li><strong>Hộp nắp gài (Tuck-end box):</strong> Phổ biến nhất, gài nắp trên và dưới. Dùng cho mỹ phẩm, dược phẩm.</li>
  <li><strong>Hộp nắp cài tự động (Auto-lock bottom):</strong> Đáy tự khóa khi mở, đóng gói nhanh.</li>
  <li><strong>Hộp display (Hộp trưng bày):</strong> Có cửa sổ hoặc khoét lỗ thấy sản phẩm bên trong.</li>
  <li><strong>Hộp sleeve (Hộp ống):</strong> Dạng ống trượt, dùng cho son môi, nước hoa.</li>
</ul>

${tipBox('So sánh nhanh', 'Hộp mềm Ivory 300gsm: từ 2.500đ/hộp (1.000 hộp). Hộp cứng tương đương: từ 20.000đ/hộp. Chênh lệch gấp 8 lần! Nếu ngân sách hạn chế, hộp mềm là lựa chọn thông minh.')}

<h2>Quy trình sản xuất hộp mềm</h2>
<ol>
  <li><strong>Thiết kế:</strong> Tạo dieline (bản vẽ kỹ thuật) và artwork đồ họa.</li>
  <li><strong>In Offset:</strong> In hình ảnh, thông tin sản phẩm lên giấy phẳng.</li>
  <li><strong>Cán màng:</strong> Mờ hoặc bóng bảo vệ bề mặt.</li>
  <li><strong>Bế (Die-cutting):</strong> Cắt theo khuôn bế đã thiết kế.</li>
  <li><strong>Dán hộp (Gluing):</strong> Dán mép hộp bằng máy tự động.</li>
  <li><strong>Đóng gói & giao hàng:</strong> Hộp xếp phẳng, đóng thùng.</li>
</ol>

${img('/images/news/inline-hop-mem-diecutting.png', 'Máy bế (die-cutting) cắt giấy in thành hộp mềm theo khuôn thiết kế')}

${quote('Hộp mềm là sự cân bằng hoàn hảo giữa chi phí và thẩm mỹ – lý tưởng cho doanh nghiệp vừa và nhỏ muốn bao bì chuyên nghiệp mà không tốn kém.')}
    `,
    views: 198,
  },

  // ===== 6. PHONG BÌ (CÓ 2 INLINE IMAGES MỚI) =====
  {
    title: 'In phong bì doanh nghiệp: Nâng tầm hình ảnh thương hiệu',
    image: '/images/news/phong-bi.png',
    description: 'Phong bì in logo là vật phẩm văn phòng quan trọng giúp xây dựng hình ảnh chuyên nghiệp. Tìm hiểu kích thước, chất liệu và kỹ thuật in phong bì.',
    content: `
<h2>Tại sao doanh nghiệp cần in phong bì riêng?</h2>
<p>Phong bì là ấn phẩm văn phòng <strong>tiếp xúc trực tiếp với khách hàng</strong> nhiều nhất. Một phong bì có in logo, tên công ty, và thông tin liên hệ sẽ giúp doanh nghiệp:</p>
<ul>
  <li>Xây dựng hình ảnh <strong>chuyên nghiệp, đáng tin cậy</strong></li>
  <li>Quảng bá thương hiệu một cách tự nhiên</li>
  <li>Tạo ấn tượng tốt trong mắt đối tác</li>
  <li>Đồng bộ bộ ấn phẩm (letterhead, namecard, folder)</li>
</ul>

${img('/images/news/inline-phongbi-collection.png', 'Bộ ấn phẩm văn phòng đồng bộ: phong bì các kích thước, tiêu đề thư và namecard')}

<h2>Các kích thước phong bì tiêu chuẩn</h2>
${tableHead(['Ký hiệu', 'Kích thước (mm)', 'Công dụng'])}
${tableRow(['<strong>DL</strong>', '220 x 110', 'Thư từ, hóa đơn (gấp 3 A4)'])}
${tableRow(['<strong>C5</strong>', '229 x 162', 'Tài liệu A5, thiệp mời'])}
${tableRow(['<strong>C4</strong>', '324 x 229', 'Tài liệu A4 không gấp'])}
${tableRow(['<strong>12 x 22 cm</strong>', '220 x 120', 'Phong bì lương, thư mời'], true)}
${tableEnd}

<h2>Chất liệu in phong bì</h2>
<ul>
  <li><strong>Giấy Ford trắng (100-120gsm):</strong> Phổ biến nhất, bề mặt mịn, giá rẻ.</li>
  <li><strong>Giấy Conqueror (120gsm):</strong> Cao cấp, vân dọc/vân ngang sang trọng.</li>
  <li><strong>Giấy Kraft (120-150gsm):</strong> Phong cách mộc mạc, eco-friendly.</li>
  <li><strong>Giấy mỹ thuật:</strong> Nhiều màu sắc và texture cho phong bì sự kiện.</li>
</ul>

${img('/images/news/inline-phongbi-foil.png', 'Phong bì cao cấp với logo ép kim vàng và dập nổi trên giấy mỹ thuật')}

<h2>Kỹ thuật in phong bì tại In Quang Phát</h2>
${tableHead(['Kỹ thuật', 'Số lượng tối thiểu', 'Đặc điểm'])}
${tableRow(['<strong>In offset</strong>', 'Từ 500 phong bì', 'Màu chuẩn, giá rẻ nhất'])}
${tableRow(['<strong>In kỹ thuật số</strong>', 'Từ 50 phong bì', 'Nhanh, chi tiết cao'])}
${tableRow(['<strong>Ép kim (Foil)</strong>', 'Từ 200 phong bì', 'Logo vàng/bạc đẳng cấp'])}
${tableRow(['<strong>Dập nổi (Emboss)</strong>', 'Từ 200 phong bì', 'Logo 3D, không cần mực'], true)}
${tableEnd}

${tipBox('Tiết kiệm chi phí', 'Đặt in combo phong bì + tiêu đề thư + namecard cùng lúc sẽ tiết kiệm 15-20% so với đặt riêng lẻ từng loại. Liên hệ In Quang Phát để được tư vấn.')}

${quote('"Phong bì doanh nghiệp không chỉ là nơi đựng thư – nó là bộ mặt đầu tiên mà đối tác nhìn thấy. Hãy đầu tư cho ấn tượng đó."')}
    `,
    views: 124,
  },

  // ===== 7. DECAL (DÙNG THUMBNAIL LÀM INLINE) =====
  {
    title: 'In Decal, Tem Nhãn sản phẩm: Từ A đến Z cho doanh nghiệp',
    image: '/images/news/in-decal.png',
    description: 'Hướng dẫn đầy đủ về các loại decal, tem nhãn: decal giấy, nhựa, trong suốt và quy trình in ấn chuyên nghiệp tại In Quang Phát.',
    content: `
<h2>Decal, tem nhãn là gì?</h2>
<p><strong>Decal</strong> (sticker, tem nhãn) là ấn phẩm in trên chất liệu có lớp keo dính mặt sau, dùng dán lên sản phẩm, bao bì, hoặc các bề mặt khác. Đây là vật phẩm <strong>không thể thiếu</strong> trong kinh doanh, hiển thị thông tin, logo, mã vạch, và hướng dẫn sử dụng.</p>

${img('/images/news/in-decal.png', 'Các loại decal sản phẩm: tem trong suốt, nhãn mỹ phẩm, sticker hologram, decal giấy')}

<h2>Phân loại decal theo chất liệu</h2>
${tableHead(['Loại decal', 'Đặc tính', 'Ứng dụng'])}
${tableRow(['<strong>Decal giấy</strong>', 'Giá rẻ, in được nhiều màu', 'Tem sản phẩm khô'])}
${tableRow(['<strong>Decal nhựa PVC</strong>', 'Chống nước, bền bỉ', 'Mỹ phẩm, hóa chất'])}
${tableRow(['<strong>Decal trong (PET)</strong>', 'Trong suốt, không nền trắng', 'Chai lọ thủy tinh, ly trà sữa'])}
${tableRow(['<strong>Decal bạc/vàng</strong>', 'Bề mặt ánh kim sang trọng', 'Rượu, nước hoa'])}
${tableRow(['<strong>Decal 7 màu (Hologram)</strong>', 'Hiệu ứng cầu vồng, chống giả', 'Tem bảo hành'], true)}
${tableEnd}

<h2>Các hình thức bế (cắt) decal</h2>
<ul>
  <li><strong>Bế chữ nhật/tròn:</strong> Tiêu chuẩn, giá rẻ nhất.</li>
  <li><strong>Bế kiss-cut:</strong> Cắt theo viền thiết kế, giữ lớp nền.</li>
  <li><strong>Bế rời (die-cut):</strong> Cắt hoàn toàn, từng miếng riêng.</li>
  <li><strong>Bế cuộn (roll):</strong> Dạng cuộn cho máy dán tự động, công nghiệp.</li>
</ul>

${tipBox('Mẹo chọn decal', 'Sản phẩm tiếp xúc nước (chai, lọ, ly)? → Chọn decal nhựa PVC hoặc PET trong. Sản phẩm khô (hộp, túi)? → Decal giấy là đủ và tiết kiệm hơn 40%.')}

<h2>Quy trình in decal tại In Quang Phát</h2>
<ol>
  <li><strong>Tư vấn & Thiết kế:</strong> Chọn chất liệu, kích thước, hình dạng phù hợp.</li>
  <li><strong>In ấn:</strong> In offset (số lượng lớn) hoặc kỹ thuật số (nhỏ, đa dạng).</li>
  <li><strong>Gia công:</strong> Cán màng chống xước, phủ UV, ép kim nếu cần.</li>
  <li><strong>Bế & Đóng gói:</strong> Bế theo khuôn, tách lề, đóng cuộn hoặc tờ.</li>
</ol>

<h2>Bảng giá tham khảo in decal</h2>
${tableHead(['Loại', 'Kích thước', 'SL 1.000', 'SL 5.000'])}
${tableRow(['Decal giấy', '5 x 3 cm', '500đ/tem', '300đ/tem'])}
${tableRow(['Decal nhựa PVC', '5 x 3 cm', '800đ/tem', '500đ/tem'])}
${tableRow(['Decal trong PET', '5 x 3 cm', '900đ/tem', '600đ/tem'])}
${tableRow(['Decal bạc/vàng', '5 x 3 cm', '1.200đ/tem', '800đ/tem'], true)}
${tableEnd}

${quote('Tem nhãn nhỏ bé nhưng mang trong mình toàn bộ câu chuyện thương hiệu. Một chiếc nhãn đẹp có thể quyết định khách hàng chọn sản phẩm của bạn trên kệ hàng.')}
    `,
    views: 231,
  },

  // ===== 8. TÚI GIẤY (DÙNG THUMBNAIL LÀM INLINE) =====
  {
    title: 'In túi giấy thương hiệu: Chi tiết chất liệu, kiểu dáng và giá thành',
    image: '/images/news/tui-giay.png',
    description: 'Túi giấy in logo là công cụ marketing mạnh mẽ cho shop thời trang, mỹ phẩm. Tìm hiểu các loại túi giấy, chất liệu và bảng giá tham khảo.',
    content: `
<h2>Túi giấy – Công cụ marketing di động</h2>
<p>Chỉ cần in logo, màu thương hiệu lên túi giấy, bạn đã biến mỗi khách hàng thành <strong>"người quảng cáo di động"</strong> miễn phí. Khi khách hàng mang túi đi trên phố, hàng trăm người sẽ nhìn thấy thương hiệu của bạn.</p>

${img('/images/news/tui-giay.png', 'Bộ sưu tập túi giấy cao cấp: Kraft nâu, Ivory cán mờ, Couche cán bóng')}

<h2>Phân loại túi giấy theo chất liệu</h2>
${tableHead(['Chất liệu', 'Đặc tính', 'Phù hợp'])}
${tableRow(['<strong>Kraft nâu</strong>', 'Bền, mộc mạc, eco-friendly', 'Café, bakery, organic'])}
${tableRow(['<strong>Ivory cán mờ</strong>', 'Trắng mịn, sang trọng', 'Thời trang, mỹ phẩm'])}
${tableRow(['<strong>Couche cán bóng</strong>', 'Bóng loáng, hình ảnh rõ', 'Sản phẩm cao cấp'])}
${tableRow(['<strong>Giấy mỹ thuật</strong>', 'Nhiều texture, màu sắc', 'Quà tặng VIP'], true)}
${tableEnd}

<h2>Các kiểu quai túi phổ biến</h2>
<ul>
  <li><strong>Quai dây giấy xoắn:</strong> Giá rẻ, phổ biến nhất, phù hợp túi mua sắm.</li>
  <li><strong>Quai dây dù (PP):</strong> Bền, chịu lực tốt, dùng cho túi nặng.</li>
  <li><strong>Quai ruy-băng (satin):</strong> Sang trọng, cho túi quà tặng cao cấp.</li>
  <li><strong>Quai dây cotton:</strong> Chắc chắn, thời trang, cho spa, fashion.</li>
  <li><strong>Quai bế liền:</strong> Không dây riêng, khoét lỗ. Đơn giản, tiết kiệm.</li>
</ul>

${tipBox('Kích thước phổ biến', 'Túi shop nhỏ: 20x15x8cm. Túi shop vừa: 25x20x10cm. Túi quà tặng lớn: 35x25x12cm. Liên hệ In Quang Phát để được tư vấn kích thước phù hợp nhất.')}

<h2>Quy trình sản xuất túi giấy</h2>
<ol>
  <li><strong>Thiết kế:</strong> Xác định kích thước, kiểu quai, bố cục in.</li>
  <li><strong>In Offset:</strong> In hình ảnh, logo trên giấy phẳng.</li>
  <li><strong>Cán màng:</strong> Mờ/bóng giúp túi cứng cáp, chống trầy.</li>
  <li><strong>Bế & Gấp:</strong> Bế theo khuôn, gấp thành hình túi.</li>
  <li><strong>Dán đáy & Gắn quai:</strong> Dán đáy chắc chắn, luồn dây quai.</li>
</ol>

<h2>Bảng giá tham khảo in túi giấy</h2>
${tableHead(['Chất liệu', 'Kích thước', 'SL 500', 'SL 1.000'])}
${tableRow(['Kraft nâu 170gsm', '25x20x10cm', '8.000đ', '6.500đ'])}
${tableRow(['Ivory 250gsm cán mờ', '25x20x10cm', '12.000đ', '9.500đ'])}
${tableRow(['Couche 250gsm cán bóng', '25x20x10cm', '13.000đ', '10.000đ'])}
${tableRow(['Giấy mỹ thuật + ép kim', '25x20x10cm', '18.000đ', '15.000đ'], true)}
${tableEnd}

${quote('Một chiếc túi giấy đẹp không chỉ đựng sản phẩm – nó đựng cả câu chuyện thương hiệu. Đầu tư thông minh cho chiếc túi, và khách hàng sẽ tự nguyện mang thương hiệu của bạn đi khắp nơi.')}
    `,
    views: 178,
  },
];

// ============================================================
//  SEED FUNCTION
// ============================================================
const seedNews = async () => {
  try {
    const admin = await User.findOne({ isAdmin: true });
    if (!admin) {
      console.log('Không tìm thấy Admin user. Hãy chạy seeder.js trước.');
      process.exit(1);
    }

    await News.deleteMany();
    console.log('Đã xóa bài viết cũ.');

    const formattedNews = newsData.map(news => ({
      ...news,
      user: admin._id,
    }));

    await News.insertMany(formattedNews);
    console.log(`--- Đã nhập ${newsData.length} bài viết tin tức thành công! ---`);
    process.exit();
  } catch (error) {
    console.error(`Lỗi: ${error.message}`);
    process.exit(1);
  }
};

seedNews();
