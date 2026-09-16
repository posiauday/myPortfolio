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
          Height: "Parent.Height * 0.7",
          Image: iconImage,
          Width: "Parent.Width * 0.7",
          X: "Parent.Width * 0.15",
          Y: "Parent.Height * 0.15"
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

   Animate ("staggered draw-in") is a real Timer-driven fade-in — but
   NOT via an Image.Opacity property: a real Studio paste confirmed
   PA2108 rejecting both `AltText` and `Opacity` on `Image@2.2.3`
   (neither is a real property on this control, despite Opacity being
   common on many other controls), so the fade is baked directly into
   the generated SVG's own root `opacity='...'` attribute instead —
   real SVG/XML syntax inside the image bytes, not a Power Apps
   control property, so it needs no separate verification. The same
   real paste error is why accessible text here is an SVG `<title>`
   element baked into the image content rather than an `AltText`
   property. Both read the same Timer.Value/Timer.Duration-in-a-
   sibling-formula pattern as Notification Badge's pulse ring; this is
   still a literal-per-point-reveal simplification (a single fade for
   the whole chart, not a staggered per-point timeline), which raw
   Power Fx over one static Image has no way to express — a
   deliberate, disclosed simplification, not an oversight. */
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
            "<svg viewBox='0 0 ${w} ${viewH}' xmlns='http://www.w3.org/2000/svg' opacity='" & If(${self}.Animate, Min(tmrChartAnimate.Value / tmrChartAnimate.Duration, 1), 1) & "'><title>Line chart, " & CountRows(${self}.ChartData) & " points, " & ${self}.LineColor & " line</title><defs><linearGradient id='lc' x1='0' y1='0' x2='0' y2='1'><stop offset='0%' stop-color='" & ${self}.LineColor & "' stop-opacity='0.35'/><stop offset='100%' stop-color='" & ${self}.LineColor & "' stop-opacity='0'/></linearGradient></defs><path d='" &
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
      Height: "Parent.Height",
      Image: svgUri,
      ImagePosition: "ImagePosition.Fit",
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
  const toneColor = `ColorValue(Switch(ThisItem.Tone, "Positive", "#2E7D32", "Negative", "#C62828", "#475569"))`;

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
              Fill: `ColorValue(If(ThisItem.x = ${self}.HighlightIndex, "#168326", "#CBD5E1"))`,
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
    children: [cntCard],
    eventParameters: {
      OnMetricSelect: [{ name: "Metric", dataType: "Record", defaultFormula: '{Label:"Health",Value:"74%",Tone:"Positive"}' }],
      OnChartSelect: [{ name: "Index", dataType: "Number", defaultFormula: "1" }, { name: "Value", dataType: "Number", defaultFormula: "12" }]
    }
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
  const toneColor = `ColorValue(Switch(ThisItem.Tone, "Green", "#2E7D32", "Red", "#C62828", "#BF360C"))`;
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
    children: [cntCard],
    eventParameters: {
      OnExport: [
        { name: "Metrics", dataType: "Table", defaultFormula: 'Table({Name:"Budget",Value:82,Target:90,Tone:"Green",Trend:"70,75,78,80,82"})' },
        { name: "Period", dataType: "Text", defaultFormula: '"This quarter"' },
        { name: "ExportFormat", dataType: "Text", defaultFormula: '"PDF"' }
      ],
      OnMetricSelect: [{ name: "Metric", dataType: "Record", defaultFormula: '{Name:"Budget",Value:82,Target:90,Tone:"Green",Trend:"70,75,78,80,82"}' }]
    }
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
  const toneBg = `ColorValue(Switch(${self}.Status, "Degraded", "#FFF3E0", "Outage", "#FFEBEE", "Maintenance", "#EBF5FF", "#E8F5E9"))`;
  const toneFg = `ColorValue(Switch(${self}.Status, "Degraded", "#BF360C", "Outage", "#C62828", "Maintenance", "#1565C0", "#2E7D32"))`;
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
    children: [cntBanner],
    eventParameters: {
      OnDetailsSelect: [{ name: "System", dataType: "Record", defaultFormula: '{Name:"Sample"}' }]
    }
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
  const cellColor = `ColorValue(If(${severity} <= 0.33, "#DCFCE7", If(${severity} <= 0.66, "#FEF3C7", "#FEE2E2")))`;
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
    children: [cntRoot],
    eventParameters: {
      OnSearch: [{ name: "SearchText", dataType: "Text", defaultFormula: '""' }],
      OnExport: [{ name: "Risks", dataType: "Table", defaultFormula: 'Table({Likelihood:1,Impact:1,Count:1,Name:Blank(),TrendDirection:Blank()})' }],
      OnCellSelect: [
        { name: "Likelihood", dataType: "Number", defaultFormula: "1" },
        { name: "Impact", dataType: "Number", defaultFormula: "1" },
        { name: "Risks", dataType: "Table", defaultFormula: 'Table({Likelihood:1,Impact:1,Count:1,Name:Blank(),TrendDirection:Blank()})' }
      ]
    }
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
  const toneColor = `ColorValue(Switch(ThisItem.Tone, "Green", "#2E7D32", "Red", "#C62828", "#BF360C"))`;
  const toneBg = `ColorValue(Switch(ThisItem.Tone, "Green", "#E8F5E9", "Red", "#FFEBEE", "#FFF3E0"))`;
  const trendGlyph = `Switch(ThisItem.TrendDirection, "Better", " ^", "Worse", " v", "")`;
  const overallColor = `ColorValue(Switch(${self}.OverallTone, "Green", "#2E7D32", "Red", "#C62828", "#BF360C"))`;

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
    children: [cntCard],
    eventParameters: {
      OnDimensionSelect: [{ name: "Dimension", dataType: "Record", defaultFormula: '{Dimension:"Scope",Tone:"Green",Note:"On track",TrendDirection:"Same"}' }]
    }
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
  const statusColor = `ColorValue(Switch(ThisItem.Status, "Complete", "#2E7D32", "AtRisk", "#BF360C", "Missed", "#C62828", "#2563EB"))`;
  const dateText = `If(ThisItem.Status = "Complete" And !IsBlank(ThisItem.CompletedDate), Text(ThisItem.CompletedDate, DateTimeFormat.ShortDate, Coalesce(${self}.Language, Language())), Text(ThisItem.DueDate, DateTimeFormat.ShortDate, Coalesce(${self}.Language, Language())))`;

  const cntMilestone = {
    name: "cntMilestone",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", Width: "Parent.Width" },
    children: [
      { name: "btnDot", control: "Classic/Button@2.2.0", properties: { BorderColor: "Color.White", BorderStyle: "BorderStyle.Solid", BorderThickness: "2", Fill: statusColor, Height: "16", OnSelect: `${self}.OnMilestoneSelect(ThisItem)`, RadiusBottomLeft: "8", RadiusBottomRight: "8", RadiusTopLeft: "8", RadiusTopRight: "8", Text: '""', Width: "16", X: `If(${isVertical}, 0, Parent.Width / 2 - 8)`, Y: `If(${isVertical}, Parent.Height / 2 - 8, 0)` } },
      { name: "lblMilestoneName", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "16", Size: "10", Text: "ThisItem.Name", Width: `If(${isVertical}, Parent.Width - 28, Parent.Width)`, X: `If(${isVertical}, 28, 0)`, Y: `If(${isVertical}, Parent.Height / 2 - 8, 20)` } },
      { name: "lblMilestoneDate", control: "ModernText@1.0.0", properties: { Color: "RGBA(100, 116, 139, 1)", Height: "14", Size: "9", Text: dateText, Visible: `${self}.ShowDates`, Width: `If(${isVertical}, Parent.Width - 28, Parent.Width)`, X: `If(${isVertical}, 28, 0)`, Y: `If(${isVertical}, Parent.Height / 2 + 8, 36)` } }
    ]
  };

  const cntRail = { name: "cntRail", control: "GroupContainer@1.5.0", variant: "ManualLayout", properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(226, 232, 240, 1)", Height: `If(${isVertical}, Parent.Height - 20, 2)`, Width: `If(${isVertical}, 2, Parent.Width - 40)`, X: `If(${isVertical}, 7, 20)`, Y: `If(${isVertical}, 10, Parent.Height / 2 - 1)` } };

  const galMilestones = {
    name: "galMilestones",
    control: "Gallery@2.15.0",
    variant: "Vertical",
    properties: {
      Height: `If(${isVertical}, Parent.Height, If(${self}.ShowDates, 60, 36))`,
      Items: items,
      TemplateSize: `If(${isVertical}, 48, (Parent.Width - 40) / Max(CountRows(${items}), 1))`,
      Width: `If(${isVertical}, Parent.Width, Parent.Width - 40)`,
      WrapCount: `If(${isVertical}, 1, CountRows(${items}))`,
      X: `If(${isVertical}, 0, 20)`,
      Y: `If(${isVertical}, 0, Parent.Height / 2 - 18)`
    },
    children: [cntMilestone]
  };

  return {
    properties: { Fill: "Color.Transparent", Height: `If(${isVertical}, 220, If(${self}.ShowDates, 60, 36))`, Width: `If(${isVertical}, 220, 360)` },
    children: [cntRail, galMilestones],
    eventParameters: {
      OnMilestoneSelect: [{ name: "Milestone", dataType: "Record", defaultFormula: "{Name:\"Kickoff\",DueDate:Date(2026,1,10),Status:\"Complete\",CompletedDate:Date(2026,1,9)}" }]
    }
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
  const statusColor = `ColorValue(Switch(ThisItem.Status, "Decided", "#2E7D32", "Superseded", "#475569", "#BF360C"))`;
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
    properties: { BorderStyle: "BorderStyle.None", DropShadow: `If(${isPrint}, DropShadow.None, DropShadow.Regular)`, Fill: "Color.White", Height: "Parent.Height", RadiusBottomLeft: `If(${isPrint}, 0, 20)`, RadiusBottomRight: `If(${isPrint}, 0, 20)`, RadiusTopLeft: `If(${isPrint}, 0, 20)`, RadiusTopRight: `If(${isPrint}, 0, 20)`, Width: "Parent.Width" },
    children: [
      { name: "lblHeading", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "22", Size: "16", Text: '"Decision log"', Width: "220", X: "20", Y: "16" } },
      { name: "btnAdd", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "Color.White", Fill: "RGBA(22, 131, 38, 1)", FontWeight: "FontWeight.Bold", Height: "30", OnSelect: `${self}.OnAddDecision()`, RadiusBottomLeft: "15", RadiusBottomRight: "15", RadiusTopLeft: "15", RadiusTopRight: "15", Size: "10", Text: '"Log a decision"', Visible: `And(${self}.AllowAdd, !${isPrint})`, Width: "120", X: "Parent.Width - 220", Y: "14" } },
      { name: "btnExport", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "RGBA(71, 85, 105, 1)", Fill: "RGBA(241, 245, 249, 1)", FontWeight: "FontWeight.Bold", Height: "30", OnSelect: `${self}.OnExport(${sorted})`, RadiusBottomLeft: "15", RadiusBottomRight: "15", RadiusTopLeft: "15", RadiusTopRight: "15", Size: "10", Text: '"Export"', Visible: `!${isPrint}`, Width: "88", X: "Parent.Width - 96", Y: "14" } },
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
    children: [cntCard],
    eventParameters: {
      OnExport: [{ name: "Decisions", dataType: "Table", defaultFormula: 'Table({Date:Date(2026,1,5),Decision:"Adopt Dataverse for storage",Owner:"Jordan Lee",Status:"Decided",Rationale:"Governed, scalable, integrates with Power Platform"})' }],
      OnDecisionSelect: [{ name: "Decision", dataType: "Record", defaultFormula: '{Date:Date(2026,1,5),Decision:"Adopt Dataverse for storage",Owner:"Jordan Lee",Status:"Decided",Rationale:"Governed, scalable, integrates with Power Platform"}' }]
    }
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

  // Real Studio error: "The function 'AddColumns' has some invalid
  // arguments." persisted even after removing the earlier formula-bloat
  // duplication (CONFIRMED via the user's own re-paste, still failing
  // with a single, non-duplicated copy of this chain) — so AddColumns
  // itself, applied to a Sequence(...)-sourced value bound one level up
  // through a nested With(), was the real problem, not formula size.
  // This exact AddColumns-over-a-With-scoped-Sequence-table pattern was
  // also the only one of its kind in this whole file (every other real
  // AddColumns call here runs directly against a component's own Table
  // property, never a locally bound Sequence derivative), so there was
  // no working sibling pattern to have cross-checked it against.
  // Rewritten to build the candidate-dates table with ForAll returning
  // a table of {d: ...} records directly instead — a real, standard
  // Power Fx table-building technique that needs no AddColumns call at
  // all, sidestepping whatever specific incompatibility Studio had with
  // the AddColumns form.
  const dueDate = `With({window: ForAll(Sequence(Min(${self}.Days, 400) * 2 + 20), {d: DateAdd(${self}.StartDate, Value, TimeUnit.Days)})}, With({biz: Filter(window, Weekday(d, StartOfWeek.Monday) <= 5 And IsBlank(LookUp(${self}.Holidays, HolidayDate = d)))}, If(CountRows(biz) = 0, ${self}.StartDate, Index(biz, Min(${self}.Days, CountRows(biz))).d)))`.replace(/\s*\n\s*/g, " ");
  const daysLeft = `DateDiff(Today(), ${dueDate}, TimeUnit.Days)`;
  // Real Studio error: "The function 'AddColumns' has some invalid
  // arguments." was actually a symptom of formula bloat, not a genuine
  // AddColumns bug — status originally referenced ${daysLeft} twice,
  // and daysLeft embeds dueDate's whole Sequence/AddColumns/Filter/Index
  // chain as raw text, so every consumer of status carried two full
  // copies of that chain (three, once lblCount/lblBadgeText's own direct
  // ${daysLeft} reference is added on top) — deep enough nesting that
  // Studio's own compiler choked on it. With({dl: ...}) computes
  // daysLeft once and reuses the cheap local name instead.
  const status = `If(${isComplete}, "Complete", With({dl: ${daysLeft}}, If(dl < 0, "Overdue", If(dl <= ${self}.ReminderThreshold, "DueSoon", "OnTrack"))))`;
  const countText = `With({dl: ${daysLeft}}, Text(Abs(dl)) & If(${isComplete}, "d left", If(dl < 0, "d over", "d left")))`;
  const statusColor = `ColorValue(Switch(${status}, "Complete", "#2E7D32", "Overdue", "#C62828", "DueSoon", "#BF360C", "#1565C0"))`;
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
      { name: "lblCount", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "40", Size: "32", Text: countText, Width: "260", X: "20", Y: "38" } },
      { name: "lblBreakdown", control: "ModernText@1.0.0", properties: { AutoHeight: "false", Color: "RGBA(100, 116, 139, 1)", Height: "32", Size: "10", Text: breakdown, Visible: `!${isCompact}`, Width: "260", Wrap: "true", X: "20", Y: "82" } }
    ]
  };

  const cntBadge = {
    name: "cntBadge",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: statusColor, Height: "26", RadiusBottomLeft: "13", RadiusBottomRight: "13", RadiusTopLeft: "13", RadiusTopRight: "13", Visible: isBadge, Width: "Parent.Width" },
    children: [
      { name: "lblBadgeText", control: "ModernText@1.0.0", properties: { Align: "Align.Center", Color: "Color.White", FontWeight: "FontWeight.Bold", Height: "Parent.Height", Size: "10", Text: countText, Width: "Parent.Width" } }
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
  const sorted = `SortByColumns(AddColumns(${self}.Items As Entry, "IsPinned", CountRows(Filter(${self}.PinnedIds, Id = Entry.Title)) > 0), "IsPinned", SortOrder.Descending, "Timestamp", If(${self}.SortDirection = "Newest first", SortOrder.Descending, SortOrder.Ascending))`;
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
      Color: "RGBA(71, 85, 105, 1)",
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
    children: [galItems, galSkeleton, cntError, btnLoadMore],
    eventParameters: {
      OnItemSelect: [{ name: "Item", dataType: "Record", defaultFormula: '{Title:"Project created",Description:"Initial workspace set up",Author:"Jordan Lee",Timestamp:Now(),Category:"System"}' }]
    }
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

  // A real Studio paste confirmed PA2108 rejecting both AltText and
  // OnSelect on Image@2.2.3 in this same file's own Responsive Line
  // Chart (AltText) — Image has no OnSelect either (STRONG EVIDENCE:
  // no real .pa.yaml example was found setting one). Accessible text
  // is an SVG <title> baked into the image content instead; the tap
  // target is a real transparent Classic/Button overlay sibling, the
  // same click-catcher-over-visual pattern this file already uses
  // throughout (KPI Card's own btnCardOverlay, for one).
  const chipSlot = n => [
    {
      name: `imgChip${n}`,
      control: "Image@2.2.3",
      properties: {
        Height: "14",
        Image: `If(CountRows(${dayEvents}) < ${n}, "", With({ev: Index(${dayEvents}, ${n}), ch: LookUp(${self}.Channels, Key = Index(${dayEvents}, ${n}).Channel)}, "data:image/svg+xml;utf8," & EncodeUrl("<svg xmlns='http://www.w3.org/2000/svg' width='100' height='14'><title>" & ev.Title & "</title><rect width='100' height='14' rx='3' fill='" & Coalesce(ch.Color, "#64748B") & "'/><text x='4' y='10' font-size='8' fill='white'>" & Left(ev.Title, 10) & "</text></svg>")))`.replace(/\s*\n\s*/g, " "),
        Visible: `And(CountRows(${dayEvents}) >= ${n}, ${n} <= ${self}.Config.ChipSlots)`,
        Width: "Parent.Width - 8",
        X: "4",
        Y: `16 + (${n} - 1) * 15`
      }
    },
    {
      name: `btnChipTap${n}`,
      control: "Classic/Button@2.2.0",
      properties: {
        BorderStyle: "BorderStyle.None",
        Fill: "Color.Transparent",
        Height: "14",
        OnSelect: `${self}.OnSelectEvent(Index(${dayEvents}, ${n}))`,
        Text: '""',
        Visible: `And(CountRows(${dayEvents}) >= ${n}, ${n} <= ${self}.Config.ChipSlots)`,
        Width: "Parent.Width - 8",
        X: "4",
        Y: `16 + (${n} - 1) * 15`
      }
    }
  ];

  const cntDayCell = {
    name: "cntDayCell",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: {
      BorderColor: "RGBA(226, 232, 240, 1)", BorderStyle: "BorderStyle.Solid", BorderThickness: "1",
      Fill: `ColorValue(If(${self}.Config.ShowHolidayTint, If(!IsBlank(${holidayMatch}), "#FFF3E0", If(${isToday}, "#EBF5FF", If(${isCurrentMonth}, "#FFFFFF", "#F8FAFC"))), If(${isToday}, "#EBF5FF", If(${isCurrentMonth}, "#FFFFFF", "#F8FAFC"))))`,
      Height: `${self}.Config.RowHeight`,
      Width: "76"
    },
    children: [
      { name: "lblDayNumber", control: "ModernText@1.0.0", properties: { Color: `If(${isCurrentMonth}, RGBA(23, 32, 27, 1), RGBA(148, 163, 184, 1))`, FontWeight: `If(${isToday}, FontWeight.Bold, FontWeight.Normal)`, Height: "14", Size: "9", Text: `Text(Day(${cellDate}))`, Width: "Parent.Width - 8", X: "4", Y: "2" } },
      { name: "lblHolidayName", control: "ModernText@1.0.0", properties: { Color: "RGBA(191, 54, 12, 1)", Height: "10", Size: "6", Text: `${holidayMatch}.Name`, Visible: `And(${self}.Config.ShowHolidayTint, !IsBlank(${holidayMatch}))`, Width: "Parent.Width - 8", X: "4", Y: "14" } },
      ...chipSlot(1), ...chipSlot(2), ...chipSlot(3),
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
      { name: "btnPrev", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "RGBA(23, 32, 27, 1)", Fill: "RGBA(241, 245, 249, 1)", FontWeight: "FontWeight.Bold", Height: "28", OnSelect: `${self}.OnRangeChange(DateAdd(${monthStart}, -1, TimeUnit.Months), DateAdd(${monthStart}, -1, TimeUnit.Days))`, RadiusBottomLeft: "14", RadiusBottomRight: "14", RadiusTopLeft: "14", RadiusTopRight: "14", Size: "12", Text: '"<"', Width: "28", X: "Parent.Width - 96", Y: "8" } },
      { name: "btnToday", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "RGBA(71, 85, 105, 1)", Fill: "RGBA(241, 245, 249, 1)", FontWeight: "FontWeight.Bold", Height: "28", OnSelect: `${self}.OnRangeChange(Date(Year(Today()), Month(Today()), 1), DateAdd(DateAdd(Date(Year(Today()), Month(Today()), 1), 1, TimeUnit.Months), -1, TimeUnit.Days))`, Size: "9", Text: '"Today"', Width: "44", X: "Parent.Width - 64", Y: "8" } },
      { name: "btnNext", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "RGBA(23, 32, 27, 1)", Fill: "RGBA(241, 245, 249, 1)", FontWeight: "FontWeight.Bold", Height: "28", OnSelect: `${self}.OnRangeChange(DateAdd(${monthStart}, 1, TimeUnit.Months), DateAdd(DateAdd(${monthStart}, 2, TimeUnit.Months), -1, TimeUnit.Days))`, RadiusBottomLeft: "14", RadiusBottomRight: "14", RadiusTopLeft: "14", RadiusTopRight: "14", Size: "12", Text: '">"', Width: "28", X: "Parent.Width - 32", Y: "8" } },
      dayHeaderSlot(1), dayHeaderSlot(2), dayHeaderSlot(3), dayHeaderSlot(4), dayHeaderSlot(5), dayHeaderSlot(6), dayHeaderSlot(7),
      galGrid
    ]
  };

  return {
    properties: { Height: `56 + ${self}.Config.RowHeight * 6`, Width: "532" },
    children: [cntRoot],
    eventParameters: {
      OnRangeChange: [{ name: "RangeStart", dataType: "DateAndTime", defaultFormula: "Date(2026,1,1)" }, { name: "RangeEnd", dataType: "DateAndTime", defaultFormula: "Date(2026,1,31)" }],
      OnSelectEvent: [{ name: "Event", dataType: "Record", defaultFormula: '{Title:"",Date:Date(2026,1,1),Channel:"",SeriesId:""}' }],
      OnSelectDay: [{ name: "Date", dataType: "DateAndTime", defaultFormula: "Today()" }]
    }
  };
}

