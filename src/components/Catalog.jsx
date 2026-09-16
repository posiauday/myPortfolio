import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Grid3x3, LayoutGrid, List, Search, Sparkles } from "lucide-react";
import { categories, components, icons } from "../data/componentLibrary.js";
import { container, CONTAINER_TEXT_CLASS } from "../lib/color.js";
import ComponentCard from "./ComponentCard.jsx";

/* A dense, single-line alternative to ComponentCard's full mockup card —
   List view trades the live preview thumbnail for a scannable row, the
   same "browse by name/category, not by screenshot" tradeoff most
   component-library sites' own list view makes. Shares ComponentCard's
   icon/maturity-badge language (container()/CONTAINER_TEXT_CLASS) so
   switching views never looks like two different design systems. */
function ComponentListRow({ item, onSelect }) {
  const Icon = icons[item.category] || Sparkles;
  return (
    <button
      onClick={() => onSelect(item)}
      className="lift-hover flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm dark:border-white/10 dark:bg-white/5"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: `${item.color}18` }}>
        <Icon size={20} style={{ color: item.color }} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-black">{item.title}</h3>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${CONTAINER_TEXT_CLASS}`} style={container(item.color)}>
            {item.maturity}
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-300">{item.summary}</p>
      </div>
      <span className="hidden shrink-0 text-xs font-bold text-slate-500 dark:text-slate-400 sm:block">{item.category}</span>
      <ArrowRight size={18} className="shrink-0 text-slate-400 dark:text-slate-500" />
    </button>
  );
}

/* ============================================================
   CATALOG — the full component browsing page
   A separate full-page view (own header, replaces the whole page —
   same pattern as ComponentDetail.jsx) rather than an inline expansion
   of the homepage's featured grid, so browsing the entire design
   system reads as its own place to be, not a homepage section that
   grew too tall. Search/category/maturity/view state all live here,
   local to this page, and reset each time it's opened — deliberately
   not shared with the homepage, which only ever shows its fixed 6
   featured picks.

   Category pills, a secondary maturity toggle, a grid/list view
   switch, and a real stats strip under the results are the same
   organizing pattern real component-library catalogs (Data Table's
   own "checked against Microsoft's own real canvas Data table
   control" research turned up several) converge on — every count
   here is computed from this catalog's own real data, never a fixed
   or aspirational number. */
function Catalog({ dark, onSelect, onBack }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [maturity, setMaturity] = useState("All");
  const [view, setView] = useState("grid");

  const maturities = useMemo(() => ["All", ...new Set(components.map(c => c.maturity))], []);

  const shown = useMemo(
    () =>
      components.filter(
        c =>
          (category === "All" || c.category === category) &&
          (maturity === "All" || c.maturity === maturity) &&
          `${c.title} ${c.category} ${c.summary}`.toLowerCase().includes(query.toLowerCase())
      ),
    [query, category, maturity]
  );

  const stats = useMemo(
    () => [
      { value: components.length, label: "Total components" },
      { value: categories.length - 1, label: "Categories" },
      { value: components.filter(c => c.maturity === "Verified").length, label: "Verified" }
    ],
    []
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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#168326] dark:text-[#4ADE80]">Design system</p>
            <h1 className="mt-3 text-4xl font-black sm:text-6xl">All {components.length} components.</h1>
          </div>
          <div className="hidden shrink-0 rounded-full border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/5 sm:flex">
            <button
              onClick={() => setView("grid")}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              title="Grid view"
              className={`rounded-full p-2.5 transition-colors ${view === "grid" ? "bg-[#168326] text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              aria-pressed={view === "list"}
              title="List view"
              className={`rounded-full p-2.5 transition-colors ${view === "list" ? "bg-[#168326] text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          Search or filter by category, then open any one for its full contract &mdash; Properties, Events,
          Architecture, Examples, Accessibility, Limitations &mdash; plus generated, schema-conformant YAML.
        </p>

        <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:justify-between">
          <label className="flex min-h-12 w-full max-w-xl items-center gap-3 rounded-full border border-slate-200 px-5 dark:border-white/10">
            <Search size={18} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search components" className="w-full bg-transparent outline-none" />
          </label>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map(x => {
            const Icon = x === "All" ? Grid3x3 : icons[x] || Sparkles;
            const count = x === "All" ? components.length : components.filter(c => c.category === x).length;
            return (
              <button
                key={x}
                onClick={() => setCategory(x)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${category === x ? "bg-[#168326] text-white" : "bg-slate-100 text-[#17201B] hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"}`}
              >
                <Icon size={14} />
                {x}
                <span className={category === x ? "text-white" : "text-slate-500 dark:text-slate-400"}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Maturity:</span>
          {maturities.map(m => {
            const count = m === "All" ? components.length : components.filter(c => c.maturity === m).length;
            return (
              <button
                key={m}
                onClick={() => setMaturity(m)}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${maturity === m ? "bg-[#17201B] text-white dark:bg-white dark:text-[#0B1110]" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15"}`}
              >
                {m} <span className="opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        <h2 className="sr-only">All components</h2>
        {shown.length === 0 ? (
          <p className="mt-16 text-center text-sm font-bold text-slate-600 dark:text-slate-300">No components match that search and filters.</p>
        ) : view === "grid" ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map(c => <ComponentCard key={c.id} item={c} onSelect={onSelect} />)}
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-3">
            {shown.map(c => <ComponentListRow key={c.id} item={c} onSelect={onSelect} />)}
          </div>
        )}

        <div className="mt-16 border-t border-slate-200 pt-10 dark:border-white/10">
          <div className="grid grid-cols-2 gap-8 text-center sm:flex sm:flex-wrap sm:justify-center sm:gap-12">
            {stats.map(s => (
              <div key={s.label}>
                <div className="text-2xl font-black">{s.value}</div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Catalog;
