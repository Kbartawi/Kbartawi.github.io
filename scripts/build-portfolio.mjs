import { readFile, writeFile, mkdir, access, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'docs');
const data = JSON.parse(await readFile(resolve(root, 'content/projects.json'), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date = value => new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + 'T12:00:00Z'));
const words = ['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten'];
const themes = new Set(['hvac', 'oris', 'manzl', 'aqd', 'plain']);
const models = new Set(['B2B', 'B2C', 'B2B2C']);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const localPath = value => typeof value === 'string' && /^\/(?!\/)/.test(value) && !value.includes('..') && !/[\\?#]/.test(value);
const safeWebsite = value => { try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; } };
const requireText = (value, label) => { if (typeof value !== 'string' || !value.trim()) throw new Error('Missing text: ' + label); };

if (data.schemaVersion !== 1 || !Array.isArray(data.projects) || !data.projects.length) throw new Error('Expected project catalogue schema version 1.');
for (const key of ['owner', 'title', 'description', 'about', 'intro', 'github']) requireText(data[key], key);
if (!safeWebsite(data.github)) throw new Error('GitHub URL must use HTTPS.');
const ids = new Set();
for (const p of data.projects) {
  if (typeof p.slug !== 'string' || !slugPattern.test(p.slug) || ids.has(p.slug)) throw new Error('Project slugs must be unique: ' + p.slug);
  ids.add(p.slug);
  if (!themes.has(p.theme) || !models.has(p.model)) throw new Error('Unknown theme or business model: ' + p.slug);
  for (const key of ['name','category','modelDescription','audience','buyer','users','market','stage','summary','problem','demoNote']) requireText(p[key], p.slug + '.' + key);
  for (const key of ['headline','features','workflow','nextFocus','languages']) {
    if (!Array.isArray(p[key]) || !p[key].length || p[key].some(x => typeof x !== 'string' || !x.trim())) throw new Error('Invalid list: ' + p.slug + '.' + key);
  }
  if (p.headline.length !== 2 || p.workflow.length !== 3 || !isDate(p.updatedAt)) throw new Error('Invalid headline, workflow or date: ' + p.slug);
  if (!Array.isArray(p.updates) || p.updates.some(u => !isDate(u.date) || typeof u.text !== 'string' || !u.text.trim())) throw new Error('Invalid updates: ' + p.slug);
  if (p.website !== null && !safeWebsite(p.website)) throw new Error('Website must use HTTPS: ' + p.slug);
  if (p.demoUrl !== null && !safeWebsite(p.demoUrl)) throw new Error('Demo URL must use HTTPS: ' + p.slug);
  if (p.image !== null) {
    if (!localPath(p.image)) throw new Error('Image must be a local asset: ' + p.slug);
    requireText(p.imageAlt, p.slug + '.imageAlt');
    await access(resolve(out, '.' + p.image));
  }
}
const featured = data.projects.find(p => p.slug === data.featuredProject);
if (!featured) throw new Error('Featured project does not exist.');
const latestDate = data.projects.map(p => p.updatedAt).sort().at(-1);
// A portfolio published on a separate branch must not point to the host app's production domain.
const deploymentHost = process.env.VERCEL_ENV === 'production'
  ? process.env.VERCEL_PROJECT_PRODUCTION_URL
  : process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL;
let origin = process.env.PORTFOLIO_SITE_URL || (deploymentHost ? 'https://' + deploymentHost : 'https://kbartawi.github.io');
if (origin) {
  if (!safeWebsite(origin)) throw new Error('Portfolio site URL must use HTTPS.');
  const u = new URL(origin);
  if (u.pathname !== '/' || u.search || u.hash) throw new Error('Portfolio site URL must be an origin.');
  origin = u.origin;
}

