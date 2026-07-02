import { useState, useRef } from 'react';
import {
  App, Button, Input, Card, Typography, Divider, Switch, Tag,
  InputNumber, Radio, Checkbox, Tooltip, Segmented, Tabs, Modal,
} from 'antd';
import {
  SendOutlined, UpOutlined, DownOutlined, CopyOutlined,
  CloseOutlined, PlusOutlined, BoldOutlined, AlignLeftOutlined,
  AlignCenterOutlined, AlignRightOutlined, MinusOutlined, FileTextOutlined, UnorderedListOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { AutoResponse, Block, BlockType, AiBlock, TextBlock, TitleBlock, HeaderBlock, ResponsesBlock, FooterBlock, TextAlign, Tone } from './types';
import { VARIABLES, PREGUNTAS, TONO_LABELS, HEADER_COLORS, DEFAULT_RESTRICTIONS, SETUP } from './data';
import { cuid } from './cuid';
import TestModal from './TestModal';

const { Text } = Typography;
const { TextArea } = Input;

interface Props {
  rule: AutoResponse;
  onChange: (r: AutoResponse) => void;
  onBack: () => void;
}

function makeBlock(type: BlockType): Block {
  const design = { paddingTop: 16, paddingBottom: 16, paddingLeft: 0, paddingRight: 0, textAlign: 'left' as TextAlign, bgColor: 'transparent', widthPercent: 100, boxed: true, borderStyle: 'none' as const, borderWidth: 0, borderColor: '#000000', hideMobile: false };
  const id = Date.now().toString() + Math.random();
  switch (type) {
    case 'header':    return { id, type, name: 'HIR Casa', bgColor: '#1890ff', design };
    case 'title':     return { id, type, text: 'Tu opinión importa', design };
    case 'text':      return { id, type, content: 'Hola {{nombre_preferido}},\n\nGracias por tomarte el tiempo de responder nuestra encuesta.', design };
    case 'ai':        return { id, type, objetivo: '', tone: 'empatico' as Tone, customTone: '', datoPriorizar: '', restricciones: [...DEFAULT_RESTRICTIONS], generatedText: '', design };
    case 'responses': return { id, type, questions: PREGUNTAS.map(q => ({ questionId: q.id, included: true, showStatement: true, showOnlyAnswer: false })), displayStyle: 'bold-indented', design };
    case 'divider':   return { id, type, design };
    case 'footer':    return { id, type, text: 'Para darte de baja, responde a este correo con el asunto "Baja".\n\n© HIR Casa · Ciudad de México', design };
    default: return { id, type: 'divider', design };
  }
}

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

function renderBlocksToHtml(blocks: Block[]): string {
  return blocks.map(b => {
    const d = b.design;
    const style = `padding:${d.paddingTop}px ${d.paddingRight ?? 0}px ${d.paddingBottom}px ${d.paddingLeft ?? 0}px;text-align:${d.textAlign};${d.bgColor !== 'transparent' ? `background:${d.bgColor};` : ''}`;
    switch (b.type) {
      case 'header':    return `<div style="${style}background:${b.bgColor};text-align:center;"><span style="font-weight:700;font-size:22px;color:#fff;">${b.name}</span></div>`;
      case 'title':     return `<div style="${style}"><h2 style="font-weight:700;font-size:21px;color:#000;margin:0;">${b.text}</h2></div>`;
      case 'text':      return `<div style="${style}"><p style="font-size:13.5px;line-height:1.75;color:#333;white-space:pre-line;margin:0;">${b.content}</p></div>`;
      case 'ai':        return `<div style="${style}"><p style="font-size:13px;line-height:1.7;color:#4C1D95;font-style:italic;margin:0;">${b.generatedText || '[Texto generado pendiente — envía una prueba]'}</p></div>`;
      case 'responses': return `<div style="${style}"><p style="font-size:12px;color:#666;">[Bloque de respuestas del encuestado]</p></div>`;
      case 'divider':   return `<hr style="margin:${d.paddingTop}px 26px ${d.paddingBottom}px;" />`;
      case 'footer':    return `<div style="${style}"><p style="font-size:11.5px;color:#999;text-align:center;white-space:pre-line;margin:0;">${b.text}</p></div>`;
      default: return '';
    }
  }).join('\n');
}

// ─── Block canvas renderers ───────────────────────────────────────────────────

function ToolbarBtn({ icon, onClick, title }: { icon: React.ReactNode; onClick: (e: React.MouseEvent) => void; title: string }) {
  return (
    <Tooltip title={title}>
      <Button type="text" size="small" onClick={e => { e.stopPropagation(); onClick(e); }} style={{ height: 22, width: 22, padding: 0, minWidth: 0 }}>
        {icon}
      </Button>
    </Tooltip>
  );
}

function BlockCanvas({ block, selected, onSelect, onMoveUp, onMoveDown, onRemove, onDuplicate, onInsertAfter }: {
  block: Block; selected: boolean;
  onSelect: () => void; onMoveUp: () => void; onMoveDown: () => void; onRemove: () => void;
  onDuplicate: () => void; onInsertAfter: () => void;
}) {
  const d = block.design;
  const pad = { paddingTop: d.paddingTop, paddingBottom: d.paddingBottom, paddingLeft: d.paddingLeft ?? 0, paddingRight: d.paddingRight ?? 0 };
  const bg = d.bgColor !== 'transparent' ? d.bgColor : undefined;
  const align = d.textAlign;
  const widthPercent = d.widthPercent ?? 100;
  const boxed = d.boxed ?? true;
  const border = d.borderStyle && d.borderStyle !== 'none' && (d.borderWidth ?? 0) > 0
    ? `${d.borderWidth}px ${d.borderStyle} ${d.borderColor ?? '#000'}`
    : undefined;

  let content: React.ReactNode;

  if (block.type === 'header') {
    content = (
      <div style={{ background: block.bgColor, padding: '20px 32px', textAlign: 'center' }}>
        <span style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 700, fontSize: 22, color: '#fff', letterSpacing: -0.5 }}>{block.name}</span>
      </div>
    );
  } else if (block.type === 'title') {
    content = <p style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 700, fontSize: 21, color: 'rgba(0,0,0,.85)', letterSpacing: -0.5, padding: '0 32px', margin: 0, textAlign: align }} dangerouslySetInnerHTML={{ __html: renderVars(block.text) }} />;
  } else if (block.type === 'text') {
    content = <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 13.5, lineHeight: 1.75, color: 'rgba(0,0,0,.65)', padding: '0 32px', margin: 0, whiteSpace: 'pre-line', textAlign: align }} dangerouslySetInnerHTML={{ __html: renderVars(block.content) }} />;
  } else if (block.type === 'ai') {
    const configured = block.objetivo.trim() !== '';
    content = (
      <div style={{ border: '1.5px solid var(--ds-violet-mid)', borderRadius: 8, background: 'var(--ds-violet-bg)', margin: '0 32px', padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Tag color="purple" icon={<ThunderboltOutlined />} style={{ fontWeight: 600 }}>IA</Tag>
          <Text style={{ fontSize: 11, color: 'var(--ds-violet-dark)' }}>
            {configured ? `Tono: ${TONO_LABELS[block.tone]?.label ?? block.tone} · ${block.generatedText ? 'Generado' : 'Pendiente'}` : 'Sin configurar — selecciona para configurar'}
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
            {block.generatedText || 'Usa "Enviar prueba" para ver el texto real.'}
          </p>
        )}
      </div>
    );
  } else if (block.type === 'responses') {
    const included = PREGUNTAS.filter(q => block.questions.find(bq => bq.questionId === q.id && bq.included));
    content = (
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
  } else if (block.type === 'divider') {
    content = <Divider style={{ margin: '0 26px', minWidth: 'auto', width: 'auto' }} />;
  } else if (block.type === 'footer') {
    content = <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 11.5, color: 'rgba(0,0,0,.35)', textAlign: 'center', padding: '13px 32px', margin: 0, background: '#fafafa', whiteSpace: 'pre-line' }}>{block.text}</p>;
  }

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={e => { const t = e.currentTarget.querySelector<HTMLElement>('.blk-toolbar'); if (t) t.style.opacity = '1'; }}
      onMouseLeave={e => { const t = e.currentTarget.querySelector<HTMLElement>('.blk-toolbar'); if (t && !selected) t.style.opacity = '0'; }}
    >
      <div className="blk-toolbar" style={{ opacity: selected ? 1 : 0, transition: 'opacity .15s', position: 'absolute', top: -32, right: 0, zIndex: 5, display: 'flex', gap: 2, background: 'rgba(0,0,0,.75)', borderRadius: 4, padding: '2px 4px' }}>
        <ToolbarBtn title="Insertar bloque debajo" icon={<PlusOutlined style={{ color: 'white', fontSize: 10 }} />} onClick={onInsertAfter} />
        <ToolbarBtn title="Duplicar" icon={<CopyOutlined style={{ color: 'white', fontSize: 10 }} />} onClick={onDuplicate} />
        <ToolbarBtn title="Subir" icon={<UpOutlined style={{ color: 'white', fontSize: 10 }} />} onClick={onMoveUp} />
        <ToolbarBtn title="Bajar" icon={<DownOutlined style={{ color: 'white', fontSize: 10 }} />} onClick={onMoveDown} />
        <ToolbarBtn title="Eliminar" icon={<CloseOutlined style={{ color: 'white', fontSize: 10 }} />} onClick={onRemove} />
      </div>
      <div
        onClick={onSelect}
        style={{
          cursor: 'pointer', ...pad, background: bg, border,
          outline: selected ? '2px solid #1890ff' : '2px solid transparent',
          outlineOffset: -1,
          transition: 'outline .1s',
        }}
      >
        <div style={{ width: `${widthPercent}%`, margin: boxed ? '0 auto' : '0' }}>
          {content}
        </div>
      </div>
    </div>
  );
}

