import { test } from "node:test";
import assert from "node:assert/strict";
import { makeEditor, form, formChange, RADIAL } from "./helpers/env.mjs";

const plain = (value) => JSON.parse(JSON.stringify(value));

// Field names in a schema, including grids and expandable sections
function names(schema) {
  return schema.flatMap((item) => (item.schema ? names(item.schema) : [item.name]));
}

/* --- build ------------------------------------------------------------------------ */

test("the editor renders nothing until it has hass and a config", async () => {
  const editor = document.createElement("canvas-gauge-card-editor");
  document.body.appendChild(editor);
  await editor.updateComplete;
  assert.equal(form(editor), null);
  editor.setConfig({ entity: "sensor.a", gauge: { ...RADIAL } });
  await editor.updateComplete;
  assert.equal(form(editor), null, "no hass yet");
  editor.remove();
});

test("form data: every section shares the gauge with the display defaults filled in", async () => {
  const editor = await makeEditor({ entity: "sensor.a", name_color: "red", gauge: { ...RADIAL, valueBox: false } });
  const data = form(editor).data;
  assert.equal(data.gauge_main, data.gauge_scale);
  assert.equal(data.gauge_main.valueBox, false, "the config wins over the default");
  assert.equal(data.gauge_main.needle, true);
  assert.equal(data.gauge_text.name_color, "red");
  assert.equal(data.gauge_text.name_bold, false);
  const bare = await makeEditor({ entity: "sensor.a" });
  assert.equal(form(bare).data.gauge_main.borders, true, "no gauge section yet");
  editor.remove();
  bare.remove();
});

test("radial and linear schemas show only their own options, and are cached", async () => {
  const radial = await makeEditor({ entity: "sensor.a", gauge: { ...RADIAL } });
  const radialNames = names(form(radial).schema);
  assert.ok(radialNames.includes("startAngle"));
  assert.ok(!radialNames.includes("tickSide"));
  const linear = await makeEditor({ entity: "sensor.a", gauge: { ...RADIAL, type: "linear-gauge" } });
  const linearNames = names(form(linear).schema);
  assert.ok(linearNames.includes("tickSide"));
  assert.ok(linearNames.includes("barBeginCircle"));
  assert.ok(!linearNames.includes("needleCircleSize"));
  const schema = form(radial).schema;
  radial.setConfig({ entity: "sensor.a", gauge: { ...RADIAL, width: 300 } });
  await radial.updateComplete;
  assert.equal(form(radial).schema, schema, "same schema object for the same type");
  radial.remove();
  linear.remove();
});

test("every field has a label and every section a title", async () => {
  for (const type of ["radial-gauge", "linear-gauge"]) {
    const editor = await makeEditor({ entity: "sensor.a", gauge: { ...RADIAL, type } });
    const { schema, computeLabel } = form(editor);
    for (const name of names(schema).filter((n) => n !== "")) {
      assert.equal(typeof computeLabel({ name }), "string", name);
      assert.notEqual(computeLabel({ name }), name, `${name} is translated`);
    }
    for (const section of schema.filter((item) => item.type === "expandable")) {
      assert.equal(typeof section.title, "string");
    }
    editor.remove();
  }
});

test("labels fall back to the field name; helpers are optional", async () => {
  const editor = await makeEditor({ entity: "sensor.a", gauge: { ...RADIAL } });
  const { computeLabel, computeHelper } = form(editor);
  assert.equal(computeLabel({ name: "notAnOption" }), "notAnOption");
  assert.equal(typeof computeHelper({ name: "minValue" }), "string");
  assert.equal(computeHelper({ name: "notAnOption" }), undefined);
  editor.remove();
});

test("the YAML note links to the canvas-gauges options", async () => {
  const editor = await makeEditor({ entity: "sensor.a", gauge: { ...RADIAL } });
  const link = editor.shadowRoot.querySelector(".yaml-note a");
  assert.equal(link.getAttribute("href"), "https://canvas-gauges.com/documentation/user-guide/configuration");
  assert.equal(link.getAttribute("rel"), "noopener noreferrer");
  editor.remove();
});

/* --- color errors ------------------------------------------------------------------- */

