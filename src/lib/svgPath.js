/* Builds a smoothed SVG line + matching filled-area path through a set of
   values — the exact technique ResponsiveLineChart's own architecture
   describes (one dependency-free inline SVG, a Catmull-Rom-smoothed
   curve, a gradient fill under it, no charting library). Shared here so
   the Detail page's own live preview mockups for ResponsiveLineChart and
   Executive KPI Card's optional sparkline draw with the identical
   technique, rather than two separate small chart implementations. */
export function buildLinePath(values, { width = 300, height = 120, padding = 8 } = {}) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;
  const points = values.map((v, i) => [
    padding + i * stepX,
    height - padding - ((v - min) / range) * (height - padding * 2)
  ]);

  // Catmull-Rom to cubic Bezier: a standard way to draw a smooth curve
  // through an arbitrary set of points without a charting library, each
  // segment's control points derived from its neighbors so the curve
  // stays continuous at every joint.
  let linePath = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    linePath += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }

  const baseline = height - padding;
  const areaPath = `${linePath} L ${points[points.length - 1][0]},${baseline} L ${points[0][0]},${baseline} Z`;

  return { linePath, areaPath, points };
}
