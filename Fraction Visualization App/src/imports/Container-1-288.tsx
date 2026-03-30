import svgPaths from "./svg-bgtts3104s";

function ButtonContainer() {
  return (
    <div className="absolute contents left-[128.07px] top-[174.23px]" data-name="Button Container">
      <div className="absolute bg-[#16ffbc] h-[17.693px] left-[128.07px] rounded-[1.783px] top-[174.23px] w-[68.338px]" data-name="Button Background" />
      <div className="absolute font-['Fenomen_Sans:Book',_sans-serif] leading-[0] left-[163.41px] not-italic text-[#05553e] text-[7.789px] text-center text-nowrap top-[178.11px] translate-x-[-50%]">
        <p className="leading-[11.683px] whitespace-pre">Zkontrolovat</p>
      </div>
    </div>
  );
}

function GridContainer() {
  return (
    <div className="absolute contents left-[44.53px] top-[133.99px]" data-name="Grid Container">
      <div className="absolute bg-[#25234f] h-[16.707px] left-[44.53px] rounded-[4.299px] top-[133.99px] w-[47.282px]" data-name="Grid Item" />
      <div className="absolute bg-[#25234f] h-[16.707px] left-[94.42px] rounded-[4.299px] top-[133.99px] w-[47.282px]" data-name="Grid Item" />
      <div className="absolute bg-[#25234f] h-[16.707px] left-[144.32px] rounded-[4.299px] top-[133.99px] w-[47.282px]" data-name="Grid Item" />
      <div className="absolute bg-[rgba(37,35,79,0.2)] h-[16.707px] left-[194.21px] rounded-[4.299px] top-[133.99px] w-[47.282px]" data-name="Grid Item" />
      <div className="absolute bg-[rgba(37,35,79,0.2)] h-[16.707px] left-[244.1px] rounded-[4.299px] top-[133.99px] w-[47.282px]" data-name="Grid Item" />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute contents left-[0.22px] top-[-0.04px]" data-name="Container">
      <div className="absolute bg-[#ffeae3] h-[220.026px] left-[0.22px] top-[-0.04px] w-[333.653px]" data-name="Background" />
      <div className="absolute bg-white h-[58.052px] left-[140.12px] rounded-[7.305px] top-[52.19px] w-[44.238px]" data-name="Fraction Background" />
      <div className="absolute bg-white h-[46.49px] left-[16.01px] rounded-[5px] top-[118.57px] w-[303.252px]" data-name="Grid Background" />
      <div className="absolute font-['Fenomen_Sans:Book',_sans-serif] leading-[18.785px] left-[161.93px] not-italic text-[12.524px] text-black text-center text-nowrap top-[59px] translate-x-[-50%] whitespace-pre">
        <p className="mb-[10.436px]">3</p>
        <p>10</p>
      </div>
      <div className="absolute font-['Fenomen_Sans:Book',_sans-serif] leading-[0] left-[165.05px] not-italic text-[18.273px] text-black text-center text-nowrap top-[22.78px] translate-x-[-50%]">
        <p className="leading-[27.409px] whitespace-pre">Zaznamenej:</p>
      </div>
      <ButtonContainer />
      <div className="absolute font-['Fenomen_Sans:Book',_sans-serif] leading-[0] left-[196.41px] not-italic text-[18.273px] text-black text-center text-nowrap top-[67.22px] translate-x-[-50%]">
        <p className="leading-[27.409px] whitespace-pre">=</p>
      </div>
      <div className="absolute h-0 left-[151.79px] top-[81.96px] w-[20.873px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-1.04px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 2">
            <line id="Line 60" stroke="var(--stroke-0, black)" strokeWidth="1.04364" x2="20.8727" y1="1.47818" y2="1.47818" />
          </svg>
        </div>
      </div>
      <div className="absolute bg-[#4b4a5f] left-[298.29px] rounded-[1.737px] size-[16.065px] top-[144.53px]" data-name="Down Arrow Button" />
      <div className="absolute bg-[#4b4a5f] left-[298.29px] rounded-[1.737px] size-[16.065px] top-[123.03px]" data-name="Up Arrow Button" />
      <GridContainer />
      <div className="absolute flex h-[10.144px] items-center justify-center left-[301.25px] top-[147.68px] w-[10.14px]">
        <div className="flex-none rotate-[180deg]">
          <div className="h-[10.144px] relative w-[10.14px]">
            <div className="absolute bottom-1/4 left-[13.9%] right-[13.9%] top-[9.86%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 7">
                <path d={svgPaths.p22930400} fill="var(--fill-0, #EFEFEF)" id="Polygon 14" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute h-[10.144px] left-[301.25px] top-[126.06px] w-[10.14px]">
        <div className="absolute bottom-1/4 left-[13.9%] right-[13.9%] top-[9.86%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 7">
            <path d={svgPaths.p22930400} fill="var(--fill-0, #EFEFEF)" id="Polygon 15" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function Container1() {
  return (
    <div className="bg-white relative size-full" data-name="Container">
      <Container />
    </div>
  );
}