test("color errors name the field, by section; var() only for card colors", async () => {
  const editor = await makeEditor({
    entity: "sensor.a",
    background_color: "notacolor",
    name_color: "var(--primary-color)",
    gauge: {
      ...RADIAL, colorPlate: "var(--x)", colorNeedle: "#12", colorNumbers: ["#zz"],
      highlights: [{ from: 0, to: 1, color: "red" }, { from: 1, to: 2, color: "bad" }, null],
    },
  });
  const errors = form(editor).error;
  assert.match(errors.background_color, /Background/i);
  assert.equal(errors.gauge_plate.length, 1);
  assert.match(errors.gauge_needle[0], /needle/i);
  assert.equal(errors.gauge_scale, undefined, "per-tick color arrays are not checked");
  assert.equal(errors.gauge_text, undefined, "name_color may use a theme variable");
  assert.equal(errors.gauge_highlights.length, 1);
  assert.match(errors.gauge_highlights[0], /2/);
  editor.remove();
});

test("no errors for valid or blank colors", async () => {
  const editor = await makeEditor({ entity: "sensor.a", background_color: "var(--card-background-color)",
    gauge: { ...RADIAL, colorPlate: "", colorBar: "#fff", highlights: "not a list" } });
  assert.equal(form(editor).error, undefined);
  editor.remove();
});

/* --- value-changed ------------------------------------------------------------------- */

test("a section edit becomes the gauge config; untouched defaults stay out", async () => {
  const editor = await makeEditor({ entity: "sensor.a", gauge: { ...RADIAL } });
  const data = form(editor).data;
  const config = await formChange(editor, { ...data, gauge_main: { ...data.gauge_main, maxValue: 50 } });
  assert.deepEqual(plain(config), { entity: "sensor.a", gauge: { ...RADIAL, maxValue: 50 } });
  editor.remove();
});

test("a changed default is kept, and a default set in YAML is kept", async () => {
  const editor = await makeEditor({ entity: "sensor.a", gauge: { ...RADIAL, needle: true } });
  const data = form(editor).data;
  const config = await formChange(editor, { ...data, gauge_value: { ...data.gauge_value, valueBox: false } });
  assert.equal(config.gauge.valueBox, false);
  assert.equal(config.gauge.needle, true);
  assert.equal("borders" in config.gauge, false);
  editor.remove();
});

test("the text section moves name_color and name_bold to the card", async () => {
  const editor = await makeEditor({ entity: "sensor.a", name_bold: true, gauge: { ...RADIAL } });
  const data = form(editor).data;
  let config = await formChange(editor, { ...data, gauge_text: { ...data.gauge_text, name_color: "red", name_bold: false } });
  assert.equal(config.name_color, "red");
  assert.equal("name_bold" in config, false, "false is the default");
  assert.equal("name_color" in config.gauge, false);
  editor.setConfig(config);
  await editor.updateComplete;
  const next = form(editor).data;
  config = await formChange(editor, { ...next, gauge_text: { ...next.gauge_text, name_bold: true } });
  assert.equal(config.name_bold, true);
  editor.remove();
});

test("cleared fields and an empty tick list are removed; an empty highlight list stays", async () => {
  const editor = await makeEditor({ entity: "sensor.a", name: "x", gauge: { ...RADIAL, title: "T", majorTicks: ["1"] } });
  const data = form(editor).data;
  const config = await formChange(editor, {
    ...data, name: "",
    gauge_scale: { ...data.gauge_scale, title: undefined, units: null, majorTicks: [], highlights: [] },
  });
  assert.equal("name" in config, false);
  assert.deepEqual(plain(config.gauge), { ...RADIAL, highlights: [] });
  editor.remove();
});

test("a card-level edit keeps the gauge", async () => {
  const editor = await makeEditor({ entity: "sensor.a", gauge: { ...RADIAL, minValue: -5 } });
  const data = form(editor).data;
  const config = await formChange(editor, { ...data, entity: "sensor.b" });
  assert.equal(config.entity, "sensor.b");
  assert.equal(config.gauge.minValue, -5);
  editor.remove();
});

test("value-changed before a config is ignored", async () => {
  const editor = await makeEditor({ entity: "sensor.a", gauge: { ...RADIAL } });
  editor._config = undefined;
  editor._valueChanged({ stopPropagation() {}, detail: { value: {} } });
  assert.equal(editor.fired.length, 0);
  editor.remove();
});

test("display defaults are dropped for an editor started without a gauge section", async () => {
  const editor = await makeEditor({ entity: "sensor.a" });
  const config = await formChange(editor, { ...form(editor).data, entity: "sensor.b" });
  assert.deepEqual(plain(config), { entity: "sensor.b", gauge: {} });
  editor.remove();
});

test("a color error for a field without a label uses the field name", async () => {
  const editor = await makeEditor({ entity: "sensor.a", gauge: { ...RADIAL } });
  assert.match(editor._colorError("colorSomethingNew", false), /colorSomethingNew/);
  editor.remove();
});
