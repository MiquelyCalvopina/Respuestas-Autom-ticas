import { useState, useEffect, useRef } from 'react';
import { Button, Input, Select, Segmented, Radio, DatePicker, InputNumber } from 'antd';
import { RightOutlined, PlusOutlined, CheckOutlined, DeleteOutlined, CheckCircleFilled, BranchesOutlined, HolderOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AutoResponse, ConditionGroup, ConditionRule, Pregunta, OpcionConComentario } from './types';
import { VARIABLES, PREGUNTAS_EJEMPLO, ETIQUETAS_CATEGORIZACION } from './data';
import { cuid } from './cuid';

interface Props {
  rule: AutoResponse;
  onChange: (r: AutoResponse) => void;
  onSaveAndActivate: () => void;
  onBack: () => void;
  onOpenEditor: () => void;
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepNode({ num, label, active, done }: { num: number; label: string; active?: boolean; done?: boolean }) {
  const circleBg     = active ? '#1890ff' : 'transparent';
  const circleBorder = (active || done) ? '#1890ff' : 'rgba(0,0,0,0.25)';
  const labelColor   = active ? '#1890ff' : done ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.45)';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '4px 8px', borderRadius: 8,
      background: active ? 'rgba(24,144,255,0.08)' : 'transparent',
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
        background: circleBg,
        border: `1px solid ${circleBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {done
          ? <CheckOutlined style={{ fontSize: 10, color: '#1890ff' }} />
          : <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: active ? '#fff' : 'rgba(0,0,0,0.25)', lineHeight: 1 }}>{num}</span>
        }
      </div>
      <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: labelColor, whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </div>
  );
}

function StepChevron() {
  return (
    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" style={{ flexShrink: 0, margin: '0 2px' }}>
      <path d="M1 1L5 5L1 9" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NavigationSteps({ current }: { current: number }) {
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 24px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <StepNode num={1} label="Detalles"    active={current === 0} done={current > 0} />
        <StepChevron />
        <StepNode num={2} label="Condiciones" active={current === 1} done={current > 1} />
        <StepNode num={3} label="Mensaje"     active={current === 2} />
      </div>
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
        borderRadius: 8, padding: 12, cursor: 'pointer', width: '100%',
        display: 'flex', gap: 8, alignItems: 'flex-start',
        boxSizing: 'border-box',
      }}
    >
      {/* Radio circle */}
      <div style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 2, position: 'relative', border: `1px solid ${selected ? '#1890ff' : '#d9d9d9'}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1890ff' }} />}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: 'rgba(0,0,0,0.85)', margin: '0 0 4px 0', lineHeight: 'normal' }}>{title}</p>
        <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: 'rgba(0,0,0,0.45)', margin: 0, lineHeight: 'normal' }}>{description}</p>
      </div>
    </div>
  );
}

// ─── Step 1 — Detalles ────────────────────────────────────────────────────────

