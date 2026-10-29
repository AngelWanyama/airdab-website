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
selector, floating-label selects, the About dropdown, the contact/support form
sender (see Forms), and the copyright year.

Header and footer markup is repeated verbatim on every page - change one, change all
fourteen. The About dropdown links to `about.html`, `board.html` and `management.html`. Keep the nav link list identical across pages.

## Pages
| File | Notes |
|---|---|
| `index.html` | Hero, who-we-are value grid, stat band, field bento, testimonial, CTA |
| `about.html` | Who We Are: story, journey, vision/mission, values, commitment |
| `board.html` | Board of Directors (placeholder until member profiles are confirmed) |
| `management.html` | Management team and Organisation structure chart |
| `gallery.html` | Photo gallery: 27 photos with the supplied captions (3/2/1 columns) |
| `our-work.html` | Four core pillars (Youth Empowerment, Women's Growth, Green Tomorrow, Rural Progress) as tabs, each with its projects and captioned photos. Homepage "Learn more" links open it via `?pillar=<id>`. Draft wording for approval; `<!-- REVIEW -->` comments mark details needing confirmation. |
| `impact.html` | Impact numbers dashboard (animated), what we track, 2035 statement, stories |
| `who-we-work-with.html` | Stakeholder grid, partner logo wall, voices of impact, partner-with-us |
| `support-us.html` | Financial support note (no payments on site), ways to support, interest form, contact details |
| `contact.html` | Office details, click-to-load map, message form, connect |
| `privacy.html` | Privacy Policy (Uganda Data Protection and Privacy Act, 2019) |
| `terms.html` | Terms and Conditions |
| `cookies.html` | Cookie Policy: lists everything the site stores in the browser; keep it in sync with `js/main.js` |

The footer bottom bar on every page links to the three legal pages.

## Privacy by design

- **No third-party requests on page load.** Fonts are self-hosted in `fonts/` (Fraunces and Inter, SIL Open Font
  License, licences alongside). Do not add Google Fonts, analytics, social embeds or other trackers without
  updating `cookies.html` and adding a consent banner.
- **Google Maps (Contact)** is a placeholder until the visitor presses "Show map" (`[data-map-consent]` in `js/main.js`).
- **Only strictly necessary storage:** the `airdab-form-sends` local-storage item (form rate limit). No cookies.
  That is why the site needs no cookie banner.
- **Forms** send only what the visitor types plus a required consent checkbox (`name="consent"`); the consent
  text and value carry the Privacy Policy date. If the policy changes, update both forms.
- **`.htaccess`** redirects HTTP to HTTPS and sets basic security headers. Merge it with any existing
  `.htaccess` on the server rather than overwriting.

## Accessibility

Target: WCAG 2.2 AA. Text colours are checked for 4.5:1 contrast (3:1 for large text and form field outlines).
The hero slideshow and the Our Impact stories carousel have pause buttons and do not autoplay when the visitor
prefers reduced motion. Links that open a new tab say so to screen readers (`.sr-only` text or `aria-label`).
The faint decorative numbers on Services (`.split-row__ghost`, `aria-hidden`) are exempt as pure decoration.

## Content and assets

All organizational content, programs, services, partners, testimonials, contact
details and imagery come from AIRDAB's existing project - **not** from the reference
folder. No ImpactSphere reference copy is used anywhere.


## Images

Source files stay in `assets/`. Optimised derivatives (`slug.webp` 1600w,
`slug-800.webp`, `slug.jpg` fallback; logos `name.webp`) are wired with `<picture>`
+ `srcset`. Gallery photos are in `assets/gallery/` (`photo-NN.jpg` 1600w + `photo-NN-800.jpg`), resized from the
local-only `assets/Airdab_website_photos/`; captions come verbatim from its `photo_captions.csv`.
Team portraits are in `assets/team/` (600px JPGs resized from `assets/Team Photos/`;
Osbert uses `team-osbert.jpg` because the newer PNGs have a checkerboard baked in).
Partner logos added in 2026 are in `assets/partners/`. The org chart is
`assets/org-structure.jpg` (from `Airdab Organisation structure.png`, linked at full size);
`scene-a/b/c.*` are extra scene photos derived from the `AIRDAB PHOTOS/` folder.

## Forms

The Contact and Support Us forms (`form[data-form]`) share one handler in
`js/main.js`. It validates name, email, phone and message with inline messages,
then POSTs the message to **FormSubmit** (`https://formsubmit.co/ajax/airdabuganda@gmail.com`),
which emails it to **airdabuganda@gmail.com** with the visitor's address as Reply-To.
No API key or password is involved.

Spam and abuse protection: hidden honeypot field (`_honey`), a minimum fill time,
a per-browser limit of 3 sends per 10 minutes, length limits, and a lock against
double submission. On failure the visitor sees an error with the email address.

**One-time activation (required):** the first submission sends an "Activate Form"
email to airdabuganda@gmail.com. Messages are only delivered after someone clicks
that button. FormSubmit then offers a random alias string; you can replace the
address in `FORM_ENDPOINT` in `js/main.js` with it to keep the inbox address out
of the page source.
