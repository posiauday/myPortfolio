import { useEffect, useRef, useState } from "react";

/* Like useReveal, but for a list rendered from data (unknown length at
   author time) rather than one fixed element — a single React hook can't
   be called once per array item, so this manages one ref slot and one
   IntersectionObserver per index instead. Each item flips to `true` the
   first time it scrolls into view and stays revealed after that. */
function useRevealEach(count) {
  const refs = useRef([]);
  const [inView, setInView] = useState(() => Array(count).fill(false));

  useEffect(() => {
    setInView(prev => {
      if (prev.length === count) return prev;
      const next = Array(count).fill(false);
      prev.forEach((v, i) => {
        if (i < count) next[i] = v;
      });
      return next;
    });
  }, [count]);

  useEffect(() => {
    const observers = refs.current.map((el, index) => {
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          setInView(prev => {
            if (prev[index]) return prev;
            const next = [...prev];
            next[index] = true;
            return next;
          });
          observer.unobserve(el);
        },
        { threshold: 0.15 }
      );
      observer.observe(el);
      return observer;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, [count]);

  return [refs, inView];
}

export default useRevealEach;
