import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { App, ConfigProvider } from 'antd';
import { toast } from 'sonner';
import { AutoResponse, ModuleView } from './types';
import { cuid } from './cuid';
import { countComponents, makeTemplate } from './data';
import { templateForDate, todayISO } from './templateResolution';
import ListPage from './ListPage';
import WizardView from './WizardView';
import EditorView from './EditorView';
import TemplatesManagerView from './TemplatesManagerView';
import LogView from './LogView';

interface Props {
  onBack: () => void;
}

// Tokens de botón del sistema de diseño, tomados del inspector de Figma (componente Button,
// medium/normal): radio 8px, padding 8px horizontal / 7px vertical, gap ícono-texto 4px, alto 32px.
// AntD por defecto usa 15px horizontal — se sobreescribe a nivel módulo para que TODOS los botones
// (wizard, lista, log, prueba) hereden el estándar sin repetirlo botón por botón.
const MODULE_THEME = {
  token: { borderRadius: 8 },
  components: { Button: { paddingInline: 8, paddingBlock: 7 } },
};

// Copia profunda de una regla con IDs nuevos en todos los niveles (regla, filas, columnas,
// componentes, grupos y subcondiciones). Queda como borrador inactivo. Reutilizada por
// "Duplicar" (misma lista) y por "Copiar una regla existente" (este u otro estudio).
function cloneRule(r: AutoResponse, name: string): AutoResponse {
  return {
    ...r,
    id: cuid(),
    name,
    active: false,
    published: false,
    scheduledAt: null,
    templates: (r.templates ?? []).map(t => ({
      ...t,
      id: cuid(),
      rows: (t.rows ?? []).map(row => ({
        ...row,
        id: cuid(),
        columns: (row.columns ?? []).map(col => ({
          ...col,
          id: cuid(),
          components: (col.components ?? []).map(c => ({ ...c, id: cuid() })),
        })),
      })),
    })),
    condGroups: (r.condGroups ?? []).map(g => ({
      ...g,
      id: cuid(),
      rows: (g.rows ?? []).map(row => ({ ...row, id: cuid() })),
      subConditions: (g.subConditions ?? []).map(sc => ({ ...sc, id: cuid(), row: { ...sc.row, id: cuid() } })),
    })),
  };
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
    cc: [],
    bcc: [],
    subject: '',
    templates: [makeTemplate('Estándar', { startDate: new Date().toISOString() })],
    scheduledAt: null,
  };
}

export default function RespuestasAutomaticas({ onBack }: Props) {
  const { message } = App.useApp();
  const [view, setView] = useState<ModuleView>('list');
  const [rules, setRules] = useState<AutoResponse[]>([]);
  const [currentRule, setCurrentRule] = useState<AutoResponse>(emptyRule());
  const [wizardStep, setWizardStep] = useState(0);
  const [logRule, setLogRule] = useState<AutoResponse | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Abre el editor de correo sobre una plantilla puntual de la regla en curso. Al volver
  // (EditorView.onBack), si la regla tiene 2+ plantillas se regresa al gestor; si solo tiene
  // una, directo al wizard — sin pasos extra para el caso simple.
  function openEditorForTemplate(templateId: string) {
    setEditingTemplateId(templateId);
    setView('editor');
  }

  function openNew() {
    setCurrentRule(emptyRule());
    setWizardStep(0);
    setView('wizard');
  }

  function openEdit(id: string) {
    const r = rules.find(r => r.id === id);
    if (r) { setCurrentRule({ ...r }); setWizardStep(0); setView('wizard'); }
  }

  function openLog(id: string) {
    const r = rules.find(r => r.id === id);
    if (r) { setLogRule(r); setView('log'); }
  }

  function deleteRule(id: string) {
    setRules(prev => prev.filter(r => r.id !== id));
    message.info('Respuesta automática eliminada');
  }

  function duplicateRule(id: string) {
    const r = rules.find(r => r.id === id);
    if (!r) return;
    setRules(prev => [...prev, cloneRule(r, `${r.name} (copia)`)]);
    message.success('Regla duplicada como borrador');
  }

  function toggleRule(id: string) {
    setRules(prev => prev.map(r => {
      if (r.id !== id) return r;
      if (!r.active && countComponents(templateForDate(r.templates, todayISO()).rows) === 0) {
        message.warning('Esta regla no tiene una plantilla de correo. Edítala y agrega contenido antes de activarla.');
        return r;
      }
      return { ...r, active: !r.active, published: true, scheduledAt: null };
    }));
  }

  function scheduleRule(id: string, iso: string) {
    setRules(prev => prev.map(r => {
      if (r.id !== id) return r;
      if (countComponents(templateForDate(r.templates, todayISO()).rows) === 0) {
        message.warning('Esta regla no tiene una plantilla de correo. Edítala y agrega contenido antes de programarla.');
        return r;
      }
      return { ...r, scheduledAt: iso };
    }));
    message.success('Activación programada');
  }

  function cancelSchedule(id: string) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, scheduledAt: null } : r));
  }

  // Simula el disparo de la activación programada — no hay backend/cron real en este prototipo.
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setRules(prev => {
        let changed = false;
        const next = prev.map(r => {
          if (r.scheduledAt && new Date(r.scheduledAt) <= now) {
            changed = true;
            return { ...r, active: true, published: true, scheduledAt: null };
          }
          return r;
        });
        if (changed) message.success('Una regla programada se activó automáticamente');
        return changed ? next : prev;
      });
    }, 15000);
    return () => clearInterval(timer);
  }, [message]);

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

  let content: ReactNode;
  if (view === 'log') {
    const ruleForLog = logRule ?? rules[0] ?? emptyRule();
    content = <LogView rule={ruleForLog} onBack={backToList} />;
  } else if (view === 'editor') {
    const editingTemplate = currentRule.templates.find(t => t.id === editingTemplateId) ?? currentRule.templates[0];
    content = (
      <EditorView
        template={editingTemplate}
        onChange={t => setCurrentRule(r => ({ ...r, templates: r.templates.map(x => x.id === t.id ? t : x) }))}
        onBack={() => setView(currentRule.templates.length > 1 ? 'templates' : 'wizard')}
      />
    );
  } else if (view === 'templates') {
    content = (
      <TemplatesManagerView
        rule={currentRule}
        onChange={setCurrentRule}
        onBack={() => setView('wizard')}
        onEditTemplate={openEditorForTemplate}
      />
    );
  } else if (view === 'wizard') {
    content = (
      <WizardView
        rule={currentRule}
        onChange={setCurrentRule}
        onSaveAndActivate={saveAndActivate}
        onBack={backToList}
        onSaveDraft={saveDraft}
        onOpenEditor={openEditorForTemplate}
        onOpenTemplatesManager={() => setView('templates')}
        step={wizardStep}
        onStepChange={setWizardStep}
      />
    );
  } else {
    content = (
      <ListPage
        rules={rules}
        onNew={openNew}
        onEdit={openEdit}
        onLog={openLog}
        onDelete={deleteRule}
        onToggle={toggleRule}
        onDuplicate={duplicateRule}
        onSchedule={scheduleRule}
        onCancelSchedule={cancelSchedule}
        onBack={onBack}
      />
    );
  }

  return (
    <ConfigProvider theme={MODULE_THEME}>
      {content}
    </ConfigProvider>
  );
}