const mark = p => `<span class="brand ${escape(p.theme)}">${escape(p.name.toLowerCase())}${p.theme === 'aqd' ? '<span lang="ar">عقد</span>' : p.theme === 'oris' ? '<span aria-hidden="true">✳</span>' : '<span>.</span>'}</span>`;
const arrow = '<span aria-hidden="true">↗</span>';
const modelName = model => ({B2B:'Business to business',B2C:'Business to consumer',B2B2C:'Business to business to consumer'})[model];
const profileUrl = p => '/projects/' + p.slug + '/';
const facts = p => `<dl class="card-facts"><div><dt>For</dt><dd>${escape(p.audience)}</dd></div><div><dt>Stage</dt><dd>${escape(p.stage)}</dd></div></dl>`;

function visual(p) {
  if (p.theme === 'oris') return `<div class="card-visual oris-visual" aria-hidden="true"><div class="chat" lang="ar" dir="rtl">هل التوصيل متاح إلى الشارقة؟</div><div class="chat reply">The right context.<br><strong>A more useful handoff.</strong></div><span class="signal"><i></i> Human attention</span></div>`;
  if (p.theme === 'aqd') return `<div class="card-visual aqd-visual" aria-hidden="true"><div class="readiness-paper"><span>PREPARATION NOTES</span><div><i>✓</i> Property details</div><div><i>✓</i> Rent schedule</div><div class="open-item"><i>○</i> Tenant documents</div><p>One clear place to begin.</p></div></div>`;
  if (p.image) return `<div class="card-visual"><img src="${escape(p.image)}" alt="${escape(p.imageAlt)}" width="1672" height="941" loading="lazy"><span class="property-caption">${escape(p.category)}</span></div>`;
  return `<div class="card-visual plain-visual"><span>${escape(p.category)}</span><strong>${escape(p.name)}</strong></div>`;
}

function header(current) {
  return `<header class="top"><a class="monogram" href="/" aria-label="${escape(data.owner)} portfolio home">${escape(data.owner.toLowerCase())}<span> / </span></a><span class="edition">PRODUCT PORTFOLIO</span><nav class="portfolio-nav" aria-label="Main navigation"><a href="/#projects"${current === 'projects' ? ' aria-current="page"' : ''}>Projects</a><a href="/#about">About</a><a href="${escape(data.github)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a></nav></header>`;
}

function footer() {
  return `<footer><a class="monogram" href="/">${escape(data.owner.toLowerCase())}<span> / </span></a><p>A living collection of products.<br>Updated ${date(latestDate)}</p><p>Public samples use example data.<br>Architectural imagery is illustrative.</p></footer>`;
}

