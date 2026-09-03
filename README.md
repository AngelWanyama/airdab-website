# AIRDAB Website

Static site for AIRDAB (African Initiative for Rural Development and Biodiversity),
Kasese, Uganda. Plain HTML, one CSS file, one JS file. No build step.

## Visual system

The front end implements the approved design in the **`Front End/`** reference folder
("The Humanistic Authority" - editorial, high-contrast, asymmetric 12-column grid,
tonal layering with 1px borders, generous whitespace, rounded corners, count-up
stats, image cards with gradient scrims).

The reference is dark navy + amber. It has been **re-cast into AIRDAB's brand**:

| Reference | AIRDAB |
|---|---|
| Dark navy surfaces | cream `#f2ecdd` / white / paper `#faf7f0`; deep bands use forest `#0f2f20` |
| Amber accent `#f59e0b` | forest `#173d2b` for text accents / links / italic emphasis; lime `#c4e639` for primary buttons, active states and the CTA band |
| EB Garamond + Manrope | **Fraunces + Inter** (AIRDAB's existing brand fonts), same display-serif / grotesque roles |

All tokens are CSS custom properties on `:root` in `css/styles.css` (21 numbered
sections). `js/main.js` handles the mobile nav drawer (focus trap, Esc, scroll
lock), active nav link, scroll reveal, count-up numbers, the Support Us option
selector, floating-label selects, forms → `mailto`, and the copyright year.

Header and footer markup is repeated verbatim on every page - change one, change all
seven. Keep the nav link list identical across pages.

## Pages
| File | Notes |
|---|---|
| `index.html` | Hero, who-we-are value grid, stat band, field bento, testimonial, CTA |
| `about.html` | Story, vision/mission, values grid, commitment, team, legal status |
| `our-work.html` | 8 programmes as alternating split rows, at-a-glance band, 6 services, CTA |
| `impact.html` | Impact numbers dashboard (animated), what we track, 2035 statement, stories |
| `who-we-work-with.html` | Stakeholder grid, partner logo wall, voices of impact, partner-with-us |
| `support-us.html` | Ways to support, interest form with option selector |
| `contact.html` | Office details, message form, connect |

## Content and assets

All organisational content, programmes, services, partners, testimonials, contact
details and imagery come from AIRDAB's existing project - **not** from the reference
folder. No ImpactSphere reference copy is used anywhere.


## Images

Source files stay in `assets/`. Optimised derivatives (`slug.webp` 1600w,
`slug-800.webp`, `slug.jpg` fallback; logos `name.webp`) are wired with `<picture>`
+ `srcset`. `team-allan/brenda/osbert/reagan.*` are the team portraits;
`scene-a/b/c.*` are extra scene photos derived from the `AIRDAB PHOTOS/` folder.

## Forms

Contact and support forms are front-end only. On submit they open the visitor's
email app pre-filled to **airdabuganda@gmail.com** (`js/main.js`,
`form[data-mailto]`, subject from `data-subject`). Nothing is stored or sent by
the site.
