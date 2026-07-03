import { useState, useRef, useEffect } from 'react';
import {
  App, Button, Input, Card, Typography, Divider, Switch, Tag,
  InputNumber, Radio, Checkbox, Tooltip, Segmented, Modal,
} from 'antd';
import {
  SendOutlined, CopyOutlined, CloseOutlined, PlusOutlined, BoldOutlined, AlignLeftOutlined,
  AlignCenterOutlined, AlignRightOutlined, MinusOutlined, FileTextOutlined, UnorderedListOutlined,
  ThunderboltOutlined, HolderOutlined, TableOutlined, PictureOutlined, LinkOutlined,
  ColumnHeightOutlined, ShareAltOutlined,
} from '@ant-design/icons';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CodeMirror from '@uiw/react-codemirror';
import { html as htmlLang } from '@codemirror/lang-html';
import {
  AutoResponse, Row, RowDesign, Component, ComponentType, ComponentDesign,
  AiBlock, TextBlock, TitleBlock, HeaderBlock, ResponsesBlock, FooterBlock,
  ImageComponent, ButtonComponent, SpacerComponent, SocialComponent, SocialNetworkKey, Tone,
} from './types';
import { VARIABLES, PREGUNTAS, TONO_LABELS, HEADER_COLORS, DEFAULT_RESTRICTIONS, SETUP, mockGenerateAiText, countComponents } from './data';
import { cuid } from './cuid';
import TestModal from './TestModal';

const { Text } = Typography;
const { TextArea } = Input;

interface Props {
  rule: AutoResponse;
  onChange: (r: AutoResponse) => void;
  onBack: () => void;
}

// ─── Construcción de filas/columnas/componentes ───────────────────────────────

const DEFAULT_COMPONENT_DESIGN: ComponentDesign = {
  paddingTop: 16, paddingBottom: 16, paddingLeft: 0, paddingRight: 0,
  textAlign: 'left', bgColor: 'transparent',
  borderStyle: 'none', borderWidth: 0, borderColor: '#000000', hideMobile: false,
};

function makeComponent(type: ComponentType): Component {
  const design = { ...DEFAULT_COMPONENT_DESIGN };
  const id = cuid();
  switch (type) {
    case 'header':    return { id, type, name: 'HIR Casa', bgColor: '#1890ff', design };
    case 'title':     return { id, type, text: 'Tu opinión importa', design };
    case 'text':      return { id, type, content: 'Hola {{nombre_preferido}},\n\nGracias por tomarte el tiempo de responder nuestra encuesta.', design };
    case 'ai':        return { id, type, objetivo: '', tone: 'empatico' as Tone, customTone: '', datoPriorizar: '', restricciones: [...DEFAULT_RESTRICTIONS], generatedText: '', design };
    case 'responses': return { id, type, questions: PREGUNTAS.map(q => ({ questionId: q.id, included: true, showStatement: true, showOnlyAnswer: false })), displayStyle: 'bold-indented', design };
    case 'divider':   return { id, type, design };
    case 'footer':    return { id, type, text: 'Para darte de baja, responde a este correo con el asunto "Baja".\n\n© HIR Casa · Ciudad de México', design };
    case 'image':     return { id, type, src: '', alt: '', dynamic: false, widthPercent: 100, design };
    case 'button':    return { id, type, text: 'Responder estudio', url: '', bgColor: '#1890ff', textColor: '#ffffff', design };
    case 'spacer':    return { id, type, height: 24 };
    case 'social':    return { id, type, networks: [], design };
    default: return { id, type: 'divider', design };
  }
}

function makeRow(widths: number[]): Row {
  return {
    id: cuid(),
    columns: widths.map(w => ({ id: cuid(), widthPercent: w, components: [] })),
    design: { bgColor: 'transparent', paddingTop: 16, paddingBottom: 16, paddingLeft: 0, paddingRight: 0, widthPercent: 100, boxed: true, borderStyle: 'none', borderWidth: 0, borderColor: '#000000', hideMobile: false },
  };
}
function makeSingleComponentRow(type: ComponentType): Row {
  const row = makeRow([100]);
  row.columns[0].components.push(makeComponent(type));
  return row;
}
function cloneRow(row: Row): Row {
  return { ...row, id: cuid(), columns: row.columns.map(c => ({ ...c, id: cuid(), components: c.components.map(comp => ({ ...comp, id: cuid() })) })) };
}

const COLUMN_LAYOUTS: { label: string; widths: number[] }[] = [
  { label: '100%', widths: [100] },
  { label: '50/50', widths: [50, 50] },
  { label: '33/33/33', widths: [33.34, 33.33, 33.33] },
  { label: '25/75', widths: [25, 75] },
  { label: '75/25', widths: [75, 25] },
  { label: '25×4', widths: [25, 25, 25, 25] },
];

const COMPONENT_PALETTE: { type: ComponentType; label: string; sub: string; icon: React.ReactNode; violet?: boolean }[] = [
  { type: 'header', label: 'Header de marca', sub: 'Logo y color corporativo', icon: <BoldOutlined /> },
  { type: 'title', label: 'Título', sub: 'Texto grande destacado', icon: 'T' },
  { type: 'text', label: 'Texto', sub: 'Con variables del encuestado', icon: <AlignLeftOutlined /> },
  { type: 'image', label: 'Imagen', sub: 'Estática o dinámica', icon: <PictureOutlined /> },
  { type: 'button', label: 'Botón', sub: 'Llamado a la acción', icon: <LinkOutlined /> },
  { type: 'divider', label: 'Divisor', sub: 'Línea separadora', icon: <MinusOutlined /> },
  { type: 'spacer', label: 'Espaciador', sub: 'Espacio en blanco', icon: <ColumnHeightOutlined /> },
  { type: 'social', label: 'Redes Sociales', sub: 'Íconos con enlaces', icon: <ShareAltOutlined /> },
  { type: 'ai', label: 'Bloque IA', sub: 'Texto único por encuestado', icon: '✦', violet: true },
  { type: 'responses', label: 'Bloque de respuestas', sub: 'Las respuestas del encuestado', icon: <UnorderedListOutlined /> },
  { type: 'footer', label: 'Footer legal', sub: 'Texto legal + baja', icon: <FileTextOutlined /> },
];

const SOCIAL_ICONS: Record<SocialNetworkKey, string> = { facebook: '📘', instagram: '📷', x: '✖️', linkedin: '💼', whatsapp: '💬' };
const SOCIAL_LABELS: Record<SocialNetworkKey, string> = { facebook: 'Facebook', instagram: 'Instagram', x: 'X (Twitter)', linkedin: 'LinkedIn', whatsapp: 'WhatsApp' };
const SOCIAL_KEYS: SocialNetworkKey[] = ['facebook', 'instagram', 'x', 'linkedin', 'whatsapp'];