function document(title, description, path, body, theme = '') {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow"><title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta property="og:type" content="website"><meta property="og:image" content="${origin}/media/portfolio.png"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}">${origin ? `<link rel="canonical" href="${origin}${path}"><meta property="og:url" content="${origin}${path}">` : ''}<link rel="stylesheet" href="/fonts.css"><link rel="stylesheet" href="/review.css"><link rel="stylesheet" href="/portfolio.css"></head><body class="public-portfolio ${escape(theme)}"><a class="skip" href="#main">Skip to content</a>${header(path === '/' ? 'projects' : '')}<main id="main">${body}</main>${footer()}</body></html>\n`;
}

function feature(p) {
  return `<a class="feature project ${escape(p.theme)}" href="${profileUrl(p)}">${p.image ? `<img src="${escape(p.image)}" alt="${escape(p.imageAlt)}" width="1672" height="941" fetchpriority="high">` : ''}<div class="feature-shade"></div><div class="feature-heading">${mark(p)}<span class="tag">${escape(p.model)} / ${escape(p.category).toUpperCase()}</span></div><div class="feature-content"><p class="eyebrow">${escape(p.audience).toUpperCase()}</p><h2>${escape(p.headline[0])}<br><em>${escape(p.headline[1])}</em></h2><p>${escape(p.summary)}</p><span class="open-button">Meet ${escape(p.name)} ${arrow}</span></div><div class="feature-foot"><span>${escape(p.stage)}</span><span>${escape(p.market)} · ${p.languages.map(escape).join(' + ')}</span></div></a>`;
}

function card(p, index) {
  return `<a class="project small ${escape(p.theme)}" href="${profileUrl(p)}"><div class="card-heading">${mark(p)}<span>${String(index + 2).padStart(2, '0')} / ${escape(p.model)}<br>${escape(p.category).toUpperCase()}</span></div>${visual(p)}<div class="card-copy"><h2>${escape(p.headline[0])}<br><em>${escape(p.headline[1])}</em></h2><p>${escape(p.summary)}</p>${facts(p)}<span class="text-link">Meet ${escape(p.name)} ${arrow}</span></div></a>`;
}

function home() {
  const number = words[data.projects.length] || String(data.projects.length);
  const modelSummary = [...new Set(data.projects.map(p => p.model))].join(' · ');
  const updates = data.projects.flatMap(p => p.updates.map(u => ({...u, p}))).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  return document(data.title, data.description, '/', `
    <section class="intro"><p class="eyebrow">KHALED · FOUNDER IN DUBAI</p><h1>${number} products.<br><span>A clearer point of view.</span></h1><div class="intro-bottom"><p>${escape(data.intro).replace(/\n/g, '<br>')}</p><p class="review-note">${escape(modelSummary)} products · Arabic + English<br>Explore the audience, the product and what comes next.</p></div></section>
    <section id="projects" aria-label="Projects">${feature(featured)}<div class="grid">${data.projects.filter(p => p !== featured).map(card).join('')}</div></section>
    <section class="about-work" id="about"><div><p class="eyebrow">ABOUT THE WORK</p><h2>Different problems.<br><span>A practical point of view.</span></h2></div><div><p>${escape(data.about)}</p><p>Each profile explains the product’s audience and current stage. Public product links are included where available; projects still in development are clearly labelled.</p></div></section>
    <section class="portfolio-updates" aria-labelledby="updates-title"><div class="updates-heading"><p class="eyebrow">LATEST PROJECT UPDATES</p><h2 id="updates-title">The work keeps moving.</h2></div><div>${updates.map(u => `<a class="update-row" href="${profileUrl(u.p)}"><time datetime="${u.date}">${date(u.date)}</time><div><strong>${escape(u.p.name)}</strong><p>${escape(u.text)}</p></div>${arrow}</a>`).join('')}</div></section>
  `);
}

function profile(p, index) {
  const next = data.projects[(index + 1) % data.projects.length];
  const pairs = [['Business model', p.model + ' · ' + modelName(p.model)], ['For', p.audience], ['Buyer', p.buyer], ['Users', p.users], ['Market', p.market], ['Languages', p.languages.join(' + ')], ['Stage', p.stage], ['Profile updated', date(p.updatedAt)]];
  return document(p.name + ' / ' + p.category + ' / ' + data.owner, p.summary, profileUrl(p), `
    <div class="profile-breadcrumb"><a href="/#projects">All projects</a><span aria-hidden="true">/</span><span>${escape(p.name)}</span></div>
    <section class="profile-hero"><div><div class="profile-brand">${mark(p)}<span class="profile-chip">${escape(p.model)} · ${escape(p.category)}</span></div><h1>${escape(p.headline[0])}<br><em>${escape(p.headline[1])}</em></h1><p class="profile-summary">${escape(p.summary)}</p><div class="profile-actions">${p.demoUrl ? `<a class="primary-link" href="${escape(p.demoUrl)}" target="_blank" rel="noopener noreferrer">Try the demo ${arrow}</a>` : ''}${p.website ? `<a class="${p.demoUrl ? 'secondary-link' : 'primary-link'}" href="${escape(p.website)}" target="_blank" rel="noopener noreferrer">Visit product website ${arrow}</a>` : ''}</div><p class="profile-demo-note">${escape(p.demoNote)}</p></div><aside class="profile-facts" aria-label="Project at a glance"><p class="eyebrow">AT A GLANCE</p><dl>${pairs.map(([key, value]) => `<div><dt>${escape(key)}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl></aside></section>
    <section class="profile-story"><div><p class="eyebrow">THE PROBLEM</p><h2>Why it exists.</h2><p>${escape(p.problem)}</p></div><div><p class="eyebrow">THE PRODUCT</p><h2>What it does.</h2><ol class="capability-list">${p.features.map((f, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span><p>${escape(f)}</p></li>`).join('')}</ol></div></section>
    <section class="profile-flow" aria-labelledby="flow-title"><div><p class="eyebrow">WHERE IT FITS</p><h2 id="flow-title">One clear workflow.</h2></div><ol>${p.workflow.map((step, i) => `<li><span>0${i + 1}</span><h3>${escape(step)}</h3></li>`).join('')}</ol></section>
    <section class="profile-roadmap"><div><p class="eyebrow">WHAT COMES NEXT</p><h2>The current focus.</h2><ul>${p.nextFocus.map(f => `<li>${escape(f)}</li>`).join('')}</ul><p class="roadmap-note">These are areas of work, not release-date commitments.</p></div><div><p class="eyebrow">PROJECT UPDATES</p>${p.updates.slice(0, 5).map(u => `<article class="project-update"><time datetime="${u.date}">${date(u.date)}</time><p>${escape(u.text)}</p></article>`).join('')}</div></section>
    <section class="profile-close"><div><p class="eyebrow">${p.demoUrl || p.website ? 'EXPLORE THE PRODUCT' : 'IN DEVELOPMENT'}</p><h2>${p.demoUrl || p.website ? 'Explore ' + escape(p.name) + '.' : 'The next step is a working pilot.'}</h2><p>${p.demoUrl ? 'The public sample uses fictional data.' : p.website ? 'Visit the product website to learn more.' : 'This project is still being developed. There is no public demo link yet.'}</p></div>${p.demoUrl || p.website ? `<a class="primary-link" href="${escape(p.demoUrl || p.website)}" target="_blank" rel="noopener noreferrer">${p.demoUrl ? 'Try the demo' : 'Visit ' + escape(p.name)} ${arrow}</a>` : `<a class="secondary-link" href="/#projects">Explore the other projects ${arrow}</a>`}</section>
    ${data.projects.length > 1 ? `<a class="next-project" href="${profileUrl(next)}"><span>Next project</span><strong>${escape(next.name)}</strong>${arrow}</a>` : ''}
  `, 'profile-page theme-' + p.theme);
}

await mkdir(out, { recursive: true });
await writeFile(resolve(out, 'index.html'), home());
await writeFile(resolve(out, '.nojekyll'), '');
await writeFile(resolve(out, '404.html'), document('Page not found / KB', 'Return to the product portfolio.', '/404.html', '<section class="intro"><p class="eyebrow">PAGE NOT FOUND</p><h1>Let’s get you back<br><span>to the work.</span></h1><div class="intro-bottom"><a class="primary-link" href="/">Explore the projects ↗</a></div></section>'));
await mkdir(resolve(out, 'projects'), { recursive: true });
const previousManifest = await readFile(resolve(out, 'project-manifest.json'), 'utf8').then(JSON.parse).catch(() => ({slugs: []}));
for (const slug of previousManifest.slugs || []) {
  if (slugPattern.test(slug) && !ids.has(slug)) await rm(resolve(out, 'projects', slug), {recursive: true, force: true});
}
for (const [i, p] of data.projects.entries()) {
  await mkdir(resolve(out, 'projects', p.slug), { recursive: true });
  await writeFile(resolve(out, 'projects', p.slug, 'index.html'), profile(p, i));
}
await writeFile(resolve(out, 'project-manifest.json'), JSON.stringify({schemaVersion: 1, updatedAt: latestDate, slugs: [...ids]}, null, 2) + '\n');
await writeFile(resolve(out, 'projects.json'), JSON.stringify(data, null, 2) + '\n');
await writeFile(resolve(out, 'robots.txt'), 'User-agent: *\nAllow: /\n' + (origin ? 'Sitemap: ' + origin + '/sitemap.xml\n' : ''));
if (origin) {
  const entries = [['/', latestDate], ...data.projects.map(p => [profileUrl(p), p.updatedAt])];
  await writeFile(resolve(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map(([path, updated]) => `<url><loc>${escape(origin + path)}</loc><lastmod>${updated}</lastmod></url>`).join('')}</urlset>\n`);
} else {
  await rm(resolve(out, 'sitemap.xml'), { force: true });
}
console.log('Built the portfolio and ' + data.projects.length + ' project profiles from content/projects.json.');
