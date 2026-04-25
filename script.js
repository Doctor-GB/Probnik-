// script.js

const appContainer = document.getElementById('app');

async function initApp() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    
    const data = await response.json();
    renderSections(data.sections);
  } 
  catch (error) {
    console.error('Ошибка загрузки:', error);
    appContainer.innerHTML = '<p>Не удалось загрузить данные.</p>';
  }
}

function renderSections(sections) {
  appContainer.innerHTML = '';

  sections.forEach(section => {
    const secEl = document.createElement('div');
    secEl.className = 'sec ' + section.themeClass;

    const titleEl = document.createElement('h2');
    titleEl.className = 'sec-title';
    titleEl.textContent = section.sectionTitle;

    const gridEl = document.createElement('div');
    gridEl.className = 'grid';

    section.cards.forEach(cardData => {
      gridEl.appendChild(createCard(cardData));
    });

    secEl.appendChild(titleEl);
    secEl.appendChild(gridEl);
    appContainer.appendChild(secEl);
  });
}

function createCard(data) {
  const card = document.createElement('div');
  card.className = 'card ' + (data.cardClass || '');

  const h3 = document.createElement('h3');
  h3.textContent = data.title;

  const tagsWrap = document.createElement('div');
  tagsWrap.style.display = 'flex';
  tagsWrap.style.flexWrap = 'wrap';
  tagsWrap.style.justifyContent = 'center';
  tagsWrap.style.gap = '0.25rem';

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

function changeBaseColor(variable, value) {
  document.documentElement.style.setProperty(variable, value);
  localStorage.setItem('theme_' + variable, value);
}

function setDir(dir) {
  document.documentElement.dir = dir;
  document.querySelectorAll('.ctrl[data-dir]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.dir === dir);
  });
  localStorage.setItem('dir', dir);
}

function loadPrefs() {
  const savedDir = localStorage.getItem('dir') || 'ltr';
  setDir(savedDir);

  ['--base-primary', '--base-secondary', '--base-accent', '--base-warning', '--base-error'].forEach(v => {
    const saved = localStorage.getItem('theme_' + v);
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
