/**
 * Professional Finance Report PDF Generator
 * Generates sleek, branded PDF reports for In Quang Phát
 * Using jsPDF + jspdf-autotable + Roboto Vietnamese font
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Brand Colors ──────────────────────────────────────────────────────────────
const COLOR = {
  primary:    [16, 185, 129],   // emerald-500
  primaryDk:  [6, 95, 70],      // emerald-800
  accent:     [99, 102, 241],   // indigo-500
  red:        [239, 68, 68],    // red-500
  orange:     [249, 115, 22],   // orange-500
  yellow:     [245, 158, 11],   // amber-500
  gray:       [107, 114, 128],  // gray-500
  grayLight:  [243, 244, 246],  // gray-100
  white:      [255, 255, 255],
  black:      [17, 24, 39],     // gray-900
  greenBg:    [236, 253, 245],  // emerald-50
  redBg:      [254, 242, 242],  // red-50
};

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0));
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

// ── Font loader: fetch Roboto TTF from public/, convert to base64, register ──
let _fontCache = null;

async function loadVietnameseFont() {
  if (_fontCache) return _fontCache;

  const toBase64 = async (url) => {
    const resp = await fetch(url);
    const buf = await resp.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const [regularB64, boldB64] = await Promise.all([
    toBase64('/fonts/Roboto-Regular.ttf'),
    toBase64('/fonts/Roboto-Bold.ttf'),
  ]);

  _fontCache = { regularB64, boldB64 };
  return _fontCache;
}

function registerFont(doc, fonts) {
  doc.addFileToVFS('Roboto-Regular.ttf', fonts.regularB64);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
  doc.addFileToVFS('Roboto-Bold.ttf', fonts.boldB64);
  doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
  doc.setFont('Roboto', 'normal');
}

// ── Utility: draw branded header on every page ────────────────────────────────
function drawHeader(doc, title, subtitle) {
  const pageW = doc.internal.pageSize.getWidth();

  // Header bar
  doc.setFillColor(...COLOR.primaryDk);
  doc.rect(0, 0, pageW, 36, 'F');

  // Accent strip
  doc.setFillColor(...COLOR.primary);
  doc.rect(0, 36, pageW, 3, 'F');

  // Company name
  doc.setTextColor(...COLOR.white);
  doc.setFontSize(18);
  doc.setFont('Roboto', 'bold');
  doc.text('IN QUANG PHÁT', 14, 16);

  // Sub title
  doc.setFontSize(9);
  doc.setFont('Roboto', 'normal');
  doc.text('Hệ thống Quản lý Tài chính Doanh nghiệp', 14, 24);

  // Report title (right aligned)
  doc.setFontSize(14);
  doc.setFont('Roboto', 'bold');
  doc.text(title, pageW - 14, 16, { align: 'right' });

  // Subtitle / date range
  if (subtitle) {
    doc.setFontSize(8);
    doc.setFont('Roboto', 'normal');
    doc.text(subtitle, pageW - 14, 24, { align: 'right' });
  }

  // Generation timestamp
  doc.setTextColor(...COLOR.gray);
  doc.setFontSize(7);
  doc.text(
    `Xuất lúc: ${new Date().toLocaleString('vi-VN')}`,
    pageW - 14, 31, { align: 'right' }
  );

  return 44;
}

// ── Utility: draw footer on every page ────────────────────────────────────────
function drawFooter(doc) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const pages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor(...COLOR.grayLight);
    doc.rect(0, pageH - 16, pageW, 16, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.line(0, pageH - 16, pageW, pageH - 16);

    doc.setFont('Roboto', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLOR.gray);
    doc.text('CÔNG TY IN QUANG PHÁT — Báo cáo Tài chính Nội bộ', 14, pageH - 7);
    doc.text(`Trang ${i} / ${pages}`, pageW - 14, pageH - 7, { align: 'right' });
  }
}

// ── Section title helper ──────────────────────────────────────────────────────
function sectionTitle(doc, y, text, color = COLOR.primaryDk) {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFillColor(...color);
  doc.roundedRect(14, y, pageW - 28, 9, 2, 2, 'F');
  doc.setTextColor(...COLOR.white);
  doc.setFontSize(10);
  doc.setFont('Roboto', 'bold');
  doc.text(text, 18, y + 6.5);
  return y + 14;
}

// ── Stat box helper ───────────────────────────────────────────────────────────
function statBox(doc, x, y, w, label, value, bgColor, textColor) {
  doc.setFillColor(...bgColor);
  doc.roundedRect(x, y, w, 22, 3, 3, 'F');
  doc.setTextColor(...COLOR.gray);
  doc.setFontSize(7);
  doc.setFont('Roboto', 'normal');
  doc.text(label, x + w / 2, y + 7, { align: 'center' });
  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont('Roboto', 'bold');
  doc.text(value, x + w / 2, y + 17, { align: 'center' });
}

// ── autoTable default styles with Roboto ──────────────────────────────────────
const tableFont = { font: 'Roboto' };

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT 1: CASHFLOW REPORT
// ═══════════════════════════════════════════════════════════════════════════════
export async function exportCashflowPDF(cashflowData, { days, groupBy } = {}) {
  const fonts = await loadVietnameseFont();
  const doc = new jsPDF('landscape', 'mm', 'a4');
  registerFont(doc, fonts);
  const pageW = doc.internal.pageSize.getWidth();
  let y = drawHeader(doc, 'BÁO CÁO LƯU CHUYỂN TIỀN TỆ', `${days || 30} ngày gần nhất · Nhóm theo ${groupBy === 'month' ? 'tháng' : 'ngày'}`);

  const series = cashflowData?.series || [];

  const totalIncome  = series.reduce((s, r) => s + (r.income || 0), 0);
  const totalExpense = series.reduce((s, r) => s + (r.expense || 0), 0);
  const totalNet     = totalIncome - totalExpense;

  const boxW = (pageW - 28 - 12) / 3;
  statBox(doc, 14,      y, boxW, 'TỔNG THU VÀO',   fmt(totalIncome)  + 'đ', COLOR.greenBg, COLOR.primaryDk);
  statBox(doc, 14 + boxW + 6, y, boxW, 'TỔNG CHI RA', fmt(totalExpense) + 'đ', COLOR.redBg,   [185, 28, 28]);
  statBox(doc, 14 + (boxW + 6) * 2, y, boxW, 'DÒNG TIỀN RÒNG', (totalNet >= 0 ? '+' : '') + fmt(totalNet) + 'đ',
    totalNet >= 0 ? COLOR.greenBg : COLOR.redBg, totalNet >= 0 ? COLOR.primaryDk : [185, 28, 28]);
  y += 30;

  y = sectionTitle(doc, y, '  CHI TIẾT DÒNG TIỀN THEO KỲ');

  autoTable(doc, {
    startY: y,
    head: [['Ngày', 'Thu vào (đ)', 'Chi ra (đ)', 'Ròng (đ)', 'Tỷ lệ Thu/Chi']],
    body: series.map(s => {
      const net = (s.income || 0) - (s.expense || 0);
      const ratio = s.expense > 0 ? ((s.income || 0) / s.expense * 100).toFixed(0) + '%' : '—';
      return [s.date || '—', fmt(s.income), fmt(s.expense), (net >= 0 ? '+' : '') + fmt(net), ratio];
    }),
    styles: { ...tableFont, fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: COLOR.primaryDk, textColor: COLOR.white, fontStyle: 'bold', halign: 'center', fontSize: 8 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 30 },
      1: { halign: 'right', textColor: COLOR.primaryDk },
      2: { halign: 'right', textColor: [185, 28, 28] },
      3: { halign: 'right', fontStyle: 'bold' },
      4: { halign: 'center' },
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    foot: [[
      { content: 'TỔNG CỘNG', styles: { fontStyle: 'bold', halign: 'center' } },
      { content: fmt(totalIncome) + 'đ', styles: { fontStyle: 'bold', halign: 'right', textColor: COLOR.primaryDk } },
      { content: fmt(totalExpense) + 'đ', styles: { fontStyle: 'bold', halign: 'right', textColor: [185, 28, 28] } },
      { content: (totalNet >= 0 ? '+' : '') + fmt(totalNet) + 'đ', styles: { fontStyle: 'bold', halign: 'right' } },
      '',
    ]],
    footStyles: { fillColor: [229, 231, 235], textColor: COLOR.black, fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
    theme: 'grid',
  });

  drawFooter(doc);
  doc.save(`BaoCao_LuuChuyenTienTe_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT 2: NET DEBT (CÔNG NỢ RÒNG) REPORT
// ═══════════════════════════════════════════════════════════════════════════════
export async function exportNetDebtPDF(netDebtData) {
  const fonts = await loadVietnameseFont();
  const doc = new jsPDF('portrait', 'mm', 'a4');
  registerFont(doc, fonts);
  const pageW = doc.internal.pageSize.getWidth();
  let y = drawHeader(doc, 'BÁO CÁO CÔNG NỢ RÒNG', 'Tổng hợp Phải thu & Phải trả');

  const totalR = netDebtData?.totalReceivable || 0;
  const totalP = netDebtData?.totalPayable || 0;
  const net    = netDebtData?.netDebt || 0;

  const boxW = (pageW - 28 - 12) / 3;
  statBox(doc, 14,      y, boxW, 'TỔNG PHẢI THU', fmt(totalR) + 'đ', COLOR.greenBg, COLOR.primaryDk);
  statBox(doc, 14 + boxW + 6, y, boxW, 'TỔNG PHẢI TRẢ', fmt(totalP) + 'đ', COLOR.redBg, [185, 28, 28]);
  statBox(doc, 14 + (boxW + 6) * 2, y, boxW, 'CÔNG NỢ RÒNG', (net >= 0 ? '+' : '') + fmt(net) + 'đ',
    net >= 0 ? COLOR.greenBg : COLOR.redBg, net >= 0 ? COLOR.primaryDk : [185, 28, 28]);
  y += 30;

  const debtAgeLabels = {
    'current': 'Chưa đến hạn', '1-15': '1-15 ngày', '16-30': '16-30 ngày',
    '31-60': '31-60 ngày', '61-90': '61-90 ngày', 'over90': '>90 ngày',
  };

  y = sectionTitle(doc, y, '  PHÂN TÍCH TUỔI NỢ — PHẢI THU');
  autoTable(doc, {
    startY: y,
    head: [['Nhóm tuổi nợ', 'Số khoản', 'Tổng số tiền (đ)', 'Tỷ trọng']],
    body: (netDebtData?.receivableByAge || []).map(g => [
      debtAgeLabels[g._id] || g._id, g.count || 0, fmt(g.total) + 'đ',
      totalR > 0 ? (g.total / totalR * 100).toFixed(1) + '%' : '0%',
    ]),
    styles: { ...tableFont, fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: COLOR.primaryDk, textColor: COLOR.white, fontStyle: 'bold', halign: 'center', fontSize: 8 },
    columnStyles: { 0: { cellWidth: 40 }, 1: { halign: 'center' }, 2: { halign: 'right', fontStyle: 'bold' }, 3: { halign: 'center' } },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { left: 14, right: 14 },
    theme: 'grid',
  });
  y = doc.lastAutoTable.finalY + 10;

  y = sectionTitle(doc, y, '  PHÂN TÍCH TUỔI NỢ — PHẢI TRẢ', [185, 28, 28]);
  autoTable(doc, {
    startY: y,
    head: [['Nhóm tuổi nợ', 'Số khoản', 'Tổng số tiền (đ)', 'Tỷ trọng']],
    body: (netDebtData?.payableByAge || []).map(g => [
      debtAgeLabels[g._id] || g._id, g.count || 0, fmt(g.total) + 'đ',
      totalP > 0 ? (g.total / totalP * 100).toFixed(1) + '%' : '0%',
    ]),
    styles: { ...tableFont, fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [185, 28, 28], textColor: COLOR.white, fontStyle: 'bold', halign: 'center', fontSize: 8 },
    columnStyles: { 0: { cellWidth: 40 }, 1: { halign: 'center' }, 2: { halign: 'right', fontStyle: 'bold' }, 3: { halign: 'center' } },
    alternateRowStyles: { fillColor: [254, 242, 242] },
    margin: { left: 14, right: 14 },
    theme: 'grid',
  });

  drawFooter(doc);
  doc.save(`BaoCao_CongNoRong_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT 3: P&L (LÃI LỖ) REPORT
// ═══════════════════════════════════════════════════════════════════════════════
export async function exportPnLPDF(pnlData, dateRange = {}) {
  const fonts = await loadVietnameseFont();
  const doc = new jsPDF('portrait', 'mm', 'a4');
  registerFont(doc, fonts);
  const pageW = doc.internal.pageSize.getWidth();
  const rangeText = dateRange.startDate && dateRange.endDate
    ? `Từ ${fmtDate(dateRange.startDate)} đến ${fmtDate(dateRange.endDate)}`
    : 'Toàn bộ thời gian';
  let y = drawHeader(doc, 'BÁO CÁO LÃI LỖ (P&L)', rangeText);

  y = sectionTitle(doc, y, '  KẾT QUẢ KINH DOANH');

  const pnlItems = [
    { label: 'Doanh thu thuần', value: pnlData?.revenue, type: 'income' },
    { label: '(-) Giá vốn hàng bán (COGS)', value: pnlData?.cogs, type: 'expense' },
    { label: 'LỢI NHUẬN GỘP', value: pnlData?.grossProfit, type: 'result', margin: pnlData?.grossMargin },
    { label: '(-) Chi phí hoạt động (OPEX)', value: pnlData?.opex, type: 'expense' },
    { label: 'LỢI NHUẬN RÒNG', value: pnlData?.netProfit, type: 'final', margin: pnlData?.netMargin },
  ];

  autoTable(doc, {
    startY: y,
    head: [['Khoản mục', 'Số tiền (đ)', 'Ghi chú']],
    body: pnlItems.map(item => {
      const val = item.value || 0;
      const prefix = item.type === 'expense' ? '- ' : (item.type === 'income' ? '+ ' : '');
      return [
        item.label,
        prefix + fmt(Math.abs(val)) + 'đ',
        item.margin !== undefined ? `Biên LN: ${item.margin}%` : '',
      ];
    }),
    styles: { ...tableFont, fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: COLOR.primaryDk, textColor: COLOR.white, fontStyle: 'bold', fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 85 },
      1: { halign: 'right', fontStyle: 'bold', cellWidth: 55 },
      2: { halign: 'center', fontSize: 7, textColor: COLOR.gray },
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { left: 14, right: 14 },
    theme: 'grid',
    didParseCell: (data) => {
      if (data.section === 'body') {
        const item = pnlItems[data.row.index];
        if (item?.type === 'result' || item?.type === 'final') {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = item.type === 'final' ? COLOR.primaryDk : [229, 231, 235];
          data.cell.styles.textColor = item.type === 'final' ? COLOR.white : COLOR.black;
        }
        if (data.column.index === 1 && item?.type === 'expense') {
          data.cell.styles.textColor = [185, 28, 28];
        }
        if (data.column.index === 1 && item?.type === 'income') {
          data.cell.styles.textColor = COLOR.primaryDk;
        }
      }
    },
  });

  y = doc.lastAutoTable.finalY + 10;

  if (pnlData?.byCategory && pnlData.byCategory.length > 0) {
    if (y + 30 > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      y = drawHeader(doc, 'BÁO CÁO LÃI LỖ (P&L)', rangeText);
    }

    y = sectionTitle(doc, y, '  CHI TIẾT THEO DANH MỤC');
    const groupLabels = { revenue: 'Doanh thu', cogs: 'COGS', opex: 'OPEX', other: 'Khác' };
    autoTable(doc, {
      startY: y,
      head: [['Danh mục', 'Nhóm', 'Loại', 'Số tiền (đ)']],
      body: pnlData.byCategory.map(c => [
        c.categoryName || 'Không phân loại',
        groupLabels[c.group] || c.group || '—',
        c.type === 'income' ? 'Thu' : 'Chi',
        (c.type === 'income' ? '+' : '-') + fmt(c.total) + 'đ',
      ]),
      styles: { ...tableFont, fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: COLOR.primaryDk, textColor: COLOR.white, fontStyle: 'bold', fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 65 }, 1: { halign: 'center', cellWidth: 30 },
        2: { halign: 'center', cellWidth: 20 }, 3: { halign: 'right', fontStyle: 'bold' },
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: 14, right: 14 },
      theme: 'grid',
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          data.cell.styles.textColor = data.cell.raw.startsWith('+') ? COLOR.primaryDk : [185, 28, 28];
        }
        if (data.section === 'body' && data.column.index === 2) {
          data.cell.styles.textColor = data.cell.raw === 'Thu' ? COLOR.primaryDk : [185, 28, 28];
        }
      },
    });
  }

  drawFooter(doc);
  doc.save(`BaoCao_LaiLo_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT 4: FULL COMPREHENSIVE REPORT (ALL-IN-ONE)
// ═══════════════════════════════════════════════════════════════════════════════
export async function exportFullReportPDF({ cashflow, netDebt, pnl, cashflowDays, groupBy, pnlRange }) {
  const fonts = await loadVietnameseFont();
  const doc = new jsPDF('portrait', 'mm', 'a4');
  registerFont(doc, fonts);
  const pageW = doc.internal.pageSize.getWidth();

  // ── COVER PAGE ─────────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();

  doc.setFillColor(...COLOR.primaryDk);
  doc.rect(0, 0, pageW, pageH, 'F');

  doc.setFillColor(...COLOR.primary);
  doc.rect(0, pageH * 0.6, pageW, 4, 'F');

  doc.setTextColor(...COLOR.white);
  doc.setFontSize(36);
  doc.setFont('Roboto', 'bold');
  doc.text('IN QUANG PHÁT', pageW / 2, pageH * 0.3, { align: 'center' });

  doc.setDrawColor(...COLOR.primary);
  doc.setLineWidth(0.5);
  doc.line(pageW * 0.25, pageH * 0.34, pageW * 0.75, pageH * 0.34);

  doc.setFontSize(20);
  doc.setFont('Roboto', 'bold');
  doc.text('BÁO CÁO TÀI CHÍNH TỔNG HỢP', pageW / 2, pageH * 0.42, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('Roboto', 'normal');
  doc.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, pageW / 2, pageH * 0.48, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(200, 230, 210);
  doc.setFont('Roboto', 'bold');
  const tocY = pageH * 0.65;
  doc.text('NỘI DUNG BÁO CÁO', pageW / 2, tocY, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('Roboto', 'normal');
  const tocItems = [
    '1. Tổng quan Dòng tiền',
    '2. Phân tích Công nợ ròng',
    '3. Báo cáo Lãi Lỗ (P&L)',
    '4. Chi tiết theo Danh mục',
  ];
  tocItems.forEach((item, i) => {
    doc.text(item, pageW / 2, tocY + 10 + i * 8, { align: 'center' });
  });

  doc.setFontSize(7);
  doc.setTextColor(120, 180, 150);
  doc.text('TÀI LIỆU NỘI BỘ — KHÔNG PHÁT TÁN', pageW / 2, pageH - 20, { align: 'center' });

  // ── PAGE 2: CASHFLOW ───────────────────────────────────────────────────────
  doc.addPage('landscape');
  let y = drawHeader(doc, 'PHẦN 1: LƯU CHUYỂN TIỀN TỆ', `${cashflowDays || 30} ngày · Nhóm theo ${groupBy === 'month' ? 'tháng' : 'ngày'}`);
  const lPageW = doc.internal.pageSize.getWidth();

  const series = cashflow?.series || [];
  const totalIncome  = series.reduce((s, r) => s + (r.income || 0), 0);
  const totalExpense = series.reduce((s, r) => s + (r.expense || 0), 0);
  const totalNet     = totalIncome - totalExpense;

  const boxW = (lPageW - 28 - 18) / 4;
  statBox(doc, 14,               y, boxW, 'TỔNG THU VÀO',   fmt(totalIncome) + 'đ',  COLOR.greenBg, COLOR.primaryDk);
  statBox(doc, 14 + boxW + 6,    y, boxW, 'TỔNG CHI RA',    fmt(totalExpense) + 'đ', COLOR.redBg,   [185, 28, 28]);
  statBox(doc, 14 + (boxW+6)*2,  y, boxW, 'DÒNG TIỀN RÒNG', (totalNet >= 0 ? '+' : '') + fmt(totalNet) + 'đ',
    totalNet >= 0 ? COLOR.greenBg : COLOR.redBg, totalNet >= 0 ? COLOR.primaryDk : [185, 28, 28]);
  statBox(doc, 14 + (boxW+6)*3,  y, boxW, 'SỐ KỲ',         series.length.toString(), [243, 244, 246], COLOR.black);
  y += 30;

  y = sectionTitle(doc, y, '  CHI TIẾT DÒNG TIỀN');
  autoTable(doc, {
    startY: y,
    head: [['Ngày', 'Thu vào (đ)', 'Chi ra (đ)', 'Ròng (đ)', 'Tỷ lệ Thu/Chi']],
    body: series.map(s => {
      const net = (s.income || 0) - (s.expense || 0);
      const ratio = s.expense > 0 ? ((s.income || 0) / s.expense * 100).toFixed(0) + '%' : '—';
      return [s.date || '—', fmt(s.income), fmt(s.expense), (net >= 0 ? '+' : '') + fmt(net), ratio];
    }),
    styles: { ...tableFont, fontSize: 7.5, cellPadding: 2.5 },
    headStyles: { fillColor: COLOR.primaryDk, textColor: COLOR.white, fontStyle: 'bold', halign: 'center', fontSize: 7.5 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 28 },
      1: { halign: 'right', textColor: COLOR.primaryDk },
      2: { halign: 'right', textColor: [185, 28, 28] },
      3: { halign: 'right', fontStyle: 'bold' },
      4: { halign: 'center' },
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    foot: [[
      { content: 'TỔNG', styles: { fontStyle: 'bold', halign: 'center' } },
      { content: fmt(totalIncome), styles: { fontStyle: 'bold', halign: 'right', textColor: COLOR.primaryDk } },
      { content: fmt(totalExpense), styles: { fontStyle: 'bold', halign: 'right', textColor: [185, 28, 28] } },
      { content: (totalNet >= 0 ? '+' : '') + fmt(totalNet), styles: { fontStyle: 'bold', halign: 'right' } },
      '',
    ]],
    footStyles: { fillColor: [229, 231, 235], textColor: COLOR.black },
    margin: { left: 14, right: 14 },
    theme: 'grid',
  });

  // ── PAGE 3: NET DEBT ───────────────────────────────────────────────────────
  doc.addPage('portrait');
  y = drawHeader(doc, 'PHẦN 2: CÔNG NỢ RÒNG', 'Phân tích Phải thu & Phải trả');
  const pPageW = doc.internal.pageSize.getWidth();

  const totalR = netDebt?.totalReceivable || 0;
  const totalP = netDebt?.totalPayable || 0;
  const netD   = netDebt?.netDebt || 0;

  const bW = (pPageW - 28 - 12) / 3;
  statBox(doc, 14,       y, bW, 'PHẢI THU', fmt(totalR) + 'đ', COLOR.greenBg, COLOR.primaryDk);
  statBox(doc, 14+bW+6,  y, bW, 'PHẢI TRẢ', fmt(totalP) + 'đ', COLOR.redBg, [185, 28, 28]);
  statBox(doc, 14+(bW+6)*2, y, bW, 'CÔNG NỢ RÒNG', (netD >= 0 ? '+' : '') + fmt(netD) + 'đ',
    netD >= 0 ? COLOR.greenBg : COLOR.redBg, netD >= 0 ? COLOR.primaryDk : [185, 28, 28]);
  y += 30;

  const debtAgeLabels = {
    'current': 'Chưa đến hạn', '1-15': '1-15 ngày', '16-30': '16-30 ngày',
    '31-60': '31-60 ngày', '61-90': '61-90 ngày', 'over90': '>90 ngày',
  };

  y = sectionTitle(doc, y, '  PHẢI THU — THEO TUỔI NỢ');
  autoTable(doc, {
    startY: y,
    head: [['Nhóm', 'Số khoản', 'Tổng tiền (đ)', '%']],
    body: (netDebt?.receivableByAge || []).map(g => [
      debtAgeLabels[g._id] || g._id, g.count || 0, fmt(g.total) + 'đ',
      totalR > 0 ? (g.total / totalR * 100).toFixed(1) + '%' : '0%',
    ]),
    styles: { ...tableFont, fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: COLOR.primaryDk, textColor: COLOR.white, fontStyle: 'bold', halign: 'center', fontSize: 8 },
    columnStyles: { 0: { cellWidth: 40 }, 1: { halign: 'center' }, 2: { halign: 'right', fontStyle: 'bold' }, 3: { halign: 'center' } },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { left: 14, right: 14 },
    theme: 'grid',
  });
  y = doc.lastAutoTable.finalY + 10;

  y = sectionTitle(doc, y, '  PHẢI TRẢ — THEO TUỔI NỢ', [185, 28, 28]);
  autoTable(doc, {
    startY: y,
    head: [['Nhóm', 'Số khoản', 'Tổng tiền (đ)', '%']],
    body: (netDebt?.payableByAge || []).map(g => [
      debtAgeLabels[g._id] || g._id, g.count || 0, fmt(g.total) + 'đ',
      totalP > 0 ? (g.total / totalP * 100).toFixed(1) + '%' : '0%',
    ]),
    styles: { ...tableFont, fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [185, 28, 28], textColor: COLOR.white, fontStyle: 'bold', halign: 'center', fontSize: 8 },
    columnStyles: { 0: { cellWidth: 40 }, 1: { halign: 'center' }, 2: { halign: 'right', fontStyle: 'bold' }, 3: { halign: 'center' } },
    alternateRowStyles: { fillColor: [254, 242, 242] },
    margin: { left: 14, right: 14 },
    theme: 'grid',
  });

  // ── PAGE 4: P&L ────────────────────────────────────────────────────────────
  doc.addPage('portrait');
  const rangeText = pnlRange?.startDate && pnlRange?.endDate
    ? `Từ ${fmtDate(pnlRange.startDate)} đến ${fmtDate(pnlRange.endDate)}`
    : 'Toàn bộ thời gian';
  y = drawHeader(doc, 'PHẦN 3: LÃI LỖ (P&L)', rangeText);

  y = sectionTitle(doc, y, '  KẾT QUẢ KINH DOANH');

  const pnlItems = [
    { label: 'Doanh thu thuần', value: pnl?.revenue, type: 'income' },
    { label: '(-) Giá vốn hàng bán (COGS)', value: pnl?.cogs, type: 'expense' },
    { label: 'LỢI NHUẬN GỘP', value: pnl?.grossProfit, type: 'result', margin: pnl?.grossMargin },
    { label: '(-) Chi phí hoạt động (OPEX)', value: pnl?.opex, type: 'expense' },
    { label: 'LỢI NHUẬN RÒNG', value: pnl?.netProfit, type: 'final', margin: pnl?.netMargin },
  ];

  autoTable(doc, {
    startY: y,
    head: [['Khoản mục', 'Số tiền (đ)', 'Ghi chú']],
    body: pnlItems.map(item => {
      const val = item.value || 0;
      const prefix = item.type === 'expense' ? '- ' : (item.type === 'income' ? '+ ' : '');
      return [
        item.label,
        prefix + fmt(Math.abs(val)) + 'đ',
        item.margin !== undefined ? `Biên LN: ${item.margin}%` : '',
      ];
    }),
    styles: { ...tableFont, fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: COLOR.primaryDk, textColor: COLOR.white, fontStyle: 'bold', fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 85 },
      1: { halign: 'right', fontStyle: 'bold', cellWidth: 55 },
      2: { halign: 'center', fontSize: 7, textColor: COLOR.gray },
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { left: 14, right: 14 },
    theme: 'grid',
    didParseCell: (data) => {
      if (data.section === 'body') {
        const item = pnlItems[data.row.index];
        if (item?.type === 'result' || item?.type === 'final') {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = item.type === 'final' ? COLOR.primaryDk : [229, 231, 235];
          data.cell.styles.textColor = item.type === 'final' ? COLOR.white : COLOR.black;
        }
        if (data.column.index === 1 && item?.type === 'expense') {
          data.cell.styles.textColor = [185, 28, 28];
        }
        if (data.column.index === 1 && item?.type === 'income') {
          data.cell.styles.textColor = COLOR.primaryDk;
        }
      }
    },
  });

  y = doc.lastAutoTable.finalY + 10;

  // Category breakdown
  if (pnl?.byCategory && pnl.byCategory.length > 0) {
    const pageH2 = doc.internal.pageSize.getHeight();
    if (y + 30 > pageH2 - 30) {
      doc.addPage('portrait');
      y = drawHeader(doc, 'PHẦN 3: LÃI LỖ (P&L) — Tiếp', rangeText);
    }

    y = sectionTitle(doc, y, '  CHI TIẾT THEO DANH MỤC');
    const groupLabels = { revenue: 'Doanh thu', cogs: 'COGS', opex: 'OPEX', other: 'Khác' };
    autoTable(doc, {
      startY: y,
      head: [['Danh mục', 'Nhóm', 'Loại', 'Số tiền (đ)']],
      body: pnl.byCategory.map(c => [
        c.categoryName || 'Không phân loại',
        groupLabels[c.group] || c.group || '—',
        c.type === 'income' ? 'Thu' : 'Chi',
        (c.type === 'income' ? '+' : '-') + fmt(c.total) + 'đ',
      ]),
      styles: { ...tableFont, fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: COLOR.primaryDk, textColor: COLOR.white, fontStyle: 'bold', fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 60 }, 1: { halign: 'center', cellWidth: 30 },
        2: { halign: 'center', cellWidth: 20 }, 3: { halign: 'right', fontStyle: 'bold' },
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: 14, right: 14 },
      theme: 'grid',
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          data.cell.styles.textColor = data.cell.raw.startsWith('+') ? COLOR.primaryDk : [185, 28, 28];
        }
      },
    });
  }

  drawFooter(doc);
  doc.save(`BaoCao_TaiChinh_TongHop_${new Date().toISOString().slice(0, 10)}.pdf`);
}
