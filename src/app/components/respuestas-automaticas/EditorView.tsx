import { useState, useRef, useEffect } from 'react';
import {
  App, Button, Input, Card, Typography, Switch, Tag,
  InputNumber, Radio, Checkbox, Tooltip, Segmented, Modal, ConfigProvider, Select, Slider, ColorPicker, Popover,
} from 'antd';
import type { InputRef } from 'antd';
import {
  BiSend, BiCopy, BiX, BiPlus, BiAlignLeft,
  BiAlignMiddle, BiAlignRight, BiMinus, BiText,
  BiMove, BiTable, BiImage, BiPointer,
  BiSpaceBar, BiGroup, BiFile, BiInfoCircle, BiErrorCircle, BiHelpCircle,
  BiUpload, BiSearch, BiChevronDown, BiChevronLeft, BiTrash,
  BiBold, BiItalic, BiSmile, BiCodeCurly,
  BiColorFill, BiVerticalCenter, BiPen, BiMoveHorizontal, BiBorderRadius,
  BiArrowToTop, BiArrowToBottom, BiArrowToLeft, BiArrowToRight, BiLink, BiPalette,
  BiCheckDouble, BiBlock, BiTargetLock, BiImageAlt,
} from 'react-icons/bi';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CodeMirror from '@uiw/react-codemirror';
import { html as htmlLang } from '@codemirror/lang-html';
import {
  EmailTemplate, Row, Column, RowDesign, Component, ComponentType, ComponentDesign, EmailLayoutConfig, TextAlign,
  TextBlock, TitleBlock, HeaderBlock, ResponsesBlock, Pregunta, DividerBlock,
  ImageComponent, ButtonComponent, SpacerComponent, SocialComponent, SocialNetworkKey, SocialNetworkEntry,
} from './types';
import { VARIABLES, VARIABLES_META, PREGUNTAS_EJEMPLO, mockAnswerFor, HEADER_COLORS, countComponents, containsVariable, collectUrlVariableKeys, resolveRowsVariables, isHttpsUrl, hasImageExtension } from './data';
import { cuid } from './cuid';
import TestModal from './TestModal';

const { Text } = Typography;
const { TextArea } = Input;

interface Props {
  template: EmailTemplate;
  onChange: (t: EmailTemplate) => void;
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
function decisionIcon(tone: 'info' | 'warning' | 'success') {
  const palette = tone === 'info' ? { bg: '#e6f4ff', fg: '#1890ff' } : tone === 'warning' ? { bg: '#fffbe6', fg: '#faad14' } : { bg: '#f6ffed', fg: '#52c41a' };
  const Icon = tone === 'info' ? BiInfoCircle : tone === 'warning' ? BiErrorCircle : BiCheckDouble;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: palette.bg, marginRight: 8 }}>
      <Icon style={{ color: palette.fg, fontSize: 14 }} />
    </span>
  );
}
const ROUND_BTN = { style: { borderRadius: 8 } };

// Panel de propiedades — al menos 35% del ancho del editor, con un piso/techo en px
// para que no se vuelva inusable en pantallas muy angostas ni excesivo en muy anchas.
const SIDEBAR_WIDTH: React.CSSProperties = { width: '44%', minWidth: 460, maxWidth: 680, flexShrink: 0 };

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
    case 'responses': return {
      id, type,
      questions: PREGUNTAS_EJEMPLO.map(q => ({ questionId: q.id, included: true })),
      displayStyle: 'bold-indented', showQuestion: true,
      containerWidth: 100, containerBorderRadius: 8,
      headerLabel: 'Tus respuestas', headerColor: '#9CA3AF', headerSize: 18,
      questionColor: '#1E293B', questionBg: 'transparent', questionSize: 14, questionWeight: '700',
      answerColor: '#475569', answerBg: 'transparent', answerSize: 14, answerWeight: '400',
      accentColor: '#E2E8F0', accentWidth: 2,
      tableBorderColor: '#f0f0f0', tableBorderWidth: 1,
      includeEmptyAnswers: false,
      design,
    };
    case 'divider':   return { id, type, color: '#d9d9d9', widthPercent: 90, thickness: 2, lineStyle: 'solid', design };
    case 'image':     return { id, type, src: '', alt: '', dynamic: false, widthPercent: 100, link: '', design };
    case 'button':    return { id, type, text: 'Responder estudio', url: '', bgColor: '#1890ff', textColor: '#ffffff', design };
    case 'spacer':    return { id, type, height: 24, design };
    case 'social':    return { id, type, style: 'negro', size: 26, gap: 12, shape: 'square', networks: SOCIAL_KEYS.map(k => ({ network: k, included: false, url: '' })), design };
    default: return { id, type: 'divider', color: '#d9d9d9', widthPercent: 90, thickness: 2, lineStyle: 'solid', design };
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
  { type: 'text', label: 'Texto', sub: 'Con variables del encuestado', icon: <BiText /> },
  { type: 'image', label: 'Imagen', sub: 'Estática o dinámica', icon: <BiImage /> },
  { type: 'divider', label: 'Divisor', sub: 'Línea separadora', icon: <BiMinus /> },
  { type: 'spacer', label: 'Espaciador', sub: 'Espacio en blanco', icon: <BiSpaceBar /> },
  { type: 'social', label: 'Redes Sociales', sub: 'Íconos con enlaces', icon: <BiGroup /> },
  { type: 'responses', label: 'Respuesta', sub: 'Las respuestas del encuestado', icon: <BiFile /> },
  { type: 'button', label: 'Botón', sub: 'Llamado a la acción', icon: <BiPointer /> },
];

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

