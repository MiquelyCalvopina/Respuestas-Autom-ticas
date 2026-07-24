// Catálogo de condiciones por tipo (sección 7 de la spec). Fuente de verdad de
// qué operadores y qué control de valor expone cada tipo de pregunta/variable.
//
// Diferencia arquitectónica clave vs. Alertas/Tickets: Lógica evalúa en vivo
// durante la sesión del encuestado, por eso SÍ expone "vacía"/"no contestó" en
// preguntas (sección 7, nota transversal).

import { Pregunta, VariableTipo } from '@/app/data/estudio';
import { Condicion } from './types';

// ── Sets de operadores ────────────────────────────────────────────────────────
export const OPS = {
  // preguntas
  escala:   ['Es igual a', 'No es igual a', 'Es mayor que', 'Es mayor o igual a', 'Es menor que', 'Es menor o igual a', 'Está entre', 'Está vacía', 'No está vacía'],
  grupo:    ['Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  abierta:  ['Contiene', 'No contiene', 'Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  abiertaCat: ['Contiene', 'No contiene', 'Es igual a', 'No es igual a', 'Habla de', 'No habla de', 'Está vacía', 'No está vacía'],
  simple:   ['Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  multiple: ['Contiene', 'No contiene', 'Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  comentario: ['Contiene', 'No contiene', 'Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  comentarioCat: ['Contiene', 'No contiene', 'Es igual a', 'No es igual a', 'Habla de', 'No habla de', 'Está vacía', 'No está vacía'],
  casilla:  ['Es igual a', 'No es igual a'],
  maxdiff:  ['Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  ranking:  ['Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  archivo:  ['Fue contestada', 'No fue contestada'],
  // campos de formulario
  campoTexto:  ['Contiene', 'No contiene', 'Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  campoNumero: ['Es igual a', 'No es igual a', 'Es mayor que', 'Es mayor o igual a', 'Es menor que', 'Es menor o igual a', 'Está entre', 'Está vacía', 'No está vacía'],
  campoCorreo: ['Contiene', 'No contiene', 'Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  campoFecha:  ['Es igual a', 'No es igual a', 'Es después de', 'Es antes de', 'Está entre', 'Está vacía', 'No está vacía'],
  campoUrl:    ['Contiene', 'No contiene', 'Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  // variables
  varTexto:  ['Contiene', 'No contiene', 'Está en la lista', 'No está en la lista', 'Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  varNumero: ['Es igual a', 'No es igual a', 'Es mayor que', 'Es mayor o igual a', 'Es menor que', 'Es menor o igual a', 'Está entre', 'Está vacía', 'No está vacía'],
  varFecha:  ['Es igual a', 'No es igual a', 'Es después de', 'Es antes de', 'Está entre', 'Está vacía', 'No está vacía'],
  varCorreo: ['Contiene', 'No contiene', 'Pertenece a los dominios', 'No pertenece a los dominios', 'Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
} as const;

export const SIN_VALOR = new Set(['Está vacía', 'No está vacía', 'Fue contestada', 'No fue contestada']);
export const RANGO = new Set(['Está entre']);
export const LISTA_TAGS = new Set(['Está en la lista', 'No está en la lista', 'Pertenece a los dominios', 'No pertenece a los dominios']);
export const MULTI_IGUALDAD = new Set(['Es igual a', 'No es igual a', 'Contiene', 'No contiene', 'Habla de', 'No habla de']);

// ── Sub-selectores (segundo control, entre pregunta y operador) ────────────────
export type SubOpcion = { value: string; label: string };

export function subSelectorDe(q: Pregunta): { label: string; opciones: SubOpcion[] } | null {
  switch (q.tipo) {
    case 'formulario':
      return { label: 'Campo del formulario', opciones: (q.campos ?? []).map(c => ({ value: c.key, label: c.label })) };
    case 'seleccion_simple':
    case 'seleccion_multiple':
    case 'dropdown':
    case 'si_no':
      return { label: 'Evaluar', opciones: [{ value: 'opcion', label: 'La opción elegida' }, { value: 'comentario', label: 'El comentario' }] };
    case 'maxdiff':
      return { label: 'Evaluar', opciones: [{ value: 'mas', label: 'Más importante' }, { value: 'menos', label: 'Menos importante' }] };
    default:
      return null;
  }
}

/** Preguntas de indicador (con grupos configurados) que exponen "Por nota"/"Por grupo". */
export function tieneModoNotaGrupo(q: Pregunta): boolean {
  return q.tipo === 'matriz' || (!!q.grupos && ['NPS', 'CSAT', 'CES', 'CLI'].includes(q.tipo));
}

// ── Resolución de operadores según pregunta + estado de sub-selectores ─────────
export function operadoresPregunta(q: Pregunta, c: Condicion): string[] {
  switch (q.tipo) {
    case 'NPS': case 'CSAT': case 'CES': case 'CLI':
      // segmented Por nota/Por grupo; sin elegir, se asume "nota"
      return c.modoMatriz === 'grupo' ? [...OPS.grupo] : [...OPS.escala];
    case 'rating':
      return [...OPS.escala];
    case 'matriz':
      if (!c.filaMatriz) return [];
      return c.modoMatriz === 'grupo' ? [...OPS.grupo] : [...OPS.escala];
    case 'texto_abierto':
      return q.categorizable ? [...OPS.abiertaCat] : [...OPS.abierta];
    case 'formulario': {
      const campo = (q.campos ?? []).find(f => f.key === c.subTipo);
      if (!campo) return [];
      return { texto: OPS.campoTexto, numero: OPS.campoNumero, correo: OPS.campoCorreo, fecha: OPS.campoFecha, url: OPS.campoUrl }[campo.tipo].slice();
    }
    case 'seleccion_simple': case 'dropdown': case 'si_no':
      if (c.subTipo === 'comentario') return q.categorizable ? [...OPS.comentarioCat] : [...OPS.comentario];
      return [...OPS.simple];
    case 'seleccion_multiple':
      if (c.subTipo === 'comentario') return q.categorizable ? [...OPS.comentarioCat] : [...OPS.comentario];
      return [...OPS.multiple];
    case 'casilla':   return [...OPS.casilla];
    case 'maxdiff':   return c.subTipo ? [...OPS.maxdiff] : [];
    case 'ranking':   return [...OPS.ranking];
    case 'cargar_archivo': return [...OPS.archivo];
    default: return [];
  }
}

export function operadoresVariable(tipo: VariableTipo): string[] {
  return { texto: OPS.varTexto, numero: OPS.varNumero, fecha: OPS.varFecha, correo: OPS.varCorreo }[tipo].slice();
}

// ── ¿La condición está lista? (feedback "✓ Condición lista") ────────────────────
export function condicionLista(c: Condicion, preguntaTipo?: Pregunta): boolean {
  if (!c.campo || !c.operador) return false;
  // matriz necesita fila + modo antes de operador (ya reflejado en operador vacío)
  if (SIN_VALOR.has(c.operador)) return true;
  if (RANGO.has(c.operador)) return c.valor.trim() !== '' && c.valorB.trim() !== '';
  if (LISTA_TAGS.has(c.operador)) return c.valores.length > 0;
  if (MULTI_IGUALDAD.has(c.operador) && c.valores.length > 0) return true;
  return c.valor.trim() !== '';
}
