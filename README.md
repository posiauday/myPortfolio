# Uday Posia — Portfolio & Enterprise Component Design System

A single-page portfolio for Power Platform / Microsoft 365 delivery work, plus a
browsable design-system reference for dozens of reusable enterprise components
and a verified Power Fx cheat sheet.

Built with **Vite + React 18 + Tailwind CSS**. No animation library, no charting
library — the interface recreations, charts and transitions are plain JSX, inline
SVG and CSS.

## What's in it

| Section | What it does |
| --- | --- |
| **Hero** | Multi-layer parallax backdrop (`useParallaxLayer`), a reveal-on-scroll KPI panel (`useReveal`), and a mouse-tracked 3D tilt + cursor glare + cast shadow on the KPI card itself (`useTilt`). The card's header, stat tiles and chart each sit at their own depth inside the tilt's 3D space, so the whole thing visibly parallaxes as it rotates, and it idly bobs even at rest so it never reads as flat. |
| **Impact strip** | Four stats — years of experience, users under governed delivery, a productivity figure, and the PL-300 cert — pulled together right under the hero rather than left scattered across Experience and Recognition where a skim can miss them. No new claims: every figure here is the same one already stated elsewhere on the page. |
| **Platform** | Microsoft's own official Power Platform product icons orbiting a central hub in two counter-rotating rings — pure CSS, no animation library (see `PlatformOrbit.jsx`). |
| **Projects** (`#projects`) | Seven project showcases in a rail-and-window layout: pick a project from the rail, page through its screens in a window-framed preview. Every project is presented under a generic name and every number shown is synthetic. |
| **Experience** (`#experience`) | An animated career timeline: a gradient rail draws itself in as you scroll past it (`useScrollFill`) with a glowing beam riding the same progress down the rail, each entry fades up into view the first time it's reached (`useRevealEach`), the current role's card traces a rotating border-beam, and every card gets a cursor-tracked spotlight glow (`useSpotlight`). A number ticker counts up the years of experience on scroll-in, and "Show more" expands a card's remaining highlights via a smooth grid-row transition rather than popping open. Real employers, roles and dates, each with a collapsible highlight list. |
| **Components** (`#components`) | The homepage shows 6 curated flagship picks (`FEATURED_IDS`), always — "Browse all {n} components" (both the button text and the count itself computed live from the catalog, not hand-typed) opens the separate Catalog page (`Catalog.jsx`, its own full page, own `#catalog` route) rather than expanding this section in place. A "Copy brand theme YAML" button generates a real Power Apps Studio theme (Themes panel > Add a theme > Paste theme) seeded from the site's own brand green. |
| **Catalog** (`#catalog`) | The full, searchable, category-filtered component grid (28 components as of this writing — see "New components" below), as its own page — search/category state lives here and resets each time it's opened, deliberately not shared with the homepage's fixed featured set. |
| **Component detail** | Per-component page with Preview, Variants, Properties, Events, Architecture, Examples, Accessibility and Limitations tabs, a live property configurator that regenerates the generated YAML (in two schema-conformant forms — see below) as you edit values, copyable docs, and an optional live Power Apps embed. Lives at `#components/<id>` (`useComponentRoute`), so the browser back button closes it and a direct link opens straight to that component — and closing it returns to wherever it was actually opened from, home or Catalog, not always home. |
| **Cheat Sheet** (`#cheatsheet`) | A separate full page (`CheatSheet.jsx`) reached from the same nav row as "All Components": a searchable, category-filtered grid of 93 verified Power Fx formulas (Formulas tab) plus a curated, verified split of real Power Apps problems — ones with a documented fix and ones that are permanent platform constraints with none (Real Issues tab). See "Power Fx Cheat Sheet" below for how it was sourced and verified. |
| **Recognition** (`#recognition`) | Awards, delivery-scale highlights, and certifications — a status pill reads "Certified" (green) or whatever else is in progress (amber). |
| **Skills** | LinkedIn's real skill list with a checkmark on the ones actually endorsed — not composed testimonials, since no written quotes exist to use. |

Dark mode is a class toggle on the page's own `<main>`, which is why
`tailwind.config.js` sets `darkMode: "class"` rather than relying on the media
strategy.

The nav collapses to a hamburger menu below the `md` breakpoint (a dropdown
panel under the pill bar, closes on link click or Escape) — the desktop link
row is genuinely hidden at that width, not just visually tucked away, so this
is the only way to reach a section on a phone without scrolling.

## Social preview

`public/og-image.png` (1200×630, generated from `src/index.css`'s own hero
gradient/mesh treatment plus the six Power Platform icons) is what a shared
link shows in Slack, LinkedIn, iMessage, etc. `index.html`'s `og:image`,
`og:url` and `twitter:image` are hardcoded absolute URLs rather than
root-relative paths — crawlers fetch those directly, so (unlike `href`/`src`,
which Vite rewrites for the configured base path at build time) they have to
already be fully qualified. Update them, and regenerate the image, if the
site ever moves to a different domain or path.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle
npm run lint
npm run test:yaml   # generated component/theme YAML vs. Microsoft's own schema
```

## Project structure

```
src/
  components/
    Portfolio.jsx        page shell: nav, parallax hero, platform orbit, projects, experience, catalog, recognition, footer
    PlatformOrbit.jsx    orbiting Power Platform / M365 badge diagram
    ProjectsSection.jsx  project rail + windowed screen preview for all seven showcases
    ExperienceSection.jsx career timeline with collapsible per-role highlights
    ComponentDetail.jsx  per-component reference page (tabs, YAML, docs, embed)
    ComponentPreview.jsx the small in-page mockup for a single component
    ProjectScreen.jsx    every project screen recreation, switched on slide `kind`
    PowerAppsEmbed.jsx   live runtime embed, with an honest not-connected state
  data/
    componentLibrary.js  categories, icons, per-category defaults, per-component
                         overrides, and the derived component catalog
    projectShowcases.js  the seven projects (under generic names) and their slides
    experience.js        real employers, roles, dates and highlights
    certifications.js    name, code and status ("Certified" / "In Progress") per cert
    skills.js             LinkedIn skill names with their real endorsement count
    platformStack.js     the icons PlatformOrbit renders (name, icon import, ring)
  assets/
    logos/                Microsoft's official Power Platform SVG icons + NOTICE.md
  lib/
    componentDocs.js     YAML + markdown docs generated from the catalog
  hooks/
    useCopyFeedback.js   clipboard write + short-lived "Copied" label
    useReveal.js         one-shot IntersectionObserver reveal
    useRevealEach.js     useReveal for a data-driven list — one ref/observer per item
    useParallaxLayer.js  one hero backdrop layer's scroll transform, written direct to the DOM
    useScrollFill.js     a rail's fill/beam, written direct to the DOM as you scroll past it
    useTilt.js           mouse-tracked 3D tilt + cursor glare for a card
    useComponentRoute.js syncs the open component Detail page with #components/<id>
  config.js              contact details and the Power Apps embed configuration
