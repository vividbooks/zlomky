import { useEffect, useState } from "react";

/** Pod ~1024px skládáme dvou- a tříslopcové moduly pod sebe (mobil / tablet na výšku / starší tablety). */
export const ZLOMK_NARROW_BREAKPOINT_PX = 1024;

/** Telefony a úzké portréty — extra kompaktní UI, scroll místo fixed viewport, žádné vynucené min. šířky osy. */
export const ZLOMK_PHONE_BREAKPOINT_PX = 640;

export function useZlomkNarrowLayout(breakpointPx: number = ZLOMK_NARROW_BREAKPOINT_PX) {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(`(max-width: ${breakpointPx}px)`).matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx}px)`);
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [breakpointPx]);
  return narrow;
}

export function useZlomkPhoneLayout(breakpointPx: number = ZLOMK_PHONE_BREAKPOINT_PX) {
  const [phone, setPhone] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(`(max-width: ${breakpointPx}px)`).matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx}px)`);
    const sync = () => setPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [breakpointPx]);
  return phone;
}

/** Veřejné cesty Zlomkárny (relativní k `import.meta.env.BASE_URL`). */

export const PATH_UCIME_SE = "/ucime-se";
export const PATH_SOUTEZ = "/soutez";

export type HomeSection = "learn" | "compete";

export function homeHref(section: HomeSection): string {
  return section === "learn" ? PATH_UCIME_SE : PATH_SOUTEZ;
}

export function moduleHref(section: HomeSection, moduleId: string): string {
  return `${homeHref(section)}/${moduleId}`;
}

export type ParsedZlomkRoute =
  | { section: HomeSection; moduleId: null }
  | { section: HomeSection; moduleId: string }
  | null;

/**
 * `pathname` z `useLocation()` (u React Router obvykle bez basename; volitelně ořízne `basename`, když je v řetězci zahrnutý).
 */
export function parseZlomkPath(pathname: string, basename: string): ParsedZlomkRoute {
  const base = basename.replace(/\/$/, "");
  let p = pathname.replace(/\/$/, "") || "/";
  if (base && (p === base || p.startsWith(`${base}/`))) {
    p = p.slice(base.length) || "/";
  }
  if (p === "/" || p === "") return null;

  const parts = p.split("/").filter(Boolean);
  if (parts[0] === "ucime-se") {
    if (parts.length === 1) return { section: "learn", moduleId: null };
    if (parts.length === 2) return { section: "learn", moduleId: parts[1]! };
    return null;
  }
  if (parts[0] === "soutez") {
    if (parts.length === 1) return { section: "compete", moduleId: null };
    if (parts.length === 2) return { section: "compete", moduleId: parts[1]! };
    return null;
  }
  return null;
}