// Espacio entre filas del bloque de respuestas — fijo, ya no configurable (no hay separadores).
const RESPONSES_ROW_GAP = 12;

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
    case 'responses': {
      const included = orderedIncludedQuestions(c);
      const label = `<div style="font-size:${c.headerSize}px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${c.headerColor};margin-bottom:${RESPONSES_ROW_GAP}px;">${c.headerLabel}</div>`;
      const qStyle = `font-size:${c.questionSize}px;font-weight:${c.questionWeight};color:${c.questionColor};margin-bottom:3px;${c.questionBg !== 'transparent' ? `background:${c.questionBg};padding:4px 6px;border-radius:4px;` : ''}`;
      const containerOpen = `<div style="width:${c.containerWidth}%;margin:0 auto;border-radius:${c.containerBorderRadius}px;overflow:hidden;">`;
      if (c.displayStyle === 'table') {
        const tableBorder = `${c.tableBorderWidth}px solid ${c.tableBorderColor}`;
        const rows = included.map(q => `<tr>${c.showQuestion ? `<td style="padding:8px 12px;${qStyle}width:45%;border-top:${tableBorder};">${q.texto}</td>` : ''}<td style="padding:8px 12px;font-size:${c.answerSize}px;font-weight:${c.answerWeight};color:${c.answerColor};border-top:${tableBorder};">${mockAnswerFor(q)}</td></tr>`).join('');
        const emptyExampleRow = c.includeEmptyAnswers
          ? `<tr>${c.showQuestion ? `<td style="padding:8px 12px;${qStyle}width:45%;border-top:${tableBorder};font-style:italic;color:rgba(0,0,0,0.35);">Ejemplo — pregunta sin respuesta</td>` : ''}<td style="padding:8px 12px;font-size:${c.answerSize}px;font-style:italic;color:rgba(0,0,0,0.35);border-top:${tableBorder};">Sin respuesta</td></tr>`
          : '';
        return `<div style="${style}">${containerOpen}${label}<table role="presentation" width="100%" style="border-collapse:collapse;border:${tableBorder};font-size:12.5px;">${rows}${emptyExampleRow}</table></div></div>`;
      }
      const items = included.map(q => {
        const qLabel = !c.showQuestion ? '' : c.displayStyle === 'bold-indented'
          ? `<strong style="display:block;${qStyle}">${q.texto}</strong>`
          : `<span style="font-weight:${c.questionWeight};color:${c.questionColor};">${q.texto}: </span>`;
        const accentLeft = c.displayStyle === 'bold-indented' ? c.accentWidth + 9 : 0;
        const accentBorder = c.displayStyle === 'bold-indented' ? `border-left:${c.accentWidth}px solid ${c.accentColor};` : '';
        const bgStyle = c.answerBg !== 'transparent'
          ? `background:${c.answerBg};border-radius:4px;padding:4px 8px 4px ${accentLeft + 8}px;`
          : (accentLeft ? `padding-left:${accentLeft}px;` : '');
        const answerStyle = `font-size:${c.answerSize}px;font-weight:${c.answerWeight};color:${c.answerColor};line-height:1.5;${accentBorder}${bgStyle}`;
        return `<div style="margin-bottom:${RESPONSES_ROW_GAP}px;">${qLabel}<p style="margin:0;${answerStyle}">${mockAnswerFor(q)}</p></div>`;
      }).join('');
      const emptyExampleItem = c.includeEmptyAnswers ? (() => {
        const qLabel = !c.showQuestion ? '' : c.displayStyle === 'bold-indented'
          ? `<strong style="display:block;font-size:${c.questionSize}px;font-weight:${c.questionWeight};font-style:italic;color:rgba(0,0,0,0.35);">Ejemplo — pregunta sin respuesta</strong>`
          : `<span style="font-weight:${c.questionWeight};font-style:italic;color:rgba(0,0,0,0.35);">Ejemplo — pregunta sin respuesta: </span>`;
        const accentLeft = c.displayStyle === 'bold-indented' ? c.accentWidth + 9 : 0;
        const accentBorder = c.displayStyle === 'bold-indented' ? `border-left:${c.accentWidth}px solid ${c.accentColor};` : '';
        return `<div style="margin-bottom:${RESPONSES_ROW_GAP}px;">${qLabel}<p style="margin:0;font-size:${c.answerSize}px;font-style:italic;color:rgba(0,0,0,0.35);line-height:1.5;${accentBorder}${accentLeft ? `padding-left:${accentLeft}px;` : ''}">Sin respuesta</p></div>`;
      })() : '';
      return `<div style="${style}">${containerOpen}${label}${items}${emptyExampleItem}</div></div>`;
    }
    case 'divider':   return `<div style="${style}text-align:center;"><div style="display:inline-block;width:${c.widthPercent}%;border-top:${c.thickness}px ${c.lineStyle} ${c.color};font-size:0;line-height:0;">&nbsp;</div></div>`;
    case 'image': {
      if (c.dynamic && containsVariable(c.src)) {
        const placeholder = `<div style="width:${c.widthPercent}%;height:200px;margin:0 auto;background:#f5f5f5;border:1px dashed #d9d9d9;border-radius:8px;display:flex;align-items:center;justify-content:center;color:rgba(0,0,0,0.35);font-size:12px;">Imagen dinámica — se resuelve al enviar</div>`;
        return `<div style="${style}text-align:center;">${placeholder}</div>`;
      }
      const img = c.src ? `<img src="${c.src}" alt="${c.alt}" style="width:${c.widthPercent}%;" />` : '';
      return `<div style="${style}text-align:center;">${c.link ? `<a href="${c.link}" style="text-decoration:none;">${img}</a>` : img}</div>`;
    }
    case 'button':    return `<div style="${style}text-align:center;"><a href="${c.url}" style="display:inline-block;padding:10px 24px;border-radius:6px;background:${c.bgColor};color:${c.textColor};font-weight:600;text-decoration:none;">${c.text}</a></div>`;
    case 'spacer':    return `<div style="${style}height:${c.height}px;"></div>`;
    case 'social': {
      const radius = c.shape === 'circle' ? '50%' : c.shape === 'rounded' ? '6px' : '0';
      const iconBg = c.style === 'negro' ? '#000' : c.style === 'blanco' ? '#fff' : '#1890ff';
      const iconColor = c.style === 'blanco' ? '#000' : '#fff';
      const icons = c.networks.filter(n => n.included).map(n =>
        // El campo de URL ya tiene "https://" fijo como addonBefore visual — no se guarda en
        // el valor, hay que anteponerlo acá para que el href sea absoluto.
        `<a href="https://${n.url}" style="display:inline-flex;align-items:center;justify-content:center;width:${c.size}px;height:${c.size}px;background:${iconBg};color:${iconColor};border-radius:${radius};margin:0 ${c.gap / 2}px;text-decoration:none;">${socialGlyphHtml(n.network, iconColor)}</a>`
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

interface ContentIssue { label: string; reason: string; }

// Barrido de validación de URLs previo a Guardar/Enviar prueba — un campo con una variable
// sin resolver no se valida (se resuelve recién al enviar, ver resolveRowsVariables).
function collectContentIssues(rows: Row[]): ContentIssue[] {
  const issues: ContentIssue[] = [];
  for (const row of rows) {
    for (const col of row.columns) {
      for (const comp of col.components) {
        if (comp.type === 'image') {
          if (comp.dynamic && comp.src.trim() && !containsVariable(comp.src)) {
            if (!isHttpsUrl(comp.src)) issues.push({ label: 'Imagen', reason: 'la URL debe empezar con https://' });
            else if (!hasImageExtension(comp.src)) issues.push({ label: 'Imagen', reason: 'la URL debe terminar en .jpg, .jpeg o .png' });
          }
          if (comp.link.trim() && !containsVariable(comp.link) && !isHttpsUrl(comp.link)) {
            issues.push({ label: 'Imagen', reason: 'el enlace debe empezar con https://' });
          }
        }
        if (comp.type === 'button' && comp.url.trim() && !containsVariable(comp.url) && !isHttpsUrl(comp.url)) {
          issues.push({ label: 'Botón', reason: 'la URL debe empezar con https://' });
        }
        if (comp.type === 'social') {
          for (const n of comp.networks) {
            const err = socialUrlError(n);
            if (err) issues.push({ label: `Redes sociales — ${SOCIAL_LABELS[n.network]}`, reason: err });
          }
        }
      }
    }
  }
  return issues;
}

// ─── Overlay de acciones (drag + insertar + duplicar + eliminar) ─────────────


function ActionOverlay({ dragHandleRef, onInsertAfter, onDuplicate, onRemove }: {
  dragHandleRef: React.Ref<HTMLDivElement>;
  onInsertAfter: () => void; onDuplicate: () => void; onRemove: () => void;
}) {
  const ctl: React.CSSProperties = {
    background: '#1890ff', border: 'none', color: '#fff', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 26, height: 26, borderRadius: 6, pointerEvents: 'auto',
    boxShadow: '0 2px 6px rgba(24,144,255,0.35)',
  };
  return (
    <div className="blk-toolbar" style={{ transition: 'opacity .15s', position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none' }}>
      {/* Mover (drag) — borde izquierdo, centrado vertical */}
      <div ref={dragHandleRef} title="Mover" style={{ ...ctl, position: 'absolute', left: -13, top: '50%', transform: 'translateY(-50%)', cursor: 'grab' }}>
        <BiMove style={{ fontSize: 15 }} />
      </div>
      {/* Insertar debajo — arriba centro (círculo) */}
      <button onClick={onInsertAfter} title="Insertar" style={{ ...ctl, position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', borderRadius: '50%' }}>
        <BiPlus style={{ fontSize: 16 }} />
      </button>
      {/* Duplicar + Eliminar — esquina superior derecha */}
      <div style={{ position: 'absolute', top: -13, right: 0, display: 'flex', gap: 4 }}>
        <button onClick={onDuplicate} title="Duplicar" style={ctl}><BiCopy style={{ fontSize: 14 }} /></button>
        <button onClick={onRemove} title="Eliminar" style={ctl}><BiTrash style={{ fontSize: 14 }} /></button>
      </div>
    </div>
  );
}

// ─── Editor de texto inline flotante (bloques Texto/Título) ──────────────────

const FONT_OPTIONS = ['Roboto', 'Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Courier New'];
const TEXT_SIZE_OPTIONS = [11, 12, 13, 14, 16, 18, 20, 24, 28, 32];
const EMOJI_LIST = ['😀', '😊', '😍', '🙌', '👍', '🎉', '❤️', '🔥', '✅', '⭐', '😅', '🤔', '👏', '💡', '📌', '🚀', '🙏', '😉', '💬', '📧'];

function wrapSelectionWithStyle(cssText: string) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
  const range = sel.getRangeAt(0);
  const text = range.toString();
  if (!text) return;
  const span = document.createElement('span');
  span.style.cssText = cssText;
  span.textContent = text;
  range.deleteContents();
  range.insertNode(span);
  range.setStartAfter(span);
  range.setEndAfter(span);
  sel.removeAllRanges();
  sel.addRange(range);
}

function EmojiGrid({ onPick }: { onPick: (e: string) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 2, width: 184 }}>
      {EMOJI_LIST.map(e => (
        <button
          key={e} onMouseDown={ev => ev.preventDefault()} onClick={() => onPick(e)}
          style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, padding: 4, borderRadius: 4, lineHeight: 1 }}
        >
          {e}
        </button>
      ))}
    </div>
  );
}

function VariableList({ onPick }: { onPick: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, width: 220 }}>
      {VARIABLES.map(v => (
        <Tag
          key={v} onMouseDown={ev => ev.preventDefault()} onClick={() => onPick(v)}
          style={{ cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, margin: 0 }} color="blue"
        >
          {`{{${v}}}`}
        </Tag>
      ))}
    </div>
  );
}

function FloatingTextToolbar({ onBold, onItalic, color, onColor, fontSize, onFontSize, fontFamily, onFontFamily, onEmoji, onVariable }: {
  onBold: () => void; onItalic: () => void;
  color: string; onColor: (c: string) => void;
  fontSize: number; onFontSize: (n: number) => void;
  fontFamily: string; onFontFamily: (f: string) => void;
  onEmoji: (e: string) => void; onVariable: (v: string) => void;
}) {
  const btn: React.CSSProperties = {
    background: 'transparent', border: 'none', color: 'rgba(0,0,0,0.65)', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 28, height: 28, borderRadius: 6, flexShrink: 0,
  };
  const prevent = (e: React.MouseEvent) => e.preventDefault();
  const sep = <div style={{ width: 1, height: 20, background: '#f0f0f0', flexShrink: 0 }} />;

  return (
    <div style={{
      position: 'absolute', bottom: '100%', left: 0, marginBottom: 8, zIndex: 20,
      background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: '4px 6px', display: 'flex', alignItems: 'center', gap: 4,
      boxShadow: '0 4px 14px rgba(0,0,0,0.12)', pointerEvents: 'auto', whiteSpace: 'nowrap',
    }}>
      <button title="Negrita" style={btn} onMouseDown={prevent} onClick={onBold}><BiBold style={{ fontSize: 16 }} /></button>
      <button title="Itálica" style={btn} onMouseDown={prevent} onClick={onItalic}><BiItalic style={{ fontSize: 16 }} /></button>
      {sep}
      <ColorPicker value={color} disabledAlpha onChange={c => onColor(c.toHexString())}>
        <button title="Color de texto" style={{ ...btn, width: 24 }} onMouseDown={prevent}>
          <span style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.15)', background: color, display: 'block' }} />
        </button>
      </ColorPicker>
      {sep}
      <Select
        size="small" value={fontSize} onChange={onFontSize} style={{ width: 68 }}
        options={TEXT_SIZE_OPTIONS.map(n => ({ value: n, label: `${n}px` }))}
      />
      <Select
        size="small" value={fontFamily} onChange={onFontFamily} style={{ width: 116 }}
        options={FONT_OPTIONS.map(f => ({ value: f, label: f }))}
      />
      {sep}
      <Popover trigger="click" placement="top" content={<EmojiGrid onPick={onEmoji} />}>
        <button title="Emoji" style={btn} onMouseDown={prevent}><BiSmile style={{ fontSize: 17 }} /></button>
      </Popover>
      <Popover trigger="click" placement="top" content={<VariableList onPick={onVariable} />}>
        <button title="Insertar variable" style={btn} onMouseDown={prevent}><BiCodeCurly style={{ fontSize: 16 }} /></button>
      </Popover>
    </div>
  );
}

