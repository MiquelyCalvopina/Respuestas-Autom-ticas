// Catálogo de condiciones por tipo. Fuente de verdad de qué operadores y qué
// control de valor expone cada tipo de pregunta/variable, alineado con el
// estándar "Questions and Variables Logic" (hojas Pregunta-AHORA / Variables-ahora).
//
// Diferencia clave con Respuestas Automáticas: Lógica evalúa EN VIVO durante la
// sesión del encuestado, así que SÍ puede distinguir respuesta vacía de
// contestada. Por eso, a diferencia de RA (que trabaja sobre answers.data ya
// guardado), aquí las preguntas exponen tanto "Está vacía" como "No está vacía".
// La Casilla es la excepción (siempre está contestada: solo igualdad).
//
// Distinción clave que solo Lógica puede hacer (evalúa en vivo):
//   - "Se respondió" / "No se respondió": si el encuestado interactuó con la
//     pregunta (la vio y la contestó, o la dejó pasar).
//   - "Está vacía" / "No está vacía": si el contenido de la respuesta está vacío.
// Son cosas distintas: se puede haber respondido dejando el campo vacío.
//
// NO existe "Habla de" / "No habla de" en Lógica: la categorización de
// comentarios se calcula sobre respuestas ya procesadas y el front no la tiene
// disponible durante la sesión. Ese operador vive en Alertas/Tickets, no aquí.

import { Pregunta, VariableTipo, variableByKey } from '@/app/data/estudio';
import { Condicion } from './types';

