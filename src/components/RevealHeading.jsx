import useReveal from "../hooks/useReveal.js";

/* Reveals a section heading with a left-to-right wipe the first time it
   scrolls into view, rather than just appearing — an animated clip-path
   inset, using the same one-shot useReveal pattern as every other
   scroll-triggered effect on the page. Renders as whatever tag `as`
   specifies so it stands in for a real h2 rather than adding a wrapper
   that would change the document outline.

   The clip-path lives on an *inner* span, not the observed element
   itself: putting `clip-path: inset(0 100% 0 0)` directly on the node
   IntersectionObserver watches is self-defeating — confirmed with an
   isolated repro — since that clip collapses the target's effective
   intersection rect to zero-area in Chromium, so `isIntersecting` never
   flips true and the heading can never reveal itself. Observing an
   unclipped outer tag and clipping a plain child span avoids the loop
   entirely.

   Settles fully open under prefers-reduced-motion (clip-path still
   flips the instant useReveal fires, just without the transition)
   rather than leaving the heading permanently clipped away. */
function RevealHeading({ as: Tag = "h2", className = "", children }) {
  const [ref, inView] = useReveal();
  return (
    <Tag ref={ref} className={className}>
      <span
        className="inline-block transition-[clip-path] duration-[900ms] ease-out motion-reduce:transition-none"
        style={{ clipPath: inView ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
      >
        {children}
      </span>
    </Tag>
  );
}

export default RevealHeading;
