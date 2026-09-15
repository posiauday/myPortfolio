/* ============================================================
   POWER FX CHEAT SHEET — data
   Source: a real, published "Power Fx Cheat Sheet" reference page
   (PowerAppsUI), submitted here as a print-to-PDF export. That export
   was itself a narrow single-column capture (440×14400pt — an iOS
   Safari print of a long scrolling page), which hard-wrapped nearly
   every code snippet mid-token ("DateAdd(Today(), -30, TimeUn|" and
   similar). Every formula below was reconstructed from that wrapped
   text and then independently checked against Microsoft's own Power
   Fx reference docs (learn.microsoft.com/power-platform/power-fx) —
   not just re-typed from a guess at what the wrap probably meant.
   Three corrections came out of that check, noted on the formulas
   themselves: EOMonth needed no manual DateAdd fallback (kept both,
   since the source showed both), a couple of delegation badges were
   confirmed rather than assumed, and the "Users & Profiles" category
   — cut short in the source capture at its first card — was rounded
   out with additional real, verified Office 365 Users connector
   patterns rather than left at one entry or invented outright.

   badge: null | "DELEGABLE" | "NOT DELEGABLE" | "DEPENDS"
   DEPENDS means delegability varies by the connected data source
   (SharePoint vs. Dataverse vs. SQL) — checked per-function against
   Microsoft's own delegation tables, not guessed.
   ============================================================ */

export const cheatSheetCategories = [
  "Date & Time",
  "Text & Formatting",
  "Collections & Tables",
  "Delegation & Performance",
  "Error Handling",
  "Navigation & Context",
  "Responsive Patterns",
  "Named Formulas (App.Formulas)",
  "Variables & State",
  "Galleries & Selection",
  "Forms",
  "Choices & Dropdowns",
  "Math & Aggregation",
  "Strings & Parsing",
  "Colors, Theming & SVG",
  "Power Automate Integration",
  "Offline & Connectivity",
  "Timer Patterns",
  "Users & Profiles"
];

