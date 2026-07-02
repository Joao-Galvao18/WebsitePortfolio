/* ============================================================
   MAIN — shared behaviour for every page
   Lenis smooth scroll · page transition veil · custom cursor
   nav state + mobile menu · scroll reveals · footer clock
   ============================================================ */

(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  // Small shared namespace for page scripts
  window.GG = {
    reduced,
    finePointer,
    lenis: null,
    clamp: (v, a, b) => Math.min(b, Math.max(a, v)),
    lerp: (a, b, t) => a + (b - a) * t,
  };

  /* ============================================================
     Theme — light / dark
     · GG.theme            "light" | "dark"
     · GG.setTheme(t)      switch and remember
     ============================================================ */
  (function () {
    const stored = localStorage.getItem("gg-theme");
    // default: stored choice, else the OS preference, else light
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    let theme = stored || (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
    GG.theme = theme;

    GG.setTheme = (t) => {
      theme = t;
      GG.theme = t;
      document.documentElement.setAttribute("data-theme", t);
      localStorage.setItem("gg-theme", t);
      document.querySelectorAll(".theme-toggle").forEach((b) => {
        b.setAttribute("aria-pressed", String(t === "dark"));
        b.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
      });
    };

    // wire buttons after DOM is ready
    const wire = () => {
      document.querySelectorAll(".theme-toggle").forEach((b) => {
        b.setAttribute("aria-pressed", String(theme === "dark"));
        b.addEventListener("click", () => GG.setTheme(GG.theme === "dark" ? "light" : "dark"));
      });
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
    else wire();
  })();

  /* ============================================================
     i18n — PT / EN
     · GG.lang            current language ("en" | "pt")
     · GG.t(key)          translate a dictionary key
     · GG.pick(value)     resolve a string OR { en, pt } object
     · GG.onLang(fn)      run fn whenever the language changes
     ============================================================ */
  const DICT = (window.PORTFOLIO && PORTFOLIO.i18n) || {};
  const DEFAULT_LANG = (window.PORTFOLIO && PORTFOLIO.defaultLang) || "en";
  let lang = localStorage.getItem("gg-lang") || DEFAULT_LANG;
  const langCallbacks = [];

  GG.lang = lang;
  GG.t = (key) => {
    const e = DICT[key];
    if (!e) return key;
    return e[lang] || e.en || key;
  };
  GG.pick = (val) => {
    if (val && typeof val === "object" && ("en" in val || "pt" in val)) {
      return val[lang] || val.en || val.pt || "";
    }
    return val;
  };
  GG.onLang = (fn) => {
    langCallbacks.push(fn);
  };

  /* Position the sliding underline under the active toggle button.
     Call after changing aria-pressed, and on resize. */
  GG.positionTogglePill = (toggle) => {
    if (!toggle) return;
    const active = toggle.querySelector('.toggle-btn[aria-pressed="true"]');
    const pill = toggle.querySelector(".toggle-pill");
    if (!active || !pill) return;
    const tr = toggle.getBoundingClientRect();
    const ar = active.getBoundingClientRect();
    toggle.style.setProperty("--pill-w", ar.width + "px");
    toggle.style.setProperty("--pill-x", (ar.left - tr.left) + "px");
  };

  /* ============================================================
     Profanity filter — used before publishing a poster name.
     Normalises leetspeak/spacing, then matches a blocklist as
     whole words (so "class", "assess", "Scunthorpe" pass).
     Edit BLOCK below to tune. Covers common EN + PT terms.
     ============================================================ */
  const BLOCK = [
    // EN
    "fuck","shit","bitch","cunt","asshole","dick","pussy","bastard","slut","whore",
    "nigger","nigga","faggot","fag","retard","rape","cum","cock","wank","twat","prick",
    // PT
    "merda","caralho","foda","foder","puta","cabrao","cabrão","corno","piça","pica",
    "buceta","cona","paneleiro","porra","punheta","viado","xochota","crlh",
  ];
  const LEET = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s", "!": "i" };

  function normalize(str) {
    return String(str)
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // strip accents
      .replace(/[013457@$!]/g, (c) => LEET[c] || c)
      .replace(/[^a-z\s]/g, " ")        // drop punctuation/symbols
      .replace(/(.)\1{2,}/g, "$1$1")     // collapse looong repeats
      .replace(/\s+/g, " ")
      .trim();
  }

  GG.hasProfanity = (str) => {
    const norm = normalize(str);
    const words = norm.split(" ");
    const collapsed = norm.replace(/\s/g, ""); // catch spaced-out words
    return BLOCK.some((bad) => words.includes(bad) || collapsed.includes(bad));
  };

  /* ============================================================
     Store — "Your Work" posters.
     · save(poster): stores it on THIS device (so the maker sees it)
       AND, if an email form key is configured, emails it to the site
       owner via Web3Forms so they can hand-pick it into the curated
       list later. No database, no server.
     · list(): returns the owner's CURATED posters (from the data
       file) first, then the posters made on this device.
     ============================================================ */
  (function () {
    const cfg = (window.PORTFOLIO && PORTFOLIO.backend) || {};
    const emailKey = cfg.web3formsKey || "";
    const LS_KEY = "gg-posters";
    const curated = (window.PORTFOLIO && PORTFOLIO.curatedPosters) || [];

    // email the artwork to the owner (best-effort; never blocks the save)
    async function emailOwner(poster) {
      if (!emailKey) return;
      try {
        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: emailKey,
            subject: `New poster: "${poster.name}"`,
            from_name: "Your Work — poster maker",
            name: poster.name,
            // the shapes JSON is what you paste into curatedPosters to publish it
            shapes_json: JSON.stringify(poster.shapes),
            ratio: poster.ratio || "16:9",
            made_at: new Date().toISOString(),
          }),
        });
      } catch (e) { /* offline / blocked — the local save still succeeded */ }
    }

    function saveLocal(poster) {
      const all = listLocal();
      all.unshift({
        id: "p" + Date.now(),
        name: poster.name,
        shapes: poster.shapes,
        ratio: poster.ratio || "16:9",
        created_at: new Date().toISOString(),
        mine: true,
      });
      try { localStorage.setItem(LS_KEY, JSON.stringify(all.slice(0, 200))); } catch (e) {}
    }
    function listLocal() {
      try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
      catch (e) { return []; }
    }

    GG.Store = {
      hasEmail: !!emailKey,
      async save(poster) {
        saveLocal(poster);        // maker always sees their own work
        await emailOwner(poster); // owner gets it to hand-pick (if configured)
        return poster;
      },
      list() {
        // curated first (marked so we can label them), then this device's
        const cur = curated.map((p, i) => ({
          id: "curated-" + i,
          name: p.name,
          shapes: p.shapes,
          ratio: p.ratio || "16:9",
          created_at: p.date || null,
          author: p.author || null,
          curated: true,
        }));
        return Promise.resolve([...cur, ...listLocal()]);
      },
    };
  })();

  // Apply translations to any element carrying data-i18n / data-i18n-html
  function applyStaticI18n() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = GG.t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      // pipe "|" becomes a line break (used in footer CTA)
      el.innerHTML = GG.t(el.dataset.i18nHtml).replace(/\|/g, "<br>");
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = GG.t(el.dataset.i18nPlaceholder);
    });
  }

  function setLang(next) {
    if (next === lang) return;
    lang = next;
    GG.lang = lang;
    localStorage.setItem("gg-lang", lang);
    applyStaticI18n();
    syncLangToggle();
    langCallbacks.forEach((fn) => fn(lang));
  }
  GG.setLang = setLang;

  function syncLangToggle() {
    document.querySelectorAll(".lang-toggle").forEach((tg) => {
      tg.dataset.lang = lang;
      tg.querySelectorAll(".lang-opt").forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.lang === lang))
      );
    });
  }

  // Wire toggles + first paint of static strings
  document.querySelectorAll(".lang-toggle").forEach((tg) => {
    tg.addEventListener("click", (e) => {
      const b = e.target.closest(".lang-opt");
      if (b) setLang(b.dataset.lang);
    });
  });
  applyStaticI18n();
  syncLangToggle();

  /* ---------- GSAP setup ---------- */
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (window.gsap && window.Flip) gsap.registerPlugin(Flip);

  /* ---------- Lenis smooth scroll ----------
     SCROLL FEEL — tune `lerp`: higher = snappier, lower = floatier.
     0.2 feels almost native, 0.08 feels heavy. */
  if (!reduced && window.Lenis) {
    const lenis = new Lenis({
      lerp: 0.16,
      wheelMultiplier: 1.2,
      smoothWheel: true,
      syncTouch: false, // native touch scrolling on mobile (no added latency)
    });
    GG.lenis = lenis;

    if (window.gsap) {
      // Drive Lenis from GSAP's ticker — one shared loop, no rAF contention
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
  }

  /* ---------- Media helper ----------
     Renders an <img>, or a looping <video> when the data item has a
     `video` field (the image becomes the poster). Used by every page. */
  GG.media = function (item, opts = {}) {
    const { className = "", alt = "", attrs = "" } = opts;
    const src = item.image || item.src;
    if (item.video) {
      return `<video class="${className}" src="${item.video}" poster="${src}" autoplay muted loop playsinline preload="metadata" ${attrs}></video>`;
    }
    return `<img class="${className}" src="${src}" alt="${alt}" ${attrs}>`;
  };

  /* ---------- Site-wide social links from data/projects.js ---------- */
  const site = window.PORTFOLIO && PORTFOLIO.site;
  if (site) {
    document.querySelectorAll("[data-social]").forEach((a) => {
      const key = a.dataset.social;
      if (key === "email" && site.email) a.href = "mailto:" + site.email;
      else if (site[key]) a.href = site[key];
    });
  }

  /* ---------- Page transition veil ----------
     One unified transition built from the site's shapes: a solid
     panel with a scatter of shapes that fly in (leaving) and out
     (arriving), the destination name riding in the middle. The
     shapes + colours come straight from the Poster engine, so the
     whole site shares one visual language. */
  const veil = document.querySelector(".veil");
  const PAGES = {
    "index.html":    { key: "nav.index" },
    "projects.html": { key: "nav.projects" },
    "project.html":  { key: "nav.projects" },
    "gallery.html":  { key: "nav.gallery" },
    "about.html":    { key: "nav.about" },
    "work.html":     { key: "nav.work" },
  };
  const currentPage = location.pathname.split("/").pop() || "index.html";

  // Build the veil markup: a panel, a shape layer, and the label.
  // Build the veil shapes from a given composition (or a fresh random one).
  // Returns { els, poster } so the leave + next-page arrive can share it.
  function buildVeil(poster) {
    if (!veil) return { els: [], poster: [] };
    // Reuse a carried composition exactly (so leave→arrive line up), else
    // generate a fresh non-overlapping, fully-visible scatter.
    const shapes = poster || layoutVeilShapes(13);
    const svgs = shapes.map((s) => {
      // _v* fields come from layoutVeilShapes; fall back for any old data.
      const size = s._vsize != null ? s._vsize : 60 + s.size * 380; // px
      const left = (s._vx != null ? s._vx : s.x) * 100;
      const top  = (s._vy != null ? s._vy : s.y) * 100;
      const inner = window.Poster ? window.Poster.shapeSVG(
        { ...s, x: 0.5, y: 0.5, size: 0.42 }, 100, 100
      ) : "";
      return `<span class="veil-shape" style="left:${left}%;top:${top}%;width:${size}px;height:${size}px">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${inner}</svg></span>`;
    }).join("");
    veil.innerHTML =
      '<div class="veil-panel-bg"></div>' +
      `<div class="veil-shapes">${svgs}</div>` +
      '<div class="veil-label" aria-hidden="true"><span></span></div>';
    return { els: [...veil.querySelectorAll(".veil-shape")], poster: shapes };
  }

  // Scatter shapes for the transition: big, but always fully inside the
  // viewport (a margin keeps them off the edges → never clipped at corners)
  // and never touching (a gap separates them; a crowded shape shrinks to fit).
  function layoutVeilShapes(count) {
    const vrand = (a, b) => a + Math.random() * (b - a);
    const base = window.Poster ? window.Poster.random(count) : [];
    const W = window.innerWidth || 1280;
    const H = window.innerHeight || 800;
    const minDim = Math.min(W, H);
    const margin = Math.max(18, minDim * 0.035);
    const gap    = Math.max(12, minDim * 0.025);
    const floor  = 0.07 * minDim;
    const placed = [];
    base.forEach((s) => {
      let size = vrand(0.16, 0.30) * minDim;   // bigger than the old 60–150px
      let spot = null;
      while (!spot && size >= floor) {
        const r = size / 2;
        const minX = margin + r, maxX = W - margin - r;
        const minY = margin + r, maxY = H - margin - r;
        if (maxX > minX && maxY > minY) {
          for (let t = 0; t < 60; t++) {
            const cx = vrand(minX, maxX), cy = vrand(minY, maxY);
            if (placed.every((o) => Math.hypot(o.cx - cx, o.cy - cy) >= o.r + r + gap)) {
              spot = { cx, cy, r }; break;
            }
          }
        }
        if (!spot) size *= 0.85;   // too crowded — shrink and retry
      }
      if (!spot) return;           // couldn't fit even at the floor (rare)
      placed.push(spot);
      s._vx = spot.cx / W;
      s._vy = spot.cy / H;
      s._vsize = size;
    });
    return base.filter((s) => s._vsize != null);
  }

  // Hand-off store so the SAME shapes that flew in on leave fly out on arrive
  const TKEY = "gg-transition-poster";
  function stashPoster(poster) {
    try { sessionStorage.setItem(TKEY, JSON.stringify(poster)); } catch (e) {}
  }
  function takePoster() {
    try {
      const raw = sessionStorage.getItem(TKEY);
      sessionStorage.removeItem(TKEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function clearLabel() {
    const label = veil && veil.querySelector(".veil-label");
    if (!label) return;
    gsap.set(label, { autoAlpha: 0 });
    const span = label.querySelector("span");
    if (span) span.textContent = "";
  }

  // INTRO — arriving. The veil is covering the screen from first paint
  // (CSS .veil-boot). We rebuild it with shapes, snap everything to the
  // "covering" state, THEN animate it away. Reuses the composition the
  // previous page flew in with so there's no jump/reset.
  function revealPage() {
    if (!veil) return;
    if (reduced || !window.gsap) {
      if (veil) veil.style.display = "none";
      return;
    }
    const cfg = PAGES[currentPage] || PAGES["index.html"];
    const carried = takePoster();
    const { els: shapeEls } = buildVeil(carried);
    veil.style.pointerEvents = "none";

    const label = veil.querySelector(".veil-label span");
    const labelWrap = veil.querySelector(".veil-label");
    label.textContent = GG.t(cfg.key);

    // Snap to the fully-covering state BEFORE the browser paints, so there's
    // never a flash of the page underneath or of shapes "already placed".
    gsap.set(".veil-panel-bg", { yPercent: 0 });
    gsap.set(shapeEls, { scale: 1, autoAlpha: 1, rotate: 0 });
    gsap.set(labelWrap, { autoAlpha: 1 });
    gsap.set(label, { yPercent: 0, autoAlpha: 1 });

    const tl = gsap.timeline({ onComplete: clearLabel });
    tl.to(label, { yPercent: -130, autoAlpha: 0, duration: 0.5, ease: "power3.in", delay: 0.4 })
      .to(shapeEls, {
        scale: 0, rotate: (i) => (i % 2 ? 120 : -120), autoAlpha: 0,
        duration: 0.55, ease: "back.in(1.4)", stagger: { each: 0.035, from: "random" },
      }, "-=0.35")
      .to(".veil-panel-bg", { yPercent: -100, duration: 0.7, ease: "expo.inOut" }, "-=0.2");
  }

  // OUTRO — leaving. Panel slides up to cover, shapes pop in, label rises,
  // then navigate. The composition is stashed for the next page to continue.
  function leaveTo(href) {
    const dest = href.split("/").pop() || "index.html";
    const cfg = PAGES[dest] || PAGES["index.html"];
    const { els: shapeEls, poster } = buildVeil();
    stashPoster(poster);
    veil.style.pointerEvents = "auto";

    const label = veil.querySelector(".veil-label span");
    const labelWrap = veil.querySelector(".veil-label");
    label.textContent = GG.t(cfg.key);
    gsap.set(labelWrap, { autoAlpha: 1 });

    const tl = gsap.timeline({ onComplete: () => (window.location.href = href) });
    tl.set(".veil-panel-bg", { yPercent: 100 })
      .set(shapeEls, { scale: 0, autoAlpha: 0 })
      .set(label, { yPercent: 130, autoAlpha: 0 })
      .to(".veil-panel-bg", { yPercent: 0, duration: 0.55, ease: "expo.inOut" })
      .to(shapeEls, {
        scale: 1, rotate: 0, autoAlpha: 1,
        duration: 0.5, ease: "back.out(1.5)", stagger: { each: 0.03, from: "random" },
      }, "-=0.25")
      .to(label, { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" }, "-=0.3")
      .to({}, { duration: 0.12 });
  }

  // Restore correctly when coming back via bfcache
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) revealPage();
  });
  // Run as early as possible so the covering veil animates away without a flash
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", revealPage);
  } else {
    revealPage();
  }

  // Intercept internal links
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented) return;
    const href = a.getAttribute("href");
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      a.target === "_blank"
    )
      return;
    if (reduced || !veil || !window.gsap) return; // plain navigation
    e.preventDefault();
    document.body.classList.remove("menu-open");
    leaveTo(href);
  });

  /* ---------- Scroll-aware navbar ----------
     Compacts (shrinks) once the user scrolls past the hero / a small
     threshold. Uses Lenis scroll if present, else native scroll. */
  const nav = document.querySelector(".site-nav");
  if (nav) {
    const THRESH = Math.min(window.innerHeight * 0.6, 480);
    let compact = false;
    const setCompact = (y) => {
      const next = y > THRESH;
      if (next !== compact) {
        compact = next;
        nav.classList.toggle("is-compact", compact);
      }
    };
    if (GG.lenis) {
      GG.lenis.on("scroll", ({ scroll }) => setCompact(scroll));
    } else {
      window.addEventListener("scroll", () => setCompact(window.scrollY), { passive: true });
    }
    setCompact(window.scrollY || 0);
  }

  /* ---------- Nav: current page + mobile menu ---------- */
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .nav-menu a.menu-link").forEach((a) => {
    const target = a.getAttribute("href");
    if (target === path) a.setAttribute("aria-current", "page");
  });

  const burger = document.querySelector(".nav-burger");
  const navMenu = document.querySelector(".nav-menu");
  function closeMenu() {
    if (!document.body.classList.contains("menu-open")) return;
    document.body.classList.remove("menu-open");
    if (burger) {
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Open menu");
    }
    if (GG.lenis) GG.lenis.start();
  }
  if (burger) {
    burger.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (GG.lenis) open ? GG.lenis.stop() : GG.lenis.start();
    });
  }
  // close when a menu link is tapped (before the page-transition kicks in)
  if (navMenu) {
    navMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => document.body.classList.remove("menu-open"))
    );
  }
  // close on Escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- Custom cursor (desktop only) ---------- */
  if (finePointer && !reduced) {
    document.documentElement.classList.add("has-cursor");

    const cursor = document.createElement("div");
    cursor.className = "cursor";
    cursor.innerHTML =
      '<span class="cursor-dot"></span><span class="cursor-label"></span>';
    document.body.appendChild(cursor);
    const label = cursor.querySelector(".cursor-label");

    let mx = -100, my = -100, cx = -100, cy = -100;

    window.addEventListener("pointermove", (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    (function follow() {
      // Pages can set GG.cursorEase = 1 for a 1:1 (unsmoothed) cursor.
      const k = GG.cursorEase != null ? GG.cursorEase : 0.22;
      cx = GG.lerp(cx, mx, k);
      cy = GG.lerp(cy, my, k);
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(follow);
    })();

    document.addEventListener("pointerover", (e) => {
      const labelled = e.target.closest("[data-cursor]");
      const link = e.target.closest("a, button");
      if (labelled) {
        label.textContent = labelled.dataset.cursor;
        cursor.classList.add("has-label");
        cursor.classList.remove("is-link");
      } else if (link) {
        cursor.classList.add("is-link");
        cursor.classList.remove("has-label");
      } else {
        cursor.classList.remove("is-link", "has-label");
      }
    });
  }

  /* ---------- Generic scroll reveals (.reveal / .mask) ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in-view");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal, .mask").forEach((el) => io.observe(el));
  GG.observe = (el) => io.observe(el);

  /* ---------- Footer clock (Europe/Lisbon) ---------- */
  const clock = document.querySelector("[data-clock]");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Lisbon",
    });
    const tick = () => (clock.textContent = `Leiria, PT — ${fmt.format(new Date())}`);
    tick();
    setInterval(tick, 30000);
  }
})();
