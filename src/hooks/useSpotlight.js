import { useEffect, useRef } from "react";

/* Cursor-tracked radial glow that follows the pointer across a card (the
   MagicUI "spotlight" hover effect). Position is written straight to a
   CSS custom property on the glow layer rather than through React state
   — same reasoning as useTilt: on a purely visual effect that's never
   read back, state churn on every mousemove would re-render the whole
   tree dozens of times a second for nothing.

   Listens on the card itself (unlike useTilt, nothing here moves the
   card's own bounding box, so there's no need to split listener and
   target across two elements). Skipped entirely under
   prefers-reduced-motion — the layer then just never receives an
   update and stays fully transparent. */
function useSpotlight() {
  const cardRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const onMove = event => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const layer = layerRef.current;
        if (!layer) return;
        layer.style.setProperty("--spot-x", `${x}px`);
        layer.style.setProperty("--spot-y", `${y}px`);
      });
    };

    card.addEventListener("mousemove", onMove);
    return () => {
      card.removeEventListener("mousemove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return { cardRef, layerRef };
}

export default useSpotlight;
