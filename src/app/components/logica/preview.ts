// Motor de evaluación para la previsualización de la encuesta.
//
// Simula la sesión del encuestado aplicando las reglas creadas, con el mismo
// modelo que describe el módulo: las condiciones se evalúan EN VIVO, así que se
// puede distinguir "no se respondió" (no hubo interacción) de "está vacía"
// (respondió con contenido vacío).
//
// Evalúa todos los operadores del catálogo de Lógica (no existe "Habla de":
// la categorización solo aplica a respuestas ya procesadas).

import { FLUJO, PREGUNTAS, preguntaById } from '@/app/data/estudio';
import { Regla, Condicion, Momento } from './types';
import { RESPONDIDO } from './catalog';

/** Respuesta de una pregunta durante la simulación. `undefined` = no se respondió. */
export type Respuesta = string | string[] | undefined;
export type Respuestas = Record<string, Respuesta>;
/** Valores de las variables cargadas con la interacción. */
export type Variables = Record<string, string>;

/** ¿Hubo interacción con esta pregunta? */
function respondida(v: Respuesta): boolean {
  return v !== undefined;
}

/** Texto plano del valor respondido, para comparaciones de texto. */
function comoTexto(v: Respuesta): string {
  if (v === undefined) return '';
  return Array.isArray(v) ? v.join(', ') : String(v);
}

function comoLista(v: Respuesta): string[] {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [String(v)];
}

const norm = (s: string) => s.trim().toLowerCase();

/** Clave con la que se guarda la respuesta de una condición (contempla el
 *  sub-campo: campo de formulario, comentario, posición de ranking, etc.). */
export function claveRespuesta(c: Condicion): string {
  const q = preguntaById(c.campo);
  if (!q) return c.campo;
  if (q.tipo === 'formulario' && c.subTipo) return `${c.campo}.${c.subTipo}`;
  if (q.tipo === 'matriz' && c.filaMatriz) return `${c.campo}.${c.filaMatriz}`;
  if (q.tipo === 'ranking' && c.subTipo) return `${c.campo}.pos${c.subTipo}`;
  if (q.tipo === 'maxdiff' && c.subTipo) return `${c.campo}.${c.subTipo}`;
  if (c.subTipo === 'comentario') return `${c.campo}.comentario`;
  return c.campo;
}

