export type Trigger = 'response' | 'farewell';
export type ComponentType = 'header' | 'title' | 'text' | 'ai' | 'responses' | 'divider' | 'footer' | 'image' | 'button' | 'spacer' | 'social';
export type TextAlign = 'left' | 'center' | 'right';
export type Tone = 'empatico' | 'formal' | 'calido' | 'directo' | 'custom';
export type AiLanguage = 'es' | 'en' | 'pt' | 'fr';
export type RuleStatus = 'draft' | 'active' | 'inactive';

export interface ComponentDesign {
  paddingTop: number;
  paddingBottom: number;
  paddingLeft?: number;
  paddingRight?: number;
  textAlign: TextAlign;
  bgColor: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dotted' | 'none';
  hideMobile?: boolean;
}

export interface HeaderBlock {
  id: string; type: 'header';
  name: string; bgColor: string;
  design: ComponentDesign;
}
export interface TitleBlock {
  id: string; type: 'title';
  text: string;
  design: ComponentDesign;
}
export interface TextBlock {
  id: string; type: 'text';
  content: string;
  design: ComponentDesign;
}
export interface AiBlock {
  id: string; type: 'ai';
  objetivo: string;
  tone: Tone;
  customTone: string;
  restricciones: string[];
  idioma: AiLanguage;
  generatedText: string;
  textBgColor: string;
  textColor: string;
  fontSize: number;
  lineHeight: number;
  fontStyle: 'italic' | 'normal';
  fontWeight: '400' | '600' | '700';
  cardBorderColor: string;
  cardBorderWidth: number;
  cardBorderStyle: 'solid' | 'dotted' | 'none';
  cardBorderRadius: number;
  design: ComponentDesign;
}
export interface ResponseQuestion {
  questionId: string;
  included: boolean;
}
export interface ResponsesBlock {
  id: string; type: 'responses';
  questions: ResponseQuestion[];
  displayStyle: 'bold-indented' | 'list' | 'table';
  showQuestion: boolean;
  rowGap: number;
  headerLabel: string;
  headerColor: string;
  headerSize: number;
  questionColor: string;
  questionBg: string;
  questionSize: number;
  questionWeight: '400' | '600' | '700';
  answerColor: string;
  answerBg: string;
  answerSize: number;
  answerWeight: '400' | '600' | '700';
  accentColor: string;
  accentWidth: number;
  separatorStyle: 'solid' | 'dotted' | 'none';
  separatorColor: string;
  design: ComponentDesign;
}
export interface DividerBlock {
  id: string; type: 'divider';
  design: ComponentDesign;
}
export interface FooterBlock {
  id: string; type: 'footer';
  text: string;
  design: ComponentDesign;
}
export interface ImageComponent {
  id: string; type: 'image';
  src: string; alt: string; dynamic: boolean; widthPercent: number;
  design: ComponentDesign;
}
export interface ButtonComponent {
  id: string; type: 'button';
  text: string; url: string; bgColor: string; textColor: string;
  design: ComponentDesign;
}
export interface SpacerComponent {
  id: string; type: 'spacer';
  height: number;
  design: ComponentDesign;
}
export type SocialNetworkKey = 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'x' | 'pinterest';
export interface SocialNetworkEntry {
  network: SocialNetworkKey;
  included: boolean;
  url: string;
}
export interface SocialComponent {
  id: string; type: 'social';
  style: 'negro' | 'blanco' | 'color';
  size: number;
  gap: number;
  shape: 'square' | 'rounded' | 'circle';
  networks: SocialNetworkEntry[];
  design: ComponentDesign;
}

export type Component =
  | HeaderBlock | TitleBlock | TextBlock | AiBlock | ResponsesBlock | DividerBlock | FooterBlock
  | ImageComponent | ButtonComponent | SpacerComponent | SocialComponent;

export interface Column {
  id: string;
  widthPercent: number; // las columnas de una fila suman ~100
  components: Component[];
}

export interface RowDesign {
  textAlign?: TextAlign;
  bgColor: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dotted' | 'none';
  paddingTop: number;
  paddingBottom: number;
  paddingLeft?: number;
  paddingRight?: number;
  hideMobile?: boolean;
}

export interface EmailLayoutConfig {
  widthPercent: number; // 10-100, "Ancho del contenido"
  boxed: boolean;       // "Estilo del contenedor": true = con margen, false = ancho completo
  bgColor: string;      // color detrás de la tarjeta del correo
}

export interface Row {
  id: string;
  columns: Column[];
  design: RowDesign;
}

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
export interface SubCondition {
  id: string;
  connector: 'Y' | 'O'; // conector respecto al ítem anterior de la cadena (grupo o subcondición previa)
  row: ConditionRule;
}
export interface ConditionGroup {
  id: string;
  connector: 'Y' | 'O';
  rows: ConditionRule[];
  subConditions?: SubCondition[];
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
  rows: Row[];
  layout: EmailLayoutConfig;
  blocksUpdatedAt: string | null;
  customHtml?: string | null;
}

export type ModuleView = 'list' | 'wizard' | 'editor' | 'log';
