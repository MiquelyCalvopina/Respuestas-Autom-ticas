import { useState } from 'react';
import { Button, DatePicker, Checkbox, Popover, Popconfirm, Alert, Tooltip } from 'antd';
import { BiChevronLeft, BiEnvelope, BiEditAlt, BiTrash, BiPlus, BiCalendar, BiErrorCircle, BiCheckCircle } from 'react-icons/bi';
import dayjs, { Dayjs } from 'dayjs';
import { AutoResponse, EmailTemplate } from './types';
import { makeTemplate } from './data';
import { templateForDate, todayISO, templateState, findConflict, isOnlyPermanent, TemplateStateKind } from './templateResolution';

interface Props {
  rule: AutoResponse;
  onChange: (r: AutoResponse) => void;
  onBack: () => void;
  onEditTemplate: (templateId: string) => void;
}

// Nombre de la plantilla — editable en línea, único lugar del módulo donde se puede
// renombrar una plantilla (antes solo se fijaba una vez al crearla, sin forma de cambiarla).
// Sin ícono de lápiz propio a propósito: la fila ya tiene un botón "Editar" (lápiz) que abre
// el editor de correo — poner un segundo lápiz acá para renombrar generaba confusión sobre
// cuál hacía qué. En su lugar, un subrayado punteado en hover/foco indica que es editable.
function EditableTemplateName({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [active, setActive] = useState(false);
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value.slice(0, 60))}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      maxLength={60}
      style={{
        display: 'block', maxWidth: 280, border: 'none', outline: 'none', background: 'transparent', padding: 0,
        fontFamily: "'Roboto', sans-serif", fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.85)',
        borderBottom: `1px dashed ${active ? '#bfbfbf' : 'transparent'}`, cursor: 'text',
      }}
    />
  );
}

const ACTION_BTN: React.CSSProperties = { width: 32, height: 32, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };

// Encabezado de sección chico (label uppercase + línea) — mismo patrón para agrupar
// "Historial" (plantillas ended: vencidas o reemplazadas) y "Sin programar" (borradores).
function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 10px' }}>
      <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: 0.04, textTransform: 'uppercase', color: 'rgba(0,0,0,0.25)' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
    </div>
  );
}

function fmt(iso: string): string {
  return dayjs(iso).format('D MMM YYYY');
}

// Línea de metadatos de una fila — describe la vigencia en una sola frase, sin nombrar
// ningún "rol" (predeterminada/temporal); la sucesión entre permanentes se explica sola.
// Devuelve un único <span> (no un Fragment) para que, si el contenedor flex de la fila
// necesita envolver la línea, lo haga como una sola unidad de texto — un Fragment deja cada
// hijo (ej. el punto separador) como su propio ítem de flex, capaz de quedar huérfano en su
// propia línea al envolver.
function describeMeta(t: EmailTemplate, templates: EmailTemplate[]): React.ReactNode {
  if (!t.startDate) return 'Sin fecha — no se envía a nadie';
  if (!t.endDate) {
    const nextPermanent = templates
      .filter(x => x.id !== t.id && x.startDate && !x.endDate && x.startDate > t.startDate!)
      .sort((a, b) => a.startDate!.localeCompare(b.startDate!))[0];
    if (nextPermanent) return <span>Hasta {fmt(nextPermanent.startDate!)} · luego: <b>{nextPermanent.name}</b></span>;
    return 'Sin fecha de fin';
  }
  return <span>{fmt(t.startDate)} → {fmt(t.endDate)}</span>;
}

const STATE_CHIP: Record<TemplateStateKind, { bg: string; fg: string }> = {
  now: { bg: '#f6ffed', fg: '#389e0d' },
  scheduled: { bg: '#e6f7ff', fg: '#1890ff' },
  ended: { bg: '#f5f5f5', fg: 'rgba(0,0,0,0.45)' },
  draft: { bg: '#f5f5f5', fg: 'rgba(0,0,0,0.45)' },
};
// Chip separado (no verde) para la permanente que hoy está tapada por una temporal en curso —
// sigue siendo `kind === 'now'` porque retoma sola apenas la temporal termine, pero NO es la
// que se envía hoy. Compartir el verde de "now" con la que sí se envía hacía parecer que había
// dos plantillas vigentes al mismo tiempo.
const STANDBY_CHIP = { bg: '#f5f5f5', fg: 'rgba(0,0,0,0.65)' };