/** Evalúa una condición contra las respuestas y variables de la simulación. */
export function evaluarCondicion(c: Condicion, resp: Respuestas, vars: Variables): boolean {
  if (!c.operador) return false;

  const esVar = c.fuente === 'variable';
  const esCanal = c.fuente === 'canal';
  const bruto: Respuesta = (esVar || esCanal) ? vars[c.campo] : resp[claveRespuesta(c)];

  // Canal de respuesta: si el valor elegido tiene detalle (Enlace personal/
  // genérico → medio o campaña específicos, US44), deben coincidir ambas partes.
  if (esCanal) {
    const base = norm(comoTexto(bruto));
    const coincideBase = base === norm(c.valor);
    const coincideDetalle = !c.valorDetalle || norm(comoTexto(vars[`${c.campo}_detalle`])) === norm(c.valorDetalle);
    const igual = coincideBase && coincideDetalle;
    return c.operador === 'Es igual a' ? igual : !igual;
  }

  // Expresión: no se responde, así que "Contiene" se evalúa contra su propio
  // enunciado configurado, nunca contra una respuesta (no existe ninguna).
  if (!esVar) {
    const q = preguntaById(c.campo);
    if (q?.tipo === 'expresion') {
      return norm(q.texto).includes(norm(c.valor));
    }
  }

  // Interacción: independiente del contenido.
  if (RESPONDIDO.has(c.operador)) {
    const hubo = esVar ? bruto !== undefined && bruto !== '' : respondida(bruto);
    return c.operador === 'Se respondió' ? hubo : !hubo;
  }

  const texto = comoTexto(bruto);
  const vacio = texto.trim() === '';
  if (c.operador === 'Está vacía') return vacio;
  if (c.operador === 'No está vacía') return !vacio;

  // Si no hay dato, ninguna comparación de contenido se cumple.
  if (bruto === undefined) return false;

  const lista = comoLista(bruto).map(norm);
  const objetivos = (c.valores.length > 0 ? c.valores : [c.valor]).map(norm).filter(v => v !== '');
  const num = Number(texto);
  const numA = Number(c.valor);
  const numB = Number(c.valorB);

  switch (c.operador) {
    case 'Es igual a':
      // Con varios valores el estándar los trata como OR.
      return objetivos.some(o => lista.includes(o) || norm(texto) === o);
    case 'No es igual a':
      return !objetivos.some(o => lista.includes(o) || norm(texto) === o);
    case 'Contiene':
      return objetivos.some(o => lista.includes(o) || norm(texto).includes(o));
    case 'No contiene':
      return !objetivos.some(o => lista.includes(o) || norm(texto).includes(o));
    case 'Está en la lista':
      return objetivos.includes(norm(texto)) || lista.some(v => objetivos.includes(v));
    case 'No está en la lista':
      return !(objetivos.includes(norm(texto)) || lista.some(v => objetivos.includes(v)));
    case 'Pertenece a los dominios':
      return objetivos.some(d => norm(texto).endsWith(d.replace(/^@/, '@')) || norm(texto).endsWith(d));
    case 'No pertenece a los dominios':
      return !objetivos.some(d => norm(texto).endsWith(d));
    case 'Es mayor que':        return !Number.isNaN(num) && num > numA;
    case 'Es mayor o igual a':  return !Number.isNaN(num) && num >= numA;
    case 'Es menor que':        return !Number.isNaN(num) && num < numA;
    case 'Es menor o igual a':  return !Number.isNaN(num) && num <= numA;
    case 'Está entre':
      if (!Number.isNaN(num) && !Number.isNaN(numA) && !Number.isNaN(numB)) return num >= numA && num <= numB;
      return texto >= c.valor && texto <= c.valorB; // fechas ISO
    case 'Es después de':  return texto > c.valor;
    case 'Es antes de':    return texto < c.valor;
    default:
      return false;
  }
}

/** Una regla se cumple si TODOS sus grupos se cumplen (Y entre grupos) y dentro
 *  de cada grupo se cumple al menos una condición cuando el conector es O. */
export function evaluarRegla(r: Regla, resp: Respuestas, vars: Variables): boolean {
  return r.grupos.every(g => {
    const resultados = g.condiciones.map(c => evaluarCondicion(c, resp, vars));
    if (resultados.length === 1) return resultados[0];
    // conectoresHijas[i] aplica entre condiciones[i] y condiciones[i+1]
    return resultados.reduce((acum, actual, i) => {
      if (i === 0) return actual;
      const conector = g.conectoresHijas[i - 1] ?? 'O';
      return conector === 'Y' ? acum && actual : acum || actual;
    }, false as boolean);
  });
}

export interface EstadoPregunta {
  visible: boolean;
  obligatoria: boolean;
  /** motivo por el que está oculta, para explicarlo en la previsualización */
  motivo?: string;
}

/** Estado de una pregunta según las reglas: por defecto visible, salvo que sea
 *  destino de alguna regla "Mostrar" (entonces solo se ve si esa regla se
 *  cumple). "Hacer obligatoria" la marca como requerida cuando se cumple. */
export function estadoDePregunta(
  preguntaId: string,
  reglas: Regla[],
  resp: Respuestas,
  vars: Variables,
): EstadoPregunta {
  const q = preguntaById(preguntaId);
  const reglasMostrar = reglas.filter(r =>
    r.consecuencia.tipo === 'mostrar' &&
    ((r.consecuencia.destinoClase !== 'pagina' && r.consecuencia.destino === preguntaId) ||
     (r.consecuencia.destinoClase === 'pagina' && r.consecuencia.destino === `pag_${q?.pagina}`)));

  let visible = true;
  let motivo: string | undefined;
  if (reglasMostrar.length > 0) {
    visible = reglasMostrar.some(r => evaluarRegla(r, resp, vars));
    if (!visible) motivo = 'Oculta: su regla de "Mostrar" no se cumple.';
  }

  const obligatoria = reglas.some(r =>
    r.consecuencia.tipo === 'obligatoria' &&
    r.consecuencia.destino === preguntaId &&
    evaluarRegla(r, resp, vars));

  return { visible, obligatoria, motivo };
}

