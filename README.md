# Guilherme Galvão — Portfolio

Static site. No build step — host the folder anywhere (GitHub Pages, Netlify, Vercel, any FTP).

> **Setting it up?** See **`SETUP.md`** for a plain, step-by-step guide to
> changing your name/photo/links, adding projects and gallery images,
> recolouring, and (optionally) connecting the shared "Your Work" backend.
> Almost everything is edited in the single file `data/projects.js`.

## Edit your content

Everything lives in **`data/projects.js`**:

- `site` — logo file, portrait photo, email, Instagram/Behance URLs
  (used by the navbar, about page and every footer). The placeholder
  mark lives at `img/logo.svg` — overwrite it or point `site.logo`
  at your own file.
- `projects[]` — title, year, category, description, image, `featured: true/false`
  (featured projects appear in the home carousel, max 6).
- `gallery[]` — src, `date: "YYYY-MM"` (drives the calendar grid), alt text,
  `size: "s" | "m" | "l"` (scale on the infinite canvas).

**Videos:** add a `video: "video/clip.mp4"` field next to any image and that
item becomes a looping video everywhere it appears (carousel, project
thumbnails, gallery canvas, grid, lightbox). The image stays as the poster.
Use short, muted H.264 loops.

All images are **picsum.photos placeholders** — replace each `image` / `src` /
`portrait` with your own paths, e.g. `img/rebus-01.jpg`.


## Language (PT / EN)

The site ships bilingual. The PT/EN toggle in the navbar switches every
interface string instantly and remembers the visitor's choice.

- All UI text lives in the `i18n` block of **`data/projects.js`**, each
  entry having an `en` and `pt` form. Edit translations there.
- `defaultLang` (top of the data file) sets the language on first visit.
- Project titles/descriptions are currently single strings shown in both
  languages. To translate one, replace its value with an object, e.g.
  `description: { en: "Generative poetry engine…", pt: "Motor de poesia generativa…" }`
  — the site resolves it automatically.

## Home hero — poster editor & "Your Work"

The hero is an interactive shape composer:
- **Shuffle** re-rolls the shapes, colours and positions.
- Each shape can be **dragged**, and when selected shows two handles to
  **rotate** (top) and **scale** (corner). Keyboard: arrows nudge, `r`
  rotates, `+/-` scale.
- **Save poster** opens a dialog to name it. The poster is saved on the
  maker's device (they see it on **Your Work**) and emailed to you so you
  can hand-pick favourites to feature.

Posters are stored as shape *data* (not images), so they stay crisp and
light and re-render at any size. The shape palette and randomiser live in
`js/poster.js`.

### "Your Work" — emails & featuring picks

See **`SETUP.md` section 6** for the full walkthrough. In short: add a free
web3forms.com key to the `backend` block in `data/projects.js` to receive an
email whenever someone saves a poster, then paste the artwork's `shapes_json`
from that email into the `curatedPosters` array to feature it for everyone.
No server or database needed. The storage layer is `GG.Store` in `js/main.js`.

## Projects page — Canvas & List

The Projects page now has two views, switched by the toggle in the header:

- **Canvas (default)** — every project is a draggable folder icon. Visitors
  can grab folders, fling them (they bounce off the edges and tilt with
  speed), and double-click / double-tap (or Enter when focused) to open one.
  Filters apply here too: hidden categories fade out and the remaining
  folders re-pack into a tidy layout.
- **List** — the original row index with the cursor-following hover preview.

Both views read from `data/projects.js` and share the category filters.

Opening a folder currently routes to the Projects list (no individual
project pages exist yet). To wire real project pages, edit `openProject()`
in `js/projects.js` — the folder's `data-slug` is passed in.

## Page transitions

Each page has its **own** transition, chosen by destination in
`js/main.js` (the `PAGES` map): Index = vertical columns, Projects =
horizontal rows, Gallery = grid tiles, About = circular iris. The big
destination name shown mid-transition is always cleared afterwards, so
it never lingers on the page.

## Colors

All colors live in one place: the `:root` block at the top of
**`css/base.css`**. Change the six palette tokens and every hairline, shadow,
scrim and gradient updates automatically (they're derived with `color-mix`).

## Scroll feel

Scrolling is handled by Lenis, configured at the top of **`js/main.js`**.
Tune the `lerp` value: higher (e.g. `0.2`) = snappier and closer to native,
lower (e.g. `0.1`) = floatier and heavier.

## Structure

```
index.html / projects.html / gallery.html / about.html
css/   base.css (tokens) · components.css (nav, footer, cursor, veil) · per-page css
js/    main.js (shared) · per-page js
data/  projects.js (all content)
```

## Run locally

Browsers block some features on `file://` — serve it instead:

```
python3 -m http.server 8000
# → http://localhost:8000
```

## Notes

- GSAP + ScrollTrigger + Flip and Lenis load from jsDelivr CDN.
- Fonts: Bricolage Grotesque (display, variable weight — powers the hero),
  Instrument Sans (body), Fragment Mono (labels) via Google Fonts.
- `prefers-reduced-motion` is respected everywhere; the site also works
  (statically) with JavaScript disabled.
