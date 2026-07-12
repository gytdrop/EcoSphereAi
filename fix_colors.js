const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

walk('ecosphere-frontend/src', function(filePath) {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace rgba(255,255,255, alpha) with rgba(0,0,0, alpha)
    content = content.replace(/rgba\(255,\s*255,\s*255,\s*([0-9.]+)\)/g, 'rgba(0,0,0,$1)');
    // Replace #FFFFFF with #111827 (text-primary)
    content = content.replace(/#FFFFFF/g, '#111827');
    content = content.replace(/#ffffff/g, '#111827');
    // Replace #fff with #111827
    content = content.replace(/#fff/gi, '#111827');
    // Replace border white colors
    content = content.replace(/border:\s*'1px solid rgba\(0,0,0,0\.1\)'/g, "border: '1px solid var(--border)'");
    
    fs.writeFileSync(filePath, content);
  }
});
console.log('Fixed all hardcoded white colors!');
