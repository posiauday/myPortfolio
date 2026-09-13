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

// Component-specific overrides. The nine entries below are aligned to the
// real, published property/event contracts of their closest counterparts
// in the Power Apps UI component library (uploaded as reference docs),
// restated in this project's own words and its own naming — not copied
// verbatim, since that library's YAML and prose are its own.
const overrides = {
  "executive-kpi-card": {
    properties: [["Label", "Text", "Active projects", "Metric name"], ["Value", "Text", "156", "Formatted measure"], ["Trend", "Number", "12.4", "Change from comparison period"], ["Target", "Number", "150", "Target value"], ["Status", "Text", "On track", "Accessible status"], ["TooltipText", "Text", "Blank", "Calculation guidance"]],
    events: [["OnSelect", "Opens supporting detail"]],
    architecture: ["Host provides governed DAX measure", "Card formats value, trend and status", "OnSelect routes to a drill-through page"],
    examples: ["Active projects", "At-risk projects", "Submitted this month"],
    limitations: ["Formatting must match the measure", "Tooltip definitions must be maintained with KPI logic"]
  },
  "responsive-line-chart": {
    properties: [["ChartData", "Table", "12-month sample", "x (ordinal), y (value), label (axis text); auto-sorted by x"], ["LineColor", "Text", "#168326", "Hex color for the line and its area-fill gradient"], ["Smooth", "Boolean", "true", "Cubic-curve line versus straight segments"], ["ShowPointLabels", "Boolean", "false", "Formatted value shown above each point"], ["Animate", "Boolean", "true", "Staggered draw-in animation on load"]],
    events: [],
    architecture: ["The whole chart is one Image control rendering an inline SVG, so it carries no charting-library dependency", "The Y-axis always starts at zero and auto-scales to a rounded ceiling with headroom rather than fitting tightly to the data", "A built-in gradient fades from LineColor to transparent, so the fill always matches whatever accent color is passed in"],
    examples: ["Executive KPI strip", "Portfolio trend panel", "Operational scorecard"],
    limitations: ["Single series only; a multi-series comparison needs a different chart", "No interactive tooltips, since inline SVG inside an Image control cannot respond to hover"]
  },
  "deadline-intelligence": {
    properties: [["StartDate", "DateTime", "Today()", "The date the clock runs from; that day itself is never counted"], ["Days", "Number", "30", "Allowed duration, capped at 400 internally"], ["CompletedDate", "DateTime", "Blank", "Set once resolved; stops the countdown"], ["Holidays", "Table", "US federal default", "Observed HolidayName / HolidayDate pairs; override with your own"], ["Config", "Record", "Business days", "Count mode, working-week days, due-soon threshold and compact layout"]],
    events: [["OnSelect", "Returns the card selection"]],
    architecture: ["Weekends and observed holidays are excluded before a due date is picked, since an office closed on an observed Friday is still closed", "A bounded window of candidate dates is generated and searched rather than solved analytically, so an arbitrary working week can be priced in", "Every output derives from the inputs with no stored state, so the card is correct the instant it is placed"],
    examples: ["SLA deadline", "Contract response clock", "Compact gallery deadline"],
    accessibility: ["Status uses a dot and a label, not color alone", "The breakdown sentence explains the calculation in words", "The countdown states which unit it is counting"],
    limitations: ["Day-based, not hour-based", "Store the computed due date and reuse it rather than recalculating on every read, or a later holiday-table correction can quietly move a date someone was already given"]
  },
  "activity-timeline": {
    properties: [["Items", "Table", "Sample entries", "Event title, description, author, timestamp and category; each card sizes itself to its content"], ["FilterOptions", "Table", "Six categories", "Values shown in the filter dropdown; must match Items' category values"], ["IconMap", "Table", "Default mapping", "Maps each category to an icon and a rail dot color"], ["IsLoading", "Boolean", "false", "Swaps in skeleton placeholder cards instead of data"], ["CardHeight", "Number", "104", "Minimum card height; cards grow past it to fit their content"]],
    events: [["OnItemSelect", "Returns the tapped record in full"], ["OnExport", "Fires from the toolbar's export action"], ["OnPrint", "Fires from the toolbar's print action"]],
    architecture: ["A single variable-height gallery draws a rail line connecting category-colored dots to each card", "Entries flagged with a sub-detail render an extra HTML block below the card, for something like an email preview", "Category, icon and dot color are all data-driven through IconMap, never hardcoded per entry"],
    examples: ["Case audit history", "Approval tracking", "CRM activity"],
    limitations: ["A very long sub-detail message grows its card and can slow gallery scrolling; cap it at the source", "Filtering shows one active category at a time, driven by FilterOptions"]
  },
  "enterprise-calendar": {
    properties: [["Events", "Table", "Required", "Flat occurrences, one row per day an event appears on; a multi-day event is several rows"], ["Channels", "Table", "Required", "Category key, title and color used to tint each chip"], ["FocusDate", "DateTime", "Today()", "Which month or week opens first"], ["View", "Text", "month", "month, week or agenda"], ["Config", "Record", "Default", "Row height, chip slots, first day of week, work hours and holiday tinting"]],
    events: [["OnRangeChange", "Fires whenever the visible window moves; returns the exact start and end drawn"], ["OnViewChange", "Fires when the toolbar switches views"], ["OnSelectDay", "Fires when a day cell or its overflow link is tapped"], ["OnSelectEvent", "Fires when a chip is tapped"]],
    architecture: ["The component reports the date window it is about to draw, so the host loads only that bounded window rather than a whole list", "Month, week and agenda each render from one flat gallery per view, never nested, so no inner control ever reads a frozen ThisItem", "Recurrence must already be materialized into individual occurrence rows before it reaches the component; it does not expand a rule itself"],
    examples: ["Reporting calendar", "Inspection schedule", "Leave and coverage"],
    limitations: ["No drag-to-reschedule; a chip tap is read-only navigation", "A repeating series must already exist as one row per occurrence"]
  },
  "accordion-record-list": {
    properties: [["Groups", "Table", "Sample orders", "Parent rows; GroupKey must never be zero, since zero is the internal collapsed-state sentinel"], ["Items", "Table", "Sample lines", "Child rows linked to a parent by GroupKey"], ["Config", "Record", "Light, all switches on", "Every key is Coalesced, so a partial record is safe"], ["Title", "Text", "\"Orders\"", "Heading shown above the list"]],
    events: [["OnSelectGroup", "Fires after the tapped group's expanded state has already changed"], ["OnSelectItem", "Fires when a child row is tapped"], ["OnMoveUp", "Returns the row's key and whether it was a group or an item"], ["OnMoveDown", "Returns the row's key and whether it was a group or an item"], ["OnEdit", "Opens the host's own editor for a group or item"], ["OnDelete", "Requests the host's own confirmation and removal"]],
    architecture: ["One flat gallery renders both parent and child rows, avoiding nested-gallery height constraints entirely", "Tag and Tone are separate — Tag is the label text, Tone is the color — so the same control renders order states, approval states or task states with no extra configuration", "Every action raises an event and stops; the component owns no data and performs no Patch itself"],
    examples: ["Project phases and tasks", "Orders and lines", "Checklist sections"],
    limitations: ["GroupKey can never be zero, since zero is reserved to mean nothing expanded", "Comfortable into the low hundreds of groups; past that, paging beats an ever-taller accordion"]
  },
  "enterprise-data-table": {
    properties: [["Items", "Table", "Sample records", "Rows to display; progress columns need CompletedSteps and TotalSteps"], ["ViewMode", "Text", "table", "Initial view: table, card or list"], ["ContextMenuItems", "Table", "View / Edit / Delete", "Row action menu items — key, label, enabled, visible"], ["StatusConfig", "Table", "Default", "Status-to-color lookup, case-insensitive, with a default fallback row"], ["PriorityConfig", "Table", "Default", "Priority-to-color lookup, same pattern as StatusConfig"]],
    events: [["OnRowSelect", "Fires when a row, card or list item is tapped"], ["OnMenuItemSelect", "Fires when a row action is chosen; returns the item and the action key"], ["OnViewChange", "Fires when the visitor switches between table, card and list views"]],
    architecture: ["Table, card and list views share one Items contract and one set of context menus", "Status and priority colors resolve through a lookup table with a default row, never a hardcoded switch", "Segmented progress bars render from CompletedSteps / TotalSteps fields already present on each row"],
    examples: ["Project register", "Case browser", "Responsive mobile list"],
    limitations: ["The native row-action menu renders text labels only; custom per-item icons and colors are reserved but not wired up", "Column mapping must match the shaped Items contract exactly, so a raw source list needs a projection step first"]
  },
  "governed-file-upload": {
    properties: [["Items", "Table", "Documents already on file", "Existing rows — Id, Name, SizeBytes, UploadedOn, UploadedBy, Ext"], ["MaxFileSize", "Number", "25", "Megabytes, enforced at staging time, not just shown as a hint"], ["MaxFiles", "Number", "5", "Cap on staged files; existing Items rows do not count against it"], ["AllowUpload", "Boolean", "true", "Governs both the dropzone's presence and the Upload / Cancel actions"], ["AllowDelete", "Boolean", "true", "Governs the delete icon on existing rows, independent of AllowUpload"]],
    events: [["OnSave", "Fires when Upload is pressed; hands back the staged files for a flow to persist"], ["OnCancel", "Fires when Cancel is pressed, after the staged list is already cleared"], ["OnView", "Fires from the preview icon on an existing row"], ["OnDownload", "Fires from the download icon on an existing row"], ["OnDelete", "Fires from the bin icon on an existing row"]],
    architecture: ["The dropzone stages files locally; nothing is queried or written until an event fires", "Staged files are exposed only inside OnSave, in both a native-file shape and a base64 shape, matching whichever input a flow trigger expects", "The host's flow performs the actual write; a Reset only on the success path keeps the staged list intact after a failure"],
    examples: ["SharePoint document library", "Case attachments", "Read-only document viewer"],
    limitations: ["The component never uploads, deletes or queries by itself — a flow triggered from OnSave / OnDelete does the real persistence", "File-type restriction is a hint only; enforcing it for real belongs in the flow"]
  },
  "governed-email-composer": {
    properties: [["Directory", "Table", "Required", "People the To/CC pickers offer; needs DisplayName and Mail, JobTitle optional"], ["DefaultSubject", "Text", "Blank", "Prefills the subject; Config.LockSubject makes it read-only for a traceable reply"], ["ContextHtml", "Text", "Blank", "Trusted host markup rendered raw into a tinted box above the note"], ["Signature", "Text", "Blank", "Plain-text line appended to the body; escaped, unlike ContextHtml"], ["Busy", "Boolean", "false", "Disables every control and shows a sending state while the host's send is in flight"]],
    events: [["OnSend", "Fires once every output is populated; hands back recipients, subject, body and priority"], ["OnCancel", "Fires when the dialog is dismissed without sending"]],
    architecture: ["The component builds a complete table-based HTML email body but owns no connector; the host chooses Outlook, a flow or SMTP", "Recipients are de-duplicated and cleaned before OnSend, and unlicensed accounts with a blank address are dropped automatically", "ContextHtml is the one raw slot; anything interpolated into it is the host's own markup to escape"],
    examples: ["Record summary email", "Review request", "Status-change notification"],
    limitations: ["The component does not send email itself, only assembles the message", "Any user-typed text placed inside ContextHtml must be escaped by the host, since that slot is rendered raw"]
  },
  "enterprise-sidebar": {
    properties: [["Items", "Table", "Required", "Navigation items with parent/child hierarchy, badges and section labels"], ["IsExpanded", "Boolean", "true", "Toggles between a 260px expanded rail and a 64px collapsed rail"], ["Theme", "Text", "Light", "Light or Dark theme"], ["UserName", "Text", "Blank", "Name shown in the footer's initials avatar"]],
    events: [["OnItemSelect", "Returns the selected navigation item"], ["OnExpandToggle", "Returns the new IsExpanded state"]],
    architecture: ["A single tree gallery renders parent and child items with expand and collapse state", "IsExpanded drives both the rail width and whether labels are shown next to icons", "A context menu and a user footer with an initials avatar are built in, not assembled separately"],
    examples: ["Enterprise app shell", "Record hierarchy", "Mobile-collapsed navigation"],
    limitations: ["Screen content must offset itself using the IsExpanded output; the rail does not push layout for you", "Icons are SVG strings, so an icon library or generator is the host's responsibility"]
  },
  "enterprise-mega-menu": {
    properties: [["MenuItems", "Table", "Sample items", "Top-level nav buttons — ID, Label, HasDropdown, Link"], ["DropdownItems", "Table", "Sample items", "Dropdown content linked to a parent via MenuID, with an optional Section header and a Column (1 or 2)"], ["DropdownColumns", "Number", "2", "1 for a simple list, 2 for a mega-menu layout"], ["NavAlign", "Text", "Center", "Left, Center or Right"], ["ActiveColor", "Color", "Brand accent", "Highlight color for the open, linked or last-selected state"]],
    events: [["OnItemSelect", "Fires from any top-level button or dropdown item; returns the selected record for routing"]],
    architecture: ["MenuItems defines the bar; DropdownItems holds every panel's content, joined by MenuID, so content edits never touch the bar", "A transparent screen-level dismiss control, placed first in the tree, closes an open panel on any outside tap", "Under roughly 500px every dropdown collapses to a single scrollable column regardless of DropdownColumns"],
    examples: ["Enterprise app shell", "Mobile navigation", "Record hierarchy"],
    limitations: ["Screen routing stays host-owned; OnItemSelect only reports what was picked", "A small set of built-in icon names is recognized by keyword; anything else needs a raw SVG string or data URI"]
  }
};

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
    summary: `A reusable ${category.toLowerCase()} pattern designed for responsive, governed enterprise Power Platform experiences.`,
    properties: spec.properties || base.properties,
    events: spec.events || base.events,
    architecture: spec.architecture || base.architecture,
    examples: spec.examples || base.examples,
    accessibility: spec.accessibility || base.accessibility,
    limitations: spec.limitations || base.limitations,
    variants: ["Standard", "Compact", "Dark", "Mobile"],
    yamlStatus: maturity === "Verified"
      ? "Property and event contract cross-checked against a published reference component; this project's own YAML source is drafted but not yet Studio-tested"
      : "Design specification only; executable YAML not yet built or verified"
  };
});

export { categories, icons, components };
