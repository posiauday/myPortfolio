# Uday Posia — Portfolio & Enterprise Component Design System

A single-page portfolio for Power Platform / Microsoft 365 delivery work, plus a
browsable design-system reference for 25 reusable enterprise components.

Built with **Vite + React 18 + Tailwind CSS**. No animation library, no charting
library — the interface recreations, charts and transitions are plain JSX, inline
SVG and CSS.

## What's in it

| Section | What it does |
| --- | --- |
| **Hero** | Multi-layer parallax backdrop (`useParallax`) plus a reveal-on-scroll KPI panel (`useReveal`). |
| **Platform** | Microsoft's own official Power Platform product icons orbiting a central hub in two counter-rotating rings — pure CSS, no animation library (see `PlatformOrbit.jsx`). |
| **Projects** (`#projects`) | Seven project showcases in a rail-and-window layout: pick a project from the rail, page through its screens in a window-framed preview. Every project is presented under a generic name and every number shown is synthetic. |
| **Experience** (`#experience`) | A career timeline of real employers, roles and dates, each with a collapsible highlight list. |
| **Components** (`#components`) | Searchable, category-filtered catalog of 25 components. |
| **Component detail** | Per-component page with Preview, Variants, Properties, Events, Architecture, Examples, Accessibility and Limitations tabs, generated YAML, copyable docs, and an optional live Power Apps embed. |
| **Recognition** (`#recognition`) | Awards and delivery-scale highlights. |

Dark mode is a class toggle on the page's own `<main>`, which is why
`tailwind.config.js` sets `darkMode: "class"` rather than relying on the media
strategy.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle
npm run lint
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
    platformStack.js     the icons PlatformOrbit renders (name, icon import, ring)
  assets/
    logos/                Microsoft's official Power Platform SVG icons + NOTICE.md
  lib/
    componentDocs.js     YAML + markdown docs generated from the catalog
  hooks/
    useCopyFeedback.js   clipboard write + short-lived "Copied" label
    useReveal.js         one-shot IntersectionObserver reveal
    useParallax.js        throttled scroll offset, frozen under reduced motion
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
three highlights and collapses the rest behind "Show more".

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