/* Accordion List — real expand/collapse state via Collect()/Remove()
   on a component-local context variable (locExpandedKeys, a real
   {Key:Number} table) rather than the original contract's read-only
   ExpandedGroupKey/IsExpandAll/GroupCount/ItemCount/ActionKey/
   ActionRowType/SelectedItemKey properties. This project's own
   componentDocs.js emits every CustomProperty as `PropertyKind:
   Input` unconditionally (checked directly, not assumed) — there is
   no real mechanism here for a property the component itself sets and
   a host only reads, so those seven properties could never have
   actually worked as documented. Replaced with real event Parameters
   instead (schema-confirmed, and this project's own generator already
   supports them via eventParameters below) — OnSelectGroup/OnSelectItem/
   OnMoveUp/OnMoveDown/OnEdit/OnDelete/OnSelectionChange/OnPageChange
   all now carry their own payload directly, which is both more useful
   to a host and something this generator can actually produce. See
   componentLibrary.js's own updated Properties/Events text for the
   user-facing side of this fix.

   One flat Gallery over Groups (not a Groups+Items union — Power Fx
   has no verified simple two-table-union function, and Ungroup()'s
   exact real shape wasn't worth the research time against this
   catalog's remaining build list). Each group's template reserves 6
   fixed item slots (the same "avoid a nested Gallery control" technique
   Calendar's own day-cell chips already use), individually Visible on
   both the group's own expanded state and whether that slot's index is
   within the group's real child count — real, but every group's
   template row shares one fixed height (sized for the expanded case)
   rather than shrinking when collapsed, a disclosed tradeoff instead
   of the dynamic per-row height a live nested Gallery can't reliably
   report anyway (the same height-measuring problem this component's
   own architecture note already describes). */
function accordionList(pascal) {
  const self = `cmp${pascal}`;
  const isCompact = `${self}.Style = "Compact"`;
  const itemsForGroup = `Filter(${self}.Items, GroupKey = ThisItem.GroupKey)`;
  const isExpanded = "CountRows(Filter(locExpandedKeys, Key = ThisItem.GroupKey)) > 0";
  const toneColor = `ColorValue(Switch(ThisItem.Tone, "Positive", "#2E7D32", "Negative", "#C62828", "#BF360C"))`;
  const rowH = `If(${isCompact}, 24, 30)`;
  const maxSlots = 6;

  const itemSlot = n => ({
    name: `cntItem${n}`,
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: {
      BorderStyle: "BorderStyle.None",
      Fill: "Color.Transparent",
      Height: rowH,
      Visible: `And(${isExpanded}, ${n} <= CountRows(${itemsForGroup}))`,
      Width: "Parent.Width - 24",
      X: "24",
      Y: `40 + (${n} - 1) * ${rowH}`
    },
    children: [
      { name: "lblItemLine", control: "ModernText@1.0.0", properties: { Height: "Parent.Height", Size: "10", Text: `If(CountRows(${itemsForGroup}) >= ${n}, Index(${itemsForGroup}, ${n}).Line, "")`, Width: "Parent.Width - 70", X: "0", Y: "0" } },
      { name: "lblItemTag", control: "ModernText@1.0.0", properties: { Color: `If(CountRows(${itemsForGroup}) >= ${n}, ColorValue(Switch(Index(${itemsForGroup}, ${n}).Tone, "Positive", "#2E7D32", "Negative", "#C62828", "#BF360C")), Color.Transparent)`, FontWeight: "FontWeight.Bold", Height: "Parent.Height", Size: "9", Text: `If(CountRows(${itemsForGroup}) >= ${n}, Index(${itemsForGroup}, ${n}).Tag, "")`, Visible: `${self}.Config.ShowTags`, Width: "60", X: "Parent.Width - 60", Y: "0" } },
      { name: "btnItemTap", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", OnSelect: `${self}.OnSelectItem(Index(${itemsForGroup}, ${n}).ItemKey)`, Text: '""', Width: "Parent.Width - 60" } }
    ]
  });

  const cntGroup = {
    name: "cntGroup",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderColor: "RGBA(226, 232, 240, 1)", BorderStyle: "BorderStyle.Solid", BorderThickness: "1", Fill: "Color.White", Height: "Parent.Height", RadiusBottomLeft: "10", RadiusBottomRight: "10", RadiusTopLeft: "10", RadiusTopRight: "10", Width: "Parent.Width" },
    children: [
      { name: "lblChevron", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "20", Size: "10", Text: `If(${isExpanded}, "v", ">")`, Width: "16", X: "8", Y: "10" } },
      { name: "lblGroupTitle", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "20", Size: "11", Text: "ThisItem.Title", Width: "Parent.Width - 160", X: "28", Y: "10" } },
      { name: "lblGroupTag", control: "ModernText@1.0.0", properties: { Color: toneColor, FontWeight: "FontWeight.Bold", Height: "16", Size: "9", Text: "ThisItem.Tag", Visible: `${self}.Config.ShowTags`, Width: "80", X: "Parent.Width - 140", Y: "12" } },
      { name: "lblGroupMeta", control: "ModernText@1.0.0", properties: { Color: "RGBA(100, 116, 139, 1)", Height: "16", Size: "9", Text: `Coalesce(ThisItem.Meta, CountRows(${itemsForGroup}) & " items")`, Visible: `${self}.Config.ShowMeta`, Width: "60", X: "Parent.Width - 60", Y: "12" } },
      { name: "btnGroupHeader", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "36", OnSelect: `If(${isExpanded}, Remove(locExpandedKeys, LookUp(locExpandedKeys, Key = ThisItem.GroupKey)), Collect(locExpandedKeys, {Key: ThisItem.GroupKey})); ${self}.OnSelectGroup(ThisItem.GroupKey)`, Text: '""', Width: "Parent.Width" } },
      itemSlot(1), itemSlot(2), itemSlot(3), itemSlot(4), itemSlot(5), itemSlot(6)
    ]
  };

  const galGroups = {
    name: "galGroups",
    control: "Gallery@2.15.0",
    variant: "Vertical",
    properties: { Height: `CountRows(${self}.Groups) * (40 + ${maxSlots} * ${rowH})`, Items: `${self}.Groups`, TemplateSize: `40 + ${maxSlots} * ${rowH}`, Width: "Parent.Width - 40", WrapCount: "1", X: "20", Y: "48" },
    children: [cntGroup]
  };

  const cntRoot = {
    name: "cntRoot",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(248, 250, 252, 1)", Height: "Parent.Height", RadiusBottomLeft: "16", RadiusBottomRight: "16", RadiusTopLeft: "16", RadiusTopRight: "16", Width: "Parent.Width" },
    children: [
      { name: "lblTitle", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "22", Size: "15", Text: `${self}.Title`, Visible: `${self}.Config.ShowHeader`, Width: "220", X: "20", Y: "14" } },
      { name: "btnExpandAll", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "RGBA(71, 85, 105, 1)", Fill: "RGBA(241, 245, 249, 1)", FontWeight: "FontWeight.Bold", Height: "26", OnSelect: `If(CountRows(locExpandedKeys) >= CountRows(${self}.Groups), Clear(locExpandedKeys), Collect(locExpandedKeys, ForAll(${self}.Groups, {Key: GroupKey})))`, RadiusBottomLeft: "13", RadiusBottomRight: "13", RadiusTopLeft: "13", RadiusTopRight: "13", Size: "9", Text: `If(CountRows(locExpandedKeys) >= CountRows(${self}.Groups), "Collapse all", "Expand all")`, Visible: `${self}.Config.ShowExpandAll`, Width: "88", X: "Parent.Width - 108", Y: "14" } },
      galGroups
    ]
  };

  return {
    properties: { Height: `48 + CountRows(${self}.Groups) * (40 + ${maxSlots} * ${rowH})`, Width: "380" },
    children: [cntRoot],
    eventParameters: {
      OnSelectGroup: [{ name: "GroupKey", dataType: "Number", defaultFormula: "0" }],
      OnSelectItem: [{ name: "ItemKey", dataType: "Number", defaultFormula: "0" }],
      OnMoveUp: [{ name: "RowKey", dataType: "Number", defaultFormula: "0" }, { name: "RowType", dataType: "Text", defaultFormula: '"group"' }],
      OnMoveDown: [{ name: "RowKey", dataType: "Number", defaultFormula: "0" }, { name: "RowType", dataType: "Text", defaultFormula: '"group"' }],
      OnEdit: [{ name: "RowKey", dataType: "Number", defaultFormula: "0" }, { name: "RowType", dataType: "Text", defaultFormula: '"group"' }],
      OnDelete: [{ name: "RowKey", dataType: "Number", defaultFormula: "0" }, { name: "RowType", dataType: "Text", defaultFormula: '"group"' }],
      OnSelectionChange: [{ name: "SelectedCount", dataType: "Number", defaultFormula: "0" }],
      OnPageChange: [{ name: "PageNumber", dataType: "Number", defaultFormula: "1" }]
    }
  };
}

/* Data Table — Table view only (ViewMode's card/list values render the
   same table today; see componentLibrary.js's own disclosed
   Limitations). Sort is real (SortByColumns, guarded against a blank
   CurrentSortColumn before the host ever sets one) but reads Items
   as-is otherwise — Searchable's filtering and Sortable's own
   re-ordering of the *source* data both stay host-executed exactly as
   documented (OnSearch/OnSort only ever request them), matching every
   other host-executes-the-mutation event in this catalog. Paging is
   real and self-contained: a component-local context variable
   (locPage) tracks the current page, sliced out of Items with
   FirstN(LastN(...)) — the standard real technique for a plain
   in-memory table, since Power Fx has no generic Skip() the way SQL
   does. Multi-select reuses Accordion List's own Collect()/Remove()-
   on-a-context-variable pattern for the checked set. */
