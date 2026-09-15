/* Real, pasteable visual control trees ("Children:") for components in
   the catalog — the actual Rectangle/Label/Classic-Button controls that
   make a pasted component look like something in Studio, not just the
   CustomProperties contract componentDocs.js already generates.

   Syntax (control types, Children: shape, X/Y/Width/Height/Fill/Color/
   Font keys, Parent./Self./`cmp<Name>.Prop` references) is grounded in
   a real, complete, shipped component definition —
   RorySullivan1/powerapp_taskmaster's cmpStatusCard.pa.yaml — not
   invented from the property-schema research alone. Every reference
   to a control's own custom property uses `cmp<PascalTitle>.PropName`,
   matching that real example exactly (not `Self.PropName`, which
   inside a child control would resolve to the CHILD's own properties,
   not the parent component's).

   Only components listed in CHILDREN_BUILDERS get a real Properties:/
   Children: block from buildComponentYaml; everything else remains the
   honest contract-only YAML it always was (see yamlStatus in
   componentLibrary.js) rather than a fabricated tree no one has
   actually verified renders sensibly. */

function kpiCard(pascal) {
  const self = `cmp${pascal}`;
  return {
    properties: { Height: 200, Width: 300, Fill: "RGBA(0, 0, 0, 0)" },
    children: [
      {
        name: "cardBg",
        control: "Rectangle@2.3.0",
        properties: {
          Fill: "RGBA(255, 255, 255, 1)",
          Height: "Parent.Height",
          Width: "Parent.Width",
          X: "0",
          Y: "0",
          BorderColor: "RGBA(226, 232, 240, 1)",
          BorderThickness: "1"
        }
      },
      {
        name: "lblLabel",
        control: "Label@2.5.1",
        properties: {
          Text: `${self}.Label`,
          Color: "RGBA(100, 116, 139, 1)",
          Font: "Font.'Segoe UI'",
          Size: "11",
          FontWeight: "FontWeight.Semibold",
          X: "20",
          Y: "16",
          Width: "Parent.Width - 40",
          Height: "18"
        }
      },
      {
        name: "lblValue",
        control: "Label@2.5.1",
        properties: {
          Text: `${self}.Value`,
          Color: "RGBA(15, 23, 42, 1)",
          Font: "Font.'Segoe UI'",
          Size: "34",
          FontWeight: "FontWeight.Bold",
          X: "20",
          Y: "38",
          Width: "170",
          Height: "48"
        }
      },
      {
        name: "trendPill",
        control: "Rectangle@2.3.0",
        properties: {
          Fill: `If(${self}.Trend >= 0, RGBA(220, 252, 231, 1), RGBA(254, 226, 226, 1))`,
          X: "200",
          Y: "44",
          Width: "80",
          Height: "28",
          RadiusTopLeft: "14",
          RadiusTopRight: "14",
          RadiusBottomLeft: "14",
          RadiusBottomRight: "14"
        }
      },
      {
        name: "lblTrend",
        control: "Label@2.5.1",
        properties: {
          Text: `If(${self}.Trend >= 0, "▲ ", "▼ ") & Text(Abs(${self}.Trend), "0.0") & "%"`,
          Color: `If(${self}.Trend >= 0, RGBA(21, 128, 61, 1), RGBA(185, 28, 28, 1))`,
          Align: "Align.Center",
          Font: "Font.'Segoe UI'",
          Size: "12",
          FontWeight: "FontWeight.Bold",
          X: "200",
          Y: "44",
          Width: "80",
          Height: "28"
        }
      },
      {
        name: "barTrack",
        control: "Rectangle@2.3.0",
        properties: {
          Fill: "RGBA(241, 245, 249, 1)",
          Visible: `!${self}.ShowSparkline`,
          X: "20",
          Y: "150",
          Width: "260",
          Height: "8",
          RadiusTopLeft: "4",
          RadiusTopRight: "4",
          RadiusBottomLeft: "4",
          RadiusBottomRight: "4"
        }
      },
      {
        name: "barFill",
        control: "Rectangle@2.3.0",
        properties: {
          Fill: "RGBA(22, 131, 38, 1)",
          Visible: `!${self}.ShowSparkline`,
          X: "20",
          Y: "150",
          // Real, not decorative — uses Target the way the property
          // contract documents it (a comparison point), capped at 100%
          // so an over-target Value never draws past the track.
          Width: `260 * Min(1, Value(${self}.Value) / Max(1, ${self}.Target))`,
          Height: "8",
          RadiusTopLeft: "4",
          RadiusTopRight: "4",
          RadiusBottomLeft: "4",
          RadiusBottomRight: "4"
        }
      },
      // Five bars, one per SparklineData row (sampleFormulas.js's own
      // KPI Card SparklineData default is a 5-point x/y table) — a real
      // Index()-bound mini bar-chart rather than an attempt to
      // replicate ComponentPreview.jsx's smoothed SVG curve in Power Fx
      // formula text untested against a real compiler; documented as
      // that deliberate a simplification in the catalog's Limitations,
      // not silently passed off as pixel parity with the web preview.
      ...[1, 2, 3, 4, 5].map(n => ({
        name: `spark${n}`,
        control: "Rectangle@2.3.0",
        properties: {
          Fill: "RGBA(22, 131, 38, 1)",
          Visible: `${self}.ShowSparkline`,
          X: String(20 + (n - 1) * 52),
          Width: "40",
          Height: `4 + 36 * (Index(${self}.SparklineData, ${n}).y / Max(${self}.SparklineData, y))`,
          Y: "158 - Self.Height"
        }
      })),
      {
        name: "lblStatus",
        control: "Label@2.5.1",
        properties: {
          Text: `${self}.Status`,
          Color: "RGBA(71, 85, 105, 1)",
          Font: "Font.'Segoe UI'",
          Size: "11",
          FontWeight: "FontWeight.Semibold",
          X: "20",
          Y: "168",
          Width: "Parent.Width - 40",
          Height: "18"
        }
      },
      {
        name: "cardBtn",
        control: "Classic/Button@2.2.0",
        properties: {
          Text: '""',
          Fill: "RGBA(0, 0, 0, 0)",
          HoverFill: "RGBA(22, 131, 38, 0.05)",
          PressedFill: "RGBA(22, 131, 38, 0.1)",
          BorderColor: "RGBA(0, 0, 0, 0)",
          Height: "Parent.Height",
          Width: "Parent.Width",
          X: "0",
          Y: "0",
          OnSelect: `${self}.OnSelect()`
        }
      }
    ]
  };
}

export const CHILDREN_BUILDERS = {
  "KPI Card": kpiCard
};
