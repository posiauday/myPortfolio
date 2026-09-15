#!/usr/bin/env node
/* ============================================================
   YAML SCHEMA CONFORMANCE CHECK
   Parses every generated component YAML (component definition, screen
   control instance) and the brand theme YAML with a real YAML parser,
   then checks the result against the key names and enum values from
   Microsoft's own published schema for Power Apps source YAML:
   https://github.com/microsoft/PowerApps-Tooling/blob/master/schemas/pa-yaml/v3.0/pa.schema.yaml

   This exists because real mistakes shipped silently before this
   script caught them: `DataType: String` (the schema's real enum value
   is `Text`, not `String`), every property default being wrapped as a
   quoted text literal even for Number/Boolean properties, and every
   Event property missing `ReturnType`/`Default` entirely (Studio's
   real paste-time compiler rejects that with PA1011/PA2231, even
   though the bare schema-conformant shape of an Event property doesn't
   require them at parse time) — all only caught by testing an actual
   paste into Studio or diffing against real shipped component YAML by
   hand. This script makes that check automatic instead of something
   that has to be remembered.

   This can't launch Power Apps Studio itself to confirm a real paste
   succeeds — short of that, it's the strongest check available:
   real YAML parsing (so a stray unescaped "#" or ":" that would
   truncate or corrupt a value on Studio's own parser gets caught
   here too) plus the exact enum sets Studio's schema declares.
   ============================================================ */
import { load as parseYaml } from "js-yaml";
import { components } from "../src/data/componentLibrary.js";
import { pascalCase, buildComponentYaml, buildScreenControlYaml } from "../src/lib/componentDocs.js";
import { buildBrandThemeYaml } from "../src/lib/themeYaml.js";

const VALID_DEFINITION_TYPES = ["CanvasComponent", "CommandComponent"];
const VALID_PROPERTY_KINDS = ["Input", "Output", "InputFunction", "OutputFunction", "Event", "Action"];
const VALID_DATA_TYPES = ["Text", "Number", "Boolean", "DateAndTime", "Screen", "Record", "Table", "Image", "VideoOrAudio", "Color", "Currency"];
const VALID_RETURN_TYPES = [...VALID_DATA_TYPES, "None"];

const errors = [];
const fail = (context, message) => errors.push(`${context}: ${message}`);

function assertFormula(value, context) {
  if (typeof value !== "string" || !value.startsWith("=")) {
    fail(context, `expected a Power Fx formula string starting with "=", got ${JSON.stringify(value)}`);
    return null;
  }
  return value.slice(1);
}

/* Independent of how componentDocs.js actually decides to quote a
   value — this only checks the outcome: a Number/Boolean default must
   be a bare literal (Studio would type-error on a quoted one), and
   everything else must be a quoted text literal (a bare multi-word
   phrase isn't valid Power Fx and Studio's parser would reject it as
   an unresolved identifier). */
function assertLiteralMatchesDataType(expr, dataType, context) {
  const isQuoted = expr.startsWith('"') && expr.endsWith('"');
  if (dataType === "Number") {
    if (isQuoted || !/^-?\d+(\.\d+)?$/.test(expr)) fail(context, `DataType Number but Default "${expr}" isn't a bare numeric literal`);
  } else if (dataType === "Boolean") {
    if (isQuoted || (expr !== "true" && expr !== "false")) fail(context, `DataType Boolean but Default "${expr}" isn't a bare true/false literal`);
  } else if (!isQuoted) {
    fail(context, `DataType ${dataType} but Default "${expr}" isn't a quoted text literal`);
  }
}

