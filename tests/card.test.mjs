import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CanvasGaugeCard, hasConfigOrEntityChanged, makeCard, makeHass, sensor, text, RADIAL, window,
} from "./helpers/env.mjs";

const styleOf = (card) => card.shadowRoot.querySelector("style").textContent.replace(/\s+/g, " ");

/* --- registration and setup ----------------------------------------------------- */

test("the card picker entry and the editor element", () => {
  const entry = window.customCards.find((c) => c.type === "canvas-gauge-card");
  assert.equal(entry.name, "Canvas Gauge Card - Continued");
  assert.equal(CanvasGaugeCard.getConfigElement().localName, "canvas-gauge-card-editor");
});

test("getStubConfig picks a numeric sensor, and works without one or without hass", () => {
  const hass = makeHass({ "light.x": sensor("on"), "sensor.word": sensor("idle"), "sensor.n": sensor("12.5") });
  assert.equal(CanvasGaugeCard.getStubConfig(hass).entity, "sensor.n");
  assert.equal("entity" in CanvasGaugeCard.getStubConfig(makeHass({})), false);
  const stub = CanvasGaugeCard.getStubConfig();
  assert.equal(stub.gauge.type, "radial-gauge");
  assert.doesNotThrow(() => document.createElement("canvas-gauge-card").setConfig(stub));
});

test("setConfig needs a config and a gauge section", () => {
  const card = document.createElement("canvas-gauge-card");
  assert.throws(() => card.setConfig(undefined), /Invalid configuration/);
  assert.throws(() => card.setConfig({ entity: "sensor.a" }), /Missing required gauge section/);
});

test("the README example loads and draws", async () => {
  const card = await makeCard({
    name: "Processor (%)", card_height: 145, shadow_height: "15%", font_size: "1em",
    gauge: {
      type: "radial-gauge", width: 220, height: 220, borderShadowWidth: 0, borderOuterWidth: 0,
      borderMiddleWidth: 0, borderInnerWidth: 0, minValue: 0, maxValue: 100, startAngle: 90,
      ticksAngle: 180, valueBox: false, majorTicks: ["0", "10", "20", "30", "40", "50", "60", "70", "80", "90", "100"],
      minorTicks: 2, strokeTicks: true, highlights: [{ from: 80, to: 100, color: "rgba(200, 50, 50, .75)" }],
      borders: false,
    },
  });
  assert.ok(card._gauge);
  assert.equal(card._gauge.options.startAngle, 90);
  assert.match(text(card.shadowRoot), /Processor \(%\)/);
  card.remove();
});

/* --- hasConfigOrEntityChanged ------------------------------------------------------ */

test("hasConfigOrEntityChanged: config, forced, entity state, and no entity", () => {
  const a = sensor(1);
  const hass = { states: { "sensor.a": a } };
  const el = { config: { entity: "sensor.a" }, hass };
  assert.equal(hasConfigOrEntityChanged(el, new Map([["_config", {}]]), false), true);
  assert.equal(hasConfigOrEntityChanged(el, new Map(), true), true);
  assert.equal(hasConfigOrEntityChanged(el, new Map([["hass", { states: { "sensor.a": a } }]]), false), false);
  assert.equal(hasConfigOrEntityChanged(el, new Map([["hass", { states: { "sensor.a": sensor(2) } }]]), false), true);
  assert.equal(hasConfigOrEntityChanged(el, new Map([["hass", undefined]]), false), true, "first hass");
  assert.equal(hasConfigOrEntityChanged({ config: {}, hass }, new Map([["hass", hass]]), false), false);
});

/* --- gauge options ------------------------------------------------------------------- */

test("undrawable colors fall back to the library default; blanks and arrays pass", async () => {
  const card = await makeCard({ gauge: {
    ...RADIAL, colorPlate: "#1a", colorNeedle: "var(--primary-color)", colorBar: "",
    colorNumbers: ["#fff", "#000"], colorTitle: "red", colorUnits: 5,
  } });
  const options = card._gauge.options;
  assert.notEqual(options.colorPlate, "#1a");
  assert.notEqual(options.colorNeedle, "var(--primary-color)");
  assert.equal(options.colorBar, "");
  assert.deepEqual(Array.from(options.colorNumbers), ["#fff", "#000"]);
  assert.equal(options.colorTitle, "red");
  card.remove();
});

