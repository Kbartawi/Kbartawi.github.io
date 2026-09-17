# Portfolio design standard

## Reference

Use commit `efdeb04` as the accepted visual reference for Oris, Manzl and Aqd. The owner specifically values the cards’ composition, useful content and consistency. Compare rendered output, not just CSS declarations. Preserve each product identity inside a shared editorial structure.

## Card checklist

- [ ] Equal supporting-card widths at each breakpoint; no special larger slots for newly added projects.
- [ ] Same order: brand/category, visual, two-line outcome, brief description, For/Stage, Meet action.
- [ ] Visuals show one recognizable product artifact or place. Avoid generic symbol collections and tiny diagram labels.
- [ ] Desktop art is 221px high; phone art 250px. Headers, titles and actions align within each row.
- [ ] Keep warm paper, quiet borders, existing fonts and restrained product-specific accents.
- [ ] Short audience and stage labels; detailed technical/commercial evidence lives on the project page.
- [ ] Concept images and mockups are labelled. Never imply a working demo, approved game asset or measured outcome without evidence.
- [ ] Review original and new cards together at 375px, 768px and 1280px. Check image cropping, text fit, focus and touch targets.
- [ ] Build and link checks are technical evidence only. Aesthetic approval remains a separate decision.

## Review — 17 September 2026

| Check | Result | Evidence |
| --- | --- | --- |
| Historical comparison | Passed | Rendered efdeb04 locally; original three cards compared with new additions; independent source audit agreed on artifact specificity and equal geometry |
| Shared geometry | Passed | All five supporting cards measured ~379px at 1280, 346px at 768, 331px at 375 |
| Desktop alignment | Passed with small font variation | All art 221px, title starts 364px below card top; CTA positions within each row identical; facts vary by about 3px with brand typography |
| Mobile layout | Passed | No horizontal page overflow at 375/768/1280; nav targets 44px high |
| Images | Passed | Browser reported no broken images; Dubai image reviewed in crop and labelled AI-generated concept |
| Content | Passed | Concrete Frame AC-leash draft, concise audience/stage; detailed uncertainty retained on profiles |
| Keyboard focus | Passed | Visible focus ring observed on card; whole card is a semantic link |
| Formal contrast audit | Not checked | No claim of a complete WCAG audit |
| Owner aesthetic approval | Pending | Corrected design shown for review; do not describe as owner-approved |

### Reviewer assessment (subjective, 1–5)

Hierarchy 4; typography 4; color 4 (contrast audit still open); spacing 4; components 4; responsive 4; motion 4 (minimal, existing reduced-motion support); accessibility 4 (not certification); craft 4. Main remaining limitation: the final row has two cards in the original three-column grid. Equal dimensions are preserved deliberately instead of stretching those two cards. This is not a 5/5 or a guarantee of owner approval.

## Asset provenance

`docs/media/dubai-courtyard-concept.png` was generated for this portfolio on 17 September 2026 using the built-in image tool. It is an illustrative, fictional Dubai-inspired architectural mood study, not historical documentation, game footage or an approved production asset. The Frame panel is a code-rendered illustrative concept using the owner’s AC-leash idea, not a screenshot of an executed film job.
