import svgPaths from "./svg-hnea2jkxqi";
import imgLogo from "./c1a59b77699b503cff1b1dc54942368b615932ea.png";
import imgImageAvatar from "./03428a1137072a2d2c0da0ea370ebfd6aabfe00f.png";

function Logo() {
  return (
    <div className="flex-[1_0_0] h-[40px] min-w-px relative rounded-[4px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.15)]" data-name="Logo">
      <div aria-hidden className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 pointer-events-none rounded-[4px]">
        <div className="absolute bg-clip-padding bg-white border-0 border-[transparent] border-solid inset-0 rounded-[4px]" />
        <div className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 overflow-hidden rounded-[4px]">
          <img alt="" className="absolute h-[75.95%] left-[19.21%] max-w-none top-[12.29%] w-[58.54%]" src={imgLogo} />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full" />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="relative shrink-0 w-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center py-[16px] relative size-full">
        <Logo />
      </div>
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
    <div className="h-[38px] relative rounded-[8px] shrink-0 w-[40px]" data-name="Home">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[10px] relative size-full">
        <Icon />
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p10771880} fill="var(--fill-0, #1890FF)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Studies() {
  return (
    <div className="bg-white h-[38px] relative rounded-[8px] shrink-0 w-[40px]" data-name="Studies">
      <div aria-hidden className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[11px] py-px relative size-full">
        <Icon1 />
      </div>
    </div>
  );
}

function PrincipalItems() {
  return (
    <div className="h-[400px] relative shrink-0 w-[72px]" data-name="Principal Items">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-center px-[16px] relative size-full">
        <Container />
        <Home />
        <Studies />
      </div>
    </div>
  );
}

