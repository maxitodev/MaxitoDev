// "Sobre mí" como ventana de editor: tu perfil escrito como objeto de código.

import { Doc, REDUCED_MOTION } from '../lib/svg.mjs';
import { C } from '../lib/theme.mjs';
import { r } from '../lib/util.mjs';

const W = 1000;

// Colores de sintaxis pensados para el fondo vino
const S = {
  kw: '#ff7ab8',
  prop: C.cempasuchil,
  str: '#7fe3d4',
  bool: '#ff6b5e',
  punct: '#cdb8b3',
  com: '#8f7a78',
  plain: C.cal,
};

export function terminal({ F, P, code }) {
  const size = 22;
  const lh = 38;
  const top = 74; // alto de la barra de título
  const padX = 28;
  const gutter = 52;
  const H = top + 26 + code.length * lh + 26;
  const doc = new Doc({
    w: W,
    h: H + 12,
    title: `Sobre ${P.handle}`,
    desc: code.map((l) => l.map(([t]) => t).join('')).join('\n'),
  });
  doc.css(`.cur{animation:blink 1.1s steps(1) infinite}@keyframes blink{50%{opacity:0}}` + REDUCED_MOTION);

  let b = `<rect x="12" y="12" width="${W - 12}" height="${H}" rx="18" fill="${C.chile}"/>`; // sombra dura
  b += `<rect width="${W - 12}" height="${H}" rx="18" fill="${C.mole}"/>`;
  // barra de título
  b += `<path d="M0 ${top}V18a18 18 0 0 1 18-18H${W - 30}a18 18 0 0 1 18 18V${top}Z" fill="${C.mole2}"/>`;
  [C.chileHot, C.cempasuchil, C.turquesa].forEach((col, i) => {
    b += `<circle cx="${34 + i * 28}" cy="${top / 2}" r="8.5" fill="${col}"/>`;
  });
  // pestaña
  const tab = 'maxitodev.config.ts';
  const tw = F.mono.measure(tab, 19);
  b += ` <rect x="150" y="${top - 46}" width="${r(tw + 60)}" height="46" rx="10" fill="${C.mole}"/>`;
  b += doc.text(F.mono, tab, { x: 184, y: top - 16, size: 19, fill: C.cal }).svg;
  b += `<circle cx="${r(150 + 22)}" cy="${top - 23}" r="4.5" fill="${C.cempasuchil}"/>`;

  // código
  const cw = F.mono.measure('M', size);
  code.forEach((line, i) => {
    const y = top + 26 + i * lh + 27;
    b += doc.text(F.mono, String(i + 1), { x: padX + gutter - 18, y, size: 18, fill: C.cordel, anchor: 'end' }).svg;
    let x = padX + gutter + 8;
    for (const [txt, kind] of line) {
      const t = doc.text(F.mono, txt, { x, y, size, fill: S[kind] || S.plain });
      b += t.svg;
      x += txt.length * cw;
    }
    if (i === code.length - 1) {
      b += `<rect class="cur" x="${r(x + 4)}" y="${r(y - 22)}" width="11" height="28" rx="2" fill="${C.cempasuchil}"/>`;
    }
  });
  doc.add(b);
  return { svg: doc.render(), widthChars: Math.max(...code.map((l) => l.reduce((a, [t]) => a + t.length, 0))), cw };
}

/** Líneas del código mostrado en "Sobre mí" (token, tipo). */
export function aboutCode(P) {
  const k = (t) => [t, 'prop'];
  const s = (t) => [t, 'str'];
  const p = (t) => [t, 'punct'];
  return [
    [['export ', 'kw'], ['const ', 'kw'], ['maxitodev ', 'plain'], p('= {')],
    [p('  '), k('nombre'), p(':     '), s(`"${P.fullName}"`), p(',')],
    [p('  '), k('rol'), p(':        '), s('"Desarrollador full-stack freelance"'), p(',')],
    [p('  '), k('estudia'), p(':    '), s('"Ing. en Computación, UAM Cuajimalpa"'), p(',')],
    [p('  '), k('base'), p(':       '), s(`"${P.location}"`), p(',')],
    [p('  '), k('construyo'), p(':  ['), s('"Chatbots con IA"'), p(', '), s('"WhatsApp"'), p(', '), s('"E-commerce"'), p('],')],
    [p('  '), k('stack'), p(':      ['), s('"Next.js"'), p(', '), s('"Supabase"'), p(', '), s('"FastAPI"'), p(', '), s('"n8n"'), p('],')],
    [p('  '), k('disponible'), p(': '), ['true', 'bool'], p(',')],
    [p('};')],
    [['// ¿Hablamos? ', 'com'], ['maxitodev.com', 'com']],
  ];
}
