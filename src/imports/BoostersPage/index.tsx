import { createContext, useContext, useState } from "react";
import svgPaths from "./svg-6wl0e5bdid";
import imgLogo from "./c1a59b77699b503cff1b1dc54942368b615932ea.png";
import imgImageAvatar from "./03428a1137072a2d2c0da0ea370ebfd6aabfe00f.png";
import RespuestasAutomaticas from "@/app/components/respuestas-automaticas/index";

type ActiveContent = 'boosters-list' | 'respuestas-automaticas';

const BoostersCtx = createContext<{
  activeContent: ActiveContent;
  setActiveContent: (c: ActiveContent) => void;
}>({ activeContent: 'boosters-list', setActiveContent: () => {} });

function Logo() {
  return (
    <div
      className="flex-[1_0_0] h-[40px] min-w-px bg-white overflow-hidden relative rounded-[4px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.15)]"
      data-name="Logo"
    >
      <img alt="" className="absolute h-[75.95%] left-[19.21%] max-w-none top-[12.29%] w-[58.54%]" src={imgLogo} />
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex items-center py-[16px] relative shrink-0 w-[40px]" data-name="Container">
      <Logo />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p6f26c80} fill="var(--fill-0, black)" fillOpacity="0.45" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Home() {
  return (
    <div className="content-stretch flex h-[38px] items-center justify-center px-[10px] relative rounded-[8px] shrink-0 w-[40px]" data-name="Home">
      <Icon />
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p10771880} fill="var(--fill-0, black)" fillOpacity="0.45" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Studies() {
  return (
    <div className="content-stretch flex h-[38px] items-center justify-center px-[10px] relative rounded-[8px] shrink-0 w-[40px]" data-name="Studies">
      <Icon1 />
    </div>
  );
}

function PrincipalItems() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] h-[400px] items-center px-[16px] relative shrink-0 w-[72px]" data-name="Principal Items">
      <Container />
      <Home />
      <Studies />
    </div>
  );
}

function ImageAvatar() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Image (Avatar)">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImageAvatar} />
    </div>
  );
}

function Profile() {
  return (
    <div className="absolute content-stretch flex flex-col h-[40px] items-start left-[20px] overflow-clip px-[4px] py-[8px] rounded-[26843500px] top-[147px] w-[32px]" data-name="Profile">
      <ImageAvatar />
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.pc894400} fill="var(--fill-0, #1890FF)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Settings() {
  return (
    <div
      className="absolute bg-white border-[#d9d9d9] border-[0.8px] border-solid content-stretch flex h-[38px] items-center justify-center left-[16px] rounded-[8px] top-[9px] w-[40px]"
      data-name="Settings"
    >
      <Icon2 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="h-[16.675px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.675 16.675">
        <path d={svgPaths.p2d89f300} fill="var(--fill-0, black)" fillOpacity="0.45" id="Vector" />
      </svg>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[16.675px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start relative size-full">
        <Icon3 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[10px] overflow-clip pl-[1.663px] pr-[1.662px] pt-[1.662px] size-[20px] top-[9px]" data-name="Container">
      <Container3 />
    </div>
  );
}

function Link() {
  return (
    <div className="absolute content-stretch flex flex-col h-[38px] items-start left-[16px] overflow-clip relative rounded-[8px] top-[55px] w-[40px]" data-name="Link">
      <Container2 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p352f980} fill="var(--fill-0, black)" fillOpacity="0.45" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Language() {
  return (
    <div className="absolute content-stretch flex h-[38px] items-center justify-center left-[16px] overflow-clip px-[10px] py-[0.8px] relative rounded-[8px] top-[101px] w-[40px]" data-name="Language">
      <Icon4 />
    </div>
  );
}

function BottomItems() {
  return (
    <div className="h-[187px] relative shrink-0 w-[72px]" data-name="Bottom Items">
      <div className="absolute bg-[#f0f0f0] h-px left-[20px] top-0 w-[32px]" data-name="Container" />
      <Profile />
      <Settings />
      <Link />
      <Language />
    </div>
  );
}

function PagesVerticalMenu() {
  return (
    <div
      className="bg-[#fafafa] content-stretch flex flex-col items-start justify-between h-full py-[10px] relative shrink-0 w-[72px] overflow-y-auto"
      data-name="Pages Vertical Menu"
    >
      <PrincipalItems />
      <BottomItems />
    </div>
  );
}

function NzBreadcrumb() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-name="nz-breadcrumb">
      <div className="[word-break:break-word] flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1890ff] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[22px]">Miqui</p>
      </div>
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p6eb1c00} fill="var(--fill-0, black)" fillOpacity="0.85" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Container">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <Icon5 />
        </div>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start py-[4px] relative shrink-0" data-name="Container">
      <Container7 />
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.85)] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[24px]">Pruebas Deuda Tecnica</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[238.94px]" data-name="Container">
      <NzBreadcrumb />
      <Container6 />
      <Container8 />
    </div>
  );
}

