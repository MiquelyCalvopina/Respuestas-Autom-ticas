import { useState } from 'react';
import { Modal, Steps, Input, Button, Alert, Radio, Tag, Slider, Rate, Typography } from 'antd';
import { SendOutlined, WarningOutlined } from '@ant-design/icons';
import { AutoResponse } from './types';
import { PREGUNTAS } from './data';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Props {
  rule: AutoResponse;
  onClose: () => void;
  onSend: (email: string, data: Record<string, unknown>) => void;
}

export default function TestModal({ rule, onClose, onSend }: Props) {
  const hasAiOrResponses = rule.blocks.some(b => b.type === 'ai' || b.type === 'responses');
  const totalSteps = hasAiOrResponses ? 2 : 1;
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [dataMode, setDataMode] = useState<'real' | 'synthetic'>('synthetic');
  const [responseId, setResponseId] = useState('');
  const [syntheticData, setSyntheticData] = useState<Record<string, string | number>>({});
  const [sending, setSending] = useState(false);

  const validEmail = email.trim() !== '' && /\S+@\S+\.\S+/.test(email);
  const canSend = step === 0 ? validEmail : (dataMode === 'real' ? responseId.trim() !== '' : PREGUNTAS.every(q => syntheticData[q.id] !== undefined && syntheticData[q.id] !== ''));

  async function handleSend() {
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    onSend(email, dataMode === 'real' ? { responseId } : syntheticData);
    setSending(false);
    onClose();
  }

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Button onClick={onClose}>Cancelar</Button>
      <div style={{ display: 'flex', gap: 8 }}>
        {step === 1 && <Button icon={<SendOutlined />} onClick={() => setStep(0)}>Anterior</Button>}
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
      width={500}
    >
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
          <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 14 }}>
            Los bloques ✦ IA y 📋 Respuestas necesitan datos para generar el correo de prueba.
          </Paragraph>

          <Radio.Group value={dataMode} onChange={e => setDataMode(e.target.value)} style={{ width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              {/* Option A */}
              <div style={{ border: `1px solid ${dataMode === 'real' ? '#1890ff' : '#d9d9d9'}`, borderRadius: 8, padding: 12, background: dataMode === 'real' ? '#e6f7ff' : '#fff', cursor: 'pointer' }} onClick={() => setDataMode('real')}>
                <Radio value="real" style={{ fontWeight: 500 }}>Usar una respuesta existente</Radio>
                <Paragraph type="secondary" style={{ fontSize: 12, margin: '4px 0 0 22px' }}>
                  Ingresa el ID de una respuesta guardada. El correo usará sus datos reales.
                </Paragraph>
                {dataMode === 'real' && (
                  <div style={{ marginTop: 10, marginLeft: 22 }}>
                    <Input
                      value={responseId} onChange={e => setResponseId(e.target.value)}
                      placeholder="ID de respuesta (ej: 4821)"
                      onClick={e => e.stopPropagation()}
                    />
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 3 }}>El ID lo encuentras en el módulo de Descarga de Resultados.</Text>
                    <Alert
                      type="warning" showIcon icon={<WarningOutlined />}
                      title="Si la respuesta no cumple las condiciones, el resultado puede no tener sentido contextual."
                      style={{ marginTop: 8, fontSize: 11 }}
                    />
                  </div>
                )}
              </div>

              {/* Option B */}
              <div style={{ border: `1px solid ${dataMode === 'synthetic' ? '#1890ff' : '#d9d9d9'}`, borderRadius: 8, padding: 12, background: dataMode === 'synthetic' ? '#e6f7ff' : '#fff', cursor: 'pointer' }} onClick={() => setDataMode('synthetic')}>
                <Radio value="synthetic" style={{ fontWeight: 500 }}>Responder el formulario aquí</Radio>
                <Paragraph type="secondary" style={{ fontSize: 12, margin: '4px 0 0 22px' }}>
                  Completa las preguntas para ver cómo quedaría el correo.
                </Paragraph>
                {dataMode === 'synthetic' && (
                  <div style={{ marginTop: 12, marginLeft: 22, display: 'flex', flexDirection: 'column', gap: 14 }} onClick={e => e.stopPropagation()}>
                    {PREGUNTAS.map(q => (
                      <div key={q.id}>
                        <Text style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>{q.texto}</Text>
                        {q.tipo === 'NPS' && (
                          <>
                            <Slider min={0} max={10} value={syntheticData[q.id] as number ?? 5} onChange={v => setSyntheticData(p => ({ ...p, [q.id]: v }))} />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text type="secondary" style={{ fontSize: 11 }}>0 — Muy poco</Text>
                              <Tag color="blue">{syntheticData[q.id] ?? 5}</Tag>
                              <Text type="secondary" style={{ fontSize: 11 }}>10 — Muy probable</Text>
                            </div>
                          </>
                        )}
                        {q.tipo === 'texto_abierto' && (
                          <TextArea rows={2} value={syntheticData[q.id] as string ?? ''} onChange={e => setSyntheticData(p => ({ ...p, [q.id]: e.target.value }))} />
                        )}
                        {q.tipo === 'CSAT' && (
                          <Rate count={5} value={syntheticData[q.id] as number ?? 0} onChange={v => setSyntheticData(p => ({ ...p, [q.id]: v }))} />
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
            </div>
          </Radio.Group>
        </div>
      )}
    </Modal>
  );
}
