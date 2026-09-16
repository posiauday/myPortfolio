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

   Past the initial single-card rebuild, four more real, data-practice
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
   Activity Timeline already uses). A fifth, Tone, makes IconBg/IconColor
   themselves dynamic: "Custom" (the default) uses them exactly as
   authored; Positive/Warning/Negative/Neutral/Info instead resolves both
   from StyleConfig's own already-contrast-checked token pairs, so a
   card's color follows the *kind* of metric it shows rather than a hex
   pair the host has to hand-pick and separately verify for contrast
   every time.

   A sixth attempt — AccessibilityLabel, wired to btnCardOverlay's
   AccessibleLabel — was reverted: a real Studio PA2108 paste error
   confirmed Classic/Button@2.2.0 has no such property, despite it being
   documented as a common canvas-apps accessibility property generally.
   That reference describes the platform, not every specific versioned
   control — the same "docs describe it, a real paste rejects it" gap
   this catalog's Rectangle/Radius* finding already burned once. See
   scripts/validate-yaml.mjs's KNOWN_INVALID_CONTROL_PROPERTIES and the
   skill file for the durable record. */
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

/* Notification Badge — one small overlay indicator, placed on or beside
   the icon/button it decorates. Same failure-mode-3 shape check KPI
   Card went through: "Badge" is one thing (you place one per spot,
   same as a real notification dot on a bell or app icon), never a
   list — so no Data/Table property or Gallery here either, matching
   the real Badge reference the user shared (which was already
   correctly single-instance; the shape question here was easy).

   Real techniques kept from that reference — a Timer-driven pulse
   animation reading Timer.Value/Timer.Duration directly inside a
   sibling control's own formula (CONFIRMED real via Timer@2.1.0's own
   documented properties and STRONG EVIDENCE from real shipped
   .pa.yaml files using this exact pattern), an SVG bell icon — rebuilt
   around this catalog's own established patterns instead of copied
   verbatim: the same Tone/StyleConfig.tones dynamic-color-by-kind
   design KPI Card uses (rather than a single fixed BadgeColor), the
   same SVG-icon-library-with-COLOR-placeholder technique, and a real,
   composed AccessibleLabel on the bell Image (CONFIRMED via Image@2.2.3's
   own dedicated docs page and real .pa.yaml files setting it on this
   exact control version) instead of the legacy Text@0.0.51/
   'TextCanvas.Align'.Center syntax the reference used, which this
   catalog has no way to independently verify and doesn't need —
   ModernText@1.0.0 (already STRONG EVIDENCE elsewhere in this file)
   covers the count text just as well.

   AccessibleLabel was NOT attempted on the overlay button — a real
   PA2108 paste error already confirmed Classic/Button@2.2.0 has no
   such property (see this file's KPI Card section and the skill file's
   control-property table); the bell Image's own AccessibleLabel is
   this component's real, disclosed mitigation instead (see
   componentLibrary.js's Accessibility/Limitations for the honest
   account of what that does and doesn't cover). */
function notificationBadge(pascal) {
  const self = `cmp${pascal}`;

  const hasBadge = `Or(${self}.HasNotifications, ${self}.Count > 0)`;

  // Same resolved-color-everywhere pattern as KPI Card's own
  // resolvedIconBg/resolvedIconColor: every control below reads this,
  // never Tone or BadgeColor directly, so the two can never disagree.
  const resolvedBadgeColor = `Switch(Lower(Coalesce(${self}.Tone, "custom")), "negative", ${self}.StyleConfig.tones.negative, "warning", ${self}.StyleConfig.tones.warning, "positive", ${self}.StyleConfig.tones.positive, "neutral", ${self}.StyleConfig.tones.neutral, "info", ${self}.StyleConfig.tones.info, ${self}.BadgeColor)`;

  const resolvedIconColor = `If(!IsBlank(${self}.IconColor) And ${self}.IconColor <> "" And ${self}.IconColor <> "Auto", ${self}.IconColor, If(${self}.Theme = "Dark", "#FFFFFF", "#111827"))`;

  const iconImage = `"data:image/svg+xml;utf8," & EncodeUrl(Substitute(LookUp(${self}.Icons, Name = ${self}.Icon, SVG), "COLOR", ${resolvedIconColor}))`;

  const countText = `If(${self}.Count > ${self}.MaxCount, Text(${self}.MaxCount) & "+", If(${self}.Count > 0, Text(${self}.Count), ""))`;

  // Real, composed announcement for the bell Image's own AccessibleLabel
  // — the actual unread state, not just "bell icon".
  const badgeAnnouncement = `"Notifications" & If(${self}.Count > 0, ", " & ${countText} & " unread", If(${self}.HasNotifications, ", new activity", ", none unread"))`;

  const cntIconContainer = {
    name: "cntIconContainer",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: {
      BorderColor: `If(${self}.Theme = "Dark", RGBA(55, 65, 81, 1), RGBA(229, 231, 235, 1))`,
      BorderThickness: "1",
      DropShadow: "DropShadow.None",
      Fill: `If(${self}.Theme = "Dark", RGBA(31, 41, 55, 1), RGBA(243, 244, 246, 1))`,
      Height: "Parent.Height",
      RadiusTopLeft: `${self}.Size * 0.22`,
      RadiusTopRight: `${self}.Size * 0.22`,
      RadiusBottomLeft: `${self}.Size * 0.22`,
      RadiusBottomRight: `${self}.Size * 0.22`,
      Width: "Parent.Width",
      X: "0",
      Y: "0"
    },
    children: [
      {
        name: "imgIcon",
        control: "Image@2.2.3",
        properties: {
          AccessibleLabel: badgeAnnouncement,
          BorderStyle: "BorderStyle.None",
          Height: "Parent.Height",
          Image: iconImage,
          PaddingBottom: "Parent.Height * 0.15",
          PaddingLeft: "Parent.Width * 0.15",
          PaddingRight: "Parent.Width * 0.15",
          PaddingTop: "Parent.Height * 0.15",
          Width: "Parent.Width",
          X: "0",
          Y: "0"
        }
      }
    ]
  };

  // Real technique (Timer@2.1.0's own Value/Duration read directly
  // inside a sibling GroupContainer's Height/Fill formulas — STRONG
  // EVIDENCE from a real shipped pnp/powerplatform-snippets component
  // using this identical pattern). Hex2Dec(Mid(hex, N, 2)) pulls real
  // R/G/B components from the same resolved Tone hex string the badge
  // circle itself uses, so the ring fades the *same* color rather than
  // a second, separately-authored one.
  const cntPulseRing = {
    name: "cntPulseRing",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: {
      BorderStyle: "BorderStyle.None",
      DropShadow: "DropShadow.None",
      Fill: `With({hex: ${resolvedBadgeColor}}, RGBA(Hex2Dec(Mid(hex, 2, 2)), Hex2Dec(Mid(hex, 4, 2)), Hex2Dec(Mid(hex, 6, 2)), Max(0, 0.35 * (1 - (tmrPulse.Value / tmrPulse.Duration)))))`,
      Height: "cntCountBadge.Height + 14 * Power(tmrPulse.Value / tmrPulse.Duration, 0.6)",
      RadiusTopLeft: "Self.Height / 2",
      RadiusTopRight: "Self.Height / 2",
      RadiusBottomLeft: "Self.Height / 2",
      RadiusBottomRight: "Self.Height / 2",
      Visible: `And(${self}.Pulse, ${hasBadge})`,
      Width: "Self.Height",
      X: "cntCountBadge.X + cntCountBadge.Width / 2 - Self.Width / 2",
      Y: "cntCountBadge.Y + cntCountBadge.Height / 2 - Self.Height / 2"
    },
    children: [
      {
        name: "tmrPulse",
        control: "Timer@2.1.0",
        properties: {
          AutoPause: "false",
          AutoStart: "true",
          Duration: "1400",
          Height: "1",
          Repeat: "true",
          Start: `And(${self}.Pulse, ${hasBadge})`,
          Visible: "false",
          Width: "1"
        }
      }
    ]
  };

  const cntCountBadge = {
    name: "cntCountBadge",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: {
      BorderColor: "RGBA(255, 255, 255, 1)",
      BorderThickness: "2",
      DropShadow: "DropShadow.None",
      Fill: `ColorValue(${resolvedBadgeColor})`,
      Height: `If(${self}.Count > 0, Min(20, ${self}.Size * 0.45), 12)`,
      RadiusTopLeft: "Self.Height / 2",
      RadiusTopRight: "Self.Height / 2",
      RadiusBottomLeft: "Self.Height / 2",
      RadiusBottomRight: "Self.Height / 2",
      Visible: hasBadge,
      Width: `If(${self}.Count > 0, Max(Self.Height, If(${self}.Count > ${self}.MaxCount, 26, If(${self}.Count > 9, 22, Self.Height))), 12)`,
      X: "Parent.Width - Self.Width - 2",
      Y: "2"
    },
    children: [
      {
        name: "txtCount",
        control: "ModernText@1.0.0",
        properties: {
          AutoHeight: "false",
          Color: "RGBA(255, 255, 255, 1)",
          FontWeight: "FontWeight.Bold",
          Height: "Parent.Height",
          Size: "Max(7, Parent.Height * 0.5)",
          Text: countText,
          VerticalAlign: "VerticalAlign.Middle",
          Visible: `${self}.Count > 0`,
          Width: "Parent.Width",
          Wrap: "false",
          X: "0",
          Y: "0"
        }
      }
    ]
  };

  const btnOverlay = {
    name: "btnOverlay",
    control: "Classic/Button@2.2.0",
    properties: {
      BorderStyle: "BorderStyle.None",
      Fill: "Color.Transparent",
      HoverFill: `If(${self}.Theme = "Dark", RGBA(255, 255, 255, 0.08), RGBA(0, 0, 0, 0.05))`,
      Height: "Parent.Height",
      Width: "Parent.Width",
      Text: '""',
      OnSelect: `${self}.OnSelect()`
    }
  };

  return {
    // A square, fixed by Size alone — the icon container, badge and
    // pulse ring are all sized proportionally from this one property,
    // matching the real reference's own Height/Width: Badge.Size.
    properties: { Fill: "Color.Transparent", Height: `${self}.Size`, Width: `${self}.Size` },
    children: [cntIconContainer, cntPulseRing, cntCountBadge, btnOverlay]
  };
}

