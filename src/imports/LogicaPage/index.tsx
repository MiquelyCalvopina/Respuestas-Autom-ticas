// Shell de la pantalla Lógica (node-id 1605:52900 del archivo Figma
// "Ajustes 121-151"), con "Lógica" activo en el stepper. El rail, el topbar y
// el stepper son los mismos assets que src/imports/BoostersPage/index.tsx
// (mismo archivo de Figma, mismo chrome) — se reutilizan.
//
// El contenido interactivo (sidebar de reglas + canvas + barra de destino) vive
// en el módulo src/app/components/logica, que este shell renderiza como Step
// Content — igual que BoostersPage renderiza RespuestasAutomaticas dentro suyo.
import svgPaths from '../BoostersPage/svg-6wl0e5bdid';
import imgLogo from '../BoostersPage/c1a59b77699b503cff1b1dc54942368b615932ea.png';
import imgImageAvatar from '../BoostersPage/03428a1137072a2d2c0da0ea370ebfd6aabfe00f.png';
import { ESTUDIO } from '@/app/data/estudio';
import LogicaModule from '@/app/components/logica/index';

// ─── Rail (idéntico a BoostersPage/index.tsx) ────────────────────────────────

function Logo() {
  return (
    <div className="flex-[1_0_0] h-[40px] min-w-px bg-white overflow-hidden relative rounded-[4px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.15)]" data-name="Logo">
      <img alt="" className="absolute h-[75.95%] left-[19.21%] max-w-none top-[12.29%] w-[58.54%]" src={imgLogo} />
    </div>
  );
}

function MainSpace() {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0 w-[40px]" data-name="Container">
      <Logo />
    </div>
  );
}

function IconIn({ path, opacity = 0.45, fill = 'black' }: { path: string; opacity?: number; fill?: string }) {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={path} fill={`var(--fill-0, ${fill})`} fillOpacity={fill === 'black' ? opacity : undefined} id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Home() {
  return (
    <button type="button" className="content-stretch flex h-[38px] items-center justify-center px-[10px] relative rounded-[8px] shrink-0 w-[40px] cursor-pointer transition-colors duration-150 ease-out active:duration-100 hover:bg-black/5 active:bg-black/10" data-name="Home">
      <IconIn path={svgPaths.p6f26c80} />
    </button>
  );
}

function Studies() {
  // Item de menú activo — igual convención que "Module 1" en BoostersPage.
  return (
    <button type="button" className="bg-white border border-[#d9d9d9] border-solid relative rounded-[8px] shrink-0 size-[40px] cursor-pointer transition-colors duration-150 ease-out active:duration-100 hover:bg-black/5 active:bg-black/10" data-name="Module 1">
      <div className="content-stretch flex flex-col items-center justify-center px-[10px] relative size-full">
        <div className="overflow-clip relative shrink-0 size-[18px]" data-name="bx-book">
          <div className="absolute inset-[8.33%_12.5%]">
            <IconIn path={svgPaths.p10771880} fill="#1890FF" />
          </div>
        </div>
      </div>
    </button>
  );
}

function PrincipalItems() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] h-[400px] items-center px-[16px] relative shrink-0 w-[72px]" data-name="Principal Items">
      <MainSpace />
      <Home />
      <Studies />
    </div>
  );
}

function Profile() {
  return (
    <div className="content-stretch flex flex-col h-[40px] items-start overflow-clip px-[4px] py-[8px] relative rounded-[26843500px] shrink-0 w-[32px]" data-name="Profile">
      <div className="h-[24px] relative shrink-0 w-full" data-name="Image (Avatar)">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImageAvatar} />
      </div>
    </div>
  );
}

