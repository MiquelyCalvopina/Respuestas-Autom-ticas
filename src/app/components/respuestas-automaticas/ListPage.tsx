import { Dropdown, Button, Switch } from 'antd';
import { PlusOutlined, DownOutlined, FormOutlined, ImportOutlined, MailOutlined, EditOutlined, DeleteOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import svgPaths from "@/imports/BoostersPage-1/svg-hnea2jkxqi";
import { AutoResponse } from './types';
import { countComponents, hasAiComponent } from './data';

interface Props {
  rules: AutoResponse[];
  onNew: () => void;
  onEdit: (id: string) => void;
  onLog: (id: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onBack: () => void;
  onCopyFromStudy?: () => void;
}

// ─── Illustration ─────────────────────────────────────────────────────────────

function IdeasFlowIllustration() {
  return (
    <div className="h-[126px] overflow-clip relative shrink-0 w-[210px]">
      <div className="absolute inset-[0.11%_0.06%_0.55%_0]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 209.878 125.164">
          <g id="Group">
            <path d={svgPaths.p199fd80} fill="#bfbfbf" />
            <path d={svgPaths.p354a9a00} fill="#bfbfbf" />
            <path d={svgPaths.p2f113400} fill="#bfbfbf" />
            <path d={svgPaths.p15a1c8c0} fill="#bfbfbf" />
            <path d={svgPaths.p21183480} fill="#bfbfbf" />
            <path d={svgPaths.paecd500} fill="#f0f0f0" />
            <path d={svgPaths.p3f9bbe00} fill="white" />
            <path d={svgPaths.p21b49430} fill="white" />
            <path d={svgPaths.p25c6ea00} fill="white" />
            <g>
              <path d={svgPaths.p3b4ad600} fill="#f0f0f0" />
              <path d={svgPaths.p241f5ff0} fill="#bfbfbf" />
              <path d={svgPaths.paa44c00} fill="#bfbfbf" />
              <path d={svgPaths.p1352ee80} fill="#bfbfbf" />
            </g>
            <g>
              <path d={svgPaths.pc446680} fill="#f0f0f0" />
              <path d={svgPaths.p75f7880} fill="#bfbfbf" />
              <path d={svgPaths.p9846480} fill="#bfbfbf" />
              <path d={svgPaths.p1407a000} fill="#bfbfbf" />
            </g>
            <g>
              <path d={svgPaths.p8199a80} fill="#f0f0f0" />
              <g>
                <path d={svgPaths.p10915400} fill="#fffbe6" />
                <path d={svgPaths.p25476a00} fill="#faad14" />
                <path d={svgPaths.p115fab00} fill="#faad14" />
                <path d={svgPaths.p17ed5080} fill="#faad14" />
                <path d={svgPaths.p2e13fa00} fill="#faad14" />
                <path d={svgPaths.p24b4f480} fill="#faad14" />
                <path d={svgPaths.p3c3f6a00} fill="#faad14" />
                <path d={svgPaths.p3dbdc000} fill="#faad14" />
                <path d={svgPaths.p3453f000} fill="#faad14" />
              </g>
            </g>
            <path d={svgPaths.p1aed9f40} fill="#f0f0f0" />
            <path d={svgPaths.p2b8f3ff0} fill="#bfbfbf" />
            <path d={svgPaths.p3d65bef0} fill="#bfbfbf" />
            <path d={svgPaths.p396c0b00} fill="#f0f0f0" />
          </g>
        </svg>
      </div>
    </div>
  );
}

// ─── Slider icon (shared between buttons) ─────────────────────────────────────

// ─── Agregar regla dropdown button ───────────────────────────────────────────

function AgregarReglaButton({ onNew, onCopyFromStudy }: { onNew: () => void; onCopyFromStudy?: () => void }) {
  const items: MenuProps['items'] = [
    {
      key: 'new',
      icon: <FormOutlined />,
      label: 'Desde cero',
      onClick: onNew,
    },
    {
      key: 'copy',
      icon: <ImportOutlined />,
      label: 'Copiar de otro estudio',
      onClick: onCopyFromStudy,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottom">
      <Button type="primary" icon={<PlusOutlined />}>
        Agregar regla <DownOutlined style={{ fontSize: 10, marginLeft: 2 }} />
      </Button>
    </Dropdown>
  );
}

// ─── Logs icon ────────────────────────────────────────────────────────────────

function LogsIcon() {
  return (
    <div className="overflow-clip relative shrink-0 size-[14px]">
      <div className="absolute inset-[12.5%_8.33%]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 10.4998">
          <path d={svgPaths.p26abb800} fill="rgba(0,0,0,0.85)" />
          <path d={svgPaths.p2e705900} fill="rgba(0,0,0,0.85)" />
        </svg>
      </div>
    </div>
  );
}

// ─── Rule card badges ─────────────────────────────────────────────────────────

function Badge({ tone, children }: { tone: 'warning' | 'success' | 'neutral' | 'ai'; children: React.ReactNode }) {
  const toneClass = {
    warning: 'bg-[#fffbe6] border-[#ffe58f] text-[#d48806]',
    success: 'bg-[#f6ffed] border-[#b7eb8f] text-[#389e0d]',
    neutral: 'bg-[#fafafa] border-[#d9d9d9] text-[rgba(0,0,0,0.65)]',
    ai:      'bg-[var(--ds-violet-bg)] border-[var(--ds-violet-mid)] text-[var(--ds-violet)]',
  }[tone];
  return (
    <span
      className={`inline-flex items-center border border-solid rounded-[4px] px-[8px] leading-[20px] text-[12px] font-['Roboto:Regular',sans-serif] ${toneClass}`}
      style={{ fontVariationSettings: '"wdth" 100' }}
    >
      {children}
    </span>
  );
}

function statusBadge(rule: AutoResponse) {
  if (!rule.published) return <Badge tone="warning">Borrador</Badge>;
  if (rule.active) return <Badge tone="success">Activa</Badge>;
  return <Badge tone="neutral">Inactiva</Badge>;
}

function triggerBadge(t: AutoResponse['trigger']) {
  if (t === 'response') return <Badge tone="neutral">Por respuesta nueva</Badge>;
  if (t === 'farewell') return <Badge tone="neutral">Al llegar despedida</Badge>;
  return null;
}

// ─── Rule card ────────────────────────────────────────────────────────────────

function RuleCard({ rule, onEdit, onLog, onDelete, onToggle }: {
  rule: AutoResponse; onEdit: () => void; onLog: () => void; onDelete: () => void; onToggle: () => void;
}) {
  const hasAi = hasAiComponent(rule.rows);
  const condCount = rule.condGroups.flatMap(g => g.rows).length;

  return (
    <div className="bg-white border border-[#f0f0f0] border-solid rounded-[8px] p-[16px] flex flex-col gap-[12px] w-full">
      {/* Title row */}
      <div className="flex items-center gap-[12px]">
        <div
          className="rounded-full flex items-center justify-center shrink-0 size-[32px] border border-solid text-[15px]"
          style={hasAi
            ? { background: 'var(--ds-violet-bg)', borderColor: 'var(--ds-violet-mid)', color: 'var(--ds-violet)' }
            : { background: '#e6f7ff', borderColor: '#91d5ff', color: '#1890ff' }}
        >
          {hasAi ? '✦' : <MailOutlined />}
        </div>
        <div className="flex-[1_0_0] min-w-px flex flex-col gap-[2px]">
          <span
            className="font-['Roboto:Medium',sans-serif] font-medium text-[14px] text-[rgba(0,0,0,0.85)] truncate block"
            style={{ fontVariationSettings: '"wdth" 100' }}
          >
            {rule.name}
          </span>
          <span
            className="font-['Roboto:Regular',sans-serif] font-normal text-[12px] text-[rgba(0,0,0,0.45)]"
            style={{ fontVariationSettings: '"wdth" 100' }}
          >
            {rule.sender || '—'} · {countComponents(rule.rows)} bloque{countComponents(rule.rows) !== 1 ? 's' : ''}
          </span>
        </div>
        <Switch checked={rule.active} onChange={onToggle} size="small" />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-[8px]">
        {statusBadge(rule)}
        {triggerBadge(rule.trigger)}
        {condCount > 0 && <Badge tone="neutral">{condCount} condici{condCount !== 1 ? 'ones' : 'ón'}</Badge>}
        {hasAi && <Badge tone="ai"><ThunderboltOutlined style={{ marginRight: 4 }} />Bloque IA</Badge>}
      </div>

      {/* Actions */}
      <div className="flex gap-[8px] pt-[4px]">
        <button
          onClick={onEdit}
          className="bg-white border border-[#d9d9d9] border-solid cursor-pointer drop-shadow-[0px_2px_0px_rgba(0,0,0,0.02)] flex gap-[4px] items-center px-[9px] py-[8px] rounded-[8px] text-[14px] text-[rgba(0,0,0,0.85)] font-['Roboto:Regular',sans-serif]"
          style={{ fontVariationSettings: '"wdth" 100' }}
        >
          <EditOutlined style={{ fontSize: 12 }} /> Editar
        </button>
        <button
          onClick={onLog}
          className="bg-white border border-[#d9d9d9] border-solid cursor-pointer drop-shadow-[0px_2px_0px_rgba(0,0,0,0.02)] flex gap-[4px] items-center px-[9px] py-[8px] rounded-[8px] text-[14px] text-[rgba(0,0,0,0.85)] font-['Roboto:Regular',sans-serif]"
          style={{ fontVariationSettings: '"wdth" 100' }}
        >
          <LogsIcon /> Ver ejecuciones
        </button>
        <button
          onClick={onDelete}
          className="bg-white border border-[#ffccc7] border-solid cursor-pointer flex items-center justify-center px-[9px] py-[8px] rounded-[8px] text-[#ff4d4f]"
          aria-label="Eliminar"
        >
          <DeleteOutlined style={{ fontSize: 14 }} />
        </button>
      </div>
    </div>
  );
}

// ─── ListPage ─────────────────────────────────────────────────────────────────

export default function ListPage({ rules, onNew, onEdit, onLog, onDelete, onToggle, onBack, onCopyFromStudy }: Props) {
  const goToFirstRuleLog = () => { if (rules[0]) onLog(rules[0].id); };

  return (
    <div className="bg-white flex-[1_0_0] min-h-px relative w-full z-[1]">
      <div className="content-stretch flex flex-col gap-[24px] isolate items-start pb-[16px] pt-[24px] px-[32px] relative size-full">

        {/* Sub-header row */}
        <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full z-[2]">

          {/* Breadcrumb + description */}
          <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px relative">
            {/* Breadcrumb */}
            <div className="content-stretch flex items-center overflow-clip relative shrink-0">
              <button
                onClick={onBack}
                className="[word-break:break-word] bg-transparent border-0 cursor-pointer flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] p-0 relative shrink-0 text-[#1890ff] text-[14px] whitespace-nowrap"
                style={{ fontVariationSettings: '"wdth" 100' }}
              >
                <span className="leading-[normal]">Potenciadores</span>
              </button>
              {/* Chevron separator */}
              <div className="flex items-center justify-center mx-[4px] relative shrink-0">
                <div className="-scale-y-100 flex-none">
                  <div className="relative size-[20px]">
                    <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                      <path d={svgPaths.p6eb1c00} fill="rgba(0,0,0,0.85)" />
                    </svg>
                  </div>
                </div>
              </div>
              <div
                className="[word-break:break-word] flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.85)] whitespace-nowrap"
                style={{ fontVariationSettings: '"wdth" 100' }}
              >
                <span className="leading-[normal]">Respuestas Automáticas</span>
              </div>
            </div>
            {/* Description */}
            <div
              className="[word-break:break-word] flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] min-w-full relative shrink-0 text-[14px] text-[rgba(0,0,0,0.45)] w-[min-content]"
              style={{ fontVariationSettings: '"wdth" 100' }}
            >
              <span className="leading-[normal]">Correos que se envían automáticamente al encuestado cuando llega una respuesta</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
            {rules.length > 0 && (
              <AgregarReglaButton onNew={onNew} onCopyFromStudy={onCopyFromStudy} />
            )}
            {/* Ver logs */}
            <button
              onClick={goToFirstRuleLog}
              className="bg-white border border-[#d9d9d9] border-solid content-stretch cursor-pointer drop-shadow-[0px_2px_0px_rgba(0,0,0,0.02)] flex gap-[4px] items-center justify-center px-[9px] py-[8px] relative rounded-[8px] shrink-0"
            >
              <LogsIcon />
              <span
                className="[word-break:break-word] font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.85)] text-center whitespace-nowrap"
                style={{ fontVariationSettings: '"wdth" 100' }}
              >
                Ver logs
              </span>
            </button>

          </div>
        </div>

        {rules.length === 0 ? (
          /* Empty state */
          <div className="w-full">
            <div className="flex flex-col gap-[16px] items-center py-[80px] w-full">
                <IdeasFlowIllustration />

                {/* Title + subtitle */}
                <div
                  className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-center justify-center leading-[0] relative shrink-0 text-[rgba(0,0,0,0.45)] text-center w-full"
                >
                  <div
                    className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center relative shrink-0 text-[20px] w-full"
                    style={{ fontVariationSettings: '"wdth" 100' }}
                  >
                    <p className="leading-[normal]">Respuestas Automáticas</p>
                  </div>
                  <div
                    className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center relative shrink-0 text-[14px] w-full"
                    style={{ fontVariationSettings: '"wdth" 100' }}
                  >
                    <p className="leading-[normal]">Configura reglas para enviar correos automáticos a tus encuestados.</p>
                  </div>
                </div>

                {/* CTA */}
                <AgregarReglaButton onNew={onNew} onCopyFromStudy={onCopyFromStudy} />
            </div>
          </div>
        ) : (
          /* Rules list */
          <div className="flex flex-col gap-[12px] w-full">
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
    </div>
  );
}