/* Responsive Line Chart — one Image control, exactly as its own
   architecture bullet already promised ("The whole chart is one Image
   control rendering an inline SVG"). ChartData is a real Table
   (x/y/label columns, auto-sorted by x via Sort()), not the comma-
   separated Text string KPI Card's own sparkline reads — this is a
   full chart, not a decorative trend glyph, so it gets its own real
   data-driven axis: the earlier hand-authored preview mockup drew
   fixed "Jan/Apr/Jul/Oct/Dec" text baked into the JSX, but a real
   Children tree has no excuse for that when ChartData already carries
   a real per-row `label` column — three of those (first/middle/last)
   render as real axis text pulled from the data instead.

   Smooth reuses the sparkline's polyline technique for the straight
   case, and for the curved case threads a standard hand-rolled
   "M -> Q -> repeated T -> L" quadratic-through-midpoints curve rather
   than a full Catmull-Rom-to-cubic-Bezier conversion — real, and it
   only ever needs each point's immediate neighbor (one ForAll over
   adjacent pairs), not a four-point lookback/lookahead window, so it
   stays a single pass over Sequence(cnt - 1) like the straight case.

   Animate ("staggered draw-in") is a real Timer-driven Image.Opacity
   fade-in (the same Timer.Value/Timer.Duration-in-a-sibling-formula
   pattern as Notification Badge's pulse ring) rather than a literal
   per-point reveal timeline, which raw Power Fx over one static Image
   has no way to express — a deliberate, disclosed simplification, not
   an oversight. */
function responsiveLineChart(pascal) {
  const self = `cmp${pascal}`;
  const w = 320, h = 140, pad = 10, axisH = 22, viewH = h + axisH;

  const straightSegments = `Concat(Sequence(cnt - 1), " L " & Text(Round(Index(nums, Value + 1).px, 1)) & "," & Text(Round(Index(nums, Value + 1).py, 1)), "")`;
  const smoothSegments = `" Q " & Text(Round(Index(nums, 1).px, 1)) & "," & Text(Round(Index(nums, 1).py, 1)) & " " & Concat(Sequence(cnt - 1), Text(Round((Index(nums, Value).px + Index(nums, Value + 1).px) / 2, 1)) & "," & Text(Round((Index(nums, Value).py + Index(nums, Value + 1).py) / 2, 1)) & If(Value < cnt - 1, " T ", ""), "") & " L " & Text(Round(Index(nums, cnt).px, 1)) & "," & Text(Round(Index(nums, cnt).py, 1))`;
  const linePath = `"M " & Text(Round(Index(nums, 1).px, 1)) & "," & Text(Round(Index(nums, 1).py, 1)) & If(${self}.Smooth, ${smoothSegments}, ${straightSegments})`;

  const markersLayer = `If(${self}.Markers, Concat(Sequence(cnt), "<circle cx='" & Text(Round(Index(nums, Value).px, 1)) & "' cy='" & Text(Round(Index(nums, Value).py, 1)) & "' r='2.5' fill='" & ${self}.LineColor & "'/><text x='" & Text(Round(Index(nums, Value).px, 1)) & "' y='" & Text(Max(9, Round(Index(nums, Value).py, 1) - 8)) & "' text-anchor='middle' font-size='9' font-weight='700' fill='" & ${self}.LineColor & "'>" & Text(Round(Index(nums, Value).n, 0)) & Coalesce(${self}.MarkerSuffix, "") & "</text>", ""), "")`;
  const axisLabels = `Concat(Sequence(cnt), If(Value = 1 Or Value = RoundUp(cnt / 2, 0) Or Value = cnt, "<text x='" & Text(Round(Index(nums, Value).px, 1)) & "' y='" & ${h + 16} & "' text-anchor='middle' font-size='9' font-weight='700' fill='#94A3B8'>" & Index(nums, Value).lbl & "</text>", ""), "")`;

  // Built across multiple lines here purely for human readability —
  // collapsed to one line before use, since the YAML emitter's block
  // scalar only ever indents the single line it's handed (pushRawFormula
  // in componentDocs.js), not a formula's own embedded newlines. None of
  // the pieces above contain a real newline inside a quoted string, so
  // collapsing whitespace around line breaks can't corrupt any literal.
  const svgUri = `With(
    {sorted: Sort(${self}.ChartData, x), cnt: CountRows(${self}.ChartData)},
    If(cnt < 2, Blank(),
      With(
        {maxY: Max(If(${self}.YAxisMax > 0, ${self}.YAxisMax, RoundUp(Max(sorted, y) * 1.15, -1)), 1)},
        With(
          {nums: ForAll(Sequence(cnt), {n: Index(sorted, Value).y, lbl: Index(sorted, Value).label, px: ${pad} + (Value - 1) * (${w} - ${pad * 2}) / (cnt - 1), py: ${h - pad} - (Index(sorted, Value).y / maxY) * ${h - pad * 2}})},
          "data:image/svg+xml;utf8," & EncodeUrl(
            "<svg viewBox='0 0 ${w} ${viewH}' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='lc' x1='0' y1='0' x2='0' y2='1'><stop offset='0%' stop-color='" & ${self}.LineColor & "' stop-opacity='0.35'/><stop offset='100%' stop-color='" & ${self}.LineColor & "' stop-opacity='0'/></linearGradient></defs><path d='" &
            ${linePath} & " L " & Text(Round(Index(nums, cnt).px, 1)) & "," & ${h - pad} & " L " & Text(Round(Index(nums, 1).px, 1)) & "," & ${h - pad} & " Z' fill='url(#lc)'/><path d='" &
            ${linePath} &
            "' fill='none' stroke='" & ${self}.LineColor & "' stroke-width='2.5' stroke-linecap='round'/>" &
            ${markersLayer} &
            ${axisLabels} &
            "</svg>"
          )
        )
      )
    )
  )`.replace(/\s*\n\s*/g, " ");

  const tmrAnimate = {
    name: "tmrChartAnimate",
    control: "Timer@2.1.0",
    properties: {
      AutoPause: "false",
      AutoStart: `${self}.Animate`,
      Duration: "600",
      Height: "1",
      Repeat: "false",
      Start: `${self}.Animate`,
      Visible: "false",
      Width: "1"
    }
  };

  const imgChart = {
    name: "imgChart",
    control: "Image@2.2.3",
    properties: {
      AltText: `"Line chart, " & CountRows(${self}.ChartData) & " points, " & ${self}.LineColor & " line"`,
      Height: "Parent.Height",
      Image: svgUri,
      ImagePosition: "ImagePosition.Fit",
      Opacity: `If(${self}.Animate, Min(tmrChartAnimate.Value / tmrChartAnimate.Duration, 1), 1)`,
      Width: "Parent.Width",
      X: "0",
      Y: "0"
    }
  };

  return {
    properties: { Fill: "Color.Transparent", Height: `${viewH}`, Width: `${w}` },
    children: [tmrAnimate, imgChart]
  };
}

/* Command Card — the same three-tile-plus-bar-chart executive summary
   this site's own hero section renders (see componentLibrary.js's own
   architecture note). No Style property existed in the original
   contract even though Variants documented four real states
   (Standard/Metrics only/Chart only/Compact) — added one here, the
   same single-Children-tree-plus-Switch pattern every other
   multi-variant component in this file already uses, rather than
   leaving those four variants as illustration-only text with nothing
   real behind them.

   The bar chart is a real data-driven Gallery of Classic/Button bars
   (each one individually selectable, firing OnChartSelect with its own
   ChartData row), not a static SVG Image — a Gallery already gives
   real per-bar interactivity for free, which a rasterized SVG inside
   one Image control cannot. ChartData's own `x` column doubles as each
   bar's stable identity for HighlightIndex to match against, since a
   Gallery template has no built-in zero-based index property to read. */
