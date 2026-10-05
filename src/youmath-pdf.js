/* YouMath → PDF — sorgente leggibile del bookmarklet. Build: npm run build
 *
 * 1. copia solo l'articolo e lo ripulisce;
 * 2. lo apre in una nuova finestra con un proprio foglio di stile;
 * 3. lo impagina da sé in pagine A4 (margini, intestazione, numeri di pagina,
 *    titoli legati al testo, grafici senza buchi, tabella intera), così il
 *    risultato non dipende dalle impostazioni della finestra di stampa.
 */
(() => {
  const src = document.querySelector('article.hey_inf_scr_content') || document.querySelector('main article') || document.querySelector('article');
  if (!src) { alert('Nessun articolo trovato in questa pagina.'); return; }
  const c = src.cloneNode(true);
  const $$ = (s, r) => [...(r || c).querySelectorAll(s)];
  const txt = e => (e.textContent || '').replace(/\s+/g, ' ').trim();
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

  /* ---------- 1. metadati e pulizia ---------- */
  const h1 = c.querySelector('h1');
  const title = h1 ? txt(h1) : document.title;
  const tm = c.querySelector('time');
  const date = tm ? txt(tm) : '';
  const au = c.querySelector('a[href*="staff-e-collaboratori/"]');
  const author = au ? txt(au) : '';
  const url = location.href.split('#')[0];

  $$('header,nav,script,iframe,ins,noscript,[id^="C_"],[id^="D_"],img.zmnavi,hr').forEach(e => e.remove());
  $$('p').forEach(p => {
    const t = txt(p), st = p.getAttribute('style') || '';
    if (/^(Tags:|Ultima modifica)/.test(t) || /^[.\s]+$/.test(t) || /text-align:\s*right/.test(st) || (!t && !p.querySelector('img'))) p.remove();
  });
  $$('img').forEach(i => {
    i.setAttribute('src', i.src);
    ['loading', 'decoding', 'style', 'title', 'data-itemprop'].forEach(a => i.removeAttribute(a));
  });
  $$('a').forEach(a => a.setAttribute('href', a.href));

  /* tabella a 3 colonne (voce | goniometriche | iperboliche) → griglia a confronto */
  $$('table').forEach(t => {
    const rows = $$('tr', t);
    if (!rows.length || rows[0].children.length !== 3) return;
    const head = [...rows[0].children].map(txt);
    const box = document.createElement('div');
    box.className = 'cmp';
    box.innerHTML = '<div class="cmp-head"><span class="c">' + esc(head[1]) + '</span><span class="c">' + esc(head[2]) + '</span></div>';
    rows.slice(1).forEach(r => {
      const td = [...r.children];
      if (td.length !== 3) return;
      const s = document.createElement('section');
      s.className = 'cmp-row';
      s.innerHTML = '<h4>' + esc(txt(td[0])) + '</h4>';
      const pair = document.createElement('div');
      pair.className = 'pair';
      [1, 2].forEach(k => {
        const col = document.createElement('div');
        col.innerHTML = '<span class="tag">' + esc(head[k]) + '</span>';
        $$('img', td[k]).forEach(i => col.appendChild(i));
        pair.appendChild(col);
      });
      s.appendChild(pair);
      box.appendChild(s);
    });
    t.replaceWith(box);
  });

  /* "Seno iperbolico" ecc. (paragrafo fatto solo di grassetto) → h3 */
  $$('p').forEach(p => {
    const s = p.firstElementChild;
    if (p.children.length === 1 && s.tagName === 'STRONG' && txt(s) === txt(p)) {
      const h = document.createElement('h3');
      h.textContent = txt(p);
      p.replaceWith(h);
    }
  });

  /* grafici + didascalia → figure; formule da sole → equazioni centrate */
  $$('p').forEach(p => {
    if (!c.contains(p)) return;
    const imgs = $$('img', p);
    if (!imgs.length || txt(p)) return;
    if (imgs.every(i => i.classList.contains('ltximg'))) { p.className = 'eq'; return; }
    const f = document.createElement('figure');
    imgs.forEach(i => f.appendChild(i));
    const n = p.nextElementSibling;
    if (n && n.tagName === 'P' && /center/.test(n.getAttribute('style') || '') && !n.querySelector('img')) {
      const cap = document.createElement('figcaption');
      cap.innerHTML = n.innerHTML.replace(/<br\s*\/?>/gi, ' ');
      n.remove();
      f.appendChild(cap);
    }
    p.replaceWith(f);
  });

  $$('[style]').forEach(e => e.removeAttribute('style'));
  $$('span').forEach(s => { if (!s.attributes.length) s.replaceWith(...s.childNodes); });
  $$('table').forEach(t => { t.removeAttribute('border'); t.removeAttribute('cellpadding'); t.className = 'tbl'; });

  /* ---------- 2. finestra di anteprima ---------- */
  const meta = [author, date ? 'aggiornata il ' + date : ''].filter(Boolean).map(esc).join(' · ');
  const css = `
@page{size:A4;margin:0}
:root{--ink:#1c1c20;--muted:#6a6a72;--accent:#19245b;--warm:#b85300;--rule:#d6d6dc;--soft:#f6f5f2}
*{box-sizing:border-box}
html,body{margin:0}
body{background:#d9dade;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.bar{position:sticky;top:0;z-index:5;display:flex;gap:16px;align-items:center;justify-content:center;padding:10px 16px;background:#2b2c33;color:#e7e7ec;font:13px/1.4 system-ui,sans-serif}
.bar b{font-weight:600}
.bar button{font:600 13px system-ui,sans-serif;background:#fff;color:#19245b;border:0;border-radius:6px;padding:8px 16px;cursor:pointer}
.bar button:disabled{opacity:.5;cursor:default}
#pages{padding:24px 0 48px}
.page{position:relative;width:210mm;height:297mm;margin:0 auto 18px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.18),0 6px 24px rgba(0,0,0,.08);overflow:hidden}
.run{position:absolute;left:20mm;right:20mm;top:9mm;display:flex;justify-content:space-between;padding-bottom:2mm;border-bottom:.3mm solid var(--rule);font:8pt/1 system-ui,sans-serif;letter-spacing:.04em;color:var(--muted)}
.folio{position:absolute;left:0;right:0;bottom:9mm;text-align:center;font:9pt/1 'Source Serif 4',Georgia,serif;color:var(--muted)}
.body{position:absolute;left:20mm;right:20mm;top:19mm;bottom:19mm}
.page.first .body{top:17mm}
.page.wide .body{left:13mm;right:13mm;top:16mm;bottom:17mm}
.page.wide .run{left:13mm;right:13mm}
.unit{display:flow-root}
.body>.unit:first-child>:first-child{margin-top:0!important}
#measure{position:absolute;left:-9999px;top:0;visibility:hidden}
#measure .body{position:static;width:170mm}
#measure .body.w{width:184mm}

.body{font:12pt/1.55 'Source Serif 4',Georgia,serif;color:var(--ink);hyphens:auto;-webkit-hyphens:auto;hyphenate-limit-chars:8 4 4;text-rendering:optimizeLegibility}
header.doc{margin:0 0 7mm;padding-bottom:4mm;border-bottom:.6mm solid var(--accent)}
header.doc .kick{font:600 8pt system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--warm)}
h1{font-size:25pt;line-height:1.12;margin:1.5mm 0 2.5mm;color:var(--accent);font-weight:700;hyphens:none}
header.doc .meta{font-size:9pt;line-height:1.45;color:var(--muted)}
header.doc .meta a{color:var(--muted);word-break:break-all}
h2{font-size:15pt;line-height:1.25;color:var(--accent);margin:7mm 0 3mm;padding-bottom:1.5mm;border-bottom:.3mm solid var(--rule);hyphens:none;font-weight:700}
h3{font-size:12.5pt;line-height:1.3;color:var(--warm);margin:5.5mm 0 1.5mm;hyphens:none;font-weight:700}
p{margin:0 0 2.6mm}
a{color:inherit;text-decoration:none}
strong{font-weight:700;color:var(--accent)}
img{image-rendering:auto}
img.ltximg{vertical-align:middle;margin:0 .07em}
img.ltxbtm{vertical-align:text-bottom}
p.eq{text-align:center;margin:3mm 0 3.5mm}
p.eq img{margin:0 .3em}
p:has(+ p.eq){margin-bottom:0}
p.eq:has(+ p.eq){margin-bottom:1.5mm}
p.eq + p.eq{margin-top:0}
figure{margin:3mm 0 4.5mm;text-align:center}
figure img{display:block;margin:0 auto;width:92mm;max-width:100%;height:auto}
figure img[width="544"]{width:110mm}
figcaption{font-size:9pt;line-height:1.4;color:var(--muted);font-style:italic;margin-top:1.5mm}

.cmp{margin:2.5mm 0 0;border-top:.6mm solid var(--accent);border-bottom:.6mm solid var(--accent)}
.cmp-head{display:grid;grid-template-columns:1fr 1fr;gap:6mm;padding:2mm 0;border-bottom:.3mm solid var(--accent);font:700 8pt system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}
.cmp-head .cont{font-weight:400;text-transform:none;letter-spacing:0;color:var(--muted)}
.cmp-row{padding:1.7mm 0 1.9mm;border-top:.25mm solid var(--rule)}
.cmp-head + .cmp-row{border-top:0}
.cmp-row h4{margin:0 0 .8mm;font:700 7.5pt system-ui,sans-serif;letter-spacing:.07em;text-transform:uppercase;color:var(--warm)}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:6mm;align-items:start}
.pair>div{min-width:0}
.pair>div+div{border-left:.3mm solid var(--rule);padding-left:6mm;margin-left:-3mm}
.pair img{display:block;max-width:100%;height:auto;margin:.6mm 0}
.tag{display:none;font:700 6.5pt system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:.5mm}
.pair.stack{grid-template-columns:1fr;gap:1.6mm}
.pair.stack .tag{display:block}
.pair.stack>div+div{border-left:0;padding-left:0;margin-left:0;border-top:.25mm dashed var(--rule);padding-top:1.4mm}
table.tbl{border-collapse:collapse;width:100%;table-layout:fixed;margin:2mm 0 4mm}
table.tbl td{border:.25mm solid var(--rule);padding:1.5mm;vertical-align:top}
table.tbl img{max-width:100%;height:auto}

@media print{
  body{background:#fff}
  .bar,#measure{display:none!important}
  #pages{padding:0}
  .page{margin:0;box-shadow:none;break-after:page;height:296.5mm}
  .page:last-child{break-after:auto}
}`;
  const html = '<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + esc(title) + '</title>' +
    '<link id="ff" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,700;1,8..60,400&display=block">' +
    '<style>' + css + '</style></head><body>' +
    '<div class="bar"><span id="st">Impaginazione in corso…</span><button id="pr" disabled onclick="print()">Salva come PDF</button></div>' +
    '<div id="measure"><div class="page"><div class="body"></div></div></div><div id="pages"></div>' +
    '<template id="src"><header class="doc"><div class="kick">YouMath</div><h1>' + esc(title) + '</h1><div class="meta">' +
    meta + (meta ? '<br>' : '') + '<a href="' + esc(url) + '">' + esc(url) + '</a></div></header>' + c.innerHTML + '</template>' +
    '</body></html>';

  const w = window.open('', '_blank');
  if (!w) { alert('Il browser ha bloccato la finestra: consenti i pop-up per questo sito e riprova.'); return; }
  w.document.open(); w.document.write(html); w.document.close();
  const d = w.document;
  const wait = (p, ms) => Promise.race([p, new Promise(r => setTimeout(r, ms))]);

  /* ---------- 3. impaginazione ---------- */
  const paginate = () => {
    const mBody = d.querySelector('#measure .body');
    const pagesEl = d.getElementById('pages');
    const MM = 96 / 25.4;
    const H = 259 * MM;                              /* altezza utile: 297mm − 19mm − 19mm */
    const HW = 264 * MM;                             /* pagina "larga" della tabella: 297 − 16 − 17 */
    const blocks = [...d.getElementById('src').content.cloneNode(true).children];
    const isHead = b => /^H[1-4]$/.test(b.tagName) || b.matches('header.doc');
    const isEq = b => b.matches('p.eq');

    /* blocchi → unità indivisibili: un titolo resta col blocco dopo,
       un paragrafo resta con la formula che introduce */
    const units = [];
    let cur = null;
    blocks.forEach((b, k) => {
      const next = blocks[k + 1];
      if (!cur) { cur = { els: [] }; units.push(cur); }
      cur.els.push(b);
      const sticky = next && (isHead(b) || (isEq(next) && b.tagName === 'P') || (isEq(b) && isEq(next))) && !next.matches('.cmp,figure');
      if (!sticky) cur = null;
    });

    const mk = u => {
      const el = d.createElement('div');
      el.className = 'unit';
      u.els.forEach(b => el.appendChild(b));
      u.el = el;
      u.fig = u.els.length === 1 && u.els[0].tagName === 'FIGURE';
      u.cmp = u.els.length === 1 && u.els[0].matches('.cmp');
      u.head = isHead(u.els[0]);
      return u;
    };
    /* si misura sempre dopo un blocco vuoto: così il margine superiore conta
       com'è a metà pagina (in cima alla pagina viene poi tolto con u.mt) */
    const stage = el => { mBody.innerHTML = '<div class="unit"></div>'; mBody.appendChild(el); };
    const measure = u => {
      stage(u.el);
      u.h = u.el.getBoundingClientRect().height / (parseFloat(u.el.style.zoom) || 1);
      const f = u.el.firstElementChild, l = u.el.lastElementChild;
      u.mt = parseFloat(w.getComputedStyle(f).marginTop) || 0;
      u.mb = parseFloat(w.getComputedStyle(l).marginBottom) || 0;
      return u;
    };

    /* tabella: colonne affiancate se le formule non vanno rimpicciolite troppo,
       altrimenti una sotto l'altra; poi intera in una pagina se possibile */
    /* zoom che fa stare el in Hmax (con lo zoom le colonne si allargano, quindi si ricalcola) */
    const fit = (el, Hmax) => {
      el.style.zoom = '';
      const h0 = el.getBoundingClientRect().height;
      if (h0 <= Hmax) return 1;
      let z = Hmax / h0;
      for (let t = 0; t < 8; t++) {
        el.style.zoom = z;
        const real = el.getBoundingClientRect().height;
        if (real <= Hmax) break;
        z *= Hmax / real * 0.995;
      }
      return z;
    };

    const fixCmp = u => {
      mBody.classList.add('w');
      stage(u.el);
      u.el.querySelectorAll('.pair').forEach(p => {
        const col = p.lastElementChild, cs = w.getComputedStyle(col);
        const colW = col.getBoundingClientRect().width - parseFloat(cs.paddingLeft);
        const maxW = Math.max(0, ...[...p.querySelectorAll('img')].map(i => +i.getAttribute('width') || i.naturalWidth));
        if (maxW && colW / maxW < 0.8) p.classList.add('stack');
      });
      measure(u);
      u.wide = true;
      let out = [u];
      if (u.h > HW) {
        const z = fit(u.el, HW);
        if (z >= 0.85) { u.h = HW; u.mt = u.mb = 0; }
        else {
          /* troppo alta anche così: si divide per righe, ripetendo l'intestazione */
          out = [];
          const box = u.els[0], head = box.querySelector('.cmp-head');
          const rows = [...box.querySelectorAll('.cmp-row')];
          let part = null, k = 0;
          const start = () => {
            const b = d.createElement('div'); b.className = 'cmp';
            const h = head.cloneNode(true);
            if (k++) h.lastElementChild.insertAdjacentHTML('beforeend', ' <span class="cont">(continua)</span>');
            b.appendChild(h);
            part = mk({ els: [b] }); part.wide = true;
            stage(part.el);
            out.push(part);
          };
          start();
          rows.forEach(r => {
            part.els[0].appendChild(r);
            if (part.el.getBoundingClientRect().height > HW && part.els[0].querySelectorAll('.cmp-row').length > 1) {
              r.remove(); measure(part); start(); part.els[0].appendChild(r);
            }
          });
          measure(part);
        }
      }
      mBody.classList.remove('w');
      return out;
    };

    let U = [];
    units.forEach(u => { mk(u); U = U.concat(u.cmp ? fixCmp(u) : [measure(u)]); });
    mBody.innerHTML = '';

    /* distribuzione nelle pagine */
    const pages = [];
    let page, rem;
    const newPage = wide => {
      page = d.createElement('section');
      page.className = 'page' + (pages.length ? '' : ' first') + (wide ? ' wide' : '');
      page.innerHTML = (pages.length ? '<div class="run"><span>' + esc(title) + '</span><span>youmath.it</span></div>' : '') +
        '<div class="body"></div><div class="folio"></div>';
      pagesEl.appendChild(page);
      pages.push(page);
      rem = wide ? HW : H;
    };
    const empty = () => !page.querySelector('.body').children.length;
    const need = u => u.h - (empty() ? u.mt : 0) - u.mb;
    const put = (u, z) => {
      const e = empty();
      if (z && z < 1) u.el.style.zoom = z;
      page.querySelector('.body').appendChild(u.el);
      rem -= (u.h - (e ? u.mt : 0)) * (z || 1);
      u.done = true;
    };
    newPage();
    for (let i = 0; i < U.length; i++) {
      const u = U[i];
      if (u.done) continue;
      const pw = page.classList.contains('wide');
      if (u.wide) {                       /* la tabella sta su una pagina tutta sua, più larga */
        if (!pw || !empty()) newPage(true);
        put(u);
        continue;
      }
      if (pw) { newPage(); i--; continue; }   /* dopo la tabella si torna alle pagine normali */
      const nx = U[i + 1];
      if (nx && nx.wide && !u.head && !empty() && need(u) > rem + 0.5) {
        /* il paragrafo che introduce la tabella non resta da solo su una pagina: va sopra la tabella */
        newPage(true); put(u);
        page.querySelector('.body').appendChild(nx.el); nx.done = true;
        fit(nx.el, HW - u.el.getBoundingClientRect().height);
        continue;
      }
      if (need(u) <= rem + 0.5) { put(u); continue; }
      if (empty()) { put(u, Math.max(0.6, rem / need(u))); continue; }   // più alta di una pagina intera
      if (u.fig) {
        const z = rem / need(u);
        if (z >= 0.72) { put(u, z); continue; }                          // si stringe un poco e ci sta
        /* il grafico passa alla pagina dopo: il testo che segue (stessa sezione) riempie il vuoto */
        for (let j = i + 1; j < U.length; j++) {
          const v = U[j];
          if (v.head || v.fig || v.cmp || need(v) > rem + 0.5) break;
          put(v);
        }
      }
      newPage();
      i--;                                                                 // riprova lo stesso blocco sulla pagina nuova
    }
    pages.forEach((p, k) => { p.querySelector('.folio').textContent = (k + 1) + ' / ' + pages.length; });
    d.getElementById('measure').remove();
    return pages.length;
  };

  /* ---------- 4. attesa di font e immagini, poi impagina e stampa ---------- */
  (async () => {
    const link = d.getElementById('ff');
    await wait(new Promise(r => { if (link.sheet) r(); link.onload = link.onerror = r; }), 5000);
    try { await wait(Promise.all(['400 16px "Source Serif 4"', '700 16px "Source Serif 4"', 'italic 400 16px "Source Serif 4"'].map(f => d.fonts.load(f))), 5000); } catch (e) {}
    const imgs = [...d.getElementById('src').content.querySelectorAll('img')].map(i => i.getAttribute('src'));
    await wait(Promise.all(imgs.map(s => new Promise(r => { const im = new w.Image(); im.onload = im.onerror = r; im.src = s; }))), 20000);
    let n = 0;
    try { n = paginate(); } catch (e) { d.getElementById('st').textContent = 'Errore di impaginazione: ' + e.message; throw e; }
    const st = d.getElementById('st'), pr = d.getElementById('pr');
    st.innerHTML = '<b>' + n + ' pagine A4</b> pronte. Nella finestra di stampa scegli “Salva come PDF”.';
    pr.disabled = false;
    setTimeout(() => w.print(), 500);
  })();
})();