function dataTable(pascal) {
  const self = `cmp${pascal}`;
  const sorted = `If(${self}.Sortable And !IsBlank(${self}.CurrentSortColumn), SortByColumns(${self}.Items, ${self}.CurrentSortColumn, If(${self}.CurrentSortDirection = "Descending", SortOrder.Descending, SortOrder.Ascending)), ${self}.Items)`;
  const pageCount = `Max(1, RoundUp(CountRows(${self}.Items) / ${self}.PageSize, 0))`;
  const pageRows = `FirstN(LastN(${sorted}, CountRows(${self}.Items) - (Min(locPage, ${pageCount}) - 1) * ${self}.PageSize), ${self}.PageSize)`;
  const isSelected = "CountRows(Filter(locSelectedKeys, Key = ThisItem.Id)) > 0";
  const statusColor = `Coalesce(LookUp(${self}.StatusConfig, Status = ThisItem.Status).Color, LookUp(${self}.StatusConfig, Status = "Default").Color, RGBA(120, 120, 120, 1))`;
  const priorityColor = `Coalesce(LookUp(${self}.PriorityConfig, Priority = ThisItem.Priority).Color, LookUp(${self}.PriorityConfig, Priority = "Default").Color, RGBA(120, 120, 120, 1))`;

  const sortHeader = (label, col, x, w) => ({
    name: `btnSort${col}`,
    control: "Classic/Button@2.2.0",
    properties: {
      BorderStyle: "BorderStyle.None",
      Color: "RGBA(100, 116, 139, 1)",
      Fill: "Color.Transparent",
      FontWeight: "FontWeight.Bold",
      Height: "28",
      OnSelect: `${self}.OnSort("${col}", If(${self}.CurrentSortColumn = "${col}" And ${self}.CurrentSortDirection = "Ascending", "Descending", "Ascending"))`,
      Size: "9",
      Text: `"${label}" & If(${self}.Sortable, If(${self}.CurrentSortColumn = "${col}", If(${self}.CurrentSortDirection = "Ascending", " ^", " v"), ""), "")`,
      Width: w,
      X: x
    }
  });

  const cntRow = {
    name: "cntRow",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderColor: "RGBA(226, 232, 240, 1)", BorderStyle: "BorderStyle.Solid", BorderThickness: "1", Fill: "Color.White", Height: "Parent.Height", Width: "Parent.Width" },
    children: [
      { name: "btnCheck", control: "Classic/Button@2.2.0", properties: { BorderColor: "RGBA(148, 163, 184, 1)", BorderStyle: "BorderStyle.Solid", BorderThickness: "1", Fill: `If(${isSelected}, ColorValue("#168326"), Color.White)`, Height: "16", OnSelect: `If(${isSelected}, Remove(locSelectedKeys, LookUp(locSelectedKeys, Key = ThisItem.Id)), Collect(locSelectedKeys, {Key: ThisItem.Id})); ${self}.OnSelectionChange(CountRows(locSelectedKeys))`, RadiusBottomLeft: "3", RadiusBottomRight: "3", RadiusTopLeft: "3", RadiusTopRight: "3", Text: '""', Visible: `${self}.SelectionMode = "Multiple"`, Width: "16", X: "8", Y: "12" } },
      { name: "lblName", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "20", Size: "10", Text: "ThisItem.Name", Width: "140", X: `If(${self}.SelectionMode = "Multiple", 32, 8)`, Y: "10" } },
      { name: "lblStatus", control: "ModernText@1.0.0", properties: { Color: statusColor, FontWeight: "FontWeight.Bold", Height: "20", Size: "9", Text: "ThisItem.Status", Width: "80", X: "180", Y: "10" } },
      { name: "lblPriority", control: "ModernText@1.0.0", properties: { Color: priorityColor, FontWeight: "FontWeight.Bold", Height: "20", Size: "9", Text: "ThisItem.Priority", Width: "70", X: "266", Y: "10" } },
      { name: "cntProgressTrack", control: "GroupContainer@1.5.0", variant: "ManualLayout", properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(226, 232, 240, 1)", Height: "6", RadiusBottomLeft: "3", RadiusBottomRight: "3", RadiusTopLeft: "3", RadiusTopRight: "3", Visible: "!IsBlank(ThisItem.TotalSteps)", Width: "80", X: "342", Y: "17" },
        children: [{ name: "cntProgressFill", control: "GroupContainer@1.5.0", variant: "ManualLayout", properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(22, 131, 38, 1)", Height: "6", RadiusBottomLeft: "3", RadiusBottomRight: "3", RadiusTopLeft: "3", RadiusTopRight: "3", Width: "Min(1, ThisItem.CompletedSteps / Max(ThisItem.TotalSteps, 1)) * Parent.Width" } }]
      },
      { name: "btnAction1", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "RGBA(100, 116, 139, 1)", Fill: "Color.Transparent", Height: "24", OnSelect: `${self}.OnMenuItemSelect(ThisItem, Index(${self}.ContextMenuItems, 1).Key)`, Size: "9", Text: `If(CountRows(${self}.ContextMenuItems) >= 1, Index(${self}.ContextMenuItems, 1).Label, "")`, Visible: `And(CountRows(${self}.ContextMenuItems) >= 1, Index(${self}.ContextMenuItems, 1).Visible)`, Width: "44", X: "432", Y: "12" } },
      { name: "btnAction2", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "RGBA(100, 116, 139, 1)", Fill: "Color.Transparent", Height: "24", OnSelect: `${self}.OnMenuItemSelect(ThisItem, Index(${self}.ContextMenuItems, 2).Key)`, Size: "9", Text: `If(CountRows(${self}.ContextMenuItems) >= 2, Index(${self}.ContextMenuItems, 2).Label, "")`, Visible: `And(CountRows(${self}.ContextMenuItems) >= 2, Index(${self}.ContextMenuItems, 2).Visible)`, Width: "44", X: "476", Y: "12" } },
      { name: "btnAction3", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "RGBA(100, 116, 139, 1)", Fill: "Color.Transparent", Height: "24", OnSelect: `${self}.OnMenuItemSelect(ThisItem, Index(${self}.ContextMenuItems, 3).Key)`, Size: "9", Text: `If(CountRows(${self}.ContextMenuItems) >= 3, Index(${self}.ContextMenuItems, 3).Label, "")`, Visible: `And(CountRows(${self}.ContextMenuItems) >= 3, Index(${self}.ContextMenuItems, 3).Visible)`, Width: "44", X: "520", Y: "12" } },
      { name: "btnRowTap", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", OnSelect: `${self}.OnRowSelect(ThisItem)`, Text: '""', Width: "420", X: "0" } }
    ]
  };

  const cntRoot = {
    name: "cntRoot",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "Color.White", Height: "Parent.Height", Width: "Parent.Width" },
    children: [
      { name: "txtSearch", control: "Classic/TextInput@2.3.2", properties: { BorderColor: "RGBA(226, 232, 240, 1)", BorderThickness: "1", Fill: "RGBA(248, 250, 252, 1)", Height: "30", HintText: '"Search"', OnChange: `${self}.OnSearch(Self.Text)`, Size: "10", Visible: `${self}.Searchable`, Width: "180", X: "8", Y: "8" } },
      sortHeader("Name", "Name", 8, 140), sortHeader("Status", "Status", 180, 80), sortHeader("Priority", "Priority", 266, 70),
      {
        name: "galRows",
        control: "Gallery@2.15.0",
        variant: "Vertical",
        properties: { Height: `CountRows(${pageRows}) * 40`, Items: pageRows, TemplateSize: "40", Width: "580", WrapCount: "1", X: "8", Y: `If(${self}.Searchable, 78, 44)` },
        children: [cntRow]
      },
      { name: "lblNoData", control: "ModernText@1.0.0", properties: { Align: "Align.Center", Color: "RGBA(100, 116, 139, 1)", Height: "40", Size: "11", Text: `${self}.NoDataText`, Visible: `CountRows(${self}.Items) = 0`, Width: "580", X: "8", Y: "80" } },
      { name: "btnPrevPage", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "RGBA(71, 85, 105, 1)", Fill: "RGBA(241, 245, 249, 1)", FontWeight: "FontWeight.Bold", Height: "26", OnSelect: `UpdateContext({locPage: Max(1, locPage - 1)}); ${self}.OnPageChange(Max(1, locPage - 1))`, RadiusBottomLeft: "13", RadiusBottomRight: "13", RadiusTopLeft: "13", RadiusTopRight: "13", Size: "9", Text: '"Prev"', Width: "50", X: "8", Y: `If(${self}.Searchable, 88, 54) + CountRows(${pageRows}) * 40` } },
      { name: "lblPageInfo", control: "ModernText@1.0.0", properties: { Color: "RGBA(100, 116, 139, 1)", Height: "26", Size: "9", Text: `"Page " & Min(locPage, ${pageCount}) & " of " & ${pageCount}`, Width: "100", X: "64", Y: `If(${self}.Searchable, 92, 58) + CountRows(${pageRows}) * 40` } },
      { name: "btnNextPage", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "RGBA(71, 85, 105, 1)", Fill: "RGBA(241, 245, 249, 1)", FontWeight: "FontWeight.Bold", Height: "26", OnSelect: `UpdateContext({locPage: Min(${pageCount}, locPage + 1)}); ${self}.OnPageChange(Min(${pageCount}, locPage + 1))`, RadiusBottomLeft: "13", RadiusBottomRight: "13", RadiusTopLeft: "13", RadiusTopRight: "13", Size: "9", Text: '"Next"', Width: "50", X: "170", Y: `If(${self}.Searchable, 88, 54) + CountRows(${pageRows}) * 40` } }
    ]
  };

  return {
    properties: { Height: `If(${self}.Searchable, 128, 94) + CountRows(${pageRows}) * 40`, Width: "600" },
    children: [cntRoot],
    eventParameters: {
      OnRowSelect: [{ name: "Row", dataType: "Record", defaultFormula: '{Id:1,Name:"Task A",Status:"Active",Priority:"High",CompletedSteps:3,TotalSteps:5}' }],
      OnMenuItemSelect: [{ name: "Item", dataType: "Record", defaultFormula: "{Id: 0}" }, { name: "ActionKey", dataType: "Text", defaultFormula: '""' }],
      OnSort: [{ name: "Column", dataType: "Text", defaultFormula: '""' }, { name: "Direction", dataType: "Text", defaultFormula: '"Ascending"' }],
      OnSelectionChange: [{ name: "SelectedCount", dataType: "Number", defaultFormula: "0" }],
      OnSearch: [{ name: "SearchText", dataType: "Text", defaultFormula: '""' }],
      OnPageChange: [{ name: "PageNumber", dataType: "Number", defaultFormula: "1" }]
    }
  };
}

/* File Upload — a real staged-file list (Collect()/Remove() on a
   component-local locStaged context variable, the same pattern this
   file already uses for Accordion List's expand state and Data
   Table's multi-select), with a real Undo window on removal
   (locJustRemoved holds the one most-recently-removed staged record,
   matching the real canvas Attachments control's own OnUndoRemoveFile
   behavior this component's architecture already cites). No real OS
   file-picker/drag-and-drop control was researched for this pass (no
   CONFIRMED/STRONG-EVIDENCE control to point to) — Add file stages a
   clearly-labeled placeholder record instead of opening a device file
   dialog, disclosed in componentLibrary.js's own Limitations. */
function fileUpload(pascal) {
  const self = `cmp${pascal}`;
  const isCompact = `${self}.Style = "Compact"`;
  const totalCount = `CountRows(${self}.Items) + CountRows(locStaged)`;
  const atMax = `${totalCount} >= ${self}.MaxFiles`;

  const existingRow = {
    name: "cntExistingRow",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderColor: "RGBA(226, 232, 240, 1)", BorderStyle: "BorderStyle.Solid", BorderThickness: "1", Fill: "Color.White", Height: "Parent.Height", Width: "Parent.Width" },
    children: [
      { name: "lblFileName", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "18", Size: "10", Text: "ThisItem.Name", Width: "200", X: "8", Y: "6" } },
      { name: "lblFileMeta", control: "ModernText@1.0.0", properties: { Color: "RGBA(100, 116, 139, 1)", Height: "14", Size: "8", Text: `Text(Round(ThisItem.SizeBytes / 1024, 0)) & " KB - " & ThisItem.UploadedBy`, Width: "220", X: "8", Y: "24" } },
      { name: "btnView", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "RGBA(15, 108, 189, 1)", Fill: "Color.Transparent", Height: "24", OnSelect: `${self}.OnView(ThisItem)`, Size: "9", Text: '"View"', Width: "40", X: "Parent.Width - 130", Y: "12" } },
      { name: "btnDownload", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "RGBA(15, 108, 189, 1)", Fill: "Color.Transparent", Height: "24", OnSelect: `${self}.OnDownload(ThisItem)`, Size: "9", Text: '"Get"', Width: "36", X: "Parent.Width - 90", Y: "12" } },
      { name: "btnDeleteExisting", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "RGBA(197, 58, 58, 1)", Fill: "Color.Transparent", Height: "24", OnSelect: `${self}.OnDelete(ThisItem)`, Size: "9", Text: '"Delete"', Visible: `${self}.AllowDelete`, Width: "44", X: "Parent.Width - 50", Y: "12" } }
    ]
  };

  const stagedRow = {
    name: "cntStagedRow",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderColor: "RGBA(232, 245, 233, 1)", BorderStyle: "BorderStyle.Solid", BorderThickness: "1", Fill: "RGBA(232, 245, 233, 1)", Height: "Parent.Height", Width: "Parent.Width" },
    children: [
      { name: "lblStagedName", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "Parent.Height", Size: "10", Text: "ThisItem.Name", Width: "Parent.Width - 60", X: "8", Y: "0" } },
      { name: "btnRemoveStaged", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "RGBA(197, 58, 58, 1)", Fill: "Color.Transparent", Height: "Parent.Height", OnSelect: "UpdateContext({locJustRemoved: ThisItem}); Remove(locStaged, ThisItem)", Size: "9", Text: '"Remove"', Width: "56", X: "Parent.Width - 60" } }
    ]
  };

  const cntRoot = {
    name: "cntRoot",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "Color.White", Height: "Parent.Height", Width: "Parent.Width" },
    children: [
      { name: "cntDropzone", control: "GroupContainer@1.5.0", variant: "ManualLayout", properties: { BorderColor: "RGBA(226, 232, 240, 1)", BorderStyle: "BorderStyle.Solid", BorderThickness: "1", Fill: "RGBA(248, 250, 252, 1)", Height: `If(${isCompact}, 0, 60)`, RadiusBottomLeft: "10", RadiusBottomRight: "10", RadiusTopLeft: "10", RadiusTopRight: "10", Visible: `And(!${isCompact}, ${self}.AllowUpload, !${atMax})`, Width: "Parent.Width - 16", X: "8", Y: "8" },
        children: [{ name: "lblDropHint", control: "ModernText@1.0.0", properties: { Align: "Align.Center", Color: "RGBA(100, 116, 139, 1)", Height: "20", Size: "10", Text: '"Drag files here or tap Add file below"', Width: "Parent.Width", X: "0", Y: "20" } }]
      },
      { name: "lblMaxReached", control: "ModernText@1.0.0", properties: { Align: "Align.Center", Color: "RGBA(191, 54, 12, 1)", Height: "24", Size: "10", Text: `${self}.MaxAttachmentsText`, Visible: atMax, Width: "Parent.Width - 16", X: "8", Y: "8" } },
      { name: "btnAddFile", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "Color.White", Fill: "RGBA(22, 131, 38, 1)", FontWeight: "FontWeight.Bold", Height: "28", OnSelect: `Collect(locStaged, {Id: CountRows(locStaged) + 1, Name: "New file " & (CountRows(locStaged) + 1) & ".pdf", SizeBytes: 102400, Ext: "pdf"})`, RadiusBottomLeft: "14", RadiusBottomRight: "14", RadiusTopLeft: "14", RadiusTopRight: "14", Size: "10", Text: '"Add file"', Visible: `And(${self}.AllowUpload, !${atMax})`, Width: "88", X: "8", Y: `If(${isCompact}, 8, 76)` } },
      {
        name: "galExisting",
        control: "Gallery@2.15.0",
        variant: "Vertical",
        properties: { Height: `CountRows(${self}.Items) * 44`, Items: `${self}.Items`, TemplateSize: "44", Width: "Parent.Width - 16", WrapCount: "1", X: "8", Y: `If(${isCompact}, 44, 112)` },
        children: [existingRow]
      },
      {
        name: "galStaged",
        control: "Gallery@2.15.0",
        variant: "Vertical",
        properties: { Height: "CountRows(locStaged) * 28", Items: "locStaged", TemplateSize: "28", Width: "Parent.Width - 16", WrapCount: "1", X: "8", Y: `If(${isCompact}, 44, 112) + CountRows(${self}.Items) * 44` },
        children: [stagedRow]
      },
      { name: "lblUndoRemoved", control: "ModernText@1.0.0", properties: { Color: "RGBA(100, 116, 139, 1)", Height: "20", Size: "9", Text: `"Removed " & locJustRemoved.Name & " - "`, Visible: "!IsBlank(locJustRemoved)", Width: "160", X: "8", Y: `If(${isCompact}, 44, 112) + CountRows(${self}.Items) * 44 + CountRows(locStaged) * 28 + 6` } },
      { name: "btnUndoRemove", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "RGBA(15, 108, 189, 1)", Fill: "Color.Transparent", FontWeight: "FontWeight.Bold", Height: "20", OnSelect: `Collect(locStaged, locJustRemoved); UpdateContext({locJustRemoved: Blank()}); ${self}.OnUndoRemove()`, Size: "9", Text: '"Undo"', Visible: "!IsBlank(locJustRemoved)", Width: "40", X: "168", Y: `If(${isCompact}, 44, 112) + CountRows(${self}.Items) * 44 + CountRows(locStaged) * 28 + 6` } },
      { name: "lblNoFiles", control: "ModernText@1.0.0", properties: { Align: "Align.Center", Color: "RGBA(100, 116, 139, 1)", Height: "24", Size: "10", Text: `${self}.NoFilesText`, Visible: `${totalCount} = 0`, Width: "Parent.Width - 16", X: "8", Y: `If(${isCompact}, 44, 112)` } },
      { name: "btnUpload", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "Color.White", Fill: "RGBA(22, 131, 38, 1)", FontWeight: "FontWeight.Bold", Height: "32", OnSelect: `${self}.OnSave(locStaged); Clear(locStaged)`, RadiusBottomLeft: "16", RadiusBottomRight: "16", RadiusTopLeft: "16", RadiusTopRight: "16", Size: "10", Text: '"Upload"', Visible: `And(${self}.AllowUpload, CountRows(locStaged) > 0)`, Width: "88", X: "Parent.Width - 192", Y: "8" } },
      { name: "btnCancel", control: "Classic/Button@2.2.0", properties: { BorderColor: "RGBA(226, 232, 240, 1)", BorderStyle: "BorderStyle.Solid", BorderThickness: "1", Color: "RGBA(71, 85, 105, 1)", Fill: "Color.White", FontWeight: "FontWeight.Bold", Height: "32", OnSelect: `Clear(locStaged); ${self}.OnCancel()`, RadiusBottomLeft: "16", RadiusBottomRight: "16", RadiusTopLeft: "16", RadiusTopRight: "16", Size: "10", Text: '"Cancel"', Visible: `And(${self}.AllowUpload, CountRows(locStaged) > 0)`, Width: "88", X: "Parent.Width - 96", Y: "8" } }
    ]
  };

  return {
    properties: { Height: `(If(${isCompact}, 44, 112) + CountRows(${self}.Items) * 44 + CountRows(locStaged) * 28 + 40)`, Width: "360" },
    children: [cntRoot],
    eventParameters: {
      OnView: [{ name: "File", dataType: "Record", defaultFormula: '{Id:1,Name:"Statement-of-Work.pdf",SizeBytes:245000,UploadedOn:Date(2026,1,12),UploadedBy:"Jordan Lee",Ext:"pdf"}' }],
      OnDownload: [{ name: "File", dataType: "Record", defaultFormula: '{Id:1,Name:"Statement-of-Work.pdf",SizeBytes:245000,UploadedOn:Date(2026,1,12),UploadedBy:"Jordan Lee",Ext:"pdf"}' }],
      OnDelete: [{ name: "File", dataType: "Record", defaultFormula: '{Id:1,Name:"Statement-of-Work.pdf",SizeBytes:245000,UploadedOn:Date(2026,1,12),UploadedBy:"Jordan Lee",Ext:"pdf"}' }],
      OnSave: [{ name: "Files", dataType: "Table", defaultFormula: 'Table({Id:1,Name:"New file 1.pdf",SizeBytes:102400,Ext:"pdf"})' }]
    }
  };
}

