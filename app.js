(() => {
  const store = {
    get(k, d) { try { const v = localStorage.getItem('fieldcard:' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('fieldcard:' + k, JSON.stringify(v)); } catch {} }
  };
  const $ = (id) => document.getElementById(id);
  const all = (sel) => document.querySelectorAll(sel);

  /* ---------- Data from the field card ---------- */
  const LIGHTS = {
    golden: { img: 'assets/golden.jpg',   alt: 'Low sun reflected in a calm lagoon', nd: 'ND4',    iso: [50, 250], wb: '5600K', note: '5600K keeps the warm golden-hour colour. ND4 protects the sky when the bare lens clips at ISO 50.', p50: { nd: 'ND4', iso: [100, 500] } },
    cloudy: { img: 'assets/overcast.jpg', alt: 'Green field and bare trees under heavy grey clouds', nd: 'ND8',  iso: [50, 200], wb: '6500K', note: 'Default walkaround filter for overcast days and open shade. 6500K takes out their blue cast.', p50: { nd: 'ND4', iso: [50, 200] } },
    // Hazy sun is about a stop darker than midday sun: same ND64, ISO doubled.
    hazy:   { img: 'assets/hazy.jpg',     alt: 'Sun rays breaking through hazy cloud over a field', nd: 'ND64', iso: [100, 320], wb: '5600K', note: 'About a stop darker than midday sun, so the same ND64 at double the ISO. On a tripod, stack ND8 + ND4 (5 stops) to drop back to ISO 50–160.', p50: { nd: 'ND64', iso: [200, 640] } },
    midday: { img: 'assets/midday.jpg',   alt: 'Green valley and hills under a bright blue sky', nd: 'ND64', iso: [50, 160], wb: '5600K', note: 'Essential for the f/1.68 main under open blue sky.', p50: { nd: 'ND64', iso: [100, 320] } },
    dusk:   { img: 'assets/dusk.jpg',     alt: 'Pink and orange dusk clouds over the sea and a rocky shore', nd: 'No ND', iso: [400, 1600], wb: '4000K', note: 'Take the filter off. Set WB to the main light: 3200K for warm bulbs, 4000K for most LEDs, 5600K by a window. Above ISO 800 the Pixel gets noisy: add light or move closer to it.', p50: { nd: 'No ND', iso: [800, 3200], note: '50p needs twice the light: in low light, stay on 25p if you can.' } }
  };
  // 50p shoots at 1/100s, one stop less light than 25p at 1/50s: each light's p50 drops one ND
  // where the kit allows (ND8 → ND4) and doubles the ISO where it doesn't.
  const SHUTTER = { 25: '1/50s', 50: '1/100s' };
  // Each filter: stops, how much light it passes, and how bright the bare-lens photo looks outside the ring.
  const ND = {
    'ND4':   { stops: 2, pct: '25%',   over: 1.6 },
    'ND8':   { stops: 3, pct: '12.5%', over: 2.1 },
    'ND64':  { stops: 6, pct: '1.6%',  over: 3 },
    'No ND': { stops: 0, pct: '100%',  over: 1 }
  };

  let light = store.get('light', 'cloudy'), fps = String(store.get('fps', '25'));
  if (!LIGHTS[light]) light = 'cloudy';
  if (!SHUTTER[fps]) fps = '25';

  const img = $('o-img'), raw = $('o-img-raw'), scene = $('o-scene');
  let shownND = null;

  // Shrink the filter name until it fits its column, whatever the screen or text size.
  function fitND() {
    const el = $('o-nd');
    el.style.fontSize = '';
    const room = el.clientWidth;
    if (!room) return;
    let size = parseFloat(getComputedStyle(el).fontSize);
    while (el.scrollWidth > room && size > 24) { size -= 2; el.style.fontSize = size + 'px'; }
  }
  addEventListener('resize', fitND);
  if (document.fonts) document.fonts.ready.then(fitND);

  function compute() {
    const L = LIGHTS[light];
    const S = (fps === '50' && L.p50) || L;
    const out = { nd: S.nd, wb: L.wb, notes: [{ t: L.note }] };
    const [lo, hi] = S.iso;

    {
      out.shutter = SHUTTER[fps]; out.shutterK = 'shutter, 180°';
      const fpsNote = {
        // Europe: 50 Hz mains, so lights flicker at 100 Hz. 1/50s and 1/100s are both flicker-free.
        25: { t: 'Flicker-free under Europe\'s 50 Hz lights. The standard frame rate for Europe.' },
        50: { t: 'Slow motion, flicker-free under Europe\'s 50 Hz lights. The ND and ISO above already allow for the faster 1/100s shutter. Twice the sensor data: expect the phone to heat faster and throttle on hot days. Conform 50p to 25p in Final Cut Pro for 50% slow motion.', warn: true },
      }[fps];
      if (fpsNote) out.notes.push(fpsNote);
      if (S !== L && S.note) out.notes.push({ t: S.note, warn: true }); // Extra note for 50p only.
    }

    out.iso = lo === hi ? String(lo) : lo + '–' + hi;
    return out;
  }

  function render(animate) {
    const L = LIGHTS[light], o = compute();
    all('[data-light]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.light === light)));
    all('[data-fps]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.fps === fps)));

    // Only values that change fade in; the rest stay still.
    const set = (id, v) => {
      const e = $(id);
      if (e.textContent === v) return;
      e.textContent = v;
      if (animate && e.matches('.r-nd, .r-v, .r-stops')) { e.classList.remove('flash'); void e.offsetWidth; e.classList.add('flash'); }
    };
    set('o-nd', o.nd);
    $('o-nd').classList.toggle('long', o.nd.length > 4);
    fitND();
    set('o-shutter', o.shutter);
    set('o-shutter-k', o.shutterK);
    set('o-iso', o.iso);
    set('o-wb', o.wb);

    const list = $('o-notes');
    list.replaceChildren(...o.notes.map(n => { const li = document.createElement('li'); li.textContent = n.t; if (n.warn) li.className = 'warn'; return li; }));

    all('[data-v="iso"]').forEach(e => e.textContent = o.iso);
    all('[data-v="wb"]').forEach(e => e.textContent = o.wb);
    all('[data-v="shutter"]').forEach(e => e.textContent = o.shutter);

    // The lens: the ring carries the filter and settings; outside it, the bare lens overexposes by the filter's stops.
    const m = ND[o.nd], none = o.nd === 'No ND';
    scene.dataset.nd = none ? 'none' : 'on';
    scene.style.setProperty('--over', m.over);
    set('o-stops', none ? 'No filter · all the light reaches the sensor' : m.stops + ' stops · passes ' + m.pct + ' of the light');
    $('o-rim-top').textContent = o.nd + ' · ' + m.stops + ' STOPS · 67mm';
    $('o-rim-bottom').textContent = o.shutter + ' · ISO ' + o.iso + ' · ' + o.wb;
    $('o-cap-a').textContent = none ? 'Filter off' : 'Bare lens: highlights clip';
    $('o-cap-b').textContent = none ? '' : 'Through ' + o.nd;
    all('.kit-list li').forEach(li => { if (li.dataset.nd === o.nd) li.setAttribute('aria-current', 'true'); else li.removeAttribute('aria-current'); });
    // Thread the ring on when the filter changes.
    if (animate && shownND !== null && shownND !== o.nd && !none) {
      const ring = scene.querySelector('.scene-ring');
      ring.classList.remove('turn'); void ring.getBoundingClientRect(); ring.classList.add('turn');
    }
    shownND = o.nd;

    if (img.getAttribute('src') !== L.img) {
      if (animate) {
        scene.classList.add('swap');
        setTimeout(() => { img.onload = () => scene.classList.remove('swap'); img.src = L.img; raw.src = L.img; img.alt = L.alt; }, 200);
      } else { img.src = L.img; raw.src = L.img; img.alt = L.alt; }
    }
  }

  const bind = (attr, set) => all('[data-' + attr + ']').forEach(b => b.addEventListener('click', () => { set(b.dataset[attr]); render(true); }));
  bind('light', v => { light = v; store.set('light', v); });
  bind('fps', v => { fps = v; store.set('fps', v); });
  render(false);

  /* ---------- Rig checklist ---------- */
  const boxes = [...all('[data-step]')];
  const done = store.get('rig', {});
  // One small ring per item, filled when ticked; the text count stays the accessible value.
  const rings = (id, list) => { $(id).innerHTML = list.map(b => b.checked ? '<i class="on"></i>' : '<i></i>').join(''); };
  const count = () => { $('rig-count').textContent = boxes.filter(b => b.checked).length + ' of ' + boxes.length; rings('rig-prog', boxes); };
  boxes.forEach(b => {
    b.checked = !!done[b.dataset.step];
    b.addEventListener('change', () => { done[b.dataset.step] = b.checked; store.set('rig', done); count(); });
  });
  $('rig-reset').addEventListener('click', () => { boxes.forEach(b => { b.checked = false; done[b.dataset.step] = false; }); store.set('rig', done); count(); });
  count();

  /* ---------- Pre-flight checklist ---------- */
  const pre = [...all('[data-pre]')];
  const preDone = store.get('pre', {});
  const preCount = () => { $('pre-count').textContent = pre.filter(b => b.checked).length + ' of ' + pre.length; rings('pre-prog', pre); };
  pre.forEach(b => {
    b.checked = !!preDone[b.dataset.pre];
    b.addEventListener('change', () => { preDone[b.dataset.pre] = b.checked; store.set('pre', preDone); preCount(); });
  });
  $('pre-reset').addEventListener('click', () => { pre.forEach(b => { b.checked = false; preDone[b.dataset.pre] = false; }); store.set('pre', preDone); preCount(); });
  preCount();

  /* keep the screen awake while the card is open */
  let wake = null;
  async function stayAwake() {
    if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
    try { wake = await navigator.wakeLock.request('screen'); } catch {}
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') stayAwake(); });
  stayAwake();

  /* offline: cache the card for use without signal */
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    // When a newer version takes over, reload once so it shows straight away.
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloaded) return;
      reloaded = true; location.reload();
    });
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(r => r.update()).catch(() => {});
      if (navigator.onLine) navigator.serviceWorker.ready.then(r => r.active && r.active.postMessage('warm'));
    });
  }
})();
