// Réplica del node-id 1605:52900 (archivo Figma "Ajustes 121-151") con el paso
// "Lógica" activo en el stepper en vez de "Potenciadores". El rail, el topbar,
// el stepper y los íconos son EXACTAMENTE los mismos assets que ya usa
// src/imports/BoostersPage/index.tsx (mismo archivo de Figma, mismo componente
// de chrome) — se reutilizan en vez de reconstruirse.
//
// Dos assets de esta pantalla (la ilustración del estado vacío y el ícono
// bx-link de las despedidas sin usar) no se pudieron descargar en este
// entorno: el proxy de red del sandbox bloquea salidas directas a figma.com
// (confirmado con `curl` contra la URL del asset, HTTP 000 / connection
// reset). Se sustituyeron por un ícono equivalente de @ant-design/icons y un
// SVG inline simple, marcados abajo con TODO — reemplazar por el asset real
// de Figma en un entorno con acceso.
import { LinkOutlined } from '@ant-design/icons';
import svgPaths from '../BoostersPage/svg-6wl0e5bdid';
import imgLogo from '../BoostersPage/c1a59b77699b503cff1b1dc54942368b615932ea.png';
import imgImageAvatar from '../BoostersPage/03428a1137072a2d2c0da0ea370ebfd6aabfe00f.png';
import { ESTUDIO, FLUJO, DESPEDIDAS } from '@/app/data/estudio';

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

// ─── Logics Sidebar ───────────────────────────────────────────────────────────

function SectionHeader() {
  return (
    <div className="border-[#f0f0f0] border-b border-solid content-stretch flex gap-[16px] items-center justify-center px-[12px] py-[8px] relative shrink-0 w-full" data-name="Section Header">
      <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[0] min-w-px relative">
        <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center relative shrink-0 text-[14px] text-[rgba(0,0,0,0.85)] w-full" style={{ fontVariationSettings: '"wdth" 100' }}>
          <p className="leading-[normal]">Reglas de lógica del estudio</p>
        </div>
        <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center relative shrink-0 text-[12px] text-[rgba(0,0,0,0.45)] w-full" style={{ fontVariationSettings: '"wdth" 100' }}>
          <p className="leading-[normal]">Todavía no has creado ninguna.</p>
        </div>
      </div>
      {/* Botón Medium: padding py-7/px-8 confirmado en "Controles — specs confirmadas" (antes py-8/px-9, valor crudo de Figma) */}
      <button
        type="button"
        className="bg-[#1890ff] border border-[#1890ff] border-solid content-stretch flex gap-[4px] items-center justify-center overflow-clip px-[8px] py-[7px] relative rounded-[8px] shadow-[0px_2px_0px_0px_rgba(0,0,0,0.04)] shrink-0 cursor-pointer transition-colors duration-150 ease-out active:duration-100 hover:bg-[#40a9ff] active:bg-[#096dd9]"
        data-name="Button"
      >
        <div className="relative shrink-0">
          <div className="overflow-clip relative shrink-0 size-[14px]" data-name="bx-plus">
            <div className="absolute inset-[20.83%]">
              <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 10.5">
                <path d={svgPaths.p3fb923b0} fill="var(--fill-0, white)" id="icon" />
              </svg>
            </div>
          </div>
        </div>
        <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
          Crear regla
        </p>
      </button>
    </div>
  );
}

// TODO: reemplazar por el SVG real de Figma (node 1605:53215) — no se pudo
// descargar en este entorno (proxy bloquea figma.com). Sustituto equivalente.
function EmptyStateIllustration() {
  return (
    <svg width="116" height="117" viewBox="0 0 116 117" fill="none">
      <rect x="18" y="24" width="30" height="20" rx="4" stroke="#D9D9D9" strokeWidth="2" />
      <rect x="43" y="16" width="30" height="20" rx="4" stroke="#D9D9D9" strokeWidth="2" />
      <rect x="68" y="24" width="30" height="20" rx="4" stroke="#D9D9D9" strokeWidth="2" />
      <path d="M40 60 C40 90, 76 90, 76 60 L76 100 L58 116 L40 100 Z" stroke="#D9D9D9" strokeWidth="2" fill="none" />
    </svg>
  );
}

function SectionContent() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[12px] items-center justify-center min-h-px p-[24px] relative w-full" data-name="Section content">
      <div className="h-[117px] relative shrink-0 w-[116px]" data-name="SVG">
        <EmptyStateIllustration />
      </div>
      <div className="content-stretch flex flex-col items-start leading-[0] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.55)] text-center w-full">
        <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center relative shrink-0 w-full" style={{ fontVariationSettings: '"wdth" 100' }}>
          <p className="leading-[24px]">Aún no hay reglas en este estudio.</p>
        </div>
        <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center relative shrink-0 w-full" style={{ fontVariationSettings: '"wdth" 100' }}>
          <p className="leading-[24px]">Selecciona una pregunta del diagrama, o usa Crear regla arriba, para configurar la primera.</p>
        </div>
      </div>
    </div>
  );
}

