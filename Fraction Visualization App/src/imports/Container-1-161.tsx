import svgPaths from "./svg-nla8uhchlc";

function ButtonContainer() {
  return (
    <div className="absolute contents left-[132.02px] top-[164.63px]" data-name="Button Container">
      <div className="absolute bg-[#16ffbc] h-[17.693px] left-[132.02px] rounded-[1.783px] top-[164.63px] w-[68.338px]" data-name="Button Background" />
      <div className="absolute font-['Fenomen_Sans:Book',_sans-serif] leading-[0] left-[167.36px] not-italic text-[#05553e] text-[7.789px] text-center text-nowrap top-[168.51px] translate-x-[-50%]">
        <p className="leading-[11.683px] whitespace-pre">Zkontrolovat</p>
      </div>
    </div>
  );
}

function Controls() {
  return (
    <div className="absolute h-[37.556px] left-[249.04px] top-[89.88px] w-[16.065px]" data-name="Controls">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 38">
        <g id="Controls">
          <rect fill="var(--fill-0, #4B4A5F)" height="16.0648" id="Down Button" rx="1.73673" width="16.0648" y="21.4917" />
          <rect fill="var(--fill-0, #4B4A5F)" height="16.0648" id="Up Button" rx="1.73673" width="16.0648" />
          <path d={svgPaths.p9e1500} fill="var(--fill-0, #EFEFEF)" id="Polygon 16" />
          <path d={svgPaths.p218cc80} fill="var(--fill-0, #EFEFEF)" id="Polygon 17" />
        </g>
      </svg>
    </div>
  );
}

function PieChart() {
  return (
    <div className="absolute left-[170.67px] size-[65.84px] top-[74.25px]" data-name="Pie Chart">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 66 66">
        <g id="Pie Chart">
          <g id="Ellipse 4476">
            <mask fill="white" id="path-1-inside-1_1_44">
              <path d={svgPaths.p2f202900} />
            </mask>
            <path d={svgPaths.p2f202900} fill="var(--fill-0, #D3D3DC)" mask="url(#path-1-inside-1_1_44)" stroke="var(--stroke-0, white)" strokeLinejoin="round" strokeWidth="2" />
          </g>
          <g id="Ellipse 4478">
            <mask fill="white" id="path-2-inside-2_1_44">
              <path d={svgPaths.p3d501300} />
            </mask>
            <path d={svgPaths.p3d501300} fill="var(--fill-0, #D3D3DC)" mask="url(#path-2-inside-2_1_44)" stroke="var(--stroke-0, white)" strokeLinejoin="round" strokeWidth="2" />
          </g>
          <g id="Ellipse 4477">
            <mask fill="white" id="path-3-inside-3_1_44">
              <path d={svgPaths.p2ba48500} />
            </mask>
            <path d={svgPaths.p2ba48500} fill="var(--fill-0, #25234F)" mask="url(#path-3-inside-3_1_44)" stroke="var(--stroke-0, white)" strokeLinejoin="round" strokeWidth="2" />
          </g>
          <g id="Ellipse 4479">
            <mask fill="white" id="path-4-inside-4_1_44">
              <path d={svgPaths.p85b9ea0} />
            </mask>
            <path d={svgPaths.p85b9ea0} fill="var(--fill-0, #D3D3DC)" mask="url(#path-4-inside-4_1_44)" stroke="var(--stroke-0, white)" strokeLinejoin="round" strokeWidth="2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute contents left-[0.17px] top-[-0.03px]" data-name="Container">
      <div className="absolute bg-[#ffeae3] h-[220.026px] left-[0.17px] top-[-0.03px] w-[333.653px]" data-name="Background" />
      <div className="absolute font-['Fenomen_Sans:Book',_sans-serif] leading-[0] left-[169px] not-italic text-[18.273px] text-black text-center text-nowrap top-[22.79px] translate-x-[-50%]">
        <p className="leading-[27.409px] whitespace-pre">Zaznamenej:</p>
      </div>
      <ButtonContainer />
      <div className="absolute bg-white h-[84.702px] left-[65.88px] rounded-[10.659px] top-[64.82px] w-[64.547px]" data-name="Left Card" />
      <div className="absolute bg-white h-[84.702px] left-[157.35px] rounded-[10.659px] top-[64.82px] w-[120.293px]" data-name="Right Card" />
      <div className="absolute font-['Fenomen_Sans:Book',_sans-serif] leading-[27.409px] left-[97.99px] not-italic text-[18.273px] text-black text-center text-nowrap top-[74.75px] translate-x-[-50%] whitespace-pre">
        <p className="mb-[15.227px]">1</p>
        <p>4</p>
      </div>
      <div className="absolute font-['Fenomen_Sans:Book',_sans-serif] leading-[0] left-[144.33px] not-italic text-[18.273px] text-black text-center text-nowrap top-[92.09px] translate-x-[-50%]">
        <p className="leading-[27.409px] whitespace-pre">=</p>
      </div>
      <div className="absolute h-0 left-[82.92px] top-[108.25px] w-[30.455px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-1.52px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31 2">
            <line id="Line 61" stroke="var(--stroke-0, black)" strokeWidth="1.52274" x2="30.4547" y1="1.23863" y2="1.23863" />
          </svg>
        </div>
      </div>
      <Controls />
      <PieChart />
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