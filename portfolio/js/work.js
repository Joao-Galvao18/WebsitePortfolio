/* ============================================================
   YOUR WORK — load saved posters and render the collective grid
   ============================================================ */

(function () {
  "use strict";
  const grid = document.getElementById("workGrid");
  const emptyEl = document.getElementById("workEmpty");
  const countEl = document.querySelector(".work-count");
  const scopeEl = document.querySelector("[data-scope]");
  if (!grid) return;

  // escape user-supplied names
  function esc(str) {
    return String(str).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  // loading skeletons
  grid.innerHTML = Array.from({ length: 6 }).map(() => '<div class="work-skeleton"></div>').join("");

  GG.Store.list()
    .then((posters) => {
      grid.innerHTML = "";
      if (!posters || !posters.length) {
        emptyEl.hidden = false;
        if (countEl) countEl.textContent = "(0)";
        return;
      }
      if (countEl) countEl.textContent = `(${posters.length})`;

      // a friendly note explaining what's shown
      if (scopeEl) {
        scopeEl.textContent = GG.t("work.scope");
        scopeEl.hidden = false;
      }

      posters.forEach((p, i) => {
        const shapes = typeof p.shapes === "string" ? JSON.parse(p.shapes) : p.shapes;
        const card = document.createElement("div");
        card.className = "work-card";
        card.style.transitionDelay = `${(i % 4) * 0.06}s`;

        // right-hand meta: curated → author/featured, mine → "yours"
        let meta;
        if (p.curated) meta = p.author ? esc(p.author) : GG.t("work.featured");
        else meta = GG.t("work.yours");

        card.innerHTML = `
          <div class="work-poster" data-poster></div>
          <div class="work-meta">
            <strong>${esc(p.name)}</strong>
            <span>${meta}</span>
          </div>`;
        grid.appendChild(card);
        const posterBox = card.querySelector("[data-poster]");
        // keep each poster's own ratio (phones save portrait, desktop landscape)
        const ratio = p.ratio || "16:9";
        const rp = ratio.split(":").map(Number);
        if (rp.length === 2 && rp[0] > 0 && rp[1] > 0) {
          posterBox.style.aspectRatio = `${rp[0]} / ${rp[1]}`;
        }
        window.Poster.renderSVG(posterBox, shapes, { ratio });
        GG.observe(card);
      });
    })
    .catch(() => {
      grid.innerHTML = "";
      emptyEl.hidden = false;
    });

  // keep the note translated
  GG.onLang(() => {
    if (scopeEl && !scopeEl.hidden) scopeEl.textContent = GG.t("work.scope");
  });
})();
