export default function LayoutBlocksHorizontal() {
  return (
    <div className="bg-[rgba(0,0,0,0.04)] content-stretch flex items-center p-[4px] relative rounded-[8px] size-full" data-name="LayoutBlocks/horizontal×2">
      <div className="bg-white content-stretch flex gap-[4px] items-center overflow-clip px-[8px] py-[4px] relative rounded-[100px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.05)] shrink-0" data-name="Selected=true, Disabled=false, Size=medium">
        <p className="[word-break:break-word] font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#1890ff] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
          Y
        </p>
      </div>
      <div className="bg-[rgba(255,255,255,0)] content-stretch flex gap-[4px] items-center overflow-clip px-[8px] py-[4px] relative rounded-[100px] shrink-0" data-name="Selected=false, Disabled=false, Size=medium">
        <p className="[word-break:break-word] font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.45)] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
          O
        </p>
      </div>
    </div>
  );
}