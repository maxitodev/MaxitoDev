// Banner principal: guirnalda de papel picado, nombre con impresión desfasada,
// línea que se escribe sola y avatar como sticker.

import fs from 'node:fs';
import { Doc, REDUCED_MOTION } from '../lib/svg.mjs';
import { C } from '../lib/theme.mjs';
import { lucide } from '../lib/icons.mjs';
import { flag, quadAt, sparkle } from '../lib/papel.mjs';
import { r, darken, pick } from '../lib/util.mjs';

const W = 1200;
const H = 540;

export function hero({ F, P, avatarFile }) {
  const doc = new Doc({
    w: W,
    h: H,
    title: `${P.handle}: ${P.fullName}`,
    desc: `Desarrollador full-stack en ${P.location}. ${P.roles.join('. ')}.`,
  });

  const AV = { cx: 978, cy: 332, R: 138 };

  // ── Defs ────────────────────────────────────────────────────────────────
  doc.def(`<clipPath id="clipCard"><rect width="${W}" height="${H}" rx="30"/></clipPath>`);
  doc.def(`<clipPath id="clipAvatar"><circle cx="${AV.cx}" cy="${AV.cy}" r="${AV.R}"/></clipPath>`);
  doc.def(
    `<radialGradient id="glowA" cx="${AV.cx}" cy="${AV.cy}" r="430" gradientUnits="userSpaceOnUse">` +
      `<stop offset="0" stop-color="${C.cempasuchil}" stop-opacity=".30"/>` +
      `<stop offset=".45" stop-color="${C.chile}" stop-opacity=".22"/>` +
      `<stop offset="1" stop-color="${C.chile}" stop-opacity="0"/></radialGradient>`,
  );
  doc.def(
    `<radialGradient id="glowB" cx="0" cy="${H}" r="560" gradientUnits="userSpaceOnUse">` +
      `<stop offset="0" stop-color="${C.rosa}" stop-opacity=".30"/>` +
      `<stop offset="1" stop-color="${C.rosa}" stop-opacity="0"/></radialGradient>`,
  );
  doc.def(
    `<pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">` +
      `<circle cx="11" cy="11" r="1.1" fill="${C.cal}" fill-opacity=".07"/></pattern>`,
  );
  doc.def(
    `<pattern id="halftone" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">` +
      `<circle cx="4.5" cy="4.5" r="1.9" fill="#7f1313" fill-opacity=".55"/></pattern>`,
  );

  doc.css(
    `.sw{animation:sw var(--d) ease-in-out var(--l) infinite alternate}` +
      `@keyframes sw{from{transform:rotate(-2.8deg)}to{transform:rotate(2.8deg)}}` +
      `.tw{transform-box:fill-box;transform-origin:center;animation:tw 3.2s ease-in-out var(--l) infinite}` +
      `@keyframes tw{0%,100%{transform:scale(.55) rotate(0);opacity:.55}50%{transform:scale(1) rotate(45deg);opacity:1}}` +
      `.ping{transform-box:fill-box;transform-origin:center;animation:ping 2.2s ease-out infinite}` +
      `@keyframes ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.8);opacity:0}}` +
      `.in{animation:in .9s cubic-bezier(.2,.8,.2,1) both}` +
      `@keyframes in{from{opacity:0;transform:translateY(14px)}}` +
      REDUCED_MOTION,
  );

  // ── Fondo ───────────────────────────────────────────────────────────────
  let b = `<g clip-path="url(#clipCard)">`;
  b += `<rect width="${W}" height="${H}" fill="${C.vino}"/>`;
  b += `<rect width="${W}" height="${H}" fill="url(#glowB)"/>`;
  b += `<rect width="${W}" height="${H}" fill="url(#glowA)"/>`;
  b += `<rect width="${W}" height="${H}" fill="url(#dots)"/>`;

  // ── Guirnalda de papel picado ───────────────────────────────────────────
  const p0 = [-14, 14];
  const p1 = [W / 2, 78];
  const p2 = [W + 14, 14];
  b += `<path d="M${p0} Q${p1} ${p2}" fill="none" stroke="${C.cal}" stroke-opacity=".5" stroke-width="2.2"/>`;
  const N = 15;
  const colors = [C.chile, C.cempasuchil, C.rosa, C.cal, C.turquesa];
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N;
    const pt = quadAt(p0, p1, p2, t);
    const fill = pick(colors, i * 2);
    const style = i % 3;
    const rot = ((pt.angle * 180) / Math.PI) * 0.45;
    const dur = (4.6 + ((i * 37) % 9) / 6).toFixed(1);
    const lag = -((i * 53) % 40) / 10;
    b +=
      `<g transform="translate(${r(pt.x)} ${r(pt.y)}) rotate(${r(rot, 1)})">` +
      `<g class="sw" style="--d:${dur}s;--l:${lag}s">` +
      flag({ w: 68, h: 100, style, fill, fold: darken(fill, 0.28) }) +
      `</g></g>`;
  }

  // ── Nombre: impresión con registro desfasado ────────────────────────────
  const nameSize = 204;
  const nameX = 62;
  const nameY = 346;
  const nm = doc.text(F.display, P.handle, { x: nameX, y: nameY, size: nameSize, attrs: 'id="nm"' });
  doc.def(nm.svg);
  b += `<use href="#nm" x="13" y="13" fill="${C.rosa}"/>`;
  b += `<use href="#nm" x="6.5" y="6.5" fill="${C.cempasuchil}"/>`;
  b += `<use href="#nm" fill="${C.cal}"/>`;

  // ── Línea que se escribe ────────────────────────────────────────────────
  b += typed(doc, F.title, P.roles, { x: 104, y: 424, size: 44, fill: C.cal });
  b += `<path d="M66 396l17 15-17 15" fill="none" stroke="${C.chileHot}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;

  // ── Chips de estado ─────────────────────────────────────────────────────
  const chipY = 458;
  const chipH = 46;
  const t1 = doc.text(F.bold, P.status, { x: 0, y: 0, size: 20 });
  const chip1W = 48 + t1.width + 24;
  b += `<g class="in" style="animation-delay:.5s">`;
  b += `<rect x="66" y="${chipY}" width="${r(chip1W)}" height="${chipH}" rx="${chipH / 2}" fill="${C.cal}"/>`;
  b += `<circle class="ping" cx="90" cy="${chipY + chipH / 2}" r="6.5" fill="${C.turquesa}"/>`;
  b += `<circle cx="90" cy="${chipY + chipH / 2}" r="6.5" fill="${C.turquesa}"/>`;
  b += doc.text(F.bold, P.status, { x: 114, y: chipY + chipH / 2 + 7, size: 20, fill: C.tinta }).svg;
  const c2x = 66 + chip1W + 14;
  const t2 = doc.text(F.bold, P.location, { x: 0, y: 0, size: 20 });
  const chip2W = 20 + 24 + 10 + t2.width + 24;
  b += `<rect x="${r(c2x)}" y="${chipY}" width="${r(chip2W)}" height="${chipH}" rx="${chipH / 2}" fill="none" stroke="${C.cal}" stroke-opacity=".5" stroke-width="2"/>`;
  b += lucide('map-pin', { x: c2x + 20, y: chipY + chipH / 2 - 12, size: 24, color: C.cempasuchil, sw: 2.2 });
  b += doc.text(F.bold, P.location, { x: c2x + 20 + 24 + 10, y: chipY + chipH / 2 + 7, size: 20, fill: C.cal }).svg;
  b += `</g>`;

  // ── Avatar tipo sticker ─────────────────────────────────────────────────
  const avData = fs.readFileSync(avatarFile).toString('base64');
  const imgS = AV.R * 2.08;
  b += `<g class="in" style="animation-delay:.25s">`;
  b += `<circle cx="${AV.cx + 13}" cy="${AV.cy + 13}" r="${AV.R + 3}" fill="${C.cempasuchil}"/>`;
  b += `<circle cx="${AV.cx}" cy="${AV.cy}" r="${AV.R}" fill="${C.chile}"/>`;
  b += `<circle cx="${AV.cx}" cy="${AV.cy}" r="${AV.R}" fill="url(#halftone)"/>`;
  b += `<image href="data:image/webp;base64,${avData}" x="${r(AV.cx - imgS / 2)}" y="${r(AV.cy - imgS / 2 + AV.R * 0.16)}" width="${r(imgS)}" height="${r(imgS)}" clip-path="url(#clipAvatar)"/>`;
  b += `<circle cx="${AV.cx}" cy="${AV.cy}" r="${AV.R + 3}" fill="none" stroke="${C.cal}" stroke-width="7"/>`;
  b += `</g>`;
  const stars = [
    [AV.cx - AV.R - 26, AV.cy - AV.R * 0.5, 24, C.cempasuchil, -0.4],
    [AV.cx + AV.R + 6, AV.cy - AV.R * 0.86, 17, C.cal, -1.6],
    [AV.cx + AV.R * 0.78, AV.cy + AV.R + 26, 13, C.rosa, -2.3],
  ];
  for (const [x, y, s, col, lag] of stars) {
    b += `<path class="tw" style="--l:${lag}s" d="${sparkle(x, y, s)}" fill="${col}"/>`;
  }

  // Borde interior sutil
  b += `<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="29.5" fill="none" stroke="${C.cal}" stroke-opacity=".1" stroke-width="1.5"/>`;
  b += `</g>`;
  doc.add(b);
  return doc.render();
}

/**
 * Texto que se escribe y se borra letra por letra (SMIL, funciona dentro de <img> en GitHub).
 * Estado base (sin animación): la primera frase completa.
 */
function typed(doc, tf, phrases, { x, y, size, fill }) {
  const dtType = 0.055;
  const hold = 1.8;
  const dtErase = 0.028;
  const gap = 0.35;
  let t = 0.6;
  const plan = phrases.map((str) => {
    const { glyphs } = tf.layout(str, { size });
    const n = glyphs.length;
    const p = { str, n, start: t, glyphs };
    p.typeEnd = t + n * dtType;
    p.eraseStart = p.typeEnd + hold;
    p.eraseEnd = p.eraseStart + n * dtErase;
    t = p.eraseEnd + gap;
    return p;
  });
  const T = +t.toFixed(3);
  const s = size / tf.upm;
  const f = (v) => (v / T).toFixed(4);

  let out = '';
  plan.forEach((p, pi) => {
    const g = doc.text(tf, p.str, {
      x,
      y,
      size,
      fill,
      attrs: '',
      glyphAttrs: (_gl, i) => `opacity="${pi === 0 ? 1 : 0}"`,
      glyphKids: (_gl, i) => {
        const on = p.start + i * dtType;
        const off = p.eraseStart + (p.n - 1 - i) * dtErase;
        return `<animate attributeName="opacity" calcMode="discrete" values="0;1;0" keyTimes="0;${f(on)};${f(off)}" dur="${T}s" repeatCount="indefinite"/>`;
      },
    });
    out += g.svg;
    p.layout = g;
  });

  // Cursor: sigue el borde derecho del texto visible.
  const ev = [[0, 0]];
  plan.forEach((p) => {
    const endX = (i) => (i < 0 ? 0 : (p.glyphs[i].x + p.glyphs[i].adv) * s);
    ev.push([p.start, 0]);
    for (let i = 0; i < p.n; i++) ev.push([p.start + i * dtType, endX(i)]);
    for (let i = p.n - 1; i >= 0; i--) ev.push([p.eraseStart + (p.n - 1 - i) * dtErase, endX(i - 1)]);
  });
  ev.sort((a, b) => a[0] - b[0]);
  const times = [];
  const xs = [];
  for (const [tm, cx] of ev) {
    if (times.length && Math.abs(times[times.length - 1] - tm) < 1e-6) xs[xs.length - 1] = cx;
    else {
      times.push(tm);
      xs.push(cx);
    }
  }
  times[0] = 0;
  const curH = size * 0.78;
  const staticX = x + (plan[0].glyphs.at(-1).x + plan[0].glyphs.at(-1).adv) * s + 6;
  out +=
    `<rect y="${r(y - size * 0.7)}" width="5" height="${r(curH)}" rx="1.5" fill="${C.cempasuchil}" x="${r(staticX)}">` +
    `<animate attributeName="x" calcMode="discrete" dur="${T}s" repeatCount="indefinite" ` +
    `keyTimes="${times.map(f).join(';')}" values="${xs.map((v) => r(x + v + 6, 1)).join(';')}"/>` +
    `<animate attributeName="opacity" calcMode="discrete" values="1;0" keyTimes="0;.5" dur=".9s" repeatCount="indefinite"/>` +
    `</rect>`;
  return out;
}
