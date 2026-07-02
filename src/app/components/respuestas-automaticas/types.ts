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
  variable: string;  // p1-p11 | variable key
  subType: string;   // nota/grupo/text/number/email/date/url/mas/menos
  operator: string;
  value: string;
  valueB: string;    // second value for range operators
}
export interface ConditionGroup {
  id: string;
  connector: 'Y' | 'O';
  rows: ConditionRule[];
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
