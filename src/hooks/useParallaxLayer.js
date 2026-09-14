import { useEffect, useRef } from "react";

const MAX_OFFSET = 900;

/* Drives one hero backdrop layer's scroll-parallax `translate3d`,
   writing straight to the DOM node rather than through React state.

   The previous version (`useParallax`) reported the scroll offset as
   state and let each layer recompute its inline `style` on a React
   re-render — meaning a full re-render of the whole homepage
   component on every single scroll frame, all the way through a
   large, mostly-unrelated component tree, for a transform that only
   ever touches a handful of small backdrop layers. That's the actual
   source of the jank reported on this page: on any but a very fast
   machine, a full-tree re-render can't keep pace with 60fps scroll
   input, so frames get dropped and the parallax visibly lags/stutters
   behind the cursor — while PlatformOrbit's spiral, a pure CSS
   `@keyframes` animation with no React or scroll involvement at all,
   stays smooth regardless, since it runs entirely on the compositor
   thread. This hook uses the same direct-DOM-write pattern useTilt
   and useSpotlight already use elsewhere in this codebase (see their
   own comments) — no state, so no re-render, on every frame.

   Clamped at `MAX_OFFSET` so layers stop drifting once the hero is
   long off screen, same as before. `factor` is how much this layer
   lags (positive) or leads (negative) the page; `extra` appends any
   further transform the layer also needs (only the hero-shadow layer
   uses this today). Frozen at rest under prefers-reduced-motion,
   consistent with every other scroll-tied effect on this page. */
function useParallaxLayer(factor, extra = "") {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const apply = () => {
      const p = Math.min(window.scrollY, MAX_OFFSET);
      el.style.transform = `translate3d(0,${p * factor}px,0)${extra}`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        apply();
      });
    };

    const sync = () => {
      window.removeEventListener("scroll", onScroll);
      if (query.matches) {
        el.style.transform = extra || "none";
      } else {
        apply();
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
  }, [factor, extra]);

  return ref;
}

export default useParallaxLayer;
