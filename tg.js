'use strict';

/* Обёртка над Telegram WebApp. Внутри Telegram работают нативные MainButton, BackButton, HapticFeedback и тема.
 * В обычном браузере (проверка, показ с ноутбука) те же вызовы рисуют запасные кнопки на странице. */

(function () {
  const tg = window.Telegram && window.Telegram.WebApp;
  const inTelegram = Boolean(tg && tg.initData);
  const version = (v) => Boolean(inTelegram && tg.isVersionAtLeast && tg.isVersionAtLeast(v));

  /* ---------- Главная кнопка ---------- */

  let mainHandler = null;
  let fallbackMain = null;
  function ensureFallback() {
    if (fallbackMain) return fallbackMain;
    const bar = document.createElement('div');
    bar.className = 'mainbar';
    bar.innerHTML = '<button type="button" class="mainbar__btn"><span class="mainbar__text"></span><span class="mainbar__spin" aria-hidden="true"></span></button>';
    bar.querySelector('button').addEventListener('click', () => { if (mainHandler && !bar.classList.contains('is-busy')) mainHandler(); });
    document.body.appendChild(bar);
    fallbackMain = bar;
    return bar;
  }
  const main = {
    /** opts: { text, onClick, color, textColor, disabled, busy } или null, чтобы спрятать. */
    set(opts) {
      mainHandler = opts ? opts.onClick : null;
      document.documentElement.classList.toggle('has-main', Boolean(opts));
      if (inTelegram) {
        const b = tg.MainButton;
        b.offClick(main._native);
        if (!opts) { b.hide(); return; }
        b.setParams({ text: opts.text, color: opts.color, text_color: opts.textColor, is_active: !opts.disabled, is_visible: true });
        if (opts.busy) b.showProgress(false); else b.hideProgress();
        b.onClick(main._native);
        return;
      }
      const bar = ensureFallback();
      bar.classList.toggle('is-on', Boolean(opts));
      if (!opts) return;
      bar.querySelector('.mainbar__text').textContent = opts.text;
      const btn = bar.querySelector('button');
      btn.disabled = Boolean(opts.disabled);
      bar.classList.toggle('is-busy', Boolean(opts.busy));
    },
    _native() { if (mainHandler) mainHandler(); },
  };

  /* ---------- Кнопка «назад» ---------- */

  let backHandler = null;
  const back = {
    set(fn) {
      backHandler = fn;
      document.documentElement.classList.toggle('has-back', Boolean(fn));
      if (inTelegram) {
        tg.BackButton.offClick(back._native);
        if (fn) { tg.BackButton.onClick(back._native); tg.BackButton.show(); } else tg.BackButton.hide();
      }
    },
    fire() { if (backHandler) backHandler(); },
    _native() { if (backHandler) backHandler(); },
    native: inTelegram,
  };

  /* ---------- Отклик, диалоги, ссылки ---------- */

  const haptic = {
    tap() { if (version('6.1')) tg.HapticFeedback.selectionChanged(); },
    impact(kind = 'light') { if (version('6.1')) tg.HapticFeedback.impactOccurred(kind); },
    ok() { if (version('6.1')) tg.HapticFeedback.notificationOccurred('success'); },
    warn() { if (version('6.1')) tg.HapticFeedback.notificationOccurred('warning'); },
  };

  /** Подтверждение: нативное окно Telegram или своё. */
  function confirm(text, okText = 'Да') {
    if (version('6.2')) return new Promise((resolve) => tg.showPopup({ message: text, buttons: [{ id: 'no', type: 'cancel' }, { id: 'ok', type: 'destructive', text: okText }] }, (id) => resolve(id === 'ok')));
    return Promise.resolve(window.confirm(text));
  }
  function openLink(url) { if (inTelegram) tg.openLink(url); else window.open(url, '_blank', 'noopener'); }
  /** Телефон из профиля Telegram одной кнопкой (Bot API 6.9+). */
  function requestPhone() {
    return new Promise((resolve) => {
      if (!version('6.9')) { resolve(''); return; }
      try {
        tg.requestContact((ok, res) => {
          const c = ok && res && res.responseUnsafe && res.responseUnsafe.contact;
          resolve(c && c.phone_number ? String(c.phone_number).slice(0, 20) : '');
        });
      } catch { resolve(''); }
    });
  }
  function user() { return (inTelegram && tg.initDataUnsafe && tg.initDataUnsafe.user) || null; }

  /* ---------- Тема ---------- */

  /** Цвета темы Telegram или запасные (светлая/тёмная по системе или ?theme=). */
  function theme(forced) {
    const p = (inTelegram && tg.themeParams) || {};
    const dark = forced ? forced === 'dark' : (inTelegram ? tg.colorScheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
    const fallback = dark
      ? { bg_color: '#1c1c1d', secondary_bg_color: '#000000', section_bg_color: '#1c1c1d', text_color: '#ffffff', hint_color: '#98989e', link_color: '#3e88f7', button_color: '#3e88f7', button_text_color: '#ffffff', destructive_text_color: '#eb5545', section_separator_color: '#3d3d40' }
      : { bg_color: '#ffffff', secondary_bg_color: '#f2f2f7', section_bg_color: '#ffffff', text_color: '#000000', hint_color: '#8e8e93', link_color: '#007aff', button_color: '#007aff', button_text_color: '#ffffff', destructive_text_color: '#ff3b30', section_separator_color: '#c8c7cc' };
    const use = forced || !inTelegram || !p.bg_color ? fallback : { ...fallback, ...p };
    return { dark, colors: use };
  }

  function setChrome(header, bg) {
    if (!inTelegram) return;
    try { if (version('6.1')) { tg.setHeaderColor(header); tg.setBackgroundColor(bg); } } catch { /* старые клиенты */ }
    try { if (version('7.10')) tg.setBottomBarColor(bg); } catch { /* нет нижней панели */ }
  }

  function start(onTheme) {
    if (!inTelegram) return;
    tg.ready();
    tg.expand();
    try { if (version('7.7')) tg.disableVerticalSwipes(); } catch { /* старые клиенты */ }
    tg.onEvent('themeChanged', onTheme);
  }

  window.TG = { tg, inTelegram, version, main, back, haptic, confirm, openLink, user, requestPhone, theme, setChrome, start };
})();
