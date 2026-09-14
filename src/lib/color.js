/* Small color helper for the maturity/role badges that render a
   category's brand color as text on a light tint of that same color
   (ComponentCard, ComponentDetail, ExperienceSection). Using the raw
   brand color as-is only clears WCAG AA contrast for some hues (green,
   blue) and falls short for others (magenta, orange) once the tint's
   lightened background is accounted for — an axe-core scan across the
   catalog, homepage and a component detail page caught this. Rather
   than pick per-color exceptions, darken every badge's text by a
   fixed 18% toward black: this pushes even the worst offenders
   (magenta, orange, ~4.0:1 as-authored) safely past 4.5:1 against
   their own tint, without changing which color represents which
   category. */
export function darken(hex, amount = 0.18) {
  const value = hex.replace("#", "");
  const rgb = [0, 2, 4].map(i => parseInt(value.slice(i, i + 2), 16));
  const darkened = rgb.map(c => Math.round(c * (1 - amount)));
  return `#${darkened.map(c => c.toString(16).padStart(2, "0")).join("")}`;
}

/* Dark-mode counterpart to darken(): the project rail's active-card
   index number (ProjectsSection) renders a category's brand color
   directly as text on that same card's dark, near-black background —
   readable-strength on paper, but every one of the five brand hues
   independently measured under 3:1 there (axe-core caught it). Mixing
   45% toward white keeps each hue recognizable while clearing 4.5:1
   against the card's actual background across all five. */
export function lighten(hex, amount = 0.45) {
  const value = hex.replace("#", "");
  const rgb = [0, 2, 4].map(i => parseInt(value.slice(i, i + 2), 16));
  const lightened = rgb.map(c => Math.round(c * (1 - amount) + 255 * amount));
  return `#${lightened.map(c => c.toString(16).padStart(2, "0")).join("")}`;
}
