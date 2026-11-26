# Canvas Gauge Card - Continued

![GitHub Release](https://img.shields.io/github/v/release/sxdjt/canvas-gauge-card-continued?style=for-the-badge)
[![AI Assisted](https://img.shields.io/badge/AI-Claude%20Code-AAAAAA.svg?style=for-the-badge)](https://claude.ai/code)
![GitHub License](https://img.shields.io/github/license/sxdjt/canvas-gauge-card-continued?style=for-the-badge)

---

## About This Continuation

This is a continuation of the original [canvas-gauge-card](https://github.com/custom-cards/canvas-gauge-card) by [@helto4real](https://github.com/helto4real) and the custom-cards team, which has been deprecated.

This **Continued** version exists to:

- **Maintain compatibility** with current and future Home Assistant versions
- **Fix bugs** inherited from the original project
- **Keep HACS distribution active** for the community
- **Accept community contributions** and improvements
- **Preserve the excellent work** of the original authors

**Migration from original:** If you're using the original `canvas-gauge-card`, migration is seamless - simply install this version and your existing configurations will continue to work.

---

## What is Canvas Gauge Card?

This card allows you to use the awesome gauges at [https://canvas-gauges.com/](https://canvas-gauges.com/documentation/user-guide/configuration) in your Home Assistant Lovelace UI. Display radial and linear gauges with extensive customization options for monitoring sensors, system metrics, and more.

## Installation

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=sxdjt&repository=canvas-gauge-card-continued)

### Examples

See [Canvas Gauges](https://canvas-gauges.com/) for more examples and configurations.  

#### Simple Gauge

<img width="540" height="308" alt="Example1" src="https://github.com/user-attachments/assets/17362aea-5522-457a-945f-1e477c86c45c" />

```yaml
type: custom:canvas-gauge-card
entity: sensor.cpu_utilization
name: Processor (%)
card_height: 145
shadow_height: 15%
font_size: 1em
gauge:
    type: "radial-gauge"
    width: 220
    height: 220
    borderShadowWidth: 0
    borderOuterWidth: 0
    borderMiddleWidth: 0
    borderInnerWidth: 0
    minValue: 0
    maxValue: 100
    startAngle: 90
    ticksAngle: 180
    valueBox: false
    majorTicks:
      ["0", "10", "20", "30", "40", "50", "60", "70", "80", "90", "100"]
    minorTicks: 2
    strokeTicks: true
    highlights: [{ "from": 80, "to": 100, "color": "rgba(200, 50, 50, .75)" }]
    borders: false
```

### Configuration

Card options sit at the top level of the card's YAML:

| Property           | Default                  | Description                                                                                                                         |
| :----------------- | :----------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `entity`           | required                 | your sensor                                                                                                                         |
| `gauge`            | required                 | the canvas-gauges options (see below)                                                                                               |
| `name`             | none                     | name shown over the shadow bar, or on its own line below the gauge when there is no shadow bar. Leave it out to show no name        |
| `dropshadow`       | `false`                  | `true` to show a drop shadow around the card                                                                                        |
| `background_color` | transparent              | card background color                                                                                                               |
| `card_width`       | `gauge.width`            | width of the card in pixels                                                                                                         |
| `card_height`      | `gauge.height`           | height of the card in pixels. Set it smaller than the gauge height for a half gauge; leave it out for a full circle gauge          |
| `font_size`        | see description          | size of the name. Default: the gauge height / 22 on the shadow bar, the theme's text size below the gauge                           |
| `name_color`       | theme text color         | color of the name (hex, color name, or `var(--token)`). White on the shadow bar                                                     |
| `name_bold`        | `false`                  | `true` to show the name in bold                                                                                                     |
| `shadow_height`    | `0%` (no bar)            | height of the shadow bar, as a percentage of the card height                                                                        |
| `shadow_bottom`    | `0`                      | extra space in pixels below the gauge, inside the card                                                                              |
| `card_top`         | `0`                      | YAML only: moves the gauge down inside the card (a CSS length, e.g. `-20px`)                                                        |
| `card_left`        | `0`                      | YAML only: moves the gauge right inside the card (a CSS length)                                                                     |

The gauge itself is configured under `gauge:`, with the canvas-gauges option names. These are the
ones the card needs:

| Property                   | Description                                                   |
| :------------------------- | ------------------------------------------------------------- |
| `type`                     | required: `"radial-gauge"` or `"linear-gauge"`                |
| `width`, `height`          | size of the gauge in pixels                                   |
| `minValue`, `maxValue`     | scale range; canvas-gauges defaults to 0 and 100              |
| `units`                    | unit drawn on the gauge; also read out by screen readers      |

For a complete documentation of available properties, please see [Canvas Gauges](https://canvas-gauges.com/documentation/user-guide/configuration).

If `majorTicks` is not set, the card spaces 6 scale labels evenly from `minValue` to `maxValue`.

### Visual editor

Add the card from the card picker, or edit an existing one, to configure it without YAML. The editor has every canvas-gauges option, grouped into Gauge, Scale, Highlights, Needle, Value box, Text, Plate and borders, Bar, Animation, and Card layout sections. Options that apply to only one gauge type are shown only for that type, and each field's helper text gives its default. Per-tick color lists (an array for `colorMajorTicks` or `colorNumbers`) can only be set in YAML; the editor keeps them when you save. The Highlights list editor needs Home Assistant 2025.7 or later; older releases show highlights as a YAML box instead.

Colors inside the gauge are drawn on a canvas, so they must be a hex code, `rgb()`/`rgba()`, or a color name. Theme variables like `var(--primary-color)` only work for `background_color` and `name_color`.

## Contributing

Contributions are welcome! This is a community-maintained project.

- **Bug reports**: [Open an issue](https://github.com/sxdjt/canvas-gauge-card-continued/issues)
- **Feature requests**: [Open an issue](https://github.com/sxdjt/canvas-gauge-card-continued/issues)
- **Pull requests**: [Submit a PR](https://github.com/sxdjt/canvas-gauge-card-continued/pulls)

---

## Credits & Attribution

### Original Project
- **Original Author**: [@helto4real](https://github.com/helto4real) (Tomas Hellström)
- **Original Repository**: [custom-cards/canvas-gauge-card](https://github.com/custom-cards/canvas-gauge-card)
- **Original Contributors**: All contributors to the original project
- **License**: MIT (maintained)

### Continuation Maintainer
- **Repository**: [sxdjt/canvas-gauge-card-continued](https://github.com/sxdjt/canvas-gauge-card-continued)

### Dependencies
- **Canvas Gauges Library**: [Mikhus/canvas-gauges](https://github.com/Mikhus/canvas-gauges) by Mikhus
- **Lit Framework**: [lit.dev](https://lit.dev/)
- **Home Assistant**: [home-assistant.io](https://www.home-assistant.io/)

### Related Repositories
- [helto4real's original custom cards collection](https://github.com/helto4real/lovelace-custom-cards)
- [helto4real's Home Assistant configuration](https://github.com/helto4real/hassio)


