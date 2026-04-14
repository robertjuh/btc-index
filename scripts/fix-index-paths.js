const fs = require('fs');
const base = '/btc-index/';
const indexPath = 'dist/btc-index/index.html';

let html = fs.readFileSync(indexPath, 'utf8');

// Make script src absolute (skip anything already starting with / or http)
html = html.replace(/\bsrc="(?!\/|https?:\/\/)([^"]+)"/g, `src="${base}$1"`);

// Make stylesheet link href absolute (skip absolute/external URLs)
html = html.replace(/\bhref="(?!\/|https?:\/\/)([^"]+\.css)"/g, `href="${base}$1"`);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Paths fixed in', indexPath);
