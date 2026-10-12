// Cierre: la misma guirnalda del encabezado, pero colgando sobre el texto final.

import { Doc, REDUCED_MOTION } from '../lib/svg.mjs';
import { C } from '../lib/theme.mjs';
import { lucide } from '../lib/icons.mjs';
import { flag, quadAt } from '../lib/papel.mjs';
import { r, darken, pick } from '../lib/util.mjs';

const W = 1000;
const H = 236;

export function footer({ F, P }) {
  const doc = new Doc({ w: W, h: H, title: 'Gracias por pasar por aquí', desc: `Hecho en ${P.location}.` });
  doc.css(
    `.sw{animation:sw var(--d) ease-in-out var(--l) infinite alternate}` +
      `@keyframes sw{from{transform:rotate(-2.8deg)}to{transform:rotate(2.8deg)}}` +
      REDUCED_MOTION,
  );

  const p0 = [-14, 12];
  const p1 = [W / 2, 52];
  const p2 = [W + 14, 12];
  let b = `<path d="M${p0} Q${p1} ${p2}" fill="none" stroke="${C.cordel}" stroke-width="2.2"/>`;
  const N = 13;
  const colors = [C.chile, C.cempasuchil, C.rosa, C.turquesa, C.azul];
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N;
    const pt = quadAt(p0, p1, p2, t);
    const fill = pick(colors, i * 2 + 1);
    const rot = ((pt.angle * 180) / Math.PI) * 0.45;
    const dur = (4.6 + ((i * 37) % 9) / 6).toFixed(1);
    const lag = -((i * 53) % 40) / 10;
    b +=
      `<g transform="translate(${r(pt.x)} ${r(pt.y)}) rotate(${r(rot, 1)})">` +
      `<g class="sw" style="--d:${dur}s;--l:${lag}s">` +
      flag({ w: 62, h: 92, style: (i + 1) % 3, fill, fold: darken(fill, 0.28) }) +
      `</g></g>`;
  }

  // texto final
  const line = 'Gracias por pasar por aquí.';
  const size = 36;
  b += doc.text(F.title, line, { x: W / 2, y: 176, size, fill: C.chile, anchor: 'middle' }).svg;
  const place = P.location;
  const ps = 18;
  const tw = F.bold.measure(`Hecho en ${place}`, ps);
  const x0 = W / 2 - (22 + 8 + tw) / 2;
  b += lucide('map-pin', { x: x0, y: 196, size: 22, color: C.cempasuchil, sw: 2.2 });
  b += doc.text(F.bold, `Hecho en ${place}`, { x: x0 + 30, y: 196 + 16.5, size: ps, fill: C.cordel }).svg;

  doc.add(b);
  return doc.render();
}