function commandCard(pascal) {
  const self = `cmp${pascal}`;
  const isCompact = `${self}.Style = "Compact"`;
  const showMetrics = `Or(${self}.Style = "Standard", ${self}.Style = "Metrics only", ${isCompact})`;
  const showChart = `Or(${self}.Style = "Standard", ${self}.Style = "Chart only")`;
  const cardHeight = `Switch(${self}.Style, "Metrics only", 176, "Chart only", 168, "Compact", 132, 300)`;
  const toneColor = `Switch(ThisItem.Tone, "Positive", "#2E7D32", "Negative", "#C62828", "#475569")`;

  const cntCard = {
    name: "cntCard",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: {
      BorderStyle: "BorderStyle.None",
      DropShadow: "DropShadow.Regular",
      Fill: "Color.White",
      Height: "Parent.Height",
      RadiusBottomLeft: "20", RadiusBottomRight: "20", RadiusTopLeft: "20", RadiusTopRight: "20",
      Width: "Parent.Width"
    },
    children: [
      { name: "lblEyebrow", control: "ModernText@1.0.0", properties: { AutoHeight: "false", Color: "RGBA(100, 116, 139, 1)", FontWeight: "FontWeight.Bold", Height: "14", Size: "10", Text: `Upper(${self}.Eyebrow)`, Width: "Parent.Width - 40", X: "20", Y: "18" } },
      { name: "lblTitle", control: "ModernText@1.0.0", properties: { AutoHeight: "false", FontWeight: "FontWeight.Bold", Height: "28", Size: "20", Text: `${self}.Title`, Width: "Parent.Width - 40", X: "20", Y: "36" } },
      {
        name: "galMetrics",
        control: "Gallery@2.15.0",
        variant: "Vertical",
        properties: {
          Height: "76",
          Items: `If(${isCompact}, FirstN(${self}.Metrics, 2), ${self}.Metrics)`,
          TemplateSize: `If(${isCompact}, 150, 100)`,
          Visible: showMetrics,
          Width: "Parent.Width - 40",
          WrapCount: `If(${isCompact}, 2, 3)`,
          X: "20",
          Y: "72"
        },
        children: [
          {
            name: "cntTile",
            control: "GroupContainer@1.5.0",
            variant: "ManualLayout",
            properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "60", Width: "88" },
            children: [
              { name: "lblTileLabel", control: "ModernText@1.0.0", properties: { Color: "RGBA(100, 116, 139, 1)", Height: "16", Size: "11", Text: "ThisItem.Label", Width: "88", X: "0", Y: "0" } },
              { name: "lblTileValue", control: "ModernText@1.0.0", properties: { Color: toneColor, FontWeight: "FontWeight.Bold", Height: "26", Size: "18", Text: "ThisItem.Value", Width: "88", X: "0", Y: "18" } },
              { name: "btnTileTap", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "60", OnSelect: `${self}.OnMetricSelect(ThisItem)`, Text: '""', Width: "88" } }
            ]
          }
        ]
      },
      {
        name: "galChart",
        control: "Gallery@2.15.0",
        variant: "Vertical",
        properties: {
          Height: "70",
          Items: `${self}.ChartData`,
          TemplateSize: "30",
          Visible: showChart,
          Width: "Parent.Width - 40",
          WrapCount: `CountRows(${self}.ChartData)`,
          X: "20",
          Y: `If(${showMetrics}, 158, 76)`
        },
        children: [
          {
            name: "btnBar",
            control: "Classic/Button@2.2.0",
            properties: {
              BorderStyle: "BorderStyle.None",
              Fill: `If(ThisItem.x = ${self}.HighlightIndex, "#168326", "#CBD5E1")`,
              Height: `Max(4, ThisItem.y / Max(${self}.ChartData, y) * 60)`,
              OnSelect: `${self}.OnChartSelect(ThisItem.x, ThisItem.y)`,
              RadiusBottomLeft: "2", RadiusBottomRight: "2", RadiusTopLeft: "2", RadiusTopRight: "2",
              Text: '""',
              Width: "16",
              Y: "70 - Self.Height"
            }
          }
        ]
      }
    ]
  };

  return {
    properties: { Height: cardHeight, Width: "340" },
    children: [cntCard]
  };
}

/* Program Scorecard — a real Gallery of RAG cards, each metric's Tone
   colored the same dark-text-on-light-surface palette this catalog's
   own KPI Card tones already established (a safe reuse: same role,
   text on a near-white surface, not the tint-vs-solid role switch that
   broke Notification Badge's first attempt — see the skill file's
   failure mode 4). ShowTrend needed a real per-metric series to draw
   from that the original Metrics contract didn't have (Name/Value/
   Target/Tone only) — added a Trend column (the same comma-separated-
   numbers shape KPI Card's own SparklineData uses) rather than leaving
   a documented, host-facing property with no real data behind it. */
function programScorecard(pascal) {
  const self = `cmp${pascal}`;
  const toneColor = `Switch(ThisItem.Tone, "Green", "#2E7D32", "Red", "#C62828", "#BF360C")`;
  const toneStatus = `Switch(ThisItem.Tone, "Green", "On target", "Red", "Off track", "At risk")`;
  const isCompact = `${self}.Style = "Compact"`;
  const isPrint = `${self}.Style = "Print"`;

  const sparkline = `If(${self}.ShowTrend, With({raw: Coalesce(ThisItem.Trend, "")}, If(raw = "", Blank(), With({nums: ForAll(MatchAll(raw, "-?\\d+\\.?\\d*"), {n: Value(FullMatch)})}, With({lo: Min(nums, n), hi: Max(nums, n), cnt: CountRows(nums)}, With({rng: Max(hi - lo, 1)}, "data:image/svg+xml;utf8," & EncodeUrl("<svg viewBox='0 0 100 24' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><polyline fill='none' stroke='" & ${toneColor} & "' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' points='" & Concat(Sequence(cnt), Text(Round((Value - 1) / Max(cnt - 1, 1) * 100, 1)) & "," & Text(Round(22 - (Index(nums, Value).n - lo) / rng * 20, 1)), " ") & "'/></svg>")))))))`;

  const cntMetricCard = {
    name: "cntMetricCard",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderColor: "RGBA(226, 232, 240, 1)", BorderStyle: "BorderStyle.Solid", BorderThickness: "1", Fill: "Color.White", Height: `If(${self}.ShowTrend, 130, 100)`, RadiusBottomLeft: "14", RadiusBottomRight: "14", RadiusTopLeft: "14", RadiusTopRight: "14", Width: "170" },
    children: [
      { name: "lblName", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "18", Size: "12", Text: "ThisItem.Name", Width: "140", X: "16", Y: "14" } },
      { name: "lblValue", control: "ModernText@1.0.0", properties: { Color: toneColor, FontWeight: "FontWeight.Bold", Height: "28", Size: "20", Text: `Text(ThisItem.Value) & " / " & Text(ThisItem.Target)`, Width: "140", X: "16", Y: "34" } },
      { name: "lblStatus", control: "ModernText@1.0.0", properties: { Color: toneColor, FontWeight: "FontWeight.Semibold", Height: "16", Size: "10", Text: toneStatus, Width: "140", X: "16", Y: "62" } },
      { name: "cntThresholdTrack", control: "GroupContainer@1.5.0", variant: "ManualLayout", properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(226, 232, 240, 1)", Height: "5", RadiusBottomLeft: "2.5", RadiusBottomRight: "2.5", RadiusTopLeft: "2.5", RadiusTopRight: "2.5", Visible: `${self}.ShowThresholds`, Width: "140", X: "16", Y: "82" },
        children: [
          { name: "cntThresholdFill", control: "GroupContainer@1.5.0", variant: "ManualLayout", properties: { BorderStyle: "BorderStyle.None", Fill: toneColor, Height: "5", RadiusBottomLeft: "2.5", RadiusBottomRight: "2.5", RadiusTopLeft: "2.5", RadiusTopRight: "2.5", Width: "Min(1, ThisItem.Value / Max(ThisItem.Value, ThisItem.Target, 1)) * Parent.Width" } },
          { name: "btnThresholdTick", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(71, 85, 105, 1)", Height: "9", Text: '""', Width: "2", X: "Min(1, ThisItem.Target / Max(ThisItem.Value, ThisItem.Target, 1)) * Parent.Width - 1", Y: "-2" } }
        ]
      },
      { name: "imgTrend", control: "Image@2.2.3", properties: { Height: "24", Image: sparkline, Visible: `${self}.ShowTrend`, Width: "140", X: "16", Y: "96" } },
      { name: "btnMetricTap", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", OnSelect: `${self}.OnMetricSelect(ThisItem)`, Text: '""', Width: "Parent.Width" } }
    ]
  };

  const cntCard = {
    name: "cntCard",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", DropShadow: "DropShadow.Regular", Fill: "RGBA(248, 250, 252, 1)", Height: "Parent.Height", RadiusBottomLeft: "20", RadiusBottomRight: "20", RadiusTopLeft: "20", RadiusTopRight: "20", Width: "Parent.Width" },
    children: [
      { name: "lblHeading", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "24", Size: "18", Text: '"Scorecard"', Width: "300", X: "20", Y: "18" } },
      { name: "lblPeriod", control: "ModernText@1.0.0", properties: { Color: "RGBA(100, 116, 139, 1)", Height: "16", Size: "11", Text: `${self}.Period`, Width: "220", X: "20", Y: "44" } },
      { name: "btnExport", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(23, 32, 27, 1)", FontWeight: "FontWeight.Bold", Height: "32", OnSelect: `${self}.OnExport(${self}.Metrics, ${self}.Period, ${self}.ExportFormat)`, RadiusBottomLeft: "16", RadiusBottomRight: "16", RadiusTopLeft: "16", RadiusTopRight: "16", Size: "11", Text: `"Export " & ${self}.ExportFormat`, Color: "Color.White", Width: "110", X: "Parent.Width - 130", Y: "18" } },
      {
        name: "galMetrics",
        control: "Gallery@2.15.0",
        variant: "Vertical",
        properties: {
          Height: `If(${isCompact}, CountRows(${self}.Metrics) * 106, RoundUp(CountRows(${self}.Metrics) / If(${isPrint}, 1, 3), 0) * If(${self}.ShowTrend, 140, 110))`,
          Items: `${self}.Metrics`,
          TemplateSize: `If(${isCompact}, 106, If(${self}.ShowTrend, 140, 110))`,
          Width: "Parent.Width - 40",
          WrapCount: `If(Or(${isCompact}, ${isPrint}), 1, 3)`,
          X: "20",
          Y: "72"
        },
        children: [cntMetricCard]
      }
    ]
  };

  return {
    properties: { Height: `72 + If(${isCompact}, CountRows(${self}.Metrics) * 106, RoundUp(CountRows(${self}.Metrics) / If(${isPrint}, 1, 3), 0) * If(${self}.ShowTrend, 140, 110)) + 20`, Width: "380" },
    children: [cntCard]
  };
}

