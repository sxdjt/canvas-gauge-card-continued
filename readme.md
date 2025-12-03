# Canvas Gauge Card - Continued

[![GitHub Release](https://img.shields.io/github/release/sxdjt/canvas-gauge-card-continued.svg?style=flat-square)](https://github.com/sxdjt/canvas-gauge-card-continued/releases)
[![License](https://img.shields.io/github/license/sxdjt/canvas-gauge-card-continued.svg?style=flat-square)](LICENSE)
[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg?style=flat-square)](https://github.com/hacs/integration)

> **Community-Maintained Continuation**
> This is a continuation of the original [canvas-gauge-card](https://github.com/custom-cards/canvas-gauge-card) by [@helto4real](https://github.com/helto4real) and the custom-cards team, which was deprecated in 2025.

---

## About This Continuation

The original canvas-gauge-card was officially deprecated with this message:
> "This card is basically deprecated and do not expect maintainence."

This **Continued** version exists to:
- **Maintain compatibility** with current and future Home Assistant versions
- **Fix bugs** inherited from the original project
- **Keep HACS distribution active** for the community
- **Accept community contributions** and improvements
- **Preserve the excellent work** of the original authors

**Migration from original:** If you're using the original `canvas-gauge-card`, migration is seamless - simply install this version via HACS and your existing configurations will continue to work.

---

## What is Canvas Gauge Card?

This card allows you to use the awesome gauges at https://canvas-gauges.com/ in your Home Assistant Lovelace UI. Display radial and linear gauges with extensive customization options for monitoring sensors, system metrics, and more.

**Tested on:** Chrome, Safari, Firefox, and Home Assistant Companion apps

## Screenshots

Here are some different screens showing the gauge capabilities. 

<a href="docs/screen_1.png" target="_blank"><img src="docs/screen_1.png"  width="254" height="204"/></a>
<a href="docs/screen_2.png" target="_blank"><img src="docs/screen_2.png"  width="250" height="244"/></a>

## Installation



[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=sxdjt&repository=canvas-gauge-card-continued)


Use the javascript names of properties from the examples at https://canvas-gauges.com/documentation/examples/. Click on an example that you like, check the JS version and copy the properties to the lovelace yaml file. Just remove the ',' after copy from site.

### Example 1, simple half gauge

<img src="docs/screen_sample2.png"  width="230" height="130"/>

**ui-lovelace.yaml:**

_Notice the differences in `card_height` and `gauge/height` to get correct half size for full circle, set both to same._

```yaml
- type: custom:canvas-gauge-card
  entity: sensor.processor_use
  card_height: 125
  gauge:
    type: "radial-gauge"
    title: Processor (%)
    width: 220
    height: 220
    borderShadowWidth: 0
    borderOuterWidth: 0
    borderMiddleWidth: 0
    borderInnerWidth: 0
    minValue: 0
    maxValue: 100
    startAngle: 30
    ticksAngle: 180
    valueBox: false
    majorTicks:
      ["0", "10", "20", "30", "40", "50", "60", "70", "80", "90", "100"]
    minorTicks: 2
    strokeTicks: true
    highlights: [{ "from": 80, "to": 100, "color": "rgba(200, 50, 50, .75)" }]
    borders: false
```

### Example 2, simple half gauge with shadow text

<img src="docs/screen_sample1.png"  width="242" height="165"/>

**ui-lovelace.yaml:**

```yaml
- type: custom:canvas-gauge-card
  entity: sensor.processor_use
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

### Example 3, simple full gauge with shadow text

<img src="docs/screen_sample3.png"  width="234" height="221"/>

**ui-lovelace.yaml:**

```yaml
- type: custom:canvas-gauge-card
  entity: sensor.processor_use
  name: Processor (%)
  card_height: 210
  shadow_height: 12%
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
    startAngle: 40
    ticksAngle: 280
    valueBox: false
    units: "%"
    majorTicks:
      ["0", "10", "20", "30", "40", "50", "60", "70", "80", "90", "100"]
    minorTicks: 2
    strokeTicks: true
    highlights: [{ "from": 80, "to": 100, "color": "rgba(200, 50, 50, .75)" }]
    borders: false
```

### Example 4, 4 gauges in a row in a horizontal-stack

<img src="docs/screen_sample4.png"  width="505" height="95"/>
This example shows gauges with or without text. This text are placed below the actual gauge this time.

**No text version**

```yaml
---
- type: horizontal-stack
  cards:
    - type: custom:canvas-gauge-card
      entity: sensor.load_1m
      card_height: 62
      background_color: "#FFF"
      gauge:
        type: "radial-gauge"
        borderShadowWidth: 0
        borderOuterWidth: 0
        borderMiddleWidth: 0
        borderInnerWidth: 0
        width: 110
        height: 110
        minValue: 0
        maxValue: 100
        startAngle: 90
        ticksAngle: 180
        valueBox: false
        majorTicks:
          ["0", "10", "20", "30", "40", "50", "60", "70", "80", "90", "100"]
        minorTicks: 2
        strokeTicks: true
        highlights:
          [{ "from": 80, "to": 100, "color": "rgba(200, 50, 50, .75)" }]
        colorPlate: "#ddd"
        borders: false
        needleType: "arrow"
        needleWidth: 2
        needleCircleSize: 7
        needleCircleOuter: true
        needleCircleInner: false
        animationDuration: 1500
        animationRule: "linear"
```

**With text version**

```yaml
---
- type: horizontal-stack
  cards:
    - type: custom:canvas-gauge-card
      entity: sensor.processor_use
      card_height: 62
      name: "Processor use"
      shadow_height: "25%"
      font_size: 0.9em
      shadow_bottom: "20"
      gauge:
        type: "radial-gauge"
        width: 110
        height: 110
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
        highlights:
          [{ "from": 80, "to": 100, "color": "rgba(200, 50, 50, .75)" }]
        colorPlate: "#ddd"
        borders: false
        needleType: "arrow"
        needleWidth: 2
        needleCircleSize: 7
        needleCircleOuter: true
        needleCircleInner: false
        animationDuration: 1500
        animationRule: "linear"
```

### Properties

Some of the properties that could be set. _italic_ is not mandatory.

| Property           | Description                                                                                                                        |
| :----------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| entity             | your sensor                                                                                                                        |
| name               | shows the name in shadow remove to hide it                                                                                         |
| type               | `"radial-gauge"` or `"linear-gauge"`                                                                                               |
| dropshadow         | true to show dropshadow, false to hide                                                                                             |
| width              | width of the gauge                                                                                                                 |
| height             | height of the gauge                                                                                                                |
| _background_color_ | sets gauge background color, transparent default if not set                                                                        |
| _card_height_      | the actual height of the card, set to smaller value than gauge height if using a half guage. Not use if using a full circle gauge. |
| _font_size_        | size of name, leave out it will be dynamic                                                                                         |
| _shadow_height_    | xx% of total height is shadow height                                                                                               |
| _shadow_bottom_    | how far below the gauge in pixels the shadow should apear                                                                          |

For a complete documentation of available properties, please see https://canvas-gauges.com/documentation/user-guide/configuration

## Contributing

Contributions are welcome! This is a community-maintained project.

- **Bug reports**: [Open an issue](https://github.com/sxdjt/canvas-gauge-card-continued/issues)
- **Feature requests**: [Open an issue](https://github.com/sxdjt/canvas-gauge-card-continued/issues)
- **Pull requests**: [Submit a PR](https://github.com/sxdjt/canvas-gauge-card-continued/pulls)

Please see [CLAUDE.md](CLAUDE.md) for development guidelines and contribution process.

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

---

**If you want to support the original developer and the canvas-gauges library, please visit their repositories and star them.**