// ─── Palette item ─────────────────────────────────────────────────────────────

function PaletteItem({ icon, label, sub, onClick, violet }: { icon: React.ReactNode; label: string; sub: string; onClick: () => void; violet?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
        padding: '7px 10px', marginBottom: 4, textAlign: 'left', cursor: 'pointer',
        border: `1px solid ${violet ? 'var(--ds-violet-mid)' : '#d9d9d9'}`,
        borderRadius: 6,
        background: violet ? 'var(--ds-violet-bg)' : '#fff',
      }}
    >
      <span style={{ color: violet ? 'var(--ds-violet)' : 'rgba(0,0,0,.45)', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontWeight: 500, fontSize: 12, color: violet ? 'var(--ds-violet-dark)' : 'rgba(0,0,0,.85)', lineHeight: 1.4 }}>{label}</div>
        <div style={{ fontSize: 10, color: 'rgba(0,0,0,.45)', lineHeight: 1.4 }}>{sub}</div>
      </div>
    </button>
  );
}

// ─── Block config panels ──────────────────────────────────────────────────────

function DesignPanel({ block, onUpdate }: { block: Block; onUpdate: (p: Partial<Block['design']>) => void }) {
  const [open, setOpen] = useState(true);
  const d = block.design;
  return (
    <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 12, paddingTop: 10 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: open ? 10 : 0 }}
      >
        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Diseño del bloque</Text>
        <Text type="secondary" style={{ fontSize: 10 }}>{open ? '▲' : '▼'}</Text>
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 3 }}>Ancho del contenido</Text>
              <InputNumber size="small" value={d.widthPercent ?? 100} min={10} max={100} addonAfter="%" onChange={v => onUpdate({ widthPercent: v ?? 100 })} style={{ width: '100%' }} />
            </div>
            <div style={{ flex: 1 }}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 3 }}>Estilo del contenedor</Text>
              <Radio.Group size="small" value={d.boxed ?? true} onChange={e => onUpdate({ boxed: e.target.value })} style={{ display: 'flex' }}>
                <Tooltip title="Con margen"><Radio.Button value={true} style={{ flex: 1, textAlign: 'center' }}>▢</Radio.Button></Tooltip>
                <Tooltip title="Ancho completo"><Radio.Button value={false} style={{ flex: 1, textAlign: 'center' }}>▭</Radio.Button></Tooltip>
              </Radio.Group>
            </div>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 3 }}>Color de fondo</Text>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="color" value={d.bgColor === 'transparent' ? '#ffffff' : d.bgColor} onChange={e => onUpdate({ bgColor: e.target.value })} style={{ width: 30, height: 26, border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer', padding: 2 }} />
              <Button size="small" onClick={() => onUpdate({ bgColor: 'transparent' })}>Transparente</Button>
            </div>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 3 }}>Relleno</Text>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 2 }}>Arriba</Text>
                <InputNumber size="small" value={d.paddingTop} onChange={v => onUpdate({ paddingTop: v ?? 0 })} style={{ width: '100%' }} min={0} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 2 }}>Abajo</Text>
                <InputNumber size="small" value={d.paddingBottom} onChange={v => onUpdate({ paddingBottom: v ?? 0 })} style={{ width: '100%' }} min={0} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 2 }}>Izquierda</Text>
                <InputNumber size="small" value={d.paddingLeft ?? 0} onChange={v => onUpdate({ paddingLeft: v ?? 0 })} style={{ width: '100%' }} min={0} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 2 }}>Derecha</Text>
                <InputNumber size="small" value={d.paddingRight ?? 0} onChange={v => onUpdate({ paddingRight: v ?? 0 })} style={{ width: '100%' }} min={0} />
              </div>
            </div>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 3 }}>Alineación</Text>
            <Radio.Group size="small" value={d.textAlign} onChange={e => onUpdate({ textAlign: e.target.value })}>
              <Radio.Button value="left"><AlignLeftOutlined /></Radio.Button>
              <Radio.Button value="center"><AlignCenterOutlined /></Radio.Button>
              <Radio.Button value="right"><AlignRightOutlined /></Radio.Button>
            </Radio.Group>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 3 }}>Borde</Text>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="color" value={d.borderColor ?? '#000000'} onChange={e => onUpdate({ borderColor: e.target.value })} style={{ width: 30, height: 26, border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer', padding: 2 }} />
              <InputNumber size="small" min={0} value={d.borderWidth ?? 0} onChange={v => onUpdate({ borderWidth: v ?? 0 })} style={{ width: 56 }} addonAfter="px" />
              <Radio.Group size="small" value={d.borderStyle ?? 'none'} onChange={e => onUpdate({ borderStyle: e.target.value })}>
                <Radio.Button value="solid">Sólido</Radio.Button>
                <Radio.Button value="dashed">Guiones</Radio.Button>
                <Radio.Button value="none">Ninguno</Radio.Button>
              </Radio.Group>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text type="secondary" style={{ fontSize: 11 }}>Ocultar en móvil</Text>
            <Switch size="small" checked={d.hideMobile ?? false} onChange={v => onUpdate({ hideMobile: v })} />
          </div>
        </div>
      )}
    </div>
  );
}

