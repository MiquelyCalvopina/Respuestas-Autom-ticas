import { Button, Card, Tag, Switch, Typography, Empty, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, RightOutlined, MailOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { AutoResponse } from './types';

const { Title, Text } = Typography;

interface Props {
  rules: AutoResponse[];
  onNew: () => void;
  onEdit: (id: string) => void;
  onLog: (id: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

function statusTag(rule: AutoResponse) {
  if (!rule.published) return <Tag color="warning">Borrador</Tag>;
  if (rule.active) return <Tag color="success">Activa</Tag>;
  return <Tag>Inactiva</Tag>;
}

function triggerTag(t: AutoResponse['trigger']) {
  if (t === 'response') return <Tag>Por respuesta nueva</Tag>;
  if (t === 'farewell') return <Tag>Al llegar despedida</Tag>;
  return null;
}

function RuleCard({ rule, onEdit, onLog, onDelete, onToggle }: {
  rule: AutoResponse; onEdit: () => void; onLog: () => void; onDelete: () => void; onToggle: () => void;
}) {
  const hasAi = rule.blocks.some(b => b.type === 'ai');
  const condCount = rule.condGroups.flatMap(g => g.rules).length;

  return (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 15,
            background: hasAi ? 'var(--ds-violet-bg)' : '#e6f7ff',
            border: `1px solid ${hasAi ? 'var(--ds-violet-mid)' : '#91d5ff'}`,
            color: hasAi ? 'var(--ds-violet)' : '#1890ff',
          }}>
            {hasAi ? '✦' : <MailOutlined />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text strong style={{ fontSize: 13, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {rule.name}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {rule.sender || '—'} · {rule.blocks.length} bloque{rule.blocks.length !== 1 ? 's' : ''}
            </Text>
          </div>
          <Switch checked={rule.active} onChange={onToggle} size="small" />
        </div>
      }
      extra={null}
      actions={[
        <Button key="log" type="link" size="small" icon={<RightOutlined />} onClick={onLog} style={{ fontSize: 12 }}>
          Ver ejecuciones
        </Button>,
        <Button key="edit" size="small" icon={<EditOutlined />} onClick={onEdit}>
          Editar
        </Button>,
        <Tooltip key="delete" title="Eliminar">
          <Button danger size="small" icon={<DeleteOutlined />} onClick={onDelete} />
        </Tooltip>,
      ]}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '4px 0' }}>
        {statusTag(rule)}
        {triggerTag(rule.trigger)}
        {condCount > 0 && <Tag>{condCount} condición{condCount !== 1 ? 'es' : ''}</Tag>}
        {hasAi && (
          <Tag color="purple" icon={<ThunderboltOutlined />}>
            Bloque IA
          </Tag>
        )}
      </div>
    </Card>
  );
}

export default function ListView({ rules, onNew, onEdit, onLog, onDelete, onToggle }: Props) {
  return (
    <div style={{ padding: '24px 32px', maxWidth: 860, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Respuestas automáticas</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {rules.length === 0
              ? 'Sin reglas configuradas'
              : `${rules.length} regla${rules.length !== 1 ? 's' : ''} configurada${rules.length !== 1 ? 's' : ''}`}
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={onNew}>
          Nueva respuesta automática
        </Button>
      </div>

      {rules.length === 0 ? (
        <Card>
          <Empty
            image={<MailOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
            description={
              <span>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>
                  Aún no hay respuestas automáticas
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Configura reglas para enviar correos automáticos a tus encuestados.
                </Text>
              </span>
            }
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={onNew}>
              Nueva respuesta automática
            </Button>
          </Empty>
        </Card>
      ) : (
        <div>
          {rules.map(rule => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onEdit={() => onEdit(rule.id)}
              onLog={() => onLog(rule.id)}
              onDelete={() => onDelete(rule.id)}
              onToggle={() => onToggle(rule.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
