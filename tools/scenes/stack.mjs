// Stack: carriles de pegatinas que se desplazan (uno por categoría), con desvanecido en los bordes.

import { Doc, REDUCED_MOTION } from '../lib/svg.mjs';
import { C } from '../lib/theme.mjs';
import { brand, brandOnDark, brandIcon, lucide } from '../lib/icons.mjs';
import { r } from '../lib/util.mjs';

const W = 1000;

export const LANES = [
  {
    label: 'Frontend',
    color: C.turquesa,
    items: [
      ['Next.js', 'nextdotjs'], ['React', 'react'], ['TypeScript', 'typescript'], ['JavaScript', 'javascript'],
      ['Tailwind CSS', 'tailwindcss'], ['HTML5', 'html5'], ['Vite', 'vite'], ['GSAP', 'gsap'], ['Figma', 'figma'],
    ],
  },
  {
    label: 'Backend y datos',
    color: C.cempasuchil,
    items: [
      ['Python', 'python'], ['FastAPI', 'fastapi'], ['Node.js', 'nodedotjs'], ['Express', 'express'],
      ['Supabase', 'supabase'], ['PostgreSQL', 'postgresql'], ['MongoDB', 'mongodb'], ['MySQL', 'mysql'],
      ['JWT', 'jsonwebtokens'], ['Stripe', 'stripe'], ['PayPal', 'paypal'], ['MercadoPago', 'mercadopago'],
    ],
  },
  {
    label: 'IA y automatización',
    color: C.rosa,
    items: [
      ['OpenAI', { lucide: 'sparkles' }], ['LangChain', 'langchain'], ['RAG', { lucide: 'database' }], ['n8n', 'n8n'],
      ['WhatsApp API', 'whatsapp'], ['Zoho CRM', 'zoho'], ['Meta Cloud API', 'meta'], ['Webhooks', { lucide: 'webhook' }],
    ],
  },
  {
    label: 'Nube y herramientas',
    color: C.chile,
    items: [
      ['Vercel', 'vercel'], ['Google Cloud', 'googlecloud'], ['AWS', { lucide: 'cloud' }], ['Docker', 'docker'],
      ['Ubuntu', 'ubuntu'], ['Git', 'git'], ['GitHub', 'github'], ['Postman', 'postman'], ['Claude Code', 'claude'],
    ],
  },
];

export function stack({ F }) {
  const chipH = 54;
  const sh = 5; // sombra dura
  const laneH = chipH + sh;
  const gapY = 16;
  const H = LANES.length * laneH + (LANES.length - 1) * gapY + 6;
  const doc = new Doc({
    w: W,
    h: H,
    title: 'Stack',
    desc: LANES.map((l) => `${l.label}: ${l.items.map((i) => i[0]).join(', ')}`).join('. '),
  });

  // etiquetas de categoría (fijas)
  const labelSize = 22;
  const labelW = Math.max(...LANES.map((l) => F.title.measure(l.label, labelSize))) + 44;
  const laneX = labelW + 28;
  const visible = W - laneX;

  let css = REDUCED_MOTION;
  let b = '';
  doc.def(
    `<linearGradient id="fade" x1="${laneX}" x2="${W}" gradientUnits="userSpaceOnUse">` +
      `<stop offset="0" stop-color="#000"/><stop offset=".07" stop-color="#fff"/>` +
      `<stop offset=".93" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>`,
  );
  doc.def(`<mask id="m" maskUnits="userSpaceOnUse" x="${laneX}" y="0" width="${visible}" height="${H}"><rect x="${laneX}" width="${visible}" height="${H}" fill="url(#fade)"/></mask>`);

  const chipSvg = (name, ic, color, x) => {
    const size = 21;
    const tw = F.bold.measure(name, size);
    const w = Math.ceil(10 + 34 + 12 + tw + 20);
    let s = `<rect x="${r(x + sh)}" y="${sh}" width="${w}" height="${chipH}" rx="${chipH / 2}" fill="${color}"/>`;
    s += `<rect x="${r(x + 0.75)}" y=".75" width="${w - 1.5}" height="${chipH - 1.5}" rx="${(chipH - 1.5) / 2}" fill="${C.cal}" stroke="${C.tinta}" stroke-width="1.5"/>`;
    s += `<circle cx="${r(x + 10 + 17)}" cy="${chipH / 2}" r="17" fill="${C.tinta}"/>`;
    if (typeof ic === 'string' && brand(ic)) s += brandIcon(ic, { x: x + 10 + 17 - 10.5, y: chipH / 2 - 10.5, size: 21, fill: brandOnDark(ic) });
    else if (ic && ic.lucide) s += lucide(ic.lucide, { x: x + 10 + 17 - 10.5, y: chipH / 2 - 10.5, size: 21, color: C.cal, sw: 2.2 });
    s += doc.text(F.bold, name, { x: x + 10 + 34 + 12, y: chipH / 2 + F.bold.capHeight(size) / 2, size, fill: C.tinta }).svg;
    return { s, w: w + sh };
  };

  LANES.forEach((lane, li) => {
    const y = li * (laneH + gapY) + 3;
    // etiqueta
    const lw = labelW;
    b += `<g transform="translate(0 ${y})"><rect x="${sh}" y="${sh}" width="${r(lw)}" height="${chipH}" rx="12" fill="${C.tinta}"/>`;
    b += `<rect width="${r(lw)}" height="${chipH}" rx="12" fill="${lane.color}"/>`;
    b += doc.text(F.title, lane.label, { x: 22, y: chipH / 2 + F.title.capHeight(labelSize) / 2, size: labelSize, fill: C.tinta }).svg;
    b += `</g>`;

    // carril
    const gap = 16;
    let x = 0;
    let row = '';
    for (const [name, ic] of lane.items) {
      const c = chipSvg(name, ic, lane.color, x);
      row += c.s;
      x += c.w + gap;
    }
    const gw = Math.ceil(x);
    const copies = Math.max(2, Math.ceil((visible + gw) / gw) + 0);
    let all = '';
    for (let k = 0; k < copies; k++) all += `<g transform="translate(${k * gw} 0)">${row}</g>`;
    const dir = li % 2 === 0 ? 'l' : 'r';
    const dur = Math.round(gw / 38);
    css +=
      `.m${li}{animation:m${li} ${dur}s linear infinite}` +
      `@keyframes m${li}{from{transform:translateX(${dir === 'l' ? 0 : -gw}px)}to{transform:translateX(${dir === 'l' ? -gw : 0}px)}}`;
    b += `<g mask="url(#m)"><g transform="translate(${laneX} ${y})"><g class="m${li}">${all}</g></g></g>`;
  });

  doc.css(css);
  doc.add(b);
  return doc.render();
}
