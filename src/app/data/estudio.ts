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
  | 'texto_abierto' | 'expresion'
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
  /** página del estudio a la que pertenece (1..N) */
  pagina: number;
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
  /** página a la que pertenece el nodo (solo preguntas) */
  pagina?: number;
}

export interface Pagina {
  n: number;
  nombre: string;
}

export const ESTUDIO = {
  // Estudio de QA: un ejemplo de CADA tipo de pregunta, en orden (P1..P17),
  // repartido en varias páginas para ejercitar también la lógica ligada a
  // páginas ("Mostrar › la página", saltos de página).
  nombre: 'Pruebas Deuda Tecnica',
  cliente: 'HIR Casa',
  activo: true,
  /** el estudio tiene varias páginas (habilita "Mostrar › la página") */
  totalPaginas: 3,
};

// Páginas del estudio (agrupan las preguntas en Estructura).
export const PAGINAS: Pagina[] = [
  { n: 1, nombre: 'Página 1 · Indicadores' },
  { n: 2, nombre: 'Página 2 · Opciones' },
  { n: 3, nombre: 'Página 3 · Detalle' },
];
export const paginaByN = (n: number) => PAGINAS.find(p => p.n === n);

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
const OPC_ABCD = ['Opción A', 'Opción B', 'Opción C', 'Opción D'];
const FACTORES = ['Precio', 'Rapidez', 'Atención', 'Ubicación'];

// Encuesta base del estudio de QA "Pruebas Deuda Tecnica": UN ejemplo de CADA
// tipo de pregunta, en orden (P1..P17) y repartido en 3 páginas. Ejercita el
// catálogo completo de condiciones (sección 7). Cada pregunta lleva el nombre
// de su tipo para que el diagrama y las reglas sean legibles.
export const PREGUNTAS: Pregunta[] = [
  // ── Página 1 · Indicadores ──
  { id: 'q_nps',    pnum: 'P1',  pagina: 1, texto: 'NPS',    tipo: 'NPS',  escala: [0, 10], grupos: GRUPOS_NPS },
  { id: 'q_csat',   pnum: 'P2',  pagina: 1, texto: 'CSAT',   tipo: 'CSAT', escala: [1, 5],  grupos: ['Insatisfecho', 'Neutral', 'Satisfecho'] },
  { id: 'q_ces',    pnum: 'P3',  pagina: 1, texto: 'CES',    tipo: 'CES',  escala: [1, 7],  grupos: ['Bajo esfuerzo', 'Neutral', 'Alto esfuerzo'] },
  { id: 'q_cli',    pnum: 'P4',  pagina: 1, texto: 'CLI',    tipo: 'CLI',  escala: [1, 5],  grupos: ['Bajo', 'Medio', 'Alto'] },
  { id: 'q_rating', pnum: 'P5',  pagina: 1, texto: 'Rating', tipo: 'rating', escala: [1, 5] },
  // ── Página 2 · Opciones ──
  { id: 'q_simple',   pnum: 'P6',  pagina: 2, texto: 'Selección simple',   tipo: 'seleccion_simple',   opciones: OPC_ABCD },
  { id: 'q_multiple', pnum: 'P7',  pagina: 2, texto: 'Selección múltiple', tipo: 'seleccion_multiple', opciones: OPC_ABCD },
  { id: 'q_dropdown', pnum: 'P8',  pagina: 2, texto: 'Dropdown',           tipo: 'dropdown',           opciones: OPC_ABCD },
  { id: 'q_sino',     pnum: 'P9',  pagina: 2, texto: 'Sí / No',            tipo: 'si_no',              opciones: ['Sí', 'No'] },
  { id: 'q_casilla',  pnum: 'P10', pagina: 2, texto: 'Casilla de verificación', tipo: 'casilla' },
  // ── Página 3 · Detalle ──
  { id: 'q_abierta', pnum: 'P11', pagina: 3, texto: 'Respuesta abierta', tipo: 'texto_abierto', categorizable: true },
  { id: 'q_expr',    pnum: 'P12', pagina: 3, texto: 'Expresión',         tipo: 'expresion' },
  { id: 'q_matriz',  pnum: 'P13', pagina: 3, texto: 'Matriz',            tipo: 'matriz', escala: [1, 5], filas: ['Rapidez', 'Amabilidad', 'Claridad de la información'] },
  { id: 'q_form',    pnum: 'P14', pagina: 3, texto: 'Formulario',        tipo: 'formulario', campos: [
      { key: 'nombre', label: 'Nombre', tipo: 'texto' },
      { key: 'edad', label: 'Edad', tipo: 'numero' },
      { key: 'correo', label: 'Correo', tipo: 'correo' },
      { key: 'fecha_visita', label: 'Fecha de visita', tipo: 'fecha' },
      { key: 'sitio', label: 'Sitio web', tipo: 'url' },
    ] },
  { id: 'q_maxdiff', pnum: 'P15', pagina: 3, texto: 'MaxDiff',       tipo: 'maxdiff', opciones: FACTORES },
  { id: 'q_ranking', pnum: 'P16', pagina: 3, texto: 'Ranking',       tipo: 'ranking', opciones: FACTORES },
  { id: 'q_archivo', pnum: 'P17', pagina: 3, texto: 'Subir archivo', tipo: 'cargar_archivo' },
];

