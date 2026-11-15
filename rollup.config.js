import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";

// tslib's __decorate helper is inlined into the bundle along with its
// Microsoft 0BSD license header. 0BSD does not require keeping the notice,
// so drop it. The block is replaced with the same number of newlines so line
// positions (and source maps from build-debug) stay correct.
const TSLIB_HEADER =
  /\/\*{10,}\r?\nCopyright \(c\) Microsoft Corporation\.[\s\S]*?\*{10,} \*\/\r?\n(?:\/\* global [^*]*\*\/\r?\n)?/;

const stripTslibHeader = () => ({
  name: "strip-tslib-header",
  transform(code) {
    if (!TSLIB_HEADER.test(code)) return null;
    return {
      code: code.replace(TSLIB_HEADER, (block) => "\n".repeat(block.split("\n").length - 1)),
      map: null,
    };
  },
});

export default [
  {
    input: "src/canvas-gauge-card.ts",
    output: {
      dir: "dist",
      format: "es",
    },

    plugins: [nodeResolve({}), commonjs(), typescript(), stripTslibHeader(), json(), babel({
      babelHelpers: 'bundled',
      exclude: "node_modules/**",
    })],
  },
];