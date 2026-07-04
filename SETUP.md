# Setup & editing guide

Everything you'll want to change lives in **one file**: `data/projects.js`.
It's plain JavaScript — just edit the values between the quotes and save.
No build step, no tools. Open the site by running a local server (see bottom).

---

## 1. Your details (name, email, socials, logo, portrait)

Near the top of `data/projects.js`, find the **`site`** block:

```js
site: {
  logo:      "img/logo.svg",                 // your logo file
  portrait:  "img/portrait.jpg",             // your photo (About page)
  email:     "hello@guilhermegalvao.pt",     // used in footer + About
  instagram: "https://instagram.com/you",
  behance:   "https://behance.net/you",
},
```

Change these and they update the navbar, footer and About page everywhere.

---

## 2. Projects

Find the **`projects`** array. Each project is one block:

```js
{
  slug: "rebus",                 // short id (letters/dashes, no spaces)
  title: "Rebus",
  year: "2025",
  category: "Generative",        // must match one of the filter categories
  description: "Generative poetry engine…",
  image: "img/rebus.jpg",        // replace the picsum placeholder
  featured: true,                // true = shows in the home carousel (max 6)
},
```

- To **add** a project: copy a block, paste it, change the values.
- To **remove** one: delete its block.
- To reorder: cut/paste blocks — the order here is the order on the page.
- **Categories**: the filters are generated automatically from whatever
  `category` values you use, so just be consistent with spelling.

### Videos instead of images
Add a `video` field next to `image` and the item plays a muted loop
(the image becomes the poster). Use short, compressed `.mp4` files:

```js
image: "img/rebus-poster.jpg",
video: "video/rebus-loop.mp4",
```

---

## 3. Gallery

Find the **`gallery`** array. Each item:

```js
{ src: "img/photo-01.jpg", date: "2025-06", alt: "Short description", size: "m" },
```

- `date` is `"YYYY-MM"` and drives the calendar (Grid) view grouping.
- `size` is `"s" | "m" | "l"` — how big it sits on the infinite canvas.
- `alt` is the caption + accessibility text.

---

## 4. Colours & shapes

- **Colours** live in `css/base.css` at the top (`--black --orange --blue
  --grey` plus the neutrals). Change a hex there and the whole site — shapes,
  posters, transitions, accents — updates. Keep them in sync with the same
  four names in `js/poster.js` if you rename them.
- **Shapes** used by the hero/poster editor are the `SHAPES` list in
  `js/poster.js`. Remove one to simplify, or add one (also add a matching
  `case` in `shapeSVG` there and in `drawShape` in `js/home.js`).

---

## 5. Language

- `defaultLang: "en"` (top of `data/projects.js`) sets the first-visit
  language. Visitors switch with the EN / PT toggle; their choice is saved.
- All interface text is in the `i18n` block. Each entry has `en` and `pt`.
- To translate a **project description**, replace the string with an object:
  `description: { en: "…", pt: "…" }` — the site resolves it automatically.

---

## 6. "Your Work" — receiving posters & featuring your picks

When someone saves a poster, two things happen:

1. It's saved **on their own device**, so *they* see it under Your Work.
2. It's **emailed to you** (if you set up the key below), so you can
   hand-pick the best ones to feature for everyone.

The Your Work page shows your **featured picks** first, then whatever the
current visitor has made on their own device.

### Get the emails (one-time, free, no account)

1. Go to **web3forms.com**, enter your email, and copy the **Access Key**
   they give you.
2. Paste it into the **`backend`** block at the top of `data/projects.js`:

   ```js
   backend: {
     web3formsKey: "your-access-key-here",
   },
   ```

That's it. From now on, every save sends you an email titled
`New poster: "..."`. Leave the key blank to skip emailing (posters still
save on the maker's device).

### Featuring a poster you liked

Each email contains a **`shapes_json`** value — a line of JSON describing the
artwork. To publish it on the Your Work page, add an entry to the
**`curatedPosters`** array in `data/projects.js`:

```js
curatedPosters: [
  {
    name: "Sunrise",              // the poster's name
    author: "Ana",                // optional — shown on the card
    date: "2026-05",              // optional
    shapes: [ ...paste shapes_json here... ],   // the JSON from the email
  },
],
```

Paste the `shapes_json` value as the `shapes` array (it's already valid
JSON), save the file, and it appears for everyone. Remove the entry to
unfeature it. The whole storage layer is the small `GG.Store` object in
`js/main.js` if you ever want to change how saving works.

---

## Running the site locally

Browsers block some features on `file://`, so serve the folder:

```bash
cd portfolio
python3 -m http.server 8000
# then open http://localhost:8000
```

To publish, upload the whole `portfolio` folder to any static host
(GitHub Pages, Netlify, Vercel, or plain FTP).