/* Email Composer — To/CC/Bcc as real Classic/TextInput fields bound
   to a comma-separated address string rather than a full typeahead
   picker against Directory — a disclosed simplification (Directory is
   still a real property the host can use its own way; this Children
   tree doesn't build a live-filtered suggestion Gallery under each
   field). ContextHtml renders as plain text in a tinted box rather
   than parsed HTML — no CONFIRMED/STRONG-EVIDENCE HTML-rendering
   control was researched for this pass, and guessing one (e.g. a
   Classic/HtmlViewer version string) would repeat the exact mistake
   this catalog's own skill file exists to prevent. Both simplifications
   are disclosed in componentLibrary.js's own Limitations. */
function emailComposer(pascal) {
  const self = `cmp${pascal}`;
  const isCompact = `${self}.Style = "Compact"`;
  const hasContext = `${self}.ContextHtml <> ""`;
  const ctxY = `If(${hasContext}, 40, 0)`;

  const priorityBtn = (label, val, x) => ({
    name: `btnPriority${val}`,
    control: "Classic/Button@2.2.0",
    properties: {
      BorderColor: "RGBA(226, 232, 240, 1)", BorderStyle: "BorderStyle.Solid", BorderThickness: "1",
      Color: `If(${self}.DefaultPriority = "${val}", Color.White, RGBA(71, 85, 105, 1))`,
      Fill: `If(${self}.DefaultPriority = "${val}", RGBA(23, 32, 27, 1), Color.White)`,
      FontWeight: "FontWeight.Bold",
      Height: "24",
      OnSelect: `${self}.OnSend(${self}.Directory, txtSubject.Text, txtBody.Text, "${val}", ${self}.Attachments)`,
      RadiusBottomLeft: "12", RadiusBottomRight: "12", RadiusTopLeft: "12", RadiusTopRight: "12",
      Size: "9", Text: `"${label}"`, Width: "60", X: x
    }
  });

  const cntRoot = {
    name: "cntRoot",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", DropShadow: "DropShadow.Regular", Fill: "Color.White", Height: "Parent.Height", RadiusBottomLeft: "16", RadiusBottomRight: "16", RadiusTopLeft: "16", RadiusTopRight: "16", Visible: `!${self}.Busy`, Width: "Parent.Width" },
    children: [
      { name: "txtTo", control: "Classic/TextInput@2.3.2", properties: { BorderColor: "RGBA(226, 232, 240, 1)", BorderThickness: "1", Fill: "Color.White", Height: "30", HintText: '"To (name or email, comma-separated)"', Size: "10", Width: "Parent.Width - 16", X: "8", Y: "8" } },
      { name: "txtCc", control: "Classic/TextInput@2.3.2", properties: { BorderColor: "RGBA(226, 232, 240, 1)", BorderThickness: "1", Fill: "Color.White", Height: "30", HintText: '"Cc"', Size: "10", Visible: `!${isCompact}`, Width: "Parent.Width - 16", X: "8", Y: "42" } },
      { name: "txtBcc", control: "Classic/TextInput@2.3.2", properties: { BorderColor: "RGBA(226, 232, 240, 1)", BorderThickness: "1", Fill: "Color.White", Height: "30", HintText: '"Bcc"', Size: "10", Visible: `And(${self}.ShowBcc, !${isCompact})`, Width: "Parent.Width - 16", X: "8", Y: `If(${self}.ShowBcc, 76, 42)` } },
      { name: "txtSubject", control: "Classic/TextInput@2.3.2", properties: { BorderColor: "RGBA(226, 232, 240, 1)", BorderThickness: "1", Default: `${self}.DefaultSubject`, Fill: "Color.White", Height: "30", HintText: '"Subject"', Size: "10", Width: "Parent.Width - 16", X: "8", Y: `If(${isCompact}, 42, If(${self}.ShowBcc, 110, 76))` } },
      { name: "cntContext", control: "GroupContainer@1.5.0", variant: "ManualLayout", properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(248, 250, 252, 1)", Height: "36", RadiusBottomLeft: "8", RadiusBottomRight: "8", RadiusTopLeft: "8", RadiusTopRight: "8", Visible: hasContext, Width: "Parent.Width - 16", X: "8", Y: `If(${isCompact}, 76, If(${self}.ShowBcc, 144, 110))` },
        children: [{ name: "lblContext", control: "ModernText@1.0.0", properties: { AutoHeight: "false", Color: "RGBA(71, 85, 105, 1)", Height: "Parent.Height", Size: "9", Text: `${self}.ContextHtml`, Width: "Parent.Width - 16", Wrap: "true", X: "8", Y: "0" } }]
      },
      { name: "txtBody", control: "Classic/TextInput@2.3.2", properties: { BorderColor: "RGBA(226, 232, 240, 1)", BorderThickness: "1", Fill: "Color.White", Height: "70", HintText: '"Write your note..."', Size: "10", Width: "Parent.Width - 16", X: "8", Y: `If(${isCompact}, 76 + 40, If(${self}.ShowBcc, 144, 110) + ${ctxY}) ` } },
      { name: "lblSignature", control: "ModernText@1.0.0", properties: { Color: "RGBA(100, 116, 139, 1)", Height: "16", Size: "9", Text: `${self}.Signature`, Visible: `${self}.Signature <> ""`, Width: "Parent.Width - 16", X: "8", Y: `If(${isCompact}, 76 + 40, If(${self}.ShowBcc, 144, 110) + ${ctxY}) + 74` } },
      priorityBtn("Low", "Low", 8), priorityBtn("Normal", "Normal", 72), priorityBtn("High", "High", 136),
      { name: "btnCancel", control: "Classic/Button@2.2.0", properties: { BorderColor: "RGBA(226, 232, 240, 1)", BorderStyle: "BorderStyle.Solid", BorderThickness: "1", Color: "RGBA(71, 85, 105, 1)", Fill: "Color.White", FontWeight: "FontWeight.Bold", Height: "28", OnSelect: `${self}.OnCancel()`, RadiusBottomLeft: "14", RadiusBottomRight: "14", RadiusTopLeft: "14", RadiusTopRight: "14", Size: "10", Text: '"Cancel"', Width: "72", X: "Parent.Width - 160", Y: "Parent.Height - 40" } },
      { name: "btnSend", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "Color.White", Fill: "RGBA(22, 131, 38, 1)", FontWeight: "FontWeight.Bold", Height: "28", OnSelect: `${self}.OnSend(${self}.Directory, txtSubject.Text, txtBody.Text, ${self}.DefaultPriority, ${self}.Attachments)`, RadiusBottomLeft: "14", RadiusBottomRight: "14", RadiusTopLeft: "14", RadiusTopRight: "14", Size: "10", Text: '"Send"', Width: "72", X: "Parent.Width - 80", Y: "Parent.Height - 40" } }
    ]
  };

  const cntBusy = {
    name: "cntBusy",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "Color.White", Height: "Parent.Height", RadiusBottomLeft: "16", RadiusBottomRight: "16", RadiusTopLeft: "16", RadiusTopRight: "16", Visible: `${self}.Busy`, Width: "Parent.Width" },
    children: [{ name: "lblBusy", control: "ModernText@1.0.0", properties: { Align: "Align.Center", FontWeight: "FontWeight.Bold", Height: "24", Size: "11", Text: '"Sending..."', Width: "Parent.Width", X: "0", Y: "Parent.Height / 2 - 12" } }]
  };

  return {
    properties: { Height: "260", Width: "360" },
    children: [cntRoot, cntBusy],
    eventParameters: {
      OnSend: [
        { name: "Recipients", dataType: "Table", defaultFormula: 'Table({DisplayName:"Jordan Lee",Mail:"jordan.lee@example.com",JobTitle:"Power Platform Architect"})' },
        { name: "Subject", dataType: "Text", defaultFormula: '""' },
        { name: "Body", dataType: "Text", defaultFormula: '""' },
        { name: "Priority", dataType: "Text", defaultFormula: '"Low"' },
        { name: "Attachments", dataType: "Table", defaultFormula: 'Filter(Table({Id:1,Name:"",SizeBytes:0}),Id<>Id)' }
      ]
    }
  };
}

/* Dialog — checked directly against Power Apps' own Confirm() function
   per its own architecture note; the Children tree mirrors that same
   contract. Size drives a real three-step width scale (Fluent's own
   Small/Medium/Large Dialog/Panel sizing), Style: Destructive only
   recolors ConfirmButtonText's own button. No Custom-content body slot
   is built — Message is the only body text rendered, disclosed in
   componentLibrary.js's own Limitations. */
function dialog(pascal) {
  const self = `cmp${pascal}`;
  const isDestructive = `${self}.Style = "Destructive"`;
  const dialogWidth = `Switch(${self}.Size, "Large", 420, "Medium", 340, 280)`;

  const cntBackdrop = { name: "cntBackdrop", control: "GroupContainer@1.5.0", variant: "ManualLayout", properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(15, 23, 42, 0.5)", Height: "Parent.Height", Width: "Parent.Width" } };

  const cntDialog = {
    name: "cntDialog",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: {
      BorderStyle: "BorderStyle.None", DropShadow: "DropShadow.Regular", Fill: "Color.White",
      Height: "170", RadiusBottomLeft: "16", RadiusBottomRight: "16", RadiusTopLeft: "16", RadiusTopRight: "16",
      Width: dialogWidth, X: `(Parent.Width - ${dialogWidth}) / 2`, Y: "Parent.Height / 2 - 85"
    },
    children: [
      { name: "lblTitle", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "22", Size: "15", Text: `${self}.Title`, Width: "Parent.Width - 32", X: "16", Y: "16" } },
      { name: "lblSubtitle", control: "ModernText@1.0.0", properties: { Color: "RGBA(100, 116, 139, 1)", Height: "16", Size: "10", Text: `${self}.Subtitle`, Visible: `${self}.Subtitle <> ""`, Width: "Parent.Width - 32", X: "16", Y: "38" } },
      { name: "lblMessage", control: "ModernText@1.0.0", properties: { AutoHeight: "false", Height: "48", Size: "11", Text: `${self}.Message`, Width: "Parent.Width - 32", Wrap: "true", X: "16", Y: `If(${self}.Subtitle <> "", 58, 44)` } },
      { name: "btnCancel", control: "Classic/Button@2.2.0", properties: { BorderColor: "RGBA(226, 232, 240, 1)", BorderStyle: "BorderStyle.Solid", BorderThickness: "1", Color: "RGBA(71, 85, 105, 1)", Fill: "Color.White", FontWeight: "FontWeight.Bold", Height: "34", OnSelect: `${self}.OnCancel()`, RadiusBottomLeft: "17", RadiusBottomRight: "17", RadiusTopLeft: "17", RadiusTopRight: "17", Size: "11", Text: `${self}.CancelButtonText`, Visible: `${self}.ShowCancel`, Width: "Parent.Width / 2 - 24", X: "16", Y: "Parent.Height - 50" } },
      { name: "btnConfirm", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "Color.White", Fill: `If(${isDestructive}, RGBA(197, 58, 58, 1), RGBA(22, 131, 38, 1))`, FontWeight: "FontWeight.Bold", Height: "34", OnSelect: `${self}.OnConfirm()`, RadiusBottomLeft: "17", RadiusBottomRight: "17", RadiusTopLeft: "17", RadiusTopRight: "17", Size: "11", Text: `${self}.ConfirmButtonText`, Width: `If(${self}.ShowCancel, Parent.Width / 2 - 24, Parent.Width - 32)`, X: `If(${self}.ShowCancel, Parent.Width / 2 + 8, 16)`, Y: "Parent.Height - 50" } }
    ]
  };

  return {
    properties: { Fill: "Color.Transparent", Height: "400", Width: "500" },
    children: [cntBackdrop, cntDialog]
  };
}

