import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { FLUJO, DESPEDIDAS, FlujoNodo } from '@/app/data/estudio';
import { BoxIcon } from './boxicons';
import { Regla, Seleccion } from './types';
import { nodosConLogica, momentoDeRegla, paginasConLogica } from './derive';

const FONT = "'Roboto', sans-serif";

interface Props {
  reglas: Regla[];
  seleccion: Seleccion;
  onSelect: (s: Seleccion) => void;
  /** preguntas (ids) que el preview de destino por defecto marca sin acceso */
  preguntasSinAcceso: string[];
  /** destinos por defecto personalizados por momento (se dibujan como flecha) */
  destinos: Record<string, string | undefined>;
  /** línea informativa (sección 2) */
  infoVisible: boolean;
  onDismissInfo: () => void;
}

function claveNodo(n: FlujoNodo): string {
  if (n.tipo === 'bienvenida') return 'bienvenida';
  return n.refId ?? n.id;
}
function estaSeleccionado(n: FlujoNodo, sel: Seleccion): boolean {
  if (sel.tipo === 'bienvenida') return n.tipo === 'bienvenida';
  if (sel.tipo === 'pregunta') return n.tipo === 'pregunta' && n.refId === sel.preguntaId;
  return false;
}

type Flecha = { id: string; kind: 'ir_a' | 'terminar' | 'defecto'; x1: number; y1: number; x2: number; y2: number; bow: number };

