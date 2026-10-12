// Constructor mínimo de documentos SVG.
// - Registra cada glifo una sola vez en <defs> y lo reutiliza con <use> (archivos pequeños).
// - Todo el texto sale como trazos: no hay <text> ni fuentes externas.
// - El estado base (sin animación) siempre es la imagen "final" legible.

import { esc, r } from './util.mjs';

export class Doc {
  constructor({ w, h, title, desc = '' }) {
    this.w = w;
    this.h = h;
    this.title = title;
    this.desc = desc;
    this.defs = [];
    this.styles = [];
    this.body = [];
    this.glyphs = new Map();
    this._uid = 0;
  }

  /** Id único dentro de este documento. */
  uid(prefix = 'i') {
    return `${prefix}${(this._uid++).toString(36)}`;
  }

  def(markup) {
    this.defs.push(markup);
    return this;
  }
  css(rules) {
    this.styles.push(rules);
    return this;
  }
  add(markup) {
    this.body.push(markup);
    return this;
  }

  glyph(tf, gid) {
    const id = `_${tf.id}${gid.toString(36)}`; // el guion bajo evita choques con ids propios (clipPath, patrones…)
    if (!this.glyphs.has(id)) this.glyphs.set(id, tf.pathData(gid));
    return id;
  }

  /**
   * Texto convertido a trazos.
   * Devuelve { svg, width, x, glyphs, scale } sin añadirlo al documento.
   * `glyphAttrs(g,i)` y `glyphKids(g,i)` permiten animar letra por letra.
   */
  text(tf, str, o) {
    const {
      x = 0,
      y = 0,
      size,
      fill,
      tracking = 0,
      anchor = 'start',
      opacity,
      attrs = '',
      glyphAttrs,
      glyphKids,
    } = o;
    const { glyphs, width } = tf.layout(str, { size, tracking });
    const s = size / tf.upm;
    const w = width * s;
    const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
    let g = `<g transform="translate(${r(x0)} ${r(y)}) scale(${+s.toFixed(5)})"`;
    if (fill) g += ` fill="${fill}"`;
    if (opacity != null) g += ` opacity="${opacity}"`;
    if (attrs) g += ` ${attrs}`;
    g += '>';
    glyphs.forEach((gl, i) => {
      if (!gl.has) return;
      const id = this.glyph(tf, gl.gid);
      const a = glyphAttrs ? ` ${glyphAttrs(gl, i)}` : '';
      const kids = glyphKids ? glyphKids(gl, i) : '';
      g += kids
        ? `<use href="#${id}" x="${gl.x}"${a}>${kids}</use>`
        : `<use href="#${id}" x="${gl.x}"${a}/>`;
    });
    g += '</g>';
    return { svg: g, width: w, x: x0, glyphs, scale: s };
  }

  /** Atajo: añade el texto al cuerpo y devuelve su ancho. */
  put(tf, str, o) {
    const t = this.text(tf, str, o);
    this.add(t.svg);
    return t;
  }

  render() {
    const glyphDefs = [...this.glyphs.entries()]
      .map(([id, d]) => `<path id="${id}" d="${d}"/>`)
      .join('');
    const style = this.styles.length ? `<style>${this.styles.join('')}</style>` : '';
    const tid = this.uid('t');
    const did = this.uid('d');
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}" width="${this.w}" height="${this.h}" ` +
      `role="img" aria-labelledby="${tid}${this.desc ? ' ' + did : ''}">` +
      `<title id="${tid}">${esc(this.title)}</title>` +
      (this.desc ? `<desc id="${did}">${esc(this.desc)}</desc>` : '') +
      `<defs>${glyphDefs}${this.defs.join('')}</defs>` +
      style +
      this.body.join('') +
      `</svg>\n`
    );
  }
}

/** Regla común: respeta "reducir movimiento" del sistema. */
export const REDUCED_MOTION = `@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;
