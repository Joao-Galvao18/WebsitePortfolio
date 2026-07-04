/* ============================================================
   PROJECTS — two views:
     Canvas (default) : draggable folder icons, throwable, filterable
     List             : row index with cursor-following hover preview
   Filters and the view toggle drive both.
   ============================================================ */

(function () {
  "use strict";
  const { clamp, lerp, reduced, finePointer } = window.GG;
  const data = window.PORTFOLIO ? PORTFOLIO.projects : [];

  const canvas = document.querySelector(".folder-canvas");
  const list = document.querySelector(".project-list");
  const filtersEl = document.querySelector(".filters");
  const countEl = document.querySelector(".project-count");
  const toggle = document.querySelector(".view-toggle");
  if (!list || !canvas) return;

  /* ============================================================
     LIST VIEW — rows
     ============================================================ */
  list.innerHTML = data
    .map(
      (p) => `
    <li class="project-row" data-category="${p.category}" data-slug="${p.slug}" tabindex="0"
        role="link" data-image="${p.image}" aria-label="${p.title}, ${p.category}, ${p.year} — view project">
      ${GG.media(p, { className: "row-thumb", attrs: 'loading="lazy"' })}
      <h2 class="row-title">${p.title}</h2>
      <span class="row-cat" data-cat="${p.category}">${GG.t("filter." + p.category)}</span>
      <span class="row-year">${p.year}</span>
      <p class="row-desc">${p.description}</p>
    </li>`
    )
    .join("");

  const rows = [...list.querySelectorAll(".project-row")];
  rows.forEach((r, i) => {
    r.style.transitionDelay = `${(i % 6) * 0.05}s`;
    GG.observe(r);
    r.addEventListener("click", () => openProject(r.dataset.slug));
    r.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openProject(r.dataset.slug); }
    });
  });

  /* ============================================================
     CANVAS VIEW — folder icons
     ============================================================ */
  canvas.insertAdjacentHTML(
    "beforeend",
    data
      .map(
        (p, i) => `
    <div class="folder" data-category="${p.category}" data-slug="${p.slug}"
         tabindex="0" role="button" aria-label="${p.title} — open project"
         style="z-index:${i + 1}">
      <div class="folder-icon">
        <span class="tab-dot"></span>
        <span class="lines"><span></span><span></span><span></span></span>
      </div>
      <div class="folder-label">
        <strong>${p.title}</strong>
        <span data-cat="${p.category}">${GG.t("filter." + p.category)} — ${p.year}</span>
      </div>
    </div>`
      )
      .join("")
  );

  const folderEls = [...canvas.querySelectorAll(".folder")];

  const folders = folderEls.map((el) => ({
    el,
    x: 0, y: 0,
    vx: 0, vy: 0,
    w: 0, h: 0,
    grabbed: false,
    gox: 0, goy: 0,
    visible: true,
    settling: false,
  }));

  let topZ = folders.length;

  function measureSizes() {
    folders.forEach((f) => {
      const r = f.el.getBoundingClientRect();
      f.w = r.width; f.h = r.height;
    });
  }

  function packInto(set) {
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    const n = set.length || 1;
    const cols = Math.max(2, Math.round(Math.sqrt(n * (cw / Math.max(ch, 1)))));
    const rowsN = Math.ceil(n / cols);
    const cellW = cw / cols;
    const cellH = (ch - 40) / rowsN;
    return set.map((f, i) => {
      const c = i % cols, r = Math.floor(i / cols);
      const jx = (Math.sin((i + 1) * 12.9898) * 0.5 + 0.5) * (cellW - f.w) * 0.6;
      const jy = (Math.sin((i + 1) * 78.233) * 0.5 + 0.5) * (cellH - f.h) * 0.4;
      return {
        f,
        tx: clamp(c * cellW + jx, 4, Math.max(4, cw - f.w - 4)),
        ty: clamp(r * cellH + jy + 10, 4, Math.max(4, ch - f.h - 4)),
      };
    });
  }

  function layout() {
    measureSizes();
    packInto(folders).forEach(({ f, tx, ty }) => {
      f.x = tx; f.y = ty; f.vx = f.vy = 0;
      f.el.style.transform = `translate3d(${f.x}px, ${f.y}px, 0)`;
    });
  }
  requestAnimationFrame(() => requestAnimationFrame(layout));

  window.addEventListener("resize", () => {
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    folders.forEach((f) => {
      f.x = clamp(f.x, 4, Math.max(4, cw - f.w - 4));
      f.y = clamp(f.y, 4, Math.max(4, ch - f.h - 4));
    });
  });

  /* ---------- Drag + throw ---------- */
  let held = null, moved = 0, downX = 0, downY = 0;
  let lastTapTime = 0, lastTapSlug = "";

  function pointFromEvent(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  canvas.addEventListener("pointerdown", (e) => {
    const el = e.target.closest(".folder");
    if (!el) return;
    const f = folders.find((o) => o.el === el);
    if (!f || !f.visible) return;
    const p = pointFromEvent(e);
    held = f; moved = 0; downX = p.x; downY = p.y;
    f.grabbed = true;
    f.gox = p.x - f.x;
    f.goy = p.y - f.y;
    f.vx = f.vy = 0;
    f.el.classList.add("is-dragging");
    f.el.style.zIndex = String(++topZ);
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!held) return;
    const p = pointFromEvent(e);
    moved = Math.max(moved, Math.hypot(p.x - downX, p.y - downY));
    const nx = p.x - held.gox;
    const ny = p.y - held.goy;
    held.vx = held.vx * 0.4 + (nx - held.x) * 0.6;
    held.vy = held.vy * 0.4 + (ny - held.y) * 0.6;
    held.x = nx; held.y = ny;
  });

  function releaseFolder() {
    if (!held) return;
    const f = held;
    f.grabbed = false;
    f.el.classList.remove("is-dragging");
    held = null;
    if (moved < 6) {
      const now = Date.now();
      if (now - lastTapTime < 380 && lastTapSlug === f.el.dataset.slug) {
        openProject(f.el.dataset.slug);
        lastTapTime = 0;
      } else {
        lastTapTime = now; lastTapSlug = f.el.dataset.slug;
      }
    }
  }
  canvas.addEventListener("pointerup", releaseFolder);
  canvas.addEventListener("pointercancel", releaseFolder);

  canvas.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const el = e.target.closest(".folder");
    if (el) { e.preventDefault(); openProject(el.dataset.slug); }
  });
  canvas.addEventListener("dblclick", (e) => {
    const el = e.target.closest(".folder");
    if (el) openProject(el.dataset.slug);
  });

  function openProject(slug) {
    if (!slug) return;
    window.location.href = `project.html?slug=${encodeURIComponent(slug)}`;
  }

  /* ---------- Physics loop ---------- */
  const DAMP = 0.86, BOUNCE = -0.4;
  let running = true;

  (function loop() {
    if (running && !reduced) {
      const cw = canvas.clientWidth, ch = canvas.clientHeight;
      for (const f of folders) {
        if (!f.visible || f.settling) continue;
        if (!f.grabbed) {
          f.vx *= DAMP; f.vy *= DAMP;
          f.x += f.vx; f.y += f.vy;
          if (f.x < 4) { f.x = 4; f.vx *= BOUNCE; }
          if (f.x + f.w > cw - 4) { f.x = cw - f.w - 4; f.vx *= BOUNCE; }
          if (f.y < 4) { f.y = 4; f.vy *= BOUNCE; }
          if (f.y + f.h > ch - 4) { f.y = ch - f.h - 4; f.vy *= BOUNCE; }
        }
        const rot = clamp(f.vx * 0.6, -8, 8);
        f.el.style.transform = `translate3d(${f.x.toFixed(2)}px, ${f.y.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg)`;
      }
    }
    requestAnimationFrame(loop);
  })();

  /* ============================================================
     FILTERS — drive both views
     ============================================================ */
  function relayoutVisible() {
    measureSizes();
    const vis = folders.filter((f) => f.visible);
    packInto(vis).forEach(({ f, tx, ty }) => {
      if (!reduced && window.gsap) {
        f.settling = true;
        gsap.to(f, {
          x: tx, y: ty, duration: 0.6, ease: "power3.inOut",
          onUpdate: () => { f.el.style.transform = `translate3d(${f.x}px, ${f.y}px, 0)`; },
          onComplete: () => { f.settling = false; },
        });
      } else {
        f.x = tx; f.y = ty;
        f.el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      }
      f.vx = f.vy = 0;
    });
  }

  function applyFilter(filter) {
    // list rows (FLIP)
    const applyRows = () =>
      rows.forEach((r) => {
        r.style.transition = "none";
        r.style.transitionDelay = "0s";
        r.classList.add("in-view");
        r.classList.toggle("is-hidden", filter !== "All" && r.dataset.category !== filter);
      });
    if (!reduced && window.gsap && window.Flip && !list.hidden) {
      const state = Flip.getState(rows);
      applyRows();
      Flip.from(state, {
        duration: 0.6, ease: "power3.inOut", stagger: 0.02, absolute: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45 }),
        onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.25 }),
      });
    } else {
      applyRows();
    }

    // folders
    folders.forEach((f) => {
      const show = filter === "All" || f.el.dataset.category === filter;
      f.visible = show;
      if (!reduced && window.gsap) {
        gsap.to(f.el, {
          autoAlpha: show ? 1 : 0,
          scale: show ? 1 : 0.7,
          duration: 0.35, ease: "power2.out",
          onStart: () => { if (show) f.el.classList.remove("is-hidden"); },
          onComplete: () => f.el.classList.toggle("is-hidden", !show),
        });
      } else {
        f.el.classList.toggle("is-hidden", !show);
        f.el.style.opacity = show ? "1" : "0";
      }
    });
    if (!canvas.hidden) requestAnimationFrame(() => requestAnimationFrame(relayoutVisible));

    const visible = data.filter((p) => filter === "All" || p.category === filter).length;
    if (countEl) countEl.textContent = `(${visible})`;
  }

  if (filtersEl) {
    const cats = ["All", ...new Set(data.map((p) => p.category))];
    const filterLabel = (c) => GG.t("filter." + c);
    filtersEl.innerHTML = cats
      .map((c, i) => `<button class="filter-btn" data-filter="${c}" aria-pressed="${i === 0}">${filterLabel(c)}</button>`)
      .join("");
    filtersEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      filtersEl.querySelectorAll(".filter-btn").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      applyFilter(btn.dataset.filter);
    });
  }
  if (countEl) countEl.textContent = `(${data.length})`;

  /* ============================================================
     VIEW TOGGLE — Canvas (default) / List
     ============================================================ */
  if (toggle) {
    const btns = [...toggle.querySelectorAll(".toggle-btn")];

    // On mobile the drag canvas is fiddly — default to the List view instead.
    if (window.matchMedia("(max-width: 640px)").matches) {
      toggle.dataset.view = "list";
      btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === "list")));
      canvas.hidden = true;
      list.hidden = false;
      running = false;
    }

    function setView(view) {
      if (toggle.dataset.view === view) return;
      toggle.dataset.view = view;
      btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === view)));
      GG.positionTogglePill(toggle);
      const showCanvas = view === "canvas";
      const incoming = showCanvas ? canvas : list;
      const outgoing = showCanvas ? list : canvas;
      running = showCanvas;
      const swap = () => {
        outgoing.hidden = true;
        incoming.hidden = false;
        if (showCanvas) requestAnimationFrame(() => requestAnimationFrame(relayoutVisible));
      };
      if (reduced || !window.gsap) { swap(); return; }
      gsap.to(outgoing, {
        opacity: 0, duration: 0.25, ease: "power2.in",
        onComplete: () => {
          gsap.set(outgoing, { clearProps: "opacity" });
          swap();
          gsap.fromTo(incoming, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
        },
      });
    }
    btns.forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
    GG.positionTogglePill(toggle);
    window.addEventListener("resize", () => GG.positionTogglePill(toggle));
  }

  /* ============================================================
     Language — re-translate category labels everywhere
     ============================================================ */
  GG.onLang(() => {
    list.querySelectorAll(".row-cat").forEach((el) => {
      el.textContent = GG.t("filter." + el.dataset.cat);
    });
    canvas.querySelectorAll(".folder-label span[data-cat]").forEach((el) => {
      const slug = el.closest(".folder").dataset.slug;
      const p = data.find((d) => d.slug === slug);
      el.textContent = `${GG.t("filter." + el.dataset.cat)} — ${p ? p.year : ""}`;
    });
    if (filtersEl) {
      filtersEl.querySelectorAll(".filter-btn").forEach((b) => {
        b.textContent = GG.t("filter." + b.dataset.filter);
      });
    }
  });

  /* ============================================================
     LIST VIEW — cursor-following hover preview (desktop only)
     ============================================================ */
  if (finePointer) {
    const preview = document.createElement("div");
    preview.className = "hover-preview";
    preview.innerHTML = "<img alt=''>";
    document.body.appendChild(preview);
    const img = preview.querySelector("img");
    let mx = 0, my = 0, x = 0, y = 0, s = 0.85, active = false;

    window.addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; });

    rows.forEach((row) => {
      const show = () => { img.src = row.dataset.image; preview.classList.add("is-active"); active = true; };
      const hide = () => { preview.classList.remove("is-active"); active = false; };
      row.addEventListener("pointerenter", show);
      row.addEventListener("pointerleave", hide);
      row.addEventListener("focus", () => {
        const r = row.getBoundingClientRect();
        mx = r.right - 120; my = r.top + r.height / 2; show();
      });
      row.addEventListener("blur", hide);
    });

    (function follow() {
      const k = reduced ? 1 : 0.12;
      x = lerp(x, mx, k); y = lerp(y, my, k);
      s = lerp(s, active ? 1 : 0.85, 0.14);
      const w = preview.offsetWidth;
      const px = clamp(x + 28, 8, window.innerWidth - w - 8);
      const py = clamp(y - preview.offsetHeight / 2, 8, window.innerHeight - preview.offsetHeight - 8);
      preview.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
      requestAnimationFrame(follow);
    })();
  }
})();
