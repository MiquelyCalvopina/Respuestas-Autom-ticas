import { EmailTemplate } from './types';

// Fecha de hoy en formato ISO (solo fecha, comparable como string) — un solo punto de verdad
// para que la resolución y la UI usen siempre el mismo "hoy".
export function todayISO(): string {
  return new Date().toISOString();
}

interface Window {
  template: EmailTemplate;
  start: string;
  end: string | null; // null = abierta hacia el futuro
}

// Encadena las plantillas "sin fin" por fecha de inicio: cada una rige hasta que empieza la
// siguiente (la de inicio más reciente entre las ya comenzadas es la vigente). Las temporales
// (con `endDate`) se agregan tal cual, sin encadenar.
export function effectiveWindows(templates: EmailTemplate[]): Window[] {
  const scheduled = templates.filter(t => t.startDate);
  const permanent = scheduled
    .filter(t => !t.endDate)
    .sort((a, b) => a.startDate!.localeCompare(b.startDate!));
  const permanentWindows: Window[] = permanent.map((t, i) => ({
    template: t, start: t.startDate!, end: permanent[i + 1]?.startDate ?? null,
  }));
  const temporalWindows: Window[] = scheduled
    .filter(t => t.endDate)
    .map(t => ({ template: t, start: t.startDate!, end: t.endDate! }));
  return [...permanentWindows, ...temporalWindows];
}

// La plantilla que se usaría un día dado: una temporal vigente ese día gana; si ninguna
// aplica, rige la permanente vigente (la de inicio más reciente ya comenzado).
export function templateForDate(templates: EmailTemplate[], isoDate: string): EmailTemplate {
  const windows = effectiveWindows(templates);
  const temporal = windows.find(w => w.template.endDate && isoDate >= w.start && isoDate <= w.end!);
  if (temporal) return temporal.template;
  const permanent = windows
    .filter(w => !w.template.endDate && isoDate >= w.start)
    .sort((a, b) => b.start.localeCompare(a.start))[0];
  return (permanent ?? windows[0])?.template ?? templates[0];
}

function rangesOverlap(a: Window, b: Window): boolean {
  const aEnd = a.end ?? '9999-12-31T23:59:59.999Z';
  const bEnd = b.end ?? '9999-12-31T23:59:59.999Z';
  return a.start <= bEnd && b.start <= aEnd;
}

// ¿Programar `candidate` con sus fechas actuales se cruza con alguna otra plantilla de la
// misma regla? Solo hay choque genuino entre dos TEMPORALES cuyas ventanas se superponen
// (ahí sí es ambiguo cuál debería regir esos días). Una permanente nunca choca con nada:
// dos permanentes se ceden el paso por construcción (encadenadas por fecha de inicio), y una
// temporal siempre le gana a una permanente durante su ventana — eclipsarla temporalmente es
// el comportamiento esperado, no un conflicto (la permanente vuelve a regir sola después).
export function findConflict(candidate: EmailTemplate, others: EmailTemplate[]): EmailTemplate | null {
  if (!candidate.startDate || !candidate.endDate) return null;
  const rest = others.filter(t => t.id !== candidate.id);
  const windows = effectiveWindows([...rest, candidate]);
  const mine = windows.find(w => w.template.id === candidate.id);
  if (!mine) return null;
  const rivals = windows.filter(w => w.template.id !== candidate.id && w.template.endDate);
  const conflict = rivals.find(w => rangesOverlap(mine, w));
  return conflict?.template ?? null;
}

export type TemplateStateKind = 'now' | 'scheduled' | 'ended' | 'draft';

export function templateState(template: EmailTemplate, templates: EmailTemplate[], isoDate: string): TemplateStateKind {
  if (!template.startDate) return 'draft';
  if (templateForDate(templates, isoDate).id === template.id) return 'now';
  if (template.startDate > isoDate) return 'scheduled';
  // Ya empezó y hoy no es la que se envía. Una temporal (endDate) que ya pasó su ventana
  // está genuinamente vencida. Una permanente (sin endDate) solo cuenta como "vencida" si
  // OTRA permanente de inicio más reciente ya la reemplazó — nunca por estar meramente
  // eclipsada hoy por una temporal en curso (mañana, sin esa temporal, volvería a regir).
  if (template.endDate) return 'ended';
  const superseded = templates.some(t => t.id !== template.id && t.startDate && !t.endDate && t.startDate > template.startDate! && t.startDate <= isoDate);
  return superseded ? 'ended' : 'now';
}

// ¿Es esta la única plantilla "sin fin" restante? Esa nunca se puede eliminar ni "desprogramar" —
// siempre debe quedar un respaldo.
export function isOnlyPermanent(template: EmailTemplate, templates: EmailTemplate[]): boolean {
  if (template.endDate || !template.startDate) return false;
  return templates.filter(t => t.startDate && !t.endDate).length === 1;
}
