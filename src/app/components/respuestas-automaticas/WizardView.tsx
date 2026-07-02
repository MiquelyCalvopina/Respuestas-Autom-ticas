import { useState } from 'react';
import { Button, Input, Select, Segmented } from 'antd';
import { RightOutlined, PlusOutlined, CheckOutlined, DeleteOutlined, CheckCircleFilled, BranchesOutlined } from '@ant-design/icons';
import { AutoResponse } from './types';
import { VARIABLES, SENDERS } from './data';

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

// ─── Condition builder types & helpers ───────────────────────────────────────

interface CondRow {
  id: string;
  subject: string;   // 'response' | 'variable'
  variable: string;  // p1-p11 | variable key
  subType: string;   // intermediate selector (nota/grupo/text/number/email/date/url/mas/menos)
  operator: string;
  value: string;
  valueB: string;    // second value for range operators
}
interface CondGroup { id: string; connector: 'Y' | 'O'; rows: CondRow[]; }
const cuid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const emptyRow = (): CondRow => ({ id: cuid(), subject: 'response', variable: '', subType: '', operator: '', value: '', valueB: '' });

// ── Question option lists ──────────────────────────────────────────────────────
const Q_RESPONSE = [
  { value: 'p1',  label: '(P1) Enunciado de Respuesta Abierta' },
  { value: 'p2',  label: '(P2) Enunciado de NPS' },
  { value: 'p3',  label: '(P3) Enunciado de Matriz de escalas' },
  { value: 'p4',  label: '(P4) Enunciado de Formulario' },
  { value: 'p5',  label: '(P5) Enunciado de Opción simple' },
  { value: 'p6',  label: '(P6) Enunciado de Opción múltiple' },
  { value: 'p7',  label: '(P7) Enunciado de Casilla de verificación' },
  { value: 'p8',  label: '(P8) Enunciado de MaxDiff' },
  { value: 'p9',  label: '(P9) Enunciado de Subir archivo' },
  { value: 'p10', label: '(P10) Enunciado de Rating' },
  { value: 'p11', label: '(P11) Enunciado de Ranking' },
];
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

// ── Operator sets ─────────────────────────────────────────────────────────────
const ops = {
  text:    ['Contiene','No contiene','Está en la lista','No está en la lista','Es igual a','No es igual a','Está vacía','No está vacía'],
  number:  ['Es igual a','No es igual a','Es mayor que','Es mayor o igual a','Es menor que','Es menor o igual a','Esta entre','Está vacía','No está vacía'],
  date:    ['Es igual a','No es igual a','Es después de','Es antes de','Está entre','Está vacía','No está vacía'],
  email:   ['Contiene','No contiene','Pertenece a los dominios','No pertenece a los dominios','Es igual a','No es igual a','Está vacía','No está vacía'],
  open:    ['Contiene','No contiene','Está en la lista','No está en la lista','Es igual a','No es igual a','No está vacía'],
  scale:   ['Es igual a','No es igual a','Es mayor que','Es mayor o igual a','Es menor que','Es menor o igual a','Esta entre','No está vacía'],
  group:   ['Es igual a','No es igual a'],
  single:  ['Es igual a','No es igual a','No está vacía'],
  multi:   ['Contiene','No contiene','Es igual a','No es igual a','No está vacía'],
  check:   ['Es igual a','No es igual a'],
  upload:  ['No está vacía'],
};

// Sub-type options by question type
const SUBTYPES: Record<string, {value:string;label:string}[]> = {
  p2:  [{ value:'nota',  label:'Nota'  }, { value:'grupo', label:'Grupo' }, { value:'not_empty', label:'No está vacía' }],
  p10: [{ value:'nota',  label:'Nota'  }, { value:'not_empty', label:'No está vacía' }],
  p3:  [{ value:'nota',  label:'Nota'  }, { value:'grupo', label:'Grupo' }, { value:'not_empty', label:'No está vacía' }],
  p4:  [{ value:'text',  label:'Campo texto' }, { value:'number', label:'Campo número' }, { value:'email', label:'Campo correo' }, { value:'date', label:'Campo fecha' }, { value:'url', label:'Campo URL' }],
  p8:  [{ value:'mas',   label:'Más importante' }, { value:'menos', label:'Menos importante' }],
};

