// Apply before paint; storage can be unavailable in private or restricted browsers.
(() => {
  let saved;
  try { saved = localStorage.getItem('kb-theme'); } catch {}
  const preference = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = saved === 'light' || saved === 'dark' ? saved : preference;
})();
