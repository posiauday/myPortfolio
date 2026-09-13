import { useEffect, useRef } from "react";

/* Magnetic hover: the element eases a few pixels toward the cursor while
   the pointer is near it, and eases back to rest on leave — a small,
   tasteful "the button wants to be pressed" microinteraction. Style is
   written straight to the DOM in the move handler, same reasoning as
   useTilt/useSpotlight: state churn on every mousemove for a purely
   visual effect would re-render for no benefit.

   Unlike useTilt, this listens and transforms the *same* element: a
   translation of only a few pixels (capped by `max`) is nowhere near
   enough to move the element's own hit-test box out from under a
   stationary cursor the way a multi-degree rotate/scale can, so the
   split-element pattern that hook needs to avoid a spurious mouseleave
   doesn't apply here.

   `strength` scales how far it travels relative to the pointer's offset
   from the element's center. Skipped entirely under
   prefers-reduced-motion, leaving the element stationary. */
function useMagnetic({ strength = 0.3, max = 10 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const onMove = event => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);
      const dx = Math.max(-max, Math.min(max, x * strength));
      const dy = Math.max(-max, Math.min(max, y * strength));

      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.transition = "transform 80ms linear";
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });
    };

    const onLeave = () => {
      if (frame) cancelAnimationFrame(frame);
      el.style.transition = "transform 400ms cubic-bezier(0.23,1,0.32,1)";
      el.style.transform = "translate(0, 0)";
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [strength, max]);

  return ref;
}

export default useMagnetic;