/* Operational Status Banner — a real, full-width strip whose relative-
   time phrasing ("Updated 4 minutes ago") is computed here with
   DateDiff, not the host-side Text()-formatting pass-through pattern
   every other Language property in this catalog uses; this component's
   own architecture already documented that difference explicitly
   ("vor 4 Minuten" for de-DE), so the formula below actually branches
   on Language for real (English/German/Spanish) rather than leaving
   that claim undelivered — the same standard this skill exists to
   hold every other claim in this catalog to. */
function operationalStatusBanner(pascal) {
  const self = `cmp${pascal}`;
  const toneBg = `Switch(${self}.Status, "Degraded", "#FFF3E0", "Outage", "#FFEBEE", "Maintenance", "#EBF5FF", "#E8F5E9")`;
  const toneFg = `Switch(${self}.Status, "Degraded", "#BF360C", "Outage", "#C62828", "Maintenance", "#1565C0", "#2E7D32")`;
  const showAffected = `Or(${self}.Status = "Degraded", ${self}.Status = "Outage")`;

  const relativeTime = `With(
    {mins: DateDiff(${self}.LastUpdated, Now(), TimeUnit.Minutes), lang: Left(Coalesce(${self}.Language, Language()), 2)},
    Switch(lang,
      "de", If(mins < 1, "Gerade eben", If(mins < 60, "Vor " & mins & " Minute" & If(mins <> 1, "n", "") & " aktualisiert", If(mins < 1440, "Vor " & RoundDown(mins / 60, 0) & " Stunde" & If(RoundDown(mins / 60, 0) <> 1, "n", "") & " aktualisiert", "Vor " & RoundDown(mins / 1440, 0) & " Tag" & If(RoundDown(mins / 1440, 0) <> 1, "en", "") & " aktualisiert"))),
      "es", If(mins < 1, "Justo ahora", If(mins < 60, "Actualizado hace " & mins & " minuto" & If(mins <> 1, "s", ""), If(mins < 1440, "Actualizado hace " & RoundDown(mins / 60, 0) & " hora" & If(RoundDown(mins / 60, 0) <> 1, "s", ""), "Actualizado hace " & RoundDown(mins / 1440, 0) & " dia" & If(RoundDown(mins / 1440, 0) <> 1, "s", "")))),
      If(mins < 1, "Just now", If(mins < 60, "Updated " & mins & " minute" & If(mins <> 1, "s", "") & " ago", If(mins < 1440, "Updated " & RoundDown(mins / 60, 0) & " hour" & If(RoundDown(mins / 60, 0) <> 1, "s", "") & " ago", "Updated " & RoundDown(mins / 1440, 0) & " day" & If(RoundDown(mins / 1440, 0) <> 1, "s", "") & " ago")))
    )
  )`.replace(/\s*\n\s*/g, " ");

  const cntBanner = {
    name: "cntBanner",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: toneBg, Height: "Parent.Height", RadiusBottomLeft: "0", RadiusBottomRight: "0", RadiusTopLeft: "0", RadiusTopRight: "0", Width: "Parent.Width" },
    children: [
      { name: "lblMessage", control: "ModernText@1.0.0", properties: { Color: toneFg, FontWeight: "FontWeight.Bold", Height: "20", Size: "13", Text: `${self}.Message`, Width: "Parent.Width - 220", X: "20", Y: "10" } },
      { name: "lblLastUpdated", control: "ModernText@1.0.0", properties: { Color: toneFg, Height: "16", Size: "10", Text: relativeTime, Width: "Parent.Width - 220", X: "20", Y: "30" } },
      {
        name: "galAffected",
        control: "Gallery@2.15.0",
        variant: "Vertical",
        properties: { Height: "22", Items: `${self}.AffectedSystems`, TemplateSize: "110", Visible: showAffected, Width: "Parent.Width - 40", WrapCount: `CountRows(${self}.AffectedSystems)`, X: "20", Y: "50" },
        children: [
          { name: "btnSystemChip", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: toneFg, Fill: "RGBA(255, 255, 255, 0.6)", Height: "20", OnSelect: `${self}.OnDetailsSelect(ThisItem)`, RadiusBottomLeft: "10", RadiusBottomRight: "10", RadiusTopLeft: "10", RadiusTopRight: "10", Size: "10", Text: "ThisItem.Name", Width: "104" } }
        ]
      },
      { name: "btnDetails", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "40", OnSelect: `${self}.OnDetailsSelect(Blank())`, Text: '""', Width: "Parent.Width - 220", X: "0", Y: "0" } },
      { name: "btnDismiss", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: toneFg, Fill: "Color.Transparent", FontWeight: "FontWeight.Bold", Height: "32", OnSelect: `${self}.OnDismiss()`, Size: "16", Text: '"x"', Visible: `${self}.Dismissible`, Width: "32", X: "Parent.Width - 52", Y: "10" } }
    ]
  };

  return {
    properties: { Height: `If(${showAffected}, 82, 58)`, Width: "640" },
    children: [cntBanner]
  };
}

/* Risk Matrix — a real NxN Gallery (bound to Sequence(Size*Size), one
   cell per Gallery item) whose color, count and named-risk text are
   all looked up live from the Risks table for that cell's own
   Likelihood/Impact, not the earlier preview mockup's hardcoded
   per-index count arrays. Risks stays a flat table (Likelihood,
   Impact, Count, optional Name/TrendDirection per row) rather than a
   nested per-cell list of named risks — a cell with several named
   risks is several rows sharing the same Likelihood/Impact, which
   Filter()/Concat() read naturally and keeps every column a plain
   scalar (a nested Table-typed column inside a Table is real but adds
   real complexity this component doesn't need).

   Gallery items bound to Sequence(n) expose their row as
   `ThisItem.Value` inside the template (Sequence's own single column
   is literally named Value) — not a bare `Value`, which is only the
   ForAll iteration variable's name in a *ForAll*, a different context
   this file's other components use for a reason (see KPI Card's
   sparkline). Getting this wrong here would have been a real, silent
   binding bug.

   The grid cell's own text uses Label@2.5.1, not ModernText, because
   this needs Align (CONFIRMED safe on Label; not yet independently
   verified on ModernText — Notification Badge already made the same
   choice to skip an unverified property rather than guess).

   The live search box is this catalog's first real Classic/TextInput
   (STRONG EVIDENCE — see the skill file's control table) — reused as-
   is by name below rather than re-derived, since several other
   upcoming components need the identical live-search pattern. */
