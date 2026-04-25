const APP_CONTAINER = document.getElementById('app');
const CACHE_KEY = 'app_prefs';


async function setLang(lang) {
  try {
    const response = await fetch(`lang/${lang}.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const keys = el.dataset.i18n.split('.');
      let value = data;
      for (const key of keys) {
        value = value?.[key];
        if (!value) break;
      }
      if (value) el.textContent = value;
    });

    document.documentElement.lang = lang;
    const isRTL = lang === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

    updateActiveBtn('lang', lang);
    localStorage.setItem(CACHE_KEY + '_lang', lang);
  } 
  catch (err) {
    console.error('Ошибка загрузки языка:', err);
  }
}

/* =========================================
   3. РЕНДЕРИНГ КАРТОЧЕК (Data-Driven)
   ========================================= */
async function initApp() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    renderSections(data.sections);
  } 
  catch (err) {
    console.error('Ошибка загрузки данных:', err);
    APP_CONTAINER.innerHTML = '<p>Не удалось загрузить карточки.</p>';
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

    sec.cards.forEach(card => {
      gridEl.appendChild(createCard(card));
    });

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

  const tagsWrap = document.createElement('div');
  tagsWrap.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.25rem;
  `;

  data.tags.forEach(text => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = text;
    tagsWrap.appendChild(span);
  });

  card.appendChild(h3);
  card.appendChild(tagsWrap);
  return card;
}


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


function loadPrefs() {
  const savedLang = localStorage.getItem(CACHE_KEY + '_lang') || 'ru';
  const savedDir = localStorage.getItem(CACHE_KEY + '_dir') || 'ltr';

  setLang(savedLang);
  setDir(savedDir);

  const colorVars = [
    '--base-primary',
    '--base-secondary',
    '--base-accent',
    '--base-warning',
    '--base-error'
  ];

  colorVars.forEach(v => {
    const saved = localStorage.getItem(CACHE_KEY + '_' + v);
    if (saved) {
      document.documentElement.style.setProperty(v, saved);
      const input = document.querySelector(`input[onchange*="${v}"]`);
      if (input) input.value = saved;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadPrefs();
  initApp();
});
