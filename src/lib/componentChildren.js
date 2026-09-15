/* Real, pasteable visual control trees ("Children:") for components in
   the catalog — the actual controls that make a pasted component look
   like something in Studio, not just the CustomProperties contract
   componentDocs.js already generates.

   See .claude/skills/power-app-component-writer/SKILL.md for the full
   research this file is built against: which control types support
   which properties (CONFIRMED via a real Studio paste error, or STRONG
   EVIDENCE from real shipped .pa.yaml files — never "looks plausible"),
   the real data-driven-Gallery/StyleConfig/responsive-breakpoint/
   skeleton-loading/SVG-icon/SVG-sparkline patterns, and the
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

/* KPI Card — a real, enterprise-shaped dashboard row: one Data-table
   property drives an arbitrary number of cards via a Gallery (not N
   hand-authored near-duplicate children), Style is a single Text
   property read by If()/Switch() throughout rather than a separate
   tree per look, StyleConfig centralizes every color/spacing/radius/
   type-size token, ColumnsLayout drives a real responsive WrapCount
   off App.SizeBreakpoints, IsLoading swaps in a skeleton Gallery with
   matching WrapCount/TemplateSize, and the sparkline is a generated
   SVG data: URI Image rather than a second charting implementation.
   Card height is 88px (Compact/Minimal) or 190px (Standard/Filled/
   Chart) throughout — StyleConfig.heights.statsCardCompact/statsCardMax. */
