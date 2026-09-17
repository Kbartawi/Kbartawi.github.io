# Portfolio design and release standard

## Current direction

The owner requested a full portfolio upgrade on 17 September 2026: all six projects, professional founder/pilot biography, light and dark themes, richer project pages, actual Dubai Game concept art and clear A-to-Z Frame positioning. This supersedes the earlier rule to keep a three-column grid with 221px art. The earlier reference still informs deliberate typography and meaningful visuals.

The owner explicitly approved this direction on 17 September: “Amazing, amazing.” The next request is additive: more images for every project, especially matching Frame and Dubai Game shots. Preserve the approved cards and layout. Frame’s visual reference is the orange sports car, rocky coast, turquoise water and golden-hour light. Dubai’s references are the existing Downtown and Marina artwork. This approval concerns the portfolio presentation, not final game art or product production readiness.

The owner then clarified: keep the website photographs, but add photographs of the products. For software, this means the real application interface—its inbox, dashboard, composer, forms and workflow. Put product screens first; keep marketing website captures and creative output studies in clearly named supporting collections. A website screenshot alone does not satisfy a request to show the product. Use actual app components and safe demo data; identify local samples and provider fixtures honestly. Never manufacture a product screen and call it a screenshot.

## Voice and copy

The owner explicitly rejected “Curiosity, meet execution” and the repeated “A problem worth solving” heading. The subsequent clarification is equally important: plain language must still present a credible founder to investors. Do not use the casual “Hi, I’m Khaled,” “here are my side projects,” or “a fun project” framing. Lead with the founder’s product focus, the intended customer, evidence of progress and the next validation milestone. Keep direct labels such as **Problem**, **How it works**, **Status** and **Screenshots**.

Use **Concept** for exploratory work such as Dubai Game, with its preproduction stage clearly stated. Do not invent a customer problem, commercial traction or a business model to make a creative project sound investable. The catalogue records this in `overview.type` (`problem` or `concept`) and `overview.text`. This clarification supersedes the earlier casual wording while retaining its intent: direct, human copy without canned slogans.

Avoid motivational slogans, founder manifestos, rhyming sales lines and claims that every project solves an important problem. Investor-facing does not mean unsupported growth, revenue, funding or readiness claims. Keep the approved visual design. Describe what the app does, who uses or buys it, what is verified and what needs work. Keep the website and GitHub profile consistent, and refresh preview images when visible copy changes.

## Repeatable checklist

- [ ] One consistent two-column project grid on desktop; one column on phone. Equal card structure and visual height at each breakpoint.
- [ ] Each card immediately explains the product with relevant imagery, outcome, audience and stage.
- [ ] Frame clearly describes AI production from idea, script and visuals through voice, edit and export. Do not use an unrelated novelty-video idea as its identity.
- [ ] Dubai Game uses the actual project’s Marina/Downtown/Burj assets. Do not substitute a newly invented old-town image. Label concept art and avoid gameplay claims.
- [ ] Preserve product-specific branding within one system of spacing, navigation and controls.
- [ ] Each project page includes overview, capabilities, audience, use cases, workflow, deliverables, technical/commercial readiness, verification gates, stack and next milestone.
- [ ] Each project has a curated gallery. Match approved visual references; preserve complete images and landmarks. Clearly distinguish real product screens, public website captures, sample data and generated concept artwork.
- [ ] Gallery images use optimized thumbnails and open into a full-size viewer. Verify phone layout, next/previous controls, keyboard arrows, Escape, focus return and ordinary image links without JavaScript.
- [ ] Theme follows system preference initially; explicit user choice persists across pages and reloads. Both modes must be visually reviewed.
- [ ] All work / Business / Creative filters expose pressed state and announce results without hiding keyboard focus unexpectedly.
- [ ] Mobile controls are usable; project and section links work; focus is visible; reduced-motion preference is respected.
- [ ] Run build and check. Review generated content, phone layouts, public deployment and source-of-truth asset captions.

## Verification — 17 September 2026

