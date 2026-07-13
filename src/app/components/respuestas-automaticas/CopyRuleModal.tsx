import { useMemo, useState } from 'react';
import { Modal, Select, Button, Empty, Typography } from 'antd';
import { BiCopy, BiBoltCircle } from 'react-icons/bi';
import { AutoResponse } from './types';
import { OTHER_STUDIES, countComponents, hasAiComponent } from './data';

const { Text } = Typography;

interface Props {
  currentRules: AutoResponse[];
  onCancel: () => void;
  onCopy: (rule: AutoResponse) => void;
}

const CURRENT_STUDY_ID = '__current__';

function triggerLabel(t: AutoResponse['trigger']): string {
  return t === 'farewell' ? 'Cuando llega a una despedida' : 'Por cada respuesta nueva';
}
function conditionCount(rule: AutoResponse): number {
  return rule.condGroups.reduce((n, g) => n + g.rows.length + (g.subConditions?.length ?? 0), 0);
}

export default function CopyRuleModal({ currentRules, onCancel, onCopy }: Props) {
  const studies = useMemo(
    () => [{ id: CURRENT_STUDY_ID, name: 'Este estudio', rules: currentRules }, ...OTHER_STUDIES],
    [currentRules],
  );
  const [studyId, setStudyId] = useState(studies.find(s => s.rules.length > 0)?.id ?? CURRENT_STUDY_ID);
  const [ruleId, setRuleId] = useState<string | null>(null);

  const study = studies.find(s => s.id === studyId) ?? studies[0];
  const selectedRule = study.rules.find(r => r.id === ruleId) ?? null;

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
      <Button onClick={onCancel}>Cancelar</Button>
      <Button type="primary" icon={<BiCopy />} disabled={!selectedRule} onClick={() => selectedRule && onCopy(selectedRule)}>
        Copiar regla
      </Button>
    </div>
  );

  return (
    <Modal
      open
      title="Copiar una regla existente"
      onCancel={onCancel}
      footer={footer}
      width={560}
      styles={{ content: { borderRadius: 20 } }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 12 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>Estudio de origen</Text>
          <Select
            value={studyId}
            onChange={v => { setStudyId(v); setRuleId(null); }}
            style={{ width: '100%' }}
            options={studies.map(s => ({ value: s.id, label: `${s.name} (${s.rules.length})` }))}
          />
        </div>

        <div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>Regla a copiar</Text>
          {study.rules.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<Text type="secondary" style={{ fontSize: 12 }}>Este estudio no tiene reglas para copiar.</Text>}
              style={{ margin: '16px 0' }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
              {study.rules.map(rule => {
                const sel = rule.id === ruleId;
                const conds = conditionCount(rule);
                const comps = countComponents(rule.rows);
                return (
                  <button
                    key={rule.id}
                    onClick={() => setRuleId(rule.id)}
                    style={{
                      textAlign: 'left', cursor: 'pointer', borderRadius: 8, padding: '12px 14px',
                      border: sel ? '1px solid #1890ff' : '1px solid #f0f0f0',
                      background: sel ? '#e6f7ff' : '#fff', transition: 'all .1s',
                      display: 'flex', flexDirection: 'column', gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.85)' }}>{rule.name}</span>
                      {hasAiComponent(rule.rows) && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--ds-violet)', background: 'var(--ds-violet-bg)', border: '1px solid var(--ds-violet-mid)', borderRadius: 1000, padding: '0 8px' }}>
                          <BiBoltCircle style={{ fontSize: 11 }} /> IA
                        </span>
                      )}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {triggerLabel(rule.trigger)} · {conds === 0 ? 'Todas las respuestas' : `${conds} ${conds === 1 ? 'condición' : 'condiciones'}`} · {comps} {comps === 1 ? 'componente' : 'componentes'}
                    </Text>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Text type="secondary" style={{ fontSize: 12 }}>
          Se creará una copia como borrador en este estudio, lista para que la revises y edites antes de activarla.
        </Text>
      </div>
    </Modal>
  );
}
