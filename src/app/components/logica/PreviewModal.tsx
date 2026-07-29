import { useState } from 'react';
import { Modal, Button, Input, InputNumber, Radio, Checkbox, Select, Rate, Alert, Tag } from 'antd';
import {
  ESTUDIO, PREGUNTAS, VARIABLES_DETALLE, CANAL_RESPUESTA_VALORES, MEDIOS_ENLACE_PERSONAL, CAMPANAS_ENLACE_GENERICO, despedidaById, paginaByN, preguntaById, Pregunta,
} from '@/app/data/estudio';
import { BoxIcon } from './boxicons';
import { Regla } from './types';
import { requiereDetalleCanal } from './catalog';
import {
  Respuestas, Variables, Paso, primerPaso, siguientePaso,
  respuestaCompleta,
} from './preview';

const FONT = "'Roboto', sans-serif";
const T85 = 'rgba(0,0,0,0.85)';
const T45 = 'rgba(0,0,0,0.45)';

interface Props {
  abierto: boolean;
  reglas: Regla[];
  destinos: Record<string, string | undefined>;
  onCerrar: () => void;
}

/** Control de respuesta según el tipo de pregunta. */
function Control({ q, resp, set }: { q: Pregunta; resp: Respuestas; set: (clave: string, v: any) => void }) {
  const v = resp[q.id];
  const opts = (q.opciones ?? []).map(o => ({ value: o, label: o }));

  switch (q.tipo) {
    case 'NPS': case 'CSAT': case 'CES': case 'CLI': {
      const [min, max] = q.escala ?? [0, 10];
      const nums = Array.from({ length: max - min + 1 }, (_, k) => min + k);
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {nums.map(n => (
            <button key={n} type="button" onClick={() => set(q.id, String(n))}
              style={{
                width: 38, height: 38, borderRadius: 8, cursor: 'pointer', fontFamily: FONT, fontSize: 14,
                border: `1px solid ${String(v) === String(n) ? '#1890ff' : '#d9d9d9'}`,
                background: String(v) === String(n) ? '#e6f7ff' : '#fff',
                color: String(v) === String(n) ? '#1890ff' : T85,
              }}>{n}</button>
          ))}
        </div>
      );
    }
    case 'rating':
      return <Rate value={Number(v) || 0} count={q.escala?.[1] ?? 5} onChange={n => set(q.id, String(n))} />;
    case 'texto_abierto':
      return <Input.TextArea rows={3} value={(v as string) ?? ''} onChange={e => set(q.id, e.target.value)} placeholder="Escribe tu respuesta…" />;
    case 'expresion':
      return <p style={{ fontFamily: FONT, fontSize: 14, color: T45, margin: 0, fontStyle: 'italic' }}>(Elemento de presentación: no se responde)</p>;
    case 'seleccion_simple': case 'dropdown': case 'si_no':
      return q.tipo === 'dropdown'
        ? <Select style={{ width: '100%' }} value={(v as string) ?? undefined} onChange={x => set(q.id, x)} options={opts} placeholder="Elige una opción" />
        : <Radio.Group value={v} onChange={e => set(q.id, e.target.value)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {opts.map(o => <Radio key={o.value} value={o.value}>{o.label}</Radio>)}
            </div>
          </Radio.Group>;
    case 'seleccion_multiple': case 'seleccion_imagenes':
      return <Checkbox.Group value={(v as string[]) ?? []} onChange={x => set(q.id, x as string[])}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {opts.map(o => <Checkbox key={o.value} value={o.value}>{o.label}</Checkbox>)}
          </div>
        </Checkbox.Group>;
    case 'casilla':
      return <Checkbox checked={v === 'acepto'} onChange={e => set(q.id, e.target.checked ? 'acepto' : 'no_acepto')}>
          {q.texto}
        </Checkbox>;
    case 'matriz': {
      const [min, max] = q.escala ?? [1, 5];
      const nums = Array.from({ length: max - min + 1 }, (_, k) => min + k);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(q.filas ?? []).map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: FONT, fontSize: 13, color: T85, minWidth: 160 }}>{f}</span>
              <Radio.Group value={resp[`${q.id}.${f}`]} onChange={e => set(`${q.id}.${f}`, e.target.value)}>
                {nums.map(n => <Radio key={n} value={String(n)}>{n}</Radio>)}
              </Radio.Group>
            </div>
          ))}
        </div>
      );
    }
    case 'formulario':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(q.campos ?? []).map(f => (
            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontFamily: FONT, fontSize: 12, color: T45 }}>{f.label}</span>
              {f.tipo === 'numero'
                ? <InputNumber style={{ width: '100%' }} value={resp[`${q.id}.${f.key}`] === undefined ? null : Number(resp[`${q.id}.${f.key}`])} onChange={n => set(`${q.id}.${f.key}`, n == null ? '' : String(n))} />
                : <Input type={f.tipo === 'fecha' ? 'date' : 'text'} value={(resp[`${q.id}.${f.key}`] as string) ?? ''} onChange={e => set(`${q.id}.${f.key}`, e.target.value)} />}
            </div>
          ))}
        </div>
      );
    case 'maxdiff':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(['mas', 'menos'] as const).map(k => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontFamily: FONT, fontSize: 12, color: T45 }}>{k === 'mas' ? 'Más importante' : 'Menos importante'}</span>
              <Select style={{ width: '100%' }} value={(resp[`${q.id}.${k}`] as string) ?? undefined} onChange={x => set(`${q.id}.${k}`, x)} options={opts} placeholder="Elige una opción" />
            </div>
          ))}
        </div>
      );
    case 'ranking':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(q.opciones ?? []).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: FONT, fontSize: 13, color: T45, minWidth: 84 }}>Posición {i + 1}</span>
              <Select style={{ flex: 1 }} value={(resp[`${q.id}.pos${i + 1}`] as string) ?? undefined} onChange={x => set(`${q.id}.pos${i + 1}`, x)} options={opts} placeholder="Elige una opción" />
            </div>
          ))}
        </div>
      );
    case 'cargar_archivo':
      return <Button icon={<BoxIcon name="bx-plus" size={14} />} onClick={() => set(q.id, 'archivo.pdf')}>
          {v ? `Archivo cargado: ${v}` : 'Simular carga de archivo'}
        </Button>;
    default:
      return <Input value={(v as string) ?? ''} onChange={e => set(q.id, e.target.value)} />;
  }
}

