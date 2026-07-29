import { Condicion, GrupoCondicion } from './types';

let counter = 0;
export const uid = (p = 'id') => `${p}-${(counter++).toString(36)}-${Date.now().toString(36)}`;

// Código visible de la regla para soporte (ej. "L-0007"). Correlativo de la
// sesión: se asigna al crear la regla y no se reutiliza al eliminar.
let reglaSeq = 0;
export const nuevoCodigoRegla = () => `L-${String(++reglaSeq).padStart(4, '0')}`;

export function emptyCondicion(fuente: 'response' | 'variable' = 'response'): Condicion {
  return { id: uid('c'), fuente, campo: '', filaMatriz: undefined, modoMatriz: undefined, subTipo: undefined, operador: '', valor: '', valorB: '', valores: [], valorDetalle: undefined };
}

export function emptyGrupo(): GrupoCondicion {
  return { id: uid('g'), conector: 'Y', condiciones: [emptyCondicion()], conectoresHijas: [] };
}
