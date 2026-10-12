// "Qué hago": un bloque principal (IA y automatización, con mini conversación animada)
// y tres bloques secundarios. El tamaño del bloque comunica prioridad.

import { Doc, REDUCED_MOTION } from '../lib/svg.mjs';
import { C } from '../lib/theme.mjs';
import { lucide } from '../lib/icons.mjs';
import { tile } from '../lib/papel.mjs';
import { chipRow, paragraph } from '../lib/ui.mjs';
import { r, wrap } from '../lib/util.mjs';

const W = 1000;
const H = 640;

export function services({ F, S }) {
  const doc = new Doc({
    w: W,
    h: H,
    title: 'Qué hago',
    desc: [S.main.title + ': ' + S.main.text, ...S.items.map((i) => i.title + ': ' + i.text)].join(' '),
  });
  doc.css(
    `.b1{animation:b1 10s infinite}` +
      `@keyframes b1{0%,4%{opacity:0;transform:translateY(12px)}9%,86%{opacity:1;transform:none}93%,100%{opacity:0}}` +
      `.b2{animation:b2 10s infinite}` +
      `@keyframes b2{0%,28%{opacity:0;transform:translateY(12px)}33%,86%{opacity:1;transform:none}93%,100%{opacity:0}}` +
      `.ty{opacity:0;animation:ty 10s infinite}` +
      `@keyframes ty{0%,14%{opacity:0}16%,27%{opacity:1}29%,100%{opacity:0}}` +
      `.dt{animation:dt .9s ease-in-out infinite}` +
      `@keyframes dt{0%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}` +
      REDUCED_MOTION,
  );

  let b = '';

  // ── Bloque principal ────────────────────────────────────────────────────
  const mw = 548;
  b += tile({ w: mw, h: H, rad: 26, both: true, fill: C.chile });
  const px = 40;
  const innerW = mw - px * 2;
  b += lucide(S.main.icon, { x: px, y: 52, size: 46, color: C.cempasuchil, sw: 2 });
  b += doc.text(F.display, S.main.title, { x: px, y: 172, size: 72, fill: C.cal }).svg;
  const lines = wrap(F.text, S.main.text, 23, innerW);
  b += paragraph(doc, F.text, lines, { x: px, y: 218, size: 23, lh: 32, fill: C.cal, opacity: 0.94 }).svg;

  // conversación de ejemplo
  const cy = 218 + lines.length * 32 + 22;
  const bub = (tf, text, { x, y, maxW, fill, fg, tail }) => {
    const ls = wrap(tf, text, 21, maxW - 36);
    const tw = Math.max(...ls.map((l) => tf.measure(l, 21)));
    const w = Math.ceil(tw + 36);
    const h = ls.length * 28 + 26;
    const bx = tail === 'right' ? x + (maxW - w) : x;
    let s = `<rect x="${r(bx)}" y="${r(y)}" width="${w}" height="${h}" rx="20" fill="${fill}"/>`;
    s +=
      tail === 'right'
        ? `<path d="M${r(bx + w - 26)} ${r(y + h - 1)}l22 12-4-18z" fill="${fill}"/>`
        : `<path d="M${r(bx + 26)} ${r(y + h - 1)}l-22 12 4-18z" fill="${fill}"/>`;
    ls.forEach((l, i) => {
      s += doc.text(tf, l, { x: bx + 18, y: y + 31 + i * 28, size: 21, fill: fg }).svg;
    });
    return { s, w, h, bx };
  };
  const u = bub(F.text, S.chat.user, { x: px, y: cy, maxW: 390, fill: C.cal, fg: C.tinta, tail: 'left' });
  const botY = cy + u.h + 26;
  const a = bub(F.text, S.chat.bot, { x: px, y: botY, maxW: innerW, fill: C.tinta, fg: C.cal, tail: 'right' });
  b += `<g class="b1">${u.s}</g>`;
  b += `<g class="b2">${a.s}</g>`;
  // puntos de "escribiendo…" (ocupan el lugar de la respuesta)
  const dx = px + innerW - 100;
  b += `<g class="ty"><rect x="${dx}" y="${botY}" width="100" height="52" rx="20" fill="${C.tinta}"/>`;
  for (let i = 0; i < 3; i++) b += `<circle class="dt" style="animation-delay:${i * 0.15}s" cx="${dx + 28 + i * 22}" cy="${botY + 26}" r="5.5" fill="${C.cal}"/>`;
  b += `</g>`;

  // etiquetas de tecnología
  b += chipRow(doc, F.bold, S.main.tags, { x: px, y: H - 34 - 44, maxW: innerW, size: 17, h: 34, fg: C.cal, stroke: C.cal, sw: 1.8 }).svg;

  // ── Bloques secundarios ─────────────────────────────────────────────────
  const gap = 20;
  const sx = mw + gap;
  const sw = W - sx;
  const sh = (H - gap * 2) / 3;
  S.items.forEach((it, i) => {
    const y = i * (sh + gap);
    b += `<g transform="translate(${sx} ${r(y)})">`;
    b += tile({ w: sw, h: sh, rad: 22, fill: it.color });
    b += lucide(it.icon, { x: 30, y: 40, size: 40, color: C.tinta, sw: 2 });
    b += doc.text(F.title, it.title, { x: 30 + 40 + 16, y: 40 + 30, size: 36, fill: C.tinta }).svg;
    const ls = wrap(F.text, it.text, 20, sw - 60);
    b += paragraph(doc, F.text, ls, { x: 30, y: 116, size: 20, lh: 26, fill: C.tinta, opacity: 0.92 }).svg;
    b += `</g>`;
  });

  doc.add(b);
  return doc.render();
}

export const SERVICES = {
  main: {
    icon: 'bot',
    title: 'IA y automatización',
    text: 'Chatbots que atienden a tus clientes, WhatsApp conectado a tu CRM y flujos que trabajan solos.',
    tags: ['Meta Cloud API', 'n8n', 'Zoho CRM', 'RAG'],
  },
  chat: {
    user: 'Hola, ¿cuánto cuesta el envío a Guadalajara?',
    bot: '$99 y llega en 2 días. ¿Te armo el pedido?',
  },
  items: [
    {
      icon: 'shopping-cart',
      title: 'Tiendas que cobran',
      text: 'Carrito, inventario y cobros con Stripe, PayPal o MercadoPago.',
      color: C.cempasuchil,
    },
    {
      icon: 'layout-dashboard',
      title: 'Apps web rápidas',
      text: 'Next.js, React y Tailwind: responsivas, con buen SEO y listas para crecer.',
      color: C.turquesa,
    },
    {
      icon: 'server',
      title: 'Backend y nube',
      text: 'APIs con FastAPI o Node, login seguro y despliegue en Vercel o la nube.',
      color: C.rosa,
    },
  ],
};