| Area | Result | Evidence |
| --- | --- | --- |
| Page/layout coverage | Passed | 7 pages × 3 viewport widths (375/768/1440) × 2 themes = 42 checks; no horizontal overflow or broken loaded images |
| Theme | Passed | Real light/dark clicks, reload persistence and theme retained through every page |
| Filters | Passed | Real clicks produce 6/4/2 cards and updated live-region text |
| Console | Passed | No browser exceptions in UI run |
| Visual inspection | Passed by reviewer | All six cards in light mode, both creative cards in both modes, Frame phone page reviewed from screenshots |
| Contrast | Targeted checks passed | Light muted body 5.36:1; light status label corrected from 4.03:1 to >4.5:1; dark body 7.81:1 and dark status 7.71:1 |
| Full accessibility audit | Not checked | Targeted checks do not constitute certification |
| Product backend acceptance | Not checked here | Portfolio work does not prove the linked products’ runtime workflows |
| Owner aesthetic approval | Approved for the base design | Explicit “Amazing, amazing” feedback on 17 September; additional galleries requested in the same message |

### Gallery verification — 17 September 2026

| Area | Result | Evidence |
| --- | --- | --- |
| Coverage | Passed | All six project galleries; 28 captioned images (Frame 7, Dubai 8, Quote 4, Oris/Manzl/Aqd 3 each) |
| Responsive themes | Passed | 6 galleries × 3 widths (375/768/1440) × 2 themes = 36 browser cases; no horizontal overflow or broken loaded images |
| Full-size viewer | Passed | All 28 full-size images decoded; next/previous buttons and arrow keys, wraparound, Escape, close button, initial focus and focus return checked |
| Progressive enhancement | Passed | The gallery image links open their actual WebP files with JavaScript disabled |
| Existing controls | Passed | Light/dark persistence and all three project filters still work |
| Visual review | Passed by reviewer | Both creative galleries in light/dark; phone viewer; all four business galleries inspected |
| Browser errors | Passed | No browser exceptions or failed local asset requests during the 36-case run |

Detailed local evidence: `Documents/Workspace Maintenance/portfolio-review/gallery-checks.json` and gallery screenshots. These checks cover the portfolio, not the product backends.

### Product-screen addition — 17 September 2026

Added 13 actual product screenshots, bringing the galleries to 41 images including 20 product views. Oris, Manzl and Frame now lead with an “Inside the product” collection. The website and film-concept collections remain below it. Quote Operations and Aqd show six and five actual workflow screens respectively. Dubai Game remains explicitly concept art; there is no verified playable build to capture.

Verification passed after the change: 36 page/theme/viewport cases; all 41 full-size files decoded; correct product-first ordering and three-image collections; no overflow, missing images, browser exceptions or failed local assets. Viewer controls, keyboard/focus return, theme persistence, filters and no-JavaScript image links passed. Aqd’s transition timing was corrected before the selected captures were imported. Evidence: `Documents/Workspace Maintenance/portfolio-review/product-gallery-checks.json`.

Reviewer category assessment (subjective): hierarchy 4/5, typography 4/5, color 4/5, spacing 4/5, components 4/5, responsiveness 4/5, motion 4/5, accessibility 4/5 subject to full audit, craft 4/5. Wider device and accessibility testing remain open.

### Founder presentation review — 17 September 2026

Replaced the casual homepage introduction with “Building AI products” and a specific focus on customer operations and video production. Product profiles now expose users, buyer, market and development stage. Dubai Game uses a **Concept** overview and retains its preproduction status. Commercial and technical readiness facts were preserved; no revenue, adoption or funding claims were added. The GitHub profile and its light/dark preview images follow the same positioning.

Verification passed across 7 pages × 2 widths (375/1440) × 2 themes: no horizontal overflow or browser exceptions, no rejected casual wording, and correct overview/fact labels on every product. Desktop light, mobile dark and the Dubai concept overview were visually reviewed. Build and static-link checks passed. Local evidence: `Documents/Workspace Maintenance/portfolio-review/founder-copy-checks.json`.

## Inspiration and provenance

Studied [Higgsfield](https://higgsfield.ai/) for prominent cinematic media and direct creative-workflow communication. Its assets and brand were not copied. See [ASSET-SOURCES.md](ASSET-SOURCES.md) for the images used here.

Local UI evidence and screenshots: Documents/Workspace Maintenance/portfolio-review. The website screenshots are also used in the profile’s theme-aware preview.
