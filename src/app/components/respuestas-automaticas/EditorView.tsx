import { useState, useRef, useEffect } from 'react';
import {
  App, Button, Input, Card, Typography, Divider, Switch, Tag,
  InputNumber, Radio, Checkbox, Tooltip, Segmented, Modal, ConfigProvider, Select, Slider,
} from 'antd';
import type { InputRef } from 'antd';
import {
  BiSend, BiCopy, BiX, BiPlus, BiBold, BiAlignLeft,
  BiAlignMiddle, BiAlignRight, BiMinus, BiListUl,
  BiBolt, BiMove, BiTable, BiImage, BiLink,
  BiExpandVertical, BiShareAlt, BiInfoCircle, BiErrorCircle, BiHelpCircle,
  BiUpload, BiSearch,
} from 'react-icons/bi';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CodeMirror from '@uiw/react-codemirror';
import { html as htmlLang } from '@codemirror/lang-html';
import {
  AutoResponse, Row, Column, RowDesign, Component, ComponentType, ComponentDesign, EmailLayoutConfig, TextAlign,
  AiBlock, TextBlock, TitleBlock, HeaderBlock, ResponsesBlock, Pregunta,
  ImageComponent, ButtonComponent, SpacerComponent, SocialComponent, SocialNetworkKey, Tone, AiLanguage,
} from './types';
import { VARIABLES, PREGUNTAS_EJEMPLO, mockAnswerFor, TONO_LABELS, IDIOMA_LABELS, HEADER_COLORS, DEFAULT_RESTRICTIONS, RESTRICCION_SUGERENCIAS, SETUP, mockGenerateAiText, countComponents } from './data';
import { cuid } from './cuid';
import TestModal from './TestModal';

const { Text } = Typography;
const { TextArea } = Input;

interface Props {
  rule: AutoResponse;
  onChange: (r: AutoResponse) => void;
  onBack: () => void;
}

// Tema local del editor: tipografía Roboto/14px y esquinas redondeadas para
// todos los controles AntD del panel de propiedades, sin afectar el resto de la app.
const EDITOR_THEME = {
  token: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: 14,
    fontSizeSM: 14,
    borderRadius: 8,
  },
};

// Ícono circular usado en los modales de decisión (confirmar/advertir), siguiendo
// las reglas visuales de Estudios: círculo de color suave + ícono, sin el ícono
// grande por defecto de AntD.
function decisionIcon(tone: 'info' | 'warning') {
  const palette = tone === 'info' ? { bg: '#e6f4ff', fg: '#1890ff' } : { bg: '#fffbe6', fg: '#faad14' };
  const Icon = tone === 'info' ? BiInfoCircle : BiErrorCircle;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: palette.bg, marginRight: 8 }}>
      <Icon style={{ color: palette.fg, fontSize: 14 }} />
    </span>
  );
}
const ROUND_BTN = { style: { borderRadius: 8 } };

// Panel de propiedades — al menos 35% del ancho del editor, con un piso/techo en px
// para que no se vuelva inusable en pantallas muy angostas ni excesivo en muy anchas.
const SIDEBAR_WIDTH: React.CSSProperties = { width: '36%', minWidth: 380, maxWidth: 560, flexShrink: 0 };

// ─── Construcción de filas/columnas/componentes ───────────────────────────────

const DEFAULT_COMPONENT_DESIGN: ComponentDesign = {
  paddingTop: 24, paddingBottom: 24, paddingLeft: 0, paddingRight: 0,
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
    case 'ai':        return {
      id, type, objetivo: '', tone: 'empatico' as Tone, customTone: '', restricciones: [...DEFAULT_RESTRICTIONS], idioma: 'es' as AiLanguage, generatedText: '',
      textBgColor: '#F5F3FF', textColor: '#4C1D95', fontSize: 13, lineHeight: 1.75, fontStyle: 'italic', fontWeight: '400',
      cardBorderColor: '#DDD6FE', cardBorderWidth: 1, cardBorderStyle: 'solid', cardBorderRadius: 10,
      design,
    };
    case 'responses': return {
      id, type,
      questions: PREGUNTAS_EJEMPLO.map(q => ({ questionId: q.id, included: true })),
      displayStyle: 'bold-indented', showQuestion: true, rowGap: 10,
      containerWidth: 100, containerBorderRadius: 10,
      headerLabel: 'Tus respuestas', headerColor: '#9CA3AF', headerSize: 10,
      questionColor: '#1E293B', questionBg: 'transparent', questionSize: 13, questionWeight: '700',
      answerColor: '#475569', answerBg: 'transparent', answerSize: 13, answerWeight: '400',
      accentColor: '#E2E8F0', accentWidth: 2,
      separatorStyle: 'solid', separatorColor: '#E5E7EB',
      design,
    };
    case 'divider':   return { id, type, design };
    case 'image':     return { id, type, src: '', alt: '', dynamic: false, widthPercent: 100, design };
    case 'button':    return { id, type, text: 'Responder estudio', url: '', bgColor: '#1890ff', textColor: '#ffffff', design };
    case 'spacer':    return { id, type, height: 24, design };
    case 'social':    return { id, type, style: 'negro', size: 26, gap: 12, shape: 'square', networks: SOCIAL_KEYS.map(k => ({ network: k, included: false, url: '' })), design };
    default: return { id, type: 'divider', design };
  }
}

