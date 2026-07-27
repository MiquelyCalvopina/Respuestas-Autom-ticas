// Catálogo de condiciones por tipo. Fuente de verdad de qué operadores y qué
// control de valor expone cada tipo de pregunta/variable, alineado con el
// estándar "Questions and Variables Logic" (hojas Pregunta-AHORA / Variables-ahora).
//
// Regla transversal del estándar: las PREGUNTAS solo exponen "No está vacía"
// (no "Está vacía"), hasta que el front mande al back la diferencia entre
// respuesta completa y vacía. Las VARIABLES sí exponen "Está vacía" y "No está
// vacía". La Casilla no expone ninguna de las dos.

import { Pregunta, VariableTipo, variableByKey } from '@/app/data/estudio';
import { Condicion } from './types';

// ── Sets de operadores ────────────────────────────────────────────────────────
export const OPS = {
  // preguntas — indicadores/escala (NPS, CSAT, CES, CLI, Rating y Matriz "Por nota")
  escala:   ['Es igual a', 'No es igual a', 'Es mayor que', 'Es mayor o igual a', 'Es menor que', 'Es menor o igual a', 'Está entre', 'No está vacía'],
  grupo:    ['Es igual a', 'No es igual a', 'No está vacía'],
  abierta:  ['Contiene', 'No contiene', 'Está en la lista', 'No está en la lista', 'Es igual a', 'No es igual a', 'No está vacía'],
  abiertaCat: ['Contiene', 'No contiene', 'Está en la lista', 'No está en la lista', 'Es igual a', 'No es igual a', 'Habla de', 'No habla de', 'No está vacía'],
  simple:   ['Es igual a', 'No es igual a', 'No está vacía'],
  multiple: ['Contiene', 'No contiene', 'Es igual a', 'No es igual a', 'No está vacía'],
  // Comentario de Opción SIMPLE (incluye tags de lista)
  comentarioSimple:    ['Contiene', 'No contiene', 'Está en la lista', 'No está en la lista', 'Es igual a', 'No es igual a', 'No está vacía'],
  comentarioSimpleCat: ['Contiene', 'No contiene', 'Está en la lista', 'No está en la lista', 'Es igual a', 'No es igual a', 'Habla de', 'No habla de', 'No está vacía'],
  // Comentario de Opción MÚLTIPLE (sin tags de lista)
  comentarioMultiple:    ['Contiene', 'No contiene', 'Es igual a', 'No es igual a', 'No está vacía'],
  comentarioMultipleCat: ['Contiene', 'No contiene', 'Es igual a', 'No es igual a', 'Habla de', 'No habla de', 'No está vacía'],
  casilla:  ['Es igual a', 'No es igual a'],
  maxdiff:  ['Es igual a', 'No es igual a', 'No está vacía'],
  ranking:  ['Es igual a', 'No es igual a', 'No está vacía'],
  archivo:  ['Fue contestada', 'No fue contestada'], // no está en el estándar; se conserva
  // campos de formulario (preguntas → sin "Está vacía")
  campoTexto:  ['Contiene', 'No contiene', 'Está en la lista', 'No está en la lista', 'Es igual a', 'No es igual a', 'No está vacía'],
  campoNumero: ['Es igual a', 'No es igual a', 'Es mayor que', 'Es mayor o igual a', 'Es menor que', 'Es menor o igual a', 'Está entre', 'No está vacía'],
  campoCorreo: ['Contiene', 'No contiene', 'Pertenece a los dominios', 'No pertenece a los dominios', 'Es igual a', 'No es igual a', 'No está vacía'],
  campoFecha:  ['Es igual a', 'No es igual a', 'Es después de', 'Es antes de', 'Está entre', 'No está vacía'],
  campoUrl:    ['Contiene', 'No contiene', 'Es igual a', 'No es igual a', 'No está vacía'],
  // variables (sí exponen "Está vacía" y "No está vacía")
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
    case 'expresion':
      // Una Expresión es una captura de texto libre: mismos operadores que una
      // respuesta abierta sin categorización.
      return [...OPS.abierta];
    case 'formulario': {
      const campo = (q.campos ?? []).find(f => f.key === c.subTipo);
      if (!campo) return [];
      return { texto: OPS.campoTexto, numero: OPS.campoNumero, correo: OPS.campoCorreo, fecha: OPS.campoFecha, url: OPS.campoUrl }[campo.tipo].slice();
    }
    case 'seleccion_simple': case 'dropdown': case 'si_no':
      if (c.subTipo === 'comentario') return q.categorizable ? [...OPS.comentarioSimpleCat] : [...OPS.comentarioSimple];
      return [...OPS.simple];
    case 'seleccion_multiple':
      if (c.subTipo === 'comentario') return q.categorizable ? [...OPS.comentarioMultipleCat] : [...OPS.comentarioMultiple];
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

/** ¿El control de valor (sobre opciones/escala) debe ser select MÚLTIPLE (OR)?
 *  Según el estándar: indicadores/escala y matriz en "Es igual a"/"No es igual a"
 *  → múltiple; modo "Grupo" → múltiple; Opción múltiple → múltiple; Opción
 *  simple / Dropdown / Sí-No / MaxDiff → simple; mayor/menor → simple. */
export function seleccionMultiple(q: Pregunta, c: Condicion): boolean {
  if (c.modoMatriz === 'grupo') return true;
  const igual = c.operador === 'Es igual a' || c.operador === 'No es igual a';
  const contiene = c.operador === 'Contiene' || c.operador === 'No contiene';
  switch (q.tipo) {
    case 'NPS': case 'CSAT': case 'CES': case 'CLI': case 'rating': case 'matriz':
      return igual; // "Por nota": igualdad → múltiple; comparaciones → simple
    case 'seleccion_multiple':
      return igual || contiene;
    default:
      return false; // seleccion_simple, dropdown, si_no, maxdiff → select simple
  }
}

// ── ¿La condición está lista? (feedback "✓ Condición lista") ────────────────────
// "Lista" = estructuralmente completa (tiene todos los campos requeridos). La
// validez del formato del valor se comprueba aparte con errorCondicion().
export function condicionLista(c: Condicion, preguntaTipo?: Pregunta): boolean {
  if (!c.campo || !c.operador) return false;
  // matriz necesita fila + modo antes de operador (ya reflejado en operador vacío)
  if (SIN_VALOR.has(c.operador)) return true;
  if (RANGO.has(c.operador)) return c.valor.trim() !== '' && c.valorB.trim() !== '';
  if (LISTA_TAGS.has(c.operador)) return c.valores.length > 0;
  if (MULTI_IGUALDAD.has(c.operador) && c.valores.length > 0) return true;
  return c.valor.trim() !== '';
}

// ── Validadores de formato ─────────────────────────────────────────────────────
/** Dominio válido, con o sin "@" inicial (ej. gmail.com, @sub.example.co.uk). */
export function esDominioValido(v: string): boolean {
  const d = v.trim().replace(/^@/, '');
  if (!d || d.length > 253) return false;
  return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(d);
}

/** Correo electrónico con estructura usuario@dominio.tld. */
export function esCorreoValido(v: string): boolean {
  const s = v.trim();
  if (!s || s.length > 254 || /\s/.test(s)) return false;
  const at = s.indexOf('@');
  if (at <= 0 || at !== s.lastIndexOf('@')) return false;
  return esDominioValido(s.slice(at + 1));
}

/** URL válida (acepta sin protocolo, ej. example.com/ruta). */
export function esUrlValida(v: string): boolean {
  const s = v.trim();
  if (!s || /\s/.test(s)) return false;
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(s) ? s : `https://${s}`);
    return url.hostname === 'localhost' || /\.[a-z]{2,}$/i.test(url.hostname);
  } catch { return false; }
}