export default function Canvas({ reglas, seleccion, onSelect, preguntasSinAcceso, destinos, infoVisible, onDismissInfo }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const conLogica = nodosConLogica(reglas);
  const pagsConLogica = paginasConLogica(reglas);
  const sinAcceso = new Set(preguntasSinAcceso);

  // Despedidas alcanzadas por alguna regla "Terminar" (+ la estructural A).
  const usadas = new Set<string>(['desp_a']);
  reglas.forEach(r => { if (r.consecuencia.tipo === 'terminar' && r.consecuencia.destino) usadas.add(r.consecuencia.destino); });
  const despedidasUsadas = DESPEDIDAS.filter(d => usadas.has(d.id));
  const huerfanas = DESPEDIDAS.filter(d => !usadas.has(d.id));

  const nodosLineales = FLUJO.filter(n => n.tipo !== 'despedida'); // Bienvenida + preguntas
  const despA = despedidasUsadas.find(d => d.id === 'desp_a');
  const despedidasAlternas = despedidasUsadas.filter(d => d.id !== 'desp_a'); // objetivo solo de reglas

  // ── Medición para dibujar flechas de consecuencia ──────────────────────────
  const areaRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const setNodeRef = (key: string) => (el: HTMLDivElement | null) => {
    if (el) nodeRefs.current.set(key, el); else nodeRefs.current.delete(key);
  };
  const [flechas, setFlechas] = useState<Flecha[]>([]);
  const [tick, setTick] = useState(0);

  useLayoutEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const base = area.getBoundingClientRect();
    const pos = (key: string) => {
      const el = nodeRefs.current.get(key);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { right: r.right - base.left, midY: (r.top + r.bottom) / 2 - base.top };
    };
    const out: Flecha[] = [];
    let lane = 0;
    reglas.forEach(r => {
      const c = r.consecuencia;
      const kind = c.tipo === 'ir_a' ? 'ir_a' : c.tipo === 'terminar' ? 'terminar' : null;
      if (!kind || !c.destino) return;
      const srcKey = momentoDeRegla(r) === 'inicio' ? 'bienvenida' : momentoDeRegla(r);
      const s = pos(srcKey);
      const t = pos(c.destino);
      if (!s || !t) return;
      out.push({ id: r.id, kind, x1: s.right, y1: s.midY, x2: t.right, y2: t.midY, bow: 28 + lane * 16 });
      lane = (lane + 1) % 5;
    });
    // Destinos por defecto personalizados: el "en cualquier otro caso ir a"
    // también es un salto, con el trazo del camino por defecto.
    Object.entries(destinos).forEach(([momento, destino]) => {
      if (!destino) return;
      const srcKey = momento === 'inicio' ? 'bienvenida' : momento;
      const s2 = pos(srcKey);
      const t2 = pos(destino);
      if (!s2 || !t2) return;
      out.push({ id: `def-${momento}`, kind: 'defecto', x1: s2.right, y1: s2.midY, x2: t2.right, y2: t2.midY, bow: 28 + lane * 16 });
      lane = (lane + 1) % 5;
    });
    setFlechas(out);
  }, [reglas, destinos, tick]);

  // Recalcular al redimensionar el panel.
  useEffect(() => {
    const area = areaRef.current;
    if (!area || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setTick(t => t + 1));
    ro.observe(area);
    return () => ro.disconnect();
  }, []);

  const seleccionable = (n: FlujoNodo) => n.tipo === 'bienvenida' || n.tipo === 'pregunta';
  function selDe(n: FlujoNodo): Seleccion {
    if (n.tipo === 'bienvenida') return { tipo: 'bienvenida' };
    return { tipo: 'pregunta', preguntaId: n.refId! };
  }

  // Nodo del diagrama (reutilizado por preguntas/bienvenida y despedidas).
  function Nodo({ nodeKey, label, sel, tieneLogica, orphan, clickable, onClick }: {
    nodeKey: string; label: string; sel: boolean; tieneLogica: boolean; orphan: boolean; clickable: boolean; onClick?: () => void;
  }) {
    const textColor = sel ? '#1890ff' : 'rgba(0,0,0,0.85)';
    const border = orphan ? '1px dashed #ff4d4f' : sel ? '1px solid #91d5ff' : '1px solid #f0f0f0';
    const bg = sel ? '#e6f7ff' : '#fff';
    const isHover = clickable && !sel && !orphan && hovered === nodeKey;
    const border2 = isHover ? '1px solid #69c0ff' : border;
    const shadow = sel ? '0 2px 8px rgba(24,144,255,0.12)' : isHover ? '0 4px 10px rgba(15,23,42,.10)' : '0 1px 2px rgba(15,23,42,.05)';
    return (
      <div
        ref={setNodeRef(nodeKey)}
        onClick={clickable ? onClick : undefined}
        onMouseEnter={clickable ? () => setHovered(nodeKey) : undefined}
        onMouseLeave={clickable ? () => setHovered(h => (h === nodeKey ? null : h)) : undefined}
        role={clickable ? 'button' : undefined}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          minWidth: 90, maxWidth: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: 8,
          border: border2, background: bg, opacity: orphan ? 0.55 : 1, boxShadow: shadow,
          cursor: clickable ? 'pointer' : 'default',
          transition: 'background .15s ease, border-color .15s ease, box-shadow .15s ease',
        }}
      >
        {tieneLogica && <BoxIcon name="bx-git-branch" size={16} color="#1890ff" />}
        <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 400, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
        {orphan && <BoxIcon name="bx-error-circle" size={14} color="#ff4d4f" />}
      </div>
    );
  }

  const Conector = ({ danger }: { danger?: boolean }) => (
    <div style={{ width: 0, height: 25, borderLeft: danger ? '2px dashed #ff4d4f' : '1px solid #d9d9d9' }} />
  );

  return (
    <div style={{ flex: 1, minWidth: 0, minHeight: 0, background: '#fafafa', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {infoVisible && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, background: '#f5f5f5', borderBottom: '1px solid #f0f0f0', padding: '10px 24px' }}>
          <BoxIcon name="bxs-info-circle" size={15} color="rgba(0,0,0,0.45)" />
          <span style={{ flex: 1, fontFamily: FONT, fontSize: 13, color: 'rgba(0,0,0,0.55)', lineHeight: '18px' }}>
            El orden que ves aquí es el de Estructura. La lógica puede mostrar, ocultar o saltar preguntas según cada encuestado, pero no las reordena.
          </span>
          <button type="button" onClick={onDismissInfo} aria-label="Descartar" style={{ display: 'flex', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.45)', padding: 2, flexShrink: 0 }}>
            <BoxIcon name="bx-x" size={16} />
          </button>
        </div>
      )}

      <div style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '16px 24px' }}>
        {/* Caja de despedidas sin usar (nodo Figma 1621:59344) */}
        {huerfanas.length > 0 && (
          <div style={{ position: 'absolute', top: 16, left: 24, width: 210, background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: 13, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 2 }}>
            <div style={{ fontFamily: FONT, fontSize: 14, color: 'rgba(0,0,0,0.85)', lineHeight: '22px' }}>
              <p style={{ margin: 0 }}>Despedidas sin usar</p>
              <p style={{ margin: 0 }}>en el flujo del estudio.</p>
            </div>
            {huerfanas.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 4, padding: '5px 9px' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 999, background: '#ffccc7', flexShrink: 0, padding: 3, boxSizing: 'border-box' }}>
                  <BoxIcon name="bx-link" size={14} color="#ff4d4f" />
                </span>
                <span style={{ fontFamily: FONT, fontSize: 14, color: 'rgba(0,0,0,0.85)', lineHeight: '22px', whiteSpace: 'nowrap' }}>{d.nombre}</span>
              </div>
            ))}
          </div>
        )}

        {/* Área del diagrama (referencia para medir las flechas) */}
        <div ref={areaRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 300, width: '100%' }}>
          {/* Overlay de flechas de consecuencia (Ir a / Terminar) */}
          <FlechasOverlay flechas={flechas} />

          {nodosLineales.map((n, i) => {
            const key = claveNodo(n);
            const sel = estaSeleccionado(n, seleccion);
            const orphan = n.tipo === 'pregunta' && sinAcceso.has(n.refId!);
            const nextN = nodosLineales[i + 1];
            const paginaCambia = n.tipo === 'pregunta' && (!nodosLineales[i - 1] || nodosLineales[i - 1].pagina !== n.pagina);
            return (
              <div key={n.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '100%' }}>
                {/* Etiqueta de página al iniciar cada grupo */}
                {paginaCambia && n.pagina != null && (() => {
                  const marcada = pagsConLogica.has(n.pagina);
                  return (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0 10px', padding: '2px 10px', borderRadius: 100,
                      background: marcada ? '#e6f7ff' : '#fafafa',
                      border: `1px solid ${marcada ? '#91d5ff' : '#f0f0f0'}`,
                    }}>
                      <BoxIcon name={marcada ? 'bx-git-branch' : 'bx-list-ul'} size={12} color={marcada ? '#1890ff' : 'rgba(0,0,0,0.45)'} />
                      <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 500, letterSpacing: 0.3, color: marcada ? '#1890ff' : 'rgba(0,0,0,0.45)', whiteSpace: 'nowrap' }}>
                        {`PÁGINA ${n.pagina}`}
                      </span>
                    </div>
                  );
                })()}
                <Nodo nodeKey={key} label={n.label} sel={sel} tieneLogica={!!(conLogica.has(key))} orphan={orphan} clickable={seleccionable(n)} onClick={() => onSelect(selDe(n))} />
                {orphan && <span style={{ fontFamily: FONT, fontSize: 11, color: '#ff4d4f', marginTop: 4 }}>Sin camino de acceso</span>}
                {(nextN || despA) && <Conector danger={!!(nextN && sinAcceso.has(nextN.refId ?? ''))} />}
              </div>
            );
          })}

          {/* Despedida estructural (A) */}
          {despA && (
            <Nodo nodeKey={despA.id} label={despA.nombre} sel={false} tieneLogica={conLogica.has(despA.id)} orphan={false} clickable={false} />
          )}

          {/* Despedidas alternas (solo alcanzables por reglas "Terminar") */}
          {despedidasAlternas.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 24 }}>
              {despedidasAlternas.map(d => (
                <Nodo key={d.id} nodeKey={d.id} label={d.nombre} sel={false} tieneLogica={conLogica.has(d.id)} orphan={false} clickable={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Overlay SVG de flechas de consecuencia ────────────────────────────────────
function FlechasOverlay({ flechas }: { flechas: Flecha[] }) {
  if (flechas.length === 0) return null;
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none', zIndex: 1 }} aria-hidden="true">
      <defs>
        <marker id="ah-ir_a" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0 0 L7 4 L0 8 z" fill="#1890ff" />
        </marker>
        <marker id="ah-terminar" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0 0 L7 4 L0 8 z" fill="#ff4d4f" />
        </marker>
        <marker id="ah-defecto" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0 0 L7 4 L0 8 z" fill="#8c8c8c" />
        </marker>
      </defs>
      {flechas.map(f => {
        // Gris = camino por defecto (no condicional); azul = salto condicional;
        // rojo punteado = corte del flujo.
        const color = f.kind === 'ir_a' ? '#1890ff' : f.kind === 'terminar' ? '#ff4d4f' : '#8c8c8c';
        const cx = Math.max(f.x1, f.x2) + f.bow + 12;
        const d = `M ${f.x1} ${f.y1} C ${cx} ${f.y1}, ${cx} ${f.y2}, ${f.x2 + 6} ${f.y2}`;
        return (
          <g key={f.id}>
            <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray={f.kind === 'terminar' ? '5 4' : undefined} markerEnd={`url(#ah-${f.kind})`} opacity={0.9} />
          </g>
        );
      })}
    </svg>
  );
}
