import { Button, Popconfirm } from 'antd';
import { preguntaById } from '@/app/data/estudio';
import { BoxIcon } from './boxicons';
import { EmptyIllustration } from './EmptyIllustration';
import { Regla, Seleccion } from './types';
import { Seg, condicionResumen, consecuenciaResumen } from './naturalLanguage';
import { momentosConReglas, reglasDeMomento } from './derive';

const FONT = "'Roboto', sans-serif";

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
      {segs.map((seg, i) => (
        <span key={i} style={seg.ref ? { color: '#1890ff', fontWeight: 500 } : undefined}>{seg.t}</span>
      ))}
    </>
  );
}

function tituloMomento(momento: string): string {
  if (momento === 'inicio') return 'AL INICIAR LA ENCUESTA';
  const q = preguntaById(momento);
  if (!q) return momento.toUpperCase();
  const enunciado = q.texto.length > 34 ? q.texto.slice(0, 34) + '…' : q.texto;
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
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', border: '1px solid #f0f0f0', borderRadius: 8, background: '#fff' }}>
      <div style={{ flex: 1, minWidth: 0, fontFamily: FONT, fontSize: 13, lineHeight: '20px', color: 'rgba(0,0,0,0.85)' }}>
        <span style={{ color: 'rgba(0,0,0,0.45)' }}>Si </span>
        <SegText segs={condicionResumen(regla)} />
        <span style={{ color: 'rgba(0,0,0,0.45)' }}>, </span>
        <SegText segs={consecuenciaResumen(regla)} />
        <span style={{ color: 'rgba(0,0,0,0.45)' }}>.</span>
      </div>
      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        <IconBtn icon="bx-pencil" onClick={onEditar} label="Editar regla" />
        <Popconfirm
          title="¿Seguro que quieres eliminar esta regla?"
          okText="Sí, eliminar" cancelText="Cancelar" okButtonProps={{ danger: true }}
          onConfirm={onEliminar}
        >
          <span><IconBtn icon="bx-trash" danger label="Eliminar regla" /></span>
        </Popconfirm>
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
      {/* Encabezado + botón */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, justifyContent: 'space-between' }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: FONT, fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.85)', margin: 0, lineHeight: '20px' }}>{titulo}</p>
            <p style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(0,0,0,0.45)', margin: '4px 0 0 0', lineHeight: '16px' }}>{subtitulo}</p>
          </div>
          {/* Botón primario del sistema (AntD/NG-Zorro) — 32px de alto, radio 8,
              hover/press del tema Plugthem. Ícono con Box Icons. */}
          <Button
            type="primary" onClick={onCrear} style={{ flexShrink: 0 }}
            icon={<BoxIcon name="bx-plus" size={16} color="#fff" />}
          >
            Crear regla
          </Button>
        </div>
      </div>
      {/* Cuerpo scrolleable */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column' }}>
        {cuerpo}
      </div>
    </div>
  );
}
