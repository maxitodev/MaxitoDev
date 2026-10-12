// Iconos: Lucide (trazo, licencia ISC) para la interfaz y Simple Icons (CC0) para logos de tecnologías.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { r, luminance, lighten } from './util.mjs';

const nm = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'node_modules');
const lucideDir = path.join(nm, 'lucide-static', 'icons');
const siDir = path.join(nm, 'simple-icons', 'icons');
const siData = JSON.parse(fs.readFileSync(path.join(nm, 'simple-icons', 'data', 'simple-icons.json'), 'utf8'));

const lucideCache = new Map();

/** Contenido interno (paths, círculos…) de un icono de Lucide. */
function lucideInner(name) {
  if (!lucideCache.has(name)) {
    const file = path.join(lucideDir, `${name}.svg`);
    if (!fs.existsSync(file)) throw new Error(`Icono Lucide no encontrado: ${name}`);
    const raw = fs.readFileSync(file, 'utf8');
    const inner = raw
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<svg[\s\S]*?>/, '')
      .replace(/<\/svg>\s*$/, '')
      .replace(/\s+/g, ' ')
      .trim();
    lucideCache.set(name, inner);
  }
  return lucideCache.get(name);
}

/**
 * Icono de trazo (Lucide) de `size` px con esquina superior-izquierda en (x,y).
 * `sw` es el grosor en unidades del icono (24×24).
 */
export function lucide(name, { x = 0, y = 0, size = 24, color = 'currentColor', sw = 2, attrs = '' } = {}) {
  const s = size / 24;
  return (
    `<g transform="translate(${r(x)} ${r(y)}) scale(${+s.toFixed(4)})" fill="none" stroke="${color}" ` +
    `stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${attrs ? ' ' + attrs : ''}>` +
    lucideInner(name) +
    `</g>`
  );
}

/** ¿Existe este logo de marca en Simple Icons? */
export function hasBrand(slug) {
  return fs.existsSync(path.join(siDir, `${slug}.svg`));
}

/** Datos de un logo de marca: path (24×24) y color oficial. */
export function brand(slug) {
  const file = path.join(siDir, `${slug}.svg`);
  if (!fs.existsSync(file)) return null;
  const svg = fs.readFileSync(file, 'utf8');
  const d = svg.match(/<path d="([^"]+)"/)?.[1];
  const hex = '#' + (siData.find((i) => i.slug === slug)?.hex || 'ffffff');
  return { d, hex };
}

/** Color de marca que se lea sobre fondo oscuro (aclara los casi-negros). */
export function brandOnDark(slug) {
  const b = brand(slug);
  if (!b) return '#ffffff';
  return luminance(b.hex) < 0.12 ? lighten(b.hex, 0.85) : b.hex;
}

/** Logo de marca como <path> de `size` px con esquina superior-izquierda en (x,y). */
export function brandIcon(slug, { x = 0, y = 0, size = 24, fill } = {}) {
  const b = brand(slug);
  if (!b) return '';
  const s = size / 24;
  return `<path transform="translate(${r(x)} ${r(y)}) scale(${+s.toFixed(4)})" fill="${fill || brandOnDark(slug)}" d="${b.d}"/>`;
}
