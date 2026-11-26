/* formes.76.life — η μηχανή των φορμών. Ζωγραφίζει μία φόρμα από τον ορισμό της
   (window.FORMA, γραμμένος μέσα στη σελίδα από το build.py) και την υποβάλλει στη
   forms-submit. Δεν κρατά τίποτα: ούτε cookies, ούτε αποθήκευση στον browser. */
(function () {
  'use strict';
  var F = window.FORMA, API = window.FORMES_API;
  /* Η forms-submit εκτελείται ΠΑΝΤΑ στη Φρανκφούρτη, όπου η βάση των ανοιχτών (Δήλωση §9).
     Χωρίς αυτό, από την Κύπρο εκτελείται στη Ζυρίχη (eu-central-2) — έλεγχος 22/11/2026. */
  var PERIOXI = 'forceFunctionRegion=eu-central-1';
  var root = document.getElementById('forma');
  if (!F || !root) return;
  var sel = 0, times = {}, stelnei = false;

  function el(tag, attrs, kids) {
    var e = document.createElement(tag), k;
    for (k in (attrs || {})) {
      if (k === 'text') e.textContent = attrs[k];
      else if (k === 'cls') e.className = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }
  function kleisto(msg) {
    root.innerHTML = '';
    root.appendChild(el('div', { cls: 'f-kleisti', role: 'status', text: msg || 'Η φόρμα έκλεισε.' }));
  }
  if (F.kleisti) return kleisto();

  function pedio(p) {
    var id = 'p_' + p.key, box = el('div', { cls: 'f-pedio', 'data-key': p.key }), inp;
    var lab = el('label', { for: id, text: p.label + (p.ypoxreotiko ? ' *' : '') });
    function set(v) {
      times[p.key] = v;
      if (box.classList.contains('f-exei-lathos')) {   /* το λάθος σβήνει μόλις διορθωθεί */
        var m = lathos(p); box.querySelector('.f-lathos').textContent = m; box.classList.toggle('f-exei-lathos', !!m);
      }
    }
    if (p.typos === 'keimeno' || p.typos === 'email' || p.typos === 'tilefono') {
      inp = el('input', { id: id, type: p.typos === 'email' ? 'email' : p.typos === 'tilefono' ? 'tel' : 'text',
        maxlength: p.max || 200, autocomplete: 'off' });
      inp.value = times[p.key] || '';
      inp.addEventListener('input', function () { set(inp.value); });
      box.appendChild(lab); box.appendChild(inp);
    } else if (p.typos === 'keimeno_makry') {
      inp = el('textarea', { id: id, rows: 4, maxlength: p.max || 1000 });
      inp.value = times[p.key] || '';
      inp.addEventListener('input', function () { set(inp.value); });
      box.appendChild(lab); box.appendChild(inp);
    } else if (p.typos === 'epilogi' || p.typos === 'klimaka') {
      var opts = p.epiloges || [], i;
      if (p.typos === 'klimaka') { opts = []; for (i = p.min || 1; i <= (p.max || 5); i++) opts.push(String(i)); }
      var fs = el('fieldset', { cls: p.typos === 'klimaka' ? 'f-klimaka' : 'f-epilogi' },
        [el('legend', { text: p.label + (p.ypoxreotiko ? ' *' : '') })]);
      opts.forEach(function (o, n) {
        var r = el('input', { type: 'radio', name: id, id: id + '_' + n, value: o });
        if (times[p.key] === o) r.checked = true;
        r.addEventListener('change', function () { set(o); });
        fs.appendChild(el('span', { cls: 'f-opt' }, [r, el('label', { for: id + '_' + n, text: o })]));
      });
      if (p.typos === 'klimaka' && p.akra) fs.appendChild(el('div', { cls: 'f-akra' }, [el('span', { text: (p.min || 1) + ' = ' + p.akra[0] }), el('span', { text: (p.max || 5) + ' = ' + p.akra[1] })]));
      box.appendChild(fs);
    } else if (p.typos === 'apodoxi') {
      inp = el('input', { id: id, type: 'checkbox' });
      inp.checked = times[p.key] === 'ναι';
      inp.addEventListener('change', function () { set(inp.checked ? 'ναι' : ''); });
      box.appendChild(el('span', { cls: 'f-opt' }, [inp, lab]));
    }
    if (p.voithima) box.appendChild(el('div', { cls: 'f-voithima', text: p.voithima }));
    box.appendChild(el('div', { cls: 'f-lathos', role: 'alert' }));
    return box;
  }

  /* Ίδιοι κανόνες με τον σέρβερ (forms-submit · elegxos). Ο σέρβερ είναι η αλήθεια. */
  function lathos(p) {
    var v = String(times[p.key] == null ? '' : times[p.key]).trim();
    if (!v) return p.ypoxreotiko ? 'Το πεδίο είναι υποχρεωτικό.' : '';
    if (p.typos === 'email' && !/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(v)) return 'Το email δεν φαίνεται σωστό.';
    if (p.typos === 'tilefono' && !/^\+?[\d\s-]{8,20}$/.test(v)) return 'Το τηλέφωνο δεν φαίνεται σωστό.';
    return '';
  }
  function elegxosSelidas() {
    var ok = true, first = null;
    F.selides[sel].pedia.forEach(function (p) {
      var m = lathos(p), box = root.querySelector('[data-key="' + p.key + '"]');
      box.querySelector('.f-lathos').textContent = m;
      box.classList.toggle('f-exei-lathos', !!m);
      if (m) { ok = false; first = first || box; }
    });
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return ok;
  }

  function zografise(minima) {
    root.innerHTML = '';
    var S = F.selides[sel], N = F.selides.length, enim = null;
    if (N > 1) {
      root.appendChild(el('div', { cls: 'f-mpara', role: 'progressbar', 'aria-valuemin': 1, 'aria-valuemax': N,
        'aria-valuenow': sel + 1 }, [el('span', { style: 'width:' + Math.round(100 * (sel + 1) / N) + '%' })]));
      root.appendChild(el('div', { cls: 'f-selida', text: 'Σελίδα ' + (sel + 1) + ' από ' + N }));
    }
    if (sel === 0 && F.eisagogi) root.appendChild(el('p', { cls: 'f-eisagogi', text: F.eisagogi }));
    root.appendChild(el('h2', { text: S.titlos }));
    S.pedia.forEach(function (p) { root.appendChild(pedio(p)); });
    if (sel === N - 1) {
      if (F.enimerosi && !v2()) root.appendChild(el('p', { cls: 'f-enimerosi', text: F.enimerosi }));   /* παλιές (v1) φόρμες: όπως ήταν */
      if (F.enimerosi && v2()) { enim = el('div', { cls: 'f-enimerosi' }); root.appendChild(enim); fortoseKeimeno(enim); }
      /* πεδίο-παγίδα: κρυφό για ανθρώπους */
      var hp = el('div', { cls: 'f-ist', 'aria-hidden': 'true' },
        [el('label', { for: 'istoselida', text: 'Ιστοσελίδα' }), el('input', { id: 'istoselida', type: 'text', tabindex: '-1', autocomplete: 'off' })]);
      root.appendChild(hp);
    }
    if (minima) root.appendChild(el('div', { cls: 'f-sfalma', role: 'alert', text: minima }));
    var nav = el('div', { cls: 'f-nav' });
    if (sel > 0) {
      var piso = el('button', { type: 'button', cls: 'f-piso', text: 'Πίσω' });
      piso.addEventListener('click', function () { sel--; zografise(); window.scrollTo(0, 0); });
      nav.appendChild(piso);
    }
    var b = el('button', { type: 'button', cls: 'f-epomeno', text: sel === N - 1 ? 'Υποβολή' : 'Επόμενο' });
    if (enim && typeof KEIMENA[String(F.enimerosi)] !== 'string') b.disabled = true;   /* όχι «Υποβολή» πριν φανεί το κείμενο ενημέρωσης */
    if (enim) enim.btn = b;
    b.addEventListener('click', function () {
      if (!elegxosSelidas()) return;
      if (sel < N - 1) { sel++; zografise(); window.scrollTo(0, 0); } else steile(b);
    });
    nav.appendChild(b);
    root.appendChild(nav);
  }

  /* Ξαναδημοσιεύτηκε η φόρμα όσο ο γονέας τη συμπλήρωνε (27/11, σημείο ii): οι απαντήσεις ΔΕΝ χάνονται (το «times» μένει),
     παίρνουμε τον νέο ορισμό, λέμε καθαρά τι έγινε και ο γονέας ξαναπατά «Υποβολή» — τώρα με τη νέα έκδοση. */
  var MINIMA_NEA = 'Η φόρμα ενημερώθηκε. Οι απαντήσεις σας διατηρήθηκαν — ελέγξτε τες και πατήστε ξανά «Υποβολή».';
  function neaEkdosi(j) {
    function telos() { sel = F.selides.length - 1; zografise(MINIMA_NEA); window.scrollTo(0, 0); }
    fetch(API + '?f=' + encodeURIComponent(F.slug) + '&orismos=1&' + PERIOXI).then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.anoikti === false) return kleisto();
        if (d && d.orismos && d.orismos.selides && d.ekdosi != null) { F.selides = d.orismos.selides; F.ekdosi = d.ekdosi; }
        else if (j.ekdosi != null) F.ekdosi = j.ekdosi;
        telos();
      })
      .catch(function () { if (j.ekdosi != null) F.ekdosi = j.ekdosi; telos(); });
  }

  /* (ε) Φόρμες v2: το κείμενο ενημέρωσης είναι ΠΑΓΩΜΕΝΟ αρχείο (keimena/ENIM-<φόρμα>/vX.Y.md), γραμμένο από το CDPS.
     Ο ορισμός κρατά μόνο τον κωδικό· ελεύθερο κείμενο από τον ορισμό δεν εμφανίζεται ποτέ. Χωρίς κείμενο, δεν υποβάλλεται. */
  var KEIMENA = {};
  function v2() { return F.ekdosi != null || F.orismos === 2; }
  function fortoseKeimeno(box) {
    var kod = String(F.enimerosi), m = /^ENIM-([a-z0-9-]{3,60})\/(v\d+\.\d+)$/.exec(kod);
    function zwgrafise() {
      var t = KEIMENA[kod];
      box.textContent = '';
      if (typeof t !== 'string') {
        box.appendChild(el('div', { cls: 'f-sfalma', role: 'alert', text: 'Δεν φορτώθηκε το κείμενο ενημέρωσης. Ανανεώστε τη σελίδα και δοκιμάστε ξανά.' }));
        return;
      }
      t.split(/\n{2,}/).forEach(function (blk) {
        blk = blk.replace(/^\s+|\s+$/g, ''); if (!blk) return;
        if (/^#/.test(blk)) box.appendChild(el('h3', { text: blk.replace(/^#+\s*/, '') }));
        else box.appendChild(el('p', { text: blk.replace(/^_(.*)_$/s, '$1') }));
      });
      if (box.btn) box.btn.disabled = false;
    }
    if (KEIMENA[kod] !== undefined) return zwgrafise();
    if (!m) { KEIMENA[kod] = false; return zwgrafise(); }
    fetch('/keimena/ENIM-' + m[1] + '/' + m[2] + '.md', { redirect: 'error' })
      .then(function (r) { if (!r.ok) throw 0; return r.text(); })
      .then(function (t) { KEIMENA[kod] = t.length && t.length <= 65536 ? t : false; zwgrafise(); })
      .catch(function () { KEIMENA[kod] = false; zwgrafise(); });
  }

  function steile(b) {
    if (stelnei) return;
    stelnei = true; b.disabled = true; b.textContent = 'Αποστολή…';
    var ap = {}, hp = document.getElementById('istoselida');
    F.selides.forEach(function (s) { s.pedia.forEach(function (p) {
      var v = String(times[p.key] == null ? '' : times[p.key]).trim(); if (v) ap[p.key] = v; }); });
    fetch(API + '?' + PERIOXI, { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(F.ekdosi != null ? { forma: F.slug, ekdosi: F.ekdosi, apantiseis: ap, istoselida: hp ? hp.value : '' }
        : { forma: F.slug, apantiseis: ap, istoselida: hp ? hp.value : '' }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { s: r.status, j: j }; }); })
      .then(function (x) {
        stelnei = false;
        if (x.j && x.j.ok) {
          /* η φόρμα ΚΡΥΒΕΤΑΙ: να μην υποβληθεί δεύτερη φορά */
          root.innerHTML = '';
          root.appendChild(el('div', { cls: 'f-efxaristo', role: 'status', text: F.efxaristo || 'Σας ευχαριστούμε. Η υποβολή σας καταχωρίστηκε.' }));
          window.scrollTo(0, 0);
        } else if (x.j && x.j.kleisti) kleisto();
        else if (x.j && x.j.nea_ekdosi) neaEkdosi(x.j);
        else zografise((x.j && x.j.error) || 'Η υποβολή δεν ολοκληρώθηκε. Δοκιμάστε ξανά σε λίγο.');
      })
      .catch(function () { stelnei = false; zografise('Δεν υπάρχει σύνδεση. Τα στοιχεία σας δεν χάθηκαν· δοκιμάστε ξανά.'); });
  }

  zografise();
  /* Έκλεισε στο μεταξύ; Ρωτάμε τον σέρβερ (δεν στέλνεται κανένα στοιχείο). */
  fetch(API + '?f=' + encodeURIComponent(F.slug) + '&' + PERIOXI).then(function (r) { return r.json(); })
    .then(function (j) { if (j && j.anoikti === false) kleisto(); }).catch(function () {});
})();