function Container1() {
  return <div className="absolute bg-[#f0f0f0] h-px left-[20px] top-0 w-[32px]" data-name="Container" />;
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
          <path d={svgPaths.pc894400} fill="var(--fill-0, black)" fillOpacity="0.45" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function SlotClone() {
  return (
    <div className="h-[38px] relative rounded-[8px] shrink-0 w-full" data-name="SlotClone">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center px-[9.2px] relative size-full">
          <Icon2 />
        </div>
      </div>
    </div>
  );
}

function Settings() {
  return (
    <div className="absolute content-stretch flex flex-col h-[38px] items-start left-[16px] rounded-[8px] top-[9px] w-[40px]" data-name="Settings">
      <SlotClone />
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

function SlotClone1() {
  return (
    <div className="h-[38px] relative rounded-[8px] shrink-0 w-full" data-name="SlotClone">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Container2 />
      </div>
      <div aria-hidden className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Link() {
  return (
    <div className="absolute content-stretch flex flex-col h-[38px] items-start left-[16px] rounded-[8px] top-[55px] w-[40px]" data-name="Link">
      <SlotClone1 />
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
    <div className="absolute h-[38px] left-[16px] rounded-[8px] top-[101px] w-[40px]" data-name="Language">
      <div className="content-stretch flex items-center justify-center overflow-clip px-[10px] py-[0.8px] relative rounded-[inherit] size-full">
        <Icon4 />
      </div>
      <div aria-hidden className="absolute border-[0.8px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function BottomItems() {
  return (
    <div className="h-[187px] relative shrink-0 w-[72px]" data-name="Bottom Items">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container1 />
        <Profile />
        <Settings />
        <Link />
        <Language />
      </div>
    </div>
  );
}

function PagesVerticalMenu() {
  return (
    <div className="bg-[#fafafa] h-full relative shrink-0 w-[72px]" data-name="Pages Vertical Menu">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-between py-[10px] relative size-full">
        <PrincipalItems />
        <BottomItems />
      </div>
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
    <div className="absolute left-[66px] size-[18px] top-[2px]" data-name="Container">
      <div className="absolute bg-white inset-0 rounded-[9px] shadow-[0px_2px_4px_0px_rgba(0,35,11,0.2)]" data-name="Background+Shadow" />
    </div>
  );
}

function OverlayShadow() {
  return <div className="absolute bg-[rgba(255,255,255,0)] inset-0 opacity-0 rounded-[100px] shadow-[0px_0px_0px_6px_#1890ff]" data-name="Overlay+Shadow" />;
}

function Button() {
  return (
    <div className="bg-[#51c11a] h-[22px] max-w-[86px] min-w-[86px] relative rounded-[100px] shrink-0 w-[86px]" data-name="Button">
      <Container11 />
      <Container12 />
      <OverlayShadow />
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
    <div className="h-full relative shrink-0" data-name="HorizontalBorder">
      <div aria-hidden className="absolute border-[#1890ff] border-b-[0.8px] border-solid inset-0 pointer-events-none" />
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
    <div className="content-stretch flex items-center justify-center p-[0.8px] relative rounded-[9999px] shrink-0 size-[32px]" data-name="Border">
      <div aria-hidden className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-[9999px]" />
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
    <div className="content-stretch flex items-center justify-center p-[0.8px] relative rounded-[9999px] shrink-0 size-[32px]" data-name="Border">
      <div aria-hidden className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-[9999px]" />
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
    <div className="content-stretch flex items-center justify-center p-[0.8px] relative rounded-[9999px] shrink-0 size-[32px]" data-name="Border">
      <div aria-hidden className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-[9999px]" />
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
    <div className="bg-white relative shrink-0 w-full z-[2]" data-name="Horizontal Menu">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0.06)] border-b-[0.8px] border-solid inset-0 pointer-events-none" />
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

function Icon9() {
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

function Container30() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Container">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <Icon9 />
        </div>
      </div>
    </div>
  );
}

function Breadcrumb() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0" data-name="Breadcrumb">
      <div className="content-stretch flex items-center relative shrink-0" data-name="Components/Link">
        <div className="[word-break:break-word] flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1890ff] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
          <p className="leading-[normal]">Potenciadores</p>
        </div>
      </div>
      <Container30 />
      <div className="content-stretch flex items-center relative shrink-0" data-name="last-item">
        <div className="[word-break:break-word] flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.85)] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
          <p className="leading-[normal]">Respuestas Automáticas</p>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px relative" data-name="Header">
      <Breadcrumb />
      <div className="[word-break:break-word] flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] min-w-full relative shrink-0 text-[14px] text-[rgba(0,0,0,0.45)] w-[min-content]" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[normal]">Correos que se envían automáticamente al encuestado cuando llega una respuesta</p>
      </div>
    </div>
  );
}

function ListItem() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full z-[2]" data-name="ListItem">
      <Header />
      <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Button-Group">
        <div className="bg-white content-stretch drop-shadow-[0px_2px_0px_rgba(0,0,0,0.02)] flex gap-[4px] items-center justify-center px-[9px] py-[8px] relative rounded-[8px] shrink-0" data-name="Button">
          <div aria-hidden className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-[8px]" />
          <div className="relative shrink-0 size-[14px]" data-name="Icon-Wrapper">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
              <div className="absolute inset-[12.5%_8.33%]" data-name="icon">
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 10.4998">
                  <g id="icon">
                    <path d={svgPaths.p26abb800} fill="var(--fill-0, black)" fillOpacity="0.85" />
                    <path d={svgPaths.p2e705900} fill="var(--fill-0, black)" fillOpacity="0.85" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.85)] text-center whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
            Ver logs
          </p>
        </div>
        <div className="bg-[#1890ff] relative rounded-[8px] shrink-0" data-name="Button">
          <div className="content-stretch flex gap-[4px] items-center justify-center overflow-clip px-[9px] py-[8px] relative rounded-[inherit] size-full">
            <div className="bg-[rgba(255,255,255,0)] relative shrink-0" data-name="Icon-Wrapper">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center overflow-clip relative rounded-[inherit] size-full">
                <div className="overflow-clip relative shrink-0 size-[14px]" data-name="bx-slider-alt">
                  <div className="absolute inset-[10.42%_7.81%_10.42%_8.33%]" data-name="icon">
                    <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.7396 11.0833">
                      <g id="icon">
                        <path d={svgPaths.p3218bb00} fill="var(--fill-0, white)" />
                        <path d={svgPaths.p2bf89d72} fill="var(--fill-0, white)" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <p className="[word-break:break-word] font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
              Agregar flujo
            </p>
          </div>
          <div aria-hidden className="absolute border border-[#1890ff] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_2px_0px_0px_rgba(0,0,0,0.04)]" />
        </div>
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute inset-[0.11%_0.06%_0.55%_0]" data-name="Group">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 209.878 125.164">
        <g id="Group">
          <path d={svgPaths.p199fd80} fill="var(--fill-0, #BFBFBF)" id="Vector" />
          <path d={svgPaths.p354a9a00} fill="var(--fill-0, #BFBFBF)" id="Vector_2" />
          <path d={svgPaths.p2f113400} fill="var(--fill-0, #BFBFBF)" id="Vector_3" />
          <path d={svgPaths.p15a1c8c0} fill="var(--fill-0, #BFBFBF)" id="Vector_4" />
          <path d={svgPaths.p21183480} fill="var(--fill-0, #BFBFBF)" id="Vector_5" />
          <path d={svgPaths.paecd500} fill="var(--fill-0, #F0F0F0)" id="Vector_6" />
          <path d={svgPaths.p3f9bbe00} fill="var(--fill-0, white)" id="Vector_7" />
          <path d={svgPaths.p21b49430} fill="var(--fill-0, white)" id="Vector_8" />
          <path d={svgPaths.p25c6ea00} fill="var(--fill-0, white)" id="Vector_9" />
          <g id="Group_2">
            <path d={svgPaths.p3b4ad600} fill="var(--fill-0, #F0F0F0)" id="Vector_10" />
            <path d={svgPaths.p241f5ff0} fill="var(--fill-0, #BFBFBF)" id="Vector_11" />
            <path d={svgPaths.paa44c00} fill="var(--fill-0, #BFBFBF)" id="Vector_12" />
            <path d={svgPaths.p1352ee80} fill="var(--fill-0, #BFBFBF)" id="Vector_13" />
          </g>
          <g id="Group_3">
            <path d={svgPaths.pc446680} fill="var(--fill-0, #F0F0F0)" id="Vector_14" />
            <path d={svgPaths.p75f7880} fill="var(--fill-0, #BFBFBF)" id="Vector_15" />
            <path d={svgPaths.p9846480} fill="var(--fill-0, #BFBFBF)" id="Vector_16" />
            <path d={svgPaths.p1407a000} fill="var(--fill-0, #BFBFBF)" id="Vector_17" />
          </g>
          <g id="Group_4">
            <path d={svgPaths.p8199a80} fill="var(--fill-0, #F0F0F0)" id="Vector_18" />
            <g id="Group_5">
              <path d={svgPaths.p10915400} fill="var(--fill-0, #FFFBE6)" id="Vector_19" />
              <path d={svgPaths.p25476a00} fill="var(--fill-0, #FAAD14)" id="Vector_20" />
              <path d={svgPaths.p115fab00} fill="var(--fill-0, #FAAD14)" id="Vector_21" />
              <path d={svgPaths.p17ed5080} fill="var(--fill-0, #FAAD14)" id="Vector_22" />
              <path d={svgPaths.p2e13fa00} fill="var(--fill-0, #FAAD14)" id="Vector_23" />
              <path d={svgPaths.p24b4f480} fill="var(--fill-0, #FAAD14)" id="Vector_24" />
              <path d={svgPaths.p3c3f6a00} fill="var(--fill-0, #FAAD14)" id="Vector_25" />
              <path d={svgPaths.p3dbdc000} fill="var(--fill-0, #FAAD14)" id="Vector_26" />
              <path d={svgPaths.p3453f000} fill="var(--fill-0, #FAAD14)" id="Vector_27" />
            </g>
          </g>
          <path d={svgPaths.p1aed9f40} fill="var(--fill-0, #F0F0F0)" id="Vector_28" />
          <path d={svgPaths.p2b8f3ff0} fill="var(--fill-0, #BFBFBF)" id="Vector_29" />
          <path d={svgPaths.p3d65bef0} fill="var(--fill-0, #BFBFBF)" id="Vector_30" />
          <path d={svgPaths.p396c0b00} fill="var(--fill-0, #F0F0F0)" id="Vector_31" />
        </g>
      </svg>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents inset-[0.11%_0.06%_0.55%_0]" data-name="Group">
      <Group1 />
    </div>
  );
}

