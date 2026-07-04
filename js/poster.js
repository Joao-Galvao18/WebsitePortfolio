/* ============================================================
   POSTER ENGINE — shared by the home hero (editable) and the
   Your Work page (static display).

   A poster is just data: an array of shapes, each with
   { type, x, y, size, rot, color }.  x/y/size are fractions of
   the canvas (0–1) so a poster renders at any dimension.

   window.Poster.random()        → new random poster (array)
   window.Poster.renderSVG(el, poster, {interactive})
   window.Poster.attachEditor(el, poster, opts) → drag/scale/rotate
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Shapes ----------
     A tight, bold set — fewer forms, used in greater quantity, reads as
     one cohesive language. To add/remove, edit this list (shapeSVG() and
     drawShape() in home.js still know how to draw the wider set). */
  const SHAPES = ["circle", "ring", "square", "triangle", "arc"];

  // Fixed poster aspect (widescreen, like the hero). viewBox uses these.
  const RATIO_W = 1600, RATIO_H = 900;

  /* ---------- Colours ----------
     Four only. These map to the CSS tokens in css/base.css — change
     the hex values THERE and every shape updates. (Inline SVG in the
     DOM resolves var(); the fallback hex keeps exports/edge cases safe.) */
  const COLOR_VAR = {
    black:  "var(--black, #15151B)",
    orange: "var(--orange, #F26419)",
    blue:   "var(--blue, #1D32F2)",
    grey:   "var(--grey, #B7B7AE)",
  };
  const COLORS = Object.keys(COLOR_VAR);

  // even mix, black slightly more common as an anchor
  const COLOR_WEIGHTS = [
    ["black", 30], ["orange", 24], ["blue", 24], ["grey", 22],
  ];
  function weightedColor() {
    const total = COLOR_WEIGHTS.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [c, w] of COLOR_WEIGHTS) { if ((r -= w) <= 0) return c; }
    return "black";
  }

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function randomPoster(n) {
    const count = n || Math.round(rand(10, 15));
    const shapes = [];
    for (let i = 0; i < count; i++) {
      shapes.push({
        type: pick(SHAPES),
        // Span the whole canvas — big shapes bleed off the edges on purpose,
        // so a shuffle is never boxed-in and always reads as a full composition.
        x: rand(0.0, 1.0),
        y: rand(0.04, 0.96),
        size: rand(0.06, 0.24),
        rot: rand(0, 360),
        color: weightedColor(),
      });
    }
    return shapes;
  }

  // Re-roll only colors/types/positions of an existing poster (keeps count)
  function reshuffle(poster) {
    return poster.map(() => randomPoster(1)[0]);
  }

  // Build the SVG markup for one shape at fractional coords, given canvas w/h
  function shapeSVG(s, w, h) {
    const cx = s.x * w, cy = s.y * h;
    const r = s.size * Math.min(w, h);
    const fill = COLOR_VAR[s.color] || COLOR_VAR.black;
    const t = `transform="rotate(${s.rot} ${cx} ${cy})"`;
    switch (s.type) {
      case "circle":
        return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
      case "ring":
        return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${fill}" stroke-width="${r * 0.3}"/>`;
      case "square":
        return `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" fill="${fill}" ${t}/>`;
      case "triangle": {
        const p = [
          [cx, cy - r],
          [cx + r * 0.92, cy + r * 0.72],
          [cx - r * 0.92, cy + r * 0.72],
        ].map((q) => q.join(",")).join(" ");
        return `<polygon points="${p}" fill="${fill}" ${t}/>`;
      }
      case "pill":
        return `<rect x="${cx - r}" y="${cy - r * 0.42}" width="${r * 2}" height="${r * 0.84}" rx="${r * 0.42}" fill="${fill}" ${t}/>`;
      case "arc": {
        // half-disc
        const p = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`;
        return `<path d="${p}" fill="${fill}" ${t}/>`;
      }
      case "diamond":
        return `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" fill="${fill}" transform="rotate(${s.rot + 45} ${cx} ${cy})"/>`;
      case "pentagon": {
        let pts = "";
        for (let i = 0; i < 5; i++) {
          const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
          pts += `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r} `;
        }
        return `<polygon points="${pts.trim()}" fill="${fill}" ${t}/>`;
      }
      case "hexagon": {
        let pts = "";
        for (let i = 0; i < 6; i++) {
          const a = -Math.PI / 2 + (i * Math.PI) / 3;
          pts += `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r} `;
        }
        return `<polygon points="${pts.trim()}" fill="${fill}" ${t}/>`;
      }
      case "cross": {
        const a = r * 0.36;
        const p = `M ${cx - a} ${cy - r} H ${cx + a} V ${cy - a} H ${cx + r} V ${cy + a}
                   H ${cx + a} V ${cy + r} H ${cx - a} V ${cy + a} H ${cx - r} V ${cy - a} H ${cx - a} Z`;
        return `<path d="${p}" fill="${fill}" ${t}/>`;
      }
      case "quarter": {
        // quarter-disc (pie corner)
        const p = `M ${cx - r} ${cy - r} L ${cx + r} ${cy - r} A ${r * 2} ${r * 2} 0 0 1 ${cx - r} ${cy + r} Z`;
        return `<path d="${p}" fill="${fill}" ${t}/>`;
      }
      case "chevron": {
        const w2 = r, h2 = r * 0.5;
        const p = `M ${cx - w2} ${cy - h2} L ${cx} ${cy + h2} L ${cx + w2} ${cy - h2}
                   L ${cx + w2 * 0.55} ${cy - h2} L ${cx} ${cy} L ${cx - w2 * 0.55} ${cy - h2} Z`;
        return `<path d="${p}" fill="${fill}" ${t}/>`;
      }
      default:
        return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
    }
  }

  // Render a poster into a container element as an <svg> (static).
  // opts.ratio = "W:H" or {w,h} overrides the default 16:9 viewBox so a
  // poster composed on a phone keeps its portrait shape.
  function renderSVG(el, poster, opts = {}) {
    let w = RATIO_W, h = RATIO_H;
    if (opts.ratio) {
      if (typeof opts.ratio === "string" && opts.ratio.includes(":")) {
        const [rw, rh] = opts.ratio.split(":").map(Number);
        if (rw > 0 && rh > 0) { w = rw * 100; h = rh * 100; }
      } else if (opts.ratio.w && opts.ratio.h) {
        w = opts.ratio.w; h = opts.ratio.h;
      }
    }
    const body = poster.map((s) => shapeSVG(s, w, h)).join("");
    el.innerHTML =
      `<svg class="poster-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="${opts.preserve || "xMidYMid meet"}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
    return el.querySelector("svg");
  }

  window.Poster = { random: randomPoster, reshuffle, renderSVG, shapeSVG, SHAPES, COLORS, COLOR_VAR, RATIO_W, RATIO_H };
})();
