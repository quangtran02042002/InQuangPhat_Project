const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'seedNews.js');
let content = fs.readFileSync(seedPath, 'utf8');

// Replace all non-breaking spaces with normal spaces
const originalLength = content.length;
content = content.replace(/\u00A0/g, ' ');

fs.writeFileSync(seedPath, content, 'utf8');
console.log('Fixed non-breaking spaces in seedNews.js!');