/** Tipo efectivo del valor de una condición, para elegir la validación. */
function tipoDelValor(c: Condicion, q?: Pregunta): VariableTipo | 'url' | 'texto' | 'opciones' {
  if (c.fuente === 'variable') return variableByKey(c.campo)?.tipo ?? 'texto';
  if (!q) return 'texto';
  if (q.tipo === 'formulario') {
    const campo = (q.campos ?? []).find(f => f.key === c.subTipo);
    return campo?.tipo === 'numero' ? 'numero'
      : campo?.tipo === 'fecha' ? 'fecha'
      : campo?.tipo === 'correo' ? 'correo'
      : campo?.tipo === 'url' ? 'url'
      : 'texto';
  }
  if (c.subTipo === 'comentario') return 'texto';
  if (['NPS', 'CSAT', 'CES', 'CLI', 'rating'].includes(q.tipo)) return 'numero';
  if (q.tipo === 'matriz') return c.modoMatriz === 'grupo' ? 'texto' : 'numero';
  return 'texto';
}

/** Mensaje de error de formato del valor, o null si es válido/incompleto.
 *  No exige que la condición esté completa: solo valida lo ya escrito. */
export function errorCondicion(c: Condicion, q?: Pregunta): string | null {
  if (!c.operador || SIN_VALOR.has(c.operador)) return null;

  // Tags de dominios: cada valor debe ser un dominio real.
  if (c.operador.includes('dominios')) {
    const malos = c.valores.filter(v => v.trim() && !esDominioValido(v));
    if (!malos.length) return null;
    return `Dominio${malos.length > 1 ? 's' : ''} no válido${malos.length > 1 ? 's' : ''}: ${malos.join(', ')}`;
  }
  // Otras listas de tags: sin valores vacíos.
  if (LISTA_TAGS.has(c.operador)) {
    return c.valores.some(v => !v.trim()) ? 'Hay valores vacíos en la lista.' : null;
  }

  const tipo = tipoDelValor(c, q);

  // Rango "Está entre": ambos válidos e inicio ≤ fin (y dentro de la escala).
  if (RANGO.has(c.operador)) {
    if (c.valor.trim() === '' || c.valorB.trim() === '') return null; // incompleto
    if (tipo === 'fecha') {
      return c.valor > c.valorB ? 'La fecha inicial debe ser anterior o igual a la final.' : null;
    }
    const a = Number(c.valor), b = Number(c.valorB);
    if (Number.isNaN(a) || Number.isNaN(b)) return 'Ingresa números válidos.';
    if (a > b) return 'El valor inicial debe ser menor o igual al final.';
    if (q?.escala) {
      const [min, max] = q.escala;
      if (a < min || b > max) return `Los valores deben estar entre ${min} y ${max}.`;
    }
    return null;
  }

  // Igualdad exacta sobre correo / URL: formato válido.
  const igualdadExacta = c.operador === 'Es igual a' || c.operador === 'No es igual a';
  if (igualdadExacta && c.valor.trim() !== '') {
    if (tipo === 'correo' && !esCorreoValido(c.valor)) return 'Correo no válido.';
    if (tipo === 'url' && !esUrlValida(c.valor)) return 'URL no válida.';
  }

  // Numérico libre (fuera de selección acotada): número dentro de la escala.
  if (tipo === 'numero' && !MULTI_IGUALDAD.has(c.operador) && c.valor.trim() !== '') {
    const n = Number(c.valor);
    if (Number.isNaN(n)) return 'Ingresa un número válido.';
    if (q?.escala) {
      const [min, max] = q.escala;
      if (n < min || n > max) return `El valor debe estar entre ${min} y ${max}.`;
    }
  }

  return null;
}
