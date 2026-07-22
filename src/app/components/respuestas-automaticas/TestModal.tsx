import { useState } from 'react';
import { Modal, Input, Button, Typography } from 'antd';
import { BiSend } from 'react-icons/bi';
import { VARIABLES_META } from './data';

const { Text } = Typography;

interface Props {
  variableKeys: string[];
  onClose: () => void;
  onSend: (email: string, values: Record<string, string>) => void;
}

export default function TestModal({ variableKeys, onClose, onSend }: Props) {
  const [email, setEmail] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const validEmail = email.trim() !== '' && /\S+@\S+\.\S+/.test(email);

  async function handleSend() {
    setSending(true);
    await new Promise(r => setTimeout(r, 900));
    onSend(email, values);
    setSending(false);
    onClose();
  }

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Button onClick={onClose}>Cancelar</Button>
      <Button type="primary" icon={<BiSend />} disabled={!validEmail} loading={sending} onClick={handleSend}>
        Enviar prueba
      </Button>
    </div>
  );

  return (
    <Modal
      open
      title="Enviar correo de prueba"
      onCancel={onClose}
      footer={footer}
      width={480}
      styles={{ content: { borderRadius: 20 } }}
    >
      <div style={{ paddingTop: 24 }}>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>Correo destino *</Text>
        <Input
          autoFocus type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="tu@correo.com"
        />
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
          Recibirás el correo tal como lo verá el encuestado.
        </Text>
      </div>

      {variableKeys.length > 0 && (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
            Variables usadas en enlaces o imágenes — opcional. Si escribes un valor, el correo de prueba lo usará de verdad.
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {variableKeys.map(key => {
              const meta = VARIABLES_META.find(v => v.key === key);
              return (
                <Input
                  key={key}
                  value={values[key] ?? ''}
                  onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                  placeholder={`Valor de ejemplo para ${meta?.label ?? key}`}
                  addonBefore={<span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>@{key}</span>}
                />
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}
