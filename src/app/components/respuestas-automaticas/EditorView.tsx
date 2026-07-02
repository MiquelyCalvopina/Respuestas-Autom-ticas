import { useState, useRef } from 'react';
import {
  Button, Input, Card, Typography, Divider, Switch, Tag,
  InputNumber, Radio, Checkbox, Select, Tooltip, Space,
} from 'antd';
import {
  LeftOutlined, SendOutlined, SaveOutlined, UpOutlined, DownOutlined,
  CloseOutlined, PlusOutlined, BoldOutlined, PicRightOutlined, AlignLeftOutlined,
  AlignCenterOutlined, AlignRightOutlined, MinusOutlined, FileTextOutlined, UnorderedListOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { AutoResponse, Block, BlockType, AiBlock, TextBlock, TitleBlock, HeaderBlock, ResponsesBlock, FooterBlock, TextAlign, Tone } from './types';
import { VARIABLES, PREGUNTAS, TONO_LABELS, HEADER_COLORS, DEFAULT_RESTRICTIONS, SETUP } from './data';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Props {
  rule: AutoResponse;
  onChange: (r: AutoResponse) => void;
  onBack: () => void;
  onSendTest: () => void;
}

function makeBlock(type: BlockType): Block {
  const design = { paddingTop: 16, paddingBottom: 16, textAlign: 'left' as TextAlign, bgColor: 'transparent' };
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

// ─── Block canvas renderers ───────────────────────────────────────────────────

function BlockCanvas({ block, selected, onSelect, onMoveUp, onMoveDown, onRemove }: {
  block: Block; selected: boolean;
  onSelect: () => void; onMoveUp: () => void; onMoveDown: () => void; onRemove: () => void;
}) {
  const pad = { paddingTop: block.design.paddingTop, paddingBottom: block.design.paddingBottom };
  const bg = block.design.bgColor !== 'transparent' ? block.design.bgColor : undefined;
  const align = block.design.textAlign;

  const actions = (
    <div style={{ position: 'absolute', top: -32, right: 0, display: 'flex', gap: 2, background: 'rgba(0,0,0,.75)', borderRadius: 4, padding: '2px 4px', zIndex: 5 }}>
      <Button type="text" size="small" icon={<UpOutlined style={{ color: 'white', fontSize: 10 }} />} onClick={e => { e.stopPropagation(); onMoveUp(); }} style={{ height: 22, width: 22, padding: 0, minWidth: 0 }} />
      <Button type="text" size="small" icon={<DownOutlined style={{ color: 'white', fontSize: 10 }} />} onClick={e => { e.stopPropagation(); onMoveDown(); }} style={{ height: 22, width: 22, padding: 0, minWidth: 0 }} />
      <Button type="text" size="small" icon={<CloseOutlined style={{ color: 'white', fontSize: 10 }} />} onClick={e => { e.stopPropagation(); onRemove(); }} style={{ height: 22, width: 22, padding: 0, minWidth: 0 }} />
    </div>
  );

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
        <Button type="text" size="small" onClick={e => { e.stopPropagation(); onMoveUp(); }} style={{ height: 22, width: 22, padding: 0, minWidth: 0 }}><UpOutlined style={{ color: 'white', fontSize: 10 }} /></Button>
        <Button type="text" size="small" onClick={e => { e.stopPropagation(); onMoveDown(); }} style={{ height: 22, width: 22, padding: 0, minWidth: 0 }}><DownOutlined style={{ color: 'white', fontSize: 10 }} /></Button>
        <Button type="text" size="small" onClick={e => { e.stopPropagation(); onRemove(); }} style={{ height: 22, width: 22, padding: 0, minWidth: 0 }}><CloseOutlined style={{ color: 'white', fontSize: 10 }} /></Button>
      </div>
      <div
        onClick={onSelect}
        style={{
          cursor: 'pointer', ...pad, background: bg,
          outline: selected ? '2px solid #1890ff' : '2px solid transparent',
          outlineOffset: -1,
          transition: 'outline .1s',
        }}
      >
        {content}
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
  const [open, setOpen] = useState(false);
  const d = block.design;
  return (
    <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 12, paddingTop: 10 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: open ? 10 : 0 }}
      >
        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Diseño</Text>
        <Text type="secondary" style={{ fontSize: 10 }}>{open ? '▲' : '▼'}</Text>
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 3 }}>Padding sup.</Text>
              <InputNumber size="small" value={d.paddingTop} onChange={v => onUpdate({ paddingTop: v ?? 0 })} style={{ width: '100%' }} min={0} />
            </div>
            <div style={{ flex: 1 }}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 3 }}>Padding inf.</Text>
              <InputNumber size="small" value={d.paddingBottom} onChange={v => onUpdate({ paddingBottom: v ?? 0 })} style={{ width: '100%' }} min={0} />
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
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 3 }}>Color de fondo</Text>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="color" value={d.bgColor === 'transparent' ? '#ffffff' : d.bgColor} onChange={e => onUpdate({ bgColor: e.target.value })} style={{ width: 30, height: 26, border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer', padding: 2 }} />
              <Button size="small" onClick={() => onUpdate({ bgColor: 'transparent' })}>Transparente</Button>
            </div>
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

export default function EditorView({ rule, onChange, onBack, onSendTest }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const blocks = rule.blocks;

  function addBlock(type: BlockType) {
    const b = makeBlock(type);
    onChange({ ...rule, blocks: [...blocks, b] });
    setSelectedId(b.id);
    setTimeout(() => canvasRef.current?.scrollTo({ top: canvasRef.current.scrollHeight, behavior: 'smooth' }), 50);
  }
  function updateBlock(b: Block) { onChange({ ...rule, blocks: blocks.map(x => x.id === b.id ? b : x) }); }
  function moveUp(id: string) { const i = blocks.findIndex(b => b.id === id); if (i > 0) { const nb = [...blocks]; [nb[i-1], nb[i]] = [nb[i], nb[i-1]]; onChange({ ...rule, blocks: nb }); } }
  function moveDown(id: string) { const i = blocks.findIndex(b => b.id === id); if (i < blocks.length - 1) { const nb = [...blocks]; [nb[i], nb[i+1]] = [nb[i+1], nb[i]]; onChange({ ...rule, blocks: nb }); } }
  function removeBlock(id: string) { onChange({ ...rule, blocks: blocks.filter(b => b.id !== id) }); if (selectedId === id) setSelectedId(null); }
  const selectedBlock = blocks.find(b => b.id === selectedId) ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '600px', background: '#f5f5f5' }}>
      {/* Topbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 10, height: 52, flexShrink: 0, boxShadow: '0 1px 4px rgba(0,21,41,.08)', zIndex: 20 }}>
        <Button type="text" icon={<LeftOutlined />} onClick={onBack} style={{ color: 'rgba(0,0,0,.45)' }}>
          Volver al wizard
        </Button>
        <div style={{ width: 1, height: 18, background: '#d9d9d9', flexShrink: 0 }} />
        <Text style={{ fontSize: 13, fontWeight: 500 }}>{rule.name}</Text>
        <div style={{ flex: 1 }} />
        <Button icon={<SendOutlined />} onClick={onSendTest} style={{ borderColor: '#13c2c2', color: '#13c2c2', background: '#e6fffb' }}>
          Enviar prueba
        </Button>
        <Button type="primary" icon={<SaveOutlined />} onClick={onBack}>
          Guardar diseño
        </Button>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 500 }}>
        {/* Canvas */}
        <div ref={canvasRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#f5f5f5' }}>
          {/* Subject bar */}
          <div style={{ maxWidth: 580, margin: '0 auto 12px', display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', background: '#fff', borderRadius: 6, border: '1px solid #f0f0f0' }}>
            <Text type="secondary" style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', flexShrink: 0 }}>ASUNTO</Text>
            {editingSubject ? (
              <Input
                autoFocus size="small" bordered={false}
                value={rule.subject} onChange={e => onChange({ ...rule, subject: e.target.value })}
                onBlur={() => setEditingSubject(false)} onKeyDown={e => e.key === 'Enter' && setEditingSubject(false)}
                style={{ flex: 1, padding: 0 }}
              />
            ) : (
              <>
                <span style={{ flex: 1, fontSize: 13, color: rule.subject ? 'rgba(0,0,0,.85)' : 'rgba(0,0,0,.25)' }}
                  dangerouslySetInnerHTML={{ __html: rule.subject ? renderVars(rule.subject) : 'Sin asunto…' }}
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
                {blocks.map(b => (
                  <BlockCanvas key={b.id} block={b} selected={selectedId === b.id}
                    onSelect={() => setSelectedId(b.id)} onMoveUp={() => moveUp(b.id)}
                    onMoveDown={() => moveDown(b.id)} onRemove={() => removeBlock(b.id)} />
                ))}
                <div
                  onClick={() => document.getElementById('palette-section')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{ padding: 14, textAlign: 'center', cursor: 'pointer', borderTop: '1px dashed #d9d9d9' }}
                >
                  <Text type="secondary" style={{ fontSize: 12 }}><PlusOutlined style={{ marginRight: 4 }} />Agregar bloque</Text>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ width: 272, background: '#fff', borderLeft: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0 }}>
          {/* Zona A */}
          <div id="palette-section" style={{ padding: '14px 12px', borderBottom: '1px solid #f0f0f0' }}>
            <Text type="secondary" style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Bloques</Text>
            <Text type="secondary" style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Estructura</Text>
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

          {/* Zona B */}
          <div style={{ padding: '14px 12px', flex: 1 }}>
            <Text type="secondary" style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Configuración</Text>
            {selectedBlock
              ? <BlockConfig block={selectedBlock} onUpdate={updateBlock} />
              : <Text type="secondary" style={{ fontSize: 12 }}>Selecciona un bloque del canvas para configurarlo aquí.</Text>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