function TextInlineEditor({ component, align, onUpdate }: { component: TextBlock | TitleBlock; align: TextAlign; onUpdate: (c: Component) => void }) {
  const textRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [editingText, setEditingText] = useState(false);
  const [toolbarColor, setToolbarColor] = useState('#000000');
  const [toolbarSize, setToolbarSize] = useState(component.type === 'title' ? 21 : 14);
  const [toolbarFont, setToolbarFont] = useState('Roboto');

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const raw = component.type === 'title' ? component.text : component.content;
    el.innerHTML = renderVars(raw);
    // Solo se sincroniza al montar (al seleccionar el bloque) — mientras se edita, el DOM manda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveSelection() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !textRef.current) return;
    const range = sel.getRangeAt(0);
    if (!textRef.current.contains(range.commonAncestorContainer)) return;
    savedRangeRef.current = range.cloneRange();
  }

  function restoreSelection() {
    const el = textRef.current;
    if (!el) return;
    el.focus();
    if (!savedRangeRef.current) return;
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(savedRangeRef.current);
  }

  function syncFromDom() {
    const el = textRef.current;
    if (!el) return;
    if (component.type === 'title') onUpdate({ ...component, text: el.innerHTML });
    else onUpdate({ ...component, content: el.innerHTML });
  }

  function withSelection(action: () => void) {
    restoreSelection();
    action();
    syncFromDom();
    saveSelection();
  }

  const styleBase: React.CSSProperties = component.type === 'title'
    ? { fontFamily: "'Roboto', sans-serif", fontWeight: 700, fontSize: 21, lineHeight: 'normal', color: 'rgba(0,0,0,0.85)', letterSpacing: -0.5, padding: '0 32px', margin: 0, textAlign: align, outline: 'none' }
    : { fontFamily: "'Roboto', sans-serif", fontSize: 13.5, lineHeight: 1.75, color: 'rgba(0,0,0,0.65)', padding: '0 32px', margin: 0, whiteSpace: 'pre-line', textAlign: align, outline: 'none' };

  return (
    <div style={{ position: 'relative' }}>
      {editingText && (
        <FloatingTextToolbar
          onBold={() => withSelection(() => document.execCommand('bold'))}
          onItalic={() => withSelection(() => document.execCommand('italic'))}
          color={toolbarColor}
          onColor={c => { setToolbarColor(c); withSelection(() => wrapSelectionWithStyle(`color:${c}`)); }}
          fontSize={toolbarSize}
          onFontSize={n => { setToolbarSize(n); withSelection(() => wrapSelectionWithStyle(`font-size:${n}px`)); }}
          fontFamily={toolbarFont}
          onFontFamily={f => { setToolbarFont(f); withSelection(() => wrapSelectionWithStyle(`font-family:'${f}'`)); }}
          onEmoji={e => withSelection(() => document.execCommand('insertText', false, e))}
          onVariable={v => withSelection(() => document.execCommand('insertText', false, `{{${v}}}`))}
        />
      )}
      <div
        ref={textRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setEditingText(true)}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onInput={syncFromDom}
        style={styleBase}
      />
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
      <div style={{ background: component.bgColor, padding: '24px 32px', textAlign: 'center' }}>
        <span style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 700, fontSize: 22, lineHeight: 'normal', color: '#fff', letterSpacing: -0.5 }}>{component.name}</span>
      </div>
    );
  }
  if (component.type === 'title') {
    return <p style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 700, fontSize: 21, lineHeight: 'normal', color: 'rgba(0,0,0,0.85)', letterSpacing: -0.5, padding: '0 32px', margin: 0, textAlign: align }} dangerouslySetInnerHTML={{ __html: renderVars(component.text) }} />;
  }
  if (component.type === 'text') {
    return <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 13.5, lineHeight: 1.75, color: 'rgba(0,0,0,0.65)', padding: '0 32px', margin: 0, whiteSpace: 'pre-line', textAlign: align }} dangerouslySetInnerHTML={{ __html: renderVars(component.content) }} />;
  }
  if (component.type === 'responses') {
    const included = orderedIncludedQuestions(component);
    const label = (
      <Text style={{ fontSize: component.headerSize, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: component.headerColor, display: 'block', marginBottom: RESPONSES_ROW_GAP }}>
        {component.headerLabel}
      </Text>
    );
    const questionStyle: React.CSSProperties = {
      fontSize: component.questionSize, fontWeight: Number(component.questionWeight), color: component.questionColor,
      ...(component.questionBg !== 'transparent' ? { background: component.questionBg, padding: '8px 8px', borderRadius: 4 } : {}),
    };
    const containerStyle: React.CSSProperties = { width: `${component.containerWidth}%`, margin: '0 auto', borderRadius: component.containerBorderRadius, overflow: 'hidden' };
    if (component.displayStyle === 'table') {
      const tableBorder = `${component.tableBorderWidth}px solid ${component.tableBorderColor}`;
      return (
        <div style={{ margin: '0 32px' }}>
          <div style={containerStyle}>
            {label}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, border: tableBorder }}>
              <tbody>
                {included.map((q, i) => (
                  <tr key={q.id} style={{ borderTop: i > 0 ? tableBorder : undefined }}>
                    {component.showQuestion && <td style={{ padding: '12px 16px', width: '45%', ...questionStyle }}>{q.texto}</td>}
                    <td style={{ padding: '12px 16px', fontSize: component.answerSize, fontWeight: Number(component.answerWeight), color: component.answerColor }}>{mockAnswerFor(q)}</td>
                  </tr>
                ))}
                {component.includeEmptyAnswers && (
                  <tr style={{ borderTop: included.length > 0 ? tableBorder : undefined }}>
                    {component.showQuestion && <td style={{ padding: '12px 16px', width: '45%', ...questionStyle, fontStyle: 'italic', color: 'rgba(0,0,0,0.35)' }}>Ejemplo — pregunta sin respuesta</td>}
                    <td style={{ padding: '12px 16px', fontSize: component.answerSize, fontStyle: 'italic', color: 'rgba(0,0,0,0.35)' }}>Sin respuesta</td>
                  </tr>
                )}
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
        {included.map(q => {
          return (
            <div key={q.id} style={{ marginBottom: RESPONSES_ROW_GAP }}>
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
        {component.includeEmptyAnswers && (
          <div style={{ marginBottom: RESPONSES_ROW_GAP }}>
            {component.showQuestion && component.displayStyle === 'bold-indented' && (
              <Text style={{ display: 'block', marginBottom: 4, ...questionStyle, fontStyle: 'italic', color: 'rgba(0,0,0,0.35)' }}>Ejemplo — pregunta sin respuesta</Text>
            )}
            {component.showQuestion && component.displayStyle === 'list' && (
              <Text style={{ display: 'inline', fontStyle: 'italic', color: 'rgba(0,0,0,0.35)' }}>Ejemplo — pregunta sin respuesta: </Text>
            )}
            <p style={{
              margin: 0, fontSize: component.answerSize, fontStyle: 'italic', color: 'rgba(0,0,0,0.35)', lineHeight: 1.5,
              paddingLeft: component.displayStyle === 'bold-indented' ? component.accentWidth + 9 : 0,
              borderLeft: component.displayStyle === 'bold-indented' ? `${component.accentWidth}px solid ${component.accentColor}` : 'none',
            }}>
              Sin respuesta
            </p>
          </div>
        )}
        </div>
      </div>
    );
  }
  if (component.type === 'divider') {
    return (
      <div style={{ padding: '0 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: `${component.widthPercent}%`, borderTop: `${component.thickness}px ${component.lineStyle} ${component.color}` }} />
      </div>
    );
  }
  if (component.type === 'image') {
    return <CanvasImage key={component.src} component={component} />;
  }
  if (component.type === 'button') {
    return (
      <div style={{ textAlign: 'center', padding: '12px 32px' }}>
        <span style={{ display: 'inline-block', padding: '12px 32px', borderRadius: 8, background: component.bgColor, color: component.textColor, fontWeight: 600, fontSize: 14, lineHeight: 'normal' }}>{component.text}</span>
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

// Imagen del canvas — separado en su propio componente para poder llevar el estado de
// "la URL no cargó" (onError) sin romper las reglas de hooks dentro de renderComponentContent,
// que es una función plana, no un componente. Cubre 3 estados: sin URL todavía, URL dinámica
// con una variable sin resolver (no tiene sentido intentar cargarla, siempre va a fallar — se
// muestra un placeholder con una dimensión de ejemplo en vez del ícono roto del navegador), y
// URL real que falló al cargar.
function CanvasImage({ component }: { component: ImageComponent }) {
  const [broken, setBroken] = useState(false);
  if (!component.src) {
    return (
      <div style={{ margin: '0 32px', padding: '32px', textAlign: 'center', color: '#bfbfbf', border: '1px dashed #d9d9d9', borderRadius: 8 }}>
        <BiImage style={{ fontSize: 24 }} />
        <div style={{ fontSize: 12, lineHeight: 'normal', marginTop: 8 }}>Sin imagen — selecciónala y define la URL en Diseño</div>
      </div>
    );
  }
  const unresolvedVariable = component.dynamic && containsVariable(component.src);
  if (unresolvedVariable || broken) {
    return (
      <div style={{ padding: '0 32px', textAlign: 'center' }}>
        <div style={{
          width: `${component.widthPercent}%`, height: 200, margin: '0 auto',
          background: '#f5f5f5', border: '1px dashed #d9d9d9', borderRadius: 8,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <BiImage style={{ fontSize: 28, color: '#bfbfbf' }} />
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)', padding: '0 16px', textAlign: 'center' }}>
            {unresolvedVariable ? 'Imagen dinámica — se resuelve al enviar' : 'No se pudo cargar la imagen'}
          </span>
        </div>
      </div>
    );
  }
  const img = (
    <img
      src={component.src} alt={component.alt} onError={() => setBroken(true)}
      style={{ width: `${component.widthPercent}%`, display: 'inline-block' }}
    />
  );
  return (
    <div style={{ padding: '0 32px', textAlign: 'center' }}>
      {component.link ? <a href={component.link} onClick={e => e.preventDefault()} style={{ display: 'inline-block' }}>{img}</a> : img}
    </div>
  );
}

function ComponentBox({ component, index, columnId, selected, onSelect, onRemove, onDuplicate, onInsertAfter, moveComponent, onUpdate }: {
  component: Component; index: number; columnId: string; selected: boolean;
  onSelect: () => void; onRemove: () => void; onDuplicate: () => void; onInsertAfter: () => void;
  moveComponent: (from: number, to: number) => void;
  onUpdate: (c: Component) => void;
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
        {selected && (component.type === 'text' || component.type === 'title')
          ? <TextInlineEditor component={component} align={d.textAlign} onUpdate={onUpdate} />
          : renderComponentContent(component)}
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
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', border: '1px dashed #d9d9d9', borderRadius: 8, padding: '16px 0', background: '#fafafa', cursor: 'pointer', color: '#8c8c8c', fontSize: 12, lineHeight: 'normal' }}>
        <BiPlus style={{ marginRight: 8 }} /> Agregar
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 25, background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: 8, width: 190, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {COMPONENT_PALETTE.map(item => (
            <button key={item.type} onClick={() => { onAdd(item.type); setOpen(false); }} style={{ textAlign: 'left', padding: '4px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, lineHeight: 'normal', borderRadius: 4 }}>
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

function RowBox({ row, index, selected, onSelectRow, selectedComponentId, onSelectComponent, onRemoveRow, onDuplicateRow, onInsertRowAfter, moveRow, moveComponentInColumn, onAddComponentToColumn, removeComponent, duplicateComponent, insertComponentAfter, onUpdateComponent }: {
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
  onUpdateComponent: (columnId: string, comp: Component) => void;
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
              onUpdateComponent={comp => onUpdateComponent(col.id, comp)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Columna dentro de una fila — también acepta drops de la paleta ──────────

function ColumnBox({ column, onAddComponentToColumn, selectedComponentId, onSelectComponent, removeComponent, duplicateComponent, insertComponentAfter, moveComponent, onUpdateComponent }: {
  column: Column;
  onAddComponentToColumn: (type: ComponentType) => void;
  selectedComponentId: string | null;
  onSelectComponent: (componentId: string) => void;
  removeComponent: (componentId: string) => void;
  duplicateComponent: (componentId: string) => void;
  insertComponentAfter: (atIndex: number) => void;
  moveComponent: (from: number, to: number) => void;
  onUpdateComponent: (comp: Component) => void;
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
            onUpdate={onUpdateComponent}
          />
        ))
      )}
    </div>
  );
}

// ─── Paleta ────────────────────────────────────────────────────────────────────

function PaletteItem({ icon, label, onClick, componentType }: {
  icon: React.ReactNode; label: string; onClick: () => void; componentType?: ComponentType;
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
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '24px 16px', cursor: componentType ? 'grab' : 'pointer', textAlign: 'center',
        border: '1px solid #f0f0f0',
        borderRadius: 8, opacity: isDragging ? 0.4 : 1,
        background: '#fafafa',
      }}
    >
      <span style={{ fontSize: 24, color: 'rgba(0,0,0,0.45)', display: 'flex' }}>{icon}</span>
      <div style={{ fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.45)', lineHeight: '16px' }}>{label}</div>
    </button>
  );
}

function ColumnLayoutPicker({ onPick, onClose }: { onPick: (widths: number[]) => void; onClose: () => void }) {
  return (
    <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 12, marginBottom: 12, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>Elige un layout de columnas</Text>
        <button onClick={onClose} aria-label="Cerrar" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.45)', display: 'inline-flex', alignItems: 'center', fontSize: 16 }}><BiX /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: 8 }}>
        {COLUMN_LAYOUTS.map(l => (
          <button key={l.label} onClick={() => onPick(l.widths)} title={l.label} style={{ display: 'flex', gap: 4, border: '1px solid #d9d9d9', borderRadius: 8, padding: 8, cursor: 'pointer', background: '#fff' }}>
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
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: 8 }}>
      {COLUMN_LAYOUTS.map(l => (
        <button key={l.label} onClick={() => onChange(l.widths)} title={l.label} style={{
          display: 'flex', gap: 4, borderRadius: 8, padding: 8, cursor: 'pointer',
          border: isActive(l.widths) ? '1.5px solid #1890ff' : '1px solid #d9d9d9',
          background: isActive(l.widths) ? '#e6f4ff' : '#fff',
        }}>
          {l.widths.map((w, i) => <div key={i} style={{ flex: w, height: 24, background: isActive(l.widths) ? '#1890ff' : '#e6f4ff', borderRadius: 2 }} />)}
        </button>
      ))}
    </div>
  );
}

// ─── Selector de color propio — un solo input (Figma Ajustes 121-151, node 1466-54729) ──
// La "bolita" abre el color picker de alta gama de AntD; el texto al lado acepta hex libre.

const COLOR_PRESETS = ['#1890ff', '#7C3AED', '#059669', '#DC2626', '#0F172A', '#D97706', '#0D9488', '#ffffff', '#000000', '#f5f5f5'];

function ColorPickerField({ value, onChange, allowTransparent }: { value: string; onChange: (c: string) => void; allowTransparent?: boolean }) {
  const isTransparent = value === 'transparent';

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', width: '100%' }}>
      {allowTransparent && (
        <button
          type="button"
          onClick={() => onChange(isTransparent ? '#ffffff' : 'transparent')}
          style={{
            flex: 1, height: 32, borderRadius: 8, cursor: 'pointer', background: '#fff',
            border: isTransparent ? '1px solid #1890ff' : '1px solid #f0f0f0',
            color: isTransparent ? '#1890ff' : 'rgba(0,0,0,0.45)',
            fontSize: 14, fontFamily: "'Roboto', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '0 8px',
          }}
        >
          <BiBlock style={{ fontSize: 18, flexShrink: 0 }} />
          Transparente
        </button>
      )}
      <div style={{
        border: '1px solid #f0f0f0', borderRadius: 8, height: 32, boxSizing: 'border-box',
        padding: '0 8px', display: 'flex', alignItems: 'center', gap: 8,
        background: '#fff', flex: 1, minWidth: 100,
      }}>
        <ColorPicker
          value={isTransparent ? '#ffffff' : value}
          disabledAlpha
          presets={[{ label: 'Recomendados', colors: COLOR_PRESETS }]}
          onChange={c => onChange(c.toHexString())}
        >
          <span
            title="Elegir color"
            style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
              border: '1px solid rgba(0,0,0,0.3)',
              background: isTransparent
                ? 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 8px 8px'
                : value,
            }}
          />
        </ColorPicker>
        <input
          value={isTransparent ? '' : value}
          placeholder="#RRGGBB"
          onChange={e => onChange(e.target.value)}
          style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            fontSize: 14, color: 'rgba(0,0,0,0.85)', fontFamily: "'Roboto', sans-serif", padding: 0,
          }}
        />
      </div>
    </div>
  );
}

// ─── Segmentado genérico de íconos, cajas individualmente bordeadas (Figma
// Ajustes 121-151, node 1560-16696 — usado por Alineación y Estilo del borde) ──

function IconSegmented<T extends string>({ value, options, onChange }: {
  value: T; options: { value: T; icon: React.ReactNode; title: string }[]; onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: 'flex', width: '100%' }}>
      {options.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          title={opt.title}
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', background: '#fff', fontSize: 16,
            border: `1px solid ${value === opt.value ? '#1890ff' : '#f0f0f0'}`,
            color: value === opt.value ? '#1890ff' : 'rgba(0,0,0,0.25)',
            marginLeft: i > 0 ? -1 : 0, position: 'relative', zIndex: value === opt.value ? 2 : 1,
            borderRadius: i === 0 ? '8px 0 0 8px' : i === options.length - 1 ? '0 8px 8px 0' : 0,
          }}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}

const ALIGN_OPTIONS: { value: TextAlign; icon: React.ReactNode; title: string }[] = [
  { value: 'left', icon: <BiAlignLeft />, title: 'Izquierda' },
  { value: 'center', icon: <BiAlignMiddle />, title: 'Centro' },
  { value: 'right', icon: <BiAlignRight />, title: 'Derecha' },
];

function AlignmentField({ value, onChange }: { value: TextAlign; onChange: (v: TextAlign) => void }) {
  return <IconSegmented value={value} options={ALIGN_OPTIONS} onChange={onChange} />;
}

// ─── Sección colapsable — usada en toda la pestaña "Diseño" ──────────────────

function CollapsibleSection({ title, children, defaultOpen = true, compact }: { title: string; children: React.ReactNode; defaultOpen?: boolean; compact?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  if (compact) {
    return (
      <div style={{ border: '1px solid #f0f0f0', borderRadius: 8 }}>
        <div
          onClick={() => setOpen(o => !o)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '8px 16px' }}
        >
          <Text style={{ fontSize: 12.5, fontWeight: 500 }}>{title}</Text>
          <BiChevronDown style={{ color: 'rgba(0,0,0,0.35)', fontSize: 16, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
        </div>
        {open && <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 16px 16px' }}>{children}</div>}
      </div>
    );
  }
  return (
    <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 24, marginBottom: 24 }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: open ? 14 : 0 }}>
        <Text style={{ fontSize: 14, fontWeight: 500 }}>{title}</Text>
        <BiChevronDown style={{ color: 'rgba(0,0,0,0.35)', fontSize: 16, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
      </div>
      {open && <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>{children}</div>}
    </div>
  );
}

// ─── Campos compartidos de diseño (fila / componente) ────────────────────────

function FieldLabel({ children, icon, inline, tooltip }: { children: React.ReactNode; icon?: React.ReactNode; inline?: boolean; tooltip?: string }) {
  return (
    <Text style={{
      display: inline ? 'inline-flex' : 'flex', alignItems: 'center', gap: 4,
      fontSize: 14, fontWeight: 400, color: 'rgba(0,0,0,0.45)', marginBottom: inline ? 0 : 4,
    }}>
      {icon && <span style={{ display: 'flex', fontSize: 14, flexShrink: 0 }}>{icon}</span>}
      {children}
      {tooltip && (
        <Tooltip title={tooltip}>
          <BiHelpCircle style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)', cursor: 'help', flexShrink: 0 }} />
        </Tooltip>
      )}
    </Text>
  );
}
function PaddingField({ label, icon, value, onChange }: { label: string; icon: React.ReactNode; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <FieldLabel icon={icon}>{label}</FieldLabel>
      <InputNumber value={value} onChange={v => onChange(v ?? 0)} style={{ width: '100%' }} min={0} addonAfter="px" />
    </div>
  );
}
function BorderStyleIcon({ style }: { style: 'solid' | 'dotted' | 'none' }) {
  if (style === 'none') {
    // Un borde "ninguno" transparente no deja nada visible dentro del ícono —
    // se dibuja un tache diagonal sobre un contorno tenue para que la opción
    // seleccionada siga siendo reconocible.
    return (
      <span style={{ position: 'relative', display: 'block', width: 14, height: 14 }}>
        <span style={{ position: 'absolute', inset: 0, borderRadius: 3, border: '1.5px solid currentColor', opacity: 0.35 }} />
        <span style={{ position: 'absolute', top: '50%', left: -1, right: -1, height: 1.5, background: 'currentColor', transform: 'rotate(-45deg)' }} />
      </span>
    );
  }
  return (
    <span style={{ display: 'block', width: 14, height: 14, borderRadius: 3, border: `1.5px ${style} currentColor` }} />
  );
}
function BorderFields({ borderColor, borderWidth, borderStyle, onUpdate }: {
  borderColor: string; borderWidth: number; borderStyle: 'solid' | 'dotted' | 'none';
  onUpdate: (p: { borderColor?: string; borderWidth?: number; borderStyle?: 'solid' | 'dotted' | 'none' }) => void;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
      <div>
        <FieldLabel icon={<BiColorFill />}>Color del borde</FieldLabel>
        <ColorPickerField value={borderColor} onChange={c => onUpdate({ borderColor: c })} />
      </div>
      <div>
        <FieldLabel icon={<BiVerticalCenter />}>Grosor del borde</FieldLabel>
        <InputNumber min={0} value={borderWidth} onChange={v => onUpdate({ borderWidth: v ?? 0 })} style={{ width: '100%' }} addonAfter="px" />
      </div>
      <div>
        <FieldLabel icon={<BiPen />}>Estilo del borde</FieldLabel>
        <IconSegmented
          value={borderStyle}
          onChange={v => onUpdate({ borderStyle: v })}
          options={[
            { value: 'solid', icon: <BorderStyleIcon style="solid" />, title: 'Sólido' },
            { value: 'dotted', icon: <BorderStyleIcon style="dotted" />, title: 'Punteado' },
            { value: 'none', icon: <BorderStyleIcon style="none" />, title: 'Ninguno' },
          ]}
        />
      </div>
    </div>
  );
}
function PaddingGrid({ design, onUpdate }: { design: { paddingTop: number; paddingBottom: number; paddingLeft?: number; paddingRight?: number }; onUpdate: (p: object) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <GroupHeading>Relleno</GroupHeading>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
        <PaddingField label="Arriba" icon={<BiArrowToTop />} value={design.paddingTop} onChange={v => onUpdate({ paddingTop: v })} />
        <PaddingField label="Abajo" icon={<BiArrowToBottom />} value={design.paddingBottom} onChange={v => onUpdate({ paddingBottom: v })} />
        <PaddingField label="Izquierda" icon={<BiArrowToLeft />} value={design.paddingLeft ?? 0} onChange={v => onUpdate({ paddingLeft: v })} />
        <PaddingField label="Derecha" icon={<BiArrowToRight />} value={design.paddingRight ?? 0} onChange={v => onUpdate({ paddingRight: v })} />
      </div>
    </div>
  );
}

// Tab "Configuración" — layout global del correo (fijo, no depende de la selección)
function LayoutConfigFields({ layout, onUpdate }: { layout: EmailLayoutConfig; onUpdate: (p: Partial<EmailLayoutConfig>) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
      <div>
        <FieldLabel icon={<BiMoveHorizontal />}>Ancho del contenido</FieldLabel>
        <InputNumber value={layout.widthPercent} min={10} max={100} addonAfter="%" onChange={v => onUpdate({ widthPercent: v ?? 100 })} style={{ width: '100%' }} />
      </div>
      <div>
        <FieldLabel icon={<BiPen />}>Estilo del contenedor</FieldLabel>
        <Radio.Group value={layout.boxed} onChange={e => onUpdate({ boxed: e.target.value })} style={{ display: 'flex', width: '100%' }}>
          <Radio.Button value={true} style={{ flex: 1, textAlign: 'center', paddingInline: 4 }}>Con margen</Radio.Button>
          <Radio.Button value={false} style={{ flex: 1, textAlign: 'center', paddingInline: 4 }}>Ancho completo</Radio.Button>
        </Radio.Group>
      </div>
      <div>
        <FieldLabel icon={<BiColorFill />}>Color de fondo</FieldLabel>
        <ColorPickerField value={layout.bgColor} onChange={c => onUpdate({ bgColor: c })} />
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {excludeAlign ? (
          <div>
            <FieldLabel icon={<BiColorFill />}>Color de fondo</FieldLabel>
            <ColorPickerField value={design.bgColor} onChange={c => onUpdate({ bgColor: c } as Partial<T>)} allowTransparent />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <FieldLabel icon={<BiColorFill />}>Color de fondo</FieldLabel>
              <ColorPickerField value={design.bgColor} onChange={c => onUpdate({ bgColor: c } as Partial<T>)} allowTransparent />
            </div>
            <div>
              <FieldLabel icon={<BiAlignLeft />}>Alineación</FieldLabel>
              <AlignmentField value={design.textAlign ?? 'left'} onChange={v => onUpdate({ textAlign: v } as Partial<T>)} />
            </div>
          </div>
        )}
        <BorderFields borderColor={design.borderColor ?? '#000000'} borderWidth={design.borderWidth ?? 0} borderStyle={design.borderStyle ?? 'none'} onUpdate={onUpdate} />
      </div>
      <PaddingGrid design={design} onUpdate={onUpdate} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FieldLabel inline tooltip="Este bloque no se mostrará al abrir el correo desde un celular.">Ocultar en móvil</FieldLabel>
        <Switch checked={design.hideMobile ?? false} onChange={v => onUpdate({ hideMobile: v } as Partial<T>)} />
      </div>
    </div>
  );
}

// ─── Campos de contenido por tipo de componente (sección específica del tab "Diseño") ────────

function TextContentFields({ block, onUpdate }: { block: TextBlock; onUpdate: (b: Component) => void }) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [varPickerOpen, setVarPickerOpen] = useState(false);

  function insertVariable(key: string) {
    const ta = taRef.current;
    const tag = `{{${key}}}`;
    if (!ta) { onUpdate({ ...block, content: block.content + tag }); return; }
    const s = ta.selectionStart, e2 = ta.selectionEnd;
    const nc = block.content.slice(0, s) + tag + block.content.slice(e2);
    onUpdate({ ...block, content: nc });
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + tag.length; }, 0);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <FieldLabel icon={<BiText />}>Contenido</FieldLabel>
        <TextArea ref={taRef} rows={4} value={block.content} onChange={e => onUpdate({ ...block, content: e.target.value })} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <button
            type="button" onClick={() => setVarPickerOpen(true)}
            style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: '#1890ff', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <BiPlus style={{ fontSize: 14 }} /> variable
          </button>
          <Text type="secondary" style={{ fontSize: 12 }}>Se reemplaza con el dato real al enviarse.</Text>
        </div>
        <VariablePickerModal open={varPickerOpen} onClose={() => setVarPickerOpen(false)} onPick={insertVariable} />
      </div>
    </div>
  );
}
function HeaderContentFields({ block, onUpdate }: { block: HeaderBlock; onUpdate: (b: Component) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <FieldLabel icon={<BiText />}>Nombre o logo</FieldLabel>
        <Input value={block.name} onChange={e => onUpdate({ ...block, name: e.target.value })} />
      </div>
      <div>
        <FieldLabel icon={<BiColorFill />}>Color de fondo</FieldLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
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
      <FieldLabel icon={<BiText />}>Texto del título</FieldLabel>
      <Input value={block.text} onChange={e => onUpdate({ ...block, text: e.target.value })} />
    </div>
  );
}
// Encabezado de grupo simple, no colapsable — ej. "Relleno", "Etiqueta del bloque".
// Título de grupo simple — sin margen propio; el espaciado (12px a su contenido,
// 24px a otros grupos) lo da el contenedor padre vía gap, para no mezclar
// margin+gap con resultados impredecibles (ver Figma Ajustes 121-151, node 1560-16696).
function GroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontSize: 14, fontWeight: 400, color: 'rgba(0,0,0,0.85)', display: 'block' }}>
      {children}
    </Text>
  );
}