function Icon6() {
  return (
    <div className="h-[17.6px] relative w-[18px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 17.6">
        <g id="Icon">
          <path d={svgPaths.p9b46bf0} fill="var(--fill-0, black)" fillOpacity="0.85" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Container">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <Icon6 />
        </div>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[18px]" data-name="Container">
      <Container10 />
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-[7px] pb-[0.6px] pl-[6.17px] pr-[6.18px] top-[-0.6px]" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-center text-white whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[22px]">ACTIVO</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div
      className="absolute bg-white left-[66px] rounded-[9px] shadow-[0px_2px_4px_0px_rgba(0,35,11,0.2)] size-[18px] top-[2px]"
      data-name="Container"
    />
  );
}

function Button() {
  return (
    <div className="bg-[#51c11a] h-[22px] max-w-[86px] min-w-[86px] relative rounded-[100px] shrink-0 w-[86px]" data-name="Button">
      <Container11 />
      <Container12 />
    </div>
  );
}

function NzSwitch() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[1.3px] relative shrink-0" data-name="nz-switch">
      <Button />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-[362px]" data-name="Container">
      <Container5 />
      <Container9 />
      <NzSwitch />
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex h-full items-center px-[12px] relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.45)] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[20px]">Estructura</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[18px] text-[rgba(0,0,0,0.06)] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[28px]">|</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex h-full items-center px-[12px] relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.45)] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[20px]">{`Look&Feel`}</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[18px] text-[rgba(0,0,0,0.06)] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[28px]">|</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex h-full items-center px-[12px] relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.45)] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[20px]">Variables</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[18px] text-[rgba(0,0,0,0.06)] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[28px]">|</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex h-full items-center px-[12px] relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.45)] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[20px]">Lógica</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[18px] text-[rgba(0,0,0,0.06)] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[28px]">|</p>
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="border-b-[0.8px] border-[#1890ff] border-solid h-full relative shrink-0" data-name="HorizontalBorder">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center pb-[0.8px] px-[12px] relative size-full">
          <div className="[word-break:break-word] flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1890ff] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
            <p className="leading-[20px]">Potenciadores</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[18px] text-[rgba(0,0,0,0.06)] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[28px]">|</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex h-full items-center px-[12px] relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.45)] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[20px]">Envíos</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-[1_0_0] h-[59.2px] items-center justify-center min-w-px relative" data-name="Container">
      <Container14 />
      <Container15 />
      <Container16 />
      <Container17 />
      <Container18 />
      <Container19 />
      <Container20 />
      <Container21 />
      <HorizontalBorder />
      <Container22 />
      <Container23 />
    </div>
  );
}

function Icon7() {
  return (
    <div className="h-[13.6px] relative w-[14px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 13.6">
        <g id="Icon">
          <path d={svgPaths.p27e78730} fill="var(--fill-0, black)" fillOpacity="0.85" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Container">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <Icon7 />
        </div>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container27 />
    </div>
  );
}

function Border() {
  return (
    <div className="border border-[#d9d9d9] border-solid content-stretch flex items-center justify-center p-[0.8px] relative rounded-[9999px] shrink-0 size-[32px]" data-name="Border">
      <Container26 />
    </div>
  );
}

function Icon8() {
  return (
    <div className="h-[13.6px] relative w-[14px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 13.6">
        <g id="Icon">
          <path d={svgPaths.p2e358200} fill="var(--fill-0, black)" fillOpacity="0.85" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Container">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <Icon8 />
        </div>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container29 />
    </div>
  );
}

function Border1() {
  return (
    <div className="border border-[#d9d9d9] border-solid content-stretch flex items-center justify-center p-[0.8px] relative rounded-[9999px] shrink-0 size-[32px]" data-name="Border">
      <Container28 />
    </div>
  );
}

