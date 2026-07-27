import { Condicion, GrupoCondicion } from './types';

let counter = 0;
export const uid = (p = 'id') => `${p}-${(counter++).toString(36)}-${Date.now().toString(36)}`;

export function emptyCondicion(fuente: 'response' | 'variable' = 'response'): Condicion {
  return { id: uid('c'), fuente, campo: '', filaMatriz: undefined, modoMatriz: undefined, subTipo: undefined, operador: '', valor: '', valorB: '', valores: [] };
}

export function emptyGrupo(): GrupoCondicion {
  return { id: uid('g'), conector: 'Y', condiciones: [emptyCondicion()], conectoresHijas: [] };
}
