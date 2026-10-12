// Carga una fuente (.ttf/.otf) y convierte texto a trazos (paths) con kerning.
// Así el SVG se ve idéntico en cualquier equipo, sin depender de fuentes instaladas
// (GitHub carga los SVG dentro de <img>, donde no se pueden usar fuentes externas).

import fs from 'node:fs';
import opentype from 'opentype.js';

export class Typeface {
  /**
   * @param {string} id   prefijo corto y único para los ids de los glifos (p. ej. "d")
   * @param {string} file ruta al archivo de fuente (estático, no variable)
   */
  constructor(id, file) {
    this.id = id;
    const buf = fs.readFileSync(file);
    this.font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    this.upm = this.font.unitsPerEm;
    this._d = new Map();
    this.missing = new Set();
  }

  glyphFor(ch) {
    const g = this.font.charToGlyph(ch);
    if (g.index === 0 && ch.trim() !== '') this.missing.add(ch);
    return g;
  }

  /** Path del glifo en unidades de la fuente (eje Y ya invertido para SVG). */
  pathData(gid) {
    if (!this._d.has(gid)) {
      const g = this.font.glyphs.get(gid);
      const p = g.getPath(0, 0, this.upm);
      this._d.set(gid, p.commands.length ? p.toPathData(0) : '');
    }
    return this._d.get(gid);
  }

  /**
   * Coloca los caracteres uno tras otro (kerning + tracking).
   * Devuelve posiciones X en unidades de fuente.
   */
  layout(text, { size, tracking = 0 }) {
    const trackU = (tracking * this.upm) / size;
    const out = [];
    let x = 0;
    let prev = null;
    for (const ch of [...text]) {
      const g = this.glyphFor(ch);
      if (prev) x += this.font.getKerningValue(prev, g) || 0;
      out.push({
        ch,
        gid: g.index,
        x: Math.round(x * 10) / 10,
        adv: g.advanceWidth,
        has: g.path && g.path.commands.length > 0,
      });
      x += g.advanceWidth + trackU;
      prev = g;
    }
    const width = out.length ? x - trackU : 0;
    return { glyphs: out, width };
  }

  /** Ancho del texto en px al tamaño dado. */
  measure(text, size, tracking = 0) {
    return (this.layout(text, { size, tracking }).width * size) / this.upm;
  }

  /** Alto de las mayúsculas en px. */
  capHeight(size) {
    const h = this.font.tables.os2?.sCapHeight || this.upm * 0.7;
    return (h * size) / this.upm;
  }

  xHeight(size) {
    const h = this.font.tables.os2?.sxHeight || this.upm * 0.5;
    return (h * size) / this.upm;
  }
}