// ── Sets de operadores ────────────────────────────────────────────────────────
export const OPS = {
  // preguntas — indicadores/escala (NPS, CSAT, CES, CLI, Rating y Matriz "Por nota")
  escala:   ['Se respondió', 'No se respondió', 'Es igual a', 'No es igual a', 'Es mayor que', 'Es mayor o igual a', 'Es menor que', 'Es menor o igual a', 'Está entre', 'Está vacía', 'No está vacía'],
  abierta:  ['Se respondió', 'No se respondió', 'Contiene', 'No contiene', 'Está en la lista', 'No está en la lista', 'Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  simple:   ['Se respondió', 'No se respondió', 'Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  multiple: ['Se respondió', 'No se respondió', 'Contiene', 'No contiene', 'Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  // Comentario de Opción SIMPLE (incluye tags de lista)
  comentarioSimple:    ['Se respondió', 'No se respondió', 'Contiene', 'No contiene', 'Está en la lista', 'No está en la lista', 'Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  // Comentario de Opción MÚLTIPLE (sin tags de lista)
  comentarioMultiple:    ['Se respondió', 'No se respondió', 'Contiene', 'No contiene', 'Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  casilla:  ['Se respondió', 'No se respondió', 'Es igual a', 'No es igual a'], // sin vacía: siempre tiene estado
  maxdiff:  ['Se respondió', 'No se respondió', 'Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  ranking:  ['Se respondió', 'No se respondió', 'Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  archivo:  ['Se respondió', 'No se respondió'], // subir archivo: solo interacción
  // campos de formulario
  campoTexto:  ['Se respondió', 'No se respondió', 'Contiene', 'No contiene', 'Está en la lista', 'No está en la lista', 'Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  campoNumero: ['Se respondió', 'No se respondió', 'Es igual a', 'No es igual a', 'Es mayor que', 'Es mayor o igual a', 'Es menor que', 'Es menor o igual a', 'Está entre', 'Está vacía', 'No está vacía'],
  campoCorreo: ['Se respondió', 'No se respondió', 'Contiene', 'No contiene', 'Pertenece a los dominios', 'No pertenece a los dominios', 'Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  campoFecha:  ['Se respondió', 'No se respondió', 'Es igual a', 'No es igual a', 'Es después de', 'Es antes de', 'Está entre', 'Está vacía', 'No está vacía'],
  campoUrl:    ['Se respondió', 'No se respondió', 'Contiene', 'No contiene', 'Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  // variables (igual que preguntas en Lógica: exponen "Está vacía" y "No está vacía")
  varTexto:  ['Contiene', 'No contiene', 'Está en la lista', 'No está en la lista', 'Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  varNumero: ['Es igual a', 'No es igual a', 'Es mayor que', 'Es mayor o igual a', 'Es menor que', 'Es menor o igual a', 'Está entre', 'Está vacía', 'No está vacía'],
  varFecha:  ['Es igual a', 'No es igual a', 'Es después de', 'Es antes de', 'Está entre', 'Está vacía', 'No está vacía'],
  varCorreo: ['Contiene', 'No contiene', 'Pertenece a los dominios', 'No pertenece a los dominios', 'Es igual a', 'No es igual a', 'Está vacía', 'No está vacía'],
  // Variables especiales de lista cerrada (canal de respuesta, dispositivo,
  // plataforma…): solo igualdad, sin controles de texto libre ni "vacía"
  // (siempre se conoce, no depende de que el encuestado responda algo).
  varCanal: ['Es igual a', 'No es igual a'],
} as const;

export const SIN_VALOR = new Set(['Está vacía', 'No está vacía', 'Se respondió', 'No se respondió']);
/** Operadores de interacción: el sujeto es la PREGUNTA, no su respuesta. */
export const RESPONDIDO = new Set(['Se respondió', 'No se respondió']);
export const RANGO = new Set(['Está entre']);
export const LISTA_TAGS = new Set(['Está en la lista', 'No está en la lista', 'Pertenece a los dominios', 'No pertenece a los dominios']);
export const MULTI_IGUALDAD = new Set(['Es igual a', 'No es igual a', 'Contiene', 'No contiene']);

// ── Sub-selectores (segundo control, entre pregunta y operador) ────────────────
export type SubOpcion = { value: string; label: string };

export function subSelectorDe(q: Pregunta): { label: string; opciones: SubOpcion[] } | null {
  switch (q.tipo) {
    case 'formulario':
      return { label: 'Campo del formulario', opciones: (q.campos ?? []).map(c => ({ value: c.key, label: c.label })) };
    case 'seleccion_simple':
    case 'seleccion_multiple':
    case 'seleccion_imagenes':
    case 'dropdown':
    case 'si_no':
      return { label: 'Evaluar', opciones: [{ value: 'opcion', label: 'La opción elegida' }, { value: 'comentario', label: 'El comentario' }] };
    case 'maxdiff':
      return { label: 'Evaluar', opciones: [{ value: 'mas', label: 'Más importante' }, { value: 'menos', label: 'Menos importante' }] };
    case 'ranking':
      // Las condiciones de Ranking son POR POSICIÓN: se elige la posición del
      // ranking (1..N) y luego qué opción quedó en esa posición.
      return { label: 'Posición', opciones: (q.opciones ?? []).map((_, i) => ({ value: String(i + 1), label: `Posición ${i + 1}` })) };
    default:
      return null;
  }
}

// ── Resolución de operadores según pregunta + estado de sub-selectores ─────────
export function operadoresPregunta(q: Pregunta, c: Condicion): string[] {
  switch (q.tipo) {
    case 'NPS': case 'CSAT': case 'CES': case 'CLI':
      // En Lógica no se distingue el grupo (se calcula post-sesión): SIEMPRE
      // se opera por nota. No hay control "Por nota/Por grupo".
      return [...OPS.escala];
    case 'rating':
      // Rating es una escala como NPS/CSAT (y tampoco tiene grupo atado).
      return [...OPS.escala];
    case 'matriz':
      if (!c.filaMatriz) return [];
      return [...OPS.escala]; // por nota (sin grupo)
    case 'texto_abierto':
      return [...OPS.abierta];
    case 'expresion':
      // "Expresión" es un elemento de presentación: no se responde, así que no
      // hay respuesta que evaluar. Solo puede ser destino de una consecuencia.
      return [];
    case 'formulario': {
      const campo = (q.campos ?? []).find(f => f.key === c.subTipo);
      if (!campo) return [];
      return { texto: OPS.campoTexto, numero: OPS.campoNumero, correo: OPS.campoCorreo, fecha: OPS.campoFecha, url: OPS.campoUrl }[campo.tipo].slice();
    }
    case 'seleccion_simple': case 'dropdown': case 'si_no':
      if (c.subTipo === 'comentario') return [...OPS.comentarioSimple];
      return [...OPS.simple];
    // El estándar agrupa "Opción múltiple / Selección de imágenes": mismo set.
    case 'seleccion_multiple': case 'seleccion_imagenes':
      if (c.subTipo === 'comentario') return [...OPS.comentarioMultiple];
      return [...OPS.multiple];
    case 'casilla':   return [...OPS.casilla];
    case 'maxdiff':   return c.subTipo ? [...OPS.maxdiff] : [];
    case 'ranking':   return c.subTipo ? [...OPS.ranking] : []; // requiere elegir la posición
    case 'cargar_archivo': return [...OPS.archivo];
    default: return [];
  }
}

export function operadoresVariable(tipo: VariableTipo): string[] {
  return { texto: OPS.varTexto, numero: OPS.varNumero, fecha: OPS.varFecha, correo: OPS.varCorreo, canal: OPS.varCanal }[tipo].slice();
}

/** ¿El control de valor (sobre opciones/escala) debe ser select MÚLTIPLE (OR)?
 *  Según el estándar: indicadores/escala y matriz en "Es igual a"/"No es igual a"
 *  → múltiple; modo "Grupo" → múltiple; Opción múltiple → múltiple; Opción
 *  simple / Dropdown / Sí-No / MaxDiff → simple; mayor/menor → simple. */
export function seleccionMultiple(q: Pregunta, c: Condicion): boolean {
  const igual = c.operador === 'Es igual a' || c.operador === 'No es igual a';
  const contiene = c.operador === 'Contiene' || c.operador === 'No contiene';
  switch (q.tipo) {
    case 'NPS': case 'CSAT': case 'CES': case 'CLI': case 'rating': case 'matriz':
      return igual; // "Por nota": igualdad → múltiple; comparaciones → simple
    case 'seleccion_multiple': case 'seleccion_imagenes':
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
/** Normaliza un dominio agregando el "@" inicial si falta (mismo comportamiento
 *  que Alertas): "gmail.com" → "@gmail.com". Deja intacto lo que no parezca un
 *  dominio para que la validación pueda marcarlo en rojo. */
export function normalizarDominio(v: string): string {
  const t = v.trim();
  if (!t) return t;
  return t.startsWith('@') ? t : `@${t}`;
}

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
  if (q.tipo === 'matriz') return 'numero'; // solo por nota
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
