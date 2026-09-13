# Uday Posia — Portfolio & Enterprise Component Design System

A single-page portfolio for Power Platform / Microsoft 365 delivery work, plus a
browsable design-system reference for 25 reusable enterprise components.

Built with **Vite + React 18 + Tailwind CSS**. No animation library, no charting
library — the interface recreations, charts and transitions are plain JSX, inline
SVG and CSS.

## What's in it

| Section | What it does |
| --- | --- |
| **Hero** | Multi-layer parallax backdrop (`useParallax`), a reveal-on-scroll KPI panel (`useReveal`), and a mouse-tracked 3D tilt + cursor glare + cast shadow on the KPI card itself (`useTilt`). The card's header, stat tiles and chart each sit at their own depth inside the tilt's 3D space, so the whole thing visibly parallaxes as it rotates, and it idly bobs even at rest so it never reads as flat. |
| **Impact strip** | Four stats — years of experience, users under governed delivery, a productivity figure, and the PL-300 cert — pulled together right under the hero rather than left scattered across Experience and Recognition where a skim can miss them. No new claims: every figure here is the same one already stated elsewhere on the page. |
| **Platform** | Microsoft's own official Power Platform product icons orbiting a central hub in two counter-rotating rings — pure CSS, no animation library (see `PlatformOrbit.jsx`). |
| **Projects** (`#projects`) | Seven project showcases in a rail-and-window layout: pick a project from the rail, page through its screens in a window-framed preview. Every project is presented under a generic name and every number shown is synthetic. |
| **Experience** (`#experience`) | An animated career timeline: a gradient rail draws itself in as you scroll past it (`useScrollFill`) with a glowing beam riding the same progress down the rail, each entry fades up into view the first time it's reached (`useRevealEach`), the current role's card traces a rotating border-beam, and every card gets a cursor-tracked spotlight glow (`useSpotlight`). A number ticker counts up the years of experience on scroll-in, and "Show more" expands a card's remaining highlights via a smooth grid-row transition rather than popping open. Real employers, roles and dates, each with a collapsible highlight list. |
| **Components** (`#components`) | Searchable, category-filtered catalog of 25 components. The unfiltered view defaults to 6 curated flagship picks (`FEATURED_IDS`) rather than all 25 at once — a "Browse all 25" toggle expands it, and searching or picking a category always searches/shows the full catalog regardless of the toggle. A "Copy brand theme YAML" button generates a real Power Apps Studio theme (Themes panel > Add a theme > Paste theme) seeded from the site's own brand green. |
| **Component detail** | Per-component page with Preview, Variants, Properties, Events, Architecture, Examples, Accessibility and Limitations tabs, generated YAML in two schema-conformant forms (a component definition and a screen-control instance of it — see below), copyable docs, and an optional live Power Apps embed. Lives at `#components/<id>` (`useComponentRoute`), so the browser back button closes it and a direct link opens straight to that component. |
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
    useParallax.js       throttled scroll offset, frozen under reduced motion
    useScrollFill.js     0-1 scroll progress, for a rail that draws itself in
    useTilt.js           mouse-tracked 3D tilt + cursor glare for a card
    useComponentRoute.js syncs the open component Detail page with #components/<id>
  config.js              contact details and the Power Apps embed configuration
```

### Adding a component

1. Add a `[title, category, maturity]` row to `raw` in
   `src/data/componentLibrary.js`.
2. Optionally add an entry to `overrides`, keyed by the slugified title
   (`"Enterprise Calendar"` → `"enterprise-calendar"`), to replace the
   category defaults for `properties`, `events`, `architecture`, `examples`,
   `accessibility` or `limitations`.

Everything else — the catalog card, the detail page tabs, the generated
`cmp<Pascal>.yaml` and the copyable markdown docs — is derived from that data,
so the YAML and the Properties/Events tabs can never drift apart.

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

### Component detail routing

Opening a component swaps in an entirely different full-page component
(`Detail`), not a route in the usual sense, so without `useComponentRoute` the
browser's back button had nowhere useful to go and a shared link could only
ever land on the homepage. The hook keeps that swap in sync with
`#components/<id>` via `history.pushState` (not `location.hash =`, which
would also trigger the browser's own scroll-to-anchor for the plain
`#components` case, since a real element already carries that id) and
listens for `popstate` to handle back/forward. An unrecognized id in the URL
just falls back to the homepage rather than erroring.

This intentionally covers only the Detail page swap — which project/slide is
selected in `ProjectsSection`, and the catalog's search/category filters,
stay in plain component state. Those are shallower, more transient
selections where losing them to a page refresh or a back-button press is a
reasonable tradeoff against the added complexity of routing all of them too.

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
a threshold — rather than a continuous offset like `useParallax`, and
deliberately isn't frozen under `prefers-reduced-motion`: a compacting
nav bar is a discrete density change, not drifting motion, so it should
still work either way. Past the threshold, the nav bar shrinks, the
avatar shrinks, the tagline line collapses away, and the blur/shadow
both increase — paired with `motion-reduce:transition-none` so the
change snaps instantly instead of animating when reduced motion is on.

### Aurora background

The hero's mesh gradient breathes opacity slowly and each blurred blob
drifts a few pixels (`hero-mesh-breathe`, `aurora-drift-a/b` in
`index.css`), all `motion-safe:` only. Each blob's drift lives on an
*inner* div nested inside the div that already carries the
scroll-parallax `translate3d` as an inline style (see `layer()` in
Portfolio.jsx) — animating `transform` on that same outer node would
just override the inline parallax transform for the animation's
duration, the same reason `useTilt` and the hero-float layer keep their
own transforms on separate elements.

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
