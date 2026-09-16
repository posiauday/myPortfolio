---
name: power-app-component-writer
description: Use when writing or reviewing a real, pasteable Power Apps canvas component YAML (ComponentDefinitions / CustomProperties / Properties / Children) for this project's catalog — covers which control properties actually exist, real data-binding patterns (static, named formula, SharePoint/Dataverse), and the verification discipline that catches PA-series paste errors before the user does.
---

# Power App Component Writer

This project ships components as real, pasteable Power Fx YAML (`Copy YAML` → Studio's
"New component → Import from code"), not just documentation. Every rule below exists
because something in this catalog actually broke a real Studio paste, or because a
real, trustworthy source proved a property/pattern works. Provenance is marked on every
claim — `CONFIRMED` (a real Studio paste error or the published schema said so directly)
or `STRONG EVIDENCE` (multiple real, complete `.pa.yaml` files from trustworthy repos —
`pnp/powerplatform-snippets`, `microsoft/*` samples — use it consistently), never
"looks right" or "should work." Guessing a property name is how this catalog shipped
broken YAML twice in one session before this skill existed — see the June/September
post-mortems folded into the rules below.

## The four failure modes this exists to prevent

1. **Property-doesn't-exist (PA2108 "Unknown property").** A control type's real
   settable-property set is *narrower* than what shows up in an exported app's YAML —
   export round-trips can carry properties Studio computed or that only apply in a
   config the export happened to be in, and Studio's *import* validator is stricter
   than its *export* serializer. GitHub examples prove a property was accepted on
   export; they don't prove it's accepted on import. Only a real paste error, or a
   property appearing in `pa.schema.yaml`'s own definitions, is `CONFIRMED`.
   A second, equally real trap under this same failure mode: Microsoft's own docs
   describing a property as common across "canvas apps" or "many controls" (its
   general accessibility/properties reference pages do this a lot) is a claim about
   the *platform*, not a guarantee every specific `Control@version` actually exposes
   it — `AccessibleLabel` is documented this way generally, and a real PA2108 paste
   error still rejected it on `Classic/Button@2.2.0` on this catalog's own KPI Card.
   Docs at the platform level are STRONG-EVIDENCE-at-best for one specific control
   version, never `CONFIRMED` by themselves — only a real paste, or that exact
   control's own dedicated reference page, gets to `CONFIRMED`.
   The generalized rule this proves: **never assume parity across controls, even
   within the same property "family."** `AccessibleLabel` failed on
   `Classic/Button@2.2.0` and later, on Notification Badge, was independently
   re-verified as real on `Image@2.2.3` (multiple real `.pa.yaml` files setting it
   on that exact control version, plus Image's own dedicated docs page listing it
   as one of *its* properties, not just the generic accessibility-properties page).
   Same property name, opposite outcome, one control apart. Before putting any
   accessibility-sounding property (`AccessibleLabel`, `Tooltip`, `TabIndex`,
   `Live`, `Role`, `AccessKey`, ...) on a control type this file hasn't already
   cleared for that exact property, look for real evidence *on that exact
   `Control@version`* — a control-specific docs page ("Image control in Power
   Apps" naming `AccessibleLabel` under its own "Additional properties") counts;
   a platform-wide accessibility reference page listing it as common does not, by
   itself. This is not limited to accessibility properties — it's the same
   caution that applies to any property before it's in the table below.
   **Core Power Fx language functions are a different, safer tier than control
   properties and don't need this per-use scrutiny.** `If`/`Switch`/`Text`/`Round`/
   `Concat`/`ForAll`/`Sequence`/`Mid`/`Hex2Dec`/`RGBA`/`ColorValue`/`ColorFade`/
   `EncodeUrl`/`Coalesce`/`Power`/`Max`/`Min` and the rest of the Power Fx formula
   language are universal and unversioned — they don't vary by control or go
   missing on import the way a *control's own settable property* can. Treat them
   like you'd treat `+` or `&&`: safe to compose freely without hunting for a
   real `.pa.yaml` example of that exact function first. The distinction that
   actually matters is control **properties** (`Fill`, `AccessibleLabel`,
   `RadiusTopLeft`, ...), which are real, versioned, narrower-than-you'd-guess
   surface area — that's what this whole file's verification discipline is for.
2. **Wrong-typed Default (silent schema corruption, or PA1011/PA2231/type-mismatch).**
   A `Table`/`Record`/`Color` custom property's `Default` is not decoration — it's how
   Studio infers that property's column/field types the *first time* the component is
   created. Prose ("12-point sample") wrapped as quoted text is a type mismatch for
   anything but `Text`. An `Event` property needs `ReturnType` and a non-empty
   `Default` even though the bare schema doesn't list them as `required` — Studio's
   real compiler is stricter than the schema's `required:` list.

3. **Wrong shape (builds cleanly, passes every check, isn't what the user asked for).**
   No script catches this one — it's a design mistake, not a syntax mistake, and it's
   the most expensive kind because everything downstream (properties, Children:,
   sample data, the site's own preview) gets built consistently *wrong*, so it looks
   finished. It happened once already on this catalog's own KPI Card: a real
   "enterprise" reference the user shared used one `Data` table plus a `Gallery` to
   render an arbitrary number of cards from one pasted component — a genuinely good
   pattern for a component whose job is *rendering a list*. KPI Card's job is being
   *one card* — you place one instance per metric on a screen, and each instance's
   own scalar properties (`Label`, `Value`, `Icon`, `Style`, ...) configure that one
   card. Copying the reference's *architecture* (Gallery-over-a-Data-table) instead of
   its *techniques* (StyleConfig tokens, the SVG icon/sparkline patterns, skeleton
   loading) turned a single reusable card into a fixed dashboard-row container — every
   property, every sample default, every preview mockup built cleanly on top of the
   wrong foundation, and none of it errored until the user asked why pasting the
   component produced a whole row instead of one card they could place per metric.
   **Before building a component's Properties/Children shape, settle whether it's a
   single-instance widget (its own properties describe *itself*; you place N of them
   for N cards) or a container that renders a collection (one `Table`-typed property,
   one `Gallery`, an arbitrary number of rows from one instance) — a component's own
   plain-English name is usually the tell ("Card" is one thing; "List", "Row", "Grid",
   "Table" hold many), and when a reference example's shape is ambiguous against that
   name, ask rather than default to whichever shape the reference happened to use.**
   A sophisticated technique (a real SVG-icon library, a real generated sparkline, a
   real StyleConfig token set, real skeleton loading) is reusable in *either* shape —
   don't let "the reference did it this way" settle the shape question by itself.

4. **Unverified color contrast (WCAG 1.4.3, real axe-core findings — plural).** Every
   component in this catalog that pairs a text/icon color with a background it wasn't
   *originally* designed for has failed a real contrast check at least once: KPI
   Card's Filled variant (icon-color-as-text on its own icon-bg tint, using
   Material-palette hex values picked to look plausible, not measured — several
   failed 4.5:1), the Catalog page's active category pill (`text-white/70` on
   `#168326` measured 3.21:1), and — while building this exact skill's own
   Notification Badge — reusing KPI Card's lighter `positive`/`warning` swatches
   (`#16A34A`/`#D97706`, picked for *text on a light tint*) as *backgrounds behind
   white count text* failed at 3.30:1 and 3.19:1 respectively, caught only by
   actually computing it before shipping, not by eye. **A color that passes 4.5:1
   in one pairing does not transfer to a different pairing** — same hex, different
   role (text-on-tint vs. white-text-on-solid), different result, every time. Never
   reuse a hex value in a new text/background role without computing that *specific*
   pairing's contrast ratio (see the Verification discipline section for a
   ready-to-run snippet) — "it passed before, in a similar-looking spot" is exactly
   how three of these four shipped.

