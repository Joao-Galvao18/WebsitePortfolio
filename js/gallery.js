/* ============================================================
   GALLERY — infinite canvas / calendar grid, animated toggle,
   shared lightbox
   ============================================================ */

(function () {
  "use strict";
  const { clamp, lerp, reduced } = window.GG;
  const items = window.PORTFOLIO ? PORTFOLIO.gallery : [];

  const toggle = document.querySelector(".view-toggle");
  const canvasView = document.querySelector(".canvas-view");
  const gridView = document.querySelector(".grid-view");
  if (!canvasView || !gridView) return;

  /* ============================================================
     Lightbox (shared by both views)
     ============================================================ */
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Image viewer");
  lightbox.innerHTML = `
    <button class="lightbox-close">${GG.t("lightbox.close")}</button>
    <figure></figure>`;
  document.body.appendChild(lightbox);

  const lbFigure = lightbox.querySelector("figure");
  const lbClose = lightbox.querySelector(".lightbox-close");
  let lbOpen = false;

  function openLightbox(item) {
    const caption = `${item.alt} — ${monthLabel(item.date)}`;
    lbFigure.innerHTML = item.video
      ? `<video src="${item.video}" poster="${item.src}" autoplay muted loop playsinline controls></video>`
      : `<img src="${item.src}" alt="${item.alt}">`;
    lbFigure.insertAdjacentHTML("beforeend", `<figcaption>${caption}</figcaption>`);
    lightbox.classList.add("is-open");
    lbOpen = true;
    if (GG.lenis) GG.lenis.stop();
    if (!reduced && window.gsap) {
      gsap.fromTo(
        lightbox.querySelector("figure"),
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "power3.out" }
      );
    }
    lbClose.focus();
  }
  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lbOpen = false;
    if (GG.lenis) GG.lenis.start();
  }
  lbClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lbOpen) closeLightbox();
  });

  function monthLabel(ym) {
    const d = new Date(ym + "-01T12:00:00");
    const locale = GG.lang === "pt" ? "pt-PT" : "en-GB";
    return d.toLocaleDateString(locale, { month: "long", year: "numeric" });
  }

  /* ============================================================
     CANVAS VIEW — infinite wrapping plane
     ============================================================ */
  // Deterministic pseudo-random so the layout is stable across loads
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const SIZE = { s: 190, m: 260, l: 340 };
  const MARGIN = 420; // items start offscreen so wrapping is invisible

  let PW = 0, PH = 0;
  const nodes = [];

  function buildCanvas() {
    const rand = mulberry32(7);
    PW = Math.max(window.innerWidth * 2.4, 2200);
    PH = Math.max(window.innerHeight * 2.6, 1700);

    // jittered grid so images never pile up
    const n = items.length;
    const cols = Math.ceil(Math.sqrt((n * PW) / PH));
    const rows = Math.ceil(n / cols);
    const cellW = PW / cols;
    const cellH = PH / rows;
    const cells = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) cells.push([c, r]);
    // shuffle cells
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    items.forEach((item, i) => {
      const el = document.createElement("div");
      el.className = "canvas-item";
      const w = SIZE[item.size] || SIZE.m;
      el.style.width = w + "px";
      el.innerHTML = GG.media(item, { alt: item.alt, attrs: 'loading="lazy" draggable="false"' });
      canvasView.appendChild(el);

      const [c, r] = cells[i % cells.length];
      nodes.push({
        el,
        item,
        x: c * cellW + rand() * cellW * 0.55,
        y: r * cellH + rand() * cellH * 0.55,
        depth: [0.55, 0.78, 1][i % 3], // parallax layers
      });
    });
  }
  buildCanvas();

  const mod = (a, n) => ((a % n) + n) % n;

  let ox = 0, oy = 0, tox = 0, toy = 0; // offset current/target
  let dragging = false, sx = 0, sy = 0, sox = 0, soy = 0, moved = 0;
  let vx = 0, vy = 0, lastX = 0, lastY = 0;
  let canvasActive = true;
  let pressedNode = null;

  canvasView.addEventListener("pointerdown", (e) => {
    if (lbOpen) return;
    dragging = true;
    moved = 0;
    sx = lastX = e.clientX;
    sy = lastY = e.clientY;
    sox = tox; soy = toy;
    vx = vy = 0;
    pressedNode = nodes.find((n) => n.el === e.target.closest(".canvas-item")) || null;
    canvasView.classList.add("is-dragging");
    canvasView.setPointerCapture(e.pointerId);
  });

  canvasView.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    moved = Math.max(moved, Math.hypot(dx, dy));
    tox = sox + dx;
    toy = soy + dy;
    vx = vx * 0.7 + (e.clientX - lastX) * 0.3;
    vy = vy * 0.7 + (e.clientY - lastY) * 0.3;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    canvasView.classList.remove("is-dragging");
    tox += vx * 16; // momentum
    toy += vy * 16;
    if (moved < 6 && pressedNode) openLightbox(pressedNode.item);
    pressedNode = null;
  }
  canvasView.addEventListener("pointerup", endDrag);
  canvasView.addEventListener("pointercancel", endDrag);

  (function canvasLoop() {
    if (canvasActive && !lbOpen) {
      ox = lerp(ox, tox, reduced ? 1 : 0.1);
      oy = lerp(oy, toy, reduced ? 1 : 0.1);
      // render from eased offsets
      for (const n of nodes) {
        const x = mod(n.x + ox * n.depth, PW) - MARGIN;
        const y = mod(n.y + oy * n.depth, PH) - MARGIN;
        n.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      }
    }
    requestAnimationFrame(canvasLoop);
  })();

  /* ============================================================
     GRID VIEW — calendar, grouped by month
     ============================================================ */
  function buildGrid() {
    const byMonth = new Map();
    items.forEach((item) => {
      if (!byMonth.has(item.date)) byMonth.set(item.date, []);
      byMonth.get(item.date).push(item);
    });
    const months = [...byMonth.keys()].sort().reverse(); // newest first

    gridView.innerHTML = months
      .map((m) => {
        const group = byMonth.get(m);
        return `
        <section class="month-section">
          <h2 class="month-label" data-ym="${m}">${monthLabel(m)} <span class="count">(${group.length})</span></h2>
          <div class="month-grid">
            ${group
              .map(
                (item) => `
              <button class="grid-cell" data-src="${item.src}" aria-label="View: ${item.alt}">
                ${GG.media(item, { alt: item.alt, attrs: 'loading="lazy"' })}
              </button>`
              )
              .join("")}
          </div>
        </section>`;
      })
      .join("");

    const cells = [...gridView.querySelectorAll(".grid-cell")];
    cells.forEach((cell, i) => {
      cell.style.transitionDelay = `${(i % 4) * 0.07}s`;
      GG.observe(cell);
      cell.addEventListener("click", () => {
        const item = items.find((it) => it.src === cell.dataset.src);
        if (item) openLightbox(item);
      });
    });
  }
  buildGrid();

  // Re-translate gallery chrome when language changes
  GG.onLang(() => {
    lbClose.textContent = GG.t("lightbox.close");
    gridView.querySelectorAll(".month-label").forEach((h) => {
      const count = h.querySelector(".count");
      h.textContent = monthLabel(h.dataset.ym) + " ";
      if (count) h.appendChild(count);
    });
  });

  /* ============================================================
     TOGGLE — animated view switch
     ============================================================ */
  if (toggle) {
    const btns = [...toggle.querySelectorAll(".toggle-btn")];

    function setView(view) {
      if (toggle.dataset.view === view) return;
      toggle.dataset.view = view;
      btns.forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.view === view))
      );
      GG.positionTogglePill(toggle);

      const showCanvas = view === "canvas";
      const incoming = showCanvas ? canvasView : gridView;
      const outgoing = showCanvas ? gridView : canvasView;

      const swap = () => {
        outgoing.hidden = true;
        incoming.hidden = false;
        canvasActive = showCanvas;
      };

      if (reduced || !window.gsap) {
        swap();
        return;
      }
      gsap.to(outgoing, {
        opacity: 0,
        scale: 0.985,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(outgoing, { clearProps: "opacity,scale" });
          swap();
          gsap.fromTo(
            incoming,
            { opacity: 0, scale: 1.015 },
            { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out", clearProps: "scale" }
          );
        },
      });
    }

    btns.forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
    GG.positionTogglePill(toggle);
    window.addEventListener("resize", () => GG.positionTogglePill(toggle));
  }
})();
