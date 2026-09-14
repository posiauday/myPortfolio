import { buildLinePath } from "../lib/svgPath.js";
import { darken, lighten } from "../lib/color.js";

/* ============================================================
   COMPONENT PREVIEW (the small mockup shown in the Detail page)
   `values` (name -> current value, from the detail page's live
   configurator) is honored only where a component's own mockup already
   reads specific properties by name — Executive KPI Card's Label/Value/
   Trend/Status/ShowSparkline is the deepest example. Every other
   component's mockup is a fixed illustration regardless of what's
   edited in the configurator; the YAML output next to it always
   reflects the edit either way. Wiring every mockup to every property
   would mean hand-authoring a real renderer per component, not a
   documentation preview — out of scope here, and the detail page says
   so next to the configurator rather than implying more fidelity than
   this provides.

   Each `if` below is a real, bespoke illustration of that specific
   named component — a calendar mockup actually draws a month grid, a
   data table mockup actually draws rows and columns — rather than
   every component falling through to one generic "status list" shape
   regardless of what it actually is. That fallback still exists at the
   bottom for the components not yet given their own mockup.
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
    const showSparkline = (values.ShowSparkline ?? "false") === "true";
    const sparkValues = [40, 44, 42, 50, 48, 55, 53, 60, 58, 65, 70, 78];
    const { linePath, areaPath } = showSparkline ? buildLinePath(sparkValues, { width: 200, height: 44, padding: 4 }) : {};
    return (
      <div>
        <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
        <div className="mt-2 flex items-end justify-between">
          <b className="text-5xl">{value}</b>
          <span className={`rounded-full px-3 py-1 text-xs font-black ${trendUp ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {trendUp ? "▲" : "▼"} {String(trend).replace("-", "")}%
          </span>
        </div>
        {/* ShowSparkline replaces the plain progress bar with a real
            trend line drawn by the same SVG technique
            ResponsiveLineChart uses — the "Chart" variant's whole point,
            demonstrated rather than only described. */}
        {showSparkline ? (
          <svg viewBox="0 0 200 44" className="mt-4 h-11 w-full" role="img" aria-label={`Trend sparkline for ${label}, ${trendUp ? "rising" : "falling"}`}>
            <defs>
              <linearGradient id="kpi-spark-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={item.color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={item.color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#kpi-spark-fill)" />
            <path d={linePath} fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <div className="mt-6 h-2 rounded-full bg-slate-100"><div className="h-full w-3/4 rounded-full" style={{ background: item.color }} /></div>
        )}
        <span className="mt-3 block text-xs font-bold text-slate-600 dark:text-slate-300">{status}</span>
      </div>
    );
  }

  if (item.title === "Responsive Line Chart") {
    const dataValues = [42, 48, 45, 58, 55, 68, 64, 72, 78, 74, 85, 92];
    const { linePath, areaPath } = buildLinePath(dataValues, { width: 320, height: 140, padding: 10 });
    const pct = Math.round(((dataValues.at(-1) - dataValues[0]) / dataValues[0]) * 100);
    return (
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Ticket volume &mdash; 12 months</span>
          <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-black text-green-700">&#9650; {pct}%</span>
        </div>
        <svg viewBox="0 0 320 140" className="mt-4 w-full" role="img" aria-label={`Line chart, ticket volume up ${pct}% over 12 months`}>
          <defs>
            <linearGradient id="line-chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={item.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={item.color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#line-chart-fill)" />
          <path d={linePath} fill="none" stroke={item.color} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <div className="mt-2 flex justify-between text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">
          <span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Dec</span>
        </div>
      </div>
    );
  }

  if (item.title === "Deadline Intelligence") {
    const daysLeft = 12;
    const totalDays = 30;
    const elapsedPct = Math.round(((totalDays - daysLeft) / totalDays) * 100);
    return (
      <div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
          <span className="text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">On track</span>
        </div>
        <div className="mt-3 flex items-end gap-2">
          <b className="text-5xl">{daysLeft}</b>
          <span className="mb-1 text-sm font-bold text-slate-500 dark:text-slate-400">business days left</span>
        </div>
        <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-white/10">
          <div className="h-full rounded-full" style={{ width: `${elapsedPct}%`, background: item.color }} />
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
          Due Nov 14 &mdash; weekends and 2 observed holidays are already excluded from the count above.
        </p>
      </div>
    );
  }

  if (item.title === "Activity Timeline") {
    const entries = [
      { title: "Case escalated to Tier 2", time: "2h ago", category: "Escalation", color: "#D83B01" },
      { title: "Comment added by J. Okafor", time: "5h ago", category: "Comment", color: "#0F6CBD" },
      { title: "Status changed to In Progress", time: "1d ago", category: "Status", color: item.color }
    ];
    return (
      <div>
        <div className="flex flex-wrap gap-1.5">
          {["All", "Escalation", "Comment", "Status"].map((f, i) => (
            <span
              key={f}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${i === 0 ? "text-white" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}
              style={i === 0 ? { background: item.color } : undefined}
            >
              {f}
            </span>
          ))}
        </div>
        <div className="relative mt-4 space-y-3 pl-5">
          <span aria-hidden="true" className="absolute inset-y-1 left-[3px] w-px bg-slate-200 dark:bg-white/10" />
          {entries.map(e => (
            <div key={e.title} className="relative rounded-xl bg-slate-50 p-3 dark:bg-white/10">
              <span aria-hidden="true" className="absolute -left-[21px] top-4 h-2 w-2 rounded-full" style={{ background: e.color }} />
              <div className="flex items-center justify-between gap-2">
                <b className="text-xs">{e.title}</b>
                <span className="shrink-0 text-[10px] font-bold text-slate-500 dark:text-slate-400">{e.time}</span>
              </div>
              <span
                className="mt-1 block text-[10px] font-bold text-[color:var(--badge-light)] dark:text-[color:var(--badge-dark)]"
                style={{ "--badge-light": darken(e.color), "--badge-dark": lighten(e.color) }}
              >
                {e.category}
              </span>
            </div>
          ))}
        </div>
        <button type="button" className="mt-4 w-full rounded-xl bg-slate-100 py-2 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">Load more</button>
      </div>
    );
  }

  if (item.title === "Enterprise Calendar") {
    const monthDays = Array.from({ length: 30 }, (_, i) => i + 1);
    const leadingBlanks = 3;
    const today = 14;
    const events = { 6: { label: "Sprint review", color: "#0F6CBD" }, 14: { label: "Release", color: item.color }, 22: { label: "Audit", color: "#C239B3" } };
    return (
      <div>
        <div className="flex items-center justify-between">
          <b className="text-sm">March 2026</b>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">Month</span>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[9px] font-black uppercase text-slate-500 dark:text-slate-400">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i}>{d}</span>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {Array.from({ length: leadingBlanks }).map((_, i) => <span key={`b${i}`} />)}
          {monthDays.map(day => (
            <div
              key={day}
              className={`relative grid aspect-square place-items-center rounded-lg text-[10px] font-bold ${day === today ? "text-white" : "text-slate-700 dark:text-slate-200"}`}
              style={day === today ? { background: item.color } : undefined}
            >
              {day}
              {events[day] && day !== today && <span aria-hidden="true" className="absolute bottom-0.5 h-1 w-1 rounded-full" style={{ background: events[day].color }} />}
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1.5">
          {Object.entries(events).map(([day, e]) => (
            <div key={day} className="flex items-center gap-2 text-[10px] font-bold">
              <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: e.color }} />
              <span className="text-slate-600 dark:text-slate-300">{e.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (item.title === "Accordion Record List") {
    const groups = [
      {
        name: "Order #4821 — Acme Corp",
        expanded: true,
        children: [
          { name: "Line 1 — Widget A x200", tag: "Shipped", color: item.color },
          { name: "Line 2 — Widget B x50", tag: "Processing", color: "#0F6CBD" }
        ]
      },
      { name: "Order #4820 — Globex Inc", expanded: false, children: [] }
    ];
    return (
      <div className="space-y-2">
        {groups.map(g => (
          <div key={g.name} className="rounded-xl border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between p-3">
              <b className="text-xs">{g.name}</b>
              <span aria-hidden="true" className={`text-slate-500 transition-transform dark:text-slate-400 ${g.expanded ? "rotate-180" : ""}`}>&#9660;</span>
            </div>
            {g.expanded && g.children.length > 0 && (
              <div className="space-y-1.5 border-t border-slate-100 p-3 dark:border-white/10">
                {g.children.map(c => (
                  <div key={c.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-white/10">
                    <span className="text-xs">{c.name}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-black text-[color:var(--badge-light)] dark:text-[color:var(--badge-dark)]"
                      style={{ background: `${c.color}18`, "--badge-light": darken(c.color), "--badge-dark": lighten(c.color) }}
                    >
                      {c.tag}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (item.title === "Enterprise Data Table") {
    const rows = [
      { name: "Website redesign", status: "On track", statusColor: item.color, priority: "High", priorityColor: "#D83B01" },
      { name: "Data migration", status: "At risk", statusColor: "#D83B01", priority: "Medium", priorityColor: "#0F6CBD" },
      { name: "Vendor onboarding", status: "Complete", statusColor: "#5B5BD6", priority: "Low", priorityColor: "#64748B" }
    ];
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
        <div className="grid grid-cols-[1.4fr_.8fr_.8fr_auto] gap-2 bg-slate-50 px-3 py-2 text-[10px] font-black uppercase text-slate-500 dark:bg-white/10 dark:text-slate-400">
          <span>Project</span><span>Status</span><span>Priority</span><span />
        </div>
        {rows.map(r => (
          <div key={r.name} className="grid grid-cols-[1.4fr_.8fr_.8fr_auto] items-center gap-2 border-t border-slate-100 px-3 py-2.5 text-xs dark:border-white/10">
            <b className="truncate">{r.name}</b>
            <span
              className="w-fit rounded-full px-2 py-0.5 text-[10px] font-black text-[color:var(--badge-light)] dark:text-[color:var(--badge-dark)]"
              style={{ background: `${r.statusColor}18`, "--badge-light": darken(r.statusColor), "--badge-dark": lighten(r.statusColor) }}
            >
              {r.status}
            </span>
            <span
              className="w-fit rounded-full px-2 py-0.5 text-[10px] font-black text-[color:var(--badge-light)] dark:text-[color:var(--badge-dark)]"
              style={{ background: `${r.priorityColor}18`, "--badge-light": darken(r.priorityColor), "--badge-dark": lighten(r.priorityColor) }}
            >
              {r.priority}
            </span>
            <span aria-hidden="true" className="text-slate-500 dark:text-slate-400">&#8942;</span>
          </div>
        ))}
      </div>
    );
  }

  if (item.title === "Governed File Upload") {
    const files = [
      { name: "Statement-of-work.pdf", size: "2.4 MB", ext: "PDF" },
      { name: "Site-photos.zip", size: "18.1 MB", ext: "ZIP" }
    ];
    return (
      <div>
        <div className="grid place-items-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-6 text-center dark:border-white/20 dark:bg-white/5">
          <span aria-hidden="true" className="text-2xl">&#8679;</span>
          <span className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">Drag files here or browse</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Up to 25 MB, 5 files</span>
        </div>
        <div className="mt-3 space-y-1.5">
          {files.map(f => (
            <div key={f.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-white/10">
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[9px] font-black text-white" style={{ background: item.color }}>{f.ext}</span>
                <div className="min-w-0">
                  <b className="block truncate text-xs">{f.name}</b>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{f.size}</span>
                </div>
              </div>
              <button type="button" className="shrink-0 text-xs font-bold text-slate-500 dark:text-slate-400" aria-label={`Remove ${f.name}`}>&#10005;</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (item.title === "Governed Email Composer") {
    return (
      <div>
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2 dark:border-white/10">
          <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">To</span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold dark:bg-white/10">Priya Shah</span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold dark:bg-white/10">J. Okafor</span>
        </div>
        <div className="mt-2 border-b border-slate-100 pb-2 text-xs font-bold dark:border-white/10">Re: Case #4821 status update</div>
        <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-[10px] leading-5 text-slate-500 dark:bg-white/10 dark:text-slate-400">
          &gt; Original request: please confirm the vendor timeline for next week.
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-700 dark:text-slate-200">Hi team, sharing the latest update below &mdash; let me know if anything&rsquo;s missing.</p>
        <div className="mt-4 flex gap-2">
          <span className="rounded-full px-3 py-1.5 text-xs font-bold text-white" style={{ background: item.color }}>Send</span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold dark:bg-white/10">Cancel</span>
        </div>
      </div>
    );
  }

  if (item.title === "Enterprise Sidebar") {
    const navItems = [
      { label: "Dashboard", icon: "▦" },
      { label: "Projects", icon: "▤", active: true },
      { label: "Reports", icon: "▥" },
      { label: "Settings", icon: "⚙" }
    ];
    return (
      <div className="flex gap-3">
        <div className="w-32 shrink-0 rounded-xl border border-slate-200 p-2 dark:border-white/10">
          <div className="space-y-1">
            {navItems.map(nav => (
              <div
                key={nav.label}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-bold ${nav.active ? "text-white" : "text-slate-600 dark:text-slate-300"}`}
                style={nav.active ? { background: item.color } : undefined}
              >
                <span aria-hidden="true">{nav.icon}</span>{nav.label}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2 dark:border-white/10">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[9px] font-black text-white" style={{ background: item.color }}>UP</span>
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Uday P.</span>
          </div>
        </div>
        <div aria-hidden="true" className="flex-1 rounded-xl bg-slate-50 dark:bg-white/5" />
      </div>
    );
  }

  if (item.title === "Enterprise Mega Menu") {
    const navButtons = ["Products", "Solutions", "Resources", "Pricing"];
    const panel = {
      Platform: ["Power Apps", "Power Automate", "Dataverse"],
      Extend: ["Copilot Studio", "AI Builder", "Power Pages"]
    };
    return (
      <div>
        <div className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white p-2 dark:border-white/10 dark:bg-white/5">
          {navButtons.map((b, i) => (
            <span
              key={b}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${i === 0 ? "text-white" : "text-slate-600 dark:text-slate-300"}`}
              style={i === 0 ? { background: item.color } : undefined}
            >
              {b}
            </span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          {Object.entries(panel).map(([section, links]) => (
            <div key={section}>
              <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">{section}</span>
              <div className="mt-2 space-y-1.5">
                {links.map(l => <div key={l} className="text-xs font-bold text-slate-700 dark:text-slate-200">{l}</div>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (item.title === "Portfolio Command Card") {
    const metrics = [
      { label: "Health", value: "74%", color: item.color },
      { label: "Active", value: "32", color: item.color },
      { label: "At risk", value: "06", color: "#D13438" }
    ];
    const bars = [42, 56, 48, 70, 62, 82, 76, 94];
    return (
      <div>
        <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Portfolio command</span>
        <h3 className="mt-1 text-lg font-black">Executive overview</h3>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {metrics.map(m => (
            <div key={m.label} className="rounded-xl bg-slate-50 p-3 dark:bg-white/10">
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{m.label}</span>
              <b
                className="mt-1 block text-lg text-[color:var(--badge-light)] dark:text-[color:var(--badge-dark)]"
                style={{ "--badge-light": darken(m.color), "--badge-dark": lighten(m.color) }}
              >
                {m.value}
              </b>
            </div>
          ))}
        </div>
        <div className="mt-3 flex h-16 items-end gap-1.5 rounded-xl bg-slate-50 p-3 dark:bg-white/10">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i === bars.length - 1 ? item.color : `${item.color}66` }} />
          ))}
        </div>
      </div>
    );
  }

  if (item.title === "Program Scorecard") {
    const metrics = [
      { name: "Budget", value: "92%", target: "100%", tone: item.color },
      { name: "Schedule", value: "68%", target: "80%", tone: "#D83B01" },
      { name: "Quality", value: "97%", target: "95%", tone: item.color },
      { name: "Risk", value: "3 open", target: "0", tone: "#0F6CBD" }
    ];
    return (
      <div className="grid grid-cols-2 gap-2">
        {metrics.map(m => (
          <div key={m.name} className="rounded-xl border-l-4 bg-slate-50 p-3 dark:bg-white/10" style={{ borderColor: m.tone }}>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{m.name}</span>
            <b className="mt-1 block text-xl">{m.value}</b>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Target {m.target}</span>
          </div>
        ))}
      </div>
    );
  }

  if (item.title === "Operational Status Banner") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2.5 dark:bg-green-900/20">
          <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
          <span className="text-xs font-bold text-green-700 dark:text-green-300">All systems operational</span>
          <span className="ml-auto shrink-0 text-[10px] font-bold text-green-700 dark:text-green-300">Updated 4m ago</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 dark:bg-amber-900/20">
          <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
          <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Degraded performance &mdash; Reporting</span>
          <span className="ml-auto shrink-0 text-[10px] font-bold text-amber-700 dark:text-amber-300">Updated 4m ago</span>
        </div>
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
