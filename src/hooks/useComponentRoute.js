import { useCallback, useEffect, useRef, useState } from "react";

const DETAIL_PREFIX = "#components/";
const CATALOG_HASH = "#catalog";
const HOME_HASH = "#components";

/* Resolves the current URL hash into one of three views: a component
   Detail page, the full Catalog page, or the homepage. An unrecognized
   #components/<id> falls back to home rather than erroring. */
function resolveView(hash, components) {
  if (hash.startsWith(DETAIL_PREFIX)) {
    const item = components.find(c => c.id === decodeURIComponent(hash.slice(DETAIL_PREFIX.length)));
    if (item) return { name: "detail", item };
  }
  if (hash === CATALOG_HASH) return { name: "catalog" };
  return { name: "home" };
}

/* Keeps three views — homepage, the full Catalog page, and a component
   Detail page — in the URL as a single state machine, rather than three
   independent pieces of state, so opening a component always remembers
   exactly which of the other two it was opened from and closing it goes
   back there. A three-independent-hooks version of this was tried first
   and abandoned: `history.pushState` (used everywhere here, deliberately,
   over assigning `location.hash` — see below) never fires a `popstate`
   event, so a pushState call made inside one hook has no way to notify a
   *different* hook's own state that the URL just changed elsewhere. One
   hook owning one `view` value sidesteps that entirely: every transition,
   wherever it's triggered from, updates the same state directly.

   pushState over `location.hash =`: the latter also triggers the
   browser's own scroll-to-anchor behavior, which matters here since a
   real element has the id "components" for the homepage section nav
   link — assigning that hash while showing Catalog or Detail (which
   replace the whole page, so that element doesn't even exist in the DOM
   at that moment) would be a no-op today, but a real bug waiting for the
   day something does share that id.

   The browser back/forward buttons still work correctly: real back/
   forward navigation *does* fire `popstate`, which is the one case this
   hook listens for and re-resolves the view from the resulting hash. */
function useComponentRoute(components) {
  const [view, setView] = useState(() => resolveView(window.location.hash, components));
  const returnHashRef = useRef(HOME_HASH);

  useEffect(() => {
    const onPopState = () => setView(resolveView(window.location.hash, components));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [components]);

  const openComponent = useCallback(item => {
    returnHashRef.current = window.location.hash || HOME_HASH;
    window.history.pushState(null, "", `${DETAIL_PREFIX}${encodeURIComponent(item.id)}`);
    setView({ name: "detail", item });
  }, []);

  const openCatalog = useCallback(() => {
    window.history.pushState(null, "", CATALOG_HASH);
    setView({ name: "catalog" });
  }, []);

  const goHome = useCallback(() => {
    window.history.pushState(null, "", HOME_HASH);
    setView({ name: "home" });
  }, []);

  // Returns to whichever of Catalog or home a component was actually
  // opened from, rather than always landing on home — the same
  // returnHashRef a direct link (no prior in-app navigation) falls back
  // to home for, same as the id-not-found case in resolveView.
  const closeDetail = useCallback(() => {
    const target = returnHashRef.current;
    window.history.pushState(null, "", target);
    setView(resolveView(target, components));
  }, [components]);

  return { view, openComponent, openCatalog, goHome, closeDetail };
}

export default useComponentRoute;
