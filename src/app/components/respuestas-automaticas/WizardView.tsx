import { useState, useEffect, useRef } from 'react';
import { Button, Input, Select, Segmented, Radio, DatePicker, InputNumber, Popconfirm, Modal, Tooltip } from 'antd';
import { BiChevronRight, BiChevronLeft, BiPlus, BiCheck, BiTrash, BiCheckCircle, BiGitBranch, BiMove, BiInfoCircle, BiAt, BiEditAlt, BiEnvelope, BiX } from 'react-icons/bi';
import dayjs from 'dayjs';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AutoResponse, ConditionGroup, ConditionRule, Pregunta, OpcionConComentario, SubCondition } from './types';
import { PREGUNTAS_EJEMPLO, ETIQUETAS_CATEGORIZACION, countComponents, describeRecipientSource, VARIABLES_META, isValidEmail, getEmailSuggestions } from './data';
import { cuid } from './cuid';

interface Props {
  rule: AutoResponse;
  onChange: (r: AutoResponse) => void;
  onSaveAndActivate: () => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onOpenEditor: () => void;
  step: number;
  onStepChange: (step: number) => void;
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepNode({ num, label, active, done, onClick }: { num: number; label: string; active?: boolean; done?: boolean; onClick: () => void }) {
  const circleBg     = active ? '#1890ff' : 'transparent';
  const circleBorder = (active || done) ? '#1890ff' : 'rgba(0,0,0,0.25)';
  const labelColor   = active ? '#1890ff' : done ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.45)';

  return (
    <button
      type="button"
      onClick={onClick}
      title={`Ir a ${label}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
        background: active ? 'rgba(24,144,255,0.08)' : 'transparent',
      }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
        background: circleBg,
        border: `1px solid ${circleBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {done
          ? <BiCheck style={{ fontSize: 12, color: '#1890ff' }} />
          : <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: active ? '#fff' : 'rgba(0,0,0,0.25)', lineHeight: 1 }}>{num}</span>
        }
      </div>
      <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: labelColor, whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </button>
  );
}

