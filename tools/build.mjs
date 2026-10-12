import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFonts } from './lib/theme.mjs';
import { P } from './config.mjs';
import { hero } from './scenes/hero.mjs';
import { sectionHeader } from './scenes/headers.mjs';
import { BUTTONS } from './scenes/buttons.mjs';
import { terminal, aboutCode } from './scenes/terminal.mjs';
import { services, SERVICES } from './scenes/services.mjs';
import { stack } from './scenes/stack.mjs';
import { activity } from './scenes/activity.mjs';
import { footer } from './scenes/footer.mjs';
import { projectCard, PROJECTS } from './scenes/projects.mjs';
import { C } from './lib/theme.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '..', 'assets');
fs.mkdirSync(out, { recursive: true });

const F = loadFonts();
const avatarFile = path.join(here, 'assets', 'avatar.webp');
const activityData = () => JSON.parse(fs.readFileSync(process.env.ACTIVITY_DATA || path.join(here, 'data', 'activity.json'), 'utf8'));

const files = {
  'hero.svg': () => hero({ F, P, avatarFile }),
  ...BUTTONS(F, P),
  'h-sobre-mi.svg': () => sectionHeader({ F, title: 'Sobre mí', color: C.cempasuchil }),
  'h-servicios.svg': () => sectionHeader({ F, title: 'Qué hago', color: C.chile }),
  'h-stack.svg': () => sectionHeader({ F, title: 'Stack', color: C.turquesa }),
  'h-proyectos.svg': () => sectionHeader({ F, title: 'Proyectos', color: C.rosa }),
  'h-actividad.svg': () => sectionHeader({ F, title: 'Actividad', color: C.cempasuchil }),
  'h-contacto.svg': () => sectionHeader({ F, title: 'Contacto', color: C.chile }),
  'stack.svg': () => stack({ F }),
  'activity.svg': () => activity({ F, data: activityData() }),
  ...Object.fromEntries(PROJECTS.map((p) => [p.file, () => projectCard({ F, p })])),
  'footer.svg': () => footer({ F, P }),
  'services.svg': () => services({ F, S: SERVICES }),
  'terminal.svg': () => terminal({ F, P, code: aboutCode(P) }).svg,
};

const only = process.argv.slice(2);
for (const [name, make] of Object.entries(files)) {
  if (only.length && !only.some((o) => name.includes(o))) continue;
  const svg = make();
  fs.writeFileSync(path.join(out, name), svg);
  console.log(name.padEnd(22), (svg.length / 1024).toFixed(1).padStart(7), 'KB');
}
for (const [k, tf] of Object.entries(F)) if (tf.missing.size) console.warn(`⚠ ${k}: faltan glifos`, [...tf.missing].join(' '));
