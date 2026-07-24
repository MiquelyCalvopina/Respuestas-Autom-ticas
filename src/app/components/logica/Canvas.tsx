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

export default function Canvas({ reglas, seleccion, onSelect, preguntasSinAcceso }: Props) {
  const dimmed = reglas.length === 0;
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
      {/* Caja de despedidas sin usar — condicional (sección 1). No existe en DOM si no hay
          huérfanas. En flujo normal arriba-izquierda: nunca se solapa con el diagrama. */}
      {huerfanas.length > 0 && (
        <div style={{ alignSelf: 'flex-start', margin: '16px 0 0 16px', width: 210, background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, boxShadow: '0 4px 6px rgba(15,23,42,.07)', padding: 12 }}>
          <p style={{ fontFamily: FONT, fontSize: 13, color: 'rgba(0,0,0,0.65)', margin: '0 0 10px 0', lineHeight: '18px' }}>
            Despedidas sin usar en el flujo del estudio.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {huerfanas.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8, padding: '4px 8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 999, background: '#FFF1F0', flexShrink: 0 }}>
                  <BoxIcon name="bx-unlink" size={12} color="#CF1322" />
                </span>
                <span style={{ fontFamily: FONT, fontSize: 13, color: 'rgba(0,0,0,0.85)' }}>{d.nombre}</span>
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
          const tieneLogica = !dimmed && conLogica.has(key);
          const orphan = n.tipo === 'pregunta' && sinAcceso.has(n.refId!);
          const clickable = seleccionable(n);

          // color base del texto
          const textColor = dimmed ? 'rgba(0,0,0,0.45)'
            : sel ? '#1890ff'
            : 'rgba(0,0,0,0.85)';

          const border = orphan ? '1px dashed #ff4d4f'
            : sel ? '1px solid #1890ff'
            : n.tipo === 'bienvenida' ? '1px solid #C7D2FE'
            : n.tipo === 'despedida' ? '1px solid #A7F3D0'
            : '1px solid #f0f0f0';

          const bg = orphan ? '#fff'
            : sel ? 'rgba(24,144,255,0.06)'
            : n.tipo === 'bienvenida' ? '#EEF2FF'
            : n.tipo === 'despedida' ? '#ECFDF5'
            : '#fff';

          return (
            <div key={n.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                onClick={clickable ? () => onSelect(selDe(n)) : undefined}
                role={clickable ? 'button' : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  maxWidth: 260, minWidth: 160, boxSizing: 'border-box',
                  padding: '8px 16px', borderRadius: 8,
                  border, background: bg,
                  opacity: orphan ? 0.55 : 1,
                  boxShadow: sel ? '0 2px 8px rgba(24,144,255,0.15)' : '0 1px 2px rgba(15,23,42,.05)',
                  cursor: clickable ? 'pointer' : 'default',
                  transition: 'background .15s ease, border-color .15s ease',
                }}
              >
                {tieneLogica && <BoxIcon name="bx-git-branch" size={16} color="#1890ff" />}
                <span style={{
                  fontFamily: FONT, fontSize: 14, fontWeight: 500, color: textColor,
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
