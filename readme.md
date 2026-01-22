# Canvas Gauge Card - Continued

![GitHub Release](https://img.shields.io/github/v/release/sxdjt/canvas-gauge-card-continued?style=for-the-badge)
[![AI Assisted](https://img.shields.io/badge/AI-Claude%20Code-AAAAAA.svg?style=for-the-badge)](https://claude.ai/code)
![GitHub License](https://img.shields.io/github/license/sxdjt/horizontal-waterfall-history-card?style=for-the-badge)

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

For a complete documentation of available properties, please see [Canvas Gauges](https://canvas-gauges.com/documentation/user-guide/configuration).

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