function Step1({ rule, onChange }: { rule: AutoResponse; onChange: (r: AutoResponse) => void }) {
  return (
    <div style={{ padding: '24px 250px', display: 'flex', flexDirection: 'column', gap: 16, background: '#fff' }}>

      {/* Section title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <p style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500, fontSize: 20, color: 'rgba(0,0,0,0.45)', margin: 0, lineHeight: 'normal' }}>
          Configura los detalles de la regla
        </p>
        <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: 'rgba(0,0,0,0.45)', margin: 0, lineHeight: 'normal' }}>
          Define el nombre, a quién va dirigido el correo y cuándo se dispara la regla.
        </p>
      </div>

      {/* Nombre de la regla */}
      <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 4 }}>
        <p style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.85)', margin: '0 0 8px 0' }}>
          Nombre de la regla <span style={{ color: '#ff4d4f' }}>*</span>
        </p>
        <Input
          value={rule.name}
          onChange={e => onChange({ ...rule, name: e.target.value.slice(0, 70) })}
          placeholder="Ej: Recuperación de detractores"
          style={{ borderRadius: 8, fontFamily: "'Roboto', sans-serif", fontSize: 14 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: 'rgba(0,0,0,0.25)' }}>
            {rule.name.length} / 70
          </span>
        </div>
      </div>

      {/* Variable destinatario */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.85)', margin: '0 0 8px 0' }}>
          ¿A qué correo llega el mensaje? <span style={{ color: '#ff4d4f' }}>*</span>
        </p>
        <Select
          value={rule.recipientVariable || 'correo_electronico'}
          onChange={v => onChange({ ...rule, recipientVariable: v })}
          style={{ width: '100%', borderRadius: 8, fontFamily: "'Roboto', sans-serif" }}
          options={VARIABLES.map(v => ({ value: v, label: v }))}
        />
        <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: 'rgba(0,0,0,0.45)', margin: '4px 0 0 0', lineHeight: 'normal' }}>
          El sistema enviará el correo al valor de este dato para cada encuestado. Si está vacío, ese envío se omite y queda registrado en el historial como <strong style={{ color: 'rgba(0,0,0,0.65)' }}>No enviado</strong>.
        </p>
      </div>

      {/* Disparador */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.85)', margin: '0 0 8px 0' }}>
          Disparador <span style={{ color: '#ff4d4f' }}>*</span>
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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

      {/* Remitente + Reply-to */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Remitente */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.85)', margin: '0 0 8px 0' }}>
            Remitente <span style={{ color: '#ff4d4f' }}>*</span>
          </p>
          <Select
            value={rule.sender || 'cx@hircasa.com'}
            onChange={v => onChange({ ...rule, sender: v })}
            style={{ width: '100%', borderRadius: 8, fontFamily: "'Roboto', sans-serif" }}
            options={[
              { value: 'cx@hircasa.com',       label: 'CX Postventa · cx@hircasa.com' },
              { value: 'atencion@hircasa.com',  label: 'Atención al Cliente · atencion@hircasa.com' },
            ]}
          />
        </div>
        {/* Reply-to */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.85)', margin: '0 0 8px 0' }}>
            Reply-to <span style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 400, color: 'rgba(0,0,0,0.45)' }}>(opcional)</span>
          </p>
          <Input
            value={rule.replyTo}
            onChange={e => onChange({ ...rule, replyTo: e.target.value })}
            placeholder="support@example.org"
            status={rule.replyTo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rule.replyTo) ? 'error' : undefined}
            style={{ borderRadius: 8, fontFamily: "'Roboto', sans-serif", fontSize: 14 }}
          />
          {rule.replyTo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rule.replyTo) ? (
            <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: '#ff4d4f', margin: '4px 0 0 0', lineHeight: 'normal' }}>
              Ingresa un correo electrónico válido.
            </p>
          ) : (
            <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: 'rgba(0,0,0,0.45)', margin: '4px 0 0 0', lineHeight: 'normal' }}>
              Si el encuestado responde, el correo llega aquí.
            </p>
          )}
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
];

