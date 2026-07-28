// Derivaciones puras a partir de las reglas + la estructura del estudio.
// Todo se recalcula en vivo (despedidas huérfanas, indicadores del canvas,
// destino por defecto) — nunca se guarda un valor "congelado".

import { FLUJO, DESPEDIDAS, PREGUNTAS, PAGINAS, Despedida, Pagina, preguntaById } from '@/app/data/estudio';
import { Regla, Momento } from './types';

/** Momento (cuándo se evalúa) derivado del contenido de la regla: la pregunta
 *  de su primera condición si es sobre una respuesta; si es sobre variable (o
 *  aún no se elige pregunta) se evalúa al inicio. Así el momento no depende del
 *  foco/selección, sino de lo que la regla realmente evalúa. */
export function momentoDeRegla(r: Regla): Momento {
  const c0 = r.grupos[0]?.condiciones[0];
  return c0 && c0.fuente === 'response' && c0.campo ? c0.campo : 'inicio';
}

/** Nodo del FLUJO correspondiente a un momento. */
export function nodoDeMomento(momento: Momento) {
  if (momento === 'inicio') return FLUJO.find(n => n.tipo === 'bienvenida');
  return FLUJO.find(n => n.tipo === 'pregunta' && n.refId === momento);
}

/** Índice de un momento dentro del FLUJO. */
function indiceMomento(momento: Momento): number {
  const nodo = nodoDeMomento(momento);
  return nodo ? FLUJO.indexOf(nodo) : -1;
}

/** Destino calculado (siguiente nodo en Estructura) para un momento — el valor
 *  natural de "En cualquier otro caso ir a" cuando no se personaliza. */
export function destinoCalculado(momento: Momento): { id: string; label: string } | null {
  const i = indiceMomento(momento);
  if (i < 0 || i + 1 >= FLUJO.length) return null;
  const sig = FLUJO[i + 1];
  return { id: sig.refId ?? sig.id, label: labelNodo(sig.refId ?? sig.id) };
}

/** Etiqueta corta de un nodo por su refId (pregunta/despedida) o 'bienvenida'. */
export function labelNodo(key: string): string {
  if (key === 'bienvenida') return 'Bienvenida';
  const q = PREGUNTAS.find(p => p.id === key);
  if (q) return q.pnum;
  const d = DESPEDIDAS.find(x => x.id === key);
  if (d) return d.nombre;
  return key;
}

/** Despedidas sin ningún camino que las alcance. desp_a es el cierre
 *  estructural por defecto (siempre usada); las demás solo si una regla
 *  "Terminar encuesta" las apunta. */
export function despedidasHuerfanas(reglas: Regla[]): Despedida[] {
  const usadas = new Set<string>(['desp_a']);
  reglas.forEach(r => {
    if (r.consecuencia.tipo === 'terminar' && r.consecuencia.destino) usadas.add(r.consecuencia.destino);
  });
  return DESPEDIDAS.filter(d => !usadas.has(d.id));
}

/** Claves de nodo (bienvenida | questionId | despedidaId) que deben mostrar el
 *  indicador de bifurcación (sección 8). */
export function nodosConLogica(reglas: Regla[]): Set<string> {
  const set = new Set<string>();
  reglas.forEach(r => {
    const origen = r.momento === 'inicio' ? 'bienvenida' : r.momento;
    const c = r.consecuencia;
    // El origen se marca salvo si la única consecuencia es Terminar encuesta.
    if (c.tipo !== 'terminar') set.add(origen);
    // Destinos:
    if (c.tipo === 'terminar') {
      if (c.destino) set.add(c.destino); // despedida destino
    } else if (c.destino && c.destinoClase !== 'pagina') {
      set.add(c.destino);
    }
  });
  return set;
}

// ── Alcance de los destinos según el momento de la regla ──────────────────────
// Regla de oro: una regla solo puede afectar lo que el encuestado AÚN no ha
// visto. Cuando la regla se dispara al responder Pn, esa pregunta y su página
// ya se mostraron, así que no pueden ser destino de "Mostrar" ni volverse
// obligatorias: solo lo que viene después. Las reglas de inicio (variables, antes
// de la primera pregunta) sí pueden afectar cualquier pregunta o página.

/** Página de la pregunta disparadora del momento (null si es una regla de inicio). */
export function paginaDeMomento(momento: Momento): number | null {
  if (momento === 'inicio') return null;
  return preguntaById(momento)?.pagina ?? null;
}

/** Preguntas que la regla puede afectar (posteriores al momento). */
export function preguntasAfectables(momento: Momento) {
  const i = indiceMomento(momento);
  return FLUJO.filter((n, k) => n.tipo === 'pregunta' && k > i);
}

