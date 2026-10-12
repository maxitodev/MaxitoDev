// Actividad: tres cifras en papel picado + calendario de contribuciones con una serpiente que se las come.
// Los datos vienen de data/activity.json (lo actualiza una GitHub Action cada día).
// Sin datos reales se dibuja el calendario vacío y las cifras muestran "—".

import { Doc } from '../lib/svg.mjs';
import { C } from '../lib/theme.mjs';
import { tile } from '../lib/papel.mjs';
import { summarize, layoutWeeks, fmt } from '../lib/activity.mjs';
import { r } from '../lib/util.mjs';

const W = 1000;
const LEVEL = ['#8f7a76', '#ffd166', '#ff9f1c', C.chile, C.rosa]; // 0 = vacío (se dibuja con transparencia)
const EMPTY_OPACITY = 0.22;

const T = 34; // segundos por vuelta
const MOVE = 0.9; // fracción de la vuelta en la que la serpiente avanza
const BODY = 7; // segmentos detrás de la cabeza

export function activity({ F, data }) {
  const placeholder = !!data.placeholder;
  const s = summarize(data.days);
  const { cells, cols, months } = layoutWeeks(s.days);

  // ---- medidas
  const L = 46; // margen izquierdo (días de la semana)
  const p = (W - L - 4) / 53; // paso entre celdas
  const c = +(p - 3.6).toFixed(2); // lado de la celda
  const tileH = 108;
  const SH = 6;
  const monthY = tileH + SH + 50;
  const Y0 = monthY + 16;
  const H = Math.ceil(Y0 + 6 * p + c + 50);
  const cx = (col) => L + col * p + c / 2;
  const cy = (row) => Y0 + row * p + c / 2;

  const desc = placeholder
    ? 'Calendario de contribuciones en GitHub'
    : `${fmt(s.total)} contribuciones en el último año; racha actual de ${s.current} días; mejor racha de ${s.longest} días.`;
  const doc = new Doc({ w: W, h: H, title: 'Actividad en GitHub', desc });
  doc.css(
    `.still{display:inline}` +
      `@media (prefers-reduced-motion:no-preference){.still{display:none}}` +
      `@media (prefers-reduced-motion:reduce){.anim{display:none}}`,
  );
  doc.def(`<rect id="cell" width="${c}" height="${c}" rx="4"/>`);

  let b = '';

  // ---- tres cifras
  const plural = (n, a, bb) => (n === 1 ? a : bb);
  const tiles = [
    { n: s.total, a: 'contribuciones', b: 'en el último año', color: C.cempasuchil, shadow: C.rosa },
    { n: s.current, a: plural(s.current, 'día seguido', 'días seguidos'), b: 'racha actual', color: C.rosa, shadow: C.turquesa },
    { n: s.longest, a: plural(s.longest, 'día seguido', 'días seguidos'), b: 'mejor racha del año', color: C.turquesa, shadow: C.cempasuchil },
  ];
  const tw = 310;
  const tgap = (W - SH - tw * 3) / 2;
  tiles.forEach((t, i) => {
    const x = i * (tw + tgap);
    b += `<g transform="translate(${r(x + SH)} ${SH})">${tile({ w: tw, h: tileH, rad: 22, both: true, fill: t.shadow })}</g>`;
    b += `<g transform="translate(${r(x)} 0)">${tile({ w: tw, h: tileH, rad: 22, both: true, fill: t.color })}`;
    const num = placeholder ? '—' : fmt(t.n);
    const size = 60;
    const nw = F.display.measure(num, size);
    const mid = tileH / 2;
    b += doc.text(F.display, num, { x: 28, y: mid + F.display.capHeight(size) / 2, size, fill: C.tinta }).svg;
    const lx = 28 + nw + 16;
    b += doc.text(F.bold, t.a, { x: lx, y: mid - 4, size: 19, fill: C.tinta }).svg;
    b += doc.text(F.bold, t.b, { x: lx, y: mid + 21, size: 19, fill: C.tinta, opacity: 0.78 }).svg;
    b += `</g>`;
  });

  // ---- etiquetas del calendario
  for (const m of months) b += doc.text(F.text, m.label, { x: cx(m.col) - c / 2, y: monthY, size: 15, fill: C.cordel }).svg;
  [[1, 'Lun'], [3, 'Mié'], [5, 'Vie']].forEach(([row, lab]) => {
    b += doc.text(F.text, lab, { x: 0, y: cy(row) + F.text.capHeight(14) / 2, size: 14, fill: C.cordel }).svg;
  });

  // ---- celdas vacías (siempre visibles, debajo de todo)
  b += `<g fill="${LEVEL[0]}" fill-opacity="${EMPTY_OPACITY}">`;
  for (const k of cells) b += `<use href="#cell" x="${r(L + k.col * p)}" y="${r(Y0 + k.row * p)}"/>`;
  b += `</g>`;

  // ---- celdas con contribuciones: versión fija y versión que la serpiente se va comiendo
  const active = cells.filter((k) => k.level > 0);
  b += `<g class="still">`;
  for (const k of active) b += `<rect x="${r(L + k.col * p)}" y="${r(Y0 + k.row * p)}" width="${c}" height="${c}" rx="4" fill="${LEVEL[k.level]}"/>`;
  b += `</g>`;

  const steps = cols * 7 - 1;
  const order = (col, row) => col * 7 + (col % 2 === 0 ? row : 6 - row); // posición en el recorrido en zigzag
  const f = (v) => (+v.toFixed(4)).toString();
  b += `<g class="anim">`;
  for (const k of active) {
    const a = (order(k.col, k.row) / steps) * MOVE;
    b +=
      `<rect x="${r(L + k.col * p)}" y="${r(Y0 + k.row * p)}" width="${c}" height="${c}" rx="4" fill="${LEVEL[k.level]}">` +
      `<animate attributeName="opacity" values="1;1;0;0;1;1" keyTimes="0;${f(a)};${f(a + 0.003)};.955;.985;1" dur="${T}s" repeatCount="indefinite"/></rect>`;
  }

  // ---- serpiente
  const run = 6 * p;
  let d = 'M0 0';
  for (let j = 0; j < cols; j++) {
    d += `v${r(j % 2 === 0 ? run : -run)}`;
    if (j < cols - 1) d += `h${r(p)}`;
  }
  doc.def(`<path id="route" d="${d}"/>`);
  const delta = MOVE / steps;
  const sizes = [21, 17.5, 17, 16.5, 16, 15, 14, 12.5];
  let snake = '';
  for (let k = BODY; k >= 0; k--) {
    const lag = k * delta;
    const kt = [0];
    const kp = [0];
    if (lag > 0) {
      kt.push(lag);
      kp.push(0);
    }
    kt.push(MOVE + lag, 0.97, 0.971, 1);
    kp.push(1, 1, 0, 0);
    const sz = sizes[k];
    let shape;
    if (k === 0) {
      shape =
        `<rect x="${-sz / 2}" y="${-sz / 2}" width="${sz}" height="${sz}" rx="7" fill="${C.turquesa}" stroke="${C.tinta}" stroke-width="1.6"/>` +
        `<path d="M${sz / 2} 0h6m0 0 4-3.2m-4 3.2 4 3.2" fill="none" stroke="${C.chile}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>` +
        `<circle cx="3.6" cy="-5" r="3" fill="${C.cal}" stroke="${C.tinta}" stroke-width="1"/><circle cx="3.6" cy="5" r="3" fill="${C.cal}" stroke="${C.tinta}" stroke-width="1"/>` +
        `<circle cx="4.4" cy="-5" r="1.3" fill="${C.tinta}"/><circle cx="4.4" cy="5" r="1.3" fill="${C.tinta}"/>`;
    } else {
      shape =
        `<rect x="${-sz / 2}" y="${-sz / 2}" width="${sz}" height="${sz}" rx="5.5" fill="${C.turquesa}" stroke="${C.tinta}" stroke-width="1.4"/>` +
        `<circle r="${(sz * 0.17).toFixed(2)}" fill="${k % 2 ? C.cal : C.cempasuchil}"/>`;
    }
    snake +=
      `<g>${shape}<animateMotion dur="${T}s" repeatCount="indefinite" rotate="auto" calcMode="linear" ` +
      `keyPoints="${kp.map(f).join(';')}" keyTimes="${kt.map(f).join(';')}"><mpath href="#route"/></animateMotion></g>`;
  }
  const x0 = cx(0);
  const y0 = cy(0);
  b +=
    `<g transform="translate(${r(x0)} ${r(y0)})">${snake}` +
    `<animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;.925;.955;.985;1" dur="${T}s" repeatCount="indefinite"/></g>`;
  b += `</g>`;

  // ---- leyenda
  const ly = Y0 + 6 * p + c + 38;
  const more = 'Más';
  const less = 'Menos';
  const mw = F.text.measure(more, 15);
  const lw = F.text.measure(less, 15);
  let x = W - mw - 2;
  b += doc.text(F.text, more, { x, y: ly, size: 15, fill: C.cordel }).svg;
  x -= 10;
  for (let lv = 4; lv >= 0; lv--) {
    x -= c;
    b += `<rect x="${r(x)}" y="${r(ly - c + 2)}" width="${c}" height="${c}" rx="4" fill="${LEVEL[lv]}"${lv === 0 ? ` fill-opacity="${EMPTY_OPACITY}"` : ''}/>`;
    x -= 4;
  }
  x -= 6 + lw;
  b += doc.text(F.text, less, { x: x + 4, y: ly, size: 15, fill: C.cordel }).svg;
  b += doc.text(F.text, placeholder ? 'Se llena solo con tus datos de GitHub.' : 'Datos de GitHub, actualizados cada día.', { x: 0, y: ly, size: 15, fill: C.cordel }).svg;

  doc.add(b);
  return doc.render();
}