Failure modes 1, 2, and 4 shipped silently in this catalog before something started
checking for them — 1 and 2 are now caught by `scripts/validate-yaml.mjs`; 4 has no
script check yet (a real automated contrast linter needs to know which text sits on
which background *semantically*, which nothing here currently declares in a
structured way — computing it by hand per new color pairing, every time, is still
the discipline until that changes). If you add a new failure mode, add a script
check for it where you can — a rule that isn't enforced by a script gets forgotten
under the next deadline. Failure mode 3 (wrong shape) can't be caught by a script at
all — it needs to be settled with the user before any code gets written, not
discovered after.

## Control property reference (this project's own findings)

| Control | Radius corners? | Notes |
|---|---|---|
| `Rectangle@2.3.0` | **No** — `RadiusTopLeft/TopRight/BottomLeft/BottomRight` all rejected, `CONFIRMED` via a real PA2108 paste error on this catalog's own KPI Card. Only `Fill/X/Y/Width/Height/Visible/BorderColor/BorderThickness` are confirmed safe (same paste, no errors). | Square corners only. Don't reach for Rectangle when a card needs rounded corners — use `GroupContainer` instead. |
| `GroupContainer@1.5.0` | **Yes** — `STRONG EVIDENCE`, dozens of real `.pa.yaml` files including `pnp/powerplatform-snippets`. | Two `Variant`s: `AutoLayout` (flex-like — `LayoutDirection`, `LayoutGap`, `LayoutWrap`, `LayoutAlignItems`) and `ManualLayout` (absolute `X/Y/Width/Height` children, like a plain container). Also takes `DropShadow`, `Fill`, `BorderColor`, `BorderThickness`. This is the real "card" building block — reach for it before Rectangle. |
| `Classic/Button@2.2.0` | **Yes** — `STRONG EVIDENCE`, and `CONFIRMED` safe generally (this catalog's own real paste test: zero errors on any Button property used, including `Radius*`). | Used both as a real button (`OnSelect`, `Text`) and, with `Fill`/`BorderColor` transparent and `Text: =""`, as an invisible click-catcher overlay, or as a skeleton-loading placeholder bar/circle (colored `Fill`, no text). Real, common pattern — not a hack. **`AccessibleLabel` — `CONFIRMED` rejected** via a real PA2108 paste error on this catalog's own KPI Card, despite Microsoft's own "Accessibility properties for Power Apps" reference page listing `AccessibleLabel` as a common canvas-apps property. That page describes the platform generally, not every specific versioned control — `Classic/Button@2.2.0`'s real accessible name is its own `Text` property; it has no separate one. See `scripts/validate-yaml.mjs`'s `KNOWN_INVALID_CONTROL_PROPERTIES`. |
| `Label@2.5.1` | Not checked (no Radius attempted). | `CONFIRMED` safe for `Text/Color/Font/Size/FontWeight/X/Y/Width/Height/Align` (this catalog's real paste test). Older/classic text control. |
| `ModernText@1.0.0` | Not checked. | `STRONG EVIDENCE` real and current. Adds `AutoHeight`, `FillPortions` (for use inside an `AutoLayout` `GroupContainer`, flex-grow style), `VerticalAlign`, `Wrap`. Prefer this over `Label` for anything inside an `AutoLayout` container. |
| `Gallery@2.15.0` | n/a | `STRONG EVIDENCE`, extremely common (hundreds of real examples). Real properties: `Items`, `TemplateSize`, `TemplatePadding`, `WrapCount`, `Transition` (`Transition.Pop/Push/None`), `ShowScrollbar`, `LayoutMaxHeight/LayoutMaxWidth`. `Variant: Vertical` for a wrapping grid (`WrapCount` columns per row). This is how one component definition renders *any number* of data-driven cards — don't hand-author N near-duplicate children for "up to N items"; use a Gallery bound to a real `Table`-typed property instead. |
| `Image@2.2.3` | n/a | Real. `Image` property accepts a literal `data:image/svg+xml,<url-encoded-svg>` string — a real, standard technique for a dependency-free chart/icon with no external asset. Build it with `EncodeUrl(...)`, never raw string concatenation (unescaped `<`, `#`, quotes inside the SVG would break the URI or the YAML). `AccessibleLabel` — `STRONG EVIDENCE` real on this exact control version (multiple real `.pa.yaml` files, plus Image's own dedicated docs page lists it under "Additional properties"), unlike `Classic/Button@2.2.0` above — see the "never assume parity across controls" rule in failure mode 1. |
| `Classic/TextInput@2.3.2` | n/a | `STRONG EVIDENCE` — real in `pnp/powerplatform-snippets`, `pnp/powerplatform-samples`, and `microsoft/scmsamples-EnterpriseAssetManagement`'s own `SearchBar.pa.yaml` (a real live search box, `txtSearchInput`). Real properties from that exact file: `Default`, `HintText`, `DelayOutput` (debounced live search), `BorderColor`, `BorderThickness`, `Fill`, `Color`, `Font`, `Size`, `X/Y/Width/Height`, `Clear`. Reads live-typed text via `Self.Text` (not `.Value`). `OnChange` confirmed real on this exact control via two further real files. A modern non-Classic `TextInput@0.0.53/54` also exists (`Value`/`Placeholder`/`Appearance` instead of `Default`/`HintText`/Border props) and is what Studio inserts by default — reach for Classic here since this catalog already prefers Classic controls (`Classic/Button`) for explicit Border/Fill styling control. |
| `Timer@2.1.0` | n/a | `STRONG EVIDENCE`, confirmed via 20+ real shipped `.pa.yaml` files (`pnp/powerplatform-snippets` and two separate `microsoft/*` sample repos). Real properties: `Duration` (ms), `Repeat`, `AutoStart`, `AutoPause`, `Start` (a live boolean formula, not just a literal — any other control's own formula can toggle it), `OnTimerStart`, `OnTimerEnd`, and a read-only `Value` (elapsed ms since the current cycle started). **`Value`/`Duration` can be read directly inside a *sibling* control's own formula** — not only inside the Timer's own `OnTimerEnd` — for a live, continuously-animating value with no `UpdateContext`/`Set()` polling. Real example: `pnp/powerplatform-snippets`'s `animated-accordions` reads `tmrAccordionTimer.Value / tmrAccordionTimer.Duration` directly inside another control's own `Height` formula — the exact pattern this catalog's Notification Badge reuses for its pulse ring's `Height`/`Width`/alpha. |

**When in doubt about a property this table doesn't cover:** search GitHub for
`"Control: <Type>@<version>"` plus the property name, prefer results from
`pnp/powerplatform-snippets` or a `microsoft/*` repo, and mark the finding
`STRONG EVIDENCE` (not `CONFIRMED`) in whatever file you add it to. If the user
reports a real paste error, that overrides any number of GitHub examples — update
this table and `scripts/validate-yaml.mjs`'s `KNOWN_INVALID_CONTROL_PROPERTIES`
immediately, in the same commit as the fix.

## Real syntax rules

- **Never wrap a formula reference or enum value in JS string quotes when it's a
  *branch* inside a larger template-literal formula** — this is a real bug this
  catalog shipped 56 times across 8 components (Calendar, Email Composer, Sidebar,
  Responsive Breadcrumbs, Milestone Tracker, Dialog, Approval Journey, Route Map)
  before it was caught, and none of `test:yaml`/lint/build caught any of them,
  since all three only check syntax, never Power Fx semantics. The bug:
  `` `If(${cond}, "RGBA(23, 32, 27, 1)", "RGBA(148, 163, 184, 1)")` `` — writing a
  JS template literal for the *whole* property and then, inside it, wrapping a
  *branch* like `RGBA(...)`, `Parent.Width - 28`, or `FontWeight.Bold` in literal
  `"..."` characters. Those quote characters survive into the generated Power Fx
  text verbatim, turning a real function call or enum reference into an inert
  **text literal** — `Fill: =If(cond, "RGBA(23, 32, 27, 1)", ...)` sets the color
  to the 20-character string "RGBA(23, 32, 27, 1)", not the color itself, and a
  `Width`/`Height`/`X`/`Y` branch like `"Parent.Width - 28"` becomes literal text
  mixed with a sibling branch that's a real Number — a genuine Power Fx type
  error no amount of YAML-level checking catches, only real semantic reasoning
  about what the generated formula text actually says. The fix is mechanical:
  a value that's a bare standalone JS string (`Fill: "RGBA(23, 32, 27, 1)"`,
  `Width: "Parent.Width"`) is correct and common throughout this file — the bug
  is specific to that same fragment appearing *inside* a template literal that
  already contains `${...}` interpolation, where any literal `"` around it needs
  to be removed so the fragment is bare Power Fx syntax, not a text literal:
  `` `If(${cond}, RGBA(23, 32, 27, 1), RGBA(148, 163, 184, 1))` ``. **After
  writing any `If(...)`/`Switch(...)` with multiple branches inside a template
  literal, grep the finished file for `, "` immediately followed by a
  capitalized `Word.Word` pattern (`RGBA(`, `Parent.`, `Color.`, `FontWeight.`,
  `Align.`, `BorderStyle.`, `DropShadow.`, `SortOrder.`, `TimeUnit.`,
  `DateTimeFormat.`, or any other enum/function reference) — a real match is
  this bug, not a coincidence.** Distinguish it from a genuine text value that
  should stay quoted (`"Destructive"`, `"Ascending"`, visible UI text like
  `"Post"`) by asking whether the fragment is a Power Fx *reference/enum/function
  call* (never quoted) or actual *text content* (quoted) — the two look similar
  in isolation but are never interchangeable.
- Every formula value needs a leading `=`. A value containing `#` or `:` anywhere
  (even inside a quoted string) must use the `|-` block-scalar form instead of an
  inline `key: =value` — YAML itself would misread a bare `#`/`:` as a comment or a
  new mapping key. (`src/lib/componentDocs.js`'s `needsMultiline` already does this
  automatically for every formula this project generates.)
- A `Text` custom property's `Default` is a quoted Power Fx text literal:
  `="some text"`. Power Fx escapes an embedded `"` by **doubling** it (`""`), not by
  backslash — `JSON.stringify` is the wrong tool for this (it backslash-escapes,
  which is invalid Power Fx). See `powerFxTextLiteral` in `componentDocs.js`.
- A `Table`-typed property's `Default` must be a real `Table({col: val, ...}, ...)`
  literal (or `Filter(Table({...}), false)` for a genuinely-empty-but-typed table —
  build one throwaway row so the columns exist, then filter it away). A `Record`
  property's `Default` is a real `{col: val, ...}` literal. A `Color` property's
  `Default` is `RGBA(r, g, b, a)`. Never the catalog's own prose description string.
- A control referencing its parent component's own custom property uses
  `cmp<PascalTitle>.PropName` (e.g. `cmpKPI.Style`), not `Self.PropName` — inside a
  *child* control, `Self` means that child, not the component. `Parent.Width`/
  `Parent.Height` refer to the immediate containing control (component root, or a
  `GroupContainer`), and `Self.Height`/`Self.Width` on a control can self-reference
  its own other computed properties (e.g. `Y: =158 - Self.Height` to anchor a bar's
  bottom edge while its height varies).
- An `Event` property needs, beyond the bare `PropertyKind: Event`:
  `ReturnType` (a `pfx-data-type` value or `None` for void) and a non-empty
  `Default` (`=false` is the standard convention for a void event). `CONFIRMED` —
  PA1011/PA2231 on a real paste without them.
- An `Event` can carry a payload via `Parameters:`, a list of named,
  typed arguments — schema-confirmed
  (`https://github.com/microsoft/PowerApps-Tooling` `pa.schema.yaml`,
  `pfx-function-parameters`). Each parameter needs its own `DataType` and usually a
  representative `Default` (a real record/table/literal shaped like what the host
  will actually receive), same rules as any other typed `Default`. Call it inside a
  control with `cmp<Name>.OnEventName(argExpression)` — e.g.
  `cmpKPI.OnCardClick(ThisItem)`.
  **In this project specifically**, wire this up by returning an `eventParameters`
  key alongside `properties`/`children` from a `CHILDREN_BUILDERS` function —
  `{ EventName: [{ name, dataType, defaultFormula }, ...] }` —
  `buildComponentYaml` in `componentDocs.js` reads it and emits the real
  `Parameters:` block automatically (verified: inspect the generated YAML for
  the event name after adding one, the same way Accordion List's `OnSelectGroup`
  was confirmed to emit a real `GroupKey: DataType: Number` parameter). Reach
  for this whenever a component's own docs describe an event that "returns" or
  "carries" something — it's a real, already-wired mechanism, not something to
  invent a workaround for. The reverse mistake already happened once: Accordion
  List's original contract described several properties as "read-only,
  component-sets-this" (`ExpandedGroupKey`, `ActionKey`, ...) — but this
  project's `buildComponentYaml` emits every `CustomProperty` as
  `PropertyKind: Input` unconditionally, with no Output-property mechanism at
  all, so those could never actually have worked as documented. Fixed by
  replacing them with real event Parameters instead. Before documenting a
  property as host-readable-but-component-set, check `componentDocs.js` for
  actual Output-property support — don't assume Studio's general property-kind
  vocabulary applies just because it's real Power Apps terminology.

## Real Studio behavior notes (paste-time quirks, not properties)

- **F5 to preview, not just paste.** Studio's own editor doesn't fully evaluate a
  nested `Gallery` template inside a just-pasted component until a preview cycle
  (F5) runs — a pasted instance with a `Gallery` inside it can look empty or
  incomplete in the tree view/canvas right up until then. This is standard behavior
  for any YAML-imported component containing a `Gallery`, not a sign the paste
  failed. (Already surfaced in the Detail page's own "Copy YAML"/"Copy as screen
  control" caption; recorded here too so it isn't lost behind that one piece of UI
  copy.)
- **A `Record`-typed property's own authored `Default` does not carry onto a pasted
  screen instance** the way it does for a `Text` or `Number` property — Power Apps
  only applies a Record-typed `Default` inside the component's own definition (and
  this project's own preview/generated YAML), never automatically onto an instance
  you paste onto a screen. Set every one of that Record's keys explicitly on the
  instance instead of relying on the default showing up (`StyleConfig` is the real
  example here — see the Detail page's own per-component caption when a component
  has one).

## Real patterns worth reusing

**Dynamic, data-driven cards instead of N fixed children.** Don't build "Card 1",
"Card 2", … "Card 4" as separate named children for a component meant to show a
list. Give it one `Table`-typed `Data` property (real column schema, not "12-point
sample" prose) and one `Gallery` bound to `Filter(cmp<Name>.Data, !IfError(isHidden,
false))` (or similar), with the per-card visual as the Gallery's single template
child. This is what makes a component actually reusable at arbitrary scale, and
it's the difference between an "MVP mockup" and a real component.

**Style-driven theming via If/Switch, not separate exports per variant.** A real
component has *one* definition; "Standard/Compact/Minimal/Filled/Chart" aren't five
different `Children:` trees, they're one tree where every control's
`Visible`/`Height`/`Width`/`X`/`Y`/`Color`/`Fill` is an `If(cmp<Name>.Style = "...",
..., ...)` or `Switch(cmp<Name>.Style, "A", ..., "B", ..., ...)` formula reading a
single `Style: Text` property. Centralize repeated tokens (colors, spacing, radii,
type sizes) in one `StyleConfig: Record` property so every control references
`cmp<Name>.StyleConfig.colors.text` etc. instead of repeating literal `RGBA(...)`
everywhere — one place to retheme, and it matches how this catalog's own real
enterprise KPI Card example (the one this file's authored against) does it.

**Tone-driven color, not two raw color properties.** Instead of exposing something like
`IconBg`/`IconColor` as the *only* way to theme an instance, add a `Tone: Text`
property (`"Positive"`/`"Warning"`/`"Negative"`/`"Neutral"`/`"Info"`/`"Custom"`) that,
when not `"Custom"`, overrides the raw color properties by resolving through
`StyleConfig.tones.<tone>` via `Switch`: `Switch(cmp<Name>.Tone, "Positive",
cmp<Name>.StyleConfig.tones.positive, "Warning", ..., cmp<Name>.IconColor)` (falling
through to the raw property when `Tone = "Custom"`). This gives a caller a one-word
semantic choice ("this metric is bad news — make it read that way") instead of
hand-picking a hex, while `"Custom"` still lets an advanced caller override
completely. Used on both KPI Card (`Tone` resolving `IconBg`/`IconColor`) and
Notification Badge (`Tone` resolving the badge/pulse color) — real, reusable pattern
for "color follows the kind of data," not "color is whatever hex the caller picked."
**Each tone's own hex still needs its own contrast check per failure mode 4 above** —
a tone resolving cleanly doesn't mean the resulting color passes contrast in *this*
component's specific text/background role; Notification Badge's tones needed darker
values than KPI Card's own tones precisely because the two components use the same
tone names against different roles (tint-with-dark-text vs. solid-with-white-text).

**Deriving a variable-alpha color from an already-resolved hex string.** When a
resolved color (from `Tone`, `IconColor`, or any other `Text`-typed hex property)
needs to be reused at a *different, animating* alpha — a fading pulse ring behind a
solid badge, for example — decompose it with core Power Fx rather than hardcoding a
second color: `RGBA(Hex2Dec(Mid(hex, 2, 2)), Hex2Dec(Mid(hex, 4, 2)), Hex2Dec(Mid(hex,
6, 2)), alphaFormula)` (assuming a leading `#` — `Mid(hex, 1, 1) = "#"`, so the red
channel starts at position 2). `Hex2Dec`/`Mid`/`RGBA` are all core, unversioned Power
Fx functions (safe per failure mode 1's language-vs-property distinction above) —
this is standard, not a workaround. Notification Badge's pulse ring uses this to fade
the *same* color the badge itself resolved to, instead of a second, independently
picked (and separately contrast-checked) color.

**Responsive columns via `App.SizeBreakpoints`.** A real responsive grid reads the
host app's own `App.SizeBreakpoints` (Mobile/Tablet/Desktop widths), not a hardcoded
pixel guess: a `ColumnsLayout: Record` property holds `{Mobile, Tablet, Desktop,
MobileBreakpoint, TabletBreakpoint, DesktopBreakpoint}`, sourced with
`IfError(Index(App.SizeBreakpoints, N).Value, fallback)` so it degrades gracefully
if the host app has fewer breakpoints configured. A `Gallery`'s `WrapCount` and the
component's own `Height` (dynamic — visible-row-count × card-height) both derive
from comparing `App.Width` against these breakpoints.

**Sparkline / inline chart via a generated SVG data URI.** Store the series as a
plain comma-separated `Text` value on each data row (`"10,25,18,42"`), not a nested
`Table` — far easier for a host to produce from any data source. Extract the numbers
with `MatchAll(raw, "-?\d+\.?\d*")` + `ForAll(..., {n: Value(FullMatch)})`, compute
`Min`/`Max`/`CountRows`, build an SVG `<polyline>`/`<polygon>` path string with
`Concat(Sequence(cnt), ...)`, and set an `Image` control's `Image` property to
`"data:image/svg+xml;utf8," & EncodeUrl(svgString)`. Color the line/fill from
whatever business value already determines "good/bad" (e.g. `PercentChange`'s
sign) rather than inventing a second color property.

**Reusable icon library via an SVG-with-placeholder table.** An `Icons: Table`
property holds `{Name: Text, SVG: Text}` rows, each `SVG` string containing the
literal placeholder text `COLOR` where a `stroke=` or `fill=` value would go. At
render time: `Substitute(LookUp(cmp<Name>.Icons, Name = ThisItem.Icon, SVG),
"COLOR", ThisItem.IconColor)`, then the same `data:image/svg+xml` `Image` technique
above. One shared icon set, per-row recoloring, no per-icon-color asset variants.

**Skeleton loading state.** An `IsLoading: Boolean` property toggles two sibling
`GroupContainer`s' `Visible` (the real data `Gallery` vs. a `Sequence(8)`-driven
skeleton `Gallery` with the *same* `WrapCount`/`TemplateSize` so the loading state
doesn't jump when real data arrives), each skeleton "field" a plain colored
`Classic/Button` bar/circle (no text, no border) — real, common, simple.

**Real data-source binding.** A component's `Table`-typed property is never bound
to a literal `Table(...)` outside its own `Default` — every real usage on a screen
overrides it with a live expression. Three real, complete patterns (verified
against a real "enterprise" component built to this exact spec — reproduce, don't
paraphrase, when documenting a component's own Examples):
1. **Static/testing**: `cmpKPI.Data = Table({ID: 1, ...}, {ID: 2, ...})` — fine for a
   demo screen, never for production data.
2. **Collection built once, named formula for auto-refresh**: `App.OnStart` runs
   `ClearCollect(colKPIData, <source query>)`; a **named formula**
   `nfKPIData = ForAll(colKPIData, {...reshape into the component's exact columns...})`
   recalculates automatically whenever `colKPIData` changes (no manual refresh
   needed); the screen sets `cmpKPI.Data: =nfKPIData`.
3. **Live SharePoint/Dataverse, reshaped in place**: `GroupBy`/`ForAll`/`AddColumns`
   transform the real list/table into the component's expected shape inline, e.g.
   `ForAll(GroupBy(Assets, "Status", "Group"), {ID: CountRows(Group), Icon:
   Switch(Status, "Available", "Package", "In Use", "TrendLines", "Box"), Value:
   CountRows(Group), Label: Status, PercentChange: Round((CountRows(Group) -
   varPrev) / varPrev * 100, 0), IconBg: Switch(Status, "Available", "#E8F5E9",
   "#EBF5FF"), IconColor: Switch(Status, "Available", "#4CAF50", "#2196F3"),
   SparklineData: ""})`. The component itself never contains a SharePoint/Dataverse
   reference — only the screen-level binding does, which is exactly what makes the
   same component reusable across totally different data sources.

## Adding a new component to this catalog: the checklist

In this order, every time:

1. **`componentLibrary.js`'s `raw` array** — add `["Title", "Category", "Verified" |
   "Original"]` (see Maturity below). This alone makes the component appear in the
   catalog and route.
2. **`componentLibrary.js`'s `overrides` object** — add a matching key (kebab-case of
   the title) with all seven sections: `summary`, `properties`, `events`,
   `architecture`, `examples`, `accessibility`, `limitations`, plus `variants` (the
   Detail page's Variants tab reads this). **A `raw` entry with no matching
   `overrides` key does not error** — it silently falls back to
   `baseByCategory[category]`'s generic content and `GENERIC_VARIANTS`, and `npm run
   test:yaml` has no way to catch this since the fallback content is still
   schema-valid. Check this by eye every time: open the new component's Detail page
   and confirm the Properties/Examples/etc. actually describe *this* component, not
   generic placeholder text.
3. **`sampleFormulas.js`** — one entry per `Table`/`Record`/`Color`-typed property,
   keyed `"Title::PropName"`, a real structural literal (see Real syntax rules
   above) — this is what `buildComponentYaml` substitutes into the generated
   `Default:`.
4. **`componentChildren.js`** — if the component is getting a real `Children:` tree
   (not just a Properties/Events contract), write the builder function and add it to
   `CHILDREN_BUILDERS` at the bottom of the file. This registration is what makes
   `npm run test:yaml` actually recurse into and validate the `Children:` tree;
   without it, the tree is invisible to the validator even though the rest of the
   component still gets schema-checked.
5. **`ComponentPreview.jsx`** — add a bespoke `if (item.title === "Title")` block
   rendering a real, illustrative mockup, plus one render branch per entry in the
   component's own `variants` list (the Detail page's Variants tab passes each
   variant name through this same component). A component with no bespoke block
   here falls through to the generic fallback mockup at the bottom of the file —
   visually obvious on the page, unlike the silent `overrides` fallback above.
6. **The shared `yamlStatus` string** (used by every `CHILDREN_BUILDERS` component) —
   update its wording only if the new component adds a genuinely new technique (e.g.
   "plus Timer for an animated pulse") worth calling out; read what's already there
   first, since it's shared across every `CHILDREN_BUILDERS` component, not owned by
   any single one of them.
7. **Run the full verification discipline below** before calling the component done
   — a new component is exactly the case that discipline exists for.

## Maturity: "Verified" vs "Original"

- **`Verified`** — the component's contract (its properties, and its `Children:`
  tree if it has one) has been cross-checked against something real: a real
  reference implementation the user shared, real GitHub `.pa.yaml` examples for
  every control/property involved, or a real Studio paste test. KPI Card and
  Notification Badge are both `Verified` — KPI Card against the user's own
  "enterprise" reference, Notification Badge against the Timer/Image research plus
  the user's own reference Badge YAML.
- **`Original`** — a design specification this catalog invented itself, with no real
  external reference to check the *shape* against, even when every individual
  property/control it uses is independently `CONFIRMED`/`STRONG EVIDENCE`. Most of
  the catalog is currently `Original` — a real, honest label, not a lesser one; it
  means "no real prior art was cross-checked," not "built less carefully."
- Don't default to `Verified` just because the YAML passes `test:yaml` — that only
  proves syntax, not that the shape or contract was checked against anything real
  (see failure mode 3 above). Maturity answers "was this checked against something
  outside this file," a question a passing test suite doesn't answer on its own.

## Verification discipline (non-negotiable, in this order)

1. **`npm run test:yaml`** — `scripts/validate-yaml.mjs` parses every generated
   YAML with a real YAML parser and checks it against Microsoft's published schema
   enum set, every `Table`/`Record`/`Color` `Default` is a real structural literal
   (not quoted prose), every `Event` has `ReturnType`+`Default`, and (for any
   component listed in `CHILDREN_BUILDERS`) the full `Children:` tree recursively:
   every control has a real `Type@x.y.z` reference, every one of its `Properties`
   values is a real formula, and none of them appear in
   `KNOWN_INVALID_CONTROL_PROPERTIES`.
2. **`npm run lint` + `npm run build`** — must stay clean; a schema-valid YAML
   generator that throws in the React app isn't shipped.
3. **A rendered sanity mockup** — before claiming a `Children:` layout "looks
   right," render its literal `X/Y/Width/Height/Fill` numbers as plain positioned
   HTML `div`s (a throwaway script, not committed) and screenshot it. Catches
   layout math mistakes (overlapping elements, a bar anchored off-card) that a YAML
   parser can't catch, since the parser only validates *syntax*, not *geometry*.
4. **Ask the user to paste it into real Studio** when you can't verify a claim any
   other way (this project has no way to run Studio itself). Treat a real PA-series
   error as ground truth that overrides every GitHub example and every claim in
   this file — fix the file's row in the control-property table above in the same
   commit as the code fix, so the same mistake can't recur on the next component.
5. **Compute contrast for every new text/background color pairing** (failure mode 4
   above) — don't eyeball it and don't reuse a hex value from a different pairing
   without recomputing. Real WCAG relative-luminance formula, ready to paste into a
   throwaway `node -e` or scratch script:
   ```js
   function luminance([r, g, b]) {
     const c = [r, g, b].map(v => {
       v /= 255;
       return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
     });
     return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
   }
   function contrast(hex1, hex2) {
     const toRgb = h => { h = h.replace("#", ""); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
     const [l1, l2] = [luminance(toRgb(hex1)), luminance(toRgb(hex2))];
     const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
     return (lighter + 0.05) / (darker + 0.05);
   }
   // contrast("15803D", "FFFFFF") -> 5.02 (this catalog's real Notification Badge fix)
   ```
   Need ≥4.5:1 for normal text, ≥3:1 for large text (≥18pt, or ≥14pt bold) and for
   non-text UI elements. Below 4.5:1 (normal text), darken/lighten one side and
   recompute — don't ship on "looks close enough."
6. **Toggle dark mode for real before screenshotting or running axe in "dark
   mode."** This app's dark mode is a manual React state toggle (a button labeled
   "Switch to dark mode"/"Switch to light mode" in `Portfolio.jsx`), not
   `prefers-color-scheme` — Playwright's `page.emulateMedia({ colorScheme: 'dark'
   })` does **nothing** here and silently leaves you testing light mode twice. Real
   procedure: `page.goto('/')` → `page.getByLabel('Switch to dark mode').click()` →
   navigate via real UI clicks from there (`getByRole('button', { name: /Browse
   all \d+ components/ })`, `getByRole('button', { name: /Open component/ })`,
   `getByLabel('Close, back to components')`) — never a fresh `page.goto(url#hash)`
   after toggling, since that reloads the app and resets the toggle to its default
   `false`. This caught a real bug once already (a Catalog pill at 3.21:1) that a
   flawed emulateMedia-based sweep had missed entirely.

## Applying this to the rest of the catalog

Each other component not yet in `CHILDREN_BUILDERS` needs the same treatment KPI Card
got — but settle its shape (failure mode 3 above) explicitly first, per component,
against its own name and what the user actually says they'll do with it (place one per
X? or feed it a collection?), not by assuming a shape from whatever reference happened
to be at hand. Some genuinely are collections (a list, a menu, a stepper) where one
`Table`-typed property plus a `Gallery` is right; KPI Card looked like it might be one
too and wasn't. Once the shape is settled, build a real `Children:` tree using the
control table above, `sampleFormulas.js` entries for every `Table`/`Record`/`Color`
property, and run the same verification pipeline. Do them one at a time, each through
the full verification discipline above, rather than batching many components through
steps 1-3 before any of them sees step 4 — the whole point of this file existing is
that steps 1-3 catch syntax and geometry, not every real Studio compiler quirk (and
none of them catch a wrong shape at all — only the user, asked early, does that).
