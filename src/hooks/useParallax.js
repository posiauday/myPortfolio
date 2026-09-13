import { useEffect, useState } from "react";

/* Reports the window scroll offset, throttled to one update per animation
   frame, for layers that should drift at different rates. Returns a frozen 0
   whenever the visitor has asked for reduced motion, so every consumer
   collapses to a still layout without needing its own guard. */
function useParallax() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let attached = false;

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setOffset(window.scrollY);
      });
    };

    const attach = () => {
      if (attached) return;
      attached = true;
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    };

    const detach = () => {
      if (!attached) return;
      attached = false;
      window.removeEventListener("scroll", onScroll);
      setOffset(0);
    };

    const sync = () => (query.matches ? detach() : attach());
    sync();
    query.addEventListener("change", sync);

    return () => {
      query.removeEventListener("change", sync);
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return offset;
}

export default useParallax;