// Encabezado de grupo colapsable con chevron — ej. "Preguntas"/"Respuestas" del bloque de respuestas.
function SubSectionHeading({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
        <Text style={{ fontSize: 14, fontWeight: 400, color: 'rgba(0,0,0,0.85)' }}>{title}</Text>
        <BiChevronDown style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms', flexShrink: 0 }} />
      </div>
      {open && <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>}
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
      style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #f0f0f0', borderRadius: 6, padding: '6px 10px', background: included ? '#e6f7ff' : '#fff', opacity: isDragging ? 0.4 : 1, cursor: 'pointer' }}
    >
      {included ? (
        <div ref={handleRef} onClick={e => e.stopPropagation()} style={{ cursor: 'grab', color: 'rgba(0,0,0,0.35)', display: 'flex', flexShrink: 0 }}>
          <BiMove style={{ fontSize: 12 }} />
        </div>
      ) : (
        <div style={{ width: 12, flexShrink: 0 }} />
      )}
      <Checkbox checked={included} onChange={e => onToggle(e.target.checked)} onClick={e => e.stopPropagation()} />
      <Text style={{ fontSize: 12, lineHeight: '16px', flex: 1 }} ellipsis={{ tooltip: q.texto }}>{q.texto}</Text>
      <Tag style={{ margin: 0, fontSize: 11, lineHeight: '16px', flexShrink: 0 }}>{q.tipo}</Tag>
    </div>
  );
}

