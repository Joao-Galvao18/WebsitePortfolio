/* ============================================================
   HOME — interactive shape-poster editor + featured carousel
   ============================================================ */

(function () {
  "use strict";
  const { clamp, lerp, reduced } = window.GG;

  // On the hero the custom cursor tracks the pointer 1:1 (no smoothing) so the
  // shapes are easy to grab and place precisely. Other pages keep the easing.
  GG.cursorEase = 1;

  /* ============================================================
     1. HERO — poster editor
        · Shuffle: new random shapes/colors/positions
        · Each shape can be dragged, rotated and scaled (handles)
        · Save: opens a dialog, then publishes to Your Work
     ============================================================ */
  const posterEl = document.getElementById("poster");

  if (posterEl && window.Poster) {
    let poster = window.Poster.random();       // array of shape data
    let selected = null;                        // currently selected shape index
    let topZ = 0;                               // rising stack — grabbed shape goes on top

    // ---- Render the editable shapes as absolutely positioned SVG nodes ----
    function render() {
      posterEl.innerHTML = "";
      poster.forEach((s, i) => {
        const node = document.createElement("div");
        node.className = "shape";
        node.dataset.i = i;
        node._lift = 1;   // grab/drop scale, folded into the transform by place()
        node.tabIndex = 0;
        node.setAttribute("role", "button");
        node.setAttribute("aria-label", `Shape ${i + 1}: ${s.type}`);
        posterEl.appendChild(node);
        drawShape(node, s);
      });
      topZ = poster.length;
      positionAll();
      if (selected != null) selectShape(selected);
    }

    // draw a single shape's SVG into its node (unrotated; rotation via CSS)
    function drawShape(node, s) {
      const fill = window.Poster.COLOR_VAR[s.color] || window.Poster.COLOR_VAR.ink;
      let inner = "";
      const C = 50; // local viewBox centre (100x100)
      switch (s.type) {
        case "circle":   inner = `<circle cx="50" cy="50" r="46" fill="${fill}"/>`; break;
        case "ring":     inner = `<circle cx="50" cy="50" r="40" fill="none" stroke="${fill}" stroke-width="14"/>`; break;
        case "square":   inner = `<rect x="6" y="6" width="88" height="88" fill="${fill}"/>`; break;
        case "triangle": inner = `<polygon points="50,6 92,88 8,88" fill="${fill}"/>`; break;
        case "pill":     inner = `<rect x="6" y="30" width="88" height="40" rx="20" fill="${fill}"/>`; break;
        case "arc":      inner = `<path d="M6 50 A44 44 0 0 1 94 50 Z" fill="${fill}"/>`; break;
        case "diamond":  inner = `<rect x="14" y="14" width="72" height="72" fill="${fill}" transform="rotate(45 50 50)"/>`; break;
        case "pentagon": {
          let pts = "";
          for (let k = 0; k < 5; k++) { const a = -Math.PI/2 + k*2*Math.PI/5; pts += `${50+Math.cos(a)*46},${50+Math.sin(a)*46} `; }
          inner = `<polygon points="${pts.trim()}" fill="${fill}"/>`; break;
        }
        case "hexagon": {
          let pts = "";
          for (let k = 0; k < 6; k++) { const a = -Math.PI/2 + k*Math.PI/3; pts += `${50+Math.cos(a)*46},${50+Math.sin(a)*46} `; }
          inner = `<polygon points="${pts.trim()}" fill="${fill}"/>`; break;
        }
        case "cross":    inner = `<path d="M34 6 H66 V34 H94 V66 H66 V94 H34 V66 H6 V34 H34 Z" fill="${fill}"/>`; break;
        case "quarter":  inner = `<path d="M6 6 L94 6 A88 88 0 0 1 6 94 Z" fill="${fill}"/>`; break;
        case "chevron":  inner = `<path d="M6 32 L50 74 L94 32 L70 32 L50 52 L30 32 Z" fill="${fill}"/>`; break;
        default:         inner = `<circle cx="50" cy="50" r="46" fill="${fill}"/>`;
      }
      node.innerHTML =
        `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">${inner}</svg>` +
        `<span class="handle handle-rot" data-role="rot" aria-hidden="true"></span>` +
        `<span class="handle handle-scale" data-role="scale" aria-hidden="true"></span>`;
    }

    // place one shape from its fractional data
    function place(node, s) {
      const w = posterEl.clientWidth, h = posterEl.clientHeight;
      const px = Math.min(w, h) * s.size * 2; // shape box size in px
      const lift = node._lift || 1;           // grab/drop lift scale
      node.style.width = px + "px";
      node.style.height = px + "px";
      node.style.transform =
        `translate(${(s.x * w - px / 2).toFixed(1)}px, ${(s.y * h - px / 2).toFixed(1)}px) rotate(${s.rot}deg) scale(${lift})`;
    }

    // Grab lifts the shape (scales it up); drop settles it back with a bounce.
    function liftNode(node, up) {
      if (!node) return;
      if (reduced || !window.gsap) {
        node._lift = up ? 1.08 : 1;
        place(node, poster[+node.dataset.i]);
        return;
      }
      gsap.to(node, {
        _lift: up ? 1.08 : 1,
        duration: up ? 0.18 : 0.45,
        ease: up ? "power2.out" : "back.out(2.2)",
        overwrite: true,
        onUpdate: () => place(node, poster[+node.dataset.i]),
      });
    }
    function positionAll() {
      [...posterEl.children].forEach((node) => place(node, poster[+node.dataset.i]));
    }

    function selectShape(i) {
      selected = i;
      [...posterEl.children].forEach((n) => n.classList.toggle("is-selected", +n.dataset.i === i));
    }
    function deselect() {
      selected = null;
      [...posterEl.children].forEach((n) => n.classList.remove("is-selected"));
    }

    /* ---------- Interaction: drag body, rotate + scale via handles ---------- */
    let mode = null, curNode = null, cur = null;
    let startAng = 0, startRot = 0, startSize = 0, startDist = 0, cx = 0, cy = 0;
    let downX = 0, downY = 0, sx = 0, sy = 0, moved = 0;

    // Stable centre from the shape's LOGICAL position (not the rotated bbox),
    // so rotating never feeds back on its own bounding box.
    function logicalCentre(s) {
      const r = posterEl.getBoundingClientRect();
      return { x: r.left + s.x * r.width, y: r.top + s.y * r.height };
    }

    posterEl.addEventListener("pointerdown", (e) => {
      const node = e.target.closest(".shape");
      if (!node) {
        // click on empty space → shuffle
        deselect();
        shuffle();
        return;
      }
      const i = +node.dataset.i;
      selectShape(i);
      curNode = node; cur = poster[i];
      const role = e.target.dataset.role;
      const c = logicalCentre(cur);
      cx = c.x; cy = c.y;
      moved = 0; downX = e.clientX; downY = e.clientY;

      if (role === "rot") {
        mode = "rotate";
        startAng = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
        startRot = cur.rot;
      } else if (role === "scale") {
        mode = "scale";
        startDist = Math.hypot(e.clientX - cx, e.clientY - cy);
        startSize = cur.size;
      } else {
        mode = "drag";
        const w = posterEl.clientWidth, h = posterEl.clientHeight;
        sx = cur.x * w - e.clientX;
        sy = cur.y * h - e.clientY;
      }
      node.style.zIndex = String(++topZ);   // always float above the rest
      node.classList.add("is-grabbing");
      liftNode(node, true);
      posterEl.setPointerCapture(e.pointerId);
    });

    posterEl.addEventListener("pointermove", (e) => {
      if (!mode || !cur) return;
      moved = Math.max(moved, Math.hypot(e.clientX - downX, e.clientY - downY));
      const w = posterEl.clientWidth, h = posterEl.clientHeight;
      if (mode === "drag") {
        cur.x = clamp((e.clientX + sx) / w, 0.02, 0.98);
        cur.y = clamp((e.clientY + sy) / h, 0.02, 0.98);
      } else if (mode === "rotate") {
        const a = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
        cur.rot = startRot + (a - startAng);
      } else if (mode === "scale") {
        const d = Math.hypot(e.clientX - cx, e.clientY - cy);
        // No upper bound — shapes scale infinitely; tiny floor keeps them grabbable.
        cur.size = Math.max(0.01, startSize * (d / Math.max(startDist, 1)));
      }
      place(curNode, cur);
    });

    function endInteraction() {
      if (curNode) {
        curNode.classList.remove("is-grabbing");
        liftNode(curNode, false);
      }
      mode = null; cur = null; curNode = null;
    }
    posterEl.addEventListener("pointerup", endInteraction);
    posterEl.addEventListener("pointercancel", endInteraction);

    // keyboard nudge/rotate for accessibility
    posterEl.addEventListener("keydown", (e) => {
      if (selected == null) return;
      const s = poster[selected];
      const step = e.shiftKey ? 0.04 : 0.01;
      if (e.key === "ArrowLeft") s.x = clamp(s.x - step, 0.02, 0.98);
      else if (e.key === "ArrowRight") s.x = clamp(s.x + step, 0.02, 0.98);
      else if (e.key === "ArrowUp") s.y = clamp(s.y - step, 0.02, 0.98);
      else if (e.key === "ArrowDown") s.y = clamp(s.y + step, 0.02, 0.98);
      else if (e.key === "r") s.rot += 15;
      else if (e.key === "+" || e.key === "=") s.size = Math.max(0.01, s.size + 0.02);
      else if (e.key === "-") s.size = Math.max(0.01, s.size - 0.02);
      else return;
      e.preventDefault();
      place(posterEl.children[selected], s);
    });

    /* ---------- Shuffle (triggered by clicking empty space) ---------- */
    function shuffle() {
      poster = window.Poster.random();
      deselect();
      if (!reduced && window.gsap) {
        render();
        gsap.fromTo(posterEl.querySelectorAll(".shape"),
          { scale: 0.4, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(1.6)", stagger: 0.03,
            onComplete: () => posterEl.querySelectorAll(".shape").forEach((n) => (n.style.opacity = "")) });
      } else {
        render();
      }
    }

    window.addEventListener("resize", positionAll);

    // Entrance
    render();
    if (!reduced && window.gsap) {
      gsap.fromTo(posterEl.querySelectorAll(".shape"),
        { scale: 0.4, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.6, ease: "back.out(1.5)", stagger: 0.04, delay: 0.6,
          onComplete: () => posterEl.querySelectorAll(".shape").forEach((n) => (n.style.opacity = "")) });
    }

    /* ---------- Save flow ---------- */
    const modal = document.getElementById("posterModal");
    const nameInput = document.getElementById("pmName");
    const errEl = document.getElementById("pmError");
    const preview = document.getElementById("pmPreview");
    const openBtn = document.getElementById("savePoster");
    const closeBtn = document.getElementById("pmClose");
    const submitBtn = document.getElementById("pmSubmit");

    // Current composing area's aspect (so a phone saves a portrait poster,
    // desktop a landscape one) — snapped to a clean ratio.
    function currentAspect() {
      const r = posterEl.getBoundingClientRect();
      const w = Math.max(r.width, 1), h = Math.max(r.height, 1);
      return { w: Math.round(w), h: Math.round(h) };
    }

    function openModal() {
      deselect();
      const aspect = currentAspect();
      window.Poster.renderSVG(preview, poster, { ratio: aspect });
      preview.style.aspectRatio = `${aspect.w} / ${aspect.h}`;
      errEl.hidden = true;
      nameInput.value = "";
      modal.hidden = false;
      if (GG.lenis) GG.lenis.stop();
      if (!reduced && window.gsap) {
        gsap.fromTo(modal.querySelector(".poster-modal-panel"),
          { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out" });
      }
      setTimeout(() => nameInput.focus(), 60);
    }
    function closeModal() {
      modal.hidden = true;
      if (GG.lenis) GG.lenis.start();
    }
    if (openBtn) openBtn.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
    window.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });

    async function submit() {
      const name = nameInput.value.trim();
      if (!name) {
        errEl.textContent = GG.t("modal.error");
        errEl.hidden = false; nameInput.focus(); return;
      }
      if (GG.hasProfanity && GG.hasProfanity(name)) {
        errEl.textContent = GG.t("modal.profanity");
        errEl.hidden = false; nameInput.focus(); return;
      }
      errEl.hidden = true;
      submitBtn.disabled = true;
      submitBtn.textContent = GG.t("modal.saving");
      try {
        const aspect = currentAspect();
        await GG.Store.save({ name, shapes: poster, ratio: `${aspect.w}:${aspect.h}`, createdAt: Date.now() });
        submitBtn.textContent = GG.t("modal.saved");
        setTimeout(() => (window.location.href = "work.html"), 500);
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = GG.t("modal.submit");
        errEl.textContent = GG.t("modal.failed");
        errEl.hidden = false;
      }
    }
    if (submitBtn) submitBtn.addEventListener("click", submit);
    nameInput.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
  }

  /* ============================================================
     1b. HERO WORDMARK — hover cycles each letter through typefaces
         On hover the letters flow through a set of contrasting fonts
         (serif · grotesque · mono · geometric) as a staggered wave;
         on leave they settle back to the base serif.
     ============================================================ */
  (function () {
    const word = document.querySelector(".hero-word");
    if (!word) return;
    const letters = [...word.querySelectorAll(".hero-letter")];
    const FONTS = [
      '"Fraunces", serif',
      '"Bricolage Grotesque", sans-serif',
      '"Fragment Mono", monospace',
      '"Syne", sans-serif',
    ];
    let timer = 0, tick = 0;
    function start() {
      if (timer || reduced) return;
      tick = 0;
      timer = setInterval(() => {
        tick++;
        letters.forEach((l, i) => { l.style.fontFamily = FONTS[(tick + i) % FONTS.length]; });
      }, 140);
    }
    function stop() {
      clearInterval(timer); timer = 0;
      letters.forEach((l) => { l.style.fontFamily = ""; });
    }
    word.addEventListener("pointerenter", start);
    word.addEventListener("pointerleave", stop);
  })();

  /* ============================================================
     2. FEATURED CAROUSEL — drag with momentum, velocity skew,
        image parallax, progress indicator
     ============================================================ */
  const wrapEl = document.querySelector(".carousel");
  const track = document.querySelector(".carousel-track");
  const bar = document.querySelector(".carousel-progress span");

  if (wrapEl && track && window.PORTFOLIO) {
    const featured = PORTFOLIO.projects.filter((p) => p.featured).slice(0, 6);

    track.innerHTML = featured
      .map(
        (p) => `
      <a class="slide" href="projects.html" draggable="false" aria-label="${p.title} — view all projects">
        <figure class="slide-media">
          ${GG.media(p, { alt: `${p.title} — ${p.description}`, attrs: 'draggable="false"' })}
          <figcaption class="slide-view">${GG.t("row.view")}</figcaption>
        </figure>
        <div class="slide-meta">
          <h3>${p.title}</h3>
          <p>${p.category} — ${p.year}</p>
        </div>
      </a>`
      )
      .join("");

    const slides = [...track.querySelectorAll(".slide")];
    const medias = slides.map((s) => s.querySelector(".slide-media img, .slide-media video"));

    GG.onLang(() => {
      track.querySelectorAll(".slide-view").forEach((el) => (el.textContent = GG.t("row.view")));
    });

    let x = 0, tx = 0, max = 0;
    let dragging = false, startX = 0, startTx = 0, moved = 0;
    let lastPointerX = 0, vel = 0;

    function bounds() {
      max = Math.max(0, track.scrollWidth - wrapEl.clientWidth);
      tx = clamp(tx, -max, 0);
    }
    bounds();
    window.addEventListener("resize", bounds);

    wrapEl.addEventListener("pointerdown", (e) => {
      dragging = true;
      moved = 0;
      startX = lastPointerX = e.clientX;
      startTx = tx;
      vel = 0;
      wrapEl.classList.add("is-dragging");
      wrapEl.setPointerCapture(e.pointerId);
    });

    wrapEl.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      tx = clamp(startTx + dx, -max, 0);
      vel = vel * 0.7 + (e.clientX - lastPointerX) * 0.3;
      lastPointerX = e.clientX;
    });

    function release() {
      if (!dragging) return;
      dragging = false;
      wrapEl.classList.remove("is-dragging");
      tx = clamp(tx + vel * 14, -max, 0); // momentum fling
    }
    wrapEl.addEventListener("pointerup", release);
    wrapEl.addEventListener("pointercancel", release);

    // A real drag should not trigger the link
    track.addEventListener(
      "click",
      (e) => {
        if (moved > 6) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true
    );

    (function carouselLoop() {
      x = lerp(x, tx, reduced ? 1 : 0.11);
      const v = tx - x; // proxy velocity for skew
      const skew = reduced ? 0 : clamp(v * 0.045, -5, 5);
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0) skewX(${skew.toFixed(2)}deg)`;

      if (!reduced) {
        const vw = window.innerWidth;
        slides.forEach((slide, i) => {
          const r = slide.getBoundingClientRect();
          const offset = (r.left + r.width / 2 - vw / 2) / vw; // -0.5 .. 0.5
          medias[i].style.transform = `translateX(${(offset * 7).toFixed(2)}%)`;
        });
      }

      if (bar) bar.style.transform = `scaleX(${max ? (-x / max).toFixed(4) : 0})`;
      requestAnimationFrame(carouselLoop);
    })();
  }
})();
