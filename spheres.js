'use strict';

/* Сферы и стили демо-приложения.
 * Сфера даёт услуги, мастеров, отзывы и базовый стиль (цвет, шрифт заголовков, форма, узор обложки).
 * Стиль заведения внутри сферы: вариант палитры по названию и «настроение» по словам в названии
 * (lux, black, kids, эко, loft, lady). Та же логика есть в src/bot.js (styleOf), бот передаёт результат сюда. */

(function () {
  /* Шрифты лежат в fonts/ (Google Fonts, OFL), дальше системные запасные. */
  const FONTS = {
    ui: '"Manrope", -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
    sans: '"Manrope", -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
    serif: '"Cormorant Garamond", "New York", ui-serif, Georgia, "Noto Serif", serif',
    didone: '"Prata", Didot, "Bodoni 72", ui-serif, Georgia, "Noto Serif", serif',
    rounded: '"Nunito", ui-rounded, "SF Pro Rounded", -apple-system, Roboto, sans-serif',
    condensed: '"Oswald", "Avenir Next Condensed", "DIN Condensed", "Roboto Condensed", "Arial Narrow", sans-serif',
    geo: '"Jost", "Futura", "Avenir Next", "Century Gothic", -apple-system, Roboto, sans-serif',
    italic: '"Cormorant Garamond", "New York", ui-serif, Georgia, serif',
  };


  /* Палитра: c — цвет обложки, ink — текст на обложке, a — акцент (кнопки, выбор). Цвета взяты из CSS сайтов сильных заведений
   своей сферы (Bang Bang NYC, TOPGUN, Ruffians, Murdock, Chillhouse, Olive & June, Browissimo, Heyday, Skin Laundry,
   The NOW, Remedy Place, Aman, Сандуны, Hershesons, Aldo Coppola, XPEL, Detailingroom, Core Atelier, Barry's и др.).
   Оттенки для тёмной темы и читаемость текста на акценте считаются в app.js. */
  const SPHERES = {
    tattoo: {
      label: 'Тату-студия', who: 'мастер', visit: 'сеанс', pattern: 'flash', glyph: 'tattoo',
      font: 'condensed', upper: true, radius: 2, pill: false,
      palettes: [
        { c: '#0e0e0e', ink: '#fafafa', a: '#fbbf24' },
        { c: '#151515', ink: '#f6f6f6', a: '#c8102e' },
        { c: '#0d1014', ink: '#e7e4da', a: '#e7e4da' },
      ],
      services: [
        { t: 'Консультация по эскизу', p: 0, d: 30, about: 'Обсудим идею, место и размер' },
        { t: 'Мини-тату до 5 см', p: 5000, d: 90, f: 1 },
        { t: 'Тату до 15 см', p: 12000, d: 180, f: 1 },
        { t: 'Перекрытие старой тату', p: 15000, d: 240, f: 1 },
        { t: 'Коррекция', p: 2000, d: 60, f: 1 },
      ],
      masters: [['Артём Волков', 'графика, блэкворк', 4.9], ['Ника Лис', 'тонкие линии, мини', 5.0], ['Даниил Гор', 'реализм', 4.8]],
      reviews: [
        ['Кира', 5, 'Сделали тонкую надпись на запястье ровно как на эскизе. Зажила идеально, памятку по уходу бот прислал сам.'],
        ['Максим', 5, 'Записался в боте за минуту, утром пришло напоминание. Мастер всё объяснил и не торопил.'],
        ['Алина', 4, 'Очень чисто и спокойно. Ждала консультацию дольше, чем хотелось, но результат того стоил.'],
      ],
      tip: 'Выспитесь, хорошо поешьте и не пейте алкоголь накануне.',
    },
    barber: {
      label: 'Барбершоп', who: 'барбер', visit: 'визит', pattern: 'stripes', glyph: 'razor',
      font: 'condensed', upper: true, radius: 4, pill: false,
      palettes: [
        { c: '#031d40', ink: '#f3f3f3', a: '#b08d57' },
        { c: '#141414', ink: '#f7f7f7', a: '#9b1c1c' },
        { c: '#1f3a2e', ink: '#f3ede0', a: '#c9a96e' },
      ],
      services: [
        { t: 'Мужская стрижка', p: 1500, d: 60 },
        { t: 'Стрижка бороды', p: 900, d: 30 },
        { t: 'Стрижка и борода', p: 2200, d: 90 },
        { t: 'Королевское бритьё', p: 1400, d: 45 },
        { t: 'Детская стрижка', p: 1000, d: 45 },
      ],
      masters: [['Тимур', 'фейды, классика', 4.9], ['Игорь', 'борода, бритьё', 4.8], ['Савва', 'длинные стрижки', 5.0]],
      reviews: [
        ['Андрей', 5, 'Хожу к Тимуру третий месяц. Записываюсь прямо в Телеграме, напоминание приходит накануне.'],
        ['Олег', 5, 'Фейд как надо, борода в форме. Удобно, что видно свободное время сразу.'],
        ['Руслан', 4, 'Атмосфера отличная. Хотелось бы больше окон по вечерам, разбирают быстро.'],
      ],
      tip: 'Если хотите повторить прошлую стрижку, возьмите фото.',
    },
    nails: {
      label: 'Студия маникюра', who: 'мастер', visit: 'визит', pattern: 'swatches', glyph: 'polish',
      font: 'geo', upper: true, radius: 8, pill: true, accent: 'italic',
      palettes: [
        { c: '#faf5f0', ink: '#010b13', a: '#7b8fd6' },
        { c: '#ffffff', ink: '#111111', a: '#f45096' },
        { c: '#090909', ink: '#fdf0d7', a: '#f4b538' },
      ],
      services: [
        { t: 'Маникюр с покрытием', p: 2000, d: 90 },
        { t: 'Маникюр без покрытия', p: 1200, d: 45 },
        { t: 'Педикюр с покрытием', p: 2500, d: 90 },
        { t: 'Наращивание ногтей', p: 3500, d: 150, f: 1 },
        { t: 'Дизайн, 1 ноготь', p: 100, d: 10, f: 1 },
        { t: 'Снятие покрытия', p: 500, d: 30 },
      ],
      masters: [['Алёна', 'топ-мастер', 5.0], ['Вика', 'дизайн, френч', 4.9], ['Даша', 'педикюр', 4.8]],
      reviews: [
        ['Марина', 5, 'Покрытие держится четвёртую неделю. Записываюсь сразу на следующий раз, бот сам напоминает.'],
        ['Света', 5, 'Очень удобно выбирать мастера и видеть цену заранее. Никаких звонков.'],
        ['Ксюша', 4, 'Аккуратно и уютно. Один раз перенесла запись прямо в приложении, без переписки.'],
      ],
      tip: 'Приходите без покрытия или предупредите мастера, если нужно снятие.',
    },
    brows: {
      label: 'Брови и ресницы', who: 'мастер', visit: 'визит', pattern: 'arcs', glyph: 'eye',
      font: 'serif', upper: false, radius: 12, pill: true, accent: 'italic',
      palettes: [
        { c: '#f0ece4', ink: '#3b302d', a: '#9d7460' },
        { c: '#f5eff1', ink: '#513650', a: '#7a4f78' },
        { c: '#ede6d7', ink: '#170e1d', a: '#c1643b' },
      ],
      services: [
        { t: 'Наращивание ресниц, классика', p: 2500, d: 120 },
        { t: 'Объём 2D–3D', p: 3200, d: 150 },
        { t: 'Ламинирование ресниц', p: 2000, d: 60 },
        { t: 'Коррекция и окрашивание бровей', p: 1200, d: 45 },
        { t: 'Ламинирование бровей', p: 1800, d: 60 },
      ],
      masters: [['Эля', 'лэшмейкер', 5.0], ['Мадина', 'бровист', 4.9]],
      reviews: [
        ['Юля', 5, 'Ресницы как свои, только лучше. Через три недели бот сам позвал на коррекцию.'],
        ['Аня', 5, 'Брови наконец симметричные. Записалась за минуту в Телеграме.'],
        ['Лена', 4, 'Очень аккуратная работа. Хотелось бы больше окон в выходные.'],
      ],
      tip: 'Приходите без макияжа глаз, линзы лучше снять.',
    },
    cosmetology: {
      label: 'Косметология', who: 'косметолог', visit: 'процедура', pattern: 'glow', glyph: 'drop',
      font: 'sans', upper: false, radius: 20, pill: true,
      palettes: [
        { c: '#f2f7fd', ink: '#0f2a59', a: '#0f2a59' },
        { c: '#1a1312', ink: '#f6ede4', a: '#cdf765' },
        { c: '#faf2e4', ink: '#1a1a1a', a: '#a8884f' },
      ],
      services: [
        { t: 'Консультация косметолога', p: 0, d: 30 },
        { t: 'Чистка лица', p: 3500, d: 90 },
        { t: 'Пилинг', p: 3000, d: 60, f: 1 },
        { t: 'Уходовая процедура', p: 2800, d: 60 },
        { t: 'Биоревитализация', p: 7000, d: 60, f: 1 },
      ],
      masters: [['Екатерина Орлова', 'врач-косметолог', 5.0], ['Инна Белова', 'косметолог-эстетист', 4.9]],
      reviews: [
        ['Наталья', 5, 'Подробно объяснили уход после чистки, а через день бот прислал памятку. Кожа отлично.'],
        ['Ольга', 5, 'Спокойно, чисто, без навязывания процедур. Записываться в Телеграме удобно.'],
        ['Дина', 4, 'Хороший результат. Хотелось бы видеть больше фото до и после.'],
      ],
      tip: 'За два дня до процедуры не используйте скрабы и кислоты.',
    },
    massage: {
      label: 'Массаж', who: 'массажист', visit: 'сеанс', pattern: 'waves', glyph: 'lotus',
      font: 'geo', upper: false, radius: 20, pill: true, accent: 'italic',
      palettes: [
        { c: '#fefcf5', ink: '#404d6a', a: '#404d6a' },
        { c: '#0c0a07', ink: '#edecea', a: '#ac9e83' },
        { c: '#f2f1ef', ink: '#3e3a35', a: '#8b857c' },
      ],
      services: [
        { t: 'Классический массаж, 60 мин', p: 2500, d: 60 },
        { t: 'Массаж спины, 30 мин', p: 1500, d: 30 },
        { t: 'Антицеллюлитный массаж', p: 2800, d: 60 },
        { t: 'Массаж лица', p: 1800, d: 45 },
        { t: 'Курс 10 сеансов', p: 22000, d: 60 },
      ],
      masters: [['Сергей', 'спортивный, классический', 4.9], ['Марина', 'лимфодренаж, лицо', 5.0]],
      reviews: [
        ['Ирина', 5, 'После сеанса спина как новая. Удобно, что напоминание приходит накануне и можно перенести.'],
        ['Павел', 5, 'Сергей знает своё дело. Записываюсь на курс прямо в приложении.'],
        ['Вера', 4, 'Очень спокойная атмосфера. Иногда сложно попасть на вечер.'],
      ],
      tip: 'Не ешьте плотно за час до сеанса.',
    },
    spa: {
      label: 'СПА', who: 'специалист', visit: 'визит', pattern: 'arches', glyph: 'leaf',
      font: 'serif', upper: false, radius: 18, pill: true, accent: 'italic',
      palettes: [
        { c: '#f3eee7', ink: '#313131', a: '#82847f' },
        { c: '#141923', ink: '#f0f0eb', a: '#b0baad' },
        { c: '#f0f0eb', ink: '#141923', a: '#5d6851' },
      ],
      services: [
        { t: 'СПА-программа «Отдых»', p: 6500, d: 120 },
        { t: 'Стоун-терапия', p: 4500, d: 90 },
        { t: 'Обёртывание', p: 3500, d: 60 },
        { t: 'Хаммам с пилингом', p: 3000, d: 60 },
        { t: 'Программа для двоих', p: 12000, d: 150 },
      ],
      masters: [['Айгуль', 'СПА-мастер', 5.0], ['Ольга', 'массаж, обёртывания', 4.9]],
      reviews: [
        ['Татьяна', 5, 'Подарили сертификат на двоих, записались в Телеграме за пару минут. Это было волшебно.'],
        ['Евгения', 5, 'Полное расслабление. Перед визитом бот напомнил взять купальник.'],
        ['Роман', 4, 'Очень красиво и тихо. Чай после процедуры отдельное удовольствие.'],
      ],
      tip: 'Возьмите купальник, полотенца и тапочки дадим.',
    },
    salon: {
      label: 'Салон красоты', who: 'мастер', visit: 'визит', pattern: 'strands', glyph: 'scissors',
      font: 'didone', upper: false, radius: 2, pill: true,
      palettes: [
        { c: '#ffffff', ink: '#000000', a: '#d43747' },
        { c: '#ffffff', ink: '#393939', a: '#7f8c6a' },
        { c: '#f8fafc', ink: '#3d3d3d', a: '#4d6b76' },
      ],
      services: [
        { t: 'Женская стрижка', p: 2000, d: 60 },
        { t: 'Окрашивание в один тон', p: 4500, d: 150, f: 1 },
        { t: 'Сложное окрашивание', p: 8000, d: 240, f: 1 },
        { t: 'Укладка', p: 1500, d: 45 },
        { t: 'Мужская стрижка', p: 1200, d: 45 },
        { t: 'Уход для волос', p: 2500, d: 60 },
      ],
      masters: [['Анна', 'колорист', 5.0], ['Регина', 'стрижки, укладки', 4.9], ['Марк', 'мужские стрижки', 4.8]],
      reviews: [
        ['Елена', 5, 'Анна сделала тот самый оттенок с первого раза. Записываюсь только через бота.'],
        ['Софья', 5, 'Видно цену и время до записи, никаких сюрпризов. Напоминание пришло вовремя.'],
        ['Дарья', 4, 'Красивый салон и внимательные мастера. Парковка рядом не всегда есть.'],
      ],
      tip: 'Для окрашивания приходите с немытыми один-два дня волосами.',
    },
    auto: {
      label: 'Автосервис', who: 'мастер', visit: 'визит', pattern: 'hex', glyph: 'car',
      font: 'geo', upper: true, radius: 10, pill: false,
      palettes: [
        { c: '#141213', ink: '#e7e4da', a: '#fdb521' },
        { c: '#0a0a0a', ink: '#f8f8f8', a: '#e91d8f' },
        { c: '#000000', ink: '#ffffff', a: '#2aff00' },
      ],
      services: [
        { t: 'Диагностика', p: 1500, d: 60 },
        { t: 'Замена масла', p: 1200, d: 45, f: 1 },
        { t: 'Шиномонтаж, 4 колеса', p: 2400, d: 60 },
        { t: 'Комплексная мойка', p: 1800, d: 60 },
        { t: 'Полировка кузова', p: 9000, d: 240, f: 1 },
      ],
      masters: [['Виктор', 'диагност', 4.9], ['Ринат', 'шиномонтаж', 4.8], ['Алексей', 'детейлинг', 5.0]],
      reviews: [
        ['Денис', 5, 'Записался на шиномонтаж в Телеграме, приехал без очереди. Напомнили накануне.'],
        ['Игорь', 5, 'Честная диагностика, всё показали. Удобно видеть цены заранее.'],
        ['Артур', 4, 'Сделали быстро. Хотелось бы получать фото, когда машина готова.'],
      ],
      tip: 'Приезжайте за 10 минут, чтобы спокойно сдать машину.',
    },
    repair: {
      label: 'Мастерская', who: 'мастер', visit: 'визит', pattern: 'grid', glyph: 'tool',
      font: 'sans', upper: false, radius: 12, pill: true,
      palettes: [
        { c: '#0f1720', ink: '#eef3f8', a: '#ff7a1a' },
        { c: '#f3f5f7', ink: '#14202b', a: '#1f6feb' },
        { c: '#111111', ink: '#f5f5f5', a: '#38d39f' },
      ],
      services: [
        { t: 'Диагностика', p: 0, d: 30, about: 'Скажем, что сломано и сколько стоит' },
        { t: 'Замена экрана', p: 3500, d: 60, f: 1 },
        { t: 'Замена аккумулятора', p: 2000, d: 45, f: 1 },
        { t: 'Ремонт после воды', p: 2500, d: 120, f: 1 },
        { t: 'Чистка ноутбука', p: 1800, d: 60 },
      ],
      masters: [['Илья', 'смартфоны, планшеты', 4.9], ['Роман', 'ноутбуки, пайка', 4.8], ['Глеб', 'техника, платы', 5.0]],
      reviews: [
        ['Павел', 5, 'Экран поменяли за час, пока я пил кофе рядом. Записался в Телеграме, без очереди.'],
        ['Оксана', 5, 'Честно сказали, что ремонт не нужен, хватило чистки. Цена совпала с той, что в приложении.'],
        ['Тимофей', 4, 'Всё сделали, но деталь ждали два дня. Бот сам написал, когда можно забирать.'],
      ],
      tip: 'Возьмите зарядку и вспомните пароль от телефона, если он понадобится для проверки.',
    },
    fitness: {
      label: 'Фитнес-студия', who: 'тренер', visit: 'тренировка', pattern: 'rays', glyph: 'dumbbell',
      font: 'condensed', upper: true, radius: 8, pill: false,
      palettes: [
        { c: '#111111', ink: '#fafafa', a: '#d6001a' },
        { c: '#f4f3f0', ink: '#3b4a4e', a: '#ccff00' },
        { c: '#000000', ink: '#ffffff', a: '#036cff' },
      ],
      services: [
        { t: 'Пробная тренировка', p: 0, d: 60 },
        { t: 'Персональная тренировка', p: 2500, d: 60 },
        { t: 'Сплит-тренировка на двоих', p: 3500, d: 60 },
        { t: 'Пилатес, группа', p: 900, d: 55 },
        { t: 'Растяжка, группа', p: 800, d: 55 },
      ],
      masters: [['Кирилл', 'силовые, похудение', 4.9], ['Алина', 'пилатес, растяжка', 5.0], ['Егор', 'функциональный', 4.8]],
      reviews: [
        ['Никита', 5, 'Записываюсь к Кириллу в два касания. Если не успеваю, переношу прямо в приложении.'],
        ['Оксана', 5, 'Пилатес у Алины лучший. Напоминание накануне спасает от пропусков.'],
        ['Влад', 4, 'Отличные тренеры. Хотелось бы утренние слоты пораньше.'],
      ],
      tip: 'Возьмите сменную обувь и воду.',
    },
    pilates: {
      label: 'Студия пилатеса', who: 'тренер', visit: 'занятие', pattern: 'springs', glyph: 'circle',
      font: 'serif', upper: false, radius: 999, pill: true, accent: 'italic',
      palettes: [
        { c: '#f7e7de', ink: '#25140c', a: '#553623' },
        { c: '#f2ede9', ink: '#302b25', a: '#7f785f' },
      ],
      services: [
        { t: 'Пробное занятие', p: 1500, d: 55, about: 'Знакомство со студией и тренером' },
        { t: 'Пилатес на реформере, группа', p: 2200, d: 55 },
        { t: 'Персональное занятие', p: 4500, d: 55 },
        { t: 'Растяжка', p: 1200, d: 55 },
        { t: 'Абонемент на 8 занятий', p: 14000, d: 55 },
      ],
      masters: [['Алина', 'пилатес, реформер', 5.0], ['Вероника', 'растяжка, барре', 4.9]],
      reviews: [
        ['Катя', 5, 'Группы маленькие, тренер видит каждого. Записываюсь в Телеграме и вижу, сколько мест осталось.'],
        ['Оля', 5, 'Спина перестала болеть через месяц. Напоминание накануне спасает от пропусков.'],
        ['Ира', 4, 'Очень красивая студия. Утренние группы разбирают быстро, записывайтесь заранее.'],
      ],
      tip: 'Возьмите носки с нескользящей подошвой и воду.',
    },
    default: {
      label: 'Студия', who: 'специалист', visit: 'визит', pattern: 'rings', glyph: 'calendar',
      font: 'sans', upper: false, radius: 16, pill: true,
      palettes: [
        { c: '#0f1a33', ink: '#eef3ff', a: '#2f6bff' },
        { c: '#f6f4f0', ink: '#1c1c1c', a: '#3d7a5e' },
      ],
      services: [
        { t: 'Консультация', p: 0, d: 30 },
        { t: 'Основная услуга', p: 2000, d: 60, f: 1 },
        { t: 'Расширенная услуга', p: 3500, d: 90, f: 1 },
        { t: 'Повторный визит', p: 1500, d: 60 },
      ],
      masters: [['Анна', 'специалист', 4.9], ['Михаил', 'специалист', 4.8]],
      reviews: [
        ['Ольга', 5, 'Записалась в Телеграме за минуту, напоминание пришло накануне. Очень удобно.'],
        ['Иван', 5, 'Видно свободное время и цену сразу, не нужно звонить.'],
        ['Мария', 4, 'Всё понравилось. Перенесла запись прямо в приложении.'],
      ],
      tip: 'Если опаздываете, напишите в чат, мы подождём.',
    },
  };

  /* Настроения по словам в названии: меняют палитру, шрифт и узор. Порядок важен: первое совпадение. */
  /* Настроения по словам в названии. Правила взяты из того, как обычно оформлены такие заведения. Первое совпадение. */
  const MOODS = [
    { key: 'gold', test: /lux|люкс|premium|премиум|vip|вип|gold|голд|золот|royal|роял|элит|elite|grand|гранд/i,
      font: 'didone', upper: true, radius: 2, pill: false, palette: { c: '#111111', ink: '#efe4cc', a: '#c9a96e' } },
    { key: 'noir', test: /black|блэк|блек|noir|нуар|dark|дарк|черн|чёрн|\bink\b|(?<![а-яё])инк(?![а-яё])/i,
      upper: true, radius: 0, pill: false, palette: { c: '#0e0e0e', ink: '#f5f5f5', a: '#f5f5f5' } },
    { key: 'play', test: /kids|кидс|детск|дет\.|малыш|мама|baby|беби|bubble|бабл|happy|хэппи|fun/i,
      font: 'rounded', upper: false, radius: 24, pill: true, pattern: 'confetti', palette: { c: '#fff4dc', ink: '#4a2a00', a: '#f0590e' } },
    { key: 'eco', test: /эко|eco|nature|натур|green|грин|organic|органик|лес|forest|mint|мят|травы|herb|zen|дзен|relax|релакс/i,
      font: 'serif', upper: false, pill: true, accent: 'italic', pattern: 'waves', palette: { c: '#efe7dc', ink: '#2e3a30', a: '#6f7f5f' } },
    { key: 'loft', test: /loft|лофт|garage|гараж|industrial|factory|фабрик|завод|brutal|брутал|street|стрит/i,
      font: 'condensed', upper: true, radius: 2, pill: false, pattern: 'grid', palette: { c: '#2b2b2b', ink: '#ece8e1', a: '#c0623a' } },
    { key: 'men', test: /gentlem|джентльм|brothers|бразерс|братья|\bmen\b|мэн|(?<![а-яё])мен(?![а-яё])|for men|boss|босс/i,
      font: 'condensed', upper: true, radius: 4, pill: false, pattern: 'stripes', palette: { c: '#1f3a2e', ink: '#f3ede0', a: '#c9a96e' } },
    { key: 'studio', test: /lab\b|(?<![а-яё])лаб(?![а-яё])|atelier|ателье|bureau|бюро|clinic|клиник|expert|эксперт|academy|академ|pro\b|(?<![а-яё])про(?![а-яё])/i,
      font: 'geo', upper: false, radius: 6, pattern: 'rings' },
    { key: 'rose', test: /lady|леди|girl|гёрл|bella|белла|rose|роз|venus|венер|chic|шик|queen|квин|princess|принцесс|beauty|бьюти/i,
      font: 'didone', upper: false, pill: true, accent: 'italic', palette: { c: '#f5eff1', ink: '#3a2226', a: '#8c4a5a' } },
    { key: 'neon', test: /neon|неон|glow|глоу|vibe|вайб/i,
      font: 'condensed', upper: true, pill: false, pattern: 'rays', palette: { c: '#0d0d12', ink: '#f2f2f2', a: '#c6f432' } },
  ];



  const SPHERE_TESTS = [
    ['tattoo', /тату|tattoo|пирсинг|piercing|\bink\b/i], ['barber', /барбер|barber|мужск|men's|для мужчин/i],
    ['nails', /ногт|маникюр|педикюр|нейл|nail/i], ['brows', /ресниц|бров|лэш|lash|brow/i],
    ['cosmetology', /космет|эпиляц|лазер|чистка лица|пилинг|dermal|skin/i], ['spa', /(?<![а-яё])спа(?![а-яё])|spa|хаммам|сауна|баня|wellness/i],
    ['massage', /массаж|massage/i], ['pilates', /пилатес|pilates|йог|yoga|растяжк|stretch|барре|barre/i], ['auto', /авто|шиномонтаж|детейлинг|мойк|(?<![а-яё])сто(?![а-яё])|car|auto|garage/i],
    ['repair', /ремонт|мастерская|сервисный центр|починк|repair|fix(?![а-яё])/i],
    ['fitness', /фитнес|тренаж|трениров|gym|fitness|crossfit|кроссфит|бокс|box/i],
    ['salon', /парикмах|волос|стрижк|салон|красот|окрашиван|hair|beauty/i],
  ];

  function hash(s) {
    let h = 2166136261;
    for (const ch of String(s || '')) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function sphereOf(name, services) {
    const byName = SPHERE_TESTS.find(([, re]) => re.test(name || ''));
    if (byName) return byName[0];
    const byServices = SPHERE_TESTS.find(([, re]) => re.test((services || []).join(' ')));
    return byServices ? byServices[0] : 'default';
  }

  /** Стиль заведения: { sphere, mood, variant }. Если бот уже прислал стиль, берём его. */
  function pickStyle({ name, sphere, mood, variant }) {
    const s = Object.hasOwn(SPHERES, sphere || '') ? sphere : 'default';
    const m = MOODS.find((x) => x.key === mood) || MOODS.find((x) => x.test.test(name || '')) || null;
    const v = Number.isInteger(variant) ? Math.abs(variant) : hash(name) % SPHERES[s].palettes.length;
    return { sphere: s, mood: m ? m.key : '', variant: v % SPHERES[s].palettes.length };
  }

  /** Готовая тема: шрифты, форма, палитра и узор с учётом настроения. */
  function themeOf(style) {
    const base = SPHERES[style.sphere];
    const mood = MOODS.find((x) => x.key === style.mood) || {};
    const pick = (k, fallback) => (mood[k] !== undefined ? mood[k] : base[k] !== undefined ? base[k] : fallback);
    return {
      display: FONTS[pick('font', 'sans')],
      ui: FONTS.ui,
      italic: pick('accent', '') === 'italic' ? FONTS.italic : '',
      upper: pick('upper', false),
      radius: pick('radius', 16),
      pill: pick('pill', true),
      pattern: pick('pattern', 'rings'),
      glyph: base.glyph,
      palette: { ...base.palettes[style.variant], ...(mood.palette || {}) },
    };
  }

  window.Demo = { SPHERES, MOODS, FONTS, pickStyle, themeOf, sphereOf, hash };
})();