function kpiCard(pascal) {
  const self = `cmp${pascal}`;
  const isDense = `Or(${self}.Style = "Compact", ${self}.Style = "Minimal")`;
  const cardHeight = `If(${isDense}, ${self}.StyleConfig.heights.statsCardCompact, ${self}.StyleConfig.heights.statsCardMax)`;
  const wrapCount = `With({bp: ${self}.ColumnsLayout, w: App.Width}, If(w < bp.MobileBreakpoint, bp.Mobile, w < bp.TabletBreakpoint, bp.Tablet, bp.Desktop))`;
  const cardWidthExpr = "conKPICard.Width";
  const cardHeightExpr = "conKPICard.Height";

  // Real technique (SVG data: URI, built with EncodeUrl — see the
  // skill file's "SVG icon library" pattern): substitutes the
  // Icons table's "COLOR" placeholder for this row's own IconColor.
  const iconImage = `"data:image/svg+xml;utf8," & EncodeUrl(Substitute(LookUp(${self}.Icons, Name = ThisItem.Icon, SVG), "COLOR", ThisItem.IconColor))`;

  // Real technique (see skill file's "sparkline via generated SVG"
  // pattern): SparklineData is a plain comma-separated Text value per
  // row, parsed with MatchAll/ForAll, scaled into an SVG polyline +
  // translucent polygon fill, colored by the same sign PercentChange
  // already conveys.
  const sparklineImage = `With({raw: Coalesce(ThisItem.SparklineData, "")}, If(raw = "", Blank(), With({nums: ForAll(MatchAll(raw, "-?\\d+\\.?\\d*"), {n: Value(FullMatch)}), w: 200, h: If(${self}.Style = "Chart", 96, 36), clr: If(IsBlank(ThisItem.PercentChange) Or ThisItem.PercentChange = 0, "#9E9E9E", ThisItem.PercentChange > 0, "#22C55E", "#EF4444")}, With({lo: Min(nums, n), hi: Max(nums, n), cnt: CountRows(nums)}, With({rng: If(hi = lo, 1, hi - lo)}, "data:image/svg+xml;utf8," & EncodeUrl("<svg viewBox='0 0 " & w & " " & h & "' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><polygon fill='" & clr & "' fill-opacity='0.12' points='0," & h & " " & Concat(Sequence(cnt), Text(Round((Value - 1) / Max(cnt - 1, 1) * w, 1)) & "," & Text(Round(h - (Index(nums, Value).n - lo) / rng * (h - 4) - 2, 1)), " ") & " " & w & "," & h & "'/><polyline fill='none' stroke='" & clr & "' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' points='" & Concat(Sequence(cnt), Text(Round((Value - 1) / Max(cnt - 1, 1) * w, 1)) & "," & Text(Round(h - (Index(nums, Value).n - lo) / rng * (h - 4) - 2, 1)), " ") & "'/></svg>"))))))`;

  const abbreviatedValue = `With({lbl: Lower(Text(ThisItem.Label)), v: ThisItem.Value, thresh: ${self}.StyleConfig.abbreviateThreshold}, If(thresh > 0 And Abs(v) >= 1000000, Text(v / 1000000, "#,##0.0") & "M", thresh > 0 And Abs(v) >= thresh, Text(v / 1000, "#,##0.0") & "K", "value" in lbl Or "price" in lbl Or "cost" in lbl, Text(v, "[$-en-US]$#,##0.00"), Text(v)))`;
  const trendColor = `Switch(true, IsBlank(ThisItem.PercentChange), Color.Transparent, ThisItem.PercentChange > 0, ${self}.StyleConfig.colors.positive, ThisItem.PercentChange < 0, ${self}.StyleConfig.colors.negative, ${self}.StyleConfig.colors.neutral)`;
  const trendText = `If(ThisItem.PercentChange = 0, "0%", If(ThisItem.PercentChange > 0, "▲ +" & ThisItem.PercentChange & "%", "▼ " & ThisItem.PercentChange & "%"))`;

  const conKPICard = {
    name: "conKPICard",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: {
      BorderColor: `${self}.StyleConfig.colors.border`,
      BorderThickness: `If(${self}.Style = "Filled", 0, 1)`,
      DropShadow: "DropShadow.Light",
      Fill: `If(${self}.Style = "Filled", ColorValue(ThisItem.IconBg), ${self}.StyleConfig.colors.cardBg)`,
      Height: cardHeight,
      RadiusTopLeft: `${self}.StyleConfig.radius.lg`,
      RadiusTopRight: `${self}.StyleConfig.radius.lg`,
      RadiusBottomLeft: `${self}.StyleConfig.radius.lg`,
      RadiusBottomRight: `${self}.StyleConfig.radius.lg`,
      Width: `Parent.TemplateWidth - ${self}.StyleConfig.space.lg`,
      X: `${self}.StyleConfig.space.lg / 2`,
      Y: `If(${isDense}, ${self}.StyleConfig.space.md, ${self}.StyleConfig.space.lg)`
    },
    children: [
      {
        name: "txtLabel",
        control: "ModernText@1.0.0",
        properties: {
          AutoHeight: "true",
          Color: `If(${self}.Style = "Filled", ColorValue(ThisItem.IconColor), ${self}.StyleConfig.colors.textMuted)`,
          FontWeight: "FontWeight.Semibold",
          Size: `${self}.StyleConfig.type.label.size`,
          Text: "Upper(ThisItem.Label)",
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
              Color: `If(${self}.Style = "Filled", ColorValue(ThisItem.IconColor), ${self}.StyleConfig.colors.text)`,
              FillPortions: "1",
              FontWeight: "FontWeight.Bold",
              Size: `If(${self}.Style = "Chart", ${self}.StyleConfig.type.value.sizeCompact, ${isDense}, ${self}.StyleConfig.type.value.sizeCompact, ${self}.StyleConfig.type.value.size)`,
              Text: abbreviatedValue
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
              Visible: `And(Or(${self}.Style = "Compact", ${self}.Style = "Chart"), !IsBlankOrError(ThisItem.PercentChange))`,
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
          Visible: `And(Or(${self}.Style = "Standard", ${self}.Style = "Chart"), ThisItem.SparklineData <> "")`,
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
          Visible: `${self}.Style = "Chart" And ThisItem.SparklineData = ""`,
          Width: cardWidthExpr,
          Height: "96",
          Y: `${cardHeightExpr} - 96`
        }
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
              Visible: "!IsBlankOrError(ThisItem.PercentChange)",
              Width: "70"
            }
          },
          {
            name: "txtFooterSub",
            control: "ModernText@1.0.0",
            properties: {
              AutoHeight: "true",
              Color: `If(${self}.Style = "Filled", ColorValue(ThisItem.IconColor), ${self}.StyleConfig.colors.neutral)`,
              FillPortions: "1",
              Size: `${self}.StyleConfig.type.body.size`,
              Text: "ThisItem.PercentLabel",
              Visible: "!IsBlankOrError(ThisItem.PercentLabel)",
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
          Fill: "ColorValue(ThisItem.IconBg)",
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
          OnSelect: `${self}.OnCardClick(ThisItem)`
        }
      }
    ]
  };

  const conSkeletonCard = {
    name: "conSkeletonCard",
    control: "GroupContainer@1.5.0",
    variant: "ManualLayout",
    properties: {
      BorderColor: `${self}.StyleConfig.colors.border`,
      BorderThickness: "1",
      Fill: `${self}.StyleConfig.colors.cardBg`,
      Height: cardHeight,
      RadiusTopLeft: `${self}.StyleConfig.radius.lg`,
      RadiusTopRight: `${self}.StyleConfig.radius.lg`,
      RadiusBottomLeft: `${self}.StyleConfig.radius.lg`,
      RadiusBottomRight: `${self}.StyleConfig.radius.lg`,
      Width: `Parent.TemplateWidth - ${self}.StyleConfig.space.lg`,
      X: `${self}.StyleConfig.space.lg / 2`,
      Y: `If(${isDense}, ${self}.StyleConfig.space.md, ${self}.StyleConfig.space.lg)`
    },
    children: [
      { name: "btnSkeletonLabel", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: `${self}.StyleConfig.colors.skeletonBase`, Height: "10", Width: "72", RadiusTopLeft: "4", RadiusTopRight: "4", RadiusBottomLeft: "4", RadiusBottomRight: "4", Text: '""', X: "20", Y: "22" } },
      { name: "btnSkeletonValue", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: `${self}.StyleConfig.colors.skeletonBase`, Height: "24", Width: "56", RadiusTopLeft: "4", RadiusTopRight: "4", RadiusBottomLeft: "4", RadiusBottomRight: "4", Text: '""', X: "20", Y: "46" } },
      { name: "btnSkeletonChart", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: `${self}.StyleConfig.colors.skeletonBase`, Height: "96", Width: "conSkeletonCard.Width", Text: '""', Visible: `${self}.Style = "Chart"`, Y: "conSkeletonCard.Height - 96" } },
      { name: "btnSkeletonFooter", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: `${self}.StyleConfig.colors.skeletonShine`, Height: "10", Width: "110", RadiusTopLeft: "4", RadiusTopRight: "4", RadiusBottomLeft: "4", RadiusBottomRight: "4", Text: '""', Visible: `${self}.Style = "Standard"`, X: "20", Y: "conSkeletonCard.Height - 28" } },
      { name: "btnSkeletonIcon", control: "Classic/Button@2.2.0", properties: { BorderStyle: "BorderStyle.None", Fill: `${self}.StyleConfig.colors.skeletonBase`, Height: "44", Width: "44", RadiusTopLeft: "22", RadiusTopRight: "22", RadiusBottomLeft: "22", RadiusBottomRight: "22", Text: '""', Visible: `!Or(${self}.Style = "Filled", ${self}.Style = "Minimal", ${self}.Style = "Chart")`, X: "Parent.Width - 64", Y: "20" } }
    ]
  };

  return {
    // Root Width is App.Width, not Parent.Width: this row is meant to
    // always span the full app/screen width it's placed on, the same
    // way the real reference component's own root does — matching
    // WrapCount/Height's own breakpoint math, which already reads
    // App.Width for exactly that reason. A host nesting it inside a
    // narrower container would need to override Width on the pasted
    // instance explicitly; that's a real, accepted tradeoff for a
    // top-level dashboard row, not an oversight.
    properties: { Height: `With({bp: ${self}.ColumnsLayout, w: App.Width, cardCount: CountRows(Filter(${self}.Data, !IfError(isHidden, false)))}, With({cols: Max(1, If(w < bp.MobileBreakpoint, bp.Mobile, w < bp.TabletBreakpoint, bp.Tablet, bp.Desktop))}, With({rows: RoundUp(cardCount / cols, 0), gap: ${self}.StyleConfig.space.lg}, rows * (${cardHeight} + gap) + gap)))`, Width: "App.Width" },
    children: [
      {
        name: "cntStatsRow",
        control: "GroupContainer@1.5.0",
        variant: "AutoLayout",
        properties: {
          DropShadow: "DropShadow.None",
          Height: `${self}.Height`,
          LayoutDirection: "LayoutDirection.Horizontal",
          LayoutGap: `${self}.StyleConfig.space.lg`,
          LayoutWrap: "true",
          Visible: `!${self}.IsLoading`,
          Width: "Parent.Width"
        },
        children: [
          {
            name: "galKPIs",
            control: "Gallery@2.15.0",
            variant: "Vertical",
            properties: {
              BorderStyle: "BorderStyle.None",
              Height: "Parent.Height",
              Items: `Filter(${self}.Data, !IfError(isHidden, false))`,
              ShowScrollbar: "false",
              TemplatePadding: "0",
              TemplateSize: `${cardHeight} + ${self}.StyleConfig.space.lg`,
              Transition: `Switch(${self}.AnimationEffect, "Pop", Transition.Pop, "Push", Transition.Push, Transition.None)`,
              Width: "Parent.Width",
              WrapCount: wrapCount
            },
            children: [conKPICard]
          }
        ]
      },
      {
        name: "cntSkeletonOverlay",
        control: "GroupContainer@1.5.0",
        variant: "ManualLayout",
        properties: {
          DropShadow: "DropShadow.None",
          Fill: "Color.Transparent",
          Height: `${self}.Height`,
          Visible: `${self}.IsLoading`,
          Width: "Parent.Width"
        },
        children: [
          {
            name: "galSkeleton",
            control: "Gallery@2.15.0",
            variant: "Vertical",
            properties: {
              BorderStyle: "BorderStyle.None",
              Height: "Parent.Height",
              Items: "Sequence(8)",
              ShowScrollbar: "false",
              TemplatePadding: "0",
              TemplateSize: `${cardHeight} + ${self}.StyleConfig.space.lg`,
              Width: "Parent.Width",
              WrapCount: wrapCount
            },
            children: [conSkeletonCard]
          }
        ]
      }
    ],
    eventParameters: {
      OnCardClick: [
        {
          name: "ClickedItem",
          dataType: "Record",
          defaultFormula: '{ID:1,Icon:"Box",Value:118,Label:"All Assets",PercentChange:14,PercentLabel:"vs last month",IconBg:"#EBF5FF",IconColor:"#2196F3"}'
        }
      ]
    }
  };
}

export const CHILDREN_BUILDERS = {
  "KPI Card": kpiCard
};
