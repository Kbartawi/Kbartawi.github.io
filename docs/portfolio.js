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

  const viewer = document.getElementById('gallery-viewer');
  const shots = [...document.querySelectorAll('[data-gallery-item]')];
  if (!viewer || typeof viewer.showModal !== 'function' || !shots.length) return;
  const viewerImage = viewer.querySelector('.viewer-image');
  const error = viewer.querySelector('.viewer-error');
  let current = 0;
  let trigger;
  function showShot(index) {
    current = (index + shots.length) % shots.length;
    const shot = shots[current];
    error.hidden = true;
    viewerImage.hidden = false;
    viewerImage.alt = shot.querySelector('img').alt;
    viewerImage.src = shot.href;
    viewer.querySelector('#viewer-title').textContent = shot.dataset.title;
    viewer.querySelector('#viewer-caption').textContent = shot.dataset.caption;
    viewer.querySelector('.viewer-kind').textContent = shot.dataset.kind;
    viewer.querySelector('.viewer-counter').textContent = `${current + 1} / ${shots.length}`;
    viewer.querySelector('.viewer-original').href = shot.href;
    viewer.querySelector('.viewer-retry').href = shot.href;
  }
  viewerImage.addEventListener('error', () => {
    viewerImage.hidden = true;
    error.hidden = false;
  });
  for (const [index, shot] of shots.entries()) shot.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    trigger = shot;
    showShot(index);
    viewer.showModal();
    document.body.classList.add('gallery-open');
  });
  viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
  viewer.querySelector('.viewer-previous').addEventListener('click', () => showShot(current - 1));
  viewer.querySelector('.viewer-next').addEventListener('click', () => showShot(current + 1));
  viewer.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showShot(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  viewer.addEventListener('click', event => {
    const bounds = viewer.getBoundingClientRect();
    if (event.target === viewer && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) viewer.close();
  });
  viewer.addEventListener('close', () => {
    document.body.classList.remove('gallery-open');
    trigger?.focus({ preventScroll: true });
  });
})();
