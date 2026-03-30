import { useId, type SVGProps } from "react";

const VB = "0 0 120 120";
const FONT = "'Fenomen Sans', ui-sans-serif, system-ui, sans-serif";
/** Světle modrý obrys koláče na dlaždicích modulů (stejná idea jako primaryLight v Zlomkarně). */
const PIE_RING_LIGHT_BLUE = "#DBE4FF";

type TileProps = SVGProps<SVGSVGElement> & { moduleId: string };

/**
 * Náhledové ilustrace pro dlaždice úvodní obrazovky.
 * Jednotný styl: lehká hloubka (stín, gradient), srovnané proporce, motiv odpovídá aktivity.
 */
export function ModuleTileIllustration({ moduleId, width = 100, height = 100, ...rest }: TileProps) {
  const raw = useId().replace(/:/g, "");
  const g = (suffix: string) => `${raw}-${suffix}`;

  const base = {
    viewBox: VB,
    width,
    height,
    role: "img" as const,
    "aria-hidden": true as const,
    ...rest,
  };

  switch (moduleId) {
    case "explorer":
      return (
        <svg {...base}>
          <defs>
            <linearGradient id={g("ex-pie")} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7CB3FF" />
              <stop offset="100%" stopColor="#3B5BDB" />
            </linearGradient>
            <filter id={g("ex-sh")} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.12" />
            </filter>
          </defs>
          <g filter={`url(#${g("ex-sh")})`}>
            <circle cx="52" cy="56" r="34" fill="#fff" stroke={PIE_RING_LIGHT_BLUE} strokeWidth="2" />
            <path d="M52 22 A34 34 0 0 1 86 58 L52 56 Z" fill={`url(#${g("ex-pie")})`} />
            <circle cx="52" cy="56" r="4.5" fill="#2B44A8" stroke="#fff" strokeWidth="1.5" />
          </g>
          <g opacity={0.92}>
            <circle cx="86" cy="38" r="16" fill="none" stroke="#4d49f3" strokeWidth="2.5" />
            <line x1="97" y1="49" x2="106" y2="60" stroke="#4d49f3" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="84" cy="36" rx="10" ry="4" fill="#fff" fillOpacity="0.45" transform="rotate(-35 84 36)" />
          </g>
          <rect x="24" y="92" width="72" height="7" rx="3.5" fill="#E8EEFF" stroke="#C5D4FF" strokeWidth="1" />
          <rect x="24" y="92" width="48" height="7" rx="3.5" fill="#4d49f3" fillOpacity={0.35} />
          <circle cx="74" cy="95.5" r="5" fill="#4d49f3" stroke="#fff" strokeWidth="1.5" />
        </svg>
      );

    case "compare":
      return (
        <svg {...base}>
          <defs>
            <filter id={g("cmp-sh")} x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodOpacity="0.1" />
            </filter>
          </defs>
          <g filter={`url(#${g("cmp-sh")})`}>
            <path d="M24 44 Q60 34 96 44" fill="none" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="60" y1="44" x2="60" y2="102" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M52 102 H68 L60 112 Z" fill="#9A3412" />
            <line x1="32" y1="44" x2="32" y2="54" stroke="#C2410C" strokeWidth="1.8" />
            <line x1="88" y1="44" x2="88" y2="54" stroke="#C2410C" strokeWidth="1.8" />
            <rect x="16" y="72" width="32" height="10" rx="3" fill="#FFF0E8" stroke="#F97316" strokeWidth="1.2" />
            <rect x="72" y="64" width="32" height="10" rx="3" fill="#FFF0E8" stroke="#EA580C" strokeWidth="1.2" />
            <circle cx="32" cy="64" r="14" fill="#fff" stroke={PIE_RING_LIGHT_BLUE} strokeWidth="1.8" />
            <path d="M32 50 A14 14 0 0 1 40 72 L32 64 Z" fill="#FDBA74" />
            <circle cx="32" cy="64" r="2.5" fill="#C2410C" />
            <circle cx="88" cy="52" r="14" fill="#fff" stroke={PIE_RING_LIGHT_BLUE} strokeWidth="1.8" />
            <path d="M88 38 A14 14 0 0 1 102 62 L88 52 Z" fill="#FB923C" />
            <circle cx="88" cy="52" r="2.5" fill="#C2410C" />
          </g>
        </svg>
      );

    case "equivalent":
      return (
        <svg {...base}>
          <defs>
            <linearGradient id={g("eq-l")} x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
          </defs>
          <circle cx="30" cy="58" r="21" fill="#fff" stroke={PIE_RING_LIGHT_BLUE} strokeWidth="2" />
          <path d="M30 37 A21 21 0 0 0 30 79 L30 58 Z" fill={`url(#${g("eq-l")})`} />
          <circle cx="30" cy="58" r="3" fill="#065F46" stroke="#fff" strokeWidth="1" />
          <g transform="translate(52, 44)">
            <rect x="0" y="12" width="16" height="3.5" rx="1.2" fill="#059669" />
            <rect x="0" y="18" width="16" height="3.5" rx="1.2" fill="#059669" />
          </g>
          <rect x="82" y="40" width="26" height="36" rx="4" fill="#fff" stroke="#059669" strokeWidth="2" />
          <rect x="84" y="42" width="11" height="16" rx="1.5" fill="#D1FAE5" stroke="#6EE7B7" strokeWidth="1" />
          <rect x="95" y="42" width="11" height="16" rx="1.5" fill="#D1FAE5" stroke="#6EE7B7" strokeWidth="1" />
          <rect x="84" y="60" width="11" height="14" rx="1.5" fill="#fff" stroke="#BBF7D0" strokeWidth="1" />
          <rect x="95" y="60" width="11" height="14" rx="1.5" fill="#fff" stroke="#BBF7D0" strokeWidth="1" />
        </svg>
      );

    case "addition":
      return (
        <svg {...base}>
          <defs>
            <linearGradient id={g("ad-a")} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C4B5FD" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          <circle cx="26" cy="44" r="17" fill="#fff" stroke={PIE_RING_LIGHT_BLUE} strokeWidth="2" />
          <path d="M26 27 A17 17 0 0 1 42 50 L26 44 Z" fill={`url(#${g("ad-a")})`} opacity={0.95} />
          <circle cx="26" cy="44" r="2.8" fill="#5B21B6" />
          <text x="46" y="50" fontSize="22" fontWeight="900" fill="#5B21B6" fontFamily={FONT}>
            +
          </text>
          <circle cx="94" cy="44" r="17" fill="#fff" stroke={PIE_RING_LIGHT_BLUE} strokeWidth="2" />
          <path d="M94 27 A17 17 0 0 1 110 50 L94 44 Z" fill="#A78BFA" />
          <circle cx="94" cy="44" r="2.8" fill="#5B21B6" />
          <path d="M60 66 L60 76 M54 71 L66 71" stroke="#7950F2" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="41" y="80" width="38" height="22" rx="6" fill="#fff" stroke="#7950F2" strokeWidth="2" />
          <rect x="44" y="83" width="10" height="16" rx="2" fill="#DDD6FE" />
          <rect x="56" y="83" width="10" height="16" rx="2" fill="#C4B5FD" />
          <rect x="68" y="83" width="8" height="16" rx="2" fill="#EDE9FE" />
        </svg>
      );

    case "wheel":
      return (
        <svg {...base}>
          <defs>
            <filter id={g("wh-glow")}>
              <feGaussianBlur stdDeviation="0.8" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="60" cy="60" r="38" fill="#FFFFFF" stroke="#DEE2E6" strokeWidth="2.25" />
          {[0, 90, 180, 270].map((deg) => {
            const rad = ((deg - 90) * Math.PI) / 180;
            const x1 = 60 + 30 * Math.cos(rad);
            const y1 = 60 + 30 * Math.sin(rad);
            const x2 = 60 + 36 * Math.cos(rad);
            const y2 = 60 + 36 * Math.sin(rad);
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#CED4DA" strokeWidth="1.5" strokeLinecap="round" />;
          })}
          <text x="60" y="26" textAnchor="middle" fontSize="11" fontWeight="800" fill="#868E96" fontFamily={FONT}>
            0
          </text>
          <path d="M60 24 A36 36 0 0 1 88 68 L60 60 Z" fill="#FF6B2B" opacity={0.14} />
          <line x1="60" y1="60" x2="82" y2="44" stroke="#FF6B2B" strokeWidth="3" strokeLinecap="round" filter={`url(#${g("wh-glow")})`} />
          <circle cx="82" cy="44" r="4.5" fill="#FF6B2B" stroke="#fff" strokeWidth="2" />
          <line x1="60" y1="60" x2="72" y2="86" stroke="#7950F2" strokeWidth="3" strokeLinecap="round" opacity={0.9} />
          <circle cx="72" cy="86" r="4.5" fill="#7950F2" stroke="#fff" strokeWidth="2" />
          <circle cx="60" cy="60" r="6" fill="#495057" stroke="#fff" strokeWidth="2.5" />
        </svg>
      );

    case "quiz":
      return (
        <svg {...base}>
          <defs>
            <linearGradient id={g("qz-card")} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>
            <filter id={g("qz-sh")}>
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.14" />
            </filter>
          </defs>
          <rect x="44" y="22" width="56" height="76" rx="10" fill="#FEF9C3" stroke="#E5E0BC" strokeWidth="1.5" opacity={0.85} transform="rotate(4 72 60)" />
          <g filter={`url(#${g("qz-sh")})`}>
            <rect x="22" y="24" width="62" height="76" rx="11" fill={`url(#${g("qz-card")})`} stroke="#D97706" strokeWidth="2" />
            <rect x="32" y="38" width="42" height="22" rx="5" fill="#fff" stroke="#F59E0B" strokeWidth="1.5" />
            <circle cx="44" cy="49" r="6" fill="#FDE68A" />
            <path d="M50 46 H66 M50 52 H60" stroke="#92400E" strokeWidth="2" strokeLinecap="round" opacity={0.65} />
            <circle cx="70" cy="48" r="9" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
            <text x="70" y="52" textAnchor="middle" fontSize="11" fontWeight="900" fill="#78350F" fontFamily={FONT}>
              ?
            </text>
            <rect x="32" y="72" width="18" height="12" rx="4" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1.2" />
            <rect x="56" y="72" width="18" height="12" rx="4" fill="#fff" stroke="#E5E7EB" strokeWidth="1.2" />
            <path d="M38 78 L42 82 L46 76" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      );

    case "fractionViz":
      return (
        <svg {...base}>
          <defs>
            <filter id={g("fv-sh")}>
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.1" />
            </filter>
          </defs>
          <g filter={`url(#${g("fv-sh")})`}>
            <rect x="16" y="68" width="46" height="46" rx="7" fill="#fff" stroke="#3B5BDB" strokeWidth="2" />
            {[
              [0, 0],
              [1, 0],
              [2, 0],
              [0, 1],
              [1, 1],
              [2, 1],
              [0, 2],
              [1, 2],
              [2, 2],
            ].map(([col, row], i) => {
              const x = 21 + col * 14;
              const y = 73 + row * 14;
              const on = [0, 1, 2, 3, 4, 5].includes(i);
              return (
                <rect
                  key={`${col}-${row}`}
                  x={x}
                  y={y}
                  width={12}
                  height={12}
                  rx={2}
                  fill={on ? "#3B5BDB" : "#E7ECFF"}
                  fillOpacity={on ? 0.55 : 0.9}
                  stroke="#B8C5F7"
                  strokeWidth={0.8}
                />
              );
            })}
          </g>
          <circle cx="86" cy="44" r="26" fill="#fff" stroke={PIE_RING_LIGHT_BLUE} strokeWidth="2" />
          <path d="M86 18 A26 26 0 0 1 108 52 L86 44 Z" fill="#7CB3FF" opacity={0.9} />
          <circle cx="86" cy="44" r="4" fill="#2B44A8" stroke="#fff" strokeWidth="1.5" />
          <line x1="68" y1="92" x2="108" y2="92" stroke="#ADB5BD" strokeWidth="2" strokeLinecap="round" />
          <line x1="68" y1="88" x2="68" y2="96" stroke="#868E96" strokeWidth="2" strokeLinecap="round" />
          <line x1="108" y1="88" x2="108" y2="96" stroke="#868E96" strokeWidth="2" strokeLinecap="round" />
          <circle cx="98" cy="78" r="3.5" fill="#FA5252" />
          <path
            d="M 86 78 A 12 12 0 0 1 98 66"
            fill="none"
            stroke="#FA5252"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );

    default:
      return (
        <svg {...base}>
          <rect x="28" y="28" width="64" height="64" rx="14" fill="#F8F9FA" stroke="#DEE2E6" strokeWidth="2" />
        </svg>
      );
  }
}