function Svg() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="SVG">
          <path d={svgPaths.p30d46a00} fill="var(--fill-0, black)" fillOpacity="0.85" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Border2() {
  return (
    <div className="border border-[#d9d9d9] border-solid content-stretch flex items-center justify-center p-[0.8px] relative rounded-[9999px] shrink-0 size-[32px]" data-name="Border">
      <Svg />
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Container">
      <Border />
      <Border1 />
      <Border2 />
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex items-center justify-end relative shrink-0 w-[217.2px]" data-name="Container">
      <Container25 />
    </div>
  );
}

function HorizontalMenu() {
  return (
    <div className="bg-white border-b-[0.8px] border-[rgba(0,0,0,0.06)] border-solid relative shrink-0 w-full z-[2]" data-name="Horizontal Menu">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-between px-[15px] relative size-full">
          <Container4 />
          <Container13 />
          <Container24 />
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start leading-[0] relative shrink-0 w-full z-[2]" data-name="Header">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center relative shrink-0 text-[16px] text-[rgba(0,0,0,0.85)] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[normal]">Potencia tu estudio</p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center min-w-full relative shrink-0 text-[14px] text-[rgba(0,0,0,0.45)] w-[min-content]" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[normal]">Activa funciones que mejoran tu análisis, integraciones y accesibilidad del estudio.</p>
      </div>
    </div>
  );
}

function IconFechaDeTransaccion() {
  return (
    <div className="bg-[#e6f7ff] border border-[#1890ff] border-solid content-stretch flex items-center p-[8px] relative rounded-[8px] shrink-0" data-name="Icon/FechaDeTransaccion">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="bx-calendar">
        <div className="absolute inset-[8.33%_12.5%]" data-name="icon">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 20">
            <g id="icon">
              <path d={svgPaths.pc9c0f0} fill="var(--fill-0, #1890FF)" />
              <path d={svgPaths.p38726500} fill="var(--fill-0, #1890FF)" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

function CardAlertsLabels() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-w-px relative" data-name="Card/Alerts/Labels">
      <p className="font-['Roboto:Medium',sans-serif] font-medium relative shrink-0 text-[16px] text-[rgba(0,0,0,0.85)] w-full" style={{ fontVariationSettings: '"wdth" 100' }}>
        Fecha de transacción
      </p>
      <p className="font-['Roboto:Regular',sans-serif] font-normal relative shrink-0 text-[14px] text-[rgba(0,0,0,0.45)] w-full" style={{ fontVariationSettings: '"wdth" 100' }}>
        Asigna la fecha que definirá el orden y periodo de visualización de los resultados.
      </p>
    </div>
  );
}

function SelectionItem() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip relative" data-name="selection-item">
      <p className="[word-break:break-word] font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.25)] text-left whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        Seleccione una fecha...
      </p>
    </div>
  );
}

function Icon9() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center pl-[6px] relative self-stretch shrink-0" data-name="icon">
      <div className="relative shrink-0 size-[12px]" data-name="icon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.1778 6.85737">
          <path d={svgPaths.p23a42600} fill="var(--fill-0, black)" fillOpacity="0.25" id="icon" />
        </svg>
      </div>
    </div>
  );
}