/** Páginas que la regla puede mostrar/ocultar: solo las posteriores a la página
 *  de la pregunta disparadora (todas si es una regla de inicio). */
export function paginasAfectables(momento: Momento): Pagina[] {
  const pag = paginaDeMomento(momento);
  return pag == null ? [...PAGINAS] : PAGINAS.filter(p => p.n > pag);
}

/** ¿El destino elegido es válido para el momento de la regla?
 *  Devuelve el motivo del problema, o null si es válido. */
export function errorDestino(r: Regla): string | null {
  const c = r.consecuencia;
  if (!c.destino) return null; // incompleto, no inválido
  const momento = momentoDeRegla(r);

  if (c.tipo === 'mostrar' && c.destinoClase === 'pagina') {
    const n = Number(c.destino.replace('pag_', ''));
    const pagMomento = paginaDeMomento(momento);
    if (pagMomento != null && n <= pagMomento) {
      return n === pagMomento
        ? 'No puedes mostrar u ocultar la página donde está la pregunta que dispara la regla: ya se mostró.'
        : 'No puedes mostrar u ocultar una página anterior a la pregunta que dispara la regla.';
    }
    return null;
  }

  if (c.tipo === 'mostrar' || c.tipo === 'obligatoria' || c.tipo === 'ir_a') {
    if (momento === 'inicio') return null;
    if (c.destino === momento) {
      return c.tipo === 'obligatoria'
        ? 'No puedes hacer obligatoria la misma pregunta que dispara la regla.'
        : 'No puedes mostrar u ocultar la misma pregunta que dispara la regla: ya se mostró.';
    }
    const permitidas = new Set(preguntasAfectables(momento).map(n => n.refId));
    if (!permitidas.has(c.destino)) {
      return 'Solo puedes afectar preguntas posteriores a la que dispara la regla.';
    }
  }
  return null;
}

/** Números de página que alguna regla apunta como destino ("Mostrar › la página").
 *  Los destinos de página se guardan como "pag_<n>". */
export function paginasConLogica(reglas: Regla[]): Set<number> {
  const set = new Set<number>();
  reglas.forEach(r => {
    const c = r.consecuencia;
    if (c.destinoClase === 'pagina' && c.destino?.startsWith('pag_')) {
      const n = Number(c.destino.slice(4));
      if (!Number.isNaN(n)) set.add(n);
    }
  });
  return set;
}

/** Reglas de un momento. */
export function reglasDeMomento(reglas: Regla[], momento: Momento): Regla[] {
  return reglas.filter(r => r.momento === momento);
}

/** Momentos con al menos una regla, en orden de Estructura (para el estado lista
 *  sin selección: agrupación por momento). */
export function momentosConReglas(reglas: Regla[]): Momento[] {
  const orden: Momento[] = ['inicio', ...FLUJO.filter(n => n.tipo === 'pregunta').map(n => n.refId!)];
  return orden.filter(m => reglas.some(r => r.momento === m));
}

/** Simulación de validación de destino por defecto: dado un destino de prueba
 *  para un momento, ¿qué preguntas quedarían sin ningún camino de acceso?
 *  Modelo simplificado del prototipo: si el destino salta por encima de
 *  preguntas intermedias y ninguna regla del estudio las alcanza como destino,
 *  esas preguntas quedan huérfanas. */
export function preguntasSinAcceso(reglas: Regla[], momento: Momento, destinoPruebaId: string | undefined): string[] {
  if (!destinoPruebaId) return [];
  const iMomento = indiceMomento(momento);
  const nodoDestino = FLUJO.find(n => (n.refId ?? n.id) === destinoPruebaId);
  if (iMomento < 0 || !nodoDestino) return [];
  const iDestino = FLUJO.indexOf(nodoDestino);
  if (iDestino <= iMomento + 1) return []; // no salta nada
  // preguntas estrictamente entre momento y destino
  const saltadas = FLUJO.slice(iMomento + 1, iDestino).filter(n => n.tipo === 'pregunta');
  // una pregunta saltada tiene acceso si alguna regla la apunta como destino (mostrar/ir_a)
  const alcanzadas = new Set<string>();
  reglas.forEach(r => {
    const c = r.consecuencia;
    if ((c.tipo === 'mostrar' || c.tipo === 'ir_a' || c.tipo === 'obligatoria') && c.destino) alcanzadas.add(c.destino);
  });
  return saltadas.filter(n => !alcanzadas.has(n.refId!)).map(n => n.refId!);
}
