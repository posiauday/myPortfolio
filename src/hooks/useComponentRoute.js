import { useCallback, useEffect, useState } from "react";

const HASH_PREFIX = "#components/";

function readSelectedId() {
  const hash = window.location.hash;
  return hash.startsWith(HASH_PREFIX) ? decodeURIComponent(hash.slice(HASH_PREFIX.length)) : null;
}

/* Keeps the open component Detail page in the URL (#components/<id>)
   instead of pure React state, so the browser's back button actually
   closes it rather than leaving the visitor on a dead end, and a direct
   link to a specific component opens straight to it. Uses pushState
   rather than assigning location.hash — the latter also triggers the
   browser's own scroll-to-anchor behavior, which would fire (harmlessly
   here, but needlessly) for "#components" since a real element already
   has that id for the section nav link. */
function useComponentRoute(components) {
  const [selected, setSelected] = useState(() => {
    const id = readSelectedId();
    return id ? components.find(item => item.id === id) || null : null;
  });

  useEffect(() => {
    const onPopState = () => {
      const id = readSelectedId();
      setSelected(id ? components.find(item => item.id === id) || null : null);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [components]);

  const select = useCallback(item => {
    setSelected(item);
    window.history.pushState(null, "", `${HASH_PREFIX}${encodeURIComponent(item.id)}`);
  }, []);

  const clear = useCallback(() => {
    setSelected(null);
    window.history.pushState(null, "", "#components");
  }, []);

  return [selected, select, clear];
}

export default useComponentRoute;
