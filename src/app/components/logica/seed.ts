import { Condicion, GrupoCondicion, Regla } from './types';

let counter = 0;
export const uid = (p = 'id') => `${p}-${(counter++).toString(36)}-${Date.now().toString(36)}`;

export function emptyCondicion(fuente: 'response' | 'variable' = 'response'): Condicion {
  return { id: uid('c'), fuente, campo: '', filaMatriz: undefined, modoMatriz: undefined, subTipo: undefined, operador: '', valor: '', valorB: '', valores: [] };
}

export function emptyGrupo(): GrupoCondicion {
  return { id: uid('g'), conector: 'Y', condiciones: [emptyCondicion()], conectoresHijas: [] };
}

function cond(partial: Partial<Condicion>): Condicion {
  return { ...emptyCondicion(partial.fuente), ...partial, id: uid('c') };
}
function grupo(condiciones: Condicion[]): GrupoCondicion {
  return { id: uid('g'), conector: 'Y', condiciones, conectoresHijas: condiciones.slice(1).map(() => 'O') };
}

// Reglas semilla — muestran los estados poblados del módulo sobre el estudio real.
export const SEED_REGLAS: Regla[] = [
  {
    id: uid('r'),
    momento: 'inicio',
    grupos: [grupo([cond({ fuente: 'variable', campo: 'canal', operador: 'Es igual a', valor: 'Telefónico' })])],
    consecuencia: { tipo: 'mostrar', destinoClase: 'pregunta', destino: 'q4' },
  },
  {
    id: uid('r'),
    momento: 'q1',
    grupos: [grupo([cond({ fuente: 'response', campo: 'q1', operador: 'Es menor o igual a', valor: '6' })])],
    consecuencia: { tipo: 'obligatoria', destino: 'q2' },
  },
  {
    id: uid('r'),
    momento: 'q1',
    grupos: [grupo([cond({ fuente: 'response', campo: 'q1', operador: 'Es mayor o igual a', valor: '9' })])],
    consecuencia: { tipo: 'terminar', destino: 'desp_promotor' },
  },
];
