import { useState, useEffect } from "react";

/**
 * Returns true when the viewport width is below the given breakpoint (default 768px).
 * Uses MediaQueryList for efficient resize detection without window resize events.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}
