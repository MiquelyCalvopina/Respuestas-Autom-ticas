import { Select, Tooltip, Button } from 'antd';
import { FLUJO, PREGUNTAS } from '@/app/data/estudio';
import { BoxIcon } from './boxicons';
import { Momento } from './types';
import { destinoCalculado, nodoDeMomento, labelNodo } from './derive';

const FONT = "'Roboto', sans-serif";

interface Props {
  momento: Momento;
  tieneReglas: boolean;
  destinoCustom?: string;
  editando: boolean;
  destinoPrueba?: string;
  sinAcceso: string[];
  onEditar: () => void;
  onCambioPrueba: (id: string) => void;
  onGuardar: () => void;
  onCancelar: () => void;
}

function opcionesDestino(momento: Momento) {
  const nodo = nodoDeMomento(momento);
  const i = nodo ? FLUJO.indexOf(nodo) : -1;
  return FLUJO.slice(i + 1)
    .filter(n => n.tipo === 'pregunta' || n.tipo === 'despedida')
    .map(n => ({ value: n.refId ?? n.id, label: labelNodo(n.refId ?? n.id) }));
}

export default function DefaultDestinationBar(p: Props) {
  const calc = destinoCalculado(p.momento);
  const destinoActual = p.destinoCustom ?? calc?.id;
  const labelActual = destinoActual ? labelNodo(destinoActual) : '—';

  const wrap: React.CSSProperties = {
    borderTop: '1px solid #f0f0f0', background: '#fff', padding: 12, flexShrink: 0,
  };

  // ── 5.3 Editando ──────────────────────────────────────────────────────────
  if (p.editando) {
    const hayHuerfanos = p.sinAcceso.length > 0;
    const nombres = p.sinAcceso.map(id => PREGUNTAS.find(q => q.id === id)?.pnum ?? id).join(', ');
    return (
      <div style={wrap}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap' }}>
          <BoxIcon name="bx-subdirectory-right" size={16} color="rgba(0,0,0,0.45)" />
          <span style={{ fontFamily: FONT, fontSize: 13, color: 'rgba(0,0,0,0.65)', whiteSpace: 'nowrap' }}>Continúa a</span>
          <Select
            size="small"
            showSearch
            optionFilterProp="label"
            value={p.destinoPrueba}
            onChange={p.onCambioPrueba}
            options={opcionesDestino(p.momento)}
            style={{ flex: 1, minWidth: 120 }}
          />
          <Tooltip title={hayHuerfanos ? 'Corrige los caminos sin acceso para guardar' : 'Guardar destino'}>
            <span>
              <Button
                type="primary" size="small" disabled={hayHuerfanos}
                onClick={p.onGuardar}
                icon={<BoxIcon name="bx-check" size={14} color={hayHuerfanos ? 'rgba(0,0,0,0.25)' : '#fff'} />}
              />
            </span>
          </Tooltip>
          <Button size="small" onClick={p.onCancelar} icon={<BoxIcon name="bx-x" size={14} color="rgba(0,0,0,0.65)" />} />
        </div>
        <p style={{ fontFamily: FONT, fontSize: 12, margin: '8px 0 0 0', lineHeight: '16px', color: hayHuerfanos ? '#ff4d4f' : 'rgba(0,0,0,0.45)' }}>
          {hayHuerfanos
            ? `No puedes guardar: ${nombres} quedaría sin ningún camino de acceso a la encuesta.`
            : 'Personalizar este destino puede dejar preguntas sin acceso. El diagrama te mostrará si eso pasa.'}
        </p>
      </div>
    );
  }

  // ── 5.1 Bloqueada (sin reglas) ──────────────────────────────────────────────
  if (!p.tieneReglas) {
    return (
      <div style={wrap}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BoxIcon name="bx-lock-alt" size={15} color="rgba(0,0,0,0.35)" />
          <span style={{ fontFamily: FONT, fontSize: 13, color: 'rgba(0,0,0,0.45)', flex: 1 }}>
            Sin reglas, continúa a <span style={{ fontWeight: 500, color: 'rgba(0,0,0,0.65)' }}>{labelActual}</span>
          </span>
          <Tooltip title="Se desbloquea al crear tu primera regla.">
            <span style={{ display: 'flex' }}><BoxIcon name="bx-info-circle" size={15} color="rgba(0,0,0,0.35)" /></span>
          </Tooltip>
        </div>
      </div>
    );
  }

  // ── 5.2 Editable (con reglas, sin editar) ───────────────────────────────────
  return (
    <div style={wrap}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <BoxIcon name="bx-subdirectory-right" size={16} color="rgba(0,0,0,0.45)" />
        <span style={{ fontFamily: FONT, fontSize: 13, color: 'rgba(0,0,0,0.65)', flex: 1 }}>
          Si ninguna regla aplica, continúa a <span style={{ fontWeight: 500, color: '#1890ff' }}>{labelActual}</span>
        </span>
        <button
          type="button" onClick={p.onEditar}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'rgba(0,0,0,0.45)', transition: 'background .15s ease' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.05)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          title="Personalizar destino"
        >
          <BoxIcon name="bx-pencil" size={15} />
        </button>
      </div>
    </div>
  );
}
