/*
    Bugs found by the 2026-11 card review sweep (docs/card-review-plan.md in the
    monorepo). Each starts as a `todo` test describing the intended behavior and
    becomes a regular test when its fix lands.
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeCard, makeHass, sensor, RADIAL } from "./helpers/env.mjs";

test("C1: the sections view sizes the card to the gauge, not a fixed 3 rows", async () => {
  // 3 rows is about 184px; the default 220px gauge spilled over the card below
  const card = await makeCard({});
  assert.equal(card.getGridOptions().rows, "auto");
  card.remove();
});

test("C2: masonry gets the card's height in 50px units", async () => {
  const full = await makeCard({});
  assert.equal(typeof full.getCardSize, "function");
  assert.equal(full.getCardSize(), 5, "220px gauge");
  const half = await makeCard({ card_height: 145, shadow_bottom: 10, gauge: { ...RADIAL } });
  assert.equal(half.getCardSize(), 4, "card_height 145 + shadow_bottom 10");
  const named = await makeCard({ name: "CPU" });
  assert.equal(named.getCardSize(), 6, "the name line below the gauge");
  const barred = await makeCard({ name: "CPU", shadow_height: "15%" });
  assert.equal(barred.getCardSize(), 5, "the name sits on the shadow bar");
  const sizeless = await makeCard({ gauge: { type: "radial-gauge" } });
  assert.equal(sizeless.getCardSize(), 1, "no height configured");
  for (const card of [full, half, named, barred, sizeless]) card.remove();
});

/* --- DECIDED 2026-11-26 (option a): non-numeric states show as text -------- */

test("C3: an unavailable entity shows its state in the value box, not the minimum", async () => {
  const hass = makeHass({ "sensor.a": sensor("unavailable", { friendly_name: "A" }) });
  hass.formatEntityState = (stateObj) => (stateObj.state === "unavailable" ? "Unavailable" : stateObj.state);
  const card = await makeCard({}, hass);
  assert.equal(card._gauge.options.valueText, "Unavailable");

  card.hass = { ...hass, states: { "sensor.a": sensor("42") } };
  await card.updateComplete;
  assert.equal(card._gauge.options.valueText, "", "a number shows again");
  card.remove();
});

test("C3: a configured valueText comes back once the state is numeric", async () => {
  const hass = makeHass({ "sensor.a": sensor("unknown") });
  const card = await makeCard({ gauge: { ...RADIAL, valueText: "fixed" } }, hass);
  assert.equal(card._gauge.options.valueText, "unknown", "raw state without formatEntityState");
  card.hass = { ...hass, states: { "sensor.a": sensor("3") } };
  await card.updateComplete;
  assert.equal(card._gauge.options.valueText, "fixed");
  card.hass = { ...hass, states: { "sensor.a": sensor(" ") } };
  await card.updateComplete;
  assert.equal(card._gauge.options.valueText, " ", "a blank state is not the number 0");
  card.remove();
});

test("C3: radial angles survive the value text change", async () => {
  const hass = makeHass({ "sensor.a": sensor("unavailable") });
  const card = await makeCard({ gauge: { ...RADIAL, startAngle: 90, ticksAngle: 180 } }, hass);
  assert.equal(card._gauge.options.startAngle, 90);
  assert.equal(card._gauge.options.ticksAngle, 180);
  card.remove();
});

/* --- DECIDED 2026-11-26 (option a): template debug keys removed ------------ */

test("C4: show_error and show_warning are ignored", async () => {
  const card = await makeCard({ show_error: true, show_warning: true });
  assert.ok(card.shadowRoot.querySelector("canvas"), "the gauge renders");
  card.remove();
});

/* --- DECIDED 2026-11-26 (scale to fit): found on the ha-test Variety page --- */

// Stand-in ResizeObserver (jsdom has none): records what is observed and lets a test
// report a new size by calling observer.fire()
function installResizeObserver() {
  const observers = [];
  class FakeResizeObserver {
    constructor(callback) { this.callback = callback; this.targets = []; this.disconnected = false; observers.push(this); }
    observe(target) { this.targets.push(target); }
    disconnect() { this.disconnected = true; this.targets = []; }
    fire() { this.callback([]); }
  }
  globalThis.ResizeObserver = FakeResizeObserver;
  return { observers, uninstall: () => { delete globalThis.ResizeObserver; } };
}

const setWidth = (card, px) => Object.defineProperty(card, "clientWidth", { configurable: true, value: px });
const cardrootRule = (card) => card.shadowRoot.querySelector("style").textContent
  .replace(/\s+/g, " ").match(/\.cardroot \{[^}]*\}/)[0];

test("C5: a gauge wider than its slot scales down instead of spilling over the next card", async () => {
  const ro = installResizeObserver();
  try {
    // 320px gauge in a 160px slot: half size
    const card = await makeCard({ gauge: { ...RADIAL, width: 320, height: 100 } });
    const observer = ro.observers.at(-1);
    assert.ok(observer, "the card watches its own width");
    setWidth(card, 160);
    observer.fire();
    await card.updateComplete;
    assert.match(cardrootRule(card), /zoom: 0\.5;/);

    // Room for the full gauge again: no zoom at all
    setWidth(card, 400);
    observer.fire();
    await card.updateComplete;
    assert.doesNotMatch(cardrootRule(card), /zoom/);

    // A config change while connected refits right away (the slot did not resize)
    setWidth(card, 100);
    card.setConfig({ entity: "sensor.a", gauge: { ...RADIAL, width: 200, height: 100 } });
    await card.updateComplete;
    assert.match(cardrootRule(card), /zoom: 0\.5;/);

    card.remove();
    assert.equal(observer.disconnected, true, "stops watching when removed");
  } finally {
    ro.uninstall();
  }
});

test("C5: the name line below the gauge never runs wider than the card", async () => {
  const card = await makeCard({ name: "CPU", gauge: { ...RADIAL, width: 320, height: 100 } });
  const nameRule = card.shadowRoot.querySelector("style").textContent.replace(/\s+/g, " ")
    .match(/\.name \{[^}]*\}/)[0];
  assert.match(nameRule, /max-width: 100%;/);
  card.remove();
});