function riskMatrix(pascal) {
  const self = `cmp${pascal}`;
  const idx = "ThisItem.Value";
  const likelihood = `(${self}.Size - RoundDown((${idx} - 1) / ${self}.Size, 0))`;
  const impact = `(Mod(${idx} - 1, ${self}.Size) + 1)`;
  const matches = `Filter(${self}.Risks, Likelihood = ${likelihood} And Impact = ${impact})`;
  const totalCount = `Sum(${matches}, Count)`;
  const severity = `(${likelihood} * ${impact}) / (${self}.Size * ${self}.Size)`;
  const cellColor = `If(${severity} <= 0.33, "#DCFCE7", If(${severity} <= 0.66, "#FEF3C7", "#FEE2E2"))`;
  const namedList = `Concat(Filter(${matches}, Name <> Blank()), Name & If(TrendDirection = "Worse", " v", If(TrendDirection = "Better", " ^", "")), ", ")`;
  const cellText = `If(${self}.ShowNames, If(IsBlank(${namedList}), Text(${totalCount}), ${namedList}), Text(${totalCount}))`;
  const gridArea = 240;
  const gridX = `If(${self}.ShowLabels, 28, 8)`;

  const cntCell = {
    name: "cntCell",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: {
      BorderColor: "Color.White", BorderStyle: "BorderStyle.Solid", BorderThickness: "2",
      Fill: cellColor,
      Height: `${gridArea} / ${self}.Size`,
      Width: `${gridArea} / ${self}.Size`
    },
    children: [
      { name: "lblCellText", control: "Label@2.5.1", properties: { Align: "Align.Center", Color: "RGBA(23, 32, 27, 1)", FontWeight: "FontWeight.Bold", Height: "Parent.Height", Size: `If(${self}.ShowNames, 8, 14)`, Text: cellText, Width: "Parent.Width" } },
      { name: "btnCellTap", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", OnSelect: `${self}.OnCellSelect(${likelihood}, ${impact}, ${matches})`, Text: '""', Width: "Parent.Width" } }
    ]
  };

  const galGrid = {
    name: "galGrid",
    control: "Gallery@2.15.0",
    variant: "Vertical",
    properties: { Height: `${gridArea}`, Items: `Sequence(${self}.Size * ${self}.Size)`, TemplateSize: `${gridArea} / ${self}.Size`, Width: `${gridArea}`, WrapCount: `${self}.Size`, X: gridX, Y: "44" },
    children: [cntCell]
  };

  const galLikelihoodAxis = {
    name: "galLikelihoodAxis",
    control: "Gallery@2.15.0",
    variant: "Vertical",
    properties: { Height: `${gridArea}`, Items: `Sequence(${self}.Size)`, TemplateSize: `${gridArea} / ${self}.Size`, Visible: `${self}.ShowLabels`, Width: "24", WrapCount: "1", X: "0", Y: "44" },
    children: [
      { name: "lblLikelihoodValue", control: "Label@2.5.1", properties: { Align: "Align.Center", Color: "RGBA(100, 116, 139, 1)", FontWeight: "FontWeight.Bold", Height: "Parent.Height", Size: "9", Text: `Text(${self}.Size - ThisItem.Value + 1)`, Width: "Parent.Width" } }
    ]
  };

  const galImpactAxis = {
    name: "galImpactAxis",
    control: "Gallery@2.15.0",
    variant: "Vertical",
    properties: { Height: "16", Items: `Sequence(${self}.Size)`, TemplateSize: `${gridArea} / ${self}.Size`, Visible: `${self}.ShowLabels`, Width: `${gridArea}`, WrapCount: `${self}.Size`, X: gridX, Y: `44 + ${gridArea}` },
    children: [
      { name: "lblImpactValue", control: "Label@2.5.1", properties: { Align: "Align.Center", Color: "RGBA(100, 116, 139, 1)", FontWeight: "FontWeight.Bold", Height: "Parent.Height", Size: "9", Text: "Text(ThisItem.Value)", Width: "Parent.Width" } }
    ]
  };

  const cntRoot = {
    name: "cntRoot",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "Color.White", Height: "Parent.Height", Width: "Parent.Width" },
    children: [
      { name: "lblLikelihoodTitle", control: "Label@2.5.1", properties: { Color: "RGBA(100, 116, 139, 1)", FontWeight: "FontWeight.Bold", Height: "14", Size: "8", Text: '"Likelihood"', Visible: `${self}.ShowLabels`, Width: "80", X: "0", Y: "0" } },
      { name: "lblImpactTitle", control: "Label@2.5.1", properties: { Align: "Align.Center", Color: "RGBA(100, 116, 139, 1)", FontWeight: "FontWeight.Bold", Height: "14", Size: "8", Text: '"Impact"', Visible: `${self}.ShowLabels`, Width: `${gridArea}`, X: gridX, Y: `60 + ${gridArea}` } },
      { name: "txtSearch", control: "Classic/TextInput@2.3.2", properties: { BorderColor: "RGBA(226, 232, 240, 1)", BorderThickness: "1", Fill: "RGBA(248, 250, 252, 1)", Height: "32", HintText: '"Search risks"', OnChange: `${self}.OnSearch(Self.Text)`, Size: "10", Visible: `And(${self}.Searchable, ${self}.ShowNames)`, Width: "Parent.Width - 130", X: "8", Y: "6" } },
      { name: "btnExport", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "Color.White", Fill: "RGBA(23, 32, 27, 1)", FontWeight: "FontWeight.Bold", Height: "32", OnSelect: `${self}.OnExport(${self}.Risks)`, RadiusBottomLeft: "16", RadiusBottomRight: "16", RadiusTopLeft: "16", RadiusTopRight: "16", Size: "10", Text: '"Export"', Width: "80", X: "Parent.Width - 88", Y: "6" } },
      galLikelihoodAxis,
      galGrid,
      galImpactAxis
    ]
  };

  return {
    properties: { Height: `44 + ${gridArea} + 40`, Width: "320" },
    children: [cntRoot]
  };
}

/* Project Health Summary — a real Gallery of the four fixed dimensions
   (Scope/Schedule/Budget/Quality), each card's Tone driving the same
   dark-text-on-light-surface palette this catalog already established.
   No Style property existed for the four documented Variants — added
   one (Trend stays TrendDirection-on-the-data, not a separate Style
   value, since a dimension either has a real TrendDirection or it
   doesn't; Style only toggles Compact's pill row vs the full card
   grid, and Narrative's extra sentence). */
function projectHealthSummary(pascal) {
  const self = `cmp${pascal}`;
  const isCompact = `${self}.Style = "Compact"`;
  const isNarrative = `${self}.Style = "Narrative"`;
  const toneColor = `Switch(ThisItem.Tone, "Green", "#2E7D32", "Red", "#C62828", "#BF360C")`;
  const toneBg = `Switch(ThisItem.Tone, "Green", "#E8F5E9", "Red", "#FFEBEE", "#FFF3E0")`;
  const trendGlyph = `Switch(ThisItem.TrendDirection, "Better", " ^", "Worse", " v", "")`;
  const overallColor = `Switch(${self}.OverallTone, "Green", "#2E7D32", "Red", "#C62828", "#BF360C")`;

  const cntDimCard = {
    name: "cntDimCard",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: toneBg, Height: "Parent.Height", RadiusBottomLeft: "12", RadiusBottomRight: "12", RadiusTopLeft: "12", RadiusTopRight: "12", Width: "Parent.Width" },
    children: [
      { name: "lblDimName", control: "ModernText@1.0.0", properties: { Color: toneColor, FontWeight: "FontWeight.Bold", Height: "16", Size: "11", Text: `ThisItem.Dimension & ${trendGlyph}`, Width: "Parent.Width - 16", X: "8", Y: "8" } },
      { name: "lblDimNote", control: "ModernText@1.0.0", properties: { AutoHeight: "false", Color: toneColor, Height: `If(${isCompact}, 0, 40)`, Size: "10", Text: "ThisItem.Note", Visible: `!${isCompact}`, Width: "Parent.Width - 16", Wrap: "true", X: "8", Y: "26" } },
      { name: "btnDimTap", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", OnSelect: `${self}.OnDimensionSelect(ThisItem)`, Text: '""', Width: "Parent.Width" } }
    ]
  };

  const cntCard = {
    name: "cntCard",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", DropShadow: "DropShadow.Regular", Fill: "Color.White", Height: "Parent.Height", RadiusBottomLeft: "20", RadiusBottomRight: "20", RadiusTopLeft: "20", RadiusTopRight: "20", Width: "Parent.Width" },
    children: [
      { name: "lblOverall", control: "ModernText@1.0.0", properties: { Color: overallColor, FontWeight: "FontWeight.Bold", Height: "20", Size: "14", Text: `"Overall: " & ${self}.OverallTone`, Width: "220", X: "20", Y: "16" } },
      { name: "lblAsOf", control: "ModernText@1.0.0", properties: { Color: "RGBA(100, 116, 139, 1)", Height: "16", Size: "10", Text: `"As of " & Text(${self}.AsOfDate, DateTimeFormat.ShortDate, Coalesce(${self}.Language, Language()))`, Width: "180", X: "Parent.Width - 200", Y: "20" } },
      {
        name: "galDimensions",
        control: "Gallery@2.15.0",
        variant: "Vertical",
        properties: { Height: `If(${isCompact}, 30, 80)`, Items: `${self}.Dimensions`, TemplateSize: `If(${isCompact}, (Parent.Width - 40) / 4, (Parent.Width - 52) / 4)`, Width: "Parent.Width - 40", WrapCount: "4", X: "20", Y: "48" },
        children: [cntDimCard]
      },
      { name: "lblNarrative", control: "ModernText@1.0.0", properties: { AutoHeight: "false", Height: "36", Size: "11", Text: `${self}.NarrativeText`, Visible: `And(${isNarrative}, ${self}.NarrativeText <> "")`, Width: "Parent.Width - 40", Wrap: "true", X: "20", Y: `If(${isCompact}, 86, 136)` } }
    ]
  };

  return {
    properties: { Height: `If(${isCompact}, 86, If(And(${isNarrative}, ${self}.NarrativeText <> ""), 180, 136))`, Width: "360" },
    children: [cntCard]
  };
}

/* Milestone Tracker — horizontal and vertical orientations both use
   the exact same Gallery-over-Milestones with just WrapCount switched
   between CountRows(Milestones) (one row, real bars) and 1 (one
   column) — the same Vertical-variant-plus-WrapCount technique this
   file already uses for a single row/column elsewhere (Command Card's
   bar chart, Risk Matrix's axis strips), rather than reaching for an
   unverified "Horizontal" Gallery variant this file has no real
   evidence for. */
