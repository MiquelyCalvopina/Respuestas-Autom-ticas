// ─── Estudio base — caso real reutilizable en todo el proyecto ─────────────
// HIR Casa · NPS Postventa. Única fuente de verdad para el setup del cliente,
// las preguntas del estudio y el flujo (Bienvenida → preguntas → despedidas).
// Cualquier módulo (Respuestas Automáticas, Lógica, etc.) debe leer de aquí
// en vez de inventar datos propios, para que todos trabajen sobre el mismo caso.

export interface EstudioSetup {
  empresa: string;
  industria: string;
  tamano: string;
  descripcion: string;
}

export type PreguntaTipo = 'NPS' | 'texto_abierto' | 'CSAT' | 'seleccion_simple';

export interface Pregunta {
  id: string;
  texto: string;
  tipo: PreguntaTipo;
  escala?: [number, number];
  opciones?: string[];
}

export interface Despedida {
  id: string;
  nombre: string;
  /** true si hoy hay al menos un camino del flujo que llega a ella */
  usada: boolean;
}

export type FlujoNodoTipo = 'bienvenida' | 'pregunta' | 'despedida';

export interface FlujoNodo {
  id: string;
  tipo: FlujoNodoTipo;
  label: string;
  /** id de Pregunta o Despedida asociado, cuando aplica */
  refId?: string;
}

export const ESTUDIO = {
  nombre: 'NPS Postventa · HIR Casa',
  cliente: 'HIR Casa',
  activo: true,
};

export const SETUP: EstudioSetup = {
  empresa: 'HIR Casa',
  industria: 'Financiamiento Inmobiliario',
  tamano: 'Grande (+500 empleados)',
  descripcion: 'HIR Casa acompaña a las familias en el proceso de adquirir su vivienda propia en México.',
};

export const VARIABLES = [
  'nombre_preferido', 'correo_electronico', 'sucursal',
  'canal', 'telefono', 'identificador', 'numero_credito',
];

export const PREGUNTAS: Pregunta[] = [
  { id: 'q1', texto: '¿Qué tan probable es que recomiendes HIR Casa a alguien?', tipo: 'NPS', escala: [0, 10] },
  { id: 'q2', texto: '¿Cuál fue el motivo principal de tu calificación?', tipo: 'texto_abierto' },
  { id: 'q3', texto: '¿Cómo calificarías la atención recibida?', tipo: 'CSAT', escala: [1, 5] },
  { id: 'q4', texto: '¿En qué sucursal fuiste atendido?', tipo: 'seleccion_simple', opciones: ['Quito Norte', 'Quito Sur', 'Guayaquil', 'Cuenca'] },
];

// Dos despedidas segmentadas por resultado del NPS (patrón real: distinto cierre
// para promotor vs. detractor) que hoy NO están conectadas a ningún camino del
// flujo — son el ejemplo de "despedida sin usar" que Lógica debe superficiar —
// más la despedida general que sí cierra el flujo por defecto.
export const DESPEDIDAS: Despedida[] = [
  { id: 'desp_general',   nombre: 'Despedida general',            usada: true },
  { id: 'desp_promotor',  nombre: 'Despedida · Promotor NPS',     usada: false },
  { id: 'desp_detractor', nombre: 'Despedida · Detractor NPS',    usada: false },
];

// El flujo lineal vigente del estudio (tal como quedó diseñado en Estructura,
// antes de que Lógica agregue ninguna bifurcación).
export const FLUJO: FlujoNodo[] = [
  { id: 'n0', tipo: 'bienvenida', label: 'Bienvenida' },
  { id: 'n1', tipo: 'pregunta',   label: 'Q1 · NPS',               refId: 'q1' },
  { id: 'n2', tipo: 'pregunta',   label: 'Q2 · Comentario abierto', refId: 'q2' },
  { id: 'n3', tipo: 'pregunta',   label: 'Q3 · CSAT atención',     refId: 'q3' },
  { id: 'n4', tipo: 'pregunta',   label: 'Q4 · Sucursal',          refId: 'q4' },
  { id: 'n5', tipo: 'despedida',  label: 'Despedida general',      refId: 'desp_general' },
];

export const SIMULATED_RESPONSES: Record<string, string | number> = {
  q1: 4,
  q2: 'El proceso de trámite fue más largo de lo esperado y no recibí suficiente comunicación durante el proceso.',
  q3: 3,
  q4: 'Quito Norte',
};
