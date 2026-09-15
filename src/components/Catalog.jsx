import { useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { categories, components } from "../data/componentLibrary.js";
import ComponentCard from "./ComponentCard.jsx";

/* ============================================================
   CATALOG — the full component browsing page
   A separate full-page view (own header, replaces the whole page —
   same pattern as ComponentDetail.jsx) rather than an inline expansion
   of the homepage's featured grid, so browsing the entire design
   system reads as its own place to be, not a homepage section that
   grew too tall. Search and category state live here, local to this
   page, and reset each time it's opened — deliberately not shared
   with the homepage, which only ever shows its fixed 6 featured picks.
   ============================================================ */
function Catalog({ dark, onSelect, onBack }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const shown = useMemo(
    () => components.filter(c => (category === "All" || c.category === category) && `${c.title} ${c.category} ${c.summary}`.toLowerCase().includes(query.toLowerCase())),
    [query, category]
  );

  return (
    <main className={dark ? "dark min-h-screen bg-[#0B1110] text-white" : "min-h-screen bg-[#FBFDFB] text-[#17201B]"}>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-[#101816]/95">
        {/* One exit action, not two — this page has no prev/next or
            other cluster of controls the way ComponentDetail.jsx does,
            where a right-side X reads as "close" alongside its own
            separate prev/next buttons. Here it was just this same
            onBack handler wired to both ends of an otherwise-empty bar,
            which on a narrow screen (where "All components" itself was
            already hidden) meant two identical, unlabeled-looking exits
            and nothing recognizable between them. */}
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <button onClick={onBack} className="flex items-center gap-2 font-bold"><ArrowLeft size={18} /> Home</button>
          <b>All components</b>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[#168326] dark:text-[#4ADE80]">Design system</p>
        <h1 className="mt-3 text-4xl font-black sm:text-6xl">All {components.length} components.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          Search or filter by category, then open any one for its full contract &mdash; Properties, Events,
          Architecture, Examples, Accessibility, Limitations &mdash; plus generated, schema-conformant YAML.
        </p>

        <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:justify-between">
          <label className="flex min-h-12 w-full max-w-xl items-center gap-3 rounded-full border border-slate-200 px-5 dark:border-white/10">
            <Search size={18} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search components" className="w-full bg-transparent outline-none" />
          </label>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map(x => (
              <button key={x} onClick={() => setCategory(x)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${category === x ? "bg-[#168326] text-white" : "bg-slate-100 dark:bg-white/10"}`}>
                {x}
              </button>
            ))}
          </div>
        </div>

        <h2 className="sr-only">All components</h2>
        {shown.length === 0 ? (
          <p className="mt-16 text-center text-sm font-bold text-slate-600 dark:text-slate-300">No components match that search and category.</p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map(c => <ComponentCard key={c.id} item={c} onSelect={onSelect} />)}
          </div>
        )}
      </div>
    </main>
  );
}

export default Catalog;