// `isActiveToday` distingue la vigente real de una permanente que sigue de respaldo pero hoy
// está tapada por una temporal en curso — ambas son `kind === 'now'`, pero solo una se envía.
// `templates` solo hace falta para el caso "ended" de una permanente (no tiene su propia
// fecha de fin — hay que encontrar qué otra permanente la reemplazó para explicarlo).
function stateChipText(t: EmailTemplate, templates: EmailTemplate[], kind: TemplateStateKind, isActiveToday: boolean, activeName: string): string {
  if (kind === 'now') return isActiveToday ? 'Se usa ahora' : `De respaldo — hoy se envía: ${activeName}`;
  if (kind === 'scheduled') return `Desde ${fmt(t.startDate!)}`;
  if (kind === 'ended') {
    if (t.endDate) return `Terminó ${fmt(t.endDate)}`;
    // Permanente reemplazada por otra de inicio más reciente — no tiene fecha de fin propia,
    // así que no hay "Terminó [fecha]" que mostrar; se explica con el nombre de la que la reemplazó.
    const successor = templates
      .filter(x => x.id !== t.id && x.startDate && !x.endDate && x.startDate! > t.startDate!)
      .sort((a, b) => a.startDate!.localeCompare(b.startDate!))[0];
    return successor ? `Reemplazada por: ${successor.name}` : 'Reemplazada';
  }
  return 'Sin programar';
}

