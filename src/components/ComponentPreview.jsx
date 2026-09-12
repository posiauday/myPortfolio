/* ============================================================
   COMPONENT PREVIEW (the small mockup shown in the Detail page)
   ============================================================ */
function ComponentPreview({ item }) {
  if (item.title === "Portfolio Risk Matrix") {
    return <div className="grid grid-cols-3 gap-2">{[1, 2, 1, 3, 4, 2, 1, 3, 5].map((n, i) => <div key={i} className="grid aspect-square place-items-center rounded-xl font-black text-slate-900" style={{ background: ["#DCFCE7", "#FEF3C7", "#FEE2E2"][Math.floor(i / 3)] }}>{n}</div>)}</div>;
  }
  if (item.title === "Executive KPI Card") {
    return (
      <div>
        <span className="text-sm text-slate-500">Active projects</span>
        <div className="mt-2 flex items-end justify-between"><b className="text-5xl">156</b><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">&#9650; 12.4%</span></div>
        <div className="mt-6 h-2 rounded-full bg-slate-100"><div className="h-full w-3/4 rounded-full" style={{ background: item.color }} /></div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {["Submitted", "In review", "Approved", "Operational"].map((x, i) => (
        <div key={x} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-white/10">
          <span className="grid h-8 w-8 place-items-center rounded-full text-xs font-black text-white" style={{ background: i < 2 ? item.color : "#94A3B8" }}>{i < 2 ? "\u2713" : i + 1}</span>
          <b className="text-sm">{x}</b>
        </div>
      ))}
    </div>
  );
}

export default ComponentPreview;
