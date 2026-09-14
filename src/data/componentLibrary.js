import {
  Award, BarChart3, Database, FileText, Layers3, ShieldCheck, Sparkles, Workflow
} from "lucide-react";

/* ============================================================
   DATA — component library catalog
   ============================================================ */
const categories = ["All", "Analytics", "Executive", "PMO", "Data Display", "Forms", "Navigation", "Workflow", "Utilities"];

const icons = {
  Analytics: BarChart3,
  Executive: Award,
  PMO: ShieldCheck,
  "Data Display": Database,
  Forms: FileText,
  Navigation: Layers3,
  Workflow: Workflow,
  Utilities: Sparkles
};

const raw = [
  ["Executive KPI Card", "Analytics", "Verified"],
  ["Responsive Line Chart", "Analytics", "Verified"],
  ["Portfolio Command Card", "Executive", "Original"],
  ["Program Scorecard", "Executive", "Original"],
  ["Operational Status Banner", "Executive", "Original"],
  ["Portfolio Risk Matrix", "PMO", "Original"],
  ["Project Health Summary", "PMO", "Original"],
  ["Milestone Tracker", "PMO", "Original"],
  ["Decision Log", "PMO", "Original"],
  ["Deadline Intelligence", "Data Display", "Verified"],
  ["Activity Timeline", "Data Display", "Verified"],
  ["Enterprise Calendar", "Data Display", "Verified"],
  ["Accordion Record List", "Data Display", "Verified"],
  ["Enterprise Data Table", "Data Display", "Verified"],
  ["Governed File Upload", "Forms", "Verified"],
  ["Governed Email Composer", "Forms", "Verified"],
  ["Enterprise Dialog", "Forms", "Original"],
  ["Comments & Mentions", "Forms", "Original"],
  ["Enterprise Sidebar", "Navigation", "Verified"],
  ["Responsive Breadcrumbs", "Navigation", "Original"],
  ["Enterprise Mega Menu", "Navigation", "Verified"],
  ["Approval Journey", "Workflow", "Original"],
  ["Guided Process Stepper", "Workflow", "Original"],
  ["Workflow Route Map", "Workflow", "Original"],
  ["Branded Loading Experience", "Utilities", "Original"]
];

// Generic starting point for any component in a category that has no
// component-specific override below. Kept intentionally plain — a real
// entry should almost always override at least properties and events.
const baseByCategory = {
  Analytics: {
    properties: [["ChartData", "Table", "Required", "Records rendered by the visual"], ["Theme", "Text", "Light", "Light or Dark presentation"], ["Accent", "Text", "#168326", "Primary visual color"]],
    events: [],
    architecture: ["Input table is shaped by the host app", "Component calculates presentation values", "Native controls or encoded SVG render the visual"],
    examples: ["Executive KPI strip", "Portfolio trend panel", "Operational scorecard"],
    accessibility: ["Do not communicate status by color alone", "Provide readable labels for every value", "Maintain AA contrast for text and indicators"],
    limitations: ["Demo preview uses synthetic data", "Host app owns filtering and delegation"]
  },
  Executive: {
    properties: [["Metrics", "Table", "Required", "Executive measures to display"], ["Period", "Text", "Current", "Reporting context"], ["Compact", "Boolean", "false", "Condensed layout"]],
    events: [["OnMetricSelect", "Returns the selected executive measure"]],
    architecture: ["Governed measures are calculated upstream", "Component presents decision context", "Selection routes to supporting detail"],
    examples: ["Portfolio command centre", "Program review", "Leadership briefing"],
    accessibility: ["Status includes text and color", "Large values retain readable labels", "Keyboard focus follows visual order"],
    limitations: ["Not a semantic model", "Measure definitions must be governed upstream"]
  },
  PMO: {
    properties: [["Items", "Table", "Required", "Project, risk, milestone or decision records"], ["ProjectId", "Text", "Blank", "Optional project filter"], ["StatusConfig", "Table", "Default", "Status and tone mapping"]],
    events: [["OnSelect", "Returns the selected PMO record"], ["OnAction", "Returns the selected action and key"]],
    architecture: ["PMO source data remains outside the component", "A shaped collection forms the component contract", "Outputs drive drill-through or host actions"],
    examples: ["Portfolio project drill-through", "Risk review", "Milestone governance"],
    accessibility: ["RAG status includes a text label", "Counts have descriptive labels", "Selection is available from keyboard controls"],
    limitations: ["The component does not Patch a data source", "Delegable filtering belongs in the host app"]
  },
  "Data Display": {
    properties: [["Items", "Table", "Required", "Records shown by the component"], ["Config", "Record", "Default", "Layout and behavior settings"], ["Theme", "Text", "Light", "Light or Dark mode"]],
    events: [["OnItemSelect", "Returns the selected record"]],
    architecture: ["Host shapes source records", "Component owns presentation state only", "Selection is exposed through output properties"],
    examples: ["Case detail", "Project record browser", "Operational dashboard"],
    accessibility: ["Interactive rows expose meaningful labels", "Focus order follows reading order", "Empty and loading states use text"],
    limitations: ["Source-specific writes stay in the host", "Large sources require delegated loading"]
  },
  Forms: {
    properties: [["Items", "Table", "Optional", "Existing records or selectable options"], ["Busy", "Boolean", "false", "Disables actions during processing"], ["Config", "Record", "Default", "Validation and display options"]],
    events: [["OnSave", "Returns validated staged values"], ["OnCancel", "Closes without committing"], ["OnDelete", "Returns the host-owned record key"]],
    architecture: ["Component stages user input", "Validation runs before an event fires", "Host connector or flow performs persistence"],
    examples: ["Document intake", "Governed email", "Case update dialog"],
    accessibility: ["Every field has a visible label", "Validation messages identify the field", "Disabled actions explain unmet requirements"],
    limitations: ["The component owns no connector", "Host app handles persistence and error recovery"]
  },
  Navigation: {
    properties: [["Items", "Table", "Required", "Navigation destinations"], ["SelectedKey", "Text", "Blank", "Current route key"], ["Expanded", "Boolean", "true", "Expanded or compact state"]],
    events: [["OnItemSelect", "Returns the selected destination"]],
    architecture: ["A table defines the information hierarchy", "Component maintains expansion state", "Host maps selected keys to screens"],
    examples: ["Enterprise app shell", "Mobile navigation", "Record hierarchy"],
    accessibility: ["Current destination is announced in text", "Controls have descriptive accessible names", "Keyboard order matches hierarchy"],
    limitations: ["Screen routing remains host-owned", "Deep links require app-specific mapping"]
  },
  Workflow: {
    properties: [["Stages", "Table", "Required", "Ordered workflow stages"], ["CurrentStage", "Text", "Blank", "Active stage key"], ["Compact", "Boolean", "false", "Condensed presentation"]],
    events: [["OnStageSelect", "Returns the selected stage"], ["OnAction", "Returns the requested workflow action"]],
    architecture: ["Workflow engine remains external", "Component visualizes stage and status", "Host validates and commits transitions"],
    examples: ["Approval journey", "Referral routing", "Guided intake"],
    accessibility: ["Completed, current and blocked are textual states", "Connectors are decorative", "Locked stages explain why navigation is unavailable"],
    limitations: ["Does not execute approvals", "Host enforces transition permissions"]
  },
  Utilities: {
    properties: [["Title", "Text", "Working", "Primary message"], ["Progress", "Number", "0", "Completion percentage"], ["CanCancel", "Boolean", "false", "Shows cancellation action"]],
    events: [["OnCancel", "Signals cancellation request"]],
    architecture: ["Host supplies operation state", "Component renders feedback", "Output signals optional cancellation"],
    examples: ["App startup", "Data refresh", "Document processing"],
    accessibility: ["Progress has a readable label", "Motion respects reduced-motion settings", "Status changes remain visible as text"],
    limitations: ["Cannot cancel a process by itself", "Progress accuracy depends on host inputs"]
  }
};

// Fallback for any component whose override below doesn't yet specify its
// own variants (name/description pairs) — the same four generic
// descriptions every component originally showed, kept verbatim here so
// nothing visually changes for a not-yet-redone component. A redone
// component's own `variants` in its override replaces this entirely with
// names and descriptions specific to what that real component actually
// offers, rather than the same four labels regardless of the component.
const GENERIC_VARIANTS = [
  ["Standard", "Full information layout for primary screens."],
  ["Compact", "Reduced density for galleries and constrained layouts."],
  ["Dark", "Token-adjusted surfaces, borders and readable states."],
  ["Mobile", "Narrow layout with touch-friendly actions and stacking."]
];