function renderVars(text: string) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, v) =>
    `<span style="background:#e6f7ff;color:#1890ff;font-family:'JetBrains Mono',monospace;font-size:11px;padding:1px 5px;border-radius:3px;">{{${v}}}</span>`
  );
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'Nunca';
  const d = new Date(iso);
  return `${d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })} ${d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
}

function componentToHtml(c: Component): string {
  const d = c.type === 'spacer' ? undefined : c.design;
  const style = d ? `padding:${d.paddingTop}px ${d.paddingRight ?? 0}px ${d.paddingBottom}px ${d.paddingLeft ?? 0}px;text-align:${d.textAlign};${d.bgColor !== 'transparent' ? `background:${d.bgColor};` : ''}` : '';
  switch (c.type) {
    case 'header':    return `<div style="${style}background:${c.bgColor};text-align:center;"><span style="font-weight:700;font-size:22px;color:#fff;">${c.name}</span></div>`;
    case 'title':     return `<div style="${style}"><h2 style="font-weight:700;font-size:21px;color:#000;margin:0;">${c.text}</h2></div>`;
    case 'text':      return `<div style="${style}"><p style="font-size:13.5px;line-height:1.75;color:#333;white-space:pre-line;margin:0;">${c.content}</p></div>`;
    case 'ai':        return `<div style="${style}"><p style="font-size:13px;line-height:1.7;color:#4C1D95;font-style:italic;margin:0;">${c.generatedText || '[Texto generado pendiente — envía una prueba]'}</p></div>`;
    case 'responses': return `<div style="${style}"><p style="font-size:12px;color:#666;">[Bloque de respuestas del encuestado]</p></div>`;
    case 'divider':   return `<hr style="margin:${d?.paddingTop ?? 0}px 26px ${d?.paddingBottom ?? 0}px;" />`;
    case 'footer':    return `<div style="${style}"><p style="font-size:11.5px;color:#999;text-align:center;white-space:pre-line;margin:0;">${c.text}</p></div>`;
    case 'image':     return `<div style="${style}text-align:center;">${c.src ? `<img src="${c.src}" alt="${c.alt}" style="width:${c.widthPercent}%;" />` : ''}</div>`;
    case 'button':    return `<div style="${style}text-align:center;"><a href="${c.url}" style="display:inline-block;padding:10px 24px;border-radius:6px;background:${c.bgColor};color:${c.textColor};font-weight:600;text-decoration:none;">${c.text}</a></div>`;
    case 'spacer':    return `<div style="height:${c.height}px;"></div>`;
    case 'social':    return `<div style="${style}text-align:center;">${c.networks.map(n => `<a href="${n.url}" style="margin:0 6px;">${SOCIAL_LABELS[n.network]}</a>`).join('')}</div>`;
    default: return '';
  }
}
function renderRowsToHtml(rows: Row[]): string {
  return rows.map(r => {
    const d = r.design;
    const style = `padding:${d.paddingTop}px ${d.paddingRight ?? 0}px ${d.paddingBottom}px ${d.paddingLeft ?? 0}px;${d.bgColor !== 'transparent' ? `background:${d.bgColor};` : ''}`;
    const cols = r.columns.map(c => `<td style="width:${c.widthPercent}%;vertical-align:top;">${c.components.map(componentToHtml).join('')}</td>`).join('');
    return `<table role="presentation" width="100%" style="${style}"><tr>${cols}</tr></table>`;
  }).join('\n');
}

// ─── Overlay de acciones (drag + insertar + duplicar + eliminar) ─────────────

function ToolbarBtn({ icon, onClick, title }: { icon: React.ReactNode; onClick: (e: React.MouseEvent) => void; title: string }) {
  return (
    <Tooltip title={title}>
      <Button type="text" size="small" onClick={e => { e.stopPropagation(); onClick(e); }} style={{ height: 22, width: 22, padding: 0, minWidth: 0 }}>
        {icon}
      </Button>
    </Tooltip>
  );
}

function ActionOverlay({ dragHandleRef, onInsertAfter, onDuplicate, onRemove }: {
  dragHandleRef: React.Ref<HTMLDivElement>;
  onInsertAfter: () => void; onDuplicate: () => void; onRemove: () => void;
}) {
  return (
    <div className="blk-toolbar" style={{ transition: 'opacity .15s', position: 'absolute', top: -32, right: 0, zIndex: 5, display: 'flex', gap: 2, background: 'rgba(0,0,0,.75)', borderRadius: 4, padding: '2px 4px' }}>
      <div ref={dragHandleRef} style={{ height: 22, width: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab' }}>
        <HolderOutlined style={{ color: 'white', fontSize: 10 }} />
      </div>
      <ToolbarBtn title="Insertar debajo" icon={<PlusOutlined style={{ color: 'white', fontSize: 10 }} />} onClick={onInsertAfter} />
      <ToolbarBtn title="Duplicar" icon={<CopyOutlined style={{ color: 'white', fontSize: 10 }} />} onClick={onDuplicate} />
      <ToolbarBtn title="Eliminar" icon={<CloseOutlined style={{ color: 'white', fontSize: 10 }} />} onClick={onRemove} />
    </div>
  );
}

// ─── Componente en el canvas ──────────────────────────────────────────────────

const ROW_ITEM = 'row-item';
const COMPONENT_ITEM = 'component-item';

function renderComponentContent(component: Component): React.ReactNode {
  const align = component.type === 'spacer' ? 'left' : component.design.textAlign;
  if (component.type === 'header') {
    return (
      <div style={{ background: component.bgColor, padding: '20px 32px', textAlign: 'center' }}>
        <span style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 700, fontSize: 22, color: '#fff', letterSpacing: -0.5 }}>{component.name}</span>
      </div>
    );
  }
  if (component.type === 'title') {
    return <p style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 700, fontSize: 21, color: 'rgba(0,0,0,.85)', letterSpacing: -0.5, padding: '0 32px', margin: 0, textAlign: align }} dangerouslySetInnerHTML={{ __html: renderVars(component.text) }} />;
  }
  if (component.type === 'text') {
    return <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 13.5, lineHeight: 1.75, color: 'rgba(0,0,0,.65)', padding: '0 32px', margin: 0, whiteSpace: 'pre-line', textAlign: align }} dangerouslySetInnerHTML={{ __html: renderVars(component.content) }} />;
  }
  if (component.type === 'ai') {
    const configured = component.objetivo.trim() !== '';
    return (
      <div style={{ border: '1.5px solid var(--ds-violet-mid)', borderRadius: 8, background: 'var(--ds-violet-bg)', margin: '0 32px', padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Tag color="purple" icon={<ThunderboltOutlined />} style={{ fontWeight: 600 }}>IA</Tag>
          <Text style={{ fontSize: 11, color: 'var(--ds-violet-dark)' }}>
            {configured ? `Tono: ${TONO_LABELS[component.tone]?.label ?? component.tone} · ${component.generatedText ? 'Generado' : 'Pendiente'}` : 'Sin configurar — selecciona para configurar'}
          </Text>
        </div>
        {!configured ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <p style={{ fontSize: 28, margin: '0 0 4px' }}>✦</p>
            <Text strong style={{ display: 'block', color: 'var(--ds-violet-dark)' }}>Bloque IA sin objetivo</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>Define el objetivo en el panel de configuración.</Text>
          </div>
        ) : (
          <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 13, lineHeight: 1.7, color: 'var(--ds-violet-dark)', fontStyle: 'italic', margin: 0 }}>
            {component.generatedText || 'Usa "Enviar prueba" para ver el texto real.'}
          </p>
        )}
      </div>
    );
  }
  if (component.type === 'responses') {
    const included = PREGUNTAS.filter(q => component.questions.find(bq => bq.questionId === q.id && bq.included));
    return (
      <div style={{ margin: '0 32px', border: '1px solid #f0f0f0', borderRadius: 8, background: '#fafafa', padding: '14px 16px' }}>
        <Text type="secondary" style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>TUS RESPUESTAS</Text>
        {included.map((q, i) => (
          <div key={q.id} style={{ marginBottom: i < included.length - 1 ? 10 : 0 }}>
            <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 2 }}>{q.texto}</Text>
            <p style={{ fontSize: 12.5, color: 'rgba(0,0,0,.65)', margin: 0, paddingLeft: 11, borderLeft: '2.5px solid #d9d9d9' }}>
              {q.tipo === 'NPS' ? '7' : q.tipo === 'CSAT' ? '★★★★☆' : q.tipo === 'seleccion_simple' ? 'Quito Norte' : 'El proceso fue satisfactorio.'}
            </p>
          </div>
        ))}
      </div>
    );
  }
  if (component.type === 'divider') return <Divider style={{ margin: '0 26px', minWidth: 'auto', width: 'auto' }} />;
  if (component.type === 'footer') {
    return <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 11.5, color: 'rgba(0,0,0,.35)', textAlign: 'center', padding: '13px 32px', margin: 0, background: '#fafafa', whiteSpace: 'pre-line' }}>{component.text}</p>;
  }
  if (component.type === 'image') {
    return component.src ? (
      <div style={{ padding: '0 32px', textAlign: 'center' }}>
        <img src={component.src} alt={component.alt} style={{ width: `${component.widthPercent}%`, display: 'inline-block' }} />
      </div>
    ) : (
      <div style={{ margin: '0 32px', padding: '32px', textAlign: 'center', color: '#bfbfbf', border: '1px dashed #d9d9d9', borderRadius: 8 }}>
        <PictureOutlined style={{ fontSize: 24 }} />
        <div style={{ fontSize: 12, marginTop: 4 }}>Sin imagen — define la URL en Configuración</div>
      </div>
    );
  }
  if (component.type === 'button') {
    return (
      <div style={{ textAlign: 'center', padding: '8px 32px' }}>
        <span style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 6, background: component.bgColor, color: component.textColor, fontWeight: 600, fontSize: 14 }}>{component.text}</span>
      </div>
    );
  }
  if (component.type === 'spacer') return <div style={{ height: component.height }} />;
  if (component.type === 'social') {
    return (
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', padding: '8px 32px', fontSize: 20 }}>
        {component.networks.length === 0
          ? <Text type="secondary" style={{ fontSize: 12 }}>Sin redes configuradas</Text>
          : component.networks.map(n => <span key={n.network} title={SOCIAL_LABELS[n.network]}>{SOCIAL_ICONS[n.network]}</span>)}
      </div>
    );
  }
  return null;
}

function ComponentBox({ component, index, columnId, selected, onSelect, onRemove, onDuplicate, onInsertAfter, moveComponent }: {
  component: Component; index: number; columnId: string; selected: boolean;
  onSelect: () => void; onRemove: () => void; onDuplicate: () => void; onInsertAfter: () => void;
  moveComponent: (from: number, to: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: COMPONENT_ITEM,
    hover(item: { index: number; columnId: string }, monitor) {
      if (item.columnId !== columnId || !ref.current) return;
      const dragIndex = item.index, hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      const rect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (rect.bottom - rect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset?.y ?? 0) - rect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      moveComponent(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: COMPONENT_ITEM,
    item: () => ({ index, columnId }),
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  });
  drag(handleRef);
  drop(ref);

  const d = component.type === 'spacer' ? undefined : component.design;
  const pad = d ? { paddingTop: d.paddingTop, paddingBottom: d.paddingBottom, paddingLeft: d.paddingLeft ?? 0, paddingRight: d.paddingRight ?? 0 } : {};
  const bg = d && d.bgColor !== 'transparent' ? d.bgColor : undefined;
  const border = d && d.borderStyle && d.borderStyle !== 'none' && (d.borderWidth ?? 0) > 0 ? `${d.borderWidth}px ${d.borderStyle} ${d.borderColor ?? '#000'}` : undefined;

  return (
    <div
      ref={ref}
      style={{ position: 'relative', opacity: isDragging ? 0.4 : 1 }}
      onMouseEnter={e => { const t = e.currentTarget.querySelector<HTMLElement>('.blk-toolbar'); if (t) t.style.opacity = '1'; }}
      onMouseLeave={e => { const t = e.currentTarget.querySelector<HTMLElement>('.blk-toolbar'); if (t && !selected) t.style.opacity = '0'; }}
    >
      <div style={{ opacity: selected ? 1 : 0 }}>
        <ActionOverlay dragHandleRef={handleRef} onInsertAfter={onInsertAfter} onDuplicate={onDuplicate} onRemove={onRemove} />
      </div>
      <div
        onClick={onSelect}
        style={{ cursor: 'pointer', ...pad, background: bg, border, outline: selected ? '2px solid #1890ff' : '2px solid transparent', outlineOffset: -1, transition: 'outline .1s' }}
      >
        {renderComponentContent(component)}
      </div>
    </div>
  );
}

// ─── Columna vacía — mini paleta para llenarla sin pasar por el sidebar ──────

function EmptyColumnSlot({ onAdd }: { onAdd: (type: ComponentType) => void }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [open]);
  return (
    <div ref={wrapRef} style={{ position: 'relative', margin: '4px 8px' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', border: '1px dashed #d9d9d9', borderRadius: 6, padding: '14px 0', background: '#fafafa', cursor: 'pointer', color: '#8c8c8c', fontSize: 12 }}>
        <PlusOutlined style={{ marginRight: 4 }} /> Agregar
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 25, background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,.12)', padding: 6, width: 190, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {COMPONENT_PALETTE.map(item => (
            <button key={item.type} onClick={() => { onAdd(item.type); setOpen(false); }} style={{ textAlign: 'left', padding: '5px 8px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, borderRadius: 4 }}>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Fila en el canvas ────────────────────────────────────────────────────────

function RowBox({ row, index, selected, onSelectRow, selectedComponentId, onSelectComponent, onRemoveRow, onDuplicateRow, onInsertRowAfter, moveRow, moveComponentInColumn, onAddComponentToColumn, removeComponent, duplicateComponent, insertComponentAfter }: {
  row: Row; index: number; selected: boolean;
  onSelectRow: () => void;
  selectedComponentId: string | null;
  onSelectComponent: (columnId: string, componentId: string) => void;
  onRemoveRow: () => void; onDuplicateRow: () => void; onInsertRowAfter: () => void;
  moveRow: (from: number, to: number) => void;
  moveComponentInColumn: (columnId: string, from: number, to: number) => void;
  onAddComponentToColumn: (type: ComponentType, columnId: string) => void;
  removeComponent: (columnId: string, componentId: string) => void;
  duplicateComponent: (columnId: string, componentId: string) => void;
  insertComponentAfter: (columnId: string, atIndex: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: ROW_ITEM,
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index, hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      const rect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (rect.bottom - rect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset?.y ?? 0) - rect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: ROW_ITEM,
    item: () => ({ index }),
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  });
  drag(handleRef);
  drop(ref);

  const d = row.design;
  const pad = { paddingTop: d.paddingTop, paddingBottom: d.paddingBottom, paddingLeft: d.paddingLeft ?? 0, paddingRight: d.paddingRight ?? 0 };
  const bg = d.bgColor !== 'transparent' ? d.bgColor : undefined;
  const border = d.borderStyle && d.borderStyle !== 'none' && (d.borderWidth ?? 0) > 0 ? `${d.borderWidth}px ${d.borderStyle} ${d.borderColor ?? '#000'}` : undefined;
  const widthPercent = d.widthPercent ?? 100;
  const boxed = d.boxed ?? true;

  return (
    <div
      ref={ref}
      style={{ position: 'relative', opacity: isDragging ? 0.4 : 1 }}
      onMouseEnter={e => { const t = e.currentTarget.querySelector<HTMLElement>(':scope > .blk-toolbar'); if (t) t.style.opacity = '1'; }}
      onMouseLeave={e => { const t = e.currentTarget.querySelector<HTMLElement>(':scope > .blk-toolbar'); if (t && !selected) t.style.opacity = '0'; }}
    >
      <div style={{ opacity: selected ? 1 : 0 }}>
        <ActionOverlay dragHandleRef={handleRef} onInsertAfter={onInsertRowAfter} onDuplicate={onDuplicateRow} onRemove={onRemoveRow} />
      </div>
      <div
        onClick={onSelectRow}
        style={{ cursor: 'pointer', ...pad, background: bg, border, outline: selected ? '2px solid #1890ff' : '2px solid transparent', outlineOffset: -1, transition: 'outline .1s' }}
      >
        <div style={{ width: `${widthPercent}%`, margin: boxed ? '0 auto' : '0', display: 'flex', gap: 8 }}>
          {row.columns.map(col => (
            <div key={col.id} style={{ width: `${col.widthPercent}%`, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              {col.components.length === 0 ? (
                <EmptyColumnSlot onAdd={type => onAddComponentToColumn(type, col.id)} />
              ) : (
                col.components.map((comp, i) => (
                  <ComponentBox
                    key={comp.id} component={comp} index={i} columnId={col.id}
                    selected={selectedComponentId === comp.id}
                    onSelect={() => onSelectComponent(col.id, comp.id)}
                    onRemove={() => removeComponent(col.id, comp.id)}
                    onDuplicate={() => duplicateComponent(col.id, comp.id)}
                    onInsertAfter={() => insertComponentAfter(col.id, i)}
                    moveComponent={(from, to) => moveComponentInColumn(col.id, from, to)}
                  />
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Paleta ────────────────────────────────────────────────────────────────────

function PaletteItem({ icon, label, sub, onClick, violet }: { icon: React.ReactNode; label: string; sub: string; onClick: () => void; violet?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '14px 8px', cursor: 'pointer', textAlign: 'center',
        border: `1px solid ${violet ? 'var(--ds-violet-mid)' : '#d9d9d9'}`,
        borderRadius: 8,
        background: violet ? 'var(--ds-violet-bg)' : '#fff',
      }}
    >
      <span style={{ fontSize: 20, color: violet ? 'var(--ds-violet)' : 'rgba(0,0,0,.45)' }}>{icon}</span>
      <div style={{ fontWeight: 500, fontSize: 11, color: violet ? 'var(--ds-violet-dark)' : 'rgba(0,0,0,.85)', lineHeight: 1.3 }}>{label}</div>
      <div style={{ fontSize: 9, color: 'rgba(0,0,0,.45)', lineHeight: 1.3 }}>{sub}</div>
    </button>
  );
}

function ColumnLayoutPicker({ onPick, onClose }: { onPick: (widths: number[]) => void; onClose: () => void }) {
  return (
    <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 10, marginBottom: 10, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text type="secondary" style={{ fontSize: 11 }}>Elige un layout de columnas</Text>
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'rgba(0,0,0,.45)' }}>✕</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {COLUMN_LAYOUTS.map(l => (
          <button key={l.label} onClick={() => onPick(l.widths)} title={l.label} style={{ display: 'flex', gap: 2, border: '1px solid #d9d9d9', borderRadius: 6, padding: 6, cursor: 'pointer', background: '#fff' }}>
            {l.widths.map((w, i) => <div key={i} style={{ flex: w, height: 24, background: '#e6f4ff', borderRadius: 2 }} />)}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Selector de color propio (nunca la ventana nativa del SO) ───────────────

const COLOR_PRESETS = ['#1890ff', '#7C3AED', '#059669', '#DC2626', '#0F172A', '#D97706', '#0D9488', '#ffffff', '#000000', '#f5f5f5'];

function ColorPickerField({ value, onChange, allowTransparent }: { value: string; onChange: (c: string) => void; allowTransparent?: boolean }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [open]);

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: 30, height: 26, borderRadius: 4, border: '1px solid #d9d9d9', cursor: 'pointer', padding: 0,
          background: value === 'transparent'
            ? 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 8px 8px'
            : value,
        }}
      />
      {open && (
        <div style={{ position: 'absolute', top: 30, left: 0, zIndex: 30, background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,.12)', padding: 10, width: 180 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 8 }}>
            {COLOR_PRESETS.map(c => (
              <button
                key={c} type="button" onClick={() => { onChange(c); setOpen(false); }}
                style={{ width: 24, height: 24, borderRadius: 4, background: c, border: '1px solid #f0f0f0', cursor: 'pointer', padding: 0 }}
              />
            ))}
          </div>
          <Input
            size="small" placeholder="#RRGGBB"
            value={value === 'transparent' ? '' : value}
            onChange={e => onChange(e.target.value)}
          />
          {allowTransparent && (
            <Button size="small" block style={{ marginTop: 6 }} onClick={() => { onChange('transparent'); setOpen(false); }}>
              Transparente
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Campos compartidos de diseño (fila / componente) ────────────────────────

function FieldLabel({ children, inline }: { children: React.ReactNode; inline?: boolean }) {
  return <Text type="secondary" style={{ fontSize: 11, display: inline ? 'inline' : 'block', marginBottom: inline ? 0 : 3 }}>{children}</Text>;
}
function PaddingField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 2 }}>{label}</Text>
      <InputNumber size="small" value={value} onChange={v => onChange(v ?? 0)} style={{ width: '100%' }} min={0} />
    </div>
  );
}
function BorderFields({ borderColor, borderWidth, borderStyle, onUpdate }: {
  borderColor: string; borderWidth: number; borderStyle: 'solid' | 'dotted' | 'none';
  onUpdate: (p: { borderColor?: string; borderWidth?: number; borderStyle?: 'solid' | 'dotted' | 'none' }) => void;
}) {
  return (
    <div>
      <FieldLabel>Borde</FieldLabel>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <ColorPickerField value={borderColor} onChange={c => onUpdate({ borderColor: c })} />
        <InputNumber size="small" min={0} value={borderWidth} onChange={v => onUpdate({ borderWidth: v ?? 0 })} style={{ width: 56 }} addonAfter="px" />
        <Radio.Group size="small" value={borderStyle} onChange={e => onUpdate({ borderStyle: e.target.value })}>
          <Radio.Button value="solid">Sólido</Radio.Button>
          <Radio.Button value="dotted">Punteado</Radio.Button>
          <Radio.Button value="none">Ninguno</Radio.Button>
        </Radio.Group>
      </div>
    </div>
  );
}
function PaddingGrid({ design, onUpdate }: { design: { paddingTop: number; paddingBottom: number; paddingLeft?: number; paddingRight?: number }; onUpdate: (p: object) => void }) {
  return (
    <div>
      <FieldLabel>Relleno</FieldLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <PaddingField label="Arriba" value={design.paddingTop} onChange={v => onUpdate({ paddingTop: v })} />
        <PaddingField label="Abajo" value={design.paddingBottom} onChange={v => onUpdate({ paddingBottom: v })} />
        <PaddingField label="Izquierda" value={design.paddingLeft ?? 0} onChange={v => onUpdate({ paddingLeft: v })} />
        <PaddingField label="Derecha" value={design.paddingRight ?? 0} onChange={v => onUpdate({ paddingRight: v })} />
      </div>
    </div>
  );
}

// Tab "Configuración" para una FILA seleccionada
function RowConfigFields({ design, onUpdate }: { design: RowDesign; onUpdate: (p: Partial<RowDesign>) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel>Ancho del contenido</FieldLabel>
          <InputNumber size="small" value={design.widthPercent ?? 100} min={10} max={100} addonAfter="%" onChange={v => onUpdate({ widthPercent: v ?? 100 })} style={{ width: '100%' }} />
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>Estilo del contenedor</FieldLabel>
          <Radio.Group size="small" value={design.boxed ?? true} onChange={e => onUpdate({ boxed: e.target.value })} style={{ display: 'flex' }}>
            <Tooltip title="Con margen"><Radio.Button value={true} style={{ flex: 1, textAlign: 'center' }}>▢</Radio.Button></Tooltip>
            <Tooltip title="Ancho completo"><Radio.Button value={false} style={{ flex: 1, textAlign: 'center' }}>▭</Radio.Button></Tooltip>
          </Radio.Group>
        </div>
      </div>
      <div>
        <FieldLabel>Color de fondo</FieldLabel>
        <ColorPickerField value={design.bgColor} onChange={c => onUpdate({ bgColor: c })} allowTransparent />
      </div>
    </div>
  );
}
// Tab "Diseño" para una FILA seleccionada
function RowDesignFields({ design, onUpdate }: { design: RowDesign; onUpdate: (p: Partial<RowDesign>) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <BorderFields borderColor={design.borderColor ?? '#000000'} borderWidth={design.borderWidth ?? 0} borderStyle={design.borderStyle ?? 'none'} onUpdate={onUpdate} />
      <PaddingGrid design={design} onUpdate={onUpdate} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FieldLabel inline>Ocultar en móvil</FieldLabel>
        <Switch size="small" checked={design.hideMobile ?? false} onChange={v => onUpdate({ hideMobile: v })} />
      </div>
    </div>
  );
}
// Tab "Diseño" para un COMPONENTE seleccionado
function ComponentDesignFields({ design, onUpdate }: { design: ComponentDesign; onUpdate: (p: Partial<ComponentDesign>) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <FieldLabel>Color de fondo</FieldLabel>
        <ColorPickerField value={design.bgColor} onChange={c => onUpdate({ bgColor: c })} allowTransparent />
      </div>
      <div>
        <FieldLabel>Alineación</FieldLabel>
        <Radio.Group size="small" value={design.textAlign} onChange={e => onUpdate({ textAlign: e.target.value })}>
          <Radio.Button value="left"><AlignLeftOutlined /></Radio.Button>
          <Radio.Button value="center"><AlignCenterOutlined /></Radio.Button>
          <Radio.Button value="right"><AlignRightOutlined /></Radio.Button>
        </Radio.Group>
      </div>
      <BorderFields borderColor={design.borderColor ?? '#000000'} borderWidth={design.borderWidth ?? 0} borderStyle={design.borderStyle ?? 'none'} onUpdate={onUpdate} />
      <PaddingGrid design={design} onUpdate={onUpdate} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FieldLabel inline>Ocultar en móvil</FieldLabel>
        <Switch size="small" checked={design.hideMobile ?? false} onChange={v => onUpdate({ hideMobile: v })} />
      </div>
    </div>
  );
}

// ─── Campos de contenido por tipo de componente (tab "Configuración") ────────

function TextContentFields({ block, onUpdate }: { block: TextBlock; onUpdate: (b: Component) => void }) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <FieldLabel>Contenido</FieldLabel>
        <TextArea ref={taRef} rows={4} value={block.content} onChange={e => onUpdate({ ...block, content: e.target.value })} />
      </div>
      <div>
        <FieldLabel>Insertar variable</FieldLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {VARIABLES.map(v => (
            <Tag key={v} style={{ cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }} color="blue" onClick={() => {
              const ta = taRef.current;
              const tag = `{{${v}}}`;
              if (!ta) { onUpdate({ ...block, content: block.content + tag }); return; }
              const s = ta.selectionStart, e2 = ta.selectionEnd;
              const nc = block.content.slice(0, s) + tag + block.content.slice(e2);
              onUpdate({ ...block, content: nc });
              setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + tag.length; }, 0);
            }}>
              {`{{${v}}}`}
            </Tag>
          ))}
        </div>
        <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 4 }}>Se reemplaza con el dato real al enviarse.</Text>
      </div>
    </div>
  );
}
function AiContentFields({ block, onUpdate }: { block: AiBlock; onUpdate: (b: Component) => void }) {
  const [newRestr, setNewRestr] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ padding: '7px 10px', borderRadius: 6, background: 'var(--ds-violet-bg)', border: '1px solid var(--ds-violet-mid)' }}>
        <Text style={{ fontSize: 11, color: 'var(--ds-violet-dark)' }}>
          ✦ Usa como contexto: <strong>{SETUP.empresa}</strong> · {SETUP.industria}
        </Text>
      </div>
      <div>
        <FieldLabel>¿Qué debe lograr este bloque? *</FieldLabel>
        <TextArea rows={3} value={block.objetivo} onChange={e => onUpdate({ ...block, objetivo: e.target.value })} placeholder="Ej: Que el cliente sienta que su queja fue escuchada…" />
        <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 2 }}>La IA genera texto único usando la respuesta real como contexto.</Text>
      </div>
      <div>
        <FieldLabel>Tono del mensaje</FieldLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {Object.entries(TONO_LABELS).map(([k, v]) => (
            <Card
              key={k} size="small" hoverable onClick={() => onUpdate({ ...block, tone: k as Tone })}
              style={{ cursor: 'pointer', borderColor: block.tone === k ? 'var(--ds-violet)' : '#d9d9d9', background: block.tone === k ? 'var(--ds-violet-bg)' : '#fff' }}
              styles={{ body: { padding: '6px 8px' } }}
            >
              <Text style={{ fontSize: 11, fontWeight: 500, color: block.tone === k ? 'var(--ds-violet-dark)' : undefined, display: 'block' }}>{v.label}</Text>
              <Text type="secondary" style={{ fontSize: 10 }}>{v.sub}</Text>
            </Card>
          ))}
        </div>
        {block.tone === 'custom' && <Input size="small" style={{ marginTop: 6 }} value={block.customTone} onChange={e => onUpdate({ ...block, customTone: e.target.value })} placeholder="Describe el tono…" />}
      </div>
      <div>
        <FieldLabel>Dato a mencionar (opcional)</FieldLabel>
        <Input size="small" value={block.datoPriorizar} onChange={e => onUpdate({ ...block, datoPriorizar: e.target.value })} placeholder="Ej: Si hay número de ticket, incluirlo" />
      </div>
      <div>
        <FieldLabel>Nunca debe mencionar</FieldLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
          {block.restricciones.map(r => (
            <Tag key={r} color="error" closable onClose={() => onUpdate({ ...block, restricciones: block.restricciones.filter(x => x !== r) })} style={{ fontSize: 11 }}>
              {r}
            </Tag>
          ))}
        </div>
        <Input
          size="small" value={newRestr} onChange={e => setNewRestr(e.target.value)}
          placeholder="Añadir y presionar Enter…"
          onKeyDown={e => { if (e.key === 'Enter' && newRestr.trim()) { onUpdate({ ...block, restricciones: [...block.restricciones, newRestr.trim()] }); setNewRestr(''); } }}
        />
        <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 2 }}>La IA respeta estas restricciones en todos los correos.</Text>
      </div>
    </div>
  );
}
function HeaderContentFields({ block, onUpdate }: { block: HeaderBlock; onUpdate: (b: Component) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <FieldLabel>Nombre o logo</FieldLabel>
        <Input size="small" value={block.name} onChange={e => onUpdate({ ...block, name: e.target.value })} />
      </div>
      <div>
        <FieldLabel>Color de fondo</FieldLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {HEADER_COLORS.map(c => (
            <div key={c} onClick={() => onUpdate({ ...block, bgColor: c })} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: block.bgColor === c ? '3px solid #1890ff' : '3px solid transparent', cursor: 'pointer', outline: block.bgColor === c ? '2px solid white' : 'none', outlineOffset: -4 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
function TitleContentFields({ block, onUpdate }: { block: TitleBlock; onUpdate: (b: Component) => void }) {
  return (
    <div>
      <FieldLabel>Texto del título</FieldLabel>
      <Input size="small" value={block.text} onChange={e => onUpdate({ ...block, text: e.target.value })} />
    </div>
  );
}
function ResponsesContentFields({ block, onUpdate }: { block: ResponsesBlock; onUpdate: (b: Component) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ padding: '7px 10px', borderRadius: 6, background: '#fafafa', border: '1px solid #f0f0f0', fontSize: 11, color: 'rgba(0,0,0,.45)' }}>
        Cada encuestado verá sus propias respuestas exactas. El contenido es dinámico y único por persona.
      </div>
      {PREGUNTAS.map(q => {
        const bq = block.questions.find(x => x.questionId === q.id) ?? { questionId: q.id, included: true, showStatement: true, showOnlyAnswer: false };
        const update = (patch: object) => onUpdate({ ...block, questions: block.questions.map(x => x.questionId === q.id ? { ...x, ...patch } : x) });
        return (
          <div key={q.id} style={{ border: '1px solid #f0f0f0', borderRadius: 6, padding: '8px 10px' }}>
            <Checkbox checked={bq.included} onChange={e => update({ included: e.target.checked })}>
              <Text style={{ fontSize: 12 }}>{q.texto}</Text>
              <Tag style={{ marginLeft: 6 }}>{q.tipo}</Tag>
            </Checkbox>
          </div>
        );
      })}
    </div>
  );
}
function FooterContentFields({ block, onUpdate }: { block: FooterBlock; onUpdate: (b: Component) => void }) {
  return (
    <div>
      <FieldLabel>Texto del footer</FieldLabel>
      <TextArea rows={3} value={block.text} onChange={e => onUpdate({ ...block, text: e.target.value })} />
      <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 2 }}>Debe incluir aviso de desuscripción. Requerido para correos comerciales.</Text>
    </div>
  );
}
function ImageContentFields({ block, onUpdate }: { block: ImageComponent; onUpdate: (b: Component) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <FieldLabel>Origen</FieldLabel>
        <Radio.Group size="small" value={block.dynamic} onChange={e => onUpdate({ ...block, dynamic: e.target.value })}>
          <Radio value={false}>Imagen estática</Radio>
          <Radio value={true}>Imagen dinámica</Radio>
        </Radio.Group>
      </div>
      <div>
        <FieldLabel>URL</FieldLabel>
        <Input size="small" value={block.src} onChange={e => onUpdate({ ...block, src: e.target.value })} placeholder="https://..." />
      </div>
      <div>
        <FieldLabel>Texto alternativo</FieldLabel>
        <Input size="small" value={block.alt} onChange={e => onUpdate({ ...block, alt: e.target.value })} />
      </div>
      <div>
        <FieldLabel>Tamaño</FieldLabel>
        <InputNumber size="small" min={10} max={100} value={block.widthPercent} addonAfter="%" onChange={v => onUpdate({ ...block, widthPercent: v ?? 100 })} style={{ width: '100%' }} />
      </div>
    </div>
  );
}
function ButtonContentFields({ block, onUpdate }: { block: ButtonComponent; onUpdate: (b: Component) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div><FieldLabel>Texto del botón</FieldLabel><Input size="small" value={block.text} onChange={e => onUpdate({ ...block, text: e.target.value })} /></div>
      <div><FieldLabel>URL de destino</FieldLabel><Input size="small" value={block.url} onChange={e => onUpdate({ ...block, url: e.target.value })} placeholder="https://..." /></div>
      <div><FieldLabel>Color de fondo</FieldLabel><ColorPickerField value={block.bgColor} onChange={c => onUpdate({ ...block, bgColor: c })} /></div>
      <div><FieldLabel>Color de texto</FieldLabel><ColorPickerField value={block.textColor} onChange={c => onUpdate({ ...block, textColor: c })} /></div>
    </div>
  );
}
function SpacerContentFields({ block, onUpdate }: { block: SpacerComponent; onUpdate: (b: Component) => void }) {
  return (
    <div>
      <FieldLabel>Alto</FieldLabel>
      <InputNumber size="small" min={4} max={200} value={block.height} addonAfter="px" onChange={v => onUpdate({ ...block, height: v ?? 24 })} style={{ width: '100%' }} />
    </div>
  );
}
function SocialContentFields({ block, onUpdate }: { block: SocialComponent; onUpdate: (b: Component) => void }) {
  function setUrl(network: SocialNetworkKey, url: string) {
    const exists = block.networks.find(n => n.network === network);
    const next = url.trim() === ''
      ? block.networks.filter(n => n.network !== network)
      : exists ? block.networks.map(n => n.network === network ? { ...n, url } : n) : [...block.networks, { network, url }];
    onUpdate({ ...block, networks: next });
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {SOCIAL_KEYS.map(k => (
        <div key={k}>
          <FieldLabel>{SOCIAL_ICONS[k]} {SOCIAL_LABELS[k]}</FieldLabel>
          <Input size="small" value={block.networks.find(n => n.network === k)?.url ?? ''} onChange={e => setUrl(k, e.target.value)} placeholder="https:// (vacío = oculto)" />
        </div>
      ))}
    </div>
  );
}

function ComponentContentConfig({ component, onUpdate }: { component: Component; onUpdate: (c: Component) => void }) {
  if (component.type === 'text')      return <TextContentFields block={component} onUpdate={onUpdate} />;
  if (component.type === 'ai')        return <AiContentFields block={component} onUpdate={onUpdate} />;
  if (component.type === 'header')    return <HeaderContentFields block={component} onUpdate={onUpdate} />;
  if (component.type === 'title')     return <TitleContentFields block={component} onUpdate={onUpdate} />;
  if (component.type === 'responses') return <ResponsesContentFields block={component} onUpdate={onUpdate} />;
  if (component.type === 'footer')    return <FooterContentFields block={component} onUpdate={onUpdate} />;
  if (component.type === 'image')     return <ImageContentFields block={component} onUpdate={onUpdate} />;
  if (component.type === 'button')    return <ButtonContentFields block={component} onUpdate={onUpdate} />;
  if (component.type === 'spacer')    return <SpacerContentFields block={component} onUpdate={onUpdate} />;
  if (component.type === 'social')    return <SocialContentFields block={component} onUpdate={onUpdate} />;
  return <Text type="secondary" style={{ fontSize: 12 }}>Este componente no tiene contenido configurable.</Text>;
}

// ─── Main EditorView ─────────────────────────────────────────────────────────

type Selection =
  | { kind: 'row'; rowId: string }
  | { kind: 'component'; rowId: string; columnId: string; componentId: string }
  | null;

export default function EditorView({ rule, onChange, onBack }: Props) {
  const { message } = App.useApp();
  const [draft, setDraft] = useState<AutoResponse>(rule);
  const [dirty, setDirty] = useState(false);
  const [testValidated, setTestValidated] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [mode, setMode] = useState<'visual' | 'html'>(rule.customHtml ? 'html' : 'visual');
  const [activeTab, setActiveTab] = useState<'elementos' | 'configuracion' | 'diseno'>('elementos');
  const [selection, setSelection] = useState<Selection>(null);
  const [columnPickerOpen, setColumnPickerOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const rows = draft.rows;

  function updateDraft(patch: Partial<AutoResponse>) {
    setDraft(d => ({ ...d, ...patch }));
    setDirty(true);
    setTestValidated(false);
  }
  function updateRows(nextRows: Row[]) { updateDraft({ rows: nextRows }); }
  function scrollToBottom() {
    setTimeout(() => canvasRef.current?.scrollTo({ top: canvasRef.current.scrollHeight, behavior: 'smooth' }), 50);
  }

  function addRow(widths: number[]) {
    const row = makeRow(widths);
    updateRows([...rows, row]);
    setSelection({ kind: 'row', rowId: row.id });
    setActiveTab('configuracion');
    setColumnPickerOpen(false);
    scrollToBottom();
  }
  function addRowAfter(rowId: string, widths: number[]) {
    const row = makeRow(widths);
    const i = rows.findIndex(r => r.id === rowId);
    updateRows(i < 0 ? [...rows, row] : [...rows.slice(0, i + 1), row, ...rows.slice(i + 1)]);
    setSelection({ kind: 'row', rowId: row.id });
    setActiveTab('configuracion');
  }
  function addComponentRow(type: ComponentType) {
    const row = makeSingleComponentRow(type);
    updateRows([...rows, row]);
    const comp = row.columns[0].components[0];
    setSelection({ kind: 'component', rowId: row.id, columnId: row.columns[0].id, componentId: comp.id });
    setActiveTab('configuracion');
    scrollToBottom();
  }
  function addComponentToColumn(type: ComponentType, rowId: string, columnId: string) {
    const comp = makeComponent(type);
    updateRows(rows.map(r => r.id !== rowId ? r : { ...r, columns: r.columns.map(c => c.id !== columnId ? c : { ...c, components: [...c.components, comp] }) }));
    setSelection({ kind: 'component', rowId, columnId, componentId: comp.id });
    setActiveTab('configuracion');
  }
  function insertComponentAfter(rowId: string, columnId: string, atIndex: number) {
    const comp = makeComponent('text');
    updateRows(rows.map(r => r.id !== rowId ? r : { ...r, columns: r.columns.map(c => c.id !== columnId ? c : { ...c, components: [...c.components.slice(0, atIndex + 1), comp, ...c.components.slice(atIndex + 1)] }) }));
    setSelection({ kind: 'component', rowId, columnId, componentId: comp.id });
    setActiveTab('configuracion');
  }
  function updateComponent(rowId: string, columnId: string, comp: Component) {
    updateRows(rows.map(r => r.id !== rowId ? r : { ...r, columns: r.columns.map(c => c.id !== columnId ? c : { ...c, components: c.components.map(x => x.id === comp.id ? comp : x) }) }));
  }
  function updateRowDesign(rowId: string, patch: Partial<RowDesign>) {
    updateRows(rows.map(r => r.id === rowId ? { ...r, design: { ...r.design, ...patch } } : r));
  }
  function removeRow(rowId: string) {
    updateRows(rows.filter(r => r.id !== rowId));
    if (selection?.rowId === rowId) setSelection(null);
  }
  function removeComponent(rowId: string, columnId: string, componentId: string) {
    updateRows(rows.map(r => r.id !== rowId ? r : { ...r, columns: r.columns.map(c => c.id !== columnId ? c : { ...c, components: c.components.filter(x => x.id !== componentId) }) }));
    if (selection?.kind === 'component' && selection.componentId === componentId) setSelection(null);
  }
  function duplicateRow(rowId: string) {
    const i = rows.findIndex(r => r.id === rowId);
    if (i < 0) return;
    const clone = cloneRow(rows[i]);
    updateRows([...rows.slice(0, i + 1), clone, ...rows.slice(i + 1)]);
    setSelection({ kind: 'row', rowId: clone.id });
  }
  function duplicateComponent(rowId: string, columnId: string, componentId: string) {
    updateRows(rows.map(r => {
      if (r.id !== rowId) return r;
      return { ...r, columns: r.columns.map(c => {
        if (c.id !== columnId) return c;
        const i = c.components.findIndex(x => x.id === componentId);
        if (i < 0) return c;
        const clone = { ...c.components[i], id: cuid() };
        return { ...c, components: [...c.components.slice(0, i + 1), clone, ...c.components.slice(i + 1)] };
      }) };
    }));
  }
  function moveRow(from: number, to: number) {
    const nb = [...rows];
    const [moved] = nb.splice(from, 1);
    nb.splice(to, 0, moved);
    updateRows(nb);
  }
  function moveComponentInColumn(rowId: string, columnId: string, from: number, to: number) {
    updateRows(rows.map(r => r.id !== rowId ? r : { ...r, columns: r.columns.map(c => {
      if (c.id !== columnId) return c;
      const nc = [...c.components];
      const [moved] = nc.splice(from, 1);
      nc.splice(to, 0, moved);
      return { ...c, components: nc };
    }) }));
  }

  const selectedRow = selection ? rows.find(r => r.id === selection.rowId) ?? null : null;
  const selectedComponent = selection?.kind === 'component'
    ? selectedRow?.columns.find(c => c.id === selection.columnId)?.components.find(comp => comp.id === selection.componentId) ?? null
    : null;

  function handleExit() {
    if (!dirty) { onBack(); return; }
    Modal.confirm({
      title: '¿Salir sin guardar?',
      content: 'Tienes cambios sin guardar en la plantilla de correo. Si sales ahora, se perderán.',
      okText: 'Salir sin guardar',
      okButtonProps: { danger: true },
      cancelText: 'Seguir editando',
      onOk: () => onBack(),
    });
  }
  function handleSaveDesign() {
    if (countComponents(draft.rows) === 0) {
      Modal.warning({ title: 'Acción no permitida', content: 'Debes agregar contenido al correo antes de guardarlo.' });
      return;
    }
    onChange({ ...draft, blocksUpdatedAt: new Date().toISOString() });
    onBack();
  }
  function handleModeChange(next: 'visual' | 'html') {
    if (next === 'visual' && draft.customHtml != null) {
      Modal.confirm({
        title: 'Descartar cambios de HTML',
        content: 'Tienes cambios manuales en el HTML que se perderán si vuelves al editor visual.',
        okText: 'Descartar y volver',
        okButtonProps: { danger: true },
        cancelText: 'Seguir en HTML',
        onOk: () => { updateDraft({ customHtml: null }); setMode('visual'); },
      });
      return;
    }
    setMode(next);
  }
  function handleTestSent(email: string, summary: string | null) {
    setDraft(d => {
      if (!summary) return d;
      return { ...d, rows: d.rows.map(r => ({ ...r, columns: r.columns.map(c => ({ ...c, components: c.components.map(comp => comp.type === 'ai' ? { ...comp, generatedText: mockGenerateAiText(comp, summary) } : comp) })) })) };
    });
    setDirty(true);
    setTestValidated(true);
    setShowTestModal(false);
    message.success(`Correo de prueba enviado a ${email} ✓`);
  }

  const htmlValue = draft.customHtml ?? renderRowsToHtml(draft.rows);

  const subjectBar = (
    <div style={{ maxWidth: 580, margin: '12px auto 0', display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', background: '#fff', borderRadius: 6, border: '1px solid #f0f0f0' }}>
      <Text type="secondary" style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', flexShrink: 0 }}>ASUNTO</Text>
      {editingSubject ? (
        <Input
          autoFocus size="small" bordered={false}
          value={draft.subject} onChange={e => updateDraft({ subject: e.target.value })}
          onBlur={() => setEditingSubject(false)} onKeyDown={e => e.key === 'Enter' && setEditingSubject(false)}
          style={{ flex: 1, padding: 0 }}
        />
      ) : (
        <>
          <span style={{ flex: 1, fontSize: 13, color: draft.subject ? 'rgba(0,0,0,.85)' : 'rgba(0,0,0,.25)' }}
            dangerouslySetInnerHTML={{ __html: draft.subject ? renderVars(draft.subject) : 'Sin asunto…' }}
          />
          <Button size="small" onClick={() => setEditingSubject(true)}>Editar</Button>
        </>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f5f5f5', overflow: 'hidden' }}>
      {/* Topbar */}
      <div style={{ background: '#1f2937', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12, height: 56, flexShrink: 0, zIndex: 20 }}>
        <Text style={{ color: '#fff', fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap' }}>Diseño del correo de respuesta</Text>
        <Segmented
          value={mode}
          onChange={v => handleModeChange(v as 'visual' | 'html')}
          options={[{ label: 'Editor visual', value: 'visual' }, { label: 'Editor HTML', value: 'html' }]}
        />
        <div style={{ flex: 1 }} />
        <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, whiteSpace: 'nowrap' }}>
          Últ. actualización: {formatDate(draft.blocksUpdatedAt)}
        </Text>
        <Button icon={<SendOutlined />} onClick={() => setShowTestModal(true)} style={{ borderColor: '#13c2c2', color: '#13c2c2', background: '#e6fffb' }}>
          Enviar prueba
        </Button>
        <Button onClick={handleExit}>Cancelar</Button>
        <Tooltip title={!testValidated ? 'Envía una prueba con el diseño actual antes de guardar' : ''}>
          <Button type="primary" disabled={!testValidated} onClick={handleSaveDesign}>
            Guardar diseño
          </Button>
        </Tooltip>
      </div>

      {/* Asunto — visible en ambos modos (fix: antes desaparecía en Editor HTML) */}
      {subjectBar}

      {mode === 'html' ? (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden', marginTop: 12 }}>
          {/* Vista previa en vivo */}
          <div className="rf-scroll-hidden" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 24px 20px', background: '#f5f5f5' }}>
            <div style={{ maxWidth: 580, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,.12)', overflow: 'hidden', minHeight: 180 }}
              dangerouslySetInnerHTML={{ __html: htmlValue }}
            />
          </div>
          {/* Código */}
          <div style={{ width: '45%', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #f0f0f0' }}>
            <Text type="secondary" style={{ fontSize: 12, padding: '8px 16px 4px' }}>
              Asegúrate de incluir la referencia al estudio ($URLSurvey). La vista previa de la
              izquierda se actualiza en tiempo real. Al volver al editor visual se descartarán
              estos cambios manuales.
            </Text>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              <CodeMirror
                value={htmlValue}
                height="100%"
                extensions={[htmlLang()]}
                onChange={value => updateDraft({ customHtml: value })}
              />
            </div>
          </div>
        </div>
      ) : (
        <DndProvider backend={HTML5Backend}>
          <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
            {/* Canvas */}
            <div ref={canvasRef} className="rf-scroll-hidden" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px 24px 20px' }}>
              <div style={{ maxWidth: 580, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,.12)', overflow: 'hidden', minHeight: 180 }}>
                {rows.length === 0 ? (
                  <div style={{ padding: '48px 32px', textAlign: 'center', color: 'rgba(0,0,0,.25)' }}>
                    <PlusOutlined style={{ fontSize: 24, display: 'block', margin: '0 auto 8px' }} />
                    <Text type="secondary">Agrega elementos desde el panel derecho</Text>
                  </div>
                ) : (
                  <div>
                    {rows.map((row, i) => (
                      <RowBox
                        key={row.id} row={row} index={i}
                        selected={selection?.kind === 'row' && selection.rowId === row.id}
                        onSelectRow={() => { setSelection({ kind: 'row', rowId: row.id }); setActiveTab('configuracion'); }}
                        selectedComponentId={selection?.kind === 'component' && selection.rowId === row.id ? selection.componentId : null}
                        onSelectComponent={(columnId, componentId) => { setSelection({ kind: 'component', rowId: row.id, columnId, componentId }); setActiveTab('configuracion'); }}
                        onRemoveRow={() => removeRow(row.id)}
                        onDuplicateRow={() => duplicateRow(row.id)}
                        onInsertRowAfter={() => addRowAfter(row.id, [100])}
                        moveRow={moveRow}
                        moveComponentInColumn={(columnId, from, to) => moveComponentInColumn(row.id, columnId, from, to)}
                        onAddComponentToColumn={(type, columnId) => addComponentToColumn(type, row.id, columnId)}
                        removeComponent={(columnId, componentId) => removeComponent(row.id, columnId, componentId)}
                        duplicateComponent={(columnId, componentId) => duplicateComponent(row.id, columnId, componentId)}
                        insertComponentAfter={(columnId, atIndex) => insertComponentAfter(row.id, columnId, atIndex)}
                      />
                    ))}
                    <div
                      onClick={() => { setActiveTab('elementos'); requestAnimationFrame(() => document.getElementById('palette-section')?.scrollIntoView({ behavior: 'smooth' })); }}
                      style={{ padding: 14, textAlign: 'center', cursor: 'pointer', borderTop: '1px dashed #d9d9d9' }}
                    >
                      <Text type="secondary" style={{ fontSize: 12 }}><PlusOutlined style={{ marginRight: 4 }} />Agregar elemento</Text>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ width: 288, background: '#fff', borderLeft: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', flexShrink: 0, minHeight: 0 }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
                {(['elementos', 'configuracion', 'diseno'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1, padding: '10px 4px', border: 'none', background: 'none', cursor: 'pointer',
                      borderBottom: activeTab === tab ? '2px solid #1890ff' : '2px solid transparent',
                      color: activeTab === tab ? '#1890ff' : 'rgba(0,0,0,.45)',
                      fontSize: 12, fontWeight: activeTab === tab ? 600 : 400,
                    }}
                  >
                    {tab === 'elementos' ? 'Elementos' : tab === 'configuracion' ? 'Configuración' : 'Diseño'}
                  </button>
                ))}
              </div>
              <div className="rf-scroll-hidden" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '14px 12px' }}>
                {activeTab === 'elementos' && (
                  <div id="palette-section">
                    <Text type="secondary" style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Estructura</Text>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                      <PaletteItem icon={<TableOutlined />} label="Columnas" sub="Elige un layout" onClick={() => setColumnPickerOpen(o => !o)} />
                    </div>
                    {columnPickerOpen && <ColumnLayoutPicker onPick={addRow} onClose={() => setColumnPickerOpen(false)} />}
                    <Text type="secondary" style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', display: 'block', margin: '10px 0 8px' }}>Componentes</Text>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {COMPONENT_PALETTE.map(item => (
                        <PaletteItem key={item.type} icon={item.icon} label={item.label} sub={item.sub} violet={item.violet} onClick={() => addComponentRow(item.type)} />
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 'configuracion' && (
                  selection?.kind === 'row' && selectedRow
                    ? <RowConfigFields design={selectedRow.design} onUpdate={p => updateRowDesign(selectedRow.id, p)} />
                    : selection?.kind === 'component' && selectedComponent
                    ? <ComponentContentConfig component={selectedComponent} onUpdate={c => updateComponent(selection.rowId, selection.columnId, c)} />
                    : <Text type="secondary" style={{ fontSize: 12 }}>Selecciona una fila o un componente del canvas para configurarlo aquí.</Text>
                )}
                {activeTab === 'diseno' && (
                  selection?.kind === 'row' && selectedRow
                    ? <RowDesignFields design={selectedRow.design} onUpdate={p => updateRowDesign(selectedRow.id, p)} />
                    : selection?.kind === 'component' && selectedComponent && selectedComponent.type !== 'spacer'
                    ? <ComponentDesignFields design={selectedComponent.design} onUpdate={p => updateComponent(selection.rowId, selection.columnId, { ...selectedComponent, design: { ...selectedComponent.design, ...p } })} />
                    : <Text type="secondary" style={{ fontSize: 12 }}>Selecciona una fila o un componente del canvas para configurar su diseño aquí.</Text>
                )}
              </div>
            </div>
          </div>
        </DndProvider>
      )}

      {showTestModal && (
        <TestModal
          rule={draft}
          onClose={() => setShowTestModal(false)}
          onSend={handleTestSent}
        />
      )}
    </div>
  );
}
