import { buildLinePath } from "../lib/svgPath.js";
import { darken, lighten, container, CONTAINER_TEXT_CLASS } from "../lib/color.js";

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

   `interactive` (default true) governs the handful of illustrative
   <button> elements scattered across these mockups (a pager, a Retry
   action, a disabled Next). They carry no onClick of their own — they
   exist to demonstrate a state, not to do anything — so when this
   component is reused somewhere it must be non-interactive (the
   Catalog card's own thumbnail, sitting inside that card's single
   real <button>), pass interactive={false} and every one of them
   renders as a plain <span> instead. Nesting a real <button> inside
   another <button> is invalid HTML, and a focusable control left
   inside an aria-hidden decorative thumbnail is its own real
   accessibility violation (axe-core's aria-hidden-focus rule) — this
   swap avoids both without duplicating any of the markup above it.

   `variant` (default null) picks which of the component's own listed
   Variants (componentLibrary.js's [name, description] tuples) this
   render shows — the Detail page's Variants tab passes each variant's
   own name in turn so that tab shows four real, visually distinct
   renders instead of four text-only description cards. null (and the
   catalog's first-listed variant, almost always "Standard" or the
   base layout) both fall through to the same default render at the
   bottom of each block, so the Preview tab and the Catalog card
   thumbnail — neither of which pass variant — are unaffected by any
   of this.
   ============================================================ */
function ComponentPreview({ item, values = {}, interactive = true, variant = null }) {
  const Btn = interactive ? "button" : "span";
  if (item.title === "Portfolio Risk Matrix") {
    // 5x5 needs its own row-tone lookup — 3 bands stretched over 5 rows
    // reads wrong (two whole rows would land on the same tone), so a
    // real 5-band severity scale backs the larger grid instead of just
    // repeating the 3x3 palette.
    const size = variant === "5x5" ? 5 : 3;
    const tones3 = ["#DCFCE7", "#FEF3C7", "#FEE2E2"];
    const tones5 = ["#DCFCE7", "#BBF7D0", "#FEF3C7", "#FED7AA", "#FEE2E2"];
    const tones = size === 5 ? tones5 : tones3;
    const counts3 = [1, 2, 1, 3, 4, 2, 1, 3, 5];
    const counts5 = [1, 1, 2, 1, 0, 1, 2, 3, 2, 1, 2, 3, 4, 2, 1, 1, 3, 5, 3, 1, 0, 1, 2, 1, 1];
    const cells = size === 5 ? counts5 : counts3;
    const namedRisks = { 4: "Vendor delay", 7: "Budget overrun" };
    return (
      <div>
        {/* Searchable and OnExport — shown as real header affordances
            rather than only described, matching every other opt-in
            property in this file. Compact drops this header entirely,
            per its own "just the colored grid" description; Searchable
            itself only filters named risks (ShowNames on), so it's
            illustrated as an available control rather than a
            functioning filter over this count-only view. */}
        {variant !== "Compact" && (
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
              <span aria-hidden="true">&#128269;</span>
              <span>Search risks&hellip;</span>
            </div>
            <span className="flex shrink-0 items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1.5 text-[10px] font-bold text-slate-500 dark:border-white/10 dark:text-slate-400">
              <span aria-hidden="true">&#8681;</span> Export
            </span>
          </div>
        )}
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
          {cells.map((n, i) => (
            <div
              key={i}
              className={`grid place-items-center rounded-xl font-black text-slate-900 ${variant === "Detailed" && namedRisks[i] ? "aspect-square p-1 text-center text-[8px] font-bold leading-tight" : "aspect-square"}`}
              style={{ background: tones[Math.floor((i / cells.length) * tones.length)] }}
            >
              {variant === "Detailed" && namedRisks[i] ? namedRisks[i] : n}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (item.title === "Executive KPI Card") {
    const label = values.Label ?? "Active projects";
    const value = values.Value ?? "156";
    const trend = values.Trend ?? "12.4";
    const trendUp = !String(trend).startsWith("-");
    const status = values.Status ?? "On track";
    // Chart forces the same sparkline ShowSparkline would, live-illustrating
    // that variant rather than requiring the configurator to be touched.
    const showSparkline = variant === "Chart" || (values.ShowSparkline ?? "false") === "true";
    // Language — the host formats Value/Trend before this component ever
    // sees them (see componentLibrary.js), so there's nothing to toggle
    // live here; this line instead demonstrates the actual mechanism —
    // Intl.NumberFormat is the real JS equivalent of Power Apps' own
    // Language()-aware Text() — rather than only describing it in prose.
    const demoTrendDE = new Intl.NumberFormat("de-DE", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Math.abs(Number(trend)) / 100);
    const sparkValues = [40, 44, 42, 50, 48, 55, 53, 60, 58, 65, 70, 78];
    const { linePath, areaPath } = showSparkline ? buildLinePath(sparkValues, { width: 200, height: 44, padding: 4 }) : {};
    if (variant === "Compact") return (
      <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-white/10">
        <span className="min-w-0 truncate text-xs font-bold text-slate-600 dark:text-slate-300">{label}</span>
        <div className="flex shrink-0 items-center gap-2">
          <b className="text-2xl">{value}</b>
          <span className={`text-[10px] font-black ${trendUp ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
            {trendUp ? "▲" : "▼"} {String(trend).replace("-", "")}%
          </span>
        </div>
      </div>
    );
    if (variant === "Minimal") return (
      <div className="text-center">
        <b className="block text-6xl">{value}</b>
        <span className="mt-1.5 block text-sm text-slate-500 dark:text-slate-400">{label}</span>
      </div>
    );
    if (variant === "Filled") return (
      <div className="rounded-2xl p-5 text-white" style={{ background: item.color }}>
        {/* Full-opacity white throughout, not /80 or /90 — a solid brand
            background is exactly the case where a translucent white
            reliably fails contrast, unlike the light neutral surfaces
            every other variant's text sits on. */}
        <span className="text-sm text-white">{label}</span>
        <div className="mt-2 flex items-end justify-between">
          <b className="text-5xl">{value}</b>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-black" style={{ color: item.color }}>{trendUp ? "▲" : "▼"} {String(trend).replace("-", "")}%</span>
        </div>
        <span className="mt-3 block text-xs font-bold text-white">{status}</span>
      </div>
    );
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
        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
          <span aria-hidden="true">&#127760;</span>
          <span>Language &quot;de-DE&quot; &rarr; {demoTrendDE} Trend</span>
        </div>
      </div>
    );
  }

  if (item.title === "Responsive Line Chart") {
    const dataValues = [42, 48, 45, 58, 55, 68, 64, 72, 78, 74, 85, 92];
    const { linePath, areaPath, points } = buildLinePath(dataValues, { width: 320, height: 140, padding: 10 });
    const pct = Math.round(((dataValues.at(-1) - dataValues[0]) / dataValues[0]) * 100);
    if (variant === "Sparkline") {
      const { linePath: sparkLine, areaPath: sparkArea } = buildLinePath(dataValues, { width: 200, height: 48, padding: 4 });
      return (
        <svg viewBox="0 0 200 48" className="h-12 w-full" role="img" aria-label={`Sparkline, ticket volume up ${pct}% over 12 months`}>
          <path d={sparkArea} fill={`${item.color}33`} />
          <path d={sparkLine} fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    if (variant === "Dashed forecast") {
      // A straight-segment path (not the smoothed Catmull-Rom curve the
      // other variants use) through the same last-4-points slice is
      // plenty for a small mockup, and keeps the join with the solid
      // actual line exact rather than approximated.
      const splitAt = points.length - 4;
      const toPath = pts => `M ${pts[0][0]},${pts[0][1]}` + pts.slice(1).map(p => ` L ${p[0]},${p[1]}`).join("");
      return (
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Ticket volume &mdash; 12 months</span>
            <span className="flex items-center gap-2 text-[9px] font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><span aria-hidden="true" className="h-0.5 w-3" style={{ background: item.color }} /> Actual</span>
              <span className="flex items-center gap-1"><span aria-hidden="true" className="h-0 w-3 border-t-2 border-dashed" style={{ borderColor: item.color }} /> Forecast</span>
            </span>
          </div>
          <svg viewBox="0 0 320 140" className="mt-4 w-full" role="img" aria-label="Line chart with a dashed, unfilled forecast segment continuing the actual trend">
            <path d={toPath(points.slice(0, splitAt + 1))} fill="none" stroke={item.color} strokeWidth="2.5" strokeLinecap="round" />
            <path d={toPath(points.slice(splitAt))} fill="none" stroke={item.color} strokeWidth="2.5" strokeDasharray="6 5" strokeLinecap="round" />
          </svg>
        </div>
      );
    }
    if (variant === "Point-labeled") return (
      <div>
        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Ticket volume &mdash; 12 months</span>
        <svg viewBox="0 0 320 150" className="mt-5 w-full overflow-visible" role="img" aria-label={`Line chart, ticket volume up ${pct}% over 12 months, every value labeled`}>
          <path d={linePath} fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r="2.5" fill={item.color} />
              <text x={p[0]} y={Math.max(9, p[1] - 8)} textAnchor="middle" fontSize="7" fontWeight="700" className="fill-slate-600 dark:fill-slate-300">{dataValues[i]}</text>
            </g>
          ))}
        </svg>
      </div>
    );
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
    if (variant === "Badge") return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black text-white" style={{ background: item.color }}>
        <span aria-hidden="true">&#9679;</span> {daysLeft}d left
      </span>
    );
    if (variant === "Compact") return (
      <div className="flex items-center gap-2.5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: item.color }} />
        <b className="text-2xl">{daysLeft}</b>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">business days left</span>
      </div>
    );
    if (variant === "Overdue emphasis") return (
      <div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
          <span className="text-xs font-black uppercase tracking-wide text-red-700 dark:text-red-400">Overdue</span>
        </div>
        <div className="mt-3 flex items-end gap-2">
          <b className="text-5xl text-red-700 dark:text-red-400">3</b>
          <span className="mb-1 text-sm font-bold text-slate-500 dark:text-slate-400">days past due</span>
        </div>
        <div className="mt-4 h-2 rounded-full bg-red-100 dark:bg-red-900/30"><div className="h-full w-full rounded-full bg-red-600" /></div>
        <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
          Was due Nov 14, 5:00 PM ET &mdash; CompletedDate is still blank.
        </p>
      </div>
    );
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
          Due Nov 14, 5:00 PM ET &mdash; weekends and 2 observed holidays are already excluded from the count above.
        </p>
        {/* ReminderThreshold — shown firing here since daysLeft (12) is
            past a smaller threshold in a real config; illustrating
            OnApproachingDue actually doing something, not just existing
            as a Properties-tab row. */}
        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
          <span aria-hidden="true">&#128276;</span>
          <span>Reminder sent &mdash; 3 business days from due</span>
        </div>
      </div>
    );
  }

  if (item.title === "Activity Timeline") {
    // pinned demonstrates PinnedIds — a pinned entry renders first
    // regardless of SortDirection, matching the real Dynamics 365
    // Timeline control's own msdyn_timelinepin precedence.
    const entries = [
      { title: "Escalation policy acknowledged", time: "3d ago", category: "Escalation", color: "#D83B01", pinned: true },
      { title: "Case escalated to Tier 2", time: "2h ago", category: "Escalation", color: "#D83B01" },
      { title: "Comment added by J. Okafor", time: "5h ago", category: "Comment", color: "#0F6CBD" },
      { title: "Status changed to In Progress", time: "1d ago", category: "Status", color: item.color }
    ];
    if (variant === "Compact") return (
      <div className="space-y-1.5">
        {entries.map(e => (
          <div key={e.title} className="flex items-center gap-2 text-xs">
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: e.color }} />
            <span className="min-w-0 flex-1 truncate font-bold">{e.title}</span>
            <span className="shrink-0 text-[10px] text-slate-500 dark:text-slate-400">{e.time}</span>
          </div>
        ))}
      </div>
    );
    if (variant === "Grouped by date") {
      const groups = [
        { label: "Today", items: entries.filter(e => e.time.endsWith("ago") && e.time.includes("h")) },
        { label: "Earlier", items: entries.filter(e => !(e.time.endsWith("ago") && e.time.includes("h"))) }
      ];
      return (
        <div className="space-y-3">
          {groups.map(g => (
            <div key={g.label}>
              <span className="text-[9px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{g.label}</span>
              <div className="mt-1.5 space-y-1.5">
                {g.items.map(e => (
                  <div key={e.title} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs dark:bg-white/10">
                    <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: e.color }} />
                    <span className="min-w-0 flex-1 truncate">{e.title}</span>
                    <span className="shrink-0 text-[9px] text-slate-500 dark:text-slate-400">{e.time}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div>
        <div className="flex items-center justify-between gap-2">
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
          {/* SortDirection — a real toggle, matching the real Dynamics
              365 Timeline control's own explicit sort button, not an
              implied fixed order. */}
          <Btn type="button" className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
            <span aria-hidden="true">&#8645;</span> Newest first
          </Btn>
        </div>
        <div className="relative mt-4 space-y-3 pl-5">
          <span aria-hidden="true" className="absolute inset-y-1 left-[3px] w-px bg-slate-200 dark:bg-white/10" />
          {entries.map(e => (
            <div key={e.title} className="relative rounded-xl bg-slate-50 p-3 shadow-sm dark:bg-white/10">
              <span aria-hidden="true" className="absolute -left-[21px] top-4 h-2 w-2 rounded-full" style={{ background: e.color }} />
              <div className="flex items-center justify-between gap-2">
                <b className="text-xs">{e.title}</b>
                <span className="flex shrink-0 items-center gap-1.5">
                  {e.pinned && <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500" aria-hidden="true">&#128204;</span>}
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{e.time}</span>
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span
                  className={`block w-fit rounded px-1.5 py-0.5 text-[10px] font-bold ${CONTAINER_TEXT_CLASS}`}
                  style={container(e.color)}
                >
                  {e.category}
                </span>
                {e.pinned && <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">Pinned</span>}
              </div>
            </div>
          ))}
        </div>
        {/* Paginated's own "explicit page" delta from Standard — same
            Load more button, plus the page count RecordsToLoad is
            actually chunking against. */}
        <div className="mt-4 flex items-center gap-2">
          <Btn type="button" className="min-w-0 flex-1 rounded-xl bg-slate-100 py-2 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">Load more</Btn>
          {variant === "Paginated" && <span className="shrink-0 text-[10px] font-bold text-slate-500 dark:text-slate-400">Page 1 of 3</span>}
        </div>
      </div>
    );
  }

  if (item.title === "Enterprise Calendar") {
    const monthDays = Array.from({ length: 30 }, (_, i) => i + 1);
    const leadingBlanks = 3;
    const today = 14;
    // recurring flags SeriesId — Sprint review repeats weekly, so it
    // gets the "part of a series" marker; Release and Audit don't.
    const events = { 6: { label: "Sprint review", color: "#0F6CBD", recurring: true }, 14: { label: "Release", color: item.color }, 22: { label: "Audit", color: "#C239B3" } };
    if (variant === "Week view") {
      const weekDays = [12, 13, 14, 15, 16, 17, 18];
      return (
        <div>
          <div className="flex items-center justify-between">
            <b className="text-sm">Mar 12&ndash;18, 2026</b>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">Week</span>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {weekDays.map(day => (
              <div key={day} className={`rounded-lg p-1.5 text-center ${day === today ? "text-white" : "bg-slate-50 dark:bg-white/5"}`} style={day === today ? { background: item.color } : undefined}>
                <span className="text-[9px] font-bold">{day}</span>
                {/* Today's own chip needs a real opaque background, not a
                    translucent white over an arbitrary event color — that
                    combination's contrast depends on which event color it
                    happens to be, and isn't guaranteed to pass. */}
                {events[day] && (
                  <span
                    className={`mt-1 block truncate rounded px-1 py-0.5 text-[8px] font-bold ${day === today ? "" : CONTAINER_TEXT_CLASS}`}
                    style={day === today ? { background: "#FFFFFF", color: item.color } : container(events[day].color, "26")}
                  >
                    {events[day].label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (variant === "Agenda view") {
      const occurrences = Object.entries(events).sort(([a], [b]) => Number(a) - Number(b));
      return (
        <div className="space-y-2">
          <b className="text-sm">March 2026</b>
          {occurrences.map(([day, e]) => (
            <div key={day} className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 dark:bg-white/10">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-black text-white" style={{ background: e.color }}>{day}</span>
              <span className="flex-1 text-xs font-bold">{e.label}</span>
              {e.recurring && <span aria-hidden="true" className="shrink-0 text-slate-400 dark:text-slate-500">&#8635;</span>}
            </div>
          ))}
        </div>
      );
    }
    if (variant === "Compact mini") return (
      <div>
        <b className="text-xs">March 2026</b>
        <div className="mt-2 grid grid-cols-7 gap-0.5">
          {Array.from({ length: leadingBlanks }).map((_, i) => <span key={`b${i}`} />)}
          {monthDays.map(day => (
            <div key={day} className={`relative grid aspect-square place-items-center rounded text-[8px] ${day === today ? "text-white" : "text-slate-500 dark:text-slate-400"}`} style={day === today ? { background: item.color } : undefined}>
              {day}
              {events[day] && day !== today && <span aria-hidden="true" className="absolute bottom-0 h-1 w-1 rounded-full" style={{ background: events[day].color }} />}
            </div>
          ))}
        </div>
      </div>
    );
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
            <div key={day} className="flex items-center justify-between gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-2">
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{ background: e.color }} />
                <span className="text-slate-600 dark:text-slate-300">{e.label}</span>
                {e.recurring && <span aria-hidden="true" className="text-slate-400 dark:text-slate-500">&#8635;</span>}
              </span>
              {/* OnRequestChange — the accessible, keyboard-reachable
                  stand-in for drag-to-reschedule this read-only calendar
                  offers, shown on today's own event. */}
              {day === String(today) && (
                <Btn type="button" className="shrink-0 text-[9px] font-bold text-slate-500 underline dark:text-slate-400">Request a change</Btn>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (item.title === "Accordion Record List") {
    // SelectionMode Multiple — checked demonstrates OnSelectionChange's
    // real checkbox column rather than only describing it in Properties.
    // Both non-locked groups expanded at once — Single-expand is the
    // variant that enforces only one open at a time; Standard itself
    // makes no such restriction, so its own mockup should actually show
    // two.
    const singleExpand = variant === "Single-expand";
    // Three groups, not two, specifically to show every Move up/down
    // state at once: the first group's own Move up and the last group's
    // own Move down are each genuinely disabled (CanMoveUp/CanMoveDown
    // — no sibling exists on that side, in that group's own scope), and
    // the middle group is Locked, hiding its action cluster entirely
    // rather than showing it disabled — a different signal for a
    // different reason (the record itself can't be changed, not that
    // there's nowhere left to move it).
    const groups = [
      {
        name: "Order #4821 — Acme Corp",
        expanded: true,
        locked: false,
        canMoveUp: false,
        canMoveDown: true,
        children: [
          { name: "Line 1 — Widget A x200", tag: "Shipped", color: item.color, checked: true },
          { name: "Line 2 — Widget B x50", tag: "Processing", color: "#0F6CBD", checked: false }
        ]
      },
      { name: "Order #4819 — Fabrikam Supply", expanded: false, locked: true, children: [] },
      {
        name: "Order #4820 — Globex Inc",
        expanded: !singleExpand,
        locked: false,
        canMoveUp: true,
        canMoveDown: false,
        children: [{ name: "Line 1 — Widget C x80", tag: "Complete", color: "#5B5BD6", checked: false }]
      }
    ];
    const compact = variant === "Compact";
    const checklist = variant === "Checklist";
    return (
      <div>
        <div className="mb-2 flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
          <span>1 selected</span>
          {/* Config.ShowExpandAll's own header affordance — same
              reasoning as every other opt-in property shown doing
              something rather than only described. */}
          <Btn type="button" className="flex items-center gap-1">
            <span aria-hidden="true">&#8963;</span> Expand all
          </Btn>
        </div>
        <div className={compact ? "space-y-1" : "space-y-2"}>
          {groups.map(g => (
            <div key={g.name} className="rounded-xl border border-slate-200 dark:border-white/10">
              <div className={`flex items-center justify-between gap-2 ${compact ? "px-3 py-2" : "p-3"}`}>
                <b className="min-w-0 flex-1 truncate text-xs">{g.name}</b>
                {/* Locked hides Move/Edit/Delete outright — a distinct
                    signal from a disabled Move button, which still shows
                    the action exists but not right now. */}
                {g.locked ? (
                  <span className="flex shrink-0 items-center gap-1 text-[9px] font-bold text-slate-500 dark:text-slate-400">
                    <span aria-hidden="true">&#128274;</span> Locked
                  </span>
                ) : (
                  // Real disabled buttons ride WCAG 1.4.3's own exemption
                  // for genuinely-disabled controls (matching Enterprise
                  // Data Table's own Prev pager, elsewhere in this file)
                  // — but only while Btn is actually a <button>. As a
                  // card thumbnail's plain <span disabled="">, that
                  // exemption doesn't apply, so the disabled color needs
                  // to be the same accessible tone as the enabled one.
                  <span className="flex shrink-0 items-center gap-1">
                    <Btn
                      type="button"
                      disabled={interactive && !g.canMoveUp ? true : undefined}
                      aria-label={`Move up ${g.name}`}
                      className={`text-[10px] font-bold ${!g.canMoveUp && interactive ? "text-slate-300 dark:text-white/20" : "text-slate-500 dark:text-slate-400"}`}
                    >
                      &#9650;
                    </Btn>
                    <Btn
                      type="button"
                      disabled={interactive && !g.canMoveDown ? true : undefined}
                      aria-label={`Move down ${g.name}`}
                      className={`text-[10px] font-bold ${!g.canMoveDown && interactive ? "text-slate-300 dark:text-white/20" : "text-slate-500 dark:text-slate-400"}`}
                    >
                      &#9660;
                    </Btn>
                  </span>
                )}
                <span aria-hidden="true" className={`shrink-0 text-slate-500 transition-transform dark:text-slate-400 ${g.expanded ? "rotate-180" : ""}`}>&#9660;</span>
              </div>
              {g.expanded && g.children.length > 0 && (
                <div className={`space-y-1.5 border-t border-slate-100 dark:border-white/10 ${compact ? "p-2" : "p-3"}`}>
                  {g.children.map(c => (
                    <div key={c.name} className={`flex items-center gap-2 rounded-lg bg-slate-50 shadow-sm dark:bg-white/10 ${compact ? "px-2 py-1" : "px-3 py-2"}`}>
                      <span
                        aria-hidden="true"
                        className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-sm border text-[9px] font-black text-white ${c.checked ? "border-transparent" : "border-slate-300 dark:border-white/20"}`}
                        style={c.checked ? { background: item.color } : undefined}
                      >
                        {c.checked ? "✓" : ""}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs">{c.name}</span>
                      {!checklist && (
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${CONTAINER_TEXT_CLASS} ${compact ? "px-1.5 py-0" : ""}`}
                          style={container(c.color)}
                        >
                          {c.tag}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (item.title === "Enterprise Data Table") {
    const rows = [
      { name: "Website redesign", status: "On track", statusColor: item.color, priority: "High", priorityColor: "#D83B01", checked: true },
      { name: "Data migration", status: "At risk", statusColor: "#D83B01", priority: "Medium", priorityColor: "#0F6CBD", checked: false },
      { name: "Vendor onboarding", status: "Complete", statusColor: "#5B5BD6", priority: "Low", priorityColor: "#64748B", checked: false }
    ];
    if (variant === "Card") return (
      <div className="space-y-2">
        {rows.map(r => (
          <div key={r.name} className="rounded-xl border border-slate-200 p-3 shadow-sm dark:border-white/10">
            <b className="text-xs">{r.name}</b>
            <div className="mt-2 flex gap-1.5">
              <span className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-black ${CONTAINER_TEXT_CLASS}`} style={container(r.statusColor)}>{r.status}</span>
              <span className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-black ${CONTAINER_TEXT_CLASS}`} style={container(r.priorityColor)}>{r.priority}</span>
            </div>
          </div>
        ))}
      </div>
    );
    if (variant === "List") return (
      <div className="divide-y divide-slate-100 dark:divide-white/10">
        {rows.map(r => (
          <div key={r.name} className="flex items-center gap-2 py-2 text-xs">
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: r.statusColor }} />
            <span className="min-w-0 flex-1 truncate font-bold">{r.name}</span>
            <span className="shrink-0 text-[10px] text-slate-500 dark:text-slate-400">{r.status}</span>
          </div>
        ))}
      </div>
    );
    const compactDensity = variant === "Compact density";
    return (
      <div>
        {/* Searchable, live-illustrating the property of the same name
            rather than a decorative box — same reasoning as ShowSparkline
            elsewhere in this file: a property that exists should be shown
            doing something, not only described in the Properties tab. */}
        <div className="mb-2 flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
          <span aria-hidden="true">&#128269;</span>
          <span>Search 24 records&hellip;</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
          <div className={`grid grid-cols-[auto_1.4fr_.8fr_.8fr_auto] items-center gap-2 bg-slate-50 px-3 text-[10px] font-black uppercase text-slate-500 dark:bg-white/10 dark:text-slate-400 ${compactDensity ? "py-1" : "py-2"}`}>
            <span aria-hidden="true" className="grid h-3.5 w-3.5 place-items-center rounded-sm border border-slate-400 dark:border-white/30" />
            <span className="flex items-center gap-1">Project <span aria-hidden="true">&#9650;</span></span>
            <span>Status</span><span>Priority</span><span />
          </div>
          {rows.map(r => (
            <div key={r.name} className={`grid grid-cols-[auto_1.4fr_.8fr_.8fr_auto] items-center gap-2 border-t border-slate-100 px-3 dark:border-white/10 ${compactDensity ? "py-1 text-[10px]" : "py-2.5 text-xs"}`}>
              <span
                aria-hidden="true"
                className={`grid h-3.5 w-3.5 place-items-center rounded-sm border text-[9px] font-black text-white ${r.checked ? "border-transparent" : "border-slate-300 dark:border-white/20"}`}
                style={r.checked ? { background: item.color } : undefined}
              >
                {r.checked ? "✓" : ""}
              </span>
              <b className="truncate">{r.name}</b>
              <span
                className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-black ${CONTAINER_TEXT_CLASS}`}
                style={container(r.statusColor)}
              >
                {r.status}
              </span>
              <span
                className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-black ${CONTAINER_TEXT_CLASS}`}
                style={container(r.priorityColor)}
              >
                {r.priority}
              </span>
              <span aria-hidden="true" className="text-slate-500 dark:text-slate-400">&#8942;</span>
            </div>
          ))}
        </div>
        {/* PageSize/PageNumber/HasNextPage/HasPreviousPage/TotalRecords —
            the pager itself is host-built, per the real Creator Kit
            DetailsList's own paging pattern, but shown here since the
            component does supply the counts and page state it reads from. */}
        <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
          <span>1&ndash;3 of 24</span>
          <div className="flex items-center gap-3">
            {/* A real disabled attribute, not just a light color, marks
                Prev unavailable on page 1 — WCAG 1.4.3 itself exempts
                inactive controls from the contrast minimum, but only
                when the disabled state is actually semantic like this,
                not implied by low-contrast text alone. That exemption
                rides on Btn actually being a <button> — as a card
                thumbnail's plain <span disabled="">, "disabled" is
                inert markup, not a semantic state, so the low-contrast
                color loses its exemption too and needs the same
                accessible tone as Next. */}
            <Btn type="button" disabled={interactive ? true : undefined} className={interactive ? "text-[10px] font-bold text-slate-300 dark:text-white/20" : "text-[10px] font-bold text-slate-500 dark:text-slate-400"}>&#8249; Prev</Btn>
            <Btn type="button" className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Next &#8250;</Btn>
          </div>
        </div>
      </div>
    );
  }

  if (item.title === "Governed File Upload") {
    // maxFiles set to match files.length here specifically to illustrate
    // MaxAttachmentsText's real replace-the-dropzone state, rather than
    // always showing the same "still room for more" prompt.
    const maxFiles = 2;
    const files = [
      { name: "Statement-of-work.pdf", size: "2.4 MB", ext: "PDF" },
      { name: "Site-photos.zip", size: "18.1 MB", ext: "ZIP" }
    ];
    if (variant === "Compact") return (
      <div>
        <Btn type="button" className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 dark:border-white/10 dark:text-slate-300">
          <span aria-hidden="true">&#8679;</span> Add file
        </Btn>
        <div className="mt-2 space-y-1.5">
          {files.map(f => (
            <div key={f.name} className="flex items-center gap-2 text-xs">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded text-[7px] font-black text-white" style={{ background: item.color }}>{f.ext}</span>
              <span className="min-w-0 flex-1 truncate">{f.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
    if (variant === "Read-only viewer") return (
      <div className="space-y-1.5">
        {files.map(f => (
          <div key={f.name} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-white/10">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[9px] font-black text-white" style={{ background: item.color }}>{f.ext}</span>
            <div className="min-w-0">
              <b className="block truncate text-xs">{f.name}</b>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{f.size}</span>
            </div>
            {/* No remove/upload affordance at all — AllowUpload and
                AllowDelete are both false, this record is closed for
                edits. */}
          </div>
        ))}
      </div>
    );
    if (variant === "Drag-active") return (
      <div className="grid place-items-center rounded-xl border-2 border-dashed py-6 text-center" style={{ borderColor: item.color, background: `${item.color}0F` }}>
        <span aria-hidden="true" className="text-2xl">&#8681;</span>
        {/* darken()/lighten(), not the raw item.color — the same
            CONTAINER_TEXT_CLASS pairing used everywhere else in this file
            for text over a light tint of the category color, since a raw
            mid-tone color reliably fails contrast against a near-white
            background. */}
        <span className={`mt-1 text-xs font-bold ${CONTAINER_TEXT_CLASS}`} style={{ "--badge-light": darken(item.color), "--badge-dark": lighten(item.color) }}>Drop to upload</span>
        <span className="text-[10px] text-slate-600 dark:text-slate-400">PDF, DOCX, PNG &middot; Up to 25 MB, {maxFiles} files</span>
      </div>
    );
    return (
      <div>
        {files.length >= maxFiles ? (
          <div className="grid place-items-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-6 text-center dark:border-white/20 dark:bg-white/5">
            <span aria-hidden="true" className="text-2xl">&#9888;&#65039;</span>
            <span className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">Maximum files reached</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">PDF, DOCX, PNG only</span>
          </div>
        ) : (
          <div className="grid place-items-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-6 text-center dark:border-white/20 dark:bg-white/5">
            <span aria-hidden="true" className="text-2xl">&#8679;</span>
            <span className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">Drag files here or browse</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">PDF, DOCX, PNG &middot; Up to 25 MB, {maxFiles} files</span>
          </div>
        )}
        <div className="mt-3 space-y-1.5">
          {files.map(f => (
            <div key={f.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 shadow-sm dark:bg-white/10">
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[9px] font-black text-white" style={{ background: item.color }}>{f.ext}</span>
                <div className="min-w-0">
                  <b className="block truncate text-xs">{f.name}</b>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{f.size}</span>
                </div>
              </div>
              <Btn type="button" className="shrink-0 text-xs font-bold text-slate-500 dark:text-slate-400" aria-label={`Remove ${f.name}`}>&#10005;</Btn>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (item.title === "Governed Email Composer") {
    if (variant === "Compact") return (
      <div>
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2 dark:border-white/10">
          <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">To</span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold dark:bg-white/10">Priya Shah</span>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-700 dark:text-slate-200">Confirmed, ready when you are.</p>
        <div className="mt-4 flex gap-2">
          <span className="rounded-full px-3 py-1.5 text-xs font-bold text-white" style={{ background: item.color }}>Send</span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold dark:bg-white/10">Cancel</span>
        </div>
      </div>
    );
    if (variant === "Sending") return (
      // A CSS opacity wrapper looked right for "every control disabled"
      // but silently drags every text color under it below the contrast
      // minimum along with it — the busy state is stated in words
      // instead (the same rule this file already applies to tone/status
      // indicators: never color alone), so every line here keeps its own
      // full-contrast color.
      <div>
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2 dark:border-white/10">
          <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">To</span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold dark:bg-white/10">Priya Shah</span>
        </div>
        <div className="mt-2 border-b border-slate-100 pb-2 text-xs font-bold dark:border-white/10">Re: Case #4821 status update</div>
        <p className="mt-3 text-xs leading-5 text-slate-700 dark:text-slate-200">Hi team, sharing the latest update below &mdash; let me know if anything&rsquo;s missing.</p>
        <div className="mt-4 flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-white" style={{ background: item.color }}>
            <span aria-hidden="true" className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Sending&hellip;
          </span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Every field is disabled while this is in flight</span>
        </div>
      </div>
    );
    const isReply = variant === "Reply";
    return (
      <div>
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2 dark:border-white/10">
          <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">To</span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold dark:bg-white/10">Priya Shah</span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold dark:bg-white/10">J. Okafor</span>
        </div>
        {/* ShowBcc adds this third picker beside To/CC — shown here since
            the property exists and should be demonstrated doing
            something, the same reasoning as every other opt-in property
            illustrated elsewhere in this file. */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 py-2 dark:border-white/10">
          <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Bcc</span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold dark:bg-white/10">M. Chen</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 border-b border-slate-100 pb-2 text-xs font-bold dark:border-white/10">
          Re: Case #4821 status update
          {isReply && <span aria-hidden="true" title="Subject locked" className="text-slate-400 dark:text-slate-500">&#128274;</span>}
        </div>
        {/* ContextHtml — the quoted original message is this Reply
            variant's own defining difference from a new, blank Standard
            message. */}
        {isReply && (
          <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-[10px] leading-5 text-slate-500 dark:bg-white/10 dark:text-slate-400">
            &gt; Original request: please confirm the vendor timeline for next week.
          </div>
        )}
        <p className="mt-3 text-xs leading-5 text-slate-700 dark:text-slate-200">Hi team, sharing the latest update below &mdash; let me know if anything&rsquo;s missing.</p>
        {/* Attachments — the same Id/Name/SizeBytes shape Governed File
            Upload's own staged files already use. */}
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 dark:bg-white/10">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-[8px] font-black text-white" style={{ background: item.color }}>PDF</span>
          <span className="min-w-0 flex-1 truncate text-[10px] font-bold text-slate-600 dark:text-slate-300">Statement-of-work.pdf</span>
          <span className="shrink-0 text-[10px] text-slate-500 dark:text-slate-400">2.4 MB</span>
        </div>
        <div className="mt-4 flex gap-2">
          <span className="rounded-full px-3 py-1.5 text-xs font-bold text-white" style={{ background: item.color }}>Send</span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold dark:bg-white/10">Cancel</span>
        </div>
      </div>
    );
  }

  if (item.title === "Enterprise Sidebar") {
    // ItemBadgeCount and ItemIconColor are both optional per-item fields
    // (see componentLibrary.js) — Dashboard/Settings below carry neither,
    // demonstrating that an item with no badge or custom color renders
    // exactly as it always did.
    const navItems = [
      { label: "Dashboard", icon: "▦" },
      { label: "Projects", icon: "▤", active: true, iconColor: item.color },
      { label: "Approvals", icon: "▧", badge: 3, iconColor: "#D83B01" },
      { label: "Reports", icon: "▥" },
      { label: "Settings", icon: "⚙" }
    ];
    if (variant === "Collapsed") return (
      <div className="flex gap-3">
        <div className="w-14 shrink-0 space-y-1 rounded-xl border border-slate-200 p-2 dark:border-white/10">
          {navItems.map(nav => (
            <div
              key={nav.label}
              aria-label={nav.label}
              className={`relative grid h-8 w-full place-items-center rounded-full text-sm ${nav.active ? CONTAINER_TEXT_CLASS : "text-slate-600 dark:text-slate-300"}`}
              style={nav.active ? container(item.color, "26") : undefined}
            >
              <span aria-hidden="true" style={nav.iconColor && !nav.active ? { color: nav.iconColor } : undefined}>{nav.icon}</span>
              {nav.badge != null && <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full" style={{ background: nav.iconColor ?? item.color }} />}
            </div>
          ))}
        </div>
        <div aria-hidden="true" className="flex-1 rounded-xl bg-slate-50 dark:bg-white/5" />
      </div>
    );
    if (variant === "Grouped sections") {
      const sections = { Overview: navItems.slice(0, 2), Work: navItems.slice(2, 4), Admin: navItems.slice(4) };
      return (
        <div className="flex gap-3">
          <div className="w-36 shrink-0 space-y-3 rounded-xl border border-slate-200 p-2 dark:border-white/10">
            {Object.entries(sections).map(([label, sectionItems]) => (
              <div key={label}>
                <span className="px-2 text-[9px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
                <div className="mt-1 space-y-1">
                  {sectionItems.map(nav => (
                    <div
                      key={nav.label}
                      className={`flex items-center gap-2 rounded-full px-2 py-1.5 text-[11px] font-bold ${nav.active ? CONTAINER_TEXT_CLASS : "text-slate-600 dark:text-slate-300"}`}
                      style={nav.active ? container(item.color, "26") : undefined}
                    >
                      <span aria-hidden="true">{nav.icon}</span>
                      <span className="flex-1 truncate">{nav.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div aria-hidden="true" className="flex-1 rounded-xl bg-slate-50 dark:bg-white/5" />
        </div>
      );
    }
    const sidebarBody = (
      <div className="flex gap-3">
        <div className="w-36 shrink-0 rounded-xl border border-slate-200 p-2 dark:border-white/10">
          <div className="space-y-1">
            {navItems.map(nav => (
              <div
                key={nav.label}
                className={`flex items-center gap-2 rounded-full px-2 py-1.5 text-[11px] font-bold ${nav.active ? CONTAINER_TEXT_CLASS : "text-slate-600 dark:text-slate-300"}`}
                style={nav.active ? container(item.color, "26") : undefined}
              >
                <span aria-hidden="true" style={nav.iconColor && !nav.active ? { color: nav.iconColor } : undefined}>{nav.icon}</span>
                <span className="flex-1 truncate">{nav.label}</span>
                {nav.badge != null && (
                  <span
                    className="grid h-4 min-w-[16px] shrink-0 place-items-center rounded-full px-1 text-[9px] font-black text-white"
                    style={{ background: nav.iconColor ?? item.color }}
                  >
                    {nav.badge}
                  </span>
                )}
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
    // Dark theme forces the token-adjusted dark surfaces regardless of
    // the site's own light/dark toggle — a real ancestor `.dark` class
    // (Tailwind's own darkMode: "class" strategy) rather than only a
    // couple of hand-picked dark colors, so this stays in sync with
    // every dark: utility already used above.
    if (variant === "Dark theme") return <div className="dark rounded-xl bg-[#101816] p-2">{sidebarBody}</div>;
    return sidebarBody;
  }

  if (item.title === "Enterprise Mega Menu") {
    const navButtons = ["Products", "Solutions", "Resources", "Pricing"];
    const panel = {
      Platform: [{ label: "Power Apps" }, { label: "Power Automate" }, { label: "Dataverse" }],
      Extend: [{ label: "Copilot Studio", badge: "New" }, { label: "AI Builder" }, { label: "Power Pages" }]
    };
    if (variant === "Simple dropdown") return (
      <div>
        <div className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white p-2 dark:border-white/10 dark:bg-white/5">
          {navButtons.map((b, i) => (
            <span key={b} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${i === 0 ? "text-white" : "text-slate-600 dark:text-slate-300"}`} style={i === 0 ? { background: item.color } : undefined}>{b}</span>
          ))}
        </div>
        <div className="mt-2 w-40 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-white/5">
          <div className="space-y-1">
            {panel.Platform.map(l => <div key={l.label} className="rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">{l.label}</div>)}
          </div>
        </div>
      </div>
    );
    const leftAlign = variant === "Left-aligned";
    return (
      <div>
        <div className={`flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-2 dark:border-white/10 dark:bg-white/5 ${leftAlign ? "justify-start" : "justify-center"}`}>
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
        <div className="mt-2 rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-white/5">
          {/* Searchable — same reasoning as every other opt-in property
              shown doing something rather than only described. */}
          <div className="mb-3 flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
            <span aria-hidden="true">&#128269;</span>
            <span>Search this menu&hellip;</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(panel).map(([section, links]) => (
              <div key={section}>
                <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">{section}</span>
                <div className="mt-2 space-y-1.5">
                  {links.map(l => (
                    <div key={l.label} className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                      {l.label}
                      {l.badge && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase ${CONTAINER_TEXT_CLASS}`}
                          style={container(item.color)}
                        >
                          {l.badge}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
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
    const metricTile = m => (
      <div key={m.label} className="rounded-xl bg-slate-50 p-3 shadow-sm dark:bg-white/10">
        <span className="text-[10px] text-slate-500 dark:text-slate-400">{m.label}</span>
        <b className="mt-1 block text-lg text-[color:var(--badge-light)] dark:text-[color:var(--badge-dark)]" style={{ "--badge-light": darken(m.color), "--badge-dark": lighten(m.color) }}>{m.value}</b>
      </div>
    );
    const chartStrip = (
      <div className="flex h-16 items-end gap-1.5 rounded-xl bg-slate-50 p-3 shadow-sm dark:bg-white/10">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i === bars.length - 1 ? item.color : `${item.color}66` }} />
        ))}
      </div>
    );
    const header = (
      <>
        <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Portfolio command</span>
        <h3 className="mt-1 text-lg font-black">Executive overview</h3>
      </>
    );
    if (variant === "Metrics only") return <div>{header}<div className="mt-4 grid grid-cols-3 gap-2">{metrics.map(metricTile)}</div></div>;
    if (variant === "Chart only") return <div>{header}<div className="mt-4">{chartStrip}</div></div>;
    if (variant === "Compact") return <div>{header}<div className="mt-4 grid grid-cols-2 gap-2">{metrics.slice(0, 2).map(metricTile)}</div></div>;
    return (
      <div>
        {header}
        <div className="mt-4 grid grid-cols-3 gap-2">{metrics.map(metricTile)}</div>
        <div className="mt-3">{chartStrip}</div>
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
    const sparkFor = tone => {
      const { linePath, areaPath } = buildLinePath([4, 6, 5, 7, 8, 7, 9], { width: 80, height: 24, padding: 2 });
      return (
        <svg viewBox="0 0 80 24" className="mt-1.5 h-6 w-full" aria-hidden="true">
          <path d={areaPath} fill={`${tone}22`} />
          <path d={linePath} fill="none" stroke={tone} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    };
    if (variant === "Compact") return (
      <div className="divide-y divide-slate-100 dark:divide-white/10">
        {metrics.map(m => (
          <div key={m.name} className="flex items-center justify-between gap-2 py-2">
            <span className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{ background: m.tone }} />{m.name}</span>
            <span className="text-sm font-black">{m.value}</span>
          </div>
        ))}
      </div>
    );
    if (variant === "Print") return (
      <div className="space-y-3">
        {metrics.map(m => (
          <div key={m.name} className="border-b border-slate-200 pb-3 dark:border-white/10">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">{m.name}</span>
            <b className="mt-1 block text-2xl">{m.value}</b>
            <span className="text-xs text-slate-500 dark:text-slate-400">Target {m.target}</span>
          </div>
        ))}
      </div>
    );
    const showTrend = variant === "Trend";
    return (
      <div>
        {/* OnExport backs the Print variant — the component only ever
            hands back this same data; producing an actual file is the
            host's job via Power Apps' own PDF()/Export-to-Excel. */}
        <div className="mb-2 flex justify-end">
          <span className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:border-white/10 dark:text-slate-400">
            <span aria-hidden="true">&#8681;</span> Export
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {metrics.map(m => (
            <div key={m.name} className="rounded-xl border-l-4 bg-slate-50 p-3 shadow-sm dark:bg-white/10" style={{ borderColor: m.tone }}>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{m.name}</span>
              <b className="mt-1 block text-xl">{m.value}</b>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Target {m.target}</span>
              {showTrend && sparkFor(m.tone)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (item.title === "Operational Status Banner") {
    // Language — LastUpdated's relative-time text is generated inside
    // this component (see componentLibrary.js), so Intl.RelativeTimeFormat
    // (the real JS equivalent of what this component would use) can
    // actually demonstrate it, rather than only describing the property.
    const demoRelativeDE = new Intl.RelativeTimeFormat("de-DE", { numeric: "auto" }).format(-4, "minute");
    // The four variants ARE this component's four real severity states —
    // Operational/Degraded/Outage/Maintenance — vocabulary matching
    // Azure's own status page, so a variant asked for by name shows only
    // that one banner, not the two-states-stacked overview the default
    // below shows (which exists to contrast severities, not represent
    // any single one of them).
    const states = {
      Operational: { bg: "bg-green-50 dark:bg-green-900/20", dot: "bg-green-500", text: "text-green-700 dark:text-green-300", label: "All systems operational" },
      Degraded: { bg: "bg-amber-50 dark:bg-amber-900/20", dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-300", label: "Degraded performance — Reporting" },
      Outage: { bg: "bg-red-50 dark:bg-red-900/20", dot: "bg-red-500", text: "text-red-700 dark:text-red-300", label: "Major outage — Case creation unavailable" },
      Maintenance: { bg: "bg-blue-50 dark:bg-blue-900/20", dot: "bg-blue-500", text: "text-blue-700 dark:text-blue-300", label: "Scheduled maintenance — Sat 10pm–2am ET" }
    };
    if (variant && states[variant]) {
      const s = states[variant];
      return (
        <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${s.bg}`}>
          <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
          <span className={`text-xs font-bold ${s.text}`}>{s.label}</span>
          <span className={`ml-auto shrink-0 text-[10px] font-bold ${s.text}`}>Updated 4m ago</span>
        </div>
      );
    }
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
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
          <span aria-hidden="true">&#127760;</span>
          <span>Language &quot;de-DE&quot; &rarr; &quot;{demoRelativeDE}&quot;</span>
        </div>
      </div>
    );
  }

  if (item.title === "Project Health Summary") {
    // TrendDirection and NarrativeText are both optional, host-set fields
    // (see componentLibrary.js) — Better/Worse/Same renders as an arrow
    // plus a text word, never the arrow alone, same accessibility rule
    // every other tone/status indicator in this catalog already follows.
    const dims = [
      { name: "Scope", tone: item.color, note: "On track, no changes", trend: "Same" },
      { name: "Schedule", tone: "#D83B01", note: "2 weeks behind", trend: "Worse" },
      { name: "Budget", tone: item.color, note: "Within approved envelope", trend: "Better" },
      { name: "Quality", tone: "#0F6CBD", note: "Minor defects, tracked", trend: "Same" }
    ];
    const trendGlyph = { Better: "▲", Worse: "▼", Same: "▬" };
    if (variant === "Compact") return (
      <div className="flex flex-wrap gap-1.5">
        {dims.map(d => (
          <span key={d.name} className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${CONTAINER_TEXT_CLASS}`} style={container(d.tone)}>
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: d.tone }} />{d.name}
          </span>
        ))}
      </div>
    );
    // TrendDirection and NarrativeText are both optional — Standard
    // itself (variant null, and the fallback used by any other name)
    // shows neither, so the Trend and Narrative variants below are each
    // a real, visible delta from it rather than always-on regardless of
    // which variant is asked for.
    const showTrend = variant === "Trend";
    const showNarrative = variant === "Narrative";
    return (
      <div>
        <div className="flex items-center justify-between">
          <b className="text-sm">Program health</b>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">As of Mar 14</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {dims.map(d => (
            <div key={d.name} className="rounded-xl bg-slate-50 p-3 shadow-sm dark:bg-white/10">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.tone }} />
                  <b className="text-xs">{d.name}</b>
                </div>
                {showTrend && (
                  <span className="flex shrink-0 items-center gap-0.5 text-[9px] font-bold text-slate-500 dark:text-slate-400">
                    <span aria-hidden="true">{trendGlyph[d.trend]}</span>{d.trend}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-[10px] leading-4 text-slate-500 dark:text-slate-400">{d.note}</p>
            </div>
          ))}
        </div>
        {showNarrative && (
          <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-600 dark:border-white/10 dark:text-slate-300">
            Schedule slip on the vendor integration workstream is the one item steering needs to weigh in on this week.
          </p>
        )}
      </div>
    );
  }

  if (item.title === "Milestone Tracker") {
    const milestones = [
      { name: "Kickoff", status: "done" },
      { name: "Design sign-off", status: "done" },
      { name: "Build complete", status: "current" },
      { name: "UAT", status: "upcoming" },
      { name: "Go-live", status: "upcoming" }
    ];
    const dotColor = s => (s === "done" ? item.color : s === "current" ? "#0F6CBD" : "#CBD5E1");
    if (variant === "Vertical") return (
      <div className="relative pl-2">
        <span aria-hidden="true" className="absolute bottom-2 left-[9px] top-2 w-px bg-slate-200 dark:bg-white/10" />
        <div className="relative space-y-3">
          {milestones.map(m => (
            <div key={m.name} className="flex items-center gap-3">
              <span aria-hidden="true" className="grid h-4 w-4 shrink-0 place-items-center rounded-full ring-4 ring-white dark:ring-[#17201B]" style={{ background: dotColor(m.status) }} />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{m.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
    if (variant === "Compact") return (
      <div className="relative pt-2">
        <span aria-hidden="true" className="absolute left-0 right-0 top-[10px] h-px bg-slate-200 dark:bg-white/10" />
        <div className="relative flex justify-between">
          {milestones.map(m => <span key={m.name} aria-hidden="true" className="grid h-4 w-4 shrink-0 place-items-center rounded-full ring-4 ring-white dark:ring-[#17201B]" style={{ background: dotColor(m.status) }} />)}
        </div>
      </div>
    );
    const shown = variant === "Upcoming only" ? milestones.filter(m => m.status !== "done") : milestones;
    return (
      <div className="relative pt-2">
        <span aria-hidden="true" className="absolute left-0 right-0 top-[22px] h-px bg-slate-200 dark:bg-white/10" />
        <div className="relative flex justify-between">
          {shown.map(m => (
            <div key={m.name} className="flex flex-col items-center px-1 text-center" style={{ width: `${100 / shown.length}%` }}>
              <span aria-hidden="true" className="grid h-4 w-4 shrink-0 place-items-center rounded-full ring-4 ring-white dark:ring-[#17201B]" style={{ background: dotColor(m.status) }} />
              <span className="mt-2 break-words text-[9px] font-bold leading-tight text-slate-600 dark:text-slate-300">{m.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (item.title === "Decision Log") {
    const decisions = [
      { date: "Mar 2", decision: "Adopt SharePoint for document storage", owner: "J. Okafor", status: "Decided", color: item.color },
      { date: "Feb 18", decision: "Delay Phase 2 rollout by 2 weeks", owner: "Priya Shah", status: "Decided", color: item.color },
      { date: "Feb 3", decision: "Vendor selection for integration layer", owner: "M. Chen", status: "Open", color: "#0F6CBD" }
    ];
    if (variant === "Compact") return (
      <div className="divide-y divide-slate-100 dark:divide-white/10">
        {decisions.map(d => (
          <div key={d.decision} className="flex items-center gap-2 py-2">
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: d.color }} />
            <span className="min-w-0 flex-1 truncate text-xs font-bold">{d.decision}</span>
            <span className="shrink-0 text-[10px] text-slate-500 dark:text-slate-400">{d.date}</span>
          </div>
        ))}
      </div>
    );
    if (variant === "Timeline") return (
      <div className="relative space-y-3 pl-5">
        <span aria-hidden="true" className="absolute inset-y-1 left-[3px] w-px bg-slate-200 dark:bg-white/10" />
        {decisions.map(d => (
          <div key={d.decision} className="relative rounded-xl bg-slate-50 p-3 shadow-sm dark:bg-white/10">
            <span aria-hidden="true" className="absolute -left-[21px] top-4 h-2 w-2 rounded-full" style={{ background: d.color }} />
            <b className="text-xs leading-5">{d.decision}</b>
            <span className="mt-1 block text-[10px] text-slate-500 dark:text-slate-400">{d.date} &middot; {d.owner}</span>
          </div>
        ))}
      </div>
    );
    if (variant === "Print") return (
      <div className="space-y-3">
        {decisions.map(d => (
          <div key={d.decision} className="border-b border-slate-200 pb-3 dark:border-white/10">
            <b className="text-xs leading-5">{d.decision}</b>
            <span className="mt-1 block text-[10px] text-slate-600 dark:text-slate-300">{d.date} &middot; {d.owner} &middot; {d.status}</span>
          </div>
        ))}
      </div>
    );
    return (
      <div>
        {/* OnExport backs the Print variant, same reasoning as Program
            Scorecard's own Export action just above in this file. */}
        <div className="mb-2 flex justify-end">
          <span className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:border-white/10 dark:text-slate-400">
            <span aria-hidden="true">&#8681;</span> Export
          </span>
        </div>
        <div className="space-y-2">
          {decisions.map(d => (
            <div key={d.decision} className="rounded-xl bg-slate-50 p-3 shadow-sm dark:bg-white/10">
              <div className="flex items-start justify-between gap-2">
                <b className="text-xs leading-5">{d.decision}</b>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black ${CONTAINER_TEXT_CLASS}`}
                  style={container(d.color)}
                >
                  {d.status}
                </span>
              </div>
              <span className="mt-1 block text-[10px] text-slate-500 dark:text-slate-400">{d.date} &middot; {d.owner}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (item.title === "Enterprise Dialog") {
    // Confirm's own Confirm button uses the brand color, matching the
    // native Confirm() function's neutral, non-alarming default — the
    // danger-red treatment is Destructive's own real delta from it, not
    // Confirm's default, so the two need to actually look different.
    if (variant === "Destructive") return (
      <div className="grid place-items-center rounded-xl bg-slate-100 p-6 dark:bg-white/5">
        <div className="w-full max-w-[280px] rounded-2xl bg-white p-5 shadow-xl dark:bg-[#17201B]">
          <b className="text-sm">Delete this record?</b>
          <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">This action can&rsquo;t be undone.</p>
          <div className="mt-4 flex justify-end gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold dark:bg-white/10">Cancel</span>
            <span className="rounded-full px-3 py-1.5 text-xs font-bold text-white" style={{ background: "#D13438" }}>Delete</span>
          </div>
        </div>
      </div>
    );
    if (variant === "Acknowledge-only") return (
      <div className="grid place-items-center rounded-xl bg-slate-100 p-6 dark:bg-white/5">
        <div className="w-full max-w-[280px] rounded-2xl bg-white p-5 shadow-xl dark:bg-[#17201B]">
          <b className="text-sm">Session expiring soon</b>
          <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">Save your work &mdash; you&rsquo;ll be signed out in 2 minutes.</p>
          <div className="mt-4 flex justify-end">
            <span className="rounded-full px-3 py-1.5 text-xs font-bold text-white" style={{ background: item.color }}>OK</span>
          </div>
        </div>
      </div>
    );
    if (variant === "Custom content") return (
      <div className="grid place-items-center rounded-xl bg-slate-100 p-6 dark:bg-white/5">
        <div className="w-full max-w-[340px]">
          <span className="mb-1.5 block w-fit rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-slate-600 dark:bg-white/10 dark:text-slate-300">Size: Medium</span>
          <div className="rounded-2xl bg-white p-5 shadow-xl dark:bg-[#17201B]">
            <b className="text-sm">Assign reviewers</b>
            <div className="mt-3 space-y-1.5">
              {["Priya Shah", "J. Okafor"].map(n => (
                <label key={n} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs dark:bg-white/10">
                  <span aria-hidden="true" className="grid h-3.5 w-3.5 place-items-center rounded-sm border border-slate-300 dark:border-white/20" />
                  {n}
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold dark:bg-white/10">Cancel</span>
              <span className="rounded-full px-3 py-1.5 text-xs font-bold text-white" style={{ background: item.color }}>Assign</span>
            </div>
          </div>
        </div>
      </div>
    );
    return (
      <div className="grid place-items-center rounded-xl bg-slate-100 p-6 dark:bg-white/5">
        <div className="w-full max-w-[280px]">
          <span className="mb-1.5 block w-fit rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-slate-600 dark:bg-white/10 dark:text-slate-300">Size: Small</span>
          <div className="rounded-2xl bg-white p-5 shadow-xl dark:bg-[#17201B]">
            <b className="text-sm">Delete confirmation</b>
            <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">This action can&rsquo;t be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold dark:bg-white/10">Cancel</span>
              <span className="rounded-full px-3 py-1.5 text-xs font-bold text-white" style={{ background: item.color }}>Confirm</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (item.title === "Comments & Mentions") {
    if (variant === "Compact") return (
      <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs dark:border-white/10">
        <span className="flex-1 text-slate-500 dark:text-slate-400">Add a comment&hellip;</span>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">3</span>
      </div>
    );
    const readOnly = variant === "Read-only";
    const resolvedFilter = variant === "Resolved filter";
    return (
      <div>
        {resolvedFilter && (
          <div className="mb-2 flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
            <span>3 comments</span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="grid h-3 w-3 place-items-center rounded-sm border border-slate-300 dark:border-white/20" /> Hide resolved (1)
            </span>
          </div>
        )}
        <div className="space-y-3">
          <div className="flex gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[9px] font-black text-white" style={{ background: item.color }}>PS</span>
            <div className="min-w-0 flex-1 rounded-xl bg-slate-50 p-2.5 shadow-sm dark:bg-white/10">
              <div className="flex items-center justify-between gap-2">
                <b className="text-xs">Priya Shah</b>
                <span className="shrink-0 text-[10px] text-slate-500 dark:text-slate-400">2h ago</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                Can someone loop in{" "}
                <span
                  className="font-bold text-[color:var(--badge-light)] dark:text-[color:var(--badge-dark)]"
                  style={{ "--badge-light": darken(item.color), "--badge-dark": lighten(item.color) }}
                >
                  @J. Okafor
                </span>{" "}
                on the vendor timeline?
              </p>
              {/* AllowReactions — a real reaction pill with its own text
                  count, not a bare emoji, matching the accessibility
                  rule stated for ReactionCounts. */}
              <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                &#128077; 3
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[9px] font-black text-white" style={{ background: "#0F6CBD" }}>JO</span>
            <div className="min-w-0 flex-1">
              <div className="rounded-xl bg-slate-50 p-2.5 shadow-sm dark:bg-white/10">
                <div className="flex items-center justify-between gap-2">
                  <b className="text-xs">J. Okafor</b>
                  <span className="shrink-0 text-[10px] text-slate-500 dark:text-slate-400">1h ago &middot; edited</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">On it &mdash; will confirm by EOD.</p>
              </div>
              {/* AllowReply — ParentId nesting one level deep, the same
                  flat-thread limit stated in Limitations. */}
              <div className="mt-2 flex gap-2 pl-4">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[8px] font-black text-white" style={{ background: "#5B5BD6" }}>MC</span>
                <div className="min-w-0 flex-1 rounded-xl bg-slate-50 p-2 shadow-sm dark:bg-white/10">
                  <div className="flex items-center justify-between gap-2">
                    <b className="text-[11px]">M. Chen</b>
                    <span className="shrink-0 text-[9px] text-slate-500 dark:text-slate-400">40m ago</span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-4 text-slate-600 dark:text-slate-300">Confirmed on my end too.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {!readOnly && (
          <div className="mt-3 flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 dark:border-white/10">
            <span className="flex-1 text-xs text-slate-500 dark:text-slate-400">Add a comment&hellip;</span>
            <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: item.color }}>Post</span>
          </div>
        )}
      </div>
    );
  }

  if (item.title === "Responsive Breadcrumbs") {
    const current = (
      <span className="text-[color:var(--badge-light)] dark:text-[color:var(--badge-dark)]" style={{ "--badge-light": darken(item.color), "--badge-dark": lighten(item.color) }}>
        CR-0142
      </span>
    );
    const sep = <span aria-hidden="true" className="text-slate-400 dark:text-slate-500">/</span>;
    if (variant === "Single-level") return (
      <div className="flex items-center gap-1.5 text-xs font-bold">
        <span className="text-slate-600 dark:text-slate-300">Home</span>{sep}{current}
      </div>
    );
    if (variant === "Compact") return (
      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
        Home{sep}Projects{sep}Change Requests{sep}<span className="text-slate-700 dark:text-slate-200">CR-0142</span>
      </div>
    );
    // Collapsed is MaxDisplayedItems' own overflow behavior — the "…"
    // menu standing in for whatever middle levels didn't fit. Full trail
    // (the default) shows every real level instead, with nothing
    // collapsed, since a shallow hierarchy that always fits is the whole
    // point of that variant.
    if (variant === "Collapsed") return (
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
        <span className="text-slate-600 dark:text-slate-300">Home</span>{sep}
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500 dark:bg-white/10 dark:text-slate-400">&hellip;</span>{sep}
        <span className="text-slate-600 dark:text-slate-300">Change Requests</span>{sep}{current}
      </div>
    );
    return (
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
        <span className="text-slate-600 dark:text-slate-300">Home</span>{sep}
        <span className="text-slate-600 dark:text-slate-300">Projects</span>{sep}
        {/* ItemClickable false — same muted, separator-toned treatment
            rather than the usual link-implying slate-600, so a sighted
            visitor reads it as unavailable too, not just non-interactive
            underneath. A real case: a parent list this visitor can't
            open directly, only reach via a specific record. */}
        <span className="text-slate-500 dark:text-slate-400">Change Requests</span>{sep}{current}
      </div>
    );
  }

  if (item.title === "Approval Journey") {
    // DueDate/DelegatedTo are both optional per-stage fields (see
    // componentLibrary.js) — Priya Shah's stage carries neither,
    // demonstrating both are additive, not required on every stage.
    const stages = [
      { name: "Priya Shah", status: "Approved" },
      { name: "J. Okafor", status: "Pending", due: "Due Fri" },
      { name: "M. Chen", status: "Locked", delegatedTo: "R. Singh" }
    ];
    const dotColor = s => (s === "Approved" ? item.color : s === "Pending" ? "#0F6CBD" : "#475569");
    const initials = n => n.split(" ").map(w => w[0]).join("");
    if (variant === "Compact") return (
      <div className="flex flex-wrap items-center gap-1.5">
        {stages.map(s => (
          <span key={s.name} className="flex items-center gap-1.5 rounded-full bg-slate-50 py-1 pl-1 pr-2.5 dark:bg-white/10">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[8px] font-black text-white" style={{ background: dotColor(s.status) }}>{initials(s.name)}</span>
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{s.status}</span>
          </span>
        ))}
      </div>
    );
    // Everyone-must-approve and First-to-respond both open every stage
    // at once — Sequential's own "Locked until their turn" state is
    // exactly the thing neither of them does.
    if (variant === "Everyone must approve" || variant === "First to respond") {
      const firstToRespond = variant === "First to respond";
      const parallelStages = firstToRespond
        ? [{ name: "Priya Shah", status: "Approved" }, { name: "J. Okafor", status: "Closed" }, { name: "M. Chen", status: "Closed" }]
        : [{ name: "Priya Shah", status: "Approved" }, { name: "J. Okafor", status: "Pending" }, { name: "M. Chen", status: "Pending" }];
      const parallelDot = s => (s === "Approved" ? item.color : s === "Pending" ? "#0F6CBD" : "#475569");
      return (
        <div className="flex items-center">
          {parallelStages.map((s, i) => (
            <div key={s.name} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center text-center">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-black text-white" style={{ background: parallelDot(s.status) }}>{initials(s.name)}</span>
                <span className="mt-1.5 text-[9px] font-bold text-slate-600 dark:text-slate-300">{s.name}</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400">{firstToRespond && s.status === "Closed" ? "Closed — resolved" : s.status}</span>
              </div>
              {i < parallelStages.length - 1 && <span aria-hidden="true" className="mx-1 h-px flex-1 bg-slate-200 dark:bg-white/10" />}
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="flex items-center">
        {stages.map((s, i) => (
          <div key={s.name} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center text-center">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-black text-white" style={{ background: dotColor(s.status) }}>
                {initials(s.name)}
              </span>
              <span className="mt-1.5 text-[9px] font-bold text-slate-600 dark:text-slate-300">{s.name}</span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400">{s.status}</span>
              {s.due && <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">{s.due}</span>}
              {s.delegatedTo && <span className="text-[9px] italic text-slate-500 dark:text-slate-400">&rarr; {s.delegatedTo}</span>}
            </div>
            {i < stages.length - 1 && <span aria-hidden="true" className="mx-1 h-px flex-1 bg-slate-200 dark:bg-white/10" />}
          </div>
        ))}
      </div>
    );
  }

  if (item.title === "Guided Process Stepper") {
    const steps = [
      { label: "Details", status: "done" },
      { label: "Documents", status: "done" },
      { label: "Review", status: "current" },
      { label: "Submit", status: "upcoming" }
    ];
    const dotColor = s => (s === "done" ? item.color : s === "current" ? "#0F6CBD" : "#475569");
    // CanAdvance false — the active step's own screen hasn't satisfied
    // whatever the host considers complete yet, so Next stays disabled
    // with a stated reason rather than a silently grayed-out button.
    const canAdvance = false;
    const numbered = variant === "Numbered";
    const linearLocked = variant === "Linear-locked";
    const dotLabel = (s, i) => numbered ? i + 1 : s.status === "done" ? "✓" : i + 1;
    if (variant === "Vertical") return (
      <div className="space-y-1">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-black text-white" style={{ background: dotColor(s.status) }}>{dotLabel(s, i)}</span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{s.label}</span>
          </div>
        ))}
      </div>
    );
    return (
      <div>
        <div className="flex items-center">
          {steps.map((s, i) => (
            <div key={s.label} className="flex flex-1 items-center last:flex-none">
              {/* Linear-locked's own delta from Standard: a done step is
                  still visually marked done, but nothing here implies it
                  can be tapped back into. The reduced-opacity treatment
                  stays on just the dot, not the label text underneath it
                  — opacity multiplies against whatever sits behind an
                  element, so applying it to the whole step (label
                  included) silently drags already-modest text contrast
                  below the minimum along with the dot. */}
              <div className="flex flex-col items-center">
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-black text-white ${linearLocked && s.status === "done" ? "opacity-70" : ""}`}
                  style={{ background: dotColor(s.status) }}
                >
                  {dotLabel(s, i)}
                </span>
                <span className="mt-1.5 text-[9px] font-bold text-slate-600 dark:text-slate-300">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <span aria-hidden="true" className="mx-1 h-px flex-1" style={{ background: s.status === "done" ? item.color : "#e2e8f0" }} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
            {linearLocked ? "Completed steps can’t be revisited" : canAdvance ? "" : "Complete the required fields to continue"}
          </span>
          <Btn type="button" disabled={interactive ? !canAdvance : undefined} className="shrink-0 rounded-full px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40" style={{ background: item.color }}>Next</Btn>
        </div>
      </div>
    );
  }

  if (item.title === "Workflow Route Map") {
    // Lane is optional (see componentLibrary.js) — a Nodes table with no
    // Lane values renders the original single flat row unchanged; the
    // Swimlane variant sets Lane on every node specifically to demonstrate
    // grouping nodes into bands by owner/team in first-seen order, rather
    // than requiring a second, separate table.
    const nodes = [
      { label: "Intake", status: "done", lane: "Support" },
      { label: "Triage", status: "done", lane: "Support" },
      { label: "Review", status: "active", lane: "Engineering" },
      { label: "Resolved", status: "pending", lane: "Engineering" }
    ];
    const renderNode = n => n.status === "active" ? (
      <span className="rounded-lg border-2 px-2.5 py-1.5 text-[10px] font-bold text-white" style={{ background: item.color, borderColor: item.color }}>
        {n.label}
      </span>
    ) : n.status === "done" ? (
      <span
        className={`rounded-lg border-2 px-2.5 py-1.5 text-[10px] font-bold ${CONTAINER_TEXT_CLASS}`}
        style={{ ...container(item.color), borderColor: item.color }}
      >
        {n.label}
      </span>
    ) : (
      <span className="rounded-lg border-2 border-slate-300 px-2.5 py-1.5 text-[10px] font-bold text-slate-500 dark:border-white/20 dark:text-slate-400">{n.label}</span>
    );
    if (variant === "Swimlane") {
      const lanes = [...new Set(nodes.map(n => n.lane))];
      return (
        <div className="space-y-2">
          {lanes.map(lane => (
            <div key={lane} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-white/5">
              <span className="w-20 shrink-0 text-[9px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{lane}</span>
              <div className="flex flex-1 flex-wrap items-center gap-1.5">
                {nodes.filter(n => n.lane === lane).map((n, i, laneNodes) => (
                  <div key={n.label} className="flex items-center gap-1.5">
                    {renderNode(n)}
                    {i < laneNodes.length - 1 && <span aria-hidden="true" className="text-slate-400 dark:text-slate-500">&rarr;</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (variant === "Branching") {
      const branchA = { label: "Auto-approve", status: "active" };
      const branchB = { label: "Manual review", status: "pending" };
      return (
        <div className="flex items-center gap-1.5">
          {renderNode({ label: "Intake", status: "done" })}
          <span aria-hidden="true" className="text-slate-400 dark:text-slate-500">&rarr;</span>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">{renderNode(branchA)}<span aria-hidden="true" className="text-slate-400 dark:text-slate-500">&rarr;</span>{renderNode({ label: "Resolved", status: "pending" })}</div>
            <div className="flex items-center gap-1.5">{renderNode(branchB)}<span aria-hidden="true" className="text-slate-400 dark:text-slate-500">&rarr;</span>{renderNode({ label: "Resolved", status: "pending" })}</div>
          </div>
        </div>
      );
    }
    // Linear (the default) and Compact are both flat, single-row
    // sequences with no branch points and no lane grouping — the two
    // things Branching and Swimlane each add on top of it.
    const compact = variant === "Compact";
    return (
      <div className={`flex flex-wrap items-center ${compact ? "gap-1" : "gap-1.5"}`}>
        {nodes.map((n, i) => (
          <div key={n.label} className="flex items-center gap-1.5">
            <span className={compact ? "scale-90" : ""}>{renderNode(n)}</span>
            {i < nodes.length - 1 && <span aria-hidden="true" className="text-slate-400 dark:text-slate-500">&rarr;</span>}
          </div>
        ))}
      </div>
    );
  }

  if (item.title === "Branded Loading Experience") {
    if (variant === "Spinner") return (
      <div className="grid place-items-center rounded-xl bg-slate-50 py-10 dark:bg-white/5">
        <span aria-hidden="true" className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 dark:border-white/10" style={{ borderTopColor: item.color }} />
        <b className="mt-4 text-sm">Loading your workspace</b>
      </div>
    );
    if (variant === "Branded splash") return (
      <div className="grid place-items-center rounded-xl py-14 text-white" style={{ background: item.color }}>
        <span className="grid h-16 w-16 place-items-center rounded-3xl bg-white/20 text-2xl font-black">UP</span>
        <b className="mt-4 text-sm">Uday Posia</b>
        {/* Full-opacity white, not /70 — the same fix as Executive KPI
            Card's own Filled variant: translucent white over a solid
            brand background is the one place this file's usual "muted
            caption" treatment reliably fails contrast. */}
        <span className="mt-1 text-[10px] font-bold text-white">Loading&hellip;</span>
      </div>
    );
    if (variant === "Skeleton") return (
      <div className="space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-white/5">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
          <span aria-hidden="true" className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
        </div>
        <span aria-hidden="true" className="block h-20 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-white/10" />
        <span aria-hidden="true" className="block h-3 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
      </div>
    );
    return (
      <div className="space-y-3">
        <div className="grid place-items-center rounded-xl bg-slate-50 py-8 dark:bg-white/5">
          <span className="grid h-12 w-12 place-items-center rounded-2xl text-lg font-black text-white" style={{ background: item.color }}>UP</span>
          <b className="mt-4 text-sm">Loading your workspace</b>
          <div className="mt-3 h-1.5 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div className="h-full rounded-full" style={{ width: "64%", background: item.color }} />
          </div>
          <span className="mt-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">64% &middot; About 12 seconds left</span>
        </div>
        {/* HasError/OnRetry — a distinct state from the in-flight one
            above, shown side by side rather than only described, the
            same reasoning Governed File Upload's own two dropzone
            states use elsewhere in this file. */}
        <div className="grid place-items-center rounded-xl bg-red-50 py-6 dark:bg-red-900/20">
          <span aria-hidden="true" className="text-xl">&#9888;&#65039;</span>
          <b className="mt-2 text-xs text-red-900 dark:text-red-100">Couldn&rsquo;t load your workspace</b>
          <Btn type="button" className="mt-3 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-red-900 shadow-sm dark:bg-white/10 dark:text-red-100">Retry</Btn>
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
