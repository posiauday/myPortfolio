/* ============================================================
   YAML / docs generation — purely derived from the component
   catalog in src/data/componentLibrary.js, so the "Component YAML"
   and "Copy Docs" output is always in sync with the Properties /
   Events tabs. Nothing here is a copy of any third party's
   component source.

   The YAML shapes and enum values here (DefinitionType,
   AccessAppScope, CustomProperties, PropertyKind, DataType, and the
   screen-control Control/Properties keys) are matched against
   Microsoft's own published schema for Power Apps source YAML:
   https://github.com/microsoft/PowerApps-Tooling/blob/master/schemas/pa-yaml/v3.0/pa.schema.yaml
   `scripts/validate-yaml.mjs` (npm run test:yaml) checks every
   generated component's output against that same enum set on every
   build, so a future edit that reintroduces an invalid DataType or
   PropertyKind fails CI instead of shipping quietly. Two real
   mistakes were caught this way before this comment was written:
   `DataType: String` (the real enum value is `Text`, not `String`)
   and defaults always being wrapped as quoted text even for Number/
   Boolean properties, which would fail Studio's own type checking on
   paste.
   ============================================================ */
const TYPE_TO_DATATYPE = { Table: "Table", Text: "Text", Number: "Number", Boolean: "Boolean", DateTime: "DateAndTime", Record: "Record", Color: "Color" };

function pascalCase(title) {
  return title.replace(/[^a-zA-Z0-9]+/g, " ").trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}

/* Power Fx-in-YAML has two hard rules this has to respect (see
   Microsoft's YAML formula grammar): every formula needs a leading
   "=", and a single-line formula can never contain a bare "#" or ":"
   anywhere — even inside a quoted string — since YAML itself would
   read the first as a comment and the second as a new mapping key.
   Anything containing either falls back to a multi-line block scalar
   instead, which has no such restriction. */
function needsMultiline(text) {
  return text.includes("#") || text.includes(":");
}

/* Many of this catalog's "default" values are documentation
   shorthand — "Sample entries", "US federal default", "Six
   categories" — describing what the default conceptually is, not a
   literal Power Fx expression. Emitting those as bare, unquoted
   formula text would fail Studio's parser outright (an unquoted
   multi-word phrase isn't a valid expression). A genuine-looking
   Number or Boolean literal is emitted bare, as a real Power Fx
   literal of that type; everything else is emitted as a quoted text
   literal, which is always valid Power Fx even when it's standing in
   for a longer description than that data type would ever really
   hold. */
function formatFormulaValue(rawValue, dataType) {
  const value = String(rawValue);
  const isNumericLiteral = dataType === "Number" && /^-?\d+(\.\d+)?$/.test(value.trim());
  const isBooleanLiteral = dataType === "Boolean" && (value === "true" || value === "false");
  const expression = isNumericLiteral || isBooleanLiteral ? value : JSON.stringify(value);
  return { expression, multiline: needsMultiline(expression) };
}

function pushFormulaProperty(lines, indent, name, rawValue, dataType) {
  if (!rawValue) return;
  const { expression, multiline } = formatFormulaValue(rawValue, dataType);
  if (multiline) {
    // "|-" (strip chomping), not bare "|": plain "|" keeps one trailing
    // newline in the parsed value, which would leave a stray "\n" stuck
    // to the end of the formula — caught by scripts/validate-yaml.mjs
    // actually parsing this output rather than just eyeballing it.
    lines.push(`${indent}${name}: |-`);
    lines.push(`${indent}  =${expression}`);
  } else {
    lines.push(`${indent}${name}: =${expression}`);
  }
}

/* The reusable component *definition* — what you paste into Power
   Apps Studio's Components pane (New component > Import from code) to
   create the component itself, once. */
function buildComponentYaml(item) {
  const pascal = pascalCase(item.title);
  const lines = [
    `# ${item.title} — ${item.category}`,
    `# ${item.yamlStatus}`,
    `ComponentDefinitions:`,
    `  cmp${pascal}:`,
    `    DefinitionType: CanvasComponent`,
    `    AccessAppScope: true`,
    `    CustomProperties:`
  ];
  item.properties.forEach(([name, type, def]) => {
    const dataType = TYPE_TO_DATATYPE[type] || "Text";
    lines.push(`      ${name}:`);
    lines.push(`        PropertyKind: Input`);
    lines.push(`        DisplayName: "${name}"`);
    lines.push(`        DataType: ${dataType}`);
    pushFormulaProperty(lines, "        ", "Default", def, dataType);
  });
  item.events.forEach(([name]) => {
    lines.push(`      ${name}:`);
    lines.push(`        PropertyKind: Event`);
    lines.push(`        DisplayName: "${name}"`);
  });
  return lines.join("\n");
}

/* An *instance* of that same component dropped onto a screen — paste
   this into a screen's node in the tree view once the component
   itself already exists (from buildComponentYaml above). A screen
   control instance's own `Control:` value is simply the component's
   name, the same way any other control reference works. */
function buildScreenControlYaml(item) {
  const pascal = pascalCase(item.title);
  const lines = [
    `# ${item.title} — one instance on a screen`,
    `# Paste onto a screen in the tree view, after the component itself`,
    `# already exists from cmp${pascal}.yaml (Components pane > New`,
    `# component > Import from code) — this instance references it by name.`,
    `${pascal}1:`,
    `  Control: cmp${pascal}`,
    `  Properties:`,
    `    X: =40`,
    `    Y: =40`
  ];
  item.properties.forEach(([name, type, def]) => {
    pushFormulaProperty(lines, "    ", name, def, TYPE_TO_DATATYPE[type] || "Text");
  });
  return lines.join("\n");
}

function buildComponentDocs(item) {
  const out = [`# ${item.title}`, "", item.summary, "", "## Properties", ""];
  item.properties.forEach(([name, type, def, desc]) => out.push(`- **${name}** (${type}, default ${def}) — ${desc}`));
  out.push("", "## Events", "");
  if (item.events.length) {
    item.events.forEach(([name, desc]) => out.push(`- **${name}** — ${desc}`));
  } else {
    out.push("- No behavior events in the current specification.");
  }
  out.push("", "## Architecture", "");
  item.architecture.forEach((x, i) => out.push(`${i + 1}. ${x}`));
  out.push("", "## Limitations", "");
  item.limitations.forEach(x => out.push(`- ${x}`));
  return out.join("\n");
}

export { pascalCase, buildComponentYaml, buildScreenControlYaml, buildComponentDocs };
