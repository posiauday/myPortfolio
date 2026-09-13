/* ============================================================
   COMPONENT PREVIEW (the small mockup shown in the Detail page)
   `values` (name -> current value, from the detail page's live
   configurator) is honored only where a component's own mockup
   already reads specific properties by name — today, just Executive
   KPI Card's Label/Value/Trend/Status. Every other component's
   mockup is a fixed illustration regardless of what's edited in the
   configurator; the YAML output next to it always reflects the edit
   either way. Wiring every mockup to every property would mean
   hand-authoring a real renderer per component, not a documentation
   preview — out of scope here, and the detail page says so next to
   the configurator rather than implying more fidelity than this
   provides.
   ============================================================ */
function ComponentPreview({ item, values = {} }) {
  if (item.title === "Portfolio Risk Matrix") {
    return <div className="grid grid-cols-3 gap-2">{[1, 2, 1, 3, 4, 2, 1, 3, 5].map((n, i) => <div key={i} className="grid aspect-square place-items-center rounded-xl font-black text-slate-900" style={{ background: ["#DCFCE7", "#FEF3C7", "#FEE2E2"][Math.floor(i / 3)] }}>{n}</div>)}</div>;
  }
  if (item.title === "Executive KPI Card") {
    const label = values.Label ?? "Active projects";
    const value = values.Value ?? "156";
    const trend = values.Trend ?? "12.4";
    const trendUp = !String(trend).startsWith("-");
    const status = values.Status ?? "On track";
    return (
      <div>
        <span className="text-sm text-slate-500">{label}</span>
        <div className="mt-2 flex items-end justify-between">
          <b className="text-5xl">{value}</b>
          <span className={`rounded-full px-3 py-1 text-xs font-black ${trendUp ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {trendUp ? "▲" : "▼"} {String(trend).replace("-", "")}%
          </span>
        </div>
        <div className="mt-6 h-2 rounded-full bg-slate-100"><div className="h-full w-3/4 rounded-full" style={{ background: item.color }} /></div>
        <span className="mt-3 block text-xs font-bold text-slate-400">{status}</span>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {["Submitted", "In review", "Approved", "Operational"].map((x, i) => (
        <div key={x} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-white/10">
          <span className="grid h-8 w-8 place-items-center rounded-full text-xs font-black text-white" style={{ background: i < 2 ? item.color : "#94A3B8" }}>{i < 2 ? "✓" : i + 1}</span>
          <b className="text-sm">{x}</b>
        </div>
      ))}
    </div>
  );
}

export default ComponentPreview;