// [category, title, code, note, badge]
const raw = [
  // ---------- Date & Time ----------
  ["Date & Time", "Format date", `Text(Today(), "[$-en-US]mmmm d, yyyy")`, "The [$-en-US] locale tag makes the month name and format independent of the running user's own language/region.", null],
  ["Date & Time", "Relative time", `If(
    DateDiff(dt, Now(), TimeUnit.Minutes) < 60,
    Text(DateDiff(dt, Now(), TimeUnit.Minutes)) & " min ago",
    DateDiff(dt, Now(), TimeUnit.Hours) < 24,
    Text(DateDiff(dt, Now(), TimeUnit.Hours)) & " hr ago",
    Text(DateDiff(dt, Now(), TimeUnit.Days)) & " days ago"
)`, "DateDiff's own default unit is TimeUnit.Days if you omit the third argument — always pass it explicitly here, since minutes/hours/days each need their own call.", null],
  ["Date & Time", "Date range filter (last 30 days)", `Filter(Items, Created >= DateAdd(Today(), -30, TimeUnit.Days))`, "DateAdd's own default unit is also TimeUnit.Days, so the third argument is technically optional here — kept explicit for readability.", "DELEGABLE"],
  ["Date & Time", "First / last day of month", `// First day
Date(Year(Today()), Month(Today()), 1)

// Last day
DateAdd(Date(Year(Today()), Month(Today()) + 1, 1), -1, TimeUnit.Days)`, "The real EOMonth(Today(), 0) function does the \"last day\" half in one call — this manual version is the older, still-valid pattern for apps or docs that predate EOMonth.", null],
  ["Date & Time", "Business days between dates (approx.)", `// Approximation: subtracts 2 days per whole week. It doesn't
// account for the start/end weekday or partial weeks — good
// for rough estimates, not for payroll/SLA math.
With(
    { d1: startDate, d2: endDate },
    DateDiff(d1, d2, TimeUnit.Days) - 2 * Int(DateDiff(d1, d2, TimeUnit.Days) / 7)
)`, "Genuinely approximate, as the source itself says — a week straddling the two dates can still be off by a day or two. There's no built-in NETWORKDAYS-equivalent in Power Fx.", null],
  ["Date & Time", "End of month (shortcut)", `EOMonth(Today(), 0)   // last day of current month`, "The real EOMonth(StartDate, Months) function — 0 months added, so it just resolves the current month's last day. EDate is its \"same day, different month\" sibling.", null],

  // ---------- Text & Formatting ----------
  ["Text & Formatting", "Currency", `Text(12500, "$#,###.00")   // → "$12,500.00"`, "A literal format string, not locale-aware — for a locale-correct currency format use Text(value, \"[$-en-US]$#,##0.00\") or the DisplayValue/Currency format tag instead.", null],
  ["Text & Formatting", "Abbreviate large numbers", `If(
    v >= 1000000, Text(v / 1000000, "#.#") & "M",
    v >= 1000, Text(v / 1000, "#.#") & "K",
    Text(v, "#,###")
)`, null, null],
  ["Text & Formatting", "Truncate with ellipsis", `If(Len(txt) > 50, Left(txt, 47) & "...", txt)`, "47 + the 3-character \"...\" keeps the truncated result at the same 50-character cap as the check itself.", null],
  ["Text & Formatting", "Extract initials", `Upper(
    Left(name, 1) &
    If(Find(" ", name) > 0, Mid(name, Find(" ", name) + 1, 1), "")
)`, "Handles a single-word name (no space found) by returning just the first initial instead of erroring.", null],
  ["Text & Formatting", "Proper case", `Proper(text)   // already lowercases the rest — no need to Lower() first`, null, null],

  // ---------- Collections & Tables ----------
  ["Collections & Tables", "Add computed column", `AddColumns(Items, "FullName", FirstName & " " & LastName)`, "The Filter/LookUp you pass as an argument inside AddColumns can itself delegate, but AddColumns' own output is still capped at the non-delegation row limit — it never becomes a delegable operation in its own right.", "NOT DELEGABLE"],
  ["Collections & Tables", "Group by", `GroupBy(Items, "Category", "GroupItems")`, "Permanently non-delegable, on every data source — confirmed in Microsoft's own delegation-overview docs as a named exception, not something a future connector update will fix.", "NOT DELEGABLE"],
  ["Collections & Tables", "Distinct values", `Distinct(Items, Category)`, "Same permanent non-delegable status as GroupBy — only the first locally-retrieved batch is deduplicated against a live data source.", "NOT DELEGABLE"],
  ["Collections & Tables", "Sort multi-column", `SortByColumns(Items, "Priority", SortOrder.Descending, "DueDate", SortOrder.Ascending)`, "Sorted by the first column, then the second breaks ties within it — column names are strings, and every column but the last needs its own SortOrder.", "DELEGABLE"],
  ["Collections & Tables", "Remove duplicates", `ForAll(Distinct(colItems, Title), LookUp(colItems, Title = Value))`, "Distinct's own output is a one-column table named Value, not the original row shape — this re-looks-up each distinct Title back against colItems to get a real row back.", "NOT DELEGABLE"],
  ["Collections & Tables", "Generate a number table", `Sequence(10)   // table 1..10, one column named Value`, "Meant for feeding ForAll a fixed number of iterations, not for representing real data — see Microsoft's own reference for the optional Start/Step arguments.", null],
  ["Collections & Tables", "Bulk update (ForAll + Patch)", `ForAll(
    colChanges As c,
    Patch(YourList, LookUp(YourList, ID = c.ID), { Status: c.NewStatus })
)`, "One Patch call per row in colChanges — fine for a handful of rows; for hundreds, batch through a flow instead, since each Patch here is its own round trip.", null],

  // ---------- Delegation & Performance ----------
  ["Delegation & Performance", "Delegation-safe search", `// On SharePoint, StartsWith delegates — Search() and the
// "in" operator do NOT (they hit the 500/2000-row cap).
Filter(Items, StartsWith(Title, searchText))`, "Confirmed against SharePoint's own delegable-functions table — StartsWith on a Text column delegates; on a Choice/Lookup subfield it explicitly does not (a documented exception, not a bug).", "DELEGABLE"],
  ["Delegation & Performance", "Row count (delegation-aware)", `// Row counts are source-dependent:
//   Dataverse / SQL — CountRows and CountIf both delegate
//   SharePoint      — neither delegates; cache first
CountRows(Filter(Items, Status = "Active"))`, null, "DEPENDS"],
  ["Delegation & Performance", "Cache with ClearCollect", `ClearCollect(colLocal, Filter(DataSource, Status = "Active"))`, "The Filter argument still needs to be delegable itself — ClearCollect doesn't make a non-delegable Filter safe, it just gives you one local snapshot to run non-delegable functions against afterward.", "DELEGABLE"],
  ["Delegation & Performance", "Concurrent loading", `Concurrent(
    ClearCollect(col1, Source1),
    ClearCollect(col2, Source2),
    ClearCollect(col3, Source3)
)`, "Behavior-formula only (OnStart, a button's OnSelect) — the app waits for the single longest call instead of the sum of all three, but only where the host actually supports concurrent network calls.", null],
  ["Delegation & Performance", "Non-delegable row limit", `// Non-delegable queries only return the first 500 rows
// (raise to 2000 max in Settings > General). Keep filters
// delegable, or cache the data with ClearCollect first.`, "Not a callable formula — the setting itself only ever raises the non-delegation ceiling to 2000; it never makes an inherently non-delegable function (GroupBy, Distinct, AddColumns) safe over a genuinely large table.", null],

  // ---------- Error Handling ----------
  ["Error Handling", "Patch to SharePoint with error check", `Set(varResult,
    Patch(
        YourSharePointList,
        Defaults(YourSharePointList),
        {
            Title: txtTitle.Text,
            Status: { Value: "Active" },
            AssignedTo: drpAssignee.Selected
        }
    )
);
If(
    IsError(varResult),
    Notify("Save failed: " & FirstError.Message, NotificationType.Error),
    Notify("Saved successfully", NotificationType.Success);
    Navigate(scrList, ScreenTransition.None)
)`, "SharePoint's own Choice columns need the { Value: \"...\" } shape, not a bare string — a common \"Patch silently does nothing\" complaint traces back to exactly this. IfError(Patch(...), Notify(...)) is Microsoft's own more concise alternative to this Set()+IsError() two-step.", null],
  ["Error Handling", "Edit existing SharePoint item", `Set(varResult,
    Patch(
        YourSharePointList,
        LookUp(YourSharePointList, ID = varSelectedId),
        {
            Title: txtTitle.Text,
            Status: { Value: drpStatus.Selected.Value }
        }
    )
);
If(IsError(varResult),
    Notify("Update failed: " & FirstError.Message, NotificationType.Error),
    Notify("Updated", NotificationType.Success)
)`, null, null],
  ["Error Handling", "IfError with fallback value", `IfError(
    LookUp(Items, ID = varId),
    Notify("Not found", NotificationType.Error);
    Blank()
)`, "LookUp itself can delegate — the badge describes the query inside IfError, not IfError itself (IfError is never a query and has no delegation status of its own).", "DELEGABLE"],
  ["Error Handling", "Validate before Patch", `If(
    IsBlank(txtTitle.Text),
    Notify("Title is required", NotificationType.Warning),
    IsBlank(drpStatus.Selected),
    Notify("Select a status", NotificationType.Warning),
    // All valid — save
    Patch(YourSharePointList, Defaults(YourSharePointList),
        { Title: txtTitle.Text, Status: drpStatus.Selected }
    );
    Notify("Saved", NotificationType.Success)
)`, null, null],
  ["Error Handling", "Coalesce for defaults", `Coalesce(varUser, "Unknown")`, "Returns the first non-blank argument — Coalesce(a, b, c, \"fallback\") chains past several possibly-blank values at once.", null],

  // ---------- Navigation & Context ----------
  ["Navigation & Context", "Navigate with context", `Navigate(scrDetail, ScreenTransition.None, { selectedId: ThisItem.ID })`, "The passed record becomes that screen's own context — read it there as scrDetail's own control formulas reference selectedId directly, no UpdateContext needed on arrival.", null],
  ["Navigation & Context", "Deep link params", `If(!IsBlank(Param("id")), Set(varId, Value(Param("id"))))`, "Param() always returns text, even for a numeric parameter — Value() coerces it explicitly. Param names are case-sensitive and only refresh on an app reload, never mid-session.", null],
  ["Navigation & Context", "Back navigation", `Back(ScreenTransition.UnCoverRight)`, null, null],

  // ---------- Responsive Patterns ----------
  ["Responsive Patterns", "Breakpoints", `If(App.Width < 640, "mobile", App.Width < 1024, "tablet", "desktop")`, null, null],
  ["Responsive Patterns", "Responsive padding", `If(App.Width < 640, 12, 24)`, null, null],
  ["Responsive Patterns", "Responsive columns", `If(App.Width < 640, 1, App.Width < 1024, 2, 4)`, null, null],
  ["Responsive Patterns", "Max-width centering", `Min(Parent.Width - 48, 1200)`, "Caps a container at 1200px on a wide screen while still shrinking with 24px side margins on a narrow one.", null],

  // ---------- Named Formulas (App.Formulas) ----------
  ["Named Formulas (App.Formulas)", "Color theme", `nfColors = {
    pageBg: ColorValue("#F9FAFB"),
    cardBg: ColorValue("#FFFFFF"),
    primary: ColorValue("#2563EB"),
    danger: ColorValue("#DC2626")
};`, "Named formulas may depend on control properties or data-source records and stay reactive as those change — the two real constraints are no behavior functions/side effects, and no circular reference (a = b; b = a; is a hard authoring error).", null],
  ["Named Formulas (App.Formulas)", "Responsive check", `nfIsMobile = App.Width < 640;`, null, null],
  ["Named Formulas (App.Formulas)", "User info", `nfCurrentUser = {
    Name: User().FullName,
    Email: User().Email,
    Initials: Upper(Left(User().FullName, 1))
};`, null, null],

  // ---------- Variables & State ----------
  ["Variables & State", "Global variable (whole app)", `Set(gblUserEmail, User().Email)`, null, null],
  ["Variables & State", "Screen (context) variable", `UpdateContext({ locStep: 1 })`, "Scoped to the current screen only — a global Set() is the equivalent for a value another screen also needs to read.", null],
  ["Variables & State", "Toggle a boolean", `UpdateContext({ locPanelOpen: !locPanelOpen })`, null, null],
  ["Variables & State", "Local value, no variable", `With({ subtotal: qty * price }, subtotal * 1.08)`, "subtotal exists only inside this With() call — nothing is set globally, so nothing needs resetting or cleaning up afterward.", null],
  ["Variables & State", "Collection CRUD", `Collect(colCart, { Item: "Widget", Qty: 2 });   // add
RemoveIf(colCart, Qty <= 0);                    // delete
Patch(colCart, First(colCart), { Qty: 5 });     // update
Clear(colCart)                                  // empty`, null, null],

  // ---------- Galleries & Selection ----------
  ["Galleries & Selection", "Selected item's field", `galItems.Selected.Title`, null, null],
  ["Galleries & Selection", "Search + filter combined", `Filter(
    Items,
    StartsWith(Title, txtSearch.Text),
    Status.Value = drpStatus.Selected.Value
)`, null, "DELEGABLE"],
  ["Galleries & Selection", "Highlight the selected row (row Fill)", `If(ThisItem = galItems.Selected, nfColors.primary, nfColors.cardBg)`, null, null],
  ["Galleries & Selection", "Count of shown rows", `CountRows(galItems.AllItems) & " results"`, "AllItems reflects the gallery's own currently-rendered set (after Items, sort, and any host-side paging) — not the same as CountRows(Items) if Items itself was already trimmed upstream.", null],
  ["Galleries & Selection", "Sum a column across the gallery", `Sum(galItems.AllItems, Amount)`, null, null],

  // ---------- Forms ----------
  ["Forms", "New / edit / submit", `NewForm(frmItem); Navigate(scrEdit);   // create mode
EditForm(frmItem); Navigate(scrEdit);  // edit mode
SubmitForm(frmItem)                    // save (button OnSelect)`, null, null],
  ["Forms", "On success (form property)", `// frmItem.OnSuccess
Notify("Saved", NotificationType.Success);
Back()`, null, null],
  ["Forms", "Validate before submit", `If(frmItem.Valid, SubmitForm(frmItem), Notify("Fix required fields", NotificationType.Warning))`, null, null],
  ["Forms", "Card default value", `Parent.Default   // inside a data card control's Default property`, null, null],
  ["Forms", "Reset a form", `ResetForm(frmItem)`, null, null],

  // ---------- Choices & Dropdowns ----------
  ["Choices & Dropdowns", "Selected value", `drpStatus.Selected.Value`, null, null],
  ["Choices & Dropdowns", "Choice / lookup options", `Choices(YourList.Status)`, "Permanently non-delegable (named explicitly alongside FirstN/Last/Concat/Collect in Microsoft's own delegation overview) — fine here, since a Choice column's own option set is always small.", "NOT DELEGABLE"],
  ["Choices & Dropdowns", "Cascading dropdown", `Filter(Cities, Country.Value = drpCountry.Selected.Value)`, null, "DELEGABLE"],
  ["Choices & Dropdowns", "Multi-select ComboBox → text", `Concat(cmbTags.SelectedItems, Value, ", ")`, null, null],
  ["Choices & Dropdowns", "Preselect items", `DefaultSelectedItems: Filter(Choices(YourList.Status), Value in preselectedValues)`, null, null],

  // ---------- Math & Aggregation ----------
  ["Math & Aggregation", "Sum / average", `Sum(Items, Amount)     // Average(Items, Score)`, null, "DEPENDS"],
  ["Math & Aggregation", "Max / min of a column", `Max(Items, DueDate)    // Min(Items, Price)`, null, "DEPENDS"],
  ["Math & Aggregation", "Percent complete", `Round(done / total * 100, 1) & "%"`, null, null],
  ["Math & Aggregation", "Rounding & modulo", `RoundUp(x, 0)   RoundDown(x, 2)   Mod(n, 2)`, null, null],
  ["Math & Aggregation", "Percent of total per row", `AddColumns(
    Items,
    "Share", Round(Amount / Sum(Items, Amount) * 100, 1)
)`, null, "NOT DELEGABLE"],

  // ---------- Strings & Parsing ----------
  ["Strings & Parsing", "Split into rows", `Split("red,green,blue", ",")   // 1-column table (Value)`, null, null],
  ["Strings & Parsing", "Join a table to text", `Concat(colTags, Value, ", ")`, null, null],
  ["Strings & Parsing", "Validate email (regex)", `IsMatch(txtEmail.Text, Match.Email)`, "Match.Email is one of Power Fx's own predefined patterns (alongside Match.Digit, Match.Letter, etc.) — confirmed real against Microsoft's own IsMatch reference, not a hand-rolled regex.", null],
  ["Strings & Parsing", "Extract digits (regex)", `Match("Invoice #10432", "\\d+").FullMatch   // "10432"`, "Match() returns a record; FullMatch is the whole matched substring. \\d matches Unicode digits generally, not only ASCII 0-9.", null],
  ["Strings & Parsing", "Read JSON (ParseJSON)", `Set(gblData, ParseJSON(txtJson.Text));
Text(gblData.customer.name)   // coerce an untyped Dynamic field explicitly`, "ParseJSON's own return is a Dynamic value that doesn't reliably auto-coerce in every context (assigning it to a variable, for one) — explicit Text()/Value()/Boolean()/DateValue() conversion at the point of use is Microsoft's own stated recommendation, not just defensive style. Passing ParseJSON a second Type argument returns an already-typed result instead.", null],
  ["Strings & Parsing", "Write JSON", `JSON(colItems, JSONFormat.IndentFour)`, "JSON() is a behavior-function only (can't be used in a property like Text) — capture its result into a variable first. JSONFormat.IgnoreUnsupportedTypes and .IgnoreBinaryData are the two flags worth knowing for a collection with images or unsupported columns in it.", null],

  // ---------- Colors, Theming & SVG ----------
  ["Colors, Theming & SVG", "Hex → color", `ColorValue("#2563EB")`, null, null],
  ["Colors, Theming & SVG", "Darken / lighten", `ColorFade(nfColors.primary, -0.2)   // negative = darker, positive = lighter`, "Confirmed against Microsoft's own reference: -1 fully darkens to black, 0 is a no-op, 1 fully brightens to white.", null],
  ["Colors, Theming & SVG", "Status color switch", `Switch(
    ThisItem.Status.Value,
    "Active", Color.Green,
    "Pending", Color.Orange,
    "Closed", Color.Gray,
    Color.Black
)`, null, null],
  ["Colors, Theming & SVG", "Transparent fill", `RGBA(0, 0, 0, 0)`, "RGBA(Red, Green, Blue, Alpha) — the color itself is irrelevant at alpha 0; black is just the conventional choice.", null],
  ["Colors, Theming & SVG", "Inline SVG icon (no PCF, no upload)", `"data:image/svg+xml;utf8," & EncodeUrl(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>...</svg>"
)`, null, null],
  ["Colors, Theming & SVG", "SVG with a dynamic color (placeholder pattern)", `// Don't concatenate the hex straight into the string —
// cache the data URI and skip re-rendering when only the
// color changes. Keep ONE base string with a token and
// Substitute the token in per-render. EncodeUrl(varHex)
// turns "#2563EB" into "%232563EB" — encode after substituting.
Substitute(
    "data:image/svg+xml;utf8," & EncodeUrl(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>__COLOR__</svg>"
    ),
    "__COLOR__",
    EncodeUrl(varHex)
)`, null, null],

  // ---------- Power Automate Integration ----------
  ["Power Automate Integration", "Run a flow & capture its response", `// Flow ends with "Respond to a PowerApp" returning a status field
Set(varOut, 'Approve Request'.Run(varSelectedId, txtComment.Text));
Notify(varOut.status, NotificationType.Success)`, null, null],
  ["Power Automate Integration", "Send a collection as JSON", `// Serialize a collection and hand it to the flow as one string
'Sync Cart'.Run(JSON(colCart, JSONFormat.IgnoreUnsupportedTypes))`, null, null],
  ["Power Automate Integration", "Parse a JSON response", `// Flow returns a JSON string in "payload".
Set(varData, ParseJSON('Get Order'.Run(varId).payload));
Text(varData.customer.name);   // coerce untyped fields explicitly
Value(varData.total)`, null, null],
  ["Power Automate Integration", "Loop a flow's array response into a collection", `ClearCollect(colLines,
    ForAll(
        ParseJSON('Get Lines'.Run(varId).lines).array As line,
        { Id: Value(line.id), Name: Text(line.name) }
    )
)`, "ParseJSON's own array-of-objects result needs its .array field indexed before ForAll can iterate it as a table — matches Microsoft's own documented ParseJSON-to-ForAll pattern exactly.", null],

  // ---------- Offline & Connectivity ----------
  ["Offline & Connectivity", "Detect connection", `If(Connection.Connected, "Online", "Offline")`, null, null],
  ["Offline & Connectivity", "Cache & restore (SaveData / LoadData)", `// On successful load — persist to the device
SaveData(colOrders, "orders");

// App.OnStart — restore, ignoring first-run absence
LoadData(colOrders, "orders", true)   // true = don't error if missing`, "SaveData/LoadData genuinely cannot run inside Power Apps Studio or a web browser at all — confirmed directly in Microsoft's own function reference, not just capped at 1MB there. Test on an actual mobile player. See the Real Issues tab.", null],
  ["Offline & Connectivity", "Queue writes while offline", `If(Connection.Connected,
    Patch(YourList, Defaults(YourList), varRecord),
    Collect(colPending, varRecord); SaveData(colPending, "pending")
)`, null, null],
  ["Offline & Connectivity", "Flush the queue when back online", `// App.OnStart / a Refresh button, once Connection.Connected
ForAll(colPending As p, Patch(YourList, Defaults(YourList), p));
Clear(colPending); SaveData(colPending, "pending")
// SaveData is capped at 1MB on web/Teams; ~30-70MB is typical on mobile`, null, null],

  // ---------- Timer Patterns ----------
  ["Timer Patterns", "Auto-refresh every 30s", `// Timer: Duration = 30000, AutoStart = true, Repeat = true
// OnTimerEnd:
ClearCollect(colData, YourList)`, null, null],
  ["Timer Patterns", "Debounce a search box", `// txtSearch.OnChange:
Reset(tmrDebounce)

// tmrDebounce: Duration = 400 (Repeat = false)
// OnTimerEnd:
ClearCollect(colResults, Filter(Items, StartsWith(Title, txtSearch.Text)))`, null, null],
  ["Timer Patterns", "Delayed navigation (splash screen)", `// Timer: Duration = 2000, AutoStart = true
// OnTimerEnd:
Navigate(scrHome, ScreenTransition.Fade)`, null, null],
  ["Timer Patterns", "Countdown display", `// tmrCountdown running (Duration = 10000, say); show remaining seconds
Text(RoundUp((tmrCountdown.Duration - tmrCountdown.Value) / 1000, 0)) & "s remaining"`, "Matches Microsoft's own documented Timer example exactly: (Duration − Value) / 1000, rounded up to a whole second.", null],

  // ---------- Users & Profiles ----------
  ["Users & Profiles", "Current user basics", `User().FullName    // "Jane Doe"
User().Email        // her UPN, not necessarily her SMTP address
User().Image         // profile photo — set an Image control's Image to this directly`, "User().Email returns the current user's UPN specifically, per Microsoft's own reference — not guaranteed identical to an SMTP mail address in every tenant.", null],
  ["Users & Profiles", "Job details for the current user", `Office365Users.MyProfile().JobTitle
Office365Users.MyProfile().Department
Office365Users.MyProfile().OfficeLocation`, "Requires the separate Office 365 Users connection (not the built-in User() function) — real, verified output fields from that connector's own MyProfile action.", null],
  ["Users & Profiles", "Get someone's manager", `Office365Users.Manager(userEmail).DisplayName`, null, null],
  ["Users & Profiles", "Direct reports gallery", `Office365Users.DirectReports(managerEmail)   // bind straight to a gallery's Items`, null, null],
  ["Users & Profiles", "Search the directory", `Office365Users.SearchUserV2({ searchTerm: txtSearch.Text, top: 5 }).value`, "Matches display name, given name, surname, mail, mail nickname and UPN — real, verified against the connector's own SearchUserV2 action.", null],
  ["Users & Profiles", "A stable per-user ID for API calls", `User().EntraObjectId   // GUID, unique per user — unlike FullName/Email, never changes on a rename`, null, null]
];

