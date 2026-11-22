# Reference study

Studied live in a real Chrome session (Apple GPU) on 2026-11-23. Notes record what each site does well so the principle can be reinterpreted. Nothing here is copied: layouts, graphics, animation and branding are not reused.

| # | Site | Studied |
|---|------|---------|
| 1 | https://bruno-simon.com/ | Yes |
| 2 | https://locomotive.ca/en | **No.** Cloudflare bot check blocked the page. I did not bypass it. |
| 3 | https://www.resn.co.nz/ | Yes |
| 4 | https://activetheory.net/ | Yes |
| 5 | https://www.awwwards.com/websites/portfolio/ | Yes (gallery of current portfolio winners) |
| 6 | https://lusion.co/ | Yes |
| 7 | https://rauno.me/ | Yes |

## What each one taught

**Bruno Simon.** The intro is a single glowing ring on a dark grid: one object, no text, and the loading state *is* the first impression. The 3D world is the navigation. Lesson: the preloader and the first scene can be the same idea; restraint in the first frame reads as confidence. Risk to avoid: it needs a click to start, which costs accessibility and time.

**Resn.** Near-black field with a single faceted, sculptural object lit by a few hard edge highlights and a faint chromatic fringe. Most of the object is *in shadow*. Lesson: low-key lighting. Showing 20% of a form makes it look expensive. Also a minimal line-and-glyph preloader.

**Active Theory.** Dark teal atmosphere, one glass/metal emblem, thin pill navigation top-right with only two items (Work, Contact), tiny tracked "Scroll down" hint, soft depth-of-field particles. Lesson: navigation can be almost nothing; atmosphere comes from depth and a gradient of light, not from lots of objects.

**Lusion.** Light lavender-white canvas, very large grotesque headings, rounded media tiles with small uppercase metadata under each (category lists), compact pill buttons ("Let's talk", "Menu"). Lesson: a *light* immersive studio site is credible; image-led project tiles with tiny structured metadata give hierarchy without cards-with-borders. Risk to avoid: oversized type (explicitly not wanted here).

**Rauno Freiberg.** Warm grey page, tightly set neutral sans, an indented ragged-left text block, one flat yellow circle as the only colour. Lesson: typography-led design with a single restrained accent; hierarchy through indentation and measure, not size or weight.

**Awwwards portfolio gallery.** Across the current winners: large cropped photography or 3D renders as the primary content, name/role set small, heavy use of serif display next to grotesque body, asymmetric grids with deliberate empty space, few colours per site. Lesson: the winning portfolios are image-first and calm; the "cool" is in material and composition rather than in effects.

## Principles carried into the two concepts

1. Low-key, physically plausible lighting; show part of the object, not all of it (Resn, Active Theory).
2. One hero object with real materials, not a field of particles (Bruno, Resn).
3. Navigation reduced to a few small words (Active Theory, Lusion).
4. Small structured metadata instead of large copy or cards (Lusion, Rauno).
5. A single restrained accent colour (Rauno).
6. Type does the work through measure, indentation and contrast of serif vs sans, not through size (Rauno, Awwwards).
7. The preloader is part of the identity, and short.

## Original ideas for this site (not found in the references)

- **Concept A, "Strata":** system boundaries as a stack of translucent glass panes with machined frames; one line of light passes through them.
- **Concept B, "Gate":** a corridor of machined-metal checkpoints; a light packet travels through and each gate reacts as it passes.

## Hero redesign: Lusion header study (real Chrome, viewport 1710×985, DPR 2)

Measured from the live site, then matched on this portfolio (header geometry agrees within a few pixels):

| Element | lusion.co | This site |
|---|---|---|
| Logo left / top | 86 / 60 px | 86 / 60 px |
| Pill row top, height | 50 px, 48 px | 50 px, 48 px |
| Round control | 48 px circle at x 1288 | 48 px circle at x 1285 |
| LET'S TALK pill | 143 × 48 px | 142 × 48 px |
| MENU right edge | 1625 px | 1624 px |
| Scroll track | 6 × 197 px, vertically centred | 6 × 197 px, vertically centred |

**Honest limitation:** at `scrollY = 0` the live lusion.co currently shows a light hero with blue and black jointed shapes, not the astronaut "STEP INTO A NEW WORLD" composition in the supplied screenshot. That screenshot was used as the primary visual specification; the live site was used for the measurable parts (header, buttons, scroll track). The 3D object, headline, colours and content are original.
