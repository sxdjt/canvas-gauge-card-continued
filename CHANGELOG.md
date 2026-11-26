# Changelog - Canvas Gauge Card Continued

All notable changes to this continuation project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project uses calendar versioning (`YYYY.M.D`) from 2026.7.6 on. Earlier releases used Semantic Versioning.

---

## [Unreleased]

### Fixed
- Sections view: the card was a fixed 3 rows tall (about 184px), so a 220px gauge ran over the card below. The card is now as tall as the gauge.
- Masonry view: the card did not report its height, so Home Assistant counted every gauge as the smallest card and could stack several in one column. It now reports the gauge height, plus the name line.

### Security
- Updated development dependencies to resolve Dependabot and `npm audit` advisories. None of these packages are bundled into the card:
  - minimatch 10.2.5 -> 11.0.9 (via eslint and typescript-eslint): denial of service via globparts amplification (GHSA-g3hv-75wg-m249).

---

## [2026.11.16] - 2026-11-16

### Changed
- Promoted the visual editor and its fixes from beta to stable. No changes since
  2026.11.15-beta.2. See the three beta entries below for everything since 2026.7.6.

---

## [2026.11.15-beta.2] - 2026-11-15

### Fixed
- The gauge could only be opened with a mouse. It is now a keyboard button (Tab to reach,
  Enter or Space to open the entity's details) with a visible focus ring, and clicking the
  name on the shadow bar opens the details too.
- Screen readers got nothing from the gauge, since the value is only drawn on a canvas. The
  gauge button is now named with the card name, value and unit.
- The editor did not check highlight colors, so an invalid one was silently ignored. It now
  shows an error naming the highlight.
- The white name on the shadow bar was 3.9:1 against the default white gauge plate. The
  shadow is now slightly darker (`rgba(0, 0, 0, 0.6)`, was 0.5), giving 5.7:1.

---

## [2026.11.15-beta.1] - 2026-11-15

### Fixed
- Some gauge options had no effect: `borders: false` still drew the borders,
  `animationRule` and `animationDuration` were ignored (every gauge used the `cycle` rule
  for 500 ms), `tickSide`, `numberSide` and `needleSide` did not move a linear gauge's bar,
  and out-of-range `startAngle` and `ticksAngle` were not clamped. canvas-gauges applies
  these only when a gauge is created, and the card set them afterwards. The card now
  passes every option when it creates the gauge.

### Changed
- The built `canvas-gauge-card.js` no longer starts with tslib's license comment. tslib's
  0BSD license does not require it.

---

## [2026.11.14-beta.1] - 2026-11-14

### Added
- Visual editor covering every canvas-gauges 2.1.7 option that can be set in YAML, built on
  Home Assistant's own form (`ha-form`). Sections: Gauge, Scale, Highlights (an add, edit,
  reorder and remove list), Needle, Value box, Text (color, size, font, style and weight for
  the scale labels, value, units and title, plus the card name), Plate and borders, Bar,
  Animation, and Card layout. Radial-only and linear-only options appear only for that gauge
  type, and helper text gives each option's default. An invalid color shows an error naming
  the field above its section. Per-tick color lists stay YAML-only, and any option the editor
  does not show is kept when it saves. Editor labels are in English; Norwegian and Slovak fall
  back to English until translated.
- The card picker shows a live preview of the card, and the editor's help icon links to the
  documentation.
- `name_color` and `name_bold` options for the card name.

### Changed
- Updated `brace-expansion` 5.0.7 -> 5.0.9 in the lockfile, clearing GHSA-mh99-v99m-4gvg
  (CVE-2026-14257) and GHSA-rgw5-rvv9-x895 (CVE-2026-69152), both high-severity
  denial-of-service advisories. These were failing the `npm audit` prebuild gate and
  blocking `npm run build`. Dev-only and transitive via `eslint` -> `minimatch`;
  brace-expansion is not part of the shipped bundle.
- Updated `brace-expansion` 5.0.9 -> 5.0.12 in the lockfile, clearing GHSA-6j4f-fj2g-mc7p
  (CVE-2026-102276) and GHSA-qhr7-859c-m2p7 (CVE-2026-102278), both high-severity
  stack-exhaustion denial-of-service advisories, plus GHSA-q2hr-2g5m-vwhr (CVE-2026-102277,
  moderate, quadratic-time expansion). Dev-only; `dist/canvas-gauge-card.js` is unchanged.
- Updated `browserslist` 4.28.5 -> 4.28.9 in the lockfile, clearing GHSA-73wf-gq98-2v4g
  (CVE-2026-73088, high severity). A poisoned `browserslist-stats.json` anywhere in the
  directory tree could crash any `browserslist()` call with an uncaught `TypeError`.
  Dev-only and transitive via `@babel/core`; browserslist is not part of the shipped bundle
  and `dist/canvas-gauge-card.js` is unchanged.

### Fixed
- Adding the card from the card picker threw a `TypeError` because `getStubConfig()` returned
  an empty config with no `gauge` section. The stub now has a radial gauge and picks the first
  numeric sensor. A config without `gauge` now shows "Missing required gauge section".
- Gauge option changes (including switching between radial and linear) never reached an
  already-drawn gauge, so the YAML editor preview stayed stale until a page reload. The gauge is
  now rebuilt when the config changes.
