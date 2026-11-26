/*
    Test environment: a jsdom window with the globals Lit and canvas-gauges need, a 2D
    canvas context stand-in that records calls, then the built bundle
    (.test-build/canvas-gauge-card.js, made by `npm test`) - the same code HA loads.
    See ../README.md. Never pass DOM nodes to assert.
*/

import { JSDOM } from "jsdom";

const dom = new JSDOM("<!DOCTYPE html><body></body>", { pretendToBeVisual: true, url: "http://localhost/" });
const { window } = dom;

for (const key of [
  "window", "document", "HTMLElement", "HTMLCanvasElement", "customElements", "Document",
  "CSSStyleSheet", "Node", "Event", "CustomEvent", "KeyboardEvent", "MutationObserver",
  "localStorage", "requestAnimationFrame", "cancelAnimationFrame", "DOMParser",
]) {
  globalThis[key] = window[key];
}

// jsdom has no CSS.supports; answer for the color syntaxes the card checks.
const NAMED = new Set(["red", "green", "blue", "white", "black", "transparent", "orange", "yellow"]);
window.CSS = globalThis.CSS = {
  supports(property, value) {
    if (property !== "color" || typeof value !== "string") return false;
    const v = value.trim().toLowerCase();
    return /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(v)
      || /^rgba?\([^()]*\)$/.test(v)
      || /^hsla?\([^()]*\)$/.test(v)
      || /^var\(--[\w-]+\)$/.test(v)
      || NAMED.has(v);
  },
};

/*
    2D context stand-in. Every method is a no-op that records its name and arguments;
    gradients take color stops; measureText returns a width. Property writes are kept.
*/
export const canvasCalls = [];
function makeContext(canvas) {
  const target = {
    canvas,
    measureText: (text) => ({ width: String(text).length * 6 }),
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }),
    getImageData: () => ({ data: [] }),
  };
  return new Proxy(target, {
    get(obj, prop) {
      if (prop in obj) return obj[prop];
      return (...args) => { canvasCalls.push([prop, args]); };
    },
    set(obj, prop, value) { obj[prop] = value; return true; },
  });
}
window.HTMLCanvasElement.prototype.getContext = function () {
  this.__context ??= makeContext(this);
  return this.__context;
};

const bundle = await import("../../.test-build/canvas-gauge-card.js");
export const { CanvasGaugeCard, hasConfigOrEntityChanged } = bundle;
export const CanvasGaugeCardEditor = window.customElements.get("canvas-gauge-card-editor");
export { window };

/* --- fixtures ----------------------------------------------------------------- */

export function sensor(state, attributes = {}) {
  return { state: String(state), attributes };
}

export function makeHass(states = {}) {
  return { states, language: "en", locale: { language: "en" } };
}

export const RADIAL = { type: "radial-gauge", width: 220, height: 220, minValue: 0, maxValue: 100 };

/*
    A card set up in HA's order: setConfig, hass, then connected. Resolves after Lit's
    first render and updated(). `events` records hass-more-info.
*/
export async function makeCard(config, hass = makeHass({ "sensor.a": sensor(42, { friendly_name: "A", unit_of_measurement: "%" }) })) {
  const card = document.createElement("canvas-gauge-card");
  card.events = [];
  card.setConfig({ entity: "sensor.a", gauge: { ...RADIAL }, ...config });
  card.hass = hass;
  document.body.appendChild(card);
  await card.updateComplete;
  card.shadowRoot.addEventListener("hass-more-info", (e) => card.events.push(e.detail));
  return card;
}

export function text(el) {
  return (el?.textContent ?? "").replace(/\s+/g, " ").trim();
}

export async function makeEditor(config, hass = makeHass({ "sensor.a": sensor(1) })) {
  const editor = document.createElement("canvas-gauge-card-editor");
  editor.hass = hass;
  editor.setConfig(config);
  editor.fired = [];
  editor.addEventListener("config-changed", (e) => editor.fired.push(e.detail.config));
  document.body.appendChild(editor);
  await editor.updateComplete;
  return editor;
}

// The ha-form the editor rendered, and a way to fire its value-changed.
export function form(editor) {
  return editor.shadowRoot.querySelector("ha-form");
}

export async function formChange(editor, value) {
  form(editor).dispatchEvent(new CustomEvent("value-changed", { detail: { value }, bubbles: true, composed: true }));
  await editor.updateComplete;
  return editor.fired.at(-1);
}

export const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