function TextBlockConfig({ block, onUpdate }: { block: TextBlock; onUpdate: (b: Block) => void }) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  function patchDesign(p: Partial<Block['design']>) { onUpdate({ ...block, design: { ...block.design, ...p } }); }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Contenido</Text>
        <TextArea ref={taRef} rows={4} value={block.content} onChange={e => onUpdate({ ...block, content: e.target.value })} />
      </div>
      <div>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Insertar variable</Text>
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
      <DesignPanel block={block} onUpdate={patchDesign} />
    </div>
  );
}

function AiBlockConfig({ block, onUpdate }: { block: AiBlock; onUpdate: (b: Block) => void }) {
  const [newRestr, setNewRestr] = useState('');
  function patchDesign(p: Partial<Block['design']>) { onUpdate({ ...block, design: { ...block.design, ...p } }); }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ padding: '7px 10px', borderRadius: 6, background: 'var(--ds-violet-bg)', border: '1px solid var(--ds-violet-mid)' }}>
        <Text style={{ fontSize: 11, color: 'var(--ds-violet-dark)' }}>
          ✦ Usa como contexto: <strong>{SETUP.empresa}</strong> · {SETUP.industria}
        </Text>
      </div>
      <div>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>¿Qué debe lograr este bloque? *</Text>
        <TextArea rows={3} value={block.objetivo} onChange={e => onUpdate({ ...block, objetivo: e.target.value })} placeholder="Ej: Que el cliente sienta que su queja fue escuchada…" />
        <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 2 }}>La IA genera texto único usando la respuesta real como contexto.</Text>
      </div>
      <div>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Tono del mensaje</Text>
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
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Dato a mencionar (opcional)</Text>
        <Input size="small" value={block.datoPriorizar} onChange={e => onUpdate({ ...block, datoPriorizar: e.target.value })} placeholder="Ej: Si hay número de ticket, incluirlo" />
      </div>
      <div>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Nunca debe mencionar</Text>
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
      <DesignPanel block={block} onUpdate={patchDesign} />
    </div>
  );
}