export default function PreviewModal({ abierto, reglas, destinos, onCerrar }: Props) {
  const [resp, setResp] = useState<Respuestas>({});
  const [vars, setVars] = useState<Variables>({});
  const [paso, setPaso] = useState<Paso | null>(null);
  const [historial, setHistorial] = useState<string[]>([]);
  const [iniciado, setIniciado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reiniciar() {
    setResp({}); setVars({}); setPaso(null); setHistorial([]); setIniciado(false); setError(null);
  }
  function comenzar() {
    setIniciado(true);
    setError(null);
    setPaso(primerPaso(reglas, resp, vars, destinos));
  }
  function set(clave: string, v: any) {
    setResp(r => ({ ...r, [clave]: v }));
    setError(null);
  }
  function avanzar() {
    if (!paso || paso.tipo !== 'pregunta') return;
    if (paso.obligatoria && !respuestaCompleta(paso.preguntaId, resp)) {
      setError('Esta pregunta es obligatoria por una regla de lógica.');
      return;
    }
    // Si no se tocó la pregunta, queda como "no se respondió" (undefined).
    setHistorial(h => [...h, paso.preguntaId]);
    setPaso(siguientePaso(paso.preguntaId, reglas, resp, vars, destinos));
    setError(null);
  }

  const q = paso?.tipo === 'pregunta' ? preguntaById(paso.preguntaId) : undefined;
  const pag = q?.pagina ? paginaByN(q.pagina) : undefined;

  return (
    <Modal
      open={abierto} onCancel={() => { onCerrar(); reiniciar(); }} width={640} footer={null}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BoxIcon name="bx-show" size={18} color="#1890ff" />
          <span style={{ fontFamily: FONT, fontWeight: 500 }}>Previsualización · {ESTUDIO.nombre}</span>
        </div>
      }
    >
      <div style={{ fontFamily: FONT }}>
        {!iniciado && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 14, color: T85, margin: 0 }}>
              Recorre la encuesta como la vería un encuestado, aplicando las {reglas.length} regla{reglas.length === 1 ? '' : 's'} que creaste.
            </p>
            <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 }}>
              <p style={{ fontSize: 12, color: T45, margin: '0 0 8px 0' }}>
                Variables de la interacción (las reglas del inicio se evalúan sobre estas):
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {VARIABLES_DETALLE.map(v => (
                  <div key={v.key} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 11, color: T45 }}>{v.label}</span>
                    {v.tipo === 'canal' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Select size="small" allowClear value={vars[v.key] || undefined}
                          onChange={x => setVars(s => ({ ...s, [v.key]: x ?? '', [`${v.key}_detalle`]: '' }))}
                          options={CANAL_RESPUESTA_VALORES.map(c => ({ value: c, label: c }))} placeholder="Sin definir" />
                        {requiereDetalleCanal(vars[v.key] ?? '') && (
                          <Select size="small" allowClear value={vars[`${v.key}_detalle`] || undefined}
                            onChange={x => setVars(s => ({ ...s, [`${v.key}_detalle`]: x ?? '' }))}
                            options={(vars[v.key] === 'Enlace personal' ? MEDIOS_ENLACE_PERSONAL : CAMPANAS_ENLACE_GENERICO).map(o => ({ value: o, label: o }))}
                            placeholder={vars[v.key] === 'Enlace personal' ? 'Medio' : 'Campaña'} />
                        )}
                      </div>
                    ) : (
                      <Input size="small" value={vars[v.key] ?? ''} onChange={e => setVars(s => ({ ...s, [v.key]: e.target.value }))} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Button type="primary" onClick={comenzar} icon={<BoxIcon name="bx-chevron-right" size={16} color="#fff" />}>
              Comenzar previsualización
            </Button>
          </div>
        )}

        {iniciado && paso?.tipo === 'pregunta' && q && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {pag && <Tag color="blue" style={{ marginInlineEnd: 0 }}>{pag.nombre}</Tag>}
              <span style={{ fontSize: 12, color: T45 }}>Pregunta {historial.length + 1} · vistas {historial.length} de {PREGUNTAS.length}</span>
              {paso.obligatoria && <Tag color="gold" style={{ marginInlineEnd: 0 }}>Obligatoria por lógica</Tag>}
            </div>
            <p style={{ fontSize: 16, fontWeight: 500, color: T85, margin: 0 }}>
              <span style={{ color: T45, fontWeight: 400 }}>{q.pnum} · </span>{q.texto}
            </p>
            <div><Control q={q} resp={resp} set={set} /></div>
            {error && <Alert type="error" showIcon message={error} />}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
              <Button onClick={reiniciar}>Reiniciar</Button>
              <Button type="primary" onClick={avanzar}>Siguiente</Button>
            </div>
          </div>
        )}

        {iniciado && paso?.tipo === 'fin' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BoxIcon name="bx-check-circle" size={20} color="#52c41a" />
              <span style={{ fontSize: 16, fontWeight: 500, color: T85 }}>
                Fin de la encuesta — {despedidaById(paso.despedidaId)?.nombre ?? paso.despedidaId}
              </span>
            </div>
            <p style={{ fontSize: 13, color: T45, margin: 0 }}>
              Recorrido: {historial.length === 0 ? '(ninguna pregunta visible)' : historial.map(id => preguntaById(id)?.pnum ?? id).join(' → ')}
            </p>
            {historial.length < PREGUNTAS.length && (
              <p style={{ fontSize: 12, color: T45, margin: 0 }}>
                Se omitieron {PREGUNTAS.length - historial.length} pregunta{PREGUNTAS.length - historial.length === 1 ? '' : 's'} por reglas de lógica, saltos o el destino por defecto.
              </p>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type="primary" onClick={reiniciar}>Volver a probar</Button>
              <Button onClick={() => { onCerrar(); reiniciar(); }}>Cerrar</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
