import { useState } from 'react';
import { Modal, Steps, Input, Button, Alert, Radio, Checkbox, Segmented, AutoComplete, Rate, Select, Collapse, Typography } from 'antd';
import { SendOutlined, LeftOutlined } from '@ant-design/icons';
import { AutoResponse, Pregunta } from './types';
import { PREGUNTAS_EJEMPLO, optionTexts, commentableOptionTexts } from './data';

const hasAiOrResponsesComponent = (rule: AutoResponse) =>
  rule.rows.flatMap(r => r.columns).flatMap(c => c.components).some(comp => comp.type === 'ai' || comp.type === 'responses');

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Props {
  rule: AutoResponse;
  onClose: () => void;
  onSend: (email: string, summary: string | null) => void;
}

const MOCK_RESPONSES: { id: string; label: string; summary: string }[] = [
  { id: '4821', label: '4821 — NPS 9, promotor entusiasta', summary: 'NPS 9, promotor entusiasta' },
  { id: '4798', label: '4798 — NPS 4, detractor por demoras', summary: 'NPS 4, detractor por demoras en el proceso' },
  { id: '5103', label: '5103 — CSAT 5, muy satisfecho', summary: 'CSAT 5, muy satisfecho con la atención' },
];

const NPS_BUTTONS = Array.from({ length: 11 }, (_, i) => i);
const TIPO_LABEL: Record<string, string> = {
  NPS: 'NPS', CES: 'CES', CLI: 'CLI', CSAT: 'CSAT', rating: 'Rating',
  matriz_escalas: 'Matriz de escalas', respuesta_abierta: 'Respuesta abierta', formulario: 'Formulario',
  opcion_simple: 'Opción simple', dropdown: 'Dropdown', si_no: 'Sí / No', seleccion_imagenes_simple: 'Selección de imágenes (simple)',
  opcion_multiple: 'Opción múltiple', seleccion_imagenes_multiple: 'Selección de imágenes (múltiple)',
  casilla_verificacion: 'Casilla de verificación', maxdiff: 'MaxDiff', ranking: 'Ranking', cargar_archivo: 'Cargar archivo',
};
const MOCK_TEXT = 'El proceso fue más ágil de lo que esperaba, aunque hubo un momento de confusión con la documentación.';
const MOCK_FIELD_VALUE: Record<string, string> = {
  texto: 'Juan Pérez', numero: '482913', correo: 'contacto@ejemplo.com', fecha: '12/03/2026', url: 'https://ejemplo.com/expediente',
};

// Valor por defecto (tipado según el tipo de pregunta) para precargar el mini-formulario —
// el analista solo necesita tocar lo que quiera personalizar, no llenar las 36 preguntas.
function defaultValueFor(q: Pregunta): unknown {
  switch (q.tipo) {
    case 'NPS': case 'CLI': return (q.escala?.[1] ?? 10) - 1;
    case 'CES': return Math.ceil((q.escala?.[1] ?? 7) / 2);
    case 'CSAT': case 'rating': return (q.escala?.[1] ?? 5) - 1;
    case 'matriz_escalas': return Object.fromEntries((q.atributos ?? []).map(a => [a, (q.escala?.[1] ?? 5) - 1]));
    case 'respuesta_abierta': return MOCK_TEXT;
    case 'formulario': return Object.fromEntries((q.campos ?? []).map(c => [c.nombre, MOCK_FIELD_VALUE[c.tipo] ?? '']));
    case 'opcion_simple': case 'dropdown': case 'si_no': case 'seleccion_imagenes_simple':
      return { option: optionTexts(q)[0] ?? '', comment: '' };
    case 'opcion_multiple': case 'seleccion_imagenes_multiple':
      return { options: optionTexts(q).slice(0, Math.min(2, optionTexts(q).length)), comment: '' };
    case 'casilla_verificacion': return true;
    case 'maxdiff': { const o = optionTexts(q); return { mas: o[0] ?? '', menos: o[o.length - 1] ?? '' }; }
    case 'ranking': return optionTexts(q);
    case 'cargar_archivo': return true;
    default: return '';
  }
}
function defaultSyntheticData(): Record<string, unknown> {
  return Object.fromEntries(PREGUNTAS_EJEMPLO.map(q => [q.id, defaultValueFor(q)]));
}

