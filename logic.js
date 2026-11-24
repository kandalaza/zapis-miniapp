'use strict';

/* Данные демо: заведение из параметров, свободные окна, записи в localStorage, примерные данные владельца.
 * Без интерфейса: экраны в app.js. */

(function () {
  const D = window.Demo;

  /* ---------- Форматирование ---------- */

  const money = (n) => `${Math.round(Number(n) || 0).toLocaleString('ru-RU').replace(/,/g, ' ')} ₽`;
  function plural(n, one, few, many) {
    const a = Math.abs(n) % 100; const b = a % 10;
    if (a > 10 && a < 20) return many;
    if (b > 1 && b < 5) return few;
    return b === 1 ? one : many;
  }
  const duration = (min) => { const h = Math.floor(min / 60); const m = min % 60; return [h ? `${h} ч` : '', m ? `${m} мин` : ''].filter(Boolean).join(' '); };
  const priceText = (s) => (s.p ? `${s.f ? 'от ' : ''}${money(s.p)}` : 'бесплатно');
  const WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  const WD_FULL = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
  const today = () => iso(new Date());
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const toTime = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
  const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
  function dayTitle(s) {
    const diff = daysBetween(today(), s);
    if (diff === 0) return 'сегодня';
    if (diff === 1) return 'завтра';
    if (diff === -1) return 'вчера';
    const d = parse(s);
    return `${WD[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`;
  }
  const dayLong = (s) => { const d = parse(s); return `${d.getDate()} ${MON[d.getMonth()]}`; };
  const initials = (name) => String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

  /* ---------- Случайность, одинаковая для одного заведения ---------- */

  function rng(seed) {
    let a = seed >>> 0;
    return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const chance = (key) => (D.hash(key) % 1000) / 1000;

  /* ---------- Заведение из параметров ---------- */

  function decode(c) {
    try {
      const b64 = String(c).replace(/-/g, '+').replace(/_/g, '/');
      const bin = atob(b64 + '==='.slice((b64.length + 3) % 4));
      const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch { return null; }
  }

  /** Параметры: ?c=base64url(JSON) от бота, start_param (сфера или тот же JSON), или простые name/sphere/address. */
  function readParams(tg) {
    const q = new URLSearchParams(location.search);
    const hash = new URLSearchParams(location.hash.slice(1));
    const start = (tg && tg.initDataUnsafe && tg.initDataUnsafe.start_param) || q.get('tgWebAppStartParam') || hash.get('tgWebAppStartParam') || '';
    let data = q.get('c') ? decode(q.get('c')) : null;
    if (!data && start) data = Object.hasOwn(D.SPHERES, start) ? { s: start } : decode(start);
    if (!data || typeof data !== 'object' || Array.isArray(data)) data = {};
    /* Всё из ссылки недоверенное: только строки и числа нужной длины и в нужных пределах (те же лимиты, что в боте). */
    const str = (v, n) => (typeof v === 'string' || typeof v === 'number' ? String(v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n) : undefined);
    const pick = (k, alt, n) => str(data[k] !== undefined ? data[k] : q.get(alt) || undefined, n) || undefined;
    const num = (v, min, max) => { const x = Number(v); return Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : 0; };
    const variant = Number.isInteger(data.v) ? data.v : (q.get('palette') !== null ? Number(q.get('palette')) : NaN);
    const services = (Array.isArray(data.sv) ? data.sv : []).filter((s) => Array.isArray(s) && str(s[0], 44)).slice(0, 8)
      .map((s) => [str(s[0], 44), Math.round(num(s[1], 0, 10000000)), Math.round(num(s[2], 10, 600)) || 60, s[3] ? 1 : 0]);
    const masters = (Array.isArray(data.m) ? data.m : []).map((m) => str(m, 24)).filter(Boolean).slice(0, 4);
    return {
      name: pick('n', 'name', 60),
      sphere: pick('s', 'sphere', 20),
      mood: pick('mo', 'mood', 20),
      variant: Number.isInteger(variant) ? Math.abs(variant) % 6 : undefined,
      address: pick('a', 'address', 90),
      phone: pick('p', 'phone', 24),
      rating: num(pick('r', 'rating', 6), 0, 5),
      reviews: Math.round(num(pick('rc', 'reviews', 7), 0, 100000)),
      services: services.length ? services : null,
      masters: masters.length ? masters : null,
      theme: ['light', 'dark'].includes(q.get('theme')) ? q.get('theme') : '',
      plan: ['start', 'noshow', 'admin'].includes(data.pl) ? data.pl : (['start', 'noshow', 'admin'].includes(q.get('plan')) ? q.get('plan') : 'admin'),
      options: (Array.isArray(data.op) ? data.op : String(q.get('options') || '').split(',')).map((o) => str(o, 20)).filter((o) => o && /^[a-z]+$/.test(o)).slice(0, 12),
    };
  }

  function buildVenue(params) {
    const sphereGuess = params.sphere && Object.hasOwn(D.SPHERES, params.sphere) ? params.sphere
      : D.sphereOf(params.name, (params.services || []).map((s) => s[0]));
    const base = D.SPHERES[sphereGuess];
    const name = String(params.name || `${base.label} «Пример»`).slice(0, 60);
    const style = D.pickStyle({ name, sphere: sphereGuess, mood: params.mood, variant: params.variant });
    const services = (params.services && params.services.length
      ? params.services.map((s, i) => ({ id: `s${i}`, t: String(s[0] || 'Услуга'), p: Number(s[1]) || 0, d: Number(s[2]) || 60, f: s[3] ? 1 : 0 }))
      : base.services.map((s, i) => ({ id: `s${i}`, ...s })));
    const masterNames = params.masters && params.masters.length ? params.masters : null;
    const masters = (masterNames || base.masters.map((m) => m[0])).map((n, i) => {
      const preset = base.masters[i % base.masters.length];
      return { id: `m${i}`, name: n, role: preset[1], rating: preset[2], since: 2 + (D.hash(n) % 7) };
    });
    const h = D.hash(name);
    return {
      name, style, sphere: sphereGuess, base,
      address: params.address || 'Адрес появится здесь',
      addressReal: Boolean(params.address),
      phone: params.phone || '',
      rating: params.rating || 4.9,
      reviewsCount: params.reviews || (80 + (h % 160)),
      ratingSample: !params.rating,
      services, masters,
      open: 10 * 60, close: 21 * 60, step: 30,
    };
  }

  /* ---------- Записи в localStorage ---------- */

  function makeStore(venue) {
    const key = `zapis-demo:${D.hash(venue.name)}`;
    let state = null;
    const blank = () => ({ v: 1, bookings: [], decided: {}, invited: {}, seeded: false, demo: {}, prices: {}, closed: [], notes: {}, black: {}, waitlist: [], manual: [], expenses: null, features: {}, fset: {}, look: '' });
    function load() {
      if (state) return state;
      try { state = JSON.parse(localStorage.getItem(key) || 'null'); } catch { state = null; }
      if (!state || state.v !== 1 || !Array.isArray(state.bookings) || typeof state.decided !== 'object' || typeof state.invited !== 'object') state = blank();
      const fresh = blank();
      for (const k of Object.keys(fresh)) if (state[k] === undefined || typeof state[k] !== typeof fresh[k] || Array.isArray(state[k]) !== Array.isArray(fresh[k])) state[k] = fresh[k];
      return state;
    }
    function save() { try { localStorage.setItem(key, JSON.stringify(state)); } catch { /* приватный режим: живём в памяти */ } }
    return {
      get: load,
      save,
      reset() { state = blank(); save(); },
      update(fn) { load(); fn(state); save(); return state; },
    };
  }

  /* ---------- Свободные окна ---------- */

  function makeSlots(venue, store) {
    const cells = (start, dur) => { const out = []; for (let m = start; m < start + dur; m += venue.step) out.push(m); return out; };
    /** Занято ли полчаса у мастера: примерная загрузка ~45% плюс записи самого пользователя. */
    function busyCell(date, mid, m) {
      const own = store.get().bookings.some((b) => ['pending', 'confirmed'].includes(b.status) && b.date === date && b.masterId === mid
        && m >= toMin(b.time) && m < toMin(b.time) + b.dur);
      if (own) return true;
      const day = parse(date).getDay();
      const load = day === 5 || day === 6 ? 0.55 : 0.4;
      const block = Math.floor(m / 60);
      return chance(`${venue.name}|${date}|${mid}|${block}`) < load;
    }
    function freeFor(date, mid, dur) {
      const out = [];
      if (store.get().closed.includes(date)) return out;
      const now = new Date();
      const minStart = date === today() ? now.getHours() * 60 + now.getMinutes() + 60 : 0;
      for (let m = venue.open; m + dur <= venue.close; m += venue.step) {
        if (m < minStart) continue;
        if (cells(m, dur).every((c) => !busyCell(date, mid, c))) out.push(m);
      }
      return out;
    }
    /** Свободное время на день: Map минуты → id мастера (для «любого» первый свободный). */
    function free(date, mid, dur) {
      const map = new Map();
      const list = mid ? [mid] : venue.masters.map((m) => m.id);
      for (const id of list) for (const m of freeFor(date, id, dur)) if (!map.has(m)) map.set(m, id);
      return new Map([...map.entries()].sort((a, b) => a[0] - b[0]));
    }
    function nearest(mid, dur, count = 4, days = 14) {
      const out = [];
      for (let i = 0; i < days && out.length < count; i++) {
        const date = addDays(today(), i);
        for (const [m, id] of free(date, mid, dur)) { out.push({ date, time: toTime(m), masterId: id }); if (out.length >= count) break; }
      }
      return out;
    }
    return { free, nearest, freeFor };
  }

  /* ---------- Примерные данные владельца ---------- */

  const FIRST = ['Анна', 'Мария', 'Екатерина', 'Ольга', 'Дарья', 'Ирина', 'Алина', 'Полина', 'Виктория', 'Ксения', 'Алексей', 'Дмитрий', 'Иван', 'Максим', 'Сергей', 'Никита', 'Артём', 'Елена', 'Юлия', 'Наталья', 'Софья', 'Роман', 'Павел', 'Вероника'];
  const LAST = ['С.', 'К.', 'М.', 'Л.', 'Б.', 'Д.', 'П.', 'Р.', 'Г.', 'Н.', 'Т.', 'В.'];
  const COMMENTS = ['Можно чуть пораньше, если освободится?', 'Первый раз у вас', 'Хочу как в прошлый раз', '', 'Подскажите, где парковка?', '', 'Буду с ребёнком, можно?', ''];

  function ownerData(venue, store) {
    const r = rng(D.hash(`${venue.name}|owner`));
    const pickOne = (list) => list[Math.floor(r() * list.length)];
    const svc = () => pickOne(venue.services.filter((s) => s.p > 0).length ? venue.services.filter((s) => s.p > 0) : venue.services);
    const phone = () => `+7 9${Math.floor(r() * 90 + 10)} ${Math.floor(r() * 900 + 100)}-${pad(Math.floor(r() * 90 + 10))}-${pad(Math.floor(r() * 90 + 10))}`;

    const clients = Array.from({ length: 16 }, (_, i) => {
      const s = svc();
      const visits = 1 + Math.floor(r() * 14);
      const last = Math.floor(r() * r() * 120) + 2;
      return {
        id: `c${i}`, name: `${FIRST[(i * 7 + 3) % FIRST.length]} ${LAST[i % LAST.length]}`, phone: phone(), visits,
        sum: visits * (s.p || 1500) * (0.8 + r() * 0.5), last, fav: s.t, master: pickOne(venue.masters).name,
      };
    }).sort((a, b) => a.last - b.last);

    const requests = Array.from({ length: 3 }, (_, i) => {
      const s = svc(); const c = clients[(i * 5 + 2) % clients.length];
      const date = addDays(today(), 1 + i);
      return { id: `r${i}`, client: c.name, phone: c.phone, visits: i === 1 ? 0 : c.visits, service: s.t, price: s.p, f: s.f, dur: s.d,
        date, time: toTime(venue.open + 60 * (2 + Math.floor(r() * 7))), master: pickOne(venue.masters).name, comment: COMMENTS[(i * 3) % COMMENTS.length] };
    });

    /* Расписание: на сегодня визиты по мастерам; на неделю загрузка по дням. */
    function daySchedule(date) {
      const rr = rng(D.hash(`${venue.name}|day|${date}`));
      const out = [];
      for (const m of venue.masters) {
        let t = venue.open + Math.floor(rr() * 3) * 30;
        while (t < venue.close - 30) {
          const s = venue.services[Math.floor(rr() * venue.services.length)];
          const d = Math.max(30, s.d);
          if (t + d > venue.close) break;
          if (rr() < 0.68) out.push({ time: toTime(t), end: toTime(t + d), dur: d, master: m.name, masterId: m.id, service: s.t, price: s.p, client: clients[Math.floor(rr() * clients.length)].name, status: rr() < 0.85 ? 'confirmed' : 'pending' });
          t += d + (rr() < 0.4 ? 30 : 0);
        }
      }
      const own = store.get().bookings.filter((b) => b.date === date && ['pending', 'confirmed'].includes(b.status));
      for (const b of own) {
        const m = venue.masters.find((x) => x.id === b.masterId) || venue.masters[0];
        out.push({ time: b.time, end: toTime(toMin(b.time) + b.dur), dur: b.dur, master: m.name, masterId: m.id, service: b.titles.join(', '), price: b.total, client: `${b.name || 'Вы'} (это вы)`, status: b.status, own: true });
      }
      for (const x of store.get().manual.filter((x) => x.date === date)) {
        const m = venue.masters.find((mm) => mm.id === x.masterId) || venue.masters[0];
        out.push({ time: x.time, end: toTime(toMin(x.time) + x.dur), dur: x.dur, master: m.name, masterId: m.id, service: x.title, price: x.price, client: `${x.name} (записали вручную)`, status: 'confirmed', own: true });
      }
      return out.sort((a, b) => toMin(a.time) - toMin(b.time));
    }
    const capacity = venue.masters.length * (venue.close - venue.open);
    function weekLoad() {
      return Array.from({ length: 7 }, (_, i) => {
        const date = addDays(today(), i);
        const list = daySchedule(date);
        const busy = list.reduce((a, x) => a + x.dur, 0);
        return { date, count: list.length, load: Math.min(1, busy / capacity), sum: list.reduce((a, x) => a + (x.price || 0), 0) };
      });
    }

    /* Выручка: 7 последних дней и 4 недели месяца. */
    const avg = venue.services.reduce((a, s) => a + (s.p || 0), 0) / Math.max(1, venue.services.filter((s) => s.p).length) || 2000;
    const perDay = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(today(), i - 6); const day = parse(date).getDay();
      const visits = Math.round((venue.masters.length * (day === 0 ? 3 : 5)) * (0.75 + r() * 0.5));
      return { date, visits, sum: Math.round(visits * avg * (0.9 + r() * 0.25) / 100) * 100 };
    });
    const perWeek = Array.from({ length: 4 }, (_, i) => {
      const visits = Math.round(venue.masters.length * 30 * (0.8 + r() * 0.35));
      return { label: `${i + 1}-я неделя`, visits, sum: Math.round(visits * avg * (0.9 + r() * 0.2) / 100) * 100 };
    });
    const byService = venue.services.filter((s) => s.p).map((s) => ({ title: s.t, share: 0.2 + r() })).sort((a, b) => b.share - a.share).slice(0, 4);
    const shareSum = byService.reduce((a, x) => a + x.share, 0);
    byService.forEach((x) => { x.share /= shareSum; });
    const byMaster = venue.masters.map((m) => ({ name: m.name, share: 0.5 + r() })); const ms = byMaster.reduce((a, x) => a + x.share, 0);
    byMaster.forEach((x) => { x.share /= ms; });

    return { clients, requests, daySchedule, weekLoad, perDay, perWeek, byService, byMaster, growth: 8 + Math.floor(r() * 17), noshowBefore: 14 + Math.floor(r() * 8), noshowNow: 2 + Math.floor(r() * 3) };
  }

  window.Logic = { money, plural, duration, priceText, dayTitle, dayLong, iso, parse, addDays, today, toMin, toTime, daysBetween, initials, WD, WD_FULL, MON, readParams, buildVenue, makeStore, makeSlots, ownerData, rng };
})();