// Popover de programación — cubre tanto "Programar" (borrador) como "Reprogramar" (vencida).
// Valida en cada cambio contra el resto de plantillas de la regla; si hay cruce, deshabilita
// "Guardar" y explica el motivo exacto en vez de dejarlo pasar.
function SchedulePopover({ template, others, onSave, children }: {
  template: EmailTemplate; others: EmailTemplate[]; onSave: (patch: { startDate: string; endDate: string | null }) => void; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState<Dayjs | null>(template.startDate ? dayjs(template.startDate) : dayjs());
  const [hasEnd, setHasEnd] = useState(!!template.endDate);
  const [end, setEnd] = useState<Dayjs | null>(template.endDate ? dayjs(template.endDate) : null);

  const candidate: EmailTemplate = { ...template, startDate: start?.toISOString() ?? null, endDate: hasEnd ? (end?.toISOString() ?? null) : null };
  const conflict = start ? findConflict(candidate, others) : null;
  const canSave = !!start && (!hasEnd || !!end) && !conflict;

  return (
    <Popover
      trigger="click" placement="bottomRight" open={open} onOpenChange={setOpen}
      content={
        <div style={{ width: 280, fontFamily: "'Roboto', sans-serif" }}>
          <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.85)' }}>{template.startDate ? 'Reprogramar' : 'Programar'} "{template.name}"</p>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>Define cuándo se usa esta plantilla.</p>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 4 }}>Empieza el</label>
            <DatePicker value={start} onChange={setStart} style={{ width: '100%' }} format="D MMM YYYY" allowClear={false} suffixIcon={<BiCalendar />} />
          </div>

          <Checkbox checked={hasEnd} onChange={e => setHasEnd(e.target.checked)}>¿Tiene fecha de fin?</Checkbox>

          {hasEnd && (
            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 4 }}>Termina el</label>
              <DatePicker value={end} onChange={setEnd} style={{ width: '100%' }} format="D MMM YYYY" allowClear={false} suffixIcon={<BiCalendar />} disabledDate={d => !!start && d.isBefore(start, 'day')} />
            </div>
          )}

          {conflict && (
            <Alert
              type="error" showIcon icon={<BiErrorCircle />} style={{ marginTop: 12, fontSize: 13 }}
              message={`Se cruza con "${conflict.name}" (${conflict.endDate ? `${fmt(conflict.startDate!)} → ${fmt(conflict.endDate)}` : `desde ${fmt(conflict.startDate!)}`}).`}
            />
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
            <Button size="small" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              type="primary" size="small" disabled={!canSave}
              onClick={() => { onSave({ startDate: start!.toISOString(), endDate: hasEnd ? (end?.toISOString() ?? null) : null }); setOpen(false); }}
            >
              Guardar
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </Popover>
  );
}

function TemplateRow({ template, rule, onChange, onEditTemplate }: {
  template: EmailTemplate; rule: AutoResponse; onChange: (r: AutoResponse) => void; onEditTemplate: (id: string) => void;
}) {
  const today = todayISO();
  const others = rule.templates.filter(t => t.id !== template.id);
  const kind = templateState(template, rule.templates, today);
  const activeTemplate = templateForDate(rule.templates, today);
  const isActiveToday = activeTemplate.id === template.id;
  const chip = kind === 'now' && !isActiveToday ? STANDBY_CHIP : STATE_CHIP[kind];
  const canDelete = !isOnlyPermanent(template, rule.templates);

  function patchTemplate(patch: Partial<EmailTemplate>) {
    onChange({ ...rule, templates: rule.templates.map(t => t.id === template.id ? { ...t, ...patch } : t) });
  }
  function deleteTemplate() {
    onChange({ ...rule, templates: rule.templates.filter(t => t.id !== template.id) });
  }

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16, borderStyle: kind === 'draft' ? 'dashed' : 'solid' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0px 2px 8px 0px rgba(0,0,0,0.06)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        background: kind === 'ended' ? '#f5f5f5' : kind === 'draft' ? 'transparent' : '#e6f7ff',
        border: kind === 'draft' ? '1px dashed #d9d9d9' : `1px solid ${kind === 'ended' ? '#d9d9d9' : '#91d5ff'}`,
        color: kind === 'ended' ? 'rgba(0,0,0,0.45)' : kind === 'draft' ? 'rgba(0,0,0,0.25)' : '#1890ff',
      }}>
        <BiEnvelope style={{ fontSize: 18 }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <EditableTemplateName value={template.name} onChange={name => patchTemplate({ name })} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontFamily: "'Roboto', sans-serif", fontSize: 12, color: 'rgba(0,0,0,0.45)', marginTop: 2 }}>
          {template.startDate && <BiCalendar style={{ fontSize: 12, flexShrink: 0 }} />}
          {describeMeta(template, rule.templates)}
        </div>
      </div>

      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: chip.bg, color: chip.fg, borderRadius: 16, padding: '4px 8px', fontSize: 12, flexShrink: 0, whiteSpace: 'nowrap' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: chip.fg, flexShrink: 0 }} />
        {stateChipText(template, rule.templates, kind, isActiveToday, activeTemplate.name)}
      </span>

      <div style={{ width: 1, height: 24, background: '#f0f0f0', flexShrink: 0 }} />

      {/* Un solo lenguaje visual para toda acción de esta fila: ícono cuadrado 32×32 con
          borde + title/aria-label nativos (mismo patrón, ya sea Editar/Reprogramar/Hacer
          principal/Eliminar) — antes Reprogramar/Hacer principal eran links de texto sin
          borde mezclados con botones de ícono, lo que se veía inconsistente. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {(kind === 'now' || kind === 'scheduled') && (
          <>
            <Button icon={<BiEditAlt style={{ fontSize: 16 }} />} onClick={() => onEditTemplate(template.id)} aria-label="Editar" title="Editar" style={ACTION_BTN} />
            {/* Antes solo se podía reprogramar una plantilla ended/borrador — una vigente o
                programada no tenía forma de ajustar sus fechas (adelantar/atrasar el fin,
                cambiar el inicio) sin eliminarla y perder su diseño. */}
            <SchedulePopover template={template} others={others} onSave={patch => patchTemplate(patch)}>
              <Button icon={<BiCalendar style={{ fontSize: 16 }} />} aria-label="Reprogramar" title="Reprogramar" style={ACTION_BTN} />
            </SchedulePopover>
          </>
        )}
        {kind === 'ended' && (
          <>
            <SchedulePopover template={template} others={others} onSave={patch => patchTemplate(patch)}>
              <Button icon={<BiCalendar style={{ fontSize: 16 }} />} aria-label="Reprogramar" title="Reprogramar" style={ACTION_BTN} />
            </SchedulePopover>
            <Popconfirm
              title={`¿Usar "${template.name}" ahora?`}
              description={`Reemplaza a "${activeTemplate.name}" de inmediato.`}
              okText="Sí, usar ahora" cancelText="Cancelar"
              onConfirm={() => patchTemplate({ startDate: today, endDate: null })}
            >
              <Button icon={<BiCheckCircle style={{ fontSize: 16 }} />} aria-label="Hacer principal" title="Hacer principal" style={ACTION_BTN} />
            </Popconfirm>
            <Popconfirm title="¿Eliminar esta plantilla?" description="Se perderá su diseño." okText="Sí, eliminar" cancelText="Cancelar" okButtonProps={{ danger: true }} onConfirm={deleteTemplate}>
              <Button danger icon={<BiTrash style={{ fontSize: 16 }} />} aria-label="Eliminar" title="Eliminar" style={ACTION_BTN} />
            </Popconfirm>
          </>
        )}
        {kind === 'draft' && (
          <>
            <Button icon={<BiEditAlt style={{ fontSize: 16 }} />} onClick={() => onEditTemplate(template.id)} aria-label="Editar" title="Editar" style={ACTION_BTN} />
            <SchedulePopover template={template} others={others} onSave={patch => patchTemplate(patch)}>
              <Button icon={<BiCalendar style={{ fontSize: 16 }} />} aria-label="Programar" title="Programar" style={ACTION_BTN} />
            </SchedulePopover>
            <Popconfirm title="¿Eliminar esta plantilla?" description="Se perderá su diseño." okText="Sí, eliminar" cancelText="Cancelar" okButtonProps={{ danger: true }} onConfirm={deleteTemplate}>
              <Button danger icon={<BiTrash style={{ fontSize: 16 }} />} aria-label="Eliminar" title="Eliminar" style={ACTION_BTN} />
            </Popconfirm>
          </>
        )}
        {(kind === 'now' || kind === 'scheduled') && canDelete && (
          <Popconfirm title="¿Eliminar esta plantilla?" description="Se perderá su diseño." okText="Sí, eliminar" cancelText="Cancelar" okButtonProps={{ danger: true }} onConfirm={deleteTemplate}>
            <Button danger icon={<BiTrash style={{ fontSize: 16 }} />} aria-label="Eliminar" title="Eliminar" style={ACTION_BTN} />
          </Popconfirm>
        )}
        {(kind === 'now' || kind === 'scheduled') && !canDelete && (
          <Tooltip title="No se puede eliminar la única plantilla permanente.">
            <Button danger disabled icon={<BiTrash style={{ fontSize: 16 }} />} aria-label="Eliminar" style={ACTION_BTN} />
          </Tooltip>
        )}
      </div>
    </div>
  );
}