function getOperators(row: CondRow): string[] {
  const { subject, variable, subType } = row;
  if (subject === 'variable') {
    const t = VAR_TYPE[variable] || 'text';
    return ops[t as keyof typeof ops] || ops.text;
  }
  // response
  if (variable === 'p1') return ops.open;
  if (variable === 'p2' || variable === 'p10') {
    if (subType === 'nota') return ops.scale;
    if (subType === 'grupo') return ops.group;
    return [];
  }
  if (variable === 'p3') {
    if (subType === 'nota') return ops.scale;
    if (subType === 'grupo') return ops.group;
    return [];
  }
  if (variable === 'p4') {
    if (subType === 'number') return ops.number;
    if (subType === 'date')   return ops.date;
    if (subType === 'email')  return ops.email;
    return ops.text; // text, url
  }
  if (variable === 'p5') return ops.single;
  if (variable === 'p6') return ops.multi;
  if (variable === 'p7') return ops.check;
  if (variable === 'p8') return subType ? ops.single : [];
  if (variable === 'p9') return ops.upload;
  if (variable === 'p11') return ops.single;
  return [];
}

const NO_VALUE_OPS = new Set(['Está vacía','No está vacía','No está vacía']);
const RANGE_OPS    = new Set(['Esta entre','Está entre']);
const LIST_OPS     = new Set(['Está en la lista','No está en la lista','Pertenece a los dominios','No pertenece a los dominios']);
const NUMBER_OPS_SET = new Set(['Es igual a','No es igual a','Es mayor que','Es mayor o igual a','Es menor que','Es menor o igual a']);

function isRowComplete(r: CondRow): boolean {
  if (!r.variable || !r.operator) return false;
  if (NO_VALUE_OPS.has(r.operator)) return true;
  if (RANGE_OPS.has(r.operator)) return r.value.trim() !== '' && r.valueB.trim() !== '';
  return r.value.trim() !== '';
}

// ─── Single condition row ─────────────────────────────────────────────────────

