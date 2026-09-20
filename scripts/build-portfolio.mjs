import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, access, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'docs');
const styleVersion = createHash('sha256').update(await readFile(resolve(out, 'portfolio.css'))).update(await readFile(resolve(out, 'portfolio.js'))).update(await readFile(resolve(out, 'theme-init.js'))).digest('hex').slice(0, 10);
const data = JSON.parse(await readFile(resolve(root, 'content/projects.json'), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date = value => new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + 'T12:00:00Z'));
const words = ['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten'];
const themes = new Set(['hvac', 'oris', 'manzl', 'aqd', 'plain', 'frame', 'dubai']);
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
  for (const key of ['name','category','modelDescription','audience','buyer','users','market','stage','summary','demoNote','technicalReadiness','commercialReadiness','positioning','outcome','nextAction']) requireText(p[key], p.slug + '.' + key);
  if (!p.overview || !['problem','concept'].includes(p.overview.type)) throw new Error('Choose a problem or concept overview: ' + p.slug);
  requireText(p.overview.text, p.slug + '.overview.text');
  for (const key of ['headline','features','workflow','nextFocus','languages','deliverables','useCases','stack']) {
    if (!Array.isArray(p[key]) || !p[key].length || p[key].some(x => typeof x !== 'string' || !x.trim())) throw new Error('Invalid list: ' + p.slug + '.' + key);
  }
  if (p.headline.length !== 2 || p.workflow.length !== 3 || !isDate(p.updatedAt)) throw new Error('Invalid headline, workflow or date: ' + p.slug);
  if (!Array.isArray(p.updates) || p.updates.some(u => !isDate(u.date) || typeof u.text !== 'string' || !u.text.trim())) throw new Error('Invalid updates: ' + p.slug);
  if (p.website !== null && !safeWebsite(p.website)) throw new Error('Website must use HTTPS: ' + p.slug);
  if (p.demoUrl !== null && !safeWebsite(p.demoUrl)) throw new Error('Demo URL must use HTTPS: ' + p.slug);
  if (p.demoLabel !== undefined) requireText(p.demoLabel, p.slug + '.demoLabel');
  if (!Array.isArray(p.readinessChecks) || p.readinessChecks.length < 3) throw new Error('Missing readiness checklist: ' + p.slug);
  for (const check of p.readinessChecks) {
    requireText(check.label, p.slug + '.check.label');
    requireText(check.detail, p.slug + '.check.detail');
    if (!['passed','open','not-checked'].includes(check.status)) throw new Error('Invalid readiness status: ' + p.slug);
  }
  if (p.image !== null) {
    if (!localPath(p.image)) throw new Error('Image must be a local asset: ' + p.slug);
    requireText(p.imageAlt, p.slug + '.imageAlt');
    await access(resolve(out, '.' + p.image));
  }
  if (!p.gallery || !Array.isArray(p.gallery.items) || (p.gallery.items.length < 3 && !(p.slug === 'frame' && p.gallery.items.length === 0))) throw new Error('Missing gallery: ' + p.slug);
  for (const key of ['heading', 'description']) requireText(p.gallery[key], p.slug + '.gallery.' + key);
  if (p.gallery.groups) {
    if (!Array.isArray(p.gallery.groups) || !p.gallery.groups.length) throw new Error('Invalid gallery groups: ' + p.slug);
    const groupIds = new Set();
    for (const group of p.gallery.groups) {
      if (!slugPattern.test(group.id) || groupIds.has(group.id) || !['product','creative'].includes(group.layout)) throw new Error('Invalid gallery group: ' + p.slug);
      groupIds.add(group.id);
      for (const key of ['title','description']) requireText(group[key], p.slug + '.gallery.group.' + key);
      if (!p.gallery.items.some(shot => shot.group === group.id)) throw new Error('Empty gallery group: ' + p.slug);
    }
    if (p.gallery.items.some(shot => !groupIds.has(shot.group))) throw new Error('Unassigned gallery image: ' + p.slug);
  }
  for (const shot of p.gallery.items) {
    for (const key of ['title', 'caption', 'alt', 'kind']) requireText(shot[key], p.slug + '.gallery.' + key);
    for (const key of ['src', 'thumb']) {
      if (!localPath(shot[key])) throw new Error('Gallery image must be a local asset: ' + p.slug);
      await access(resolve(out, '.' + shot[key]));
    }
    if (![shot.width, shot.height].every(n => Number.isInteger(n) && n > 0)) throw new Error('Invalid gallery image dimensions: ' + p.slug);
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

// Shared, accessible portfolio views. Content remains in the catalogue.
const arrow = '<span aria-hidden="true">↗</span>';
const profileUrl = p => '/projects/' + p.slug + '/';
const tag = (text, cls = '') => `<span class="tag ${cls}">${escape(text)}</span>`;
const mark = p => `<span class="brand brand-${escape(p.theme)}">${escape(p.name.toLowerCase())}${p.theme === 'oris' ? '<span>✳</span>' : p.theme === 'aqd' ? '<span lang="ar">عقد</span>' : '<span>.</span>'}</span>`;
const icon = name => name === 'sun' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/></svg>';
function header() {
  return `<header class="site-header"><a class="monogram" href="/" aria-label="Khaled portfolio home">kb<span>/</span></a><nav aria-label="Main navigation"><a href="/#projects">Work</a><a href="/#about">About</a><a href="${escape(data.github)}" target="_blank" rel="noopener noreferrer">GitHub ${arrow}</a></nav><div class="theme-control" role="group" aria-label="Color theme"><button type="button" data-theme-choice="light" aria-label="Use light theme" aria-pressed="false">${icon('sun')}</button><button type="button" data-theme-choice="dark" aria-label="Use dark theme" aria-pressed="false">${icon('moon')}</button></div></header>`;
}
function footer() {
 return `<footer class="site-footer"><a class="monogram" href="/">kb<span>/</span></a><p>Dubai, UAE<br><span>Updated ${date(latestDate)}</span></p><a href="${escape(data.github)}" target="_blank" rel="noopener noreferrer">Find me on GitHub ${arrow}</a></footer>`;
}
function document(title, description, path, body) {
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta name="color-scheme" content="light dark"><meta property="og:type" content="website"><meta property="og:image" content="${origin}/media/portfolio.png"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><link rel="canonical" href="${origin}${path}"><meta property="og:url" content="${origin}${path}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><script src="/theme-init.js?v=${styleVersion}"></script><link rel="stylesheet" href="/fonts.css"><link rel="stylesheet" href="/portfolio.css?v=${styleVersion}"><script src="/portfolio.js?v=${styleVersion}" defer></script></head><body><a class="skip" href="#main">Skip to content</a>${header()}<main id="main">${body}</main>${footer()}</body></html>
`;
}
function visual(p) {
 if(p.slug==='frame') return `<div class="project-art art-frame" role="img" aria-label="Illustration of the Frame workflow: capture your words, retrieve their original context, then review your next step. Not an app screenshot."><div class="studio-top"><span class="studio-wordmark">frame<span>●</span></span><span>WORKFLOW ILLUSTRATION</span></div><svg viewBox="0 0 520 260" width="100%" style="display:block;flex:1;min-height:0" aria-hidden="true"><path d="M76 64V202" fill="none" stroke="#536A5B" stroke-width="2"/><g fill="#C5F26A"><circle cx="76" cy="56" r="21"/><circle cx="76" cy="132" r="21"/><circle cx="76" cy="208" r="21"/></g><g fill="#182820" font-size="15" font-family="system-ui,sans-serif" text-anchor="middle"><text x="76" y="62">01</text><text x="76" y="138">02</text><text x="76" y="214">03</text></g><g fill="#F4F7F1" font-size="23" font-family="system-ui,sans-serif"><text x="119" y="51">Capture your words</text><text x="119" y="127">Find the original context</text><text x="119" y="203">Review your next step</text></g><g fill="#BAC7BE" font-size="14" font-family="system-ui,sans-serif"><text x="119" y="75">A thought or a conversation</text><text x="119" y="151">Source-linked notes and recall</text><text x="119" y="227">You decide what happens next</text></g></svg><div class="studio-steps"><span>Voice</span><b>→</b><span>Memory</span><b>→</b><strong>Reviewed action</strong></div></div>`;
 if(p.slug==='dubai-game') return `<div class="project-art art-dubai"><img src="${escape(p.image)}" alt="${escape(p.imageAlt)}" loading="lazy"><div class="world-caption"><span>WORLD IN DEVELOPMENT</span><strong>Downtown Dubai.</strong><span>Original project concept art · Not gameplay</span></div></div>`;
 if(p.slug==='oris') return `<div class="project-art art-oris" role="img" aria-label="Illustrative Oris conversation in Arabic with business context and a human handoff"><div class="support-ui"><div class="support-header"><span class="support-avatar">o✳</span><div><strong>Customer<br>conversation</strong></div><span class="online-dot"></span></div><div class="support-message customer" lang="ar" dir="rtl">هل التوصيل متاح إلى الشارقة؟</div><div class="support-message agent">Yes — we deliver to Sharjah.<br><strong>Let me check the details for you.</strong></div><div class="support-source"><span>✳</span><div>Business policies and context<br><strong>Hand over to the support team</strong></div></div></div><span class="art-label">ILLUSTRATIVE CONVERSATION</span></div>`;
 if(p.slug==='aqd') return `<div class="project-art art-aqd" role="img" aria-label="Illustrative Aqd tenancy preparation pack with property details, cheque schedule and documents"><div class="aqd-paper"><div class="paper-top"><span>aqd <i lang="ar">عقد</i></span><span>TENANCY PACK / 01</span></div><h3>Tenancy<br>preparation</h3><div class="paper-row"><span>✓</span>Property & agreement</div><div class="paper-row"><span>✓</span>Rent & cheque schedule</div><div class="paper-row"><span>○</span>Documents to complete</div><div class="paper-foot">Property · Rent · Documents</div></div><span class="art-label">ILLUSTRATIVE PREPARATION PACK</span></div>`;
 if(p.slug==='manzl') return `<div class="project-art art-manzl"><img src="${escape(p.image)}" alt="${escape(p.imageAlt)}" loading="lazy"><div class="viewing-card"><span class="viewing-avatar">R</span><div><strong>Meet Reem.</strong><span>Enquiry → Qualification → Viewing</span></div><span>↗</span></div><span class="art-label">ILLUSTRATIVE PROPERTY</span></div>`;
 return `<div class="project-art art-quote"><div class="quote-window"><div class="quote-toolbar"><span>quote operations<span>.</span></span><span>SAMPLE QUOTATION</span></div><img src="${escape(p.image)}" alt="${escape(p.imageAlt)}" loading="lazy"></div><div class="quote-chip">Review the quotation ${arrow}</div><span class="art-label">FICTIONAL SAMPLE DATA</span></div>`;
}
function card(p,index) {
 return `<article class="project-card ${escape(p.theme)}" data-category="${p.slug==='frame'?'personal':p.model==='B2B'?'business':'creative'}"><a class="card-link" href="${profileUrl(p)}"><div class="card-top">${mark(p)}<span>${String(index+1).padStart(2,'0')} / ${escape(p.category)}</span></div>${visual(p)}<div class="card-body"><div class="card-meta">${tag(p.model)}${tag(p.cardStage || p.stage,'stage')}</div><h3>${escape(p.headline[0])}<br><em>${escape(p.headline[1])}</em></h3><p>${escape(p.summary)}</p><div class="card-bottom"><span>For ${escape(p.cardAudience || p.audience)}</span><span class="card-arrow" aria-hidden="true">↗</span></div></div></a></article>`;
}
function home(){
 return document(data.title,data.description,'/',`<section class="hero"><p class="eyebrow"><span class="live-dot"></span>KHALED / FOUNDER & PILOT / DUBAI</p><h1>Building AI<br><em>products.</em></h1><div class="hero-bottom"><p>${escape(data.intro).replace(/\n/g, '<br>')}</p><a class="text-action" href="#projects">See the projects <span aria-hidden="true">↓</span></a></div><div class="hero-index"><span>01 / Business software</span><span>02 / Personal tools</span><span>03 / Games</span><span class="index-count">6 PROJECTS</span></div></section>
 <section id="projects" class="work-section" aria-labelledby="work-heading"><div class="section-bar"><div><p class="eyebrow">PRODUCT PORTFOLIO</p><h2 id="work-heading">Products &amp; research<span>.</span></h2></div><div class="filters" role="group" aria-label="Filter projects"><button type="button" data-filter="all" aria-pressed="true">All work <span>6</span></button><button type="button" data-filter="business" aria-pressed="false">Business <span>4</span></button><button type="button" data-filter="personal" aria-pressed="false">Personal tools <span>1</span></button><button type="button" data-filter="creative" aria-pressed="false">Creative <span>1</span></button></div></div><p id="filter-status" class="sr-only" role="status" aria-live="polite">Showing all 6 projects.</p><div class="project-grid">${data.projects.map(card).join('')}</div></section>
 <section class="about-section" id="about"><div><h2>Founder profile.</h2></div><div><p>${escape(data.about)}</p><p>My aviation background shapes how I work: clear procedures, documented decisions and evidence before calling a product ready.</p><a class="text-action" href="${escape(data.github)}" target="_blank" rel="noopener noreferrer">More on GitHub ${arrow}</a></div></section>
 <section class="colophon"><p class="eyebrow">PRODUCT STATUS</p><p>Each profile includes the target customer, product demos, technical and commercial readiness, and the next validation milestone.</p></section>`);
}
function profile(p,index){
 const next=data.projects[(index+1)%data.projects.length];
 const deliverables=p.deliverables||p.features.slice(0,3);const cases=p.useCases||[p.audience];
 const checks=p.readinessChecks||[];
 const statusLabel={'passed':'Verified','open':'In progress','not-checked':'Not checked'};
 const facts=[['Users',p.audience],['Buyer',p.buyer],['Market',p.market],['Stage',p.stage]];
 return document(p.name+' / Khaled',p.summary,profileUrl(p),`<div class="breadcrumb"><a href="/#projects">← All work</a><span>${escape(p.name)}</span></div><section class="project-hero"><div class="project-heading">${mark(p)}<div class="project-badges">${tag(p.category)}${tag(p.cardStage||p.stage,'stage')}</div></div><div class="project-intro"><h1>${escape(p.headline[0])}<br><em>${escape(p.headline[1])}</em></h1><div><p class="lead">${escape(p.positioning||p.summary)}</p><p>${escape(p.outcome||p.summary)}</p><div class="project-actions">${p.demoUrl?`<a class="button-primary" href="${escape(p.demoUrl)}" target="_blank" rel="noopener noreferrer">${escape(p.demoLabel||'Explore demo')} ${arrow}</a>`:''}${p.website?`<a class="${p.demoUrl?'text-action':'button-primary'}" href="${escape(p.website)}" target="_blank" rel="noopener noreferrer">Product website ${arrow}</a>`:''}${!p.website&&!p.demoUrl?'<a class="text-action" href="#readiness">See current progress ↓</a>':''}</div></div></div></section>
 <section class="project-showcase" aria-label="${escape(p.name)} visual overview">${visual(p)}</section>
 <nav class="page-sections" aria-label="Project sections">${p.gallery.items.length ? `<a href="#gallery">Gallery <span>${p.gallery.items.length}</span></a>` : ''}<a href="#overview">Overview</a><a href="#workflow">Workflow</a><a href="#readiness">Readiness</a><a href="#next">What’s next</a></nav>
${gallery(p) ? " " + gallery(p) + "\n" : ""}${p.slug === 'frame' ? '<p class="body-copy"><a href="/projects/frame/privacy/">Privacy and data</a> · <a href="/projects/frame/support/">Beta support</a></p>\n' : ''}
 <section class="story-section" id="overview"><div><h2>${p.overview.type === 'concept' ? 'Concept' : 'Problem'}</h2><p class="body-copy">${escape(p.overview.text)}</p><dl class="project-facts">${facts.map(([k,v])=>`<div><dt>${k}</dt><dd>${escape(v)}</dd></div>`).join('')}</dl></div><div><p class="eyebrow">${p.overview.type === 'concept' ? 'SCOPE' : 'FEATURES'}</p><ol class="capabilities">${p.features.map((x,i)=>`<li><span>0${i+1}</span><p>${escape(x)}</p></li>`).join('')}</ol><div class="use-cases"><h3>Examples</h3><ul>${cases.map(x=>`<li>${escape(x)}</li>`).join('')}</ul></div></div></section>
 <section class="workflow-section" id="workflow"><div class="section-bar"><div><h2>${p.overview.type === 'concept' ? 'Development plan' : 'How it works'}</h2></div></div><ol class="workflow-grid">${p.workflow.map((x,i)=>`<li><span class="step-number">0${i+1}</span><h3>${escape(x)}</h3><p>${escape(deliverables[i]||'')}</p></li>`).join('')}</ol></section>
 <section class="readiness-section" id="readiness"><div><h2>Status</h2><p class="section-description">Reviewed ${date(p.updatedAt)}.</p><div class="stack-label">BUILT WITH</div><div class="stack">${(p.stack||[]).map(x=>tag(x)).join('')}</div></div><div><div class="readiness-summary"><article><h3>Technical readiness</h3><p>${escape(p.technicalReadiness)}</p></article><article><h3>Commercial readiness</h3><p>${escape(p.commercialReadiness)}</p></article></div><ul class="readiness-checks">${checks.map(x=>`<li><div><span class="check-state state-${escape(x.status)}">${statusLabel[x.status]||'Not checked'}</span><strong>${escape(x.label)}</strong></div><p>${escape(x.detail)}</p></li>`).join('')}</ul><p class="evidence-note">${escape(p.demoNote)}</p></div></section>
 <section class="next-section" id="next"><div><p class="eyebrow">NEXT MILESTONE</p><h2>${escape(p.nextAction||p.nextFocus[0])}</h2></div><ul>${p.nextFocus.map(x=>`<li>${escape(x)}</li>`).join('')}</ul></section>
 <a class="next-project" href="${profileUrl(next)}"><div><span>NEXT PROJECT</span><strong>${escape(next.name)}</strong></div><span aria-hidden="true">↗</span></a>`);
}

function gallery(p) {
 if (!p.gallery.items.length) return "";
 const groups = p.gallery.groups || [{id:null,layout:['frame','dubai-game'].includes(p.slug)?'creative':'product'}];
 const titleTag = p.gallery.groups ? 'h4' : 'h3';
 const figures = group => p.gallery.items.map((shot,i) => {
   if (group.id && shot.group !== group.id) return '';
   return `<figure class="gallery-shot"><a class="gallery-image" href="${escape(shot.src)}" data-gallery-item data-title="${escape(shot.title)}" data-caption="${escape(shot.caption)}" data-kind="${escape(shot.kind)}" aria-label="Open image ${i+1} of ${p.gallery.items.length}: ${escape(shot.title)}"><img src="${escape(shot.thumb)}" alt="${escape(shot.alt)}" width="${shot.width}" height="${shot.height}" loading="lazy" decoding="async"><span class="gallery-expand" aria-hidden="true">↗</span></a><figcaption><div class="gallery-meta"><span>${String(i+1).padStart(2,'0')} / ${escape(shot.kind)}</span></div><${titleTag}>${escape(shot.title)}</${titleTag}><p>${escape(shot.caption)}</p></figcaption></figure>`;
 }).join('');
 return `<section class="gallery-section" id="gallery" aria-labelledby="gallery-heading"><div class="section-bar"><div><p class="eyebrow">A CLOSER LOOK / ${String(p.gallery.items.length).padStart(2,'0')} IMAGES</p><h2 id="gallery-heading">${escape(p.gallery.heading)}</h2></div><p class="gallery-intro">${escape(p.gallery.description)}<span>Choose an image to explore it in full.</span></p></div>${groups.map(group => `<section class="gallery-group gallery-${group.layout}"${group.id ? ` id="gallery-${escape(group.id)}" aria-labelledby="gallery-title-${escape(group.id)}"` : ' aria-label="Project images"'}>${group.id ? `<div class="gallery-group-heading"><h3 id="gallery-title-${escape(group.id)}">${escape(group.title)}</h3><p>${escape(group.description)}</p></div>` : ''}<div class="gallery-grid">${figures(group)}</div></section>`).join('')}</section>
 <dialog class="gallery-viewer" id="gallery-viewer" aria-labelledby="viewer-title" aria-describedby="viewer-caption"><div class="viewer-toolbar"><span class="viewer-kind"></span><button class="viewer-close" type="button" aria-label="Close image viewer" autofocus>Close <span aria-hidden="true">×</span></button></div><div class="viewer-stage"><img class="viewer-image" alt=""><p class="viewer-error" hidden>That image could not load. <a class="viewer-retry" href="#">Open the image directly ↗</a></p></div><div class="viewer-details"><div class="viewer-caption"><h2 id="viewer-title"></h2><p id="viewer-caption"></p></div><div class="viewer-controls"><button type="button" class="viewer-previous" aria-label="Previous image">←</button><span class="viewer-counter" aria-live="polite" aria-atomic="true"></span><button type="button" class="viewer-next" aria-label="Next image">→</button><a class="viewer-original" target="_blank" rel="noopener noreferrer">Full resolution ↗</a></div></div></dialog>`;
}

await mkdir(out, { recursive: true });
await writeFile(resolve(out, 'index.html'), home());
await writeFile(resolve(out, '.nojekyll'), '');
await writeFile(resolve(out, '404.html'), document('Page not found / Khaled', 'Return to the portfolio.', '/404.html', '<section class="hero"><p class="eyebrow">404 / PAGE NOT FOUND</p><h1>Back to<br><em>the work.</em></h1><a class="button-primary" href="/">Explore the portfolio ↗</a></section>'));
await mkdir(resolve(out, 'projects'), { recursive: true });
const previousManifest = await readFile(resolve(out, 'project-manifest.json'), 'utf8').then(JSON.parse).catch(() => ({slugs: []}));
for (const slug of previousManifest.slugs || []) if (slugPattern.test(slug) && !ids.has(slug)) await rm(resolve(out, 'projects', slug), {recursive: true, force: true});
for (const [i, p] of data.projects.entries()) {await mkdir(resolve(out, 'projects', p.slug), { recursive: true });await writeFile(resolve(out, 'projects', p.slug, 'index.html'), profile(p, i));}
const frameInfoPages = [
 {slug: 'privacy', title: 'Frame privacy and data', description: 'How the current Frame iPhone assistant beta handles recordings, notes, AI processing and sharing.', sections: [
  ['Scope', 'This page describes the Frame voice assistant beta, updated 20 September 2026. Build 4 is verified for internal testing; the reminder feature below is in uploaded build 5, whose tester availability is not yet verified. Earlier Frame video tools and their separately configured services are not covered by these assistant-specific statements.'],
  ['Recording is your choice', 'Frame uses the microphone when you deliberately start recording. Inform other participants and obtain any required permission before recording a conversation. Capture pauses when Frame leaves the foreground. It does not secretly record other-app calls or listen continuously.'],
  ['Storage and local processing', 'Notes, tasks and recordings are stored in Frame’s protected app storage on your iPhone. Supported speech recognition runs on-device. Optional summaries, answers and drafts use Apple’s on-device model on compatible devices with iOS 26.4 or later and the model enabled and ready. There is no third-party AI service, Frame account or Frame analytics service connected to this assistant beta. Device and language availability varies.'],
  ['Private notes', 'Private notes are excluded from AI processing and memory answers. You can review them yourself. Text and task exports exclude private notes unless you explicitly enable their inclusion. The current export does not include audio files. Review an export before choosing where to share it.'],
  ['Optional local reminders — build 5', 'The uploaded build 5 adds reminders only when you choose a time and grant notification permission. Notifications use generic wording rather than your task title or note text. A local task identifier lets a notification tap open its related note. Device notification settings control presentation; a notification is not proof you saw or completed the task. Build 5 tester availability remains unverified.'],
  ['Retention, deletion and backups', 'Recordings are retained with their notes until you delete them. Use Frame’s note deletion or Settings data-deletion controls to remove assistant data owned by Frame. Device backups may include app data according to your Apple/device settings. Deleting current app data does not erase earlier backups or copies already shared or exported. Frame does not control those copies.'],
  ['Sharing and Calendar', 'Sharing happens only when you use the share controls. The destination you choose receives the content you share under its own practices. Calendar handoff supplies the event title and times for your review in Apple’s editor; your recordings and transcript are not attached. Your chosen Calendar account may store or sync that event. Frame deletion does not remove Calendar events.'],
  ['Apple services and feedback', 'TestFlight distribution, crash information, device diagnostics and feedback are governed separately by Apple and your platform settings. These are not Frame-operated analytics. If you send beta feedback, the information you choose to include may be visible to the developer through TestFlight. Avoid including sensitive recordings, passwords or private note content.'],
  ['Questions', 'For this internal beta, use TestFlight’s Send Beta Feedback action for Frame. See the beta support page for troubleshooting and the details to include.']
 ]},
 {slug: 'support', title: 'Frame beta support', description: 'Get help with the current Frame iPhone voice assistant beta.', sections: [
  ['Send feedback', 'Open TestFlight, choose Frame and use Send Beta Feedback. Include your app version, iPhone model, iOS version, what you expected and the steps that produced the issue. Do not include passwords or private recordings unless you deliberately choose to share them. This internal beta does not have a promised response time or a paid support plan.'],
  ['Cannot record or transcribe', 'Check microphone and speech-recognition permissions in iPhone Settings. On-device recognition must support your selected language on that device. If transcription is unavailable, keep the saved recording and use a written note. Changing the language is not a guarantee of mixed-language accuracy.'],
  ['AI unavailable', 'Optional generation requires a compatible Apple Intelligence iPhone, iOS 26.4 or later, and Apple’s enabled, ready on-device model. Frame explains unavailable states; notes and search remain usable. No cloud service is silently substituted. The interface and generated responses are English.'],
  ['Recording interrupted', 'Returning from another app or a device interruption may leave capture paused. Check the visible recording state and resume or save deliberately. If Frame offers a recovered recording, review it before processing. Do not delete a recording you still need while investigating a problem.'],
  ['Calendar or sharing', 'Calendar opens Apple’s editor for your confirmation; Frame does not find free time or resolve schedule conflicts. If the editor is unavailable, close it and use Calendar directly. Check Calendar before retrying a save whose result is unclear. Sharing uses the destination you select; Frame cannot confirm delivery.'],
  ['Reminders — uploaded build 5', 'If you have a reminder-enabled build, choose a time and allow notifications deliberately. Check iPhone notification settings if alerts are disabled. Notifications use generic text to avoid exposing your note on the lock screen. Simulator permission, scheduling/removal and notification navigation were checked; physical-device behavior still needs testing. Build 5 was uploaded but its tester availability is not verified.'],
  ['Export or delete', 'Use Settings to prepare a text/task export, with private notes excluded unless you opt in. Audio is not in that export. Use note deletion or assistant data-deletion controls for Frame-owned data. Shared files, backups and Calendar events must be managed separately.'],
  ['Beta limits', 'The assistant is under device and usefulness validation. AI output may be wrong: check it against the original source. No paid plan, public release or professional-advice service is promised by this beta.']
 ]}
];
for (const page of frameInfoPages) {
 const path = '/projects/frame/' + page.slug + '/';
 const body = `<div class="breadcrumb"><a href="/projects/frame/">← Frame</a><span>${escape(page.title)}</span></div><section class="project-hero"><p class="eyebrow">FRAME / INTERNAL BETA / 20 SEPTEMBER 2026</p><h1>${escape(page.title)}</h1><p class="lead">${escape(page.description)}</p><p class="body-copy"><a href="/projects/frame/privacy/">Privacy and data</a> · <a href="/projects/frame/support/">Beta support</a></p></section>${page.sections.map(([heading,text]) => `<section class="story-section"><div><h2>${escape(heading)}</h2></div><div><p class="body-copy">${escape(text)}</p></div></section>`).join('')}`;
 await mkdir(resolve(out, 'projects/frame', page.slug), {recursive: true});
 await writeFile(resolve(out, 'projects/frame', page.slug, 'index.html'), document(page.title, page.description, path, body));
}
await writeFile(resolve(out, 'project-manifest.json'), JSON.stringify({schemaVersion: 1, updatedAt: latestDate, slugs: [...ids]}, null, 2) + '\n');
await writeFile(resolve(out, 'projects.json'), JSON.stringify(data, null, 2) + '\n');
await writeFile(resolve(out, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: '+origin+'/sitemap.xml\n');
const entries=[['/',latestDate],...data.projects.map(p=>[profileUrl(p),p.updatedAt]),...frameInfoPages.map(p=>['/projects/frame/'+p.slug+'/',latestDate])];
await writeFile(resolve(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map(([path,updated])=>`<url><loc>${escape(origin+path)}</loc><lastmod>${updated}</lastmod></url>`).join('')}</urlset>\n`);
console.log('Built the portfolio and '+data.projects.length+' project profiles.');