function BottomItems() {
  return (
    <div className="h-[187px] relative shrink-0 w-[72px]" data-name="Bottom Items">
      <div className="content-stretch flex flex-col gap-[8px] items-center px-[16px] relative size-full">
        <button type="button" className="content-stretch flex h-[38px] items-center justify-center relative rounded-[8px] shrink-0 w-[40px] cursor-pointer transition-colors duration-150 ease-out active:duration-100 hover:bg-black/5 active:bg-black/10" data-name="Settings">
          <IconIn path={svgPaths.pc894400} fill="#1890FF" />
        </button>
        <button type="button" className="content-stretch flex h-[38px] items-center justify-center relative rounded-[8px] shrink-0 w-[40px] cursor-pointer transition-colors duration-150 ease-out active:duration-100 hover:bg-black/5 active:bg-black/10" data-name="Link">
          <IconIn path={svgPaths.p2d89f300} />
        </button>
        <button type="button" className="content-stretch flex h-[38px] items-center justify-center px-[10px] relative rounded-[8px] shrink-0 w-[40px] cursor-pointer transition-colors duration-150 ease-out active:duration-100 hover:bg-black/5 active:bg-black/10" data-name="Language">
          <IconIn path={svgPaths.p352f980} />
        </button>
        <Profile />
      </div>
    </div>
  );
}

function Rail() {
  return (
    <div className="bg-[#fafafa] content-stretch flex flex-col items-start justify-between h-full py-[10px] relative shrink-0 w-[72px]" data-name="Pages Vertical Menu">
      <PrincipalItems />
      <BottomItems />
    </div>
  );
}

// ─── Topbar: breadcrumb + ACTIVO + Studio Stepper + Tools ────────────────────

function Breadcrumb() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink min-w-0" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-name="nz-breadcrumb">
        <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1890ff] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
          <p className="leading-[22px]">Miqui</p>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-start py-[4px] relative shrink-0" data-name="Container">
        <div className="flex items-center justify-center relative shrink-0">
          <div className="-scale-y-100 flex-none">
            <IconIn path={svgPaths.p6eb1c00} opacity={0.85} />
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-start overflow-clip relative shrink min-w-0" data-name="Container">
        <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.85)] truncate" style={{ fontVariationSettings: '"wdth" 100' }}>
          <p className="leading-[24px] truncate">{ESTUDIO.nombre}</p>
        </div>
      </div>
    </div>
  );
}