function BlockConfig({ block, onUpdate }: { block: Block; onUpdate: (b: Block) => void }) {
  function patchDesign(p: Partial<Block['design']>) { onUpdate({ ...block, design: { ...block.design, ...p } }); }

  if (block.type === 'text')   return <TextBlockConfig block={block as TextBlock} onUpdate={onUpdate} />;
  if (block.type === 'ai')     return <AiBlockConfig block={block as AiBlock} onUpdate={onUpdate} />;

  if (block.type === 'header') {
    const b = block as HeaderBlock;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre o logo</Text>
          <Input size="small" value={b.name} onChange={e => onUpdate({ ...b, name: e.target.value })} />
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Color de fondo</Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {HEADER_COLORS.map(c => (
              <div key={c} onClick={() => onUpdate({ ...b, bgColor: c })} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: b.bgColor === c ? '3px solid #1890ff' : '3px solid transparent', cursor: 'pointer', outline: b.bgColor === c ? '2px solid white' : 'none', outlineOffset: -4 }} />
            ))}
          </div>
        </div>
        <DesignPanel block={b} onUpdate={patchDesign} />
      </div>
    );
  }

  if (block.type === 'title') {
    const b = block as TitleBlock;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Texto del título</Text>
          <Input size="small" value={b.text} onChange={e => onUpdate({ ...b, text: e.target.value })} />
        </div>
        <DesignPanel block={b} onUpdate={patchDesign} />
      </div>
    );
  }

  if (block.type === 'responses') {
    const b = block as ResponsesBlock;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ padding: '7px 10px', borderRadius: 6, background: '#fafafa', border: '1px solid #f0f0f0', fontSize: 11, color: 'rgba(0,0,0,.45)' }}>
          Cada encuestado verá sus propias respuestas exactas. El contenido es dinámico y único por persona.
        </div>
        {PREGUNTAS.map(q => {
          const bq = b.questions.find(x => x.questionId === q.id) ?? { questionId: q.id, included: true, showStatement: true, showOnlyAnswer: false };
          const update = (patch: object) => onUpdate({ ...b, questions: b.questions.map(x => x.questionId === q.id ? { ...x, ...patch } : x) });
          return (
            <div key={q.id} style={{ border: '1px solid #f0f0f0', borderRadius: 6, padding: '8px 10px' }}>
              <Checkbox checked={bq.included} onChange={e => update({ included: e.target.checked })}>
                <Text style={{ fontSize: 12 }}>{q.texto}</Text>
                <Tag style={{ marginLeft: 6 }}>{q.tipo}</Tag>
              </Checkbox>
            </div>
          );
        })}
        <DesignPanel block={b} onUpdate={patchDesign} />
      </div>
    );
  }

  if (block.type === 'footer') {
    const b = block as FooterBlock;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Texto del footer</Text>
          <TextArea rows={3} value={b.text} onChange={e => onUpdate({ ...b, text: e.target.value })} />
          <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 2 }}>Debe incluir aviso de desuscripción. Requerido para correos comerciales.</Text>
        </div>
        <DesignPanel block={b} onUpdate={patchDesign} />
      </div>
    );
  }

  return <DesignPanel block={block} onUpdate={patchDesign} />;
}