function validateComponentDefinition(item) {
  const pascal = pascalCase(item.title);
  const context = `${item.title} (component definition)`;
  const yamlText = buildComponentYaml(item);
  let parsed;
  try {
    parsed = parseYaml(yamlText);
  } catch (err) {
    fail(context, `failed to parse as YAML: ${err.message}`);
    return;
  }

  const definition = parsed?.ComponentDefinitions?.[`cmp${pascal}`];
  if (!definition) return fail(context, `missing ComponentDefinitions.cmp${pascal}`);
  if (!VALID_DEFINITION_TYPES.includes(definition.DefinitionType)) {
    fail(context, `DefinitionType "${definition.DefinitionType}" not in ${JSON.stringify(VALID_DEFINITION_TYPES)}`);
  }
  if (typeof definition.AccessAppScope !== "boolean") fail(context, `AccessAppScope should be boolean, got ${typeof definition.AccessAppScope}`);

  const customProperties = definition.CustomProperties || {};
  item.properties.forEach(([name, type, def]) => {
    const entry = customProperties[name];
    const propContext = `${context} > ${name}`;
    if (!entry) return fail(propContext, "missing from CustomProperties");
    if (!VALID_PROPERTY_KINDS.includes(entry.PropertyKind)) fail(propContext, `PropertyKind "${entry.PropertyKind}" not in ${JSON.stringify(VALID_PROPERTY_KINDS)}`);
    if (!VALID_DATA_TYPES.includes(entry.DataType)) fail(propContext, `DataType "${entry.DataType}" not in ${JSON.stringify(VALID_DATA_TYPES)}`);
    if (def) {
      const expr = assertFormula(entry.Default, propContext);
      if (expr !== null) assertLiteralMatchesDataType(expr, entry.DataType, propContext);
    }
  });
  item.events.forEach(([name]) => {
    const entry = customProperties[name];
    const eventContext = `${context} > ${name}`;
    if (!entry) return fail(eventContext, "missing from CustomProperties");
    if (entry.PropertyKind !== "Event") fail(eventContext, `expected PropertyKind Event, got "${entry.PropertyKind}"`);
    // Studio's real paste-time compiler (not just the schema's bare
    // key list) rejects an Event property missing either of these —
    // PA1011 for a missing ReturnType, PA2231 for an empty Default —
    // confirmed against real shipped component YAML on GitHub.
    if (!VALID_RETURN_TYPES.includes(entry.ReturnType)) fail(eventContext, `ReturnType "${entry.ReturnType}" not in ${JSON.stringify(VALID_RETURN_TYPES)}`);
    assertFormula(entry.Default, eventContext);
  });
}

function validateScreenControl(item) {
  const pascal = pascalCase(item.title);
  const context = `${item.title} (screen control instance)`;
  const yamlText = buildScreenControlYaml(item);
  let parsed;
  try {
    parsed = parseYaml(yamlText);
  } catch (err) {
    fail(context, `failed to parse as YAML: ${err.message}`);
    return;
  }

  const instance = parsed?.[`${pascal}1`];
  if (!instance) return fail(context, `missing top-level key "${pascal}1"`);
  if (instance.Control !== `cmp${pascal}`) fail(context, `Control should reference "cmp${pascal}", got "${instance.Control}"`);
  if (typeof instance.Properties !== "object" || instance.Properties === null) return fail(context, "missing Properties object");

  item.properties.forEach(([name, type, def]) => {
    if (!def) return;
    const propContext = `${context} > ${name}`;
    const expr = assertFormula(instance.Properties[name], propContext);
    if (expr === null) return;
    const dataType = { Table: "Table", Text: "Text", Number: "Number", Boolean: "Boolean", DateTime: "DateAndTime", Record: "Record", Color: "Color" }[type] || "Text";
    assertLiteralMatchesDataType(expr, dataType, propContext);
  });
}

function validateBrandTheme() {
  const context = "brand theme";
  const yamlText = buildBrandThemeYaml();
  let parsed;
  try {
    parsed = parseYaml(yamlText);
  } catch (err) {
    return fail(context, `failed to parse as YAML: ${err.message}`);
  }
  if (typeof parsed["Theme Name"] !== "string" || !parsed["Theme Name"]) fail(context, "missing Theme Name");
  if (typeof parsed.Font !== "string" || !parsed.Font) fail(context, "missing Font");
  if (typeof parsed.BasePaletteColor !== "string" || !/^#[0-9a-fA-F]{6}$/.test(parsed.BasePaletteColor)) fail(context, `BasePaletteColor "${parsed.BasePaletteColor}" isn't a 6-digit hex color`);
  if (typeof parsed.HueTorsion !== "number") fail(context, "HueTorsion should be a number");
  if (typeof parsed.Vibrancy !== "number") fail(context, "Vibrancy should be a number");
}

components.forEach(item => {
  validateComponentDefinition(item);
  validateScreenControl(item);
});
validateBrandTheme();

if (errors.length) {
  console.error(`✗ YAML schema conformance failed (${errors.length} issue${errors.length === 1 ? "" : "s"}):\n`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log(`✓ YAML schema conformance passed — ${components.length} components (definition + screen control) and the brand theme all match Microsoft's published schema.`);
}
