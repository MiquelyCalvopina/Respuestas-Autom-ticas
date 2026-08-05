import { useState } from 'react';
import { Button, Card, Tag, Typography, Empty, Alert, Space } from 'antd';
import { LeftOutlined, InfoCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { AutoResponse } from './types';

const { Title, Text } = Typography;

interface Execution {
  interactionId: string;
  responseId: string;
  ruleId: string;
  status: 'sent' | 'not_sent';
  timestamp: string;
  timestampFull: string;
  detail: string;
  senderEmail?: string;
  destEmail?: string;
  subject?: string;
}

const MOCK: Execution[] = [
  { interactionId: '5311', responseId: '11107', ruleId: 'msgnr8tz-foavjezq2d', status: 'sent', timestamp: 'hace 3 min',  timestampFull: '5 ago 2026, 4:15 p.m.', detail: 'Enviado a juan.perez@gmail.com', senderEmail: 'cx@hircasa.com', destEmail: 'juan.perez@gmail.com', subject: 'Gracias por tu respuesta' },
  { interactionId: '5310', responseId: '11104', ruleId: 'msgnr8tz-foavjezq2d', status: 'not_sent', timestamp: 'hace 12 min', timestampFull: '5 ago 2026, 4:06 p.m.', detail: 'correo_electronico vacío en la respuesta' },
  { interactionId: '5309', responseId: '11098', ruleId: 'a91kd0pq-x7bzmw4e1f', status: 'sent', timestamp: 'hace 18 min', timestampFull: '5 ago 2026, 4:00 p.m.', detail: 'Enviado a maria.gomez@outlook.com', senderEmail: 'cx@hircasa.com', destEmail: 'maria.gomez@outlook.com', subject: 'Queremos saber más' },
  { interactionId: '5307', responseId: '11090', ruleId: 'msgnr8tz-foavjezq2d', status: 'sent', timestamp: 'hace 35 min', timestampFull: '5 ago 2026, 3:43 p.m.', detail: 'Enviado a carlos.ruiz@empresa.com', senderEmail: 'cx@hircasa.com', destEmail: 'carlos.ruiz@empresa.com', subject: 'Gracias por tu respuesta' },
  { interactionId: '5304', responseId: '11083', ruleId: 'a91kd0pq-x7bzmw4e1f', status: 'not_sent', timestamp: 'hace 52 min', timestampFull: '5 ago 2026, 3:26 p.m.', detail: 'correo_electronico vacío en la respuesta' },
  { interactionId: '5301', responseId: '11071', ruleId: 'msgnr8tz-foavjezq2d', status: 'sent', timestamp: 'hace 1 hora', timestampFull: '5 ago 2026, 3:15 p.m.', detail: 'Enviado a ana.torres@hotmail.com', senderEmail: 'cx@hircasa.com', destEmail: 'ana.torres@hotmail.com', subject: 'Gracias por tu respuesta' },
];

type Filter = 'all' | 'sent' | 'not_sent';

// Orden de lectura de la tarjeta expandida: cuándo → por qué se disparó →
// identificadores del evento → el correo en sí (de/asunto/para) → resultado.
// Antes las propiedades venían en el orden en que se agregaron al modelo de
// datos (ID de interacción, ID de respuesta, Regla, ID de regla, Correo
// emisor, Asunto, Correo destino, Observación, Fecha y hora), sin relación
// con cómo alguien realmente lee esta información para entender qué pasó.
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <Text type="secondary" style={{ fontSize: 12, width: 130, flexShrink: 0 }}>{label}</Text>
      <Text style={{ fontSize: 12 }}>{value}</Text>
    </div>
  );
}

