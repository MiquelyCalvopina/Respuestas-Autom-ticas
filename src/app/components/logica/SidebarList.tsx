import { useState } from 'react';
import { Button, Popconfirm, Tooltip } from 'antd';
import { preguntaById } from '@/app/data/estudio';
import { BoxIcon, BoxIconName } from './boxicons';
import { EmptyIllustration } from './EmptyIllustration';
import { SidebarHeader } from './SidebarHeader';
import { Regla, Seleccion, ConsecuenciaTipo } from './types';
import { Seg, narrarRegla } from './naturalLanguage';
import { momentosConReglas, reglasDeMomento } from './derive';

const FONT = "'Roboto', sans-serif";
// Golden Purple 6 — color que los usuarios ya reconocen para las referencias a
// la estructura del estudio (preguntas, variables, campos, páginas, despedidas).
const REF = '#722ed1';
const T85 = 'rgba(0,0,0,0.85)';
const T65 = 'rgba(0,0,0,0.65)';

// Solo el ícono se colorea por tipo de consecuencia (igual que las flechas del
// diagrama); el verbo va en negro para no convertir la fila en un arcoíris.
const CONS_ICONO: Record<ConsecuenciaTipo, { icon: BoxIconName; color: string }> = {
  mostrar:     { icon: 'bx-show', color: 'rgba(0,0,0,0.45)' },
  ir_a:        { icon: 'bx-subdirectory-right', color: '#1890ff' },
  obligatoria: { icon: 'bx-lock-alt', color: '#d48806' },
  terminar:    { icon: 'bx-flag', color: '#ff4d4f' },
};

/** Máximo de condiciones visibles antes de colapsar el resto. */
const MAX_VISIBLES = 3;

interface Props {
  reglas: Regla[];
  seleccion: Seleccion;
  onCrear: () => void;
  onEditar: (reglaId: string) => void;
  onEliminar: (reglaId: string) => void;
}

function SegText({ segs }: { segs: Seg[] }) {
  return (
    <>
      {segs.map((seg, i) => {
        const style: React.CSSProperties | undefined =
          seg.kind === 'ref' ? { color: REF, fontWeight: 500 }
          : seg.kind === 'valor' ? { color: T85 }
          : seg.kind === 'op' ? { color: T65 }
          : undefined;
        const el = <span key={i} style={style}>{seg.t}</span>;
        // El texto del usuario se trunca en la fila; el completo va en tooltip.
        return seg.full ? <Tooltip key={i} title={seg.full}>{el}</Tooltip> : el;
      })}
    </>
  );
}

/** Chip de conector Y/O al inicio de una línea de condición. */
function ConectorChip({ valor }: { valor: 'Y' | 'O' }) {
  return (
    <span style={{
      flexShrink: 0, fontFamily: FONT, fontSize: 11, fontWeight: 500, lineHeight: '16px',
      color: 'rgba(0,0,0,0.45)', background: 'rgba(0,0,0,0.04)', borderRadius: 4, padding: '0 5px',
    }}>{valor}</span>
  );
}

function tituloMomento(momento: string): string {
  if (momento === 'inicio') return 'AL INICIAR LA ENCUESTA';
  const q = preguntaById(momento);
  if (!q) return momento.toUpperCase();
  const texto = (q.texto ?? '').trim();
  if (!texto) return `AL RESPONDER ${q.pnum}`;
  const enunciado = texto.length > 34 ? texto.slice(0, 34) + '…' : texto;
  return `AL RESPONDER ${q.pnum} ${enunciado}`.toUpperCase();
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
      <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 500, letterSpacing: 0.4, color: 'rgba(0,0,0,0.35)', whiteSpace: 'nowrap' }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
    </div>
  );
}