/* Comments & Mentions — a real, single flat Gallery over Comments
   (sorted by Timestamp), with a visual indent for a row whose own
   ParentId is set rather than nesting replies directly beneath their
   real parent (the same no-verified-table-union constraint every
   parent/child component in this file has hit — see Accordion List).
   Reactions render from ReactionCounts' own real {Emoji,Count} rows
   (fixed 2 slots) rather than a map, since Power Fx has no map type
   for a Table cell. @mention live-typing suggestions aren't wired —
   the compose box is a plain Classic/TextInput plus Post, disclosed in
   componentLibrary.js's own Limitations. */
function commentsAndMentions(pascal) {
  const self = `cmp${pascal}`;
  const isReadOnly = `${self}.Style = "Read-only"`;
  const isOwn = "ThisItem.Author = " + self + ".CurrentUser";
  const sorted = `SortByColumns(${self}.Comments, "Timestamp", SortOrder.Ascending)`;

  const reactionSlot = n => ({
    name: `btnReaction${n}`,
    control: "Classic/Button@2.2.0",
    properties: {
      BorderColor: "RGBA(226, 232, 240, 1)", BorderStyle: "BorderStyle.Solid", BorderThickness: "1",
      Color: "RGBA(71, 85, 105, 1)", Fill: "RGBA(248, 250, 252, 1)",
      Height: "20",
      OnSelect: `${self}.OnReact(ThisItem.Id, Index(ThisItem.ReactionCounts, ${n}).Emoji)`,
      RadiusBottomLeft: "10", RadiusBottomRight: "10", RadiusTopLeft: "10", RadiusTopRight: "10",
      Size: "9",
      Text: `If(CountRows(ThisItem.ReactionCounts) >= ${n}, Index(ThisItem.ReactionCounts, ${n}).Emoji & " " & Index(ThisItem.ReactionCounts, ${n}).Count, "")`,
      Visible: `And(${self}.AllowReactions, CountRows(ThisItem.ReactionCounts) >= ${n})`,
      Width: "44",
      X: 8 + (n - 1) * 48
    }
  });

  const cntComment = {
    name: "cntComment",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", Width: "Parent.Width", X: "If(IsBlank(ThisItem.ParentId), 0, 24)" },
    children: [
      { name: "lblAuthor", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "16", Size: "10", Text: "ThisItem.Author", Width: "180", X: "0", Y: "0" } },
      { name: "lblTimestamp", control: "ModernText@1.0.0", properties: { Color: "RGBA(148, 163, 184, 1)", Height: "14", Size: "8", Text: `Text(ThisItem.Timestamp, DateTimeFormat.ShortDateTime, Coalesce(Blank(), Language()))`, Width: "140", X: "Parent.Width - 148", Y: "2" } },
      { name: "lblCommentText", control: "ModernText@1.0.0", properties: { AutoHeight: "false", Height: "18", Size: "10", Text: "ThisItem.Text", Width: "Parent.Width", X: "0", Y: "16" } },
      reactionSlot(1), reactionSlot(2),
      { name: "btnReply", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "RGBA(15, 108, 189, 1)", Fill: "Color.Transparent", Height: "20", OnSelect: `UpdateContext({locReplyTo: ThisItem.Id})`, Size: "9", Text: '"Reply"', Visible: `And(${self}.AllowReply, IsBlank(ThisItem.ParentId))`, Width: "44", X: "104" } },
      { name: "btnEdit", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "RGBA(100, 116, 139, 1)", Fill: "Color.Transparent", Height: "20", OnSelect: `${self}.OnEdit(ThisItem.Id, ThisItem.Text)`, Size: "9", Text: '"Edit"', Visible: isOwn, Width: "36", X: "148" } },
      { name: "btnDeleteComment", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "RGBA(197, 58, 58, 1)", Fill: "Color.Transparent", Height: "20", OnSelect: `${self}.OnDelete(ThisItem)`, Size: "9", Text: '"Delete"', Visible: isOwn, Width: "44", X: "186" } }
    ]
  };

  const cntCompose = {
    name: "cntCompose",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "70", Visible: `!${isReadOnly}`, Width: "Parent.Width", Y: `CountRows(${self}.Comments) * 60 + 8` },
    children: [
      { name: "lblReplyingTo", control: "ModernText@1.0.0", properties: { Color: "RGBA(100, 116, 139, 1)", Height: "14", Size: "8", Text: '"Replying to a comment - "', Visible: "!IsBlank(locReplyTo)", Width: "160", X: "0", Y: "0" } },
      { name: "btnCancelReply", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "RGBA(15, 108, 189, 1)", Fill: "Color.Transparent", Height: "14", OnSelect: "UpdateContext({locReplyTo: Blank()})", Size: "8", Text: '"cancel"', Visible: "!IsBlank(locReplyTo)", Width: "40", X: "160", Y: "0" } },
      { name: "txtCompose", control: "Classic/TextInput@2.3.2", properties: { BorderColor: "RGBA(226, 232, 240, 1)", BorderThickness: "1", Fill: "Color.White", Height: "36", HintText: '"Write a comment... use @ to mention someone"', Size: "10", Width: "Parent.Width - 76", X: "0", Y: "14" } },
      { name: "btnAttach", control: "Classic/Button@2.2.0", properties: { BorderColor: "RGBA(226, 232, 240, 1)", BorderStyle: "BorderStyle.Solid", BorderThickness: "1", Color: "RGBA(71, 85, 105, 1)", Fill: "Color.White", Height: "36", Size: "9", Text: '"+"', Visible: `${self}.AllowAttachments`, Width: "32", X: "Parent.Width - 76", Y: "14" } },
      { name: "btnPost", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "Color.White", Fill: "RGBA(22, 131, 38, 1)", FontWeight: "FontWeight.Bold", Height: "36", OnSelect: `${self}.OnPost(txtCompose.Text, Blank(), locReplyTo); UpdateContext({locReplyTo: Blank()})`, RadiusBottomLeft: "18", RadiusBottomRight: "18", RadiusTopLeft: "18", RadiusTopRight: "18", Size: "10", Text: '"Post"', Width: "40", X: "Parent.Width - 40", Y: "14" } }
    ]
  };

  const galComments = {
    name: "galComments",
    control: "Gallery@2.15.0",
    variant: "Vertical",
    properties: { Height: `CountRows(${self}.Comments) * 60`, Items: sorted, TemplateSize: "60", Width: "Parent.Width", WrapCount: "1", Y: "0" },
    children: [cntComment]
  };

  return {
    properties: { Height: `CountRows(${self}.Comments) * 60 + If(${isReadOnly}, 8, 78)`, Width: "360" },
    children: [galComments, cntCompose],
    eventParameters: {
      OnPost: [{ name: "Text", dataType: "Text", defaultFormula: '""' }, { name: "Mentions", dataType: "Table", defaultFormula: "Filter(Table({DisplayName: \"\"}), DisplayName <> DisplayName)" }, { name: "ParentId", dataType: "Number", defaultFormula: "0" }],
      OnReact: [{ name: "CommentId", dataType: "Number", defaultFormula: "0" }, { name: "Emoji", dataType: "Text", defaultFormula: '""' }],
      OnEdit: [{ name: "CommentId", dataType: "Number", defaultFormula: "0" }, { name: "NewText", dataType: "Text", defaultFormula: '""' }],
      OnDelete: [{ name: "Comment", dataType: "Record", defaultFormula: '{Id:1,Author:"Jordan Lee",Text:"Looks good, ready for review.",Timestamp:Now(),ParentId:Blank(),ReactionCounts:Table({Emoji:"Like",Count:2})}' }]
    }
  };
}

/* Sidebar — a real Gallery over top-level Items (ParentId blank), each
   with up to 4 fixed child-item slots beneath it (the same "avoid a
   nested Gallery control" technique this file uses throughout) shown
   only while IsExpanded. IsExpanded also drives label visibility for
   an icon-only collapsed rail. ItemIconColor is a native Color value
   in this catalog's own sample data (not text hex), used directly. */
function sidebar(pascal) {
  const self = `cmp${pascal}`;
  const railWidth = `If(${self}.IsExpanded, 260, 64)`;
  const isDark = `${self}.Theme = "Dark"`;
  const topItems = `Filter(${self}.Items, IsBlank(ParentId))`;
  const childrenFor = pid => `Filter(${self}.Items, ParentId = ${pid})`;

  const childSlot = n => ({
    name: `lblChild${n}`,
    control: "ModernText@1.0.0",
    properties: {
      Color: `If(${isDark}, RGBA(226, 232, 240, 1), RGBA(71, 85, 105, 1))`,
      Height: "24",
      Size: "9",
      Text: `If(CountRows(${childrenFor("ThisItem.Id")}) >= ${n}, Index(${childrenFor("ThisItem.Id")}, ${n}).Label, "")`,
      Visible: `And(${self}.IsExpanded, CountRows(${childrenFor("ThisItem.Id")}) >= ${n})`,
      Width: "Parent.Width - 48",
      X: "40",
      Y: 40 + (n - 1) * 24
    }
  });

  const cntNavItem = {
    name: "cntNavItem",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: `If(ThisItem.Key = ${self}.SelectedKey, If(${isDark}, RGBA(255,255,255,0.08), RGBA(22, 131, 38, 0.08)), Color.Transparent)`, Height: "Parent.Height", Width: "Parent.Width" },
    children: [
      { name: "btnIconDot", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "ThisItem.ItemIconColor", Height: "10", RadiusBottomLeft: "5", RadiusBottomRight: "5", RadiusTopLeft: "5", RadiusTopRight: "5", Text: '""', Width: "10", X: "16", Y: "13" } },
      { name: "lblItemLabel", control: "ModernText@1.0.0", properties: { Color: `If(${isDark}, Color.White, RGBA(23, 32, 27, 1))`, FontWeight: "FontWeight.Bold", Height: "20", Size: "10", Text: "ThisItem.Label", Visible: `${self}.IsExpanded`, Width: "Parent.Width - 90", X: "36", Y: "10" } },
      { name: "lblBadge", control: "ModernText@1.0.0", properties: { Align: "Align.Center", Color: "Color.White", FontWeight: "FontWeight.Bold", Height: "16", Size: "8", Text: "Text(ThisItem.ItemBadgeCount)", Visible: `And(${self}.IsExpanded, ThisItem.ItemBadgeCount > 0)`, Width: "20", X: "Parent.Width - 32", Y: "12" } },
      childSlot(1), childSlot(2), childSlot(3), childSlot(4),
      { name: "btnItemTap", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "36", OnSelect: `${self}.OnItemSelect(ThisItem)`, Text: '""', Width: "Parent.Width" } }
    ]
  };

  const galItems = {
    name: "galItems",
    control: "Gallery@2.15.0",
    variant: "Vertical",
    properties: { Height: `CountRows(${topItems}) * If(${self}.IsExpanded, 40, 36)`, Items: topItems, TemplateSize: `If(${self}.IsExpanded, 40, 36)`, Width: railWidth, WrapCount: "1", X: "0", Y: "16" },
    children: [cntNavItem]
  };

  const cntRoot = {
    name: "cntRoot",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: `If(${isDark}, RGBA(11, 17, 16, 1), Color.White)`, Height: "Parent.Height", Width: railWidth },
    children: [
      galItems,
      { name: "cntFooter", control: "GroupContainer@1.5.0", variant: "ManualLayout", properties: { BorderStyle: "BorderStyle.None", Fill: `If(${isDark}, RGBA(255,255,255,0.06), RGBA(248, 250, 252, 1))`, Height: "48", RadiusBottomLeft: "8", RadiusBottomRight: "8", RadiusTopLeft: "8", RadiusTopRight: "8", Width: railWidth + " - 16", X: "8", Y: "Parent.Height - 56" },
        children: [
          { name: "lblInitials", control: "ModernText@1.0.0", properties: { Align: "Align.Center", Color: "Color.White", FontWeight: "FontWeight.Bold", Height: "32", Size: "11", Text: `Upper(Left(${self}.UserName, 1) & Left(Last(Split(${self}.UserName, " ")).Result, 1))`, Width: "32", X: "8", Y: "8" } },
          { name: "lblUserName", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "32", Size: "10", Text: `${self}.UserName`, Visible: `${self}.IsExpanded`, Width: "Parent.Width - 56", X: "48", Y: "12" } }
        ]
      },
      { name: "btnExpandToggle", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: `If(${isDark}, Color.White, RGBA(71, 85, 105, 1))`, Fill: "Color.Transparent", FontWeight: "FontWeight.Bold", Height: "24", OnSelect: `${self}.OnExpandToggle(!${self}.IsExpanded)`, Size: "10", Text: `If(${self}.IsExpanded, "<", ">")`, Width: "24", X: "8", Y: "-8" } }
    ]
  };

  return {
    properties: { Height: "480", Width: railWidth },
    children: [cntRoot],
    eventParameters: {
      OnItemSelect: [{ name: "Item", dataType: "Record", defaultFormula: "{Id:1,ParentId:Blank(),Label:\"Dashboard\",ItemBadgeCount:0,ItemIconColor:RGBA(22,131,38,1)}" }],
      OnExpandToggle: [{ name: "IsExpanded", dataType: "Boolean", defaultFormula: "true" }]
    }
  };
}

/* Responsive Breadcrumbs — checked against Fluent UI's own
   MaxDisplayedItems/OverflowIndex naming per this component's
   architecture note. Real, but simplified: a fixed 8-slot cap (a
   Children tree can't create more physical controls than the author
   built regardless of how deep a host's own Items table goes), and
   the overflow "..." toggles a component-local locShowAll flag to
   reveal every crumb rather than a real hover/tap dropdown menu
   listing just the hidden ones — a disclosed simplification, not the
   full Fluent overflow-menu behavior. */
function responsiveBreadcrumbs(pascal) {
  const self = `cmp${pascal}`;
  const n = `CountRows(${self}.Items)`;
  const tailCount = `Max(${self}.MaxDisplayedItems - ${self}.OverflowIndex, 1)`;
  const showOverflow = `And(${n} > ${self}.MaxDisplayedItems, !locShowAll)`;
  const maxSlots = 8;

  const crumbVisible = i => `Or(locShowAll, ${i} <= ${self}.OverflowIndex, ${i} > ${n} - ${tailCount})`;

  const crumbSlot = i => ({
    name: `cntCrumb${i}`,
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "24", Visible: `And(${i} <= ${n}, ${crumbVisible(i)})`, Width: "120" },
    children: [
      { name: "lblCrumbLabel", control: "Label@2.5.1", properties: { Color: `If(${i} = ${n}, RGBA(23, 32, 27, 1), RGBA(15, 108, 189, 1))`, FontWeight: `If(${i} = ${n}, FontWeight.Bold, FontWeight.Normal)`, Height: "20", Size: "10", Text: `If(${i} > ${n}, "", Left(Index(${self}.Items, ${i}).Label, ${self}.TruncateAt) & If(Len(Index(${self}.Items, ${i}).Label) > ${self}.TruncateAt, "...", ""))`, Width: "90", X: "0", Y: "2" } },
      { name: "lblChevron", control: "Label@2.5.1", properties: { Color: "RGBA(148, 163, 184, 1)", Height: "20", Size: "10", Text: '">"', Visible: `${i} < ${n}`, Width: "12", X: "94", Y: "2" } },
      { name: "btnCrumbTap", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "20", OnSelect: `${self}.OnItemSelect(Index(${self}.Items, ${i}).Key)`, Text: '""', Visible: `And(${i} <= ${n}, ${i} <> ${n}, Coalesce(Index(${self}.Items, ${i}).ItemClickable, true))`, Width: "90", X: "0" } }
    ]
  });

  const btnOverflow = { name: "btnOverflow", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "RGBA(100, 116, 139, 1)", Fill: "RGBA(241, 245, 249, 1)", FontWeight: "FontWeight.Bold", Height: "24", OnSelect: "UpdateContext({locShowAll: true})", RadiusBottomLeft: "12", RadiusBottomRight: "12", RadiusTopLeft: "12", RadiusTopRight: "12", Size: "10", Text: `"... (" & (${n} - ${self}.OverflowIndex - ${tailCount}) & ")"`, Visible: showOverflow, Width: "60" } };

  const cntRoot = {
    name: "cntRoot",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", Width: "Parent.Width" },
    children: [
      ...Array.from({ length: maxSlots }, (_, i) => {
        const slot = crumbSlot(i + 1);
        slot.properties.X = String(i * 68);
        return slot;
      }),
      (() => { btnOverflow.properties.X = String(maxSlots * 68); return btnOverflow; })()
    ]
  };

  return {
    properties: { Fill: "Color.Transparent", Height: "24", Width: "600" },
    children: [cntRoot],
    eventParameters: {
      OnItemSelect: [{ name: "Key", dataType: "Text", defaultFormula: '"home"' }]
    }
  };
}

