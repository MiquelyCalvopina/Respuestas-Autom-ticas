// Narración de una regla en lenguaje natural.
//
// Principios acordados:
// 1. Las referencias usan SIEMPRE el texto tal como el usuario diseñó su
//    encuesta (enunciado de la pregunta, label del campo, nombre de la página).
//    Nunca se normaliza ni se reescribe; si viene vacío, se cae a un descriptor
//    neutro por posición ("campo 2", "fila 3"), jamás a un nombre inventado.
// 2. El texto del usuario se trunca para que la fila sea escaneable, y se
//    conserva completo en `full` para el tooltip. El pnum nunca se trunca.
// 3. Una línea por condición (los conectores Y/O se pintan aparte) + una línea
//    de consecuencia con verbo explícito. Nunca "se muestra u oculta".
// 4. Vocabulario de operadores = el del estándar de condiciones (un solo
//    vocabulario entre el formulario y la lista).

import {
  preguntaById, despedidaById, variableByKey, paginaByN, DESPEDIDAS, PAGINAS, Pregunta,
} from '@/app/data/estudio';
import { Regla, Condicion, GrupoCondicion, Conector, ConsecuenciaTipo, Momento } from './types';
import { SIN_VALOR, RANGO, RESPONDIDO } from './catalog';

// ── Segmentos ────────────────────────────────────────────────────────────────
export type SegKind = 'ref' | 'valor' | 'op';
export interface Seg {
  t: string;
  kind?: SegKind;
  /** texto completo (para tooltip) cuando `t` viene truncado */
  full?: string;
}
const plain = (t: string): Seg => ({ t });
const op = (t: string): Seg => ({ t, kind: 'op' });
const val = (t: string): Seg => ({ t, kind: 'valor' });
const ref = (t: string, full?: string): Seg => ({ t, kind: 'ref', full: full && full !== t ? full : undefined });

const LIMITE = 34;
const trunc = (s: string, n = LIMITE) => (s.length > n ? s.slice(0, n).trimEnd() + '…' : s);
const limpio = (s?: string) => (s ?? '').trim();

// ── Etiquetas de referencia (con fallback por posición) ───────────────────────

/** Sub-campo de la condición: campo de formulario, fila de matriz, más/menos
 *  importante de MaxDiff, posición de Ranking, o el comentario de una opción. */
function subCampoLabel(q: Pregunta, c: Condicion): string | null {
  if (q.tipo === 'matriz') {
    if (!c.filaMatriz) return null;
    const nombre = limpio(c.filaMatriz);
    if (nombre) return nombre;
    const i = (q.filas ?? []).indexOf(c.filaMatriz);
    return `fila ${i >= 0 ? i + 1 : '?'}`;
  }
  if (q.tipo === 'formulario') {
    if (!c.subTipo) return null;
    const i = (q.campos ?? []).findIndex(f => f.key === c.subTipo);
    const label = limpio((q.campos ?? [])[i]?.label);
    return label || `campo ${i >= 0 ? i + 1 : '?'}`;
  }
  if (q.tipo === 'maxdiff') {
    if (c.subTipo === 'mas') return 'más importante';
    if (c.subTipo === 'menos') return 'menos importante';
    return null;
  }
  if (q.tipo === 'ranking') {
    return c.subTipo ? `posición ${c.subTipo}` : null;
  }
  // selección simple/múltiple, dropdown, sí-no: opción (por defecto) o comentario
  if (c.subTipo === 'comentario') return 'el comentario';
  return null;
}