function milestoneTracker(pascal) {
  const self = `cmp${pascal}`;
  const isVertical = `${self}.Orientation = "vertical"`;
  const isUpcoming = `${self}.Style = "Upcoming only"`;
  const items = `If(${isUpcoming}, FirstN(Filter(${self}.Milestones, Status <> "Complete"), 4), ${self}.Milestones)`;
  const statusColor = `Switch(ThisItem.Status, "Complete", "#2E7D32", "AtRisk", "#BF360C", "Missed", "#C62828", "#2563EB")`;
  const dateText = `If(ThisItem.Status = "Complete" And !IsBlank(ThisItem.CompletedDate), Text(ThisItem.CompletedDate, DateTimeFormat.ShortDate, Coalesce(${self}.Language, Language())), Text(ThisItem.DueDate, DateTimeFormat.ShortDate, Coalesce(${self}.Language, Language())))`;

  const cntMilestone = {
    name: "cntMilestone",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", Width: "Parent.Width" },
    children: [
      { name: "btnDot", control: "Classic/Button@2.2.0", properties: { BorderColor: "Color.White", BorderStyle: "BorderStyle.Solid", BorderThickness: "2", Fill: statusColor, Height: "16", OnSelect: `${self}.OnMilestoneSelect(ThisItem)`, RadiusBottomLeft: "8", RadiusBottomRight: "8", RadiusTopLeft: "8", RadiusTopRight: "8", Text: '""', Width: "16", X: `If(${isVertical}, 0, "Parent.Width / 2 - 8")`, Y: `If(${isVertical}, "Parent.Height / 2 - 8", 0)` } },
      { name: "lblMilestoneName", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "16", Size: "10", Text: "ThisItem.Name", Width: `If(${isVertical}, "Parent.Width - 28", "Parent.Width")`, X: `If(${isVertical}, 28, 0)`, Y: `If(${isVertical}, "Parent.Height / 2 - 8", 20)` } },
      { name: "lblMilestoneDate", control: "ModernText@1.0.0", properties: { Color: "RGBA(100, 116, 139, 1)", Height: "14", Size: "9", Text: dateText, Visible: `${self}.ShowDates`, Width: `If(${isVertical}, "Parent.Width - 28", "Parent.Width")`, X: `If(${isVertical}, 28, 0)`, Y: `If(${isVertical}, "Parent.Height / 2 + 8", 36)` } }
    ]
  };

  const cntRail = { name: "cntRail", control: "GroupContainer@1.5.0", variant: "ManualLayout", properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(226, 232, 240, 1)", Height: `If(${isVertical}, "Parent.Height - 20", 2)`, Width: `If(${isVertical}, 2, "Parent.Width - 40")`, X: `If(${isVertical}, 7, 20)`, Y: `If(${isVertical}, 10, "Parent.Height / 2 - 1")` } };

  const galMilestones = {
    name: "galMilestones",
    control: "Gallery@2.15.0",
    variant: "Vertical",
    properties: {
      Height: `If(${isVertical}, "Parent.Height", If(${self}.ShowDates, 60, 36))`,
      Items: items,
      TemplateSize: `If(${isVertical}, 48, "(Parent.Width - 40) / CountRows(" + items + ")")`,
      Width: `If(${isVertical}, "Parent.Width", "Parent.Width - 40")`,
      WrapCount: `If(${isVertical}, 1, CountRows(${items}))`,
      X: `If(${isVertical}, 0, 20)`,
      Y: `If(${isVertical}, 0, "Parent.Height / 2 - 18")`
    },
    children: [cntMilestone]
  };

  return {
    properties: { Fill: "Color.Transparent", Height: `If(${isVertical}, 220, If(${self}.ShowDates, 60, 36))`, Width: `If(${isVertical}, 220, 360)` },
    children: [cntRail, galMilestones]
  };
}

/* Decision Log — a real, sorted Gallery over Decisions. Compact hides
   Rationale entirely rather than the documented "hidden until tapped"
   expand-in-place interaction — a real, disclosed simplification (a
   per-row expanded/collapsed toggle needs per-row state this Gallery-
   over-a-Table shape has no natural place to keep without a second,
   host-owned collection, which is more machinery than a decision
   register's own Compact view is worth). */
function decisionLog(pascal) {
  const self = `cmp${pascal}`;
  const isCompact = `${self}.Style = "Compact"`;
  const isPrint = `${self}.Style = "Print"`;
  const statusColor = `Switch(ThisItem.Status, "Decided", "#2E7D32", "Superseded", "#475569", "#BF360C")`;
  const sorted = `Sort(${self}.Decisions, Date, If(${self}.SortOrder = "Newest first", SortOrder.Descending, SortOrder.Ascending))`;
  const dateText = `Text(ThisItem.Date, DateTimeFormat.ShortDate, Coalesce(${self}.Language, Language()))`;

  const cntRow = {
    name: "cntRow",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", Width: "Parent.Width" },
    children: [
      { name: "lblDate", control: "ModernText@1.0.0", properties: { Color: "RGBA(100, 116, 139, 1)", Height: "14", Size: "9", Text: dateText, Width: "90", X: "0", Y: "8" } },
      { name: "lblStatus", control: "ModernText@1.0.0", properties: { Color: statusColor, FontWeight: "FontWeight.Bold", Height: "14", Size: "9", Text: "ThisItem.Status", Width: "90", X: "Parent.Width - 90", Y: "8" } },
      { name: "lblDecision", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "18", Size: "12", Text: "ThisItem.Decision", Width: "Parent.Width - 180", X: "90", Y: "6" } },
      { name: "lblOwner", control: "ModernText@1.0.0", properties: { Color: "RGBA(100, 116, 139, 1)", Height: "14", Size: "10", Text: "ThisItem.Owner", Width: "Parent.Width", X: "0", Y: "26" } },
      { name: "lblRationale", control: "ModernText@1.0.0", properties: { AutoHeight: "false", Color: "RGBA(71, 85, 105, 1)", Height: "32", Size: "10", Text: "ThisItem.Rationale", Visible: `!${isCompact}`, Width: "Parent.Width", Wrap: "true", X: "0", Y: "44" } },
      { name: "btnRowTap", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", OnSelect: `${self}.OnDecisionSelect(ThisItem)`, Text: '""', Width: "Parent.Width" } }
    ]
  };

  const cntCard = {
    name: "cntCard",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", DropShadow: `If(${isPrint}, "DropShadow.None", "DropShadow.Regular")`, Fill: "Color.White", Height: "Parent.Height", RadiusBottomLeft: `If(${isPrint}, 0, 20)`, RadiusBottomRight: `If(${isPrint}, 0, 20)`, RadiusTopLeft: `If(${isPrint}, 0, 20)`, RadiusTopRight: `If(${isPrint}, 0, 20)`, Width: "Parent.Width" },
    children: [
      { name: "lblHeading", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "22", Size: "16", Text: '"Decision log"', Width: "220", X: "20", Y: "16" } },
      { name: "btnAdd", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "Color.White", Fill: "RGBA(22, 131, 38, 1)", FontWeight: "FontWeight.Bold", Height: "30", OnSelect: `${self}.OnAddDecision()`, RadiusBottomLeft: "15", RadiusBottomRight: "15", RadiusTopLeft: "15", RadiusTopRight: "15", Size: "10", Text: '"Log a decision"', Visible: `And(${self}.AllowAdd, !${isPrint})`, Width: "120", X: "Parent.Width - 220", Y: "14" } },
      { name: "btnExport", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(241, 245, 249, 1)", FontWeight: "FontWeight.Bold", Height: "30", OnSelect: `${self}.OnExport(${sorted})`, RadiusBottomLeft: "15", RadiusBottomRight: "15", RadiusTopLeft: "15", RadiusTopRight: "15", Size: "10", Text: '"Export"', Visible: `!${isPrint}`, Width: "88", X: "Parent.Width - 96", Y: "14" } },
      {
        name: "galDecisions",
        control: "Gallery@2.15.0",
        variant: "Vertical",
        properties: { Height: `CountRows(${self}.Decisions) * If(${isCompact}, 44, 76)`, Items: sorted, TemplateSize: `If(${isCompact}, 44, 76)`, Width: "Parent.Width - 40", WrapCount: "1", X: "20", Y: "56" },
        children: [cntRow]
      }
    ]
  };

  return {
    properties: { Height: `56 + CountRows(${self}.Decisions) * If(${isCompact}, 44, 76) + 20`, Width: "420" },
    children: [cntCard]
  };
}

/* Deadline Tracker — the due date is a real computed value, not a
   plain StartDate + Days add: a bounded candidate window
   (Min(Days,400) * 2 + 20 calendar days — generous headroom over the
   worst case of 400 business days needing roughly 560 calendar days)
   is generated with Sequence/AddColumns, weekends and Holidays rows
   are filtered out with Weekday(d, StartOfWeek.Monday) <= 5 and a
   LookUp against Holidays, and the Nth remaining row is indexed out —
   the same "generate candidates, search, don't solve analytically"
   technique the component's own architecture already documented.
   TimeZone is accepted but not used for real conversion math here —
   Power Fx has no verified callable timezone-conversion function this
   catalog could point to, so StartDate is trusted as already being in
   the right zone, the same disclosed simplification as the breakdown
   sentence staying English-only (see componentLibrary.js's own
   Limitations for both). */
