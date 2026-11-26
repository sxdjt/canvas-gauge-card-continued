# Tests

Run with `npm test`. It builds the card with inline source maps into `.test-build/` (git-ignored; the release build in `dist/` is untouched), then runs every `*.test.mjs` file here with Node's built-in test runner, the same runner as the other cards in this monorepo. `jsdom` is a dev dependency only; nothing here ships with the card.

`npm test` runs under `scripts/run-capped.sh`, which kills the run past 1 GB of memory or 60 seconds (`MAX_RSS_MB`, `MAX_SECONDS` to override). IMPORTANT: never pass a DOM node to `assert`; a failing assertion inspects the node and can walk the whole jsdom window. Assert on strings, numbers and booleans.

## How it works

`helpers/env.mjs` sets up a jsdom window, the globals Lit needs, a `CSS.supports` for colors, and a 2D canvas context stand-in that records calls (`canvasCalls`), so canvas-gauges runs for real. Then it imports the built bundle, the same code HA loads.

- `makeCard(config, hass)`: a card set up in HA's order (setConfig, hass, connected), after its first render; `card.events` records `hass-more-info`.
- `makeEditor(config, hass)`, `form(editor)`, `formChange(editor, value)`: the editor and its `ha-form`; `editor.fired` records `config-changed`.
- `makeHass(states)`, `sensor(state, attributes)`, `RADIAL`: fixtures.

## Coverage

```bash
npm run coverage
```

Prints function and branch coverage of `src/` (`scripts/coverage-summary.mjs` reads the lcov report; Node's include filter runs before source maps, so it cannot pick `src/` out of the bundle) and lists every uncovered function and branch line. Line percentages are indicative only: through TypeScript, babel and rollup, comments and imports map as uncovered lines.

Every function and branch in `src/` is covered (card 17 functions / 145 branches, editor 26 / 109, localize 6 branches). Keep it at 100%: a change that adds a function or branch should add the test that covers it.

## Known issues

Record a known bug as a test with the `todo` option, describing the intended behavior. It runs and reports as `todo` without failing the suite. When a fix lands, remove the `todo` option. A `todo` test reports the same whether it passes or fails; check with `--test-reporter=tap` that each one is `not ok`.

Sweep findings live in `hunt.test.mjs`. There are no open `todo` tests.

## Files

| File | Covers |
|------|--------|
| `card.test.mjs` | Card picker, stub config, setConfig, README example, change detection, color fallback, default ticks, gauge types, rebuild vs move, warnings, layout and name, aria label, click and keyboard, languages |
| `editor.test.mjs` | Form data, radial/linear schemas, labels and helpers, color errors, value-changed (sections, defaults, text keys, cleared fields) |
| `hunt.test.mjs` | Sweep findings C1-C4 |
