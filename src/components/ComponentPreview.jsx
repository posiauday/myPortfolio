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
          <button type="button" className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
            <span aria-hidden="true">&#8645;</span> Newest first
          </button>
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
        <button type="button" className="mt-4 w-full rounded-xl bg-slate-100 py-2 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">Load more</button>
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
                <button type="button" className="shrink-0 text-[9px] font-bold text-slate-500 underline dark:text-slate-400">Request a change</button>
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
    const groups = [
      {
        name: "Order #4821 — Acme Corp",
        expanded: true,
        children: [
          { name: "Line 1 — Widget A x200", tag: "Shipped", color: item.color, checked: true },
          { name: "Line 2 — Widget B x50", tag: "Processing", color: "#0F6CBD", checked: false }
        ]
      },
      { name: "Order #4820 — Globex Inc", expanded: false, children: [] }
    ];
    return (
      <div>
        <div className="mb-2 flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
          <span>1 selected</span>
          <span>Page 1 of 3</span>
        </div>
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
                    <div key={c.name} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 shadow-sm dark:bg-white/10">
                      <span
                        aria-hidden="true"
                        className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-sm border text-[9px] font-black text-white ${c.checked ? "border-transparent" : "border-slate-300 dark:border-white/20"}`}
                        style={c.checked ? { background: item.color } : undefined}
                      >
                        {c.checked ? "✓" : ""}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs">{c.name}</span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${CONTAINER_TEXT_CLASS}`}
                        style={container(c.color)}
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
      </div>
    );
  }

  if (item.title === "Enterprise Data Table") {
    const rows = [
      { name: "Website redesign", status: "On track", statusColor: item.color, priority: "High", priorityColor: "#D83B01", checked: true },
      { name: "Data migration", status: "At risk", statusColor: "#D83B01", priority: "Medium", priorityColor: "#0F6CBD", checked: false },
      { name: "Vendor onboarding", status: "Complete", statusColor: "#5B5BD6", priority: "Low", priorityColor: "#64748B", checked: false }
    ];
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
          <div className="grid grid-cols-[auto_1.4fr_.8fr_.8fr_auto] items-center gap-2 bg-slate-50 px-3 py-2 text-[10px] font-black uppercase text-slate-500 dark:bg-white/10 dark:text-slate-400">
            <span aria-hidden="true" className="grid h-3.5 w-3.5 place-items-center rounded-sm border border-slate-400 dark:border-white/30" />
            <span className="flex items-center gap-1">Project <span aria-hidden="true">&#9650;</span></span>
            <span>Status</span><span>Priority</span><span />
          </div>
          {rows.map(r => (
            <div key={r.name} className="grid grid-cols-[auto_1.4fr_.8fr_.8fr_auto] items-center gap-2 border-t border-slate-100 px-3 py-2.5 text-xs dark:border-white/10">
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
                not implied by low-contrast text alone. */}
            <button type="button" disabled className="text-[10px] font-bold text-slate-300 dark:text-white/20">&#8249; Prev</button>
            <button type="button" className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Next &#8250;</button>
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
        {/* ShowBcc adds this third picker beside To/CC — shown here since
            the property exists and should be demonstrated doing
            something, the same reasoning as every other opt-in property
            illustrated elsewhere in this file. */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 py-2 dark:border-white/10">
          <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Bcc</span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold dark:bg-white/10">M. Chen</span>
        </div>
        <div className="mt-2 border-b border-slate-100 pb-2 text-xs font-bold dark:border-white/10">Re: Case #4821 status update</div>
        <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-[10px] leading-5 text-slate-500 dark:bg-white/10 dark:text-slate-400">
          &gt; Original request: please confirm the vendor timeline for next week.
        </div>
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
    return (
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
  }

  if (item.title === "Enterprise Mega Menu") {
    const navButtons = ["Products", "Solutions", "Resources", "Pricing"];
    const panel = {
      Platform: [{ label: "Power Apps" }, { label: "Power Automate" }, { label: "Dataverse" }],
      Extend: [{ label: "Copilot Studio", badge: "New" }, { label: "AI Builder" }, { label: "Power Pages" }]
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
    return (
      <div>
        <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Portfolio command</span>
        <h3 className="mt-1 text-lg font-black">Executive overview</h3>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {metrics.map(m => (
            <div key={m.label} className="rounded-xl bg-slate-50 p-3 shadow-sm dark:bg-white/10">
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
        <div className="mt-3 flex h-16 items-end gap-1.5 rounded-xl bg-slate-50 p-3 shadow-sm dark:bg-white/10">
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
            </div>
          ))}
        </div>
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
                <span className="flex shrink-0 items-center gap-0.5 text-[9px] font-bold text-slate-500 dark:text-slate-400">
                  <span aria-hidden="true">{trendGlyph[d.trend]}</span>{d.trend}
                </span>
              </div>
              <p className="mt-1.5 text-[10px] leading-4 text-slate-500 dark:text-slate-400">{d.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-600 dark:border-white/10 dark:text-slate-300">
          Schedule slip on the vendor integration workstream is the one item steering needs to weigh in on this week.
        </p>
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
    return (
      <div className="relative pt-2">
        <span aria-hidden="true" className="absolute left-0 right-0 top-[22px] h-px bg-slate-200 dark:bg-white/10" />
        <div className="relative flex justify-between">
          {milestones.map(m => (
            <div key={m.name} className="flex flex-col items-center px-1 text-center" style={{ width: `${100 / milestones.length}%` }}>
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
    // Size: Small — the default; the 280px cap below is that slot.
    // Medium/Large widen the same slot for a Custom content dialog
    // carrying more than one line of text.
    return (
      <div className="grid place-items-center rounded-xl bg-slate-100 p-6 dark:bg-white/5">
        <div className="w-full max-w-[280px]">
          <span className="mb-1.5 block w-fit rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-slate-600 dark:bg-white/10 dark:text-slate-300">Size: Small</span>
          <div className="rounded-2xl bg-white p-5 shadow-xl dark:bg-[#17201B]">
            <b className="text-sm">Delete confirmation</b>
            <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">This action can&rsquo;t be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold dark:bg-white/10">Cancel</span>
              <span className="rounded-full px-3 py-1.5 text-xs font-bold text-white" style={{ background: "#D13438" }}>Confirm</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (item.title === "Comments & Mentions") {
    return (
      <div>
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
            </div>
          </div>
          <div className="flex gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[9px] font-black text-white" style={{ background: "#0F6CBD" }}>JO</span>
            <div className="min-w-0 flex-1 rounded-xl bg-slate-50 p-2.5 shadow-sm dark:bg-white/10">
              <div className="flex items-center justify-between gap-2">
                <b className="text-xs">J. Okafor</b>
                <span className="shrink-0 text-[10px] text-slate-500 dark:text-slate-400">1h ago</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">On it &mdash; will confirm by EOD.</p>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 dark:border-white/10">
          <span className="flex-1 text-xs text-slate-500 dark:text-slate-400">Add a comment&hellip;</span>
          <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: item.color }}>Post</span>
        </div>
      </div>
    );
  }

  if (item.title === "Responsive Breadcrumbs") {
    return (
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
        <span className="text-slate-600 dark:text-slate-300">Home</span>
        <span aria-hidden="true" className="text-slate-400 dark:text-slate-500">/</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500 dark:bg-white/10 dark:text-slate-400">&hellip;</span>
        <span aria-hidden="true" className="text-slate-400 dark:text-slate-500">/</span>
        {/* ItemClickable false — same muted, separator-toned treatment
            rather than the usual link-implying slate-600, so a sighted
            visitor reads it as unavailable too, not just non-interactive
            underneath. A real case: a parent list this visitor can't
            open directly, only reach via a specific record. */}
        <span className="text-slate-500 dark:text-slate-400">Change Requests</span>
        <span aria-hidden="true" className="text-slate-400 dark:text-slate-500">/</span>
        <span
          className="text-[color:var(--badge-light)] dark:text-[color:var(--badge-dark)]"
          style={{ "--badge-light": darken(item.color), "--badge-dark": lighten(item.color) }}
        >
          CR-0142
        </span>
      </div>
    );
  }

  if (item.title === "Approval Journey") {
    const stages = [
      { name: "Priya Shah", status: "Approved" },
      { name: "J. Okafor", status: "Pending" },
      { name: "M. Chen", status: "Locked" }
    ];
    const dotColor = s => (s === "Approved" ? item.color : s === "Pending" ? "#0F6CBD" : "#475569");
    return (
      <div className="flex items-center">
        {stages.map((s, i) => (
          <div key={s.name} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center text-center">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-black text-white" style={{ background: dotColor(s.status) }}>
                {s.name.split(" ").map(n => n[0]).join("")}
              </span>
              <span className="mt-1.5 text-[9px] font-bold text-slate-600 dark:text-slate-300">{s.name}</span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400">{s.status}</span>
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
    return (
      <div className="flex items-center">
        {steps.map((s, i) => (
          <div key={s.label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-black text-white" style={{ background: dotColor(s.status) }}>
                {s.status === "done" ? "✓" : i + 1}
              </span>
              <span className="mt-1.5 text-[9px] font-bold text-slate-600 dark:text-slate-300">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <span aria-hidden="true" className="mx-1 h-px flex-1" style={{ background: s.status === "done" ? item.color : "#e2e8f0" }} />
            )}
          </div>
        ))}
      </div>
    );
  }

  if (item.title === "Workflow Route Map") {
    // Lane is optional (see componentLibrary.js) — a Nodes table with no
    // Lane values renders the original single flat row unchanged; this
    // sample sets Lane on every node specifically to demonstrate the
    // Swimlane variant, grouping nodes into bands by owner/team in
    // first-seen order rather than requiring a second, separate table.
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

  if (item.title === "Branded Loading Experience") {
    return (
      <div className="grid place-items-center rounded-xl bg-slate-50 py-8 dark:bg-white/5">
        <span className="grid h-12 w-12 place-items-center rounded-2xl text-lg font-black text-white" style={{ background: item.color }}>UP</span>
        <b className="mt-4 text-sm">Loading your workspace</b>
        <div className="mt-3 h-1.5 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div className="h-full rounded-full" style={{ width: "64%", background: item.color }} />
        </div>
        <span className="mt-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">64%</span>
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