function makeRow(widths: number[]): Row {
  return {
    id: cuid(),
    columns: widths.map(w => ({ id: cuid(), widthPercent: w, components: [] })),
    design: { bgColor: 'transparent', textAlign: 'left', paddingTop: 24, paddingBottom: 24, paddingLeft: 0, paddingRight: 0, borderStyle: 'none', borderWidth: 0, borderColor: '#000000', hideMobile: false },
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

const COMPONENT_PALETTE: { type: ComponentType; label: string; sub: string; icon: React.ReactNode }[] = [
  { type: 'header', label: 'Header de marca', sub: 'Logo y color corporativo', icon: <BiBold /> },
  { type: 'title', label: 'Título', sub: 'Texto grande destacado', icon: 'T' },
  { type: 'text', label: 'Texto', sub: 'Con variables del encuestado', icon: <BiAlignLeft /> },
  { type: 'image', label: 'Imagen', sub: 'Estática o dinámica', icon: <BiImage /> },
  { type: 'button', label: 'Botón', sub: 'Llamado a la acción', icon: <BiLink /> },
  { type: 'divider', label: 'Divisor', sub: 'Línea separadora', icon: <BiMinus /> },
  { type: 'spacer', label: 'Espaciador', sub: 'Espacio en blanco', icon: <BiExpandVertical /> },
  { type: 'social', label: 'Redes Sociales', sub: 'Íconos con enlaces', icon: <BiShareAlt /> },
  { type: 'ai', label: 'Bloque IA', sub: 'Texto único por encuestado', icon: '✦' },
  { type: 'responses', label: 'Bloque de respuestas', sub: 'Las respuestas del encuestado', icon: <BiListUl /> },
];

const SOCIAL_ICONS: Record<SocialNetworkKey, string> = { facebook: '📘', instagram: '📷', linkedin: '💼', youtube: '▶️', x: '✖️', pinterest: '📌' };
const SOCIAL_LABELS: Record<SocialNetworkKey, string> = { facebook: 'Facebook', instagram: 'Instagram', linkedin: 'Linkedin', youtube: 'Youtube', x: 'X (Twitter)', pinterest: 'Pinterest' };
const SOCIAL_KEYS: SocialNetworkKey[] = ['facebook', 'instagram', 'linkedin', 'youtube', 'x', 'pinterest'];

// Glifos como HTML puro (texto/SVG con currentColor vía "color", nunca emoji): el correo
// exportado lo renderiza cada cliente con su propio set de fuentes de emoji — Outlook,
// Gmail y Apple Mail difieren tanto que un ícono puede verse irreconocible o como un
// cuadro vacío. Una sola fuente de verdad usada tanto en el HTML exportado como en la
// vista previa del canvas, para que ambos se vean siempre idénticos.
function socialGlyphHtml(network: SocialNetworkKey, color: string): string {
  switch (network) {
    case 'facebook': return `<span style="font-family:Georgia,serif;font-weight:700;font-size:1.05em;color:${color}">f</span>`;
    case 'linkedin': return `<span style="font-family:Arial,sans-serif;font-weight:700;font-size:0.6em;letter-spacing:-0.5px;color:${color}">in</span>`;
    case 'pinterest': return `<span style="font-family:Georgia,serif;font-weight:700;font-size:1em;color:${color}">P</span>`;
    case 'youtube': return `<svg viewBox="0 0 24 24" width="55%" height="55%" fill="${color}"><path d="M8 5v14l11-7z"/></svg>`;
    case 'x': return `<svg viewBox="0 0 24 24" width="50%" height="50%" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>`;
    case 'instagram': return `<svg viewBox="0 0 24 24" width="58%" height="58%" fill="none" stroke="${color}" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="${color}" stroke="none"/></svg>`;
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

function orderedIncludedQuestions(block: ResponsesBlock): Pregunta[] {
  return block.questions
    .filter(bq => bq.included)
    .map(bq => PREGUNTAS_EJEMPLO.find(q => q.id === bq.questionId))
    .filter((q): q is Pregunta => !!q);
}

function componentToHtml(c: Component): string {
  const d = c.design;
  const border = d.borderStyle && d.borderStyle !== 'none' && (d.borderWidth ?? 0) > 0 ? `border:${d.borderWidth}px ${d.borderStyle} ${d.borderColor ?? '#000'};` : '';
  const style = `padding:${d.paddingTop}px ${d.paddingRight ?? 0}px ${d.paddingBottom}px ${d.paddingLeft ?? 0}px;text-align:${d.textAlign};${d.bgColor !== 'transparent' ? `background:${d.bgColor};` : ''}${border}`;
  switch (c.type) {
    case 'header':    return `<div style="${style}background:${c.bgColor};text-align:center;"><span style="font-weight:700;font-size:22px;color:#fff;">${c.name}</span></div>`;
    case 'title':     return `<div style="${style}"><h2 style="font-weight:700;font-size:21px;color:#000;margin:0;">${c.text}</h2></div>`;
    case 'text':      return `<div style="${style}"><p style="font-size:13.5px;line-height:1.75;color:#333;white-space:pre-line;margin:0;">${c.content}</p></div>`;
    case 'ai': {
      const cardBorder = c.cardBorderStyle !== 'none' && c.cardBorderWidth > 0 ? `border:${c.cardBorderWidth}px ${c.cardBorderStyle} ${c.cardBorderColor};` : '';
      return `<div style="${style}"><div style="${cardBorder}border-radius:${c.cardBorderRadius}px;background:${c.textBgColor};overflow:hidden;"><p style="font-size:${c.fontSize}px;line-height:${c.lineHeight};color:${c.textColor};font-style:${c.fontStyle};font-weight:${c.fontWeight};margin:0;padding:13px 15px;">${c.generatedText || '[Texto generado pendiente — envía una prueba]'}</p></div></div>`;
    }
    case 'responses': {
      const included = orderedIncludedQuestions(c);
      const label = `<div style="font-size:${c.headerSize}px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${c.headerColor};margin-bottom:${c.rowGap}px;">${c.headerLabel}</div>`;
      const qStyle = `font-size:${c.questionSize}px;font-weight:${c.questionWeight};color:${c.questionColor};margin-bottom:3px;${c.questionBg !== 'transparent' ? `background:${c.questionBg};padding:4px 6px;border-radius:4px;` : ''}`;
      const sepBorder = c.separatorStyle !== 'none' ? `border-bottom:1px ${c.separatorStyle} ${c.separatorColor};padding-bottom:${Math.floor(c.rowGap / 2)}px;` : '';
      const containerOpen = `<div style="width:${c.containerWidth}%;margin:0 auto;border-radius:${c.containerBorderRadius}px;overflow:hidden;">`;
      if (c.displayStyle === 'table') {
        const rows = included.map(q => `<tr>${c.showQuestion ? `<td style="padding:8px 12px;${qStyle}width:45%;border-top:1px solid #f0f0f0;">${q.texto}</td>` : ''}<td style="padding:8px 12px;font-size:${c.answerSize}px;font-weight:${c.answerWeight};color:${c.answerColor};border-top:1px solid #f0f0f0;">${mockAnswerFor(q)}</td></tr>`).join('');
        return `<div style="${style}">${containerOpen}${label}<table role="presentation" width="100%" style="border-collapse:collapse;border:1px solid #f0f0f0;font-size:12.5px;">${rows}</table></div></div>`;
      }
      const items = included.map((q, i) => {
        const isLast = i === included.length - 1;
        const qLabel = !c.showQuestion ? '' : c.displayStyle === 'bold-indented'
          ? `<strong style="display:block;${qStyle}">${q.texto}</strong>`
          : `<span style="font-weight:${c.questionWeight};color:${c.questionColor};">${q.texto}: </span>`;
        const accentLeft = c.displayStyle === 'bold-indented' ? c.accentWidth + 9 : 0;
        const accentBorder = c.displayStyle === 'bold-indented' ? `border-left:${c.accentWidth}px solid ${c.accentColor};` : '';
        const bgStyle = c.answerBg !== 'transparent'
          ? `background:${c.answerBg};border-radius:4px;padding:4px 8px 4px ${accentLeft + 8}px;`
          : (accentLeft ? `padding-left:${accentLeft}px;` : '');
        const answerStyle = `font-size:${c.answerSize}px;font-weight:${c.answerWeight};color:${c.answerColor};line-height:1.5;${accentBorder}${bgStyle}`;
        return `<div style="margin-bottom:${c.rowGap}px;${!isLast ? sepBorder : ''}">${qLabel}<p style="margin:0;${answerStyle}">${mockAnswerFor(q)}</p></div>`;
      }).join('');
      return `<div style="${style}">${containerOpen}${label}${items}</div></div>`;
    }
    case 'divider':   return `<hr style="margin:${d.paddingTop}px 26px ${d.paddingBottom}px;" />`;
    case 'image':     return `<div style="${style}text-align:center;">${c.src ? `<img src="${c.src}" alt="${c.alt}" style="width:${c.widthPercent}%;" />` : ''}</div>`;
    case 'button':    return `<div style="${style}text-align:center;"><a href="${c.url}" style="display:inline-block;padding:10px 24px;border-radius:6px;background:${c.bgColor};color:${c.textColor};font-weight:600;text-decoration:none;">${c.text}</a></div>`;
    case 'spacer':    return `<div style="${style}height:${c.height}px;"></div>`;
    case 'social': {
      const radius = c.shape === 'circle' ? '50%' : c.shape === 'rounded' ? '6px' : '0';
      const iconBg = c.style === 'negro' ? '#000' : c.style === 'blanco' ? '#fff' : '#1890ff';
      const iconColor = c.style === 'blanco' ? '#000' : '#fff';
      const icons = c.networks.filter(n => n.included).map(n =>
        `<a href="${n.url}" style="display:inline-flex;align-items:center;justify-content:center;width:${c.size}px;height:${c.size}px;background:${iconBg};color:${iconColor};border-radius:${radius};margin:0 ${c.gap / 2}px;text-decoration:none;">${socialGlyphHtml(n.network, iconColor)}</a>`
      ).join('');
      return `<div style="${style}text-align:center;">${icons}</div>`;
    }
    default: return '';
  }
}
function renderRowsToHtml(rows: Row[]): string {
  return rows.map(r => {
    const d = r.design;
    const border = d.borderStyle && d.borderStyle !== 'none' && (d.borderWidth ?? 0) > 0 ? `border:${d.borderWidth}px ${d.borderStyle} ${d.borderColor ?? '#000'};` : '';
    const style = `padding:${d.paddingTop}px ${d.paddingRight ?? 0}px ${d.paddingBottom}px ${d.paddingLeft ?? 0}px;text-align:${d.textAlign ?? 'left'};${d.bgColor !== 'transparent' ? `background:${d.bgColor};` : ''}${border}`;
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
    <div className="blk-toolbar" style={{ transition: 'opacity .15s', position: 'absolute', top: -32, right: 0, zIndex: 5, display: 'flex', gap: 4, background: 'rgba(0,0,0,0.75)', borderRadius: 4, padding: '4px 8px' }}>
      <div ref={dragHandleRef} style={{ height: 22, width: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab' }}>
        <BiMove style={{ color: 'white', fontSize: 10 }} />
      </div>
      <ToolbarBtn title="Insertar debajo" icon={<BiPlus style={{ color: 'white', fontSize: 10 }} />} onClick={onInsertAfter} />
      <ToolbarBtn title="Duplicar" icon={<BiCopy style={{ color: 'white', fontSize: 10 }} />} onClick={onDuplicate} />
      <ToolbarBtn title="Eliminar" icon={<BiX style={{ color: 'white', fontSize: 10 }} />} onClick={onRemove} />
    </div>
  );
}

// ─── Componente en el canvas ──────────────────────────────────────────────────

const ROW_ITEM = 'row-item';
const COMPONENT_ITEM = 'component-item';
const PALETTE_ITEM = 'palette-item';

function renderComponentContent(component: Component): React.ReactNode {
  const align = component.design.textAlign;
  if (component.type === 'header') {
    return (
      <div style={{ background: component.bgColor, padding: '20px 32px', textAlign: 'center' }}>
        <span style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 700, fontSize: 22, color: '#fff', letterSpacing: -0.5 }}>{component.name}</span>
      </div>
    );
  }
  if (component.type === 'title') {
    return <p style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 700, fontSize: 21, color: 'rgba(0,0,0,0.85)', letterSpacing: -0.5, padding: '0 32px', margin: 0, textAlign: align }} dangerouslySetInnerHTML={{ __html: renderVars(component.text) }} />;
  }
  if (component.type === 'text') {
    return <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 13.5, lineHeight: 1.75, color: 'rgba(0,0,0,0.65)', padding: '0 32px', margin: 0, whiteSpace: 'pre-line', textAlign: align }} dangerouslySetInnerHTML={{ __html: renderVars(component.content) }} />;
  }
  if (component.type === 'ai') {
    const configured = component.objetivo.trim() !== '';
    const cardBorder = component.cardBorderStyle !== 'none' && component.cardBorderWidth > 0
      ? `${component.cardBorderWidth}px ${component.cardBorderStyle} ${component.cardBorderColor}` : 'none';
    return (
      <div style={{ border: cardBorder, borderRadius: component.cardBorderRadius, background: component.textBgColor, margin: '0 32px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px 0' }}>
          <Tag color="purple" icon={<BiBolt />} style={{ fontWeight: 600 }}>IA</Tag>
          <Text style={{ fontSize: 12, color: component.textColor }}>
            {configured ? `Tono: ${TONO_LABELS[component.tone]?.label ?? component.tone} · ${component.generatedText ? 'Generado' : 'Pendiente'}` : 'Sin configurar — selecciona para configurar'}
          </Text>
        </div>
        {!configured ? (
          <div style={{ textAlign: 'center', padding: '18px 15px' }}>
            <p style={{ fontSize: 22, margin: '0 0 7px' }}>✦</p>
            <Text strong style={{ display: 'block', color: component.textColor }}>Bloque IA sin objetivo</Text>
            <Text style={{ fontSize: 12, color: component.textColor, opacity: 0.7 }}>Define el objetivo en el panel de configuración.</Text>
          </div>
        ) : (
          <p style={{
            fontFamily: "'Roboto', sans-serif", margin: 0, padding: '13px 15px',
            fontSize: component.fontSize, lineHeight: component.lineHeight,
            fontStyle: component.fontStyle, fontWeight: Number(component.fontWeight), color: component.textColor,
          }}>
            {component.generatedText || 'Usa "Enviar prueba" para ver el texto real.'}
          </p>
        )}
      </div>
    );
  }
  if (component.type === 'responses') {
    const included = orderedIncludedQuestions(component);
    const label = (
      <Text style={{ fontSize: component.headerSize, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: component.headerColor, display: 'block', marginBottom: component.rowGap }}>
        {component.headerLabel}
      </Text>
    );
    const questionStyle: React.CSSProperties = {
      fontSize: component.questionSize, fontWeight: Number(component.questionWeight), color: component.questionColor,
      ...(component.questionBg !== 'transparent' ? { background: component.questionBg, padding: '8px 6px', borderRadius: 4 } : {}),
    };
    const sepStyle: React.CSSProperties = component.separatorStyle !== 'none'
      ? { borderBottom: `1px ${component.separatorStyle} ${component.separatorColor}`, paddingBottom: Math.floor(component.rowGap / 2) }
      : {};
    const containerStyle: React.CSSProperties = { width: `${component.containerWidth}%`, margin: '0 auto', borderRadius: component.containerBorderRadius, overflow: 'hidden' };
    if (component.displayStyle === 'table') {
      return (
        <div style={{ margin: '0 32px' }}>
          <div style={containerStyle}>
            {label}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, border: '1px solid #f0f0f0' }}>
              <tbody>
                {included.map((q, i) => (
                  <tr key={q.id} style={{ borderTop: i > 0 ? '1px solid #f0f0f0' : undefined }}>
                    {component.showQuestion && <td style={{ padding: '12px 16px', width: '45%', ...questionStyle }}>{q.texto}</td>}
                    <td style={{ padding: '12px 16px', fontSize: component.answerSize, fontWeight: Number(component.answerWeight), color: component.answerColor }}>{mockAnswerFor(q)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    return (
      <div style={{ margin: '0 32px' }}>
        <div style={containerStyle}>
        {label}
        {included.map((q, i) => {
          const isLast = i === included.length - 1;
          return (
            <div key={q.id} style={{ marginBottom: component.rowGap, ...(!isLast ? sepStyle : {}) }}>
              {component.showQuestion && component.displayStyle === 'bold-indented' && (
                <Text style={{ display: 'block', marginBottom: 4, ...questionStyle }}>{q.texto}</Text>
              )}
              {component.showQuestion && component.displayStyle === 'list' && (
                <Text style={{ display: 'inline', fontWeight: Number(component.questionWeight), color: component.questionColor }}>{q.texto}: </Text>
              )}
              <p style={{
                margin: 0, fontSize: component.answerSize, fontWeight: Number(component.answerWeight), color: component.answerColor, lineHeight: 1.5,
                paddingLeft: (component.displayStyle === 'bold-indented' ? component.accentWidth + 9 : 0) + (component.answerBg !== 'transparent' ? 8 : 0),
                paddingRight: component.answerBg !== 'transparent' ? 8 : 0,
                paddingTop: component.answerBg !== 'transparent' ? 4 : 0,
                paddingBottom: component.answerBg !== 'transparent' ? 4 : 0,
                borderLeft: component.displayStyle === 'bold-indented' ? `${component.accentWidth}px solid ${component.accentColor}` : 'none',
                background: component.answerBg !== 'transparent' ? component.answerBg : undefined,
                borderRadius: component.answerBg !== 'transparent' ? 4 : undefined,
              }}>
                {mockAnswerFor(q)}
              </p>
            </div>
          );
        })}
        </div>
      </div>
    );
  }
  if (component.type === 'divider') return <Divider style={{ margin: '0 26px', minWidth: 'auto', width: 'auto' }} />;
  if (component.type === 'image') {
    return component.src ? (
      <div style={{ padding: '0 32px', textAlign: 'center' }}>
        <img src={component.src} alt={component.alt} style={{ width: `${component.widthPercent}%`, display: 'inline-block' }} />
      </div>
    ) : (
      <div style={{ margin: '0 32px', padding: '32px', textAlign: 'center', color: '#bfbfbf', border: '1px dashed #d9d9d9', borderRadius: 8 }}>
        <BiImage style={{ fontSize: 24 }} />
        <div style={{ fontSize: 12, marginTop: 8 }}>Sin imagen — selecciónala y define la URL en Diseño</div>
      </div>
    );
  }
  if (component.type === 'button') {
    return (
      <div style={{ textAlign: 'center', padding: '12px 32px' }}>
        <span style={{ display: 'inline-block', padding: '10px 32px', borderRadius: 8, background: component.bgColor, color: component.textColor, fontWeight: 600, fontSize: 14 }}>{component.text}</span>
      </div>
    );
  }
  if (component.type === 'spacer') return <div style={{ height: component.height }} />;
  if (component.type === 'social') {
    const included = component.networks.filter(n => n.included);
    const radius = component.shape === 'circle' ? '50%' : component.shape === 'rounded' ? 6 : 0;
    const iconBg = component.style === 'negro' ? '#000' : component.style === 'blanco' ? '#fff' : '#1890ff';
    const iconColor = component.style === 'blanco' ? '#000' : '#fff';
    return (
      <div style={{ display: 'flex', gap: component.gap, justifyContent: 'center', padding: '12px 32px' }}>
        {included.length === 0
          ? <Text type="secondary" style={{ fontSize: 12 }}>Sin redes configuradas</Text>
          : included.map(n => (
            <span
              key={n.network} title={SOCIAL_LABELS[n.network]}
              style={{
                width: component.size, height: component.size,
                background: iconBg, color: iconColor, borderRadius: radius,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: component.size * 0.55, border: component.style === 'blanco' ? '1px solid #e0e0e0' : undefined,
              }}
              dangerouslySetInnerHTML={{ __html: socialGlyphHtml(n.network, iconColor) }}
            />
          ))}
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

  const d = component.design;
  const pad = { paddingTop: d.paddingTop, paddingBottom: d.paddingBottom, paddingLeft: d.paddingLeft ?? 0, paddingRight: d.paddingRight ?? 0 };
  const bg = d.bgColor !== 'transparent' ? d.bgColor : undefined;
  const border = d.borderStyle && d.borderStyle !== 'none' && (d.borderWidth ?? 0) > 0 ? `${d.borderWidth}px ${d.borderStyle} ${d.borderColor ?? '#000'}` : undefined;

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
        onClick={e => { e.stopPropagation(); onSelect(); }}
        style={{ cursor: 'pointer', ...pad, background: bg, border, boxShadow: selected ? 'inset 0 0 0 2px #1890ff' : 'none', transition: 'box-shadow .1s' }}
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
    <div ref={wrapRef} style={{ position: 'relative', margin: '8px 12px' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', border: '1px dashed #d9d9d9', borderRadius: 8, padding: '14px 0', background: '#fafafa', cursor: 'pointer', color: '#8c8c8c', fontSize: 12 }}>
        <BiPlus style={{ marginRight: 8 }} /> Agregar
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 25, background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: 6, width: 190, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {COMPONENT_PALETTE.map(item => (
            <button key={item.type} onClick={() => { onAdd(item.type); setOpen(false); }} style={{ textAlign: 'left', padding: '5px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, borderRadius: 4 }}>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Zona del canvas que acepta soltar un componente de la paleta ────────────

function AddElementDropZone({ onDropComponent, children }: { onDropComponent: (type: ComponentType) => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: PALETTE_ITEM,
    drop: (item: { componentType?: ComponentType }) => { if (item.componentType) onDropComponent(item.componentType); },
    collect: monitor => ({ isOver: monitor.isOver() }),
  });
  drop(ref);
  return (
    <div ref={ref} style={{ outline: isOver ? '2px dashed var(--ds-violet)' : 'none', outlineOffset: -2, borderRadius: 8, transition: 'outline .1s' }}>
      {children}
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
        onClick={e => { e.stopPropagation(); onSelectRow(); }}
        style={{ cursor: 'pointer', ...pad, background: bg, border, textAlign: d.textAlign ?? 'left', boxShadow: selected ? 'inset 0 0 0 2px #1890ff' : 'none', transition: 'box-shadow .1s' }}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          {row.columns.map(col => (
            <ColumnBox
              key={col.id} column={col}
              onAddComponentToColumn={type => onAddComponentToColumn(type, col.id)}
              selectedComponentId={selectedComponentId}
              onSelectComponent={componentId => onSelectComponent(col.id, componentId)}
              removeComponent={componentId => removeComponent(col.id, componentId)}
              duplicateComponent={componentId => duplicateComponent(col.id, componentId)}
              insertComponentAfter={atIndex => insertComponentAfter(col.id, atIndex)}
              moveComponent={(from, to) => moveComponentInColumn(col.id, from, to)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Columna dentro de una fila — también acepta drops de la paleta ──────────

function ColumnBox({ column, onAddComponentToColumn, selectedComponentId, onSelectComponent, removeComponent, duplicateComponent, insertComponentAfter, moveComponent }: {
  column: Column;
  onAddComponentToColumn: (type: ComponentType) => void;
  selectedComponentId: string | null;
  onSelectComponent: (componentId: string) => void;
  removeComponent: (componentId: string) => void;
  duplicateComponent: (componentId: string) => void;
  insertComponentAfter: (atIndex: number) => void;
  moveComponent: (from: number, to: number) => void;
}) {
  const dropRef = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: PALETTE_ITEM,
    drop: (item: { componentType?: ComponentType }) => {
      if (item.componentType) onAddComponentToColumn(item.componentType);
    },
    collect: monitor => ({ isOver: monitor.isOver({ shallow: true }) }),
  });
  drop(dropRef);
  return (
    <div
      ref={dropRef}
      style={{
        width: `${column.widthPercent}%`, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0,
        background: isOver ? 'var(--ds-violet-bg)' : undefined, borderRadius: isOver ? 6 : undefined,
        outline: isOver ? '1.5px dashed var(--ds-violet)' : 'none', transition: 'background .1s',
      }}
    >
      {column.components.length === 0 ? (
        <EmptyColumnSlot onAdd={onAddComponentToColumn} />
      ) : (
        column.components.map((comp, i) => (
          <ComponentBox
            key={comp.id} component={comp} index={i} columnId={column.id}
            selected={selectedComponentId === comp.id}
            onSelect={() => onSelectComponent(comp.id)}
            onRemove={() => removeComponent(comp.id)}
            onDuplicate={() => duplicateComponent(comp.id)}
            onInsertAfter={() => insertComponentAfter(i)}
            moveComponent={moveComponent}
          />
        ))
      )}
    </div>
  );
}

// ─── Paleta ────────────────────────────────────────────────────────────────────

function PaletteItem({ icon, label, sub, onClick, componentType }: {
  icon: React.ReactNode; label: string; sub: string; onClick: () => void; componentType?: ComponentType;
}) {
  const [{ isDragging }, drag] = useDrag({
    type: PALETTE_ITEM,
    item: () => ({ componentType }),
    canDrag: !!componentType,
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  });
  return (
    <button
      ref={componentType ? drag : undefined}
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '14px 12px', cursor: componentType ? 'grab' : 'pointer', textAlign: 'center',
        border: '1px solid #d9d9d9',
        borderRadius: 8, opacity: isDragging ? 0.4 : 1,
        background: '#fff',
      }}
    >
      <span style={{ fontSize: 20, color: 'rgba(0,0,0,0.45)' }}>{icon}</span>
      <div style={{ fontWeight: 500, fontSize: 12, color: 'rgba(0,0,0,0.85)', lineHeight: 1.3 }}>{label}</div>
      <div style={{ fontSize: 9, color: 'rgba(0,0,0,0.45)', lineHeight: 1.3 }}>{sub}</div>
    </button>
  );
}

function ColumnLayoutPicker({ onPick, onClose }: { onPick: (widths: number[]) => void; onClose: () => void }) {
  return (
    <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 10, marginBottom: 10, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 11 }}>Elige un layout de columnas</Text>
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.45)' }}>✕</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {COLUMN_LAYOUTS.map(l => (
          <button key={l.label} onClick={() => onPick(l.widths)} title={l.label} style={{ display: 'flex', gap: 4, border: '1px solid #d9d9d9', borderRadius: 8, padding: 6, cursor: 'pointer', background: '#fff' }}>
            {l.widths.map((w, i) => <div key={i} style={{ flex: w, height: 24, background: '#e6f4ff', borderRadius: 2 }} />)}
          </button>
        ))}
      </div>
    </div>
  );
}

// Sección "Columnas y tamaños" del tab "Diseño" para una fila ya creada
function ColumnsAndSizesField({ row, onChange }: { row: Row; onChange: (widths: number[]) => void }) {
  const currentWidths = row.columns.map(c => c.widthPercent);
  const isActive = (widths: number[]) => widths.length === currentWidths.length && widths.every((w, i) => Math.abs(w - currentWidths[i]) < 0.5);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
      {COLUMN_LAYOUTS.map(l => (
        <button key={l.label} onClick={() => onChange(l.widths)} title={l.label} style={{
          display: 'flex', gap: 4, borderRadius: 8, padding: 6, cursor: 'pointer',
          border: isActive(l.widths) ? '1.5px solid #1890ff' : '1px solid #d9d9d9',
          background: isActive(l.widths) ? '#e6f4ff' : '#fff',
        }}>
          {l.widths.map((w, i) => <div key={i} style={{ flex: w, height: 24, background: isActive(l.widths) ? '#1890ff' : '#e6f4ff', borderRadius: 2 }} />)}
        </button>
      ))}
    </div>
  );
}

// ─── Selector de color propio (nunca la ventana nativa del SO) ───────────────

const COLOR_PRESETS = ['#1890ff', '#7C3AED', '#059669', '#DC2626', '#0F172A', '#D97706', '#0D9488', '#ffffff', '#000000', '#f5f5f5'];

function ColorPickerField({ value, onChange, allowTransparent, full }: { value: string; onChange: (c: string) => void; allowTransparent?: boolean; full?: boolean }) {
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

  const swatch = (
    <span style={{
      width: 20, height: 20, borderRadius: 4, flexShrink: 0, border: '1px solid rgba(0,0,0,0.1)',
      background: value === 'transparent' ? 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 8px 8px' : value,
    }} />
  );

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: full ? '100%' : undefined, flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: full ? '100%' : 32, height: 32, borderRadius: 8, border: '1px solid #d9d9d9', cursor: 'pointer',
          padding: full ? '0 10px' : 0, display: 'flex', alignItems: 'center', justifyContent: full ? 'flex-start' : 'center', gap: 12, background: '#fff', boxSizing: 'border-box',
        }}
      >
        {swatch}
        {full && (
          <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)', fontFamily: "'JetBrains Mono', monospace" }}>
            {value === 'transparent' ? 'Transparente' : value}
          </span>
        )}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 36, left: 0, zIndex: 30, background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: 10, width: 200 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 12 }}>
            {COLOR_PRESETS.map(c => (
              <button
                key={c} type="button" onClick={() => { onChange(c); setOpen(false); }}
                style={{ width: 26, height: 26, borderRadius: 4, background: c, border: '1px solid #f0f0f0', cursor: 'pointer', padding: 0 }}
              />
            ))}
          </div>
          <Input
            placeholder="#RRGGBB"
            value={value === 'transparent' ? '' : value}
            onChange={e => onChange(e.target.value)}
          />
          {allowTransparent && (
            <Button block style={{ marginTop: 12 }} onClick={() => { onChange('transparent'); setOpen(false); }}>
              Transparente
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sección colapsable — usada en toda la pestaña "Diseño" ──────────────────

function CollapsibleSection({ title, children, defaultOpen = true, compact }: { title: string; children: React.ReactNode; defaultOpen?: boolean; compact?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  if (compact) {
    return (
      <div style={{ border: '1px solid #f0f0f0', borderRadius: 8 }}>
        <div
          onClick={() => setOpen(o => !o)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '9px 16px' }}
        >
          <Text style={{ fontSize: 12.5, fontWeight: 500 }}>{title}</Text>
          <span style={{ color: 'rgba(0,0,0,0.35)', fontSize: 10 }}>{open ? '▲' : '▼'}</span>
        </div>
        {open && <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 16px 14px' }}>{children}</div>}
      </div>
    );
  }
  return (
    <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 24, marginBottom: 24 }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: open ? 14 : 0 }}>
        <Text style={{ fontSize: 14, fontWeight: 500 }}>{title}</Text>
        <span style={{ color: 'rgba(0,0,0,0.35)', fontSize: 11 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>{children}</div>}
    </div>
  );
}

// ─── Campos compartidos de diseño (fila / componente) ────────────────────────

function FieldLabel({ children, inline, tooltip }: { children: React.ReactNode; inline?: boolean; tooltip?: string }) {
  return (
    <Text style={{ fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.65)', display: inline ? 'inline' : 'block', marginBottom: inline ? 0 : 6 }}>
      {children}
      {tooltip && (
        <Tooltip title={tooltip}>
          <BiHelpCircle style={{ marginLeft: 5, fontSize: 12, color: 'rgba(0,0,0,0.35)', cursor: 'help' }} />
        </Tooltip>
      )}
    </Text>
  );
}
function PaddingField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>{label}</Text>
      <InputNumber value={value} onChange={v => onChange(v ?? 0)} style={{ width: '100%' }} min={0} addonAfter="px" />
    </div>
  );
}
function BorderFields({ borderColor, borderWidth, borderStyle, onUpdate }: {
  borderColor: string; borderWidth: number; borderStyle: 'solid' | 'dotted' | 'none';
  onUpdate: (p: { borderColor?: string; borderWidth?: number; borderStyle?: 'solid' | 'dotted' | 'none' }) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <FieldLabel>Borde</FieldLabel>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <ColorPickerField value={borderColor} onChange={c => onUpdate({ borderColor: c })} />
        <InputNumber min={0} value={borderWidth} onChange={v => onUpdate({ borderWidth: v ?? 0 })} style={{ flex: 1 }} addonAfter="px" />
      </div>
      <Radio.Group value={borderStyle} onChange={e => onUpdate({ borderStyle: e.target.value })} style={{ display: 'flex', width: '100%' }}>
        <Radio.Button value="solid" style={{ flex: 1, textAlign: 'center', paddingInline: 4 }}>Sólido</Radio.Button>
        <Radio.Button value="dotted" style={{ flex: 1, textAlign: 'center', paddingInline: 4 }}>Punteado</Radio.Button>
        <Radio.Button value="none" style={{ flex: 1, textAlign: 'center', paddingInline: 4 }}>Ninguno</Radio.Button>
      </Radio.Group>
    </div>
  );
}
function PaddingGrid({ design, onUpdate }: { design: { paddingTop: number; paddingBottom: number; paddingLeft?: number; paddingRight?: number }; onUpdate: (p: object) => void }) {
  return (
    <div>
      <FieldLabel>Relleno</FieldLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <PaddingField label="Arriba" value={design.paddingTop} onChange={v => onUpdate({ paddingTop: v })} />
        <PaddingField label="Abajo" value={design.paddingBottom} onChange={v => onUpdate({ paddingBottom: v })} />
        <PaddingField label="Izquierda" value={design.paddingLeft ?? 0} onChange={v => onUpdate({ paddingLeft: v })} />
        <PaddingField label="Derecha" value={design.paddingRight ?? 0} onChange={v => onUpdate({ paddingRight: v })} />
      </div>
    </div>
  );
}

// Tab "Configuración" — layout global del correo (fijo, no depende de la selección)
function LayoutConfigFields({ layout, onUpdate }: { layout: EmailLayoutConfig; onUpdate: (p: Partial<EmailLayoutConfig>) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <FieldLabel>Ancho del contenido</FieldLabel>
        <InputNumber value={layout.widthPercent} min={10} max={100} addonAfter="%" onChange={v => onUpdate({ widthPercent: v ?? 100 })} style={{ width: '100%' }} />
      </div>
      <div>
        <FieldLabel>Estilo del contenedor</FieldLabel>
        <Radio.Group value={layout.boxed} onChange={e => onUpdate({ boxed: e.target.value })} style={{ display: 'flex', width: '100%' }}>
          <Radio.Button value={true} style={{ flex: 1, textAlign: 'center', paddingInline: 4 }}>Con margen</Radio.Button>
          <Radio.Button value={false} style={{ flex: 1, textAlign: 'center', paddingInline: 4 }}>Ancho completo</Radio.Button>
        </Radio.Group>
      </div>
      <div>
        <FieldLabel>Color de fondo</FieldLabel>
        <ColorPickerField value={layout.bgColor} onChange={c => onUpdate({ bgColor: c })} allowTransparent full />
      </div>
    </div>
  );
}

// Sección "Bloque" del tab "Diseño" — igual para una fila o un componente seleccionado
function BlockFields<T extends {
  bgColor: string; textAlign?: TextAlign;
  borderColor?: string; borderWidth?: number; borderStyle?: 'solid' | 'dotted' | 'none';
  paddingTop: number; paddingBottom: number; paddingLeft?: number; paddingRight?: number;
  hideMobile?: boolean;
}>({ design, onUpdate, excludeAlign }: { design: T; onUpdate: (p: Partial<T>) => void; excludeAlign?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <FieldLabel>Color de fondo</FieldLabel>
        <ColorPickerField value={design.bgColor} onChange={c => onUpdate({ bgColor: c } as Partial<T>)} allowTransparent full />
      </div>
      {!excludeAlign && (
        <div>
          <FieldLabel>Alineación</FieldLabel>
          <Radio.Group value={design.textAlign ?? 'left'} onChange={e => onUpdate({ textAlign: e.target.value } as Partial<T>)} style={{ display: 'flex', width: '100%' }}>
            <Radio.Button value="left" style={{ flex: 1, textAlign: 'center' }}><BiAlignLeft /></Radio.Button>
            <Radio.Button value="center" style={{ flex: 1, textAlign: 'center' }}><BiAlignMiddle /></Radio.Button>
            <Radio.Button value="right" style={{ flex: 1, textAlign: 'center' }}><BiAlignRight /></Radio.Button>
          </Radio.Group>
        </div>
      )}
      <BorderFields borderColor={design.borderColor ?? '#000000'} borderWidth={design.borderWidth ?? 0} borderStyle={design.borderStyle ?? 'none'} onUpdate={onUpdate} />
      <PaddingGrid design={design} onUpdate={onUpdate} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FieldLabel inline>Ocultar en móvil</FieldLabel>
        <Switch checked={design.hideMobile ?? false} onChange={v => onUpdate({ hideMobile: v } as Partial<T>)} />
      </div>
    </div>
  );
}

// ─── Campos de contenido por tipo de componente (sección específica del tab "Diseño") ────────

function TextContentFields({ block, onUpdate }: { block: TextBlock; onUpdate: (b: Component) => void }) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <FieldLabel>Contenido</FieldLabel>
        <TextArea ref={taRef} rows={4} value={block.content} onChange={e => onUpdate({ ...block, content: e.target.value })} />
      </div>
      <div>
        <FieldLabel>Insertar variable</FieldLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
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
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>Se reemplaza con el dato real al enviarse.</Text>
      </div>
    </div>
  );
}
function AiContentFields({ block, onUpdate }: { block: AiBlock; onUpdate: (b: Component) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: '7px 10px', borderRadius: 8, background: 'var(--ds-violet-bg)', border: '1px solid var(--ds-violet-mid)' }}>
        <Text style={{ fontSize: 12, color: 'var(--ds-violet-dark)' }}>
          ✦ <strong>{SETUP.empresa}</strong> · {SETUP.industria}
        </Text>
        <Text style={{ fontSize: 12, color: 'var(--ds-violet-dark)', display: 'block', marginTop: 3, opacity: 0.85 }}>
          La IA recibe: datos de contacto, variables de la interacción (incluyendo ticket/caso si se generó) y todas las respuestas del encuestado. Solo usa variables cuyo significado entiende con certeza.
        </Text>
      </div>
      <div>
        <FieldLabel>¿Qué debe lograr este bloque? *</FieldLabel>
        <TextArea rows={3} value={block.objetivo} onChange={e => onUpdate({ ...block, objetivo: e.target.value })} placeholder="Ej: Que el cliente sienta que su queja fue escuchada…" />
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>La IA genera texto único usando la respuesta real como contexto.</Text>
      </div>
      <div>
        <FieldLabel tooltip="Ajusta el estilo emocional del texto generado — no cambia lo que dice, solo cómo lo dice.">Tono del mensaje</FieldLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {Object.entries(TONO_LABELS).map(([k, v]) => (
            <Card
              key={k} size="small" hoverable onClick={() => onUpdate({ ...block, tone: k as Tone })}
              style={{ cursor: 'pointer', borderColor: block.tone === k ? 'var(--ds-violet)' : '#d9d9d9', background: block.tone === k ? 'var(--ds-violet-bg)' : '#fff' }}
              styles={{ body: { padding: '6px 12px' } }}
            >
              <Text style={{ fontSize: 12, fontWeight: 500, color: block.tone === k ? 'var(--ds-violet-dark)' : undefined, display: 'block' }}>{v.label}</Text>
              <Text type="secondary" style={{ fontSize: 10 }}>{v.sub}</Text>
            </Card>
          ))}
        </div>
        {block.tone === 'custom' && <Input style={{ marginTop: 6 }} value={block.customTone} onChange={e => onUpdate({ ...block, customTone: e.target.value })} placeholder="Describe el tono…" />}
      </div>
      <div>
        <FieldLabel tooltip="Solo aplica al texto que genera este bloque IA. El resto del correo mantiene su propio idioma.">Idioma del texto generado</FieldLabel>
        <Select
          style={{ width: '100%' }} value={block.idioma}
          onChange={v => onUpdate({ ...block, idioma: v as AiLanguage })}
          options={Object.entries(IDIOMA_LABELS).map(([value, label]) => ({ value, label }))}
        />
      </div>
      <div>
        <FieldLabel tooltip="La IA nunca hará ni sugerirá estas acciones, sin importar el objetivo o el tono elegidos. Elige de la lista o escribe la tuya y presiona Enter.">Acciones prohibidas</FieldLabel>
        <Select
          mode="tags" style={{ width: '100%' }} value={block.restricciones}
          onChange={v => onUpdate({ ...block, restricciones: v })}
          options={RESTRICCION_SUGERENCIAS.map(r => ({ value: r, label: r }))}
          placeholder="Elige o escribe una acción prohibida…"
          tokenSeparators={[',', ';']}
        />
      </div>

      <SubSectionHeading>Texto generado</SubSectionHeading>
      <div>
        <FieldLabel>Color del texto</FieldLabel>
        <ColorPickerField value={block.textColor} onChange={c => onUpdate({ ...block, textColor: c })} />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel>Tamaño px</FieldLabel>
          <InputNumber min={10} max={24} value={block.fontSize} onChange={v => onUpdate({ ...block, fontSize: v ?? 13 })} style={{ width: '100%' }} />
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel tooltip="Espacio vertical entre líneas del párrafo generado.">Interlineado</FieldLabel>
          <Select
            style={{ width: '100%' }} value={block.lineHeight}
            onChange={v => onUpdate({ ...block, lineHeight: v })}
            options={[
              { value: 1.4, label: 'Compacto' },
              { value: 1.6, label: 'Normal' },
              { value: 1.75, label: 'Cómodo' },
              { value: 2.0, label: 'Espaciado' },
            ]}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel tooltip="Cursiva o normal — el formato tipográfico del párrafo generado.">Estilo</FieldLabel>
          <Radio.Group value={block.fontStyle} onChange={e => onUpdate({ ...block, fontStyle: e.target.value })} style={{ display: 'flex', width: '100%' }}>
            <Radio.Button value="italic" style={{ flex: 1, textAlign: 'center', fontStyle: 'italic' }}>Cursiva</Radio.Button>
            <Radio.Button value="normal" style={{ flex: 1, textAlign: 'center' }}>Normal</Radio.Button>
          </Radio.Group>
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>Peso</FieldLabel>
          <WeightField value={block.fontWeight} onChange={v => onUpdate({ ...block, fontWeight: v })} />
        </div>
      </div>

      <SubSectionHeading>Tarjeta</SubSectionHeading>
      <div>
        <FieldLabel tooltip="El color de fondo de toda la tarjeta que envuelve el texto generado.">Fondo</FieldLabel>
        <ColorPickerField value={block.textBgColor} onChange={c => onUpdate({ ...block, textBgColor: c })} allowTransparent full />
      </div>
      <div>
        <FieldLabel>Color del borde</FieldLabel>
        <ColorPickerField value={block.cardBorderColor} onChange={c => onUpdate({ ...block, cardBorderColor: c })} />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel>Grosor borde</FieldLabel>
          <InputNumber min={0} max={8} value={block.cardBorderWidth} onChange={v => onUpdate({ ...block, cardBorderWidth: v ?? 1 })} style={{ width: '100%' }} addonAfter="px" />
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>Estilo borde</FieldLabel>
          <Radio.Group value={block.cardBorderStyle} onChange={e => onUpdate({ ...block, cardBorderStyle: e.target.value })} style={{ display: 'flex', width: '100%' }}>
            <Radio.Button value="solid" style={{ flex: 1, textAlign: 'center', paddingInline: 4 }}>Sólido</Radio.Button>
            <Radio.Button value="dotted" style={{ flex: 1, textAlign: 'center', paddingInline: 4 }}>Punteado</Radio.Button>
            <Radio.Button value="none" style={{ flex: 1, textAlign: 'center', paddingInline: 4 }}>Ninguno</Radio.Button>
          </Radio.Group>
        </div>
      </div>
      <div>
        <FieldLabel>Radio de esquinas — {block.cardBorderRadius}px</FieldLabel>
        <Slider min={0} max={24} value={block.cardBorderRadius} onChange={v => onUpdate({ ...block, cardBorderRadius: v })} tooltip={{ formatter: v => `${v}px` }} />
      </div>
    </div>
  );
}
function HeaderContentFields({ block, onUpdate }: { block: HeaderBlock; onUpdate: (b: Component) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <FieldLabel>Nombre o logo</FieldLabel>
        <Input value={block.name} onChange={e => onUpdate({ ...block, name: e.target.value })} />
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
      <Input value={block.text} onChange={e => onUpdate({ ...block, text: e.target.value })} />
    </div>
  );
}
function SubSectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)', borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginTop: 8 }}>
      {children}
    </div>
  );
}
function WeightField({ value, onChange }: { value: '400' | '600' | '700'; onChange: (v: '400' | '600' | '700') => void }) {
  return (
    <Radio.Group value={value} onChange={e => onChange(e.target.value)} style={{ display: 'flex', width: '100%' }}>
      <Radio.Button value="400" style={{ flex: 1, textAlign: 'center', paddingInline: 4 }}>Normal</Radio.Button>
      <Radio.Button value="600" style={{ flex: 1, textAlign: 'center', paddingInline: 4 }}>Semi</Radio.Button>
      <Radio.Button value="700" style={{ flex: 1, textAlign: 'center', paddingInline: 4 }}>Bold</Radio.Button>
    </Radio.Group>
  );
}

