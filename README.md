# Guilherme Galvão — Portfolio

Static site. No build step — hosted on **GitHub Pages** from the root of
`main` (push and it deploys to
`https://joao-galvao18.github.io/WebsitePortfolio/`).

> **Editing the site?** See **`SETUP.md`** for the plain, step-by-step guide:
> switching images, adding projects and their photo galleries, receiving
> visitors' posters by email and featuring your picks. Almost everything is
> edited in the single file **`data/projects.js`**.

## Pages

- **Index** — interactive shape-poster hero (drag / rotate / scale, click
  empty space to shuffle, idle auto-shuffle) with the typeface-roulette
  "Portfolio" wordmark, plus the featured-work carousel.
- **Projects** — two views: a draggable folder canvas (double-click to open)
  and a row list with hover previews. Filters and PT/EN labels are generated
  from the data file.
- **Project** (`project.html?slug=…`) — one project's page: cover, meta,
  description and an optional media gallery that adapts to any number of
  images/videos (`media` array in the data file).
- **Gallery** — photography on an infinite drag canvas or a calendar grid.
- **About** — bio, services, contact.
- **Your Work** — visitor-made posters: your curated picks (from
  `curatedPosters`) shown to everyone, plus the visitor's own local saves.

## "Your Work" pipeline

Saving a poster stores it on the maker's device **and** emails it to
`site.email` via the free formsubmit.co service (first email asks you to
click one activation link). The email contains a ready-to-paste
`curatedPosters` entry — paste it into `data/projects.js` to feature that
poster for everyone. No server, no database, no keys. The storage layer
is `GG.Store` in `js/main.js`.

## Structure

```
index.html · projects.html · project.html · gallery.html · about.html · work.html
css/   base.css (design tokens + themes) · components.css (nav, footer, cursor, veil) · per-page css
js/    main.js (shared: theme, i18n, store, transitions, cursor) · poster.js (shape engine) · per-page js
data/  projects.js (ALL content — see SETUP.md)
img/   your images (placeholders are picsum.photos URLs until replaced)
```

## Notes

- Light/dark theme (toggle in the nav, remembered), PT/EN i18n (all strings
  in the data file), `prefers-reduced-motion` respected everywhere.
- GSAP + ScrollTrigger + Flip and Lenis load from the jsDelivr CDN. Fonts via
  Google Fonts (Bricolage Grotesque, Instrument Sans, Fragment Mono — plus
  Fraunces and Syne for the wordmark roulette).
- Page transitions are one unified veil built from the site's own shape
  language (`js/main.js`).
- Colours: four palette tokens + theme surfaces at the top of `css/base.css`;
  everything else is derived.
- Scroll feel: tune the Lenis `lerp` at the top of `js/main.js`.

## Run locally

```bash
python3 -m http.server 8000
# → http://localhost:8000
```
