'use strict';

/* Экраны демо-приложения: клиент (главная, запись, мои записи) и владелец (заявки, расписание, клиенты, выручка). */

(function () {
  const { inTelegram, main, back, haptic } = window.TG;
  const L = window.Logic;
  const D = window.Demo;
  const PORTFOLIO = 'https://askhab-dev.netlify.app';

  /* ---------- Безопасная сборка HTML: всё подставленное экранируется, кроме raw() ---------- */

  const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  class Raw { constructor(s) { this.s = s; } toString() { return this.s; } }
  const raw = (s) => new Raw(String(s));
  const out = (v) => (v instanceof Raw ? v.s : Array.isArray(v) ? v.map(out).join('') : v === null || v === undefined || v === false ? '' : esc(v));
  const html = (strings, ...vals) => raw(strings.reduce((acc, s, i) => acc + s + (i < vals.length ? out(vals[i]) : ''), ''));

  /* ---------- Иконки: тонкая линия, цвет текста ---------- */

  const svg = (d, extra = '') => raw(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`);
  const I = {
    arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    checkBold: svg('<path d="M5 12.5l4.5 4.5L19 7.5" stroke-width="2.6"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
    star: svg('<path d="M12 3.6l2.55 5.2 5.75.84-4.16 4.05.98 5.72L12 16.7l-5.12 2.7.98-5.72L3.7 9.64l5.75-.84z" fill="currentColor" stroke="none"/>'),
    pin: svg('<path d="M12 21s-6.5-5.9-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 15.1 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.4"/>'),
    phone: svg('<path d="M6.6 3.8h2.8l1.4 3.7-1.9 1.3a10.5 10.5 0 0 0 6.3 6.3l1.3-1.9 3.7 1.4v2.8a1.9 1.9 0 0 1-2 1.9A15.6 15.6 0 0 1 4.7 5.8a1.9 1.9 0 0 1 1.9-2z"/>'),
    clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    cal: svg('<rect x="4" y="5.5" width="16" height="14.5" rx="3"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>'),
    user: svg('<circle cx="12" cy="8.5" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0"/>'),
    users: svg('<circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M15.5 6.2a3 3 0 0 1 0 5.6M17 13.6a5.3 5.3 0 0 1 3.5 5"/>'),
    bell: svg('<path d="M6.5 16v-4.8a5.5 5.5 0 0 1 11 0V16l1.5 2h-14z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'),
    chev: svg('<path d="M9.5 6l6 6-6 6"/>', 'class="chev"'),
    back: svg('<path d="M15 5.5L8.5 12l6.5 6.5"/>'),
    home: svg('<path d="M4 10.8L12 4.5l8 6.3V19a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19z"/>'),
    store: svg('<path d="M4.5 9.5L6 4.5h12l1.5 5M4.5 9.5v10h15v-10M4.5 9.5h15M9.5 19.5v-5h5v5"/>'),
    repeat: svg('<path d="M16.5 3.5l3 3-3 3M4.5 11V9.5a3 3 0 0 1 3-3h12M7.5 20.5l-3-3 3-3M19.5 13v1.5a3 3 0 0 1-3 3h-12"/>'),
    msg: svg('<path d="M4.5 5.5h15v10.5H10l-5.5 4z"/>'),
    route: svg('<path d="M12 3.5l6.5 17-6.5-3.6-6.5 3.6z"/>'),
    sunrise: svg('<path d="M3 18.5h18M6.5 15a5.5 5.5 0 0 1 11 0M12 4.5v3M5.2 8.2l1.6 1.6M18.8 8.2l-1.6 1.6"/>'),
    sun: svg('<circle cx="12" cy="12" r="3.8"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>'),
    moon: svg('<path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1z"/>'),
    search: svg('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>'),
    up: svg('<path d="M6 15l6-6 6 6"/>'),
    sparkle: svg('<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1-5.1-1.9 5.1-1.9z"/><path d="M18.5 16l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>'),
    x: svg('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>'),
    shield: svg('<path d="M12 3.5l7 2.8v5.2c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6.3z"/><path d="M9 12l2.2 2.2L15.5 10"/>'),
  };

  /* ---------- Заведение, стиль, хранилище ---------- */

  const params = L.readParams(window.TG.tg);
  const venue = L.buildVenue(params);
  const look = D.themeOf(venue.style);
  const store = L.makeStore(venue);
  // Сброс демо только вне Telegram: ссылка с reset=1 не должна стирать чужие записи.
  if (!inTelegram && new URLSearchParams(location.search).get('reset') === '1') store.reset();
  const slots = L.makeSlots(venue, store);
  const owner = L.ownerData(venue, store);
  const svcById = (id) => venue.services.find((s) => s.id === id);
  const master = (id) => venue.masters.find((m) => m.id === id);
  const who = venue.base.who;
  const firstPaid = venue.services.find((s) => s.p > 0) || venue.services[0];
  const minDur = Math.min(...venue.services.map((s) => s.d), 60);

  /* ---------- Пакет и опции: как в боте (src/plans.js). Бот передаёт пакет и опции заведения,
   * владелец в демо может переключать их на экране «Опции» (хранится только на этом телефоне). ---------- */
  const X = window.Extras;
  // Мини-приложение продаётся вместе с «Администратором 24/7»: в нём всегда полный набор, большие опции по заказу заведения.
  const planKey = () => 'admin';
  /* Владелец включает и выключает функции в «Настройках»: переключатель важнее набора по умолчанию. */
  const NEW_FEATURES = ['firstvisit', 'gift'];
  function has(key) {
    const o = store.get().features;
    if (Object.hasOwn(o, key)) return Boolean(o[key]);
    return X.PLANS.admin.features.includes(key) || params.options.includes(key);
  }
  /** Число из настроек функции (скидка, процент) или значение по умолчанию. */
  const F = (key, def) => { const v = store.get().fset[key]; return Number.isFinite(v) ? v : def; };
  const basePrices = Object.fromEntries(venue.services.map((s) => [s.id, s.p]));
  function applyPrices() { const pr = store.get().prices; venue.services.forEach((s) => { s.p = Number.isFinite(pr[s.id]) ? pr[s.id] : basePrices[s.id]; }); }
  applyPrices();
  const briefQs = () => X.brief(venue.sphere) || [];
  const needBrief = (ids) => has('brief') && briefQs().length > 0 && ids.some((id) => svcById(id) && X.briefFor(venue.sphere, svcById(id).t));
  function prepayFor(ids) {
    if (!has('prepay')) return 0;
    const sum = ids.reduce((a, id) => a + (svcById(id) ? svcById(id).p : 0), 0);
    const rule = X.prepay(venue.sphere);
    if (sum < rule.min) return 0;
    const pct = F('prepay', rule.percent || 20);
    return Number.isFinite(store.get().fset.prepay) || !rule.amount ? Math.max(500, Math.round((sum * pct) / 100 / 100) * 100) : rule.amount;
  }

  store.update((s) => {
    if (s.seeded) return;
    s.seeded = true;
    s.bookings.push({ id: 'past1', services: [firstPaid.id], titles: [firstPaid.t], masterId: venue.masters[0].id, date: L.addDays(L.today(), -12), time: '15:00', dur: firstPaid.d, total: firstPaid.p, status: 'done', name: '', phone: '', created: Date.now() - 12 * 86400000 });
  });

  /* ---------- Цвета ---------- */

  const rgb = (h) => { const x = h.replace('#', ''); const v = x.length === 3 ? x.split('').map((c) => c + c).join('') : x; return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16)); };
  const hex = (c) => `#${c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`;
  const mix = (a, b, t) => { const x = rgb(a); const y = rgb(b); return hex(x.map((v, i) => v + (y[i] - v) * t)); };
  const lum = (h) => { const c = rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const contrast = (a, b) => { const x = lum(a); const y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const alpha = (h, a) => { const c = rgb(h); return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`; };
  const isHex = (v) => /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(String(v || ''));

  let colors = {};
  function applyTheme() {
    const t = window.TG.theme(params.theme === 'dark' || params.theme === 'light' ? params.theme : '');
    const c = t.colors;
    const pick = (k, f) => (isHex(c[k]) ? c[k] : f);
    const bg = pick('secondary_bg_color', t.dark ? '#000000' : '#f2f2f7');
    const card = pick('section_bg_color', pick('bg_color', t.dark ? '#1c1c1d' : '#ffffff'));
    const text = pick('text_color', t.dark ? '#ffffff' : '#000000');
    const hint = pick('hint_color', t.dark ? '#98989e' : '#8e8e93');
    const p = look.palette;

    let accent = p.a;
    if (contrast(accent, card) < 1.6) accent = contrast(p.c, card) >= 3 ? p.c : p.ink;
    if (t.dark) for (let i = 0; i < 8 && contrast(accent, card) < 3; i++) accent = mix(accent, '#ffffff', 0.15);
    let accentText = accent;
    for (let i = 0; i < 10 && contrast(accentText, card) < 4.5; i++) accentText = mix(accentText, t.dark ? '#ffffff' : '#000000', 0.12);
    const accentInk = contrast(accent, '#ffffff') >= contrast(accent, '#111111') ? '#ffffff' : '#111111';

    let cover = p.c; let coverInk = p.ink;
    if (t.dark && lum(cover) > 0.4) { cover = mix(p.ink, '#000000', 0.35); coverInk = p.c; }
    if (contrast(cover, coverInk) < 4.5) coverInk = lum(cover) > 0.4 ? '#111111' : '#ffffff';
    const coverAccent = contrast(p.a, cover) >= 2.2 ? p.a : coverInk;

    colors = { bg, card, text, hint, accent, accentInk, cover, coverInk, dark: t.dark };
    const r = document.documentElement.style;
    const set = (k, v) => r.setProperty(k, v);
    set('--bg', bg); set('--card', card); set('--text', text); set('--hint', hint);
    set('--sep', alpha(text, t.dark ? 0.14 : 0.1));
    set('--danger', pick('destructive_text_color', t.dark ? '#ff453a' : '#ff3b30'));
    set('--accent', accent); set('--accent-ink', accentInk); set('--accent-text', accentText);
    set('--accent-soft', alpha(accent, t.dark ? 0.2 : 0.12));
    set('--cover', cover); set('--cover-ink', coverInk); set('--cover-accent', coverAccent);
    set('--cover-accent-ink', contrast(coverAccent, '#ffffff') >= contrast(coverAccent, '#111111') ? '#ffffff' : '#111111');
    set('--cover-soft', alpha(coverInk, 0.68)); set('--cover-line', alpha(coverInk, 0.13));
    set('--r', `${Math.min(look.radius, 24)}px`); set('--r-sm', `${Math.min(look.radius, 14)}px`);
    set('--r-btn', look.pill ? '999px' : `${Math.max(look.radius, 4)}px`);
    set('--font-display', look.display); set('--font-ui', look.ui);
    set('--font-italic', look.italic || look.display);
    const family = look.display.split(',')[0].replace(/"/g, '');
    const weight = { Oswald: 600, Prata: 400, 'Cormorant Garamond': 600, Jost: 600, Nunito: 800, Manrope: 800 }[family] || 700;
    set('--display-weight', String(weight));
    // У Cormorant и Prata цифры старостильные (прыгают по высоте): крупные цифры в таких стилях набираются тонким Jost.
    const oldstyle = ['Cormorant Garamond', 'Prata'].includes(family);
    set('--font-num', oldstyle ? '"Jost", "Avenir Next", Futura, sans-serif' : look.display);
    set('--num-weight', oldstyle ? '400' : String(weight));
    set('--display-case', look.upper ? 'uppercase' : 'none');
    set('--display-track', look.upper ? (family === 'Oswald' ? '0.01em' : '0.03em') : (family === 'Cormorant Garamond' ? '-0.01em' : '-0.02em'));
    set('--shadow', t.dark ? '0 0 0 1px rgba(255,255,255,.06)' : '0 1px 2px rgba(0,0,0,.04), 0 10px 28px -14px rgba(0,0,0,.16)');
    const cls = document.documentElement.classList;
    cls.toggle('dark', t.dark); cls.toggle('in-tg', inTelegram); cls.toggle('no-italic', !look.italic);
    cls.toggle('cover-dark', lum(cover) < 0.3);
    chrome();
  }
  function chrome() {
    const top = stack.length ? stack[stack.length - 1] : null;
    const onCover = !top || ['home', 'owner'].includes(top.name);
    window.TG.setChrome(onCover ? colors.cover : colors.bg, colors.bg);
  }

  /* ---------- Узоры обложек: рисуются кодом, у каждой сферы свой ---------- */

  function art(kind, seed = 1) {
    const r = L.rng(D.hash(venue.name) + seed);
    const ink = 'var(--cover-ink)';
    const acc = 'var(--cover-accent)';
    const W = 400; const H = 320;
    let g = '';
    const line = (d, o = 0.16, w = 1.2, col = ink) => `<path d="${d}" stroke="${col}" stroke-opacity="${o}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
    const circle = (cx, cy, rr, o = 0.14, w = 1.2, col = ink, fill = 'none') => `<circle cx="${cx}" cy="${cy}" r="${rr}" stroke="${col}" stroke-opacity="${o}" stroke-width="${w}" fill="${fill}"/>`;
    const star = (x, y, s, o = 0.4, col = ink) => `<path d="M${x} ${y - s}C${x + s * 0.15} ${y - s * 0.15} ${x + s * 0.15} ${y - s * 0.15} ${x + s} ${y}C${x + s * 0.15} ${y + s * 0.15} ${x + s * 0.15} ${y + s * 0.15} ${x} ${y + s}C${x - s * 0.15} ${y + s * 0.15} ${x - s * 0.15} ${y + s * 0.15} ${x - s} ${y}C${x - s * 0.15} ${y - s * 0.15} ${x - s * 0.15} ${y - s * 0.15} ${x} ${y - s}Z" fill="${col}" fill-opacity="${o}"/>`;
    switch (kind) {
      case 'flash': {
        for (let y = 20; y < H; y += 14) for (let x = 150; x < W; x += 14) { const d = Math.hypot(x - 300, y - 110); if (d < 150 && r() > d / 170) g += `<circle cx="${x}" cy="${y}" r="1.3" fill="${ink}" fill-opacity="${0.28 - d / 700}"/>`; }
        g += circle(300, 110, 92, 0.22, 1.4) + circle(300, 110, 70, 0.12, 1, ink);
        g += star(300, 110, 30, 0.9, acc) + star(220, 46, 9, 0.5) + star(372, 210, 12, 0.45) + star(196, 190, 6, 0.4);
        break;
      }
      case 'stripes': {
        for (let i = -6; i < 16; i++) g += `<rect x="${i * 34}" y="-60" width="15" height="460" fill="${i % 4 === 0 ? acc : ink}" fill-opacity="${i % 4 === 0 ? 0.32 : 0.06}" transform="rotate(32 200 160)"/>`;
        g = `<g mask="url(#fade)">${g}</g>`;
        break;
      }
      case 'swatches': {
        const shades = [acc, ink, acc, ink, acc];
        const ops = [0.95, 0.2, 0.55, 0.35, 0.3];
        for (let i = 0; i < 5; i++) {
          const x = 170 + i * 44; const y = 18 + Math.abs(i - 2) * 14; const rot = (i - 2) * 7;
          g += `<g transform="translate(${x} ${y}) rotate(${rot} 20 60)"><path d="M0 46C0 14 14 0 20 0s20 14 20 46v58a10 10 0 0 1-10 10H10a10 10 0 0 1-10-10z" fill="${shades[i]}" fill-opacity="${ops[i]}"/><path d="M8 16c3-7 7-9 9-9" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round" fill="none"/></g>`;
        }
        break;
      }
      case 'arcs': {
        for (let i = 0; i < 6; i++) g += line(`M${170 + i * 6} ${150 - i * 14}Q${280} ${40 - i * 16} ${400 - i * 4} ${110 - i * 10}`, 0.1 + i * 0.03, 1.4);
        for (let i = 0; i < 13; i++) { const a = Math.PI * (0.15 + i * 0.055); g += line(`M300 230L${300 + Math.cos(a) * 120} ${230 - Math.sin(a) * 120}`, 0.14, 1.1); }
        g += line('M220 230Q300 190 380 230', 0.4, 2, acc);
        break;
      }
      case 'glow': {
        g += `<circle cx="300" cy="90" r="150" fill="url(#glow)"/>`;
        for (let i = 1; i < 7; i++) g += circle(300, 90, i * 28, 0.18 - i * 0.02, 1);
        break;
      }
      case 'waves': {
        for (let i = 0; i < 9; i++) { const y = 40 + i * 26; let d = `M120 ${y}`; for (let x = 120; x <= W; x += 20) d += `L${x} ${y + Math.sin((x + i * 30) / 38) * (8 + i)}`; g += line(d, 0.08 + (i % 3 === 0 ? 0.12 : 0.04), i % 3 === 0 ? 1.6 : 1, i === 3 ? acc : ink); }
        break;
      }
      case 'arches': {
        for (let i = 0; i < 4; i++) { const x = 170 + i * 62; const h = 150 + (i % 2) * 30; g += line(`M${x} 330V${330 - h + 26}a26 26 0 0 1 52 0V330`, i === 1 ? 0.5 : 0.18, i === 1 ? 1.6 : 1.2, i === 1 ? acc : ink); }
        for (let i = 0; i < 3; i++) g += line(`M${200 + i * 70} 60q6-10 0-20q-6-10 0-20`, 0.18, 1.2);
        break;
      }
      case 'strands': {
        for (let i = 0; i < 11; i++) { const x = 170 + i * 20; g += line(`M${x} -10C${x + 60} 80 ${x - 50} 160 ${x + 30} 340`, i === 5 ? 0.6 : 0.08 + (i % 2) * 0.06, i === 5 ? 1.8 : 1.2, i === 5 ? acc : ink); }
        break;
      }
      case 'hex': {
        const s = 26; const hh = s * Math.sqrt(3);
        for (let row = -1; row < 9; row++) for (let col = 0; col < 9; col++) {
          const x = 140 + col * s * 1.5; const y = row * hh + (col % 2 ? hh / 2 : 0);
          const pts = Array.from({ length: 6 }, (_, k) => `${x + s * Math.cos(Math.PI / 3 * k)},${y + s * Math.sin(Math.PI / 3 * k)}`).join(' ');
          const hot = (row === 2 && col === 4);
          g += `<polygon points="${pts}" stroke="${hot ? acc : ink}" stroke-opacity="${hot ? 0.8 : 0.1 + ((x - 140) / 2600)}" stroke-width="${hot ? 1.8 : 1}" fill="${hot ? acc : 'none'}" fill-opacity="${hot ? 0.18 : 0}"/>`;
        }
        g = `<g mask="url(#fade)">${g}</g>`;
        break;
      }
      case 'rays': {
        for (let i = 0; i < 22; i++) { const y = 10 + i * 14; const len = 60 + r() * 220; const x = W - len - r() * 40; g += line(`M${x} ${y + 60}L${x + len} ${y - 40}`, i === 7 ? 0.9 : 0.06 + r() * 0.14, i === 7 ? 3 : 1.4, i === 7 ? acc : ink); }
        break;
      }
      case 'springs': {
        for (let i = 0; i < 9; i++) g += `<ellipse cx="${190 + i * 22}" cy="120" rx="16" ry="44" stroke="${ink}" stroke-opacity=".18" stroke-width="1.2" fill="none"/>`;
        g += circle(330, 230, 46, 0.5, 1.6, acc) + circle(330, 230, 70, 0.12, 1);
        break;
      }
      case 'confetti': {
        const cols = [acc, ink];
        for (let i = 0; i < 22; i++) { const x = 140 + r() * 260; const y = r() * 300; const c = cols[i % 2]; g += i % 3 ? `<circle cx="${x}" cy="${y}" r="${3 + r() * 6}" fill="${c}" fill-opacity="${0.25 + r() * 0.5}"/>` : line(`M${x} ${y}q8 -10 16 0t16 0`, 0.5, 3, c); }
        break;
      }
      case 'grid': {
        for (let x = 140; x <= W; x += 32) g += line(`M${x} 0V${H}`, 0.08);
        for (let y = 0; y <= H; y += 32) g += line(`M140 ${y}H${W}`, 0.08);
        g += `<rect x="300" y="96" width="32" height="32" fill="${acc}" fill-opacity=".7"/>`;
        g = `<g mask="url(#fade)">${g}</g>`;
        break;
      }
      default: {
        for (let i = 1; i < 9; i++) g += circle(310, 90, i * 26, 0.2 - i * 0.018, 1, i === 3 ? acc : ink);
        g += `<circle cx="310" cy="90" r="6" fill="${acc}"/>`;
      }
    }
    const defs = `<defs><linearGradient id="fadeG" x1="0" x2="1"><stop offset=".2" stop-color="#fff" stop-opacity="0"/><stop offset=".75" stop-color="#fff"/></linearGradient><mask id="fade"><rect width="${W}" height="${H}" fill="url(#fadeG)"/></mask><radialGradient id="glow"><stop offset="0" stop-color="var(--cover-accent)" stop-opacity=".55"/><stop offset="1" stop-color="var(--cover-accent)" stop-opacity="0"/></radialGradient></defs>`;
    return raw(`<div class="hero__art"><svg viewBox="0 0 ${W} ${H}" aria-hidden="true">${defs}${g}</svg></div>`);
  }

  /* ---------- Мелочи интерфейса ---------- */

  const heading = (text, accentWord, cls = 'h1') => html`<h1 class="display ${cls}">${text}${accentWord ? html` <em>${accentWord}</em>` : ''}</h1>`;
  const stars = (n) => html`<span class="stars" aria-label="${n} из 5">${[1, 2, 3, 4, 5].map((i) => html`<span class="${i <= Math.round(n) ? '' : 'off'}">${I.star}</span>`)}</span>`;
  const fmtRating = (n) => Number(n).toFixed(1).replace('.', ',');
  const timeParts = (t) => { const [h, m] = t.split(':'); return html`${h}<span>:</span>${m}`; };
  const timeHero = (t) => { const [h, m] = t.split(':'); return html`${h}<span>:</span>${m}`; };
  const statusChip = (s) => ({
    pending: html`<span class="chip chip--wait">${I.clock}Ждёт подтверждения</span>`,
    request: html`<span class="chip chip--wait">${I.clock}Мастер назначит время</span>`,
    confirmed: html`<span class="chip chip--ok">${I.check}Подтверждена</span>`,
    done: html`<span class="chip chip--off">Визит состоялся</span>`,
    cancelled: html`<span class="chip chip--off">Отменена</span>`,
    declined: html`<span class="chip chip--off">Отклонена</span>`,
  })[s] || '';
  const visitsText = (n) => (n ? `${n}-й визит` : 'новый клиент');
  const lower = (t) => (/^[А-ЯЁA-Z][а-яёa-z]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t);
  const sumOf = (ids) => ids.reduce((a, id) => a + (svcById(id) ? svcById(id).p : 0), 0);
  const durOf = (ids) => ids.reduce((a, id) => a + (svcById(id) ? svcById(id).d : 0), 0);
  const fromOf = (ids) => ids.some((id) => svcById(id) && svcById(id).f);
  const totalText = (ids) => { const s = sumOf(ids); return s ? `${fromOf(ids) ? 'от ' : ''}${L.money(s)}` : 'бесплатно'; };
  const upcoming = () => store.get().bookings.filter((b) => (b.status === 'request') || (['pending', 'confirmed'].includes(b.status) && (b.date > L.today() || (b.date === L.today() && L.toMin(b.time) >= nowMin()))))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const past = () => store.get().bookings.filter((b) => !upcoming().includes(b)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
  const pendingRequests = () => owner.requests.filter((r) => !store.get().decided[r.id]).length + store.get().bookings.filter((b) => ['pending', 'request'].includes(b.status)).length;
  const isNewClient = () => !store.get().bookings.some((b) => b.id !== 'past1' && ['pending', 'confirmed', 'done', 'request'].includes(b.status));
  const whenText = (b) => (b.time ? `${L.dayTitle(b.date)}, ${b.time}` : `удобно: ${(b.days || [b.date]).map((d) => L.dayTitle(d).split(',')[0]).join(', ')}${b.parts && b.parts.length ? `, ${b.parts.join(', ').toLowerCase()}` : ''}`);
  const Who = who[0].toUpperCase() + who.slice(1);
  const telHref = () => { const d = String(venue.phone).replace(/[^\d+]/g, ''); return d.length >= 6 ? `tel:${d}` : ''; };
  const mapHref = () => `https://yandex.ru/maps/?text=${encodeURIComponent(`${venue.name} ${venue.addressReal ? venue.address : ''}`.trim())}`;

  let toastTimer = 0;
  function toast(text) {
    const el = document.getElementById('toast');
    el.textContent = text;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 2600);
  }

  /* ---------- Навигация: корневые вкладки и стопка шагов с системной «назад» ---------- */

  const stack = [];
  let tab = 'home';
  const ROOTS = ['home', 'bookings', 'owner'];
  const view = {};
  let draft = null;

  function go(name, args = {}, dir = 'forward') { stack.push({ name, args }); render(dir); }
  function goBack() {
    if (stack.length <= 1) return;
    stack.pop();
    haptic.tap();
    render('back');
  }
  function setTab(name) {
    if (stack.length === 1 && stack[0].name === name) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    tab = name; stack.length = 0; stack.push({ name, args: {} });
    haptic.tap();
    render('fade');
  }
  function backToRoot(name = tab) { tab = name; stack.length = 0; stack.push({ name, args: {} }); render('back'); }

  let current = null;
  function render(dir = 'fade') {
    const top = stack[stack.length - 1];
    const root = ROOTS.includes(top.name);
    const def = SCREENS[top.name](top.args || {});
    const el = document.createElement('section');
    el.className = `screen${root ? ' is-root' : ''} enter-${dir}`;
    el.innerHTML = (root ? '' : `<div class="topbar"><button class="topbar__back" type="button" data-act="back">${I.back}Назад</button></div>`) + out(def.html);
    const app = document.getElementById('app');
    const old = current;
    if (old) {
      old.classList.remove('enter-forward', 'enter-back', 'enter-fade');
      old.classList.add(`leave-${dir}`);
      old.style.top = `${-window.scrollY}px`;
      setTimeout(() => old.remove(), 480);
    }
    app.appendChild(el);
    current = el;
    window.scrollTo(0, top.scroll || 0);
    el.addEventListener('click', onClick);
    el.addEventListener('input', onInput);
    if (def.mount) def.mount(el);
    back.set(root ? null : goBack);
    main.set(def.main || null);
    renderTabs(root);
    chrome();
  }
  function refresh() {
    const top = stack[stack.length - 1];
    const def = SCREENS[top.name](top.args || {});
    const y = window.scrollY;
    current.innerHTML = (ROOTS.includes(top.name) ? '' : `<div class="topbar"><button class="topbar__back" type="button" data-act="back">${I.back}Назад</button></div>`) + out(def.html);
    current.querySelectorAll('.rise').forEach((x) => x.classList.remove('rise'));
    if (def.mount) def.mount(current);
    main.set(def.main || null);
    renderTabs(ROOTS.includes(top.name));
    window.scrollTo(0, y);
  }

  function renderTabs(show) {
    const el = document.getElementById('tabs');
    const up = upcoming().length; const req = pendingRequests();
    el.innerHTML = out(html`
      <button type="button" data-tab="home" class="${tab === 'home' ? 'is-on' : ''}">${I.home}<span>Главная</span></button>
      <button type="button" data-tab="bookings" class="${tab === 'bookings' ? 'is-on' : ''}">${I.cal}<span>Записи</span>${up ? html`<i class="dot">${up}</i>` : ''}</button>
      <button type="button" data-tab="owner" class="${tab === 'owner' ? 'is-on' : ''}">${I.store}<span>Владелец</span>${req ? html`<i class="dot">${req}</i>` : ''}</button>`);
    el.classList.toggle('is-hidden', !show);
    document.documentElement.style.setProperty('--tabs-h', show ? '72px' : '0px');
  }
  document.getElementById('tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) setTab(b.dataset.tab); });

  /* ---------- Действия по data-act ---------- */

  const ACTS = {};
  function onClick(e) {
    const el = e.target.closest('[data-act]');
    if (!el || !current.contains(el)) return;
    const fn = ACTS[el.dataset.act];
    if (fn) fn(el.dataset, el, e);
  }
  const INPUTS = {};
  function onInput(e) { const fn = INPUTS[e.target.dataset.in]; if (fn) fn(e.target); }
  ACTS.back = () => goBack();
  ACTS.link = (d) => window.TG.openLink(d.href);
  ACTS.portfolio = () => { haptic.impact('medium'); window.TG.openLink(PORTFOLIO); };

  /* ================= Клиент: главная ================= */

  const SCREENS = {};

  SCREENS.home = () => {
    const next = upcoming()[0];
    const near = slots.nearest(null, minDur, 5);
    const first = near[0];
    const reviews = venue.base.reviews;
    let lead;
    if (next && !next.time) {
      lead = html`
        <p class="hero__lead">Ваша заявка отправлена, <b>${whenText(next)}</b></p>
        <div class="hero__time hero__time--word">Ждём ответа</div>
        <div class="hero__chips">${statusChip(next.status)}<span class="chip">${next.titles[0]}</span></div>
        <div class="hero__actions"><button class="btn btn--ghost btn--grow" type="button" data-act="tab" data-tab="bookings">Мои записи</button></div>`;
    } else if (next) {
      lead = html`
        <p class="hero__lead">Ваша запись, <b>${L.dayTitle(next.date)}, ${L.dayLong(next.date)}</b></p>
        <div class="hero__time">${timeHero(next.time)}</div>
        <div class="hero__chips">${statusChip(next.status)}<span class="chip">${next.titles[0]}${next.titles.length > 1 ? ` +${next.titles.length - 1}` : ''}</span></div>
        <div class="hero__actions">
          ${has('reschedule') ? html`<button class="btn btn--light btn--grow" type="button" data-act="move" data-id="${next.id}">Перенести</button>` : ''}
          <button class="btn btn--ghost btn--grow" type="button" data-act="tab" data-tab="bookings">Мои записи</button>
        </div>`;
    } else if (!has('selfbook')) {
      lead = html`
        <p class="hero__lead">Запись онлайн круглосуточно</p>
        <div class="hero__time hero__time--word">Без звонков</div>
        <p class="hero__lead">Выберите услугу и удобные дни, ${who} подберёт время и ответит в этом чате</p>
        <div class="hero__actions" style="margin-top:16px">
          <button class="btn btn--light btn--grow" type="button" data-act="book">Оставить заявку<span class="btn__go">${I.arrow}</span></button>
        </div>`;
    } else if (first) {
      lead = html`
        <p class="hero__lead">Ближайшее свободное окно, <b>${L.dayTitle(first.date)}, ${L.dayLong(first.date)}</b></p>
        <div class="hero__time">${timeHero(first.time)}</div>
        ${has('firstvisit') && isNewClient() ? html`<div class="hero__chips"><span class="chip chip--hot">−${F('firstvisit', 10)}% на первый визит</span></div>` : ''}
        <div class="hero__actions" style="margin-top:16px">
          <button class="btn btn--light btn--grow" type="button" data-act="take" data-date="${first.date}" data-time="${first.time}" data-master="${first.masterId}">Занять это время<span class="btn__go">${I.arrow}</span></button>
        </div>`;
    } else {
      lead = html`<p class="hero__lead">Свободные окна появятся скоро</p>`;
    }
    const quoted = /[«"]([^»"]+)[»"]/.exec(venue.name);
    const label = new RegExp(`^(${venue.base.label.split(/\s+/)[0].slice(0, 5)}|студи|салон|барбер|тату|спа|центр|школ)`, 'i');
    const clean = (t) => t.replace(/\([^)]*\)/g, ' ').split(/\s+/).map((w) => w.replace(/[^\p{L}\p{N}-]/gu, '').replace(/^-+|-+$/g, '')).filter(Boolean);
    const words = clean(quoted ? quoted[1] : venue.name).filter((w) => quoted || !label.test(w));
    const mono = L.initials((words.length ? words : clean(venue.name)).join(' ')) || '•';
    return {
      html: html`
        <header class="hero">
          ${art(look.pattern)}
          <div class="hero__top">
            <div class="mono" aria-hidden="true">${mono}</div>
            <div class="hero__meta">
              <div class="hero__kind">${venue.base.label}</div>
              <div class="hero__rating">${I.star}${fmtRating(venue.rating)} · ${venue.reviewsCount} ${L.plural(venue.reviewsCount, 'отзыв', 'отзыва', 'отзывов')}${venue.ratingSample ? html`<span class="tag">пример</span>` : ''}</div>
            </div>
          </div>
          <h1 class="display hero__name">${venue.name}</h1>
          <div class="hero__addr">${I.pin}<span>${venue.address} · <span class="nowrap">ежедневно 10:00–21:00</span></span></div>
          <div class="hero__rule"></div>
          ${lead}
        </header>

        <div class="quick rise" style="--i:1">
          <button class="quick__item" type="button" data-act="book"><span class="quick__icon">${I.plus}</span>Записаться</button>
          <button class="quick__item" type="button" data-act="call"><span class="quick__icon">${I.phone}</span>Позвонить</button>
          <button class="quick__item" type="button" data-act="link" data-href="${mapHref()}"><span class="quick__icon">${I.route}</span>Маршрут</button>
        </div>

        ${near.length > 1 && has('selfbook') ? html`
        <section class="section rise" style="--i:2">
          <div class="section__head"><h2 class="display h3">Ближайшие <em>окна</em></h2><button class="section__link" type="button" data-act="book">Все</button></div>
          <div class="windows">${near.slice(next ? 0 : 1, (next ? 0 : 1) + 4).map((w) => html`
            <button class="win" type="button" data-act="take" data-date="${w.date}" data-time="${w.time}" data-master="${w.masterId}">
              <div class="win__day">${L.dayTitle(w.date).split(',')[0]}</div>
              <div class="win__time">${timeParts(w.time)}</div>
            </button>`)}</div>
        </section>` : ''}

        <section class="section rise" style="--i:3">
          <div class="section__head"><h2 class="display h3">Услуги <em>и цены</em></h2></div>
          <div class="list">${venue.services.map((s) => html`
            <button class="row" type="button" data-act="book" data-svc="${s.id}">
              <div class="row__main"><div class="row__title">${s.t}</div><div class="row__sub">${L.duration(s.d)}${s.about ? ` · ${s.about}` : ''}</div></div>
              <div class="row__end"><span class="row__price">${L.priceText(s)}</span><span class="add">${I.plus}</span></div>
            </button>`)}</div>
        </section>

        <section class="section rise" style="--i:4">
          <div class="section__head"><h2 class="display h3">${venue.masters.length > 1 ? 'Наши' : 'Ваш'} <em>${venue.masters.length > 1 ? `${who}ы` : who}</em></h2></div>
          <div class="scroller">${venue.masters.map((m) => html`
            <button class="master" type="button" data-act="${has('portfolio') ? 'master-card' : 'book'}" data-master="${m.id}" data-id="${m.id}">
              <span class="avatar avatar--lg">${L.initials(m.name)}</span>
              <span class="master__name">${m.name}</span>
              <span class="master__role">${m.role}</span>
              <span class="master__rate">${I.star}${fmtRating(m.rating)}</span>
            </button>`)}</div>
        </section>

        ${has('portfolio') ? worksSection() : ''}
        ${has('gift') ? html`
        <section class="section rise" style="--i:4">
          <button class="card gift" type="button" data-act="gift">
            <span class="gift__icon">${I.sparkle}</span>
            <span class="row__main"><span class="row__title">Подарочный сертификат</span><span class="row__sub">На любую сумму или услугу, придёт красивой открыткой в Telegram</span></span>${I.chev}
          </button>
        </section>` : ''}

        <section class="section rise" style="--i:5">
          <div class="section__head"><h2 class="display h3">Отзывы</h2>${venue.ratingSample ? html`<span class="tag tag--card">пример</span>` : ''}</div>
          <div class="card rating">
            <div class="rating__big">${fmtRating(venue.rating)}</div>
            <div>${stars(venue.rating)}<div class="small muted" style="margin-top:4px">${venue.reviewsCount} ${L.plural(venue.reviewsCount, 'отзыв', 'отзыва', 'отзывов')} на картах</div></div>
          </div>
          <div class="scroller" style="margin-top:10px">${reviews.map(([n, st, text]) => html`
            <article class="review">
              <div class="review__head"><span class="review__name">${n}</span>${stars(st)}</div>
              <p>${text}</p>
            </article>`)}</div>
        </section>

        ${has('faq') ? faqSection() : ''}

        <section class="section rise" style="--i:6">
          <div class="section__head"><h2 class="display h3">Как <em>добраться</em></h2></div>
          <div class="list info">
            <button class="row" type="button" data-act="link" data-href="${mapHref()}"><span class="info__icon">${I.pin}</span><div class="row__main"><div class="row__title">${venue.address}</div><div class="row__sub">Открыть на карте</div></div>${I.chev}</button>
            <div class="row"><span class="info__icon">${I.clock}</span><div class="row__main"><div class="row__title">Ежедневно 10:00–21:00</div><div class="row__sub">Запись онлайн круглосуточно</div></div></div>
            ${venue.phone ? html`<button class="row" type="button" data-act="call"><span class="info__icon">${I.phone}</span><div class="row__main"><div class="row__title">${venue.phone}</div><div class="row__sub">Позвонить</div></div>${I.chev}</button>` : ''}
          </div>
        </section>

        ${promo()}`,
    };
  };

  /* Работы мастеров (portfolio). Фото нет: карточки в стиле заведения с подписью, в боте здесь фото владельца. */
  function workCard(title, m, i) {
    return html`
      <button class="work" type="button" data-act="work" data-i="${i}" style="--tint:${[14, 32, 22, 40, 18, 28][i % 6]}%">
        ${art(look.pattern, 11 + i)}
        <span class="work__tag">${m.name}</span>
        <span class="work__title">${title}</span>
      </button>`;
  }
  const worksList = () => X.works(venue.sphere).map((t, i) => ({ t, m: venue.masters[i % venue.masters.length], i }));
  function worksSection() {
    return html`
      <section class="section rise" style="--i:4">
        <div class="section__head"><h2 class="display h3">Наши <em>работы</em></h2><span class="tag tag--card">здесь ваши фото</span></div>
        <div class="scroller">${worksList().map((w) => workCard(w.t, w.m, w.i))}</div>
      </section>`;
  }
  ACTS.work = (d) => { const w = worksList()[Number(d.i)]; if (w) { haptic.tap(); masterSheet(w.m.id); } };
  ACTS['master-card'] = (d) => { haptic.tap(); masterSheet(d.id); };
  function masterSheet(id) {
    const m = master(id);
    const works = worksList().filter((w) => w.m.id === id);
    openSheet(html`
      <div class="master-head"><span class="avatar avatar--lg">${L.initials(m.name)}</span><div><h2 class="display h2">${m.name}</h2><div class="muted">${m.role} · ★ ${fmtRating(m.rating)} · ${m.since} ${L.plural(m.since, 'год', 'года', 'лет')} опыта</div></div></div>
      <div class="works-grid">${works.map((w) => workCard(w.t, w.m, w.i))}</div>
      <button class="btn btn--accent btn--wide" style="margin-top:14px" type="button" data-sheet="book-master" data-id="${m.id}">Записаться к ${m.name}<span class="btn__go">${I.arrow}</span></button>`);
  }

  ACTS.gift = () => openSheet(html`<div class="page-title" style="text-align:center">${heading('Подарочный', 'сертификат', 'h2')}<p>Выберите сумму: сертификат придёт открыткой, его можно переслать в Telegram.</p></div>
    <div class="choices choices--center">${[3000, 5000, 10000].map((v) => html`<button type="button" class="choice choice--lg" data-sheet="gift-buy" data-v="${v}">${L.money(v)}</button>`)}</div>`);

  /* Частые вопросы (faq). */
  function faqSection() {
    return html`
      <section class="section rise" style="--i:5">
        <div class="section__head"><h2 class="display h3">Частые <em>вопросы</em></h2></div>
        <div class="list faq">${X.faq(venue.sphere).map(([q, a]) => html`
          <details class="faq__item"><summary class="row"><div class="row__main"><div class="row__title">${q}</div></div>${I.chev}</summary><p>${a}</p></details>`)}</div>
      </section>`;
  }

  function promo() {
    return html`
      <aside class="promo rise" style="--i:7">
        ${art(look.pattern, 7)}
        <p class="eyebrow">Для владельца</p>
        <h3 class="display h2">Такое приложение <em>для вас</em></h3>
        <p>Клиенты записываются сами, без звонков и регистрации. Бот напоминает о визите и собирает отзывы, вы видите заявки, расписание и выручку в Telegram. База клиентов ваша, без комиссий с записей.</p>
        <button class="btn btn--light" type="button" data-act="portfolio">Хочу такое себе<span class="btn__go">${I.arrow}</span></button>
      </aside>`;
  }

  ACTS.tab = (d) => setTab(d.tab);
  ACTS.call = () => { const h = telHref(); if (h) window.location.href = h; else toast('В вашем приложении здесь будет ваш номер'); };
  ACTS.book = (d) => {
    haptic.impact('light');
    draft = { services: d.svc ? [d.svc] : [], masterId: d.master || null, date: null, time: null, moveId: null, fixed: false };
    go('services');
  };
  ACTS.take = (d) => {
    haptic.impact('light');
    draft = { services: [], masterId: d.master, date: d.date, time: d.time, moveId: null, fixed: true };
    go('services');
  };

  /* ================= Запись: услуги → мастер → время → проверка ================= */

  const stepBar = (n, total = 4) => html`<div class="step"><div class="step__bar"><i style="--p:${Math.round((n / total) * 100)}%"></i></div><span class="step__label">Шаг ${n} из ${total}</span></div>`;
  const canKeepTime = () => {
    if (!draft.fixed || !draft.date || !draft.time) return false;
    const dur = durOf(draft.services);
    const free = slots.free(draft.date, draft.masterId, dur);
    return free.has(L.toMin(draft.time));
  };

  SCREENS.services = () => {
    const sel = draft.services;
    const fixedNote = draft.fixed ? html`
      <div class="card picked rise">
        <span class="info__icon">${I.clock}</span>
        <div class="picked__main"><div class="picked__title">${L.dayTitle(draft.date)}, ${draft.time}</div><div class="picked__sub">${master(draft.masterId) ? master(draft.masterId).name : `любой ${who}`}</div></div>
        <button type="button" data-act="unfix">Другое время</button>
      </div>` : '';
    const total = totalText(sel);
    const keep = sel.length && canKeepTime();
    return {
      html: html`
        ${stepBar(1)}
        <div class="page-title rise">${heading('Выберите', 'услугу')}<p>Можно несколько, время посчитаем само</p></div>
        ${fixedNote}
        <div class="list rise" style="--i:1">${venue.services.map((s) => html`
          <button class="row ${sel.includes(s.id) ? 'is-on' : ''}" type="button" data-act="pick-svc" data-id="${s.id}" aria-pressed="${sel.includes(s.id)}">
            <span class="tick">${I.checkBold}</span>
            <div class="row__main"><div class="row__title">${s.t}</div><div class="row__sub">${L.duration(s.d)}${s.about ? ` · ${s.about}` : ''}</div></div>
            <span class="row__price">${L.priceText(s)}</span>
          </button>`)}</div>
        ${draft.fixed && sel.length && !keep ? html`<p class="demo-note">На ${draft.time} это не помещается, подберём другое время</p>` : ''}`,
      main: sel.length
        ? { text: keep ? `Проверить запись · ${total}` : has('selfbook') ? `Выбрать время · ${total}` : `Выбрать удобные дни · ${total}`, onClick: () => { haptic.impact('light'); if (keep) go('confirm'); else nextAfterServices(); }, color: colors.accent, textColor: colors.accentInk }
        : { text: 'Выберите услугу', disabled: true, onClick: () => {}, color: colors.accent, textColor: colors.accentInk },
    };
  };
  function nextAfterServices() {
    draft.fixed = false;
    if (draft.masterId || venue.masters.length === 1) { draft.masterId = draft.masterId || venue.masters[0].id; go('time'); } else go('master');
  }
  ACTS['pick-svc'] = (d) => {
    haptic.tap();
    const i = draft.services.indexOf(d.id);
    if (i >= 0) draft.services.splice(i, 1); else draft.services.push(d.id);
    refresh();
  };
  ACTS.unfix = () => { draft.fixed = false; draft.date = null; draft.time = null; haptic.tap(); refresh(); };

  SCREENS.master = () => {
    const dur = durOf(draft.services);
    const anyNear = slots.nearest(null, dur, 1)[0];
    const near = (id) => slots.nearest(id, dur, 1)[0];
    const nearText = (w) => (w ? `ближайшее: ${L.dayTitle(w.date)}, ${w.time}` : 'нет окон на две недели');
    return {
      html: html`
        ${stepBar(2)}
        <div class="page-title rise">${heading('К кому', 'записаться?')}<p>${draft.services.map((id) => svcById(id).t).join(', ')} · ${L.duration(dur)}</p></div>
        <div class="list rise" style="--i:1">
          <button class="row" type="button" data-act="pick-master" data-id="">
            <span class="avatar avatar--any">${I.sparkle}</span>
            <div class="row__main"><div class="row__title">Любой ${who}</div><div class="row__sub">${nearText(anyNear)}</div></div>${I.chev}
          </button>
          ${venue.masters.map((m) => html`
          <button class="row" type="button" data-act="pick-master" data-id="${m.id}">
            <span class="avatar">${L.initials(m.name)}</span>
            <div class="row__main"><div class="row__title">${m.name} <span class="small muted">★ ${fmtRating(m.rating)}</span></div><div class="row__sub">${m.role} · ${nearText(near(m.id))}</div></div>${I.chev}
          </button>`)}
        </div>`,
    };
  };
  ACTS['pick-master'] = (d) => { haptic.tap(); draft.masterId = d.id || null; draft.date = null; draft.time = null; go('time'); };

  SCREENS.time = () => {
    if (!has('selfbook') && !draft.moveId) return requestDays();
    const dur = durOf(draft.services);
    const days = Array.from({ length: 14 }, (_, i) => { const date = L.addDays(L.today(), i); return { date, free: slots.free(date, draft.masterId, dur) }; });
    if (!draft.date || !days.find((x) => x.date === draft.date)) draft.date = (days.find((x) => x.free.size) || days[0]).date;
    const day = days.find((x) => x.date === draft.date);
    const times = [...day.free.keys()];
    const groups = [['Утро', I.sunrise, times.filter((m) => m < 12 * 60)], ['День', I.sun, times.filter((m) => m >= 12 * 60 && m < 17 * 60)], ['Вечер', I.moon, times.filter((m) => m >= 17 * 60)]].filter((g) => g[2].length);
    const m = master(draft.masterId);
    const moving = draft.moveId ? store.get().bookings.find((b) => b.id === draft.moveId) : null;
    return {
      html: html`
        ${moving ? '' : stepBar(3)}
        <div class="page-title rise">${heading(moving ? 'Новое' : 'Когда', moving ? 'время' : 'удобно?')}</div>
        <div class="card picked rise">
          <span class="avatar" style="width:40px;height:40px;font-size:13px">${m ? L.initials(m.name) : raw(I.sparkle.s)}</span>
          <div class="picked__main"><div class="picked__title">${draft.services.map((id) => svcById(id).t).join(', ')}</div><div class="picked__sub">${m ? m.name : `Любой ${who}`} · ${L.duration(dur)} · ${totalText(draft.services)}</div></div>
          ${moving ? '' : html`<button type="button" data-act="back">Изменить</button>`}
        </div>
        <div class="days rise" style="--i:1" role="listbox" aria-label="День">${days.map((x) => { const d = L.parse(x.date); return html`
          <button class="day ${x.date === draft.date ? 'is-on' : ''} ${x.free.size ? '' : 'is-full'}" type="button" role="option" aria-selected="${x.date === draft.date}" data-act="pick-day" data-date="${x.date}">
            <div class="day__wd">${x.date === L.today() ? 'сегодня' : x.date === L.addDays(L.today(), 1) ? 'завтра' : L.WD[d.getDay()]}</div>
            <div class="day__n">${d.getDate()}</div>
            <div class="day__free">${x.free.size ? `${x.free.size} ${L.plural(x.free.size, 'окно', 'окна', 'окон')}` : store.get().closed.includes(x.date) ? 'закрыто' : 'нет мест'}</div>
          </button>`; })}</div>
        ${groups.length ? groups.map(([title, icon, list], gi) => html`
          <div class="card slots rise" style="--i:${gi + 2}">
            <div class="slots__head"><span>${icon}${title}</span><span class="muted small">${list.length} ${L.plural(list.length, 'окно', 'окна', 'окон')}</span></div>
            <div class="slots__grid">${list.map((mm) => { const t = L.toTime(mm); return html`<button class="slot ${draft.time === t ? 'is-on' : ''}" type="button" data-act="pick-time" data-time="${t}">${t}</button>`; })}</div>
          </div>`) : html`<div class="card empty-day">В этот день всё занято. Выберите другой день или <button type="button" class="section__link" data-act="ask">напишите ${who}у</button></div>`}
        ${has('waitlist') && !moving ? waitlistCard() : ''}
        <p class="demo-note">Нет подходящего времени? <button type="button" class="section__link" data-act="ask">Напишите ${who}у</button>, подберём окно вручную</p>`,
      mount(el) { const on = el.querySelector('.day.is-on'); const box = el.querySelector('.days'); if (on && box) box.scrollLeft = Math.max(0, on.offsetLeft - box.offsetLeft - 16); },
      main: draft.time
        ? { text: moving ? `Перенести на ${draft.time}` : `Дальше · ${L.dayTitle(draft.date)}, ${draft.time}`, onClick: () => { haptic.impact('light'); go('confirm'); }, color: colors.accent, textColor: colors.accentInk }
        : { text: 'Выберите время', disabled: true, onClick: () => {}, color: colors.accent, textColor: colors.accentInk },
    };
  };
  ACTS['pick-day'] = (d) => { haptic.tap(); draft.date = d.date; draft.time = null; refresh(); };

  /* Лист ожидания (waitlist): занятый день, клиент встаёт в очередь, бот напишет, когда освободится окно. */
  function waitlistCard() {
    const on = store.get().waitlist.some((w) => w.date === draft.date && w.services.join() === draft.services.join());
    return html`
      <div class="card note rise" style="--i:5;margin-top:4px">${I.bell}<div style="flex:1"><b>Лист ожидания на ${L.dayTitle(draft.date)}</b><span class="muted">Если кто-то отменит запись, бот сразу напишет вам и предложит это время</span>
        <div style="margin-top:10px">${on ? html`<span class="chip chip--ok">${I.check}Вы в листе ожидания</span>` : html`<button class="btn btn--soft btn--sm" type="button" data-act="waitlist">Встать в очередь</button>`}</div></div></div>`;
  }
  ACTS.waitlist = () => {
    store.update((s) => { s.waitlist.push({ id: `w${Date.now().toString(36)}`, date: draft.date, services: [...draft.services], titles: draft.services.map((x) => svcById(x).t), masterId: draft.masterId || '', created: Date.now() }); });
    haptic.ok(); toast('Готово. Как только освободится окно, бот напишет в этот чат'); refresh();
  };

  /* Заявка с удобными днями (пакет «Без потерянных заявок»): клиент выбирает дни и время суток, мастер назначает время. */
  const PARTS = ['Утро', 'День', 'Вечер'];
  function requestDays() {
    draft.req = draft.req || { days: [], parts: [] };
    const days = Array.from({ length: 14 }, (_, i) => L.addDays(L.today(), i)).filter((d) => !store.get().closed.includes(d));
    const r = draft.req;
    return {
      html: html`
        ${stepBar(3)}
        <div class="page-title rise">${heading('Когда', 'удобно?')}<p>Отметьте удобные дни и время суток, ${who} подберёт время и напишет в этот чат</p></div>
        <div class="days rise" style="--i:1">${days.map((date) => { const d = L.parse(date); return html`
          <button class="day ${r.days.includes(date) ? 'is-on' : ''}" type="button" data-act="req-day" data-date="${date}" aria-pressed="${r.days.includes(date)}">
            <div class="day__wd">${date === L.today() ? 'сегодня' : date === L.addDays(L.today(), 1) ? 'завтра' : L.WD[d.getDay()]}</div><div class="day__n">${d.getDate()}</div><div class="day__free">${r.days.includes(date) ? 'удобно' : ''}</div>
          </button>`; })}</div>
        <div class="card slots rise" style="--i:2"><div class="slots__head"><span>${I.clock}Время суток</span><span class="muted small">можно несколько</span></div>
          <div class="slots__grid slots__grid--3">${PARTS.map((p) => html`<button class="slot ${r.parts.includes(p) ? 'is-on' : ''}" type="button" data-act="req-part" data-v="${p}">${p}</button>`)}</div></div>`,
      main: r.days.length
        ? { text: `Дальше · ${r.days.length} ${L.plural(r.days.length, 'день', 'дня', 'дней')}`, onClick: () => { haptic.impact('light'); draft.date = [...r.days].sort()[0]; draft.time = ''; go('confirm'); }, color: colors.accent, textColor: colors.accentInk }
        : { text: 'Отметьте удобные дни', disabled: true, onClick: () => {}, color: colors.accent, textColor: colors.accentInk },
    };
  }
  const toggle = (list, v) => { const i = list.indexOf(v); if (i >= 0) list.splice(i, 1); else list.push(v); };
  ACTS['req-day'] = (d) => { haptic.tap(); toggle(draft.req.days, d.date); refresh(); };
  ACTS['req-part'] = (d) => { haptic.tap(); toggle(draft.req.parts, d.v); refresh(); };
  ACTS['pick-time'] = (d) => {
    haptic.tap();
    draft.time = d.time;
    const free = slots.free(draft.date, draft.masterId, durOf(draft.services));
    draft.assigned = free.get(L.toMin(d.time)) || draft.masterId;
    refresh();
  };
  ACTS.ask = () => toast(`В настоящем боте это сообщение уйдёт ${who}у, и он подберёт время`);

  SCREENS.confirm = () => {
    const dur = durOf(draft.services);
    const mid = draft.assigned || draft.masterId || (slots.free(draft.date, null, dur).get(L.toMin(draft.time))) || venue.masters[0].id;
    draft.assigned = mid;
    const m = master(mid);
    const moving = draft.moveId ? store.get().bookings.find((b) => b.id === draft.moveId) : null;
    const contact = store.get().contact || {};
    const u = window.TG.user();
    const name = draft.name ?? contact.name ?? (u ? [u.first_name, u.last_name].filter(Boolean).join(' ') : '');
    const phone = draft.phone ?? contact.phone ?? '';
    const isReq = !draft.time;
    const end = isReq ? '' : L.toTime(L.toMin(draft.time) + dur);
    const prepay = moving ? 0 : prepayFor(draft.services);
    draft.brief = draft.brief || {};
    const photoQ = !moving && needBrief(draft.services) ? briefQs().find((q) => q.type === 'photo') : null;
    return {
      html: html`
        ${moving ? '' : stepBar(4)}
        <div class="page-title rise">${heading(moving ? 'Перенести' : 'Проверьте', moving ? 'запись?' : 'запись')}</div>
        <article class="card ticket rise" style="--i:1">
          <div class="ticket__head">
            <div class="date-block"><b>${L.parse(draft.date).getDate()}</b><span>${L.MON[L.parse(draft.date).getMonth()].slice(0, 3)}</span></div>
            ${isReq ? html`<div><div class="small muted">Удобные дни</div><div class="ticket__when ticket__when--sm">${draft.req.days.slice().sort().map((d) => L.dayTitle(d).split(',')[0]).join(', ')}</div><div class="small muted">${draft.req.parts.length ? draft.req.parts.join(', ') : 'любое время'}</div></div>`
              : html`<div><div class="small muted">${L.dayTitle(draft.date)}, ${L.WD_FULL[L.parse(draft.date).getDay()]}</div><div class="ticket__when">${draft.time}–${end}</div></div>`}
          </div>
          <div class="ticket__cut"></div>
          <dl>
            ${draft.services.map((id) => html`<div class="kv"><dt>${svcById(id).t}</dt><dd>${L.priceText(svcById(id))}</dd></div>`)}
            <div class="kv"><dt>${who[0].toUpperCase() + who.slice(1)}</dt><dd>${m.name}</dd></div>
            <div class="kv"><dt>Где</dt><dd>${venue.name}</dd></div>
            <div class="kv kv--total"><dt>Итого</dt><dd>${totalText(draft.services)}</dd></div>
            ${has('firstvisit') && isNewClient() && sumOf(draft.services) ? html`<div class="kv"><dt>Скидка на первый визит</dt><dd>−${F('firstvisit', 10)}%, ${L.money(Math.round(sumOf(draft.services) * (100 - F('firstvisit', 10)) / 100))}</dd></div>` : ''}
            ${prepay ? html`<div class="kv"><dt>Предоплата, чтобы закрепить время</dt><dd>${L.money(prepay)}</dd></div>` : ''}
          </dl>
        </article>

        ${moving ? '' : html`
        <section class="section" style="margin-top:18px">
          <div class="list rise" style="--i:2">
            <label class="field" data-f="name"><span>Как к вам обращаться</span><input data-in="name" autocomplete="name" maxlength="40" value="${name}" placeholder="Имя"></label>
            <label class="field" data-f="phone"><span>Телефон</span><input data-in="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" value="${phone}" placeholder="+7 900 000-00-00"></label>
            ${window.TG.version('6.9') && !phone ? html`<div class="field"><button class="btn btn--soft btn--sm" type="button" data-act="tg-phone">${I.phone}Взять номер из Telegram</button></div>` : ''}
            <label class="field"><span>Пожелания, если есть</span><textarea data-in="comment" rows="2" maxlength="300" placeholder="Например: хочу как в прошлый раз">${draft.comment || ''}</textarea></label>
            ${photoQ ? html`<div class="field"><span>${photoQ.title}</span><label class="photo-pick">${I.plus}<span>${draft.photos ? `Добавлено фото: ${draft.photos}` : 'Прикрепить фото'}</span><input type="file" accept="image/*" multiple data-in="photos" hidden></label></div>` : ''}
            ${has('sources') ? html`<div class="field"><span>Откуда вы о нас узнали?</span><div class="choices">${X.SOURCES.map((o) => html`<button type="button" class="choice ${draft.source === o ? 'is-on' : ''}" data-act="source" data-v="${o}">${o}</button>`)}</div></div>` : ''}
          </div>
        </section>`}
        <div class="list rise" style="--i:3;margin-top:12px">
          ${has('reminders') ? html`<div class="note">${I.bell}<div><b>Напомним накануне и за 2 часа</b><span class="muted">Сообщение придёт в этот чат, в нём можно подтвердить или перенести</span></div></div>` : ''}
          <div class="note">${I.shield}<div><b>${prepay ? `Предоплата ${L.money(prepay)}, без регистрации` : 'Без предоплаты и без регистрации'}</b><span class="muted">${prepay ? 'Реквизиты придут после записи. Без оплаты бронь снимется сама через 2 часа' : has('reschedule') ? 'Отменить или перенести бесплатно можно здесь же, в «Моих записях», не позже чем за 3 часа' : 'Если планы изменятся, напишите в этот чат'}</span></div></div>
        </div>`,
      main: { text: moving ? `Перенести на ${draft.time}` : isReq ? 'Отправить заявку' : `Записаться · ${totalText(draft.services)}`, onClick: submit, color: colors.accent, textColor: colors.accentInk },
    };
  };
  ACTS['tg-phone'] = async () => { const p = await window.TG.requestPhone(); if (p) { draft.phone = p.startsWith('+') ? p : `+${p}`; haptic.ok(); refresh(); } };
  INPUTS.name = (el) => { draft.name = el.value; el.closest('.field').classList.remove('is-bad'); };
  INPUTS.phone = (el) => { draft.phone = el.value; el.closest('.field').classList.remove('is-bad'); };
  INPUTS.comment = (el) => { draft.comment = el.value; };
  INPUTS.brief = (el) => { draft.brief[el.dataset.q] = el.value.slice(0, 300); };
  INPUTS.birthday = (el) => { draft.birthday = /^\d{4}-\d{2}-\d{2}$/.test(el.value) ? el.value : ''; };
  INPUTS.photos = (el) => { draft.photos = Math.min(10, el.files ? el.files.length : 0); haptic.ok(); refresh(); };
  ACTS['brief-pick'] = (d) => { haptic.tap(); draft.brief[d.q] = draft.brief[d.q] === d.v ? '' : d.v; refresh(); };
  ACTS.source = (d) => { haptic.tap(); draft.source = draft.source === d.v ? '' : d.v; refresh(); };

  let submitting = false;
  function submit() {
    if (submitting) return;
    const moving = draft.moveId ? store.get().bookings.find((b) => b.id === draft.moveId) : null;
    const contact = store.get().contact || {};
    const u = window.TG.user();
    const name = String(draft.name ?? contact.name ?? (u ? u.first_name : '') ?? '').trim().slice(0, 40);
    const phone = String(draft.phone ?? contact.phone ?? '').trim().slice(0, 20);
    if (!moving) {
      const bad = [];
      if (!name) bad.push('name');
      if (String(phone).replace(/\D/g, '').length < 10) bad.push('phone');
      if (bad.length) {
        haptic.warn();
        bad.forEach((f) => { const el = current.querySelector(`[data-f="${f}"]`); if (el) el.classList.add('is-bad'); });
        const first = current.querySelector(`[data-f="${bad[0]}"] input`); if (first) first.focus();
        toast(bad.includes('phone') ? 'Оставьте телефон: по нему мастер свяжется, если что-то изменится' : 'Как к вам обращаться?');
        return;
      }
    }
    submitting = true;
    main.set({ text: 'Записываем…', busy: true, onClick: () => {}, color: colors.accent, textColor: colors.accentInk });
    setTimeout(() => {
      submitting = false;
      const dur = durOf(draft.services);
      const isReq = !draft.time;
      const stillFree = isReq || slots.free(draft.date, draft.assigned, dur).has(L.toMin(draft.time)) || (moving && moving.date === draft.date && moving.time === draft.time);
      if (!stillFree && !moving) { haptic.warn(); toast('Это время только что заняли. Выберите другое'); goBack(); return; }
      let id;
      store.update((s) => {
        if (moving) {
          const b = s.bookings.find((x) => x.id === moving.id);
          b.date = draft.date; b.time = draft.time; b.masterId = draft.assigned; b.status = 'pending'; id = b.id;
        } else {
          id = `b${Date.now().toString(36)}`;
          s.contact = { name, phone };
          const qs = needBrief(draft.services) ? briefQs() : [];
          const briefLines = qs.filter((q) => q.type === 'photo' && draft.photos).map((q) => `${q.title}: ${draft.photos} фото`);
          const prepay = prepayFor(draft.services);
          s.bookings.push({ id, services: [...draft.services], titles: draft.services.map((x) => svcById(x).t), masterId: draft.assigned, date: draft.date, time: draft.time, dur, total: sumOf(draft.services), status: isReq ? 'request' : 'pending', name, phone, comment: String(draft.comment || '').slice(0, 300), created: Date.now(),
            days: isReq ? [...draft.req.days].sort() : null, parts: isReq ? [...draft.req.parts] : null, brief: briefLines, birthday: '', source: draft.source || '', prepay, prepayStatus: prepay ? 'wait' : '' });
        }
      });
      haptic.ok();
      stack.length = 1; stack[0] = { name: tab, args: {} };
      go('done', { id, moved: Boolean(moving) });
    }, 750);
  }

  SCREENS.done = ({ id, moved }) => {
    const b = store.get().bookings.find((x) => x.id === id);
    const m = master(b.masterId);
    return {
      html: html`
        <div class="done">
          <div class="done__mark" style="position:relative"><span class="done__ring"></span>${svg('<path d="M5 12.5l4.5 4.5L19 7.5" stroke-width="2.6"/>')}</div>
          ${heading(moved ? 'Запись' : 'Заявка', moved ? 'перенесена' : 'отправлена')}
          <p>${b.time ? `${m.name} подтвердит время, и бот пришлёт сообщение в этот чат.${has('reminders') ? ' Накануне придёт напоминание.' : ''}` : `${Who} посмотрит удобные дни, назначит время и напишет в этот чат.`}</p>
        </div>
        <article class="card ticket rise" style="--i:2;margin-top:24px">
          <dl>
            <div class="kv"><dt>Когда</dt><dd>${whenText(b)}</dd></div>
            <div class="kv"><dt>Услуга</dt><dd>${b.titles.join(', ')}</dd></div>
            <div class="kv"><dt>${who[0].toUpperCase() + who.slice(1)}</dt><dd>${m.name}</dd></div>
            <div class="kv"><dt>Статус</dt><dd>${statusChip(b.status)}</dd></div>
          </dl>
          ${b.time ? html`<button class="btn btn--soft btn--wide" style="margin:6px 0 14px" type="button" data-act="calendar" data-id="${b.id}">${I.cal}Добавить в календарь</button>` : ''}
        </article>
        ${b.prepay ? prepayCard(b) : ''}
        ${has('reminders') && b.time ? html`<section class="section rise" style="--i:3">
          <div class="section__head"><h2 class="display h3">Так придёт <em>напоминание</em></h2></div>
          ${reminder(b)}
        </section>` : ''}
        <aside class="card card--pad rise" style="--i:4;margin-top:16px;display:flex;gap:14px;align-items:center">
          <span class="info__icon">${I.store}</span>
          <div style="flex:1"><b>Посмотрите глазами владельца</b><div class="small muted">Ваша заявка уже ждёт во вкладке «Владелец»</div></div>
          <button class="btn btn--soft btn--sm" type="button" data-act="tab" data-tab="owner">Открыть</button>
        </aside>`,
      main: { text: 'Мои записи', onClick: () => { haptic.tap(); backToRoot('bookings'); }, color: colors.accent, textColor: colors.accentInk },
    };
  };

  /* Предоплата (prepay): реквизиты, «Я оплатил», без оплаты бронь снимается сама. */
  function prepayCard(b) {
    const st = b.prepayStatus;
    return html`
      <section class="card card--pad rise" style="--i:3;margin-top:16px">
        <p class="eyebrow" style="margin-bottom:6px">Предоплата</p>
        <div class="money-big" style="font-size:34px">${L.money(b.prepay)}</div>
        <p class="small muted" style="margin:8px 0 12px">${st === 'paid' ? 'Мастер подтвердил оплату, время закреплено за вами.' : st === 'sent' ? 'Мастер проверит перевод и подтвердит. Обычно это пара минут.' : 'Переведите в течение 2 часов, иначе бронь снимется сама. Остальное оплачивается на месте.'}</p>
        ${st === 'paid' || st === 'sent' ? html`<span class="chip ${st === 'paid' ? 'chip--ok' : 'chip--wait'}">${st === 'paid' ? 'Оплачено' : 'Проверяем оплату'}</span>`
          : html`<div class="bubble-wrap" style="margin-bottom:12px"><div class="small">Реквизиты: <b>пример, в вашем боте здесь ваши реквизиты или ссылка на оплату</b></div></div>
            <button class="btn btn--accent btn--wide" type="button" data-act="paid" data-id="${b.id}">Я оплатил</button>`}
      </section>`;
  }
  ACTS.paid = (d) => { store.update((s) => { const b = s.bookings.find((x) => x.id === d.id); if (b) b.prepayStatus = 'sent'; }); haptic.ok(); toast('Отправили мастеру. Он проверит перевод'); refresh(); };

  /* В календарь: в Telegram ссылка Google Календаря, в браузере файл .ics (откроется в Календаре iPhone). */
  function addToCalendar(b) {
    const m = master(b.masterId) || venue.masters[0];
    const start = b.date.replace(/-/g, '') + 'T' + b.time.replace(':', '') + '00';
    const endMin = L.toMin(b.time) + b.dur;
    const end = b.date.replace(/-/g, '') + 'T' + L.toTime(endMin).replace(':', '') + '00';
    const title = `${b.titles.join(', ')} · ${venue.name}`;
    const details = `${who[0].toUpperCase() + who.slice(1)}: ${m.name}. Перенести или отменить можно в приложении.`;
    if (inTelegram) {
      const q = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${start}/${end}`, details, location: venue.addressReal ? venue.address : venue.name });
      window.TG.openLink(`https://calendar.google.com/calendar/render?${q}`);
      return;
    }
    const icsText = (v) => String(v).replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\r?\n/g, ' ');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//zapis-demo//RU', 'BEGIN:VEVENT', `UID:${b.id}@zapis-demo`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
      `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${icsText(title)}`, `DESCRIPTION:${icsText(details)}`, `LOCATION:${icsText(venue.addressReal ? venue.address : venue.name)}`,
      'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:Скоро запись', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = document.createElement('a'); a.href = url; a.download = 'zapis.ics'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  ACTS.calendar = (d) => { const b = store.get().bookings.find((x) => x.id === d.id); if (b) { haptic.tap(); addToCalendar(b); } };

  function reminder(b, kind = 'day') {
    const m = master(b.masterId);
    const when = kind === 'day' ? `завтра, ${b.time}` : `сегодня в ${b.time}`;
    return html`
      <div class="bubble-wrap">
        <div class="bubble">
          <div class="bubble__from">${venue.name}</div>
          ${kind === 'day' ? 'Напоминаю о записи' : 'Ждём вас через 2 часа'}: <b>${when}</b>, ${b.titles.map(lower).join(', ')}, ${who} ${m.name}.<br>Адрес: ${venue.address}${venue.base.tip && kind === 'day' ? html`<br><br>${venue.base.tip}` : ''}
          <div class="bubble__time">${kind === 'day' ? '19:00' : L.toTime(Math.max(0, L.toMin(b.time) - 120))}</div>
        </div>
        <div class="bubble__btns"><span>Приду</span><span>Перенести</span></div>
      </div>`;
  }

  /* ================= Клиент: мои записи ================= */

  view.bookings = 'up';
  SCREENS.bookings = () => {
    const up = upcoming(); const old = past();
    const list = view.bookings === 'up' ? up : old;
    const card = (b, i) => {
      const m = master(b.masterId) || venue.masters[0];
      const d = L.parse(b.date);
      const isUp = up.includes(b);
      return html`
        <article class="card booking rise" style="--i:${i + 1}">
          <div class="booking__top">
            <div class="date-block ${isUp ? '' : 'date-block--past'}"><b>${d.getDate()}</b><span>${L.MON[d.getMonth()].slice(0, 3)}</span></div>
            <div style="flex:1;min-width:0">
              <div class="booking__title">${b.titles.join(', ')}</div>
              <div class="booking__sub">${whenText(b)} · ${m.name} · ${b.total ? L.money(b.total) : 'бесплатно'}</div>
              ${statusChip(b.status)}
            </div>
          </div>
          ${isUp ? html`
            ${b.prepay && b.prepayStatus !== 'paid' ? html`<div class="booking__foot"><span>Предоплата ${L.money(b.prepay)}</span>${b.prepayStatus === 'sent' ? html`<span class="chip chip--wait">Проверяем</span>` : html`<button class="btn btn--accent btn--sm" type="button" data-act="paid" data-id="${b.id}">Я оплатил</button>`}</div>` : ''}
            <div class="booking__actions">
              ${has('reschedule') && b.time ? html`<button class="btn btn--soft btn--sm btn--grow" type="button" data-act="move" data-id="${b.id}">${I.repeat}Перенести</button>` : ''}
              <button class="btn btn--danger btn--sm" type="button" data-act="cancel" data-id="${b.id}">Отменить</button>
            </div>
            ${b.time ? html`<div class="booking__foot"><button class="section__link" type="button" data-act="calendar" data-id="${b.id}">В календарь</button>${has('reminders') ? html`<button class="section__link" type="button" data-act="show-reminder" data-id="${b.id}">Как придёт напоминание</button>` : ''}</div>` : ''}`
          : b.status === 'done' ? html`
            ${has('return') ? returnNote(b) : ''}
            <div class="booking__foot">
              ${has('reviews') ? (b.review ? html`<span>${stars(b.review.stars)}</span>` : html`<span class="muted">Как всё прошло?</span>`) : html`<span class="muted">Спасибо, что пришли</span>`}
              ${!has('reviews') || b.review ? html`<button class="section__link" type="button" data-act="repeat" data-id="${b.id}">Записаться снова</button>` : html`<button class="btn btn--accent btn--sm" type="button" data-act="review" data-id="${b.id}">Оценить визит</button>`}
            </div>
            ${has('memo') || has('team') ? html`<div class="booking__foot">${has('memo') ? html`<button class="section__link" type="button" data-act="memo" data-id="${b.id}">Памятка после визита</button>` : html`<span></span>`}${has('team') ? html`<button class="section__link" type="button" data-act="tips" data-id="${b.id}">Чаевые ${m.name}</button>` : ''}</div>` : ''}` : ''}
        </article>`;
    };
    return {
      html: html`
        <div style="height:calc(var(--safe-top) + 18px)"></div>
        <div class="page-title rise">${heading('Мои', 'записи')}</div>
        ${has('referral') ? html`
          <aside class="promo promo--sm rise" style="margin:0 0 16px">
            ${art(look.pattern, 21)}
            <p class="eyebrow">Приведите друга</p>
            <h3 class="display h3">Вам и другу <em>−${F('referral', 10)}%</em></h3>
            <p>Отправьте личную ссылку: когда друг запишется по ней, скидка придёт вам обоим.</p>
            <button class="btn btn--light btn--sm" type="button" data-act="share">Поделиться ссылкой</button>
          </aside>` : ''}
        ${has('waitlist') && store.get().waitlist.length ? html`<div class="list rise" style="margin-bottom:16px">${store.get().waitlist.map((w) => html`
          <div class="row"><span class="info__icon">${I.bell}</span><div class="row__main"><div class="row__title">Лист ожидания, ${L.dayTitle(w.date)}</div><div class="row__sub">${w.titles.join(', ')} · напишем, когда освободится окно</div></div><button class="section__link" type="button" data-act="wl-off" data-id="${w.id}">Убрать</button></div>`)}</div>` : ''}
        <div class="seg" role="tablist">
          <button type="button" role="tab" class="${view.bookings === 'up' ? 'is-on' : ''}" data-act="bseg" data-v="up">Предстоящие${up.length ? ` · ${up.length}` : ''}</button>
          <button type="button" role="tab" class="${view.bookings === 'past' ? 'is-on' : ''}" data-act="bseg" data-v="past">Прошедшие</button>
        </div>
        ${list.length ? list.map(card) : html`
          <div class="empty rise">
            <div class="empty__icon">${I.cal}</div>
            <h3 class="display h3">${view.bookings === 'up' ? 'Пока нет записей' : 'Здесь появятся прошедшие визиты'}</h3>
            <p>${view.bookings === 'up' ? 'Выберите услугу и удобное время, это займёт минуту' : 'После визита здесь можно будет оценить его и записаться снова'}</p>
            ${view.bookings === 'up' ? html`<button class="btn btn--accent" type="button" data-act="book">Записаться<span class="btn__go">${I.arrow}</span></button>` : ''}
          </div>`}`,
    };
  };
  ACTS.bseg = (d) => { haptic.tap(); view.bookings = d.v; refresh(); };
  ACTS['wl-off'] = (d) => { store.update((s) => { s.waitlist = s.waitlist.filter((w) => w.id !== d.id); }); haptic.tap(); refresh(); };
  ACTS.share = () => {
    const text = `Записываюсь в «${venue.name}» прямо в Telegram, очень удобно. По моей ссылке у тебя скидка ${F('referral', 10)}%`;
    window.TG.openLink(`https://t.me/share/url?url=${encodeURIComponent(location.origin + location.pathname)}&text=${encodeURIComponent(text)}`);
  };
  /* «Пора снова» (return): через нужный срок бот сам зовёт. */
  function returnNote(b) {
    const days = X.returnDays(venue.sphere);
    const left = days - L.daysBetween(b.date, L.today());
    return html`<div class="note" style="padding:12px 0 0">${I.repeat}<div><b>${left > 0 ? `Через ${left} ${L.plural(left, 'день', 'дня', 'дней')} пора снова` : 'Пора снова'}</b><span class="muted">Бот сам напомнит через ${days} ${L.plural(days, 'день', 'дня', 'дней')} после визита. Можно записаться заранее.</span></div></div>`;
  }
  ACTS.memo = () => openSheet(html`<div class="page-title">${heading('Памятка', 'после визита', 'h2')}<p>Бот присылает её сам на следующий день после визита.</p></div><div class="bubble-wrap"><div class="bubble"><div class="bubble__from">${venue.name}</div>${X.after(venue.sphere)}<div class="bubble__time">10:00</div></div></div><button class="btn btn--plain btn--wide" style="margin-top:18px" type="button" data-sheet="close">Понятно</button>`);
  ACTS.tips = (d) => {
    const b = store.get().bookings.find((x) => x.id === d.id); const m = master(b.masterId) || venue.masters[0];
    openSheet(html`<div class="page-title" style="text-align:center">${heading('Чаевые', m.name, 'h2')}<p>Деньги уходят мастеру напрямую. В вашем боте здесь ссылка мастера на перевод.</p></div>
      <div class="choices choices--center">${[100, 200, 300, 500].map((v) => html`<button type="button" class="choice choice--lg" data-sheet="tip" data-v="${v}">${L.money(v)}</button>`)}</div>`);
  };
  ACTS.move = (d) => {
    const b = store.get().bookings.find((x) => x.id === d.id);
    if (!b) return;
    haptic.impact('light');
    draft = { services: [...b.services], masterId: b.masterId, date: b.date, time: null, moveId: b.id, fixed: false, assigned: b.masterId };
    go('time');
  };
  ACTS.cancel = async (d) => {
    const ok = await window.TG.confirm('Отменить запись? Время освободится для других клиентов.', 'Отменить запись');
    if (!ok) return;
    store.update((s) => { const b = s.bookings.find((x) => x.id === d.id); if (b) b.status = 'cancelled'; });
    haptic.ok();
    toast('Запись отменена. Мастер получил сообщение');
    refresh();
  };
  ACTS.repeat = (d) => {
    const b = store.get().bookings.find((x) => x.id === d.id);
    haptic.impact('light');
    draft = { services: [...b.services].filter(svcById), masterId: b.masterId, date: null, time: null, moveId: null, fixed: false };
    if (!draft.services.length) draft.services = [firstPaid.id];
    go('time');
  };
  ACTS['show-reminder'] = (d) => {
    const b = store.get().bookings.find((x) => x.id === d.id);
    openSheet(html`<div class="page-title">${heading('Так придёт', 'напоминание', 'h2')}<p>Бот пишет сам: накануне вечером и за 2 часа до визита. Клиент отвечает одной кнопкой.</p></div>${reminder(b)}<div style="height:12px"></div>${reminder(b, 'soon')}<button class="btn btn--plain btn--wide" style="margin-top:18px" type="button" data-sheet="close">Понятно</button>`);
  };

  /* Отзыв после визита: 4–5 зовём на карты, 1–3 пишут владельцу лично. */
  let reviewDraft = null;
  ACTS.review = (d) => { reviewDraft = { id: d.id, stars: 0, text: '' }; drawReview(); };
  function drawReview() {
    const b = store.get().bookings.find((x) => x.id === reviewDraft.id);
    const s = reviewDraft.stars;
    openSheet(html`
      <div class="page-title" style="text-align:center">${heading('Как', 'всё прошло?', 'h2')}<p>${b.titles.join(', ')}, ${L.dayTitle(b.date)}</p></div>
      <div class="rate" role="radiogroup" aria-label="Оценка">${[1, 2, 3, 4, 5].map((n) => html`<button type="button" class="${n <= s ? 'is-on' : ''}" data-sheet="star" data-n="${n}" aria-label="${n}">${I.star}</button>`)}</div>
      ${s >= 4 ? html`<div class="card card--pad" style="text-align:center"><b>Спасибо!</b><p class="muted small" style="margin:6px 0 14px">Поделитесь впечатлением на картах, это очень помогает. В вашем приложении здесь будет ссылка на ваши отзывы.</p><button class="btn btn--accent btn--wide" type="button" data-sheet="save">Оставить отзыв на картах</button></div>` : ''}
      ${s && s <= 3 ? html`<div class="list"><label class="field"><span>Что можно улучшить?</span><textarea data-sheet-in="text" rows="3" maxlength="500" placeholder="Это увидит только владелец"></textarea></label></div><button class="btn btn--accent btn--wide" style="margin-top:12px" type="button" data-sheet="save">Отправить владельцу</button>` : ''}
    `);
  }

  /* ---------- Шторка ---------- */

  const sheet = document.getElementById('sheet');
  function openSheet(content) {
    sheet.innerHTML = `<div class="sheet__bg" data-sheet="close"></div><div class="sheet__body" role="dialog" aria-modal="true"><div class="sheet__grip"></div>${out(content)}</div>`;
    sheet.classList.add('is-on'); sheet.classList.remove('is-closing'); sheet.setAttribute('aria-hidden', 'false');
    main.set(null);
    back.set(closeSheet);
  }
  function closeSheet() {
    sheet.classList.add('is-closing');
    setTimeout(() => { sheet.classList.remove('is-on', 'is-closing'); sheet.innerHTML = ''; sheet.setAttribute('aria-hidden', 'true'); }, 280);
    const top = stack[stack.length - 1];
    back.set(ROOTS.includes(top.name) ? null : goBack);
    const def = SCREENS[top.name](top.args || {});
    main.set(def.main || null);
  }
  sheet.addEventListener('click', (e) => {
    const el = e.target.closest('[data-sheet]');
    if (!el) return;
    const act = el.dataset.sheet;
    if (act === 'close') closeSheet();
    if (act === 'book-master') { const id = el.dataset.id; closeSheet(); setTimeout(() => ACTS.book({ master: id }), 300); }
    if (act === 'm-svc' || act === 'm-time') {
      manualDraft.name = (sheet.querySelector('[data-sheet-in="m-name"]') || {}).value || '';
      manualDraft.phone = (sheet.querySelector('[data-sheet-in="m-phone"]') || {}).value || '';
      if (act === 'm-svc') { manualDraft.sid = el.dataset.v; manualDraft.time = ''; } else manualDraft.time = el.dataset.v;
      haptic.tap(); drawManual();
    }
    if (act === 'm-save') {
      const name = String((sheet.querySelector('[data-sheet-in="m-name"]') || {}).value || '').trim().slice(0, 40);
      if (!name || !manualDraft.time) { haptic.warn(); toast(!name ? 'Как зовут клиента?' : 'Выберите время'); return; }
      const sv = svcById(manualDraft.sid);
      store.update((st) => { st.manual.push({ id: `m${Date.now().toString(36)}`, date: manualDraft.date, time: manualDraft.time, dur: sv.d, title: sv.t, price: sv.p, name, masterId: view.schedMaster }); });
      haptic.ok(); toast(`Записали ${name} на ${manualDraft.time}. Бот даст ссылку для напоминаний`); closeSheet(); refresh();
    }
    if (act === 'note-save') {
      const v = String((sheet.querySelector('[data-sheet-in="note"]') || {}).value || '').slice(0, 300);
      store.update((st) => { st.notes[el.dataset.id] = v; }); haptic.ok(); toast('Заметка сохранена'); closeSheet();
    }
    if (act === 'black') {
      store.update((st) => { if (st.black[el.dataset.id]) delete st.black[el.dataset.id]; else st.black[el.dataset.id] = true; });
      haptic.impact('medium'); toast(store.get().black[el.dataset.id] ? 'В чёрном списке: записаться сможет только с предоплатой' : 'Убрали из чёрного списка'); closeSheet(); refresh();
    }
    if (act === 'bc-send') { haptic.ok(); toast(`Рассылка ушла ${owner.clients.length} клиентам`); closeSheet(); }
    if (act === 'gift-buy') { haptic.ok(); toast(`Сертификат на ${L.money(Number(el.dataset.v))}: в вашем боте здесь оплата и открытка`); closeSheet(); }
    if (act === 'tip') { haptic.ok(); toast(`Спасибо! ${L.money(Number(el.dataset.v))} ушли мастеру`); closeSheet(); }
    if (act === 'star') { haptic.tap(); reviewDraft.stars = Number(el.dataset.n); drawReview(); }
    if (act === 'save') {
      const text = (sheet.querySelector('[data-sheet-in="text"]') || {}).value || '';
      store.update((s) => { const b = s.bookings.find((x) => x.id === reviewDraft.id); if (b) b.review = { stars: reviewDraft.stars, text: String(text).slice(0, 500) }; });
      haptic.ok();
      toast(reviewDraft.stars >= 4 ? 'Спасибо! В настоящем боте откроются отзывы на картах' : 'Передали владельцу лично. Публично отзыв не появится');
      closeSheet(); refresh();
    }
  });

  /* ================= Владелец ================= */

  view.owner = 'req'; view.sched = 'day'; view.schedDay = L.today(); view.schedMaster = venue.masters[0].id; view.clients = 'all'; view.q = ''; view.money = 'week';

  SCREENS.owner = () => {
    const today = owner.daySchedule(L.today());
    const freeWeek = Array.from({ length: 7 }, (_, i) => slots.free(L.addDays(L.today(), i), null, 60).size).reduce((a, x) => a + x, 0);
    const pend = pendingRequests();
    const tabs = [['req', `Заявки${pend ? ` · ${pend}` : ''}`], ['day', 'Расписание'], has('clientbase') ? ['clients', 'Клиенты'] : null,
      ['money', has('accounting') ? 'Выручка' : 'Отчёт'], has('settings') || has('closeday') ? ['settings', 'Настройки'] : null].filter(Boolean);
    if (!tabs.some(([k]) => k === view.owner)) view.owner = 'req';
    const body = { req: ownerRequests, day: ownerSchedule, clients: ownerClients, money: ownerMoney, settings: ownerSettings }[view.owner]();
    return {
      html: html`
        <header class="owner-head">
          ${art(look.pattern, 3)}
          <p class="eyebrow">Так это видит владелец <span class="tag">пример</span></p>
          <h1 class="display h1">${venue.name.length > 22 ? 'Ваша студия' : venue.name} <em>сегодня</em></h1>
          <p>${L.WD_FULL[new Date().getDay()]}, ${L.dayLong(L.today())}</p>
          <div class="stats">
            <div class="stat"><b class="${pend ? 'hot' : ''}">${pend}</b><span>ждут подтверждения</span></div>
            <div class="stat"><b>${today.length}</b><span>${L.plural(today.length, 'запись', 'записи', 'записей')} сегодня</span></div>
            <div class="stat"><b>${freeWeek}</b><span>свободных окон на неделю</span></div>
          </div>
        </header>
        <div class="seg seg--scroll owner-tabs" role="tablist">${tabs.map(([k, t]) => html`<button type="button" role="tab" class="${view.owner === k ? 'is-on' : ''}" data-act="oseg" data-v="${k}">${t}</button>`)}</div>
        ${body}
        ${promo()}`,
    };
  };
  ACTS.oseg = (d) => { haptic.tap(); view.owner = d.v; refresh(); };

  function ownerRequests() {
    const own = store.get().bookings.filter((b) => ['pending', 'request'].includes(b.status)).map((b) => ({
      id: b.id, own: true, client: b.name || 'Вы', phone: b.phone, visits: 0, service: b.titles.join(', '), price: b.total, dur: b.dur,
      date: b.date, time: b.time, when: whenText(b), master: (master(b.masterId) || venue.masters[0]).name, comment: b.comment,
      brief: b.brief || [], source: b.source, prepay: b.prepay, prepayStatus: b.prepayStatus, birthday: b.birthday,
    }));
    const list = [...own, ...owner.requests.filter((r) => !store.get().decided[r.id])];
    if (!list.length) {
      return html`<div class="empty rise"><div class="empty__icon">${I.check}</div><h3 class="display h3">Все заявки разобраны</h3><p>Новые появятся здесь, и бот сразу пришлёт уведомление в Telegram</p>
        <button class="btn btn--soft" type="button" data-act="req-reset">Показать примеры снова</button></div>`;
    }
    return html`${list.map((r, i) => html`
      <article class="card req rise" style="--i:${i}" data-req="${r.id}">
        <div class="req__top">
          <span class="avatar">${L.initials(r.client)}</span>
          <div class="req__who"><div class="req__name">${r.client} ${r.own ? html`<span class="chip" style="margin-left:4px">это вы</span>` : ''}</div><div class="row__sub">${visitsText(r.visits)}${r.phone ? ` · ${r.phone}` : ''}</div></div>
        </div>
        <div class="req__when">${r.when || `${L.dayTitle(r.date)}, ${r.time}`}</div>
        <div class="row__sub" style="font-size:14px">${r.service} · ${r.master} · ${r.price ? L.money(r.price) : 'бесплатно'}</div>
        ${r.comment ? html`<p class="req__comment">«${r.comment}»</p>` : ''}
        ${r.brief && r.brief.length ? html`<div class="req__comment">${r.brief.map((l) => html`<div>${l}</div>`)}</div>` : ''}
        ${r.source || r.birthday ? html`<div class="chips-row">${r.source ? html`<span class="chip">Откуда: ${r.source}</span>` : ''}${r.birthday ? html`<span class="chip">ДР ${r.birthday.slice(8)}.${r.birthday.slice(5, 7)}</span>` : ''}</div>` : ''}
        ${r.prepay ? html`<div class="booking__foot" style="margin-top:10px"><span>Предоплата ${L.money(r.prepay)}: ${r.prepayStatus === 'paid' ? 'получена' : r.prepayStatus === 'sent' ? 'клиент оплатил' : 'ждём'}</span>${r.prepayStatus === 'sent' ? html`<button class="btn btn--soft btn--sm" type="button" data-act="prepay-ok" data-id="${r.id}">Деньги пришли</button>` : ''}</div>` : ''}
        <div class="req__btns">
          <button class="btn btn--accent btn--sm" type="button" data-act="decide" data-id="${r.id}" data-v="ok" data-own="${r.own ? 1 : 0}">${I.check}${r.time === '' ? 'Назначить время' : 'Подтвердить'}</button>
          <button class="btn btn--line btn--sm" type="button" data-act="decide" data-id="${r.id}" data-v="no" data-own="${r.own ? 1 : 0}">Отклонить</button>
        </div>
      </article>`)}
      ${has('waitlist') ? waitlistOwner() : ''}`;
  }
  function waitlistOwner() {
    const sample = [{ name: 'Ирина К.', when: 'завтра', what: venue.services[0].t }, { name: 'Олег М.', when: 'в субботу', what: (venue.services[1] || venue.services[0]).t }];
    const own = store.get().waitlist.map((w) => ({ name: `${(store.get().contact || {}).name || 'Вы'} (это вы)`, when: L.dayTitle(w.date), what: w.titles.join(', ') }));
    return html`<section class="section"><div class="section__head"><h2 class="display h3">Лист <em>ожидания</em></h2></div>
      <div class="list">${[...own, ...sample].map((w) => html`<div class="row"><span class="avatar">${L.initials(w.name)}</span><div class="row__main"><div class="row__title">${w.name}</div><div class="row__sub">${w.what} · ${w.when}</div></div></div>`)}</div></section>`;
  }
  ACTS['prepay-ok'] = (d) => { store.update((s) => { const b = s.bookings.find((x) => x.id === d.id); if (b) b.prepayStatus = 'paid'; }); haptic.ok(); toast('Отметили оплату. Клиенту пришло подтверждение'); refresh(); };
  ACTS.decide = (d, el) => {
    const card = el.closest('.req');
    if (d.v === 'ok') haptic.ok(); else haptic.impact('medium');
    store.update((s) => {
      if (d.own === '1') {
        const b = s.bookings.find((x) => x.id === d.id);
        if (b && b.status === 'request' && d.v === 'ok') {
          // Назначаем первое свободное время в удобные клиенту дни и время суток.
          const ok = (m) => !b.parts || !b.parts.length || b.parts.some((p) => (p === 'Утро' ? m < 720 : p === 'День' ? m >= 720 && m < 1020 : m >= 1020));
          for (const day of b.days || [b.date]) {
            const hit = [...slots.free(day, null, b.dur).entries()].find(([m]) => ok(m));
            if (hit) { b.date = day; b.time = L.toTime(hit[0]); b.masterId = hit[1]; break; }
          }
          b.status = b.time ? 'confirmed' : 'request';
        } else if (b) b.status = d.v === 'ok' ? 'confirmed' : 'declined';
      } else s.decided[d.id] = d.v;
    });
    toast(d.v === 'ok' ? (d.own === '1' ? 'Подтвердили. Загляните в «Записи»: статус уже обновился' : 'Подтвердили. Клиенту ушло сообщение') : 'Отклонили. Клиенту предложили выбрать другое время');
    card.classList.add('is-gone');
    setTimeout(refresh, 460);
  };
  ACTS['req-reset'] = () => { store.update((s) => { s.decided = {}; }); haptic.tap(); refresh(); };

  function ownerSchedule() {
    const sub = html`<div class="seg" role="tablist" style="margin-top:-2px">
      <button type="button" class="${view.sched === 'day' ? 'is-on' : ''}" data-act="sseg" data-v="day">День</button>
      <button type="button" class="${view.sched === 'week' ? 'is-on' : ''}" data-act="sseg" data-v="week">Неделя</button></div>`;
    if (view.sched === 'week') {
      const week = owner.weekLoad();
      return html`${sub}<div class="list week rise">${week.map((w) => { const d = L.parse(w.date); return html`
        <button class="row" type="button" data-act="sday" data-date="${w.date}">
          <div class="week__day"><b>${w.date === L.today() ? 'Сегодня' : L.WD[d.getDay()][0].toUpperCase() + L.WD[d.getDay()].slice(1)}, ${d.getDate()}</b><span>${w.count} ${L.plural(w.count, 'запись', 'записи', 'записей')}</span></div>
          <div class="load"><div class="load__bar"><i style="--p:${Math.round(w.load * 100)}%"></i></div><span class="num">${Math.round(w.load * 100)}%</span></div>
          ${I.chev}
        </button>`; })}</div>`;
    }
    const days = Array.from({ length: 7 }, (_, i) => L.addDays(L.today(), i));
    const all = owner.daySchedule(view.schedDay);
    const list = all.filter((x) => x.masterId === view.schedMaster);
    const busy = list.reduce((a, x) => a + x.dur, 0);
    const cap = venue.close - venue.open;
    const items = [];
    let t = venue.open;
    for (const x of list) {
      const s = L.toMin(x.time);
      if (s - t >= 60) items.push({ free: true, from: L.toTime(t), to: x.time });
      items.push(x); t = Math.max(t, L.toMin(x.end));
    }
    if (venue.close - t >= 60) items.push({ free: true, from: L.toTime(t), to: L.toTime(venue.close) });
    return html`${sub}
      ${has('manual') ? html`<button class="btn btn--plain btn--wide" style="margin-bottom:12px" type="button" data-act="manual">${I.plus}Записать клиента, если позвонил</button>` : ''}
      <div class="days" style="margin-bottom:12px">${days.map((date) => { const d = L.parse(date); return html`
        <button class="day ${date === view.schedDay ? 'is-on' : ''}" type="button" data-act="sday" data-date="${date}">
          <div class="day__wd">${date === L.today() ? 'сегодня' : L.WD[d.getDay()]}</div><div class="day__n">${d.getDate()}</div><div class="day__free">${owner.daySchedule(date).length} зап.</div>
        </button>`; })}</div>
      ${venue.masters.length > 1 ? html`<div class="filters">${venue.masters.map((m) => html`<button type="button" class="${m.id === view.schedMaster ? 'is-on' : ''}" data-act="smaster" data-id="${m.id}">${m.name}</button>`)}</div>` : ''}
      <div class="load"><span>Занято ${L.duration(busy) || '0 мин'} из ${L.duration(cap)}</span><div class="load__bar"><i style="--p:${Math.round((busy / cap) * 100)}%"></i></div></div>
      <div class="tl">${items.map((x, i) => x.free ? html`
        <div class="tl__item rise" style="--i:${i}"><div class="tl__time">${x.from}</div><div class="tl__free">Свободно до ${x.to} · бот предложит это окно клиентам</div></div>` : html`
        <div class="tl__item rise" style="--i:${i}">
          <div class="tl__time">${x.time}<span>${x.end}</span></div>
          <div class="card tl__card ${x.own ? 'is-own' : ''}">
            <div class="row__title" style="font-size:15px">${x.client}</div>
            <div class="row__sub">${x.service}${x.price ? ` · ${L.money(x.price)}` : ''}</div>
            ${x.status === 'pending' ? html`<div style="margin-top:6px">${statusChip('pending')}</div>` : ''}
          </div>
        </div>`)}</div>
      ${has('evening') ? eveningPreview() : ''}`;
  }
  function eveningPreview() {
    const tomorrow = owner.daySchedule(L.addDays(L.today(), 1));
    return html`<section class="section"><div class="section__head"><h2 class="display h3">Каждый вечер <em>в 20:00</em></h2></div>
      <div class="bubble-wrap"><div class="bubble"><div class="bubble__from">Бот записи</div><b>Завтра ${tomorrow.length} ${L.plural(tomorrow.length, 'запись', 'записи', 'записей')}</b><br>${tomorrow.slice(0, 4).map((x) => html`${x.time} ${x.client.split(' (')[0]}, ${lower(x.service)}<br>`)}${tomorrow.length > 4 ? `и ещё ${tomorrow.length - 4}` : ''}<div class="bubble__time">20:00</div></div></div></section>`;
  }
  /* Ручная запись (manual): клиент позвонил, владелец записывает в пару нажатий. */
  let manualDraft = null;
  ACTS.manual = () => { manualDraft = { name: '', phone: '', sid: venue.services[0].id, date: view.schedDay, time: '' }; drawManual(); };
  function drawManual() {
    const md = manualDraft; const s = svcById(md.sid);
    const free = [...slots.free(md.date, view.schedMaster, s.d).keys()].slice(0, 12);
    openSheet(html`
      <div class="page-title">${heading('Записать', 'клиента', 'h2')}<p>${L.dayTitle(md.date)} · ${(master(view.schedMaster) || venue.masters[0]).name}</p></div>
      <div class="list">
        <label class="field"><span>Имя</span><input data-sheet-in="m-name" maxlength="40" value="${md.name}" placeholder="Анна"></label>
        <label class="field"><span>Телефон</span><input data-sheet-in="m-phone" type="tel" maxlength="20" value="${md.phone}" placeholder="+7 900 000-00-00"></label>
        <div class="field"><span>Услуга</span><div class="choices">${venue.services.map((x) => html`<button type="button" class="choice ${x.id === md.sid ? 'is-on' : ''}" data-sheet="m-svc" data-v="${x.id}">${x.t}</button>`)}</div></div>
        <div class="field"><span>Время</span><div class="choices">${free.length ? free.map((m) => html`<button type="button" class="choice ${md.time === L.toTime(m) ? 'is-on' : ''}" data-sheet="m-time" data-v="${L.toTime(m)}">${L.toTime(m)}</button>`) : html`<span class="muted small">В этот день свободного времени нет</span>`}</div></div>
      </div>
      <button class="btn btn--accent btn--wide" style="margin-top:14px" type="button" data-sheet="m-save">Записать</button>`);
  }
  ACTS.sseg = (d) => { haptic.tap(); view.sched = d.v; refresh(); };
  ACTS.sday = (d) => { haptic.tap(); view.schedDay = d.date; view.sched = 'day'; refresh(); };
  ACTS.smaster = (d) => { haptic.tap(); view.schedMaster = d.id; refresh(); };

  function ownerClients() {
    const idleDays = 45;
    const q = view.q.trim().toLowerCase();
    const black = store.get().black;
    const groups = { all: owner.clients, loyal: owner.clients.filter((c) => c.visits >= 5), idle: owner.clients.filter((c) => c.last >= idleDays), bday: owner.clients.filter((c) => bdayIn(c) <= 14), black: owner.clients.filter((c) => black[c.id]) };
    const list = groups[view.clients].filter((c) => !q || c.name.toLowerCase().includes(q) || c.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '') || '#'));
    const invited = store.get().invited;
    const ago = (n) => (n < 7 ? `${n} ${L.plural(n, 'день', 'дня', 'дней')} назад` : n < 60 ? `${Math.round(n / 7)} нед. назад` : `${Math.round(n / 30)} мес. назад`);
    return html`
      ${has('broadcast') ? html`<button class="btn btn--plain btn--wide" style="margin-bottom:12px" type="button" data-act="broadcast">${I.msg}Написать всем клиентам · ${owner.clients.length}</button>` : ''}
      <label class="search">${I.search}<input data-in="q" type="search" placeholder="Имя, телефон или №" value="${view.q}" autocomplete="off"></label>
      <div class="filters">
        <button type="button" class="${view.clients === 'all' ? 'is-on' : ''}" data-act="cseg" data-v="all">Все · ${groups.all.length}</button>
        <button type="button" class="${view.clients === 'loyal' ? 'is-on' : ''}" data-act="cseg" data-v="loyal">Постоянные · ${groups.loyal.length}</button>
        <button type="button" class="${view.clients === 'idle' ? 'is-on' : ''}" data-act="cseg" data-v="idle">Давно не были · ${groups.idle.length}</button>
        ${has('birthday') ? html`<button type="button" class="${view.clients === 'bday' ? 'is-on' : ''}" data-act="cseg" data-v="bday">День рождения скоро · ${groups.bday.length}</button>` : ''}
        ${has('blacklist') ? html`<button type="button" class="${view.clients === 'black' ? 'is-on' : ''}" data-act="cseg" data-v="black">Чёрный список · ${groups.black.length}</button>` : ''}
      </div>
      ${view.clients === 'bday' ? html`<div class="card note" style="margin-bottom:12px">${I.sparkle}<div><b>Поздравим сами</b><span class="muted">В день рождения бот пришлёт поздравление и подарок: скидку ${F('bday', 15)}% на неделю.</span></div></div>` : ''}
      ${view.clients === 'black' ? html`<div class="card note" style="margin-bottom:12px">${I.shield}<div><b>Кто не приходит</b><span class="muted">Записаться они смогут только с предоплатой, а вы увидите пометку в заявке.</span></div></div>` : ''}
      ${view.clients === 'idle' && has('winback') ? html`<div class="card note" style="margin-bottom:12px">${I.sparkle}<div><b>Верните их одной кнопкой</b><span class="muted">Бот напишет: «Давно не виделись», и покажет свободные окна. Без рассылок вручную.</span></div></div>` : ''}
      ${list.length ? html`<div class="list" id="clients">${list.map((c) => html`
        <div class="row" data-act="client" data-id="${c.id}" role="button" tabindex="0">
          <span class="avatar">${L.initials(c.name)}</span>
          <div class="row__main"><div class="row__title">${c.name} <span class="small muted">№${c.id.slice(1)}</span>${black[c.id] ? html` <span class="chip chip--off">ч/с</span>` : ''}</div><div class="row__sub">${c.visits} ${L.plural(c.visits, 'визит', 'визита', 'визитов')} · ${L.money(Math.round(c.sum / 100) * 100)} · был ${ago(c.last)}</div></div>
          ${c.last >= idleDays && has('winback') ? (invited[c.id] ? html`<span class="chip chip--ok">${I.check}Позвали</span>` : html`<button class="btn btn--soft btn--sm" type="button" data-act="invite" data-id="${c.id}">Позвать</button>`) : ''}
        </div>`)}</div>` : html`<div class="empty"><div class="empty__icon">${I.search}</div><h3 class="display h3">Никого не нашли</h3><p>Попробуйте имя или последние цифры телефона</p></div>`}`;
  }
  ACTS.cseg = (d) => { haptic.tap(); view.clients = d.v; refresh(); };
  /** Через сколько дней день рождения клиента (примерно у каждого четвёртого скоро). */
  const bdayIn = (c) => (Number(c.id.slice(1)) % 4 === 1 ? 2 + (Number(c.id.slice(1)) % 11) : 99);
  ACTS.client = (d, el, e) => {
    if (e && e.target.closest('[data-act="invite"]')) return;
    const c = owner.clients.find((x) => x.id === d.id); if (!c) return;
    haptic.tap();
    const st = store.get();
    openSheet(html`
      <div class="master-head"><span class="avatar avatar--lg">${L.initials(c.name)}</span><div><h2 class="display h2">${c.name}</h2><div class="muted">№${c.id.slice(1)} · ${c.phone}</div></div></div>
      <div class="tiles" style="margin-top:0"><div class="card tile"><b>${c.visits}</b><span>визитов</span></div><div class="card tile"><b>${L.money(Math.round(c.sum / 100) * 100)}</b><span>всего</span></div><div class="card tile"><b>${c.last}</b><span>${L.plural(c.last, 'день', 'дня', 'дней')} назад</span></div></div>
      <div class="list" style="margin-top:12px">
        <div class="row"><div class="row__main"><div class="row__title">Любит</div><div class="row__sub">${c.fav} · ${c.master}</div></div></div>
        ${has('birthday') && bdayIn(c) <= 14 ? html`<div class="row"><div class="row__main"><div class="row__title">День рождения через ${bdayIn(c)} ${L.plural(bdayIn(c), 'день', 'дня', 'дней')}</div><div class="row__sub">Бот поздравит сам</div></div></div>` : ''}
        ${has('notes') ? html`<label class="field"><span>Заметка, видите только вы</span><textarea data-sheet-in="note" data-id="${c.id}" rows="2" maxlength="300" placeholder="Например: аллергия на лак, любит тихо">${st.notes[c.id] || ''}</textarea></label>` : ''}
      </div>
      ${has('notes') ? html`<button class="btn btn--soft btn--wide" style="margin-top:12px" type="button" data-sheet="note-save" data-id="${c.id}">Сохранить заметку</button>` : ''}
      ${has('blacklist') ? html`<button class="btn btn--line btn--wide" style="margin-top:8px" type="button" data-sheet="black" data-id="${c.id}">${st.black[c.id] ? 'Убрать из чёрного списка' : 'В чёрный список'}</button>` : ''}`);
  };
  ACTS.broadcast = () => openSheet(html`
    <div class="page-title">${heading('Рассылка', 'всем', 'h2')}<p>Сообщение уйдёт ${owner.clients.length} клиентам в Telegram. Бот не пишет ночью.</p></div>
    <div class="list"><label class="field"><span>Текст</span><textarea data-sheet-in="bc" rows="4" maxlength="500">Новинка: ${lower(venue.services[venue.services.length - 1].t)}. Запишитесь на этой неделе, и будет скидка 10%</textarea></label></div>
    <button class="btn btn--accent btn--wide" style="margin-top:14px" type="button" data-sheet="bc-send">Отправить ${owner.clients.length} клиентам</button>`);
  ACTS.invite = (d) => { store.update((s) => { s.invited[d.id] = true; }); haptic.ok(); toast('Бот отправил приглашение со свободными окнами'); refresh(); };
  INPUTS.q = (el) => { view.q = el.value; const pos = el.selectionStart; refresh(); const n = current.querySelector('[data-in="q"]'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch { /* type=search */ } } };

  function ownerMoney() {
    if (!has('accounting')) return monthlyReport();
    const week = view.money === 'week';
    const rows = week ? owner.perDay.map((x) => ({ label: L.WD[L.parse(x.date).getDay()], sum: x.sum, visits: x.visits, hi: x.date === L.today() })) : owner.perWeek.map((x, i) => ({ label: `${i + 1} нед`, sum: x.sum, visits: x.visits, hi: i === 3 }));
    const total = rows.reduce((a, x) => a + x.sum, 0);
    const visits = rows.reduce((a, x) => a + x.visits, 0);
    const max = Math.max(...rows.map((x) => x.sum));
    return html`
      <div class="seg" role="tablist" style="margin-top:-2px">
        <button type="button" class="${week ? 'is-on' : ''}" data-act="mseg" data-v="week">7 дней</button>
        <button type="button" class="${week ? '' : 'is-on'}" data-act="mseg" data-v="month">Месяц</button>
      </div>
      <div class="card card--pad rise">
        <p class="eyebrow" style="margin-bottom:6px">Выручка за ${week ? '7 дней' : 'месяц'}</p>
        <div class="money-big">${L.money(total)}</div>
        <div class="growth" style="margin-top:6px">${I.up}+${owner.growth}% к прошлому ${week ? 'отрезку' : 'месяцу'}</div>
        <div class="bars">${rows.map((x, i) => html`<div class="bars__col ${x.hi ? 'is-hi' : ''}"><div class="bars__bar" style="--h:${Math.round((x.sum / max) * 100)}%;--i:${i}"></div><span class="bars__lbl">${x.label}</span></div>`)}</div>
      </div>
      <div class="tiles rise" style="--i:1">
        <div class="card tile"><b>${visits}</b><span>визитов</span></div>
        <div class="card tile"><b>${L.money(Math.round(total / Math.max(1, visits) / 10) * 10)}</b><span>средний чек</span></div>
        <div class="card tile"><b>${owner.noshowNow}%</b><span>неявок</span></div>
      </div>
      <div class="section rise" style="--i:2;margin-top:18px">
        <div class="section__head"><h2 class="display h3">Неявки <em>до и после</em></h2></div>
        <div class="card compare">
          <div><div class="compare__val was">${owner.noshowBefore}%</div><div class="small muted">без напоминаний</div></div>
          ${I.arrow}
          <div><div class="compare__val">${owner.noshowNow}%</div><div class="small muted">бот напоминает сам</div></div>
        </div>
        <p class="demo-note" style="margin-top:10px">Это примерно <b>${L.money(Math.round(owner.perWeek.reduce((a, x) => a + x.sum, 0) * (owner.noshowBefore - owner.noshowNow) / 100 / 1000) * 1000)}</b> в месяц, которые больше не теряются на неявках</p>
      </div>
      <div class="section rise" style="--i:3;margin-top:18px">
        <div class="section__head"><h2 class="display h3">По <em>услугам</em></h2></div>
        <div class="card share">${owner.byService.map((x) => html`<div class="share__row"><span>${x.title}</span><b>${L.money(Math.round(total * x.share / 100) * 100)}</b><div class="share__bar"><i style="--p:${Math.round(x.share * 100)}%"></i></div></div>`)}</div>
      </div>
      ${venue.masters.length > 1 ? html`<div class="section rise" style="--i:4;margin-top:18px">
        <div class="section__head"><h2 class="display h3">По <em>${who}ам</em></h2></div>
        <div class="card share">${owner.byMaster.map((x) => html`<div class="share__row"><span>${x.name}</span><b>${L.money(Math.round(total * x.share / 100) * 100)}</b><div class="share__bar"><i style="--p:${Math.round(x.share * 100)}%"></i></div></div>`)}</div>
      </div>` : ''}
      ${has('sources') ? html`<div class="section rise" style="margin-top:18px"><div class="section__head"><h2 class="display h3">Откуда <em>клиенты</em></h2></div>
        <div class="card share">${X.SOURCES.slice(0, 5).map((src, i) => { const sh = [0.34, 0.22, 0.18, 0.15, 0.11][i]; return html`<div class="share__row"><span>${src}</span><b>${Math.round(visits * sh)} ${L.plural(Math.round(visits * sh), 'визит', 'визита', 'визитов')}</b><div class="share__bar"><i style="--p:${Math.round(sh * 100 / 0.34)}%"></i></div></div>`; })}</div></div>` : ''}
      ${has('team') && venue.masters.length ? html`<div class="section rise" style="margin-top:18px"><div class="section__head"><h2 class="display h3">Зарплата <em>${who}ам</em></h2><span class="tag tag--card">40%</span></div>
        <div class="card share">${owner.byMaster.map((x) => html`<div class="share__row"><span>${x.name} · ★ ${fmtRating((master(venue.masters.find((m) => m.name === x.name).id) || {}).rating || 5)}</span><b>${L.money(Math.round(total * x.share * 0.4 / 100) * 100)}</b><div class="share__bar"><i style="--p:${Math.round(x.share * 100)}%"></i></div></div>`)}</div></div>` : ''}
      ${has('expenses') ? expensesBlock(total) : ''}
      <button class="btn btn--plain btn--wide" style="margin-top:18px" type="button" data-act="excel">${I.cal}Выгрузить в Excel</button>
      ${has('monthly') ? html`<button class="section__link" style="display:block;margin:14px auto 0" type="button" data-act="monthly">Как выглядит отчёт за месяц</button>` : ''}`;
  }
  function expensesBlock(total) {
    const st = store.get();
    const exp = st.expenses || [['Аренда', 45000], ['Материалы', Math.round(total * 0.08 / 100) * 100], ['Реклама', 8000]];
    const month = owner.perWeek.reduce((a, x) => a + x.sum, 0);
    const spent = exp.reduce((a, [, v]) => a + v, 0);
    const salary = has('team') ? Math.round(month * 0.4 / 100) * 100 : 0;
    return html`<div class="section rise" style="margin-top:18px"><div class="section__head"><h2 class="display h3">Расходы <em>и прибыль</em></h2><span class="tag tag--card">за месяц</span></div>
      <div class="list">${exp.map(([t, v]) => html`<div class="row"><div class="row__main"><div class="row__title">${t}</div></div><span class="row__price">−${L.money(v)}</span></div>`)}${salary ? html`<div class="row"><div class="row__main"><div class="row__title">Зарплата мастеров</div></div><span class="row__price">−${L.money(salary)}</span></div>` : ''}</div>
      <div class="tiles" style="grid-template-columns:1fr 1fr"><div class="card tile"><b>${L.money(month)}</b><span>выручка</span></div><div class="card tile"><b>${L.money(month - spent - salary)}</b><span>чистая прибыль</span></div></div></div>`;
  }
  function monthlyReport() {
    const month = owner.perWeek.reduce((a, x) => a + x.sum, 0); const visits = owner.perWeek.reduce((a, x) => a + x.visits, 0);
    return html`<div class="section__head"><h2 class="display h3">Отчёт <em>за месяц</em></h2></div>
      <div class="bubble-wrap"><div class="bubble"><div class="bubble__from">Бот записи</div><b>Итоги месяца</b><br>Заявок: ${Math.round(visits * 1.15)}, из них ночью ${Math.round(visits * 0.18)}<br>Визитов: ${visits}<br>Выручка: ${L.money(month)}<br>Неявок: ${owner.noshowNow}%<div class="bubble__time">1-е число, 10:00</div></div></div>`;
  }
  ACTS.monthly = () => openSheet(html`<div class="page-title">${heading('Отчёт', 'за месяц', 'h2')}<p>Приходит владельцу 1-го числа.</p></div>${monthlyReport()}<button class="btn btn--plain btn--wide" style="margin-top:18px" type="button" data-sheet="close">Понятно</button>`);
  ACTS.excel = () => {
    const rows = [['Дата', 'Время', 'Клиент', 'Услуга', 'Мастер', 'Сумма']];
    for (let i = 0; i < 7; i++) { const date = L.addDays(L.today(), i - 6); owner.daySchedule(date).forEach((x) => rows.push([date, x.time, x.client, x.service, x.master, x.price])); }
    const csv = '\ufeff' + rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    haptic.ok();
    if (inTelegram) { toast('В настоящем боте файл Excel придёт в этот чат'); return; }
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'zapisi.csv'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  /* ================= Настройки: цены, часы, закрытые дни ================= */

  /* Функции, которые владелец включает и выключает сам. param: настройка числом (скидка, процент). */
  const SWITCHES = [
    ['Клиентам', [
      ['selfbook', 'Самозапись в свободные окна', 'Выключено: клиент оставляет заявку с удобными днями, вы назначаете время'],
      ['reminders', 'Напоминания накануне и за 2 часа'],
      ['reschedule', 'Клиент сам переносит запись'],
      ['prepay', 'Предоплата за дорогие услуги', '', ['prepay', '% от суммы', 20, 5, 100]],
      ['firstvisit', 'Скидка на первый визит', 'Новые клиенты видят её на главной и в записи', ['firstvisit', '%', 10, 1, 50]],
      ['referral', '«Приведи друга»', 'Скидка клиенту и другу по личной ссылке', ['referral', '%', 10, 1, 50]],
      ['waitlist', 'Лист ожидания на занятые дни'],
      ['gift', 'Подарочные сертификаты'],
      ['reviews', 'Оценка после визита и отзывы на картах'],
      ['return', '«Пора снова» через нужный срок'],
      ['portfolio', 'Работы мастеров'],
      ['faq', 'Частые вопросы'],
      ['brief', 'Фото референса при записи'],
      ['sources', 'Вопрос «Откуда вы о нас узнали?»'],
      ['team', 'Чаевые и зарплата мастерам'],
    ]],
    ['Вам', [
      ['evening', 'Расписание на завтра в 20:00'],
      ['winback', 'Возврат давно не бывших'],
      ['birthday', 'Поздравление с днём рождения', 'Подарок: скидка на неделю', ['bday', '%', 15, 1, 50]],
      ['blacklist', 'Чёрный список'],
      ['broadcast', 'Рассылка всем клиентам'],
      ['expenses', 'Расходы и прибыль'],
    ]],
  ];
  function switchesBlock() {
    return SWITCHES.map(([group, list]) => html`
      <section class="section rise"><div class="section__head"><h2 class="display h3">Функции <em>${group.toLowerCase()}</em></h2></div>
        <div class="list">${list.map(([k, title, about, param]) => { const on = has(k); return html`
          <div class="row opt">
            <div class="row__main"><div class="row__title">${title}</div>${about ? html`<div class="row__sub">${about}</div>` : ''}
              ${param && on ? html`<label class="opt__param"><input class="price-in" data-in="fset" data-id="${param[0]}" type="number" inputmode="numeric" min="${param[3]}" max="${param[4]}" value="${F(param[0], param[2])}"><span class="muted">${param[1]}</span></label>` : ''}</div>
            <input class="switch" type="checkbox" aria-label="${title}" data-in="feat" data-id="${k}" ${on ? 'checked' : ''}>
          </div>`; })}</div></section>`);
  }
  INPUTS.feat = (el) => {
    store.update((s) => { s.features[el.dataset.id] = el.checked; });
    haptic.tap(); toast(el.checked ? 'Включено: клиенты уже видят' : 'Выключено'); refresh();
  };
  INPUTS.fset = (el) => {
    const v = Math.round(Number(el.value));
    if (!Number.isFinite(v) || v < Number(el.min) || v > Number(el.max)) return;
    store.update((s) => { s.fset[el.dataset.id] = v; });
  };

  function ownerSettings() {
    const st = store.get();
    const days = Array.from({ length: 14 }, (_, i) => L.addDays(L.today(), i));
    return html`
      ${has('settings') ? html`<section class="rise"><div class="section__head"><h2 class="display h3">Цены</h2><span class="small muted">сразу видны клиентам</span></div>
        <div class="list">${venue.services.map((x) => html`<label class="row"><div class="row__main"><div class="row__title">${x.t}</div><div class="row__sub">${L.duration(x.d)}</div></div><input class="price-in" data-in="price" data-id="${x.id}" type="number" inputmode="numeric" min="0" max="10000000" step="100" value="${x.p}"><span class="muted">₽</span></label>`)}</div></section>
      <section class="section rise"><div class="section__head"><h2 class="display h3">Часы <em>работы</em></h2></div>
        <div class="list"><div class="row"><div class="row__main"><div class="row__title">Ежедневно 10:00–21:00</div><div class="row__sub">Перерыв и часы мастеров меняются кнопками в боте</div></div></div></div></section>` : ''}
      ${has('closeday') ? html`<section class="section rise"><div class="section__head"><h2 class="display h3">Закрыть <em>дни</em></h2><span class="small muted">отпуск, санитарный день</span></div>
        <div class="days">${days.map((date) => { const d = L.parse(date); const on = st.closed.includes(date); return html`
          <button class="day ${on ? 'is-on' : ''}" type="button" data-act="close-day" data-date="${date}" aria-pressed="${on}"><div class="day__wd">${L.WD[d.getDay()]}</div><div class="day__n">${d.getDate()}</div><div class="day__free">${on ? 'закрыт' : ''}</div></button>`; })}</div></section>` : ''}
      ${switchesBlock()}`;
  }
  INPUTS.price = (el) => {
    const v = Math.round(Math.max(0, Math.min(10000000, Number(el.value) || 0)));
    store.update((s) => { s.prices[el.dataset.id] = v; });
    applyPrices();
  };
  ACTS['close-day'] = (d) => {
    store.update((s) => { if (s.closed.includes(d.date)) s.closed = s.closed.filter((x) => x !== d.date); else s.closed.push(d.date); });
    haptic.tap(); toast(store.get().closed.includes(d.date) ? `${L.dayTitle(d.date)}: запись закрыта` : `${L.dayTitle(d.date)}: снова открыт`); refresh();
  };


  ACTS.mseg = (d) => { haptic.tap(); view.money = d.v; refresh(); };

  /* ---------- Запуск ---------- */

  document.title = `${venue.name} · запись`;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.TG.start(() => { applyTheme(); refresh(); });
  applyTheme();
  const startTab = new URLSearchParams(location.search).get('tab');
  if (ROOTS.includes(startTab)) tab = startTab;
  stack.push({ name: tab, args: {} });
  render('fade');
  if (!inTelegram) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (!params.theme) { applyTheme(); refresh(); } });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (sheet.classList.contains('is-on')) closeSheet(); else goBack(); } });
})();
