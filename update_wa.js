const fs = require('fs');
const text = `מצאתי את הקייטנה הכי שווה לקיץ🤩 
אני ממש רוצה ללכת, בבקשה תרשמו אותי!
הנה הלינק לפרטים: https://www.funkid-k.com/קייטנת-אקשן-עם-אביגיל/`;
const encoded = encodeURIComponent(text);
let html = fs.readFileSync('avigail-camp.html', 'utf8');
html = html.replace(/https:\/\/wa\.me\/\?text=[^"]+/, 'https://wa.me/?text=' + encoded);
fs.writeFileSync('avigail-camp.html', html);
console.log("Updated!");