function ListItem() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="ListItem">
      <IconFechaDeTransaccion />
      <CardAlertsLabels />
      <button className="content-stretch cursor-pointer flex flex-col items-start overflow-clip relative rounded-[8px] shrink-0 w-[252px]" data-name="Field">
        <div className="bg-white border border-[#d9d9d9] border-solid relative rounded-[8px] shrink-0 w-full" data-name="Select">
          <div className="content-stretch flex items-start px-[12px] py-[8px] relative size-full">
            <SelectionItem />
            <Icon9 />
            <div className="absolute bg-white content-stretch flex flex-col items-start left-0 opacity-0 overflow-clip py-[4px] right-0 rounded-[2px] shadow-[0px_3px_6px_-4px_rgba(0,0,0,0.12),0px_6px_16px_0px_rgba(0,0,0,0.08),0px_9px_28px_8px_rgba(0,0,0,0.05)] top-[38px]" data-name="Dropdown">
              <div className="relative shrink-0 w-full" data-name="Components/Dropdown/Menu-Item">
                <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                  <div className="content-stretch flex items-center px-[12px] py-[8px] relative size-full">
                    <p className="[word-break:break-word] font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.85)] text-left whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
                      1st menu item
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative shrink-0 w-full" data-name="Components/Dropdown/Menu-Item">
                <div className="flex flex-row items-center size-full">
                  <div className="content-stretch flex items-center px-[12px] py-[8px] relative size-full">
                    <p className="[word-break:break-word] font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.85)] text-left whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
                      2nd menu item
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative shrink-0 w-full" data-name="Components/Dropdown/Menu-Item">
                <div className="flex flex-row items-center size-full">
                  <div className="content-stretch flex items-center px-[12px] py-[8px] relative size-full">
                    <p className="[word-break:break-word] font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.85)] text-left whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
                      3rd menu item
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </button>
      <div className="bg-[#1890ff] border border-[#1890ff] border-solid h-[32px] relative rounded-[8px] shadow-[0px_2px_0px_0px_rgba(0,0,0,0.04)] shrink-0" data-name="Button">
        <div className="content-stretch flex gap-[8px] items-center justify-center overflow-clip px-[17px] py-[5px] relative rounded-[inherit] size-full">
          <div className="relative shrink-0 size-[14px]" data-name="Icon-Wrapper (NO USAR)">
            <div className="overflow-clip relative rounded-[inherit] size-full">
              <div className="absolute inset-[12.5%]" data-name="icon">
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 10.5">
                  <path d={svgPaths.p3fb923b0} fill="var(--fill-0, white)" id="icon" />
                </svg>
              </div>
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
            Guardar
          </p>
        </div>
      </div>
    </div>
  );
}

function CardAlertsIcon() {
  return (
    <div className="bg-[#fff7e6] border border-[#ffa940] border-solid content-stretch flex items-center justify-center p-[8px] relative rounded-[8px] shrink-0 size-[40px]" data-name="Card/Alerts/Icon">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="bell">
        <div className="absolute bottom-1/4 left-[22.66%] right-[22.66%] top-[14.73%]" data-name="bg">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.125 14.4656">
            <path d={svgPaths.p33d2bc00} fill="var(--fill-0, #FFE7BA)" id="bg" />
          </svg>
        </div>
        <div className="absolute inset-[7.03%_17.19%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.75 20.625">
            <path d={svgPaths.p37c01000} fill="var(--fill-0, #FFA940)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function CardAlertsLabels1() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-w-px relative" data-name="Card/Alerts/Labels">
      <p className="font-['Roboto:Medium',sans-serif] font-medium relative shrink-0 text-[16px] text-[rgba(0,0,0,0.85)] w-full" style={{ fontVariationSettings: '"wdth" 100' }}>
        Alertas
      </p>
      <p className="font-['Roboto:Regular',sans-serif] font-normal relative shrink-0 text-[14px] text-[rgba(0,0,0,0.45)] w-full" style={{ fontVariationSettings: '"wdth" 100' }}>
        Recibe alertas en el medio de preferencia para detectar casos específicos del estudio.
      </p>
    </div>
  );
}

function HeaderQuestionsButtonEdit() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Header/Questions/Button/Edit">
      <div className="overflow-clip relative shrink-0 size-[14px]" data-name="Edit">
        <div className="absolute inset-[5.35%_5.36%_5.37%_5.36%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.5 12.5">
            <path d={svgPaths.p34938f00} fill="var(--fill-0, #1890FF)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#1890ff] text-[14px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        Editar configuración
      </p>
    </div>
  );
}

function BoosterOptions() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Booster options">
      <HeaderQuestionsButtonEdit />
    </div>
  );
}

function CardAlertsIcon1() {
  return (
    <div className="bg-[#fff0f6] border border-[#eb2f96] border-solid content-stretch flex items-center justify-center p-[8px] relative rounded-[8px] shrink-0 size-[40px]" data-name="Card/Alerts/Icon">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="bx-bookmark-alt-plus">
        <div className="absolute inset-[8.33%_8.33%_8.33%_12.5%]" data-name="icon">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 20">
            <g id="icon">
              <path d={svgPaths.p13c01f00} fill="var(--fill-0, #EB2F96)" />
              <path d={svgPaths.p5455200} fill="var(--fill-0, #EB2F96)" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

function CardAlertsLabels2() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-w-px relative" data-name="Card/Alerts/Labels">
      <p className="font-['Roboto:Medium',sans-serif] font-medium relative shrink-0 text-[16px] text-[rgba(0,0,0,0.85)] w-full" style={{ fontVariationSettings: '"wdth" 100' }}>
        Tickets
      </p>
      <p className="font-['Roboto:Regular',sans-serif] font-normal relative shrink-0 text-[14px] text-[rgba(0,0,0,0.45)] w-full" style={{ fontVariationSettings: '"wdth" 100' }}>
        Crea casos automáticamente en el sistema de tickets cuando se cumplan reglas.
      </p>
    </div>
  );
}

