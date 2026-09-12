/* ============================================================
   YAML / docs generation — purely derived from the component
   catalog in src/data/componentLibrary.js, so the "Component YAML"
   and "Copy Docs" output is always in sync with the Properties /
   Events tabs. Nothing here is a copy of any third party's
   component source.
   ============================================================ */
const TYPE_TO_DATATYPE = { Table: "Table", Text: "String", Number: "Number", Boolean: "Boolean", DateTime: "DateAndTime", Record: "Record", Color: "Color" };

function pascalCase(title) {
  return title.replace(/[^a-zA-Z0-9]+/g, " ").trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}

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
    lines.push(`      ${name}:`);
    lines.push(`        PropertyKind: Input`);
    lines.push(`        DisplayName: "${name}"`);
    lines.push(`        DataType: ${TYPE_TO_DATATYPE[type] || "String"}`);
    if (def) lines.push(`        Default: =${JSON.stringify(String(def))}`);
  });
  item.events.forEach(([name]) => {
    lines.push(`      ${name}:`);
    lines.push(`        PropertyKind: Event`);
    lines.push(`        DisplayName: "${name}"`);
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

export { pascalCase, buildComponentYaml, buildComponentDocs };