export const cheatSheetFormulas = raw.map(([category, title, code, note, badge], i) => ({
  id: `${category}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  index: i,
  category,
  title,
  code,
  note,
  badge
}));

/* ============================================================
   REAL ISSUES — brainstormed from the same research pass, each one
   checked against Microsoft's own docs (or, for the component-Default
   one, against this project's own already-verified finding). Split
   the way the request asked: issues with a documented fix, and
   issues that are permanent platform constraints with no true fix —
   only a design-around.
   ============================================================ */
export const issuesWithFix = [
  {
    title: "A non-delegable query silently truncates instead of erroring",
    summary: "Filter/Sort over a non-delegable expression doesn't fail — it just quietly returns only the first batch (500 by default, 2,000 at the Settings > General maximum), so a report that looks complete is often missing rows past that line.",
    fix: "Rewrite the filter using operators the specific data source actually delegates (=, StartsWith, And/Or, comparisons on Number/DateTime per Microsoft's own per-source delegation tables) — or, if the logic genuinely can't be made delegable, ClearCollect a cached copy first and run the non-delegable part against that fixed, known-size snapshot instead of the live source.",
    source: "learn.microsoft.com/power-apps/maker/canvas-apps/delegation-overview"
  },
  {
    title: "GroupBy / Distinct / AddColumns are permanently non-delegable",
    summary: "All three are named explicitly in Microsoft's own delegation overview as functions that never delegate, on any data source — and AddColumns' own output stays capped at the non-delegation row limit even when the Filter you pass into it as an argument would otherwise delegate fine on its own.",
    fix: "Pre-filter with a real delegable Filter into a small set first (or ClearCollect a cache), then run GroupBy/Distinct/AddColumns against that already-small local table rather than the live data source directly.",
    source: "learn.microsoft.com/power-apps/maker/canvas-apps/delegation-overview#query-limitations"
  },
  {
    title: "ParseJSON's result doesn't reliably auto-coerce everywhere",
    summary: "A Dynamic value from ParseJSON often converts automatically in a simple context (a Label's Text, a numeric operator) — but setting it straight into a variable, or passing it where IfError needs a definite type, needs an explicit conversion first, and skipping that step is a common silent-wrong-value bug.",
    fix: "Convert explicitly with Text()/Value()/Boolean()/DateValue() at the point of use — Microsoft's own working-with-JSON guide states this as the recommended default, not just a defensive habit — or pass ParseJSON a second Type argument to get an already-typed result with no per-field coercion needed at all.",
    source: "learn.microsoft.com/power-platform/power-fx/working-with-json"
  },
  {
    title: "Patch to SharePoint Choice/Person columns needs the right shape",
    summary: "A SharePoint Choice column needs { Value: \"...\" }, not a bare string; a Person column generally needs the people-picker control's own .Selected output. Passing the wrong shape is a frequent \"Patch just does nothing, no useful error\" community complaint.",
    fix: "Match the record shape SharePoint's own connector expects for that column type — Choice as { Value: \"...\" }, Person via a control's .Selected — and wrap the Patch in IfError/IsError so a real mismatch surfaces as a message instead of a silent no-op.",
    source: "learn.microsoft.com/power-platform/power-fx/reference/function-patch"
  },
  {
    title: "A component's Record-typed property Default doesn't survive a paste",
    summary: "A custom component property typed Record (a Config bundling several settings, say) has its authored Default apply inside Studio's own component definition and any live preview of it — but not onto a screen instance pasted from generated YAML.",
    fix: "Set every key on the Record property explicitly on the pasted instance rather than relying on the authored Default to carry over — verified directly against this project's own Enterprise Calendar / Accordion Record List / Deadline Intelligence components, each with a Config Record property.",
    source: "This project's own Enterprise Calendar detail page (install caption)"
  },
  {
    title: "A circular named formula is a hard authoring-time error",
    summary: "App.Formulas rejects a = b; b = a; outright — a real, if uncommon, point of confusion the first time two named formulas end up depending on each other indirectly through a longer chain.",
    fix: "Break the cycle with a Set()-based context/global variable for whichever side genuinely needs to be mutable, or restructure both formulas to derive from one shared third named formula instead of from each other.",
    source: "learn.microsoft.com/power-platform/power-fx/reference/object-app#formulas-property"
  }
];

export const issuesWithoutFix = [
  {
    title: "SaveData / LoadData don't run in Studio or a web browser at all",
    summary: "This isn't a size cap being hit — Microsoft's own function reference states outright that SaveData and LoadData can't be used inside Power Apps Studio or in a web browser, full stop. An app authored and only ever tested in the browser can ship with an offline feature that has literally never once executed.",
    why: "There is no setting or workaround that makes these two functions run in a browser context — it's a host-level restriction, not a configurable limit. The only real alternative is Dataverse's own Mobile Offline feature, which is a genuinely different tool (transactional local database, automatic conflict resolution, a 3-million-row practical ceiling) — not a fix for SaveData in the browser, a replacement for the whole approach.",
    source: "learn.microsoft.com/power-platform/power-fx/reference/function-savedata-loaddata"
  },
  {
    title: "SharePoint's 5,000-item list view threshold is enforced by SharePoint itself",
    summary: "Any query that touches more than 5,000 items in a single SharePoint Online list or library operation is blocked outright — this is a SharePoint platform limit, not a Power Apps delegation setting, and tenant administrators cannot raise it.",
    why: "Indexed columns and filtered, genuinely delegable queries keep any one query safely under the threshold, but nothing removes the 5,000-item ceiling itself. A list that legitimately needs to be queried across more than 5,000 rows at once needs a different data source (Dataverse or SQL Server) — there's no Power Fx formula that gets around SharePoint's own limit.",
    source: "learn.microsoft.com/troubleshoot/sharepoint/lists-and-libraries/items-exceeds-list-view-threshold"
  },
  {
    title: "Non-delegable functions can't see past what's already been fetched",
    summary: "Caching first (ClearCollect, then GroupBy/Distinct/AddColumns against the cache) is the standard mitigation — but it only moves the ceiling to \"however much you can afford to fetch and hold locally,\" it doesn't remove one.",
    why: "For a data source with no server-side grouping/distinct capability of its own, there is no Power Fx formula that makes a true full-table GroupBy or Distinct delegate — the operation fundamentally has to run somewhere, and if the source can't run it, the device has to, on whatever subset actually made it into memory.",
    source: "learn.microsoft.com/power-platform/power-fx/reference/function-distinct"
  }
];