function LogicsSidebar() {
  // Ancho fijo (576px) solo desde `lg` — lado a lado con el diagrama, como en
  // Figma. Debajo de `lg` (tablets) se apila arriba, a todo el ancho, y el
  // scroll de la columna completa lo maneja Step Content — no duplica scroll.
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full min-h-[280px] border-b border-[#f0f0f0] xl:w-[576px] xl:h-full xl:border-b-0"
      data-name="Logics Sidebar"
    >
      <SectionHeader />
      <SectionContent />
    </div>
  );
}

// ─── Survey visual hint space — diagrama del flujo real del estudio ──────────

function FlowNodeBox({ label }: { label: string }) {
  return (
    <div className="bg-white border border-[#f0f0f0] border-solid content-stretch flex flex-col items-center justify-center min-w-[90px] overflow-clip px-[12px] py-[8px] relative rounded-[8px] shrink-0" data-name="Container">
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.85)] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[normal]">{label}</p>
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="h-[25px] relative shrink-0 w-0" data-name="Connector">
      <div className="absolute inset-[0_-0.5px] border-l border-[#f0f0f0] h-full" />
    </div>
  );
}

function flujoLabel(nodo: (typeof FLUJO)[number]) {
  return nodo.label;
}

function GraphicsDocument() {
  return (
    <div className="content-stretch flex flex-col items-center max-w-[277px] overflow-clip relative shrink-0 w-full" data-name="Graphics-document document">
      {FLUJO.map((nodo, i) => (
        <div key={nodo.id} className="contents">
          <FlowNodeBox label={flujoLabel(nodo)} />
          {i < FLUJO.length - 1 && <Connector />}
        </div>
      ))}
    </div>
  );
}

// TODO: el ícono "bx-link" real de Figma (node 1617:59105) no se pudo
// descargar en este entorno (proxy bloquea figma.com). Sustituto: LinkOutlined.
function DespedidaSinUsarPill({ nombre }: { nombre: string }) {
  return (
    <div className="bg-[#f5f5f5] border border-[#d9d9d9] border-solid relative rounded-[8px] shrink-0 w-full" data-name="Background+Border">
      <div className="flex gap-[8px] items-center px-[8px] py-[4px] relative size-full">
        <div className="bg-[#ffccc7] max-h-[20px] max-w-[20px] min-h-[20px] min-w-[20px] relative rounded-[9999px] shrink-0 flex items-center justify-center">
          <LinkOutlined style={{ fontSize: 10, color: '#a8071a' }} />
        </div>
        <div className="relative min-w-0">
          <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.85)]" style={{ fontVariationSettings: '"wdth" 100' }}>
            <p className="leading-[22px]">{nombre}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DespedidasSinUsarPanel() {
  const sinUsar = DESPEDIDAS.filter(d => !d.usada);
  if (sinUsar.length === 0) return null;
  // Posición relativa a su contenedor (antes left/top fijos en px, que en un
  // "Survey visual hint space" angosto quedaban más anchos que el propio
  // contenedor y se salían por la derecha) — clamp con max-w para que nunca
  // exceda el ancho disponible, sea cual sea el viewport.
  return (
    <div className="absolute left-4 top-4 max-w-[calc(100%-32px)]" data-name="Container">
      <div className="border border-[#d9d9d9] border-solid content-stretch flex flex-col gap-[12px] items-start p-[12px] relative rounded-[8px] shrink-0 w-[169px] max-w-full" data-name="Border">
        <div className="relative shrink-0 w-full">
          <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.85)] w-full" style={{ fontVariationSettings: '"wdth" 100' }}>
            <p className="leading-[22px] mb-0">Despedidas sin usar</p>
            <p className="leading-[22px]">en el flujo del estudio.</p>
          </div>
        </div>
        {sinUsar.map(d => <DespedidaSinUsarPill key={d.id} nombre={d.nombre} />)}
      </div>
    </div>
  );
}

function SurveyVisualHintSpace() {
  // Borde izquierdo y h-full solo desde `lg` (cuando va lado a lado con el
  // sidebar); apilado, se deja crecer con su contenido y el scroll de toda
  // la columna lo maneja Step Content.
  return (
    <div
      className="border-[#f0f0f0] border-solid content-stretch flex flex-1 gap-[16px] items-start justify-center min-w-0 pl-[24px] pr-[24px] py-[16px] relative w-full xl:h-full xl:border-l-[0.8px] xl:w-auto"
      data-name="Survey visual hint space"
    >
      <div className="flex-1 min-w-0 relative">
        <div className="flex flex-col items-center pb-[8px] relative size-full">
          <GraphicsDocument />
        </div>
      </div>
      <DespedidasSinUsarPanel />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function StepContent() {
  // Apilado (columna) en tablets, lado a lado desde `lg` (1024px) — evita el
  // solapamiento del sidebar de 576px fijo contra el diagrama en viewports
  // angostos (tablets verticales y algunas horizontales).
  return (
    <div className="content-stretch flex flex-col xl:flex-row flex-1 items-start min-h-0 relative w-full z-[1] overflow-y-auto xl:overflow-visible" data-name="Step Content">
      <LogicsSidebar />
      <SurveyVisualHintSpace />
    </div>
  );
}

function PageContent() {
  return (
    <div className="bg-white border-[#f0f0f0] border-l border-t border-solid content-stretch flex flex-col h-full isolate items-start overflow-clip rounded-tl-[20px] w-full" data-name="Page content">
      <HorizontalNavigation />
      <StepContent />
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
