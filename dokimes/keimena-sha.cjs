// CDPS-76/6/16 (ε.3): κάθε αρχείο του keimena/ έχει το sha256 που γράφει το μητρώο τρεχουσών εκδόσεων (keimena/TREXOUSES.json).
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const K = path.join(__dirname, '..', 'keimena'); let bad = 0;
const ok = (c, m) => { if (!c) { bad++; console.log('✗ ' + m); } else console.log('✓ ' + m); };
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
let R = null; try { R = JSON.parse(fs.readFileSync(path.join(K, 'TREXOUSES.json'), 'utf8')); } catch (e) {}
ok(!!R && R.kodikoi && R.palies, 'υπάρχει το keimena/TREXOUSES.json και διαβάζεται');
if (R) {
  const expect = {}; // «ΚΩΔΙΚΟΣ/vΜ.μ» → sha256
  for (const [k, v] of Object.entries(R.kodikoi)) expect[k + '/' + v.trexousa] = v.sha256;
  for (const [k, v] of Object.entries(R.palies)) expect[k] = v;
  const files = fs.readdirSync(K).filter((d) => fs.statSync(path.join(K, d)).isDirectory())
    .flatMap((d) => fs.readdirSync(path.join(K, d)).filter((f) => f.endsWith('.md')).map((f) => d + '/' + f.replace(/\.md$/, '')));
  ok(files.length > 0, 'βρέθηκαν αρχεία κειμένων (' + files.length + ')');
  for (const f of files) ok(expect[f] !== undefined && sha(path.join(K, f + '.md')) === expect[f], f + ': το sha256 συμφωνεί με το μητρώο');
  for (const k of Object.keys(expect)) ok(files.includes(k), k + ': το αρχείο υπάρχει');
  for (const [k, v] of Object.entries(R.kodikoi)) ok(/^v\d+\.\d+$/.test(v.trexousa) && /^[0-9a-f]{64}$/.test(v.sha256) && typeof v.energo === 'boolean', k + ': σωστή μορφή γραμμής');
}
process.exit(bad ? 1 : 0);
