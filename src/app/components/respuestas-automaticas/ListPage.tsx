import { Dropdown, Button } from 'antd';
import { PlusOutlined, DownOutlined, FormOutlined, ImportOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import svgPaths from "@/imports/BoostersPage-1/svg-hnea2jkxqi";

interface Props {
  onNew: () => void;
  onLog: () => void;
  onCopyFromStudy?: () => void;
}

// ─── Illustration ─────────────────────────────────────────────────────────────

function IdeasFlowIllustration() {
  return (
    <div className="h-[126px] overflow-clip relative shrink-0 w-[210px]">
      <div className="absolute inset-[0.11%_0.06%_0.55%_0]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 209.878 125.164">
          <g id="Group">
            <path d={svgPaths.p199fd80} fill="#BFBFBF" />
            <path d={svgPaths.p354a9a00} fill="#BFBFBF" />
            <path d={svgPaths.p2f113400} fill="#BFBFBF" />
            <path d={svgPaths.p15a1c8c0} fill="#BFBFBF" />
            <path d={svgPaths.p21183480} fill="#BFBFBF" />
            <path d={svgPaths.paecd500} fill="#F0F0F0" />
            <path d={svgPaths.p3f9bbe00} fill="white" />
            <path d={svgPaths.p21b49430} fill="white" />
            <path d={svgPaths.p25c6ea00} fill="white" />
            <g>
              <path d={svgPaths.p3b4ad600} fill="#F0F0F0" />
              <path d={svgPaths.p241f5ff0} fill="#BFBFBF" />
              <path d={svgPaths.paa44c00} fill="#BFBFBF" />
              <path d={svgPaths.p1352ee80} fill="#BFBFBF" />
            </g>
            <g>
              <path d={svgPaths.pc446680} fill="#F0F0F0" />
              <path d={svgPaths.p75f7880} fill="#BFBFBF" />
              <path d={svgPaths.p9846480} fill="#BFBFBF" />
              <path d={svgPaths.p1407a000} fill="#BFBFBF" />
            </g>
            <g>
              <path d={svgPaths.p8199a80} fill="#F0F0F0" />
              <g>
                <path d={svgPaths.p10915400} fill="#FFFBE6" />
                <path d={svgPaths.p25476a00} fill="#FAAD14" />
                <path d={svgPaths.p115fab00} fill="#FAAD14" />
                <path d={svgPaths.p17ed5080} fill="#FAAD14" />
                <path d={svgPaths.p2e13fa00} fill="#FAAD14" />
                <path d={svgPaths.p24b4f480} fill="#FAAD14" />
                <path d={svgPaths.p3c3f6a00} fill="#FAAD14" />
                <path d={svgPaths.p3dbdc000} fill="#FAAD14" />
                <path d={svgPaths.p3453f000} fill="#FAAD14" />
              </g>
            </g>
            <path d={svgPaths.p1aed9f40} fill="#F0F0F0" />
            <path d={svgPaths.p2b8f3ff0} fill="#BFBFBF" />
            <path d={svgPaths.p3d65bef0} fill="#BFBFBF" />
            <path d={svgPaths.p396c0b00} fill="#F0F0F0" />
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

// ─── ListPage ─────────────────────────────────────────────────────────────────

export default function ListPage({ onNew, onLog, onCopyFromStudy }: Props) {
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
                onClick={onLog}
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
            {/* Ver logs */}
            <button
              onClick={onLog}
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

        {/* Empty state */}
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

      </div>
    </div>
  );
}