function HeaderQuestionsButtonEdit1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Header/Questions/Button/Edit">
      <div className="overflow-clip relative shrink-0 size-[14px]" data-name="Edit">
        <div className="absolute inset-[5.35%_5.36%_5.37%_5.36%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.5 12.5">
            <path d={svgPaths.p34938f00} fill="var(--fill-0, #1890FF)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#1890ff] text-[14px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        Editar configuración
      </p>
    </div>
  );
}

function BoosterOptions1() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Booster options">
      <HeaderQuestionsButtonEdit1 />
    </div>
  );
}

function CardAlertsIcon2() {
  return (
    <div className="bg-[#f0f5ff] border border-[#1d39c4] border-solid content-stretch flex items-center justify-center p-[8px] relative rounded-[8px] shrink-0 size-[40px]" data-name="Card/Alerts/Icon">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="bx-envelope">
        <div className="absolute inset-[16.67%_8.33%]" data-name="icon">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 16">
            <path d={svgPaths.p118fd400} fill="var(--fill-0, #1D39C4)" id="icon" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function CardAlertsLabels3() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-w-px relative" data-name="Card/Alerts/Labels">
      <p className="font-['Roboto:Medium',sans-serif] font-medium relative shrink-0 text-[16px] text-[rgba(0,0,0,0.85)] w-full" style={{ fontVariationSettings: '"wdth" 100' }}>
        Respuestas automáticas
      </p>
      <p className="font-['Roboto:Regular',sans-serif] font-normal relative shrink-0 text-[14px] text-[rgba(0,0,0,0.45)] w-full" style={{ fontVariationSettings: '"wdth" 100' }}>
        Correos que se envían automáticamente al encuestado cuando llega una respuesta
      </p>
    </div>
  );
}

function HeaderQuestionsButtonEdit2() {
  const { setActiveContent } = useContext(BoostersCtx);
  return (
    <button
      className="content-stretch cursor-pointer flex gap-[8px] items-center relative shrink-0 bg-transparent border-0 p-0"
      data-name="Header/Questions/Button/Edit"
      onClick={() => setActiveContent('respuestas-automaticas')}
    >
      <div className="overflow-clip relative shrink-0 size-[14px]" data-name="Edit">
        <div className="absolute inset-[5.35%_5.36%_5.37%_5.36%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.5 12.5">
            <path d={svgPaths.p34938f00} fill="var(--fill-0, #1890FF)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#1890ff] text-[14px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        Editar configuración
      </p>
    </button>
  );
}

function BoosterOptions2() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Booster options">
      <HeaderQuestionsButtonEdit2 />
    </div>
  );
}

function CardAlertsIcon3() {
  return (
    <div className="bg-[#f9f0ff] border border-[#9254de] border-solid content-stretch flex items-center justify-center p-[8px] relative rounded-[8px] shrink-0 size-[40px]" data-name="Card/Alerts/Icon">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="file-text">
        <div className="absolute inset-[13.28%_22.66%]" data-name="bg">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.125 17.625">
            <path d={svgPaths.pe9b8900} fill="var(--fill-0, #EFDBFF)" id="bg" />
          </svg>
        </div>
        <div className="absolute inset-[6.25%_15.63%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.5 21">
            <g id="Vector">
              <path d={svgPaths.p2d0e8400} fill="#9254DE" />
              <path d={svgPaths.p212588c0} fill="#9254DE" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

function CardAlertsLabels4() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-w-px relative" data-name="Card/Alerts/Labels">
      <p className="font-['Roboto:Medium',sans-serif] font-medium relative shrink-0 text-[16px] text-[rgba(0,0,0,0.85)] w-full" style={{ fontVariationSettings: '"wdth" 100' }}>
        Modelos de categorización
      </p>
      <p className="font-['Roboto:Regular',sans-serif] font-normal relative shrink-0 text-[14px] text-[rgba(0,0,0,0.45)] w-full" style={{ fontVariationSettings: '"wdth" 100' }}>
        Clasifica automáticamente los comentarios de tu estudio con nuestros modelos de categorización con IA.
      </p>
    </div>
  );
}