test("major ticks: configured, spread over the range, or left to canvas-gauges", async () => {
  const set = await makeCard({ gauge: { ...RADIAL, majorTicks: ["a", "b"] } });
  assert.deepEqual(Array.from(set._gauge.options.majorTicks), ["a", "b"]);
  const spread = await makeCard({ gauge: { ...RADIAL, minValue: -30, maxValue: 40 } });
  assert.deepEqual(Array.from(spread._gauge.options.majorTicks).map(Number), [-30, -16, -2, 12, 26, 40]);
  const defaults = await makeCard({ gauge: { type: "radial-gauge", width: 100, height: 100 } });
  assert.deepEqual(Array.from(defaults._gauge.options.majorTicks).map(Number), [0, 20, 40, 60, 80, 100]);
  const reversed = await makeCard({ gauge: { ...RADIAL, minValue: 10, maxValue: 5 } });
  assert.equal(reversed._gauge.options.majorTicks.length > 0, true, "canvas-gauges' own ticks");
  assert.notDeepEqual(Array.from(reversed._gauge.options.majorTicks).map(Number), [10, 9, 8, 7, 6, 5]);
  for (const card of [set, spread, defaults, reversed]) card.remove();
});

test("linear and radial gauges are built from the type", async () => {
  const linear = await makeCard({ gauge: { ...RADIAL, type: "linear-gauge" } });
  // Class names are minified; barBeginCircle is a linear-only option, startAngle radial-only
  assert.equal("barBeginCircle" in linear._gauge.options, true);
  const radial = await makeCard({});
  assert.equal("barBeginCircle" in radial._gauge.options, false);
  assert.equal(radial._gauge.options.startAngle, 45);
  linear.remove();
  radial.remove();
});

/* --- lifecycle --------------------------------------------------------------------- */

test("a new config rebuilds the gauge; a state change only moves it", async () => {
  const card = await makeCard({});
  const first = card._gauge;
  card.hass = makeHass({ "sensor.a": sensor(7, { friendly_name: "A" }) });
  await card.updateComplete;
  assert.equal(card._gauge, first, "same gauge for a new value");
  card.setConfig({ entity: "sensor.a", gauge: { ...RADIAL, maxValue: 50 } });
  await card.updateComplete;
  assert.notEqual(card._gauge, first);
  assert.equal(card._gauge.options.maxValue, 50);
  card.remove();
});

test("an unchanged entity in a new hass does not re-render", async () => {
  const hass = makeHass({ "sensor.a": sensor(5), "sensor.b": sensor(1) });
  const card = await makeCard({}, hass);
  const before = card._state;
  card.hass = { ...hass, states: { ...hass.states, "sensor.b": sensor(2) } };
  await card.updateComplete;
  assert.equal(card._state, before);
  card.remove();
});

test("a missing entity shows a warning, then the gauge once it appears", async () => {
  const card = await makeCard({ entity: "sensor.gone" });
  assert.match(text(card.shadowRoot), /Entity not found: sensor\.gone/);
  assert.equal(card._gauge, undefined);
  card.hass = makeHass({ "sensor.gone": sensor(3) });
  await card.updateComplete;
  assert.ok(card._gauge);
  card.setConfig({ entity: "sensor.other", gauge: { ...RADIAL } });
  await card.updateComplete;
  assert.equal(card._gauge, undefined, "the gauge is destroyed with its canvas");
  card.remove();
});

test("no entity and an unknown gauge type show warnings", async () => {
  const warning = (card) => text(card.shadowRoot.querySelector(".warning"));
  const none = await makeCard({ entity: undefined });
  assert.equal(warning(none), "No entity configured");
  const typo = await makeCard({ gauge: { ...RADIAL, type: "radial" } });
  assert.equal(warning(typo), 'Gauge type must be "radial-gauge" or "linear-gauge": radial');
  const untyped = await makeCard({ gauge: { width: 100 } });
  assert.equal(warning(untyped), 'Gauge type must be "radial-gauge" or "linear-gauge"');
  for (const card of [none, typo, untyped]) card.remove();
});

test("nothing renders before config and hass", async () => {
  const card = document.createElement("canvas-gauge-card");
  document.body.appendChild(card);
  await card.updateComplete;
  assert.equal(card.shadowRoot.querySelector("ha-card, .cardroot"), null, "no config yet");
  card.setConfig({ entity: "sensor.a", gauge: { ...RADIAL } });
  await card.updateComplete;
  assert.equal(card.shadowRoot.querySelector("ha-card, .cardroot"), null, "no hass yet");
  card.remove();
});

/* --- layout and name --------------------------------------------------------------- */

