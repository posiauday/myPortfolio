import { useEffect, useRef } from "react";

/* Mouse-tracked 3D tilt (the classic "vanilla-tilt" effect): the card
   rotates toward the cursor with a `perspective()/rotateX()/rotateY()`
   transform, plus a radial "glare" highlight that follows the pointer for
   depth. Style is written straight to the DOM nodes in the move handler
   rather than through React state, since state churn on every mousemove
   would re-render the whole tree dozens of times a second for no visible
   benefit — this only ever touches two elements directly.

   Listeners attach to `wrapperRef`, a plain untransformed element, while
   the rotate/scale transform is applied to a separate `cardRef` nested
   inside it. Putting the transform on the same element being listened to
   causes real hit-testing glitches: rotating or scaling an element moves
   its own rendered bounding box, so a stationary cursor can end up
   outside that new box mid-gesture and the browser fires a spurious
   mouseleave — worst right at the corners, which is also where the tilt
   is strongest. Listening on a static ancestor instead keeps hit-testing
   stable regardless of how the inner card is currently transformed.

   Transition duration is swapped per-event: near-instant while actively
   tracking the cursor (so the tilt doesn't lag behind it), eased back to
   flat over ~0.6s on mouseleave so it settles rather than snapping.
   Skipped entirely under prefers-reduced-motion, leaving the card flat.

   An optional third element, `shadowRef`, gets a cast shadow that grows
   and shifts opposite the cursor as the card rotates toward it — without
   it, a rotated flat plane still reads as flat, since nothing in the
   image otherwise implies it has lifted off the page. Purely additive:
   omit it and the hook behaves exactly as before. */
function useTilt({ max = 10, scale = 1.02, shadowMax = 26 } = {}) {
  const wrapperRef = useRef(null);
  const cardRef = useRef(null);
  const glareRef = useRef(null);
  const shadowRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const onMove = event => {
      const rect = wrapper.getBoundingClientRect();
      const px = ((event.clientX - rect.left) / rect.width) * 100;
      const py = ((event.clientY - rect.top) / rect.height) * 100;
      const rotateY = ((px - 50) / 50) * max;
      const rotateX = -((py - 50) / 50) * max;

      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const card = cardRef.current;
        if (!card) return;
        card.style.transition = "transform 60ms linear";
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
        if (glareRef.current) {
          glareRef.current.style.opacity = "1";
          glareRef.current.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,.55), transparent 55%)`;
        }
        if (shadowRef.current) {
          const shadowX = -((px - 50) / 50) * shadowMax;
          const shadowY = 18 + ((py - 50) / 50) * (shadowMax * 0.4);
          shadowRef.current.style.transition = "box-shadow 60ms linear";
          shadowRef.current.style.boxShadow = `${shadowX}px ${shadowY}px 45px -10px rgba(15,23,42,.5)`;
        }
      });
    };

    const onLeave = () => {
      if (frame) cancelAnimationFrame(frame);
      const card = cardRef.current;
      if (card) {
        card.style.transition = "transform 600ms cubic-bezier(0.23,1,0.32,1)";
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
      }
      if (glareRef.current) glareRef.current.style.opacity = "0";
      if (shadowRef.current) {
        shadowRef.current.style.transition = "box-shadow 600ms cubic-bezier(0.23,1,0.32,1)";
        shadowRef.current.style.boxShadow = "";
      }
    };

    wrapper.addEventListener("mousemove", onMove);
    wrapper.addEventListener("mouseleave", onLeave);
    return () => {
      wrapper.removeEventListener("mousemove", onMove);
      wrapper.removeEventListener("mouseleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [max, scale, shadowMax]);

  return { wrapperRef, cardRef, glareRef, shadowRef };
}

export default useTilt;
