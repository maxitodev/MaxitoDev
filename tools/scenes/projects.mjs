// Tarjetas de proyecto: papel crema con sombra dura, ilustración plana arriba y datos reales abajo.
// Los textos salen de lo que cada sitio dice de sí mismo (revisado en octubre de 2026).

import { Doc, REDUCED_MOTION } from '../lib/svg.mjs';
import { C } from '../lib/theme.mjs';
import { lucide } from '../lib/icons.mjs';
import { chipRow, paragraph } from '../lib/ui.mjs';
import { wrap, darken } from '../lib/util.mjs';

const W = 500;
const SH = 10; // sombra dura
const ART = 160; // alto de la ilustración
const PAD = 30;
const BODY = 20; // tamaño del texto
const LH = 27;
const CHIP_H = 32;
const w = W - SH;
const H = ART + 242 + SH; // mismo alto en las cuatro tarjetas
const h = H - SH;

export function projectCard({ F, p }) {
  const doc = new Doc({ w: W, h: H, title: p.name, desc: `${p.text} ${p.url}` });
  doc.css(
    `.eq{transform-box:fill-box;transform-origin:50% 100%;animation:eq 1.5s ease-in-out infinite alternate}` +
      `@keyframes eq{from{transform:scaleY(.38)}to{transform:scaleY(1)}}` +
      REDUCED_MOTION,
  );
  doc.def(`<clipPath id="art"><path d="M0 ${ART}V22A22 22 0 0 1 22 0H${w - 22}A22 22 0 0 1 ${w} 22V${ART}Z"/></clipPath>`);
  doc.def(
    `<pattern id="ht" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">` +
      `<circle cx="5" cy="5" r="2" fill="${darken(p.color, 0.35)}" fill-opacity=".45"/></pattern>`,
  );

  let b = `<rect x="${SH}" y="${SH}" width="${w}" height="${h}" rx="22" fill="${p.shadow}"/>`;
  b += `<rect width="${w}" height="${h}" rx="22" fill="${C.cal}"/>`;
  b += `<g clip-path="url(#art)"><rect width="${w}" height="${ART}" fill="${p.color}"/><rect width="${w}" height="${ART}" fill="url(#ht)"/>`;
  b += artFor(p);
  b += `</g>`;
  b += `<line x1="22" x2="${w - 22}" y1="${ART}" y2="${ART}" stroke="${C.tinta}" stroke-opacity=".45" stroke-width="3" stroke-linecap="round" stroke-dasharray=".1 9"/>`;
  b += `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="21" fill="none" stroke="${C.tinta}" stroke-width="2"/>`;

  // botón-pegatina que cruza el borde entre ilustración y papel (indica que la tarjeta abre el sitio)
  const bx = w - PAD - 26;
  b += `<circle cx="${bx}" cy="${ART}" r="31" fill="${C.cal}"/><circle cx="${bx}" cy="${ART}" r="26" fill="${C.tinta}"/>`;
  b += lucide('arrow-up-right', { x: bx - 14, y: ART - 14, size: 28, color: C.cal, sw: 2.4 });

  // título + dominio
  b += doc.text(F.display, p.name, { x: PAD, y: ART + 64, size: 46, fill: C.tinta }).svg;
  const dom = p.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  b += doc.text(F.mono, dom, { x: w - PAD, y: ART + 64, size: 17, fill: C.tinta, opacity: 0.72, anchor: 'end' }).svg;

  // descripción (máximo 3 líneas)
  const lines = wrap(F.text, p.text, BODY, w - PAD * 2);
  if (lines.length > 3) throw new Error(`${p.name}: la descripción ocupa ${lines.length} líneas`);
  const para = paragraph(doc, F.text, lines, { x: PAD, y: ART + 108, size: BODY, lh: LH, fill: C.tinta, opacity: 0.92 });
  b += para.svg;

  // etiquetas (una sola fila)
  const ty = ART + 108 + 2 * LH + 22;
  const row = chipRow(doc, F.bold, p.tags, { x: PAD, y: ty, maxW: w - PAD * 2, size: 16.5, h: CHIP_H, padX: 14, fg: C.tinta, stroke: C.tinta, sw: 1.8 });
  if (row.h > CHIP_H) throw new Error(`${p.name}: las etiquetas no caben en una fila`);
  b += row.svg;

  doc.add(b);
  return doc.render();
}