// Convierte el valor capturado (de cualquier forma/tipo) en una línea de texto legible,
// usada para armar el resumen que alimenta al generador simulado de IA.
function describeAnswer(q: Pregunta, value: unknown): string {
  switch (q.tipo) {
    case 'matriz_escalas':
      return Object.entries(value as Record<string, number>).map(([a, n]) => `${a}: ${n}/${q.escala?.[1] ?? 5}`).join(', ');
    case 'formulario':
      return Object.entries(value as Record<string, string>).map(([k, v]) => `${k}: ${v}`).join(', ');
    case 'opcion_simple': case 'dropdown': case 'si_no': case 'seleccion_imagenes_simple': {
      const v = value as { option: string; comment: string };
      return v.comment ? `${v.option} (comentario: ${v.comment})` : v.option;
    }
    case 'opcion_multiple': case 'seleccion_imagenes_multiple': {
      const v = value as { options: string[]; comment: string };
      return v.comment ? `${v.options.join(', ')} (comentario: ${v.comment})` : v.options.join(', ');
    }
    case 'casilla_verificacion': return value ? 'Aceptó' : 'No aceptó';
    case 'maxdiff': { const v = value as { mas: string; menos: string }; return `Más importante: ${v.mas} · Menos importante: ${v.menos}`; }
    case 'ranking': return (value as string[]).map((o, i) => `${i + 1}° ${o}`).join(', ');
    case 'cargar_archivo': return 'Adjuntó un archivo';
    default: return String(value ?? '');
  }
}

