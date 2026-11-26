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

test("C2: masonry gets the card's height in 50px units", { todo: true }, async () => {
  const full = await makeCard({});
  assert.equal(typeof full.getCardSize, "function");
  assert.equal(full.getCardSize(), 5, "220px gauge");
  const half = await makeCard({ card_height: 145, shadow_bottom: 10, gauge: { ...RADIAL } });
  assert.equal(half.getCardSize(), 4, "card_height 145 + shadow_bottom 10");
  full.remove();
  half.remove();
});

/* --- DECIDED 2026-11-26 (option a): non-numeric states show as text -------- */

test("C3: an unavailable entity shows its state in the value box, not the minimum", { todo: true }, async () => {
  const hass = makeHass({ "sensor.a": sensor("unavailable", { friendly_name: "A" }) });
  hass.formatEntityState = (stateObj) => (stateObj.state === "unavailable" ? "Unavailable" : stateObj.state);
  const card = await makeCard({}, hass);
  assert.equal(card._gauge.options.valueText, "Unavailable");

  card.hass = { ...hass, states: { "sensor.a": sensor("42") } };
  await card.updateComplete;
  assert.equal(card._gauge.options.valueText, "", "a number shows again");
  card.remove();
});

test("C3: a configured valueText comes back once the state is numeric", { todo: true }, async () => {
  const hass = makeHass({ "sensor.a": sensor("unknown") });
  const card = await makeCard({ gauge: { ...RADIAL, valueText: "fixed" } }, hass);
  assert.equal(card._gauge.options.valueText, "unknown", "raw state without formatEntityState");
  card.hass = { ...hass, states: { "sensor.a": sensor("3") } };
  await card.updateComplete;
  assert.equal(card._gauge.options.valueText, "fixed");
  card.remove();
});

/* --- DECIDED 2026-11-26 (option a): template debug keys removed ------------ */

test("C4: show_error and show_warning are ignored", { todo: true }, async () => {
  const card = await makeCard({ show_error: true, show_warning: true });
  assert.ok(card.shadowRoot.querySelector("canvas"), "the gauge renders");
  card.remove();
});