// ─── Main EditorView ─────────────────────────────────────────────────────────

export default function EditorView({ rule, onChange, onBack }: Props) {
  const { message } = App.useApp();
  const [draft, setDraft] = useState<AutoResponse>(rule);
  const [dirty, setDirty] = useState(false);
  const [testValidated, setTestValidated] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [mode, setMode] = useState<'visual' | 'html'>(rule.customHtml ? 'html' : 'visual');
  const [activeTab, setActiveTab] = useState<'elementos' | 'configuracion'>('elementos');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const blocks = draft.blocks;

  function updateDraft(patch: Partial<AutoResponse>) {
    setDraft(d => ({ ...d, ...patch }));
    setDirty(true);
    setTestValidated(false);
  }

  function addBlock(type: BlockType, atIndex?: number) {
    const b = makeBlock(type);
    const nb = atIndex == null ? [...blocks, b] : [...blocks.slice(0, atIndex + 1), b, ...blocks.slice(atIndex + 1)];
    updateDraft({ blocks: nb });
    setSelectedId(b.id);
    setActiveTab('configuracion');
    if (atIndex == null) setTimeout(() => canvasRef.current?.scrollTo({ top: canvasRef.current.scrollHeight, behavior: 'smooth' }), 50);
  }
  function updateBlock(b: Block) { updateDraft({ blocks: blocks.map(x => x.id === b.id ? b : x) }); }
  function moveUp(id: string) { const i = blocks.findIndex(b => b.id === id); if (i > 0) { const nb = [...blocks]; [nb[i-1], nb[i]] = [nb[i], nb[i-1]]; updateDraft({ blocks: nb }); } }
  function moveDown(id: string) { const i = blocks.findIndex(b => b.id === id); if (i < blocks.length - 1) { const nb = [...blocks]; [nb[i], nb[i+1]] = [nb[i+1], nb[i]]; updateDraft({ blocks: nb }); } }
  function removeBlock(id: string) { updateDraft({ blocks: blocks.filter(b => b.id !== id) }); if (selectedId === id) setSelectedId(null); }
  function duplicateBlock(id: string) {
    const i = blocks.findIndex(b => b.id === id);
    if (i < 0) return;
    const clone = { ...blocks[i], id: cuid() };
    updateDraft({ blocks: [...blocks.slice(0, i + 1), clone, ...blocks.slice(i + 1)] });
    setSelectedId(clone.id);
    setActiveTab('configuracion');
  }
  function selectBlock(id: string) { setSelectedId(id); setActiveTab('configuracion'); }
  const selectedBlock = blocks.find(b => b.id === selectedId) ?? null;

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

  function handleTestSent(email: string, generatedText: string | null) {
    setDraft(d => {
      if (!generatedText) return d;
      const aiBlock = d.blocks.find((b): b is AiBlock => b.type === 'ai');
      if (!aiBlock) return d;
      return { ...d, blocks: d.blocks.map(b => b.id === aiBlock.id ? { ...b, generatedText } : b) };
    });
    setDirty(true);
    setTestValidated(true);
    setShowTestModal(false);
    message.success(`Correo de prueba enviado a ${email} ✓`);
  }

  const htmlValue = draft.customHtml ?? renderBlocksToHtml(draft.blocks);

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

      {mode === 'html' ? (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: 20, gap: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Edita el HTML del correo directamente. Al volver al editor visual se descartarán estos cambios manuales.
          </Text>
          <TextArea
            value={htmlValue}
            onChange={e => updateDraft({ customHtml: e.target.value })}
            style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, background: '#1f2937', color: '#e5e7eb', resize: 'none' }}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Canvas */}
          <div ref={canvasRef} className="rf-scroll-hidden" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 24px', background: '#f5f5f5' }}>
            {/* Subject bar */}
            <div style={{ maxWidth: 580, margin: '0 auto 12px', display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', background: '#fff', borderRadius: 6, border: '1px solid #f0f0f0' }}>
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

            {/* Email frame */}
            <div style={{ maxWidth: 580, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,.12)', overflow: 'hidden', minHeight: 180 }}>
              {blocks.length === 0 ? (
                <div style={{ padding: '48px 32px', textAlign: 'center', color: 'rgba(0,0,0,.25)' }}>
                  <PlusOutlined style={{ fontSize: 24, display: 'block', margin: '0 auto 8px' }} />
                  <Text type="secondary">Agrega bloques desde el panel derecho</Text>
                </div>
              ) : (
                <div>
                  {blocks.map((b, i) => (
                    <BlockCanvas key={b.id} block={b} selected={selectedId === b.id}
                      onSelect={() => selectBlock(b.id)} onMoveUp={() => moveUp(b.id)}
                      onMoveDown={() => moveDown(b.id)} onRemove={() => removeBlock(b.id)}
                      onDuplicate={() => duplicateBlock(b.id)} onInsertAfter={() => addBlock('text', i)} />
                  ))}
                  <div
                    onClick={() => { setActiveTab('elementos'); requestAnimationFrame(() => document.getElementById('palette-section')?.scrollIntoView({ behavior: 'smooth' })); }}
                    style={{ padding: 14, textAlign: 'center', cursor: 'pointer', borderTop: '1px dashed #d9d9d9' }}
                  >
                    <Text type="secondary" style={{ fontSize: 12 }}><PlusOutlined style={{ marginRight: 4 }} />Agregar bloque</Text>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ width: 280, background: '#fff', borderLeft: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', flexShrink: 0, minHeight: 0 }}>
            <Tabs
              activeKey={activeTab}
              onChange={k => setActiveTab(k as 'elementos' | 'configuracion')}
              centered
              items={[{ key: 'elementos', label: 'Elementos' }, { key: 'configuracion', label: 'Configuración' }]}
              style={{ padding: '0 12px', flexShrink: 0 }}
            />
            <div className="rf-scroll-hidden" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 12px 14px' }}>
              {activeTab === 'elementos' ? (
                <div id="palette-section">
                  <Text type="secondary" style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', display: 'block', margin: '6px 0 4px' }}>Estructura</Text>
                  <PaletteItem icon={<BoldOutlined />} label="Header de marca" sub="Logo y color corporativo" onClick={() => addBlock('header')} />
                  <PaletteItem icon="T" label="Título" sub="Texto grande destacado" onClick={() => addBlock('title')} />
                  <PaletteItem icon={<AlignLeftOutlined />} label="Texto libre" sub="Con variables del encuestado" onClick={() => addBlock('text')} />
                  <Text type="secondary" style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', display: 'block', margin: '10px 0 4px' }}>Contenido dinámico</Text>
                  <PaletteItem icon="✦" label="Bloque IA" sub="Texto único por encuestado" onClick={() => addBlock('ai')} violet />
                  <PaletteItem icon={<UnorderedListOutlined />} label="Bloque de respuestas" sub="Las respuestas del encuestado" onClick={() => addBlock('responses')} />
                  <Text type="secondary" style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', display: 'block', margin: '10px 0 4px' }}>Otros</Text>
                  <PaletteItem icon={<MinusOutlined />} label="Divisor" sub="Línea separadora" onClick={() => addBlock('divider')} />
                  <PaletteItem icon={<FileTextOutlined />} label="Footer legal" sub="Texto legal + baja" onClick={() => addBlock('footer')} />
                </div>
              ) : (
                selectedBlock
                  ? <BlockConfig block={selectedBlock} onUpdate={updateBlock} />
                  : <Text type="secondary" style={{ fontSize: 12 }}>Selecciona un bloque del canvas para configurarlo aquí.</Text>
              )}
            </div>
          </div>
        </div>
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
