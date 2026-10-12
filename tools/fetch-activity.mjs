// Descarga el calendario de contribuciones de un usuario y lo guarda en data/activity.json.
// Uso:  node fetch-activity.mjs [usuario]      (lee la página pública del perfil, que incluye las contribuciones privadas si las muestras; si falla, usa GraphQL con GITHUB_TOKEN)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { summarize } from './lib/activity.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const login = process.argv[2] || process.env.GITHUB_REPOSITORY_OWNER || 'maxitodev';
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
// Solo para pruebas locales con un servidor falso:
const WEB = process.env.GITHUB_WEB_URL || 'https://github.com';
const API = process.env.GITHUB_API_URL || 'https://api.github.com';

const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

async function viaGraphQL() {
  const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{weeks{contributionDays{date contributionCount contributionLevel}}}}}}`;
  const res = await fetch(`${API}/graphql`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'maxitodev-profile' },
    body: JSON.stringify({ query, variables: { login } }),
  });
  if (!res.ok) throw new Error(`GraphQL ${res.status}`);
  const json = await res.json();
  const weeks = json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
  if (!weeks) throw new Error(`GraphQL sin datos: ${JSON.stringify(json.errors || json).slice(0, 300)}`);
  return weeks.flatMap((w) =>
    w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, level: LEVEL[d.contributionLevel] ?? 0 })),
  );
}

async function viaHtml() {
  const res = await fetch(`${WEB}/users/${login}/contributions`, { headers: { 'User-Agent': 'maxitodev-profile' } });
  if (!res.ok) throw new Error(`HTML ${res.status}`);
  const html = await res.text();
  const counts = new Map();
  for (const m of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>\s*([^<]*?)\s*<\/tool-tip>/g)) {
    const n = m[2].match(/^(\d[\d,]*)\s+contribution/i);
    counts.set(m[1], n ? Number(n[1].replace(/,/g, '')) : 0);
  }
  const days = [];
  for (const m of html.matchAll(/<td\b[^>]*>/g)) {
    const tag = m[0];
    const date = tag.match(/data-date="([^"]+)"/)?.[1];
    if (!date) continue;
    const level = Number(tag.match(/data-level="(\d)"/)?.[1] ?? 0);
    const id = tag.match(/\bid="([^"]+)"/)?.[1];
    days.push({ date, count: counts.get(id) ?? (level ? 1 : 0), level });
  }
  if (days.length < 300) throw new Error('No se pudo leer el calendario de la página');
  if (counts.size < days.length * 0.9) throw new Error('La página no trae los conteos por día');
  return days;
}

let days;
const errors = [];
for (const [name, fn] of [['html', viaHtml], ['graphql', token ? viaGraphQL : null]]) {
  if (!fn) continue;
  try {
    days = await fn();
    console.log(`Calendario leído por ${name}: ${days.length} días`);
    break;
  } catch (e) {
    errors.push(`${name}: ${e.message}`);
  }
}
if (!days) {
  console.error('No se pudieron obtener las contribuciones.\n' + errors.join('\n'));
  process.exit(1);
}

const s = summarize(days);
const out = { login, placeholder: false, total: s.total, days: s.days };
fs.mkdirSync(path.join(here, 'data'), { recursive: true });
fs.writeFileSync(path.join(here, 'data', 'activity.json'), JSON.stringify(out) + '\n');
console.log(`Total ${s.total} · racha actual ${s.current} · mejor racha ${s.longest}`);
