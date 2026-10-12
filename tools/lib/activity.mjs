// Datos del calendario de contribuciones: normalización, rachas y cuadrícula por semanas.

const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const utc = (iso) => new Date(`${iso}T00:00:00Z`);
const iso = (d) => d.toISOString().slice(0, 10);

/** Calendario vacío (53 semanas que terminan hoy). Se usa mientras no hay datos reales. */
export function emptyYear(today = new Date()) {
  const end = utc(iso(today));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 364 - end.getUTCDay());
  const days = [];
  for (const d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push({ date: iso(d), count: 0, level: 0 });
  }
  return days;
}

/** Ordena los días y calcula total y rachas (la de hoy no se rompe si aún no hay contribuciones). */
export function summarize(days) {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let longest = 0;
  let run = 0;
  for (const d of sorted) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  let i = sorted.length - 1;
  if (i >= 0 && sorted[i].count === 0) i--; // hoy todavía no cuenta como día perdido
  let current = 0;
  while (i >= 0 && sorted[i].count > 0) {
    current++;
    i--;
  }
  const total = sorted.reduce((s, d) => s + d.count, 0);
  return { days: sorted, total, current, longest };
}

/** Coloca cada día en (columna, fila): fila 0 = domingo, igual que GitHub. */
export function layoutWeeks(days) {
  if (!days.length) return { cells: [], cols: 0, months: [] };
  const first = utc(days[0].date);
  const base = new Date(first);
  base.setUTCDate(base.getUTCDate() - first.getUTCDay());
  const cells = days.map((d) => {
    const dt = utc(d.date);
    const diff = Math.round((dt - base) / 86400000);
    return { ...d, col: Math.floor(diff / 7), row: dt.getUTCDay(), month: dt.getUTCMonth(), dom: dt.getUTCDate() };
  });
  const cols = Math.max(...cells.map((c) => c.col)) + 1;
  // Etiqueta de mes en la columna donde cae el día 1 (con separación mínima entre etiquetas).
  const months = [];
  let lastCol = -10;
  for (const c of cells) {
    if (c.dom === 1 && c.col - lastCol >= 3) {
      months.push({ col: c.col, label: MES[c.month] });
      lastCol = c.col;
    }
  }
  return { cells, cols, months };
}

export const fmt = (n) => new Intl.NumberFormat('en-US').format(n);
