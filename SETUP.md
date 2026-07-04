# Setup & editing guide

Almost everything you'll want to change lives in **one file**: `data/projects.js`.
It's plain JavaScript — edit the values between the quotes and save.
No build step, no tools. (To preview locally, see the bottom of this file.)

---

## 1. Your details (name, email, socials, logo, portrait)

Near the top of `data/projects.js`, find the **`site`** block:

```js
site: {
  logo:      "img/logo.svg",             // your logo file
  portrait:  "img/portrait.jpg",         // your photo (About page)
  email:     "joaogcosta11@gmail.com",   // footer + About + receives saved posters
  cv:        "cv.pdf",                   // the nav CV button downloads this file
  instagram: "https://instagram.com/you",
  behance:   "https://behance.net/you",
},
```

Change these and they update the navbar, footer and About page everywhere.

**Your CV:** the nav has a CV button (next to the theme toggle) that downloads
a PDF. Overwrite the placeholder **`cv.pdf`** in the site root with your real
CV (keep the name), or point `site.cv` at a different file.

---

## 2. Switching images

Every image in the site is currently a **picsum.photos placeholder**.
To use your own:

1. Drop your files into the **`img/`** folder (and videos into a `video/` folder).
2. In `data/projects.js`, replace the placeholder URL with your path:

   ```js
   image: "https://picsum.photos/seed/gg-rebus/1280/920"   // before
   image: "img/rebus-cover.jpg"                            // after
   ```

That's it — the same path change works for `image`, `src` (gallery),
`portrait` and `logo`.

**Videos:** add a `video` field next to any `image` and that item plays as a
muted loop (the image becomes the poster frame). Use short, compressed `.mp4`:

```js
image: "img/rebus-poster.jpg",
video: "video/rebus-loop.mp4",
```

---

## 3. Adding / editing projects

Find the **`projects`** array in `data/projects.js`. Each project is one block:

```js
{
  slug: "rebus",                 // short id — becomes the page URL (?slug=rebus)
  title: "Rebus",
  year: "2025",
  category: "Generative",        // filters are generated from these — keep spelling consistent
  description: "Generative poetry engine…",
  image: "img/rebus-cover.jpg",  // the COVER: thumbnail, carousel + top of the project page
  featured: true,                // true = shows in the home carousel (max 6)
  media: [                       // OPTIONAL — extra pictures/videos on the project page
    { image: "img/rebus-01.jpg" },
    { image: "img/rebus-02.jpg", caption: "Weight tests" },
    { image: "img/rebus-poster.jpg", video: "video/rebus-loop.mp4" },
  ],
},
```

- To **add** a project: copy a block, paste it, change the values.
- To **remove** one: delete its block.
- To **reorder**: cut/paste blocks — the order here is the order on the page.

### The `media` gallery

`media` is the picture gallery under the description on a project's own page.
Use **any number of items** — the layout adapts automatically (items flow
full-width → half → half → full-width…, and a leftover half stretches so the
grid always ends cleanly). Leave `media` out entirely for a single-image page.
`caption` is optional; use `caption: { en: "…", pt: "…" }` to translate it.

---

## 4. Gallery page

Find the **`gallery`** array. Each item:

```js
{ src: "img/photo-01.jpg", date: "2025-06", alt: "Short description", size: "m" },
```

- `date` is `"YYYY-MM"` and drives the calendar (Grid) view grouping.
- `size` is `"s" | "m" | "l"` — how big it sits on the infinite canvas.
- `alt` is the caption + accessibility text.

---

## 5. "Your Work" — get posters by email, feature the ones you like

When a visitor saves a poster on the home page, two things happen:

1. It's stored **on their own device** — so *they* always see their own
   work on the Your Work page.
2. It's **emailed to you automatically** — to the `email` in the `site`
   block — via the free formsubmit.co service. No key, no account,
   no server.

The Your Work page shows **your featured picks first** (labelled
"Featured", or with the maker's name if you credit them), followed by
whatever the current visitor has made on their own device.

### Step 1 — activate the emails (one click, first time only)

The very first poster saved on the site makes **formsubmit.co** send you
a single "please activate" email. Open it and click the confirmation
link — done. Every poster saved after that arrives in your inbox with
the subject `New poster: "…"`.

(If you ever change `site.email`, the new address gets its own one-time
activation email the same way.)

### Step 2 — feature a poster you liked

Each email contains a line called **`paste_into_curatedPosters`**.
Copy that whole line and paste it inside the `curatedPosters: [ ]`
brackets in `data/projects.js`:

```js
curatedPosters: [
  { name: "Sunrise", date: "2026-05", ratio: "16:9", shapes: [ … ] },
],
```

- Add `author: "Their Name"` inside the entry to credit the maker.
- Delete the line to unfeature it.
- Commit + push (or re-upload) and it's live for everyone.

---

## 6. Colours, shapes & language

- **Colours** live at the top of `css/base.css` (`--black --orange --blue
  --grey` plus the light/dark surfaces). Change a hex there and the whole
  site — shapes, posters, transitions, accents — updates.
- **Shapes** used by the hero/poster editor are the `SHAPES` list in
  `js/poster.js`. Remove one to simplify, or add one (also add a matching
  `case` in `shapeSVG` there, and in `drawShape` + `clipShapeEl` in
  `js/home.js`).
- **Language**: `defaultLang: "en"` sets the first-visit language; visitors
  switch with the EN/PT toggle. All interface text is in the `i18n` block.
  Any project `description` or media `caption` can be translated by
  replacing the string with `{ en: "…", pt: "…" }`.

---

## Previewing locally & publishing

Browsers block some features on `file://`, so serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

The site is published with **GitHub Pages** from the root of the `main`
branch — commit and push, and it deploys automatically to
`https://joao-galvao18.github.io/WebsitePortfolio/` in about a minute.
