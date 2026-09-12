# Uday Posia — Portfolio & Enterprise Component Design System

A single-page portfolio for Power Platform / Microsoft 365 delivery work, plus a
browsable design-system reference for 25 reusable enterprise components.

Built with **Vite + React 18 + Tailwind CSS**. No animation library, no charting
library — the interface recreations, charts and transitions are plain JSX, inline
SVG and CSS.

## What's in it

| Section | What it does |
| --- | --- |
| **Hero** | Reveal-on-scroll KPI panel driven by `useReveal` + a CSS height transition. |
| **Projects** (`#projects`) | Seven project showcases, each a keyboard-reachable carousel of high-fidelity screen recreations. Every number shown is synthetic. |
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
    Portfolio.jsx        page shell: nav, hero, projects, catalog, recognition, footer
    ComponentDetail.jsx  per-component reference page (tabs, YAML, docs, embed)
    ComponentPreview.jsx the small in-page mockup for a single component
    ProjectCarousel.jsx  slide navigation for one project showcase
    ProjectScreen.jsx    every project screen recreation, switched on slide `kind`
    PowerAppsEmbed.jsx   live runtime embed, with an honest not-connected state
  data/
    componentLibrary.js  categories, icons, per-category defaults, per-component
                         overrides, and the derived component catalog
    projectShowcases.js  the seven projects and their slides
  lib/
    componentDocs.js     YAML + markdown docs generated from the catalog
  hooks/
    useCopyFeedback.js   clipboard write + short-lived "Copied" label
    useReveal.js         one-shot IntersectionObserver reveal
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
