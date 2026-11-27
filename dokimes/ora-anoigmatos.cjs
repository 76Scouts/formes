// Δοκιμή συμπεριφοράς (CDPS-76/6/20, σελίδα): η σελίδα κρατά το «ora» που της δίνει ο σέρβερ και το στέλνει πίσω.
// Όλα τα σενάρια καταλήγουν στο ίδιο: ο γονέας βλέπει ΠΑΝΤΑ το ίδιο ευχαριστήριο· καμία διαφορά στην οθόνη.
const { chromium } = require('playwright'); const fs = require('fs');
const ENG = fs.readFileSync(process.argv[2] || 'formes-michani.js', 'utf8');
const API = 'https://api.test/forms-submit';
const F1 = { slug: 'dokimi', titlos: 'Δοκιμή', ekdosi: 1, selides: [{ titlos: 'Στοιχεία', pedia: [
  { key: 'onoma', typos: 'keimeno', label: 'Όνομα', ypoxreotiko: true }] }] };
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('✗ ' + m); } else console.log('✓ ' + m); };
(async () => {
  for (const pou of ['arxiko', 'neos-orismos', 'chorís-ora']) {
    const b = await chromium.launch(), p = await b.newPage(); const posts = [];
    await p.route(API + '**', async (r) => {
      const q = r.request(), h = { 'content-type': 'application/json', 'access-control-allow-origin': '*' };
      if (q.method() === 'OPTIONS') return r.fulfill({ status: 204, headers: { ...h, 'access-control-allow-headers': 'content-type' } });
      if (q.method() === 'GET') {
        const ora = pou === 'chorís-ora' ? {} : { ora: 'T1.' + 'a'.repeat(64) };
        if (/orismos=1/.test(q.url())) return r.fulfill({ status: 200, headers: h, body: JSON.stringify({ anoikti: true, ekdosi: 2, orismos: F1, ...(pou === 'neos-orismos' ? { ora: 'T2.' + 'b'.repeat(64) } : {}) }) });
        return r.fulfill({ status: 200, headers: h, body: JSON.stringify({ anoikti: true, ...ora }) });
      }
      const body = JSON.parse(q.postData()); posts.push(body);
      if (pou === 'neos-orismos' && posts.length === 1) return r.fulfill({ status: 409, headers: h, body: JSON.stringify({ error: 'x', nea_ekdosi: true, ekdosi: 2 }) });
      return r.fulfill({ status: 200, headers: h, body: '{"ok":true}' });
    });
    await p.setContent('<div id="forma"></div><script>window.FORMA=' + JSON.stringify(F1) + ';window.FORMES_API="' + API + '"</script>');
    await p.addScriptTag({ content: ENG });
    await p.waitForTimeout(300);
    await p.fill('#p_onoma', 'Μαρία'); await p.click('.f-epomeno');
    if (pou === 'neos-orismos') { await p.waitForSelector('.f-sfalma'); await p.click('.f-epomeno'); }
    await p.waitForSelector('.f-efxaristo');
    const last = posts[posts.length - 1];
    if (pou === 'arxiko') ok(last.ora === 'T1.' + 'a'.repeat(64), '[' + pou + '] η υποβολή στέλνει το «ora» που ήρθε στο πρώτο GET');
    if (pou === 'neos-orismos') ok(last.ora === 'T2.' + 'b'.repeat(64), '[' + pou + '] μετά από νέο ορισμό στέλνεται το ΝΕΟ «ora»');
    if (pou === 'chorís-ora') ok(!('ora' in last), '[' + pou + '] χωρίς «ora» από τον σέρβερ δεν στέλνεται τίποτα (κανονική ροή)');
    ok('istoselida' in last && last.istoselida === '', '[' + pou + '] το κρυφό πεδίο στέλνεται κενό για άνθρωπο');
    ok((await p.textContent('.f-efxaristo')).length > 5, '[' + pou + '] ο γονέας βλέπει κανονικό ευχαριστήριο');
    await b.close();
  }
  // το κρυφό πεδίο: εκτός οθόνης, όχι display:none, aria-hidden
  const b = await chromium.launch(), p = await b.newPage();
  await p.route(API + '**', r => r.fulfill({ status: 200, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }, body: '{"anoikti":true}' }));
  await p.setContent('<style>' + fs.readFileSync('formes-emfanisi.css', 'utf8') + '</style><div id="forma"></div><script>window.FORMA=' + JSON.stringify(F1) + ';window.FORMES_API="' + API + '"</script>');
  await p.addScriptTag({ content: ENG });
  await p.waitForSelector('.f-ist', { state: 'attached' });
  const w = p.locator('.f-ist'); const bx = await w.evaluate(e => { const r = e.getBoundingClientRect(); return { x: r.x }; });
  ok(await w.count() === 1 && bx.x < -1000, 'το κρυφό πεδίο είναι εκτός οθόνης');
  ok(await w.getAttribute('aria-hidden') === 'true' && await p.getAttribute('#istoselida', 'tabindex') === '-1' && await p.getAttribute('#istoselida', 'autocomplete') === 'off', 'aria-hidden, tabindex -1, autocomplete off');
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.f-ist')).display !== 'none'), 'όχι display:none (οι ρομπότ το συμπληρώνουν)');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
