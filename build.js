// Genera il bookmarklet (bookmarklet.txt) e la pagina di installazione (index.html)
// a partire da src/youmath-pdf.js.  Uso:  npm install && npm run build
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

(async () => {
  const src = fs.readFileSync(path.join(__dirname, 'src/youmath-pdf.js'), 'utf8');
  const { code } = await minify(src, { compress: true, mangle: true });

  // Nei segnalibri il browser decodifica le sequenze %xx e tratta # come ancora:
  // vanno codificati perché il CSS contiene sia "100%" sia colori "#rrggbb".
  const bookmarklet = 'javascript:' + code.trim()
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/\n/g, ' ');

  fs.writeFileSync(path.join(__dirname, 'bookmarklet.txt'), bookmarklet + '\n');

  const attr = bookmarklet.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const tpl = fs.readFileSync(path.join(__dirname, 'site/index.template.html'), 'utf8');
  fs.writeFileSync(path.join(__dirname, 'index.html'), tpl.split('{{BOOKMARKLET}}').join(attr));

  console.log('bookmarklet.txt e index.html generati (' + bookmarklet.length + ' caratteri)');
})();