// Input correspondiente al tipo de pregunta — cubre los 18 tipos reales del estudio.
function SyntheticQuestionInput({ q, value, onChange }: { q: Pregunta; value: unknown; onChange: (v: unknown) => void }) {
  if (q.tipo === 'NPS' || q.tipo === 'CLI') {
    const max = q.escala?.[1] ?? 10;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {Array.from({ length: max + 1 }, (_, n) => n).map(n => (
          <Button key={n} type={value === n ? 'primary' : 'default'} onClick={() => onChange(n)} style={{ minWidth: 30 }}>{n}</Button>
        ))}
      </div>
    );
  }
  if (q.tipo === 'CES') {
    const max = q.escala?.[1] ?? 7;
    return (
      <Select value={value as number} onChange={onChange} style={{ width: 140 }}
        options={Array.from({ length: max }, (_, i) => i + 1).map(n => ({ value: n, label: `${n} de ${max}` }))} />
    );
  }
  if (q.tipo === 'CSAT' || q.tipo === 'rating') {
    return <Rate count={q.escala?.[1] ?? 5} value={value as number} onChange={onChange} />;
  }
  if (q.tipo === 'matriz_escalas') {
    const v = value as Record<string, number>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(q.atributos ?? []).map(a => (
          <div key={a} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ fontSize: 11.5, color: 'rgba(0,0,0,0.65)' }}>{a}</Text>
            <Select value={v[a]} onChange={n => onChange({ ...v, [a]: n })} style={{ width: 110 }}
              options={Array.from({ length: q.escala?.[1] ?? 5 }, (_, i) => i + 1).map(n => ({ value: n, label: `${n} de ${q.escala?.[1] ?? 5}` }))} />
          </div>
        ))}
      </div>
    );
  }
  if (q.tipo === 'respuesta_abierta') {
    return <TextArea rows={2} value={value as string} onChange={e => onChange(e.target.value)} />;
  }
  if (q.tipo === 'formulario') {
    const v = value as Record<string, string>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {(q.campos ?? []).map(c => (
          <div key={c.nombre}>
            <Text type="secondary" style={{ fontSize: 10.5, display: 'block', marginBottom: 2 }}>{c.nombre}</Text>
            <Input value={v[c.nombre]} onChange={e => onChange({ ...v, [c.nombre]: e.target.value })} />
          </div>
        ))}
      </div>
    );
  }
  if (q.tipo === 'opcion_simple' || q.tipo === 'dropdown' || q.tipo === 'si_no' || q.tipo === 'seleccion_imagenes_simple') {
    const v = value as { option: string; comment: string };
    const canComment = commentableOptionTexts(q).includes(v.option);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Radio.Group value={v.option} onChange={e => onChange({ ...v, option: e.target.value })} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {optionTexts(q).map(opt => <Radio key={opt} value={opt} style={{ fontSize: 12 }}>{opt}</Radio>)}
        </Radio.Group>
        {canComment && <Input placeholder="Comentario de la opción…" value={v.comment} onChange={e => onChange({ ...v, comment: e.target.value })} />}
      </div>
    );
  }
  if (q.tipo === 'opcion_multiple' || q.tipo === 'seleccion_imagenes_multiple') {
    const v = value as { options: string[]; comment: string };
    const canComment = v.options.some(o => commentableOptionTexts(q).includes(o));
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Checkbox.Group value={v.options} onChange={opts => onChange({ ...v, options: opts as string[] })} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {optionTexts(q).map(opt => <Checkbox key={opt} value={opt} style={{ fontSize: 12 }}>{opt}</Checkbox>)}
        </Checkbox.Group>
        {canComment && <Input placeholder="Comentario de una opción…" value={v.comment} onChange={e => onChange({ ...v, comment: e.target.value })} />}
      </div>
    );
  }
  if (q.tipo === 'casilla_verificacion') {
    return (
      <Radio.Group value={value as boolean} onChange={e => onChange(e.target.value)}>
        <Radio value={true}>Aceptó</Radio>
        <Radio value={false}>No aceptó</Radio>
      </Radio.Group>
    );
  }
  if (q.tipo === 'maxdiff') {
    const v = value as { mas: string; menos: string };
    const opts = optionTexts(q).map(o => ({ value: o, label: o }));
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 10.5, display: 'block' }}>Más importante</Text>
          <Select value={v.mas} onChange={mas => onChange({ ...v, mas })} options={opts} style={{ width: 160 }} />
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 10.5, display: 'block' }}>Menos importante</Text>
          <Select value={v.menos} onChange={menos => onChange({ ...v, menos })} options={opts} style={{ width: 160 }} />
        </div>
      </div>
    );
  }
  if (q.tipo === 'ranking') {
    return (
      <div>
        {(value as string[]).map((o, i) => (
          <Text key={o} style={{ fontSize: 12, display: 'block', color: 'rgba(0,0,0,0.65)' }}>{i + 1}° {o}</Text>
        ))}
        <Text type="secondary" style={{ fontSize: 10.5, display: 'block', marginTop: 2 }}>Orden de ejemplo — se edita desde el paso de condiciones.</Text>
      </div>
    );
  }
  if (q.tipo === 'cargar_archivo') {
    return <Text type="secondary" style={{ fontSize: 12 }}>Se simula un archivo adjunto — no se sube ningún archivo real.</Text>;
  }
  return null;
}

