const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'seedNews.js');
let content = fs.readFileSync(seedPath, 'utf8');

// Replace the old tableHead function
const oldTableHead = `// HELPER: Tạo bảng HTML styled
const tableHead = (cols) => \`
<table style="width:100%; border-collapse:collapse; margin: 24px 0; font-size:15px;">
  <thead>
    <tr style="background-color:#E6F0ED;">
      \${cols.map(c => \`<th style="padding:12px 16px; text-align:left; border-bottom:2px solid #006B4D; font-weight:700;">\${c}</th>\`).join('')}
    </tr>
  </thead>
  <tbody>\`;
const tableRow = (cells, isLast = false) =>
  \`<tr>\${cells.map(c => \`<td style="padding:10px 16px;\${isLast ? '' : ' border-bottom:1px solid #eee;'}">\${c}</td>\`).join('')}</tr>\`;
const tableEnd = \`</tbody></table>\`;`;

const newTableHead = `// HELPER: Tạo bảng HTML styled - Premium version
const tableHead = (cols) => \`
<div style="overflow:hidden; border-radius:14px; box-shadow:0 4px 20px rgba(0,107,77,0.12); margin:28px 0; border:1px solid rgba(0,107,77,0.18);">
<table style="width:100%; border-collapse:collapse; font-size:14.5px;">
  <thead>
    <tr style="background:linear-gradient(90deg,#005a3f 0%,#008a5a 100%);">
      \${cols.map(c => \`<th style="padding:15px 20px; text-align:left; color:#ffffff; font-weight:700; letter-spacing:0.04em; font-size:12.5px; text-transform:uppercase;">\${c}</th>\`).join('')}
    </tr>
  </thead>
  <tbody>\`;
const tableRow = (cells, isLast = false, rowIndex = 0) =>
  \`<tr style="background-color:\${isLast ? '#f0fdfb' : (rowIndex % 2 === 0 ? '#ffffff' : '#f8fdfb')}; border-bottom:\${isLast ? 'none' : '1px solid #e2f0ea'}; transition:background .2s;">
   \${cells.map((c, i) => \`<td style="padding:13px 20px; color:#374151; line-height:1.55; \${i === 0 ? 'font-weight:700; color:#006B4D;' : ''}">\${c}</td>\`).join('')}
   </tr>\`;
const tableEnd = \`</tbody></table></div>\`;`;

if (content.includes('// HELPER: Tạo bảng HTML styled')) {
    // Find and replace the block
    const startIdx = content.indexOf('// HELPER: Tạo bảng HTML styled');
    const endIdx = content.indexOf('const tableEnd = `</tbody></table>`;', startIdx);
    if (endIdx > -1) {
        const endOfLine = content.indexOf('\n', endIdx) + 1;
        content = content.slice(0, startIdx) + newTableHead + '\n' + content.slice(endOfLine);
        fs.writeFileSync(seedPath, content, 'utf8');
        console.log('✅ Successfully upgraded table styling in seedNews.js');
    } else {
        console.log('Could not find tableEnd marker. Manual fix needed.');
        console.log('Search snippet:', content.substring(startIdx, startIdx + 400));
    }
} else {
    console.log('Could not find start marker.');
}
