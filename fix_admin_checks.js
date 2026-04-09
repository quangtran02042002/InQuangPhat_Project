const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend/src/screens/admin');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

let changed = 0;
files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.match(/if \(!userInfo \|\| !userInfo\.isAdmin\) \{/)) {
    content = content.replace(/if \(!userInfo \|\| !userInfo\.isAdmin\) \{/g, 'if (!userInfo) {');
    fs.writeFileSync(filePath, content, 'utf8');
    changed++;
    console.log('Fixed', file);
  }
});

console.log('Done replacing isAdmin checks in useEffects. Changed files:', changed);
