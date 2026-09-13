/* ============================================================
   BRAND THEME YAML
   Power Apps Studio's Themes panel has its own copy-paste YAML format
   (Theme Name / Font / BasePaletteColor / HueTorsion / Vibrancy /
   ColorOverrides — Add a theme > Paste theme), separate from the
   component/control YAML in componentDocs.js. This generates a real
   theme from this site's own primary brand color, so a visitor can
   paste it straight into their own app's Themes panel.

   Two honesty notes, both worth keeping if this ever changes:
   - Font is "Segoe UI", not this site's own "Inter" — a theme's Font
     value has to already be available in whatever Power Apps
     environment it's pasted into, and Segoe UI is guaranteed to be
     there; Inter isn't. Matching the site's own web font exactly isn't
     possible without risking an unavailable-font paste.
   - This is a single-hue-seeded Fluent palette, not a literal
     reproduction of the hero's three-stop green/blue/purple gradient —
     Studio's theme model generates one palette from one seed color, so
     it can approximate this site's dominant green accent, not its
     multi-color gradient treatment.
   ============================================================ */
const BRAND_SEED_COLOR = "#168326";

function buildBrandThemeYaml() {
  return [
    `# Uday Posia — Portfolio Brand Theme`,
    `# Paste into Power Apps Studio: Themes panel > Add a theme > Paste theme.`,
    `# Seeded from this site's own primary accent (${BRAND_SEED_COLOR}); Font is`,
    `# Segoe UI rather than the site's own Inter, since a theme's font has to`,
    `# already be available in whatever environment it's pasted into.`,
    `Theme Name: Uday Posia Portfolio`,
    `Font: Segoe UI`,
    `BasePaletteColor: '${BRAND_SEED_COLOR}'`,
    `HueTorsion: 0`,
    `Vibrancy: 0`,
    `ColorOverrides:`,
    `  Base: '${BRAND_SEED_COLOR}'`
  ].join("\n");
}

export { buildBrandThemeYaml };