function ReglaRow({ regla, onEditar, onEliminar }: { regla: Regla; onEditar: () => void; onEliminar: () => void }) {
  const [expandido, setExpandido] = useState(false);
  const n = narrarRegla(regla);
  // Hasta MAX_VISIBLES se muestran completas; si hay más, se ven las 2 primeras
  // y el resto queda tras "+ N condiciones más".
  const colapsable = n.condiciones.length > MAX_VISIBLES;
  const ocultas = colapsable ? n.condiciones.length - (MAX_VISIBLES - 1) : 0;
  const visibles = !colapsable || expandido ? n.condiciones : n.condiciones.slice(0, MAX_VISIBLES - 1);
  const icono = CONS_ICONO[n.consecuencia.tipo];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', border: '1px solid #f0f0f0', borderRadius: 8, background: '#fff' }}>
      {/* Una línea por condición + una de consecuencia */}
      <div style={{ flex: 1, minWidth: 0, fontFamily: FONT, fontSize: 13, lineHeight: '20px', color: T85, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {visibles.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 6, paddingLeft: l.nivel * 14 }}>
            {i === 0 && l.nivel === 0
              ? <span style={{ flexShrink: 0, color: 'rgba(0,0,0,0.45)' }}>Si</span>
              : l.conector ? <ConectorChip valor={l.conector} /> : null}
            <span style={{ minWidth: 0 }}><SegText segs={l.segs} /></span>
          </div>
        ))}

        {/* Colapso cuando hay más de MAX_VISIBLES condiciones */}
        {ocultas > 0 && (
          <button
            type="button" onClick={() => setExpandido(x => !x)}
            style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: '#1890ff', fontFamily: FONT, fontSize: 12 }}
          >
            {expandido ? 'Ver menos' : `+ ${ocultas} ${ocultas === 1 ? 'condición más' : 'condiciones más'}`}
          </button>
        )}

        {/* Consecuencia */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
          <span style={{ flexShrink: 0, color: 'rgba(0,0,0,0.45)' }}>entonces</span>
          <BoxIcon name={icono.icon} size={14} color={icono.color} style={{ alignSelf: 'flex-start', marginTop: 3 }} />
          <span style={{ minWidth: 0 }}>
            <span style={{ fontWeight: 500 }}>{n.consecuencia.verbo}</span>
            <span> </span>
            <SegText segs={n.consecuencia.destino} />
          </span>
        </div>
      </div>

      {/* Acciones + código de la regla (visible para soporte) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 2 }}>
          <IconBtn icon="bx-pencil" onClick={onEditar} label="Editar regla" />
          <Popconfirm
            title="¿Seguro que quieres eliminar esta regla?"
            okText="Sí, eliminar" cancelText="Cancelar" okButtonProps={{ danger: true }}
            onConfirm={onEliminar}
          >
            <span><IconBtn icon="bx-trash" danger label="Eliminar regla" /></span>
          </Popconfirm>
        </div>
        <Tooltip title="Identificador de la regla, útil para soporte">
          <span style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(0,0,0,0.25)', whiteSpace: 'nowrap', paddingRight: 2 }}>{regla.codigo}</span>
        </Tooltip>
      </div>
    </div>
  );
}

function IconBtn({ icon, onClick, danger, label }: { icon: 'bx-pencil' | 'bx-trash'; onClick?: () => void; danger?: boolean; label: string }) {
  return (
    <button
      type="button" onClick={onClick} title={label} aria-label={label}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: danger ? '#ff4d4f' : 'rgba(0,0,0,0.45)', transition: 'background .15s ease' }}
      onMouseEnter={e => (e.currentTarget.style.background = danger ? 'rgba(255,77,79,0.08)' : 'rgba(0,0,0,0.05)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <BoxIcon name={icon} size={15} />
    </button>
  );
}

export default function SidebarList({ reglas, seleccion, onCrear, onEditar, onEliminar }: Props) {
  // Encabezado según selección
  let titulo: string, subtitulo: string;
  if (seleccion.tipo === 'bienvenida') {
    titulo = 'Al iniciar la encuesta';
    subtitulo = 'Reglas que se evalúan antes de la primera pregunta, sobre variables cargadas con la interacción.';
  } else if (seleccion.tipo === 'pregunta') {
    const q = preguntaById(seleccion.preguntaId);
    const enunciado = q ? (q.texto.length > 40 ? q.texto.slice(0, 40) + '…' : q.texto) : '';
    titulo = `Al responder ${q?.pnum ?? ''} ${enunciado}`.trim();
    subtitulo = 'Reglas que se evalúan cuando el encuestado responde esta pregunta. Pueden evaluar la respuesta o variables.';
  } else {
    titulo = 'Reglas de lógica del estudio';
    // Figma (estado vacío): el subtítulo del encabezado es corto. Con reglas
    // creadas, se describe el comportamiento de evaluación.
    subtitulo = momentosConReglas(reglas).length === 0
      ? 'Todavía no has creado ninguna.'
      : 'Todas las reglas del estudio, evaluadas de arriba hacia abajo.';
  }

  // Cuerpo
  let cuerpo: React.ReactNode;
  if (seleccion.tipo === 'none') {
    const momentos = momentosConReglas(reglas);
    if (momentos.length === 0) {
      // 3.1.a — estudio sin ninguna regla. Textos y jerarquía exactos de Figma:
      // ilustración 116px + título Medium (500) + descripción Regular (400),
      // ambas 16px rgba(0,0,0,0.55), gap 12, padding 24.
      cuerpo = (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, textAlign: 'center', flex: 1 }}>
          <EmptyIllustration size={116} />
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <p style={{ fontFamily: FONT, fontWeight: 500, fontSize: 16, color: 'rgba(0,0,0,0.55)', margin: 0, lineHeight: '24px' }}>
              Aún no hay reglas en este estudio.
            </p>
            <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: 16, color: 'rgba(0,0,0,0.55)', margin: 0, lineHeight: '24px' }}>
              Selecciona una pregunta del diagrama, o usa Crear regla arriba, para configurar la primera.
            </p>
          </div>
        </div>
      );
    } else {
      cuerpo = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {momentos.map(m => (
            <div key={m} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SectionHeader>{tituloMomento(m)}</SectionHeader>
              {reglasDeMomento(reglas, m).map(r => (
                <ReglaRow key={r.id} regla={r} onEditar={() => onEditar(r.id)} onEliminar={() => onEliminar(r.id)} />
              ))}
            </div>
          ))}
        </div>
      );
    }
  } else {
    const momento = seleccion.tipo === 'bienvenida' ? 'inicio' : seleccion.preguntaId;
    const rs = reglasDeMomento(reglas, momento);
    cuerpo = rs.length === 0 ? (
      <div style={{ padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: FONT, fontSize: 14, color: 'rgba(0,0,0,0.45)', margin: 0, lineHeight: '22px' }}>
          Este momento aún no tiene reglas. Usa Crear regla para agregar la primera.
        </p>
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rs.map(r => <ReglaRow key={r.id} regla={r} onEditar={() => onEditar(r.id)} onEliminar={() => onEliminar(r.id)} />)}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Encabezado estandarizado; la acción "Crear regla" va a la derecha
          (botón primario del sistema, 32px, ícono Box Icons). */}
      <SidebarHeader
        title={titulo}
        subtitle={subtitulo}
        right={
          <Button
            type="primary" onClick={onCrear} style={{ flexShrink: 0 }}
            icon={<BoxIcon name="bx-plus" size={16} color="#fff" />}
          >
            Crear regla
          </Button>
        }
      />
      {/* Cuerpo scrolleable — scroll en bloque plano; contenido en hijo flex
          (minHeight 100% para que el estado vacío centre). Evita el bug de
          flex+overflow que recorta el último elemento. */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <div style={{ padding: 24, minHeight: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
          {cuerpo}
        </div>
      </div>
    </div>
  );
}