function EditPencil() {
  return (
    <button type="button" className="content-stretch flex flex-col items-start relative shrink-0 w-[18px] cursor-pointer transition-opacity duration-150 ease-out active:duration-100 hover:opacity-60" data-name="Container">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <div className="h-[17.6px] relative w-[18px]" data-name="Icon">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 17.6">
              <path d={svgPaths.p9b46bf0} fill="var(--fill-0, black)" fillOpacity="0.85" id="Vector" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}

function ActivoSwitch() {
  return (
    <button type="button" className="content-stretch flex flex-col items-start pt-[1.3px] relative shrink-0 cursor-pointer" data-name="nz-switch">
      <div className="bg-[#51c11a] h-[22px] max-w-[86px] min-w-[86px] relative rounded-[100px] shrink-0 w-[86px] transition-opacity duration-150 ease-out active:duration-100 hover:opacity-90" data-name="Button">
        <div className="absolute content-stretch flex flex-col items-center left-[7px] pb-[0.6px] pl-[6.17px] pr-[6.18px] top-[-0.6px]">
          <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-center text-white whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
            <p className="leading-[22px]">ACTIVO</p>
          </div>
        </div>
        <div className="absolute bg-white left-[66px] rounded-[9px] shadow-[0px_2px_4px_0px_rgba(0,35,11,0.2)] size-[18px] top-[2px]" />
      </div>
    </button>
  );
}

const STEPS = ['Estructura', 'Look&Feel', 'Variables', 'Lógica', 'Potenciadores', 'Envíos'];

function StudioStepper() {
  // flex-1 + min-w-0 para que este bloque pueda achicarse dentro del topbar en
  // vez de forzar su ancho natural sobre breadcrumb/tools (causa del overlap
  // en tablet); overflow-x-auto para que, si aun así no alcanza el espacio,
  // se pueda desplazar en vez de solaparse con lo demás.
  return (
    <div className="flex flex-1 min-w-0 h-[59.2px] items-center justify-center overflow-x-auto" data-name="Studio Stepper">
      <div className="content-stretch flex items-center h-full">
        {STEPS.map((step, i) => {
          const active = step === 'Lógica';
          return (
            <div key={step} className="content-stretch flex items-center h-full shrink-0">
              <div
                className={
                  active
                    ? "border-[#1890ff] border-b-[0.8px] border-solid content-stretch flex h-full items-center pb-[0.8px] px-[12px] relative shrink-0 cursor-pointer transition-colors duration-150 ease-out active:duration-100 hover:bg-black/5"
                    : "content-stretch flex h-full items-center px-[12px] relative shrink-0 cursor-pointer transition-colors duration-150 ease-out active:duration-100 hover:bg-black/5"
                }
                data-name="Step"
              >
                <div
                  className={`flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] whitespace-nowrap ${active ? 'text-[#1890ff]' : 'text-[rgba(0,0,0,0.45)]'}`}
                  style={{ fontVariationSettings: '"wdth" 100' }}
                >
                  <p className="leading-[20px]">{step}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Div">
                  <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[18px] text-[rgba(0,0,0,0.06)] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
                    <p className="leading-[28px]">|</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ToolBorder({ path, wide }: { path: string; wide?: boolean }) {
  // icon-button-circle Medium: caja 32px (ya coincidía), ícono 16px centrado
  // (antes 14x13.6px, tamaño nativo del asset de Figma) — spec "Controles".
  return (
    <button
      type="button"
      className="border border-[#f0f0f0] border-solid content-stretch flex items-center justify-center p-[0.8px] relative rounded-[9999px] shrink-0 size-[32px] cursor-pointer transition-colors duration-150 ease-out active:duration-100 hover:bg-black/5 active:bg-black/10"
      data-name="Border"
    >
      <div className="flex items-center justify-center relative shrink-0">
        <div className={wide ? undefined : '-scale-y-100 flex-none'}>
          <div className="size-[16px] relative" data-name="Icon">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 13.6">
              <path d={path} fill="var(--fill-0, black)" fillOpacity="0.85" id="Vector" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}

function Tools() {
  // Ancho de contenido (antes fijo en 217.2px, el espacio sobrante que le
  // asignaba Figma) — así no le resta espacio al stepper en viewports angostos.
  return (
    <div className="content-stretch flex items-center justify-end relative shrink-0" data-name="Tools">
      <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
        <ToolBorder path={svgPaths.p27e78730} />
        <ToolBorder path={svgPaths.p2e358200} />
        <ToolBorder path={svgPaths.p30d46a00} wide />
      </div>
    </div>
  );
}

function HorizontalNavigation() {
  return (
    <div className="bg-white border-b-[0.8px] border-[rgba(0,0,0,0.06)] border-solid content-stretch flex items-center justify-between gap-3 px-[24px] relative shrink-0 w-full z-[2]" data-name="HorizontalNavigation">
      <div className="content-stretch flex items-center gap-2 relative shrink min-w-0 max-w-[362px]" data-name="Name + Back button">
        <Breadcrumb />
        <EditPencil />
        <ActivoSwitch />
      </div>
      <StudioStepper />
      <Tools />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function PageContent() {
  return (
    <div className="bg-white border-[#f0f0f0] border-l border-t border-solid content-stretch flex flex-col h-full isolate items-start overflow-hidden rounded-tl-[20px] w-full" data-name="Page content">
      <HorizontalNavigation />
      {/* Contenido interactivo del módulo Lógica (sidebar + canvas + barra destino) */}
      <LogicaModule />
    </div>
  );
}

export default function LogicaPage() {
  return (
    <div className="bg-[#fafafa] content-stretch flex items-start relative size-full" data-name="Senders page">
      <Rail />
      <div className="flex-[1_0_0] h-full min-w-px relative pt-[16px] pl-0" data-name="Body">
        <PageContent />
      </div>
    </div>
  );
}