function artFor(p) {
  let s = '';
  const cx = w / 2;
  switch (p.art) {
    case 'eq': {
      // ecualizador (salsa / música) + globo (ciudades de todo el mundo)
      const hs = [58, 92, 124, 76, 108, 64, 96, 52];
      hs.forEach((hh, i) => {
        s += `<rect class="eq" style="animation-delay:-${(i * 0.37).toFixed(2)}s;animation-duration:${(1.1 + (i % 4) * 0.22).toFixed(2)}s" x="${34 + i * 30}" y="${ART - 22 - hh}" width="18" height="${hh}" rx="9" fill="${C.cal}"/>`;
      });
      s += lucide('globe', { x: w - 168, y: 22, size: 112, color: C.cal, sw: 1.6 });
      break;
    }
    case 'chat':
      s += lucide('message-circle-heart', { x: 56, y: 22, size: 118, color: C.tinta, sw: 1.7 });
      s += lucide('calendar-check', { x: w - 190, y: 38, size: 100, color: C.cal, sw: 1.7 });
      s += `<circle cx="${w - 60}" cy="30" r="7" fill="${C.cal}"/><circle cx="${w - 92}" cy="${ART - 24}" r="5" fill="${C.tinta}"/>`;
      break;
    case 'energy':
      s += lucide('zap', { x: 52, y: 20, size: 120, color: C.tinta, sw: 1.7 });
      s += lucide('flame', { x: w - 176, y: 22, size: 120, color: C.tinta, sw: 1.7 });
      s += `<circle cx="${cx}" cy="${ART / 2}" r="6" fill="${C.tinta}"/>`;
      break;
    case 'brain':
      s += lucide('brain-circuit', { x: 54, y: 18, size: 124, color: C.cal, sw: 1.6 });
      s += lucide('workflow', { x: w - 176, y: 38, size: 100, color: C.cal, sw: 1.7 });
      s += `<circle cx="${cx + 6}" cy="${ART / 2}" r="6" fill="${C.cal}"/>`;
      break;
  }
  return s;
}

export const PROJECTS = [
  {
    file: 'proj-salzoom.svg',
    name: 'SalZOOM 360',
    url: 'https://salzoom.com',
    text: 'Concierge con IA y datos en vivo: encuentra clases, socials y congresos de salsa en cualquier ciudad.',
    tags: ['Búsqueda con IA', 'ES / EN', 'Videoteca'],
    color: C.rosa,
    shadow: C.cempasuchil,
    art: 'eq',
  },
  {
    file: 'proj-contiggo.svg',
    name: 'Contiggo',
    url: 'https://contiggo.app',
    text: 'Terapia en línea con psicólogos verificados: reserva, paga y toma tu sesión por videollamada.',
    tags: ['Videollamada', 'Reservas', 'Para psicólogos'],
    color: C.turquesa,
    shadow: C.rosa,
    art: 'chat',
  },
  {
    file: 'proj-triaestalvi.svg',
    name: 'Tria Estalvi',
    url: 'https://triaestalvi.com',
    text: 'Analiza tus facturas de luz y gas, compara tarifas y te ayuda a cambiar de contrato sin llamadas.',
    tags: ['CA / ES / EN', 'Panel de suministros', 'Alertas'],
    color: C.cempasuchil,
    shadow: C.turquesa,
    art: 'energy',
  },
  {
    file: 'proj-elementio.svg',
    name: 'elementio',
    url: 'https://elementio.mx',
    text: 'Consultora de IA, datos y automatización para empresas de México y Latinoamérica.',
    tags: ['Casos por industria', 'Metodología', 'Equipo'],
    color: C.azul,
    shadow: C.chile,
    art: 'brain',
  },
];