function UndrawIdeasFlowLwpa() {
  return (
    <div className="h-[126px] overflow-clip relative shrink-0 w-[210px]" data-name="undraw_ideas-flow_lwpa 1">
      <Group />
    </div>
  );
}

function Header1() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-center justify-center leading-[0] relative shrink-0 text-[rgba(0,0,0,0.45)] text-center w-full" data-name="Header">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center relative shrink-0 text-[20px] w-full" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[normal]">Respuestas Automáticas</p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center relative shrink-0 text-[14px] w-full" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[normal]">Configura reglas para enviar correos automáticos a tus encuestados.</p>
      </div>
    </div>
  );
}

function WorkflowsList() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full z-[1]" data-name="Workflows list">
      <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-center justify-center px-[300px] py-[24px] relative size-full">
          <UndrawIdeasFlowLwpa />
          <Header1 />
          <div className="bg-[#1890ff] relative rounded-[8px] shrink-0" data-name="Button">
            <div className="content-stretch flex gap-[4px] items-center justify-center overflow-clip px-[9px] py-[8px] relative rounded-[inherit] size-full">
              <div className="bg-[rgba(255,255,255,0)] relative shrink-0" data-name="Icon-Wrapper">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center overflow-clip relative rounded-[inherit] size-full">
                  <div className="overflow-clip relative shrink-0 size-[14px]" data-name="bx-slider-alt">
                    <div className="absolute inset-[10.42%_7.81%_10.42%_8.33%]" data-name="icon">
                      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.7396 11.0833">
                        <g id="icon">
                          <path d={svgPaths.p3218bb00} fill="var(--fill-0, white)" />
                          <path d={svgPaths.p2bf89d72} fill="var(--fill-0, white)" />
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <p className="[word-break:break-word] font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
                Añadir workflow
              </p>
            </div>
            <div aria-hidden className="absolute border border-[#1890ff] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_2px_0px_0px_rgba(0,0,0,0.04)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Creador() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px relative w-full z-[1]" data-name="Creador">
      <div className="content-stretch flex flex-col gap-[24px] isolate items-start pb-[16px] pt-[24px] px-[32px] relative size-full">
        <ListItem />
        <WorkflowsList />
      </div>
    </div>
  );
}

function PageContainer() {
  return (
    <div className="absolute bg-white h-[713px] left-0 rounded-tl-[20px] top-[16px] w-[1376px]" data-name="Page Container">
      <div className="content-stretch flex flex-col isolate items-start overflow-clip relative rounded-[inherit] size-full">
        <HorizontalMenu />
        <Creador />
      </div>
      <div aria-hidden className="absolute border-[#f0f0f0] border-l border-solid border-t inset-0 pointer-events-none rounded-tl-[20px]" />
    </div>
  );
}

function Body() {
  return (
    <div className="flex-[1462.4_0_0] h-full min-w-px relative" data-name="Body">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <PageContainer />
      </div>
    </div>
  );
}

export default function BoostersPage() {
  return (
    <div className="bg-[#fafafa] content-stretch flex items-start relative size-full" data-name="Boosters Page">
      <PagesVerticalMenu />
      <Body />
    </div>
  );
}