/** Referencia a una pregunta: "P11 · ¿Qué podríamos mejorar?" (+ sub-campo). */
function refCondicion(c: Condicion): Seg {
  if (c.fuente === 'variable') {
    const v = variableByKey(c.campo);
    const nombre = limpio(v?.label) || c.campo;
    return ref(trunc(nombre), nombre);
  }
  const q = preguntaById(c.campo);
  if (!q) return ref(c.campo);
  const enunciado = limpio(q.texto);
  const sub = subCampoLabel(q, c);
  const cuerpoFull = enunciado ? `${q.pnum} · ${enunciado}` : q.pnum;
  const full = sub ? `${cuerpoFull} › ${sub}` : cuerpoFull;
  const cuerpoCorto = enunciado ? `${q.pnum} · ${trunc(enunciado)}` : q.pnum;
  return ref(sub ? `${cuerpoCorto} › ${sub}` : cuerpoCorto, full);
}

/** Referencia al destino de una consecuencia (pregunta, página o despedida). */
function refDestino(tipo: ConsecuenciaTipo, destino?: string, destinoClase?: 'pregunta' | 'pagina'): Seg {
  if (!destino) return plain('…');
  if (tipo === 'terminar') {
    const d = despedidaById(destino);
    const nombre = limpio(d?.nombre);
    if (nombre) return ref(trunc(nombre), nombre);
    const i = DESPEDIDAS.findIndex(x => x.id === destino);
    return ref(`Despedida ${i >= 0 ? i + 1 : '?'}`);
  }
  if (destinoClase === 'pagina' || destino.startsWith('pag_')) {
    const n = Number(destino.replace('pag_', ''));
    const nombre = limpio(paginaByN(n)?.nombre);
    if (nombre) return ref(trunc(nombre), nombre);
    return ref(`Página ${PAGINAS.some(p => p.n === n) ? n : '?'}`);
  }
  const q = preguntaById(destino);
  if (!q) return ref(destino);
  const enunciado = limpio(q.texto);
  const full = enunciado ? `${q.pnum} · ${enunciado}` : q.pnum;
  return ref(enunciado ? `${q.pnum} · ${trunc(enunciado)}` : q.pnum, full);
}

// ── Valores ──────────────────────────────────────────────────────────────────
/** Etiqueta de una opción; si viene vacía cae a su posición. */
function opcionLabel(q: Pregunta | undefined, v: string): string {
  const t = limpio(v);
  if (t) return `"${t}"`;
  const i = (q?.opciones ?? []).indexOf(v);
  return `opción ${i >= 0 ? i + 1 : '?'}`;
}

function valorSegs(c: Condicion): Seg[] {
  const q = c.fuente === 'response' ? preguntaById(c.campo) : undefined;
  // Casilla: estado, sin comillas
  if (q?.tipo === 'casilla') return [val(c.valor === 'no_acepto' ? 'No aceptó' : 'Aceptó')];
  // Canal de respuesta con detalle (Enlace personal/genérico, US44): se lee
  // el canal y su precisión juntos, ej. "Enlace genérico · Campaña Referidos".
  if (c.fuente === 'canal' && c.valorDetalle) {
    return [val(`"${c.valor} · ${c.valorDetalle}"`)];
  }
  // Rango: "6 y 8"
  if (RANGO.has(c.operador)) return [val(`${c.valor}`), plain(' y '), val(`${c.valorB}`)];
  // Múltiples (igualdad OR, listas, dominios): comillas y comas
  if (c.valores.length > 0) {
    const out: Seg[] = [];
    c.valores.forEach((v, i) => {
      if (i > 0) out.push(plain(', '));
      out.push(val(opcionLabel(q, v)));
    });
    return out;
  }
  const t = limpio(c.valor);
  if (!t) return [plain('…')];
  // Sobre opciones de la pregunta → comillas; numérico → tal cual
  const esOpcion = !!q?.opciones?.includes(c.valor);
  return [val(esOpcion || Number.isNaN(Number(t)) ? `"${t}"` : t)];
}

// ── Sujeto de la condición ───────────────────────────────────────────────────
/** Segmentos del sujeto. SIEMPRE nombra la pregunta o variable de origen —en una
 *  encuesta real hay varias preguntas del mismo tipo (varios formularios, NPS,
 *  etc.), así que aunque la condición sea sobre la misma pregunta que dispara la
 *  regla, omitir su referencia sería ambiguo para quien lee la lista de reglas. */
