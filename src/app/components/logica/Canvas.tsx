import { useState } from 'react';
import { FLUJO, FlujoNodo } from '@/app/data/estudio';
import { BoxIcon } from './boxicons';
import { Regla, Seleccion } from './types';
import { nodosConLogica, despedidasHuerfanas } from './derive';

const FONT = "'Roboto', sans-serif";

interface Props {
  reglas: Regla[];
  seleccion: Seleccion;
  onSelect: (s: Seleccion) => void;
  /** preguntas (ids) que el preview de destino por defecto marca sin acceso */
  preguntasSinAcceso: string[];
  /** línea informativa (sección 2) — solo visible al editar una regla (frames 1620/1633) */
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

export default function Canvas({ reglas, seleccion, onSelect, preguntasSinAcceso, infoVisible, onDismissInfo }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const conLogica = nodosConLogica(reglas);
  const huerfanas = despedidasHuerfanas(reglas);
  const sinAcceso = new Set(preguntasSinAcceso);

  const seleccionable = (n: FlujoNodo) => n.tipo === 'bienvenida' || n.tipo === 'pregunta';

  function selDe(n: FlujoNodo): Seleccion {
    if (n.tipo === 'bienvenida') return { tipo: 'bienvenida' };
    return { tipo: 'pregunta', preguntaId: n.refId! };
  }

  return (
    // Panel visual (bg Neutral/2). La barra informativa queda fija y pegada al
    // borde superior; el contenido (diagrama + despedidas) hace scroll debajo.
    <div style={{ flex: 1, minWidth: 0, minHeight: 0, background: '#fafafa', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Línea informativa (sección 2) — barra a lo ancho, pegada al borde, fija
          arriba. Solo al editar una regla (Figma 1620/1633). */}
      {infoVisible && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, background: '#f5f5f5', borderBottom: '1px solid #f0f0f0', padding: '10px 24px' }}>
          <BoxIcon name="bxs-info-circle" size={15} color="rgba(0,0,0,0.45)" />
          <span style={{ flex: 1, fontFamily: FONT, fontSize: 13, color: 'rgba(0,0,0,0.55)', lineHeight: '18px' }}>
            El orden que ves aquí es el de Estructura. La lógica puede mostrar, ocultar o saltar preguntas según cada encuestado, pero no las reordena.
          </span>
          <button
            type="button" onClick={onDismissInfo} aria-label="Descartar"
            style={{ display: 'flex', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.45)', padding: 2, flexShrink: 0 }}
          >
            <BoxIcon name="bx-x" size={16} />
          </button>
        </div>
      )}

      {/* Zona de scroll: diagrama centrado y alineado arriba; la caja de
          despedidas es una capa absoluta arriba-izquierda (no empuja el diagrama). */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '16px 24px' }}>
        {/* Caja de despedidas sin usar — condicional (sección 1). Figma: borde
            Neutral/5 #d9d9d9, radio 8, padding 12.8; píldoras #f5f5f5 borde #d9d9d9. */}
        {huerfanas.length > 0 && (
          <div style={{ position: 'absolute', top: 16, left: 24, width: 156, background: '#fff', border: '1px solid #d9d9d9', borderRadius: 8, padding: 12.8, display: 'flex', flexDirection: 'column', gap: 12, zIndex: 1 }}>
            <div style={{ fontFamily: FONT, fontSize: 14, color: 'rgba(0,0,0,0.85)', lineHeight: '22px' }}>
              <p style={{ margin: 0 }}>Despedidas sin usar</p>
              <p style={{ margin: 0 }}>en el flujo del estudio.</p>
            </div>
            {huerfanas.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f5f5', border: '1px solid #d9d9d9', borderRadius: 8, padding: '4.8px 8.8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 999, background: '#ffccc7', flexShrink: 0, padding: 3, boxSizing: 'border-box' }}>
                  <BoxIcon name="bx-link" size={14} color="rgba(0,0,0,0.85)" />
                </span>
                <span style={{ fontFamily: FONT, fontSize: 14, color: 'rgba(0,0,0,0.85)', lineHeight: '22px', whiteSpace: 'nowrap' }}>{d.nombre}</span>
              </div>
            ))}
          </div>
        )}

        {/* Diagrama vertical — columna centrada, alineada arriba, ancho máx. 278. */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 278, width: '100%' }}>
          {FLUJO.map((n, i) => {
            const key = claveNodo(n);
            const sel = estaSeleccionado(n, seleccion);
            const tieneLogica = conLogica.has(key);
            const orphan = n.tipo === 'pregunta' && sinAcceso.has(n.refId!);
            const clickable = seleccionable(n);

            // Texto: Primary/6 si seleccionado, negro 85% en cualquier otro caso.
            // Peso Regular (400) — el sistema solo usa 400/500.
            const textColor = sel ? '#1890ff' : 'rgba(0,0,0,0.85)';

            // Nodos blancos con borde Neutral/4 (#f0f0f0). Seleccionado: Primary/1
            // (#e6f7ff) + Primary/3 (#91d5ff). Huérfano: borde punteado de peligro.
            const border = orphan ? '1px dashed #ff4d4f'
              : sel ? '1px solid #91d5ff'
              : '1px solid #f0f0f0';
            const bg = sel ? '#e6f7ff' : '#fff';

            // Feedback de hover (micro-interacción del sistema): Primary/4 (#69c0ff).
            const isHover = clickable && !sel && !orphan && hovered === key;
            const border2 = isHover ? '1px solid #69c0ff' : border;
            const shadow = sel ? '0 2px 8px rgba(24,144,255,0.12)'
              : isHover ? '0 4px 10px rgba(15,23,42,.10)'
              : '0 1px 2px rgba(15,23,42,.05)';

            return (
              <div key={n.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '100%' }}>
                <div
                  onClick={clickable ? () => onSelect(selDe(n)) : undefined}
                  onMouseEnter={clickable ? () => setHovered(key) : undefined}
                  onMouseLeave={clickable ? () => setHovered(h => (h === key ? null : h)) : undefined}
                  role={clickable ? 'button' : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    minWidth: 90, maxWidth: '100%', boxSizing: 'border-box',
                    padding: '8px 12px', borderRadius: 8,
                    border: border2, background: bg,
                    opacity: orphan ? 0.55 : 1,
                    boxShadow: shadow,
                    cursor: clickable ? 'pointer' : 'default',
                    transition: 'background .15s ease, border-color .15s ease, box-shadow .15s ease',
                  }}
                >
                  {tieneLogica && <BoxIcon name="bx-git-branch" size={16} color="#1890ff" />}
                  <span style={{
                    fontFamily: FONT, fontSize: 14, fontWeight: 400, color: textColor,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {n.label}
                  </span>
                  {orphan && <BoxIcon name="bx-error-circle" size={14} color="#ff4d4f" />}
                </div>
                {orphan && (
                  <span style={{ fontFamily: FONT, fontSize: 11, color: '#ff4d4f', marginTop: 4 }}>Sin camino de acceso</span>
                )}
                {i < FLUJO.length - 1 && (
                  <div style={{
                    width: 0, height: 25, margin: orphan ? '4px 0' : 0,
                    borderLeft: sinAcceso.has(FLUJO[i + 1].refId ?? '') ? '2px dashed #ff4d4f' : '1px solid #d9d9d9',
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
