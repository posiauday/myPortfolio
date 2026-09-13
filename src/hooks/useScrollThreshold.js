import { useEffect, useState } from "react";

/* Reports whether the page has scrolled past `threshold`, throttled to
   one check per animation frame — for UI that reacts to "has the visitor
   started scrolling" as a boolean, unlike useParallax's continuous
   offset. Deliberately NOT frozen under prefers-reduced-motion the way
   useParallax is: a compacting nav bar is a discrete density change, not
   drifting motion, so it should keep working either way. A consumer that
   also transitions size/blur on this value should pair it with
   `motion-reduce:transition-none` so the change snaps instantly instead
   of animating, rather than skipping the feature outright. */
function useScrollThreshold(threshold = 24) {
  const [past, setPast] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setPast(window.scrollY > threshold);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return past;
}

export default useScrollThreshold;
