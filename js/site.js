// Адрес обработчика заявок. Укажите URL сервиса приёма форм или собственного скрипта,
// чтобы заявки приходили на почту или в мессенджер. Пока поле пустое, форма ничего не отправляет.
const FORM_ENDPOINT = '';

// Счётчики аналитики. Пока поля пустые, сайт ничего никуда не отправляет и не показывает плашку о cookie.
// Для российского сайта основной счётчик — Яндекс Метрика. Google Analytics и Microsoft Clarity
// передают данные на зарубежные серверы: включайте их только после консультации с юристом.
const ANALYTICS = {
  yandexMetrika: '', // номер счётчика, например '12345678'
  ga4: '',           // идентификатор вида 'G-XXXXXXXXXX'
  clarity: '',       // идентификатор проекта Clarity
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canObserve = 'IntersectionObserver' in window;

// --- Аналитика и цели ------------------------------------------------------
// События: whatsapp_click, telegram_click, phone_click, form_submit, booking_request, service_page_view
let analyticsOn = false;

function track(name, params = {}) {
  if (!analyticsOn) return;
  if (ANALYTICS.yandexMetrika && window.ym) window.ym(Number(ANALYTICS.yandexMetrika), 'reachGoal', name, params);
  if (ANALYTICS.ga4 && window.gtag) window.gtag('event', name, params);
  if (ANALYTICS.clarity && window.clarity) window.clarity('event', name);
}

function loadScript(src) {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.append(script);
}

function startAnalytics() {
  if (ANALYTICS.yandexMetrika) {
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = Date.now();
    loadScript('https://mc.yandex.ru/metrika/tag.js');
    window.ym(Number(ANALYTICS.yandexMetrika), 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true });
  }
  if (ANALYTICS.ga4) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ANALYTICS.ga4);
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS.ga4}`);
  }
  if (ANALYTICS.clarity) {
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    loadScript(`https://www.clarity.ms/tag/${ANALYTICS.clarity}`);
  }
  analyticsOn = true;
  if (document.body.dataset.page === 'service') track('service_page_view', { page: location.pathname });
}

// Плашка о cookie: счётчики включаются только после согласия посетителя
function askConsent() {
  const policy = document.querySelector('.footer-bottom a[href*="politika"]');
  const bar = document.createElement('div');
  bar.className = 'consent-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Файлы cookie');
  const text = document.createElement('p');
  text.append('Сайт использует файлы cookie и счётчик посещаемости, чтобы становиться удобнее. ');
  if (policy) {
    const link = document.createElement('a');
    link.href = policy.href;
    link.textContent = 'Подробнее';
    text.append(link);
  }
  const accept = document.createElement('button');
  accept.type = 'button';
  accept.className = 'btn';
  accept.textContent = 'Принять';
  const decline = document.createElement('button');
  decline.type = 'button';
  decline.className = 'btn btn-ghost';
  decline.textContent = 'Отклонить';
  const answer = (value) => {
    try { localStorage.setItem('analytics-consent', value); } catch (error) { /* хранилище недоступно */ }
    bar.remove();
    document.body.classList.remove('consent-open');
    if (value === 'yes') startAnalytics();
  };
  accept.addEventListener('click', () => answer('yes'));
  decline.addEventListener('click', () => answer('no'));
  const actions = document.createElement('div');
  actions.className = 'consent-actions';
  actions.append(accept, decline);
  bar.append(text, actions);
  document.body.append(bar);
  document.body.classList.add('consent-open');
}

if (Object.values(ANALYTICS).some(Boolean)) {
  let choice = null;
  try { choice = localStorage.getItem('analytics-consent'); } catch (error) { /* хранилище недоступно */ }
  if (choice === 'yes') startAnalytics();
  else if (choice !== 'no') askConsent();
}

// Клики по телефону и мессенджерам
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  const params = { page: location.pathname };
  if (href.startsWith('tel:')) track('phone_click', params);
  else if (/wa\.me|whatsapp\.com/.test(href)) track('whatsapp_click', params);
  else if (/\/\/t\.me|telegram\.me/.test(href)) track('telegram_click', params);
});

// --- Мобильное меню --------------------------------------------------------
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.getElementById('site-nav');
if (navToggle && siteNav) {
  const setNav = (open) => {
    siteNav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  };
  navToggle.addEventListener('click', () => setNav(!siteNav.classList.contains('open')));
  siteNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setNav(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && siteNav.classList.contains('open')) {
      setNav(false);
      navToggle.focus();
    }
  });
}

// --- Содержание статьи: собирается из подзаголовков, если их четыре и больше
const article = document.querySelector('.article');
const articleLead = article && article.querySelector('.lead');
if (articleLead) {
  const headings = [...article.querySelectorAll(':scope > h2')];
  if (headings.length >= 4) {
    const toc = document.createElement('nav');
    toc.className = 'toc card';
    toc.setAttribute('aria-label', 'Содержание статьи');
    const title = document.createElement('p');
    title.className = 'toc-title';
    title.textContent = 'В этой статье';
    const list = document.createElement('ol');
    headings.forEach((heading, index) => {
      heading.id = heading.id || `razdel-${index + 1}`;
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      const item = document.createElement('li');
      item.append(link);
      list.append(item);
    });
    toc.append(title, list);
    articleLead.after(toc);
  }
}

// --- Плавное появление блоков при прокрутке (только для тех, что ниже первого экрана)
if (!reduceMotion && canObserve) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      revealObserver.unobserve(el);
      el.classList.add('in');
      setTimeout(() => {
        el.classList.remove('reveal', 'in');
        el.style.transitionDelay = '';
      }, 1100);
    });
  }, { rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.section-head, .split-head, .card, .steps li, .cta, .signup').forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    const order = [...el.parentElement.children].indexOf(el);
    el.style.transitionDelay = `${Math.min(order, 4) * 70}ms`;
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
}

// --- Кнопка записи внизу экрана на телефоне: видна после первого экрана, прячется рядом с формой и подвалом
const mobileCta = document.querySelector('.mobile-cta');
if (mobileCta && canObserve) {
  const blockers = new Set();
  const update = () => mobileCta.classList.toggle('show', window.scrollY > 480 && blockers.size === 0);
  const ctaObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) blockers.add(entry.target);
      else blockers.delete(entry.target);
    });
    update();
  });
  document.querySelectorAll('form[data-lead], .site-footer').forEach((el) => ctaObserver.observe(el));
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// --- Формы записи ----------------------------------------------------------
document.querySelectorAll('form[data-lead]').forEach((form) => {
  const status = form.querySelector('.form-status');
  const button = form.querySelector('button[type="submit"]');
  const say = (text, state) => {
    status.className = `form-status${state ? ` is-${state}` : ''}`;
    status.textContent = text;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    if (data.get('website')) return; // поле-ловушка: его заполняют только боты

    if (!FORM_ENDPOINT) {
      say('Форма пока не подключена: укажите адрес обработчика в файле js/site.js.', 'error');
      return;
    }

    button.disabled = true;
    say('Отправляю заявку…');
    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`Ответ сервера: ${response.status}`);
      const goal = { form: data.get('form'), format: data.get('format'), page: location.pathname };
      form.reset();
      say('Спасибо. Заявка отправлена — я свяжусь с вами в ближайшее время.', 'ok');
      track('form_submit', goal);
      track('booking_request', goal);
    } catch (error) {
      say('Не получилось отправить заявку. Напишите, пожалуйста, напрямую — контакты указаны на странице.', 'error');
    } finally {
      button.disabled = false;
    }
  });
});
