import { Dropdown, Button, Switch, Popconfirm, ConfigProvider } from 'antd';
import { BiPlus, BiEditAlt, BiImport, BiTrash, BiCopy, BiDownload, BiHistory, BiBrain } from 'react-icons/bi';
import type { MenuProps } from 'antd';
import svgPaths from "@/imports/BoostersPage-1/svg-hnea2jkxqi";
import { AutoResponse } from './types';

// Autor de la regla — mock para el prototipo; el producto real usa el creador real.
const RULE_AUTHOR = 'Ana Torres';
// Etiqueta de "última ejecución" simulada, estable por regla (sin backend en el prototipo).
function lastRunLabel(rule: AutoResponse): string {
  const n = ((rule.id.charCodeAt(0) || 5) + rule.id.length) % 8 + 1;
  return `hace ${n} h`;
}

interface Props {
  rules: AutoResponse[];
  onNew: () => void;
  onEdit: (id: string) => void;
  onLog: (id: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSchedule: (id: string, iso: string) => void;
  onCancelSchedule: (id: string) => void;
  onBack: () => void;
  onImportJson?: () => void;
  onExportJson?: () => void;
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

function AgregarReglaButton({ onNew, onImportJson }: { onNew: () => void; onImportJson?: () => void }) {
  const items: MenuProps['items'] = [
    {
      key: 'new',
      icon: <BiEditAlt />,
      label: 'Desde cero',
      onClick: onNew,
    },
    {
      key: 'import',
      icon: <BiImport />,
      label: 'Importar desde JSON',
      onClick: onImportJson,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <Button type="primary" icon={<BiPlus />}>
        Nueva regla
      </Button>
    </Dropdown>
  );
}

// ─── Rule card ────────────────────────────────────────────────────────────────

// Separador de 4px entre datos del subtítulo (como en el diseño).
const MetaDot = () => <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(0,0,0,0.25)', display: 'inline-block', flexShrink: 0 }} />;

function RuleCard({ rule, onEdit, onLog, onDelete, onToggle, onDuplicate }: {
  rule: AutoResponse; onEdit: () => void; onLog: () => void; onDelete: () => void; onToggle: () => void; onDuplicate: () => void;
}) {
  return (
    <div
      className="bg-white border border-[#f0f0f0] border-solid rounded-[8px] w-full transition-shadow duration-150 hover:shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)]"
      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16 }}
    >
      {/* Avatar dorado con ícono de cerebro (bx-brain) */}
      <div
        className="flex items-center justify-center shrink-0 size-[36px] rounded-[8px]"
        style={{ background: '#fffbe6', border: '1px solid #d4b106', color: '#d4b106' }}
      >
        <BiBrain style={{ fontSize: 22 }} />
      </div>

      {/* Nombre + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {rule.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap', fontFamily: "'Roboto', sans-serif", fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
          <span><span style={{ fontWeight: 500 }}>Creado por: </span>{RULE_AUTHOR}</span>
          {rule.published && (
            <>
              <MetaDot />
              <span><span style={{ fontWeight: 500 }}>Últ. ejecución:</span> {lastRunLabel(rule)}</span>
              <MetaDot />
              <span onClick={onLog} style={{ color: '#1890ff', cursor: 'pointer' }}>Ver ejecuciones</span>
            </>
          )}
        </div>
      </div>

      {/* Estado: Borrador (pill gris) o toggle verde ACTIVO */}
      {!rule.published ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f5f5f5', borderRadius: 16, padding: '4px 8px', flexShrink: 0 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', display: 'inline-block' }} />
          <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>Borrador</span>
        </span>
      ) : (
        <ConfigProvider theme={{ components: { Switch: { colorPrimary: '#52c41a', colorPrimaryHover: '#73d13d' } } }}>
          {rule.active ? (
            <Popconfirm
              title="¿Desactivar esta regla?"
              description="Dejará de enviar correos hasta que la vuelvas a activar."
              okText="Sí, desactivar" cancelText="Cancelar"
              onConfirm={onToggle}
              okButtonProps={{ size: 'middle' }} cancelButtonProps={{ size: 'middle' }}
            >
              <Switch checked checkedChildren="ACTIVO" unCheckedChildren="INACTIVO" style={{ flexShrink: 0 }} />
            </Popconfirm>
          ) : (
            <Switch checked={false} checkedChildren="ACTIVO" unCheckedChildren="INACTIVO" onChange={onToggle} style={{ flexShrink: 0 }} />
          )}
        </ConfigProvider>
      )}

      {/* Acciones: Duplicar (publicadas) · Editar · Eliminar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {rule.published && <Button icon={<BiCopy />} onClick={onDuplicate} aria-label="Duplicar" title="Duplicar" />}
        <Button icon={<BiEditAlt />} onClick={onEdit} aria-label="Editar" title="Editar" />
        <Popconfirm
          title="¿Eliminar esta regla?"
          description="Se perderá su configuración y su plantilla de correo."
          okText="Sí, eliminar" cancelText="Cancelar"
          okButtonProps={{ danger: true, size: 'middle' }} cancelButtonProps={{ size: 'middle' }}
          onConfirm={onDelete}
        >
          <Button danger icon={<BiTrash />} aria-label="Eliminar" title="Eliminar" />
        </Popconfirm>
      </div>
    </div>
  );
}

// ─── ListPage ─────────────────────────────────────────────────────────────────

export default function ListPage({ rules, onNew, onEdit, onLog, onDelete, onToggle, onDuplicate, onBack, onImportJson, onExportJson }: Props) {
  const goToFirstRuleLog = () => { if (rules[0]) onLog(rules[0].id); };

  return (
    <div className="bg-white flex-[1_0_0] min-h-px relative w-full z-[1]">
      <div className="content-stretch flex flex-col gap-[32px] isolate items-start pb-[24px] pt-[32px] px-[32px] relative size-full">

        {/* Sub-header row */}
        <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-full z-[2]">

          {/* Breadcrumb + description */}
          <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px relative">
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
              <div className="flex items-center justify-center mx-[8px] relative shrink-0">
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
          <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
            {rules.length > 0 && (
              <AgregarReglaButton onNew={onNew} onImportJson={onImportJson} />
            )}
            {rules.length > 0 && onExportJson && (
              <button
                onClick={onExportJson}
                className="bg-white border border-[#d9d9d9] border-solid content-stretch cursor-pointer drop-shadow-[0px_2px_0px_rgba(0,0,0,0.02)] flex gap-[8px] items-center justify-center px-[8px] py-[12px] relative rounded-[8px] shrink-0"
              >
                <BiDownload style={{ fontSize: 14 }} />
                <span
                  className="[word-break:break-word] font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.85)] text-center whitespace-nowrap"
                  style={{ fontVariationSettings: '"wdth" 100' }}
                >
                  Descargar reglas
                </span>
              </button>
            )}
            {/* Ver logs */}
            <button
              onClick={goToFirstRuleLog}
              className="bg-white border border-[#d9d9d9] border-solid content-stretch cursor-pointer drop-shadow-[0px_2px_0px_rgba(0,0,0,0.02)] flex gap-[8px] items-center justify-center px-[8px] py-[12px] relative rounded-[8px] shrink-0"
            >
              <BiHistory style={{ fontSize: 14 }} />
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
            <div className="flex flex-col gap-[24px] items-center py-[80px] w-full">
                <IdeasFlowIllustration />

                {/* Title + subtitle */}
                <div
                  className="[word-break:break-word] content-stretch flex flex-col gap-[12px] items-center justify-center leading-[0] relative shrink-0 text-[rgba(0,0,0,0.45)] text-center w-full"
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
                <AgregarReglaButton onNew={onNew} onImportJson={onImportJson} />
            </div>
          </div>
        ) : (
          /* Rules list */
          <div className="flex flex-col gap-[16px] w-full">
            {rules.map(rule => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onEdit={() => onEdit(rule.id)}
                onLog={() => onLog(rule.id)}
                onDelete={() => onDelete(rule.id)}
                onToggle={() => onToggle(rule.id)}
                onDuplicate={() => onDuplicate(rule.id)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