// Tres despedidas del estudio de pruebas (Figma). "Despedida A" es el cierre por
// defecto (usada); B y C quedan sin usar hasta que una regla "Terminar encuesta"
// las apunte — aparecen en la caja "Despedidas sin usar" del diagrama.
export const DESPEDIDAS: Despedida[] = [
  { id: 'desp_a', nombre: 'Despedida A', usada: true },
  { id: 'desp_b', nombre: 'Despedida B', usada: false },
  { id: 'desp_c', nombre: 'Despedida C', usada: false },
];

// El flujo lineal vigente del estudio (orden de Estructura), de arriba hacia
// abajo: Bienvenida → P1..P17 (agrupadas por página) → Despedida A.
export const FLUJO: FlujoNodo[] = [
  { id: 'n0',  tipo: 'bienvenida', label: 'Bienvenida' },
  { id: 'n1',  tipo: 'pregunta',   label: 'P1 NPS',                 refId: 'q_nps',      pagina: 1 },
  { id: 'n2',  tipo: 'pregunta',   label: 'P2 CSAT',                refId: 'q_csat',     pagina: 1 },
  { id: 'n3',  tipo: 'pregunta',   label: 'P3 CES',                 refId: 'q_ces',      pagina: 1 },
  { id: 'n4',  tipo: 'pregunta',   label: 'P4 CLI',                 refId: 'q_cli',      pagina: 1 },
  { id: 'n5',  tipo: 'pregunta',   label: 'P5 Rating',              refId: 'q_rating',   pagina: 1 },
  { id: 'n6',  tipo: 'pregunta',   label: 'P6 Selección simple',    refId: 'q_simple',   pagina: 2 },
  { id: 'n7',  tipo: 'pregunta',   label: 'P7 Selección múltiple',  refId: 'q_multiple', pagina: 2 },
  { id: 'n8',  tipo: 'pregunta',   label: 'P8 Dropdown',            refId: 'q_dropdown', pagina: 2 },
  { id: 'n9',  tipo: 'pregunta',   label: 'P9 Sí / No',             refId: 'q_sino',     pagina: 2 },
  { id: 'n10', tipo: 'pregunta',   label: 'P10 Casilla',            refId: 'q_casilla',  pagina: 2 },
  { id: 'n11', tipo: 'pregunta',   label: 'P11 Respuesta abierta',  refId: 'q_abierta',  pagina: 3 },
  { id: 'n12', tipo: 'pregunta',   label: 'P12 Expresión',          refId: 'q_expr',     pagina: 3 },
  { id: 'n13', tipo: 'pregunta',   label: 'P13 Matriz',             refId: 'q_matriz',   pagina: 3 },
  { id: 'n14', tipo: 'pregunta',   label: 'P14 Formulario',         refId: 'q_form',     pagina: 3 },
  { id: 'n15', tipo: 'pregunta',   label: 'P15 MaxDiff',            refId: 'q_maxdiff',  pagina: 3 },
  { id: 'n16', tipo: 'pregunta',   label: 'P16 Ranking',            refId: 'q_ranking',  pagina: 3 },
  { id: 'n17', tipo: 'pregunta',   label: 'P17 Subir archivo',      refId: 'q_archivo',  pagina: 3 },
  { id: 'n18', tipo: 'despedida',  label: 'Despedida A',            refId: 'desp_a' },
];

// Helpers compartidos
export const preguntaById = (id: string) => PREGUNTAS.find(q => q.id === id);
export const despedidaById = (id: string) => DESPEDIDAS.find(d => d.id === id);
export const variableByKey = (key: string) => VARIABLES_DETALLE.find(v => v.key === key);

export const SIMULATED_RESPONSES: Record<string, string | number> = {
  q_nps: 4,
  q_csat: 3,
  q_abierta: 'El proceso de trámite fue más largo de lo esperado y no recibí suficiente comunicación durante el proceso.',
  q_simple: 'Opción B',
};