// Component-specific overrides. The nine entries below are aligned to the
// real, published property/event contracts of their closest counterparts
// in the Power Apps UI component library (uploaded as reference docs),
// restated in this project's own words and its own naming — not copied
// verbatim, since that library's YAML and prose are its own.
const overrides = {
  "executive-kpi-card": {
    summary: "A single formatted measure with a trend arrow, a target comparison, and a click-through into supporting detail.",
    properties: [["Label", "Text", "Active projects", "Metric name"], ["Value", "Text", "156", "Formatted measure"], ["Trend", "Number", "12.4", "Change from comparison period"], ["Target", "Number", "150", "Target value"], ["Status", "Text", "On track", "Accessible status"], ["TooltipText", "Text", "Blank", "Calculation guidance"], ["ShowSparkline", "Boolean", "false", "Draws a trend sparkline under the value — real data, the same ChartData shape ResponsiveLineChart takes, not a decorative squiggle"], ["SparklineData", "Table", "12-point sample", "x/y pairs for the sparkline, ignored while ShowSparkline is false"]],
    events: [["OnSelect", "Opens supporting detail"]],
    architecture: ["Host provides governed DAX measure", "Card formats value, trend and status", "OnSelect routes to a drill-through page", "ShowSparkline reuses the exact SVG-path approach ResponsiveLineChart uses at a smaller scale, rather than a second charting implementation"],
    examples: ["Active projects", "At-risk projects", "Submitted this month"],
    accessibility: ["Status is its own text property, not inferred from color, so a screen reader announces \"On track\" even where the trend arrow's color can't be perceived", "TooltipText carries the calculation explanation as text, not only as a hover-only visual", "Trend direction reads as a word alongside the arrow glyph, not the glyph alone", "The sparkline is decorative when ShowSparkline is on — Trend and Status already state the same direction as text, so nothing is lost if the sparkline itself can't be perceived"],
    limitations: ["Formatting must match the measure", "Tooltip definitions must be maintained with KPI logic"],
    // Real variant names from researching published Power Apps KPI card
    // components (powerappsui.com's own KPI Cards catalog ships Standard/
    // Compact/Minimal/Filled/Chart) rather than this project's previous
    // generic Standard/Compact/Dark/Mobile set, which named the same four
    // labels regardless of what the component actually was.
    variants: [
      ["Standard", "Label, big value, trend pill and status line — the full card, as shown in Preview."],
      ["Compact", "Label and value only in a tighter card, for a dense KPI strip of many metrics side by side."],
      ["Minimal", "Value and label with no trend pill or status line, for a plain number inside a denser layout."],
      ["Filled", "A solid brand-color background instead of a white card, for the one KPI a screen wants to visually lead with."],
      ["Chart", "Standard plus ShowSparkline, drawing the trend as a small line under the value instead of only stating it as a percentage."]
    ]
  },
  "responsive-line-chart": {
    summary: "A single-series trend line rendered as one dependency-free inline SVG, with an auto-scaling axis and a matching gradient fill.",
    properties: [["ChartData", "Table", "12-month sample", "x (ordinal), y (value), label (axis text); auto-sorted by x"], ["LineColor", "Text", "#168326", "Hex color for the line and its area-fill gradient"], ["Smooth", "Boolean", "true", "Cubic-curve line versus straight segments"], ["Markers", "Boolean", "false", "Formatted value shown above each point — named to match the real Power Apps Line chart control's own Markers property"], ["MarkerSuffix", "Text", "Blank", "Text appended after each value when Markers is on, e.g. \"%\" or \"K\" — same idea as the native control's MarkerSuffix"], ["YAxisMax", "Number", "0", "Fixes the axis ceiling; 0 means auto-scale to a rounded ceiling above the data's own max"], ["Animate", "Boolean", "true", "Staggered draw-in animation on load"]],
    events: [],
    architecture: ["The whole chart is one Image control rendering an inline SVG, so it carries no charting-library dependency", "YAxisMax at 0 auto-scales to a rounded ceiling with headroom rather than fitting tightly to the data; set it explicitly to pin the axis instead, the same override the real Line chart control's own YAxisMax/YAxisMin properties give you", "A built-in gradient fades from LineColor to transparent, so the fill always matches whatever accent color is passed in"],
    examples: ["Monthly revenue trend", "Ticket volume over time", "SLA compliance history"],
    accessibility: ["The chart is one Image control, so it needs AltText summarizing the trend in words (e.g. \"Revenue up 12% over 12 months\") — the SVG itself carries no accessible structure of its own", "Markers prints values directly on the chart for anyone who can see the image but not resolve fine gridlines", "Never rely on LineColor alone to convey state; pair it with a text summary elsewhere on the screen"],
    limitations: ["Single series only; a multi-series comparison needs a different chart", "No interactive tooltips, since inline SVG inside an Image control cannot respond to hover"],
    // Real Power Apps Line chart properties (Markers, YAxisMax/YAxisMin,
    // MarkerSuffix) checked against Microsoft's own published control
    // reference before renaming ShowPointLabels above — see
    // learn.microsoft.com/power-apps/maker/canvas-apps/controls/control-column-line-chart.
    // Variants below reflect real ways this exact chart gets reused
    // elsewhere in this catalog: Sparkline is the compact form
    // ExecutiveKpiCard's own Chart variant asks for.
    variants: [
      ["Standard", "Axis, gradient fill and smoothed line — the full chart, as shown in Preview."],
      ["Sparkline", "No axis or labels, just the line and fill at a fraction of the size, for embedding inside a KPI card or a table cell."],
      ["Dashed forecast", "A dashed, unfilled stroke instead of the solid gradient, for a projected or unconfirmed series shown alongside a real one."],
      ["Point-labeled", "Markers on, every value printed above its point, for a chart that has to stand alone as a static export or screenshot."]
    ]
  },
  "deadline-intelligence": {
    summary: "A countdown card that excludes weekends and holidays before stating a due date, not just a raw day-count.",
    properties: [["StartDate", "DateTime", "Today()", "The date the clock runs from; that day itself is never counted"], ["Days", "Number", "30", "Allowed duration, capped at 400 internally"], ["CompletedDate", "DateTime", "Blank", "Set once resolved; stops the countdown"], ["Holidays", "Table", "US federal default", "Observed HolidayName / HolidayDate pairs; override with your own"], ["Config", "Record", "Business days", "Count mode, working-week days, due-soon threshold and compact layout"]],
    events: [["OnSelect", "Returns the card selection"]],
    architecture: ["Weekends and observed holidays are excluded before a due date is picked, since an office closed on an observed Friday is still closed", "A bounded window of candidate dates is generated and searched rather than solved analytically, so an arbitrary working week can be priced in", "Every output derives from the inputs with no stored state, so the card is correct the instant it is placed"],
    examples: ["SLA deadline", "Contract response clock", "Compact gallery deadline"],
    accessibility: ["Status uses a dot and a label, not color alone", "The breakdown sentence explains the calculation in words", "The countdown states which unit it is counting"],
    limitations: ["Day-based, not hour-based", "Store the computed due date and reuse it rather than recalculating on every read, or a later holiday-table correction can quietly move a date someone was already given"],
    variants: [
      ["Standard", "Status dot, big day-count and the full breakdown sentence — the whole card, as shown in Preview."],
      ["Compact", "Dot and day-count only, no breakdown sentence, for a table cell or a dense list of many deadlines at once."],
      ["Badge", "Just a small colored pill (\"12d left\"), for a title bar or a card header where a full card would be too much."],
      ["Overdue emphasis", "Standard, but the status dot and count switch to a solid red treatment once CompletedDate is blank and the due date has passed."]
    ]
  },
  "activity-timeline": {
    summary: "A category-colored, rail-connected activity feed with per-category filtering and a loading skeleton state.",
    properties: [["Items", "Table", "Sample entries", "Event title, description, author, timestamp and category; each card sizes itself to its content"], ["FilterOptions", "Table", "Six categories", "Values shown in the filter dropdown; must match Items' category values"], ["IconMap", "Table", "Default mapping", "Maps each category to an icon and a rail dot color"], ["IsLoading", "Boolean", "false", "Swaps in skeleton placeholder cards instead of data"], ["CardHeight", "Number", "104", "Minimum card height; cards grow past it to fit their content"], ["RecordsToLoad", "Number", "10", "How many entries render before a Load more button appears — Dynamics 365's own timeline control caps this at 50 for the same reason: an unbounded feed slows down"]],
    events: [["OnItemSelect", "Returns the tapped record in full"], ["OnLoadMore", "Fires when Load more is pressed; host supplies the next page of Items"], ["OnExport", "Fires from the toolbar's export action"], ["OnPrint", "Fires from the toolbar's print action"]],
    architecture: ["A single variable-height gallery draws a rail line connecting category-colored dots to each card", "Entries flagged with a sub-detail render an extra HTML block below the card, for something like an email preview", "Category, icon and dot color are all data-driven through IconMap, never hardcoded per entry", "RecordsToLoad renders only that many rows and reveals Load more past it — the same paging shape Dynamics 365's own Timeline control uses, rather than a client-side gallery holding an entire unbounded history at once"],
    examples: ["Case audit history", "Approval tracking", "CRM activity"],
    accessibility: ["IsLoading swaps in skeleton cards carrying a text-equivalent \"Loading activity…\" label, not just a bare shimmer", "Each entry's category is announced through its IconMap text label, not only its icon or dot color", "The rail's connecting line is decorative; reading order follows gallery order, not visual position on the line", "Load more is a real focusable button with a text label stating what it does, not an infinite-scroll trigger a keyboard or screen-reader user has no way to invoke"],
    limitations: ["A very long sub-detail message grows its card and can slow gallery scrolling; cap it at the source", "Filtering shows one active category at a time, driven by FilterOptions", "RecordsToLoad pages what's already in Items; fetching the next page's records from the source system is the host's own job on OnLoadMore"],
    variants: [
      ["Standard", "Full cards with description, author and timestamp on a connected rail — as shown in Preview."],
      ["Compact", "One line per entry (dot, title, relative time only), for a sidebar or a panel with limited height."],
      ["Grouped by date", "Entries clustered under \"Today\" / \"Yesterday\" / \"Earlier\" date headers instead of one continuous rail."],
      ["Paginated", "Standard, but RecordsToLoad renders as an explicit page with a visible Load more button at the bottom rather than the whole Items table at once."]
    ]
  },
  "enterprise-calendar": {
    summary: "A month/week/agenda calendar that reports its own visible date window so the host loads only what's on screen.",
    properties: [["Events", "Table", "Required", "Flat occurrences, one row per day an event appears on; a multi-day event is several rows"], ["Channels", "Table", "Required", "Category key, title and color used to tint each chip"], ["FocusDate", "DateTime", "Today()", "Which month or week opens first"], ["View", "Text", "month", "month, week or agenda"], ["Config", "Record", "Default", "Row height, chip slots, first day of week, work hours and holiday tinting"]],
    events: [["OnRangeChange", "Fires whenever the visible window moves; returns the exact start and end drawn"], ["OnViewChange", "Fires when the toolbar switches views"], ["OnSelectDay", "Fires when a day cell or its overflow link is tapped"], ["OnSelectEvent", "Fires when a chip is tapped"]],
    architecture: ["The component reports the date window it is about to draw, so the host loads only that bounded window rather than a whole list", "Month, week and agenda each render from one flat gallery per view, never nested, so no inner control ever reads a frozen ThisItem", "Recurrence must already be materialized into individual occurrence rows before it reaches the component; it does not expand a rule itself — real RRULE-based PCF calendar controls hit exactly this wall (RRULE recurrence rules are genuinely hard to expand correctly inside a control), which is the actual reason materializing occurrences upstream, in the host's own Power Automate flow or query, is the pattern used here rather than a rule the component tries to interpret itself"],
    examples: ["Reporting calendar", "Inspection schedule", "Leave and coverage"],
    accessibility: ["Every day cell exposes its full date as an accessible name, not just the day number shown visually", "Channel color tints are always paired with the channel's text title on the chip itself, never color alone", "Switching View (month/week/agenda) goes through the toolbar's own labeled buttons, not a silent visual swap"],
    limitations: ["No drag-to-reschedule; a chip tap is read-only navigation", "A repeating series must already exist as one row per occurrence"],
    // View's own real values (month/week/agenda) are also the component's
    // most meaningful variants, plus one presentational mode View doesn't
    // cover — a small non-interactive month grid for a sidebar date picker.
    variants: [
      ["Month view", "A full month grid with day cells, overflow links, and up to Config's chip-slot limit of event chips per day."],
      ["Week view", "Seven columns across a single week, with more per-day room for chips before anything overflows."],
      ["Agenda view", "A flat, chronological list of occurrences grouped by day — best for a narrow screen or a long stretch of sparse dates."],
      ["Compact mini", "A small read-only month grid with no chips, just date dots for days that have events — for a sidebar or a date-picker-sized space."]
    ]
  },
  "accordion-record-list": {
    summary: "A flat, two-level accordion — parent groups over child rows — that renders any status set through a shared Tag/Tone pair.",
    properties: [["Groups", "Table", "Sample orders", "Parent rows; GroupKey must never be zero, since zero is the internal collapsed-state sentinel"], ["Items", "Table", "Sample lines", "Child rows linked to a parent by GroupKey"], ["Config", "Record", "Light, all switches on", "Every key is Coalesced, so a partial record is safe"], ["Title", "Text", "\"Orders\"", "Heading shown above the list"]],
    events: [["OnSelectGroup", "Fires after the tapped group's expanded state has already changed"], ["OnSelectItem", "Fires when a child row is tapped"], ["OnMoveUp", "Returns the row's key and whether it was a group or an item"], ["OnMoveDown", "Returns the row's key and whether it was a group or an item"], ["OnEdit", "Opens the host's own editor for a group or item"], ["OnDelete", "Requests the host's own confirmation and removal"]],
    architecture: ["One flat gallery renders both parent and child rows, avoiding nested-gallery height constraints entirely", "Tag and Tone are separate — Tag is the label text, Tone is the color — so the same control renders order states, approval states or task states with no extra configuration", "Every action raises an event and stops; the component owns no data and performs no Patch itself"],
    examples: ["Project phases and tasks", "Orders and lines", "Checklist sections"],
    accessibility: ["Expand/collapse exposes an accessible expanded state on the group header, not just a rotating chevron", "Tag/Tone pairs always render the Tag text — Tone's color is never the only signal for a row's state", "OnMoveUp/OnMoveDown are reachable from the keyboard, not only from drag handles"],
    limitations: ["GroupKey can never be zero, since zero is reserved to mean nothing expanded", "Comfortable into the low hundreds of groups; past that, paging beats an ever-taller accordion"],
    // Community Power Apps accordion patterns land on the same single-
    // flat-gallery shape this component already uses over two nested
    // galleries, specifically because nested flexible-height galleries
    // fight Power Apps' own height-measuring — real-world confirmation
    // of an existing design choice, not a change.
    variants: [
      ["Standard", "Parent groups with child rows, multiple groups open at once — as shown in Preview."],
      ["Compact", "Tighter row height and no Tag/Tone pill padding, for a dense list of many groups."],
      ["Single-expand", "Opening one group collapses whichever other group was open — classic accordion behavior, instead of Standard's several-open-at-once."],
      ["Checklist", "Child rows render a checkbox in place of the Tag/Tone pill, for a task or requirements list rather than a status list."]
    ]
  },
  "enterprise-data-table": {
    summary: "One row contract rendered as a table, card, or list, with status/priority colors and row actions resolved through shared lookup config.",
    properties: [["Items", "Table", "Sample records", "Rows to display; progress columns need CompletedSteps and TotalSteps"], ["ViewMode", "Text", "table", "Initial view: table, card or list"], ["ContextMenuItems", "Table", "View / Edit / Delete", "Row action menu items — key, label, enabled, visible"], ["StatusConfig", "Table", "Default", "Status-to-color lookup, case-insensitive, with a default fallback row"], ["PriorityConfig", "Table", "Default", "Priority-to-color lookup, same pattern as StatusConfig"], ["NoDataText", "Text", "No records to show", "Empty-state message — matches the real canvas Data table control's own NoDataText property"]],
    events: [["OnRowSelect", "Fires when a row, card or list item is tapped"], ["OnMenuItemSelect", "Fires when a row action is chosen; returns the item and the action key"], ["OnViewChange", "Fires when the visitor switches between table, card and list views"]],
    architecture: ["Table, card and list views share one Items contract and one set of context menus", "Status and priority colors resolve through a lookup table with a default row, never a hardcoded switch", "Segmented progress bars render from CompletedSteps / TotalSteps fields already present on each row"],
    examples: ["Project register", "Case browser", "Responsive mobile list"],
    accessibility: ["Status and Priority always render their StatusConfig/PriorityConfig text label, never the lookup color alone", "Switching ViewMode (table/card/list) keeps the same accessible row structure and selection state underneath", "The row-action menu's items carry accessible names for keyboard and screen-reader use, not an icon-only affordance"],
    // Checked against Microsoft's own real canvas Data table control
    // (learn.microsoft.com/power-apps/maker/canvas-apps/controls/control-data-table)
    // deliberately, since this component already goes well past it —
    // the native control is read-only, single-row-select only, has no
    // built-in column sort/filter, and can't show images or related-
    // table fields. Worth stating plainly rather than implying parity:
    // this contract is closer to a PCF-grade grid than the native
    // control, and multi-select / sortable headers are real gaps a
    // future revision could close, not things already covered.
    limitations: ["The native row-action menu renders text labels only; custom per-item icons and colors are reserved but not wired up", "Column mapping must match the shaped Items contract exactly, so a raw source list needs a projection step first", "Single-row selection only, no multi-select — matching the real canvas Data table control's own limit, not a gap unique to this component", "No built-in column sort or filter by heading; the host sorts/filters Items before it reaches the component"],
    variants: [
      ["Table", "Full-width rows with column headers — the default ViewMode, as shown in Preview."],
      ["Card", "One card per record with the same status/priority pills, for a narrower screen or a visual browse."],
      ["List", "A single-column compact list, the tightest of the three — best for a mobile-width panel."],
      ["Compact density", "Table view with tighter row height and smaller text, for a screen that needs to show many more rows at once."]
    ]
  },
  "governed-file-upload": {
    summary: "A staging-only file dropzone — nothing uploads, deletes, or persists until a flow handles the event it raises.",
    properties: [["Items", "Table", "Documents already on file", "Existing rows — Id, Name, SizeBytes, UploadedOn, UploadedBy, Ext"], ["MaxFileSize", "Number", "25", "Megabytes, enforced at staging time — matches the real canvas Attachments control's own MaxAttachmentSize, same unit"], ["MaxFiles", "Number", "5", "Cap on staged files; existing Items rows do not count against it"], ["AllowUpload", "Boolean", "true", "Governs both the dropzone's presence and the Upload / Cancel actions"], ["AllowDelete", "Boolean", "true", "Governs the delete icon on existing rows, independent of AllowUpload"], ["NoFilesText", "Text", "No files attached yet", "Empty-state message, shown when both Items and the staged list are empty"]],
    events: [["OnSave", "Fires when Upload is pressed; hands back the staged files for a flow to persist"], ["OnCancel", "Fires when Cancel is pressed, after the staged list is already cleared"], ["OnView", "Fires from the preview icon on an existing row"], ["OnDownload", "Fires from the download icon on an existing row"], ["OnDelete", "Fires from the bin icon on an existing row"], ["OnUndoRemove", "Fires when Undo is pressed right after removing a staged file — the real canvas Attachments control ships this exact event (OnUndoRemoveFile) and it's worth having here too, since \"I removed the wrong one\" is a real, common slip"]],
    architecture: ["The dropzone stages files locally; nothing is queried or written until an event fires", "Staged files are exposed only inside OnSave, in both a native-file shape and a base64 shape, matching whichever input a flow trigger expects", "The host's flow performs the actual write; a Reset only on the success path keeps the staged list intact after a failure", "Removing a staged file keeps it around briefly for OnUndoRemove instead of discarding it immediately — checked against the real Attachments control, which offers the identical undo window"],
    examples: ["SharePoint document library", "Case attachments", "Read-only document viewer"],
    accessibility: ["MaxFileSize/MaxFiles limits are stated as visible text near the dropzone, not only enforced silently at staging time", "AllowUpload/AllowDelete set to false disables the affordance and states why, rather than just hiding it", "Each existing row's preview/download/delete icons carry accessible names, not icon glyphs alone", "The dropzone's drag-over state is paired with a text cue (\"Drop to add\"), not a border-color change alone — the real Attachments control's DropTargetBorderColor/DropTargetTextColor pairing checked for the same reason"],
    limitations: ["The component never uploads, deletes or queries by itself — a flow triggered from OnSave / OnDelete does the real persistence", "File-type restriction is a hint only; enforcing it for real belongs in the flow"],
    variants: [
      ["Standard", "Dropzone plus a list of already-uploaded files with preview/download/delete icons — as shown in Preview."],
      ["Compact", "A single-line \"Add file\" affordance with no dropzone illustration, for a form with limited vertical space."],
      ["Read-only viewer", "AllowUpload and AllowDelete both false — Items renders as a plain file list with no staging affordance at all, for a record that's closed for edits."],
      ["Drag-active", "The dropzone's own mid-drag state — border and background shift to the DropTarget-style treatment while a file is dragged over it."]
    ]
  },
  "governed-email-composer": {
    summary: "A connector-free email composer that assembles a complete HTML message and hands it to whatever the host actually sends with.",
    properties: [["Directory", "Table", "Required", "People the To/CC pickers offer; needs DisplayName and Mail, JobTitle optional"], ["DefaultSubject", "Text", "Blank", "Prefills the subject; Config.LockSubject makes it read-only for a traceable reply"], ["ContextHtml", "Text", "Blank", "Trusted host markup rendered raw into a tinted box above the note"], ["Signature", "Text", "Blank", "Plain-text line appended to the body; escaped, unlike ContextHtml"], ["DefaultPriority", "Text", "Normal", "Low, Normal or High — matches the real Office 365 Outlook connector's own Importance values on Send an email (V2)"], ["Busy", "Boolean", "false", "Disables every control and shows a sending state while the host's send is in flight"]],
    events: [["OnSend", "Fires once every output is populated; hands back recipients, subject, body and priority"], ["OnCancel", "Fires when the dialog is dismissed without sending"]],
    architecture: ["The component builds a complete table-based HTML email body but owns no connector; the host chooses Outlook, a flow or SMTP", "Recipients are de-duplicated and cleaned before OnSend, and unlicensed accounts with a blank address are dropped automatically", "ContextHtml is the one raw slot; anything interpolated into it is the host's own markup to escape", "OnSend's output shape (To/Subject/Body/Attachments) is deliberately the same shape the Office 365 Outlook connector's own Send an email (V2) action expects, so wiring OnSend straight into that action needs no reshaping in the flow"],
    examples: ["Record summary email", "Review request", "Status-change notification"],
    accessibility: ["Busy disables every control and announces a sending state as text, not only a spinner", "To/CC picker results are announced by DisplayName, with Mail as a secondary detail, not the raw address alone", "ContextHtml renders inside a labeled, visually distinct box so it reads as quoted context, not the composer's own message"],
    limitations: ["The component does not send email itself, only assembles the message", "Any user-typed text placed inside ContextHtml must be escaped by the host, since that slot is rendered raw"],
    variants: [
      ["Standard", "Full composer — To/CC pickers, subject, a body note and Send/Cancel — as shown in Preview."],
      ["Reply", "ContextHtml populated with the quoted original message and DefaultSubject locked via Config.LockSubject, for a traceable reply thread."],
      ["Compact", "Just a To picker and a body note, subject and CC hidden, for a quick one-line message rather than a full email."],
      ["Sending", "Busy is true — every control disabled and a sending state shown, while the host's own Send an email (V2) call is in flight."]
    ]
  },
  "enterprise-sidebar": {
    summary: "A collapsible navigation rail with a built-in user footer and context menu, not just a bare list of links.",
    properties: [["Items", "Table", "Required", "Navigation items with parent/child hierarchy, badges and section labels"], ["SelectedKey", "Text", "Blank", "The current destination's key — settable by the host as well as read from OnItemSelect, matching Microsoft's own Creator Kit Nav control's SelectedKey"], ["IsExpanded", "Boolean", "true", "Toggles between a 260px expanded rail and a 64px collapsed rail"], ["Theme", "Text", "Light", "Light or Dark theme"], ["UserName", "Text", "Blank", "Name shown in the footer's initials avatar"]],
    events: [["OnItemSelect", "Returns the selected navigation item"], ["OnExpandToggle", "Returns the new IsExpanded state"]],
    architecture: ["A single tree gallery renders parent and child items with expand and collapse state", "IsExpanded drives both the rail width and whether labels are shown next to icons", "A context menu and a user footer with an initials avatar are built in, not assembled separately", "SelectedKey is two-way in practice: the host can set it directly (e.g. after a deep link lands on a screen) as well as read it back from OnItemSelect, the same pattern Microsoft's own published Creator Kit Nav control uses for its SelectedKey"],
    examples: ["Enterprise app shell", "Record hierarchy", "Mobile-collapsed navigation"],
    accessibility: ["OnExpandToggle lets the host announce the rail's new state, since a width change alone isn't perceivable to a screen reader", "Collapsed-rail icons keep their full item label as an accessible name even though it isn't shown visually", "The footer's initials avatar exposes UserName as its accessible name, not just visual initials"],
    limitations: ["Screen content must offset itself using the IsExpanded output; the rail does not push layout for you", "Icons are SVG strings, so an icon library or generator is the host's responsibility"],
    variants: [
      ["Expanded", "Full 260px rail with icon and label side by side — the default IsExpanded state, as shown in Preview."],
      ["Collapsed", "64px icon-only rail; each item's full label still carries through as its accessible name even though nothing is shown visually."],
      ["Dark theme", "Theme set to Dark — token-adjusted surfaces and borders, the same tokens the rest of this site's own dark mode uses."],
      ["Grouped sections", "Items rendered under section-label headers rather than one flat list, for an app shell with more destinations than fit comfortably ungrouped."]
    ]
  },
  "enterprise-mega-menu": {
    summary: "A top-level nav bar whose dropdown panels are content-only, so editing a panel's items never touches the bar itself.",
    properties: [["MenuItems", "Table", "Sample items", "Top-level nav buttons — ID, Label, HasDropdown, Link"], ["DropdownItems", "Table", "Sample items", "Dropdown content linked to a parent via MenuID, with an optional Section header and a Column (1 or 2)"], ["DropdownColumns", "Number", "2", "1 for a simple list, 2 for a mega-menu layout"], ["NavAlign", "Text", "Center", "Left, Center or Right"], ["ActiveColor", "Color", "Brand accent", "Highlight color for the open, linked or last-selected state"]],
    events: [["OnItemSelect", "Fires from any top-level button or dropdown item; returns the selected record for routing"]],
    architecture: ["MenuItems defines the bar; DropdownItems holds every panel's content, joined by MenuID, so content edits never touch the bar", "A transparent screen-level dismiss control, placed first in the tree, closes an open panel on any outside tap", "Under roughly 500px every dropdown collapses to a single scrollable column regardless of DropdownColumns"],
    examples: ["Marketing site header", "Product catalog navigation", "Documentation site nav"],
    accessibility: ["ActiveColor highlights the open/linked state, but every such item also carries a text or aria state — the color is reinforcement, not the only signal", "The screen-level dismiss control that closes an open panel is reachable by Escape as well as an outside tap", "Below the ~500px collapse, the single scrollable column keeps the same reading order as the two-column layout above it"],
    limitations: ["Screen routing stays host-owned; OnItemSelect only reports what was picked", "A small set of built-in icon names is recognized by keyword; anything else needs a raw SVG string or data URI"],
    // NavAlign and DropdownColumns are already real properties on this
    // component — variants below are just its own real states, not new
    // invented ones.
    variants: [
      ["Center-aligned", "Nav buttons centered — NavAlign's default, as shown in Preview."],
      ["Left-aligned", "Nav buttons pinned to the left edge (NavAlign: Left), for a logo-plus-nav header layout."],
      ["Simple dropdown", "DropdownColumns at 1 — a plain single-column list under a button, no Section headers, for a panel that's just links."],
      ["Mega panel", "DropdownColumns at 2 with Section headers — the full mega-menu layout, for a panel with several grouped link categories."]
    ]
  },
  "portfolio-command-card": {
    summary: "An executive-overview card — three headline metrics over a weekly activity chart — built from the same contract this site's own hero card actually uses.",
    properties: [["Eyebrow", "Text", "Portfolio command", "Small uppercase label above the title"], ["Title", "Text", "Executive overview", "Card heading"], ["Metrics", "Table", "Health 74% / Active 32 / At risk 06", "Exactly 3 tiles — Label, Value, Tone (Positive/Negative/Neutral)"], ["ChartData", "Table", "8-week sample", "Bar values for the activity strip beneath the tiles"], ["HighlightIndex", "Number", "-1", "Which chart bar draws in the accent color instead of the muted one; -1 highlights none"]],
    events: [["OnMetricSelect", "Returns the tapped metric tile"], ["OnChartSelect", "Returns the tapped bar's index and value"]],
    architecture: ["This is the same component contract this portfolio's own hero section renders — Metrics/ChartData here are the real Health/Active/At risk tiles and the 8-bar activity strip already live on the homepage, not a separate illustration of a similar idea", "Metrics is fixed at exactly 3 entries by design — a 3-up grid reads cleanly at a glance; a headline-metrics card with more than 3 numbers stops being skimmable and needs a different layout", "Tone (Positive/Negative/Neutral) resolves each tile's value color through the same brand/danger palette the rest of this catalog uses, never a hardcoded red/green pair"],
    examples: ["Executive overview", "Program health snapshot", "Weekly portfolio digest"],
    accessibility: ["Tone drives color only after the value and its Label already read correctly as plain text — nothing here is conveyed by color alone", "The activity strip's HighlightIndex bar is a visual accent only; its value is identical in kind to every other bar and reads the same to a screen reader", "OnChartSelect and OnMetricSelect both return enough context (index, value, label) that a host can build a fully keyboard-operable equivalent without guessing at what was tapped"],
    limitations: ["Exactly 3 metrics by design — a 4th is dropped rather than silently breaking the grid; use Program Scorecard for a longer list of RAG metrics instead", "The activity strip is a plain bar chart, not the full axis/gradient treatment ResponsiveLineChart has; swap to that component for a trend that needs its own axis"],
    variants: [
      ["Standard", "All 3 metric tiles plus the activity chart beneath them — the full card, as shown on this site's own hero and in Preview."],
      ["Metrics only", "Just the 3-tile grid, no chart — for a screen already showing its own trend visual elsewhere."],
      ["Chart only", "Just the activity strip, no metric tiles — for a compact trend-only placement."],
      ["Compact", "2 tiles side by side and no chart, for a narrower card that still needs to lead with a couple of headline numbers."]
    ]
  },
  "program-scorecard": {
    summary: "A grid of RAG-status metric cards against a target, the same red/amber/green scorecard pattern Power BI's own Metrics feature uses.",
    properties: [["Metrics", "Table", "6 sample KPIs", "Name, Value, Target, Tone (Red/Amber/Green)"], ["Period", "Text", "This quarter", "Reporting period shown under the heading"], ["ShowTrend", "Boolean", "false", "Draws a small sparkline under each metric using the same SVG technique ResponsiveLineChart uses"]],
    events: [["OnMetricSelect", "Returns the tapped metric, for drilling into its own detail page"]],
    architecture: ["Each metric card resolves its Red/Amber/Green tone the same way Power BI's own Metrics/Scorecards feature does — value compared against Target, not a hardcoded threshold baked into this component", "ShowTrend reuses buildLinePath, the same smoothed-SVG helper Executive KPI Card's own sparkline and ResponsiveLineChart share, rather than a separate small-chart implementation", "The grid reflows from a fixed column count down to a single column by width, so the same Metrics table works on a dashboard-width screen and a phone-width one"],
    examples: ["Quarterly OKR scorecard", "Program health dashboard", "Ministry KPI review"],
    accessibility: ["Tone is announced through a text status word (\"On target\", \"At risk\", \"Off track\") next to the color, never the color alone", "Value and Target are both always visible as text, so \"how far off\" is readable without comparing two colors by eye", "ShowTrend's sparkline is decorative; the same direction it shows is already stated by Tone's text status"],
    limitations: ["Tone is computed from Value vs. Target by the host before it reaches the component — the component itself has no notion of what a metric's Red/Amber/Green thresholds should be", "Best for a double-digit number of metrics; past roughly 20, Enterprise Data Table's own card view reads better"],
    variants: [
      ["Standard", "A grid of RAG cards, each with name/value/target — as shown in Preview."],
      ["Compact", "One row per metric instead of a card grid, for a longer list in limited vertical space."],
      ["Trend", "Standard, with ShowTrend on — every card gets its own small sparkline under the number."],
      ["Print", "A single column, larger type, no hover states — for a scorecard exported or printed as a static report page."]
    ]
  },
  "operational-status-banner": {
    summary: "A full-width status banner with four real severity states, the same Operational/Degraded/Outage/Maintenance vocabulary Azure's own status page uses.",
    properties: [["Status", "Text", "Operational", "Operational, Degraded, Outage or Maintenance — drives the banner's color and icon"], ["Message", "Text", "All systems operational", "The banner's own headline text"], ["LastUpdated", "DateTime", "Now()", "Shown as a relative time (\"Updated 4 minutes ago\")"], ["AffectedSystems", "Table", "Blank", "Named systems impacted; only rendered when Status is Degraded or Outage"], ["Dismissible", "Boolean", "true", "Whether the banner shows a close control at all"]],
    events: [["OnDetailsSelect", "Fires when the message or an affected-system chip is tapped, for routing to a full incident page"], ["OnDismiss", "Fires when the close control is used; the host owns whether the banner comes back on the next visit"]],
    architecture: ["Status is one of exactly four real states, matching Azure's own public status page vocabulary, not an open-ended free-text field a host could misspell or invent new colors for", "AffectedSystems only renders while Status is Degraded or Outage — an Operational or Maintenance banner never shows an empty, confusing systems list", "LastUpdated always renders as relative text (\"4 minutes ago\"), recomputed on every render rather than frozen at whatever time the banner first mounted"],
    examples: ["Platform status strip", "Scheduled maintenance notice", "Incident banner"],
    accessibility: ["Status's four states each carry a distinct icon and text label together, not color alone — a Degraded amber banner and an Outage red one never rely on color to tell them apart", "The banner is a live region, so Status changing from Operational to Outage while the page is already open is actually announced, not just repainted silently", "Dismissible's close control has a real accessible name (\"Dismiss status banner\"), not an icon-only affordance"],
    limitations: ["The component only displays a status someone else determined — it has no monitoring or health-check logic of its own", "Four states only; a system needing more granular sub-statuses needs to roll them up into one of these four before they reach the banner"],
    variants: [
      ["Operational", "The calm, minimal state — a thin green strip with the all-clear message, as shown in Preview."],
      ["Degraded", "Amber, with AffectedSystems listed — some capability is impaired but the platform is still usable."],
      ["Outage", "Red and the most prominent of the four — a real incident, front and center until resolved."],
      ["Maintenance", "Blue/informational, for a scheduled window stated in advance rather than an unplanned incident."]
    ]
  },
  "portfolio-risk-matrix": {
    summary: "A likelihood-by-impact risk heatmap — each cell's count and color come from the same Risks table, never a hardcoded grid.",
    properties: [["Risks", "Table", "9-cell sample", "Likelihood (1-3), Impact (1-3) and either a Count or a list of named risks per cell"], ["Size", "Number", "3", "3 for a 3x3 grid, 5 for a finer-grained 5x5"], ["ShowLabels", "Boolean", "true", "Draws Likelihood/Impact axis labels around the grid"], ["ShowNames", "Boolean", "false", "Cells show each risk's name instead of a plain count, once there's room for it"]],
    events: [["OnCellSelect", "Returns the tapped cell's Likelihood, Impact and its full list of risks"]],
    architecture: ["Cell color is computed from Likelihood x Impact against a standard traffic-light gradient (low-low is green, high-high is red), not a hand-authored color per cell", "Size toggles between a 3x3 and a 5x5 grid from the same Risks data shape — a 5x5 just expects Likelihood/Impact values up to 5 instead of 3", "A cell with zero matching risks still renders, empty, rather than collapsing the grid's geometry — the matrix's shape stays predictable regardless of how risks happen to cluster"],
    examples: ["Program risk register", "Vendor risk review", "Project intake screening"],
    accessibility: ["Each cell's color is reinforced by its own count or risk-name text — nothing here is conveyed by the red/amber/green gradient alone", "ShowLabels' axis labels give every cell an accessible position (\"High likelihood, Medium impact\") beyond just its grid coordinates", "OnCellSelect returns the full list of risks in a cell, so a host can build a genuinely keyboard-operable drill-through rather than requiring a mouse hover to see what's inside a cell"],
    limitations: ["A risk with a Likelihood or Impact outside 1-Size is dropped rather than breaking the grid; validate upstream", "ShowNames only reads cleanly with a small number of risks per cell — a cell with many risks needs the count view, not names, to stay legible"],
    variants: [
      ["3x3", "The compact, coarse-grained matrix — as shown in Preview."],
      ["5x5", "A finer-grained grid for a risk register mature enough to score likelihood and impact on a five-point scale."],
      ["Compact", "No axis labels, just the colored grid — for a small dashboard tile rather than a full risk-review screen."],
      ["Detailed", "ShowNames on — each cell lists its risks by name instead of a plain count, once there's room for it."]
    ]
  },
  "project-health-summary": {
    summary: "A four-dimension RAG rollup — Scope, Schedule, Budget, Quality — the standard shape a PM status report's own headline uses.",
    properties: [["Dimensions", "Table", "4 sample dimensions", "Scope/Schedule/Budget/Quality — each with a Tone (Red/Amber/Green) and a one-line Note"], ["OverallTone", "Text", "Amber", "The report's single headline tone — computed by the host from Dimensions, not derived inside the component"], ["AsOfDate", "DateTime", "Today()", "Shown as \"As of {date}\" under the heading"]],
    events: [["OnDimensionSelect", "Returns the tapped dimension, for drilling into what's actually driving its tone"]],
    architecture: ["OverallTone is a host-computed input, not something this component derives from Dimensions itself — different programs roll up a Red among four Greens differently (worst-of, weighted, or a PM's own judgment call), so baking one rule in would be wrong for some of them", "Each dimension's Note is required, not optional — a Red or Amber tone with no explanation is exactly the kind of status report a sponsor has to chase someone down to understand", "Fixed at exactly the four standard PM dimensions (Scope/Schedule/Budget/Quality) rather than an open-ended list, so this always reads as the same shape a status report reader already expects"],
    examples: ["Weekly status report header", "Steering committee dashboard", "Program health rollup"],
    accessibility: ["Every Tone renders next to its own text (\"Green\", \"Amber\", \"Red\") and its Note, never the color swatch alone", "OverallTone is announced as a sentence (\"Overall: Amber\") rather than only a colored bar at the top of the card", "AsOfDate is plain, readable text — never conveyed only through a subtle timestamp color or icon"],
    limitations: ["OverallTone must be computed and passed in; this component has no rollup logic of its own", "Fixed to the 4 standard dimensions — a program tracking a 5th (e.g. Resourcing) needs to fold it into one of the four or use Program Scorecard instead, which takes an open-ended metric list"],
    variants: [
      ["Standard", "All 4 dimensions in a grid, each with its Tone and Note — as shown in Preview."],
      ["Compact", "Dimensions collapse to a single row of colored pills, tone only, no Notes — for a header strip rather than a full card."],
      ["Trend", "Each dimension adds a direction arrow showing whether it moved better/worse/unchanged since the last report."],
      ["Narrative", "Standard, plus one free-text summary sentence beneath the grid, for the one line a sponsor actually reads first."]
    ]
  },
  "milestone-tracker": {
    summary: "A milestone timeline — horizontal strip or vertical rail — where each milestone's own real date decides whether it reads as on-track, at-risk or missed.",
    properties: [["Milestones", "Table", "6 sample milestones", "Name, DueDate, Status (Complete/OnTrack/AtRisk/Missed), CompletedDate"], ["Orientation", "Text", "horizontal", "horizontal or vertical"], ["ShowDates", "Boolean", "true", "Whether each milestone's due date renders as visible text, not only its relative position on the rail"]],
    events: [["OnMilestoneSelect", "Returns the tapped milestone in full"]],
    architecture: ["Status is a value on each Milestones row, not computed from DueDate inside the component — \"at risk\" is a judgment call (schedule buffer, dependencies) a component reading only a date can't make correctly on its own", "Horizontal and vertical orientations render from the exact same Milestones table — switching Orientation never requires reshaping the data, only the layout", "Completed milestones show CompletedDate instead of DueDate once it's set, so the rail reads as a record of what actually happened, not just what was planned"],
    examples: ["Project roadmap strip", "Contract delivery schedule", "Program gate reviews"],
    accessibility: ["Status renders as an icon plus a text word (\"Complete\", \"At risk\") on every milestone, never a bare colored dot", "ShowDates keeps each milestone's due or completed date as real visible text — position on the rail alone isn't a reliable way to read \"when\"", "Horizontal orientation's rail is still keyboard-navigable left to right, matching the same order a screen reader announces it in"],
    limitations: ["Status must be set by the host (or a flow) as milestones progress; the component has no notion of \"today\" driving Status on its own", "Horizontal orientation gets visually tight past roughly 8-10 milestones; Vertical or a paged view reads better beyond that"],
    variants: [
      ["Horizontal", "A left-to-right timeline strip, connector line between milestone markers — as shown in Preview."],
      ["Vertical", "The same milestones as a top-to-bottom rail, better for a narrow panel or a long list."],
      ["Compact", "Markers only, no labels — ShowDates off, for a small dashboard tile summarizing overall progress at a glance."],
      ["Upcoming only", "Filtered to just the next few not-yet-Complete milestones, for a \"what's next\" widget rather than the full history."]
    ]
  },
  "decision-log": {
    summary: "A running register of decisions — date, decision, owner, status — the artifact a governance review actually asks a PM to produce.",
    properties: [["Decisions", "Table", "5 sample entries", "Date, Decision, Owner, Status (Open/Decided/Superseded), Rationale"], ["SortOrder", "Text", "Newest first", "Newest first or Oldest first"], ["AllowAdd", "Boolean", "true", "Shows the \"Log a decision\" action; false renders a read-only register"]],
    events: [["OnDecisionSelect", "Returns the tapped decision, for viewing or editing its full Rationale"], ["OnAddDecision", "Fires from \"Log a decision\"; the host owns the actual create"]],
    architecture: ["Every entry keeps its Rationale alongside the decision itself — a register that only says *what* was decided without *why* stops being useful the moment someone asks 6 months later", "Superseded is its own Status, not a deletion — a decision that got reversed stays in the register with that status, so the log is a true history rather than only current state", "AllowAdd governs the affordance only; the actual write happens in the host's own OnAddDecision handler, the same staging-only pattern Governed File Upload and Governed Email Composer already use elsewhere in this catalog"],
    examples: ["Project governance log", "Architecture decision record", "Steering committee minutes"],
    accessibility: ["Status always renders as a text label on the entry, not a color-coded row alone", "SortOrder's current direction is stated in a visible control label (\"Newest first\"), not only implied by list order", "OnAddDecision's affordance carries a clear, specific accessible name (\"Log a decision\"), not a bare plus icon"],
    limitations: ["The component stages and displays; it performs no Patch or create itself, matching this catalog's usual staging pattern for anything that writes", "Best for a register in the low hundreds of entries; a much longer history needs paging or a per-project filter before it reaches the component"],
    variants: [
      ["Standard", "A full table — date, decision, owner, status — as shown in Preview."],
      ["Compact", "One line per decision, Rationale hidden until tapped, for a longer register in less vertical space."],
      ["Timeline", "Decisions as chronological cards down a rail, the same connected-rail language Activity Timeline uses elsewhere in this catalog."],
      ["Print", "A single dense column with no interactive affordances, for a register exported as a governance-review document."]
    ]
  },
  "enterprise-dialog": {
    summary: "A modal confirm/acknowledge dialog — checked against Power Apps' own real Confirm() function, and deliberately going one step past what it can do.",
    properties: [["Title", "Text", "Delete confirmation", "Dialog heading — matches Confirm()'s own Title option"], ["Subtitle", "Text", "Blank", "Optional secondary line between Title and Message — matches Confirm()'s own Subtitle option"], ["Message", "Text", "This action can't be undone.", "The dialog's body text"], ["ConfirmButtonText", "Text", "Confirm", "Matches canvas apps' own localized default for Confirm()'s confirm button"], ["ShowCancel", "Boolean", "true", "False renders a single acknowledge-only button — something the native Confirm() function can never do (its own FAQ states the Cancel button can't be hidden)"], ["CancelButtonText", "Text", "Cancel", "Ignored while ShowCancel is false"]],
    events: [["OnConfirm", "Fires when the confirm button is pressed"], ["OnCancel", "Fires when Cancel, Escape, or an outside tap dismisses the dialog — the same \"treated as no action\" behavior the native Confirm() function itself defines for a non-Cancel dismissal"]],
    architecture: ["Title/Subtitle/ConfirmButtonText/CancelButtonText are named to match Power Apps' own built-in Confirm() function's OptionsRecord exactly, so a maker already familiar with Confirm() reads this component's contract for free", "The one deliberate difference from Confirm(): ShowCancel can go false for a single-button acknowledge dialog, closing a real, documented gap in the native function — its own FAQ says plainly that Confirm() always shows both buttons and can't be reduced to one", "Rendered as a real modal component (not the Confirm() function itself), so a host that needs a third action, custom body content, or a non-boolean result can still use this same contract instead of hand-rolling a screen-level popup"],
    examples: ["Delete confirmation", "Unsaved-changes warning", "Single-button acknowledge notice"],
    accessibility: ["Focus moves into the dialog on open and is trapped there until it closes, matching standard modal dialog behavior rather than leaving focus stranded on whatever triggered it", "ShowCancel false still allows Escape to dismiss, firing OnCancel — an acknowledge-only dialog is not a focus trap with no way out", "Title is exposed as the dialog's own accessible name, so a screen reader announces what's being confirmed immediately on open, before the Message body"],
    limitations: ["Exactly two real actions (confirm/cancel) by design — a scenario needing three or more choices needs a different pattern, same limit the native Confirm() function itself has", "The component only ever returns a decision; it performs no action itself — Remove/Patch/Navigate all stay in the host's OnConfirm handler, same as Confirm() returning a plain boolean today"],
    variants: [
      ["Confirm", "Two buttons, Confirm and Cancel — the default, matching the native Confirm() function's own behavior, as shown in Preview."],
      ["Acknowledge-only", "ShowCancel false — a single button, for a notice the user must see and dismiss rather than a real either/or choice."],
      ["Destructive", "ConfirmButtonText styled in the danger color, for a delete or other action with real consequences."],
      ["Custom content", "Message replaced by arbitrary host-supplied content in the body slot, for a dialog that needs more than one line of text."]
    ]
  },
  "comments-mentions": {
    summary: "A threaded comment box with @mention autocomplete against a real people directory — assembled from a text input and a gallery, since no single Microsoft 365 surface shares one official comments control.",
    properties: [["Comments", "Table", "4 sample comments", "Author, Text, Timestamp, and any @Mentions already resolved to people"], ["Directory", "Table", "Required", "People the @mention picker offers — the same DisplayName/Mail shape Governed Email Composer's own Directory already uses"], ["CurrentUser", "Text", "Required", "Used to tell the visitor's own comments apart from everyone else's in the thread"], ["AllowAttachments", "Boolean", "false", "Shows a file-attach affordance on the compose box"]],
    events: [["OnPost", "Fires when a comment is submitted; hands back the text and any resolved @mentions"], ["OnMentionSelect", "Fires when a rendered @mention chip is tapped, for routing to that person's profile"], ["OnDelete", "Fires from a comment's own delete action; the host owns the actual removal"]],
    architecture: ["There is deliberately no claim here of matching \"the\" Fluent UI comments control, because no single one exists across Microsoft 365 — Teams chat, SharePoint page comments and Loop components each build their own; this component follows the same general shape all of them share (a multiline compose box plus a chronological gallery) rather than pointing at one official source that doesn't exist", "@mention matching happens locally against Directory as the visitor types \"@\", not a live people-search service call — Directory is a closed, host-provided list the same way it already is for Governed Email Composer", "Reuses that same Directory contract (DisplayName/Mail) deliberately, so a host already wiring people data into the email composer doesn't have to reshape it again for this component"],
    examples: ["Case discussion thread", "Document review comments", "Record activity comments"],
    accessibility: ["Each comment's Author and Timestamp are both real visible text, not implied by avatar position or grouping alone", "@mention chips render the person's full DisplayName as their accessible name, not a truncated \"@handle\"", "The compose box's Post action is disabled with a stated reason, not just grayed out, while the text is empty or CurrentUser can't be resolved"],
    limitations: ["No live typing indicators or real-time sync between visitors — Comments is a snapshot the host re-queries, not a live socket connection", "@mention suggestions are only as complete as Directory; someone missing from that table can be typed but never actually resolved to a person"],
    variants: [
      ["Thread", "The full chronological list plus the compose box at the bottom — as shown in Preview."],
      ["Compact", "A single \"Add a comment\" affordance and a count; tapping it expands into the full Thread view."],
      ["Read-only", "Comments render with no compose box at all, for a closed or archived record."],
      ["Resolved filter", "Adds a toggle hiding comments already marked resolved, for a long-running thread that's accumulated closed side-discussions."]
    ]
  },
  "responsive-breadcrumbs": {
    summary: "A collapsing breadcrumb trail — checked against both Microsoft's own published Creator Kit Breadcrumb control and Fluent UI's real overflow behavior.",
    properties: [["Items", "Table", "5-level sample", "Label and a routing Key per crumb, root first"], ["MaxDisplayedItems", "Number", "4", "Crumbs shown before the rest collapse into an overflow menu — same name and purpose as Fluent UI Breadcrumb's own maxDisplayedItems"], ["OverflowIndex", "Number", "1", "Where the collapsed \"…\" sits in the trail — matches Fluent UI Breadcrumb's own OverflowIndex, default just after the root"], ["TruncateAt", "Number", "30", "Characters before a single crumb's own label truncates with a tooltip showing the full name — matches Fluent UI's real default"]],
    events: [["OnItemSelect", "Returns the tapped crumb's Key, for routing"], ["OnOverflowSelect", "Returns the tapped item from the collapsed \"…\" menu"]],
    architecture: ["MaxDisplayedItems and OverflowIndex are named and behave the same as Fluent UI Breadcrumb's real properties, not an invented collapsing scheme — a maker who already knows that control reads this one for free", "A single crumb's own label truncates independently at TruncateAt characters, with the full label available as a tooltip — the trail collapsing (MaxDisplayedItems) and one label truncating (TruncateAt) are two separate, real behaviors in Fluent UI's own control, not one feature standing in for both", "The current (last) crumb renders as plain text, not a link — it's already the page the visitor is on, so making it tap-through-to-itself is not a real destination"],
    examples: ["Record hierarchy trail", "File/folder path", "Multi-step wizard location"],
    accessibility: ["The trail is a landmark nav region with an accessible name (\"Breadcrumb\"), not an unlabeled row of links", "A truncated crumb's full label is still available as its accessible name, not only inside a hover-only tooltip", "The overflow \"…\" control has a real accessible name (\"Show N more\"), not a bare ellipsis glyph with no label"],
    limitations: ["Routing on OnItemSelect/OnOverflowSelect stays entirely host-owned; the component only reports what was tapped", "A single crumb label longer than the trail's own available width still needs TruncateAt tuned down, since collapsing other crumbs (MaxDisplayedItems) doesn't shrink an individual label that's already too long"],
    variants: [
      ["Full trail", "Every level shown, no collapsing — for a shallow hierarchy that always fits, as shown in Preview."],
      ["Collapsed", "MaxDisplayedItems reached — middle levels collapse into a single \"…\" overflow menu."],
      ["Compact", "Chevron-separated labels only, smaller type, for a dense toolbar rather than a full-width header."],
      ["Single-level", "Just Home and the current page — for a two-level app where a full trail would be one crumb too many."]
    ]
  },
  "approval-journey": {
    summary: "A visual approval chain matching Power Automate's own real approval types — Sequential, or parallel with Everyone-must-approve / First-to-respond.",
    properties: [["Stages", "Table", "3 sample approvers", "Approver, Status (Pending/Approved/Rejected), RespondedOn"], ["ApprovalType", "Text", "Sequential", "Sequential, Everyone must approve, or First to respond — the same three real Power Automate approval behaviors"], ["Details", "Text", "Blank", "The request's own summary text, shown above the chain"]],
    events: [["OnApprove", "Fires with response \"Approve\" — matching Power Automate's own case-sensitive Approver response value exactly"], ["OnReject", "Fires with response \"Reject\", same case-sensitivity note"], ["OnStageSelect", "Returns the tapped stage's full detail"]],
    architecture: ["ApprovalType's three values and their meaning are checked directly against Power Automate's real \"Start and wait for an approval\" action: Sequential asks one approver at a time in order; Everyone must approve waits on every stage and rejects the whole chain on a single Reject; First to respond resolves the instant any one approver responds", "OnApprove/OnReject deliberately return the literal strings \"Approve\"/\"Reject\" — the same case-sensitive values Power Automate's own approval connector uses — so a flow already built around that connector's response shape doesn't need to remap this component's output", "Sequential rendering visually locks stages after the active one (grayed, unreachable) while Everyone/First-to-respond render every stage open and live at once — the layout itself communicates which real approval type is running, not just a text label naming it"],
    examples: ["Expense approval chain", "Document sign-off", "Change request approval"],
    accessibility: ["Status always renders as icon plus text word (\"Approved\", \"Pending\") next to each approver's name, never a color-coded dot alone", "Sequential's locked, not-yet-reached stages are announced as unavailable rather than just visually dimmed with no state conveyed to a screen reader", "Details, the request's own summary, always precedes the chain in reading order, so \"what am I approving\" is announced before \"who has to approve it\""],
    limitations: ["The component visualizes a chain; it triggers no real approval request — wiring OnApprove/OnReject into an actual Power Automate flow (or the same connector) is the host's job", "Custom Responses (the two other real Power Automate approval types, beyond simple Approve/Reject) aren't modeled here — Stages' Status is fixed to Pending/Approved/Rejected"],
    variants: [
      ["Sequential", "One approver at a time, later stages locked until their turn — as shown in Preview."],
      ["Everyone must approve", "All stages open and live at once; any single Reject ends the whole chain."],
      ["First to respond", "All stages open at once; the first response of either kind resolves the entire request."],
      ["Compact", "Condensed avatar-and-status pills in a single row, for a record header rather than a full approval screen."]
    ]
  },
  "guided-process-stepper": {
    summary: "A numbered step indicator for a multi-screen wizard — there's no single official Power Apps \"stepper\" control, so this follows the common wizard pattern instead.",
    properties: [["Steps", "Table", "5 sample steps", "Label and Status (Complete/Current/Upcoming) per step"], ["CurrentStep", "Number", "1", "1-based index of the active step"], ["AllowStepBack", "Boolean", "true", "Whether a completed step is tappable to return to it, or the wizard only ever moves forward"]],
    events: [["OnStepChange", "Fires when a step is tapped (only reachable ones, governed by AllowStepBack); the host owns the actual screen navigation"]],
    architecture: ["Power Apps has no single built-in \"stepper\"/wizard control the way it has a real Data table or Attachments control — this component follows the pattern most Power Apps wizards already use in practice: one screen per step, with this indicator reused across all of them showing the same Steps table and a different CurrentStep", "AllowStepBack false locks every step except CurrentStep as unreachable — a linear intake wizard that shouldn't let someone silently skip ahead or wander back mid-submission", "The component only ever reports which step was tapped; it holds no screen-navigation logic of its own, since that's inherently specific to how each app's screens are actually organized"],
    examples: ["Multi-step intake form", "Onboarding wizard", "Guided setup flow"],
    accessibility: ["Each step's Status is announced as text (\"Step 2 of 5, current\"), not conveyed only by a filled vs. outlined dot", "AllowStepBack false still explains why an earlier step can't be tapped, rather than silently doing nothing on tap", "The active step's label carries a visible, non-color-only indicator (bold weight, not just an accent color) so it reads correctly for low-vision and color-blind users alike"],
    limitations: ["No built-in screen transition or validation — Steps' own Status must be kept in sync with real form progress by the host", "Best for a single, linear flow; a wizard with real branching (different steps depending on an earlier answer) needs host logic beyond what this component tracks"],
    variants: [
      ["Horizontal", "Steps in a left-to-right row with a connecting line — as shown in Preview."],
      ["Vertical", "The same steps stacked top to bottom, for a narrow panel alongside the active step's own form."],
      ["Numbered", "Each dot shows its step number instead of a plain filled/outline circle."],
      ["Linear-locked", "AllowStepBack off — completed steps are visually marked done but not tappable, for a submission that can't be revisited once past."]
    ]
  },
  "workflow-route-map": {
    summary: "A simplified branching route diagram — inspired by Power Automate's own flow-designer canvas, deliberately scaled back from a full graph editor to a read-only route view.",
    properties: [["Nodes", "Table", "6 sample nodes", "Label, Status (Complete/Active/Pending/Blocked), and Order along the route"], ["Connections", "Table", "Linear + one branch", "From/To node pairs; a node with two outgoing Connections renders as a branch point"], ["Orientation", "Text", "horizontal", "horizontal or vertical"]],
    events: [["OnNodeSelect", "Returns the tapped node's full detail"]],
    architecture: ["Deliberately not a general graph editor the way Power Automate's own flow-designer canvas is — Nodes/Connections describe a route through a process, read-only, not an authoring surface for building new workflow logic", "A branch point (a node with more than one outgoing Connection) renders both paths visibly diverging, so a workflow with a real conditional split reads as one at a glance rather than looking identical to a strictly linear one", "Connections is a separate table from Nodes specifically so the same node set can be re-wired into a different route shape without renaming or restructuring the nodes themselves"],
    examples: ["Intake-to-resolution process map", "Release pipeline stages", "Case routing overview"],
    accessibility: ["Connections between nodes are decorative; reading order follows Nodes' own Order field, not visual position on the diagram", "Status renders as icon plus text on every node, so a Blocked node reads as blocked in text even where the diagram's own color coding can't be perceived", "A branch point states in text which condition sent the route down each path, not only an unlabeled fork in the diagram"],
    limitations: ["Read-only — it visualizes a route, it doesn't execute or evaluate the conditions that actually drove a branch", "Best for a route in the low tens of nodes; a genuinely large or deeply branching process needs a real diagramming surface, not this component"],
    variants: [
      ["Linear", "A straight left-to-right (or top-to-bottom) sequence with no branch points — as shown in Preview."],
      ["Branching", "One or more nodes split into two diverging paths, for a process with a real conditional route."],
      ["Compact", "Smaller nodes and no connector labels, for an overview tile rather than a full process map."],
      ["Swimlane", "Nodes grouped into horizontal bands by owner or team, for a route that hands off between different groups."]
    ]
  },
  "branded-loading-experience": {
    summary: "A branded loading state — logo, message and real progress — for the gap between opening an app and its first screen actually being ready.",
    properties: [["Title", "Text", "Loading your workspace", "Primary loading message"], ["Progress", "Number", "0", "0-100; drives both the progress bar and the announced percentage"], ["LogoUrl", "Text", "Blank", "Optional brand mark shown above the message; falls back to a plain spinner when blank"], ["CanCancel", "Boolean", "false", "Shows a cancel action for a load that's allowed to be interrupted"]],
    events: [["OnCancel", "Signals a cancellation request; the host owns actually aborting whatever is loading"]],
    architecture: ["Progress is a real, host-supplied number, not a decorative animation guessing at how long something takes — a data-heavy screen that actually knows how far along its own load is should say so", "LogoUrl blank falls back to a plain spinner rather than an empty space where a logo was expected, so a host that hasn't wired branding in yet still gets a complete, correct-looking loading state", "CanCancel governs a real event, not just a visual affordance — a load a host can't actually interrupt shouldn't offer a button that implies it can"],
    examples: ["App startup splash", "Large report generation", "Data refresh overlay"],
    accessibility: ["Progress changes are announced through a live region as the percentage updates, not only a visually moving bar", "The loading state as a whole is announced once on appearing (\"Loading, please wait\"), not silently left for a screen reader to discover on its own", "CanCancel's action has a real accessible name (\"Cancel loading\"), reachable by keyboard, not a bare icon"],
    limitations: ["The component only displays progress; it has no way to know how long an operation will actually take beyond what Progress reports", "A LogoUrl pointing at a slow or failed image load can itself become a visible delay — a data URI or a pre-cached asset avoids that"],
    variants: [
      ["Spinner", "An indeterminate spinner with just the Title message, for a load with no meaningful progress to report."],
      ["Progress bar", "A real percentage bar driven by Progress — as shown in Preview."],
      ["Branded splash", "LogoUrl front and center, full-screen, for the very first thing a visitor sees when the app opens."],
      ["Skeleton", "Content-shaped gray placeholder blocks instead of a spinner or bar, for a screen that's about to fill in with real content in roughly the same layout."]
    ]
  }
};

