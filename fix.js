const fs = require('fs');
let content = fs.readFileSync('D:/Projects/global-cnc/js/products-data.js', 'utf8');
content = content.replace(/\"series\": \".*?A64i\"/, '\"series\": \"α A64i\"');
fs.writeFileSync('D:/Projects/global-cnc/js/products-data.js', content, 'utf8');
