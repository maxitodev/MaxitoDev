// Botones tipo etiqueta de papel con sombra dura. Cada uno es un SVG aparte (para poder enlazarlo).

import { Doc } from '../lib/svg.mjs';
import { C } from '../lib/theme.mjs';
import { lucide } from '../lib/icons.mjs';
import { r } from '../lib/util.mjs';

const H = 62;
const SH = 7;

export function button({ F, label, icon, bg, fg, shadow, desc }) {
  const size = 23;
  const tw = F.bold.measure(label, size);
  const iconS = 26;
  const w = Math.ceil(26 + iconS + 12 + tw + 30);
  const doc = new Doc({ w: w + SH, h: H + SH, title: label, desc });
  let b = `<rect x="${SH}" y="${SH}" width="${w}" height="${H}" rx="${H / 2}" fill="${shadow}"/>`;
  b += `<rect x=".75" y=".75" width="${w - 1.5}" height="${H - 1.5}" rx="${(H - 1.5) / 2}" fill="${bg}" stroke="${C.tinta}" stroke-width="1.5"/>`;
  const iy = (H - iconS) / 2;
  if (icon.lucide) b += lucide(icon.lucide, { x: 26, y: iy, size: iconS, color: fg, sw: 2.2 });
  if (icon.mono) {
    // Monograma (para marcas sin icono libre): cuadrado redondeado con letras
    b += `<rect x="26" y="${r(iy)}" width="${iconS}" height="${iconS}" rx="6" fill="${fg}"/>`;
    b += doc.text(F.bold, icon.mono, { x: 26 + iconS / 2, y: iy + iconS / 2 + 7.5, size: 20, fill: bg, anchor: 'middle' }).svg;
  }
  b += doc.text(F.bold, label, { x: 26 + iconS + 12, y: H / 2 + F.bold.capHeight(size) / 2, size, fill: fg }).svg;
  doc.add(b);
  return doc.render();
}

export const BUTTONS = (F, P) => ({
  'btn-portafolio.svg': () =>
    button({ F, label: 'Ver portafolio', icon: { lucide: 'globe' }, bg: C.chile, fg: C.cal, shadow: C.cempasuchil, desc: P.site }),
  'btn-proyecto.svg': () =>
    button({ F, label: 'Cuéntame tu proyecto', icon: { lucide: 'message-circle-heart' }, bg: C.chile, fg: C.cal, shadow: C.cempasuchil, desc: P.contactUrl }),
  'btn-linkedin.svg': () =>
    button({ F, label: 'Conectar en LinkedIn', icon: { mono: 'in' }, bg: C.cal, fg: C.tinta, shadow: C.rosa, desc: P.linkedin }),
  'btn-email.svg': () =>
    button({ F, label: 'Escribirme un correo', icon: { lucide: 'mail' }, bg: C.cal, fg: C.tinta, shadow: C.turquesa, desc: P.email }),
});