/* Mega Menu — a real Gallery over MenuItems (up to 6 fixed top-level
   slots), a dropdown panel toggled by a component-local
   locOpenMenuId, DropdownItems rendered in up to 8 fixed slots split
   across DropdownColumns (1 or 2) by each row's own real Column
   value. A transparent screen-sized dismiss control sits first in the
   tree (lowest z-order), matching this component's own architecture
   note about a screen-level dismiss closing an open panel on any
   outside tap. */
function megaMenu(pascal) {
  const self = `cmp${pascal}`;
  const maxTop = 6;
  const maxDropdown = 8;

  const topSlot = i => ({
    name: `cntTop${i}`,
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "36", Visible: `${i} <= CountRows(${self}.MenuItems)`, Width: "110", X: (i - 1) * 110 },
    children: [
      { name: "lblTopLabel", control: "ModernText@1.0.0", properties: { Color: `If(${i} > CountRows(${self}.MenuItems), RGBA(23, 32, 27, 1), If(locOpenMenuId = Index(${self}.MenuItems, ${i}).ID, ${self}.ActiveColor, RGBA(23, 32, 27, 1)))`, FontWeight: "FontWeight.Bold", Height: "36", Size: "10", Text: `If(${i} <= CountRows(${self}.MenuItems), Index(${self}.MenuItems, ${i}).Label, "")`, Width: "110", X: "0", Y: "0" } },
      { name: "btnTopTap", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "36", OnSelect: `If(Index(${self}.MenuItems, ${i}).HasDropdown, UpdateContext({locOpenMenuId: If(locOpenMenuId = Index(${self}.MenuItems, ${i}).ID, Blank(), Index(${self}.MenuItems, ${i}).ID)}), ${self}.OnItemSelect({Label: Index(${self}.MenuItems, ${i}).Label, Link: Index(${self}.MenuItems, ${i}).Link}))`, Text: '""', Width: "110" } }
    ]
  });

  const dropdownSlot = i => ({
    name: `lblDropdown${i}`,
    control: "ModernText@1.0.0",
    properties: {
      Color: "RGBA(71, 85, 105, 1)",
      Height: "22",
      Size: "9",
      Text: `If(CountRows(Filter(${self}.DropdownItems, MenuID = locOpenMenuId)) >= ${i}, Index(Filter(${self}.DropdownItems, MenuID = locOpenMenuId), ${i}).Label, "")`,
      Visible: `CountRows(Filter(${self}.DropdownItems, MenuID = locOpenMenuId)) >= ${i}`,
      Width: "160",
      X: `If(${self}.DropdownColumns = 2, Mod(${i} - 1, 2) * 170, 0)`,
      Y: `RoundDown((${i} - 1) / If(${self}.DropdownColumns = 2, 2, 1), 0) * 24`
    }
  });

  const dropdownTapSlot = i => ({
    name: `btnDropdownTap${i}`,
    control: "Classic/Button@2.2.0",
    properties: {
      BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "20",
      OnSelect: `${self}.OnItemSelect({Label: Index(Filter(${self}.DropdownItems, MenuID = locOpenMenuId), ${i}).Label, Link: ""})`,
      Text: '""', Visible: `CountRows(Filter(${self}.DropdownItems, MenuID = locOpenMenuId)) >= ${i}`, Width: "160",
      X: `If(${self}.DropdownColumns = 2, Mod(${i} - 1, 2) * 170, 0)`,
      Y: `RoundDown((${i} - 1) / If(${self}.DropdownColumns = 2, 2, 1), 0) * 24`
    }
  });

  const cntDropdownPanel = {
    name: "cntDropdownPanel",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", DropShadow: "DropShadow.Regular", Fill: "Color.White", Height: "120", RadiusBottomLeft: "12", RadiusBottomRight: "12", RadiusTopLeft: "12", RadiusTopRight: "12", Visible: "!IsBlank(locOpenMenuId)", Width: "360", X: "0", Y: "44" },
    children: [
      ...Array.from({ length: maxDropdown }, (_, i) => dropdownSlot(i + 1)),
      ...Array.from({ length: maxDropdown }, (_, i) => dropdownTapSlot(i + 1))
    ]
  };

  const cntDismiss = { name: "cntDismiss", control: "GroupContainer@1.5.0", variant: "ManualLayout", properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", Visible: "!IsBlank(locOpenMenuId)", Width: "Parent.Width" },
    children: [{ name: "btnDismiss", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", OnSelect: "UpdateContext({locOpenMenuId: Blank()})", Text: '""', Width: "Parent.Width" } }]
  };

  const cntBar = {
    name: "cntBar",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "Color.White", Height: "44", Width: "Parent.Width", X: `Switch(${self}.NavAlign, "Left", 0, "Right", Parent.Width - ${maxTop * 110}, (Parent.Width - ${maxTop * 110}) / 2)` },
    children: [
      ...Array.from({ length: maxTop }, (_, i) => topSlot(i + 1)),
      cntDropdownPanel
    ]
  };

  return {
    properties: { Fill: "Color.Transparent", Height: "164", Width: "660" },
    children: [cntDismiss, cntBar],
    eventParameters: {
      OnItemSelect: [{ name: "Item", dataType: "Record", defaultFormula: '{Label:"Products",Link:""}' }]
    }
  };
}

/* Approval Journey — real per-position "which stage is active" logic
   via the same Sequence(n)-bound-Gallery-plus-Index(Stages, N)
   technique Risk Matrix's own grid uses, since Stages has no built-in
   position column of its own. Sequential locks every Pending stage
   except the *first* one (Min over the Pending positions); Everyone/
   First-to-respond treat every Pending stage as active at once,
   matching this component's own architecture note that the layout
   itself communicates which real approval type is running. */
function approvalJourney(pascal) {
  const self = `cmp${pascal}`;
  const idx = "ThisItem.Value";
  const row = `Index(${self}.Stages, ${idx})`;
  const firstPendingIdx = `Min(Filter(Sequence(CountRows(${self}.Stages)), Index(${self}.Stages, Value).Status = "Pending"), Value)`;
  const isActionable = `And(${row}.Status = "Pending", Or(${self}.ApprovalType <> "Sequential", ${idx} = ${firstPendingIdx}))`;
  const statusColor = `ColorValue(Switch(${row}.Status, "Approved", "#2E7D32", "Rejected", "#C62828", If(${isActionable}, "#1565C0", "#94A3B8")))`;

  const cntStage = {
    name: "cntStage",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderColor: "RGBA(226, 232, 240, 1)", BorderStyle: "BorderStyle.Solid", BorderThickness: "1", Fill: `If(${isActionable}, RGBA(235, 245, 255, 1), Color.White)`, Height: "Parent.Height", Width: "Parent.Width" },
    children: [
      { name: "btnStatusDot", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: statusColor, Height: "10", RadiusBottomLeft: "5", RadiusBottomRight: "5", RadiusTopLeft: "5", RadiusTopRight: "5", Text: '""', Width: "10", X: "10", Y: "10" } },
      { name: "lblApprover", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "16", Size: "10", Text: `${row}.Approver & If(!IsBlank(${row}.DelegatedTo), " -> " & ${row}.DelegatedTo, "")`, Width: "160", X: "26", Y: "6" } },
      { name: "lblStatus", control: "ModernText@1.0.0", properties: { Color: statusColor, FontWeight: "FontWeight.Bold", Height: "14", Size: "9", Text: `${row}.Status`, Width: "80", X: "26", Y: "22" } },
      { name: "btnApprove", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "Color.White", Fill: "RGBA(22, 131, 38, 1)", FontWeight: "FontWeight.Bold", Height: "22", OnSelect: `${self}.OnApprove("Approve")`, RadiusBottomLeft: "11", RadiusBottomRight: "11", RadiusTopLeft: "11", RadiusTopRight: "11", Size: "9", Text: '"Approve"', Visible: isActionable, Width: "60", X: "Parent.Width - 194", Y: "9" } },
      { name: "btnReject", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "Color.White", Fill: "RGBA(197, 58, 58, 1)", FontWeight: "FontWeight.Bold", Height: "22", OnSelect: `${self}.OnReject("Reject")`, RadiusBottomLeft: "11", RadiusBottomRight: "11", RadiusTopLeft: "11", RadiusTopRight: "11", Size: "9", Text: '"Reject"', Visible: isActionable, Width: "52", X: "Parent.Width - 128", Y: "9" } },
      { name: "btnDelegate", control: "Classic/Button@2.2.0", properties: { BorderColor: "RGBA(226, 232, 240, 1)", BorderStyle: "BorderStyle.Solid", BorderThickness: "1", Color: "RGBA(71, 85, 105, 1)", Fill: "Color.White", FontWeight: "FontWeight.Bold", Height: "22", OnSelect: `${self}.OnDelegate(${row}, "")`, RadiusBottomLeft: "11", RadiusBottomRight: "11", RadiusTopLeft: "11", RadiusTopRight: "11", Size: "9", Text: '"Delegate"', Visible: isActionable, Width: "64", X: "Parent.Width - 72", Y: "9" } },
      { name: "btnStageTap", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", OnSelect: `${self}.OnStageSelect(${row})`, Text: '""', Width: "Parent.Width - 200" } }
    ]
  };

  const galStages = { name: "galStages", control: "Gallery@2.15.0", variant: "Vertical", properties: { Height: `CountRows(${self}.Stages) * 40`, Items: `Sequence(CountRows(${self}.Stages))`, TemplateSize: "40", Width: "Parent.Width - 16", WrapCount: "1", X: "8", Y: "40" }, children: [cntStage] };

  const cntRoot = {
    name: "cntRoot",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(248, 250, 252, 1)", Height: "Parent.Height", RadiusBottomLeft: "14", RadiusBottomRight: "14", RadiusTopLeft: "14", RadiusTopRight: "14", Width: "Parent.Width" },
    children: [
      { name: "lblDetails", control: "ModernText@1.0.0", properties: { AutoHeight: "false", Height: "32", Size: "10", Text: `${self}.Details`, Width: "Parent.Width - 16", Wrap: "true", X: "8", Y: "6" } },
      galStages
    ]
  };

  return {
    properties: { Height: `40 + CountRows(${self}.Stages) * 40`, Width: "360" },
    children: [cntRoot],
    eventParameters: {
      OnApprove: [{ name: "Response", dataType: "Text", defaultFormula: '"Approve"' }],
      OnReject: [{ name: "Response", dataType: "Text", defaultFormula: '"Reject"' }],
      OnDelegate: [{ name: "Stage", dataType: "Record", defaultFormula: '{Approver: ""}' }, { name: "RequestedDelegate", dataType: "Text", defaultFormula: '""' }],
      OnStageSelect: [{ name: "Stage", dataType: "Record", defaultFormula: '{Approver:"Jordan Lee",Status:"Approved",RespondedOn:Date(2026,1,10),DueDate:Blank(),DelegatedTo:Blank()}' }]
    }
  };
}

/* Process Stepper — a real horizontal Gallery of step dots reading
   position via the same Sequence(n)-plus-Index technique Approval
   Journey's own Children tree just used. OnResume has no real trigger
   wired: the component has no storage access to actually retrieve a
   value ResumeKey might point to, so there's nothing genuine to fire
   it from — disclosed in componentLibrary.js's own Limitations rather
   than faked with a Timer that fires on every load regardless of
   whether anything was actually saved. */