function ResponsesContentFields({ block, onUpdate }: { block: ResponsesBlock; onUpdate: (b: Component) => void }) {
  const [search, setSearch] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
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

  const questionPicker = (
    <div style={{ width: 340 }}>
      <FieldLabel icon={<BiSearch />}>Buscar preguntas del estudio</FieldLabel>
      <Input
        allowClear value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Buscar por texto o tipo…" prefix={<BiSearch style={{ color: 'rgba(0,0,0,0.25)' }} />}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
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
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>Marca una pregunta para incluirla · arrastra las incluidas para definir su orden en el correo.</Text>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ padding: 8, borderRadius: 8, background: '#fafafa', border: '1px solid #d9d9d9', fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
        Cada encuestado verá sus respuestas exactas, es decir, el contenido es dinámico y único por persona.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <GroupHeading>Visualización del contenedor</GroupHeading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          <div>
            <FieldLabel icon={<BiPen />}>Estilo</FieldLabel>
            <Select
              style={{ width: '100%' }} value={block.displayStyle}
              onChange={v => onUpdate({ ...block, displayStyle: v as ResponsesBlock['displayStyle'] })}
              options={[
                { value: 'bold-indented', label: 'Listado con sangría' },
                { value: 'list', label: 'Lista' },
                { value: 'table', label: 'Tabla' },
              ]}
            />
          </div>
          <div>
            <FieldLabel icon={<BiMoveHorizontal />}>Ancho</FieldLabel>
            <InputNumber min={40} max={100} value={block.containerWidth} onChange={v => onUpdate({ ...block, containerWidth: v ?? 100 })} style={{ width: '100%' }} addonAfter="%" />
          </div>
          <div>
            <FieldLabel icon={<BiBorderRadius />}>Redondeo</FieldLabel>
            <InputNumber min={0} max={24} value={block.containerBorderRadius} onChange={v => onUpdate({ ...block, containerBorderRadius: v ?? 0 })} style={{ width: '100%' }} addonAfter="px" />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <GroupHeading>Preguntas del bloque</GroupHeading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          <div>
            <FieldLabel>Mostrar enunciado</FieldLabel>
            <div style={{ height: 32, display: 'flex', alignItems: 'center' }}>
              <Switch checked={block.showQuestion} onChange={checked => onUpdate({ ...block, showQuestion: checked })} />
            </div>
          </div>
          <div>
            <FieldLabel tooltip="No sabemos por qué falta — solo que la respuesta está vacía.">Preguntas sin respuesta</FieldLabel>
            <div style={{ height: 32, display: 'flex', alignItems: 'center' }}>
              <Switch checked={block.includeEmptyAnswers} onChange={checked => onUpdate({ ...block, includeEmptyAnswers: checked })} />
            </div>
          </div>
          <div>
            <FieldLabel>Preguntas incluidas</FieldLabel>
            <Popover
              open={pickerOpen} onOpenChange={setPickerOpen}
              trigger="click" placement="bottomRight"
              content={questionPicker}
            >
              <button
                type="button"
                style={{
                  width: '100%', height: 32, boxSizing: 'border-box', border: 'none', borderRadius: 8,
                  background: '#e6f7ff', color: '#1890ff', fontSize: 14, fontFamily: "'Roboto', sans-serif",
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                Seleccionadas ({included.length})
              </button>
            </Popover>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <GroupHeading>Título del bloque</GroupHeading>
        <div>
          <FieldLabel icon={<BiText />}>Texto</FieldLabel>
          <Input value={block.headerLabel} onChange={e => onUpdate({ ...block, headerLabel: e.target.value })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          <div>
            <FieldLabel icon={<BiColorFill />}>Color del texto</FieldLabel>
            <ColorPickerField value={block.headerColor} onChange={c => onUpdate({ ...block, headerColor: c })} />
          </div>
          <div>
            <FieldLabel icon={<BiText />}>Tamaño del texto</FieldLabel>
            <InputNumber min={8} max={32} value={block.headerSize} onChange={v => onUpdate({ ...block, headerSize: v ?? 18 })} style={{ width: '100%' }} addonAfter="px" />
          </div>
        </div>
      </div>

      <SubSectionHeading title="Preguntas">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          <div>
            <FieldLabel icon={<BiColorFill />}>Color del texto</FieldLabel>
            <ColorPickerField value={block.questionColor} onChange={c => onUpdate({ ...block, questionColor: c })} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <FieldLabel icon={<BiColorFill />}>Fondo del bloque</FieldLabel>
            <ColorPickerField value={block.questionBg} onChange={c => onUpdate({ ...block, questionBg: c })} allowTransparent />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          <div>
            <FieldLabel icon={<BiText />}>Tamaño del texto</FieldLabel>
            <InputNumber min={9} max={20} value={block.questionSize} onChange={v => onUpdate({ ...block, questionSize: v ?? 14 })} style={{ width: '100%' }} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <FieldLabel icon={<BiAlignLeft />}>Grosor del texto</FieldLabel>
            <WeightField value={block.questionWeight} onChange={v => onUpdate({ ...block, questionWeight: v })} />
          </div>
        </div>
      </SubSectionHeading>

      <SubSectionHeading title="Respuestas">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          <div>
            <FieldLabel icon={<BiColorFill />}>Color del texto</FieldLabel>
            <ColorPickerField value={block.answerColor} onChange={c => onUpdate({ ...block, answerColor: c })} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <FieldLabel icon={<BiColorFill />}>Fondo del bloque</FieldLabel>
            <ColorPickerField value={block.answerBg} onChange={c => onUpdate({ ...block, answerBg: c })} allowTransparent />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          <div>
            <FieldLabel icon={<BiText />}>Tamaño del texto</FieldLabel>
            <InputNumber min={9} max={20} value={block.answerSize} onChange={v => onUpdate({ ...block, answerSize: v ?? 14 })} style={{ width: '100%' }} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <FieldLabel icon={<BiAlignLeft />}>Grosor del texto</FieldLabel>
            <WeightField value={block.answerWeight} onChange={v => onUpdate({ ...block, answerWeight: v })} />
          </div>
        </div>
      </SubSectionHeading>

      {block.displayStyle === 'bold-indented' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <GroupHeading>Detalle de sangría</GroupHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
            <div>
              <FieldLabel icon={<BiColorFill />}>Color del acento</FieldLabel>
              <ColorPickerField value={block.accentColor} onChange={c => onUpdate({ ...block, accentColor: c })} />
            </div>
            <div>
              <FieldLabel icon={<BiVerticalCenter />}>Grosor del acento</FieldLabel>
              <InputNumber min={0} max={8} value={block.accentWidth} onChange={v => onUpdate({ ...block, accentWidth: v ?? 0 })} style={{ width: '100%' }} addonAfter="px" />
            </div>
          </div>
        </div>
      )}

      {block.displayStyle === 'table' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <GroupHeading>Detalle de tabla</GroupHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
            <div>
              <FieldLabel icon={<BiColorFill />}>Color de bordes</FieldLabel>
              <ColorPickerField value={block.tableBorderColor} onChange={c => onUpdate({ ...block, tableBorderColor: c })} />
            </div>
            <div>
              <FieldLabel icon={<BiVerticalCenter />}>Grosor de bordes</FieldLabel>
              <InputNumber min={0} max={8} value={block.tableBorderWidth} onChange={v => onUpdate({ ...block, tableBorderWidth: v ?? 0 })} style={{ width: '100%' }} addonAfter="px" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function ImagePreviewThumb({ src }: { src: string }) {
  const [broken, setBroken] = useState(false);
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
      background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {src && !broken ? (
        <img
          src={src} alt="" onError={() => setBroken(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <BiImage style={{ fontSize: 16, color: 'rgba(0,0,0,0.25)' }} />
      )}
    </div>
  );
}
// Fila compartida "+ Variable" + contador de caracteres, debajo de un campo de URL —
// mismo patrón para "Imagen" (URL dinámico) y "Enlace" (Figma Ajustes 121-151, nodes
// 1595-16677 / 1597-16838: ambos campos usan maxLength 250 con este mismo pie).
function VariableCounterRow({ length, max, onAddVariable }: { length: number; max: number; onAddVariable: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
      <button
        type="button" onClick={onAddVariable}
        style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: '#1890ff', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}
      >
        <BiPlus style={{ fontSize: 14 }} /> Variable
      </button>
      <Text type="secondary" style={{ fontSize: 12 }}>{length}/{max}</Text>
    </div>
  );
}
function ImageContentFields({ block, onUpdate }: { block: ImageComponent; onUpdate: (b: Component) => void }) {
  const urlRef = useRef<InputRef>(null);
  const linkRef = useRef<InputRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [varTarget, setVarTarget] = useState<'src' | 'link' | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function loadFile(file: File) {
    // Prototipo sin backend: el "upload" genera una URL local de vista previa
    // (URL.createObjectURL), no sube el archivo a ningún servidor.
    onUpdate({ ...block, src: URL.createObjectURL(file), alt: block.alt || file.name.replace(/\.[^.]+$/, '') });
  }
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = '';
  }
  function handleDrop(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  }

  function insertVariable(key: string) {
    const field = varTarget;
    if (!field) return;
    const ref = field === 'src' ? urlRef : linkRef;
    const value = field === 'src' ? block.src : block.link;
    const input = ref.current?.input;
    const tag = `{{${key}}}`;
    if (!input) { onUpdate({ ...block, [field]: value + tag }); return; }
    const s = input.selectionStart ?? value.length, e2 = input.selectionEnd ?? value.length;
    const next = value.slice(0, s) + tag + value.slice(e2);
    onUpdate({ ...block, [field]: next });
    setTimeout(() => { input.focus(); input.selectionStart = input.selectionEnd = s + tag.length; }, 0);
  }

  // Sin variable no hay forma de validar el string tal cual se escribió — se resuelve recién
  // al enviar, así que se deja pasar hasta ese momento.
  const srcError = block.dynamic && block.src.trim() && !containsVariable(block.src)
    ? !isHttpsUrl(block.src) ? 'Debe empezar con https://' : !hasImageExtension(block.src) ? 'Debe terminar en .jpg, .jpeg o .png' : null
    : null;
  const linkError = block.link.trim() && !containsVariable(block.link) && !isHttpsUrl(block.link)
    ? 'Debe empezar con https://'
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <GroupHeading>Carga de imagen</GroupHeading>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
        <div style={{ gridColumn: 'span 2' }}>
          <FieldLabel icon={<BiTargetLock />}>Origen</FieldLabel>
          <Segmented
            block value={block.dynamic ? 'url' : 'upload'}
            onChange={v => onUpdate({ ...block, dynamic: v === 'url' })}
            options={[{ label: 'Subir imagen', value: 'upload' }, { label: 'URL dinámico', value: 'url' }]}
          />
        </div>
        <div>
          <FieldLabel icon={<BiMoveHorizontal />}>Tamaño de la imagen</FieldLabel>
          <InputNumber min={10} max={100} value={block.widthPercent} addonAfter="%" onChange={v => onUpdate({ ...block, widthPercent: v ?? 100 })} style={{ width: '100%' }} />
        </div>
      </div>
      <div>
        <FieldLabel icon={<BiImageAlt />}>Imagen</FieldLabel>
        <div style={{ display: 'flex', gap: 8, alignItems: block.dynamic ? 'center' : 'flex-start' }}>
          <ImagePreviewThumb key={block.src} src={block.src} />
          {block.dynamic ? (
            <Input
              ref={urlRef} value={block.src} onChange={e => onUpdate({ ...block, src: e.target.value })}
              placeholder="https://" maxLength={250} style={{ flex: 1 }} status={srcError ? 'error' : undefined}
            />
          ) : (
            <>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg" style={{ display: 'none' }} onChange={handleFileChange} />
              <button
                type="button" onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 9px', cursor: 'pointer',
                  border: `1px solid ${dragOver ? '#1890ff' : '#f0f0f0'}`, borderRadius: 8, background: '#fff', textAlign: 'left',
                }}
              >
                <BiUpload style={{ fontSize: 14, flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)' }}>Sube o arrastra una imagen en formato .jpg o .jpeg. Máx 20MB</span>
              </button>
            </>
          )}
        </div>
        {block.dynamic && <VariableCounterRow length={block.src.length} max={250} onAddVariable={() => setVarTarget('src')} />}
        {srcError && <p style={{ color: '#ff4d4f', fontSize: 12, margin: '4px 0 0' }}>{srcError}</p>}
      </div>
      <div>
        <FieldLabel icon={<BiLink />}>Enlace</FieldLabel>
        <Input
          ref={linkRef} value={block.link} onChange={e => onUpdate({ ...block, link: e.target.value })}
          placeholder="https://" maxLength={250} status={linkError ? 'error' : undefined}
        />
        <VariableCounterRow length={block.link.length} max={250} onAddVariable={() => setVarTarget('link')} />
        {linkError && <p style={{ color: '#ff4d4f', fontSize: 12, margin: '4px 0 0' }}>{linkError}</p>}
      </div>
      <VariablePickerModal open={varTarget !== null} onClose={() => setVarTarget(null)} onPick={insertVariable} />
      <div>
        <FieldLabel icon={<BiText />}>Texto alternativo</FieldLabel>
        <Input value={block.alt} onChange={e => onUpdate({ ...block, alt: e.target.value })} placeholder="Ej: Detalle de la imagen" maxLength={124} />
        <Text type="secondary" style={{ fontSize: 12, display: 'block', textAlign: 'right', marginTop: 4 }}>{block.alt.length}/124</Text>
      </div>
    </div>
  );
}
// Modal buscable para insertar una variable en un campo de texto (ej. la URL de un botón).
// Un estudio puede tener decenas de variables — listarlas todas como pills (el patrón que
// usa VariableList/TextContentFields) deja de ser usable a esa escala; este modal las busca
// por nombre legible o clave técnica, y una sola vez que se elige una, inserta y cierra.
function VariablePickerModal({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (key: string) => void }) {
  const [search, setSearch] = useState('');
  const term = search.trim().toLowerCase();
  const results = VARIABLES_META.filter(v => !term || v.label.toLowerCase().includes(term) || v.key.toLowerCase().includes(term));

  return (
    <Modal
      open={open}
      onCancel={onClose}
      afterClose={() => setSearch('')}
      footer={null}
      width={480}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600 }}>
          <BiPlus /> Agregar variable
        </span>
      }
      styles={{ content: { borderRadius: 20 } }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 4 }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Elige la variable que quieres insertar en la URL. Al hacer clic se agregará automáticamente y cerraremos esta ventana.
        </Text>
        <Input
          autoFocus allowClear value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre..." prefix={<BiSearch style={{ color: 'rgba(0,0,0,0.25)' }} />}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 360, overflowY: 'auto' }}>
          {results.length === 0 && (
            <Text type="secondary" style={{ fontSize: 12, padding: '12px 0' }}>Sin resultados para "{search}".</Text>
          )}
          {results.map(v => (
            <button
              key={v.key} type="button"
              onClick={() => { onPick(v.key); onClose(); }}
              style={{
                textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer',
                padding: '8px 4px', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 2,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fafafa'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)' }}>@{v.label}</span>
              <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', fontFamily: "'JetBrains Mono', monospace" }}>{v.key}</span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
function ButtonContentFields({ block, onUpdate }: { block: ButtonComponent; onUpdate: (b: Component) => void }) {
  const urlRef = useRef<InputRef>(null);
  const [varPickerOpen, setVarPickerOpen] = useState(false);

  function insertVariable(key: string) {
    const input = urlRef.current?.input;
    const tag = `{{${key}}}`;
    if (!input) { onUpdate({ ...block, url: block.url + tag }); return; }
    const s = input.selectionStart ?? block.url.length, e2 = input.selectionEnd ?? block.url.length;
    const next = block.url.slice(0, s) + tag + block.url.slice(e2);
    onUpdate({ ...block, url: next });
    setTimeout(() => { input.focus(); input.selectionStart = input.selectionEnd = s + tag.length; }, 0);
  }

  const urlError = block.url.trim() && !containsVariable(block.url) && !isHttpsUrl(block.url)
    ? 'Debe empezar con https://'
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div><FieldLabel icon={<BiText />}>Texto del botón</FieldLabel><Input value={block.text} onChange={e => onUpdate({ ...block, text: e.target.value })} /></div>
      <div>
        <FieldLabel icon={<BiLink />}>URL de destino</FieldLabel>
        <Input
          ref={urlRef} value={block.url} onChange={e => onUpdate({ ...block, url: e.target.value })}
          placeholder="Ingrese la url" maxLength={2048} status={urlError ? 'error' : undefined}
        />
        {urlError && <p style={{ color: '#ff4d4f', fontSize: 12, margin: '4px 0 0' }}>{urlError}</p>}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <button
            type="button" onClick={() => setVarPickerOpen(true)}
            style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: '#1890ff', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <BiPlus style={{ fontSize: 14 }} /> variable
          </button>
          <Text type="secondary" style={{ fontSize: 12 }}>{block.url.length}/2048</Text>
        </div>
        <VariablePickerModal open={varPickerOpen} onClose={() => setVarPickerOpen(false)} onPick={insertVariable} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
        <div><FieldLabel icon={<BiColorFill />}>Color de fondo</FieldLabel><ColorPickerField value={block.bgColor} onChange={c => onUpdate({ ...block, bgColor: c })} /></div>
        <div><FieldLabel icon={<BiColorFill />}>Color de texto</FieldLabel><ColorPickerField value={block.textColor} onChange={c => onUpdate({ ...block, textColor: c })} /></div>
      </div>
    </div>
  );
}
function SpacerContentFields({ block, onUpdate }: { block: SpacerComponent; onUpdate: (b: Component) => void }) {
  return (
    <div>
      <FieldLabel icon={<BiVerticalCenter />}>Tamaño</FieldLabel>
      <InputNumber min={4} max={200} value={block.height} addonAfter="px" onChange={v => onUpdate({ ...block, height: v ?? 24 })} style={{ width: '100%' }} />
    </div>
  );
}
function DividerLineIcon({ variant }: { variant: 'solid' | 'dashed' | 'dotted' }) {
  return <span style={{ display: 'block', width: 18, height: 0, borderTop: `2px ${variant} currentColor` }} />;
}
const DIVIDER_STYLE_OPTIONS: { value: DividerBlock['lineStyle']; icon: React.ReactNode; title: string }[] = [
  { value: 'solid', icon: <DividerLineIcon variant="solid" />, title: 'Sólido' },
  { value: 'dashed', icon: <DividerLineIcon variant="dashed" />, title: 'Guiones' },
  { value: 'dotted', icon: <DividerLineIcon variant="dotted" />, title: 'Punteado' },
];
function DividerContentFields({ block, onUpdate }: { block: DividerBlock; onUpdate: (b: Component) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <FieldLabel icon={<BiColorFill />}>Color</FieldLabel>
        <ColorPickerField value={block.color} onChange={c => onUpdate({ ...block, color: c })} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
        <div>
          <FieldLabel icon={<BiMoveHorizontal />}>Tamaño</FieldLabel>
          <InputNumber min={10} max={100} value={block.widthPercent} addonAfter="%" onChange={v => onUpdate({ ...block, widthPercent: v ?? 100 })} style={{ width: '100%' }} />
        </div>
        <div>
          <FieldLabel icon={<BiVerticalCenter />}>Grosor</FieldLabel>
          <InputNumber min={1} max={12} value={block.thickness} addonAfter="px" onChange={v => onUpdate({ ...block, thickness: v ?? 1 })} style={{ width: '100%' }} />
        </div>
        <div>
          <FieldLabel icon={<BiPen />}>Tipo</FieldLabel>
          <IconSegmented value={block.lineStyle} options={DIVIDER_STYLE_OPTIONS} onChange={v => onUpdate({ ...block, lineStyle: v })} />
        </div>
      </div>
    </div>
  );
}
// Swatch real (no un glifo de texto) para que cada opción muestre el radio que en verdad
// va a aplicar — "square" y "rounded" se veían idénticos como caracteres Unicode.
function ShapeSwatch({ shape }: { shape: 'square' | 'rounded' | 'circle' }) {
  const radius = shape === 'circle' ? '50%' : shape === 'rounded' ? 4 : 0;
  return <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid currentColor', borderRadius: radius, verticalAlign: 'middle' }} />;
}
const SHAPE_OPTIONS: { value: 'square' | 'rounded' | 'circle'; icon: React.ReactNode; title: string }[] = [
  { value: 'square', icon: <ShapeSwatch shape="square" />, title: 'Cuadrado' },
  { value: 'rounded', icon: <ShapeSwatch shape="rounded" />, title: 'Redondeado' },
  { value: 'circle', icon: <ShapeSwatch shape="circle" />, title: 'Círculo' },
];
// El campo ya tiene "https://" fijo como addonBefore — solo falta validar que, si la red
// está incluida, se haya escrito algo, y que no se repita el esquema dentro del valor.
function socialUrlError(entry: SocialNetworkEntry): string | null {
  if (!entry.included) return null;
  if (!entry.url.trim()) return 'Falta la URL';
  if (/^https?:\/\//i.test(entry.url)) return 'No repitas https:// — ya está incluido antes del campo';
  return null;
}

function SocialContentFields({ block, onUpdate }: { block: SocialComponent; onUpdate: (b: Component) => void }) {
  function setEntry(network: SocialNetworkKey, patch: { included?: boolean; url?: string }) {
    onUpdate({ ...block, networks: block.networks.map(n => n.network === network ? { ...n, ...patch } : n) });
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <FieldLabel icon={<BiPalette />}>Tipo</FieldLabel>
        <Select
          style={{ width: '100%' }} value={block.style}
          onChange={v => onUpdate({ ...block, style: v as SocialComponent['style'] })}
          options={[
            { value: 'negro', label: 'Negro' },
            { value: 'blanco', label: 'Blanco' },
            { value: 'color', label: 'Color' },
          ]}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
        <div>
          <FieldLabel icon={<BiMoveHorizontal />}>Tamaño</FieldLabel>
          <InputNumber min={12} max={64} value={block.size} addonAfter="px" onChange={v => onUpdate({ ...block, size: v ?? 26 })} style={{ width: '100%' }} />
        </div>
        <div>
          <FieldLabel icon={<BiMoveHorizontal />}>Espacio entre íconos</FieldLabel>
          <InputNumber min={0} max={40} value={block.gap} addonAfter="px" onChange={v => onUpdate({ ...block, gap: v ?? 8 })} style={{ width: '100%' }} />
        </div>
        <div>
          <FieldLabel icon={<BiPen />}>Estilo del borde</FieldLabel>
          <IconSegmented value={block.shape} options={SHAPE_OPTIONS} onChange={v => onUpdate({ ...block, shape: v })} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
        {block.networks.map(entry => {
          const error = socialUrlError(entry);
          return (
            <div key={entry.network}>
              <Checkbox checked={entry.included} onChange={e => setEntry(entry.network, { included: e.target.checked })}>
                <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)' }}>{SOCIAL_LABELS[entry.network]}</Text>
              </Checkbox>
              <Input
                addonBefore="https://" maxLength={2048}
                value={entry.url} onChange={e => setEntry(entry.network, { url: e.target.value })}
                placeholder={`https://www.${SOCIAL_LABELS[entry.network]}.com`}
                style={{ marginTop: 8 }} status={error ? 'error' : undefined}
              />
              <Text type="secondary" style={{ fontSize: 12, display: 'block', textAlign: 'right', marginTop: 4 }}>{entry.url.length}/2048</Text>
              {error && <p style={{ color: '#ff4d4f', fontSize: 12, margin: '-2px 0 0' }}>{error}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const TYPE_SECTION_TITLE: Partial<Record<ComponentType, string>> = {
  header: 'Encabezado', title: 'Título', text: 'Texto', responses: 'Bloque de respuestas',
  image: 'Imagen', button: 'Botón', spacer: 'Espaciador', social: 'Redes Sociales', divider: 'Divisor',
};

function ComponentTypeFields({ component, onUpdate }: { component: Component; onUpdate: (c: Component) => void }) {
  if (component.type === 'text')      return <TextContentFields block={component} onUpdate={onUpdate} />;
  if (component.type === 'header')    return <HeaderContentFields block={component} onUpdate={onUpdate} />;
  if (component.type === 'title')     return <TitleContentFields block={component} onUpdate={onUpdate} />;
  if (component.type === 'responses') return <ResponsesContentFields block={component} onUpdate={onUpdate} />;
  if (component.type === 'image')     return <ImageContentFields block={component} onUpdate={onUpdate} />;
  if (component.type === 'button')    return <ButtonContentFields block={component} onUpdate={onUpdate} />;
  if (component.type === 'spacer')    return <SpacerContentFields block={component} onUpdate={onUpdate} />;
  if (component.type === 'social')    return <SocialContentFields block={component} onUpdate={onUpdate} />;
  if (component.type === 'divider')   return <DividerContentFields block={component} onUpdate={onUpdate} />;
  return <Text type="secondary" style={{ fontSize: 12 }}>Este componente no tiene contenido configurable.</Text>;
}

// ─── Main EditorView ─────────────────────────────────────────────────────────

type Selection =
  | { kind: 'row'; rowId: string }
  | { kind: 'component'; rowId: string; columnId: string; componentId: string }
  | null;

export default function EditorView({ template, onChange, onBack }: Props) {
  const { message } = App.useApp();
  const [draft, setDraft] = useState<EmailTemplate>(template);
  const [showTestModal, setShowTestModal] = useState(false);
  const [sentPreview, setSentPreview] = useState<{ email: string; html: string } | null>(null);
  const [mode, setMode] = useState<'visual' | 'html'>(template.customHtml ? 'html' : 'visual');
  const [activeTab, setActiveTab] = useState<'elementos' | 'configuracion' | 'diseno'>('elementos');
  const [selection, setSelection] = useState<Selection>(null);
  const [columnPickerOpen, setColumnPickerOpen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const rows = draft.rows;

  function updateDraft(patch: Partial<EmailTemplate>) {
    setDraft(d => ({ ...d, ...patch }));
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
    Modal.confirm({
      title: '¿Estás seguro de salir?',
      content: 'Si abandona la edición del estudio, se perderá el diseño del correo hasta dónde lo ha configurado.',
      icon: decisionIcon('info'),
      okText: 'Sí, quiero salir',
      okButtonProps: ROUND_BTN,
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
  // Compartido entre "Guardar diseño" y "Enviar prueba": ninguna de las dos debe poder
  // ejecutarse con el correo vacío o con un enlace/URL mal formado. Devuelve false y muestra
  // el aviso correspondiente si algo no pasa; true si está todo en orden.
  function validateContentOrWarn(emptyMessage: string): boolean {
    if (countComponents(draft.rows) === 0) {
      Modal.warning({
        title: 'Acción no permitida',
        content: emptyMessage,
        icon: decisionIcon('warning'),
        okButtonProps: ROUND_BTN,
        getContainer: () => rootRef.current || document.body,
        styles: { content: { borderRadius: 20 } },
      });
      return false;
    }
    const issues = collectContentIssues(draft.rows);
    if (issues.length > 0) {
      Modal.warning({
        title: 'Revisa los enlaces del correo',
        content: (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {issues.map((it, i) => <li key={i}>{it.label}: {it.reason}</li>)}
          </ul>
        ),
        icon: decisionIcon('warning'),
        okButtonProps: ROUND_BTN,
        getContainer: () => rootRef.current || document.body,
        styles: { content: { borderRadius: 20 } },
      });
      return false;
    }
    return true;
  }
  function handleSaveDesign() {
    if (!validateContentOrWarn('Debes agregar contenido al correo antes de guardarlo.')) return;
    Modal.confirm({
      title: '¿Guardar esta plantilla?',
      content: 'Estás a punto de guardar los cambios realizados en esta plantilla de correo. Asegúrate de haber verificado que todo se ve como esperas.',
      icon: decisionIcon('success'),
      okText: 'Guardar plantilla',
      okButtonProps: ROUND_BTN,
      cancelText: 'Cancelar',
      cancelButtonProps: ROUND_BTN,
      getContainer: () => rootRef.current || document.body,
      styles: { content: { borderRadius: 20 } },
      onOk: () => commitSaveDesign(),
    });
  }
  function handleOpenTestModal() {
    if (!validateContentOrWarn('Debes agregar contenido al correo antes de enviar una prueba.')) return;
    setShowTestModal(true);
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
  function handleTestSent(email: string, values: Record<string, string>) {
    setShowTestModal(false);
    message.success(`Correo de prueba enviado a ${email} ✓`);
    const resolvedHtml = renderRowsToHtml(resolveRowsVariables(draft.rows, values));
    setSentPreview({ email, html: resolvedHtml });
  }

  const htmlValue = draft.customHtml ?? renderRowsToHtml(draft.rows);

  const cardMaxWidth = 6 * draft.layout.widthPercent;
  const cardStyle: React.CSSProperties = draft.layout.boxed
    ? { maxWidth: cardMaxWidth, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'visible', minHeight: 180 }
    : { width: '100%', background: '#fff', overflow: 'visible', minHeight: 180 };

  const TAB_LABEL: Record<'elementos' | 'configuracion' | 'diseno', string> = {
    elementos: 'Elementos', configuracion: 'Configuración', diseno: 'Diseño',
  };
  // Barra de pestañas arriba del panel lateral (como el Tabs-Top del Figma).
  const tabStrip = (
    <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
      {(['elementos', 'configuracion', 'diseno'] as const).map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          style={{
            flex: 1, border: 'none', background: 'none', cursor: 'pointer', padding: '13px 0', marginBottom: -1,
            borderBottom: activeTab === tab ? '2px solid #1890ff' : '2px solid transparent',
            color: activeTab === tab ? '#1890ff' : 'rgba(0,0,0,0.45)',
            fontFamily: "'Roboto', sans-serif", fontSize: 14, lineHeight: 'normal', fontWeight: activeTab === tab ? 500 : 400,
          }}
        >
          {TAB_LABEL[tab]}
        </button>
      ))}
    </div>
  );

  return (
    <ConfigProvider theme={EDITOR_THEME}>
    <div ref={rootRef} style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f5f5f5', overflow: 'hidden', fontFamily: "'Roboto', sans-serif", position: 'relative' }}>
      {/* Header — envuelve a una segunda línea si no cabe (Figma: volver + últ. actualización · toggle de modo · CTAs) */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '12px 24px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, rowGap: 8, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flexWrap: 'wrap', rowGap: 4 }}>
          <button
            onClick={handleExit}
            style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, lineHeight: 'normal', color: '#1890ff', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
          >
            <BiChevronLeft style={{ fontSize: 16 }} /> Volver al wizard
          </button>
          <div style={{ width: 1, height: 20, background: '#f0f0f0' }} />
          <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
            Últ. actualización: {formatDate(draft.blocksUpdatedAt)}
          </Text>
        </div>
        <Segmented
          value={mode}
          onChange={v => handleModeChange(v as 'visual' | 'html')}
          options={[{ label: 'Editor visual', value: 'visual' }, { label: 'Editor HTML', value: 'html' }]}
          style={{ flexShrink: 0 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Button icon={<BiSend />} onClick={handleOpenTestModal}>Enviar prueba</Button>
          <Button type="primary" onClick={handleSaveDesign}>Guardar diseño</Button>
        </div>
      </div>

      {mode === 'html' ? (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
          {/* Vista previa en vivo */}
          <div className="rf-scroll-hidden" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 24, background: draft.layout.bgColor !== 'transparent' ? draft.layout.bgColor : '#f5f5f5' }}>
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
            <div ref={canvasRef} className="rf-scroll-hidden" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 24, background: draft.layout.bgColor !== 'transparent' ? draft.layout.bgColor : '#f5f5f5' }}>
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
                        onUpdateComponent={(columnId, comp) => updateComponent(row.id, columnId, comp)}
                      />
                    ))}
                    <AddElementDropZone onDropComponent={addComponentRow}>
                      <div
                        onClick={() => { setActiveTab('elementos'); requestAnimationFrame(() => document.getElementById('palette-section')?.scrollIntoView({ behavior: 'smooth' })); }}
                        style={{ padding: 16, textAlign: 'center', cursor: 'pointer', borderTop: '1px dashed #d9d9d9' }}
                      >
                        <Text type="secondary" style={{ fontSize: 12 }}><BiPlus style={{ marginRight: 8 }} />Agregar elemento, o arrastra uno aquí</Text>
                      </div>
                    </AddElementDropZone>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar — pestañas arriba (Elementos/Configuración/Diseño) + contenido */}
            <div style={{ ...SIDEBAR_WIDTH, background: '#fff', borderLeft: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {tabStrip}
              <div className="rf-scroll-hidden" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 24px' }}>
                {activeTab === 'elementos' && (
                  <div id="palette-section">
                    <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.24, lineHeight: '14px', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Estructura</Text>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '16px 24px', marginBottom: 12 }}>
                      <PaletteItem icon={<BiTable />} label="Columnas" onClick={() => setColumnPickerOpen(o => !o)} />
                    </div>
                    {columnPickerOpen && <ColumnLayoutPicker onPick={addRow} onClose={() => setColumnPickerOpen(false)} />}
                    <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.24, lineHeight: '14px', textTransform: 'uppercase', display: 'block', margin: '12px 0 12px' }}>Componentes</Text>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '16px 24px' }}>
                      {COMPONENT_PALETTE.map(item => (
                        <PaletteItem key={item.type} icon={item.icon} label={item.label} componentType={item.type} onClick={() => addComponentRow(item.type)} />
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
                  ) : (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Selecciona una fila o un componente del canvas para editar su diseño.
                    </Text>
                  )
                )}
              </div>
            </div>
          </div>
        </DndProvider>
      )}

      {showTestModal && (
        <TestModal
          variableKeys={collectUrlVariableKeys(draft.rows)}
          onClose={() => setShowTestModal(false)}
          onSend={handleTestSent}
        />
      )}

      {sentPreview && (
        <Modal
          open
          onCancel={() => setSentPreview(null)}
          footer={null}
          width={640}
          title={`Correo de prueba enviado a ${sentPreview.email}`}
          styles={{ content: { borderRadius: 20 } }}
        >
          <div className="rf-scroll-hidden" style={{ background: '#f5f5f5', borderRadius: 12, padding: 20, maxHeight: '70vh', overflowY: 'auto' }}>
            <div
              style={{ maxWidth: 580, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden' }}
              dangerouslySetInnerHTML={{ __html: sentPreview.html }}
            />
          </div>
        </Modal>
      )}
    </div>
    </ConfigProvider>
  );
}
