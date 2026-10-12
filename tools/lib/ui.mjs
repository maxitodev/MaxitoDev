// Piezas pequeñas reutilizables.

import { r } from './util.mjs';

/**
 * Etiqueta tipo pastilla. `fill` la rellena; `stroke` solo la contornea.
 * Devuelve { svg, w, h } (no la añade al documento).
 */
export function chip(doc, tf, text, { x, y, size = 17, h = 34, padX = 15, fg, fill, stroke, sw = 1.8 }) {
  const tw = tf.measure(text, size);
  const w = Math.ceil(tw + padX * 2);
  let s = `<rect x="${r(x + (stroke ? sw / 2 : 0))}" y="${r(y + (stroke ? sw / 2 : 0))}" width="${r(w - (stroke ? sw : 0))}" height="${r(h - (stroke ? sw : 0))}" rx="${r((h - (stroke ? sw : 0)) / 2)}"`;
  s += fill ? ` fill="${fill}"` : ' fill="none"';
  if (stroke) s += ` stroke="${stroke}" stroke-width="${sw}"`;
  s += '/>';
  s += doc.text(tf, text, { x: x + padX, y: y + h / 2 + tf.capHeight(size) / 2, size, fill: fg }).svg;
  return { svg: s, w, h };
}

/** Fila de chips con salto de línea automático. Devuelve { svg, h } */
export function chipRow(doc, tf, items, { x, y, maxW, gap = 10, rowGap = 10, ...o }) {
  let cx = x;
  let cy = y;
  let svg = '';
  const h = o.h || 34;
  for (const t of items) {
    const w = Math.ceil(tf.measure(t, o.size || 17) + (o.padX || 15) * 2);
    if (cx > x && cx + w > x + maxW) {
      cx = x;
      cy += h + rowGap;
    }
    const c = chip(doc, tf, t, { x: cx, y: cy, ...o });
    svg += c.svg;
    cx += c.w + gap;
  }
  return { svg, h: cy + h - y };
}

/** Párrafo ya partido en líneas. Devuelve { svg, h } */
export function paragraph(doc, tf, lines, { x, y, size, lh, fill, opacity }) {
  let svg = '';
  lines.forEach((ln, i) => {
    svg += doc.text(tf, ln, { x, y: y + i * lh, size, fill, opacity }).svg;
  });
  return { svg, h: lines.length * lh };
}
