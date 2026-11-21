/* formes.76.life — η μηχανή των φορμών. Ζωγραφίζει μία φόρμα από τον ορισμό της
   (window.FORMA, γραμμένος μέσα στη σελίδα από το build.py) και την υποβάλλει στη
   forms-submit. Δεν κρατά τίποτα: ούτε cookies, ούτε αποθήκευση στον browser. */
(function () {
  'use strict';
  var F = window.FORMA, API = window.FORMES_API;
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
    var S = F.selides[sel], N = F.selides.length;
    if (N > 1) {
      root.appendChild(el('div', { cls: 'f-mpara', role: 'progressbar', 'aria-valuemin': 1, 'aria-valuemax': N,
        'aria-valuenow': sel + 1 }, [el('span', { style: 'width:' + Math.round(100 * (sel + 1) / N) + '%' })]));
      root.appendChild(el('div', { cls: 'f-selida', text: 'Σελίδα ' + (sel + 1) + ' από ' + N }));
    }
    if (sel === 0 && F.eisagogi) root.appendChild(el('p', { cls: 'f-eisagogi', text: F.eisagogi }));
    root.appendChild(el('h2', { text: S.titlos }));
    S.pedia.forEach(function (p) { root.appendChild(pedio(p)); });
    if (sel === N - 1) {
      if (F.enimerosi) root.appendChild(el('p', { cls: 'f-enimerosi', text: F.enimerosi }));
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
    b.addEventListener('click', function () {
      if (!elegxosSelidas()) return;
      if (sel < N - 1) { sel++; zografise(); window.scrollTo(0, 0); } else steile(b);
    });
    nav.appendChild(b);
    root.appendChild(nav);
  }

  function steile(b) {
    if (stelnei) return;
    stelnei = true; b.disabled = true; b.textContent = 'Αποστολή…';
    var ap = {}, hp = document.getElementById('istoselida');
    F.selides.forEach(function (s) { s.pedia.forEach(function (p) {
      var v = String(times[p.key] == null ? '' : times[p.key]).trim(); if (v) ap[p.key] = v; }); });
    fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ forma: F.slug, apantiseis: ap, istoselida: hp ? hp.value : '' }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { s: r.status, j: j }; }); })
      .then(function (x) {
        stelnei = false;
        if (x.j && x.j.ok) {
          /* η φόρμα ΚΡΥΒΕΤΑΙ: να μην υποβληθεί δεύτερη φορά */
          root.innerHTML = '';
          root.appendChild(el('div', { cls: 'f-efxaristo', role: 'status', text: F.efxaristo || 'Σας ευχαριστούμε. Η υποβολή σας καταχωρίστηκε.' }));
          window.scrollTo(0, 0);
        } else if (x.j && x.j.kleisti) kleisto();
        else zografise((x.j && x.j.error) || 'Η υποβολή δεν ολοκληρώθηκε. Δοκιμάστε ξανά σε λίγο.');
      })
      .catch(function () { stelnei = false; zografise('Δεν υπάρχει σύνδεση. Τα στοιχεία σας δεν χάθηκαν· δοκιμάστε ξανά.'); });
  }

  zografise();
  /* Έκλεισε στο μεταξύ; Ρωτάμε τον σέρβερ (δεν στέλνεται κανένα στοιχείο). */
  fetch(API + '?f=' + encodeURIComponent(F.slug)).then(function (r) { return r.json(); })
    .then(function (j) { if (j && j.anoikti === false) kleisto(); }).catch(function () {});
})();
