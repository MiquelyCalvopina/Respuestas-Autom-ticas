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

export type PreguntaTipo =
  | 'NPS' | 'CSAT' | 'CES' | 'CLI' | 'rating'
  | 'texto_abierto'
  | 'seleccion_simple' | 'seleccion_multiple' | 'dropdown' | 'si_no'
  | 'matriz' | 'formulario' | 'casilla' | 'maxdiff' | 'ranking' | 'cargar_archivo';

export interface CampoFormulario {
  key: string;
  label: string;
  tipo: 'texto' | 'numero' | 'correo' | 'fecha' | 'url';
}

export interface Pregunta {
  id: string;
  /** número de posición mostrado al usuario, ej. "P1" */
  pnum: string;
  texto: string;
  tipo: PreguntaTipo;
  /** [min,max] para escalas numéricas (NPS/CSAT/CES/CLI/Rating y filas de Matriz) */
  escala?: [number, number];
  /** opciones para selección/dropdown/imágenes/maxdiff/ranking */
  opciones?: string[];
  /** filas/atributos de una Matriz de escalas */
  filas?: string[];
  /** campos de un Formulario */
  campos?: CampoFormulario[];
  /** true si la pregunta tiene categorización de comentarios activa (habilita "Habla de") */
  categorizable?: boolean;
  /** grupos del indicador (ej. Detractor/Neutro/Promotor) para NPS/CSAT/CES/CLI */
  grupos?: string[];
}

export type VariableTipo = 'texto' | 'numero' | 'fecha' | 'correo';

export interface VariableDetalle {
  key: string;
  label: string;
  tipo: VariableTipo;
}

export interface Despedida {
  id: string;
  nombre: string;
  /** true si hoy hay al menos un camino del flujo que llega a ella.
   *  Es un valor semilla; Lógica lo recalcula en vivo según las reglas. */
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
  /** el estudio tiene una sola página (relevante para el bloqueo de "Mostrar › Páginas") */
  totalPaginas: 1,
};

export const SETUP: EstudioSetup = {
  empresa: 'HIR Casa',
  industria: 'Financiamiento Inmobiliario',
  tamano: 'Grande (+500 empleados)',
  descripcion: 'HIR Casa acompaña a las familias en el proceso de adquirir su vivienda propia en México.',
};

// Lista plana de nombres de variable — la consume Respuestas Automáticas tal cual.
// NO cambiar la forma de este export sin actualizar ese módulo.
export const VARIABLES = [
  'nombre_preferido', 'correo_electronico', 'sucursal',
  'canal', 'telefono', 'identificador', 'numero_credito',
];

// Variables tipadas — las usa Lógica para resolver operadores por tipo (sección 7.2).
// Mismas claves que VARIABLES, con su tipo y etiqueta legible.
export const VARIABLES_DETALLE: VariableDetalle[] = [
  { key: 'nombre_preferido',   label: 'Nombre de preferencia', tipo: 'texto' },
  { key: 'correo_electronico', label: 'Correo electrónico',    tipo: 'correo' },
  { key: 'sucursal',           label: 'Sucursal',              tipo: 'texto' },
  { key: 'canal',              label: 'Canal',                 tipo: 'texto' },
  { key: 'telefono',           label: 'Teléfono',              tipo: 'texto' },
  { key: 'identificador',      label: 'Identificador',         tipo: 'texto' },
  { key: 'numero_credito',     label: 'Número de crédito',     tipo: 'numero' },
  { key: 'fecha_entrega',      label: 'Fecha de entrega',      tipo: 'fecha' },
];

const GRUPOS_NPS = ['Detractor', 'Neutro', 'Promotor'];

export const PREGUNTAS: Pregunta[] = [
  { id: 'q1', pnum: 'P1', texto: '¿Qué tan probable es que recomiendes HIR Casa a alguien?', tipo: 'NPS', escala: [0, 10], grupos: GRUPOS_NPS },
  { id: 'q2', pnum: 'P2', texto: '¿Cuál fue el motivo principal de tu calificación?', tipo: 'texto_abierto', categorizable: true },
  { id: 'q3', pnum: 'P3', texto: '¿Cómo calificarías la atención recibida?', tipo: 'CSAT', escala: [1, 5], grupos: ['Insatisfecho', 'Neutro', 'Satisfecho'] },
  { id: 'q4', pnum: 'P4', texto: '¿En qué sucursal fuiste atendido?', tipo: 'seleccion_simple', opciones: ['Quito Norte', 'Quito Sur', 'Guayaquil', 'Cuenca'] },
  { id: 'q5', pnum: 'P5', texto: 'Califica los siguientes aspectos de tu atención', tipo: 'matriz', escala: [1, 5], filas: ['Rapidez', 'Amabilidad', 'Claridad de la información'] },
];

// Dos despedidas segmentadas por resultado del NPS (patrón real: distinto cierre
// para promotor vs. detractor). Semilla de "usada"; Lógica recalcula en vivo.
export const DESPEDIDAS: Despedida[] = [
  { id: 'desp_general',   nombre: 'Despedida general',        usada: true },
  { id: 'desp_promotor',  nombre: 'Despedida · Promotor NPS', usada: false },
  { id: 'desp_detractor', nombre: 'Despedida · Detractor NPS', usada: false },
];

// El flujo lineal vigente del estudio (orden de Estructura), de arriba hacia abajo.
export const FLUJO: FlujoNodo[] = [
  { id: 'n0', tipo: 'bienvenida', label: 'Bienvenida' },
  { id: 'n1', tipo: 'pregunta',   label: 'P1 · NPS',            refId: 'q1' },
  { id: 'n2', tipo: 'pregunta',   label: 'P2 · Comentario',     refId: 'q2' },
  { id: 'n3', tipo: 'pregunta',   label: 'P3 · CSAT atención',  refId: 'q3' },
  { id: 'n4', tipo: 'pregunta',   label: 'P4 · Sucursal',       refId: 'q4' },
  { id: 'n5', tipo: 'pregunta',   label: 'P5 · Matriz aspectos', refId: 'q5' },
  { id: 'n6', tipo: 'despedida',  label: 'Despedida general',   refId: 'desp_general' },
];

// Helpers compartidos
export const preguntaById = (id: string) => PREGUNTAS.find(q => q.id === id);
export const despedidaById = (id: string) => DESPEDIDAS.find(d => d.id === id);
export const variableByKey = (key: string) => VARIABLES_DETALLE.find(v => v.key === key);

export const SIMULATED_RESPONSES: Record<string, string | number> = {
  q1: 4,
  q2: 'El proceso de trámite fue más largo de lo esperado y no recibí suficiente comunicación durante el proceso.',
  q3: 3,
  q4: 'Quito Norte',
};