function deadlineTracker(pascal) {
  const self = `cmp${pascal}`;
  const isBadge = `${self}.Style = "Badge"`;
  const isCompact = `${self}.Config.Compact`;
  const isComplete = `!IsBlank(${self}.CompletedDate)`;

  const dueDate = `With({window: Sequence(Min(${self}.Days, 400) * 2 + 20)}, With({cand: AddColumns(window, "d", DateAdd(${self}.StartDate, Value, TimeUnit.Days))}, With({biz: Filter(cand, Weekday(d, StartOfWeek.Monday) <= 5 And IsBlank(LookUp(${self}.Holidays, HolidayDate = d)))}, Index(biz, Min(${self}.Days, CountRows(biz))).d)))`.replace(/\s*\n\s*/g, " ");
  const daysLeft = `DateDiff(Today(), ${dueDate}, TimeUnit.Days)`;
  const status = `If(${isComplete}, "Complete", If(${daysLeft} < 0, "Overdue", If(${daysLeft} <= ${self}.ReminderThreshold, "DueSoon", "OnTrack")))`;
  const statusColor = `Switch(${status}, "Complete", "#2E7D32", "Overdue", "#C62828", "DueSoon", "#BF360C", "#1565C0")`;
  const statusLabel = `Switch(${status}, "Complete", "Complete", "Overdue", "Overdue", "DueSoon", "Due soon", "On track")`;
  const holidayCount = `CountRows(${self}.Holidays)`;
  const breakdown = `"Weekends" & If(${holidayCount} > 0, " and " & ${holidayCount} & " observed holiday" & If(${holidayCount} <> 1, "s", ""), "") & " already excluded. Due " & Text(${dueDate}, DateTimeFormat.LongDate, Coalesce(${self}.Language, Language()))`;

  const cntCard = {
    name: "cntCard",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", DropShadow: "DropShadow.Regular", Fill: "Color.White", Height: "Parent.Height", RadiusBottomLeft: "18", RadiusBottomRight: "18", RadiusTopLeft: "18", RadiusTopRight: "18", Visible: `!${isBadge}`, Width: "Parent.Width" },
    children: [
      { name: "btnStatusDot", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: statusColor, Height: "10", RadiusBottomLeft: "5", RadiusBottomRight: "5", RadiusTopLeft: "5", RadiusTopRight: "5", Text: '""', Width: "10", X: "20", Y: "20" } },
      { name: "lblStatusLabel", control: "ModernText@1.0.0", properties: { Color: statusColor, FontWeight: "FontWeight.Bold", Height: "16", Size: "10", Text: statusLabel, Width: "180", X: "38", Y: "16" } },
      { name: "lblCount", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "40", Size: "32", Text: `Text(Abs(${daysLeft})) & If(${status} = "Overdue", "d over", "d left")`, Width: "260", X: "20", Y: "38" } },
      { name: "lblBreakdown", control: "ModernText@1.0.0", properties: { AutoHeight: "false", Color: "RGBA(100, 116, 139, 1)", Height: "32", Size: "10", Text: breakdown, Visible: `!${isCompact}`, Width: "260", Wrap: "true", X: "20", Y: "82" } }
    ]
  };

  const cntBadge = {
    name: "cntBadge",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: statusColor, Height: "26", RadiusBottomLeft: "13", RadiusBottomRight: "13", RadiusTopLeft: "13", RadiusTopRight: "13", Visible: isBadge, Width: "Parent.Width" },
    children: [
      { name: "lblBadgeText", control: "ModernText@1.0.0", properties: { Align: "Align.Center", Color: "Color.White", FontWeight: "FontWeight.Bold", Height: "Parent.Height", Size: "10", Text: `Text(Abs(${daysLeft})) & If(${status} = "Overdue", "d over", "d left")`, Width: "Parent.Width" } }
    ]
  };

  const btnTap = { name: "btnTap", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", OnSelect: `${self}.OnSelect()`, Text: '""', Width: "Parent.Width" } };

  return {
    properties: { Height: `If(${isBadge}, 26, If(${isCompact}, 74, 122))`, Width: "300" },
    children: [cntCard, cntBadge, btnTap]
  };
}

/* Activity Timeline — a real Gallery over Items, sorted by
   SortDirection with PinnedIds always sorted ahead of everything else
   (the same precedence the real Dynamics 365 Timeline control's own
   pin feature uses), paged to RecordsToLoad with a real Load more
   affordance, category color/icon resolved through IconMap. IsLoading
   swaps in a Sequence(4)-driven skeleton gallery (the same technique
   KPI Card's own skeleton state uses) and HasLoadError swaps in a
   retry state, as two distinct sibling containers rather than one
   flag reused for both. Grouped by date is accepted as a documented
   Style value with no distinct visual yet — see componentLibrary.js's
   own disclosed Limitations. */
