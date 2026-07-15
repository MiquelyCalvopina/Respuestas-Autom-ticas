import { useState } from 'react';
import { Modal, Input, Button, Typography } from 'antd';
import { BiSend } from 'react-icons/bi';

const { Text } = Typography;

interface Props {
  onClose: () => void;
  onSend: (email: string) => void;
}

export default function TestModal({ onClose, onSend }: Props) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const validEmail = email.trim() !== '' && /\S+@\S+\.\S+/.test(email);

  async function handleSend() {
    setSending(true);
    await new Promise(r => setTimeout(r, 900));
    onSend(email);
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
    </Modal>
  );
}
