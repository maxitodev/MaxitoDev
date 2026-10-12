// Papel picado generativo: banderines con perforaciones (huecos reales, se ve el fondo detrás).
// Todas las perforaciones van en un solo <path fill-rule="evenodd">; los huecos NO deben traslaparse
// (dos huecos que se cruzan vuelven a ser papel), salvo los anidados a propósito.

import { r } from './util.mjs';

const K = 0.5522847498;

export const circle = (cx, cy, rad) =>
  `M${r(cx - rad)} ${r(cy)}a${r(rad)} ${r(rad)} 0 1 0 ${r(2 * rad)} 0a${r(rad)} ${r(rad)} 0 1 0 ${r(-2 * rad)} 0Z`;

export const diamond = (cx, cy, rw, rh) =>
  `M${r(cx)} ${r(cy - rh)}L${r(cx + rw)} ${r(cy)}L${r(cx)} ${r(cy + rh)}L${r(cx - rw)} ${r(cy)}Z`;

export const triangle = (cx, cy, w, h, down = false) => {
  const s = down ? 1 : -1;
  return `M${r(cx - w / 2)} ${r(cy - (s * h) / 2)}L${r(cx + w / 2)} ${r(cy - (s * h) / 2)}L${r(cx)} ${r(cy + (s * h) / 2)}Z`;
};

/** Elipse rotada `rot` radianes alrededor de su centro. */
export function ellipse(cx, cy, rx, ry, rot = 0) {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const P = (x, y) => [cx + x * c - y * s, cy + x * s + y * c];
  const seg = [
    [[rx, K * ry], [K * rx, ry], [0, ry]],
    [[-K * rx, ry], [-rx, K * ry], [-rx, 0]],
    [[-rx, -K * ry], [-K * rx, -ry], [0, -ry]],
    [[K * rx, -ry], [rx, -K * ry], [rx, 0]],
  ];
  const start = P(rx, 0);
  let d = `M${r(start[0])} ${r(start[1])}`;
  for (const [a, b, e] of seg) {
    const A = P(...a);
    const B = P(...b);
    const E = P(...e);
    d += `C${r(A[0])} ${r(A[1])} ${r(B[0])} ${r(B[1])} ${r(E[0])} ${r(E[1])}`;
  }
  return d + 'Z';
}

/** Pétalo en forma de gota que parte de (cx,cy) y apunta hacia `ang` (radianes). */
export function petal(cx, cy, len, wid, ang) {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const P = (x, y) => [cx + x * c - y * s, cy + x * s + y * c];
  const a = P(0, 0);
  const t = P(len, 0);
  const c1 = P(len * 0.25, wid);
  const c2 = P(len * 0.75, wid * 0.9);
  const c3 = P(len * 0.75, -wid * 0.9);
  const c4 = P(len * 0.25, -wid);
  return (
    `M${r(a[0])} ${r(a[1])}C${r(c1[0])} ${r(c1[1])} ${r(c2[0])} ${r(c2[1])} ${r(t[0])} ${r(t[1])}` +
    `C${r(c3[0])} ${r(c3[1])} ${r(c4[0])} ${r(c4[1])} ${r(a[0])} ${r(a[1])}Z`
  );
}

/** Estrella de cuatro puntas (destello). */
export const sparkle = (cx, cy, rad, pinch = 0.18) => {
  const q = rad * pinch;
  return (
    `M${r(cx)} ${r(cy - rad)}Q${r(cx + q)} ${r(cy - q)} ${r(cx + rad)} ${r(cy)}` +
    `Q${r(cx + q)} ${r(cy + q)} ${r(cx)} ${r(cy + rad)}` +
    `Q${r(cx - q)} ${r(cy + q)} ${r(cx - rad)} ${r(cy)}` +
    `Q${r(cx - q)} ${r(cy - q)} ${r(cx)} ${r(cy - rad)}Z`
  );
};

/** Contorno del banderín: parte superior recta, borde inferior en dientes. */
function outline(w, h, teeth, toothH) {
  const hw = w / 2;
  const tw = w / teeth;
  let d = `M${r(-hw)} 0H${r(hw)}V${r(h - toothH)}`;
  for (let i = 0; i < teeth; i++) {
    d += `L${r(hw - (i + 0.5) * tw)} ${r(h)}L${r(hw - (i + 1) * tw)} ${r(h - toothH)}`;
  }
  return d + 'Z';
}

/**
 * Perforaciones del banderín. Coordenadas locales: (0,0) = centro del borde superior.
 * Tres diseños distintos para que la guirnalda no se vea repetida.
 */
