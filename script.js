// script.js

/* =========================================
   1. КОНСТАНТЫ
   ========================================= */
const APP_CONTAINER = document.getElementById('app');
const CACHE_KEY = 'app_prefs';

/* =========================================
   2. СЛОВАРИ ПЕРЕВОДОВ
   (Встроены для работы без сервера.
    При запуске через Live Server закомментируй
    этот блок и раскомментируй fetch() ниже)
   ========================================= */
const translations = {
  ru: { ui: { title: "Моя страница с карточками", placeholder: "Проверка направления ввода..." } },
  en: { ui: { title: "My Cards Page", placeholder: "Input direction test..." } },
  ar: { ui: { title: "صفحة البطاقات الخاصة بي", placeholder: "اختبار اتجاه الإدخال..." } }
};

async function loadLangFile(lang) {
  try {
    const res = await fetch(`lang/${lang}.json`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return null; // Фоллбэк на встроенный словарь
  }
}

/* =========================================
   3. ПРИМЕНЕНИЕ ПЕРЕВОДА
   ========================================= */
async function setLang(lang) {
  let data = translations[lang]; // По умолчанию берём встроенный
  const fetched = await loadLangFile(lang);
  if (fetched) data = fetched; // Если сервер есть → подменяем на файл

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const keys = el.dataset.i18n.split('.');
    let value = data;
    for (const key of keys) value = value?.[key];
    if (value) el.textContent = value;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const keys = el.getAttribute('data-i18n-placeholder').split('.');
    let value = data;
    for (const key of keys) value = value?.[key];
    if (value) el.placeholder = value;
  });

  document.documentElement.lang = lang;
  const isRTL = lang === 'ar';
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

  updateActiveBtn('lang', lang);
  localStorage.setItem(CACHE_KEY + '_lang', lang);
}

/* =========================================
   4. РЕНДЕРИНГ КАРТОЧЕК
   ========================================= */
async function initApp() {
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderSections(data.sections);
  } catch {
    APP_CONTAINER.innerHTML = `
      <p style="color:#e11d48; font-weight:600; padding:2rem;">
        ❌ КАРТОЧКИ НЕ ЗАГРУЖЕНЫ<br>
        <span style="font-weight:400; font-size:0.9rem;">
          Запусти через Local Server или проверь файл data.json
        </span>
      </p>`;
  }
}

function renderSections(sections) {
  APP_CONTAINER.innerHTML = '';
  sections.forEach(sec => {
    const secEl = document.createElement('div');
    secEl.className = `sec ${sec.themeClass}`;

    const titleEl = document.createElement('h2');
    titleEl.className = 'sec-title';
    titleEl.textContent = sec.sectionTitle;

    const gridEl = document.createElement('div');
    gridEl.className = 'grid';

    sec.cards.forEach(card => gridEl.appendChild(createCard(card)));

    secEl.appendChild(titleEl);
    secEl.appendChild(gridEl);
    APP_CONTAINER.appendChild(secEl);
  });
}

function createCard(data) {
  const card = document.createElement('div');
  card.className = `card ${data.cardClass || ''}`;

  const h3 = document.createElement('h3');
  h3.textContent = data.title;

  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex; flex-wrap:wrap; justify-content:center; gap:0.25rem;';

  data.tags.forEach(t => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = t;
    wrap.appendChild(span);
  });

  card.appendChild(h3);
  card.appendChild(wrap);
  return card;
}

/* =========================================
   5. УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ
   ========================================= */
function setDir(dir) {
  document.documentElement.dir = dir;
  updateActiveBtn('dir', dir);
  localStorage.setItem(CACHE_KEY + '_dir', dir);
}

function changeBaseColor(variable, value) {
  document.documentElement.style.setProperty(variable, value);
  localStorage.setItem(CACHE_KEY + '_' + variable, value);
}

function updateActiveBtn(type, value) {
  document.querySelectorAll(`.ctrl[data-${type}]`).forEach(btn => {
    btn.classList.toggle('active', btn.dataset[type] === value);
  });
}

/* =========================================
   6. ИНИЦИАЛИЗАЦИЯ
   ========================================= */
function loadPrefs() {
  const lang = localStorage.getItem(CACHE_KEY + '_lang') || 'ru';
  const dir = localStorage.getItem(CACHE_KEY + '_dir') || 'ltr';

  setLang(lang);
  setDir(dir);

  ['--base-primary','--base-secondary','--base-accent','--base-warning','--base-error']
    .forEach(v => {
      const saved = localStorage.getItem(CACHE_KEY + '_' + v);
      if (saved) {
        document.documentElement.style.setProperty(v, saved);
        const inp = document.querySelector(`input[onchange*="${v}"]`);
        if (inp) inp.value = saved;
      }
    });
}

document.addEventListener('DOMContentLoaded', () => {
  loadPrefs();
  initApp();
});
