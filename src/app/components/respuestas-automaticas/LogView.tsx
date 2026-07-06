import { useState } from 'react';
import { Button, Card, Tag, Typography, Empty, Alert, Space } from 'antd';
import { LeftOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { AutoResponse } from './types';

const { Title, Text } = Typography;

interface Execution { id: string; responseId: string; status: 'sent' | 'not_sent'; timestamp: string; detail: string; }

const MOCK: Execution[] = [
  { id: '1', responseId: '4821', status: 'sent',     timestamp: 'hace 3 min',   detail: 'Enviado a juan.perez@gmail.com' },
  { id: '2', responseId: '4820', status: 'not_sent', timestamp: 'hace 12 min',  detail: 'correo_electronico vacío en la respuesta' },
  { id: '3', responseId: '4819', status: 'sent',     timestamp: 'hace 18 min',  detail: 'Enviado a maria.gomez@outlook.com' },
  { id: '4', responseId: '4817', status: 'sent',     timestamp: 'hace 35 min',  detail: 'Enviado a carlos.ruiz@empresa.com' },
  { id: '5', responseId: '4815', status: 'not_sent', timestamp: 'hace 52 min',  detail: 'correo_electronico vacío en la respuesta' },
  { id: '6', responseId: '4812', status: 'sent',     timestamp: 'hace 1 hora',  detail: 'Enviado a ana.torres@hotmail.com' },
];

type Filter = 'all' | 'sent' | 'not_sent';

export default function LogView({ rule, onBack }: { rule: AutoResponse; onBack: () => void }) {
  const [filter, setFilter] = useState<Filter>('all');
  const sent    = MOCK.filter(e => e.status === 'sent').length;
  const notSent = MOCK.filter(e => e.status === 'not_sent').length;
  const visible = filter === 'all' ? MOCK : MOCK.filter(e => e.status === (filter === 'sent' ? 'sent' : 'not_sent'));

  return (
    <div style={{ padding: '24px 32px', maxWidth: 760, margin: '0 auto' }}>
      <Button type="text" icon={<LeftOutlined />} onClick={onBack} style={{ marginBottom: 16, color: 'rgba(0,0,0,0.45)', paddingLeft: 0 }}>
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
            onClick={() => setFilter(f.key)}
          >
            {f.label} ({f.count})
          </Button>
        ))}
      </Space>

      {/* List */}
      <Card size="small" style={{ marginBottom: 16, borderRadius: 20 }} styles={{ body: { borderRadius: 20 } }}>
        {visible.length === 0 ? (
          <Empty description="Sin ejecuciones" />
        ) : visible.map((exec, i) => (
          <div key={exec.id} style={{ padding: '10px 0', borderBottom: i < visible.length - 1 ? '1px solid #f0f0f0' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <code style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 12, color: 'rgba(0,0,0,0.85)', minWidth: 52 }}>
              #{exec.responseId}
            </code>
            <Tag color={exec.status === 'sent' ? 'success' : 'error'} style={{ flexShrink: 0 }}>
              {exec.status === 'sent' ? 'Enviado' : 'No enviado'}
            </Tag>
            <div style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, display: 'block' }}>{exec.detail}</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>{exec.timestamp}</Text>
            </div>
          </div>
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
