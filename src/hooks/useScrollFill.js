import { useEffect, useRef } from "react";

/* Draws a timeline rail's gradient "fill" and travelling beam dot in as
   you scroll past it (the MagicUI "animated timeline" effect), tracking
   how far the container has scrolled through the viewport as a 0-1
   progress value. Progress reaches 1 once the container's bottom has
   scrolled up past ~15% of the viewport height, so the line finishes
   drawing a little before the section itself scrolls out of view.

   Writes `height`/`top` straight to the fill and beam elements via
   their own refs, rather than keeping progress in React state — the
   previous version did the latter, which meant a React re-render of
   the whole Experience section (all the cards, spotlight layers, the
   lot) on every single scroll frame. That's the actual source of the
   lag reported on this rail specifically: a CSS `transition` on the
   fill's `height` (removed now) was also fighting those per-frame
   state updates, so instead of tracking the scroll position directly
   the line was chasing a constantly-moving target through a 300ms
   ease every frame — a visible rubber-band lag on top of the
   re-render cost. Direct ref writes here match the pattern
   useTilt/useSpotlight already use elsewhere in this codebase.

   Under prefers-reduced-motion the line renders fully drawn
   immediately — skipping the scroll-tied growth, not leaving it
   perpetually empty. */
function useScrollFill() {
  const containerRef = useRef(null);
  const fillRef = useRef(null);
  const beamRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const setProgress = value => {
      const pct = `${value * 100}%`;
      if (fillRef.current) fillRef.current.style.height = pct;
      if (beamRef.current) beamRef.current.style.top = pct;
    };

    const compute = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh * 0.5;
      const scrolled = vh * 0.85 - rect.top;
      setProgress(Math.min(1, Math.max(0, scrolled / total)));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        compute();
      });
    };

    const sync = () => {
      window.removeEventListener("scroll", onScroll);
      if (query.matches) {
        setProgress(1);
      } else {
        compute();
        window.addEventListener("scroll", onScroll, { passive: true });
      }
    };

    sync();
    query.addEventListener("change", sync);
    return () => {
      query.removeEventListener("change", sync);
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return { containerRef, fillRef, beamRef };
}

export default useScrollFill;