function ExecutionCard({ exec, ruleName, expanded, onToggle }: { exec: Execution; ruleName: string; expanded: boolean; onToggle: () => void }) {
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={onToggle}>
        {/* El número por sí solo no dice nada: "Interacción #N" dice qué es antes de mostrar el valor. */}
        <Text style={{ fontSize: 13, fontWeight: 700, minWidth: 110 }}>Interacción #{exec.interactionId}</Text>
        <Text type="secondary" style={{ fontSize: 12 }}>{exec.timestamp}</Text>
        <Tag color={exec.status === 'sent' ? 'success' : 'error'} style={{ marginInlineEnd: 0 }}>
          {exec.status === 'sent' ? 'Enviado' : 'No enviado'}
        </Tag>
        <div style={{ flex: 1 }} />
        <Button type="text" size="small" icon={expanded ? <UpOutlined /> : <DownOutlined />} onClick={e => { e.stopPropagation(); onToggle(); }} />
      </div>
      {!expanded && <Text style={{ fontSize: 12, display: 'block', marginTop: 4 }}>{exec.detail}</Text>}
      {expanded && (
        <div style={{ marginTop: 12, background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <DetailRow label="Fecha y hora" value={exec.timestampFull} />
          <DetailRow label="Regla" value={ruleName} />
          <DetailRow label="ID de regla" value={exec.ruleId} />
          <DetailRow label="ID de interacción" value={`#${exec.interactionId}`} />
          <DetailRow label="ID de respuesta" value={`#${exec.responseId}`} />
          {exec.senderEmail && <DetailRow label="Correo emisor" value={exec.senderEmail} />}
          {exec.subject && <DetailRow label="Asunto" value={exec.subject} />}
          {exec.destEmail ? <DetailRow label="Correo destino" value={exec.destEmail} /> : null}
          <DetailRow label="Observación" value={exec.status === 'sent' ? 'Correo enviado correctamente.' : exec.detail} />
        </div>
      )}
    </div>
  );
}

export default function LogView({ rule, onBack }: { rule: AutoResponse; onBack: () => void }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const sent    = MOCK.filter(e => e.status === 'sent').length;
  const notSent = MOCK.filter(e => e.status === 'not_sent').length;
  const visible = filter === 'all' ? MOCK : MOCK.filter(e => e.status === (filter === 'sent' ? 'sent' : 'not_sent'));

  return (
    <div style={{ padding: '24px 32px', maxWidth: 760, margin: '0 auto' }}>
      <Button type="text" icon={<LeftOutlined />} onClick={onBack} style={{ marginBottom: 16, color: 'rgba(0,0,0,.45)', paddingLeft: 0 }}>
        Volver
      </Button>

      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>Historial — {rule.name}</Title>
        <Text type="secondary" style={{ fontSize: 13 }}>{MOCK.length} ejecuciones · última hace 3 min</Text>
      </div>

      {/* Filter bar */}
      <Space style={{ marginBottom: 16 }}>
        {([
          { key: 'all',      label: 'Todos',        count: MOCK.length },
          { key: 'sent',     label: 'Enviados',     count: sent },
          { key: 'not_sent', label: 'No enviados',  count: notSent },
        ] as { key: Filter; label: string; count: number }[]).map(f => (
          <Button
            key={f.key}
            type={filter === f.key ? 'primary' : 'default'}
            size="small"
            onClick={() => setFilter(f.key)}
          >
            {f.label} ({f.count})
          </Button>
        ))}
      </Space>

      {/* List */}
      <Card size="small" style={{ marginBottom: 16 }}>
        {visible.length === 0 ? (
          <Empty description="Sin ejecuciones" />
        ) : visible.map(exec => (
          <ExecutionCard
            key={exec.interactionId}
            exec={exec}
            ruleName={rule.name}
            expanded={expandedId === exec.interactionId}
            onToggle={() => setExpandedId(id => (id === exec.interactionId ? null : exec.interactionId))}
          />
        ))}
      </Card>

      {notSent > 0 && (
        <Alert
          type="info"
          icon={<InfoCircleOutlined />}
          showIcon
          title='Los registros "No enviado" por variable vacía son comportamiento esperado, no un error del sistema. Ocurren cuando la respuesta no incluye el campo correo_electronico.'
          style={{ fontSize: 12 }}
        />
      )}
    </div>
  );
}