function processStepper(pascal) {
  const self = `cmp${pascal}`;
  const idx = "ThisItem.Value";
  const row = `Index(${self}.Steps, ${idx})`;
  const dotColor = `ColorValue(Switch(${row}.Status, "Complete", "#2E7D32", "Current", "#168326", "#CBD5E1"))`;
  const isReachable = `Or(${idx} = ${self}.CurrentStep, And(${row}.Status = "Complete", ${self}.AllowStepBack))`;

  const cntStep = {
    name: "cntStep",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", Width: "Parent.Width" },
    children: [
      { name: "btnDot", control: "Classic/Button@2.2.0", properties: { BorderColor: `If(${idx} = ${self}.CurrentStep, ColorValue("#168326"), Color.White)`, BorderStyle: "BorderStyle.Solid", BorderThickness: "2", Color: "Color.White", Fill: dotColor, FontWeight: "FontWeight.Bold", Height: "24", OnSelect: `If(${isReachable}, ${self}.OnStepChange(${idx}))`, RadiusBottomLeft: "12", RadiusBottomRight: "12", RadiusTopLeft: "12", RadiusTopRight: "12", Size: "10", Text: `Text(${idx})`, Width: "24", X: "Parent.Width / 2 - 12", Y: "0" } },
      { name: "lblStepLabel", control: "ModernText@1.0.0", properties: { Align: "Align.Center", FontWeight: `If(${idx} = ${self}.CurrentStep, FontWeight.Bold, FontWeight.Normal)`, Height: "16", Size: "8", Text: `${row}.Label`, Width: "Parent.Width", X: "0", Y: "28" } }
    ]
  };

  const galSteps = { name: "galSteps", control: "Gallery@2.15.0", variant: "Vertical", properties: { Height: "48", Items: `Sequence(CountRows(${self}.Steps))`, TemplateSize: `(Parent.Width - 16) / Max(CountRows(${self}.Steps), 1)`, Width: "Parent.Width - 16", WrapCount: `Max(CountRows(${self}.Steps), 1)`, X: "8", Y: "8" }, children: [cntStep] };

  const cntRail = { name: "cntRail", control: "GroupContainer@1.5.0", variant: "ManualLayout", properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(226, 232, 240, 1)", Height: "2", Width: "Parent.Width - 60", X: "30", Y: "20" } };

  const cntRoot = {
    name: "cntRoot",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", Width: "Parent.Width" },
    children: [
      cntRail, galSteps,
      { name: "lblCanAdvanceHint", control: "ModernText@1.0.0", properties: { Align: "Align.Center", Color: "RGBA(191, 54, 12, 1)", Height: "16", Size: "9", Text: '"Complete the required fields to continue"', Visible: `!${self}.CanAdvance`, Width: "Parent.Width", X: "0", Y: "60" } }
    ]
  };

  return {
    properties: { Fill: "Color.Transparent", Height: "78", Width: "440" },
    children: [cntRoot],
    eventParameters: {
      OnStepChange: [{ name: "StepIndex", dataType: "Number", defaultFormula: "1" }]
    }
  };
}

/* Route Map — nodes ordered along one rail (per Nodes' own real Order
   field), reusing Milestone Tracker's rail-and-dot layout technique.
   A real branch (a node with more than one outgoing Connection) shows
   as a small "splits into N" indicator rather than literal diverging
   diagonal lines — no CONFIRMED/STRONG-EVIDENCE control-level rotation
   property was researched for drawing an angled connector between two
   arbitrary node positions, so this is a disclosed, real, working
   simplification instead of a guessed rotation formula. Lane renders
   as a small band label under each node rather than full swimlane
   grouping. */
function routeMap(pascal) {
  const self = `cmp${pascal}`;
  const isVertical = `${self}.Orientation = "vertical"`;
  const sorted = `SortByColumns(${self}.Nodes, "Order", SortOrder.Ascending)`;
  const idx = "ThisItem.Value";
  const row = `Index(${sorted}, ${idx})`;
  const outCount = `CountRows(Filter(${self}.Connections, From = ${row}.Order))`;
  const statusColor = `ColorValue(Switch(${row}.Status, "Complete", "#2E7D32", "Active", "#168326", "Blocked", "#C62828", "#94A3B8"))`;

  const cntNode = {
    name: "cntNode",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", Width: "Parent.Width" },
    children: [
      { name: "btnNodeDot", control: "Classic/Button@2.2.0", properties: { BorderColor: "Color.White", BorderStyle: "BorderStyle.Solid", BorderThickness: "2", Fill: statusColor, Height: "18", OnSelect: `${self}.OnNodeSelect(${row})`, RadiusBottomLeft: "9", RadiusBottomRight: "9", RadiusTopLeft: "9", RadiusTopRight: "9", Text: '""', Width: "18", X: `If(${isVertical}, 0, Parent.Width / 2 - 9)`, Y: `If(${isVertical}, Parent.Height / 2 - 9, 0)` } },
      { name: "lblNodeLabel", control: "ModernText@1.0.0", properties: { Align: `If(${isVertical}, Align.Left, Align.Center)`, FontWeight: "FontWeight.Bold", Height: "16", Size: "9", Text: `${row}.Label`, Width: `If(${isVertical}, Parent.Width - 26, Parent.Width)`, X: `If(${isVertical}, 26, 0)`, Y: `If(${isVertical}, Parent.Height / 2 - 8, 22)` } },
      { name: "lblBranchHint", control: "ModernText@1.0.0", properties: { Align: `If(${isVertical}, Align.Left, Align.Center)`, Color: "RGBA(100, 116, 139, 1)", Height: "12", Size: "7", Text: `"splits into " & ${outCount}`, Visible: `${outCount} > 1`, Width: `If(${isVertical}, Parent.Width - 26, Parent.Width)`, X: `If(${isVertical}, 26, 0)`, Y: `If(${isVertical}, Parent.Height / 2 + 8, 36)` } },
      { name: "lblLane", control: "Label@2.5.1", properties: { Align: `If(${isVertical}, Align.Left, Align.Center)`, Color: "RGBA(148, 163, 184, 1)", Height: "10", Size: "6", Text: `${row}.Lane`, Visible: `!IsBlank(${row}.Lane)`, Width: `If(${isVertical}, 100, 90)`, X: `If(${isVertical}, 26, 0)`, Y: `If(${isVertical}, Parent.Height / 2 + 20, 48)` } }
    ]
  };

  const cntRail = { name: "cntRail", control: "GroupContainer@1.5.0", variant: "ManualLayout", properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(226, 232, 240, 1)", Height: `If(${isVertical}, Parent.Height - 20, 2)`, Width: `If(${isVertical}, 2, Parent.Width - 40)`, X: `If(${isVertical}, 9, 20)`, Y: `If(${isVertical}, 10, Parent.Height / 2 - 1)` } };

  const galNodes = { name: "galNodes", control: "Gallery@2.15.0", variant: "Vertical", properties: { Height: `If(${isVertical}, Parent.Height, 60)`, Items: `Sequence(CountRows(${self}.Nodes))`, TemplateSize: `If(${isVertical}, 60, (Parent.Width - 40) / Max(CountRows(${self}.Nodes), 1))`, Width: `If(${isVertical}, Parent.Width, Parent.Width - 40)`, WrapCount: `If(${isVertical}, 1, Max(CountRows(${self}.Nodes), 1))`, X: `If(${isVertical}, 0, 20)`, Y: "0" }, children: [cntNode] };

  return {
    properties: { Fill: "Color.Transparent", Height: `If(${isVertical}, 320, 60)`, Width: `If(${isVertical}, 200, 480)` },
    children: [cntRail, galNodes],
    eventParameters: {
      OnNodeSelect: [{ name: "Node", dataType: "Record", defaultFormula: '{Label:"Intake",Status:"Complete",Order:1,Lane:Blank()}' }]
    }
  };
}

/* Loading Screen — HasError is a distinct sibling container from the
   normal/spinner state (the same IsLoading/HasLoadError-are-distinct
   pattern Activity Timeline's own Children tree already uses), Style
   switches between a real Progress-driven bar and an indeterminate
   Timer-driven pulsing dot cluster for Spinner, plus a Skeleton state
   of plain placeholder bars. LogoUrl set renders the Branded-splash
   look on top of whichever Style is active, matching this component's
   own note that Branded splash isn't a separate Style value. */
function loadingScreen(pascal) {
  const self = `cmp${pascal}`;
  const isSpinner = `${self}.Style = "Spinner"`;
  const isSkeleton = `${self}.Style = "Skeleton"`;

  const cntNormal = {
    name: "cntNormal",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "Color.White", Height: "Parent.Height", Visible: `!${self}.HasError`, Width: "Parent.Width" },
    children: [
      { name: "imgLogo", control: "Image@2.2.3", properties: { Height: "48", Image: `${self}.LogoUrl`, Visible: `${self}.LogoUrl <> ""`, Width: "48", X: "Parent.Width / 2 - 24", Y: "40" } },
      { name: "lblTitle", control: "ModernText@1.0.0", properties: { Align: "Align.Center", FontWeight: "FontWeight.Bold", Height: "24", Size: "14", Text: `${self}.Title`, Width: "Parent.Width", X: "0", Y: `If(${self}.LogoUrl <> "", 100, 60)` } },
      {
        name: "cntProgressTrack", control: "GroupContainer@1.5.0", variant: "ManualLayout",
        properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(226, 232, 240, 1)", Height: "6", RadiusBottomLeft: "3", RadiusBottomRight: "3", RadiusTopLeft: "3", RadiusTopRight: "3", Visible: `!${isSpinner}`, Width: "Parent.Width - 80", X: "40", Y: `If(${self}.LogoUrl <> "", 132, 92)` },
        children: [{ name: "cntProgressFill", control: "GroupContainer@1.5.0", variant: "ManualLayout", properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(22, 131, 38, 1)", Height: "6", RadiusBottomLeft: "3", RadiusBottomRight: "3", RadiusTopLeft: "3", RadiusTopRight: "3", Width: `Min(1, ${self}.Progress / 100) * Parent.Width` } }]
      },
      { name: "tmrPulse", control: "Timer@2.1.0", properties: { AutoPause: "false", AutoStart: isSpinner, Duration: "900", Height: "1", Repeat: "true", Start: isSpinner, Visible: "false", Width: "1" } },
      { name: "btnPulseDot", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(22, 131, 38, 0.3 + 0.7 * Abs(1 - 2 * (tmrPulse.Value / tmrPulse.Duration)))", Height: "10", RadiusBottomLeft: "5", RadiusBottomRight: "5", RadiusTopLeft: "5", RadiusTopRight: "5", Text: '""', Visible: isSpinner, Width: "10", X: "Parent.Width / 2 - 5", Y: `If(${self}.LogoUrl <> "", 132, 92)` } },
      { name: "lblProgressPct", control: "ModernText@1.0.0", properties: { Align: "Align.Center", Color: "RGBA(100, 116, 139, 1)", Height: "16", Size: "10", Text: `Text(${self}.Progress) & "%" & If(${self}.EstimatedSecondsRemaining > 0, " - About " & ${self}.EstimatedSecondsRemaining & "s left", "")`, Visible: `!${isSpinner}`, Width: "Parent.Width", X: "0", Y: `If(${self}.LogoUrl <> "", 148, 108)` } },
      { name: "btnCancel", control: "Classic/Button@2.2.0", properties: { BorderColor: "RGBA(226, 232, 240, 1)", BorderStyle: "BorderStyle.Solid", BorderThickness: "1", Color: "RGBA(71, 85, 105, 1)", Fill: "Color.White", FontWeight: "FontWeight.Bold", Height: "30", OnSelect: `${self}.OnCancel()`, RadiusBottomLeft: "15", RadiusBottomRight: "15", RadiusTopLeft: "15", RadiusTopRight: "15", Size: "10", Text: '"Cancel"', Visible: `${self}.CanCancel`, Width: "80", X: "Parent.Width / 2 - 40", Y: "180" } }
    ]
  };

  const skeletonBar = (w, y) => ({ name: `btnSkeleton${y}`, control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "RGBA(226, 232, 240, 1)", Height: "14", RadiusBottomLeft: "4", RadiusBottomRight: "4", RadiusTopLeft: "4", RadiusTopRight: "4", Text: '""', Visible: isSkeleton, Width: w, X: "40", Y: y } });

  const cntError = {
    name: "cntError",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "Color.White", Height: "Parent.Height", Visible: `${self}.HasError`, Width: "Parent.Width" },
    children: [
      { name: "lblErrorMessage", control: "ModernText@1.0.0", properties: { Align: "Align.Center", Color: "RGBA(198, 40, 40, 1)", FontWeight: "FontWeight.Bold", Height: "24", Size: "12", Text: `Coalesce(If(${self}.ErrorMessage = "", Blank(), ${self}.ErrorMessage), "Something went wrong")`, Width: "Parent.Width - 40", X: "20", Y: "90" } },
      { name: "btnRetry", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "Color.White", Fill: "RGBA(22, 131, 38, 1)", FontWeight: "FontWeight.Bold", Height: "32", OnSelect: `${self}.OnRetry()`, RadiusBottomLeft: "16", RadiusBottomRight: "16", RadiusTopLeft: "16", RadiusTopRight: "16", Size: "10", Text: '"Retry"', Width: "88", X: "Parent.Width / 2 - 44", Y: "130" } }
    ]
  };

  return {
    properties: { Fill: "Color.White", Height: "240", Width: "320" },
    children: [cntNormal, skeletonBar(200, 100), skeletonBar(240, 124), skeletonBar(160, 148), cntError]
  };
}

/* Range Slider — no verified real modern Slider control to wire true
   drag-the-handle interaction up to (no CONFIRMED/STRONG-EVIDENCE
   control researched for this pass), so position sets via tap across
   a real fixed set of 10 discrete track segments instead of a
   continuous drag gesture, disclosed in componentLibrary.js's own
   Limitations. Zones' own Color column is a native Color value in
   this catalog's sample data, used directly. OnThresholdCross reuses
   the same "only fire when the computed thing actually changed from
   the last render" idea Deadline Tracker's own OnApproachingDue and
   Program Scorecard's own tick logic already establish, compared here
   between adjacent tap segments rather than a stored previous value
   this file has no real place to keep between renders. */
function rangeSlider(pascal) {
  const self = `cmp${pascal}`;
  const isVertical = `${self}.LayoutDirection = "Vertical"`;
  const trackLen = `Switch(${self}.Size, "Small", 160, "Large", 280, 220)`;
  const segments = 10;

  const zoneColorAt = valExpr => `Coalesce(LookUp(SortByColumns(${self}.Zones, "UpTo", SortOrder.Ascending), UpTo >= ${valExpr}).Color, Last(${self}.Zones).Color)`;
  const zoneLabelAt = valExpr => `Coalesce(LookUp(SortByColumns(${self}.Zones, "UpTo", SortOrder.Ascending), UpTo >= ${valExpr}).Label, Last(${self}.Zones).Label)`;

  {
    const fillFrac = `Min(1, (${self}.Default - ${self}.Min) / Max(${self}.Max - ${self}.Min, 1))`;
    const segTemplateSize = `Round(${trackLen} / ${segments}, 0)`;

    const galSegments = {
      name: "galSegments",
      control: "Gallery@2.15.0",
      variant: "Vertical",
      properties: {
        Height: isVertical ? trackLen : "6",
        Items: `Sequence(${segments})`,
        TemplateSize: segTemplateSize,
        Width: isVertical ? "6" : trackLen,
        WrapCount: isVertical ? "1" : String(segments),
        X: "0", Y: "0"
      },
      children: [
        {
          name: "btnSegment",
          control: "Classic/Button@2.2.0",
          properties: {
            BorderStyle: "BorderStyle.None",
            Fill: zoneColorAt(`${self}.Min + (ThisItem.Value / ${segments}) * (${self}.Max - ${self}.Min)`),
            Height: isVertical ? segTemplateSize : "6",
            OnSelect: `${self}.OnChange(Round(${self}.Min + (ThisItem.Value / ${segments}) * (${self}.Max - ${self}.Min), 0)); If(${zoneLabelAt(`${self}.Min + (ThisItem.Value / ${segments}) * (${self}.Max - ${self}.Min)`)} <> ${zoneLabelAt(`${self}.Default`)}, ${self}.OnThresholdCross(${zoneLabelAt(`${self}.Min + (ThisItem.Value / ${segments}) * (${self}.Max - ${self}.Min)`)}))`,
            Width: isVertical ? "6" : segTemplateSize
          }
        }
      ]
    };

    const cntHandle = { name: "cntHandle", control: "GroupContainer@1.5.0", variant: "ManualLayout", properties: {
      BorderColor: "Color.White", BorderStyle: "BorderStyle.Solid", BorderThickness: "2",
      Fill: zoneColorAt(`${self}.Default`),
      Height: "16", RadiusBottomLeft: "8", RadiusBottomRight: "8", RadiusTopLeft: "8", RadiusTopRight: "8",
      Width: "16",
      X: isVertical ? "-5" : `${fillFrac} * ${trackLen} - 8`,
      Y: isVertical ? `${fillFrac} * ${trackLen} - 8` : "-5"
    } };

    const cntRoot = {
      name: "cntRoot",
      control: "GroupContainer@1.5.0",
      variant: "ManualLayout",
      properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", Width: "Parent.Width" },
      children: [
        { name: "lblLabel", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "18", Size: "11", Text: `${self}.Label`, Width: "Parent.Width - 60", X: "0", Y: "0" } },
        { name: "lblValueReadout", control: "ModernText@1.0.0", properties: { Color: zoneColorAt(`${self}.Default`), FontWeight: "FontWeight.Bold", Height: "18", Size: "11", Text: `Text(${self}.Default)`, Visible: `${self}.ShowValue`, Width: "60", X: "Parent.Width - 60", Y: "0" } },
        { name: "cntTrackArea", control: "GroupContainer@1.5.0", variant: "ManualLayout", properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: isVertical ? trackLen : "16", Width: isVertical ? "16" : trackLen, X: "4", Y: "24" },
          children: [galSegments, cntHandle]
        },
        { name: "lblZoneName", control: "ModernText@1.0.0", properties: { Color: zoneColorAt(`${self}.Default`), Height: "16", Size: "9", Text: zoneLabelAt(`${self}.Default`), Width: "Parent.Width", X: "0", Y: isVertical ? `24 + ${trackLen} + 8` : "48" } }
      ]
    };

    return {
      properties: { Fill: "Color.Transparent", Height: isVertical ? `56 + ${trackLen}` : "80", Width: isVertical ? "160" : `${trackLen} + 24` },
      children: [cntRoot],
      eventParameters: {
        OnChange: [{ name: "Value", dataType: "Number", defaultFormula: "0" }],
        OnThresholdCross: [{ name: "ZoneLabel", dataType: "Text", defaultFormula: '""' }]
      }
    };
  }
}

/* Detail Panel — modeled directly on the real Microsoft Creator Kit
   Panel control per this component's own architecture note. Visible
   is host-managed (never internal), matching that real reference's
   own documented pattern. ContentX/Y/Width/Height render as a real,
   visibly-bordered placeholder region at those exact coordinates
   rather than pretending to host arbitrary content — a host's own
   unbound container is what actually renders there, exactly as this
   component's own Limitations already state. OnButtonSelect carries
   its payload as real event parameters instead of a read-only
   SelectedButton record — see the skill file's eventParameters note,
   the same fix already applied to Accordion List and Range Slider. */
