// Resumen en lenguaje natural de una regla (sección 3.5 + 7.3).
// Devuelve segmentos para que la fila resalte las referencias (pregunta/variable/
// valor/destino) en color primario peso 500. El vocabulario es el real del
// operador según el tipo — nunca un verbo genérico (Casilla → "Aceptó", no
// "respondió"; Cargar archivo → "fue contestada"; Matriz grupo → nombre del grupo).

import { preguntaById, despedidaById, variableByKey, paginaByN } from '@/app/data/estudio';
import { Regla, Condicion, GrupoCondicion } from './types';
import { SIN_VALOR, RANGO } from './catalog';

export interface Seg { t: string; ref?: boolean }

const s = (t: string): Seg => ({ t });
const r = (t: string): Seg => ({ t, ref: true });

// Etiqueta legible del campo de una condición.
function campoLabel(c: Condicion): string {
  if (c.fuente === 'variable') {
    return variableByKey(c.campo)?.label ?? c.campo;
  }
  const q = preguntaById(c.campo);
  if (!q) return c.campo;
  if (q.tipo === 'matriz' && c.filaMatriz) return `${q.pnum} · ${c.filaMatriz}`;
  return q.pnum;
}

// Valor legible según operador/tipo.
function valorLabel(c: Condicion): string {
  const q = c.fuente === 'response' ? preguntaById(c.campo) : undefined;
  if (q?.tipo === 'casilla') return c.valor === 'no_acepto' ? 'No aceptó' : 'Aceptó';
  if (RANGO.has(c.operador)) return `${c.valor} y ${c.valorB}`;
  if (c.valores.length > 0) return c.valores.join(' o ');
  return c.valor;
}

// Una condición → segmentos "el [campo] [operador] [valor]".
function condicionSegs(c: Condicion): Seg[] {
  const out: Seg[] = [];
  const q = c.fuente === 'response' ? preguntaById(c.campo) : undefined;

  out.push(s(c.fuente === 'variable' ? 'la variable ' : 'la respuesta a '));
  out.push(r(campoLabel(c)));

  // Casilla: vocabulario propio, sin "es igual a X"
  if (q?.tipo === 'casilla') {
    out.push(s(c.operador === 'No es igual a' ? ' no ' : ' '));
    out.push(r(valorLabel(c)));
    return out;
  }
  out.push(s(` ${c.operador.toLowerCase()}`));
  if (!SIN_VALOR.has(c.operador)) {
    out.push(s(' '));
    out.push(r(valorLabel(c)));
  }
  return out;
}

function grupoSegs(g: GrupoCondicion): Seg[] {
  const out: Seg[] = [];
  g.condiciones.forEach((c, i) => {
    if (i > 0) out.push(s(` ${(g.conectoresHijas[i - 1] ?? 'O') === 'Y' ? 'y' : 'o'} `));
    out.push(...condicionSegs(c));
  });
  return out;
}

export function condicionResumen(regla: Regla): Seg[] {
  const out: Seg[] = [];
  regla.grupos.forEach((g, i) => {
    if (i > 0) out.push(s(' y '));
    const necesitaParen = g.condiciones.length > 1 && regla.grupos.length > 1;
    if (necesitaParen) out.push(s('('));
    out.push(...grupoSegs(g));
    if (necesitaParen) out.push(s(')'));
  });
  return out;
}

export function consecuenciaResumen(regla: Regla): Seg[] {
  const cs = regla.consecuencia;
  const destinoNombre = (): string => {
    if (!cs.destino) return '…';
    if (cs.tipo === 'terminar') return despedidaById(cs.destino)?.nombre ?? cs.destino;
    // destino de página: "pag_2" → nombre de la página
    if (cs.destino.startsWith('pag_')) {
      const n = Number(cs.destino.slice(4));
      return paginaByN(n)?.nombre ?? `Página ${n}`;
    }
    const q = preguntaById(cs.destino);
    return q ? q.pnum : cs.destino;
  };
  switch (cs.tipo) {
    case 'mostrar':
      return [s('mostrar '), r(destinoNombre())];
    case 'ir_a':
      return [s('saltar a '), r(destinoNombre())];
    case 'obligatoria':
      return [s('hacer obligatoria '), r(destinoNombre())];
    case 'terminar':
      return [s('terminar en '), r(destinoNombre())];
  }
}
