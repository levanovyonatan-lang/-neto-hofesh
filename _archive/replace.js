const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
content = content.replace(/<div style="text-align: right; margin-bottom: 25px;">.*?<input type="hidden" id="custom-emoji" value="[^"]+">\s*<\/div>/s, '<input type="hidden" id="custom-emoji" value="🎯">');
fs.writeFileSync('index.html', content, 'utf8');