test("card size options default to the gauge size and no shadow", async () => {
  const card = await makeCard({});
  const style = styleOf(card);
  assert.match(style, /\.cardroot \{ width: 220px; height: calc\( 220px \+ 0px \)/);
  assert.match(style, /background-color: transparent !important/);
  assert.match(style, /top: 0; left: 0;/);
  assert.doesNotMatch(style, /box-shadow/);
  assert.equal(card.shadowRoot.querySelector(".shadow"), null);
  card.remove();
});

test("card options set width, height, shadow, offsets and background", async () => {
  const card = await makeCard({
    card_width: 300, card_height: 150, shadow_height: "20%", shadow_bottom: 12, dropshadow: true,
    background_color: "var(--card-background-color)", card_top: "-10px", card_left: "4px", name: "N",
  });
  const style = styleOf(card);
  assert.match(style, /\.cardroot \{ width: 300px; height: calc\( 150px \+ 12px \)/);
  assert.match(style, /box-shadow/);
  assert.match(style, /background-color: var\(--card-background-color\) !important/);
  assert.match(style, /top: -10px; left: 4px;/);
  assert.match(style, /height: 20%;/);
  const state = card.shadowRoot.querySelector(".shadow .state");
  assert.equal(text(state), "N");
  assert.match(state.getAttribute("style"), /font-size: calc\(220px\/22\)/);
  card.remove();
});

test("without a shadow bar the name goes below the gauge, styled as configured", async () => {
  const plain = await makeCard({ name: "Below" });
  const name = plain.shadowRoot.querySelector(".name");
  assert.equal(text(name), "Below");
  assert.match(name.getAttribute("style"), /font-size: var\(--ha-font-size-m, 14px\);\s*$/);
  const styled = await makeCard({ name: "Below", font_size: "2em", name_color: "red", name_bold: true });
  assert.match(styled.shadowRoot.querySelector(".name").getAttribute("style"), /font-size: 2em; color: red;font-weight: bold;/);
  const unnamed = await makeCard({});
  assert.equal(unnamed.shadowRoot.querySelector(".name"), null);
  for (const card of [plain, styled, unnamed]) card.remove();
});

/* --- accessibility and interaction ----------------------------------------------------- */

test("the gauge button's label is name, friendly name or entity id, with the unit", async () => {
  const label = (card) => card.shadowRoot.querySelector(".cardroot").getAttribute("aria-label");
  const named = await makeCard({ name: "CPU" });
  assert.equal(label(named), "CPU: 42 %");
  const friendly = await makeCard({ gauge: { ...RADIAL, units: "W" } });
  assert.equal(label(friendly), "A: 42 W");
  const bare = await makeCard({}, makeHass({ "sensor.a": sensor(3) }));
  assert.equal(label(bare), "sensor.a: 3");
  const noAttributes = await makeCard({}, makeHass({ "sensor.a": { state: "4" } }));
  assert.equal(label(noAttributes), "sensor.a: 4");
  for (const card of [named, friendly, bare, noAttributes]) card.remove();
});

test("click, Enter and Space open more-info; other keys do not", async () => {
  const card = await makeCard({});
  const root = card.shadowRoot.querySelector(".cardroot");
  root.click();
  for (const key of ["Enter", " ", "a"]) {
    const event = new KeyboardEvent("keydown", { key, cancelable: true });
    root.dispatchEvent(event);
    assert.equal(event.defaultPrevented, key !== "a", key);
  }
  assert.deepEqual(card.events.map((d) => d.entityId), ["sensor.a", "sensor.a", "sensor.a"]);
  assert.equal(card._fire("x").detail && typeof card._fire("x").detail, "object", "detail defaults to {}");
  card.remove();
});

test("the UI language picks the strings, falling back to English per string and per language", async () => {
  const warning = (card) => text(card.shadowRoot.querySelector(".warning"));
  try {
    localStorage.setItem("selectedLanguage", '"nb"');
    const nb = await makeCard({ entity: undefined });
    assert.notEqual(warning(nb), "No entity configured", "Norwegian has this string");
    const nbMissing = await makeCard({ gauge: { ...RADIAL, type: "x" } });
    assert.match(warning(nbMissing), /Gauge-typen/);
    const editor = CanvasGaugeCard.getConfigElement();
    assert.equal(editor._computeLabel({ name: "minValue" }), "Minimum", "Norwegian has no editor strings: English");
    localStorage.setItem("selectedLanguage", '"de-DE"');
    const de = await makeCard({ entity: undefined });
    assert.equal(warning(de), "No entity configured", "no German: English");
    for (const card of [nb, nbMissing, de]) card.remove();
  } finally {
    localStorage.removeItem("selectedLanguage");
  }
});
