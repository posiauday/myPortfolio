import { useEffect, useState } from "react";
import useReveal from "../hooks/useReveal.js";

/* Counts up from 0 to `value` the first time it scrolls into view (the
   MagicUI "number ticker" effect) — useReveal already only fires once,
   so this never re-runs on repeat scrolls past it. Eased with a cubic
   ease-out so it settles rather than stopping abruptly.

   Under prefers-reduced-motion it skips straight to the final value
   instead of animating the count. */
function NumberTicker({ value, duration = 1200, className }) {
  const [ref, inView] = useReveal();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    let frame = 0;
    const tick = now => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString()}
    </span>
  );
}

export default NumberTicker;
