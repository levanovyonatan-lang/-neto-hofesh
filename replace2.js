const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
content = content.replace('placeholder="הכנס שם כאן..."', 'placeholder="הכנס שם כאן... (מומלץ עם אימוג\'י)"');
fs.writeFileSync('index.html', content, 'utf8');
console.log("Done");
