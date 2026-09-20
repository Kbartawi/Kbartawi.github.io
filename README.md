# Khaled / Product portfolio

**[Open the portfolio](https://kbartawi.github.io/)** · [GitHub profile](https://github.com/Kbartawi)

A founder portfolio covering AI products for customer operations and personal workflows, plus game development in preproduction. Six project profiles explain the intended users and buyers, current technical and commercial readiness, and the next validation milestone. Includes light/dark themes and curated gallery images, maintained from one catalogue.

Explore [Frame’s current development direction](https://kbartawi.github.io/projects/frame/), [Oris’s support workspace](https://kbartawi.github.io/projects/oris/#gallery-product), [Manzl’s leasing dashboard](https://kbartawi.github.io/projects/manzl/#gallery-product), six Quote Operations screens and five Aqd screens. Frame separates generated design references from an actual simulator screenshot and demo; physical-device acceptance is pending. Other website captures and [eight Dubai Game world studies](https://kbartawi.github.io/projects/dubai-game/#gallery) remain clearly identified.

Product screenshots use fictional data: Quote Operations and Aqd were captured in their hosted demos; Oris and Manzl were captured from real application components in isolated local demos. They demonstrate interfaces, not live customer activity or production backend acceptance.

## Readiness — 20 September 2026

| Area | Current state |
| --- | --- |
| Technical | Static portfolio with validated JSON content and generated project profiles. Built with Node.js; served by GitHub Pages. A working portfolio is not proof that each linked app is production-ready. |
| Commercial | Founder portfolio, not a paid service. Individual project pages distinguish prototypes, pilot preparation and unvalidated commercial outcomes. |
| Hosting / data | [kbartawi.github.io](https://kbartawi.github.io/), GitHub Pages `main` → `/docs`. No Vercel or Supabase dependency is needed. Public content only. |
| Next gate | Keep project stages, public links and evidence current; review the published pages after each content change. |

## Design and review

Follow [the visual reference and checklist](DESIGN-STANDARD.md) before changing cards. Technical checks, visual review and owner approval are separate. Keep new cards in the existing system.

Follow the [product review standard](PRODUCT-STANDARD.md) for customer context, technical and commercial readiness, evidence, messaging and next milestones. The website and GitHub profile should agree on those facts. The detailed automation operating record is maintained in the private Frame repository; this public repository contains no machine settings or private production data.

## Edit, build and check

Requires Node.js 20 or newer; build and static checks have no package dependencies.

1. Edit `content/projects.json` for copy, readiness, updates, public links and gallery entries. Use `overview.type: "problem"` for an actual problem and `"concept"` for exploratory work, with plain text in `overview.text`. Use professional, direct copy; distinguish verified progress from plans. Gallery assets include optimized thumbnails plus full-size images in `docs/media/gallery/`; keep source provenance in `content/gallery-sources.json`.
2. Run `npm run build` and `npm run check`.
3. Preview with `python3 -m http.server 4177 --directory docs` and open `http://localhost:4177`.
4. Check all six project pages in both themes at phone, tablet and desktop widths. Test theme persistence, project filters, gallery navigation, keyboard controls, focus return and the image-link fallback without JavaScript. Preserve honest demo/production distinctions.
5. Commit source and generated `docs/` together.

The build writes the homepage, six project profiles, sitemap, metadata and 404 page. Shared fonts, CSS and selected visual assets remain in `docs/`. `docs/.nojekyll` allows GitHub Pages to serve the files directly. Use `PORTFOLIO_SITE_URL` only when intentionally moving the site origin.

## Publish

Repository: `Kbartawi/Kbartawi.github.io`. GitHub Pages uses **Deploy from a branch**, **main**, **/docs**. Verify the Pages run and public response after pushing. Update the separate `Kbartawi/Kbartawi` profile README when the featured projects change.

## Project truth

- **Quote Operations:** public fictional sample and local configured AI rehearsal; real customer catalogues, prices, team access and measured pilot results remain acceptance work.
- **Oris:** deployed application; tenant-specific channels, voice and customer outcomes require current evidence.
- **Manzl:** hosted website and seeded leasing prototype; hosted API/data, private access and live channel acceptance are separate gates.
- **Aqd:** browser-based preparation demo; no private cloud storage, production team accounts, payment collection or government registration.
- **Frame:** Voice workspace in internal beta. Build 3.0.0 (12) completed Apple processing and is assigned to internal Owner Testing. It adds source-backed action suggestions, changed/private-source guards, durable completion receipts and due-date ordering. Its automated suite executed 149 checks: 147 passed and two skipped; a separate live AI test failed. Successful generation and physical-iPhone voice-to-action acceptance remain unverified. Optional local AI requires an eligible, enabled device with iOS 26.4 or later; no cloud AI is connected.
- **Dubai Game:** preproduction, paused art review and prototype source; no verified playable consumer release or approved final art.

Public samples use fictional data. Source code for the products is private. Never publish credentials, private customer records or unsupported revenue/traction claims in this repository.

Frame updates must stay synchronized with the application README and GitHub personal profile. Technical completion, creative acceptance and release state are separate facts.

Latest Frame evidence: [local workflow demo](https://kbartawi.github.io/projects/frame/#demo), 78 seconds, silent, development build13. It shows task editing, source review, receipts and an audio-only warning—not successful AI generation. Build13 is not delivered; build12 remains the latest verified internal release. The earlier build10 video and all20 gallery images are preserved.
