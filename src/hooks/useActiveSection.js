import { useEffect, useRef, useState } from "react";

/* Scroll-spy for the nav: reports which of the given section ids is
   currently "in view" so the nav can highlight it. A single
   IntersectionObserver watches all sections at once, with a thin
   trigger band roughly a third of the way down the viewport — narrow
   enough that only one section is realistically active at a time, but
   forgiving enough that a short section (Recognition, at the very
   bottom) still gets picked up before the page runs out of scroll.
   When more than one section reports intersecting in the same tick
   (fast scroll, section boundaries), the last one in DOM order wins,
   since that's the one the user scrolled past into. Pass a
   module-level (referentially stable) ids array — an inline literal
   would re-run the effect on every render. */
export default function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0] ?? null);
  const intersecting = useRef(new Set());

  useEffect(() => {
    const elements = ids.map(id => document.getElementById(id)).filter(Boolean);
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) intersecting.current.add(entry.target.id);
          else intersecting.current.delete(entry.target.id);
        });
        const current = ids.filter(id => intersecting.current.has(id));
        if (current.length) setActive(current[current.length - 1]);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