function sujetoSegs(c: Condicion): Seg[] {
  // Única fuente sin selector de elemento (existe una sola por estudio): el
  // sujeto completo ya incluye el artículo, sin prefijo "la variable"/"la
  // respuesta a" delante.
  if (c.fuente === 'canal') return [ref('el canal de respuesta')];
  if (c.fuente === 'variable') return [plain('la variable '), refCondicion(c)];

  // "Se respondió" / "No se respondió" hablan de la interacción con la pregunta:
  // el sujeto es siempre la pregunta ("P5 no se respondió").
  if (RESPONDIDO.has(c.operador)) return [refCondicion(c)];

  const q = preguntaById(c.campo);
  if (q && c.subTipo === 'comentario') return [refCondicion(c)]; // el ref ya dice "› el comentario"
  return [plain('la respuesta a '), refCondicion(c)];
}

/** Una condición → "la respuesta a P1 · … es menor o igual a 6". */
export function condicionSegs(c: Condicion, momento?: Momento): Seg[] {
  const out: Seg[] = [...sujetoSegs(c)];
  if (!c.operador) { out.push(plain(' …')); return out; }

  // Casilla: vocabulario propio. "No es igual a Aceptó" es equivalente a
  // "es No aceptó"; se resuelve el estado efectivo para que nunca se lea doble
  // negación ni "es igual a No aceptó".
  const q = c.fuente === 'response' ? preguntaById(c.campo) : undefined;
  if (q?.tipo === 'casilla') {
    const negado = c.operador === 'No es igual a';
    const noAcepto = c.valor === 'no_acepto';
    const acepto = negado ? noAcepto : !noAcepto;
    out.push(plain(' '), op('es'), plain(' '), val(acepto ? 'Aceptó' : 'No aceptó'));
    return out;
  }

  out.push(plain(out.length ? ' ' : ''), op(c.operador.toLowerCase()));
  if (!SIN_VALOR.has(c.operador)) {
    out.push(plain(' '), ...valorSegs(c));
  }
  return out;
}

// ── Narración completa: N líneas de condición + 1 de consecuencia ────────────
export interface LineaCondicion {
  /** conector respecto a la línea anterior (undefined en la primera) */
  conector?: Conector;
  /** 0 = condición del grupo, 1 = sub-condición anidada */
  nivel: number;
  segs: Seg[];
}

export interface ConsecuenciaNarrada {
  tipo: ConsecuenciaTipo;
  verbo: string;
  destino: Seg[];
}

export interface ReglaNarrada {
  condiciones: LineaCondicion[];
  consecuencia: ConsecuenciaNarrada;
}

const VERBOS: Record<ConsecuenciaTipo, string> = {
  mostrar: 'mostrar',
  ir_a: 'saltar a',
  obligatoria: 'hacer obligatoria',
  terminar: 'terminar en',
};

export function narrarRegla(regla: Regla): ReglaNarrada {
  const condiciones: LineaCondicion[] = [];
  regla.grupos.forEach((g: GrupoCondicion, gi) => {
    g.condiciones.forEach((c, ci) => {
      condiciones.push({
        // Entre grupos el conector es del grupo (Y); dentro del grupo, el de la hija (O).
        conector: gi === 0 && ci === 0 ? undefined : ci === 0 ? g.conector : (g.conectoresHijas[ci - 1] ?? 'O'),
        nivel: ci === 0 ? 0 : 1,
        segs: condicionSegs(c, regla.momento),
      });
    });
  });
  const cs = regla.consecuencia;
  return {
    condiciones,
    consecuencia: {
      tipo: cs.tipo,
      verbo: VERBOS[cs.tipo],
      destino: [refDestino(cs.tipo, cs.destino, cs.destinoClase)],
    },
  };
}