// ── Variable type map ─────────────────────────────────────────────────────────
const VAR_TYPE: Record<string, string> = {
  nombre_completo: 'text', nombre_preferencia: 'text', identificador: 'text',
  correo_electronico: 'email', telefono: 'number', edad: 'number', fecha_respuesta: 'date',
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
  // Variables — incluyen 'Está vacía'
  varText:   ['Contiene','No contiene','Está en la lista','No está en la lista','Es igual a','No es igual a','Está vacía','No está vacía'],
  varNumber: ['Es igual a','No es igual a','Es mayor que','Es mayor o igual a','Es menor que','Es menor o igual a','Esta entre','Está vacía','No está vacía'],
  varDate:   ['Es igual a','No es igual a','Es después de','Es antes de','Está entre','Está vacía','No está vacía'],
  varEmail:  ['Contiene','No contiene','Pertenece a los dominios','No pertenece a los dominios','Es igual a','No es igual a','Está vacía','No está vacía'],
  // Formulario — solo 'No está vacía'
  formText:   ['Contiene','No contiene','Está en la lista','No está en la lista','Es igual a','No es igual a','No está vacía'],
  formNumber: ['Es igual a','No es igual a','Es mayor que','Es mayor o igual a','Es menor que','Es menor o igual a','Esta entre','No está vacía'],
  formEmail:  ['Contiene','No contiene','Pertenece a los dominios','No pertenece a los dominios','Es igual a','No es igual a','No está vacía'],
  formDate:   ['Es igual a','No es igual a','Es después de','Es antes de','Está entre','No está vacía'],
  formUrl:    ['Contiene','No contiene','Es igual a','No es igual a','No está vacía'],
  // Preguntas
  scaleNum: ['Es igual a','No es igual a','Es mayor que','Es mayor o igual a','Es menor que','Es menor o igual a','Esta entre','No está vacía'],
  scaleTxt: ['Es igual a','No es igual a','Es mayor que','Es mayor o igual a','Es menor que','Es menor o igual a','No está vacía'],
  group:    ['Es igual a','No es igual a'],
  open:     ['Contiene','No contiene','Está en la lista','No está en la lista','Es igual a','No es igual a','Habla de','No habla de','No está vacía'],
  simpleOpt:     ['Es igual a','No es igual a','No está vacía'],
  simpleComment: ['Contiene','No contiene','Está en la lista','No está en la lista','Es igual a','No es igual a','Habla de','No habla de','No está vacía'],
  multiOpt:      ['Contiene','No contiene','Es igual a','No es igual a','No está vacía'],
  multiComment:  ['Contiene','No contiene','Es igual a','No es igual a','Habla de','No habla de','No está vacía'],
  check:    ['Es igual a','No es igual a'],
  maxdiff:  ['Es igual a','No es igual a','No está vacía'],
  ranking:  ['Es igual a','No es igual a','No está vacía'],
  upload:   ['No está vacía'],
};

function getOperators(row: ConditionRule): string[] {
  if (row.subject === 'variable') {
    const t = VAR_TYPE[row.variable] || 'text';
    return ({ text: ops.varText, number: ops.varNumber, date: ops.varDate, email: ops.varEmail } as Record<string, string[]>)[t] ?? ops.varText;
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
    const campo = q.campos?.find(c => c.nombre === row.subType);
    if (!campo) return [];
    return ({ texto: ops.formText, numero: ops.formNumber, correo: ops.formEmail, fecha: ops.formDate, url: ops.formUrl } as Record<string, string[]>)[campo.tipo];
  }
  if (q.tipo === 'casilla_verificacion') return ops.check;
  if (q.tipo === 'maxdiff') return row.subType ? ops.maxdiff : [];
  if (q.tipo === 'ranking') return ops.ranking;
  if (q.tipo === 'cargar_archivo') return ops.upload;
  if (SINGLE_CHOICE.has(q.tipo) || MULTI_CHOICE.has(q.tipo)) {
    const commentable = commentableOptions(q);
    const optSet = SINGLE_CHOICE.has(q.tipo) ? ops.simpleOpt : ops.multiOpt;
    const commentSet = SINGLE_CHOICE.has(q.tipo) ? ops.simpleComment : ops.multiComment;
    if (commentable.length === 0) return optSet;
    if (row.subType === 'opcion') return optSet;
    if (row.subType === 'comentario') return row.attribute ? gate(commentSet, q.comentarioCategorizable) : [];
    return [];
  }
  return [];
}

