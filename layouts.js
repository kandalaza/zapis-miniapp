'use strict';

/* Раскладки главного экрана по сферам, с фото (docs/miniapp-design.md).
 * Шесть видов, у каждой сферы два. Вид выбирается по названию заведения, владелец переключает его в «Настройках».
 *   cover    фото на весь первый экран, название поверх, лента работ и мастера кружками (ногти, брови, СПА…)
 *   gallery  тёмная галерея работ сеткой, карточка мастера внутри сетки (ногти, брови)
 *   masters  тёмный, мастера большими портретами каруселью, курсив (барбер, салон, фитнес)
 *   atelier  светлый, крупное фото зала, мастера карточками с фото (барбер, косметология, автосервис…)
 *   poster   тёмный плакат: узкий шрифт капслоком, «мастер дня», кнопка-мазок (тату, авто, фитнес, ремонт)
 *   flash    каталог готовых эскизов с ценой и размером (тату)
 * app.js передаёт сюда помощники через ctx; без фото сферы остаётся прежний экран. */

(function () {
  const KINDS = {
    tattoo: ['flash', 'poster'],
    barber: ['masters', 'atelier'],
    nails: ['cover', 'gallery'],
    brows: ['cover', 'gallery'],
    cosmetology: ['atelier', 'cover'],
    massage: ['cover', 'atelier'],
    spa: ['cover', 'atelier'],
    salon: ['cover', 'masters'],
    auto: ['poster', 'atelier'],
    fitness: ['poster', 'masters'],
    pilates: ['cover', 'atelier'],
    repair: ['atelier', 'poster'],
    default: ['atelier', 'cover'],
  };
  const TITLES = { cover: 'Обложка', gallery: 'Галерея', masters: 'Мастера', atelier: 'Ателье', poster: 'Плакат', flash: 'Каталог эскизов' };
  const ABOUT = {
    cover: 'Большое фото и лента работ',
    gallery: 'Тёмная, работы сеткой',
    masters: 'Тёмная, мастера крупно',
    atelier: 'Светлая, фото зала и мастера',
    poster: 'Тёмная, плакатные заголовки',
    flash: 'Готовые эскизы с ценой',
  };
  /* Как называть «работы» в разных сферах. */
  const WORK_WORD = { fitness: 'тренировки', pilates: 'занятия', spa: 'программы', massage: 'процедуры', cosmetology: 'процедуры' };
  const DARK = new Set(['gallery', 'masters', 'poster']);
  const DARK_MOODS = new Set(['noir', 'men', 'loft', 'neon']);
  const LIGHT_MOODS = new Set(['rose', 'eco', 'play', 'gold']);

  /** Вид для заведения: выбор владельца, затем настроение названия, затем вариант (тот же хэш, что и палитра). */
  function pick(sphere, style, chosen) {
    const pair = KINDS[sphere] || KINDS.default;
    if (chosen === 'a' || chosen === 'b') return pair[chosen === 'a' ? 0 : 1];
    const dark = pair.findIndex((k) => DARK.has(k));
    if (dark >= 0 && DARK_MOODS.has(style.mood)) return pair[dark];
    const light = pair.findIndex((k) => !DARK.has(k));
    if (light >= 0 && LIGHT_MOODS.has(style.mood)) return pair[light];
    return pair[(Math.abs(Number(style.variant) || 0)) % 2];
  }

  function create(ctx) {
    const { html, raw, I, venue, L, has, F, slots, minDur, who, Who, fmtRating, statusChip, whenText, mapHref, isNewClient, upcoming, photos } = ctx;
    const P = photos;
    const img = (src, alt = '', cls = '', eager = false) => html`<img class="${cls}" src="${src}" alt="${alt}" ${raw(eager ? 'fetchpriority="high"' : 'loading="lazy"')} decoding="async">`;
    const masterPhoto = (i) => P.masters[i % P.masters.length];
    const reviewsText = `${venue.reviewsCount} ${L.plural(venue.reviewsCount, 'отзыв', 'отзыва', 'отзывов')}`;
    const ratingPill = (cls = '') => html`<span class="lx-pill ${cls}">${I.star}${fmtRating(venue.rating)} · ${reviewsText}</span>`;
    const minPrice = () => { const ps = venue.services.map((s) => s.p).filter((p) => p > 0); return ps.length ? Math.min(...ps) : 0; };
    const works = () => P.works.map((w, i) => ({ ...w, i, m: venue.masters[i % venue.masters.length] }));
    const short = venue.address.split(',').slice(-2).join(',').trim();
    /* Короткое имя для крупного набора: то, что в кавычках («Милана»), иначе название целиком. */
    const quoted = /[«"]([^»"]{2,40})[»"]/.exec(venue.name);
    const brand = quoted ? quoted[1] : venue.name;

    /* Главная кнопка и ближайшее окно: одинаково во всех видах. */
    function next() {
      const near = slots.nearest(null, minDur, 6);
      const first = near[0];
      if (!has('selfbook')) return { near: [], label: 'Оставить заявку', act: html`data-act="book"`, line: `Запись онлайн, ${who} подберёт время` };
      if (!first) return { near: [], label: 'Записаться', act: html`data-act="book"`, line: 'Свободные окна появятся скоро' };
      return {
        near, first,
        label: 'Записаться',
        act: html`data-act="take" data-date="${first.date}" data-time="${first.time}" data-master="${first.masterId}"`,
        line: `Ближайшее окно ${L.dayTitle(first.date).split(',')[0]} в ${first.time}`,
      };
    }
    /** Карточка «Ваша запись», если клиент уже записан. */
    function mine() {
      const b = upcoming()[0];
      if (!b) return '';
      return html`
        <button class="lx-mine rise" type="button" data-act="tab" data-tab="bookings">
          <span class="lx-mine__date"><b>${L.parse(b.date).getDate()}</b>${L.MON[L.parse(b.date).getMonth()].slice(0, 3)}</span>
          <span class="lx-mine__main"><span class="lx-mine__title">Ваша запись, ${whenText(b)}</span><span class="lx-mine__sub">${b.titles.join(', ')}</span>${statusChip(b.status)}</span>${I.chev}
        </button>`;
    }
    const discount = () => (has('firstvisit') && isNewClient() ? html`<span class="lx-hot">−${F('firstvisit', 10)}% на первый визит</span>` : '');
    const windows = (n) => {
      const list = n.near.slice(1, 6);
      if (!list.length) return '';
      return html`<div class="lx-times">${list.map((w) => html`<button type="button" class="lx-time" data-act="take" data-date="${w.date}" data-time="${w.time}" data-master="${w.masterId}"><span>${L.dayTitle(w.date).split(',')[0]}</span><b>${w.time}</b></button>`)}</div>`;
    };
    const head = (title, link = '', act = '') => html`<div class="section__head"><h2 class="display h3">${raw(title)}</h2>${link ? html`<button class="section__link" type="button" ${raw(act)}>${link}</button>` : ''}</div>`;
    const ww = WORK_WORD[venue.sphere] || 'работы';
    const workStrip = (title = `Наши <em>${ww}</em>`) => html`
      <section class="section rise" style="--i:3">
        <div class="section__head"><h2 class="display h3">${raw(title)}</h2><span class="tag tag--card">фото для примера</span></div>
        <div class="scroller">${works().map((w) => html`
          <button class="lx-work" type="button" data-act="lx-work" data-i="${w.i}">${img(w.src, w.t)}<span class="lx-work__t">${w.t}</span><span class="lx-work__m">${w.m.name}</span></button>`)}</div>
      </section>`;
    const masterRow = () => html`
      <section class="section rise" style="--i:4">
        ${head(venue.masters.length > 1 ? `Наши ${who}ы` : `Ваш ${who}`)}
        <div class="scroller lx-faces">${venue.masters.map((m, i) => html`
          <button class="lx-face" type="button" data-act="master-card" data-id="${m.id}">${img(masterPhoto(i), m.name)}<b>${m.name.split(' ')[0]}</b><span>${I.star}${fmtRating(m.rating)}</span></button>`)}</div>
      </section>`;
    const svcChips = () => html`<div class="lx-chips">${venue.services.slice(0, 6).map((s) => html`<button type="button" class="lx-chip" data-act="book" data-svc="${s.id}">${s.t}</button>`)}</div>`;

    /* ---------- Обложка ---------- */
    function cover() {
      const n = next();
      return html`
        <header class="lx-cover">
          ${img(P.hero, P.heroAlt, 'lx-cover__img', true)}
          <div class="lx-cover__top">${ratingPill('lx-pill--glass')}</div>
          <div class="lx-cover__body">
            <p class="lx-eyebrow">${venue.base.label}</p>
            <h1 class="display lx-cover__name">${brand}</h1>
            <p class="lx-cover__lead">${n.line} · ${short}</p>
            ${discount()}
            <button class="lx-cta" type="button" ${n.act}>${n.label}<span class="btn__go">${I.arrow}</span></button>
          </div>
        </header>
        <div class="lx-sheet">
          ${mine()}
          <div class="lx-cats rise" style="--i:1">${venue.services.slice(0, 4).map((s, i) => html`
            <button type="button" class="lx-cat" data-act="book" data-svc="${s.id}">${img(P.works[(i * 2 + 1) % P.works.length].src)}<span>${s.t}</span><small>${L.priceText(s)}</small></button>`)}</div>
          ${n.near.length > 1 ? html`<section class="section rise" style="--i:2">${head('Свободное <em>время</em>', 'Все', 'data-act="book"')}${windows(n)}</section>` : ''}
          ${workStrip()}
          ${masterRow()}
        </div>`;
    }

    /* ---------- Галерея ---------- */
    function gallery() {
      const n = next();
      const m = venue.masters[0];
      const ws = works();
      const cols = [[], []];
      const hs = [0, 0];
      const tiles = [html`
        <div class="lx-g-master">
          ${img(masterPhoto(0), m.name, 'lx-g-master__ph')}
          <b>${m.name}</b><span>${m.role} · ${I.star}${fmtRating(m.rating)}</span>
          <button type="button" class="lx-g-master__btn" ${n.act}>${n.label}</button>
        </div>`, ...ws.map((w, i) => html`
        <button type="button" class="lx-g-tile ${i % 3 === 0 ? 'is-tall' : ''}" data-act="lx-work" data-i="${w.i}">${img(w.src, w.t)}<span class="lx-g-tile__t">${w.t}</span><span class="lx-heart" data-act="lx-like" data-i="${w.i}">${I.heart}</span></button>`)];
      tiles.forEach((t, i) => { const c = hs[0] <= hs[1] ? 0 : 1; cols[c].push(t); hs[c] += i === 0 ? 236 : (i - 1) % 3 === 0 ? 260 : 200; });
      return html`
        <header class="lx-g-head">
          ${img(P.hero, P.heroAlt, 'lx-g-head__img', true)}
          <div class="lx-g-head__body"><p class="lx-spaced">${venue.base.label}</p><h1 class="display lx-g-head__name">${brand}</h1>${ratingPill('lx-pill--glass')}</div>
        </header>
        <div class="lx-sheet lx-sheet--flat">
          ${mine()}
          <div class="lx-g-title rise"><h2 class="display h2">Вдохновение</h2><p>${n.line}. Нажмите на работу, ${who} повторит.</p></div>
          <div class="lx-chips lx-chips--line rise" style="--i:1"><button type="button" class="lx-chip is-on" ${n.act}>${n.label}</button>${venue.services.slice(0, 4).map((s) => html`<button type="button" class="lx-chip" data-act="book" data-svc="${s.id}">${s.t}</button>`)}</div>
          ${discount()}
          <div class="lx-masonry rise" style="--i:2">${cols.map((c) => html`<div>${c}</div>`)}</div>
          ${venue.masters.length > 1 ? masterRow() : ''}
        </div>`;
    }

    /* ---------- Мастера ---------- */
    function masters() {
      const n = next();
      const hour = new Date().getHours();
      const hi = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';
      return html`
        <header class="lx-m-head">
          <div><p class="lx-m-hi">${hi}</p><h1 class="lx-m-name">${venue.name}</h1></div>
          ${ratingPill()}
        </header>
        ${mine()}
        ${svcChips()}
        <div class="lx-m-rail rise" style="--i:1" data-rail>${venue.masters.map((m, i) => {
          const w = has('selfbook') ? slots.nearest(m.id, minDur, 1)[0] : null;
          return html`
          <article class="lx-m-card">
            <button type="button" class="lx-m-card__ph" data-act="master-card" data-id="${m.id}">${img(masterPhoto(i), m.name, '', i === 0)}<span class="lx-m-card__more">Работы</span></button>
            <div class="lx-m-card__body">
              <div class="lx-m-card__row"><h2>${m.name}</h2><span class="lx-m-card__rate">${I.star}${fmtRating(m.rating)}</span></div>
              <p class="lx-m-card__role">${m.role}</p>
              <p class="lx-m-card__near">${w ? `Ближайшее: ${L.dayTitle(w.date).split(',')[0]}, ${w.time}` : `${m.since} ${L.plural(m.since, 'год', 'года', 'лет')} опыта`}</p>
              <button type="button" class="lx-m-card__btn" data-act="book" data-master="${m.id}">Записаться</button>
            </div>
          </article>`; })}</div>
        ${venue.masters.length > 1 ? html`<div class="lx-dots" aria-hidden="true">${venue.masters.map((m, i) => html`<i class="${i ? '' : 'is-on'}"></i>`)}</div>` : ''}
        ${discount()}
        ${n.near.length > 1 ? html`<section class="section rise" style="--i:2">${head('Свободное <em>время</em>', 'Все', 'data-act="book"')}${windows(n)}</section>` : ''}
        <section class="section rise" style="--i:3">
          <button type="button" class="lx-hall" data-act="link" data-href="${mapHref()}">
            ${img(P.hall, P.hallAlt)}
            <span class="lx-hall__card">${I.pin}<span><b>${venue.name}</b><small>${venue.address}</small></span>${I.chev}</span>
          </button>
        </section>
        ${workStrip()}`;
    }

    /* ---------- Ателье ---------- */
    function atelier() {
      const n = next();
      return html`
        <header class="lx-a-head">
          <div class="lx-a-top"><span class="lx-spaced">${venue.base.label}</span>${ratingPill()}</div>
          <h1 class="display lx-a-name">${venue.name}</h1>
          <p class="lx-a-lead">${n.line}. ${venue.address}</p>
          <div class="lx-a-photo rise">
            ${P.atelier === 'hero' ? img(P.hero, P.heroAlt, '', true) : img(P.hall, P.hallAlt, '', true)}
            <button type="button" class="lx-glass" ${n.act}>${n.label}<span class="lx-glass__go">›››</span></button>
          </div>
        </header>
        ${mine()}
        ${has('firstvisit') && isNewClient() ? html`
          <div class="lx-offer rise" style="--i:1">
            <div><p class="lx-offer__k">Первый визит</p><h3 class="display">Скидка ${F('firstvisit', 10)}%</h3><p class="small">Действует при записи онлайн</p><button type="button" class="lx-offer__btn" ${n.act}>Записаться</button></div>
            ${img(P.works[0].src)}
          </div>` : ''}
        <section class="section rise" style="--i:2">
          ${head(venue.masters.length > 1 ? `Наши <em>${who}ы</em>` : `Ваш <em>${who}</em>`)}
          <div class="lx-a-list">${venue.masters.map((m, i) => html`
            <button type="button" class="lx-a-m" data-act="master-card" data-id="${m.id}">
              ${img(masterPhoto(i), m.name)}
              <span class="lx-a-m__main"><b>${m.name}</b><span>${m.role}</span><small>${I.star}${fmtRating(m.rating)} · ${m.since} ${L.plural(m.since, 'год', 'года', 'лет')} опыта</small></span>
              <span class="lx-a-m__go">${I.arrow}</span>
            </button>`)}</div>
        </section>
        ${n.near.length > 1 ? html`<section class="section rise" style="--i:3">${head('Свободное <em>время</em>', 'Все', 'data-act="book"')}${windows(n)}</section>` : ''}
        ${workStrip()}`;
    }

    /* ---------- Плакат ---------- */
    function poster() {
      const n = next();
      const m = venue.masters[new Date().getDate() % venue.masters.length];
      const mi = venue.masters.indexOf(m);
      const perks = [
        'Запись 24/7',
        has('prepay') ? `Предоплата ${F('prepay', 20)}%` : 'Без предоплаты',
        has('reminders') ? 'Напомним накануне' : 'Без звонков',
        venue.services.some((s) => s.p === 0) ? `${venue.services.find((s) => s.p === 0).t.split(' ')[0]} бесплатно` : 'Оплата на месте',
      ];
      return html`
        <header class="lx-p-head">
          <div><p class="lx-spaced lx-p-kind">${venue.base.label}</p><h1 class="lx-p-logo">${brand}</h1></div>
          ${ratingPill()}
        </header>
        ${mine()}
        <article class="lx-p-day rise" style="--i:1">
          <h2 class="lx-p-h">${Who} дня</h2>
          <p class="lx-p-day__name">${m.name}</p>
          <div class="lx-p-day__row">
            <button type="button" class="lx-p-day__ph" data-act="master-card" data-id="${m.id}">${img(masterPhoto(mi), m.name, '', true)}</button>
            <dl>
              <div><dt>Стиль</dt><dd>${m.role}</dd></div>
              <div><dt>Рейтинг</dt><dd>${fmtRating(m.rating)}</dd></div>
              ${minPrice() ? html`<div><dt>Цена от</dt><dd>${L.money(minPrice())}</dd></div>` : ''}
            </dl>
          </div>
          <button type="button" class="lx-brush lx-brush--ink" data-act="book" data-master="${m.id}">Записаться</button>
        </article>
        <div class="lx-p-tiles rise" style="--i:2">
          <button type="button" class="lx-p-tile" data-act="book">${venue.services[0].t}</button>
          <button type="button" class="lx-p-tile" data-act="book">${n.first ? `${L.dayTitle(n.first.date).split(',')[0]} ${n.first.time}` : 'Все услуги'}</button>
        </div>
        ${discount()}
        <section class="section rise" style="--i:3">
          <div class="section__head"><h2 class="lx-p-h">${ww[0].toUpperCase() + ww.slice(1)}</h2><span class="tag tag--card">фото для примера</span></div>
          <div class="lx-p-panel"><div class="scroller">${works().map((w) => html`<button type="button" class="lx-p-work" data-act="lx-work" data-i="${w.i}">${img(w.src, w.t)}</button>`)}</div></div>
        </section>
        <div class="lx-chips lx-chips--perks rise" style="--i:4">${perks.map((p) => html`<span class="lx-chip">${p}</span>`)}</div>
        <div class="lx-p-cta rise" style="--i:5"><button type="button" class="lx-brush" ${n.act}>${n.label}</button></div>
        <section class="section rise" style="--i:5">
          <button type="button" class="lx-hall" data-act="link" data-href="${mapHref()}">${img(P.hall, P.hallAlt)}<span class="lx-hall__card">${I.pin}<span><b>Как добраться</b><small>${venue.address}</small></span>${I.chev}</span></button>
        </section>`;
    }

    /* ---------- Каталог эскизов ---------- */
    const SIZES = [['до 5 см', 0.7], ['до 10 см', 1], ['до 15 см', 1.5]];
    const flashState = { i: 0, s: 1 };
    function flash() {
      const items = P.flash || [];
      const it = items[flashState.i] || items[0];
      const price = Math.round((it.p * SIZES[flashState.s][1]) / 500) * 500;
      return html`
        <header class="lx-f-head">
          <span class="lx-f-brand"><span class="mono">${venue.name.replace(/[^\p{L}]/gu, '').slice(0, 1) || '•'}</span>${venue.name}</span>
          <span class="muted small">${items.length} эскизов</span>
        </header>
        ${mine()}
        <h1 class="lx-f-title">Флэш</h1>
        <p class="lx-f-lead">Готовые эскизы наших мастеров. Можно сделать уже на этой неделе.</p>
        <div class="lx-f-rate">${ratingPill()}</div>
        <div class="lx-f-grid rise" style="--i:1">${items.map((x, i) => html`
          <button type="button" class="lx-f-item ${i === flashState.i ? 'is-on' : ''}" data-act="lx-flash" data-i="${i}" aria-pressed="${i === flashState.i}">${img(x.src, x.t)}<b>${x.t}</b><span>${L.money(Math.round((x.p * SIZES[flashState.s][1]) / 500) * 500)}</span></button>`)}</div>
        <p class="lx-f-label">Размер</p>
        <div class="seg lx-f-size">${SIZES.map(([t], i) => html`<button type="button" class="${i === flashState.s ? 'is-on' : ''}" data-act="lx-size" data-i="${i}">${t}</button>`)}</div>
        <div class="lx-f-sum rise" style="--i:2">
          <div><h3>${it.t}, ${SIZES[flashState.s][0]}</h3><p>Один сеанс, ${flashState.s === 2 ? 'около 3 ч' : flashState.s ? 'около 2 ч' : 'около 1 ч'}</p><b>${L.money(price)}</b></div>
          <button type="button" class="lx-f-go" data-act="lx-flash-book">Запись</button>
        </div>
        ${discount()}
        ${masterRow()}
        ${workStrip('Готовые <em>работы</em>')}`;
    }

    const RENDER = { cover, gallery, masters, atelier, poster, flash };
    return {
      kinds: (sphere) => KINDS[sphere] || KINDS.default,
      home: (kind) => RENDER[kind](),
      flashState, SIZES, works,
      masterPhoto,
    };
  }

  window.Layouts = { KINDS, TITLES, ABOUT, DARK, pick, create };
})();
