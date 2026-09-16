/* Real, pasteable visual control trees ("Children:") for components in
   the catalog — the actual controls that make a pasted component look
   like something in Studio, not just the CustomProperties contract
   componentDocs.js already generates.

   See .claude/skills/power-app-component-writer/SKILL.md for the full
   research this file is built against: which control types support
   which properties (CONFIRMED via a real Studio paste error, or STRONG
   EVIDENCE from real shipped .pa.yaml files — never "looks plausible"),
   the real data-driven-Gallery/StyleConfig/responsive-breakpoint/
   skeleton-loading/SVG-icon/SVG-sparkline patterns, the "settle the
   component's shape before building" lesson (failure mode 3), and the
   verification discipline every component here has to pass before
   being trusted. Read that file before adding or editing an entry.

   Only components listed in CHILDREN_BUILDERS get a real Properties:/
   Children: block from buildComponentYaml; everything else remains the
   honest contract-only YAML it always was (see yamlStatus in
   componentLibrary.js) rather than a fabricated tree no one has
   actually verified renders sensibly.

   A node is {name, control, variant?, properties, children?} —
   componentDocs.js's emitChildren walks `children` recursively, so a
   node's own `properties` values are always Power Fx expression
   strings (no leading "="), and `children` (if present) is the same
   shape one level down. */

/* KPI Card — one real card, not a row of cards. A first rebuild of
   this component copied a real "enterprise" reference's Data-table +
   Gallery shape (good for a component whose job is rendering a list),
   but KPI Card's own job — and its own name — is being *one* card: you
   place one instance per metric on a screen, and each instance's own
   scalar properties (Label, Value, Icon, ...) describe that one card,
   the same way a real card component is placed and configured
   per-instance in Studio. See the skill file's failure mode 3 for the
   full account. This rebuild keeps every technique worth keeping from
   that reference — StyleConfig centralizing every color/spacing/
   radius/type-size token, the real SVG icon library (Substitute() on a
   COLOR placeholder), the real generated-SVG sparkline, real skeleton
   loading — applied to one card instead of a Gallery of them.
   Card height is 88px (Compact/Minimal) or 190px+ (Standard/Filled/
   Chart, +28 more when a Target goal row is showing) —
   StyleConfig.heights.statsCardCompact/statsCardMax. Width defaults to
   a fixed 280 (a single card, not a full-width row), and a host resizes
   the pasted instance per-placement the normal way.

   Past the initial single-card rebuild, five more real, data-practice
   features were added on top of the same shape: NumberFormat (a real
   Power Fx number-format string via Text(Value, format), replacing a
   fragile "does Label say value/price/cost" guess); Target (a goal
   track+fill bar and "N% of target" line, sized into the card only
   when actually used); PositiveDirection (decouples the trend arrow's
   direction, always the real sign of PercentChange, from whether that
   direction is good — a cost or incident count where down is the win);
   HasLoadError (a third state alongside the normal card and the loading
   skeleton, with its own message and a real OnRetry-firing Retry
   button, the same distinct-from-IsLoading pattern this catalog's
   Activity Timeline already uses); AccessibilityLabel (wired to the
   overlay button's real AccessibleLabel property — CONFIRMED against
   Microsoft's own canvas-apps accessibility property reference — since
   an interactive control with no accessible name fails WCAG 4.1.2).
   A sixth, Tone, makes IconBg/IconColor themselves dynamic: "Custom"
   (the default) uses them exactly as authored; Positive/Warning/
   Negative/Neutral/Info instead resolves both from StyleConfig's own
   already-contrast-checked token pairs, so a card's color follows the
   *kind* of metric it shows rather than a hex pair the host has to
   hand-pick and separately verify for contrast every time. */