function HeaderQuestionsButtonEdit3() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Header/Questions/Button/Edit">
      <div className="overflow-clip relative shrink-0 size-[14px]" data-name="Edit">
        <div className="absolute inset-[5.35%_5.36%_5.37%_5.36%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.5 12.5">
            <path d={svgPaths.p34938f00} fill="var(--fill-0, #1890FF)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#1890ff] text-[14px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        Editar configuración
      </p>
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-w-px relative" data-name="content">
      <div className="relative shrink-0 size-[4px]" data-name="Spacer" />
      <div className="[word-break:break-word] flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-white whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[normal]">ACTIVO</p>
      </div>
    </div>
  );
}

function BoosterOptions3() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Booster options">
      <HeaderQuestionsButtonEdit3 />
      <div className="bg-[#52c41a] content-stretch cursor-pointer flex items-center justify-between px-[2px] py-px relative rounded-[16px] shrink-0 w-[85px]" data-name="Switch">
        <Content />
        <div className="bg-white drop-shadow-[0px_2px_2px_rgba(0,35,11,0.2)] relative rounded-[77px] shrink-0 size-[18px]" data-name="switch-nob/default" />
      </div>
    </div>
  );
}

function CardAlertsIcon4() {
  return (
    <div className="bg-[#fcffe6] border border-[#a0d911] border-solid content-stretch flex items-center justify-center p-[8px] relative rounded-[8px] shrink-0 size-[40px]" data-name="Card/Alerts/Icon">
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Zhihu">
        <div className="absolute inset-[8.06%_8.06%_8.09%_8.13%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.7633 16.7705">
            <path d={svgPaths.p1bd85300} fill="var(--fill-0, #A0D911)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function CardAlertsLabels5() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-w-px relative" data-name="Card/Alerts/Labels">
      <p className="font-['Roboto:Medium',sans-serif] font-medium relative shrink-0 text-[16px] text-[rgba(0,0,0,0.85)] w-full" style={{ fontVariationSettings: '"wdth" 100' }}>
        Idiomas
      </p>
      <p className="font-['Roboto:Regular',sans-serif] font-normal relative shrink-0 text-[14px] text-[rgba(0,0,0,0.45)] w-full" style={{ fontVariationSettings: '"wdth" 100' }}>
        Crea versiones de tu encuesta en varios idiomas para llegar a más personas y aumentar la tasa de respuesta.
      </p>
    </div>
  );
}

function HeaderQuestionsButtonEdit4() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Header/Questions/Button/Edit">
      <div className="overflow-clip relative shrink-0 size-[14px]" data-name="Edit">
        <div className="absolute inset-[5.35%_5.36%_5.37%_5.36%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.5 12.5">
            <path d={svgPaths.p34938f00} fill="var(--fill-0, #1890FF)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#1890ff] text-[14px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        Editar configuración
      </p>
    </div>
  );
}

function BoosterItem() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Booster item">
      <CardAlertsIcon4 />
      <CardAlertsLabels5 />
      <HeaderQuestionsButtonEdit4 />
    </div>
  );
}

function CardAlertsIcon5() {
  return (
    <div className="bg-[#e6fffb] border border-[#36cfc9] border-solid content-stretch flex items-center justify-center p-[8px] relative rounded-[8px] shrink-0 size-[40px]" data-name="Card/Alerts/Icon">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="sound">
        <div className="absolute inset-[21.58%_42.77%_21.58%_14.26%]" data-name="bg">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.3125 13.6406">
            <path d={svgPaths.p18c42200} fill="var(--fill-0, #B5F5EC)" id="bg" />
          </svg>
        </div>
        <div className="absolute inset-[11.23%_7.23%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.5312 18.6094">
            <path d={svgPaths.p10771500} fill="var(--fill-0, #36CFC9)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function CardAlertsLabels6() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-w-px relative" data-name="Card/Alerts/Labels">
      <p className="font-['Roboto:Medium',sans-serif] font-medium relative shrink-0 text-[16px] text-[rgba(0,0,0,0.85)] w-full" style={{ fontVariationSettings: '"wdth" 100' }}>
        Text to speech
      </p>
      <p className="font-['Roboto:Regular',sans-serif] font-normal relative shrink-0 text-[14px] text-[rgba(0,0,0,0.45)] w-full" style={{ fontVariationSettings: '"wdth" 100' }}>
        Activa la lectura de voz de tu estudio para mejora la accesibilidad a todo tipo de público.
      </p>
    </div>
  );
}