```

### Adding a component

1. Add a `[title, category, maturity]` row to `raw` in
   `src/data/componentLibrary.js`.
2. Optionally add an entry to `overrides`, keyed by the slugified title
   (`"Calendar"` → `"enterprise-calendar"`), to replace the
   category defaults for `summary`, `properties`, `events`, `architecture`,
   `examples`, `accessibility` or `limitations`.

Everything else — the catalog card, the detail page tabs, the generated
`cmp<Pascal>.yaml` and the copyable markdown docs — is derived from that data,
so the YAML and the Properties/Events tabs can never drift apart.

A component with an `overrides` entry is claiming a real, cross-checked
contract (that's what the "Verified" maturity badge and its YAML status text
both say) — so every field in its override should actually be specific to
that component, not left as an unedited copy of the category default or
another component's own override. A pass over all 11 `overrides` entries
found exactly that gap twice — `responsive-line-chart`'s `examples` was a
verbatim, unedited copy of `baseByCategory.Analytics.examples`, and
`enterprise-mega-menu`'s largely duplicated `enterprise-sidebar`'s — plus
9 of the 11 `overrides` entries had no `accessibility` array at all despite
having bespoke everything else, quietly falling back to the generic
category-level text instead. Both are fixed now; if a future override skips
a field, double-check it isn't accidentally inheriting a sibling's leftover
copy rather than genuinely sharing the category default.

### Bespoke, research-grounded component previews

A real gap, reported directly: every component's catalog entry claimed a
specific contract, but only KPI Card's Preview tab actually
rendered something specific — every other component (Risk Matrix
aside) fell through to the exact same generic "Submitted / In review /
Approved / Operational" status list regardless of whether it was a
calendar, a data table, a file upload or a nav menu. `Variants` had the
same problem one level deeper: every single component, regardless of type,
showed the identical four labels — Standard/Compact/Dark/Mobile — with the
identical four descriptions, which never actually described what a variant
of *that* component would be.

The fix, worked in batches so each one is a reviewable commit rather than
one unreviewable pass through all 25:

1. **Research first.** Before touching a component's contract, check it
   against real Power Apps/PCF prior art — Microsoft's own published
   control reference (`learn.microsoft.com/power-apps/maker/canvas-apps`),
   Dynamics 365's native Timeline control, and published community PCF
   components — rather than inventing plausible-sounding properties from
   scratch. Concretely, this is where `Markers`/`MarkerSuffix`/`YAxisMax`
   on `responsive-line-chart` (renamed from a made-up `ShowPointLabels` to
   match the real Line chart control's own property names) and
   `RecordsToLoad`/`OnLoadMore` on `activity-timeline` (Dynamics 365's own
   Timeline control caps its own "records to load" at 50 for the same
   reason) came from.
2. **Real, component-specific `variants`.** Changed from a flat array of
   generic labels to `[name, description]` tuples per component (see
   `GENERIC_VARIANTS` in `componentLibrary.js` for the not-yet-redone
   fallback, and any of the five components below for what a redone one
   looks like) — `ComponentDetail.jsx`'s Variants tab renders whichever
   the component's own override actually provides.
3. **A bespoke mockup per component**, in `ComponentPreview.jsx` — an
   actual month grid for Calendar, a rail-connected activity
   feed for Activity Timeline, a real smoothed SVG line chart for
   Responsive Line Chart, not a shared placeholder. `src/lib/svgPath.js`
   (Catmull-Rom-to-Bezier smoothing, the same technique
   `ResponsiveLineChart`'s own architecture describes) is shared between
   that chart's mockup and KPI Card's new `ShowSparkline`
   property, so a real, live-editable sparkline replaces the plain
   progress bar when that property is toggled on in the configurator —
   demonstrating the property does something, rather than existing only
   as a Properties-tab row.

**All 25 components are done**, worked in five batches — "Verified" first
since those 11 were already claiming a cross-checked contract, then the
14 "Original" ones: KPI Card, Responsive Line Chart, Deadline Tracker,
Activity Timeline, Calendar; Accordion List, Data Table, File Upload,
Email Composer, Sidebar; Mega Menu, Command Card, Program Scorecard,
Operational Status Banner, Risk Matrix; Project Health Summary,
Milestone Tracker, Decision Log, Dialog, Comments & Mentions;
Responsive Breadcrumbs, Approval Journey, Process Stepper, Route Map,
Loading Screen. Every one now has a real, component-specific `variants` set
and a bespoke Preview mockup — the generic fallback in
`ComponentPreview.jsx` is unreachable code at this point, kept only as a
documented safety net for a future 26th component added without its own
mockup yet, not because anything in the catalog still uses it.

Re-scanned with axe-core (WCAG 2A/2AA + best-practice) across every
component's Preview and Variants tabs, light and dark, after every
change, plus one final full sweep across all 25 once the last batch
landed: zero violations, anywhere, in either mode. Three real contrast
issues were caught and fixed along the way (documented in each batch's
own commit) — every one the same underlying class of bug: a brand,
danger or neutral-gray color used directly as text or as a background
behind white text, without the light/dark-aware treatment
`darken()`/`lighten()` (`src/lib/color.js`) already established
elsewhere on this page.

Two components are worth calling out specifically for how their
grounding turned into a real, concrete addition rather than just
supporting prose:

- **Command Card**'s contract (`Metrics`/`ChartData`) is the
  *actual* contract this site's own hero card already renders on the
  homepage — Health/Active/At risk tiles over an 8-bar activity strip —
  not a separate illustration of a similar idea.
- **Dialog**'s properties (`Title`, `Subtitle`,
  `ConfirmButtonText`, `CancelButtonText`) are named to match Power
  Apps' own built-in `Confirm()` function's real `OptionsRecord`
  exactly, and its one deliberate addition — `ShowCancel` going false
  for a single-button acknowledge dialog — closes a real, documented
  gap: `Confirm()`'s own FAQ states plainly it always shows both
  buttons and can't be reduced to one.

Command Card is worth calling out specifically: its contract
(Metrics/ChartData) is the *actual* contract this site's own hero card on
the homepage already renders — Health/Active/At risk plus the 8-bar
activity strip — not a separate illustration of a similar idea. When a
component in this catalog can be grounded in something this project
itself has already built and shipped, that's stronger grounding than an
external reference.

### Material Design polish pass on the 25 mockups

A follow-up request, once the content of all 25 mockups was real: make
each mockup's own UI itself look like a modern, current design language,
not just its underlying data. Scoped deliberately narrow — the 25
`ComponentPreview.jsx` mockups only, not this site's own brand identity
(the green accent, the custom card/motion language elsewhere on the page
stays as-is), and "ability to change theme" was already satisfied by the
existing dark/light toggle, verified working across all 25 components in
the research-grounding pass above.

Applying Material Design 3 (MD3) meant naming and extending two things
that were already half-present in the codebase rather than starting from
a blank slate:

1. **The "container" color role.** Roughly 15 places in
   `ComponentPreview.jsx` already hand-wrote the same three-line pattern —
   a light tint of a seed color as a badge's background, paired with
   `darken()`/`lighten()` of that same color as its text — which is
   functionally MD3's container role (`primary` → `primaryContainer` /
   `onPrimaryContainer`, one seed color deriving a whole tonal family).
   `container()`/`CONTAINER_TEXT_CLASS` (`src/lib/color.js`) name that
   pattern once instead of leaving it an unlabeled convention repeated by
   hand, and every qualifying call site — Activity Timeline's category
   tag, Accordion List's child-row tag, Data Table's status/priority
   badges, Decision Log's status badge, Route Map's completed-node
   badge — now goes through it. Call sites using a brand color as
   *text only*, with no background tint to pair it with (Command
   Card's metric values, Comments & Mentions' `@mention`, Responsive
   Breadcrumbs' current crumb), correctly kept
   direct `darken()`/`lighten()` calls rather than being forced into a
   role that doesn't apply to them.
2. **Elevation as a real signal, not decoration.** MD3 uses shadow depth
   to say which surfaces are distinct, raised content versus which are
   flat groupings. Added `shadow-sm` to the mockup elements that actually
   represent individual raised cards — Activity Timeline's entries,
   Accordion List's child rows, File Upload's file rows,
   Project Health Summary's dimension tiles, Decision Log's cards,
   Comments & Mentions' comment bubbles, Program Scorecard's metric
   tiles, Command Card's metric tiles and bar-chart panel — and
   `shadow-lg` to Mega Menu's dropdown panel, a floating
   overlay that a plain border alone doesn't read as. Left flat by design
   everywhere elevation would be wrong for what the surface actually is:
   Data Table's rows (a bordered table, not floating cards),
   Calendar's day cells, Operational Status Banner's strips,
   Risk Matrix's heatmap cells, Loading Screen's
   outer frame.

One structural change beyond color and shadow: **Sidebar**'s
active nav item went from a solid brand-color fill with white text to
MD3's tonal "active indicator" — a pill-shaped container tint instead of
a hard-filled rectangle — for consistency with the container pattern used
everywhere else in the catalog, and because a solid-fill active state is
the exact older pattern MD3's navigation components moved away from.

Re-verified after every change: `npm run lint && npm run test:yaml &&
npm run build` clean, then a full axe-core re-scan (WCAG 2A/2AA +
best-practice) across all 25 components in both light and dark —
zero violations, confirming the new shadows and the `container()`
refactor didn't regress any of the contrast fixes from the pass above.

### Closing real gaps against the actual reference controls

After the two passes above (real content, then real visual polish), the
next question was harder to dodge: how many of these 25 contracts still
fall short of what the *real* audience — someone evaluating this catalog
as actual Power Apps component library work — would expect once they
looked past the surface? Answering that meant going back to primary
sources (Microsoft Learn's own canvas control reference, the Creator
Kit's published DetailsList/Nav/Breadcrumb controls, and Power Automate's
own approval action) and diffing this catalog's contracts against them
property by property, not guessing at plausible gaps.

That audit surfaced roughly three dozen real gaps across all 25
components — documented in full where the audit happened, not
duplicated here — prioritized into: (1) the Data Table
cluster, since it's the single highest-value gap and was already
self-flagged with no fix proposed; (2) four components whose own
`variants` array named a variant (Program Scorecard's "Print", Decision
Log's "Print", Project Health Summary's "Trend" and "Narrative",
Route Map's "Swimlane") with no property in that same
component's contract actually able to produce it — an internal
consistency gap worth closing before any external one; (3) the
cross-cutting localization gap, not yet started.

**Batch 1 — Data Table plus the four unwired variants:**

- **Data Table** gained `Sortable`/`CurrentSortColumn`/
  `CurrentSortDirection`/`OnSort` (checked against the real modern Data
  Grid control's own `Sortable` and the Creator Kit DetailsList's
  `ColSortable`/`CurrentSortColumn`), `SelectionMode`/`OnSelectionChange`
  (matching the real Data Grid's `SelectMultiple` and DetailsList's
  `SelectionType`), `Searchable`/`OnSearch` (the real Data Grid's own
  `Searchable`/`SearchText`), `PageSize`/`OnPageChange` (the real
  DetailsList's `PageSize`/`PageNumber`/`HasNextPage` paging contract),
  and `AccessibilityLabel` (present on all three real reference
  controls checked). The Preview mockup now actually shows a search box,
  a sortable column caret, a checkbox column, and a page footer — not
  just new rows in the Properties tab.
- **Program Scorecard** and **Decision Log** each gained `OnExport`,
  backing a "Print" variant that previously had no property behind it
  at all; both mockups now show a real Export action in their preview.
- **Project Health Summary** gained `TrendDirection` (on `Dimensions`)
  and `NarrativeText`, backing its own "Trend" and "Narrative" variants;
  the mockup now shows a real trend arrow per dimension and a narrative
  sentence beneath the grid.
- **Route Map** gained an optional `Lane` field on `Nodes`,
  backing its own "Swimlane" variant; the mockup now groups nodes into
  labeled horizontal bands by lane when the sample data sets one,
  while a `Nodes` table with no `Lane` values still renders the
  original flat row unchanged.

Every new property matches a real control's real name where one exists
(cited above); nothing here was invented to sound plausible. Two real
contrast issues turned up in the new mockup elements during
verification — a disabled "Prev" pager button's light gray text
(1.48:1/1.91:1) and a trend-arrow color pairing that had the light/dark
values swapped from this project's own established safe combo
(2.45:1/2.61:1) — both caught by axe-core and fixed (the pager button
now uses a real `disabled` attribute, which WCAG 1.4.3 itself exempts
from the contrast minimum, rather than relying on low-contrast text to
communicate "unavailable"). Re-scanned clean after both fixes: `npm run
lint && npm run test:yaml && npm run build` clean, zero axe-core
violations across all 5 touched components in light and dark.

**Batch 2 — the Forms/Navigation cluster:**

- **File Upload** gained `MaxAttachmentsText` (matching the
  real canvas Attachments control's own property of the same name) and
  `AllowedExtensions`, giving the type-restriction hint already in this
  component's own Limitations text a real property to bind to. The
  mockup now shows the actual "Maximum files reached" state — a
  meaningfully different illustration than "still room for more,"
  swapped for by a `maxFiles`/`files.length` comparison in the mockup
  rather than a permanently empty-looking dropzone.
- **Email Composer** gained `ShowBcc` (matching the Office 365
  Outlook connector's own Bcc field, distinct from Cc) and
  `Attachments` — the same `Id`/`Name`/`SizeBytes` shape File Upload's
  own staged files already use, closing a real gap *between* two
  components in this same catalog that previously had no way to
  connect. The mockup now shows a real Bcc picker and an attachment
  chip.
- **Sidebar** gained `ItemBadgeCount` (a real precedent: the
  Creator Kit Pivot control's own `ItemCount`, "show an item count on a
  Pivot item link"), `ItemIconColor` (the Creator Kit Nav control's own
  property of the same name), and `InputEvent` for `SetFocus` (the same
  contract the real Nav control documents for restoring keyboard focus
  after a dialog closes). The mockup now shows an "Approvals" item with
  both a custom icon color and a pending-count badge, while Dashboard/
  Reports/Settings carry neither — demonstrating both fields are
  optional and backward-compatible.
- **Responsive Breadcrumbs** gained `ItemClickable` (the real Creator
  Kit Breadcrumb control's own property, for a crumb that shouldn't be
  a link — a parent list this visitor can't open directly, say) and
  `AccessibilityLabel` (present on all three real reference controls
  checked in this pass). The mockup's own "Change Requests" crumb is
  now the non-clickable example.
- **Mega Menu** gained `Searchable`/`OnSearch` (the same
  host-executed-filter pattern Data Table's own `OnSearch`
  already uses), a `Badge` field on `DropdownItems` ("New"/"Beta" on a
  freshly added destination), and `CollapseWidth`/`OnMobileToggle` for
  the top-level bar's own hamburger collapse — a separate, wider
  breakpoint than the dropdown panel's existing ~500px single-column
  collapse. The mockup now shows a real search box and a "New" badge on
  Copilot Studio.

One real contrast issue turned up again in this batch — the same class
of bug as batch 1's trend arrow: Responsive Breadcrumbs' new
non-clickable crumb used `text-slate-400 dark:text-slate-500` (2.56:1/
3.5:1), the light/dark values swapped from this project's own
established safe combo. Fixed by swapping to `text-slate-500
dark:text-slate-400`, the same fix applied last batch. Re-scanned
clean: `npm run lint && npm run test:yaml && npm run build` clean, zero
axe-core violations across all 5 touched components in light and dark.

**Batch 3 — the remaining Data Display components, plus Dialog's own size gap:**

- **Deadline Tracker** gained `TimeZone` (an IANA/Windows zone
  name StartDate is computed in, converted through Power Apps' own
  real `TimeZoneOffset`/`TimeZoneInformation` functions upstream) and
  `ReminderThreshold`/`OnApproachingDue` — the same reminder concept
  Power Automate's own "Start and wait for an approval" action offers
  for an approval nearing its deadline, here as a component event. The
  mockup now shows a real reminder line beneath the countdown.
- **Activity Timeline** gained `SortDirection` (matching the real
  Dynamics 365 Timeline control's own explicit sort toggle, rather
  than an implied fixed order), `PinnedIds`/`OnPin` (the real Timeline
  control's own `msdyn_timelinepin` precedent for keeping a record
  visible through paging and filtering), and `HasLoadError`/
  `OnLoadMoreError` — a real failed-fetch state, distinct from
  `IsLoading`'s normal in-flight one. The mockup now shows a pinned
  entry (rendered first, marked "Pinned") and a real sort toggle.
- **Calendar** gained `TimeZone` (same reasoning as Deadline Tracker),
  a `SeriesId` marker on `Events` for a recurring occurrence, and
  `OnRequestChange` — the accessible, keyboard-reachable alternative
  this read-only calendar offers in place of drag-to-reschedule. The
  mockup now shows a recurring-series icon and a real "Request a
  change" action on today's event.
- **Accordion List** gained `SelectionMode`/`OnSelectionChange`
  (matching Data Table's own multi-select contract) and
  `PageSize`/`OnPageChange` (the same paging contract Data Table and
  the real Creator Kit DetailsList both use), closing the "past the
  low hundreds of groups" ceiling this component's own Limitations
  already named with no fix. The mockup now shows real
  checkboxes and a page indicator.
- **Dialog** gained `Size` (Small/Medium/Large) — the one
  addition in this pass not grounded in a specific Microsoft control
  property, since `Confirm()` has no size concept at all; grounded
  instead in Fluent's own Dialog/Panel components, which do offer this
  exact sizing scale, and in this component's own "Custom content"
  variant needing more room than a one-line message does. The mockup
  now shows the current size as a visible chip above the dialog.

Three real contrast issues turned up in this batch — all the same
swapped-light/dark-combo class of bug as the previous two batches:
Activity Timeline's "Pinned" label, Calendar's "Request a
change" action, and Dialog's "Size: Small" chip (the last of
these against a *different* tinted background than the usual white/near
-black page background, so the fix there was swapping to a
higher-contrast pair — `text-slate-600 dark:text-slate-300` — rather
than the usual `text-slate-500 dark:text-slate-400` swap). Re-scanned
clean: `npm run lint && npm run test:yaml && npm run build` clean, zero
axe-core violations across all 5 touched components in light and dark.

**Batch 4 — the cross-cutting localization gap:** the one item the
research report flagged but deliberately didn't fold into a batch of 5,
since it touches components unevenly rather than as one clean group.
Power Apps has real, documented `Language()`-aware `Text()`/`Value()`
formatting for numbers, dates and currency
(`learn.microsoft.com/power-apps/maker/canvas-apps/global-apps`); none
of the 25 components' contracts mentioned it anywhere.

Added a `Language` property (a BCP-47 tag, e.g. `"de-DE"`) to the 10
components where a locale-sensitive number, date or currency value is
actually central to what the component displays — not to all 25, since
adding it to a pure-navigation or pure-text component like Sidebar or
Responsive Breadcrumbs would be padding, not a real gap closed: KPI
Card, Responsive Line Chart, Command Card, Program Scorecard,
Operational Status Banner, Project Health Summary, Milestone Tracker,
Decision Log, Deadline Tracker, and Calendar (the last two already had
a `TimeZone` property from an earlier batch, so this closes the
localization half of the same underlying gap).

Two different real mechanisms, both stated plainly per component:

- **Host-side pass-through** (most of the 10): the host's own
  `Text(value, format, Language)` call formats a Value/Trend/Target/
  Date string *before* it ever reaches the component — the same
  pattern Power Apps itself uses. The component only ever displays
  whatever string it's handed.
- **Generated inside the component** (Operational Status Banner's
  relative-time text, Calendar's month/weekday names,
  Deadline Tracker's breakdown sentence): there's no single
  formatted value to pass through, since the text is assembled from
  several computed values, so `Language` is used directly by the
  component itself.

Since this is a React site, not a running Power Apps host, the actual
Power Fx `Text()`/`Language()` mechanism can't run here — but its real
JavaScript equivalent can, and does: KPI Card's mockup now
computes its Trend line through `Intl.NumberFormat("de-DE", { style:
"percent" })` (rendering `"12,4 %"`, the real German decimal-comma
convention, not a hand-typed string standing in for one), and
Operational Status Banner's mockup computes its own through
`Intl.RelativeTimeFormat("de-DE")` (rendering `"vor 4 Minuten"`). Both
are labeled in the mockup as exactly what they are — a demonstration of
the mechanism, not a live locale switcher — the same "not every
property is wired to the live configurator" caveat this file's own
header comment already states. The other 8 components get the property
and the documentation, consistent with how ShowSparkline is the one
demonstrated wiring for a pattern several components reference rather
than each reimplementing its own copy.

Explicitly out of scope, stated in each affected component's own
Limitations: `Language` formats the locale-sensitive value itself, not
arbitrary host-supplied text — a component's `Label`, `Status`,
`Message`, or a `Channels`/`Holidays` table's own text values stay
whatever language the host's data already contains, which is a
separate, host-owned translation table, the same pattern Power Apps'
own global-apps guidance documents for translated strings.

Verified: `npm run lint && npm run test:yaml && npm run build` clean.
axe-core scanned clean on both components with an actual mockup change
(KPI Card, Operational Status Banner), light and dark, plus a
final full sweep across all 25 components — zero violations anywhere,
confirming this batch didn't regress anything from the three batches
before it. Playwright screenshots confirm both `Intl`-driven demo lines
render the real German-formatted strings.

**Batch 5 — the remaining 5 untouched components:** the last of the
gap-research report's findings — the components that had never been
touched by any of the previous four batches, rather than gaps within an
already-updated one.

- **Risk Matrix** gained `Searchable`/`OnSearch` (the same
  host-executed-filter pattern Data Table's own `OnSearch`
  uses) and `OnExport`, plus an optional per-risk `TrendDirection`
  field. Preview now shows a real search box and Export action above
  the grid.
- **Comments & Mentions** gained `AllowReactions`/`OnReact` (Teams' own
  comment surfaces support emoji reactions), `AllowReply`/`ParentId`
  for one level of threading, and `OnEdit` gated to a visitor's own
  comments. Preview now shows a real reaction pill, an "edited" marker,
  and a nested reply.
- **Approval Journey** gained `DueDate`/`ReminderDays`/`OnApproachingDue`
  (the same reminder concept Power Automate's own approval action
  offers near a deadline) and `DelegatedTo`/`OnDelegate`. Preview shows
  a due date on the pending stage and a delegate arrow on the locked one.
- **Process Stepper** gained `CanAdvance` (closing the gap where
  the component had no shared signal for "this step isn't done yet")
  and `ResumeKey`/`OnResume` for a wizard resumed after being abandoned
  mid-flow. Preview shows a real disabled Next button with the stated
  reason.
- **Loading Screen** gained `HasError`/`ErrorMessage`/
  `OnRetry` (a real failed-load state, distinct from the success-path
  `Progress` value) and `EstimatedSecondsRemaining`. Preview shows both
  the in-flight state with an ETA and the error/retry state side by side.

Verified: `npm run lint && npm run test:yaml && npm run build` clean.
axe-core scanned clean across all 5 touched components in light and
dark, plus a final full sweep across all 25 — zero violations. Playwright
screenshots confirm the visual result for all 5.

### Examples tab: real content instead of one repeated sentence

A separate, unrelated finding while reviewing the Detail page's own
tabs: the **Examples** tab's three cards, on every single one of the
25 components, all rendered the exact same hardcoded sentence — "Use
the property contract while the host app owns data access, security
and persistence" — regardless of which example or which component it
was. 75 rendered cards, one sentence, none of them saying anything
about the specific scenario named above it. Every other tab (Variants,
Properties, Events, Architecture, Accessibility, Limitations) already
carried real, bespoke, per-component text from the passes documented
above; Examples was the one tab still showing this project's own
oldest, unaddressed placeholder.

Fixed the same way `variants` was fixed earlier in this project: the
`examples` field changed shape from a flat array of three name strings
to `[name, description]` tuples, and `ComponentDetail.jsx`'s Examples
tab now renders each real description instead of the shared generic
line. Wrote a genuine, specific description for all 75 examples across
the 25 components — naming the actual property values, states, or
variant that example scenario would set (e.g. KPI Card's
"At-risk projects" example: "Status set to a warning tone and Trend
rising, so the color and the text say the same thing without a second
glance") — plus the 8 unreachable `baseByCategory` fallback entries,
kept in sync with the same shape for a future 26th component added
without its own override yet.

No other tab needed removing or restructuring: Preview, Variants,
Properties, Events, Architecture, Accessibility and Limitations were
all already carrying real, component-specific content from the
research-grounding and gap-closing passes earlier in this project —
Examples was the one exception, not a sign the tab itself didn't
belong.

Verified: `npm run lint && npm run test:yaml && npm run build` clean.
axe-core scanned the Examples tab specifically across all 25
components, light and dark — zero violations, confirming the tuple
shape change didn't introduce any rendering issue. Playwright
screenshots confirm the real per-example text renders correctly.

### Card thumbnails are the real component preview, and one less exit button

Two more findings from actually looking at the Catalog page (and the
homepage's featured grid, which shares the same card) on a phone: every
card's thumbnail was the same generic icon-and-progress-bar mockup,
identical across all 25 components — none of the bespoke, research-grounded
`ComponentPreview.jsx` mockups built during the gap-closing passes above
ever reached the card itself, only the Detail page's own Preview tab did.
Separately, the Catalog header carried two buttons that both called the
same `onBack` handler — a left "← Home" and a right "✕" — which on a
narrow screen crowded out the "All components" title between them (it was
hidden below `sm:`) and, even where it fit, gave no reason for two
identically-acting exits.

**Card thumbnail.** `ComponentCard.jsx` now renders the same
`ComponentPreview` component the Detail page's Preview tab uses, scaled
down (`scale-[0.42]`, `origin-top`, absolutely positioned inside a fixed,
`overflow-hidden` frame) so each card shows that exact component's own
mockup — the KPI number and trend arrow, the line chart, the RAG scorecard
grid, the status banner strips, the risk heatmap — instead of one shared
placeholder. Fixed top-anchored scaling was a deliberate choice over
centering: a tall mockup (Calendar's full month grid, say) now
crops predictably from the bottom instead of being centered and clipped
unpredictably depending on its unscaled height.

Reusing `ComponentPreview` here raised a real constraint: the card itself
is one clickable `<button>`, and the thumbnail sits inside it purely as
decoration (`aria-hidden="true"`, `pointer-events-none`). Several of
`ComponentPreview`'s own mockups contain their own illustrative
`<button>` elements (a sort toggle, a pager, a "Retry" action, none of
them wired to anything in this context) — nested inside the card's real
button, that's both invalid HTML (interactive content isn't allowed
inside a `<button>`) and a real accessibility violation (a focusable
control left inside `aria-hidden` content, flagged by axe-core's
`aria-hidden-focus` rule). `ComponentPreview` now takes an `interactive`
prop, default `true`, that swaps every one of its 8 illustrative buttons
for a plain `<span>` when `false`; the Detail page's own Preview tab
never sets it and is unaffected. One of those eight — Data Table's
"Prev" pager — relied on a real `disabled` attribute for its
low-contrast text to pass WCAG 1.4.3's exemption for genuinely-disabled
controls; a `<span disabled="">` doesn't carry that same semantic
weight, so as a thumbnail it uses the same accessible tone already used
for "Next" instead.

**Redundant exit.** `Catalog.jsx`'s header now has a single "← Home"
button; the right-side "✕" is gone, and "All components" is no longer
hidden below `sm:` since nothing on the right competes with it anymore.
This is unlike `ComponentDetail.jsx`, where a right-side "✕" legitimately
coexists with a separate Prev/Next pair of component-navigation buttons —
here it was two controls doing the exact same thing on an otherwise-empty
bar.

Verified: `npm run lint && npm run build && npm run test:yaml` clean.
axe-core scanned the Catalog page and the homepage's featured grid, light
and dark — the `interactive` prop swap surfaced the one contrast
regression described above, fixed, then rescanned clean. Re-ran the full
25-component sweep against the Detail page's own Preview tab (still
`interactive`'s default `true`) — zero violations, confirming the prop
didn't change that page's behavior. Playwright screenshots on a mobile
viewport confirm a single "← Home" button with "All components" visible
next to it, and a desktop grid confirms multiple cards are now visually
distinct from one another.

### Variants tab: real rendered variants, not four description cards

A comparison against a real, published Power Apps component (a Line Chart
whose own YAML genuinely self-renders — a single `Image` control whose
`Image` property is a Power Fx formula that builds an SVG data URI, so
pasting it into Studio actually draws a chart with no host code at all)
surfaced two honest findings. First, this project's own generated YAML
(`buildComponentYaml`) emits `CustomProperties` only, with no `Children` —
a real, schema-valid property/event contract, but not self-rendering;
paste it into Studio and the property panel is right, but nothing draws
itself. Rebuilding every component's YAML into genuinely executable,
formula-generated visuals to match would be a different, much larger kind
of engineering (hand-authoring nested Power Fx string formulas per
component) than this project has done — a real option, but a separate
decision from the one actually asked for here. Second, and the one this
pass fixes: the Detail page's own **Variants** tab rendered each of a
component's 4 (5 for KPI Card) listed presentation modes as a
numbered card with a name and a sentence — real, specific text from
earlier in this project, but no actual visual, on a tab whose entire
purpose is showing what each variant *looks like*.

`ComponentPreview.jsx` gains a `variant` prop (default `null`) that each
component's mockup now reads to render that one named variant for real —
Responsive Line Chart's "Sparkline" actually draws a smaller, axis-less
line; "Dashed forecast" draws a solid actual segment continuing into a
genuinely dashed, unfilled one; Calendar's four variants are
four structurally different views (a month grid, a 7-day week strip, a
flat chronological agenda, a tiny read-only mini-grid) instead of one
view with a caption; Dialog's four variants are four different
real dialogs (a neutral Confirm, a single-button Acknowledge-only, a
red-styled Destructive delete, and a wider Custom-content form);
Loading Screen's four are an indeterminate spinner, the progress bar,
a full-bleed branded splash, and content-shaped skeleton blocks. All 25
components' mockups were extended this way — every one of their variants
(101 total across the catalog) now renders a genuine, distinct visual
rather than only being described next to one.

`null` (and, for every component, its first-listed variant name — almost
always "Standard" or the base layout) both fall through to the same
default render already used everywhere else, so neither the Preview tab
nor the Catalog/homepage card thumbnail — neither of which pass `variant`
— changed behavior at all.

Building this out surfaced a handful of real, pre-existing mismatches
between a variant's own written description and what the *default*
mockup actually showed, independent of the new variant-rendering work,
and fixed them in the same pass: Project Health Summary's trend arrows
and narrative sentence were both always visible regardless of variant,
when TrendDirection and NarrativeText are each one specific variant's own
addition; Route Map's default mockup showed the swimlane-grouped
layout even though "Linear" (a flat sequence with no lanes) is the
catalog's first-listed variant for it; Responsive Breadcrumbs' default
showed a collapsed "…" trail when "Full trail" (every level, nothing
collapsed) is listed first; Dialog's Confirm button was always
styled in the danger red that's actually Destructive's own defining
difference from a neutral Confirm(). Each is now correct for its actual
variant.

The `ComponentDetail.jsx` side of this reuses the same scaled-thumbnail
technique `ComponentCard.jsx` established for the Catalog: each variant
card embeds a real, cropped, `interactive={false}` render of that
variant at `scale-[0.42]`, aria-hidden since the adjacent name and
description already carry the accessible content.

Verified: `npm run lint && npm run build && npm run test:yaml` clean.
axe-core scanned all 25 components' Variants tabs, light and dark —
caught 15 real violations across 8 components (several instances of this
project's own recurring swapped-light/dark-contrast-pair bug, a CSS
`opacity` wrapper silently dragging already-modest text below the
contrast minimum on two different "disabled/locked" states, and a few
new colors that simply hadn't been checked against their backgrounds
yet). Fixed each and rescanned clean, then re-ran the full 25-component
sweep against the Preview tab and the Catalog/homepage card grid to
confirm the `variant` prop's `null` default path was untouched — zero
violations. Playwright screenshots across five components (light and
dark) confirm each shows four genuinely distinct renders matching its
own description.

### Accordion List: closing gaps against a real reference component

A second real, published Power Apps component — this one a genuinely
self-rendering accordion list built from composed native controls
(`GroupContainer`, `Gallery`, `ModernButton`, `ModernText` with ordinary
property bindings) rather than an SVG-formula hack — surfaced concrete
gaps in this project's own Accordion List, closed in this pass at
the documented-contract level (Properties/Events/Architecture/
Accessibility/Limitations plus the mockup), not the generated-YAML
architecture:

- **`ActionKey`/`ActionRowType`** as real, named output properties — the
  Properties tab previously only *described* "OnMoveUp returns the row's
  key" in prose, with no actual property backing that claim. Now one
  shared pair, read inside any of the four action events.
- **`ExpandedGroupKey`/`IsExpandAll`/`GroupCount`/`ItemCount`/
  `SelectedItemKey`** as read-only outputs a host can actually bind to,
  where none existed before.
- **Per-row `Locked`** on `Groups`/`Items` — hides that one row's own
  action cluster entirely, a distinct signal from a disabled button
  (which still shows the action exists, just not right now).
- **Move up/down self-disabling at each row's own scope boundary** — the
  first group can't move up, the last can't move down, computed once
  rather than left for each button instance to guess and risk
  disagreeing with its neighbor.

The mockup now shows all three states in one small illustration: an
edge-disabled Move up on the first group, a Locked group with its action
cluster replaced by a "🔒 Locked" chip instead of hidden buttons, an
edge-disabled Move down on the last, and a header "Expand all" toggle
for `Config.ShowExpandAll`. The two new Move buttons needed the same
`interactive`-aware disabled-contrast treatment Data Table's
Prev pager already established (a real `disabled` attribute rides WCAG
1.4.3's exemption only while `Btn` is actually a `<button>`; as a card
thumbnail's `<span disabled="">` it isn't, so the color falls back to
the same accessible tone used when the button is enabled).

Five of the new output properties are `Number`-typed; the schema
validator (`npm run test:yaml`) correctly rejected an initial attempt to
default them to the text placeholders `"Blank"`/`"Computed"` — a
`DataType: Number` property's `Default` has to be a bare numeric
literal or Studio's own parser would reject it on paste. Fixed by
following this catalog's own existing precedent (`HighlightIndex`'s
`-1`): a real numeric sentinel (`0`, the same "nothing yet" value
`ExpandedGroupKey` already uses for "nothing expanded"), with the
sentinel's meaning stated in the property's own description rather than
in the default value itself.

Deliberately not pursued in this pass: rewriting Accordion List's
generated YAML into an actual self-rendering `Children` tree matching
the reference's own architecture. Unlike the Line Chart comparison
above, this one's reference proves that's a real, achievable target for
a list/table-shaped component (composed controls, not a string-built
SVG) — a legitimate next step, but a separate decision from closing the
documented contract gaps this pass addressed.

Verified: `npm run lint && npm run build && npm run test:yaml` clean.
axe-core scanned Accordion List's Preview, Variants and
Properties tabs, light and dark — clean — plus a full 25-component
Variants-tab resweep confirming no regression elsewhere.

### Three real Power Apps gotchas, checked against this project

A broader look at PowerAppsUI's own catalog page and its Activity
Timeline component's public comment thread — real developers hitting
real problems, not marketing copy — surfaced three platform behaviors
worth checking this project's own claims against, beyond the two
component-specific comparisons above:

1. **YAML-imported components look incomplete in Studio until F5.** A
   real, repeated point of confusion in that thread (three separate
   people asked about it) — Studio's own editor doesn't fully evaluate
   nested gallery templates until a preview cycle, so a pasted instance
   can look broken right up until then. This project's own install
   instructions already said "Press F5 to preview either way" but never
   said why; that line now states the real reason, so it reads as an
   explained platform behavior instead of an unexplained ritual step.
2. **AutoLayout containers can silently zero out their width** when a
   component is first dropped onto a screen, especially inside a parent
   that also has AutoLayout enabled — a real, named Canvas Apps quirk,
   not user error, per that thread's own troubleshooting exchange. This
   project's own generated YAML has no `Children` tree yet (see the
   Line Chart and Accordion List comparisons above), so it isn't
   something today's output can hit — but it's exactly the kind of
   gotcha whoever eventually builds a real `Children` tree for one of
   these components (Accordion List's own `GroupContainer`-based
   reference, for instance) needs to know about, so it's recorded here
   rather than only in a private note.
3. **Gallery cards must grow to fit content, never clip it.** The
   Activity Timeline thread's single functional bug report was a fixed
   card height truncating a long comment; the fix made every card
   height a stated minimum instead. Checked this project's own Activity
   Timeline against the same failure mode: `CardHeight`'s description
   already reads "Minimum card height; cards grow past it to fit their
   content" — independently correct before this research, not a change
   made because of it.

No code changed for points 2 and 3; point 1's install caption is the
one real edit, in `ComponentDetail.jsx`.

Verified: `npm run lint && npm run build` clean.

### Calendar: recurring-event edit scope

The one concrete workflow gap the same research turned up: PowerAppsUI's
own catalog lists an Event Form component under its own "Coming Soon"
section — not a shipped component with a real, documented contract, but
a blurred preview mockup behind that badge, with only a name and a
one-line description rendered as real (unblurred) text. That line
states the card's own intended defining feature: editing a calendar
event's recurrence with the standard this-event / this-and-following /
all-events scope choice — the same choice Outlook's own recurring-event
edit dialog already offers today, for real. Outlook's own dialog, not
Event Form's own unbuilt status, is what this project actually verified
and built against — the same distinction `componentLibrary.js`'s own
`RequestedScope` property and architecture notes already draw, citing
only Outlook by name. This project's Calendar already marks
a recurring chip via `SeriesId` and offers `OnRequestChange` as its
read-only calendar's accessible escape hatch for asking to change
something — but the event never asked *which* occurrences a change
should apply to, so a host had no way to build that Outlook-familiar
flow.

Closed as a property and event addition to the existing component, not
a new one, matching Calendar's own established scope
(computes and reports, never mutates): a new `RequestedScope` output
property (`"This event"`, `"This and following"`, `"All events in the
series"`, or blank for a non-recurring occurrence, since there's
nothing to scope). `OnRequestChange`'s own description now states that
for an occurrence carrying a `SeriesId`, the component asks which
occurrences first — three small, individually-labeled buttons under
that occurrence's own "Request a change" action — before firing, while
a non-recurring occurrence still fires straight through exactly as
before. Architecture and Limitations both restate this catalog's
existing component-computes-host-decides split explicitly for the new
property: Calendar's job stops at asking and reporting the
scope choice; applying an edit across however many materialized rows
that scope implies is entirely the host's own job, the same as
`OnRequestChange` always was.

