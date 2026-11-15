/*!
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 Tomas Hellström (@helto4real) (https://github.com/custom-cards/canvas-gauge-card)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * `canvas-gauge-card`
 * Lovelace element for displaying the canvas gauges at
 * https://canvas-gauges.com/
 *
 * If you like the gauges please support the original gauge devs.
 *
 * Usage:
 *  - see https://github.com/custom-cards/canvas-gauge-card
 */

import { LitElement, html, css, CSSResult, TemplateResult, PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";

import Gauge from "canvas-gauges";

import { HomeAssistant, CanvasGuageCardConfig } from "./types.js";
import { CARD_VERSION } from "./const.js";
import { localize } from "./localize/localize.js";
import "./editor.js";

// Check if config or Entity changed
export function hasConfigOrEntityChanged(
  element: any,
  changedProps: PropertyValues,
  forceUpdate: boolean,
): boolean {
  if (changedProps.has('_config') || forceUpdate) {
    return true;
  }

  if (element.config!.entity) {
    const oldHass = changedProps.get('hass') as HomeAssistant | undefined;
    if (oldHass) {
      return (
        oldHass.states[element.config!.entity]
        !== element.hass!.states[element.config!.entity]
      );
    }
    return true;
  } else {
    return false;
  }
}

/* eslint no-console: 0 */
console.info(
  `%c  CANVAS-GAUGE-CARD \n%c  ${localize(
    "common.version"
  )} ${CARD_VERSION}    `,
  "color: black; background: #F2720C; font-weight: 600;",
  "color: black; background: #00a5c9; font-weight: 600;"
);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "canvas-gauge-card",
  name: "Canvas Gauge Card - Continued",
  description: "Community-maintained canvas gauge card from http://canvas-gauges.com/",
  preview: true,
  documentationURL: "https://github.com/sxdjt/canvas-gauge-card-continued",
});

// canvas-gauges throws on a gradient color it cannot parse (e.g. "#1a" part-typed in the
// editor) and a canvas cannot draw var(--token), so such colors fall back to the library
// default. Empty strings ("no gradient") and per-tick color arrays pass through
function isDrawableColor(value: unknown): boolean {
  if (typeof value !== "string" || value === "") {
    return true;
  }
  return CSS.supports("color", value) && !value.includes("var(");
}

// canvas-gauges labels the scale 0-100 whatever minValue and maxValue are, so configs
// without their own majorTicks get 6 labels spread over the real range
function defaultMajorTicks(min: number, max: number): number[] | undefined {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    return undefined;
  }
  return Array.from({ length: 6 }, (_, i) => Number((min + ((max - min) * i) / 5).toFixed(2)));
}

@customElement("canvas-gauge-card")
export class CanvasGaugeCard extends LitElement {
  public static getConfigElement(): HTMLElement {
    return document.createElement("canvas-gauge-card-editor");
  }

  // Used by the card picker. setConfig needs a gauge section, so an empty stub would throw
  public static getStubConfig(hass?: HomeAssistant): object {
    const entity = Object.keys(hass?.states ?? {}).find(
      (id) => id.startsWith("sensor.") && !isNaN(parseFloat(hass!.states[id].state))
    );
    return {
      ...(entity ? { entity } : {}),
      gauge: {
        type: "radial-gauge",
        width: 220,
        height: 220,
        minValue: 0,
        maxValue: 100,
      },
    };
  }

  @property() public hass?: HomeAssistant;
  @property() private _config?: CanvasGuageCardConfig;

  private _gaugeWidth?: string;
  private _gaugeHeight?: string;
  private _shadowHeight?: string;
  private _fontSize?: string;
  private _useDropshadow?: boolean;

  private _gauge?: any;
  private _gaugeCanvas?: HTMLCanvasElement;
  private _state?: string;
  private config?: any;

  @query("#canvaselement") private _canvasElement?: any;