const NO_VALUE_OPS = new Set(['Está vacía','No está vacía']);
const RANGE_OPS    = new Set(['Esta entre','Está entre']);
const LIST_OPS     = new Set(['Está en la lista','No está en la lista','Pertenece a los dominios','No pertenece a los dominios']);

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
  const nonEmpty = (v: string | string[]) => Array.isArray(v) ? v.length > 0 : String(v ?? '').trim() !== '';
  if (RANGE_OPS.has(r.operator)) {
    if (!nonEmpty(r.value) || !nonEmpty(r.valueB)) return false;
    return rangeValid(r, getPregunta(r));
  }
  return nonEmpty(r.value);
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
      opacity: isDragging ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: 8,
      border: '1px solid #f0f0f0', borderRadius: 8, padding: '8px 12px', background: '#fff', cursor: 'grab',
    }}>
      <HolderOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
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
        onChange={v => onUpdate({ value: v })}
        placeholder="Escribe y presiona Enter, o separa con comas/punto y coma..."
        style={{ ...inputStyle, minWidth: 220 }}
      />
    );
  }

  if (q && SCALE_TIPOS.has(q.tipo) && row.subType === 'nota') {
    if (op === 'Es igual a' || op === 'No es igual a') {
      return (
        <Select mode="multiple" value={Array.isArray(row.value) ? row.value : []}
          onChange={v => onUpdate({ value: v })} placeholder="Selecciona uno o más..."
          style={{ ...selStyle, flex: 1 }} options={scaleOptions(q)} />
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
    <Input value={firstOf(row.value)} onChange={e => onUpdate({ value: e.target.value })}
      placeholder="Escribe un valor..." style={inputStyle} />
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', padding: 16 }}>

        {/* Subject */}
        <Select
          value={subject}
          onChange={v => onUpdate({ subject: v, variable: '', subType: '', attribute: '', operator: '', value: '', valueB: '' })}
          style={{ width: 180, borderRadius: 8 }}
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

        {/* Delete */}
        {canDelete && (
          <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#ff4d4f', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <DeleteOutlined style={{ fontSize: 14 }} />
          </button>
        )}
      </div>

      {/* Condición lista / rango inválido */}
      {complete && (
        <div style={{ paddingLeft: 20, paddingBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
          <CheckCircleFilled style={{ color: '#52c41a', fontSize: 12 }} />
          <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: '#52c41a' }}>Condición lista</span>
        </div>
      )}
      {rangeError && (
        <div style={{ paddingLeft: 20, paddingBottom: 12 }}>
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
  function addRow() {
    onUpdateGroup({ ...group, rows: [...group.rows, emptyRow()] });
  }

  return (
    <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
      {/* Connector row (Y/O) — only for 2nd+ groups */}
      {index > 0 && (
        <div style={{ background: '#fafafa', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ background: 'rgba(0,0,0,0.04)', padding: 4, borderRadius: 8, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {(['Y', 'O'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => onUpdateGroup({ ...group, connector: opt })}
                style={{
                  background: group.connector === opt ? '#fff' : 'rgba(255,255,255,0)',
                  boxShadow: group.connector === opt ? '0px 2px 8px 0px rgba(0,0,0,0.05)' : 'none',
                  borderRadius: 100, border: 'none', cursor: 'pointer',
                  padding: '4px 8px',
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
          <button style={{ background: 'white', border: '1px solid #d9d9d9', borderRadius: 100, cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 0 rgba(0,0,0,0.02)' }}>
            <BranchesOutlined style={{ fontSize: 12, color: '#434343', transform: 'rotate(90deg)' }} />
          </button>
          {canDelete && (
            <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#ff4d4f', display: 'flex', alignItems: 'center' }}>
              <DeleteOutlined style={{ fontSize: 14 }} />
            </button>
          )}
        </div>
      )}
      {/* Header */}
      {index === 0 && (
        <div style={{ background: '#fafafa', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: 'rgba(0,0,0,0.85)', flex: 1 }}>
            Dispara una respuesta automática cuando:
          </span>
          <button style={{ background: 'white', border: '1px solid #d9d9d9', borderRadius: 100, cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 0 rgba(0,0,0,0.02)' }}>
            <BranchesOutlined style={{ fontSize: 12, color: '#434343', transform: 'rotate(90deg)' }} />
          </button>
          {canDelete && (
            <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#ff4d4f', display: 'flex', alignItems: 'center' }}>
              <DeleteOutlined style={{ fontSize: 14 }} />
            </button>
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
      <div style={{ padding: '24px 250px', display: 'flex', flexDirection: 'column', gap: 16, background: '#fff' }}>

        {/* Section title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500, fontSize: 20, color: 'rgba(0,0,0,0.45)', margin: 0, lineHeight: 'normal' }}>
            Define las condiciones de envío
          </p>
          <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: 'rgba(0,0,0,0.45)', margin: 0, lineHeight: 'normal' }}>
            Las condiciones determinan qué respuestas activan esta regla. Si dejás este paso vacío, la regla se aplica a toda respuesta que cumpla el disparador.
          </p>
        </div>

        {/* Conditions area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* Empty state — only when no groups */}
          {groups.length === 0 && (
            <div style={{ border: '1px dashed #f0f0f0', borderRadius: 8 }}>
              <div style={{ padding: '24px 16px', textAlign: 'center' }}>
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
              canDelete={groups.length > 1}
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
            <PlusOutlined style={{ color: '#1890ff', fontSize: 14 }} />
            <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: '#1890ff', lineHeight: 'normal' }}>
              Agregar condición
            </span>
          </button>

        </div>

      </div>
    </DndProvider>
  );
}

// ─── Step 3 placeholder ───────────────────────────────────────────────────────

function StepPlaceholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ padding: '48px 250px', background: '#fff' }}>
      <p style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500, fontSize: 20, color: 'rgba(0,0,0,0.45)', margin: '0 0 8px 0' }}>{title}</p>
      <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: 'rgba(0,0,0,0.45)', margin: 0 }}>{subtitle}</p>
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

export default function WizardView({ rule, onChange, onSaveAndActivate, onBack, onOpenEditor }: Props) {
  const [current, setCurrent] = useState(0);
  const replyToValid = rule.replyTo === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rule.replyTo);
  const canNext = current === 0
    ? (rule.name.trim() !== '' && rule.trigger !== null && rule.sender !== '' && replyToValid)
    : true;
  const isLast  = current === 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', width: '100%', height: '100%' }}>

      {/* Topbar */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #f0f0f0',
        padding: '16px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={onBack}
            style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: '#1890ff', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Respuestas Automáticas
          </button>
          <BreadcrumbChevron />
          <Input
            value={rule.name}
            onChange={e => onChange({ ...rule, name: e.target.value })}
            style={{ width: 250, borderRadius: 8, fontFamily: "'Roboto', sans-serif", fontSize: 14 }}
          />
        </div>
        <Button onClick={() => {}}>Guardar borrador</Button>
      </div>

      {/* Step indicator */}
      <NavigationSteps current={current} />

      {/* Step content — scrolls within the fixed-height layout */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: '#fff' }}>
        {current === 0 && <Step1 rule={rule} onChange={onChange} />}
        {current === 1 && <Step2 rule={rule} onChange={onChange} />}
        {current === 2 && <StepPlaceholder title="Mensaje" subtitle="Diseña el correo que se enviará al encuestado." />}
      </div>

      {/* Footer */}
      <div style={{
        background: '#fff', borderTop: '1px solid #f0f0f0',
        padding: '16px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'flex-end', gap: 8, flexShrink: 0,
      }}>
        {current > 0 && (
          <Button onClick={() => setCurrent(c => c - 1)}>← Anterior</Button>
        )}
        <Button onClick={() => {}}>Guardar borrador</Button>
        <Button
          type="primary"
          disabled={!canNext}
          icon={<RightOutlined />}
          iconPlacement="end"
          onClick={() => isLast ? onSaveAndActivate() : setCurrent(c => c + 1)}
        >
          {isLast ? 'Guardar y activar' : 'Siguiente'}
        </Button>
      </div>

    </div>
  );
}