The mockup now shows both paths side by side in one illustration:
"Sprint review" (the sample data's own recurring occurrence) shows
"Request a change" plus the three scope buttons already expanded;
"Release" (today's own non-recurring occurrence) shows only the plain
action with no scope buttons at all, so the contrast between the two
is visible rather than only described.

Verified: `npm run lint && npm run build && npm run test:yaml` clean.
axe-core scanned Calendar's Preview, Variants and Properties
tabs, light and dark — clean — plus a full 25-component Variants-tab
resweep confirming no regression elsewhere.

### Calendar: three gaps against a real, self-rendering reference

A third real Power Apps component — a genuinely self-rendering
"Calendar Pro" built from a full `Children` tree (AutoLayout
`GroupContainer`s, a 6-row-always month `Gallery`, a week/hour-grid
view, an agenda view, a day-overflow peek modal, and a computed 3-year
US federal holiday table) rather than a contract-only description —
surfaced three more concrete, closeable gaps in this catalog's own
Calendar. Everything else in that reference (the actual
`Children` tree itself, its `_`-prefixed internal Output workarounds,
the peek-modal implementation) is architecture, not contract, and was
deliberately not pursued here — the same "closes the documented
contract, doesn't rewrite the architecture" call already made for
Accordion List:

- **`Config.ShowWeekNumbers`** — Month view now draws each row's own
  ISO-8601 week number down the left edge when this toggle is on,
  computed inside the component from `FocusDate` the same way month
  and weekday names already are, matching Calendar Pro's own
  always-6-row month grid exactly.
- **Week view documented as what it actually needs to be** — the
  contract previously just said "more per-day room for chips"; it now
  says what `Config`'s own work-hours values were always for: Week view
  renders as a real hour-by-hour grid across its seven columns,
  windowed by that range, the same real gap Calendar Pro's own
  week/hour-grid view surfaced.
- **A new `Holidays` property** — `Config` already promised "holiday
  tinting" with no data source behind it. Rather than compute a US
  federal holiday table internally the way Calendar Pro does (which
  would silently assume one specific country's calendar for every
  host), `Holidays` follows the exact same materialize-upstream pattern
  `Events` and `Channels` already use: the host supplies `Date`/`Name`
  rows, blank shows no tinting at all, and a holiday is always paired
  with its own `Name` as visible text on the cell, never color alone.

The mockup shows all three together: the month grid's own week-number
column, Founders Day tinted and named in the legend below the grid
(a stand-in `Holidays` row), and the Week view thumbnail rebuilt as an
actual hour grid with the Release event placed in its real hour slot
instead of a plain per-day chip list.

Two of the three additions initially failed axe-core's color-contrast
check — the week-number/hour labels used a paler slate shade than the
existing month-header row's own proven-safe one, and the Week view's
"today" column label colored its text directly with the component's
own accent color rather than going through this catalog's established
`darken()`/`lighten()` `CONTAINER_TEXT_CLASS` pairing (the same fix
Range Slider's zone label needed earlier). Both fixed and
rescanned clean.

Verified: `npm run lint && npm run build && npm run test:yaml` clean
(28 components, unchanged). axe-core scanned Calendar's
Preview, Variants and Properties tabs, light and dark — clean after the
contrast fix — plus a full 28-component Preview+Variants-tab resweep
confirming no regression elsewhere.

### A fourth real gotcha: a Record property's Default doesn't survive a paste

The same Calendar Pro reference page that surfaced the three gaps above
also documents its own "After you paste" checklist — real, specific
platform behavior for anyone who's just pasted a screen instance of a
YAML-imported component, not marketing copy. One line in it is a real
gap in what this project told people until now: **fill every `Config`
key, including the ones left at their defaults — a Record-typed
property's own authored Default does not reach a pasted instance.**
Unlike a `Text` or `Number` property, whose Default really does carry
onto a pasted instance, a `Record`-typed one (`Config`, on every
component in this catalog that has one — Calendar,
Accordion List, Deadline Tracker) only applies its Default
inside this project's own live preview and the generated definition
YAML; paste a screen instance of the real component and every `Config`
key needs to be set by hand, or the instance renders with an empty
record instead of the described default.

The install caption under **Copy YAML** / **Copy as screen control**
now states this, but only for a component that actually has a
`Record`-typed property — derived from `item.properties` at render
time (`item.properties.find(p => p[1] === "Record")`) rather than a
blanket sentence every component pays for whether or not it applies,
the same reasoning behind every other conditional caption already on
this page.

Verified: `npm run lint && npm run build` clean.

### New components: closing a real category gap (25 → 28)

The same PowerAppsUI research that produced the two gap-closing passes
and the three platform-gotcha notes above also turned up a category
this catalog had no coverage of at all: no range input beyond a single
Number field, no side-panel/overlay pattern besides one fixed-size
dialog, and no transient-feedback component — the exact shape of
several items on PowerAppsUI's own "Coming Soon" list (a Slider, a
Bottom/Side Sheet, a Snackbar), meaning they haven't built these
either.

Rather than copy their coming-soon list directly (most of it —
Bottom Nav, FAB, Top App Bar — is Material Design mobile-app-shell
chrome, a real pattern family but not this catalog's own PMO/governance
desktop-dashboard shape), three components were chosen and each grounded
in a real, named Microsoft reference rather than invented from scratch,
the same "Verified" bar every cross-checked component in this catalog
already holds to:

- **Range Slider** — the real modern Slider control's own
  `Default`/`Min`/`Max`/`Value`/`OnChange` contract (including the
  control's own recent split of `Default`, the initial value, from
  `Value`, a dedicated read-only output — adopted here exactly), plus
  named, colored `Zones` (a governance addition the bare native control
  has no concept of at all) so a budget-utilization or risk-appetite
  slider reads its own "On track / Watch / Over" state without the
  visitor doing the math themselves.
- **Detail Panel** — modeled directly on the real Microsoft
  Creator Kit Panel control, which itself documents mimicking Fluent
  UI's own Panel: `Title`/`Subtitle`/`Position`/`DialogWidth`/`Buttons`
  (a table of `{Label, ButtonType}` rows, `Standard` or `Primary`) and
  the four `ContentX`/`ContentY`/`ContentWidth`/`ContentHeight`
  properties a host's own container binds to for placing arbitrary
  content inside the panel — all real, matched property-for-property.
  One addition beyond that reference, `IsLightDismiss`, is called out
  explicitly in both Architecture and Limitations as grounded in the
  wider Fluent ecosystem's own real `isLightDismiss` pattern rather than
  the Creator Kit Panel's own specific documented properties — the same
  honesty this catalog already applies to Dialog's own `Size`
  property.
- **Toast** — reuses Power Fx's own real `Notify()`
  function's contract directly (`NotificationType`'s real four-value
  enum, the same 500-character message limit, the same real 10-second
  default timeout) and Dataverse's own real `appnotification` table's
  `Priority` column, as a real, themeable, positionable, actionable
  component — the Material Design "Undo" snackbar pattern `Notify()`
  itself has no equivalent for, never a replacement for `Notify()`
  inside the same app.

Each ships with the full contract this catalog holds every component
to — Properties, Events, Architecture, Examples, Accessibility,
Limitations, and four real rendered Variants apiece (not text-only
description cards, per the Variants-tab rework earlier in this
document) — plus a bespoke `ComponentPreview.jsx` mockup for the base
render and every variant, the same as all 25 components before them.

Verified: `npm run lint && npm run build && npm run test:yaml` clean —
28 components now pass schema conformance. axe-core scanned all three
new components' Preview, Variants and Properties tabs, light and dark;
caught one real contrast bug on first pass (the Zone label's text used
the raw zone color directly instead of this catalog's own established
`darken()`/`lighten()` `CONTAINER_TEXT_CLASS` pairing, failing in dark
mode), fixed and rescanned clean. Then re-ran the full sweep across all
28 components' Variants tabs and all 28 components' Preview tabs plus
the Catalog/homepage card grid — zero violations anywhere, confirming
the three new components integrate cleanly with the existing 25 and
nothing regressed. The two hardcoded "25 component[s]" mentions that
described current UI state (not past-tense project history) were
updated to reflect the real count — `Catalog.jsx`'s own header text and
count were already computed live from the catalog and needed no change,
only a stale doc comment and two README lines describing them did.

### Power Fx Cheat Sheet

A fourth PowerAppsUI reference, submitted as a print-to-PDF export of its
own real "Power Fx Cheat Sheet" quick-reference page, became a separate
full page on this site (`CheatSheet.jsx`, `#cheatsheet`) rather than
another catalog entry — a formula reference isn't a component.

The PDF itself was a genuine extraction challenge before it was a content
one: `pdfinfo` showed a single 440×14,400pt page (an iOS Safari
print-to-PDF of a long scrolling mobile-width capture), and its own code
blocks had hard-wrapped mid-token as a result — `DateAdd(Today(), -30,
TimeUn` and dozens like it. Every one of the 93 formulas that made it
into this site's own cheat sheet was reconstructed from that wrapped
text and then independently checked against Microsoft's own Power Fx
reference docs, not re-typed from a guess at what the wrap probably
meant:

- **Delegation badges verified, not assumed.** `GroupBy`/`Distinct` are
  confirmed permanently non-delegable on every data source (named
  explicitly in Microsoft's own delegation overview); `AddColumns`'
  own output stays capped at the non-delegation row limit even when the
  `Filter` passed into it as an argument would otherwise delegate —
  the source's own "NOT DELEGABLE" badges on all three held up.
- **A real, load-bearing correction: `SaveData`/`LoadData` don't run in
  a browser at all.** Not a 1MB cap being hit — Microsoft's own function
  reference states outright that these two functions can't be used
  inside Power Apps Studio or a web browser, full stop. An app authored
  and only ever tested in the browser can ship with an offline feature
  that has literally never once executed. This became the standout
  entry in the new Real Issues tab's "no real fix" half.
- **One planned issue turned out to be wrong, and was dropped.** Before
  checking, `App.Formulas` named formulas were assumed to be unable to
  depend on control properties. Microsoft's own docs say the opposite
  — they can, and stay reactive as those properties change; the two
  real constraints are no behavior functions/side effects and no
  circular reference. Verifying before publishing caught this before
  it became a wrong "no fix" entry on the page.
- **The "Users & Profiles" category was cut short in the source
  capture** at its very first card. Rather than leave the category at
  one entry or invent the rest, it was rounded out to a real six using
  additional verified Office 365 Users connector patterns
  (`MyProfile()`, `Manager()`, `DirectReports()`, `SearchUserV2()`) —
  labeled in the data file's own header comment as an addition beyond
  what the source itself contained, the same honesty this catalog
  already applies whenever a component's own contract goes beyond its
  cited reference.

A second, brainstormed pass (not from the PDF) produced the Real Issues
tab itself: six genuinely common Power Apps problems with a documented
fix (a non-delegable query's silent 500/2,000-row truncation, `ParseJSON`
needing explicit `Text()`/`Value()`/`Boolean()` coercion, `Patch` to a
SharePoint Choice/Person column needing the right record shape, a
circular named formula, and this project's own already-verified
component-`Record`-property-Default-doesn't-survive-a-paste finding
from the Calendar Pro work above) and three that are permanent platform
constraints with none (`SaveData`/`LoadData` in a browser; SharePoint's
own 5,000-item list view threshold, enforced by SharePoint itself and
not raisable by a tenant admin; and non-delegable functions' fundamental
inability to see past whatever was actually cached locally). Every
entry cites its real source.

axe-core caught two real issues on first pass, both fixed and rescanned
clean: every formula's code block needed `tabIndex={0}` for keyboard
scroll access once a long line genuinely overflowed its card (WCAG's
`scrollable-region-focusable` rule — the existing `.code-panel` class
elsewhere on this site had simply never hit a line long enough to
trigger it before), and the Real Issues cards' source citation used the
same too-pale `text-slate-400 dark:text-slate-500` contrast mistake
already caught and fixed on Calendar earlier in this pass —
swapped to the proven-safe `text-slate-500 dark:text-slate-400` pairing
used everywhere else on this site.

Verified: `npm run lint && npm run build && npm run test:yaml` clean.
axe-core scanned the Cheat Sheet page in both Formulas and Real Issues
modes, with an active search and an active category filter, light and
dark — clean after the two fixes — plus a full 28-component
Preview+Variants-tab resweep confirming no regression elsewhere.

### YAML schema conformance

Every component gets two generated YAML outputs (`src/lib/componentDocs.js`):
a **component definition** (`buildComponentYaml` — `ComponentDefinitions` /
`CustomProperties`, for Studio's Components pane > New component > Import
from code) and a **screen control instance** of it (`buildScreenControlYaml`
— `Control: cmp<Name>` / `Properties`, for pasting straight into a screen's
tree view once the component already exists). Both are matched key-for-key
and enum-for-enum against Microsoft's own published schema for Power Apps
source YAML
([`pa.schema.yaml`](https://github.com/microsoft/PowerApps-Tooling/blob/master/schemas/pa-yaml/v3.0/pa.schema.yaml)),
not guessed from how other component-library sites happen to render theirs.

`npm run test:yaml` (`scripts/validate-yaml.mjs`, wired into CI) parses every
generated YAML string with a real YAML parser and checks it against that
schema's actual enum values and key names. It exists because two real
mistakes shipped silently before it did, both only caught by fetching
Microsoft's schema and diffing this project's output against it by hand:

- `DataType: String` — the schema's real enum value is `Text`, not `String`.
- Every property default was wrapped as a quoted text literal, even for
  `Number`/`Boolean` properties, which Power Fx would type-error on. A
  `Number` or `Boolean` default that looks like a genuine literal (a bare
  numeric string, or exactly `"true"`/`"false"`) is now emitted unquoted, as
  a real Power Fx literal; everything else — including this catalog's many
  defaults that are documentation shorthand rather than literal formulas,
  like `"Sample entries"` or `"US federal default"` — is emitted as a quoted
  text literal, which is always valid Power Fx even when it's standing in
  for a longer description than that data type would ever really hold.

A third bug came from the validator itself catching its own fix: the
multi-line block scalar used for any default containing a bare `#` or `:`
(both banned in a single-line Power Fx-in-YAML formula, per Microsoft's own
[YAML formula grammar](https://learn.microsoft.com/power-platform/power-fx/yaml-formula-grammar))
originally used plain `|`, which keeps one trailing newline stuck to the end
of the parsed value. Switched to `|-` (strip chomping) once the validator's
own YAML parse turned up the stray `\n`.

`src/lib/themeYaml.js` generates a fourth, unrelated YAML shape — a real
Studio Theme (`Theme Name` / `Font` / `BasePaletteColor` / `HueTorsion` /
`Vibrancy` / `ColorOverrides`, pasteable into Studio's own Themes panel),
seeded from this site's brand green rather than its own web font (a theme's
font has to already exist in whatever environment it's pasted into, and this
site's own "Inter" isn't guaranteed to be there the way "Segoe UI" is).

None of this can launch Power Apps Studio itself to confirm a real paste
succeeds — short of that, schema-conformant real YAML parsing is the
strongest available check.

### Live property configurator

The component detail page's "Configure" panel (next to the mockup, on the
Preview tab) renders one input per property — a checkbox-styled toggle for
`Boolean`, a number input for `Number`, text for everything else — seeded
from that property's catalog default. Editing a value re-renders both
generated YAML panels (`buildComponentYaml`/`buildScreenControlYaml` both
take an optional `valueOverrides` map, name → live value, falling back to
the catalog default for anything not touched) through the exact same
formatting rules the schema-conformance check enforces — a `Number` typed as
`"12.4"` stays a bare Power Fx literal, everything else gets quoted as text.

This does **not** mean every component's mockup visually reacts to its own
properties — `ComponentPreview.jsx` is a small, mostly generic illustration,
and only KPI Card's mockup is actually wired to read
`Label`/`Value`/`Trend`/`Status` from the live values. Wiring every
component's own bespoke rendering to its own properties would mean
hand-authoring a real renderer per component rather than a documentation
mockup; the panel says so explicitly rather than implying more visual
fidelity than it has. The generated YAML, unlike the mockup, is accurate for
every property on every component regardless.

`Detail` resets the configurator's edited values on `item.id` change — worth
keeping given the page doesn't always remount between components: closing
back to the catalog and reopening a different one does remount it, but a
direct hash navigation from one `#components/<id>` straight to another swaps
`item` on the same mounted instance, and without the reset an edited value
would silently carry over and describe the wrong component's YAML.

### Component detail routing

`useComponentRoute` is a small three-view router — homepage, the Catalog
page, or a component's Detail page — kept as one state machine rather than
three independent pieces of state. That's a deliberate choice, not just
tidiness: `history.pushState` (used throughout, over assigning
`location.hash =`, for the reason below) never fires a `popstate` event, so
a pushState call made inside one hook has no way to tell a *different*
hook's own state that the URL just changed. Three independent hooks —
tried first — couldn't reliably tell Catalog to open itself back up after
Detail closes, since Detail's own close handler has no way to notify a
sibling hook it doesn't know about. One hook owning one `view` value
sidesteps that: every transition, wherever it's triggered from, updates
the same state directly, and only real browser back/forward (which *does*
fire `popstate`) needs the one `popstate` listener to catch up.

Opening a component remembers whichever of home or Catalog it was actually
opened from (`returnHashRef`), so closing Detail goes back there rather than
always landing on the homepage — open a component from the full Catalog and
its own "Components" back link returns you to Catalog, not home. A direct
link with no prior in-app navigation, or an id the catalog doesn't
recognize, both fall back to home rather than erroring.

Detail's own header also carries **Previous/Next** buttons that cycle
through the full component list (wrapping at both ends) without leaving the
Detail page — added after noticing the Catalog page itself had shipped with
no way to reach it from the top nav, and a related gap alongside it: once
inside a component's Detail page there was no way to browse to another one
except backing all the way out to Home or Catalog and clicking again. Both
are now fixed — see "Nav's All Components link" below for the first one.
Previous/Next use a separate `switchComponent` (not `openComponent`)
specifically so they don't touch `returnHashRef`: browsing through several
components in a row and then hitting "back to Components" still returns to
wherever Detail was *first* opened from, not to the previous component's
own Detail page.

Deliberately used `pushState` rather than assigning `location.hash =` — the
latter also triggers the browser's own scroll-to-anchor behavior, which
matters here because a real element carries the id `"components"` for the
homepage section nav link; assigning that hash while Catalog or Detail (both
full-page replacements) are showing would be a silent no-op today, but a
real bug waiting for the day something else shares that id.

This intentionally covers only the three views above — which project/slide
is selected in `ProjectsSection` stays in plain component state, a shallower,
more transient selection where losing it to a refresh or back-press is a
reasonable tradeoff against routing it too.

### Nav's "All Components" link

The top nav's four other links (Projects/Experience/Components/Recognition)
all scroll to a section on the homepage — "All Components" is the odd one
out, since it opens a different view (Catalog) rather than scrolling. It
renders as a `<button>` calling `openCatalog()` instead of an `<a href>`,
placed in `NAV_ITEMS` as `{ label: "All Components" }` with no `href` — the
one thing that tells the nav's render loop to treat it differently
(`useActiveSection`'s scroll-spy also filters it out by the same missing
`href`, since there's no in-page section for it to ever be "active" in).

This exists because the Catalog page originally shipped with no nav entry
at all — reachable only via the "Browse all 25 components" button inside
the homepage's Components section, so a visitor who didn't scroll that far
could miss that it existed. Worth remembering as a general lesson for this
project: when a new page or view ships, check it's actually *reachable*
from the site's primary navigation, not just that the view itself works
correctly in isolation.

### Adding a project screen

Add a slide to `src/data/projectShowcases.js` with a `kind` prefixed by the
project's own `id`, then handle that `kind` in `ProjectScreen.jsx`. Unmatched
kinds fall through to a generic governance overview rather than rendering blank.

### Project names are stand-ins

Every project in `src/data/projectShowcases.js` is presented under a generic
name and acronym (e.g. "WSMS — Work Scope Management System") rather than the
name of the real engagement it recreates. Keep it that way when editing: don't
reintroduce a real client, product or system name into a title, subtitle,
slide label, or the text rendered inside a `ProjectScreen` mockup.

Unlike the project showcase, `src/data/experience.js` is *not* masked — it's
the résumé's own real employers, roles and dates, meant to be shown as-is.

### Platform orbit icons

`PlatformOrbit.jsx` renders each entry in `src/data/platformStack.js` — its
`icon` is one of Microsoft's own official Power Platform product icons, from
`src/assets/logos/` (see `NOTICE.md` there for the source and Microsoft's
usage terms) — orbiting a central hub at natural size and color, with no
crop, recolor, or reshape. The motion is pure CSS: the `orbit` keyframe in
`src/index.css` rotates each icon around the center at its ring's `--radius`
while counter-rotating it by the same amount so it stays upright, the
standard CSS-only "orbiting circles" technique. It freezes in place under
`prefers-reduced-motion: reduce`.

Microsoft's terms require each icon's full product name to appear near it,
not overlapping — awkward for something mid-orbit, so the diagram itself
stays icon-only and the labeled legend below it (icon + name pairs) is what
actually satisfies that requirement; keep that legend in sync with whatever
`platformStack.js` lists.

To add an icon: drop its official SVG in `src/assets/logos/`, note it in
`NOTICE.md`, then add an entry to `platformStack.js` with a `ring` of
`"inner"` or `"outer"` — `PlatformOrbit.jsx` spaces each ring's icons evenly
and picks their orbit radius and speed from the `RING` constant at the top
of the file.

### Adding a role

Add an entry to the `experience` array in `src/data/experience.js` — `org`,
`role`, `location`, `start`, `end` (use `"Present"` for a current role),
`color`, and a `highlights` array. `ExperienceSection.jsx` shows the first
three highlights and collapses the rest behind "Show more", and a new entry
is picked up by the scroll-fill rail and its own reveal/dot-activation
automatically — nothing else to wire up.

### Hero card 3D tilt

`useTilt` listens for `mousemove`/`mouseleave` on one element and writes the
`rotateX/rotateY/scale` transform to a *different*, nested one. That split
matters: rotating or scaling an element moves its own rendered bounding box,
so if the same element both listens and tilts, a still cursor can end up
outside that shifted box mid-gesture and the browser fires a spurious
`mouseleave` — worst at the corners, which is also where the tilt is
strongest. Keep future tilt effects on this same two-element pattern rather
than applying the transform to the listening element directly.

Two more pieces sell the depth beyond a single rotated plane:

- An optional `shadowRef` (a third element the hook accepts) gets a cast
  shadow that grows and shifts opposite the cursor as the card rotates
  toward it. Without it a rotated flat plane still reads as flat — nothing
  else in the image implies it has lifted off the page.
- Inside the tilting card, the header, stat tiles and chart panel each sit
  at their own `translateZ` in the card's own `preserve-3d` space, so they
  visibly separate from each other as the whole card rotates — real
  parallax inside the card, not just one plane turning as a unit.
- A separate idle-float layer (a slow CSS `translateY` bob, `motion-safe:`
  only) sits *outside* the tilt's own wrapper/card pair so the card reads
  as lifted even at rest, without fighting the tilt transform or the
  hero's scroll-parallax transform — each lives on its own nesting level
  so the three transforms never collide on one element.

### Responsive section spacing

Every section's vertical padding scales with the viewport
(`py-14 sm:py-20 lg:py-24` and similar) rather than a single flat value —
measured before this change, the same desktop-scale `py-24`/`py-20`
applied unmodified at every width was adding up to real, avoidable
scroll length on a phone. Desktop (`lg:`) values are left exactly as
they were, so nothing changes above that breakpoint; only mobile and
tablet get tighter. This alone is a modest win, not a dramatic one — the
bulk of mobile scroll length comes from stacked single-column content
(the Components catalog and Experience timeline especially), not
padding, so don't expect this by itself to make the page dramatically
shorter on a phone.

### Nav that compacts on scroll

`useScrollThreshold` reports a plain boolean — has the page scrolled past
a threshold — rather than a continuous value like `useParallaxLayer`, and
deliberately isn't frozen under `prefers-reduced-motion`: a compacting
nav bar is a discrete density change, not drifting motion, so it should
still work either way. Past the threshold, the nav bar shrinks, the
avatar shrinks, the tagline line collapses away, and the blur/shadow
both increase — paired with `motion-reduce:transition-none` so the
change snaps instantly instead of animating when reduced motion is on.

### Scroll-spy nav highlighting

`useActiveSection` highlights whichever of Projects / Experience /
Components / Recognition is currently in view, in both the desktop and
mobile nav. One `IntersectionObserver` watches all four section ids at
once with a narrow `rootMargin` trigger band roughly a third of the way
down the viewport, rather than a wider band or the default `0px` root —
narrow enough that only one section is realistically "active" at a time,
but still forgiving enough that Recognition (the shortest section, right
at the bottom of the page) reliably gets picked up before the page runs
out of scroll. If more than one section reports intersecting in the same
tick — passing quickly between two, or a boundary — the last one in DOM
order wins, since that's the one just scrolled into. The ids array is a
module-level constant (`NAV_SECTION_IDS`), not an inline literal, so the
effect's observer isn't torn down and rebuilt on every render.

### Scroll-linked animations write to the DOM directly, not through React state

`useParallaxLayer` (the hero backdrop) and `useScrollFill` (the Experience
section's timeline rail) both write style straight to a DOM node inside a
rAF-throttled scroll listener, using a plain `ref` — never `useState`. This
wasn't always true: both originally reported their scroll-derived value
(an offset, a 0-1 progress) as React state, and let the consuming JSX
recompute its inline `style` on the resulting re-render. That's the actual
architectural cause of a real jank/overlap bug reported on the live site —
not "needs more polish," a genuine anti-pattern: a `setState` call on every
single scroll frame re-renders the whole component it's in, and on a large
component like `Portfolio.jsx` (most of the homepage in one component) that
re-render has to walk a lot of tree for a transform that only ever touches
a handful of small elements. On any but a very fast machine that can't keep
up with 60fps scroll input, so frames drop, visibly — this is exactly why
`PlatformOrbit`'s spiral read as smooth while everything scroll-linked
didn't: it's a pure CSS `@keyframes` animation with no React or scroll
involvement at all, running entirely on the compositor thread, unaffected
by whatever the main thread is doing.

The fix uses the same direct-DOM-write pattern `useTilt`/`useSpotlight`
already used elsewhere in this codebase (see their own comments) — attach
a `ref` to the element that needs to move, write its style in the
rAF-throttled callback, skip React entirely. `useParallaxLayer(factor,
extra)` returns one ref per hero layer (five calls in `Portfolio.jsx`, one
per backdrop/shadow layer, each with its own lag/lead factor);
`useScrollFill` returns `{ containerRef, fillRef, beamRef }` for the
timeline's track, gradient fill and travelling beam dot. Measured before
and after with a Playwright script sampling `requestAnimationFrame` deltas
through a full continuous scroll: after the fix, 0 frames exceeded 33ms
(a dropped frame at 30fps) or 50ms (a visible stutter) out of 151 sampled,
averaging 16.6ms — a clean 60fps. (Headless Chromium in a container isn't
identical to every visitor's real machine, but zero dropped frames there is
strong evidence the *cause* — main-thread re-render churn on the scroll
path — is actually gone, not just reduced.)

One more contributor, specific to the Experience timeline: the fill
line's `height` and the beam's `top` both used to carry a CSS `transition`
(`transition-[height] duration-300` and `.rail-beam`'s own `transition: top
0.3s ease-out`) on top of the per-frame state updates. Since progress only
ever changes via scroll, that transition didn't smooth anything — it made
the rendered line chase a constantly-moving target through a 300ms ease on
*every* incoming scroll frame, a visible rubber-band lag layered on top of
the re-render cost. Both transitions are gone now; the rAF-throttled writes
already track the real scroll position frame-for-frame, so a transition on
top of that can only make it lag behind, never smooth it.

### Aurora background

The hero's mesh gradient breathes opacity slowly and each blurred blob
drifts a few pixels (`hero-mesh-breathe`, `aurora-drift-a/b` in
`index.css`), all `motion-safe:` only. Each blob's drift lives on an
*inner* div nested inside the div that already carries the
scroll-parallax `translate3d` (see `useParallaxLayer` above) — animating
`transform` on that same outer node would just override the parallax
transform for the animation's duration, the same reason `useTilt` and the
hero-float layer keep their own transforms on separate elements.

### Magnetic buttons

`useMagnetic` eases an element a few pixels toward the cursor while the
pointer is near it (capped by `max`), on the primary hero and footer
CTAs. Unlike `useTilt`/`useSpotlight`, it listens and transforms the
*same* element — a translation of only a few pixels is nowhere near
enough to move the element's own hit-test box out from under a
stationary cursor the way a multi-degree rotate/scale can, so the
split-element pattern those hooks need doesn't apply here.

### Heading reveal wipe, and a real clip-path + IntersectionObserver bug

`RevealHeading` wraps a section's `<h2>` and reveals it with a
left-to-right `clip-path` wipe the first time it scrolls into view.
The first version put the animated `clip-path` directly on the observed
element itself — and never revealed a single heading, in any browser
tested, no matter how far the page was scrolled. Confirmed with an
isolated repro: `clip-path: inset(0 100% 0 0)` collapses the target's
effective intersection rect to zero-area in Chromium, so
`entry.isIntersecting` never turns true and the reveal that's supposed
to remove the clip can never fire — a self-defeating loop. The fix
observes a plain, unclipped `<h2>` and puts the `clip-path` on an inner
`<span>` instead, so IntersectionObserver reads the real, unclipped
geometry. Keep that split for any future clip-path-based reveal effect.

### Résumé download

The footer's **Download résumé** button links to `public/uday-posia-resume.pdf`,
a single-page résumé built entirely from data already published elsewhere on
this site — `experience.js`'s three real roles and their highlight bullets,
`certifications.js`'s two certifications, `skills.js`'s six skills, and the
same summary line as the hero. Nothing in it is asserted anywhere it isn't
already stated in this repository. It deliberately has no phone number —
only email, LinkedIn and the portfolio URL — since a résumé that leaves the
site becomes a plain PDF anyone who receives it can forward or store
indefinitely, unlike the page itself. Regenerating it after an `experience.js`
or `certifications.js` edit is a manual step today: rebuild the HTML template,
render it to PDF (a headless-Chromium print, `@page { size: Letter; margin: 0 }`
with explicit `8.5in x 11in` sizing so it prints as one clean page), and
replace the file in `public/` — there's no build-time step that keeps it in
sync automatically, so re-check it by eye against the data files after any
change to either.

### JSON-LD structured data

`index.html` carries a `Person` schema.org block (`<script
type="application/ld+json">`) so search engines and social crawlers can read
name, role, location, employer, skills and certifications as structured data,
not just prose. Every value in it already appears as plain text elsewhere on
the page or in this repository's own data files — nothing is asserted here
that isn't. Two deliberate omissions rather than oversights: no `image`,
since schema.org's `Person.image` expects an actual photograph and this repo
has none (the Open Graph card is a designed graphic, not a headshot, so
reusing it here would be a mismatched claim); and AB-410 is left out of
`hasCredential` entirely, since that property asserts a credential is
*held* — AB-410 is still "In Progress" per `certifications.js`, so only the
completed PL-300 is listed. If AB-410 is completed, add it there too.

### Accessibility

An `axe-core` pass (WCAG 2A/2AA + best-practice rules) across the homepage,
Catalog and a component Detail page — each in both light and dark mode, plus
the homepage with every "Show more" experience entry expanded — found and
fixed three categories of real issue, not stylistic ones:

- **Unlabeled icon buttons.** The Catalog and Detail pages' header close
  button (`<X>`, no visible text) had no accessible name at all. Both now
  carry an explicit `aria-label`.
- **A skipped heading level.** The Catalog page went straight from its `h1`
  to each card's `h3` with no `h2` between them — the homepage's featured
  grid sits under a real `h2` ("Reusable components...") so it never had
  this problem, but Catalog's own header only has the page's `h1`. Fixed
  with a `sr-only` `<h2>` right before the grid — present for a screen
  reader's document outline, not meant to be seen.
- **Text below 4.5:1 contrast**, by far the largest category, in two
  recurring shapes:
  - `text-slate-400`, and in a few spots `text-slate-500`, used as real
    label/caption text (eyebrows, table headers, helper copy) against a
    white or near-white background. Bumped to `slate-500` or `slate-600`
    depending on how marginal the specific background was — plain white
    clears 4.5:1 comfortably at `slate-500` (≈4.76:1); a background already
    tinted toward a brand color needed `slate-600` to clear it too.
  - A category/role color (green, blue, purple, magenta, orange) used
    directly as text — on its own light tint in light mode (the maturity
    badges, "Synthetic data" pill), or on a dark card/page background in
    dark mode or the always-dark Projects rail. The raw brand hex clears
    4.5:1 against *some* of these combinations and not others, so rather
    than special-case each color, `src/lib/color.js` exports `darken()` and
    `lighten()` (mix a fixed percentage toward black/white) and every one of
    these spots now computes both an explicit light-mode and dark-mode
    shade — set as CSS custom properties (`--badge-light`/`--badge-dark`) so
    Tailwind's `dark:` variant switches between them for free, without
    threading a `dark` boolean prop down to components that don't otherwise
    need one.

  `ProjectScreen.jsx`'s product-mockup screens are the one place `slate-400`
  is otherwise still used as-authored — they're a fixed, always-light
  illustration regardless of the site's own dark toggle, so they only
  needed the flat white-background fix, not a `dark:` pair.

  Keyboard operability was checked too, not just contrast: tab order
  through the nav, hero CTAs and the first component card is sequential
  and every stop shows a visible focus outline; the dark-mode toggle,
  opening a component card, and closing back out of Detail all work with
  `Enter` alone, with no keyboard trap anywhere in that path.

### Performance and bundle size

`npm run build`'s own report is the source of truth here — checked after
this session's additions (the Catalog page, the live configurator, YAML
validation, the résumé PDF link, JSON-LD, scroll-spy): the JS bundle is
~267 KB raw / ~80 KB gzipped, CSS ~36 KB / ~7.5 KB gzipped, and
`index.html` under 2 KB gzipped. Production dependencies are just `react`,
`react-dom` and `lucide-react` — `js-yaml` (used by
`scripts/validate-yaml.mjs`) is dev-only and confirmed not imported
anywhere under `src/`, so it never reaches the browser. The one large
static asset, `og-image.png` (368 KB), is referenced only from Open Graph
`<meta>` tags — a normal page load never fetches it, only link-preview
crawlers do — and the résumé PDF (~97 KB) loads only when the download
button is actually clicked, not on page load. Nothing here needed fixing;
this is a checkpoint to compare future additions against, not a change.

## Live Power Apps embed (optional)

The component detail page has a **Show live Power Apps runtime** toggle. With no
configuration it renders an explicit "not connected" card and the static preview
stays usable without sign-in. To embed a real published Canvas showcase app:

```bash
cp .env.example .env
# then set:
VITE_POWERAPPS_APP_ID=<published app id>
VITE_POWERAPPS_TENANT_ID=<tenant id>
```

The component id is passed through as a `component=<id>` launch parameter.

## Deployment

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every
push to the repository's **default** branch (whatever it is currently named),
and can also be run manually from any branch via **Actions → Deploy to GitHub
Pages → Run workflow**.

Two settings it depends on:

- **Pages must be enabled by hand, once:** Settings → Pages → Source →
  **GitHub Actions**. The workflow cannot do this for you — creating a Pages
  site requires repository admin, which `GITHUB_TOKEN` never has. Until it is
  set, the `configure-pages` step fails with "Resource not accessible by
  integration".
- GitHub serves Pages from a **private** repository only on a paid plan. On a
  free account the repository must be public, or the site hosted elsewhere.
- Repository variable `VITE_BASE_PATH` controls the asset base path: set it to
  `/myPortfolio/` for a project site at `<user>.github.io/myPortfolio/`, or
  leave it unset for a custom domain or user site, in which case the build
  uses `/`.

Any static host works — `npm run build` and serve `dist/`.

## Notes on content

Component property and event contracts are stated in this project's own words
and naming. Entries marked **Verified** have had their contract cross-checked
against a published reference component; entries marked **Original** are design
specifications whose executable YAML has not yet been built and tested in Power
Apps Studio. Every figure in the project recreations is synthetic — no real
client, tenant or personal data appears anywhere in this repository.

`src/data/skills.js` is real LinkedIn endorsement data, not composed
testimonials — there are no written recommendations to draw from, and this
project doesn't fabricate quotes attributed to real people. If actual
testimonial text becomes available, it belongs in its own data file and
section rather than folded into this one.