function detailPanel(pascal) {
  const self = `cmp${pascal}`;
  const isLeft = `${self}.Position = "Left"`;

  const buttonSlot = n => ({
    name: `btnAction${n}`,
    control: "Classic/Button@2.2.0",
    properties: {
      BorderColor: `If(Index(${self}.Buttons, ${n}).ButtonType = "Primary", Color.Transparent, RGBA(226, 232, 240, 1))`,
      BorderStyle: "BorderStyle.Solid", BorderThickness: "1",
      Color: `If(Index(${self}.Buttons, ${n}).ButtonType = "Primary", Color.White, RGBA(71, 85, 105, 1))`,
      Fill: `If(Index(${self}.Buttons, ${n}).ButtonType = "Primary", RGBA(22, 131, 38, 1), Color.White)`,
      FontWeight: "FontWeight.Bold",
      Height: "34",
      OnSelect: `${self}.OnButtonSelect(Index(${self}.Buttons, ${n}).Label, Index(${self}.Buttons, ${n}).ButtonType)`,
      RadiusBottomLeft: "17", RadiusBottomRight: "17", RadiusTopLeft: "17", RadiusTopRight: "17",
      Size: "11",
      Text: `Index(${self}.Buttons, ${n}).Label`,
      Visible: `CountRows(${self}.Buttons) >= ${n}`,
      Width: "84",
      X: `Parent.Width - ${n} * 92`
    }
  });

  const cntBackdrop = { name: "cntBackdrop", control: "GroupContainer@1.5.0", variant: "ManualLayout", properties: { BorderStyle: "BorderStyle.None", Fill: `${self}.OverlayColor`, Height: "Parent.Height", Visible: `${self}.Visible`, Width: "Parent.Width" },
    children: [{ name: "btnLightDismiss", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", OnSelect: `If(${self}.IsLightDismiss, ${self}.OnCloseSelect())`, Text: '""', Width: "Parent.Width" } }]
  };

  const cntPanel = {
    name: "cntPanel",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", DropShadow: "DropShadow.Regular", Fill: "Color.White", Height: "Parent.Height", Visible: `${self}.Visible`, Width: `${self}.DialogWidth`, X: isLeft ? "0" : `Parent.Width - ${self}.DialogWidth` },
    children: [
      { name: "lblTitle", control: "ModernText@1.0.0", properties: { FontWeight: "FontWeight.Bold", Height: "24", Size: "16", Text: `${self}.Title`, Width: "Parent.Width - 64", X: "20", Y: "18" } },
      { name: "lblSubtitle", control: "ModernText@1.0.0", properties: { Color: "RGBA(100, 116, 139, 1)", Height: "16", Size: "10", Text: `${self}.Subtitle`, Visible: `${self}.Subtitle <> ""`, Width: "Parent.Width - 64", X: "20", Y: "42" } },
      { name: "btnClose", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "RGBA(100, 116, 139, 1)", Fill: "Color.Transparent", FontWeight: "FontWeight.Bold", Height: "32", OnSelect: `${self}.OnCloseSelect()`, Size: "14", Text: '"x"', Width: "32", X: "Parent.Width - 44", Y: "12" } },
      { name: "cntContentArea", control: "GroupContainer@1.5.0", variant: "ManualLayout", properties: { BorderColor: "RGBA(226, 232, 240, 1)", BorderStyle: "BorderStyle.Dashed", BorderThickness: "1", Fill: "Color.Transparent", Height: `${self}.ContentHeight`, Width: `${self}.ContentWidth`, X: `${self}.ContentX`, Y: `${self}.ContentY` } },
      buttonSlot(1), buttonSlot(2), buttonSlot(3)
    ]
  };

  return {
    properties: { Fill: "Color.Transparent", Height: "560", Width: "800" },
    children: [cntBackdrop, cntPanel],
    eventParameters: {
      OnButtonSelect: [{ name: "Label", dataType: "Text", defaultFormula: '""' }, { name: "ButtonType", dataType: "Text", defaultFormula: '"Standard"' }]
    }
  };
}

/* Toast — a real Timer drives AutoDismiss/Timeout, firing OnDismiss
   with "auto" the same Timer.Value/Duration pattern this file uses
   throughout (Notification Badge's pulse, Responsive Line Chart's
   fade-in). DismissReason carries as a real OnDismiss event parameter
   instead of a read-only property — see the skill file's
   eventParameters note. */
function toast(pascal) {
  const self = `cmp${pascal}`;
  const isTop = `${self}.Position = "Top"`;
  const toneColor = `ColorValue(Switch(${self}.NotificationType, "Error", "#C62828", "Success", "#2E7D32", "Warning", "#BF360C", "#1565C0"))`;

  const tmrAuto = { name: "tmrAutoDismiss", control: "Timer@2.1.0", properties: { AutoPause: "false", AutoStart: `${self}.AutoDismiss`, Duration: `${self}.Timeout`, Height: "1", OnTimerEnd: `${self}.OnDismiss("auto")`, Repeat: "false", Start: `${self}.AutoDismiss`, Visible: "false", Width: "1" } };

  const cntRoot = {
    name: "cntRoot",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", DropShadow: "DropShadow.Regular", Fill: "Color.White", Height: "Parent.Height", RadiusBottomLeft: "12", RadiusBottomRight: "12", RadiusTopLeft: "12", RadiusTopRight: "12", Width: "Parent.Width" },
    children: [
      { name: "cntToneBar", control: "GroupContainer@1.5.0", variant: "ManualLayout", properties: { BorderStyle: "BorderStyle.None", Fill: toneColor, Height: "Parent.Height", RadiusBottomLeft: "12", RadiusBottomRight: "0", RadiusTopLeft: "12", RadiusTopRight: "0", Width: "4" } },
      { name: "lblMessage", control: "ModernText@1.0.0", properties: { AutoHeight: "false", FontWeight: "FontWeight.Bold", Height: "Parent.Height", Size: "10", Text: `${self}.Message`, Width: "Parent.Width - 96", Wrap: "true", X: "16", Y: "0" } },
      { name: "btnAction", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: toneColor, Fill: "Color.Transparent", FontWeight: "FontWeight.Bold", Height: "Parent.Height", OnSelect: `${self}.OnAction(); ${self}.OnDismiss("action")`, Size: "10", Text: `${self}.ActionLabel`, Visible: `${self}.ActionLabel <> ""`, Width: "48", X: "Parent.Width - 76" } },
      { name: "btnManualDismiss", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Color: "RGBA(100, 116, 139, 1)", Fill: "Color.Transparent", FontWeight: "FontWeight.Bold", Height: "Parent.Height", OnSelect: `${self}.OnDismiss("manual")`, Size: "12", Text: '"x"', Width: "28", X: "Parent.Width - 28" } },
      tmrAuto
    ]
  };

  return {
    properties: { Fill: "Color.Transparent", Height: "48", Width: "320", Y: isTop ? "0" : "Parent.Height - 48" },
    children: [cntRoot],
    eventParameters: {
      OnDismiss: [{ name: "Reason", dataType: "Text", defaultFormula: '"auto"' }]
    }
  };
}

/* Heatmap — adapted from a real, complete reference cmpHeatmap.pa.yaml
   the user supplied, built with the same generated-SVG-Image technique
   this file already uses for Responsive Line Chart's sparkline and
   Calendar's day chips (one Image@2.2.3, one data:image/svg+xml;utf8,
   URI, EncodeUrl around the whole thing) — not a GroupContainer grid,
   since real typography/gradients only come from real SVG, and the
   reference proves this exact technique is what a genuinely polished
   heatmap looks like.

   Two real bugs in the reference were fixed rather than copied:
   1. `Index(Split(...), n).Value` — Split's own output column is
      CONFIRMED `.Result`, not `.Value` (Microsoft's own Split reference
      page's worked chained-Split example uses `.Result`; this file's
      own Sidebar already relies on the same confirmed column name for
      exactly this reason). `.Value` would have been a real "not a valid
      property" error on a Studio paste.
   2. `BaseColor` was declared as a real customizable property but never
      actually read anywhere in the reference's own Image formula — every
      cell instead came from a fixed six-hex-step indigo Switch(), so
      changing BaseColor would visibly do nothing. That's the same
      "documented but doesn't do what it says" bug class as Accordion
      List's original read-only-property mistake (see the skill file's
      eventParameters note) — just for a Text property instead of an
      Output property. Fixed by ramping BaseColor's own fill-opacity by
      each cell's real intensity (0.15..1) instead of a fixed palette
      that ignores it — real SVG, no Power Fx color-math needed.
   Also made the SVG's own height genuinely dynamic
   (CountRows(TimeLabels) instead of a hardcoded 5 matching only the
   reference's own sample data), and added a real transparent-Button
   grid over the generated cells (the same click-catcher-over-visual
   pattern this file uses throughout — KPI Card's own btnCardOverlay,
   for one) for a real OnCellSelect the reference had no interaction
   for at all. Days are fixed at 7 (Mon..Sun, matching DayLabels' own
   comma-count) — disclosed, the same fixed-slot-count convention this
   file already uses (Calendar's 3 chip slots, Approval Journey's stage
   slots) rather than a fully dynamic day axis. */
function heatmap(pascal) {
  const self = `cmp${pascal}`;
  const isDark = `${self}.Theme = "Dark"`;
  const cellSize = 56, cellGap = 8, padding = 32, labelWidth = 64, dayCount = 7;
  const step = cellSize + cellGap;
  const startX = padding + labelWidth;
  const svgW = padding * 2 + labelWidth + step * dayCount;
  const titleH = `If(${self}.ShowTitle, 56, 16)`;
  const startY = `(${padding} + ${titleH})`;
  const svgH = `(${padding} + ${titleH} + CountRows(${self}.TimeLabels) * ${step} + 56)`;

  const svg = `With(
    {
      vData: ${self}.ChartData,
      vTimeLabels: ${self}.TimeLabels,
      vDayLabels: Split(${self}.DayLabels, ","),
      vMax: Max(${self}.ChartData, Value),
      vBg: If(${isDark}, "#111827", "#FFFFFF"),
      vTitleColor: If(${isDark}, "#F9FAFB", "#1A202C"),
      vLabelColor: If(${isDark}, "#9CA3AF", "#64748B")
    },
    With(
      {vTimeCount: CountRows(vTimeLabels)},
      "data:image/svg+xml;utf8," & EncodeUrl(
        "<svg width='100%' height='100%' viewBox='0 0 ${svgW} " & ${svgH} & "' xmlns='http://www.w3.org/2000/svg'>" &
        "<rect width='${svgW}' height='" & ${svgH} & "' fill='" & vBg & "'/>" &
        If(
          ${self}.ShowTitle,
          "<text x='${startX}' y='28' font-family='Segoe UI, system-ui' font-size='16' font-weight='600' fill='" & vTitleColor & "'>" & ${self}.ChartTitle & "</text>",
          ""
        ) &
        Concat(
          ForAll(Sequence(vTimeCount), {RowIndex: Value, TimeLabel: Index(vTimeLabels, Value)}),
          With(
            {vY: ${startY} + (RowIndex - 1) * ${step} + ${cellSize / 2}},
            "<text x='${startX - 12}' y='" & (vY + 4) & "' text-anchor='end' font-family='Segoe UI, system-ui' font-size='11' fill='" & vLabelColor & "'>" & TimeLabel.Label & "</text>"
          )
        ) &
        Concat(
          ForAll(Sequence(${dayCount}), {ColIndex: Value, DayLabel: Index(vDayLabels, Value).Result}),
          With(
            {vX: ${startX} + (ColIndex - 1) * ${step} + ${cellSize / 2}},
            "<text x='" & vX & "' y='" & (${startY} - 10) & "' text-anchor='middle' font-family='Segoe UI, system-ui' font-size='11' font-weight='600' fill='" & vLabelColor & "'>" & DayLabel & "</text>"
          )
        ) &
        Concat(
          ForAll(Sequence(vTimeCount), {RowIndex: Value, TimeLabel: Index(vTimeLabels, Value)}),
          Concat(
            ForAll(Sequence(${dayCount}), {ColIndex: Value}),
            With(
              {vX: ${startX} + (ColIndex - 1) * ${step}, vY: ${startY} + (RowIndex - 1) * ${step}, vDow: ColIndex - 1, vHour: TimeLabel.Hour},
              With(
                {vValue: Coalesce(LookUp(vData, And(DayOfWeek = vDow, Hour = vHour)).Value, 0)},
                With(
                  {vOpacity: If(vValue <= 0, 1, 0.15 + (vValue / vMax) * 0.85)},
                  "<rect x='" & vX & "' y='" & vY & "' width='${cellSize}' height='${cellSize}' rx='8' fill='" & If(vValue <= 0, ${self}.EmptyColor, ${self}.BaseColor) & "' fill-opacity='" & vOpacity & "'/>"
                )
              )
            )
          )
        ) &
        "<text x='${startX}' y='" & (${svgH} - 14) & "' font-family='Segoe UI, system-ui' font-size='10' fill='" & vLabelColor & "'>Less</text>" &
        Concat(
          ForAll(Sequence(5), {SwatchIndex: Value}),
          "<rect x='" & (${startX} + 34 + (SwatchIndex - 1) * 18) & "' y='" & (${svgH} - 24) & "' width='14' height='14' rx='3' fill='" & ${self}.BaseColor & "' fill-opacity='" & (0.15 + (SwatchIndex - 1) / 4 * 0.85) & "'/>"
        ) &
        "<text x='" & (${startX} + 34 + 5 * 18 + 6) & "' y='" & (${svgH} - 14) & "' font-family='Segoe UI, system-ui' font-size='10' fill='" & vLabelColor & "'>More</text>" &
        "</svg>"
      )
    )
  )`.replace(/\s*\n\s*/g, " ");

  const imgHeatmap = { name: "imgHeatmap", control: "Image@2.2.3", properties: { Height: "Parent.Height", Image: svg, Width: "Parent.Width" } };

  const cellTapRow = `RoundUp(ThisItem.Value / ${dayCount}, 0)`;
  const cellTapCol = `(Mod(ThisItem.Value - 1, ${dayCount}) + 1)`;
  const cellTapHour = `Index(${self}.TimeLabels, ${cellTapRow}).Hour`;
  const cellTapDow = `(${cellTapCol} - 1)`;
  const cellTapValue = `Coalesce(LookUp(${self}.ChartData, And(DayOfWeek = ${cellTapDow}, Hour = ${cellTapHour})).Value, 0)`;

  const cntCellTap = {
    name: "cntCellTap",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: String(cellSize), Width: String(cellSize) },
    children: [
      { name: "btnCellTap", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: "Parent.Height", OnSelect: `${self}.OnCellSelect(${cellTapDow}, ${cellTapHour}, ${cellTapValue})`, Text: '""', Width: "Parent.Width" } }
    ]
  };

  const galCells = {
    name: "galCells",
    control: "Gallery@2.15.0",
    variant: "Vertical",
    properties: { Height: `CountRows(${self}.TimeLabels) * ${step}`, Items: `Sequence(CountRows(${self}.TimeLabels) * ${dayCount})`, TemplateSize: String(step), Width: String(step * dayCount), WrapCount: String(dayCount), X: String(startX), Y: startY },
    children: [cntCellTap]
  };

  const cntRoot = {
    name: "cntRoot",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: { BorderStyle: "BorderStyle.None", Fill: "Color.Transparent", Height: svgH, Width: String(svgW) },
    children: [imgHeatmap, galCells]
  };

  return {
    properties: { Fill: "Color.Transparent", Height: svgH, Width: String(svgW) },
    children: [cntRoot],
    eventParameters: {
      OnCellSelect: [
        { name: "DayOfWeek", dataType: "Number", defaultFormula: "0" },
        { name: "Hour", dataType: "Number", defaultFormula: "9" },
        { name: "Value", dataType: "Number", defaultFormula: "0" }
      ]
    }
  };
}

export const CHILDREN_BUILDERS = {
  "KPI Card": kpiCard,
  "Notification Badge": notificationBadge,
  "Responsive Line Chart": responsiveLineChart,
  "Heatmap": heatmap,
  "Command Card": commandCard,
  "Program Scorecard": programScorecard,
  "Operational Status Banner": operationalStatusBanner,
  "Risk Matrix": riskMatrix,
  "Project Health Summary": projectHealthSummary,
  "Milestone Tracker": milestoneTracker,
  "Decision Log": decisionLog,
  "Deadline Tracker": deadlineTracker,
  "Activity Timeline": activityTimeline,
  "Calendar": calendar,
  "Accordion List": accordionList,
  "Data Table": dataTable,
  "File Upload": fileUpload,
  "Email Composer": emailComposer,
  "Dialog": dialog,
  "Comments & Mentions": commentsAndMentions,
  "Sidebar": sidebar,
  "Responsive Breadcrumbs": responsiveBreadcrumbs,
  "Mega Menu": megaMenu,
  "Approval Journey": approvalJourney,
  "Process Stepper": processStepper,
  "Route Map": routeMap,
  "Loading Screen": loadingScreen,
  "Range Slider": rangeSlider,
  "Detail Panel": detailPanel,
  "Toast": toast
};
