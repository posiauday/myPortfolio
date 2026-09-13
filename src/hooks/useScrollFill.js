import { useEffect, useRef, useState } from "react";

/* Tracks how far a container has scrolled through the viewport as a 0-1
   "fill" progress, for a timeline rail that draws itself in as you scroll
   past it (the MagicUI "animated timeline" effect) rather than appearing
   all at once. Progress reaches 1 once the container's bottom has scrolled
   up past ~15% of the viewport height, so the line finishes drawing a
   little before the section itself scrolls out of view.

   Under prefers-reduced-motion the line renders fully drawn immediately —
   skipping the scroll-tied growth, not leaving it perpetually empty. */
function useScrollFill() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

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

  return [ref, progress];
}

export default useScrollFill;
