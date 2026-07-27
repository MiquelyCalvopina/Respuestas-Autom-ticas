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
  // Nombre exacto de los frames de Figma del módulo Lógica y del shell de
  // Respuestas Automáticas: es un estudio de QA donde cada pregunta lleva el
  // nombre de su tipo (un ejemplo de cada tipo para ejercitar el catálogo).
  nombre: 'Pruebas Deuda Tecnica',
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

// Encuesta base del estudio de QA "Pruebas Deuda Tecnica" (ambiente HIR Casa),
// tal cual aparece en los frames de Figma del módulo Lógica: cada pregunta lleva
// el nombre de su TIPO — es un estudio de pruebas con un ejemplo de cada tipo
// para ejercitar el catálogo completo de condiciones (sección 7). Los pnum (P3,
// P7, P9…) y los enunciados replican exactamente los nodos del diagrama de Figma.
export const PREGUNTAS: Pregunta[] = [
  { id: 'p3_nps',        pnum: 'P3',  texto: 'NPS',                 tipo: 'NPS', escala: [0, 10], grupos: GRUPOS_NPS },
  { id: 'p7_matriz',     pnum: 'P7',  texto: 'MATRIZ',             tipo: 'matriz', escala: [1, 5], filas: ['Rapidez', 'Amabilidad', 'Claridad de la información'] },
  { id: 'p9_abierta',    pnum: 'P9',  texto: 'RESPUESTA ABIERTA',  tipo: 'texto_abierto', categorizable: true },
  { id: 'p10_formulario', pnum: 'P10', texto: 'FORMULARIO',        tipo: 'formulario', campos: [
      { key: 'nombre', label: 'Nombre', tipo: 'texto' },
      { key: 'edad', label: 'Edad', tipo: 'numero' },
      { key: 'correo', label: 'Correo', tipo: 'correo' },
      { key: 'fecha_visita', label: 'Fecha de visita', tipo: 'fecha' },
      { key: 'sitio', label: 'Sitio web', tipo: 'url' },
    ] },
  { id: 'p11_expresion', pnum: 'P11', texto: 'EXPRESIÓN',          tipo: 'expresion' },
  { id: 'p12_simple',    pnum: 'P12', texto: 'SELECCIÓN SIMPLE',   tipo: 'seleccion_simple', opciones: ['Opción A', 'Opción B', 'Opción C', 'Opción D'] },
  { id: 'p13_multiple',  pnum: 'P13', texto: 'SELECCIÓN MÚLTIPLE', tipo: 'seleccion_multiple', opciones: ['Opción A', 'Opción B', 'Opción C', 'Opción D'] },
  { id: 'p18_maxdiff',   pnum: 'P18', texto: 'MAXDIFF',            tipo: 'maxdiff', opciones: ['Precio', 'Rapidez', 'Atención', 'Ubicación'] },
  { id: 'p19_ranking',   pnum: 'P19', texto: 'RANKING',            tipo: 'ranking', opciones: ['Precio', 'Rapidez', 'Atención', 'Ubicación'] },
  { id: 'p21_archivo',   pnum: 'P21', texto: 'SUBIR ARCHIVO',      tipo: 'cargar_archivo' },
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
// abajo. Las etiquetas replican exactamente los nodos del diagrama de Figma.
export const FLUJO: FlujoNodo[] = [
  { id: 'n0',  tipo: 'bienvenida', label: 'Bienvenida' },
  { id: 'n1',  tipo: 'pregunta',   label: 'P3 NPS',              refId: 'p3_nps' },
  { id: 'n2',  tipo: 'pregunta',   label: 'P7 MATRIZ',           refId: 'p7_matriz' },
  { id: 'n3',  tipo: 'pregunta',   label: 'P9 RESPUESTA ABIERTA', refId: 'p9_abierta' },
  { id: 'n4',  tipo: 'pregunta',   label: 'P10 FORMULARIO',      refId: 'p10_formulario' },
  { id: 'n5',  tipo: 'pregunta',   label: 'P11 EXPRESIÓN',       refId: 'p11_expresion' },
  { id: 'n6',  tipo: 'pregunta',   label: 'P12 SELECCIÓN SIMPLE', refId: 'p12_simple' },
  { id: 'n7',  tipo: 'pregunta',   label: 'P13 SELECCIÓN MÚLTIPLE', refId: 'p13_multiple' },
  { id: 'n8',  tipo: 'pregunta',   label: 'P18 MAXDIFF',         refId: 'p18_maxdiff' },
  { id: 'n9',  tipo: 'pregunta',   label: 'P19 RANKING',         refId: 'p19_ranking' },
  { id: 'n10', tipo: 'pregunta',   label: 'P21 SUBIR ARCHIVO',   refId: 'p21_archivo' },
  { id: 'n11', tipo: 'despedida',  label: 'Despedida A',         refId: 'desp_a' },
];

// Helpers compartidos
export const preguntaById = (id: string) => PREGUNTAS.find(q => q.id === id);
export const despedidaById = (id: string) => DESPEDIDAS.find(d => d.id === id);
export const variableByKey = (key: string) => VARIABLES_DETALLE.find(v => v.key === key);

export const SIMULATED_RESPONSES: Record<string, string | number> = {
  p3_nps: 4,
  p9_abierta: 'El proceso de trámite fue más largo de lo esperado y no recibí suficiente comunicación durante el proceso.',
  p12_simple: 'Opción B',
};