// Fila de búsqueda — sin drag, solo para tildar/destildar. Se usa con la lista completa
// de preguntas del estudio (hasta ~36), filtrable por texto o tipo.
const QUESTION_ORDER_ITEM = 'question-order-item';

// Fila única de selección + orden: las preguntas incluidas se arrastran para definir su
// posición en el correo; las no incluidas solo tienen checkbox para agregarlas. Evita
// mostrar la misma pregunta en dos listas separadas (una para elegir, otra para ordenar).
function QuestionPickerRow({ q, index, included, onToggle, moveItem }: {
  q: Pregunta; index: number; included: boolean; onToggle: (included: boolean) => void;
  moveItem: (from: number, to: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop({
    accept: QUESTION_ORDER_ITEM,
    hover(item: { index: number }, monitor) {
      if (!included || !ref.current) return;
      const dragIndex = item.index, hoverIndex = index;
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
    type: QUESTION_ORDER_ITEM,
    item: () => ({ index }),
    canDrag: included,
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  });
  drag(handleRef);
  if (included) drop(ref);
  return (
    <div
      ref={ref}
      onClick={() => onToggle(!included)}
      style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #f0f0f0', borderRadius: 8, padding: '6px 12px', background: included ? '#e6f7ff' : '#fff', opacity: isDragging ? 0.4 : 1, cursor: 'pointer' }}
    >
      {included ? (
        <div ref={handleRef} onClick={e => e.stopPropagation()} style={{ cursor: 'grab', color: 'rgba(0,0,0,0.35)', display: 'flex', flexShrink: 0 }}>
          <BiMove style={{ fontSize: 12 }} />
        </div>
      ) : (
        <div style={{ width: 12, flexShrink: 0 }} />
      )}
      <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)', flexShrink: 0, width: 14 }}>{included ? index + 1 : ''}</Text>
      <Checkbox checked={included} onChange={e => onToggle(e.target.checked)} onClick={e => e.stopPropagation()} />
      <Text style={{ fontSize: 12, flex: 1 }} ellipsis={{ tooltip: q.texto }}>{q.texto}</Text>
      <Tag style={{ margin: 0, fontSize: 12, flexShrink: 0 }}>{q.tipo}</Tag>
    </div>
  );
}

function ResponsesContentFields({ block, onUpdate }: { block: ResponsesBlock; onUpdate: (b: Component) => void }) {
  const [search, setSearch] = useState('');
  const withMeta = block.questions
    .map(bq => ({ bq, q: PREGUNTAS_EJEMPLO.find(x => x.id === bq.questionId) }))
    .filter((x): x is { bq: typeof x.bq; q: Pregunta } => !!x.q);
  const included = withMeta.filter(x => x.bq.included);
  const term = search.trim().toLowerCase();
  const matches = (q: Pregunta) => !term || q.texto.toLowerCase().includes(term) || q.tipo.toLowerCase().includes(term);
  const includedFiltered = included.filter(({ q }) => matches(q));
  const excludedFiltered = withMeta.filter(x => !x.bq.included && matches(x.q));

  function toggleQuestion(questionId: string, isIncluded: boolean) {
    onUpdate({ ...block, questions: block.questions.map(q => q.questionId === questionId ? { ...q, included: isIncluded } : q) });
  }
  function setIncludedFor(ids: string[], isIncluded: boolean) {
    onUpdate({ ...block, questions: block.questions.map(q => ids.includes(q.questionId) ? { ...q, included: isIncluded } : q) });
  }
  function moveIncluded(from: number, to: number) {
    const includedBqs = block.questions.filter(q => q.included);
    const restBqs = block.questions.filter(q => !q.included);
    const reordered = [...includedBqs];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    onUpdate({ ...block, questions: [...reordered, ...restBqs] });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: '7px 10px', borderRadius: 8, background: '#fafafa', border: '1px solid #f0f0f0', fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
        Cada encuestado verá sus propias respuestas exactas. El contenido es dinámico y único por persona.
      </div>

      <CollapsibleSection compact title={`Preguntas incluidas (${included.length})`}>
        <div>
          <FieldLabel>Buscar preguntas del estudio</FieldLabel>
          <Input
            allowClear value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por texto o tipo…" prefix={<BiSearch style={{ color: 'rgba(0,0,0,0.25)' }} />}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {term ? (
              <>
                <Button onClick={() => setIncludedFor([...includedFiltered, ...excludedFiltered].map(x => x.q.id), true)}>
                  Seleccionar coincidencias ({includedFiltered.length + excludedFiltered.length})
                </Button>
                <Button onClick={() => setIncludedFor([...includedFiltered, ...excludedFiltered].map(x => x.q.id), false)}>
                  Quitar coincidencias
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIncludedFor(withMeta.map(x => x.q.id), true)}>
                  Seleccionar todas ({withMeta.length})
                </Button>
                <Button onClick={() => setIncludedFor(withMeta.map(x => x.q.id), false)} disabled={included.length === 0}>
                  Quitar todas
                </Button>
              </>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto', marginTop: 12, paddingRight: 4 }}>
            {includedFiltered.length === 0 && excludedFiltered.length === 0 && (
              <Text type="secondary" style={{ fontSize: 12, padding: '12px 0' }}>Sin resultados para "{search}".</Text>
            )}
            {includedFiltered.map(({ q }) => (
              <QuestionPickerRow
                key={q.id} q={q} included
                index={included.findIndex(x => x.q.id === q.id)}
                onToggle={checked => toggleQuestion(q.id, checked)}
                moveItem={moveIncluded}
              />
            ))}
            {includedFiltered.length > 0 && excludedFiltered.length > 0 && (
              <div style={{ borderTop: '1px dashed #e8e8e8', margin: '4px 0' }} />
            )}
            {excludedFiltered.map(({ q }) => (
              <QuestionPickerRow
                key={q.id} q={q} included={false} index={-1}
                onToggle={checked => toggleQuestion(q.id, checked)}
                moveItem={moveIncluded}
              />
            ))}
          </div>
        </div>
        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Marca una pregunta para incluirla · arrastra las incluidas para definir su orden en el correo.</Text>
      </CollapsibleSection>

      <CollapsibleSection compact defaultOpen={false} title="Visualización y contenedor">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <FieldLabel inline>Mostrar enunciado de la pregunta</FieldLabel>
          <Switch size="small" checked={block.showQuestion} onChange={checked => onUpdate({ ...block, showQuestion: checked })} />
        </div>
        <div>
          <FieldLabel>Estilo de visualización</FieldLabel>
          <Select
            style={{ width: '100%' }} value={block.displayStyle}
            onChange={v => onUpdate({ ...block, displayStyle: v as ResponsesBlock['displayStyle'] })}
            options={[
              { value: 'bold-indented', label: 'Pregunta en negrita + respuesta con sangría' },
              { value: 'list', label: 'Solo respuestas en lista' },
              { value: 'table', label: 'Tabla pregunta / respuesta' },
            ]}
          />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FieldLabel>Ancho del contenedor</FieldLabel>
            <InputNumber min={40} max={100} value={block.containerWidth} onChange={v => onUpdate({ ...block, containerWidth: v ?? 100 })} style={{ width: '100%' }} addonAfter="%" />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Radio de esquinas</FieldLabel>
            <InputNumber min={0} max={24} value={block.containerBorderRadius} onChange={v => onUpdate({ ...block, containerBorderRadius: v ?? 0 })} style={{ width: '100%' }} addonAfter="px" />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection compact defaultOpen={false} title="Etiqueta y textos">
        <SubSectionHeading>Etiqueta del bloque</SubSectionHeading>
        <div>
          <FieldLabel>Texto</FieldLabel>
          <Input value={block.headerLabel} onChange={e => onUpdate({ ...block, headerLabel: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FieldLabel>Color</FieldLabel>
            <ColorPickerField value={block.headerColor} onChange={c => onUpdate({ ...block, headerColor: c })} />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Tamaño</FieldLabel>
            <InputNumber min={8} max={16} value={block.headerSize} onChange={v => onUpdate({ ...block, headerSize: v ?? 10 })} style={{ width: '100%' }} addonAfter="px" />
          </div>
        </div>

        <SubSectionHeading>Preguntas</SubSectionHeading>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FieldLabel>Color del texto</FieldLabel>
            <ColorPickerField value={block.questionColor} onChange={c => onUpdate({ ...block, questionColor: c })} />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Fondo de la fila</FieldLabel>
            <ColorPickerField value={block.questionBg} onChange={c => onUpdate({ ...block, questionBg: c })} allowTransparent full />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FieldLabel>Tamaño px</FieldLabel>
            <InputNumber min={9} max={20} value={block.questionSize} onChange={v => onUpdate({ ...block, questionSize: v ?? 13 })} style={{ width: '100%' }} />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Peso</FieldLabel>
            <WeightField value={block.questionWeight} onChange={v => onUpdate({ ...block, questionWeight: v })} />
          </div>
        </div>

        <SubSectionHeading>Respuestas</SubSectionHeading>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FieldLabel>Color del texto</FieldLabel>
            <ColorPickerField value={block.answerColor} onChange={c => onUpdate({ ...block, answerColor: c })} />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Fondo de la respuesta</FieldLabel>
            <ColorPickerField value={block.answerBg} onChange={c => onUpdate({ ...block, answerBg: c })} allowTransparent full />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FieldLabel>Tamaño px</FieldLabel>
            <InputNumber min={9} max={20} value={block.answerSize} onChange={v => onUpdate({ ...block, answerSize: v ?? 13 })} style={{ width: '100%' }} />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Peso</FieldLabel>
            <WeightField value={block.answerWeight} onChange={v => onUpdate({ ...block, answerWeight: v })} />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection compact defaultOpen={false} title="Acento y separadores">
        <SubSectionHeading>Acento lateral</SubSectionHeading>
        <div>
          <FieldLabel>Color del acento</FieldLabel>
          <ColorPickerField value={block.accentColor} onChange={c => onUpdate({ ...block, accentColor: c })} />
        </div>
        <div>
          <FieldLabel>Grosor del acento — {block.accentWidth}px</FieldLabel>
          <Slider min={0} max={8} value={block.accentWidth} onChange={v => onUpdate({ ...block, accentWidth: v })} tooltip={{ formatter: v => `${v}px` }} />
        </div>

        <SubSectionHeading>Separadores y espaciado</SubSectionHeading>
        <div>
          <FieldLabel>Estilo separador</FieldLabel>
          <Radio.Group value={block.separatorStyle} onChange={e => onUpdate({ ...block, separatorStyle: e.target.value })} style={{ display: 'flex', width: '100%' }}>
            <Radio.Button value="solid" style={{ flex: 1, textAlign: 'center', paddingInline: 4 }}>Sólido</Radio.Button>
            <Radio.Button value="dotted" style={{ flex: 1, textAlign: 'center', paddingInline: 4 }}>Punteado</Radio.Button>
            <Radio.Button value="none" style={{ flex: 1, textAlign: 'center', paddingInline: 4 }}>Ninguno</Radio.Button>
          </Radio.Group>
        </div>
        <div>
          <FieldLabel>Color del separador</FieldLabel>
          <ColorPickerField value={block.separatorColor} onChange={c => onUpdate({ ...block, separatorColor: c })} />
        </div>
        <div>
          <FieldLabel>Espacio entre filas — {block.rowGap}px</FieldLabel>
          <Slider min={4} max={32} value={block.rowGap} onChange={v => onUpdate({ ...block, rowGap: v })} tooltip={{ formatter: v => `${v}px` }} />
        </div>
      </CollapsibleSection>
    </div>
  );
}
function ImageContentFields({ block, onUpdate }: { block: ImageComponent; onUpdate: (b: Component) => void }) {
  const urlRef = useRef<InputRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Prototipo sin backend: el "upload" genera una URL local de vista previa
    // (URL.createObjectURL), no sube el archivo a ningún servidor.
    onUpdate({ ...block, src: URL.createObjectURL(file), alt: block.alt || file.name.replace(/\.[^.]+$/, '') });
    e.target.value = '';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <FieldLabel>Origen</FieldLabel>
        <Radio.Group value={block.dynamic} onChange={e => onUpdate({ ...block, dynamic: e.target.value })}>
          <Radio value={false}>Imagen estática</Radio>
          <Radio value={true}>Imagen dinámica</Radio>
        </Radio.Group>
      </div>
      <div>
        <FieldLabel>Imagen</FieldLabel>
        <div style={{ display: 'flex', gap: 12 }}>
          <Input
            ref={urlRef} value={block.src} onChange={e => onUpdate({ ...block, src: e.target.value })}
            placeholder={block.dynamic ? 'https://.../{{variable}}.png' : 'https://...'}
            style={{ flex: 1 }}
          />
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          <Button icon={<BiUpload />} onClick={() => fileInputRef.current?.click()}>Subir</Button>
        </div>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>Sube un archivo o pega el enlace de una imagen.</Text>
      </div>
      {block.dynamic && (
        <div>
          <FieldLabel>Insertar variable</FieldLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {VARIABLES.map(v => (
              <Tag key={v} style={{ cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }} color="blue" onClick={() => {
                const input = urlRef.current?.input;
                const tag = `{{${v}}}`;
                if (!input) { onUpdate({ ...block, src: block.src + tag }); return; }
                const s = input.selectionStart ?? block.src.length, e2 = input.selectionEnd ?? block.src.length;
                const next = block.src.slice(0, s) + tag + block.src.slice(e2);
                onUpdate({ ...block, src: next });
                setTimeout(() => { input.focus(); input.selectionStart = input.selectionEnd = s + tag.length; }, 0);
              }}>
                {`{{${v}}}`}
              </Tag>
            ))}
          </div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>La URL puede incluir una variable para mostrar una imagen distinta por destinatario.</Text>
        </div>
      )}
      <div>
        <FieldLabel>Texto alternativo</FieldLabel>
        <Input value={block.alt} onChange={e => onUpdate({ ...block, alt: e.target.value })} />
      </div>
      <div>
        <FieldLabel>Tamaño</FieldLabel>
        <InputNumber min={10} max={100} value={block.widthPercent} addonAfter="%" onChange={v => onUpdate({ ...block, widthPercent: v ?? 100 })} style={{ width: '100%' }} />
      </div>
    </div>
  );
}
function ButtonContentFields({ block, onUpdate }: { block: ButtonComponent; onUpdate: (b: Component) => void }) {
  const urlRef = useRef<InputRef>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div><FieldLabel>Texto del botón</FieldLabel><Input value={block.text} onChange={e => onUpdate({ ...block, text: e.target.value })} /></div>
      <div>
        <FieldLabel>URL de destino</FieldLabel>
        <Input ref={urlRef} value={block.url} onChange={e => onUpdate({ ...block, url: e.target.value })} placeholder="https://.../{{variable}}" />
      </div>
      <div>
        <FieldLabel>Insertar variable</FieldLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {VARIABLES.map(v => (
            <Tag key={v} style={{ cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }} color="blue" onClick={() => {
              const input = urlRef.current?.input;
              const tag = `{{${v}}}`;
              if (!input) { onUpdate({ ...block, url: block.url + tag }); return; }
              const s = input.selectionStart ?? block.url.length, e2 = input.selectionEnd ?? block.url.length;
              const next = block.url.slice(0, s) + tag + block.url.slice(e2);
              onUpdate({ ...block, url: next });
              setTimeout(() => { input.focus(); input.selectionStart = input.selectionEnd = s + tag.length; }, 0);
            }}>
              {`{{${v}}}`}
            </Tag>
          ))}
        </div>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>El enlace puede incluir una variable para llevar a una URL distinta por destinatario.</Text>
      </div>
      <div><FieldLabel>Color de fondo</FieldLabel><ColorPickerField value={block.bgColor} onChange={c => onUpdate({ ...block, bgColor: c })} full /></div>
      <div><FieldLabel>Color de texto</FieldLabel><ColorPickerField value={block.textColor} onChange={c => onUpdate({ ...block, textColor: c })} full /></div>
    </div>
  );
}
function SpacerContentFields({ block, onUpdate }: { block: SpacerComponent; onUpdate: (b: Component) => void }) {
  return (
    <div>
      <FieldLabel>Tamaño</FieldLabel>
      <InputNumber min={4} max={200} value={block.height} addonAfter="px" onChange={v => onUpdate({ ...block, height: v ?? 24 })} style={{ width: '100%' }} />
    </div>
  );
}
// Swatch real (no un glifo de texto) para que cada opción muestre el radio que en verdad
// va a aplicar — "square" y "rounded" se veían idénticos como caracteres Unicode.
function ShapeSwatch({ shape }: { shape: 'square' | 'rounded' | 'circle' }) {
  const radius = shape === 'circle' ? '50%' : shape === 'rounded' ? 4 : 0;
  return <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid currentColor', borderRadius: radius, verticalAlign: 'middle' }} />;
}
function SocialContentFields({ block, onUpdate }: { block: SocialComponent; onUpdate: (b: Component) => void }) {
  function setEntry(network: SocialNetworkKey, patch: { included?: boolean; url?: string }) {
    onUpdate({ ...block, networks: block.networks.map(n => n.network === network ? { ...n, ...patch } : n) });
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <FieldLabel>Tipo</FieldLabel>
        <Radio.Group value={block.style} onChange={e => onUpdate({ ...block, style: e.target.value })} style={{ width: '100%', display: 'flex' }}>
          <Radio.Button value="negro" style={{ flex: 1, textAlign: 'center' }}>Negro</Radio.Button>
          <Radio.Button value="blanco" style={{ flex: 1, textAlign: 'center' }}>Blanco</Radio.Button>
          <Radio.Button value="color" style={{ flex: 1, textAlign: 'center' }}>Color</Radio.Button>
        </Radio.Group>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel>Tamaño</FieldLabel>
          <InputNumber min={12} max={64} value={block.size} addonAfter="px" onChange={v => onUpdate({ ...block, size: v ?? 26 })} style={{ width: '100%' }} />
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>Espacio entre íconos</FieldLabel>
          <InputNumber min={0} max={40} value={block.gap} addonAfter="px" onChange={v => onUpdate({ ...block, gap: v ?? 8 })} style={{ width: '100%' }} />
        </div>
      </div>
      <div>
        <FieldLabel>Estilo del borde</FieldLabel>
        <Radio.Group value={block.shape} onChange={e => onUpdate({ ...block, shape: e.target.value })} style={{ display: 'flex' }}>
          <Radio.Button value="square" style={{ flex: 1, textAlign: 'center' }}><ShapeSwatch shape="square" /></Radio.Button>
          <Radio.Button value="rounded" style={{ flex: 1, textAlign: 'center' }}><ShapeSwatch shape="rounded" /></Radio.Button>
          <Radio.Button value="circle" style={{ flex: 1, textAlign: 'center' }}><ShapeSwatch shape="circle" /></Radio.Button>
        </Radio.Group>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {block.networks.map(entry => (
          <div key={entry.network}>
            <Checkbox checked={entry.included} onChange={e => setEntry(entry.network, { included: e.target.checked })}>
              <Text style={{ fontSize: 12 }}>{SOCIAL_ICONS[entry.network]} {SOCIAL_LABELS[entry.network]}</Text>
            </Checkbox>
            <Input
              addonBefore="https://" maxLength={300}
              value={entry.url} onChange={e => setEntry(entry.network, { url: e.target.value })}
              placeholder={`www.${SOCIAL_LABELS[entry.network].toLowerCase()}.com/hircasa`}
              style={{ marginTop: 8 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const TYPE_SECTION_TITLE: Partial<Record<ComponentType, string>> = {
  header: 'Encabezado', title: 'Título', text: 'Texto', ai: 'Bloque IA', responses: 'Bloque de respuestas',
  image: 'Imagen', button: 'Botón', spacer: 'Espaciador', social: 'Redes Sociales',
};

function ComponentTypeFields({ component, onUpdate }: { component: Component; onUpdate: (c: Component) => void }) {
  if (component.type === 'text')      return <TextContentFields block={component} onUpdate={onUpdate} />;
  if (component.type === 'ai')        return <AiContentFields block={component} onUpdate={onUpdate} />;
  if (component.type === 'header')    return <HeaderContentFields block={component} onUpdate={onUpdate} />;
  if (component.type === 'title')     return <TitleContentFields block={component} onUpdate={onUpdate} />;
  if (component.type === 'responses') return <ResponsesContentFields block={component} onUpdate={onUpdate} />;
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
  const rootRef = useRef<HTMLDivElement>(null);
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
    setActiveTab('diseno');
    setColumnPickerOpen(false);
    scrollToBottom();
  }
  function addRowAfter(rowId: string, widths: number[]) {
    const row = makeRow(widths);
    const i = rows.findIndex(r => r.id === rowId);
    updateRows(i < 0 ? [...rows, row] : [...rows.slice(0, i + 1), row, ...rows.slice(i + 1)]);
    setSelection({ kind: 'row', rowId: row.id });
    setActiveTab('diseno');
  }
  function addComponentRow(type: ComponentType) {
    const row = makeSingleComponentRow(type);
    updateRows([...rows, row]);
    const comp = row.columns[0].components[0];
    setSelection({ kind: 'component', rowId: row.id, columnId: row.columns[0].id, componentId: comp.id });
    setActiveTab('diseno');
    scrollToBottom();
  }
  function addComponentToColumn(type: ComponentType, rowId: string, columnId: string) {
    const comp = makeComponent(type);
    updateRows(rows.map(r => r.id !== rowId ? r : { ...r, columns: r.columns.map(c => c.id !== columnId ? c : { ...c, components: [...c.components, comp] }) }));
    setSelection({ kind: 'component', rowId, columnId, componentId: comp.id });
    setActiveTab('diseno');
  }
  function insertComponentAfter(rowId: string, columnId: string, atIndex: number) {
    const comp = makeComponent('text');
    updateRows(rows.map(r => r.id !== rowId ? r : { ...r, columns: r.columns.map(c => c.id !== columnId ? c : { ...c, components: [...c.components.slice(0, atIndex + 1), comp, ...c.components.slice(atIndex + 1)] }) }));
    setSelection({ kind: 'component', rowId, columnId, componentId: comp.id });
    setActiveTab('diseno');
  }
  function updateComponent(rowId: string, columnId: string, comp: Component) {
    updateRows(rows.map(r => r.id !== rowId ? r : { ...r, columns: r.columns.map(c => c.id !== columnId ? c : { ...c, components: c.components.map(x => x.id === comp.id ? comp : x) }) }));
  }
  function updateRowDesign(rowId: string, patch: Partial<RowDesign>) {
    updateRows(rows.map(r => r.id === rowId ? { ...r, design: { ...r.design, ...patch } } : r));
  }
  function setRowColumns(rowId: string, widths: number[]) {
    updateRows(rows.map(r => {
      if (r.id !== rowId) return r;
      if (widths.length === r.columns.length) return { ...r, columns: r.columns.map((c, i) => ({ ...c, widthPercent: widths[i] })) };
      const allComponents = r.columns.flatMap(c => c.components);
      return { ...r, columns: widths.map((w, i) => ({ id: cuid(), widthPercent: w, components: i === 0 ? allComponents : [] })) };
    }));
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
      icon: decisionIcon('info'),
      okText: 'Salir sin guardar',
      okButtonProps: { danger: true, ...ROUND_BTN },
      cancelText: 'Seguir editando',
      cancelButtonProps: ROUND_BTN,
      getContainer: () => rootRef.current || document.body,
      styles: { content: { borderRadius: 20 } },
      onOk: () => onBack(),
    });
  }
  function commitSaveDesign() {
    onChange({ ...draft, blocksUpdatedAt: new Date().toISOString() });
    onBack();
  }
  function handleSaveDesign() {
    if (countComponents(draft.rows) === 0) {
      Modal.warning({
        title: 'Acción no permitida',
        content: 'Debes agregar contenido al correo antes de guardarlo.',
        icon: decisionIcon('warning'),
        okButtonProps: ROUND_BTN,
        getContainer: () => rootRef.current || document.body,
      styles: { content: { borderRadius: 20 } },
      });
      return;
    }
    commitSaveDesign();
  }
  function handleModeChange(next: 'visual' | 'html') {
    if (next === 'visual' && draft.customHtml != null) {
      Modal.confirm({
        title: 'Descartar cambios de HTML',
        content: 'Tienes cambios manuales en el HTML que se perderán si vuelves al editor visual.',
        icon: decisionIcon('info'),
        okText: 'Descartar y volver',
        okButtonProps: { danger: true, ...ROUND_BTN },
        cancelText: 'Seguir en HTML',
        cancelButtonProps: ROUND_BTN,
        getContainer: () => rootRef.current || document.body,
      styles: { content: { borderRadius: 20 } },
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

  const cardMaxWidth = 6 * draft.layout.widthPercent;
  const cardStyle: React.CSSProperties = draft.layout.boxed
    ? { maxWidth: cardMaxWidth, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden', minHeight: 180 }
    : { width: '100%', background: '#fff', overflow: 'hidden', minHeight: 180 };

  const subjectBar = (
    <div style={{ maxWidth: cardMaxWidth, margin: '0 auto 10px', display: 'flex', alignItems: 'center', gap: 10, padding: '5px 16px', background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0' }}>
      <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', flexShrink: 0 }}>ASUNTO</Text>
      {editingSubject ? (
        <Input
          autoFocus bordered={false}
          value={draft.subject} onChange={e => updateDraft({ subject: e.target.value })}
          onBlur={() => setEditingSubject(false)} onKeyDown={e => e.key === 'Enter' && setEditingSubject(false)}
          style={{ flex: 1, padding: 0 }}
        />
      ) : (
        <>
          <span style={{ flex: 1, fontSize: 13, color: draft.subject ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.25)' }}
            dangerouslySetInnerHTML={{ __html: draft.subject ? renderVars(draft.subject) : 'Sin asunto…' }}
          />
          <Button onClick={() => setEditingSubject(true)}>Editar</Button>
        </>
      )}
    </div>
  );

  const tabStrip = (
    <div style={{ ...SIDEBAR_WIDTH, display: 'flex', borderLeft: '1px solid #f0f0f0' }}>
      {(['elementos', 'configuracion', 'diseno'] as const).map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          style={{
            flex: 1, border: 'none', background: 'none', cursor: 'pointer',
            borderBottom: activeTab === tab ? '2px solid #1890ff' : '2px solid transparent',
            color: activeTab === tab ? '#1890ff' : 'rgba(0,0,0,0.45)',
            fontSize: 12, fontWeight: activeTab === tab ? 600 : 400,
          }}
        >
          {tab === 'elementos' ? 'Elementos' : tab === 'configuracion' ? 'Configuración' : 'Diseño'}
        </button>
      ))}
    </div>
  );

  return (
    <ConfigProvider theme={EDITOR_THEME}>
    <div ref={rootRef} style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f5f5f5', overflow: 'hidden', fontFamily: "'Roboto', sans-serif", position: 'relative' }}>
      {/* Header fila 1 — título + acciones */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '9px 32px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button
          onClick={handleExit}
          style={{ fontFamily: "'Roboto', sans-serif", fontSize: 13, color: '#1890ff', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          ← Volver al asistente
        </button>
        <div style={{ width: 1, height: 16, background: '#d9d9d9' }} />
        <Text style={{ fontSize: 15, fontWeight: 500, whiteSpace: 'nowrap' }}>Diseño del correo de respuesta</Text>
        <div style={{ flex: 1 }} />
        <Button icon={<BiSend />} onClick={() => setShowTestModal(true)} style={{ borderColor: '#13c2c2', color: '#13c2c2', background: '#e6fffb' }}>
          Enviar prueba
        </Button>
        <Tooltip title={!testValidated ? 'Envía una prueba con el diseño actual antes de guardar' : ''}>
          <Button type="primary" disabled={!testValidated} onClick={handleSaveDesign}>
            Guardar diseño
          </Button>
        </Tooltip>
      </div>

      {/* Header fila 2 — últ. actualización + toggle de modo + pestañas alineadas con el sidebar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'stretch', flexShrink: 0, height: 44 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 24, padding: '0 32px', minWidth: 0 }}>
          <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
            Últ. actualización: {formatDate(draft.blocksUpdatedAt)}
          </Text>
          <div style={{ flex: 1 }} />
          <Segmented
            value={mode}
            onChange={v => handleModeChange(v as 'visual' | 'html')}
            options={[{ label: 'Editor visual', value: 'visual' }, { label: 'Editor HTML', value: 'html' }]}
          />
          <div style={{ flex: 1 }} />
        </div>
        {mode === 'visual' && tabStrip}
      </div>

      {mode === 'html' ? (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
          {/* Vista previa en vivo */}
          <div className="rf-scroll-hidden" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px 20px 24px', background: draft.layout.bgColor !== 'transparent' ? draft.layout.bgColor : '#f5f5f5' }}>
            {subjectBar}
            <div style={cardStyle}
              dangerouslySetInnerHTML={{ __html: htmlValue }}
            />
          </div>
          {/* Código */}
          <div style={{ width: '45%', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #f0f0f0' }}>
            <Text type="secondary" style={{ fontSize: 12, padding: '12px 24px 8px' }}>
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
            <div ref={canvasRef} className="rf-scroll-hidden" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px 20px 24px', background: draft.layout.bgColor !== 'transparent' ? draft.layout.bgColor : '#f5f5f5' }}>
              {subjectBar}
              <div style={cardStyle}>
                {rows.length === 0 ? (
                  <AddElementDropZone onDropComponent={addComponentRow}>
                    <div style={{ padding: '48px 32px', textAlign: 'center', color: 'rgba(0,0,0,0.25)' }}>
                      <BiPlus style={{ fontSize: 24, display: 'block', margin: '0 auto 12px' }} />
                      <Text type="secondary">Agrega elementos desde el panel derecho, o arrástralos aquí</Text>
                    </div>
                  </AddElementDropZone>
                ) : (
                  <div>
                    {rows.map((row, i) => (
                      <RowBox
                        key={row.id} row={row} index={i}
                        selected={selection?.kind === 'row' && selection.rowId === row.id}
                        onSelectRow={() => { setSelection({ kind: 'row', rowId: row.id }); setActiveTab('diseno'); }}
                        selectedComponentId={selection?.kind === 'component' && selection.rowId === row.id ? selection.componentId : null}
                        onSelectComponent={(columnId, componentId) => { setSelection({ kind: 'component', rowId: row.id, columnId, componentId }); setActiveTab('diseno'); }}
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
                    <AddElementDropZone onDropComponent={addComponentRow}>
                      <div
                        onClick={() => { setActiveTab('elementos'); requestAnimationFrame(() => document.getElementById('palette-section')?.scrollIntoView({ behavior: 'smooth' })); }}
                        style={{ padding: 14, textAlign: 'center', cursor: 'pointer', borderTop: '1px dashed #d9d9d9' }}
                      >
                        <Text type="secondary" style={{ fontSize: 12 }}><BiPlus style={{ marginRight: 8 }} />Agregar elemento, o arrastra uno aquí</Text>
                      </div>
                    </AddElementDropZone>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ ...SIDEBAR_WIDTH, background: '#fff', borderLeft: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div className="rf-scroll-hidden" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '14px 16px' }}>
                {activeTab === 'elementos' && (
                  <div id="palette-section">
                    <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Estructura</Text>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <PaletteItem icon={<BiTable />} label="Columnas" sub="Elige un layout" onClick={() => setColumnPickerOpen(o => !o)} />
                    </div>
                    {columnPickerOpen && <ColumnLayoutPicker onPick={addRow} onClose={() => setColumnPickerOpen(false)} />}
                    <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', display: 'block', margin: '10px 0 12px' }}>Componentes</Text>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {COMPONENT_PALETTE.map(item => (
                        <PaletteItem key={item.type} icon={item.icon} label={item.label} sub={item.sub} componentType={item.type} onClick={() => addComponentRow(item.type)} />
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 'configuracion' && (
                  <LayoutConfigFields layout={draft.layout} onUpdate={p => updateDraft({ layout: { ...draft.layout, ...p } })} />
                )}
                {activeTab === 'diseno' && (
                  selection?.kind === 'row' && selectedRow ? (
                    <>
                      <CollapsibleSection title="Bloque">
                        <BlockFields design={selectedRow.design} onUpdate={p => updateRowDesign(selectedRow.id, p)} />
                      </CollapsibleSection>
                      <CollapsibleSection title="Columnas y tamaños">
                        <ColumnsAndSizesField row={selectedRow} onChange={widths => setRowColumns(selectedRow.id, widths)} />
                      </CollapsibleSection>
                    </>
                  ) : selection?.kind === 'component' && selectedComponent ? (
                    <>
                      <CollapsibleSection title="Bloque">
                        <BlockFields
                          design={selectedComponent.design}
                          onUpdate={p => updateComponent(selection.rowId, selection.columnId, { ...selectedComponent, design: { ...selectedComponent.design, ...p } })}
                          excludeAlign={selectedComponent.type === 'header' || selectedComponent.type === 'divider'}
                        />
                      </CollapsibleSection>
                      {TYPE_SECTION_TITLE[selectedComponent.type] && (
                        <CollapsibleSection title={TYPE_SECTION_TITLE[selectedComponent.type]!}>
                          <ComponentTypeFields component={selectedComponent} onUpdate={c => updateComponent(selection.rowId, selection.columnId, c)} />
                        </CollapsibleSection>
                      )}
                    </>
                  ) : <Text type="secondary" style={{ fontSize: 12 }}>Selecciona una fila o un componente del canvas para configurar su diseño aquí.</Text>
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
    </ConfigProvider>
  );
}