function Content1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-w-px relative" data-name="content">
      <div className="relative shrink-0 size-[4px]" data-name="Spacer" />
      <div className="[word-break:break-word] flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-white whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[normal]">ACTIVO</p>
      </div>
    </div>
  );
}

function BoosterOptions4() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[85px]" data-name="Booster options">
      <div className="bg-[#52c41a] cursor-pointer flex-[1_0_0] min-w-px relative rounded-[16px]" data-name="Switch">
        <div className="content-stretch flex items-center justify-between px-[2px] py-px relative size-full">
          <Content1 />
          <div className="bg-white drop-shadow-[0px_2px_2px_rgba(0,35,11,0.2)] relative rounded-[77px] shrink-0 size-[18px]" data-name="switch-nob/default" />
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip py-[4px] relative shrink-0 w-full" data-name="Booster item">
      <div className="h-0 relative shrink-0 w-full" data-name="line">
        <div className="absolute inset-[-0.5px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1312 1">
            <path d="M0 0.5H1312" id="line" stroke="var(--stroke-0, black)" strokeOpacity="0.06" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ListBoosters() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-h-px relative w-full z-[1]" data-name="List/Boosters">
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Booster item">
        <ListItem />
      </div>
      <Divider />
      <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Booster item">
        <CardAlertsIcon />
        <CardAlertsLabels1 />
        <BoosterOptions />
      </div>
      <Divider />
      <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Booster item">
        <CardAlertsIcon1 />
        <CardAlertsLabels2 />
        <BoosterOptions1 />
      </div>
      <Divider />
      <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Booster item">
        <CardAlertsIcon2 />
        <CardAlertsLabels3 />
        <BoosterOptions2 />
      </div>
      <Divider />
      <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Booster item">
        <CardAlertsIcon3 />
        <CardAlertsLabels4 />
        <BoosterOptions3 />
      </div>
      <Divider />
      <BoosterItem />
      <Divider />
      <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Booster item">
        <CardAlertsIcon5 />
        <CardAlertsLabels6 />
        <BoosterOptions4 />
      </div>
    </div>
  );
}

function TabContent() {
  const { activeContent, setActiveContent } = useContext(BoostersCtx);
  if (activeContent === 'respuestas-automaticas') {
    return (
      <div className="bg-white flex-1 min-h-0 overflow-y-auto relative w-full z-[1]" data-name="Tab Content">
        <RespuestasAutomaticas onBack={() => setActiveContent('boosters-list')} />
      </div>
    );
  }
  return (
    <div className="bg-white flex-[1_0_0] min-h-px relative w-full z-[1]" data-name="Tab Content">
      <div className="content-stretch flex flex-col gap-[24px] isolate items-start pb-[16px] pt-[24px] px-[32px] relative size-full">
        <Header />
        <ListBoosters />
      </div>
    </div>
  );
}

function PageContainer() {
  const { activeContent } = useContext(BoostersCtx);
  return (
    <div className="relative bg-white border-[#f0f0f0] border-l border-t border-solid w-full h-full rounded-tl-[20px] flex flex-col overflow-hidden" data-name="Page Container">
      {activeContent === 'boosters-list' && <HorizontalMenu />}
      <TabContent />
    </div>
  );
}

function Body() {
  return (
    <div className="flex-1 h-full min-w-px relative overflow-hidden pt-[16px]" data-name="Body">
      <PageContainer />
    </div>
  );
}

export default function BoostersPage() {
  const [activeContent, setActiveContent] = useState<ActiveContent>('boosters-list');
  return (
    <BoostersCtx.Provider value={{ activeContent, setActiveContent }}>
      <div className="bg-[#fafafa] content-stretch flex items-start relative size-full" data-name="Boosters Page">
        <PagesVerticalMenu />
        <Body />
      </div>
    </BoostersCtx.Provider>
  );
}