function StepChevron() {
  return (
    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" style={{ flexShrink: 0, margin: '0 4px' }}>
      <path d="M1 1L5 5L1 9" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NavigationSteps({ current, onStepClick }: { current: number; onStepClick: (step: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
      <StepNode num={1} label="Detalles"    active={current === 0} done={current > 0} onClick={() => onStepClick(0)} />
      <StepChevron />
      <StepNode num={2} label="Condiciones" active={current === 1} done={current > 1} onClick={() => onStepClick(1)} />
      <StepChevron />
      <StepNode num={3} label="Mensaje"     active={current === 2} onClick={() => onStepClick(2)} />
    </div>
  );
}

// ─── Trigger radio card ───────────────────────────────────────────────────────

function TriggerCard({ selected, onSelect, title, description }: {
  selected: boolean; onSelect: () => void; title: string; description: string;
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        background: selected ? 'rgba(24,144,255,0.04)' : '#fff',
        border: `1px solid ${selected ? '#40a9ff' : '#f0f0f0'}`,
        borderRadius: 8, padding: 16, cursor: 'pointer', width: '100%',
        display: 'flex', gap: 12, alignItems: 'flex-start',
        boxSizing: 'border-box',
      }}
    >
      {/* Radio circle */}
      <div style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 4, position: 'relative', border: `1px solid ${selected ? '#1890ff' : '#d9d9d9'}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1890ff' }} />}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: 'rgba(0,0,0,0.85)', margin: '0 0 8px 0', lineHeight: 'normal' }}>{title}</p>
        <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: 'rgba(0,0,0,0.45)', margin: 0, lineHeight: 'normal' }}>{description}</p>
      </div>
    </div>
  );
}

// ─── Step 1 — Detalles ────────────────────────────────────────────────────────

// Variables mapeadas del estudio (de tipo texto, no la de correo — esa va en "Variables de contacto").
const RECIPIENT_STUDY_TEXT_VARS = VARIABLES_META
  .filter(v => v.type === 'texto')
  .map(v => ({ value: v.key, label: v.key }));

// Preguntas/campos cuya entrada está validada como correo — nunca texto libre sin validar.
const RECIPIENT_EMAIL_QUESTIONS = PREGUNTAS_EJEMPLO.flatMap(q => {
  if (q.tipo === 'respuesta_abierta' && q.validacion === 'correo') {
    return [{ value: `pregunta:${q.id}`, label: q.texto }];
  }
  if (q.tipo === 'formulario') {
    return (q.campos ?? [])
      .filter(c => c.tipo === 'correo')
      .map(c => ({ value: `pregunta:${q.id}:campo:${c.nombre}`, label: `${q.texto} → ${c.nombre}` }));
  }
  return [];
});

function Step1({ rule, onChange }: { rule: AutoResponse; onChange: (r: AutoResponse) => void }) {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24, background: '#fff' }}>

      {/* Section title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500, fontSize: 20, color: 'rgba(0,0,0,0.45)', margin: 0, lineHeight: 'normal' }}>
          Configura los detalles de la regla
        </p>
        <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: 'rgba(0,0,0,0.45)', margin: 0, lineHeight: 'normal' }}>
          Define a quién va dirigido el correo y cuándo se dispara la regla. El nombre lo editas arriba, junto al título.
        </p>
      </div>

      {/* Variable destinatario */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.85)', margin: '0 0 12px 0' }}>
          ¿A qué correo llega el mensaje? <span style={{ color: '#ff4d4f' }}>*</span>
        </p>
        <Select
          value={rule.recipientVariable || 'correo_electronico'}
          onChange={v => onChange({ ...rule, recipientVariable: v })}
          style={{ width: '100%', borderRadius: 8, fontFamily: "'Roboto', sans-serif" }}
          options={[
            { label: 'Variables de contacto', options: [{ value: 'correo_electronico', label: 'correo_electronico' }] },
            ...(RECIPIENT_STUDY_TEXT_VARS.length ? [{ label: 'Variables del estudio', options: RECIPIENT_STUDY_TEXT_VARS }] : []),
            ...(RECIPIENT_EMAIL_QUESTIONS.length ? [{ label: 'Preguntas que obtienen un correo', options: RECIPIENT_EMAIL_QUESTIONS }] : []),
          ]}
        />
        <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: 'rgba(0,0,0,0.45)', margin: '8px 0 0 0', lineHeight: 'normal' }}>
          El sistema enviará el correo al valor de este dato para cada encuestado. El valor debe ser un correo válido; si eliges una variable del estudio, asegúrate de que contenga uno. Si está vacío o no es válido, ese envío se omite y queda registrado en el historial como <strong style={{ color: 'rgba(0,0,0,0.65)' }}>No enviado</strong>.
        </p>
      </div>

      {/* Disparador */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.85)', margin: '0 0 12px 0' }}>
          Disparador <span style={{ color: '#ff4d4f' }}>*</span>
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TriggerCard
            selected={rule.trigger === 'response'}
            onSelect={() => onChange({ ...rule, trigger: 'response' })}
            title="Por cada respuesta nueva"
            description="Se ejecuta cuando hay una nueva respuesta independientemente de si es completa o parcial."
          />
          <TriggerCard
            selected={rule.trigger === 'farewell'}
            onSelect={() => onChange({ ...rule, trigger: 'farewell' })}
            title="Cuando el encuestado llega a una despedida"
            description="Se ejecuta cuando un encuestado termina el estudio. Aplica a todas las despedidas o una específica."
          />
        </div>
      </div>

    </div>
  );
}

// ─── Condition builder helpers ────────────────────────────────────────────────

const emptyRow = (): ConditionRule => ({ id: cuid(), subject: 'response', variable: '', subType: '', attribute: '', operator: '', value: '', valueB: '' });

// ── Question option list — built from the real dataset ────────────────────────
const Q_RESPONSE = PREGUNTAS_EJEMPLO.map(q => ({ value: q.id, label: q.texto }));
const pById: Record<string, Pregunta> = Object.fromEntries(PREGUNTAS_EJEMPLO.map(p => [p.id, p]));
const getPregunta = (row: ConditionRule): Pregunta | undefined => row.subject !== 'variable' ? pById[row.variable] : undefined;

const Q_VARIABLE = [
  { value: 'nombre_completo',    label: 'Nombre completo' },
  { value: 'nombre_preferencia', label: 'Nombre de preferencia' },
  { value: 'correo_electronico', label: 'Correo electrónico' },
  { value: 'telefono',           label: 'Teléfono' },
  { value: 'identificador',      label: 'Identificador' },
  { value: 'fecha_respuesta',    label: 'Fecha de respuesta' },
  { value: 'edad',               label: 'Edad' },
  // Variables especiales del estudio
  { value: 'canal_respuesta',    label: 'Canal de respuesta' },
  { value: 'dispositivo',        label: 'Dispositivo' },
  { value: 'plataforma',         label: 'Plataforma' },
  { value: 'alerta_enviada',     label: 'Alerta enviada' },
];

// ── Variable type map ─────────────────────────────────────────────────────────
const VAR_TYPE: Record<string, string> = {
  nombre_completo: 'text', nombre_preferencia: 'text', identificador: 'text',
  correo_electronico: 'email', telefono: 'number', edad: 'number', fecha_respuesta: 'date',
  // Especiales: lista cerrada (=/≠ contra valores fijos) y Sí/No
  canal_respuesta: 'closedlist', dispositivo: 'closedlist', plataforma: 'closedlist',
  alerta_enviada: 'boolyn',
};

// ── Tipos de pregunta con selección única / múltiple (spec los agrupa así) ────
const SINGLE_CHOICE = new Set(['opcion_simple', 'dropdown', 'si_no', 'seleccion_imagenes_simple']);
const MULTI_CHOICE  = new Set(['opcion_multiple', 'seleccion_imagenes_multiple']);
const NOTA_GRUPO_TIPOS = new Set(['NPS', 'CES', 'CLI', 'CSAT']);
const SCALE_TIPOS = new Set(['NPS', 'CES', 'CLI', 'CSAT', 'rating', 'matriz_escalas']);

// ── Helpers para opciones mixtas (string[] | OpcionConComentario[]) ───────────
const optionTexts = (q: Pregunta): string[] => (q.opciones ?? []).map(o => typeof o === 'string' ? o : o.texto);
const commentableOptions = (q: Pregunta): string[] =>
  (q.opciones ?? []).filter((o): o is OpcionConComentario => typeof o !== 'string' && o.tieneComentario).map(o => o.texto);
const scaleOptions = (q: Pregunta): { value: string; label: string }[] => {
  if (q.escala) {
    const [min, max] = q.escala;
    return Array.from({ length: max - min + 1 }, (_, i) => { const n = min + i; return { value: String(n), label: String(n) }; });
  }
  return optionTexts(q).map(o => ({ value: o, label: o }));
};
const firstOf = (v: string | string[]): string => Array.isArray(v) ? (v[0] ?? '') : v;

// ── Etiquetas de categorización (Habla de / No habla de) ──────────────────────
const ETIQUETA_OPTIONS = ETIQUETAS_CATEGORIZACION.map(e => ({ value: e.id, label: `${e.n1} > ${e.n2} > ${e.n3}` }));

// ── Operator sets ─────────────────────────────────────────────────────────────
const ops = {
  // Variables — exponen ambos operadores de presencia: 'Está vacía' + 'No está vacía'
  varText:   ['Contiene','No contiene','Es igual a','No es igual a','Tiene longitud igual a','Tiene longitud mayor a','Tiene longitud menor a','Tiene longitud entre','No cumple el patrón','Está en la lista','No está en la lista','Está vacía','No está vacía'],
  varNumber: ['Es igual a','No es igual a','Es mayor que','Es mayor o igual a','Es menor que','Es menor o igual a','Está entre','Está vacía','No está vacía'],
  varDate:   ['Es igual a','No es igual a','Es después de','Es antes de','Está entre','Está vacía','No está vacía'],
  varEmail:  ['Contiene','No contiene','Pertenece a los dominios','No pertenece a los dominios','Es igual a','No es igual a','Está vacía','No está vacía'],
  // Variables especiales
  closedList: ['Es igual a','No es igual a','Está vacía','No está vacía'],   // canal, dispositivo, plataforma (lista cerrada)
  boolYesNo:  ['Es igual a'],                                                 // alerta enviada (Sí / No)
  // Formulario — la presencia ('No está vacío') vive a nivel de pregunta, no por campo
  formText:   ['Contiene','No contiene','Es igual a','No es igual a'],
  formNumber: ['Es igual a','No es igual a','Es mayor que','Es mayor o igual a','Es menor que','Es menor o igual a','Está entre'],
  formEmail:  ['Contiene','No contiene','Es igual a','No es igual a'],
  formDate:   ['Es igual a','No es igual a','Es después de','Es antes de','Está entre'],
  formUrl:    ['Contiene','No contiene','Es igual a','No es igual a'],
  // Preguntas — presencia positiva uniforme: 'No está vacío' (lectura estándar para todos los tipos)
  scaleNum: ['Es igual a','No es igual a','Es mayor que','Es mayor o igual a','Es menor que','Es menor o igual a','Está entre','No está vacío'],
  scaleTxt: ['Es igual a','No es igual a','Es mayor que','Es mayor o igual a','Es menor que','Es menor o igual a','No está vacío'],
  group:    ['Es igual a','No es igual a','No está vacío'],
  open:     ['Contiene','No contiene','Es igual a','No es igual a','Habla de','No habla de','No está vacío'],
  simpleOpt:     ['Es igual a','No es igual a','No está vacío'],
  simpleComment: ['Contiene','No contiene','Es igual a','No es igual a','Habla de','No habla de','No está vacío'],
  multiOpt:      ['Contiene','No contiene','Es igual a','No es igual a','No está vacío'],
  multiComment:  ['Contiene','No contiene','Es igual a','No es igual a','Habla de','No habla de','No está vacío'],
  check:    ['Es igual a','No es igual a'],
  maxdiff:  ['Es igual a','No es igual a','No está vacío'],
  ranking:  ['Es igual a','No es igual a','No está vacío'],
  upload:   ['No está vacío'],
};

function getOperators(row: ConditionRule): string[] {
  if (row.subject === 'variable') {
    const t = VAR_TYPE[row.variable] || 'text';
    return ({
      text: ops.varText, number: ops.varNumber, date: ops.varDate, email: ops.varEmail,
      closedlist: ops.closedList, boolyn: ops.boolYesNo,
    } as Record<string, string[]>)[t] ?? ops.varText;
  }
  const q = pById[row.variable];
  if (!q) return [];
  const scaleSet = () => q.escala ? ops.scaleNum : ops.scaleTxt;
  const gate = (list: string[], enabled: boolean | undefined) => enabled ? list : list.filter(o => o !== 'Habla de' && o !== 'No habla de');

  if (NOTA_GRUPO_TIPOS.has(q.tipo)) {
    if (row.subType === 'nota') return scaleSet();
    if (row.subType === 'grupo') return ops.group;
    return [];
  }
  if (q.tipo === 'rating') return scaleSet();
  if (q.tipo === 'matriz_escalas') {
    if (!row.attribute) return [];
    if (row.subType === 'nota') return scaleSet();
    if (row.subType === 'grupo') return ops.group;
    return [];
  }
  if (q.tipo === 'respuesta_abierta') return gate(ops.open, q.categorizable);
  if (q.tipo === 'formulario') {
    // 'No está vacío' aplica a nivel de la pregunta completa, sin requerir elegir un campo
    const campo = q.campos?.find(c => c.nombre === row.subType);
    const fieldOps = campo
      ? (({ texto: ops.formText, numero: ops.formNumber, correo: ops.formEmail, fecha: ops.formDate, url: ops.formUrl } as Record<string, string[]>)[campo.tipo] ?? [])
      : [];
    return ['No está vacío', ...fieldOps];
  }
  if (q.tipo === 'casilla_verificacion') return ops.check;
  if (q.tipo === 'maxdiff') return row.subType ? ops.maxdiff : ['No está vacío'];
  if (q.tipo === 'ranking') return ops.ranking;
  if (q.tipo === 'cargar_archivo') return ops.upload;
  if (SINGLE_CHOICE.has(q.tipo) || MULTI_CHOICE.has(q.tipo)) {
    const commentable = commentableOptions(q);
    const optSet = SINGLE_CHOICE.has(q.tipo) ? ops.simpleOpt : ops.multiOpt;
    const commentSet = SINGLE_CHOICE.has(q.tipo) ? ops.simpleComment : ops.multiComment;
    if (commentable.length === 0) return optSet;
    if (row.subType === 'opcion') return optSet;
    if (row.subType === 'comentario') return row.attribute ? gate(commentSet, q.comentarioCategorizable) : [];
    return ['No está vacío'];   // presencia disponible sin pasar por el sub-selector Opción/Comentario
  }
  return [];
}

const NO_VALUE_OPS = new Set(['Está vacía','No está vacía','No está vacío']);
const RANGE_OPS    = new Set(['Está entre','Tiene longitud entre']);
const LIST_OPS     = new Set(['Está en la lista','No está en la lista','Pertenece a los dominios','No pertenece a los dominios']);
const LENGTH_OPS   = new Set(['Tiene longitud igual a','Tiene longitud mayor a','Tiene longitud menor a','Tiene longitud entre']);
const PATTERN_OP   = 'No cumple el patrón';
const CLOSED_LIST_VARS: Record<string, string[]> = {
  canal_respuesta: ['Correo', 'WhatsApp', 'Enlace personalizado', 'Enlace genérico', 'QR'],
  dispositivo:     ['Escritorio', 'Móvil', 'Tablet'],
  plataforma:      ['Web', 'iOS', 'Android'],
};

function rangeValid(r: ConditionRule, q: Pregunta | undefined): boolean {
  const a = firstOf(r.value), b = firstOf(r.valueB);
  const campo = q?.tipo === 'formulario' ? q.campos?.find(c => c.nombre === r.subType) : undefined;
  const isDateCtx = (r.subject === 'variable' && VAR_TYPE[r.variable] === 'date') || campo?.tipo === 'fecha';
  if (isDateCtx) return !dayjs(a).isAfter(dayjs(b));
  const na = Number(a), nb = Number(b);
  if (Number.isNaN(na) || Number.isNaN(nb)) return true;
  return na <= nb;
}

function isRowComplete(r: ConditionRule): boolean {
  if (!r.variable || !r.operator) return false;
  if (NO_VALUE_OPS.has(r.operator)) return true;
  if (r.operator === PATTERN_OP) {
    const v = String(firstOf(r.value) ?? '').trim();
    if (v === '') return false;
    try { new RegExp(v); return true; } catch { return false; }
  }
  const nonEmpty = (v: string | string[]) => Array.isArray(v) ? v.length > 0 : String(v ?? '').trim() !== '';
  if (RANGE_OPS.has(r.operator)) {
    if (!nonEmpty(r.value) || !nonEmpty(r.valueB)) return false;
    return rangeValid(r, getPregunta(r));
  }
  return nonEmpty(r.value);
}

function allConditionsComplete(condGroups: ConditionGroup[]): boolean {
  return condGroups.every(g =>
    g.rows.every(isRowComplete) &&
    (g.subConditions ?? []).every(sc => isRowComplete(sc.row))
  );
}

// ─── Habla de / No habla de ────────────────────────────────────────────────────

function HablaDeSelect({ value, onChange, style }: { value: string; onChange: (v: string) => void; style?: React.CSSProperties }) {
  return (
    <Select
      showSearch optionFilterProp="label" placeholder="Busca una etiqueta..."
      value={value || undefined} onChange={onChange} options={ETIQUETA_OPTIONS}
      style={{ flex: 1, minWidth: 220, borderRadius: 8, ...style }}
    />
  );
}

// ─── Ranking — arrastrar y reordenar ───────────────────────────────────────────

const RANK_ITEM = 'rank-item';

function RankRow({ index, text, moveItem }: { index: number; text: string; moveItem: (from: number, to: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop({
    accept: RANK_ITEM,
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      const rect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (rect.bottom - rect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset?.y ?? 0) - rect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      moveItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: RANK_ITEM,
    item: () => ({ index }),
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  });
  drag(drop(ref));

  return (
    <div ref={ref} style={{
      opacity: isDragging ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: 12,
      border: '1px solid #f0f0f0', borderRadius: 8, padding: '12px 16px', background: '#fff', cursor: 'grab',
    }}>
      <BiMove style={{ color: 'rgba(0,0,0,0.25)' }} />
      <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: 'rgba(0,0,0,0.45)', minWidth: 16 }}>{index + 1}</span>
      <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 13, color: 'rgba(0,0,0,0.85)' }}>{text}</span>
    </div>
  );
}

function RankingOrderBuilder({ options, value, onChange }: { options: string[]; value: string[]; onChange: (ordered: string[]) => void }) {
  const order = value && value.length === options.length ? value : options;

  useEffect(() => {
    if (!value || value.length !== options.length) onChange(options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.join('|')]);

  function moveItem(from: number, to: number) {
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      {order.map((text, i) => (
        <RankRow key={text} index={i} text={text} moveItem={moveItem} />
      ))}
    </div>
  );
}

// ─── Single condition row ─────────────────────────────────────────────────────

// ── Value-input dispatch: the right AntD component per tipo × operator ────────

function renderValueInput(
  row: ConditionRule, onUpdate: (p: Partial<ConditionRule>) => void, q: Pregunta | undefined,
  selStyle: React.CSSProperties, inputStyle: React.CSSProperties, rangeError: boolean,
): React.ReactNode {
  const op = row.operator;
  const campo = q?.tipo === 'formulario' ? q.campos?.find(c => c.nombre === row.subType) : undefined;
  const isNumber = (row.subject === 'variable' && VAR_TYPE[row.variable] === 'number') || campo?.tipo === 'numero';
  const isDate   = (row.subject === 'variable' && VAR_TYPE[row.variable] === 'date') || campo?.tipo === 'fecha';

  if (q?.tipo === 'casilla_verificacion') {
    return (
      <Radio.Group value={firstOf(row.value) || undefined} onChange={e => onUpdate({ value: e.target.value })}>
        <Radio value="acepto">Aceptó</Radio>
        <Radio value="no_acepto">No aceptó</Radio>
      </Radio.Group>
    );
  }

  if (q?.tipo === 'ranking') {
    return (
      <RankingOrderBuilder
        options={optionTexts(q)}
        value={Array.isArray(row.value) ? row.value : []}
        onChange={ordered => onUpdate({ value: ordered })}
      />
    );
  }

  if (op === 'Habla de' || op === 'No habla de') {
    return <HablaDeSelect value={firstOf(row.value)} onChange={v => onUpdate({ value: v })} />;
  }

  if (LIST_OPS.has(op)) {
    return (
      <Select
        mode="tags" tokenSeparators={[',', ';']}
        value={Array.isArray(row.value) ? row.value : []}
        onChange={v => onUpdate({ value: (v as string[]).slice(0, 50).map(x => x.slice(0, 255)) })}
        placeholder="Escribe y presiona Enter, o separa con comas/punto y coma..."
        maxTagCount="responsive"
        style={{ ...inputStyle, minWidth: 220 }}
      />
    );
  }

  // Variables especiales de lista cerrada (canal, dispositivo, plataforma): =/≠ contra valores fijos
  if (row.subject === 'variable' && VAR_TYPE[row.variable] === 'closedlist') {
    const vals = CLOSED_LIST_VARS[row.variable] ?? [];
    return (
      <Select value={firstOf(row.value) || undefined} onChange={v => onUpdate({ value: v })}
        placeholder="Selecciona..." style={{ ...selStyle, flex: 1 }} options={vals.map(o => ({ value: o, label: o }))} />
    );
  }
  // Alerta enviada: Sí / No
  if (row.subject === 'variable' && VAR_TYPE[row.variable] === 'boolyn') {
    return (
      <Select value={firstOf(row.value) || undefined} onChange={v => onUpdate({ value: v })}
        placeholder="Selecciona..." style={selStyle} options={[{ value: 'Sí', label: 'Sí' }, { value: 'No', label: 'No' }]} />
    );
  }
  // Longitud (variable Texto): number input entero 0–10000; "entre" son dos
  if (LENGTH_OPS.has(op)) {
    const numProps = { min: 0, max: 10000, precision: 0 as const, style: { width: 140 } };
    if (RANGE_OPS.has(op)) {
      return (
        <>
          <InputNumber {...numProps} value={firstOf(row.value) === '' ? undefined : Number(firstOf(row.value))}
            onChange={v => onUpdate({ value: v == null ? '' : String(v) })} placeholder="Desde" status={rangeError ? 'error' : undefined} />
          <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>y</span>
          <InputNumber {...numProps} value={firstOf(row.valueB) === '' ? undefined : Number(firstOf(row.valueB))}
            onChange={v => onUpdate({ valueB: v == null ? '' : String(v) })} placeholder="Hasta" status={rangeError ? 'error' : undefined} />
        </>
      );
    }
    return (
      <InputNumber {...numProps} value={firstOf(row.value) === '' ? undefined : Number(firstOf(row.value))}
        onChange={v => onUpdate({ value: v == null ? '' : String(v) })} placeholder="0" />
    );
  }
  // No cumple el patrón (variable Texto): regex con validación de sintaxis
  if (op === PATTERN_OP) {
    const v = firstOf(row.value);
    let invalid = false;
    if (v) { try { new RegExp(v); } catch { invalid = true; } }
    return (
      <div style={{ flex: 1, minWidth: 200 }}>
        <Input value={v} maxLength={255} onChange={e => onUpdate({ value: e.target.value })}
          placeholder="Expresión regular…" status={invalid ? 'error' : undefined} style={inputStyle} />
        {invalid && <p style={{ color: '#ff4d4f', fontSize: 12, margin: '4px 0 0', fontFamily: "'Roboto', sans-serif" }}>Expresión regular inválida.</p>}
      </div>
    );
  }

  if (q && SCALE_TIPOS.has(q.tipo) && (row.subType === 'nota' || q.tipo === 'rating')) {
    if (op === 'Es igual a' || op === 'No es igual a') {
      // =/≠ es selección múltiple (OR) e incluye "No aplica"
      return (
        <Select mode="multiple" value={Array.isArray(row.value) ? row.value : []}
          onChange={v => onUpdate({ value: v })} placeholder="Selecciona uno o más..."
          style={{ ...selStyle, flex: 1 }} options={[...scaleOptions(q), { value: 'No aplica', label: 'No aplica' }]} />
      );
    }
    if (RANGE_OPS.has(op)) {
      const opts = scaleOptions(q);
      return (
        <>
          <Select value={firstOf(row.value) || undefined} onChange={v => onUpdate({ value: v })}
            placeholder="Desde" style={selStyle} options={opts} status={rangeError ? 'error' : undefined} />
          <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>y</span>
          <Select value={firstOf(row.valueB) || undefined} onChange={v => onUpdate({ valueB: v })}
            placeholder="Hasta" style={selStyle} options={opts} status={rangeError ? 'error' : undefined} />
        </>
      );
    }
    return (
      <Select value={firstOf(row.value) || undefined} onChange={v => onUpdate({ value: v })}
        placeholder="Selecciona..." style={selStyle} options={scaleOptions(q)} />
    );
  }

  if (q && row.subType === 'grupo') {
    return (
      <Select mode="multiple" value={Array.isArray(row.value) ? row.value : []}
        onChange={v => onUpdate({ value: v })} placeholder="Selecciona uno o más..."
        style={{ ...selStyle, flex: 1 }} options={[...(q.grupos ?? []), 'No aplica'].map(g => ({ value: g, label: g }))} />
    );
  }

  if (q && SINGLE_CHOICE.has(q.tipo) && row.subType !== 'comentario') {
    const opts = [...optionTexts(q), 'Otro', 'Ninguna de las anteriores'].map(o => ({ value: o, label: o }));
    return (
      <Select value={firstOf(row.value) || undefined} onChange={v => onUpdate({ value: v })}
        placeholder="Selecciona..." style={{ ...selStyle, flex: 1 }} options={opts} />
    );
  }
  if (q && MULTI_CHOICE.has(q.tipo) && row.subType !== 'comentario') {
    const opts = [...optionTexts(q), 'Otro', 'Ninguna de las anteriores', 'Seleccionar todas'].map(o => ({ value: o, label: o }));
    return (
      <Select mode="multiple" value={Array.isArray(row.value) ? row.value : []} onChange={v => onUpdate({ value: v })}
        placeholder="Selecciona uno o más..." style={{ ...selStyle, flex: 1 }} options={opts} />
    );
  }

  if (q?.tipo === 'maxdiff') {
    const opts = optionTexts(q).map(o => ({ value: o, label: o }));
    return (
      <Select value={firstOf(row.value) || undefined} onChange={v => onUpdate({ value: v })}
        placeholder="Selecciona..." style={{ ...selStyle, flex: 1 }} options={opts} />
    );
  }

  if (isNumber) {
    if (RANGE_OPS.has(op)) {
      return (
        <>
          <InputNumber value={firstOf(row.value) === '' ? undefined : Number(firstOf(row.value))}
            onChange={v => onUpdate({ value: v == null ? '' : String(v) })}
            placeholder="Desde" style={{ width: 140 }} status={rangeError ? 'error' : undefined} />
          <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>y</span>
          <InputNumber value={firstOf(row.valueB) === '' ? undefined : Number(firstOf(row.valueB))}
            onChange={v => onUpdate({ valueB: v == null ? '' : String(v) })}
            placeholder="Hasta" style={{ width: 140 }} status={rangeError ? 'error' : undefined} />
        </>
      );
    }
    return (
      <InputNumber value={firstOf(row.value) === '' ? undefined : Number(firstOf(row.value))}
        onChange={v => onUpdate({ value: v == null ? '' : String(v) })} placeholder="0" style={{ width: 140 }} />
    );
  }

  if (isDate) {
    if (RANGE_OPS.has(op)) {
      const a = firstOf(row.value), b = firstOf(row.valueB);
      return (
        <DatePicker.RangePicker
          value={[a ? dayjs(a) : null, b ? dayjs(b) : null]}
          onChange={vals => onUpdate({ value: vals?.[0] ? vals[0].toISOString() : '', valueB: vals?.[1] ? vals[1].toISOString() : '' })}
          status={rangeError ? 'error' : undefined}
        />
      );
    }
    const a = firstOf(row.value);
    return (
      <DatePicker value={a ? dayjs(a) : null}
        onChange={v => onUpdate({ value: v ? v.toISOString() : '' })} format="DD-MM-YYYY" />
    );
  }

  return (
    <Input value={firstOf(row.value)} maxLength={255} onChange={e => onUpdate({ value: e.target.value })}
      placeholder="Escribe un valor..." style={inputStyle} />
  );
}

// ─── Confirmación de eliminar (condición / subcondición) ──────────────────────

function DeleteConfirm({ what, onConfirm, children }: { what: string; onConfirm: () => void; children: React.ReactNode }) {
  return (
    <Popconfirm
      title={`¿Está seguro de eliminar ${what}?`}
      okText="Sí, seguro"
      cancelText="Cancelar"
      onConfirm={onConfirm}
      okButtonProps={{ size: 'middle' }}
      cancelButtonProps={{ size: 'middle' }}
      overlayStyle={{ maxWidth: 320 }}
      icon={
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: '#fff1f0', flexShrink: 0 }}>
          <BiTrash style={{ color: '#ff4d4f', fontSize: 12 }} />
        </span>
      }
    >
      {children}
    </Popconfirm>
  );
}

function CondRowUI({ row, onUpdate, onDelete, canDelete }: {
  row: ConditionRule; onUpdate: (p: Partial<ConditionRule>) => void;
  onDelete: () => void; canDelete: boolean;
}) {
  const subject   = row.subject || 'response';
  const q         = getPregunta(row);
  const operators = getOperators(row).map(o => ({ value: o, label: o }));
  const complete  = isRowComplete(row);
  const rangeError = RANGE_OPS.has(row.operator)
    && (Array.isArray(row.value) ? row.value.length > 0 : row.value.trim() !== '')
    && (Array.isArray(row.valueB) ? row.valueB.length > 0 : row.valueB.trim() !== '')
    && !rangeValid(row, q);

  const commentable = q && (SINGLE_CHOICE.has(q.tipo) || MULTI_CHOICE.has(q.tipo)) ? commentableOptions(q) : [];

  const inputStyle: React.CSSProperties = { flex: 1, minWidth: 140, borderRadius: 8 };
  const selStyle:   React.CSSProperties = { minWidth: 160, borderRadius: 8 };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: '#bae7ff', borderRadius: '2px 0 0 2px' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', flex: 1, minWidth: 0 }}>

        {/* Subject */}
        <Select
          value={subject}
          onChange={v => onUpdate({ subject: v, variable: '', subType: '', attribute: '', operator: '', value: '', valueB: '' })}
          style={{ width: 200, borderRadius: 8 }}
          options={[{ value: 'response', label: 'La respuesta a' }, { value: 'variable', label: 'La variable' }]}
        />

        {/* Question / variable select */}
        <Select
          value={row.variable || undefined}
          onChange={v => onUpdate({ variable: v, subType: '', attribute: '', operator: '', value: '', valueB: '' })}
          placeholder={subject === 'variable' ? 'Selecciona una variable...' : 'Selecciona una pregunta...'}
          style={{ ...selStyle, flex: 1 }}
          options={subject === 'variable' ? Q_VARIABLE : Q_RESPONSE}
        />

        {/* Matriz de escalas — selector de atributo/fila */}
        {q?.tipo === 'matriz_escalas' && (
          <Select
            value={row.attribute || undefined}
            onChange={v => onUpdate({ attribute: v, subType: '', operator: '', value: '', valueB: '' })}
            placeholder="Selecciona un atributo..." style={selStyle}
            options={(q.atributos ?? []).map(a => ({ value: a, label: a }))}
          />
        )}

        {/* NPS/CES/CLI/CSAT/Matriz — selector Nota/Grupo */}
        {q && (NOTA_GRUPO_TIPOS.has(q.tipo) || (q.tipo === 'matriz_escalas' && row.attribute)) && (
          <Select
            value={row.subType || undefined}
            onChange={v => onUpdate({ subType: v, operator: '', value: '', valueB: '' })}
            placeholder="Evalúa..." style={selStyle}
            options={[{ value: 'nota', label: 'Nota' }, { value: 'grupo', label: 'Grupo' }]}
          />
        )}

        {/* Opción simple/múltiple — selector Opción/Comentario (solo si hay opciones con comentario) */}
        {q && (SINGLE_CHOICE.has(q.tipo) || MULTI_CHOICE.has(q.tipo)) && commentable.length > 0 && (
          <>
            <Select
              value={row.subType || undefined}
              onChange={v => onUpdate({ subType: v, attribute: '', operator: '', value: '', valueB: '' })}
              placeholder="Evalúa..." style={selStyle}
              options={[{ value: 'opcion', label: 'Opción' }, { value: 'comentario', label: 'Comentario' }]}
            />
            {row.subType === 'comentario' && (
              <Select
                value={row.attribute || undefined}
                onChange={v => onUpdate({ attribute: v, operator: '', value: '', valueB: '' })}
                placeholder="¿De qué opción?" style={selStyle}
                options={commentable.map(o => ({ value: o, label: o }))}
              />
            )}
          </>
        )}

        {/* Formulario — selector de campo real */}
        {q?.tipo === 'formulario' && (
          <Select
            value={row.subType || undefined}
            onChange={v => onUpdate({ subType: v, operator: '', value: '', valueB: '' })}
            placeholder="Selecciona un campo..." style={selStyle}
            options={(q.campos ?? []).map(c => ({ value: c.nombre, label: `${c.nombre} (${c.tipo})` }))}
          />
        )}

        {/* MaxDiff — selector Más/Menos importante */}
        {q?.tipo === 'maxdiff' && (
          <Select
            value={row.subType || undefined}
            onChange={v => onUpdate({ subType: v, operator: '', value: '', valueB: '' })}
            placeholder="Evalúa..." style={selStyle}
            options={[{ value: 'mas', label: 'Más importante' }, { value: 'menos', label: 'Menos importante' }]}
          />
        )}

        {/* Operator — getOperators() ya solo devuelve algo cuando hay suficiente contexto */}
        {row.variable && operators.length > 0 && (
          <Select
            value={row.operator || undefined}
            onChange={v => onUpdate({ operator: v, value: '', valueB: '' })}
            placeholder="Condición..."
            style={selStyle}
            options={operators}
          />
        )}

        {/* Value input(s) — shown when operator needs a value */}
        {row.operator && !NO_VALUE_OPS.has(row.operator) && renderValueInput(row, onUpdate, q, selStyle, inputStyle, rangeError)}

        </div>

        {/* Delete */}
        {canDelete && (
          <DeleteConfirm what="esta condición" onConfirm={onDelete}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#ff4d4f', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <BiTrash style={{ fontSize: 14 }} />
            </button>
          </DeleteConfirm>
        )}
      </div>

      {/* Condición lista / rango inválido */}
      {complete && (
        <div style={{ paddingLeft: 16, paddingBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BiCheckCircle style={{ color: '#52c41a', fontSize: 12 }} />
          <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: '#52c41a' }}>Condición lista</span>
        </div>
      )}
      {rangeError && (
        <div style={{ paddingLeft: 16, paddingBottom: 16 }}>
          <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: '#ff4d4f' }}>
            El primer valor debe ser menor o igual al segundo.
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Sub-condition (agregada vía el botón Branch del grupo) ───────────────────

function SubConditionUI({ subCondition, onUpdateRow, onSetConnector, onDelete }: {
  subCondition: SubCondition;
  onUpdateRow: (p: Partial<ConditionRule>) => void;
  onSetConnector: (c: 'Y' | 'O') => void;
  onDelete: () => void;
}) {
  const row = subCondition.row;
  const subject = row.subject || 'response';
  const q = getPregunta(row);
  const operators = getOperators(row).map(o => ({ value: o, label: o }));
  const rangeError = RANGE_OPS.has(row.operator)
    && (Array.isArray(row.value) ? row.value.length > 0 : row.value.trim() !== '')
    && (Array.isArray(row.valueB) ? row.valueB.length > 0 : row.valueB.trim() !== '')
    && !rangeValid(row, q);
  const commentable = q && (SINGLE_CHOICE.has(q.tipo) || MULTI_CHOICE.has(q.tipo)) ? commentableOptions(q) : [];

  const inputStyle: React.CSSProperties = { flex: 1, minWidth: 140, borderRadius: 8 };
  const selStyle:   React.CSSProperties = { minWidth: 160, borderRadius: 8 };

  return (
    <div style={{ borderLeft: '2px solid #e6f7ff', padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
        <div style={{ background: 'rgba(0,0,0,0.04)', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center' }}>
          {(['Y', 'O'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => onSetConnector(opt)}
              style={{
                background: subCondition.connector === opt ? '#fff' : 'transparent',
                boxShadow: subCondition.connector === opt ? '0px 2px 8px 0px rgba(0,0,0,0.05)' : 'none',
                borderRadius: 100, border: 'none', cursor: 'pointer', padding: '4px 12px',
                color: subCondition.connector === opt ? '#1890ff' : 'rgba(0,0,0,0.45)',
                fontFamily: "'Roboto', sans-serif", fontSize: 14, lineHeight: 'normal',
                transition: 'all .15s',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
        <span style={{ flex: 1, fontFamily: "'Roboto', sans-serif", fontSize: 14, color: 'rgba(0,0,0,0.85)' }}>
          se cumple que...
        </span>
        <DeleteConfirm what="esta sub-condición" onConfirm={onDelete}>
          <button style={{ background: '#fff', border: '1px solid #d9d9d9', borderRadius: 100, cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 0 rgba(0,0,0,0.02)', flexShrink: 0 }}>
            <BiTrash style={{ fontSize: 12, color: '#ff4d4f' }} />
          </button>
        </DeleteConfirm>
      </div>

      {/* Subject */}
      <Select
        value={subject}
        onChange={v => onUpdateRow({ subject: v, variable: '', subType: '', attribute: '', operator: '', value: '', valueB: '' })}
        style={{ width: 200, borderRadius: 8 }}
        options={[{ value: 'response', label: 'La respuesta a' }, { value: 'variable', label: 'La variable' }]}
      />

      {/* Question / variable select */}
      <Select
        value={row.variable || undefined}
        onChange={v => onUpdateRow({ variable: v, subType: '', attribute: '', operator: '', value: '', valueB: '' })}
        placeholder={subject === 'variable' ? 'Selecciona una variable...' : 'Selecciona una pregunta...'}
        style={{ ...selStyle, flex: 1 }}
        options={subject === 'variable' ? Q_VARIABLE : Q_RESPONSE}
      />

      {/* Matriz de escalas — selector de atributo/fila */}
      {q?.tipo === 'matriz_escalas' && (
        <Select
          value={row.attribute || undefined}
          onChange={v => onUpdateRow({ attribute: v, subType: '', operator: '', value: '', valueB: '' })}
          placeholder="Selecciona un atributo..." style={selStyle}
          options={(q.atributos ?? []).map(a => ({ value: a, label: a }))}
        />
      )}

      {/* NPS/CES/CLI/CSAT/Matriz — selector Nota/Grupo */}
      {q && (NOTA_GRUPO_TIPOS.has(q.tipo) || (q.tipo === 'matriz_escalas' && row.attribute)) && (
        <Select
          value={row.subType || undefined}
          onChange={v => onUpdateRow({ subType: v, operator: '', value: '', valueB: '' })}
          placeholder="Evalúa..." style={selStyle}
          options={[{ value: 'nota', label: 'Nota' }, { value: 'grupo', label: 'Grupo' }]}
        />
      )}

      {/* Opción simple/múltiple — selector Opción/Comentario */}
      {q && (SINGLE_CHOICE.has(q.tipo) || MULTI_CHOICE.has(q.tipo)) && commentable.length > 0 && (
        <>
          <Select
            value={row.subType || undefined}
            onChange={v => onUpdateRow({ subType: v, attribute: '', operator: '', value: '', valueB: '' })}
            placeholder="Evalúa..." style={selStyle}
            options={[{ value: 'opcion', label: 'Opción' }, { value: 'comentario', label: 'Comentario' }]}
          />
          {row.subType === 'comentario' && (
            <Select
              value={row.attribute || undefined}
              onChange={v => onUpdateRow({ attribute: v, operator: '', value: '', valueB: '' })}
              placeholder="¿De qué opción?" style={selStyle}
              options={commentable.map(o => ({ value: o, label: o }))}
            />
          )}
        </>
      )}

      {/* Formulario — selector de campo real */}
      {q?.tipo === 'formulario' && (
        <Select
          value={row.subType || undefined}
          onChange={v => onUpdateRow({ subType: v, operator: '', value: '', valueB: '' })}
          placeholder="Selecciona un campo..." style={selStyle}
          options={(q.campos ?? []).map(c => ({ value: c.nombre, label: `${c.nombre} (${c.tipo})` }))}
        />
      )}

      {/* MaxDiff — selector Más/Menos importante */}
      {q?.tipo === 'maxdiff' && (
        <Select
          value={row.subType || undefined}
          onChange={v => onUpdateRow({ subType: v, operator: '', value: '', valueB: '' })}
          placeholder="Evalúa..." style={selStyle}
          options={[{ value: 'mas', label: 'Más importante' }, { value: 'menos', label: 'Menos importante' }]}
        />
      )}

      {/* Operator */}
      {row.variable && operators.length > 0 && (
        <Select
          value={row.operator || undefined}
          onChange={v => onUpdateRow({ operator: v, value: '', valueB: '' })}
          placeholder="Condición..."
          style={selStyle}
          options={operators}
        />
      )}

      {/* Value input(s) */}
      {row.operator && !NO_VALUE_OPS.has(row.operator) && renderValueInput(row, onUpdateRow, q, selStyle, inputStyle, rangeError)}

      {rangeError && (
        <div style={{ width: '100%' }}>
          <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: '#ff4d4f' }}>
            El primer valor debe ser menor o igual al segundo.
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Condition group ──────────────────────────────────────────────────────────

function CondGroupUI({ group, index, onDelete, onUpdateGroup, canDelete }: {
  group: ConditionGroup; index: number;
  onDelete: () => void;
  onUpdateGroup: (g: ConditionGroup) => void;
  canDelete: boolean;
}) {
  function updateRow(rowId: string, patch: Partial<ConditionRule>) {
    onUpdateGroup({ ...group, rows: group.rows.map(r => r.id === rowId ? { ...r, ...patch } : r) });
  }
  function deleteRow(rowId: string) {
    onUpdateGroup({ ...group, rows: group.rows.filter(r => r.id !== rowId) });
  }
  // Al agregar una condición (o subcondición) dentro de un grupo que ya tiene una primera
  // condición, hereda su pregunta/variable y sub-selector — solo cambia el operador/valor.
  function inheritedFields(): Partial<ConditionRule> {
    const first = group.rows[0];
    if (!first) return {};
    return { subject: first.subject, variable: first.variable, subType: first.subType, attribute: first.attribute };
  }
  function addRow() {
    onUpdateGroup({ ...group, rows: [...group.rows, { ...emptyRow(), ...inheritedFields() }] });
  }
  function addSubCondition() {
    onUpdateGroup({
      ...group,
      subConditions: [...(group.subConditions ?? []), { id: cuid(), connector: 'O', row: { ...emptyRow(), ...inheritedFields() } }],
    });
  }
  function updateSubCondition(scId: string, patch: Partial<ConditionRule>) {
    onUpdateGroup({ ...group, subConditions: (group.subConditions ?? []).map(sc => sc.id === scId ? { ...sc, row: { ...sc.row, ...patch } } : sc) });
  }
  function setSubConditionConnector(scId: string, connector: 'Y' | 'O') {
    onUpdateGroup({ ...group, subConditions: (group.subConditions ?? []).map(sc => sc.id === scId ? { ...sc, connector } : sc) });
  }
  function deleteSubCondition(scId: string) {
    onUpdateGroup({ ...group, subConditions: (group.subConditions ?? []).filter(sc => sc.id !== scId) });
  }

  return (
    <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
      {/* Connector row (Y/O) — only for 2nd+ groups */}
      {index > 0 && (
        <div style={{ background: '#fafafa', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'rgba(0,0,0,0.04)', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {(['Y', 'O'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => onUpdateGroup({ ...group, connector: opt })}
                style={{
                  background: group.connector === opt ? '#fff' : 'rgba(255,255,255,0)',
                  boxShadow: group.connector === opt ? '0px 2px 8px 0px rgba(0,0,0,0.05)' : 'none',
                  borderRadius: 100, border: 'none', cursor: 'pointer',
                  padding: '8px 12px',
                  color: group.connector === opt ? '#1890ff' : 'rgba(0,0,0,0.45)',
                  fontFamily: "'Roboto', sans-serif", fontSize: 14, lineHeight: 'normal',
                  transition: 'all .15s',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
          <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: 'rgba(0,0,0,0.85)', flex: 1 }}>
            se cumple que...
          </span>
          <button onClick={addSubCondition} style={{ background: 'white', border: '1px solid #d9d9d9', borderRadius: 100, cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 0 rgba(0,0,0,0.02)' }}>
            <BiGitBranch style={{ fontSize: 14, color: '#434343', transform: 'rotate(90deg)' }} />
          </button>
          {canDelete && (
            <DeleteConfirm what="este grupo (se perderán sus condiciones y subcondiciones)" onConfirm={onDelete}>
              <button style={{ background: 'white', border: '1px solid #d9d9d9', borderRadius: 100, cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 0 rgba(0,0,0,0.02)' }}>
                <BiTrash style={{ fontSize: 14, color: '#434343' }} />
              </button>
            </DeleteConfirm>
          )}
        </div>
      )}
      {/* Header */}
      {index === 0 && (
        <div style={{ background: '#fafafa', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: 'rgba(0,0,0,0.85)', flex: 1 }}>
            Dispara una respuesta automática cuando:
          </span>
          <button onClick={addSubCondition} style={{ background: 'white', border: '1px solid #d9d9d9', borderRadius: 100, cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 0 rgba(0,0,0,0.02)' }}>
            <BiGitBranch style={{ fontSize: 14, color: '#434343', transform: 'rotate(90deg)' }} />
          </button>
          {canDelete && (
            <DeleteConfirm what="este grupo (se perderán sus condiciones y subcondiciones)" onConfirm={onDelete}>
              <button style={{ background: 'white', border: '1px solid #d9d9d9', borderRadius: 100, cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 0 rgba(0,0,0,0.02)' }}>
                <BiTrash style={{ fontSize: 14, color: '#434343' }} />
              </button>
            </DeleteConfirm>
          )}
        </div>
      )}
      {/* Condition rows */}
      {group.rows.map(row => (
        <CondRowUI
          key={row.id}
          row={row}
          onUpdate={patch => updateRow(row.id, patch)}
          onDelete={() => deleteRow(row.id)}
          canDelete={group.rows.length > 1}
        />
      ))}
      {/* Sub-conditions — added via the group's Branch button */}
      {(group.subConditions ?? []).map(sc => (
        <SubConditionUI
          key={sc.id}
          subCondition={sc}
          onUpdateRow={patch => updateSubCondition(sc.id, patch)}
          onSetConnector={c => setSubConditionConnector(sc.id, c)}
          onDelete={() => deleteSubCondition(sc.id)}
        />
      ))}
    </div>
  );
}

// ─── Step 2 — Condiciones ─────────────────────────────────────────────────────

function Step2({ rule, onChange }: { rule: AutoResponse; onChange: (r: AutoResponse) => void }) {
  const groups = rule.condGroups;

  function addGroup() {
    onChange({ ...rule, condGroups: [...groups, { id: cuid(), connector: 'Y', rows: [emptyRow()] }] });
  }
  function deleteGroup(gid: string) {
    onChange({ ...rule, condGroups: groups.filter(g => g.id !== gid) });
  }
  function updateGroup(g: ConditionGroup) {
    onChange({ ...rule, condGroups: groups.map(x => x.id === g.id ? g : x) });
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ maxWidth: 760, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24, background: '#fff' }}>

        {/* Section title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500, fontSize: 20, color: 'rgba(0,0,0,0.45)', margin: 0, lineHeight: 'normal' }}>
            Define las condiciones de envío
          </p>
          <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: 'rgba(0,0,0,0.45)', margin: 0, lineHeight: 'normal' }}>
            Las condiciones determinan qué respuestas activan esta regla. Si dejás este paso vacío, la regla se aplica a toda respuesta que cumpla el disparador.
          </p>
        </div>

        {/* Conditions area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Empty state — only when no groups */}
          {groups.length === 0 && (
            <div style={{ border: '1px dashed #f0f0f0', borderRadius: 8 }}>
              <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: 'rgba(0,0,0,0.45)', margin: 0, lineHeight: 'normal' }}>
                  Sin condiciones configuradas. La regla se aplicará a toda respuesta que cumpla el disparador.
                </p>
              </div>
            </div>
          )}

          {/* Condition groups */}
          {groups.map((group, i) => (
            <CondGroupUI
              key={group.id}
              group={group}
              index={i}
              onDelete={() => deleteGroup(group.id)}
              onUpdateGroup={updateGroup}
              canDelete
            />
          ))}

          {/* Add condition button */}
          <button
            onClick={addGroup}
            style={{
              width: '100%', borderRadius: 8, background: '#fff',
              border: '1px dashed #69c0ff',
              boxShadow: '0px 2px 0px 0px rgba(0,0,0,0.02)',
              padding: '8px 9px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <BiPlus style={{ color: '#1890ff', fontSize: 14 }} />
            <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: '#1890ff', lineHeight: 'normal' }}>
              Agregar condición
            </span>
            <BiChevronRight style={{ color: '#1890ff', fontSize: 16 }} />
          </button>

        </div>

      </div>
    </DndProvider>
  );
}

// ─── Step 3 — Mensaje ─────────────────────────────────────────────────────────

function VariablePill({ value }: { value: string }) {
  const isQuestion = value.startsWith('pregunta:');
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: '#e6f7ff', color: '#1890ff',
      border: '1px solid #91d5ff', borderRadius: 100,
      padding: '4px 8px', fontFamily: "'Roboto', sans-serif", fontSize: 14,
      maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    }}>
      <BiAt style={{ fontSize: 14, flexShrink: 0 }} />
      {isQuestion ? describeRecipientSource(value) : value}
    </span>
  );
}

// ─── Fila de campo — label fijo a la izquierda + control a la derecha ────────

function FieldRow({ label, required, tooltip, children }: { label: string; required?: boolean; tooltip?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: 150, flexShrink: 0 }}>
        {required && <span style={{ color: '#ff4d4f', fontSize: 14 }}>*</span>}
        <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: 'rgba(0,0,0,0.45)' }}>{label}</span>
        {tooltip && (
          <Tooltip title={tooltip}>
            <BiInfoCircle style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)', cursor: 'help' }} />
          </Tooltip>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

// ─── Email input — sugerencia "Usar correo:", autocompletado de dominio, ──────
// ─── validación con shake + borde rojo, chips removibles (CC/CCO/Reply to) ────

function EmailSuggestionDropdown({ suggestions, highlightIndex, onPick }: {
  suggestions: string[]; highlightIndex: number; onPick: (value: string) => void;
}) {
  if (suggestions.length === 0) return null;
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 20,
      background: '#fff', borderRadius: 8, boxShadow: '0px 2px 4px rgba(0,0,0,0.15)',
      padding: '4px 0', overflow: 'hidden',
    }}>
      {suggestions.map((s, i) => (
        <button
          key={s}
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={() => onPick(s)}
          className="rf-suggestion-row"
          style={{
            width: '100%', textAlign: 'left', background: i === highlightIndex ? 'rgba(0,0,0,0.04)' : 'none',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
          }}
        >
          <BiEnvelope style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)', flexShrink: 0 }} />
          <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <span style={{ color: 'rgba(0,0,0,0.45)' }}>Usar correo: </span>
            <span style={{ color: 'rgba(0,0,0,0.85)', fontWeight: 700 }}>{s}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function EmailChip({ email, focused, onRemove }: { email: string; focused: boolean; onRemove: () => void }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, background: '#e6fffb',
      border: '1px solid #13c2c2', borderRadius: 4, padding: '2px 9px', flexShrink: 0,
    }}>
      <BiEnvelope style={{ fontSize: 10, color: '#13c2c2', flexShrink: 0 }} />
      <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: '#13c2c2', whiteSpace: 'nowrap' }}>{email}</span>
      {focused ? (
        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={onRemove}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#13c2c2', flexShrink: 0 }}
        >
          <BiX style={{ fontSize: 10 }} />
        </button>
      ) : (
        <BiCheck style={{ fontSize: 10, color: '#13c2c2', flexShrink: 0 }} />
      )}
    </span>
  );
}

// Multi-correo con chips removibles (CC/CCO). El "Reply to" (un solo correo) reutiliza este
// mismo componente vía EmailInput, que solo conserva el último valor confirmado.
function EmailsInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = focused ? getEmailSuggestions(draft) : [];

  // El key={shakeKey} de abajo remonta el recuadro para reiniciar la animación de shake, lo
  // que también remonta el <input> y le quita el foco un instante — se lo devolvemos.
  useEffect(() => {
    if (shakeKey > 0) inputRef.current?.focus();
  }, [shakeKey]);

  function commit(raw: string) {
    const v = raw.trim();
    if (!v) return;
    if (!isValidEmail(v)) {
      setError(true);
      setShakeKey(k => k + 1);
      return;
    }
    if (!value.includes(v)) onChange([...value, v]);
    setDraft('');
    setError(false);
    setHighlightIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit(highlightIndex >= 0 && suggestions[highlightIndex] ? suggestions[highlightIndex] : draft);
    } else if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault();
      setHighlightIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp' && suggestions.length > 0) {
      e.preventDefault();
      setHighlightIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (/[,; ]$/.test(raw)) {
      commit(raw.slice(0, -1));
      return;
    }
    setDraft(raw);
    setError(false);
    setHighlightIndex(-1);
  }

  const borderColor = error ? '#ff4d4f' : focused ? '#40a9ff' : '#d9d9d9';
  const boxShadow = focused ? `0 0 0 2px ${error ? 'rgba(255,77,79,0.2)' : 'rgba(24,144,255,0.2)'}` : undefined;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        key={shakeKey}
        className={shakeKey > 0 ? 'rf-shake' : undefined}
        onClick={() => inputRef.current?.focus()}
        style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4,
          minHeight: 32, boxSizing: 'border-box', padding: '6px 12px', cursor: 'text',
          background: '#fff', border: `1px solid ${borderColor}`, borderRadius: 8, boxShadow,
        }}
      >
        {value.map(email => (
          <EmailChip key={email} email={email} focused={focused} onRemove={() => onChange(value.filter(v => v !== email))} />
        ))}
        <input
          ref={inputRef}
          className="rf-email-input"
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setHighlightIndex(-1); }}
          placeholder={value.length === 0 ? (placeholder ?? 'Ingresa un correo electrónico…') : ''}
          style={{
            flex: 1, minWidth: 120, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: "'Roboto', sans-serif", fontSize: 14, color: 'rgba(0,0,0,0.85)', padding: '2px 0',
          }}
        />
      </div>
      {focused && <EmailSuggestionDropdown suggestions={suggestions} highlightIndex={highlightIndex} onPick={commit} />}
    </div>
  );
}

// Ingreso de un solo correo (Reply to): mismo componente, pero cualquier correo nuevo
// reemplaza al anterior en vez de agregarse — nunca hay más de un chip a la vez.
function EmailInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <EmailsInput
      value={value ? [value] : []}
      onChange={vals => onChange(vals[vals.length - 1] ?? '')}
      placeholder={placeholder}
    />
  );
}

function formatTemplateDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })} ${d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
}

function Step3({ rule, onChange, onOpenEditor }: { rule: AutoResponse; onChange: (r: AutoResponse) => void; onOpenEditor: () => void }) {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24, background: '#fff' }}>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500, fontSize: 20, color: 'rgba(0,0,0,0.45)', margin: 0, lineHeight: 'normal' }}>
          Diseña el mensaje
        </p>
        <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: 'rgba(0,0,0,0.45)', margin: 0, lineHeight: 'normal' }}>
          Configura el contenido del correo que enviará esta regla. Los bloques se arman en el editor de correo.
        </p>
      </div>

      <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ background: '#fafafa', padding: '12px 16px' }}>
          <p style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.85)', margin: 0 }}>
            Correo configurado
          </p>
        </div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FieldRow label="Enviar a" required>
            <VariablePill value={rule.recipientVariable} />
          </FieldRow>

          <FieldRow label="Remitente" required>
            <Select
              value={rule.sender || 'cx@hircasa.com'}
              onChange={v => onChange({ ...rule, sender: v })}
              style={{ width: '100%', borderRadius: 8, fontFamily: "'Roboto', sans-serif" }}
              options={[
                { value: 'cx@hircasa.com',       label: 'CX Postventa · cx@hircasa.com' },
                { value: 'atencion@hircasa.com',  label: 'Atención al Cliente · atencion@hircasa.com' },
              ]}
            />
          </FieldRow>

          <FieldRow label="Reply to" tooltip="Si el encuestado responde, el correo llega aquí.">
            <EmailInput
              value={rule.replyTo}
              onChange={v => onChange({ ...rule, replyTo: v })}
            />
          </FieldRow>

          <FieldRow label="CC (Con copia)" tooltip="Destinatarios adicionales que verán el correo — visibles para todos los demás.">
            <EmailsInput
              value={rule.cc}
              onChange={v => onChange({ ...rule, cc: v })}
              placeholder="Ingresa uno o más correos electrónicos…"
            />
          </FieldRow>

          <FieldRow label="CCO (Copia oculta)" tooltip="Destinatarios adicionales que reciben una copia sin que los demás lo sepan.">
            <EmailsInput
              value={rule.bcc}
              onChange={v => onChange({ ...rule, bcc: v })}
              placeholder="Ingresa uno o más correos electrónicos…"
            />
          </FieldRow>

          <FieldRow label="Asunto" required>
            <Input
              value={rule.subject}
              onChange={e => onChange({ ...rule, subject: e.target.value })}
              placeholder="Escribe el asunto del correo"
              suffix={<BiEditAlt style={{ color: 'rgba(0,0,0,0.45)' }} />}
              style={{ borderRadius: 8, fontFamily: "'Roboto', sans-serif", fontSize: 14 }}
            />
          </FieldRow>

          <FieldRow label="Plantilla de correo" required>
            {countComponents(rule.rows) === 0 ? (
              <Button type="link" onClick={onOpenEditor} style={{ padding: 0, height: 'auto' }}>
                Diseñar plantilla de correo
              </Button>
            ) : (
              <Button type="link" onClick={onOpenEditor} style={{ padding: 0, height: 'auto' }}>
                Editar plantilla — últ. creación {formatTemplateDate(rule.blocksUpdatedAt)}
              </Button>
            )}
          </FieldRow>
        </div>
      </div>

    </div>
  );
}

// ─── Chevron breadcrumb separator ─────────────────────────────────────────────

function BreadcrumbChevron() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
      <path d="M8.926 5.254L13.672 10L8.926 14.746L7.754 13.574L11.328 10L7.754 6.426L8.926 5.254Z" fill="rgba(0,0,0,0.85)" />
    </svg>
  );
}

// ─── WizardView ───────────────────────────────────────────────────────────────

export default function WizardView({ rule, onChange, onSaveAndActivate, onBack, onSaveDraft, onOpenEditor, step, onStepChange }: Props) {
  const current = step;
  const [showExitDialog, setShowExitDialog] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const replyToValid = rule.replyTo === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rule.replyTo);
  const canNext = current === 0
    ? (rule.name.trim() !== '' && rule.trigger !== null)
    : current === 1
    ? allConditionsComplete(rule.condGroups)
    : countComponents(rule.rows) > 0 && rule.sender !== '' && rule.subject.trim() !== '' && replyToValid;
  const isLast  = current === 2;

  return (
    <div ref={rootRef} style={{ display: 'flex', flexDirection: 'column', background: '#fff', width: '100%', height: '100%', position: 'relative', overflowX: 'hidden' }}>

      {/* Topbar — breadcrumb + stepper; envuelve a una segunda línea si no cabe */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #f0f0f0',
        padding: '12px 24px', display: 'flex', alignItems: 'center', flexWrap: 'wrap',
        justifyContent: 'space-between', gap: 12, rowGap: 8, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: '1 1 260px' }}>
          <button
            onClick={() => setShowExitDialog(true)}
            style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: '#1890ff', background: 'none', border: 'none', cursor: 'pointer', padding: 0, whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Respuestas Automáticas
          </button>
          <BreadcrumbChevron />
          <Input
            value={rule.name}
            onChange={e => onChange({ ...rule, name: e.target.value.slice(0, 70) })}
            placeholder="Nombre de la regla"
            maxLength={70}
            style={{ flex: '1 1 120px', minWidth: 120, maxWidth: 240, borderRadius: 8, fontFamily: "'Roboto', sans-serif", fontSize: 14 }}
          />
        </div>
        <div style={{ flexShrink: 0 }}>
          <NavigationSteps current={current} onStepClick={onStepChange} />
        </div>
      </div>

      <Modal
        open={showExitDialog}
        onCancel={() => setShowExitDialog(false)}
        closable
        getContainer={() => rootRef.current || document.body}
        footer={null}
        width={480}
        styles={{ content: { borderRadius: 20, padding: 32 } }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: '#e6f4ff', flexShrink: 0, marginTop: 4 }}>
            <BiInfoCircle style={{ color: '#1890ff', fontSize: 14 }} />
          </span>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500, fontSize: 16, color: 'rgba(0,0,0,0.85)', margin: '0 0 8px' }}>
              ¿Salir de la creación de esta regla?
            </p>
            <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: 'rgba(0,0,0,0.65)', margin: 0 }}>
              Puedes descartar el avance o guardarlo como borrador para continuar después.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <Button danger style={{ borderRadius: 8 }} onClick={onBack}>Descartar y salir</Button>
              <Button type="primary" style={{ borderRadius: 8 }} onClick={onSaveDraft}>Guardar como borrador y salir</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Step content — scrolls within the fixed-height layout */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', background: '#fff' }}>
        {current === 0 && <Step1 rule={rule} onChange={onChange} />}
        {current === 1 && <Step2 rule={rule} onChange={onChange} />}
        {current === 2 && <Step3 rule={rule} onChange={onChange} onOpenEditor={onOpenEditor} />}
      </div>

      {/* Footer */}
      <div style={{
        background: '#fff', borderTop: '1px solid #f0f0f0',
        padding: '12px 24px', display: 'flex', alignItems: 'center', flexWrap: 'wrap',
        justifyContent: 'space-between', gap: 12, rowGap: 8, flexShrink: 0,
      }}>
        <Tooltip title="Guarda los cambios de esta regla tal como están, sin necesidad de pasar por el resto de los pasos.">
          <Button onClick={onSaveDraft}>Guardar cambios</Button>
        </Tooltip>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          {current > 0 && (
            <Button icon={<BiChevronLeft />} onClick={() => onStepChange(current - 1)}>Anterior</Button>
          )}
          <Button
            type="primary"
            disabled={!canNext}
            icon={<BiChevronRight />}
            iconPlacement="end"
            onClick={() => isLast ? onSaveAndActivate() : onStepChange(current + 1)}
          >
            {isLast ? 'Guardar y activar' : 'Siguiente'}
          </Button>
        </div>
      </div>

    </div>
  );
}
