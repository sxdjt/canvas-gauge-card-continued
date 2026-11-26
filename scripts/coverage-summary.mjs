// Prints function and branch coverage (and an indicative line %) for this card's own src/ files from an lcov
// report, then every uncovered function and branch. Node's --test-coverage-include runs
// before source maps are applied, so it cannot pick src/ out of the bundle; this can.
// Usage: node scripts/coverage-summary.mjs <lcov file>
import { readFileSync } from "node:fs";
import { relative } from "node:path";

const records = readFileSync(process.argv[2], "utf8").split("end_of_record");
let gaps = 0;
for (const record of records) {
  const file = /^SF:(.*)$/m.exec(record)?.[1];
  if (!file || !/(^|\/)src\//.test(file) || file.includes("node_modules")) continue;
  const lines = record.split("\n");
  const fn = lines.filter((l) => l.startsWith("FN:"));
  const fnda = lines.filter((l) => l.startsWith("FNDA:"));
  const brda = lines.filter((l) => l.startsWith("BRDA:"));
  const da = lines.filter((l) => l.startsWith("DA:"));
  // FN and FNDA pair by position, not by name (names repeat)
  const missedFn = fn.filter((_, i) => fnda[i]?.split(":")[1].split(",")[0] === "0")
    .map((l) => { const [line, name] = l.slice(3).split(","); return `${name}@${line}`; });
  const missedBr = [...new Set(brda.filter((l) => /,(0|-)$/.test(l)).map((l) => l.slice(5).split(",")[0]))];
  const missedDa = da.filter((l) => l.endsWith(",0")).map((l) => l.slice(3).split(",")[0]);
  const pct = (hit, all) => (all === 0 ? 100 : (100 * hit / all)).toFixed(2);
  console.log(`${relative(process.cwd(), file)}: lines ${pct(da.length - missedDa.length, da.length)}%, ` +
    `functions ${fn.length - missedFn.length}/${fn.length}, ` +
    `branches ${brda.length - brda.filter((l) => /,(0|-)$/.test(l)).length}/${brda.length}`);
  if (missedFn.length) console.log(`  functions: ${missedFn.join(" ")}`);
  if (missedBr.length) console.log(`  branch lines: ${missedBr.join(" ")}`);
  // Lines are not a target: through TS, babel and rollup source maps, comments and
  // imports show as uncovered lines. Functions and branches map reliably.
  gaps += missedFn.length + missedBr.length;
}
process.exitCode = gaps ? 1 : 0;
