/**
 * Professional Quotation Excel Export
 * Công ty TNHH In Quang Phát
 * Sử dụng exceljs + file-saver
 */
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// ── Brand Constants ──────────────────────────────────────────
const BRAND = {
  primaryColor: '006B4D',    // Xanh đậm chính
  primaryBg: 'E6F0ED',       // Nền xanh nhạt
  headerBg: '111827',        // Header đen
  white: 'FFFFFF',
  black: '111827',
  gray: '6B7280',
  grayLight: 'F9FAFB',
  borderColor: 'D1D5DB',
  accentRed: 'DC2626',
  companyName: 'CÔNG TY TNHH IN QUANG PHÁT',
  companyAddress: '18 Phùng Hưng, Phường An Cựu, TP. Huế, Thừa Thiên Huế',
  companyPhone: '0234 3837 468',
  companyEmail: 'inquangphat@gmail.com',
};

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0));

/**
 * Xuất bảng báo giá ra file Excel chuyên nghiệp
 * @param {Object} quotation - Object báo giá từ DB
 */
export async function exportQuotationExcel(quotation) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'In Quang Phát ERP';
  workbook.created = new Date();

  const sheetName = `BG ${quotation.quotationCode || 'Mới'}`;
  const ws = workbook.addWorksheet(sheetName, {
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 },
    },
  });

  // ── Column widths ──────────────────────────────────────────
  ws.columns = [
    { width: 6 },   // A: STT
    { width: 18 },  // B: Mã hàng
    { width: 40 },  // C: Hình ảnh
    { width: 22 },  // D: Kĩ thuật in
    { width: 12 },  // E: Số lượng
    { width: 16 },  // F: Đơn giá
    { width: 20 },  // G: Ghi chú
  ];

  let row = 1;

  // ══════════════════════════════════════════════════════════
  // HEADER - THÔNG TIN CÔNG TY
  // ══════════════════════════════════════════════════════════

  // Logo placeholder + Company name
  ws.mergeCells(`A${row}:G${row}`);
  const companyRow = ws.getRow(row);
  companyRow.height = 32;
  const companyCell = ws.getCell(`A${row}`);
  companyCell.value = BRAND.companyName;
  companyCell.font = { name: 'Times New Roman', size: 16, bold: true, color: { argb: BRAND.primaryColor } };
  companyCell.alignment = { horizontal: 'center', vertical: 'middle' };
  companyCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.primaryBg } };
  row++;

  // Address line
  ws.mergeCells(`A${row}:G${row}`);
  const addrCell = ws.getCell(`A${row}`);
  addrCell.value = `Địa chỉ: ${BRAND.companyAddress}`;
  addrCell.font = { name: 'Times New Roman', size: 9, italic: true, color: { argb: BRAND.gray } };
  addrCell.alignment = { horizontal: 'center', vertical: 'middle' };
  addrCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.primaryBg } };
  ws.getRow(row).height = 18;
  row++;

  // Phone & Email
  ws.mergeCells(`A${row}:G${row}`);
  const phoneCell = ws.getCell(`A${row}`);
  phoneCell.value = `ĐT: ${BRAND.companyPhone}  |  Email: ${BRAND.companyEmail}`;
  phoneCell.font = { name: 'Times New Roman', size: 9, italic: true, color: { argb: BRAND.gray } };
  phoneCell.alignment = { horizontal: 'center', vertical: 'middle' };
  phoneCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.primaryBg } };
  ws.getRow(row).height = 18;
  row++;

  // Decorative line
  ws.mergeCells(`A${row}:G${row}`);
  ws.getRow(row).height = 4;
  ws.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.primaryColor } };
  row++;

  // Spacer
  ws.getRow(row).height = 10;
  row++;

  // ══════════════════════════════════════════════════════════
  // TIÊU ĐỀ BÁO GIÁ
  // ══════════════════════════════════════════════════════════
  ws.mergeCells(`A${row}:G${row}`);
  const titleCell = ws.getCell(`A${row}`);
  titleCell.value = 'BẢNG BÁO GIÁ';
  titleCell.font = { name: 'Times New Roman', size: 22, bold: true, color: { argb: BRAND.accentRed } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(row).height = 36;
  row++;

  // Mã báo giá
  ws.mergeCells(`A${row}:G${row}`);
  const codeCell = ws.getCell(`A${row}`);
  codeCell.value = `Số: ${quotation.quotationCode || '---'}`;
  codeCell.font = { name: 'Times New Roman', size: 11, bold: true, color: { argb: BRAND.primaryColor } };
  codeCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(row).height = 22;
  row++;

  // Spacer
  ws.getRow(row).height = 8;
  row++;

  // ══════════════════════════════════════════════════════════
  // THÔNG TIN KHÁCH HÀNG
  // ══════════════════════════════════════════════════════════
  ws.mergeCells(`A${row}:C${row}`);
  ws.getCell(`A${row}`).value = 'Kính gửi:';
  ws.getCell(`A${row}`).font = { name: 'Times New Roman', size: 11, italic: true };
  ws.mergeCells(`D${row}:H${row}`);
  ws.getCell(`D${row}`).value = quotation.customerName || 'Quý Khách';
  ws.getCell(`D${row}`).font = { name: 'Times New Roman', size: 12, bold: true, color: { argb: BRAND.black } };
  ws.getRow(row).height = 24;
  row++;

  const quoteDate = quotation.quoteDate ? new Date(quotation.quoteDate) : new Date();
  ws.mergeCells(`A${row}:C${row}`);
  ws.getCell(`A${row}`).value = 'Ngày báo giá:';
  ws.getCell(`A${row}`).font = { name: 'Times New Roman', size: 11, italic: true };
  ws.mergeCells(`D${row}:H${row}`);
  ws.getCell(`D${row}`).value = quoteDate.toLocaleDateString('vi-VN');
  ws.getCell(`D${row}`).font = { name: 'Times New Roman', size: 11, bold: true };
  ws.getRow(row).height = 22;
  row++;

  // Spacer
  ws.getRow(row).height = 8;
  row++;

  // Mô tả
  ws.mergeCells(`A${row}:G${row}`);
  ws.getCell(`A${row}`).value = 'Theo yêu cầu của Quý khách, Công ty TNHH In Quang Phát kính gửi Bảng báo giá như sau:';
  ws.getCell(`A${row}`).font = { name: 'Times New Roman', size: 10.5 };
  ws.getCell(`A${row}`).alignment = { wrapText: true };
  ws.getRow(row).height = 24;
  row++;

  // Spacer
  ws.getRow(row).height = 6;
  row++;

  // ══════════════════════════════════════════════════════════
  // BẢNG DỮ LIỆU
  // ══════════════════════════════════════════════════════════
  const headerRow = row;
  const headers = ['STT', 'Mã hàng (Style)', 'Hình ảnh', 'Kĩ thuật in', 'Số lượng', 'Đơn giá (VNĐ)', 'Ghi chú'];

  // Header cells with dark background
  const thinBorder = {
    top: { style: 'thin', color: { argb: BRAND.borderColor } },
    left: { style: 'thin', color: { argb: BRAND.borderColor } },
    bottom: { style: 'thin', color: { argb: BRAND.borderColor } },
    right: { style: 'thin', color: { argb: BRAND.borderColor } },
  };

  headers.forEach((text, i) => {
    const cell = ws.getCell(row, i + 1);
    cell.value = text;
    cell.font = { name: 'Times New Roman', size: 10, bold: true, color: { argb: BRAND.white } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.headerBg } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = thinBorder;
  });
  ws.getRow(row).height = 28;
  row++;

  // Data rows
  const items = quotation.items || [];
  const imageEmbedTasks = []; // Collect image fetch tasks

  // Column C spans from col index 2.0 to 3.0 (width=40 chars)
  // We split it into equal horizontal slots for each image
  const IMG_COL_START = 2;   // 0-based col index of column C
  const IMG_COL_END = 3;   // exclusive end (column D start)
  const IMG_PAD = 0.05; // small padding inside each slot
  const ROW_HEIGHT_PER_IMG = 100; // px height for rows with images

  items.forEach((item, i) => {
    const thanhTien = (item.quantity || 0) * (item.unitPrice || 0);
    const isEven = i % 2 === 0;
    const images = item.images && item.images.length > 0 ? item.images : [];
    const imgCount = images.length;
    const currentRow = row; // Capture row index for async image embedding

    const rowData = [
      i + 1,
      item.style || '',
      '',                 // C: Hình ảnh (will be embedded below)
      item.printTechnique || '',
      item.quantity || 0,
      item.unitPrice || 0,
      item.note || '',
    ];

    rowData.forEach((val, j) => {
      const cell = ws.getCell(row, j + 1);
      cell.value = val;
      cell.font = { name: 'Times New Roman', size: 10.5 };
      cell.border = thinBorder;

      if (j === 0) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (j === 2) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (j === 4 || j === 5) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        if (j === 5) {
          cell.numFmt = '#,##0';
          cell.font = { name: 'Times New Roman', size: 10.5, bold: true };
        } else {
          cell.numFmt = '#,##0';
        }
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      }

      if (isEven) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.grayLight } };
      }
    });

    // Row height: taller when images exist
    ws.getRow(row).height = imgCount > 0 ? ROW_HEIGHT_PER_IMG : 26;

    // Queue all images for this item
    images.forEach((imgUrl, imgIdx) => {
      // Divide column C into equal horizontal slots for each image
      const slotWidth = (IMG_COL_END - IMG_COL_START) / imgCount;
      const colLeft = IMG_COL_START + imgIdx * slotWidth + IMG_PAD;
      const colRight = IMG_COL_START + (imgIdx + 1) * slotWidth - IMG_PAD;
      const rowTop = currentRow - 1 + IMG_PAD;
      const rowBottom = currentRow - 1 + 1 - IMG_PAD;

      imageEmbedTasks.push(
        fetch(imgUrl)
          .then((res) => res.arrayBuffer())
          .then((buf) => {
            const ext = imgUrl.match(/\.(png|gif|bmp)$/i) ? 'png' : 'jpeg';
            const imageId = workbook.addImage({ buffer: buf, extension: ext });
            ws.addImage(imageId, {
              tl: { col: colLeft, row: rowTop },
              br: { col: colRight, row: rowBottom },
              editAs: 'oneCell',
            });
          })
          .catch(() => { /* skip failed image */ })
      );
    });

    row++;
  });

  // Wait for all images to be fetched & embedded
  await Promise.all(imageEmbedTasks);

  // ══════════════════════════════════════════════════════════
  // DÒNG TỔNG CỘNG
  // ══════════════════════════════════════════════════════════
  ws.mergeCells(`A${row}:E${row}`);
  const totalLabelCell = ws.getCell(`A${row}`);
  totalLabelCell.value = 'TỔNG CỘNG';
  totalLabelCell.font = { name: 'Times New Roman', size: 12, bold: true, color: { argb: BRAND.white } };
  totalLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.primaryColor } };
  totalLabelCell.alignment = { horizontal: 'right', vertical: 'middle' };
  totalLabelCell.border = thinBorder;
  for (let c = 2; c <= 5; c++) {
    ws.getCell(row, c).border = thinBorder;
    ws.getCell(row, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.primaryColor } };
  }

  const grandTotal = quotation.grandTotal || items.reduce((s, it) => s + ((it.quantity || 0) * (it.unitPrice || 0)), 0);
  const totalValueCell = ws.getCell(`F${row}`);
  totalValueCell.value = grandTotal;
  totalValueCell.numFmt = '#,##0';
  totalValueCell.font = { name: 'Times New Roman', size: 13, bold: true, color: { argb: BRAND.white } };
  totalValueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.primaryColor } };
  totalValueCell.alignment = { horizontal: 'right', vertical: 'middle' };
  totalValueCell.border = thinBorder;

  const totalNoteCell = ws.getCell(`G${row}`);
  totalNoteCell.value = '';
  totalNoteCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.primaryColor } };
  totalNoteCell.border = thinBorder;

  ws.getRow(row).height = 30;
  row++;

  // Spacer
  ws.getRow(row).height = 12;
  row++;

  // ══════════════════════════════════════════════════════════
  // GHI CHÚ
  // ══════════════════════════════════════════════════════════
  ws.mergeCells(`A${row}:G${row}`);
  ws.getCell(`A${row}`).value = 'Ghi chú:';
  ws.getCell(`A${row}`).font = { name: 'Times New Roman', size: 10.5, bold: true };
  ws.getRow(row).height = 20;
  row++;

  const notes = [
    '• Đơn giá trên chưa bao gồm thuế VAT.',
    '• Giao hàng tận nơi.',
    '• Báo giá có hiệu lực trong vòng 15 ngày kể từ ngày báo giá.',
    '• Thanh toán: 50% đặt cọc, 50% khi giao hàng.',
  ];

  notes.forEach((note) => {
    ws.mergeCells(`A${row}:G${row}`);
    ws.getCell(`A${row}`).value = note;
    ws.getCell(`A${row}`).font = { name: 'Times New Roman', size: 10, italic: true, color: { argb: BRAND.gray } };
    ws.getRow(row).height = 18;
    row++;
  });

  // Spacer
  ws.getRow(row).height = 20;
  row++;

  // ══════════════════════════════════════════════════════════
  // CHỮ KÝ
  // ══════════════════════════════════════════════════════════
  const dateStr = `Huế, ngày ${quoteDate.getDate()} tháng ${quoteDate.getMonth() + 1} năm ${quoteDate.getFullYear()}`;

  // Date - right aligned
  ws.mergeCells(`E${row}:G${row}`);
  ws.getCell(`E${row}`).value = dateStr;
  ws.getCell(`E${row}`).font = { name: 'Times New Roman', size: 10.5, italic: true };
  ws.getCell(`E${row}`).alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(row).height = 20;
  row++;

  // "Đại diện công ty" label - left
  ws.mergeCells(`A${row}:C${row}`);
  ws.getCell(`A${row}`).value = 'Đại diện khách hàng';
  ws.getCell(`A${row}`).font = { name: 'Times New Roman', size: 11, bold: true };
  ws.getCell(`A${row}`).alignment = { horizontal: 'center', vertical: 'middle' };

  // "Người báo giá" label - right
  ws.mergeCells(`E${row}:G${row}`);
  ws.getCell(`E${row}`).value = 'Người báo giá';
  ws.getCell(`E${row}`).font = { name: 'Times New Roman', size: 11, bold: true };
  ws.getCell(`E${row}`).alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(row).height = 24;
  row++;

  // Signature placeholder (empty space)
  ws.getRow(row).height = 50;
  row++;

  // Name
  ws.mergeCells(`E${row}:G${row}`);
  ws.getCell(`E${row}`).value = 'Trần Đình Tấn';
  ws.getCell(`E${row}`).font = { name: 'Times New Roman', size: 11, bold: true, color: { argb: BRAND.primaryColor } };
  ws.getCell(`E${row}`).alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(row).height = 22;
  row++;

  // Footer line
  row++;
  ws.mergeCells(`A${row}:G${row}`);
  ws.getRow(row).height = 3;
  ws.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.primaryColor } };
  row++;

  ws.mergeCells(`A${row}:G${row}`);
  ws.getCell(`A${row}`).value = `${BRAND.companyName} — Chất lượng tạo nên uy tín`;
  ws.getCell(`A${row}`).font = { name: 'Times New Roman', size: 8, italic: true, color: { argb: BRAND.gray } };
  ws.getCell(`A${row}`).alignment = { horizontal: 'center', vertical: 'middle' };

  // ══════════════════════════════════════════════════════════
  // EXPORT
  // ══════════════════════════════════════════════════════════
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const customerSlug = (quotation.customerName || 'KhachHang').replace(/\s+/g, '_');
  const dateSlug = new Date().toISOString().slice(0, 10);
  const fileName = `BaoGia_${quotation.quotationCode || 'Moi'}_${customerSlug}_${dateSlug}.xlsx`;
  saveAs(blob, fileName);
}
