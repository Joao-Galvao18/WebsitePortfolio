/* ============================================================
   ABOUT — portrait parallax, copy-to-clipboard email
   (masked / line reveals use the shared .reveal / .mask system)
   ============================================================ */

(function () {
  "use strict";
  const { reduced } = window.GG;
  const site = window.PORTFOLIO && PORTFOLIO.site;

  /* ---------- Marquee (translatable, repeated to fill) ---------- */
  const marquee = document.querySelector("[data-marquee]");
  function buildMarquee() {
    if (!marquee) return;
    const raw = GG.t(marquee.dataset.marquee);
    // turn " — " separators into cobalt em-dashes, repeat 4x for seamless loop
    const unit = raw.replace(/—/g, "<em>—</em>") + "&nbsp;&nbsp;";
    marquee.innerHTML = unit.repeat(4);
  }
  buildMarquee();
  GG.onLang(buildMarquee);

  /* ---------- Portrait (from data/projects.js → site.portrait) ---------- */
  const portraitImg = document.querySelector(".portrait img");
  if (portraitImg && site && site.portrait) portraitImg.src = site.portrait;

  if (portraitImg && !reduced && window.gsap && window.ScrollTrigger) {
    gsap.fromTo(
      portraitImg,
      { yPercent: -8 },
      {
        yPercent: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".portrait",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  }

  /* ---------- Copy email (value from data/projects.js → site.email) ---------- */
  const copyBtn = document.querySelector("[data-copy]");
  if (copyBtn) {
    if (site && site.email) {
      copyBtn.dataset.copy = site.email;
      copyBtn.querySelector(".pill-text").textContent = site.email;
    }
    const original = copyBtn.querySelector(".pill-text").textContent;
    let timer = null;

    copyBtn.addEventListener("click", async () => {
      const value = copyBtn.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
      } catch (err) {
        // Fallback for older browsers
        const ta = document.createElement("textarea");
        ta.value = value;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      copyBtn.classList.add("is-copied");
      copyBtn.querySelector(".pill-text").textContent = GG.t("contact.copy");
      clearTimeout(timer);
      timer = setTimeout(() => {
        copyBtn.classList.remove("is-copied");
        copyBtn.querySelector(".pill-text").textContent = original;
      }, 1800);
    });
  }
})();
