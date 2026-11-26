// Δοκιμή συμπεριφοράς (27/11/2026 · απόφαση αρχιτεκτονικής ε): το κείμενο ενημέρωσης v2 είναι ΠΑΓΩΜΕΝΟ αρχείο, ποτέ ελεύθερο κείμενο.
const { chromium } = require('playwright'); const fs = require('fs');
const ENG = fs.readFileSync(process.argv[2] || 'engine.js', 'utf8');
const SITE = 'https://site.test', API = SITE + '/fs';
const KEIMENO = '# Ενημέρωση δοκιμής\n\nΠρώτη παράγραφος.\n\nΔεύτερη <b>έντονη</b> παράγραφος.';
const mkF = (extra) => Object.assign({ slug: 'dokimi', titlos: 'Δοκιμή', selides: [{ titlos: 'Α', pedia: [{ key: 'onoma', typos: 'keimeno', label: 'Όνομα', ypoxreotiko: false }] }] }, extra);
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('✗ ' + m); } else console.log('✓ ' + m); };
async function run(F, keimenoStatus) {
  const b = await chromium.launch(), p = await b.newPage(); const reqs = [];
  await p.route('**/*', async (r) => {
    const u = r.request().url(); reqs.push(u); const h = { 'access-control-allow-origin': '*' };
    if (u === SITE + '/page.html') return r.fulfill({ status: 200, contentType: 'text/html', body: '<div id="forma"></div>' });
    if (/\/keimena\/ENIM-dokimi\/v1\.0\.md$/.test(u)) return r.fulfill({ status: keimenoStatus, headers: h, contentType: 'text/markdown; charset=utf-8', body: keimenoStatus === 200 ? KEIMENO : 'no' });
    return r.fulfill({ status: 200, headers: h, contentType: 'application/json', body: '{"anoikti":true}' });
  });
  await p.goto(SITE + '/page.html');
  await p.evaluate((x) => { window.FORMA = x.F; window.FORMES_API = x.A; }, { F, A: API });
  await p.addScriptTag({ content: ENG });
  await p.waitForSelector('.f-epomeno'); await p.waitForTimeout(300);
  const out = { txt: await p.locator('.f-enimerosi').allTextContents(), n: await p.locator('.f-enimerosi').count(), btn: await p.locator('.f-epomeno').isDisabled(),
    bold: await p.locator('.f-enimerosi b').count(), reqs }; await b.close(); return out;
}
(async () => {
  const a = await run(mkF({ ekdosi: 1, enimerosi: 'ENIM-dokimi/v1.0' }), 200);
  ok(/Πρώτη παράγραφος\./.test(a.txt.join(' ')) && /Ενημέρωση δοκιμής/.test(a.txt.join(' ')), 'v2: εμφανίζεται το κείμενο του παγωμένου αρχείου');
  ok(a.bold === 0 && /<b>έντονη<\/b>/.test(a.txt.join(' ')), 'v2: το κείμενο μπαίνει ως απλό κείμενο (το <b> δεν γίνεται HTML)');
  ok(a.reqs.includes(SITE + '/keimena/ENIM-dokimi/v1.0.md'), 'v2: η σελίδα ζητά το αρχείο keimena/ENIM-<φόρμα>/vX.Y.md');
  ok(a.btn === false, 'v2: με φορτωμένο κείμενο η «Υποβολή» είναι ενεργή');
  const c = await run(mkF({ ekdosi: 1, enimerosi: 'Ελεύθερο κείμενο από τον ορισμό' }), 200);
  ok(!/Ελεύθερο κείμενο/.test(c.txt.join(' ')), 'v2: ελεύθερο κείμενο από τον ορισμό ΔΕΝ εμφανίζεται ποτέ');
  ok(c.btn === true, 'v2: χωρίς έγκυρο κωδικό δεν υποβάλλεται');
  const d = await run(mkF({ ekdosi: 1, enimerosi: 'ENIM-dokimi/v1.0' }), 404);
  ok(/Δεν φορτώθηκε το κείμενο ενημέρωσης/.test(d.txt.join(' ')) && d.btn === true, 'v2: λείπει το αρχείο → μήνυμα και η «Υποβολή» μένει κλειστή');
  const e = await run(mkF({ enimerosi: 'Παλιά φόρμα v1: το κείμενο μένει όπως ήταν.' }), 200);
  ok(/Παλιά φόρμα v1/.test(e.txt.join(' ')) && e.btn === false, 'v1 (χωρίς έκδοση ορισμού): ΔΕΝ αλλάζει τίποτα');
  process.exit(bad ? 1 : 0);
})();
