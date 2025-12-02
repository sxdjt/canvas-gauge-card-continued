# Changelog - Canvas Gauge Card Continued

All notable changes to this continuation project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) with a `-continued` suffix.

---

## [1.0.0-continued] - 2025-12-01

### Project Continuation

This marks the first release of the **Canvas Gauge Card - Continued**, a community-maintained continuation of the original [canvas-gauge-card](https://github.com/custom-cards/canvas-gauge-card) project.

#### Why This Continuation Exists

The original canvas-gauge-card was officially deprecated in July 2025 by the original authors with this message:
> "This card is basically deprecated and do not expect maintainence."

This continuation was created to:
- Maintain compatibility with current and future Home Assistant versions
- Fix long-standing bugs inherited from the original project
- Keep HACS distribution active for the community
- Accept community contributions and improvements
- Preserve the excellent work of the original authors

#### Changes from Original v0.91

**No functional changes** - This release is functionally identical to the original v0.91 release. The primary changes are:

##### Repository & Distribution
- Forked from [custom-cards/canvas-gauge-card](https://github.com/custom-cards/canvas-gauge-card)
- Renamed to `canvas-gauge-card-continued` for clarity
- Updated package.json metadata (name, version, repository URLs)
- Updated HACS configuration to show "Canvas Gauge Card - Continued"
- Preserved complete git history from original project

##### Documentation
- Updated README.md with continuation notice and attribution
- Added comprehensive CLAUDE.md for developer guidance
- Created this CHANGELOG.md to track future changes
- Updated all repository references and links

##### Version Numbering
- Adopted `MAJOR.MINOR.PATCH-continued` format
- Starting at v1.0.0-continued (reset from original v0.91)
- Signals fresh start while maintaining respect for original work

#### Migration from Original

**Seamless migration** - If you're currently using the original `canvas-gauge-card`:

1. Uninstall the original card via HACS (or remove manual installation)
2. Install `canvas-gauge-card-continued` via HACS custom repository
3. **No configuration changes needed** - all existing YAML configs work as-is

The card still registers as `custom:canvas-gauge-card` in Lovelace, ensuring backward compatibility.

#### Attribution

This continuation is built upon the excellent work of:
- **Original Author**: [@helto4real](https://github.com/helto4real) (Tomas Hellström)
- **Original Repository**: https://github.com/custom-cards/canvas-gauge-card
- **Original License**: MIT (maintained in this continuation)
- **All original contributors** who made the original project great

Thank you to the original team for creating such a useful card!

#### Technical Details

**Inherited Stack** (unchanged from v0.91):
- TypeScript 5.0.4
- Lit 2.7.2 (web components framework)
- canvas-gauges 2.1.7 (gauge rendering library)
- Rollup 2.79.1 (build system)
- Home Assistant websocket 8.0.1

**Build Process** (unchanged):
- `npm install` - Install dependencies
- `npm run build` - Production build
- `npm run build-debug` - Development build with source maps

#### Known Issues

The following issues were inherited from the original project and will be addressed in future releases based on community priority:

**Priority 1 - Breaking Issues:**
- [#68](https://github.com/custom-cards/canvas-gauge-card/issues/68) - Negative minvalue not handled correctly
- [#35](https://github.com/custom-cards/canvas-gauge-card/issues/35) - Width configuration causes gauge to disappear

**Priority 2 - UX Issues:**
- [#39](https://github.com/custom-cards/canvas-gauge-card/issues/39) - Scaling issues across different display sizes
- [#65](https://github.com/custom-cards/canvas-gauge-card/issues/65) - Number positioning problems in radial gauges

**Priority 3 - Feature Requests:**
- [#59](https://github.com/custom-cards/canvas-gauge-card/issues/59) - Mobile app (HA Companion) refresh issues
- [#60](https://github.com/custom-cards/canvas-gauge-card/issues/60) - Template support for value-text formatting
- [#69](https://github.com/custom-cards/canvas-gauge-card/issues/69) - Stacked cards support
- [#9](https://github.com/custom-cards/canvas-gauge-card/issues/9) - Right-facing half radial gauge support

Community feedback will determine which issues are addressed first.

#### What's Next

Future releases will focus on:
1. **Bug fixes** for inherited issues (Priority 1 first)
2. **Home Assistant compatibility** updates as needed
3. **Dependency updates** for security and compatibility
4. **Community contributions** review and integration

Feature additions will be considered carefully to avoid scope creep and maintain the card's simplicity and reliability.

---

## Original Project Release History

For reference, the original project's release history:

- **v0.91** (October 7, 2023) - Last official release
  - CSS fixes and shadow fix (#58)
  - Various maintenance updates (#57)
  - Localization updates (Slovak, #61)

- **Earlier versions** - See [original RELEASENOTES.md](RELEASENOTES.md) for complete history

---

## Legend

- `Added` - New features
- `Changed` - Changes in existing functionality
- `Deprecated` - Soon-to-be removed features
- `Removed` - Removed features
- `Fixed` - Bug fixes
- `Security` - Security vulnerability fixes

---

**Note**: This changelog documents changes made to the "Continued" version. The original project's release notes are preserved in [RELEASENOTES.md](RELEASENOTES.md).