function kpiCard(pascal) {
  const self = `cmp${pascal}`;
  const isDense = `Or(${self}.Style = "Compact", ${self}.Style = "Minimal")`;
  // Target's own goal-comparison row only ever renders in Standard/Filled
  // (Compact/Minimal have no room, Chart's own bottom space is already
  // the sparkline's) — its 28px only ever gets added to the card height
  // in that same condition, so the two can never disagree.
  const hasTarget = `!IsBlank(${self}.Target) And ${self}.Target <> 0`;
  const showTargetRow = `And(!Or(${self}.Style = "Compact", ${self}.Style = "Minimal", ${self}.Style = "Chart"), ${hasTarget})`;
  const cardHeight = `If(${isDense}, ${self}.StyleConfig.heights.statsCardCompact, ${self}.StyleConfig.heights.statsCardMax + If(${showTargetRow}, 28, 0))`;
  const cardWidthExpr = "conKPICard.Width";
  const cardHeightExpr = "conKPICard.Height";

  // Tone makes color dynamic on the *kind* of metric instead of a hex
  // pair the host has to hand-pick and separately verify for contrast
  // every time: "Custom" (the default) uses IconBg/IconColor exactly as
  // authored, unchanged from before this property existed; any other
  // value resolves both from StyleConfig.tones — the same accessible,
  // already-contrast-checked pairs this catalog verified with a real
  // WCAG 1.4.3 relative-luminance calculation, not eyeballed. Every
  // control below reads these two, never the raw properties directly,
  // so Tone and manual IconBg/IconColor can never disagree.
  const resolvedIconBg = `Switch(Lower(Coalesce(${self}.Tone, "custom")), "positive", ${self}.StyleConfig.tones.positive.bg, "warning", ${self}.StyleConfig.tones.warning.bg, "negative", ${self}.StyleConfig.tones.negative.bg, "neutral", ${self}.StyleConfig.tones.neutral.bg, "info", ${self}.StyleConfig.tones.info.bg, ${self}.IconBg)`;
  const resolvedIconColor = `Switch(Lower(Coalesce(${self}.Tone, "custom")), "positive", ${self}.StyleConfig.tones.positive.fg, "warning", ${self}.StyleConfig.tones.warning.fg, "negative", ${self}.StyleConfig.tones.negative.fg, "neutral", ${self}.StyleConfig.tones.neutral.fg, "info", ${self}.StyleConfig.tones.info.fg, ${self}.IconColor)`;

  // Real technique (SVG data: URI, built with EncodeUrl — see the
  // skill file's "SVG icon library" pattern): substitutes the Icons
  // table's "COLOR" placeholder for this card's own resolved icon color.
  const iconImage = `"data:image/svg+xml;utf8," & EncodeUrl(Substitute(LookUp(${self}.Icons, Name = ${self}.Icon, SVG), "COLOR", ${resolvedIconColor}))`;

  // PositiveDirection decouples "which way the number moved" (the arrow,
  // always the real sign of PercentChange) from "whether that's good"
  // (the color) — a metric where a decrease is the win (cost, incidents,
  // open tickets) still colors correctly instead of assuming up is
  // always positive.
  const isGoodDirection = `If(${self}.PositiveDirection = "Down", ${self}.PercentChange < 0, ${self}.PercentChange > 0)`;

  // Real technique (see skill file's "sparkline via generated SVG"
  // pattern): SparklineData is a plain comma-separated Text value,
  // parsed with MatchAll/ForAll, scaled into an SVG polyline +
  // translucent polygon fill, colored by the same good/bad direction
  // PercentChange and PositiveDirection already convey.
  const sparklineImage = `With({raw: Coalesce(${self}.SparklineData, "")}, If(raw = "", Blank(), With({nums: ForAll(MatchAll(raw, "-?\\d+\\.?\\d*"), {n: Value(FullMatch)}), w: 200, h: If(${self}.Style = "Chart", 96, 36), clr: If(IsBlank(${self}.PercentChange) Or ${self}.PercentChange = 0, "#9E9E9E", ${isGoodDirection}, "#22C55E", "#EF4444")}, With({lo: Min(nums, n), hi: Max(nums, n), cnt: CountRows(nums)}, With({rng: If(hi = lo, 1, hi - lo)}, "data:image/svg+xml;utf8," & EncodeUrl("<svg viewBox='0 0 " & w & " " & h & "' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><polygon fill='" & clr & "' fill-opacity='0.12' points='0," & h & " " & Concat(Sequence(cnt), Text(Round((Value - 1) / Max(cnt - 1, 1) * w, 1)) & "," & Text(Round(h - (Index(nums, Value).n - lo) / rng * (h - 4) - 2, 1)), " ") & " " & w & "," & h & "'/><polyline fill='none' stroke='" & clr & "' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' points='" & Concat(Sequence(cnt), Text(Round((Value - 1) / Max(cnt - 1, 1) * w, 1)) & "," & Text(Round(h - (Index(nums, Value).n - lo) / rng * (h - 4) - 2, 1)), " ") & "'/></svg>"))))))`;

  // NumberFormat replaces the old "does Label say value/price/cost"
  // guess with an explicit, host-set Power Fx number-format string
  // (e.g. "$#,##0.00", "0%", "#,##0") applied via the real Text(Value,
  // format) two-argument form — "Auto" (or blank) keeps the sensible
  // K/M abbreviation default instead of guessing a currency format from
  // Label's own text.
  const formattedValue = `If(${self}.NumberFormat <> "" And ${self}.NumberFormat <> "Auto", Text(${self}.Value, ${self}.NumberFormat), With({v: ${self}.Value, thresh: ${self}.StyleConfig.abbreviateThreshold}, If(thresh > 0 And Abs(v) >= 1000000, Text(v / 1000000, "#,##0.0") & "M", thresh > 0 And Abs(v) >= thresh, Text(v / 1000, "#,##0.0") & "K", Text(v))))`;
  const trendColor = `Switch(true, IsBlank(${self}.PercentChange), Color.Transparent, ${self}.PercentChange = 0, ${self}.StyleConfig.colors.neutral, ${isGoodDirection}, ${self}.StyleConfig.colors.positive, ${self}.StyleConfig.colors.negative)`;
  const trendText = `If(${self}.PercentChange = 0, "0%", If(${self}.PercentChange > 0, "▲ +" & ${self}.PercentChange & "%", "▼ " & ${self}.PercentChange & "%"))`;

  // Target/goal comparison: a thin track+fill bar plus a computed "N%
  // of target" line, guarded so an unset (blank or 0) Target never
  // divides by zero even while the row itself is invisible — Power Fx
  // still evaluates a hidden control's formulas.
  const targetRatio = `If(${hasTarget}, Min(${self}.Value / ${self}.Target, 1), 0)`;
  const targetText = `If(${hasTarget}, Round(${self}.Value / ${self}.Target * 100, 0) & "% of target", "")`;

  const conKPICard = {
    name: "conKPICard",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: {
      BorderColor: `${self}.StyleConfig.colors.border`,
      BorderThickness: `If(${self}.Style = "Filled", 0, 1)`,
      DropShadow: "DropShadow.Light",
      Fill: `If(${self}.Style = "Filled", ColorValue(${resolvedIconBg}), ${self}.StyleConfig.colors.cardBg)`,
      Height: "Parent.Height",
      RadiusTopLeft: `${self}.StyleConfig.radius.lg`,
      RadiusTopRight: `${self}.StyleConfig.radius.lg`,
      RadiusBottomLeft: `${self}.StyleConfig.radius.lg`,
      RadiusBottomRight: `${self}.StyleConfig.radius.lg`,
      Visible: `!${self}.IsLoading And !${self}.HasLoadError`,
      Width: "Parent.Width",
      X: "0",
      Y: "0"
    },
    children: [
      {
        name: "txtLabel",
        control: "ModernText@1.0.0",
        properties: {
          AutoHeight: "true",
          Color: `If(${self}.Style = "Filled", ColorValue(${resolvedIconColor}), ${self}.StyleConfig.colors.textMuted)`,
          FontWeight: "FontWeight.Semibold",
          Size: `${self}.StyleConfig.type.label.size`,
          Text: `Upper(${self}.Label)`,
          VerticalAlign: "VerticalAlign.Top",
          Wrap: "false",
          Width: `If(${self}.Style = "Compact", ${cardWidthExpr} - 92, ${self}.Style = "Minimal", ${cardWidthExpr} - 40, ${cardWidthExpr} - 48)`,
          X: `If(${self}.Style = "Compact", 76, 20)`,
          Y: `If(${isDense}, 16, 20)`
        }
      },
      {
        name: "cntValueRow",
        control: "GroupContainer@1.5.0",
        variant: "AutoLayout",
        properties: {
          BorderStyle: "BorderStyle.None",
          DropShadow: "DropShadow.None",
          Height: `If(${self}.Style = "Chart", 32, ${isDense}, 32, 48)`,
          LayoutAlignItems: "LayoutAlignItems.End",
          LayoutDirection: "LayoutDirection.Horizontal",
          LayoutGap: "6",
          Width: `If(${self}.Style = "Compact", ${cardWidthExpr} - 92, ${self}.Style = "Minimal", ${cardWidthExpr} - 40, ${cardWidthExpr} - 48)`,
          X: `If(${self}.Style = "Compact", 76, 20)`,
          Y: `If(${isDense}, 52, ${self}.Style = "Chart", 46, 50)`
        },
        children: [
          {
            name: "txtValue",
            control: "ModernText@1.0.0",
            properties: {
              AutoHeight: "true",
              Color: `If(${self}.Style = "Filled", ColorValue(${resolvedIconColor}), ${self}.StyleConfig.colors.text)`,
              FillPortions: "1",
              FontWeight: "FontWeight.Bold",
              Size: `If(${self}.Style = "Chart", ${self}.StyleConfig.type.value.sizeCompact, ${isDense}, ${self}.StyleConfig.type.value.sizeCompact, ${self}.StyleConfig.type.value.size)`,
              Text: formattedValue
            }
          },
          {
            name: "txtPercentInline",
            control: "ModernText@1.0.0",
            properties: {
              AutoHeight: "true",
              Color: trendColor,
              FontWeight: "FontWeight.Semibold",
              Size: `${self}.StyleConfig.type.body.size`,
              Text: trendText,
              Visible: `And(Or(${self}.Style = "Compact", ${self}.Style = "Chart"), !IsBlankOrError(${self}.PercentChange))`,
              Width: "70"
            }
          }
        ]
      },
      {
        name: "imgSparkline",
        control: "Image@2.2.3",
        properties: {
          BorderStyle: "BorderStyle.None",
          Height: `If(${self}.Style = "Chart", 96, 36)`,
          Image: sparklineImage,
          Visible: `And(Or(${self}.Style = "Standard", ${self}.Style = "Chart"), ${self}.SparklineData <> "")`,
          Width: `If(${self}.Style = "Chart", ${cardWidthExpr}, ${cardWidthExpr} - 48)`,
          X: `If(${self}.Style = "Chart", 0, 20)`,
          Y: `If(${self}.Style = "Chart", ${cardHeightExpr} - 96, 106)`
        }
      },
      {
        name: "btnNoSparkline",
        control: "Classic/Button@2.2.0",
        properties: {
          BorderStyle: "BorderStyle.None",
          Color: `${self}.StyleConfig.colors.textMuted`,
          Fill: `${self}.StyleConfig.colors.skeletonBase`,
          Size: "11",
          Text: '"No trend data"',
          Visible: `${self}.Style = "Chart" And ${self}.SparklineData = ""`,
          Width: cardWidthExpr,
          Height: "96",
          Y: `${cardHeightExpr} - 96`
        }
      },
      {
        name: "cntTargetRow",
        control: "GroupContainer@1.5.0",
        variant: "ManualLayout",
        properties: {
          BorderStyle: "BorderStyle.None",
          Height: "20",
          Visible: showTargetRow,
          Width: `${cardWidthExpr} - 48`,
          X: "20",
          Y: `${cardHeightExpr} - 24 - 16 - 28`
        },
        children: [
          {
            name: "rectTargetTrack",
            control: "Classic/Button@2.2.0",
            properties: {
              BorderStyle: "BorderStyle.None",
              Fill: `${self}.StyleConfig.colors.skeletonBase`,
              Height: "4",
              RadiusTopLeft: "2",
              RadiusTopRight: "2",
              RadiusBottomLeft: "2",
              RadiusBottomRight: "2",
              Text: '""',
              Width: "Parent.Width",
              Y: "0"
            }
          },
          {
            name: "rectTargetFill",
            control: "Classic/Button@2.2.0",
            properties: {
              BorderStyle: "BorderStyle.None",
              Fill: `If(${self}.Style = "Filled", ColorValue(${resolvedIconColor}), ${self}.StyleConfig.colors.positive)`,
              Height: "4",
              RadiusTopLeft: "2",
              RadiusTopRight: "2",
              RadiusBottomLeft: "2",
              RadiusBottomRight: "2",
              Text: '""',
              Width: `Parent.Width * ${targetRatio}`,
              Y: "0"
            }
          },
          {
            name: "txtTargetLabel",
            control: "ModernText@1.0.0",
            properties: {
              AutoHeight: "true",
              Color: `If(${self}.Style = "Filled", ColorValue(${resolvedIconColor}), ${self}.StyleConfig.colors.textMuted)`,
              Size: `${self}.StyleConfig.type.body.size`,
              Text: targetText,
              Wrap: "false",
              Y: "8"
            }
          }
        ]
      },
      {
        name: "cntKPIFooter",
        control: "GroupContainer@1.5.0",
        variant: "AutoLayout",
        properties: {
          BorderStyle: "BorderStyle.None",
          DropShadow: "DropShadow.None",
          Height: "24",
          LayoutAlignItems: "LayoutAlignItems.Center",
          LayoutDirection: "LayoutDirection.Horizontal",
          LayoutGap: "4",
          Visible: `!Or(${self}.Style = "Compact", ${self}.Style = "Minimal", ${self}.Style = "Chart")`,
          Width: `${cardWidthExpr} - 48`,
          X: "20",
          Y: `${cardHeightExpr} - Self.Height - 16`
        },
        children: [
          {
            name: "txtFooterPercent",
            control: "ModernText@1.0.0",
            properties: {
              AutoHeight: "true",
              Color: trendColor,
              FontWeight: "FontWeight.Semibold",
              Size: `${self}.StyleConfig.type.body.size`,
              Text: trendText,
              Visible: `!IsBlankOrError(${self}.PercentChange)`,
              Width: "70"
            }
          },
          {
            name: "txtFooterSub",
            control: "ModernText@1.0.0",
            properties: {
              AutoHeight: "true",
              Color: `If(${self}.Style = "Filled", ColorValue(${resolvedIconColor}), ${self}.StyleConfig.colors.neutral)`,
              FillPortions: "1",
              Size: `${self}.StyleConfig.type.body.size`,
              Text: `${self}.PercentLabel`,
              Visible: `!IsBlankOrError(${self}.PercentLabel)`,
              Wrap: "false"
            }
          }
        ]
      },
      {
        name: "btnIconBg",
        control: "Classic/Button@2.2.0",
        properties: {
          BorderStyle: "BorderStyle.None",
          Fill: `ColorValue(${resolvedIconBg})`,
          Height: "44",
          Width: "44",
          RadiusTopLeft: "22",
          RadiusTopRight: "22",
          RadiusBottomLeft: "22",
          RadiusBottomRight: "22",
          Text: '""',
          Visible: `!Or(${self}.Style = "Filled", ${self}.Style = "Minimal", ${self}.Style = "Chart")`,
          X: `If(${self}.Style = "Compact", 16, Parent.Width - Self.Width - 20)`,
          Y: `If(${self}.Style = "Compact", (Parent.Height - Self.Height) / 2, 20)`
        }
      },
      {
        name: "imgIconKPI",
        control: "Image@2.2.3",
        properties: {
          BorderStyle: "BorderStyle.None",
          Height: "22",
          Width: "22",
          Image: iconImage,
          Visible: `!Or(${self}.Style = "Filled", ${self}.Style = "Minimal", ${self}.Style = "Chart")`,
          X: "btnIconBg.X + 11",
          Y: "btnIconBg.Y + 11"
        }
      },
      {
        name: "btnCardOverlay",
        control: "Classic/Button@2.2.0",
        properties: {
          AccessibleLabel: `Coalesce(${self}.AccessibilityLabel, ${self}.Label)`,
          BorderStyle: "BorderStyle.None",
          Fill: "Color.Transparent",
          HoverFill: "RGBA(0, 0, 0, 0.03)",
          Height: "Parent.Height",
          Width: "Parent.Width",
          Text: '""',
          OnSelect: `${self}.OnSelect()`
        }
      }
    ]
  };

  const cntSkeletonCard = {
    name: "cntSkeletonCard",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: {
      BorderColor: `${self}.StyleConfig.colors.border`,
      BorderThickness: "1",
      Fill: `${self}.StyleConfig.colors.cardBg`,
      Height: "Parent.Height",
      RadiusTopLeft: `${self}.StyleConfig.radius.lg`,
      RadiusTopRight: `${self}.StyleConfig.radius.lg`,
      RadiusBottomLeft: `${self}.StyleConfig.radius.lg`,
      RadiusBottomRight: `${self}.StyleConfig.radius.lg`,
      Visible: `${self}.IsLoading And !${self}.HasLoadError`,
      Width: "Parent.Width",
      X: "0",
      Y: "0"
    },
    children: [
      { name: "btnSkeletonLabel", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: `${self}.StyleConfig.colors.skeletonBase`, Height: "10", Width: "72", RadiusTopLeft: "4", RadiusTopRight: "4", RadiusBottomLeft: "4", RadiusBottomRight: "4", Text: '""', X: "20", Y: "22" } },
      { name: "btnSkeletonValue", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: `${self}.StyleConfig.colors.skeletonBase`, Height: "24", Width: "56", RadiusTopLeft: "4", RadiusTopRight: "4", RadiusBottomLeft: "4", RadiusBottomRight: "4", Text: '""', X: "20", Y: "46" } },
      { name: "btnSkeletonChart", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: `${self}.StyleConfig.colors.skeletonBase`, Height: "96", Width: "cntSkeletonCard.Width", Text: '""', Visible: `${self}.Style = "Chart"`, Y: "cntSkeletonCard.Height - 96" } },
      { name: "btnSkeletonFooter", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: `${self}.StyleConfig.colors.skeletonShine`, Height: "10", Width: "110", RadiusTopLeft: "4", RadiusTopRight: "4", RadiusBottomLeft: "4", RadiusBottomRight: "4", Text: '""', Visible: `${self}.Style = "Standard"`, X: "20", Y: "cntSkeletonCard.Height - 28" } },
      { name: "btnSkeletonIcon", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: `${self}.StyleConfig.colors.skeletonBase`, Height: "44", Width: "44", RadiusTopLeft: "22", RadiusTopRight: "22", RadiusBottomLeft: "22", RadiusBottomRight: "22", Text: '""', Visible: `!Or(${self}.Style = "Filled", ${self}.Style = "Minimal", ${self}.Style = "Chart")`, X: "Parent.Width - 64", Y: "20" } }
    ]
  };

  // A third, distinct state alongside the normal card and the loading
  // skeleton — matching this catalog's own Activity Timeline precedent
  // (HasLoadError is a different state from IsLoading, not a repurposing
  // of it: a metric that hasn't loaded yet and one whose last fetch
  // failed need different messages and a different recovery action).
  // OnRetry is a real, focusable button's OnSelect, not a silent
  // auto-retry, so a host controls exactly when the retry actually runs.
  const cntErrorCard = {
    name: "cntErrorCard",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: {
      BorderColor: `${self}.StyleConfig.colors.border`,
      BorderThickness: "1",
      Fill: `${self}.StyleConfig.colors.cardBg`,
      Height: "Parent.Height",
      RadiusTopLeft: `${self}.StyleConfig.radius.lg`,
      RadiusTopRight: `${self}.StyleConfig.radius.lg`,
      RadiusBottomLeft: `${self}.StyleConfig.radius.lg`,
      RadiusBottomRight: `${self}.StyleConfig.radius.lg`,
      Visible: `${self}.HasLoadError`,
      Width: "Parent.Width",
      X: "0",
      Y: "0"
    },
    children: [
      {
        name: "txtErrorLabel",
        control: "ModernText@1.0.0",
        properties: {
          AutoHeight: "true",
          Color: `${self}.StyleConfig.colors.textMuted`,
          FontWeight: "FontWeight.Semibold",
          Size: `${self}.StyleConfig.type.label.size`,
          Text: `Upper(${self}.Label)`,
          Wrap: "false",
          Width: "cntErrorCard.Width - 40",
          X: "20",
          Y: "20"
        }
      },
      {
        name: "txtErrorMessage",
        control: "ModernText@1.0.0",
        properties: {
          AutoHeight: "true",
          Color: `${self}.StyleConfig.colors.negative`,
          FontWeight: "FontWeight.Semibold",
          Size: `${self}.StyleConfig.type.body.size`,
          Text: '"Couldn\'t load this metric"',
          Wrap: "true",
          Width: "cntErrorCard.Width - 40",
          X: "20",
          Y: "50"
        }
      },
      {
        name: "btnRetry",
        control: "Classic/Button@2.2.0",
        properties: {
          BorderColor: `${self}.StyleConfig.colors.border`,
          BorderThickness: "1",
          BorderStyle: "BorderStyle.Solid",
          Color: `${self}.StyleConfig.colors.text`,
          Fill: "Color.Transparent",
          Size: `${self}.StyleConfig.type.body.size`,
          Text: '"Retry"',
          RadiusTopLeft: `${self}.StyleConfig.radius.md`,
          RadiusTopRight: `${self}.StyleConfig.radius.md`,
          RadiusBottomLeft: `${self}.StyleConfig.radius.md`,
          RadiusBottomRight: `${self}.StyleConfig.radius.md`,
          Height: "32",
          Width: "72",
          X: "20",
          Y: "Parent.Height - 52",
          OnSelect: `${self}.OnRetry()`
        }
      }
    ]
  };

  return {
    // A fixed default size — one card, not a full-width row. A host
    // resizes the pasted instance per-placement the normal Studio way
    // (drag/Properties panel), same as any other single component.
    properties: { Height: cardHeight, Width: "280" },
    children: [conKPICard, cntSkeletonCard, cntErrorCard]
  };
}

export const CHILDREN_BUILDERS = {
  "KPI Card": kpiCard
};
