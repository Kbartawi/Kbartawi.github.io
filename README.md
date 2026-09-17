# Khaled / Product portfolio

![Portfolio preview](docs/media/portfolio.png)

**[Open the portfolio](https://kbartawi.github.io/)** · [GitHub profile](https://github.com/Kbartawi)

A living collection of six projects: Quote Operations, Oris, Manzl, Aqd, Frame and Dubai Game. Keep the existing typography, layout and visual style; project content comes from one catalogue.

## Readiness — 17 September 2026

| Area | Current state |
| --- | --- |
| Technical | Static portfolio with validated JSON content and generated project profiles. Built with Node.js; served by GitHub Pages. A working portfolio is not proof that each linked app is production-ready. |
| Commercial | Founder portfolio, not a paid service. Individual project pages distinguish prototypes, pilot preparation and unvalidated commercial outcomes. |
| Hosting / data | [kbartawi.github.io](https://kbartawi.github.io/), GitHub Pages `main` → `/docs`. No Vercel or Supabase dependency is needed. Public content only. |
| Next gate | Keep project stages, public links and evidence current; review the published pages after each content change. |

## Design and review

Follow [the visual reference and checklist](DESIGN-STANDARD.md) before changing cards. Technical checks, visual review and owner approval are separate. Keep new cards in the existing system.

## Edit, build and check

Requires Node.js 20 or newer; there are no package dependencies.

1. Edit `content/projects.json` for copy, readiness, updates and public links.
2. Run `npm run build`.
3. Preview with `python3 -m http.server 4177 --directory docs` and open `http://localhost:4177`.
4. Check all six project pages and their links. Preserve honest demo/production distinctions.
5. Commit source and generated `docs/` together.

The build writes the homepage, six project profiles, sitemap, metadata and 404 page. Shared fonts, CSS and selected visual assets remain in `docs/`. `docs/.nojekyll` allows GitHub Pages to serve the files directly. Use `PORTFOLIO_SITE_URL` only when intentionally moving the site origin.

## Publish

Repository: `Kbartawi/Kbartawi.github.io`. GitHub Pages uses **Deploy from a branch**, **main**, **/docs**. Verify the Pages run and public response after pushing. Update the separate `Kbartawi/Kbartawi` profile README when the featured projects change.

## Project truth

- **Quote Operations:** public fictional sample and local configured AI rehearsal; real customer catalogues, prices, team access and measured pilot results remain acceptance work.
- **Oris:** deployed application; tenant-specific channels, voice and customer outcomes require current evidence.
- **Manzl:** hosted website and seeded leasing prototype; hosted API/data, private access and live channel acceptance are separate gates.
- **Aqd:** browser-based preparation demo; no private cloud storage, production team accounts, payment collection or government registration.
- **Frame:** active creator-studio prototype; first completed production film and reliable hosted operation remain under validation. The profile does not send visitors to an unverified creation demo.
- **Dubai Game:** preproduction, paused art review and prototype source; no verified playable consumer release or approved final art.

Public samples use fictional data. Source code for the products is private. Never publish credentials, private customer records or unsupported revenue/traction claims in this repository.