function CondRowUI({ row, onUpdate, onDelete, canDelete }: {
  row: CondRow; onUpdate: (p: Partial<CondRow>) => void;
  onDelete: () => void; canDelete: boolean;
}) {
  const subject   = row.subject || 'response';
  const operators = getOperators(row).map(o => ({ value: o, label: o }));
  const needsSub  = subject === 'response' && row.variable && SUBTYPES[row.variable];
  const isDate    = (subject === 'variable' && VAR_TYPE[row.variable] === 'date') || (row.variable === 'p4' && row.subType === 'date');
  const isNumber  = (subject === 'variable' && VAR_TYPE[row.variable] === 'number') || (row.variable === 'p4' && row.subType === 'number');
  const complete  = isRowComplete(row);

  const inputStyle: React.CSSProperties = { flex: 1, minWidth: 140, borderRadius: 8 };
  const selStyle:   React.CSSProperties = { minWidth: 160, borderRadius: 8 };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: '#bae7ff', borderRadius: '2px 0 0 2px' }} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', padding: 16 }}>

        {/* Subject */}
        <Select
          value={subject}
          onChange={v => onUpdate({ subject: v, variable: '', subType: '', operator: '', value: '', valueB: '' })}
          style={{ width: 180, borderRadius: 8 }}
          options={[{ value: 'response', label: 'La respuesta a' }, { value: 'variable', label: 'La variable' }]}
        />

        {/* Question / variable select */}
        <Select
          value={row.variable || undefined}
          onChange={v => onUpdate({ variable: v, subType: '', operator: '', value: '', valueB: '' })}
          placeholder={subject === 'variable' ? 'Selecciona una variable...' : 'Selecciona una pregunta...'}
          style={{ ...selStyle, flex: 1 }}
          options={subject === 'variable' ? Q_VARIABLE : Q_RESPONSE}
        />

        {/* Sub-type selector (NPS Nota/Grupo, Form field type, MaxDiff, etc.) */}
        {needsSub && (
          <Select
            value={row.subType || undefined}
            onChange={v => {
              // If "No está vacía" selected as subType, it's also the operator
              if (v === 'not_empty') onUpdate({ subType: v, operator: 'No está vacía', value: '', valueB: '' });
              else onUpdate({ subType: v, operator: '', value: '', valueB: '' });
            }}
            placeholder="Evalúa..."
            style={selStyle}
            options={SUBTYPES[row.variable]}
          />
        )}

        {/* Operator — shown when we have enough context */}
        {row.variable && operators.length > 0 && (!needsSub || (row.subType && row.subType !== 'not_empty')) && (
          <Select
            value={row.operator || undefined}
            onChange={v => onUpdate({ operator: v, value: '', valueB: '' })}
            placeholder="Condición..."
            style={selStyle}
            options={operators}
          />
        )}

        {/* Value input(s) — shown when operator needs a value */}
        {row.operator && !NO_VALUE_OPS.has(row.operator) && (
          <>
            {/* Checkbox: radio-style select */}
            {row.variable === 'p7' ? (
              <Select value={row.value || undefined} onChange={v => onUpdate({ value: v })}
                placeholder="Selecciona..." style={selStyle}
                options={[{ value: 'acepto', label: 'Aceptó' }, { value: 'no_acepto', label: 'No aceptó' }]}
              />
            ) : LIST_OPS.has(row.operator) ? (
              <Input value={row.value} onChange={e => onUpdate({ value: e.target.value })}
                placeholder="valor1, valor2..." style={inputStyle} />
            ) : RANGE_OPS.has(row.operator) ? (
              <>
                <Input value={row.value}  onChange={e => onUpdate({ value: e.target.value })}
                  placeholder={isDate ? 'dd-mm-aaaa' : 'Desde'} type={isDate ? 'date' : isNumber ? 'number' : 'text'}
                  style={{ ...inputStyle, flex: 'none', width: 140 }} />
                <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>y</span>
                <Input value={row.valueB} onChange={e => onUpdate({ valueB: e.target.value })}
                  placeholder={isDate ? 'dd-mm-aaaa' : 'Hasta'} type={isDate ? 'date' : isNumber ? 'number' : 'text'}
                  style={{ ...inputStyle, flex: 'none', width: 140 }} />
              </>
            ) : (
              <Input value={row.value} onChange={e => onUpdate({ value: e.target.value })}
                placeholder={isDate ? 'dd-mm-aaaa' : isNumber ? '0' : 'Escribe un valor...'}
                type={isDate ? 'date' : isNumber ? 'number' : 'text'}
                style={inputStyle} />
            )}
          </>
        )}

        {/* Delete */}
        {canDelete && (
          <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#ff4d4f', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <DeleteOutlined style={{ fontSize: 14 }} />
          </button>
        )}
      </div>

      {/* Condición lista */}
      {complete && (
        <div style={{ paddingLeft: 20, paddingBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
          <CheckCircleFilled style={{ color: '#52c41a', fontSize: 12 }} />
          <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: '#52c41a' }}>Condición lista</span>
        </div>
      )}
    </div>
  );
}

// ─── Condition group ──────────────────────────────────────────────────────────

function CondGroupUI({ group, index, onDelete, onUpdateGroup, canDelete }: {
  group: CondGroup; index: number;
  onDelete: () => void;
  onUpdateGroup: (g: CondGroup) => void;
  canDelete: boolean;
}) {
  function updateRow(rowId: string, patch: Partial<CondRow>) {
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
  const [groups, setGroups] = useState<CondGroup[]>([]);

  function addGroup() {
    setGroups(prev => [
      ...prev,
      { id: cuid(), connector: 'Y', rows: [emptyRow()] },
    ]);
  }
  function deleteGroup(gid: string) { setGroups(prev => prev.filter(g => g.id !== gid)); }
  function updateGroup(g: CondGroup) { setGroups(prev => prev.map(x => x.id === g.id ? g : x)); }

  return (
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
