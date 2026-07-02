export type Trigger = 'response' | 'farewell';
export type BlockType = 'header' | 'title' | 'text' | 'ai' | 'responses' | 'divider' | 'footer';
export type TextAlign = 'left' | 'center' | 'right';
export type Tone = 'empatico' | 'formal' | 'calido' | 'directo' | 'custom';
export type RuleStatus = 'draft' | 'active' | 'inactive';

export interface BlockDesign {
  paddingTop: number;
  paddingBottom: number;
  textAlign: TextAlign;
  bgColor: string;
}

export interface HeaderBlock {
  id: string; type: 'header';
  name: string; bgColor: string;
  design: BlockDesign;
}
export interface TitleBlock {
  id: string; type: 'title';
  text: string;
  design: BlockDesign;
}
export interface TextBlock {
  id: string; type: 'text';
  content: string;
  design: BlockDesign;
}
export interface AiBlock {
  id: string; type: 'ai';
  objetivo: string;
  tone: Tone;
  customTone: string;
  datoPriorizar: string;
  restricciones: string[];
  generatedText: string;
  design: BlockDesign;
}
export interface ResponseQuestion {
  questionId: string;
  included: boolean;
  showStatement: boolean;
  showOnlyAnswer: boolean;
}
export interface ResponsesBlock {
  id: string; type: 'responses';
  questions: ResponseQuestion[];
  displayStyle: 'bold-indented' | 'list' | 'table';
  design: BlockDesign;
}
export interface DividerBlock {
  id: string; type: 'divider';
  design: BlockDesign;
}
export interface FooterBlock {
  id: string; type: 'footer';
  text: string;
  design: BlockDesign;
}

export type Block = HeaderBlock | TitleBlock | TextBlock | AiBlock | ResponsesBlock | DividerBlock | FooterBlock;

export interface ConditionRule {
  id: string;
  subject: string;   // 'response' | 'variable'
  variable: string;  // real Pregunta id | variable key
  subType: string;   // nota/grupo/text/number/email/date/url/mas/menos/opcion/comentario/<campo nombre>
  attribute?: string; // matriz_escalas row/atributo, or the specific option text for a "Comentario" sub-row
  operator: string;
  value: string | string[];
  valueB: string | string[]; // second value for range operators
}
export interface ConditionGroup {
  id: string;
  connector: 'Y' | 'O';
  rows: ConditionRule[];
}

export type TipoPregunta =
  | 'NPS' | 'CES' | 'CLI' | 'CSAT' | 'matriz_escalas' | 'respuesta_abierta' | 'formulario'
  | 'opcion_simple' | 'dropdown' | 'si_no' | 'seleccion_imagenes_simple'
  | 'opcion_multiple' | 'seleccion_imagenes_multiple'
  | 'casilla_verificacion' | 'maxdiff' | 'ranking' | 'rating' | 'cargar_archivo';

export interface CampoFormulario {
  nombre: string;
  tipo: 'texto' | 'numero' | 'correo' | 'fecha' | 'url';
}

export interface OpcionConComentario {
  texto: string;
  tieneComentario: boolean;
}

export interface Pregunta {
  id: string;
  texto: string;
  tipo: TipoPregunta;
  escala?: [number, number];
  grupos?: string[];
  atributos?: string[];
  opciones?: string[] | OpcionConComentario[];
  comentarioCategorizable?: boolean;
  categorizable?: boolean;
  campos?: CampoFormulario[];
}

export interface Etiqueta {
  id: string;
  n1: string;
  n2: string;
  n3: string;
}

export interface AutoResponse {
  id: string;
  name: string;
  trigger: Trigger | null;
  active: boolean;
  published: boolean;
  condGroups: ConditionGroup[];
  sender: string;
  recipientVariable: string;
  replyTo: string;
  subject: string;
  blocks: Block[];
}

export type ModuleView = 'list' | 'wizard' | 'editor' | 'log';