// The catalog's default view (no search, no category filter) shows only
// these, in this order, rather than all 25 at once — a hiring-manager
// skim shouldn't have to work through the full catalog to see the range
// on offer. Picked for category breadth and documentation depth (mostly
// "Verified" entries, which carry the richest overrides above), plus one
// deliberate callback: Portfolio Command Card is the same component the
// hero's own "Executive overview" card is built from. Filtering by
// search or category still searches/shows the complete 25 — this only
// narrows the unfiltered "All" view.
const FEATURED_IDS = [
  "portfolio-command-card",
  "executive-kpi-card",
  "enterprise-data-table",
  "governed-file-upload",
  "enterprise-calendar",
  "enterprise-mega-menu"
];

const components = raw.map(([title, category, maturity], i) => {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const base = baseByCategory[category];
  const spec = overrides[id] || {};
  return {
    id,
    title,
    category,
    maturity,
    color: ["#168326", "#0F6CBD", "#5B5BD6", "#C239B3", "#D83B01"][i % 5],
    // Every override with real property/event/architecture detail gets
    // its own one-line summary now too — without spec.summary here,
    // even a component with a fully bespoke contract still showed this
    // same generic sentence, identical to every other component in its
    // category, on its card and Preview tab.
    summary: spec.summary || `A reusable ${category.toLowerCase()} pattern designed for responsive, governed enterprise Power Platform experiences.`,
    properties: spec.properties || base.properties,
    events: spec.events || base.events,
    architecture: spec.architecture || base.architecture,
    examples: spec.examples || base.examples,
    accessibility: spec.accessibility || base.accessibility,
    limitations: spec.limitations || base.limitations,
    variants: spec.variants || GENERIC_VARIANTS,
    yamlStatus: maturity === "Verified"
      ? "Property and event contract cross-checked against a published reference component; this project's own YAML source is drafted but not yet Studio-tested"
      : "Design specification only; executable YAML not yet built or verified"
  };
});

export { categories, icons, components, FEATURED_IDS };
