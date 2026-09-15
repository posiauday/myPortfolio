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

## The two failure modes this exists to prevent

1. **Property-doesn't-exist (PA2108 "Unknown property").** A control type's real
   settable-property set is *narrower* than what shows up in an exported app's YAML —
   export round-trips can carry properties Studio computed or that only apply in a
   config the export happened to be in, and Studio's *import* validator is stricter
   than its *export* serializer. GitHub examples prove a property was accepted on
   export; they don't prove it's accepted on import. Only a real paste error, or a
   property appearing in `pa.schema.yaml`'s own definitions, is `CONFIRMED`.
2. **Wrong-typed Default (silent schema corruption, or PA1011/PA2231/type-mismatch).**
   A `Table`/`Record`/`Color` custom property's `Default` is not decoration — it's how
   Studio infers that property's column/field types the *first time* the component is
   created. Prose ("12-point sample") wrapped as quoted text is a type mismatch for
   anything but `Text`. An `Event` property needs `ReturnType` and a non-empty
   `Default` even though the bare schema doesn't list them as `required` — Studio's
   real compiler is stricter than the schema's `required:` list.

Both of these shipped silently in this catalog before `scripts/validate-yaml.mjs`
checked for them. If you add a new failure mode, add a check for it in that script
too — a rule that isn't enforced by a script gets forgotten under the next deadline.

## Control property reference (this project's own findings)

| Control | Radius corners? | Notes |
|---|---|---|
| `Rectangle@2.3.0` | **No** — `RadiusTopLeft/TopRight/BottomLeft/BottomRight` all rejected, `CONFIRMED` via a real PA2108 paste error on this catalog's own KPI Card. Only `Fill/X/Y/Width/Height/Visible/BorderColor/BorderThickness` are confirmed safe (same paste, no errors). | Square corners only. Don't reach for Rectangle when a card needs rounded corners — use `GroupContainer` instead. |
| `GroupContainer@1.5.0` | **Yes** — `STRONG EVIDENCE`, dozens of real `.pa.yaml` files including `pnp/powerplatform-snippets`. | Two `Variant`s: `AutoLayout` (flex-like — `LayoutDirection`, `LayoutGap`, `LayoutWrap`, `LayoutAlignItems`) and `ManualLayout` (absolute `X/Y/Width/Height` children, like a plain container). Also takes `DropShadow`, `Fill`, `BorderColor`, `BorderThickness`. This is the real "card" building block — reach for it before Rectangle. |
| `Classic/Button@2.2.0` | **Yes** — `STRONG EVIDENCE`, and `CONFIRMED` safe generally (this catalog's own real paste test: zero errors on any Button property used, including `Radius*`). | Used both as a real button (`OnSelect`, `Text`) and, with `Fill`/`BorderColor` transparent and `Text: =""`, as an invisible click-catcher overlay, or as a skeleton-loading placeholder bar/circle (colored `Fill`, no text). Real, common pattern — not a hack. |
| `Label@2.5.1` | Not checked (no Radius attempted). | `CONFIRMED` safe for `Text/Color/Font/Size/FontWeight/X/Y/Width/Height/Align` (this catalog's real paste test). Older/classic text control. |
| `ModernText@1.0.0` | Not checked. | `STRONG EVIDENCE` real and current. Adds `AutoHeight`, `FillPortions` (for use inside an `AutoLayout` `GroupContainer`, flex-grow style), `VerticalAlign`, `Wrap`. Prefer this over `Label` for anything inside an `AutoLayout` container. |
| `Gallery@2.15.0` | n/a | `STRONG EVIDENCE`, extremely common (hundreds of real examples). Real properties: `Items`, `TemplateSize`, `TemplatePadding`, `WrapCount`, `Transition` (`Transition.Pop/Push/None`), `ShowScrollbar`, `LayoutMaxHeight/LayoutMaxWidth`. `Variant: Vertical` for a wrapping grid (`WrapCount` columns per row). This is how one component definition renders *any number* of data-driven cards — don't hand-author N near-duplicate children for "up to N items"; use a Gallery bound to a real `Table`-typed property instead. |
| `Image@2.2.3` | n/a | Real. `Image` property accepts a literal `data:image/svg+xml,<url-encoded-svg>` string — a real, standard technique for a dependency-free chart/icon with no external asset. Build it with `EncodeUrl(...)`, never raw string concatenation (unescaped `<`, `#`, quotes inside the SVG would break the URI or the YAML). |

**When in doubt about a property this table doesn't cover:** search GitHub for
`"Control: <Type>@<version>"` plus the property name, prefer results from
`pnp/powerplatform-snippets` or a `microsoft/*` repo, and mark the finding
`STRONG EVIDENCE` (not `CONFIRMED`) in whatever file you add it to. If the user
reports a real paste error, that overrides any number of GitHub examples — update
this table and `scripts/validate-yaml.mjs`'s `KNOWN_INVALID_CONTROL_PROPERTIES`
immediately, in the same commit as the fix.

## Real syntax rules

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

## Applying this to the rest of the catalog

Each of the other 27 components needs the same treatment KPI Card got: a real
`Data`-table-driven (where the component is naturally a list — most of them are) or
scalar-property-driven (where it's genuinely a single instance, e.g. a Dialog) shape,
a real `Children:` tree using the control table above, `sampleFormulas.js` entries for
every `Table`/`Record`/`Color` property, and the same verification pipeline. Do them
one at a time, each through the full verification discipline above, rather than
batching many components through steps 1-3 before any of them sees step 4 — the whole
point of this file existing is that steps 1-3 catch syntax and geometry, not every
real Studio compiler quirk, and quirks compound across components faster than they
get caught if verification is deferred.