- `shouldUpdate` checked a `config` property that is never set, so config changes only re-rendered
  on the next entity state change.
- A blank or unknown entity crashed the card. It now shows "No entity configured" or
  "Entity not found: <entity>".
- An unknown `gauge.type` (including one partly typed in the YAML editor) crashed the card. It now
  shows a warning naming the two valid types.
- Scale labels always read 0-100 when `majorTicks` was not set, whatever `minValue` and
  `maxValue` were (canvas-gauges does not derive them from the range). Without `majorTicks`, the
  card now spaces 6 labels evenly from minimum to maximum. Configs that set `majorTicks`, or use
  the 0-100 default range, look the same as before.
- Without `shadow_height`, the name was centered on the card's bottom edge, overlapping the
  bottom of the gauge, and was drawn in white, which was invisible on light themes. It now sits
  on its own line below the gauge in the theme's text color and size (`font_size` still
  overrides it). Configs with `shadow_height` keep the name on the shadow bar as before.
- A gradient color canvas-gauges could not parse (a typo, or `var(--token)`) threw an error and
  stopped the gauge from drawing. Invalid colors now fall back to the canvas-gauges default.
- The warning box's yellow background never applied (`background - color` typo), leaving black
  text on the theme background, which was unreadable on dark themes.

---

## [2026.7.6] - 2026-07-06

### Fixed
- Sections view sizing: added `getGridOptions()` and `height: 100%` so the card sizes correctly in Home Assistant's sections/grid layout.
- Removed the unsupported `version` field from `hacs.json` to satisfy the HACS schema.

### Changed
- Adopted CalVer versioning (`YYYY.M.D`); this release follows 1.1.0.
- Updated dependencies: lit 3.3.2 -> 3.3.3, rollup 4.60.1 -> 4.62.2, eslint 10.3.0 -> 10.6.0, typescript-eslint 8.59.3 -> 8.63.0, @babel/core 7.29.0 -> 7.29.7 (closes a low-severity, dev-only sourceMappingURL advisory), plus @rollup/plugin-babel and @rollup/plugin-commonjs patch bumps.
- Added an ESLint configuration and applied code cleanup (var declarations, unused vars, Boolean typing).

---

## [1.1.0] - 2026-04-06

### Changed
- Promoted Lit 3 migration from beta to stable release

---

## [1.1.0-beta.1] - 2026-03-31

### Changed
- Migrated from Lit 2.7.2 to Lit 3.3.2
  - Updated import paths: decorators (`customElement`, `property`, `query`) moved
    from `"lit-element"` to `"lit/decorators.js"` per Lit 3 module structure
  - Core imports (`LitElement`, `html`, `css`, `CSSResult`, `TemplateResult`,
    `PropertyValues`) moved from `"lit-element"` to `"lit"`
- Updated `home-assistant-js-websocket` from 8.0.1 to 9.6.0
- Updated build tooling:
  - `rollup` 2.79.2 -> 4.60.1 (two major versions)
  - `rollup-plugin-typescript2` 0.36.0 -> 0.37.0 (adds rollup v4 support)
  - `@rollup/plugin-babel` 6.x -> 7.x
  - `@babel/core` 7.21.4 -> 7.29.0
  - `@rollup/plugin-commonjs` -> 29.0.2
  - `typescript` 5.0.4 -> 6.0.2
- Updated `tsconfig.json`:
  - `moduleResolution` changed from deprecated `node` to `bundler`
  - Added explicit `rootDir: ./src` (required by TypeScript 6)
  - Added `skipLibCheck: true` and `noImplicitAny: false` to preserve
    original project's permissive TypeScript stance
- Updated GitHub Actions:
  - `actions/checkout` v4 -> v6
  - `actions/setup-node` v4 -> v6
  - Node.js CI version 18 -> 24

---

## [1.0.1] - 2026-03-20

### Changed
- Standardized console banner colors for consistent appearance
- Updated release workflow and marked resolved TODO items
- Renamed readme.md to README.md for standard casing
- Added HACS validation workflow for default repository submission
- Added auto-assign workflow for new issues
- Updated README with badges, project details, and examples
- Added MIT LICENSE file and updated hacs.json for HACS compliance
- Removed unnecessary files and directories

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

##### Security & Dependencies
- Fixed high severity XSS vulnerability (Rollup 2.79.1 → 2.79.2)
- Resolved deprecated dependency warnings (inflight, glob)
- Updated all npm dependencies to latest compatible versions

##### GitHub Actions Workflows
- Updated actions to latest versions (checkout@v4, setup-node@v4)
- Added Node.js 18 and npm caching for faster builds
- Fixed hardcoded paths in release workflow for correct repository
- Improved build reliability and security

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

- **Earlier versions** - See [original RELEASENOTES.md](https://github.com/custom-cards/canvas-gauge-card/blob/master/RELEASENOTES.md) for complete history

---

## Legend

- `Added` - New features
- `Changed` - Changes in existing functionality
- `Deprecated` - Soon-to-be removed features
- `Removed` - Removed features
- `Fixed` - Bug fixes
- `Security` - Security vulnerability fixes

---

**Note**: This changelog documents changes made to the "Continued" version. The original project's release notes are in the original repository's [RELEASENOTES.md](https://github.com/custom-cards/canvas-gauge-card/blob/master/RELEASENOTES.md).