export type Paso =
  | { tipo: 'pregunta'; preguntaId: string; obligatoria: boolean }
  | { tipo: 'fin'; despedidaId: string };

/** Siguiente paso del flujo tras el nodo `clave`, aplicando reglas de salto y
 *  de término, el destino por defecto y las reglas de visibilidad. */
export function siguientePaso(
  clave: string,
  reglas: Regla[],
  resp: Respuestas,
  vars: Variables,
  destinos: Record<string, string | undefined>,
): Paso {
  let actual = clave;
  const vistos = new Set<string>();

  for (let guard = 0; guard < FLUJO.length * 3; guard++) {
    if (vistos.has(actual)) break; // protección ante ciclos por reglas
    vistos.add(actual);

    const momento: Momento = actual === 'bienvenida' ? 'inicio' : actual;
    const delMomento = reglas.filter(r => r.momento === momento);

    // 1) Terminar encuesta corta el flujo.
    const term = delMomento.find(r => r.consecuencia.tipo === 'terminar' && r.consecuencia.destino && evaluarRegla(r, resp, vars));
    if (term) return { tipo: 'fin', despedidaId: term.consecuencia.destino! };

    // 2) Salto explícito.
    const salto = delMomento.find(r => r.consecuencia.tipo === 'ir_a' && r.consecuencia.destino && evaluarRegla(r, resp, vars));
    let destino = salto?.consecuencia.destino;

    // 3) Destino por defecto (personalizado o el siguiente en Estructura).
    if (!destino) {
      const custom = destinos[momento];
      if (custom) destino = custom;
      else {
        const i = FLUJO.findIndex(n => (n.tipo === 'bienvenida' ? 'bienvenida' : n.refId) === actual);
        const sig = i >= 0 ? FLUJO[i + 1] : undefined;
        destino = sig ? (sig.tipo === 'bienvenida' ? 'bienvenida' : sig.refId) : undefined;
      }
    }
    if (!destino) {
      const ultima = FLUJO.filter(n => n.tipo === 'despedida').pop();
      return { tipo: 'fin', despedidaId: ultima?.refId ?? 'desp_a' };
    }

    // ¿El destino es una despedida?
    const nodoDestino = FLUJO.find(n => n.refId === destino);
    if (nodoDestino?.tipo === 'despedida') return { tipo: 'fin', despedidaId: destino };

    // ¿Es una pregunta visible? Si está oculta, se sigue avanzando.
    const est = estadoDePregunta(destino, reglas, resp, vars);
    if (est.visible) return { tipo: 'pregunta', preguntaId: destino, obligatoria: est.obligatoria };
    actual = destino;
  }
  const ultima = FLUJO.filter(n => n.tipo === 'despedida').pop();
  return { tipo: 'fin', despedidaId: ultima?.refId ?? 'desp_a' };
}

/** Primer paso de la simulación (desde Bienvenida). */
export function primerPaso(
  reglas: Regla[], resp: Respuestas, vars: Variables, destinos: Record<string, string | undefined>,
): Paso {
  return siguientePaso('bienvenida', reglas, resp, vars, destinos);
}

/** ¿La respuesta satisface una pregunta marcada como obligatoria? */
export function respuestaCompleta(preguntaId: string, resp: Respuestas): boolean {
  const q = preguntaById(preguntaId);
  if (!q) return true;
  if (q.tipo === 'formulario') {
    return (q.campos ?? []).some(f => comoTexto(resp[`${preguntaId}.${f.key}`]).trim() !== '');
  }
  return comoTexto(resp[preguntaId]).trim() !== '';
}

export const TOTAL_PREGUNTAS = PREGUNTAS.length;
export const variableLabel = (k: string) => variableByKey(k)?.label ?? k;
