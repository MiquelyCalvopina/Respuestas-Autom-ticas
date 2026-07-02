import { useState } from 'react';
import { Modal, Steps, Input, Button, Alert, Radio, Segmented, Select, Slider, Rate, Typography } from 'antd';
import { SendOutlined, LeftOutlined } from '@ant-design/icons';
import { AutoResponse, AiBlock } from './types';
import { PREGUNTAS, SIMULATED_RESPONSES, mockGenerateAiText } from './data';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Props {
  rule: AutoResponse;
  onClose: () => void;
  onSend: (email: string, generatedText: string | null) => void;
}

const MOCK_RESPONSES: { id: string; label: string; summary: string }[] = [
  { id: '4821', label: '4821 — NPS 9, promotor entusiasta', summary: 'NPS 9, promotor entusiasta' },
  { id: '4798', label: '4798 — NPS 4, detractor por demoras', summary: 'NPS 4, detractor por demoras en el proceso' },
  { id: '5103', label: '5103 — CSAT 5, muy satisfecho', summary: 'CSAT 5, muy satisfecho con la atención' },
];

export default function TestModal({ rule, onClose, onSend }: Props) {
  const aiBlock = rule.blocks.find((b): b is AiBlock => b.type === 'ai');
  const hasAiOrResponses = rule.blocks.some(b => b.type === 'ai' || b.type === 'responses');
  const totalSteps = hasAiOrResponses ? 2 : 1;
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [dataMode, setDataMode] = useState<'real' | 'synthetic'>('synthetic');
  const [responseId, setResponseId] = useState(MOCK_RESPONSES[0].id);
  const [syntheticData, setSyntheticData] = useState<Record<string, string | number>>(() => ({ ...SIMULATED_RESPONSES }));
  const [sending, setSending] = useState(false);

  const validEmail = email.trim() !== '' && /\S+@\S+\.\S+/.test(email);
  const canSend = step === 0
    ? validEmail
    : (dataMode === 'real' ? !!responseId : PREGUNTAS.every(q => syntheticData[q.id] !== undefined && syntheticData[q.id] !== ''));

  async function handleSend() {
    setSending(true);
    await new Promise(r => setTimeout(r, 900));
    let generatedText: string | null = null;
    if (aiBlock) {
      const summary = dataMode === 'real'
        ? (MOCK_RESPONSES.find(r => r.id === responseId)?.summary ?? 'respuesta simulada')
        : PREGUNTAS.map(q => `${q.texto}: ${syntheticData[q.id]}`).join(' · ');
      generatedText = mockGenerateAiText(aiBlock, summary);
    }
    onSend(email, generatedText);
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
      width={520}
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
                  Elige una respuesta simulada guardada:
                </Text>
                <Select
                  value={responseId}
                  onChange={setResponseId}
                  style={{ width: '100%' }}
                  options={MOCK_RESPONSES.map(r => ({ value: r.id, label: r.label }))}
                />
                <Alert
                  type="warning" showIcon
                  message="Si la respuesta no cumple las condiciones de la regla, el resultado puede no tener sentido contextual."
                  style={{ marginTop: 10, fontSize: 12 }}
                />
              </div>
            )}

            {dataMode === 'synthetic' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {PREGUNTAS.map(q => (
                  <div key={q.id}>
                    <Text style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>{q.texto}</Text>
                    {q.tipo === 'NPS' && (
                      <>
                        <Slider min={0} max={10} value={syntheticData[q.id] as number} onChange={v => setSyntheticData(p => ({ ...p, [q.id]: v }))} />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>0 — Muy poco</Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>{syntheticData[q.id]}</Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>10 — Muy probable</Text>
                        </div>
                      </>
                    )}
                    {q.tipo === 'texto_abierto' && (
                      <TextArea rows={2} value={syntheticData[q.id] as string} onChange={e => setSyntheticData(p => ({ ...p, [q.id]: e.target.value }))} />
                    )}
                    {q.tipo === 'CSAT' && (
                      <Rate count={5} value={syntheticData[q.id] as number} onChange={v => setSyntheticData(p => ({ ...p, [q.id]: v }))} />
                    )}
                    {q.tipo === 'seleccion_simple' && q.opciones && (
                      <Radio.Group value={syntheticData[q.id]} onChange={e => setSyntheticData(p => ({ ...p, [q.id]: e.target.value }))} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {q.opciones.map(opt => <Radio key={opt} value={opt} style={{ fontSize: 12 }}>{opt}</Radio>)}
                      </Radio.Group>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
