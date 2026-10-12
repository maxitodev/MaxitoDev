// Utilidades pequeñas compartidas por todos los generadores.

/** Redondea sin dejar "-0" ni decimales de más (SVG más liviano). */
export const r = (n, d = 2) => {
  const v = +Number(n).toFixed(d);
  return Object.is(v, -0) ? 0 : v;
};

/** Escapa texto para atributos/nodos XML. */
export const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Generador pseudoaleatorio determinista (mulberry32): mismo seed = mismo resultado. */
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export const rgbToHex = ([R, G, B]) =>
  '#' + [R, G, B].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');

/** Mezcla dos colores (t=0 → a, t=1 → b). */
export function mix(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex(A.map((v, i) => lerp(v, B[i], t)));
}
export const darken = (hex, t) => mix(hex, '#000000', t);
export const lighten = (hex, t) => mix(hex, '#ffffff', t);

/** Luminancia relativa (WCAG) para decidir blanco/negro sobre un fondo. */
export function luminance(hex) {
  const [R, G, B] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/** Elemento de un arreglo, en bucle. */
export const pick = (arr, i) => arr[((i % arr.length) + arr.length) % arr.length];

/** Parte un texto en líneas que no superen `maxW` px (mide con la fuente real). */
function greedy(tf, text, size, maxW, tracking) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (cur && tf.measure(test, size, tracking) > maxW) {
      lines.push(cur);
      cur = w;
    } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Igual, pero equilibra el largo de las líneas (sin palabras sueltas al final). */
export function wrap(tf, text, size, maxW, tracking = 0) {
  const first = greedy(tf, text, size, maxW, tracking);
  if (first.length < 2) return first;
  let lo = maxW * 0.55;
  let hi = maxW;
  let best = first;
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2;
    const t = greedy(tf, text, size, mid, tracking);
    if (t.length <= first.length) {
      best = t;
      hi = mid;
    } else lo = mid;
  }
  return best;
}
