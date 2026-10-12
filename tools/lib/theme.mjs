// Sistema visual: "papel picado". Color plano, bordes perforados y sombras duras
// (sin desenfoques ni brillos). Paleta tomada del rojo de MaxitoDev y de la cultura gráfica mexicana.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Typeface } from './typeface.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const fontDir = path.join(here, '..', 'fonts');

export const C = {
  vino: '#16070d', // fondo base
  mole: '#25101a', // superficie elevada
  mole2: '#341826', // superficie elevada, más clara
  tinta: '#1a0a10', // texto sobre papel claro
  cal: '#fff3e2', // papel / texto principal
  calDim: '#cdb8b3', // texto secundario sobre vino
  cordel: '#8f7a76', // gris cálido legible tanto sobre blanco como sobre #0d1117 (cordeles y subtítulos)
  chile: '#dc2626', // rojo de marca
  chileHot: '#ff4d3d',
  cempasuchil: '#ffb400', // amarillo-naranja de la flor de muerto
  rosa: '#e5177e', // rosa mexicano
  turquesa: '#19b5a4',
  azul: '#2f6fe0', // el azul del saco del avatar
};

/** Fuentes (cada una con un prefijo distinto para los ids de glifos). */
export function loadFonts() {
  return {
    display: new Typeface('a', path.join(fontDir, 'Bricolage-Display.ttf')), // 800 condensada
    title: new Typeface('b', path.join(fontDir, 'Bricolage-Title.ttf')), // 700 semi-condensada
    text: new Typeface('c', path.join(fontDir, 'Bricolage-Text.ttf')), // 500
    bold: new Typeface('e', path.join(fontDir, 'Bricolage-TextBold.ttf')), // 700
    mono: new Typeface('f', path.join(fontDir, 'JetBrainsMono-Medium.ttf')),
    monoBold: new Typeface('g', path.join(fontDir, 'JetBrainsMono-ExtraBold.ttf')),
  };
}
