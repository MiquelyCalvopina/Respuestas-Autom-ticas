import { useState } from 'react';
import { App } from 'antd';
import { toast } from 'sonner';
import { AutoResponse, ModuleView } from './types';
import { cuid } from './cuid';
import ListPage from './ListPage';
import WizardView from './WizardView';
import EditorView from './EditorView';
import LogView from './LogView';

interface Props {
  onBack: () => void;
}

function emptyRule(): AutoResponse {
  return {
    id: cuid(),
    name: 'Nueva regla',
    trigger: null,
    active: false,
    published: false,
    condGroups: [],
    sender: 'cx@hircasa.com',
    recipientVariable: 'correo_electronico',
    replyTo: '',
    subject: '',
    rows: [],
    layout: { widthPercent: 100, boxed: true, bgColor: '#f5f5f5' },
    blocksUpdatedAt: null,
    customHtml: null,
  };
}

export default function RespuestasAutomaticas({ onBack }: Props) {
  const { message } = App.useApp();
  const [view, setView] = useState<ModuleView>('list');
  const [rules, setRules] = useState<AutoResponse[]>([]);
  const [currentRule, setCurrentRule] = useState<AutoResponse>(emptyRule());
  const [logRule, setLogRule] = useState<AutoResponse | null>(null);

  function openNew() {
    setCurrentRule(emptyRule());
    setView('wizard');
  }

  function openEdit(id: string) {
    const r = rules.find(r => r.id === id);
    if (r) { setCurrentRule({ ...r }); setView('wizard'); }
  }

  function openLog(id: string) {
    const r = rules.find(r => r.id === id);
    if (r) { setLogRule(r); setView('log'); }
  }

  function deleteRule(id: string) {
    setRules(prev => prev.filter(r => r.id !== id));
    message.info('Respuesta automática eliminada');
  }

  function toggleRule(id: string) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  }

  function saveAndActivate() {
    const updated = { ...currentRule, active: true, published: true };
    setRules(prev => {
      const exists = prev.find(r => r.id === updated.id);
      return exists ? prev.map(r => r.id === updated.id ? updated : r) : [...prev, updated];
    });
    setView('list');
    message.success('Respuesta automática activada ✓');
  }

  function saveDraft() {
    setRules(prev => {
      const exists = prev.find(r => r.id === currentRule.id);
      return exists ? prev.map(r => r.id === currentRule.id ? currentRule : r) : [...prev, currentRule];
    });
    setView('list');
    message.success('Guardado como borrador');
  }

  function backToList() {
    setView('list');
  }

  if (view === 'log') {
    const ruleForLog = logRule ?? rules[0] ?? emptyRule();
    return <LogView rule={ruleForLog} onBack={backToList} />;
  }

  if (view === 'editor') {
    return (
      <EditorView
        rule={currentRule}
        onChange={setCurrentRule}
        onBack={() => setView('wizard')}
      />
    );
  }

  if (view === 'wizard') {
    return (
      <WizardView
        rule={currentRule}
        onChange={setCurrentRule}
        onSaveAndActivate={saveAndActivate}
        onBack={backToList}
        onSaveDraft={saveDraft}
        onOpenEditor={() => setView('editor')}
      />
    );
  }

  return (
    <ListPage
      rules={rules}
      onNew={openNew}
      onEdit={openEdit}
      onLog={openLog}
      onDelete={deleteRule}
      onToggle={toggleRule}
      onBack={onBack}
    />
  );
}