export default function TestModal({ rule, onClose, onSend }: Props) {
  const hasAiOrResponses = hasAiOrResponsesComponent(rule);
  const totalSteps = hasAiOrResponses ? 2 : 1;
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [dataMode, setDataMode] = useState<'real' | 'synthetic'>('synthetic');
  const [responseId, setResponseId] = useState('');
  const [syntheticData, setSyntheticData] = useState<Record<string, unknown>>(defaultSyntheticData);
  const [sending, setSending] = useState(false);

  const validEmail = email.trim() !== '' && /\S+@\S+\.\S+/.test(email);
  const canSend = step === 0 ? validEmail : (dataMode === 'real' ? responseId.trim() !== '' : true);

  const responseOptions = MOCK_RESPONSES
    .filter(r => r.id.includes(responseId) || r.label.toLowerCase().includes(responseId.toLowerCase()))
    .map(r => ({ value: r.id, label: r.label }));

  const groupedByTipo = PREGUNTAS_EJEMPLO.reduce<Record<string, Pregunta[]>>((acc, q) => {
    (acc[q.tipo] ??= []).push(q);
    return acc;
  }, {});

  async function handleSend() {
    setSending(true);
    await new Promise(r => setTimeout(r, 900));
    let summary: string | null = null;
    if (hasAiOrResponses) {
      summary = dataMode === 'real'
        ? (MOCK_RESPONSES.find(r => r.id === responseId)?.summary ?? `ID de respuesta ${responseId}`)
        : PREGUNTAS_EJEMPLO.map(q => `${q.texto}: ${describeAnswer(q, syntheticData[q.id])}`).join(' · ');
    }
    onSend(email, summary);
    setSending(false);
    onClose();
  }

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Button onClick={onClose}>Cancelar</Button>
      <div style={{ display: 'flex', gap: 8 }}>
        {step === 1 && <Button icon={<LeftOutlined />} onClick={() => setStep(0)}>Anterior</Button>}
        {step < totalSteps - 1 ? (
          <Button type="primary" disabled={!validEmail} onClick={() => setStep(1)}>Siguiente →</Button>
        ) : (
          <Button type="primary" icon={<SendOutlined />} disabled={!canSend} loading={sending} onClick={handleSend}>
            Enviar prueba
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      open
      title={
        totalSteps === 2 ? (
          <Steps
            current={step}
            size="small"
            items={[{ title: 'Correo destino' }, { title: 'Datos de simulación' }]}
            style={{ marginTop: 4 }}
          />
        ) : 'Enviar correo de prueba'
      }
      onCancel={onClose}
      footer={footer}
      width={560}
      styles={{ content: { borderRadius: 20 } }}
    >
      <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 4 }}>
        {step === 0 && (
          <div style={{ paddingTop: 16 }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Correo destino *</Text>
            <Input
              autoFocus type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
            />
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
              Recibirás el correo tal como lo verá el encuestado.
            </Text>
          </div>
        )}

        {step === 1 && (
          <div style={{ paddingTop: 16 }}>
            <Paragraph strong style={{ marginBottom: 4 }}>¿Qué respuesta simulamos?</Paragraph>
            <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
              Los bloques ✦ IA y 📋 Respuestas necesitan datos para generar el correo de prueba.
            </Paragraph>

            <Segmented
              block
              value={dataMode}
              onChange={v => setDataMode(v as 'real' | 'synthetic')}
              options={[
                { label: 'Usar respuesta existente', value: 'real' },
                { label: 'Responder aquí', value: 'synthetic' },
              ]}
              style={{ marginBottom: 14 }}
            />

            {dataMode === 'real' && (
              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                  Ingresa o busca un ID de respuesta:
                </Text>
                <AutoComplete
                  value={responseId}
                  onChange={setResponseId}
                  options={responseOptions}
                  style={{ width: '100%' }}
                  placeholder="Escribe o busca un ID (ej: 4821)"
                />
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 3 }}>
                  El ID lo encuentras en el módulo de Descarga de Resultados.
                </Text>
                <Alert
                  type="warning" showIcon
                  message="Si la respuesta no cumple las condiciones de la regla, el resultado puede no tener sentido contextual."
                  style={{ marginTop: 10, fontSize: 12 }}
                />
              </div>
            )}

            {dataMode === 'synthetic' && (
              <>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 8 }}>
                  Precargado con datos de ejemplo — ajusta solo lo que necesites. Agrupado por tipo de pregunta del estudio.
                </Text>
                <Collapse
                  size="small"
                  items={Object.entries(groupedByTipo).map(([tipo, qs]) => ({
                    key: tipo,
                    label: `${TIPO_LABEL[tipo] ?? tipo} (${qs.length})`,
                    children: (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {qs.map(q => (
                          <div key={q.id}>
                            <Text style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>{q.texto}</Text>
                            <SyntheticQuestionInput q={q} value={syntheticData[q.id]} onChange={v => setSyntheticData(p => ({ ...p, [q.id]: v }))} />
                          </div>
                        ))}
                      </div>
                    ),
                  }))}
                />
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