function activityTimeline(pascal) {
  const self = `cmp${pascal}`;
  const isCompact = `${self}.Style = "Compact"`;
  const sorted = `SortByColumns(AddColumns(${self}.Items, "IsPinned", CountRows(Filter(${self}.PinnedIds, Id = Title)) > 0), "IsPinned", SortOrder.Descending, "Timestamp", If(${self}.SortDirection = "Newest first", SortOrder.Descending, SortOrder.Ascending))`;
  const shown = `FirstN(${sorted}, ${self}.RecordsToLoad)`;
  const iconColor = `ColorValue(Coalesce(LookUp(${self}.IconMap, Category = ThisItem.Category).Color, "#64748B"))`;

  const cntEntry = {
    name: "cntEntry",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", Width: "Parent.Width" },
    children: [
      { name: "btnDot", control: "Classic/Button@2.2.0", properties: { BorderColor: "Color.White", BorderStyle: "BorderStyle.Solid", BorderThickness: "2", Fill: iconColor, Height: "12", RadiusBottomLeft: "6", RadiusBottomRight: "6", RadiusTopLeft: "6", RadiusTopRight: "6", Text: '""', Width: "12", X: "0", Y: "4" } },
      { name: "cntRail", control: "GroupContainer@1.5.0", variant: "ManualLayout", properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(226, 232, 240, 1)", Height: "Parent.Height - 16", Width: "2", X: "5", Y: "20" } },
      { name: "lblTitle", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "16", Size: "11", Text: `ThisItem.Title & If(CountRows(Filter(${self}.PinnedIds, Id = ThisItem.Title)) > 0, " - Pinned", "")`, Width: "Parent.Width - 24", X: "24", Y: "0" } },
      { name: "lblDescription", control: "ModernText@1.0.0", properties: { AutoHeight: "false", Color: "RGBA(71, 85, 105, 1)", Height: `If(${isCompact}, 0, 32)`, Size: "10", Text: "ThisItem.Description", Visible: `!${isCompact}`, Width: "Parent.Width - 24", Wrap: "true", X: "24", Y: "18" } },
      { name: "lblMeta", control: "ModernText@1.0.0", properties: { Color: "RGBA(148, 163, 184, 1)", Height: "14", Size: "9", Text: `ThisItem.Author & " - " & Text(ThisItem.Timestamp, DateTimeFormat.ShortDateTime, Coalesce(${self}.Language, Language()))`, Width: "Parent.Width - 24", X: "24", Y: `If(${isCompact}, 18, 52)` } },
      { name: "btnEntryTap", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", OnSelect: `${self}.OnItemSelect(ThisItem)`, Text: '""', Width: "Parent.Width" } }
    ]
  };

  const galItems = {
    name: "galItems",
    control: "Gallery@2.15.0",
    variant: "Vertical",
    properties: { Height: `CountRows(${shown}) * If(${isCompact}, 36, ${self}.CardHeight)`, Items: shown, TemplateSize: `If(${isCompact}, 36, ${self}.CardHeight)`, Visible: `And(!${self}.IsLoading, !${self}.HasLoadError)`, Width: "Parent.Width - 40", WrapCount: "1", X: "20", Y: "8" },
    children: [cntEntry]
  };

  const galSkeleton = {
    name: "galSkeleton",
    control: "Gallery@2.15.0",
    variant: "Vertical",
    properties: { Height: `4 * ${self}.CardHeight`, Items: "Sequence(4)", TemplateSize: `${self}.CardHeight`, Visible: self + ".IsLoading", Width: "Parent.Width - 40", WrapCount: "1", X: "20", Y: "8" },
    children: [
      { name: "btnSkeletonLine1", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(226, 232, 240, 1)", Height: "12", RadiusBottomLeft: "6", RadiusBottomRight: "6", RadiusTopLeft: "6", RadiusTopRight: "6", Text: '""', Width: "160", X: "24", Y: "10" } },
      { name: "btnSkeletonLine2", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(241, 245, 249, 1)", Height: "10", RadiusBottomLeft: "5", RadiusBottomRight: "5", RadiusTopLeft: "5", RadiusTopRight: "5", Text: '""', Width: "220", X: "24", Y: "30" } }
    ]
  };

  const cntError = {
    name: "cntError",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(255, 235, 238, 1)", Height: "80", Visible: self + ".HasLoadError", Width: "Parent.Width - 40", X: "20", Y: "8" },
    children: [
      { name: "lblErrorMessage", control: "ModernText@1.0.0", properties: { Color: "RGBA(198, 40, 40, 1)", FontWeight: "FontWeight.Bold", Height: "20", Size: "11", Text: '"Couldn\'t load more activity"', Width: "Parent.Width - 20", X: "16", Y: "14" } },
      { name: "btnRetry", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "Color.White", Fill: "RGBA(198, 40, 40, 1)", FontWeight: "FontWeight.Bold", Height: "28", OnSelect: `${self}.OnLoadMore()`, RadiusBottomLeft: "14", RadiusBottomRight: "14", RadiusTopLeft: "14", RadiusTopRight: "14", Size: "10", Text: '"Retry"', Width: "80", X: "16", Y: "40" } }
    ]
  };

  const btnLoadMore = {
    name: "btnLoadMore",
    control: "Classic/Button@2.2.0",
    properties: {
      BorderColor: "RGBA(226, 232, 240, 1)", BorderStyle: "BorderStyle.Solid", BorderThickness: "1",
      Fill: "Color.White",
      Height: "34",
      OnSelect: `${self}.OnLoadMore()`,
      RadiusBottomLeft: "17", RadiusBottomRight: "17", RadiusTopLeft: "17", RadiusTopRight: "17",
      Size: "10",
      Text: '"Load more"',
      Visible: `And(!${self}.IsLoading, !${self}.HasLoadError, CountRows(${self}.Items) > ${self}.RecordsToLoad)`,
      Width: "120",
      X: "20",
      Y: `16 + CountRows(${shown}) * If(${isCompact}, 36, ${self}.CardHeight)`
    }
  };

  return {
    properties: { Fill: "Color.White", Height: `56 + CountRows(${shown}) * If(${isCompact}, 36, ${self}.CardHeight)`, Width: "360" },
    children: [galItems, galSkeleton, cntError, btnLoadMore]
  };
}

/* Calendar — Month view only (see componentLibrary.js's own disclosed
   Limitations for the real scope cut: Week/Agenda/Compact mini all
   render this same grid today rather than their own distinct layout).
   A real 42-cell (6-week) grid computed from FocusDate: gridStart
   backs up from the 1st of the month to Config.FirstDayOfWeek (0 =
   Sunday .. 6 = Saturday) using Weekday(monthStart, StartOfWeek.Sunday)
   and Mod arithmetic, then each of the 42 Gallery cells (bound to
   Sequence(42), read via ThisItem.Value the same way Risk Matrix's own
   Sequence-bound grid is) derives its own date with
   DateAdd(gridStart, ThisItem.Value - 1, TimeUnit.Days) — a real
   generated grid, never a hardcoded 5x7 layout.

   Never a nested Gallery-in-Gallery for a day's chips — this
   component's own architecture already rules that out ("never
   nested"), the same real reason Accordion List's own comment gives
   (nested flexible-height galleries fight Power Apps' own height
   measuring). Instead each day cell gets 3 fixed, individually
   positioned chip slots (Index(dayEvents, N)), each one additionally
   gated on N <= Config.ChipSlots so a host can hide down from that
   built-in ceiling — a real, disclosed constraint of any fixed
   Children tree, not a bug.

   Month/weekday names use Text()'s own "mmmm yyyy"/"ddd" custom format
   codes with a real Language argument — core, safe, and does the
   actual per-language generation this component's own architecture
   promises, rather than a hand-rolled month-name lookup table. */
function calendar(pascal) {
  const self = `cmp${pascal}`;
  const lang = `Coalesce(${self}.Language, Language())`;
  const monthStart = `Date(Year(${self}.FocusDate), Month(${self}.FocusDate), 1)`;
  const gridStart = `DateAdd(${monthStart}, -Mod(Weekday(${monthStart}, StartOfWeek.Sunday) - 1 - ${self}.Config.FirstDayOfWeek + 7, 7), TimeUnit.Days)`;
  const cellDate = `DateAdd(${gridStart}, ThisItem.Value - 1, TimeUnit.Days)`;
  const dayEvents = `Filter(${self}.Events, Date = ${cellDate})`;
  const isCurrentMonth = `Month(${cellDate}) = Month(${self}.FocusDate)`;
  const isToday = `${cellDate} = Today()`;
  const holidayMatch = `LookUp(${self}.Holidays, Date = ${cellDate})`;

  const chipSlot = n => ({
    name: `imgChip${n}`,
    control: "Image@2.2.3",
    properties: {
      AltText: `Index(${dayEvents}, ${n}).Title`,
      Height: "14",
      Image: `With({ev: Index(${dayEvents}, ${n}), ch: LookUp(${self}.Channels, Key = Index(${dayEvents}, ${n}).Channel)}, "data:image/svg+xml;utf8," & EncodeUrl("<svg xmlns='http://www.w3.org/2000/svg' width='100' height='14'><rect width='100' height='14' rx='3' fill='" & Coalesce(ch.Color, "#64748B") & "'/><text x='4' y='10' font-size='8' fill='white'>" & Left(ev.Title, 10) & "</text></svg>"))`.replace(/\s*\n\s*/g, " "),
      OnSelect: `${self}.OnSelectEvent(Index(${dayEvents}, ${n}))`,
      Visible: `And(CountRows(${dayEvents}) >= ${n}, ${n} <= ${self}.Config.ChipSlots)`,
      Width: "Parent.Width - 8",
      X: "4",
      Y: `16 + (${n} - 1) * 15`
    }
  });

  const cntDayCell = {
    name: "cntDayCell",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: {
      BorderColor: "RGBA(226, 232, 240, 1)", BorderStyle: "BorderStyle.Solid", BorderThickness: "1",
      Fill: `If(${self}.Config.ShowHolidayTint, If(!IsBlank(${holidayMatch}), "#FFF3E0", If(${isToday}, "#EBF5FF", If(${isCurrentMonth}, "Color.White", "#F8FAFC"))), If(${isToday}, "#EBF5FF", If(${isCurrentMonth}, "Color.White", "#F8FAFC")))`,
      Height: `${self}.Config.RowHeight`,
      Width: "76"
    },
    children: [
      { name: "lblDayNumber", control: "ModernText@1.0.0", properties: { Color: `If(${isCurrentMonth}, "RGBA(23, 32, 27, 1)", "RGBA(148, 163, 184, 1)")`, FontWeight: `If(${isToday}, "FontWeight.Bold", "FontWeight.Normal")`, Height: "14", Size: "9", Text: `Text(Day(${cellDate}))`, Width: "Parent.Width - 8", X: "4", Y: "2" } },
      { name: "lblHolidayName", control: "ModernText@1.0.0", properties: { Color: "RGBA(191, 54, 12, 1)", Height: "10", Size: "6", Text: `${holidayMatch}.Name`, Visible: `And(${self}.Config.ShowHolidayTint, !IsBlank(${holidayMatch}))`, Width: "Parent.Width - 8", X: "4", Y: "14" } },
      chipSlot(1), chipSlot(2), chipSlot(3),
      { name: "lblOverflow", control: "ModernText@1.0.0", properties: { Color: "RGBA(100, 116, 139, 1)", Height: "12", Size: "7", Text: `"+" & (CountRows(${dayEvents}) - ${self}.Config.ChipSlots) & " more"`, Visible: `CountRows(${dayEvents}) > ${self}.Config.ChipSlots`, Width: "Parent.Width - 8", X: "4", Y: "61" } },
      { name: "btnDayTap", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", OnSelect: `${self}.OnSelectDay(${cellDate})`, Text: '""', Width: "Parent.Width" } }
    ]
  };

  const galGrid = {
    name: "galGrid",
    control: "Gallery@2.15.0",
    variant: "Vertical",
    properties: { Height: `${self}.Config.RowHeight * 6`, Items: "Sequence(42)", TemplateSize: `${self}.Config.RowHeight`, Width: "532", WrapCount: "7", X: "0", Y: "56" },
    children: [cntDayCell]
  };

  const dayHeaderSlot = n => ({
    name: `lblWeekday${n}`,
    control: "Label@2.5.1",
    properties: { Align: "Align.Center", Color: "RGBA(100, 116, 139, 1)", FontWeight: "FontWeight.Bold", Height: "18", Size: "9", Text: `Text(DateAdd(${gridStart}, ${n} - 1, TimeUnit.Days), "ddd", ${lang})`, Width: "76", X: `(${n} - 1) * 76`, Y: "36" }
  });

  const cntRoot = {
    name: "cntRoot",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "Color.White", Height: "Parent.Height", Width: "Parent.Width" },
    children: [
      { name: "lblMonthTitle", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "24", Size: "16", Text: `Text(${monthStart}, "mmmm yyyy", ${lang})`, Width: "220", X: "20", Y: "8" } },
      { name: "btnPrev", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(241, 245, 249, 1)", FontWeight: "FontWeight.Bold", Height: "28", OnSelect: `${self}.OnRangeChange(DateAdd(${monthStart}, -1, TimeUnit.Months), DateAdd(${monthStart}, -1, TimeUnit.Days))`, RadiusBottomLeft: "14", RadiusBottomRight: "14", RadiusTopLeft: "14", RadiusTopRight: "14", Size: "12", Text: '"<"', Width: "28", X: "Parent.Width - 96", Y: "8" } },
      { name: "btnToday", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(241, 245, 249, 1)", FontWeight: "FontWeight.Bold", Height: "28", OnSelect: `${self}.OnRangeChange(Date(Year(Today()), Month(Today()), 1), DateAdd(DateAdd(Date(Year(Today()), Month(Today()), 1), 1, TimeUnit.Months), -1, TimeUnit.Days))`, Size: "9", Text: '"Today"', Width: "44", X: "Parent.Width - 64", Y: "8" } },
      { name: "btnNext", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(241, 245, 249, 1)", FontWeight: "FontWeight.Bold", Height: "28", OnSelect: `${self}.OnRangeChange(DateAdd(${monthStart}, 1, TimeUnit.Months), DateAdd(DateAdd(${monthStart}, 2, TimeUnit.Months), -1, TimeUnit.Days))`, RadiusBottomLeft: "14", RadiusBottomRight: "14", RadiusTopLeft: "14", RadiusTopRight: "14", Size: "12", Text: '">"', Width: "28", X: "Parent.Width - 32", Y: "8" } },
      dayHeaderSlot(1), dayHeaderSlot(2), dayHeaderSlot(3), dayHeaderSlot(4), dayHeaderSlot(5), dayHeaderSlot(6), dayHeaderSlot(7),
      galGrid
    ]
  };

  return {
    properties: { Height: `56 + ${self}.Config.RowHeight * 6`, Width: "532" },
    children: [cntRoot]
  };
}

export const CHILDREN_BUILDERS = {
  "KPI Card": kpiCard,
  "Notification Badge": notificationBadge,
  "Responsive Line Chart": responsiveLineChart,
  "Command Card": commandCard,
  "Program Scorecard": programScorecard,
  "Operational Status Banner": operationalStatusBanner,
  "Risk Matrix": riskMatrix,
  "Project Health Summary": projectHealthSummary,
  "Milestone Tracker": milestoneTracker,
  "Decision Log": decisionLog,
  "Deadline Tracker": deadlineTracker,
  "Activity Timeline": activityTimeline,
  "Calendar": calendar
};