function holes(style, w, h) {
  const hw = w / 2;
  let d = '';
  if (style === 0) {
    // Rosetón central con pétalos + encaje arriba y abajo
    const cy = h * 0.5;
    d += circle(0, cy, 15) + circle(0, cy, 10.5) + circle(0, cy, 5);
    for (let k = 0; k < 8; k++) d += petal(Math.cos((k * Math.PI) / 4) * 19, cy + Math.sin((k * Math.PI) / 4) * 19, 8.5, 3.2, (k * Math.PI) / 4);
    for (let i = -2; i <= 2; i++) d += diamond(i * 11, 17, 3, 4.2);
    for (let i = -2; i <= 2; i++) d += circle(i * 11, h - 24, 2.4);
  } else if (style === 1) {
    // Rombo grande anidado + columnas de puntos en los bordes
    const cy = h * 0.5;
    d += diamond(0, cy, 15, 21) + diamond(0, cy, 10, 14.5) + diamond(0, cy, 4.4, 6.4);
    for (let y = 18; y <= h - 22; y += 10.5) {
      d += circle(-hw + 7.5, y, 2.2) + circle(hw - 7.5, y, 2.2);
    }
    for (let i = -1; i <= 1; i++) d += triangle(i * 11, 15.5, 7, 6.5, true);
  } else {
    // Abanico de pétalos (flor) + festón arriba
    const bx = 0;
    const by = h * 0.62;
    for (let k = -2; k <= 2; k++) d += petal(bx, by, 29, 6, -Math.PI / 2 + (k * Math.PI) / 7.5);
    d += circle(bx, by + 5, 3.2);
    for (let i = -3; i <= 3; i++) d += circle(i * 8.6, 13, 2.2);
    d += circle(-hw + 8, h * 0.62, 2.2) + circle(hw - 8, h * 0.62, 2.2);
  }
  return d;
}

/**
 * Banderín listo para usar. Devuelve el markup en coordenadas locales
 * (0,0) = punto donde se cuelga (centro del borde superior).
 */
export function flag({ w = 68, h = 100, style = 0, fill, fold, teeth = 6, toothH = 9 }) {
  const paper = outline(w, h, teeth, toothH) + holes(style, w, h);
  return (
    `<path fill="${fill}" fill-rule="evenodd" d="${paper}"/>` +
    `<path fill="${fold}" d="M${r(-w / 2)} 0H${r(w / 2)}V8H${r(-w / 2)}Z"/>`
  );
}

/** Punto y tangente (ángulo) de una curva de Bézier cuadrática. */
export function quadAt(p0, p1, p2, t) {
  const u = 1 - t;
  const x = u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0];
  const y = u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1];
  const dx = 2 * u * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
  const dy = 2 * u * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
  return { x, y, angle: Math.atan2(dy, dx) };
}

/**
 * Banderín ancho para títulos: dientes abajo y perforaciones solo en los extremos y en una fila superior,
 * así el texto (que va encima) nunca cae sobre un hueco.
 */
export function banner({ w, h = 76, fill, fold, toothH = 9 }) {
  const teeth = Math.max(4, Math.round(w / 22));
  const hw = w / 2;
  let d = outline(w, h, teeth, toothH);
  const cy = (h - toothH) / 2 + 4;
  for (const sx of [-1, 1]) {
    const cx = sx * (hw - 24);
    d += circle(cx, cy, 11) + circle(cx, cy, 7.5) + circle(cx, cy, 3.4);
  }
  for (let x = -hw + 52; x <= hw - 52; x += 17) d += circle(x, 15.5, 2.1);
  return (
    `<path fill="${fill}" fill-rule="evenodd" d="${d}"/>` +
    `<path fill="${fold}" d="M${r(-hw)} 0H${r(hw)}V7H${r(-hw)}Z"/>`
  );
}

/** Rectángulo redondeado con una fila de perforaciones en el borde superior (y opcionalmente el inferior). */
export function tile({ w, h, rad = 20, both = false, fill }) {
  const R = rad;
  let d =
    `M${R} 0H${w - R}A${R} ${R} 0 0 1 ${w} ${R}V${h - R}A${R} ${R} 0 0 1 ${w - R} ${h}H${R}` +
    `A${R} ${R} 0 0 1 0 ${h - R}V${R}A${R} ${R} 0 0 1 ${R} 0Z`;
  for (let x = R + 14; x <= w - R - 14; x += 17) {
    d += circle(x, 15, 2.5);
    if (both) d += circle(x, h - 15, 2.5);
  }
  return `<path fill="${fill}" fill-rule="evenodd" d="${d}"/>`;
}