  public setConfig(config: CanvasGuageCardConfig): void {
    if (!config || config.show_error) {
      throw new Error(localize("common.invalid_configuration"));
    }
    if (!config.gauge) {
      throw new Error(localize("common.missing_gauge"));
    }
    // Have no ide why I need to do this or the thing bugs in .. but I do
    this.config = config;

    this._config = {
      gauge: config.gauge,
      ...config,
    };

    this._gaugeWidth = config.card_width
      ? config.card_width
      : config.gauge["width"];

    this._gaugeHeight = config.card_height
      ? config.card_height
      : config.gauge["height"];

    this._shadowHeight = config.shadow_height ? config.shadow_height : "0%";
    this._useDropshadow = config.dropshadow ? config.dropshadow : false;

    this._fontSize = config.font_size
      ? config.font_size
      : `calc(${config.gauge["height"]}px/22)`;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  // Here we need to refresh the actual gauge after it has rendered
  protected updated(changedProps: PropertyValues) {
    // No canvas while a warning is shown in place of the gauge
    if (!this._canvasElement) {
      this._destroyGauge();
      return;
    }
    // Rebuild on config change or when render replaced the canvas, so gauge
    // option edits show without a page reload
    if (changedProps.has("_config") || this._gaugeCanvas !== this._canvasElement) {
      this._destroyGauge();
    }
    if (this._gauge == null) {
      let gauge;
      if (this._config?.gauge.type == "linear-gauge") {
        gauge = new Gauge.LinearGauge({
          renderTo: this._canvasElement,
          height: this._config.gauge["height"],
          width: this._config.gauge["width"],
          value: 0,
        });
      } else if (this._config?.gauge.type == "radial-gauge") {
        gauge = new Gauge.RadialGauge({
          renderTo: this._canvasElement,
          height: this._config.gauge["height"],
          width: this._config.gauge["width"],
          value: 0,
        });
      }

      for (const key in this._config?.gauge) {
        if (Object.prototype.hasOwnProperty.call(this._config?.gauge, key)) {
          const value = this._config.gauge[key];
          if (key.startsWith("color") && !isDrawableColor(value)) {
            continue;
          }
          gauge.options[key] = value;
        }
      }
      if (this._config?.gauge.majorTicks === undefined) {
        const ticks = defaultMajorTicks(Number(gauge.options.minValue), Number(gauge.options.maxValue));
        if (ticks) {
          gauge.options.majorTicks = ticks;
        }
      }
      this._gauge = gauge;
      this._gaugeCanvas = this._canvasElement;
    }
    const entityId = this._config?.entity;
    this._state = this.hass?.states[entityId!]?.state;
    this._gauge["value"] = this._state;
    this._gauge.draw(); // Have to call to redraw canvas
  }

  private _destroyGauge(): void {
    this._gauge?.destroy();
    this._gauge = undefined;
    this._gaugeCanvas = undefined;
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.hass) {
      return html``;
    }

    // Check for stateObj or other necessary things and render a warning if missing
    // if provided in the future, this is a good spot doing just that :)
    if (this._config.show_warning) {
      return html`
        <ha-card>
          <div class="warning">${localize("common.show_warning")}</div>
        </ha-card>
      `;
    }

    // Blank or unknown entity (e.g. mid-edit in the card editor) shows a warning instead of crashing
    const entityId = this._config.entity;
    if (!entityId || !this.hass.states[entityId]) {
      return html`
        <ha-card>
          <div class="warning">
            ${entityId
          ? localize("common.entity_not_found", "{entity}", entityId)
          : localize("common.no_entity")}
          </div>
        </ha-card>
      `;
    }

    // Unknown gauge type (e.g. partly typed in the YAML editor) would leave updated() with no gauge
    const gaugeType = this._config.gauge.type;
    if (gaugeType != "radial-gauge" && gaugeType != "linear-gauge") {
      return html`
        <ha-card>
          <div class="warning">
            ${localize("common.invalid_gauge_type")}${gaugeType ? `: ${gaugeType}` : ""}
          </div>
        </ha-card>
      `;
    }
    // With a shadow bar the name is drawn over it, in white. Without one, centering the name on a
    // zero-height bar put it across the bottom of the gauge, and white text vanished on light
    // themes, so it goes on its own line below the gauge in the theme text color and size
    const shadowBar = this._shadowHeight !== "0%";
    const nameStyle = `${this._config.name_color ? `color: ${this._config.name_color};` : ""}`
      + `${this._config.name_bold ? "font-weight: bold;" : ""}`;

    return html`
      <style>
        :host {
          ${this._useDropshadow ?
        `          box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
            0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);`
        : ` `}
          display: block !important;
          height: 100%;
          border-radius: 2px !important;
          transition: all 0.3s ease-out !important;
          background-color: ${this._config.background_color
        ? this._config.background_color
        : "transparent"} !important;
        }
        .cardroot {
          width: ${this._gaugeWidth}px;
          height: calc(
            ${this._gaugeHeight}px +
              ${this._config.shadow_bottom ? this._config.shadow_bottom : 0}px
          );
          position: relative;
          margin: auto;
        }
        .container {
          width: ${this._gaugeWidth}px;
          height: ${this._gaugeHeight}px;
          position: relative;
          top: 0px;
          overflow: hidden;
          text-align: center;
        }
        .innercontainer {
          position: relative;
          top: ${this._config.card_top ? this._config.card_top : 0};
          left: ${this._config.card_left ? this._config.card_left : 0};
        }
        .shadow {
          visible: ${this._shadowHeight == "0%" ? `none` : `block`};
          width: 100%;
          height: ${this._shadowHeight};
          left: 0px;
          bottom: 0px;
          background: rgba(0, 0, 0, 0.5);
          position: absolute;
        }
        .state {
          position: relative;
          float: left;
          top: 50%;
          left: 50%;
          color: white;
          font-size: 100%;
          transform: translate(-50%, -50%);
        }
        .name {
          width: ${this._gaugeWidth}px;
          margin: 0 auto;
          text-align: center;
          color: var(--primary-text-color);
        }
      </style>
      <div class="cardroot">
        <div
          class="container"
          width=${this._gaugeWidth}
          height=${this._gaugeHeight}
        >
          <div
            class="innercontainer"
            width=${this._gaugeWidth}
            height=${this._gaugeHeight}
            @click=${this.clickHandler}
          >
            <canvas id="canvaselement"> </canvas>
          </div>
        </div>
        ${shadowBar
          ? html`
            <div class="shadow">
              <div class="state" style="font-size: ${this._fontSize}; ${nameStyle}">
                ${this._config.name}
              </div>
            </div>
          `
          : ""}
      </div>
      ${!shadowBar && this._config.name
        ? html`<div class="name" style="font-size: ${this._config.font_size ?? "var(--ha-font-size-m, 14px)"}; ${nameStyle}">${this._config.name}</div>`
        : ""}
    `;
  }

  static get styles(): CSSResult {
    return css`
    .warning {
  display: block;
  color: black;
  background-color: #fce588;
  padding: 8px;
}
`;
  }
  clickHandler() {
    this._fire("hass-more-info", { entityId: this._config?.entity });
  }

  /**
   * Fires the event that opens the enity info
   */
  _fire(type, detail) {
    const event = new Event(type, {
      bubbles: true,
      cancelable: false,
      composed: true,
    }) as any;

    event.detail = detail || {};
    this.shadowRoot?.dispatchEvent(event);
    return event;
  }

  // Sections view (grid layout) sizing - 12-column grid system
  getGridOptions() {
    return {
      rows: 3,
      columns: 6,
      min_rows: 2,
      min_columns: 3,
    };
  }
}
