/* ============================================================
   PROJECT — single project detail page.
   Reads ?slug=… from the URL, finds the matching entry in
   data/projects.js, and fills the page. Prev/next wrap around
   the list order. Falls back to a "not found" state.
   ============================================================ */

(function () {
  "use strict";
  const data = window.PORTFOLIO ? PORTFOLIO.projects : [];

  const slug = new URLSearchParams(location.search).get("slug");
  const index = data.findIndex((p) => p.slug === slug);
  const project = data[index];

  const main = document.querySelector(".project-detail");
  if (!main) return;

  /* ---------- Not found ---------- */
  if (!project) {
    main.innerHTML = `
      <a class="project-back" href="projects.html">
        <span class="arrow">←</span> <span data-i18n="project.back">All projects</span>
      </a>
      <header class="page-head project-head-single">
        <h1 class="page-title" data-i18n="project.notfound">That project doesn't exist.</h1>
      </header>`;
    main.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = GG.t(el.dataset.i18n)));
    GG.onLang(() =>
      main.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = GG.t(el.dataset.i18n)))
    );
    return;
  }

  /* ---------- Fill the page ---------- */
  const catEl   = main.querySelector("[data-project-cat]");
  const titleEl = main.querySelector("[data-project-title]");
  const mediaEl = main.querySelector("[data-project-media]");
  const yearEl  = main.querySelector("[data-project-year]");
  const catLabelEl = main.querySelector("[data-project-cat-label]");
  const descEl  = main.querySelector("[data-project-desc]");

  document.title = `${project.title} — Guilherme Galvão`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", project.description);

  titleEl.textContent = project.title;
  yearEl.textContent = project.year;
  descEl.textContent = GG.pick(project.description);
  mediaEl.innerHTML = GG.media(project, { alt: project.title });

  /* ---------- Extra media gallery ----------
     Renders the project's optional `media` array (see data/projects.js).
     The layout handles any count: items flow full-width / half / half,
     and a leftover half at the end stretches to full so nothing dangles. */
  const galleryEl = main.querySelector("[data-project-gallery]");
  const media = Array.isArray(project.media) ? project.media : [];
  if (galleryEl && media.length) {
    galleryEl.hidden = false;
    galleryEl.innerHTML = media
      .map((m, i) => {
        const caption = GG.pick(m.caption) || "";
        return `
        <figure class="project-gallery-item reveal">
          ${GG.media(m, { alt: caption || `${project.title} — ${i + 1}`, attrs: 'loading="lazy"' })}
          ${caption ? `<figcaption>${caption}</figcaption>` : ""}
        </figure>`;
      })
      .join("");
    galleryEl.querySelectorAll(".reveal").forEach((el) => GG.observe(el));
    // captions can be { en, pt } objects — keep them translated in place
    GG.onLang(() => {
      galleryEl.querySelectorAll(".project-gallery-item figcaption").forEach((fc, i) => {
        const withCaption = media.filter((m) => m.caption);
        if (withCaption[i]) fc.textContent = GG.pick(withCaption[i].caption);
      });
    });
  }

  function paintCategory() {
    const label = GG.t("filter." + project.category);
    if (catEl) catEl.textContent = label;
    if (catLabelEl) catLabelEl.textContent = label;
  }
  paintCategory();

  /* ---------- Prev / next (wrap around) ---------- */
  const prev = data[(index - 1 + data.length) % data.length];
  const next = data[(index + 1) % data.length];

  const wirePager = (el, target) => {
    if (!el || !target || target === project) return;
    el.hidden = false;
    el.href = `project.html?slug=${encodeURIComponent(target.slug)}`;
    el.querySelector(".project-pager-title").textContent = target.title;
  };
  wirePager(main.querySelector("[data-project-prev]"), prev);
  wirePager(main.querySelector("[data-project-next]"), next);

  /* ---------- Re-translate the category on language change ---------- */
  GG.onLang(paintCategory);
})();
