import { useMemo, useState } from "react";
import { ArrowLeft, Check, Copy, Search } from "lucide-react";
import { cheatSheetCategories, cheatSheetFormulas, issuesWithFix, issuesWithoutFix } from "../data/cheatSheet.js";
import useCopyFeedback from "../hooks/useCopyFeedback.js";

const BADGE_STYLE = {
  DELEGABLE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  "NOT DELEGABLE": "bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300",
  DEPENDS: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"
};

/* One formula card: title, optional delegation badge, its code (in the
   same always-dark .code-panel every YAML/docs code block in this site
   already uses — a code block reads as a code block regardless of the
   page's own light/dark toggle), an optional verified note, and a Copy
   button reusing the same useCopyFeedback hook ComponentDetail.jsx's
   own Copy YAML/Copy Docs buttons already use. */
function FormulaCard({ item, copied, copy }) {
  return (
    <div className="min-w-0 flex flex-col rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-bold">{item.title}</h3>
        {item.badge && (
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${BADGE_STYLE[item.badge]}`}>
            {item.badge}
          </span>
        )}
      </div>
      {/* min-w-0 on both this card (a CSS grid item) and the <pre> itself
          (a flex item of this card's own flex column) — without it, a
          flex/grid item's default min-width is its content's min-content
          size, so .code-panel's unwrapped long lines blew the card, the
          grid track, and the whole page wider than the viewport instead
          of scrolling horizontally inside .code-panel's own overflow:auto
          the way they were meant to. A real phone-width bug, not a
          device quirk — this is the actual fix, not a workaround. */}
      <pre tabIndex={0} aria-label={`Code for ${item.title}`} className="code-panel mt-3 min-w-0 text-[11px]"><code>{item.code}</code></pre>
      <div className="mt-3 flex flex-1 items-end justify-between gap-3">
        {item.note ? <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">{item.note}</p> : <span />}
        <button type="button" className="copy-btn light shrink-0" onClick={() => copy(item.code, item.id)}>
          {copied === item.id ? <Check size={14} /> : <Copy size={14} />} {copied === item.id ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function IssueCard({ item, tone }) {
  const isFix = tone === "fix";
  return (
    <div className={`min-w-0 rounded-2xl border p-5 ${isFix ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-400/20 dark:bg-emerald-400/5" : "border-amber-200 bg-amber-50/60 dark:border-amber-400/20 dark:bg-amber-400/5"}`}>
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${isFix ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"}`}>
        {isFix ? "Has a fix" : "No real fix — design around it"}
      </span>
      <h3 className="mt-2 font-black leading-6">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.summary}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200"><b className="font-bold">{isFix ? "Fix: " : "Why not: "}</b>{isFix ? item.fix : item.why}</p>
      <p className="mt-3 break-words text-xs font-bold text-slate-500 dark:text-slate-400">{item.source}</p>
    </div>
  );
}

/* ============================================================
   POWER FX CHEAT SHEET — a separate full-page view, same pattern as
   Catalog.jsx (own header, replaces the whole page). Two modes:
   Formulas (search + category filter over verified quick-reference
   snippets) and Real Issues (a curated, verified split of genuinely
   common Power Apps problems — ones with a documented fix, and ones
   that are permanent platform constraints with none). See
   src/data/cheatSheet.js's own header comment for how this content
   was sourced and verified.
   ============================================================ */
function CheatSheet({ dark, onBack }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [mode, setMode] = useState("formulas");
  const [copied, copy] = useCopyFeedback();

  const shown = useMemo(
    () => cheatSheetFormulas.filter(f => (category === "All" || f.category === category) && `${f.title} ${f.category} ${f.code} ${f.note ?? ""}`.toLowerCase().includes(query.toLowerCase())),
    [query, category]
  );

  return (
    <main className={dark ? "dark min-h-screen bg-[#0B1110] text-white" : "min-h-screen bg-[#FBFDFB] text-[#17201B]"}>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-[#101816]/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <button onClick={onBack} className="flex items-center gap-2 font-bold"><ArrowLeft size={18} /> Home</button>
          <b>Power Fx Cheat Sheet</b>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[#168326] dark:text-[#4ADE80]">Quick reference</p>
        <h1 className="mt-3 text-4xl font-black sm:text-6xl">{cheatSheetFormulas.length} formulas, verified.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          Reconstructed from a real published Power Fx reference and independently checked against Microsoft&rsquo;s
          own Power Fx docs &mdash; delegation badges, enum names and function signatures included, not just
          re-typed from a guess. The Real Issues tab is a separate, brainstormed pass: genuinely common Power
          Apps problems, split into ones with a documented fix and ones that are permanent platform constraints
          with none.
        </p>

        <div className="mt-8 flex gap-2">
          <button onClick={() => setMode("formulas")} className={`rounded-full px-5 py-2.5 text-sm font-bold ${mode === "formulas" ? "bg-[#168326] text-white" : "bg-slate-100 dark:bg-white/10"}`}>Formulas</button>
          <button onClick={() => setMode("issues")} className={`rounded-full px-5 py-2.5 text-sm font-bold ${mode === "issues" ? "bg-[#168326] text-white" : "bg-slate-100 dark:bg-white/10"}`}>Real issues</button>
        </div>

        {mode === "formulas" ? (
          <>
            <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:justify-between">
              <label className="flex min-h-12 w-full max-w-xl items-center gap-3 rounded-full border border-slate-200 px-5 dark:border-white/10">
                <Search size={18} />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search formulas" className="w-full bg-transparent outline-none" />
              </label>
              <div className="flex gap-2 overflow-x-auto">
                {["All", ...cheatSheetCategories].map(x => (
                  <button key={x} onClick={() => setCategory(x)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${category === x ? "bg-[#168326] text-white" : "bg-slate-100 dark:bg-white/10"}`}>
                    {x}
                  </button>
                ))}
              </div>
            </div>

            <h2 className="sr-only">Formulas</h2>
            {shown.length === 0 ? (
              <p className="mt-16 text-center text-sm font-bold text-slate-600 dark:text-slate-300">No formulas match that search and category.</p>
            ) : (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map(item => <FormulaCard key={item.id} item={item} copied={copied} copy={copy} />)}
              </div>
            )}
          </>
        ) : (
          <div className="mt-10 space-y-12">
            <section>
              <h2 className="text-2xl font-black">Has a documented fix</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">A known cause, checked against Microsoft&rsquo;s own docs (or this project&rsquo;s own verified finding), and a real way to actually close it.</p>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {issuesWithFix.map((item, i) => <IssueCard key={i} item={item} tone="fix" />)}
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-black">No real fix &mdash; design around it</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">A permanent platform constraint &mdash; not a bug, and not something a formula trick removes. The right move is a different approach, not a workaround for the constraint itself.</p>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {issuesWithoutFix.map((item, i) => <IssueCard key={i} item={item} tone="no-fix" />)}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

export default CheatSheet;
