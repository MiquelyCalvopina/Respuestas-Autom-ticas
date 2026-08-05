import { useMemo, useState } from 'react';
import { Button, Empty, Alert, Select } from 'antd';
import { BiArrowBack, BiInfoCircle, BiChevronDown } from 'react-icons/bi';
import { AutoResponse } from './types';
import { describeRecipientSource } from './data';

// ─── Modelo de una ejecución del potenciador ─────────────────────────────────
// Esto es el log de un JOB de envío — no un resumen de la respuesta de la encuesta. Por eso
// sus campos son los de la ejecución (regla, remitente, asunto, destinatario, resultado) y no
// datos del contenido de la encuesta (NPS, sucursal, nombre del encuestado) — eso vive en la
// respuesta misma, no en el historial de este potenciador.
type LogStatus = 'enviado' | 'no_enviado' | 'error'; // únicos 3 estados posibles de un envío
interface Execution {
  id: string;            // ID de interacción que disparó el job
  responseId: string;    // ID de la respuesta atada a esa interacción
  ruleId: string;
  ruleName: string;
  ts: number;             // epoch ms — fecha/hora de ejecución del job
  status: LogStatus;
  observacion: string;    // del intento de envío — siempre poblado, incluso si status es "enviado"
  recipientEmail: string; // correo al que se envió — vacío si status es "no_enviado" (no había a quién)
  senderEmail: string;    // remitente configurado en la regla (rule.sender)
  subject: string;        // asunto configurado en la regla (rule.subject)
}

const MOTIVOS_ERROR = [
  'Error SMTP — buzón del destinatario lleno',
  'Error SMTP — dominio del destinatario no existe',
  'Timeout al conectar con el servidor de correo',
  'Dirección de correo con formato inválido',
];
const EMAIL_DOMAINS_MOCK = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com'];
const PAGE_SIZE = 15;

