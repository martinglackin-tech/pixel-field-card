(() => {
  const store = {
    get(k, d) { try { const v = localStorage.getItem('fieldcard:' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('fieldcard:' + k, JSON.stringify(v)); } catch {} }
  };

  /* ---------- Exposure dial ---------- */
  const LIGHTS = {
    golden:  { img: 'assets/golden.jpg',   alt: 'Wheat field under a cloudy evening sky', nd: 'ND4', stops: 2, iso: '50–250', note: 'Protects sky highlights when the bare lens clips at ISO 50.' },
    cloudy:  { img: 'assets/overcast.jpg', alt: 'Flat green pasture under a heavy grey sky', nd: 'ND8', stops: 3, iso: '50–200', note: 'Default walkaround filter for overcast daylight.' },
    hazy:    { img: 'assets/hazy.jpg',     alt: 'Ploughed soil beside a green field under a pale sky', nd: 'ND64', stops: 6, iso: '250–400', note: 'Alternative: stack ND8 + ND4 for 5 stops, on a tripod only (about 305 g).' },
    midday:  { img: 'assets/midday.jpg',   alt: 'Pale track through flat fields under a deep blue sky', nd: 'ND64', stops: 6, iso: '50–160', note: 'Essential for the f/1.68 main lens under open blue sky.' },
    trails:  { img: 'assets/athmuqam-waterfall-long-exposure.jpg', alt: 'Waterfall blurred to silk by a long exposure', nd: 'ND1000', stops: 10, iso: '50–100', note: 'Tripod only. Set the shutter to 1/2s – 2s for waterfalls and trails.', shutter: '1/2s – 2s', angle: 'Long exposure', tripod: true }
  };
  const LENS = { uw: '0.5x ultra-wide at f/1.7', main: '1x main at f/1.68', };
  const FPS = { 24: '1/50s', 25: '1/50s', 30: '1/60s', 60: '1/120s' };
  const BASE = 286, LIMIT = 300;

  const $ = (id) => document.getElementById(id);
  const img = $('dial-img'), readout = document.querySelector('.readout');
  let light = store.get('light', 'cloudy'), fps = String(store.get('fps', '25')), lens = store.get('lens', 'main');
  if (!LENS[lens]) lens = 'main';
  if (!LIGHTS[light]) light = 'cloudy';
  if (!FPS[fps]) fps = '25';

  function render(animate) {
    const L = LIGHTS[light];
    document.querySelectorAll('[data-light]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.light === light)));
    document.querySelectorAll('[data-fps]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.fps === fps)));
    document.querySelectorAll('[data-lens]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lens === lens)));
    $('o-lens').textContent = LENS[lens];

    $('o-filter').textContent = L.nd;
    $('o-stops').textContent = L.stops + '-stop K&F filter';
    $('o-shutter').textContent = L.tripod ? L.shutter + ' shutter, tripod only' : FPS[fps] + ' shutter, 180°';
    $('o-iso').textContent = 'ISO ' + L.iso;
    $('o-weight').textContent = L.tripod ? 'Off the gimbal, onto the tripod' : BASE + ' g on the gimbal, ' + (LIMIT - BASE) + ' g spare';
    let note = L.note;
    if (!L.tripod && fps === '60') note = 'At 1/120s you lose about 1⅓ stops against the 1/50s table: drop one ND grade or lift ISO towards 400.';
    let warn = !!L.tripod || fps === '60';
    if (lens === 'uw' && !L.tripod) {
      note = 'Same filter as the main. The smaller sensor is noisier: keep ISO at 200 or below and step up an ND before raising it.';
      $('o-iso').textContent = 'ISO ' + L.iso.replace(/–(\d+)$/, (m, hi) => '–' + Math.min(+hi, 200));
    }
    const n = $('o-note');
    n.textContent = note;
    n.classList.toggle('warn', warn);

    if (img.getAttribute('src') !== L.img) {
      if (animate) {
        img.classList.add('swap');
        setTimeout(() => { img.src = L.img; img.alt = L.alt; }, 220);
        img.onload = () => img.classList.remove('swap');
      } else { img.src = L.img; img.alt = L.alt; }
    }
    if (animate) { readout.classList.remove('flash'); void readout.offsetWidth; readout.classList.add('flash'); }
  }

  document.querySelectorAll('[data-light]').forEach(b => b.addEventListener('click', () => {
    light = b.dataset.light; store.set('light', light); render(true);
  }));
  document.querySelectorAll('[data-lens]').forEach(b => b.addEventListener('click', () => {
    lens = b.dataset.lens; store.set('lens', lens); render(true);
  }));
  document.querySelectorAll('[data-fps]').forEach(b => b.addEventListener('click', () => {
    fps = b.dataset.fps; store.set('fps', fps); render(true);
  }));
  render(false);

  /* ---------- Rig checklist ---------- */
  const boxes = [...document.querySelectorAll('[data-step]')];
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
  const decks = document.querySelectorAll('[data-deck]');
  function showApp() {
    document.querySelectorAll('[data-app]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.app === app)));
    decks.forEach(d => { d.hidden = d.dataset.deck !== app; });
  }
  document.querySelectorAll('[data-app]').forEach(b => b.addEventListener('click', () => { app = b.dataset.app; store.set('app', app); showApp(); }));
  showApp();

  /* ---------- Entrances ---------- */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.reveal-group, .tiles, .menu, .cat, .apps').forEach(g => {
    g.querySelectorAll(':scope > .reveal, :scope > li.reveal, :scope > div > .reveal').forEach((el, i) => el.style.setProperty('--d', i));
  });
  const targets = document.querySelectorAll('.reveal, .tile');
  const iris = document.querySelector('.iris');
  if (reduce || !('IntersectionObserver' in window)) iris.classList.add('is-in');
  else {
    const io2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { iris.classList.add('is-in'); io2.disconnect(); } }), { rootMargin: '0px 0px 25% 0px' });
    io2.observe(document.getElementById('dial'));
  }
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(t => t.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
    targets.forEach(t => io.observe(t));
  }

  /* ---------- Weight figure rolls up ---------- */
  const num = document.querySelector('[data-count]');
  if (num && !reduce) {
    const end = +num.dataset.count, t0 = performance.now(), dur = 1200;
    const tick = (t) => { const p = Math.min(1, (t - t0) / dur); num.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }

  /* video respects reduced motion */
  if (reduce) document.querySelectorAll('video[autoplay]').forEach(v => { v.removeAttribute('autoplay'); v.pause(); });
})();

/* offline: cache the card for use without signal */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
