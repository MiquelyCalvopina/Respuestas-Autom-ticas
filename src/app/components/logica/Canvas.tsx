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
  /** línea informativa (sección 2) — vive en el panel visual */
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
    <div style={{ flex: 1, minWidth: 0, background: '#fafafa', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Línea informativa (sección 2) — en el panel visual, fondo Neutral/3 */}
      {infoVisible && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f5f5', borderBottom: '1px solid #f0f0f0', padding: '8px 16px', flexShrink: 0 }}>
          <BoxIcon name="bx-info-circle" size={14} color="rgba(0,0,0,0.45)" />
          <span style={{ flex: 1, fontFamily: FONT, fontSize: 12, color: 'rgba(0,0,0,0.55)', lineHeight: '16px' }}>
            El orden que ves aquí es el de Estructura. La lógica puede mostrar, ocultar o saltar preguntas según cada encuestado, pero no las reordena.
          </span>
          <button
            type="button" onClick={onDismissInfo} aria-label="Descartar"
            style={{ display: 'flex', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.45)', padding: 2 }}
          >
            <BoxIcon name="bx-x" size={16} />
          </button>
        </div>
      )}

      {/* Caja de despedidas sin usar — condicional (sección 1). No existe en DOM si no
          hay huérfanas. Arriba-izquierda: nunca se solapa con el diagrama central. */}
      {huerfanas.length > 0 && (
        <div style={{ alignSelf: 'flex-start', margin: '16px 0 0 16px', width: 220, background: '#fff', border: '1px solid #d9d9d9', borderRadius: 8, boxShadow: '0 1px 2px rgba(15,23,42,.05)', padding: 12 }}>
          <p style={{ fontFamily: FONT, fontSize: 14, color: 'rgba(0,0,0,0.85)', margin: '0 0 12px 0', lineHeight: '20px' }}>
            Despedidas sin usar<br />en el flujo del estudio.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {huerfanas.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f5f5', border: '1px solid #d9d9d9', borderRadius: 8, padding: '4px 8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 999, background: '#ffccc7', flexShrink: 0 }}>
                  <BoxIcon name="bx-link" size={12} color="rgba(0,0,0,0.85)" />
                </span>
                <span style={{ fontFamily: FONT, fontSize: 14, color: 'rgba(0,0,0,0.85)' }}>{d.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diagrama vertical */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: huerfanas.length > 0 ? '24px 24px 48px' : '48px 24px' }}>
        {FLUJO.map((n, i) => {
          const key = claveNodo(n);
          const sel = estaSeleccionado(n, seleccion);
          const tieneLogica = conLogica.has(key);
          const orphan = n.tipo === 'pregunta' && sinAcceso.has(n.refId!);
          const clickable = seleccionable(n);

          // Color del texto: azul si seleccionado, negro 85% en cualquier otro caso
          // (peso Regular 400 — el sistema solo usa 400/500).
          const textColor = sel ? '#1890ff' : 'rgba(0,0,0,0.85)';

          // Todos los nodos son blancos con borde Neutral/4; el seleccionado usa
          // Primary/1 + Primary/6; el huérfano, borde punteado de peligro.
          const border = orphan ? '1px dashed #ff4d4f'
            : sel ? '1px solid #1890ff'
            : '1px solid #f0f0f0';
          const bg = sel ? '#e6f7ff' : '#fff';

          // Feedback de hover en nodos clickeables (micro-interacción del sistema):
          // azulea el borde y eleva la sombra sin pelear con el color base.
          const isHover = clickable && !sel && !orphan && hovered === key;
          const border2 = isHover ? '1px solid #69c0ff' : border;
          const shadow = sel ? '0 2px 8px rgba(24,144,255,0.15)'
            : isHover ? '0 4px 10px rgba(15,23,42,.10)'
            : '0 1px 2px rgba(15,23,42,.05)';

          return (
            <div key={n.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                onClick={clickable ? () => onSelect(selDe(n)) : undefined}
                onMouseEnter={clickable ? () => setHovered(key) : undefined}
                onMouseLeave={clickable ? () => setHovered(h => (h === key ? null : h)) : undefined}
                role={clickable ? 'button' : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  maxWidth: 320, minWidth: 90, boxSizing: 'border-box',
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
                  width: 0, height: 24, margin: orphan ? '4px 0' : 0,
                  borderLeft: sinAcceso.has(FLUJO[i + 1].refId ?? '') ? '2px dashed #ff4d4f' : '1px solid #d9d9d9',
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