// PRNG con semilla (mulberry32) para que las ejecuciones simuladas de una regla sean
// estables entre renders — no se rebarajan cada vez que abres el historial. 100% mock,
// no hay backend real en este prototipo — esta versión solo envía por correo, no por WhatsApp
// u otro canal, así que el job no tiene un "canal de envío" que elegir.
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateLogs(rule: AutoResponse, now: number): Execution[] {
  // Una regla que nunca se ha activado no tiene ejecuciones.
  if (!rule.active && !rule.published) return [];
  const rand = mulberry32(hashStr(rule.id));
  const total = 20 + Math.floor(rand() * 70);
  const logs: Execution[] = [];
  for (let i = 0; i < total; i++) {
    const ts = now - Math.floor(rand() * 30 * 24 * 60 * 60 * 1000); // hasta 30 días atrás
    const r = rand();
    let status: LogStatus = 'enviado';
    let observacion = 'Correo enviado correctamente.';
    let recipientEmail = `respuesta${4500 + Math.floor(rand() * 5000)}@${EMAIL_DOMAINS_MOCK[Math.floor(rand() * EMAIL_DOMAINS_MOCK.length)]}`;
    if (r >= 0.82 && r < 0.94) {
      status = 'no_enviado';
      observacion = `${describeRecipientSource(rule.recipientVariable)} sin valor en la respuesta.`;
      recipientEmail = ''; // no había a quién enviarle — no es que el envío fallara
    } else if (r >= 0.94) {
      status = 'error';
      observacion = MOTIVOS_ERROR[Math.floor(rand() * MOTIVOS_ERROR.length)];
      // recipientEmail se mantiene: sí había un destinatario, el envío en sí falló
    }
    logs.push({
      id: `#${4500 + Math.floor(rand() * 1000)}`,
      responseId: `#${9000 + Math.floor(rand() * 3000)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      ts, status, observacion, recipientEmail,
      senderEmail: rule.sender,
      subject: rule.subject,
    });
  }
  return logs.sort((a, b) => b.ts - a.ts);
}

function relativeTime(ts: number, now: number): string {
  const diff = now - ts;
  const min = Math.floor(diff / 60000), hr = Math.floor(diff / 3600000), day = Math.floor(diff / 86400000);
  if (min < 1) return 'Hace un momento';
  if (min < 60) return `Hace ${min} min`;
  if (hr < 24) return `Hace ${hr} h`;
  if (day === 1) return 'Ayer';
  return `Hace ${day} días`;
}

const STATUS_META: Record<LogStatus, { label: string; bg: string; border: string; color: string }> = {
  enviado:    { label: 'Enviado',         bg: '#f6ffed', border: '#b7eb8f', color: '#389e0d' },
  no_enviado: { label: 'No enviado',      bg: '#fffbe6', border: '#ffe58f', color: '#d48806' },
  error:      { label: 'Error de envío',  bg: '#fff1f0', border: '#ffccc7', color: '#cf1322' },
};

type Filter = 'all' | LogStatus;

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: '12px 14px' }}>
      <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: LogStatus }) {
  const m = STATUS_META[status];
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 1000, background: m.bg, border: `1px solid ${m.border}`, color: m.color, whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  );
}

function LogRow({ exec, now, expanded, onToggle, showRule }: { exec: Execution; now: number; expanded: boolean; onToggle: () => void; showRule: boolean }) {
  const detail = exec.status === 'enviado' ? `Enviado a ${exec.recipientEmail}` : exec.observacion;
  // Todo el contenido "atado a un log" — el job (regla + sus IDs), el correo en sí (emisor,
  // asunto, destino), el resultado (observación) y los IDs de lo que lo disparó. Regla/ID de
  // regla se muestran siempre, no solo en la vista agregada — son datos del job, no un adorno
  // de la vista de "todas las reglas".
  const rows: [string, string][] = [
    ['ID de interacción', exec.id],
    ['ID de respuesta', exec.responseId],
    ['Regla', exec.ruleName],
    ['ID de regla', exec.ruleId],
    ['Correo emisor', exec.senderEmail],
    ['Asunto', exec.subject],
    ['Correo destino', exec.recipientEmail || '—'],
    ['Observación', exec.observacion],
    ['Fecha y hora', new Date(exec.ts).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })],
  ];

  return (
    <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, background: '#fff', padding: '10px 13px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flexWrap: 'wrap' }}>
          <code style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 12, color: 'rgba(0,0,0,0.85)' }}>{exec.id}</code>
          {showRule && (
            <span style={{ fontSize: 11, fontWeight: 500, padding: '1px 8px', borderRadius: 1000, background: '#f0f5ff', color: '#1890ff' }}>{exec.ruleName}</span>
          )}
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{relativeTime(exec.ts, now)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusBadge status={exec.status} />
          <BiChevronDown style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>{detail}</div>
      {expanded && (
        <div style={{ marginTop: 4, padding: '10px 12px', background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {rows.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 8, fontSize: 12 }}>
              <span style={{ color: 'rgba(0,0,0,0.45)', width: 130, flexShrink: 0, fontWeight: 500 }}>{k}</span>
              <span style={{ color: 'rgba(0,0,0,0.75)' }}>{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// `rules` siempre es un array: 1 elemento para "Ver ejecuciones" de una regla puntual (desde su
// card), 2+ para el "Ver logs" general del header de la lista — que antes, por error, abría el
// log de la primera regla nada más en vez de combinar todas. La columna/chip de regla y el
// selector de regla solo aparecen cuando hay más de una (en el caso de 1 sola no aportan nada).
export default function LogView({ rules, onBack }: { rules: AutoResponse[]; onBack: () => void }) {
  const now = useMemo(() => Date.now(), []);
  const showRule = rules.length > 1;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const all = useMemo(
    () => rules.flatMap(r => generateLogs(r, now)).sort((a, b) => b.ts - a.ts),
    [rules.map(r => `${r.id}:${r.active}:${r.published}`).join('|'), now],
  );
  const [ruleFilter, setRuleFilter] = useState<string>('all');
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const byRule = ruleFilter === 'all' ? all : all.filter(e => e.ruleId === ruleFilter);
  const enviados = byRule.filter(e => e.status === 'enviado');
  const noEnviados = byRule.filter(e => e.status === 'no_enviado');
  const errores = byRule.filter(e => e.status === 'error');

  const filtered = filter === 'all' ? byRule : byRule.filter(e => e.status === filter);
  const paged = filtered.slice(0, PAGE_SIZE * (page + 1));
  const hasMore = filtered.length > paged.length;

  const ultima = byRule.length ? relativeTime(byRule[0].ts, now) : '—';

  const filterChips: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'Todos', count: byRule.length },
    { key: 'enviado', label: 'Enviados', count: enviados.length },
    { key: 'no_enviado', label: 'No enviados', count: noEnviados.length },
    { key: 'error', label: 'Errores', count: errores.length },
  ];

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const title = showRule ? 'Ejecuciones — Todas las reglas' : `Ejecuciones — ${rules[0]?.name ?? ''}`;

  return (
    <div style={{ padding: '32px 24px', maxWidth: 760, margin: '0 auto', width: '100%', boxSizing: 'border-box', fontFamily: "'Roboto', sans-serif" }}>
      <Button type="text" icon={<BiArrowBack />} onClick={onBack} style={{ marginBottom: 16, color: 'rgba(0,0,0,0.45)', paddingLeft: 0 }}>
        Volver
      </Button>

      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.85)' }}>{title}</p>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(0,0,0,0.45)' }}>
            {byRule.length} {byRule.length === 1 ? 'ejecución' : 'ejecuciones'}{byRule.length > 0 ? ` · Última ${ultima}` : ''}
          </p>
        </div>
        {showRule && rules.length > 0 && (
          <Select
            value={ruleFilter}
            onChange={v => { setRuleFilter(v); setPage(0); }}
            style={{ minWidth: 200 }}
            options={[{ value: 'all', label: 'Todas las reglas' }, ...rules.map(r => ({ value: r.id, label: r.name }))]}
          />
        )}
      </div>

      {rules.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>Todavía no has creado ninguna regla.</span>}
          style={{ padding: '48px 0' }}
        />
      ) : byRule.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>
              {showRule && ruleFilter === 'all'
                ? 'Ninguna regla tiene ejecuciones todavía. Aparecerán aquí una vez que estén activas y lleguen respuestas que las disparen.'
                : 'Esta regla aún no tiene ejecuciones. Aparecerán aquí una vez que esté activa y lleguen respuestas que la disparen.'}
            </span>
          }
          style={{ padding: '48px 0' }}
        />
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
            <StatCard label="Total" value={byRule.length} color="rgba(0,0,0,0.85)" />
            <StatCard label="Enviados" value={enviados.length} color="#389e0d" />
            <StatCard label="No enviados" value={noEnviados.length} color="#d48806" />
            <StatCard label="Errores" value={errores.length} color="#cf1322" />
          </div>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {filterChips.map(f => (
              <Button
                key={f.key}
                size="small"
                type={filter === f.key ? 'primary' : 'default'}
                onClick={() => { setFilter(f.key); setPage(0); }}
              >
                {f.label} ({f.count})
              </Button>
            ))}
          </div>

          {/* Lista */}
          {paged.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'rgba(0,0,0,0.25)', fontSize: 13 }}>
              Sin ejecuciones en esta categoría
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {paged.map(exec => (
                <LogRow
                  key={exec.ruleId + exec.id + exec.ts}
                  exec={exec} now={now} showRule={showRule}
                  expanded={expanded.has(exec.ruleId + exec.id + exec.ts)}
                  onToggle={() => toggle(exec.ruleId + exec.id + exec.ts)}
                />
              ))}
            </div>
          )}

          {hasMore && (
            <Button block onClick={() => setPage(p => p + 1)} style={{ marginTop: 8 }}>
              Cargar más ({filtered.length - paged.length} restantes)
            </Button>
          )}

          <Alert
            type="info"
            icon={<BiInfoCircle />}
            showIcon
            message={
              <span style={{ fontSize: 12 }}>
                Los <strong>no enviados</strong> ocurren cuando el encuestado no tiene valor en la fuente de correo configurada para esta regla —
                son omisiones esperadas, no errores del sistema. Los <strong>errores</strong> indican un fallo técnico en el envío.
              </span>
            }
            style={{ marginTop: 16 }}
          />
        </>
      )}
    </div>
  );
}
