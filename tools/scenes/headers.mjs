// Encabezados de sección: un banderín de papel picado colgado de un cordel.

import { Doc, REDUCED_MOTION } from '../lib/svg.mjs';
import { C } from '../lib/theme.mjs';
import { banner, quadAt } from '../lib/papel.mjs';
import { r, darken } from '../lib/util.mjs';

const W = 1000;
const H = 104;

export function sectionHeader({ F, title, sub, color }) {
  const doc = new Doc({ w: W, h: H, title, desc: sub });
  doc.css(
    `.sw{transform-box:view-box;animation:sw 5.6s ease-in-out infinite alternate}` +
      `@keyframes sw{from{transform:rotate(-1.6deg)}to{transform:rotate(1.6deg)}}` +
      REDUCED_MOTION,
  );
  const size = 50;
  const tw = F.display.measure(title, size);
  const fw = Math.max(230, tw + 108);
  const fh = 78;
  const left = 10;
  const p0 = [-10, 8];
  const p1 = [W / 2, 30];
  const p2 = [W + 10, 8];
  // Punto del cordel donde cuelga el banderín (centro del banderín).
  const ax = left + fw / 2;
  const t = (ax - p0[0]) / (p2[0] - p0[0]);
  const pt = quadAt(p0, p1, p2, t);

  let b = `<path d="M${p0} Q${p1} ${p2}" fill="none" stroke="${C.cordel}" stroke-width="2.2"/>`;
  b += `<g transform="translate(${r(pt.x)} ${r(pt.y)})"><g class="sw">`;
  b += banner({ w: fw, h: fh, fill: color, fold: darken(color, 0.28) });
  const baseline = 8 + (fh - 8 - 9) / 2 + F.display.capHeight(size) / 2 + 2;
  b += doc.text(F.display, title, { x: -tw / 2, y: baseline, size, fill: C.tinta }).svg;
  b += `</g></g>`;
  if (sub) {
    b += doc.text(F.text, sub, { x: left + fw + 30, y: pt.y + 46, size: 23, fill: C.cordel }).svg;
  }
  doc.add(b);
  return doc.render();
}
