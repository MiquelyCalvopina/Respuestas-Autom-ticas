import { useRef, useState } from 'react';
import { Modal, Button, Alert, Checkbox, Typography } from 'antd';
import { BiUpload, BiDownload, BiFile } from 'react-icons/bi';
import { AutoResponse, Trigger } from './types';
import { countComponents } from './data';
import { parseRulesFile, downloadRules, slugify } from './ruleIo';

const { Text } = Typography;

function triggerLabel(t: Trigger | null): string {
  return t === 'farewell' ? 'Cuando llega a una despedida' : 'Por cada respuesta nueva';
}
function conditionCount(rule: AutoResponse): number {
  return (rule.condGroups ?? []).reduce((n, g) => n + (g.rows?.length ?? 0) + (g.subConditions?.length ?? 0), 0);
}

// Fila con checkbox + resumen de una regla — compartida por importar y descargar.
function RuleRow({ rule, checked, onToggle }: { rule: AutoResponse; checked: boolean; onToggle: () => void }) {
  const conds = conditionCount(rule);
  const comps = countComponents(rule.rows ?? []);
  return (
    <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', border: '1px solid #f0f0f0', borderRadius: 8, padding: '10px 12px' }}>
      <Checkbox checked={checked} onChange={onToggle} style={{ marginTop: 2 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.85)' }}>{rule.name}</span>
        </div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {triggerLabel(rule.trigger)} · {conds === 0 ? 'Todas las respuestas' : `${conds} ${conds === 1 ? 'condición' : 'condiciones'}`} · {comps} {comps === 1 ? 'componente' : 'componentes'}
        </Text>
      </div>
    </label>
  );
}

function SelectAllRow({ total, selected, onToggleAll }: { total: number; selected: number; onToggleAll: (checked: boolean) => void }) {
  return (
    <Checkbox
      checked={selected === total && total > 0}
      indeterminate={selected > 0 && selected < total}
      onChange={e => onToggleAll(e.target.checked)}
      style={{ marginBottom: 4 }}
    >
      <Text style={{ fontSize: 12 }}>Seleccionar todas ({selected}/{total})</Text>
    </Checkbox>
  );
}

// ─── Importar reglas desde JSON ──────────────────────────────────────────────

export function ImportRulesModal({ onCancel, onImport }: { onCancel: () => void; onImport: (rules: AutoResponse[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<AutoResponse[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');

  function handleFile(file: File) {
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rules = parseRulesFile(String(reader.result));
        setParsed(rules);
        setSelected(new Set(rules.map((_, i) => i)));
        setFileName(file.name);
      } catch (e) {
        setParsed(null);
        setSelected(new Set());
        setError(e instanceof Error ? e.message : 'No se pudo leer el archivo.');
      }
    };
    reader.onerror = () => setError('No se pudo leer el archivo.');
    reader.readAsText(file);
  }

  function toggle(i: number) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  const selectedRules = parsed ? parsed.filter((_, i) => selected.has(i)) : [];

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
      <Button onClick={onCancel}>Cancelar</Button>
      <Button type="primary" icon={<BiUpload />} disabled={selectedRules.length === 0} onClick={() => onImport(selectedRules)}>
        Importar {selectedRules.length > 0 ? `${selectedRules.length} ${selectedRules.length === 1 ? 'regla' : 'reglas'}` : 'reglas'}
      </Button>
    </div>
  );

  return (
    <Modal open title="Importar reglas desde JSON" onCancel={onCancel} footer={footer} width={560} styles={{ content: { borderRadius: 20 } }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 12 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Selecciona un archivo <code>.json</code> exportado desde este u otro estudio. Puede contener una o varias reglas.
          Se crearán como borradores en este estudio.
        </Text>

        <input
          ref={inputRef} type="file" accept="application/json,.json" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
        />
        <Button icon={<BiFile />} onClick={() => inputRef.current?.click()} style={{ alignSelf: 'flex-start' }}>
          {parsed ? 'Elegir otro archivo' : 'Seleccionar archivo JSON'}
        </Button>

        {error && <Alert type="error" showIcon message={error} />}

        {parsed && (
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
              <BiFile style={{ marginRight: 4 }} />{fileName} — {parsed.length} {parsed.length === 1 ? 'regla encontrada' : 'reglas encontradas'}
            </Text>
            <SelectAllRow
              total={parsed.length} selected={selected.size}
              onToggleAll={checked => setSelected(checked ? new Set(parsed.map((_, i) => i)) : new Set())}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto', paddingRight: 4, marginTop: 8 }}>
              {parsed.map((rule, i) => (
                <RuleRow key={i} rule={rule} checked={selected.has(i)} onToggle={() => toggle(i)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Descargar reglas como JSON ──────────────────────────────────────────────

export function ExportRulesModal({ rules, onClose }: { rules: AutoResponse[]; onClose: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(rules.map(r => r.id)));

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const selectedRules = rules.filter(r => selected.has(r.id));

  function handleDownload() {
    const filename = selectedRules.length === 1
      ? `regla-${slugify(selectedRules[0].name)}.json`
      : 'reglas-respuestas-automaticas.json';
    downloadRules(selectedRules, filename);
    onClose();
  }

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
      <Button onClick={onClose}>Cancelar</Button>
      <Button type="primary" icon={<BiDownload />} disabled={selectedRules.length === 0} onClick={handleDownload}>
        Descargar {selectedRules.length > 0 ? `${selectedRules.length} ${selectedRules.length === 1 ? 'regla' : 'reglas'}` : 'reglas'}
      </Button>
    </div>
  );

  return (
    <Modal open title="Descargar reglas como JSON" onCancel={onClose} footer={footer} width={560} styles={{ content: { borderRadius: 20 } }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 12 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Descarga una o varias reglas en un archivo JSON para respaldarlas o importarlas en otro estudio.
        </Text>
        <div>
          <SelectAllRow
            total={rules.length} selected={selected.size}
            onToggleAll={checked => setSelected(checked ? new Set(rules.map(r => r.id)) : new Set())}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto', paddingRight: 4, marginTop: 8 }}>
            {rules.map(rule => (
              <RuleRow key={rule.id} rule={rule} checked={selected.has(rule.id)} onToggle={() => toggle(rule.id)} />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
