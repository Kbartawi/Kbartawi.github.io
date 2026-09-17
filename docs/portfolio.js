(() => {
  const themeButtons = [...document.querySelectorAll('[data-theme-choice]')];
  function reflectTheme() {
    for (const button of themeButtons) button.setAttribute('aria-pressed', String(button.dataset.themeChoice === document.documentElement.dataset.theme));
  }
  for (const button of themeButtons) button.addEventListener('click', () => {
    document.documentElement.dataset.theme = button.dataset.themeChoice;
    try { localStorage.setItem('kb-theme', button.dataset.themeChoice); } catch {}
    reflectTheme();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    let saved;
    try { saved = localStorage.getItem('kb-theme'); } catch {}
    if (saved !== 'light' && saved !== 'dark') {
      document.documentElement.dataset.theme = event.matches ? 'dark' : 'light';
      reflectTheme();
    }
  });
  reflectTheme();
  const filters = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('[data-category]')];
  for (const filter of filters) filter.addEventListener('click', () => {
    for (const button of filters) button.setAttribute('aria-pressed', String(button === filter));
    let count = 0;
    for (const card of cards) {
      card.hidden = filter.dataset.filter !== 'all' && card.dataset.category !== filter.dataset.filter;
      if (!card.hidden) count++;
    }
    const status = document.getElementById('filter-status');
    if (status) status.textContent = `Showing ${count} ${filter.dataset.filter === 'all' ? '' : filter.dataset.filter + ' '}projects.`;
  });
})();
