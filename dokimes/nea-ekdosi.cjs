// Δοκιμή συμπεριφοράς (27/11/2026): ξαναδημοσίευση όσο ο γονέας συμπληρώνει — δεν χάνει ό,τι έγραψε.
const { chromium } = require('playwright'); const fs = require('fs');
const ENG = fs.readFileSync(process.argv[2] || 'engine.js', 'utf8');
const API = 'https://api.test/forms-submit';
const F1 = { slug: 'dokimi', titlos: 'Δοκιμή', ekdosi: 1, selides: [{ titlos: 'Στοιχεία', pedia: [
  { key: 'onoma', typos: 'keimeno', label: 'Όνομα', ypoxreotiko: true }] }] };
const F2 = { selides: [{ titlos: 'Στοιχεία', pedia: [
  { key: 'onoma', typos: 'keimeno', label: 'Όνομα', ypoxreotiko: true },
  { key: 'tilefono', typos: 'tilefono', label: 'Τηλέφωνο', ypoxreotiko: false }] }] };
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('✗ ' + m); } else console.log('✓ ' + m); };
(async () => {
  for (const getOk of [true, false]) {
    const b = await chromium.launch(), p = await b.newPage(); const posts = [];
    await p.route(API + '**', async (r) => {
      const q = r.request(), h = { 'content-type': 'application/json', 'access-control-allow-origin': '*' };
      if (q.method() === 'OPTIONS') return r.fulfill({ status: 204, headers: { ...h, 'access-control-allow-headers': 'content-type' } });
      if (q.method() === 'GET') {
        if (/orismos=1/.test(q.url())) return getOk ? r.fulfill({ status: 200, headers: h, body: JSON.stringify({ anoikti: true, ekdosi: 2, orismos: F2 }) })
          : r.abort();
        return r.fulfill({ status: 200, headers: h, body: '{"anoikti":true}' });
      }
      const body = JSON.parse(q.postData()); posts.push(body);
      if (posts.length === 1) return r.fulfill({ status: 409, headers: h, body: JSON.stringify({ error: 'x', nea_ekdosi: true, ekdosi: 2 }) });
      return r.fulfill({ status: 200, headers: h, body: '{"ok":true}' });
    });
    await p.setContent('<div id="forma"></div><script>window.FORMA=' + JSON.stringify(F1) + ';window.FORMES_API="' + API + '"</script>');
    await p.addScriptTag({ content: ENG });
    await p.fill('#p_onoma', 'Μαρία Παπαδοπούλου'); await p.click('.f-epomeno');
    await p.waitForSelector('.f-sfalma');
    const tag = getOk ? '[νέος ορισμός]' : '[χωρίς δίκτυο για τον ορισμό]';
    ok(/ενημερώθηκε/.test(await p.textContent('.f-sfalma')), tag + ' λέει καθαρά «η φόρμα ενημερώθηκε»');
    ok(await p.inputValue('#p_onoma') === 'Μαρία Παπαδοπούλου', tag + ' η απάντηση του γονέα έμεινε στο πεδίο');
    ok(posts[0].ekdosi === 1, tag + ' η πρώτη υποβολή έφερε την έκδοση 1');
    if (getOk) ok(await p.locator('#p_tilefono').count() === 1, tag + ' εμφανίστηκε το νέο πεδίο του νέου ορισμού');
    await p.click('.f-epomeno'); await p.waitForSelector('.f-efxaristo');
    ok(posts.length === 2 && posts[1].ekdosi === 2, tag + ' η δεύτερη υποβολή στάλθηκε με τη νέα έκδοση 2');
    ok(posts[1].apantiseis.onoma === 'Μαρία Παπαδοπούλου', tag + ' η δεύτερη υποβολή έχει την ίδια απάντηση');
    await b.close();
  }
  process.exit(bad ? 1 : 0);
})();
