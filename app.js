(() => {
  const store = {
    get(k, d) { try { const v = localStorage.getItem('fieldcard:' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('fieldcard:' + k, JSON.stringify(v)); } catch {} }
  };
  const $ = (id) => document.getElementById(id);
  const all = (sel) => document.querySelectorAll(sel);

  /* ---------- Data from the field card ---------- */
  const LIGHTS = {
    golden: { img: 'assets/golden.jpg',   alt: 'Wheat field under a cloudy evening sky', nd: 'ND4',    iso: [50, 250], wb: '5600K', note: 'Protects sky highlights when the bare lens clips at ISO 50.' },
    cloudy: { img: 'assets/overcast.jpg', alt: 'Flat green pasture under a heavy grey sky', nd: 'ND8',  iso: [50, 200], wb: '6500K', note: 'Default walkaround filter for overcast daylight.' },
    hazy:   { img: 'assets/hazy.jpg',     alt: 'Ploughed soil beside a green field under a pale sky', nd: 'ND64', iso: [250, 400], wb: '5600K', note: 'On a tripod you can stack ND8 + ND4 instead, for 5 stops.' },
    midday: { img: 'assets/midday.jpg',   alt: 'Pale track through flat fields under a deep blue sky', nd: 'ND64', iso: [50, 160], wb: '5600K', note: 'Essential for the f/1.68 main under open blue sky.' },
    trails: { img: 'assets/athmuqam-waterfall-long-exposure.jpg', alt: 'Waterfall blurred to silk by a long exposure', nd: 'ND1000', iso: [50, 100], wb: '5600K', note: 'Tripod only: take the phone off the gimbal.', tripod: true }
  };
  const SHUTTER = { 24: '1/50s', 25: '1/50s', 30: '1/60s', 60: '1/120s' };

  let light = store.get('light', 'cloudy'), fps = String(store.get('fps', '25'));
  if (!LIGHTS[light]) light = 'cloudy';
  if (!SHUTTER[fps]) fps = '25';

  const img = $('o-img'), result = document.querySelector('.result');

  function compute() {
    const L = LIGHTS[light];
    const out = { nd: L.nd, wb: L.wb, notes: [{ t: L.note, warn: !!L.tripod }] };
    const [lo, hi] = L.iso;

    if (L.tripod) {
      out.shutter = '1/2 – 2s'; out.shutterK = 'shutter, long exposure';
    } else {
      out.shutter = SHUTTER[fps]; out.shutterK = 'shutter, 180°';
      if (fps === '24') out.notes.push({ t: '1/48s is the exact 180°; 1/50s is fine if the app has no 1/48s.' });
      if (fps === '25') out.notes.push({ t: '25p suits 50 Hz mains lighting: no indoor flicker.' });
      if (fps === '30') out.notes.push({ t: '30p suits 60 Hz mains lighting: no indoor flicker.' });
      if (fps === '60') out.notes.push({ t: 'At 1/120s you lose about 1⅓ stops: drop one ND grade or lift ISO towards 400. Conform to 24, 25 or 30p for slow motion.', warn: true });
    }

    out.iso = lo === hi ? String(lo) : lo + '–' + hi;
    return out;
  }

  function render(animate) {
    const L = LIGHTS[light], o = compute();
    all('[data-light]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.light === light)));
    all('[data-fps]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.fps === fps)));

    $('o-nd').textContent = o.nd;
    $('o-nd').classList.toggle('long', o.nd.length > 4);
    $('o-shutter').textContent = o.shutter;
    $('o-shutter-k').textContent = o.shutterK;
    $('o-iso').textContent = o.iso;
    $('o-wb').textContent = o.wb;

    const list = $('o-notes');
    list.replaceChildren(...o.notes.map(n => { const li = document.createElement('li'); li.textContent = n.t; if (n.warn) li.className = 'warn'; return li; }));

    all('[data-v="iso"]').forEach(e => e.textContent = o.iso);
    all('[data-v="wb"]').forEach(e => e.textContent = o.wb);
    all('[data-v="shutter"]').forEach(e => e.textContent = o.shutter);

    if (img.getAttribute('src') !== L.img) {
      if (animate) {
        img.classList.add('swap');
        setTimeout(() => { img.onload = () => img.classList.remove('swap'); img.src = L.img; img.alt = L.alt; }, 200);
      } else { img.src = L.img; img.alt = L.alt; }
    }
    if (animate) { result.classList.remove('flash'); void result.offsetWidth; result.classList.add('flash'); }
  }

  const bind = (attr, set) => all('[data-' + attr + ']').forEach(b => b.addEventListener('click', () => { set(b.dataset[attr]); render(true); }));
  bind('light', v => { light = v; store.set('light', v); });
  bind('fps', v => { fps = v; store.set('fps', v); });
  render(false);

  /* ---------- Rig checklist ---------- */
  const boxes = [...all('[data-step]')];
  const done = store.get('rig', {});
  const count = () => { $('rig-count').textContent = boxes.filter(b => b.checked).length + ' of ' + boxes.length; };
  boxes.forEach(b => {
    b.checked = !!done[b.dataset.step];
    b.addEventListener('change', () => { done[b.dataset.step] = b.checked; store.set('rig', done); count(); });
  });
  $('rig-reset').addEventListener('click', () => { boxes.forEach(b => { b.checked = false; done[b.dataset.step] = false; }); store.set('rig', done); count(); });
  count();

  /* ---------- App switch ---------- */
  let app = store.get('app', 'bm');
  if (!['bm', 'mc'].includes(app)) app = 'bm';
  function showApp() {
    all('[data-app]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.app === app)));
    all('[data-deck]').forEach(d => { d.hidden = d.dataset.deck !== app; });
    all('[data-deck-note]').forEach(d => { d.hidden = d.dataset.deckNote !== app; });
  }
  all('[data-app]').forEach(b => b.addEventListener('click', () => { app = b.dataset.app; store.set('app', app); showApp(); }));
  showApp();

  /* ---------- Entrances ---------- */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  all('.steps > .reveal').forEach((el, i) => el.style.setProperty('--d', i));
  all('.deck > li, .controls > .row').forEach(el => el.classList.add('reveal'));
  all('.deck, .controls').forEach(g => [...g.children].forEach((el, i) => el.style.setProperty('--d', i)));
  const targets = all('.reveal');
  if (reduce || !('IntersectionObserver' in window)) targets.forEach(t => t.classList.add('is-in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px 10% 0px' });
    targets.forEach(t => io.observe(t));
  }

  /* offline: cache the card for use without signal */
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
