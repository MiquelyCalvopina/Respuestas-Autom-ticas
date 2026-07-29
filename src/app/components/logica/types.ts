// Modelo de datos del módulo Lógica.

export type Fuente = 'response' | 'variable';

export type Conector = 'Y' | 'O';

export interface Condicion {
  id: string;
  fuente: Fuente;
  /** id de pregunta (q1…) o key de variable (canal…) */
  campo: string;
  /** Matriz: atributo/fila seleccionada */
  filaMatriz?: string;
  /** Matriz: 'nota' | 'grupo' */
  modoMatriz?: 'nota' | 'grupo';
  /** sub-selector según tipo (campo de formulario, opcion/comentario, más/menos, etc.) */
  subTipo?: string;
  operador: string;
  /** valor único */
  valor: string;
  /** segundo valor para operadores de rango ("Está entre") */
  valorB: string;
  /** valores múltiples (igualdad OR, tags de lista/dominios) */
  valores: string[];
}

/** Un grupo = una condición padre + sus sub-condiciones (OR entre ellas).
 *  Entre grupos el conector es siempre Y (AND). */
export interface GrupoCondicion {
  id: string;
  /** conector del grupo respecto al anterior — siempre 'Y' salvo el primero */
  conector: Conector;
  /** [0] es el padre; el resto son sub-condiciones (hijas) con su propio conector O */
  condiciones: Condicion[];
  /** conector de cada hija respecto a la cadena (por defecto O) — índice alineado a condiciones[1..] */
  conectoresHijas: Conector[];
}

export type ConsecuenciaTipo = 'mostrar' | 'ir_a' | 'obligatoria' | 'terminar';

export interface Consecuencia {
  tipo: ConsecuenciaTipo;
  /** para 'mostrar': si el destino es una pregunta o una página */
  destinoClase?: 'pregunta' | 'pagina';
  /** id de pregunta / página / despedida destino */
  destino?: string;
}

/** momento: 'inicio' (Bienvenida, reglas por variable) o un id de pregunta */
export type Momento = 'inicio' | string;

export interface Regla {
  id: string;
  /** código visible para soporte, ej. "L-0007". Se asigna al crear la regla. */
  codigo: string;
  momento: Momento;
  grupos: GrupoCondicion[];
  consecuencia: Consecuencia;
}

/** Selección actual en el canvas. */
export type Seleccion =
  | { tipo: 'none' }
  | { tipo: 'bienvenida' }
  | { tipo: 'pregunta'; preguntaId: string };

export type SidebarModo = 'lista' | 'formulario' | 'ejemplos';

/** Destino por defecto personalizado por momento ("En cualquier otro caso ir a"). */
export type DestinosPorMomento = Record<string, string | undefined>;