export default function TemplatesManagerView({ rule, onChange, onBack, onEditTemplate }: Props) {
  const today = todayISO();
  // Tres grupos, no dos: una plantilla "ended" (vencida o reemplazada) ya tuvo fecha de inicio
  // real y sigue teniendo acciones propias (Reprogramar/Hacer principal), así que NO es lo
  // mismo que un borrador "Sin programar" (nunca tuvo fecha) — pero tampoco debería mezclarse
  // sin distinción con lo que sí está en rotación hoy (vigente/programada), o parece que todas
  // compiten por ser "la que se envía".
  const scheduled = rule.templates.filter(t => t.startDate);
  const inRotation = scheduled.filter(t => templateState(t, rule.templates, today) !== 'ended');
  const historial = scheduled.filter(t => templateState(t, rule.templates, today) === 'ended');
  const drafts = rule.templates.filter(t => !t.startDate);
  const activeTemplate = templateForDate(rule.templates, today);

  function addTemplate() {
    const t = makeTemplate('Nueva plantilla');
    onChange({ ...rule, templates: [...rule.templates, t] });
    onEditTemplate(t.id);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', fontFamily: "'Roboto', sans-serif" }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: '#1890ff', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <BiChevronLeft style={{ fontSize: 16 }} /> Volver al mensaje
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px', maxWidth: 760, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <p style={{ fontSize: 16, fontWeight: 500, color: 'rgba(0,0,0,0.85)', margin: '0 0 4px' }}>Plantillas de correo</p>
        <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', margin: '0 0 16px' }}>
          Se usa "{activeTemplate.name}" hoy, {fmt(today)} — la vigente con la fecha de inicio más reciente.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {inRotation.map(t => (
            <TemplateRow key={t.id} template={t} rule={rule} onChange={onChange} onEditTemplate={onEditTemplate} />
          ))}
        </div>

        {historial.length > 0 && (
          <>
            <SectionHeader label="Historial" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {historial.map(t => (
                <TemplateRow key={t.id} template={t} rule={rule} onChange={onChange} onEditTemplate={onEditTemplate} />
              ))}
            </div>
          </>
        )}

        {drafts.length > 0 && (
          <>
            <SectionHeader label="Sin programar" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {drafts.map(t => (
                <TemplateRow key={t.id} template={t} rule={rule} onChange={onChange} onEditTemplate={onEditTemplate} />
              ))}
            </div>
          </>
        )}

        <button
          onClick={addTemplate}
          style={{ width: '100%', marginTop: 10, padding: 10, border: '1px dashed #d9d9d9', borderRadius: 8, background: '#fff', color: '#1890ff', fontFamily: "'Roboto', sans-serif", fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <BiPlus /> Nueva plantilla
        </button>
      </div>
    </div>
  );
}
