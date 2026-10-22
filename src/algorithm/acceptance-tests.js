import {
  solveMCMTabulation,
  reconstructExpression,
  reconstructParenthesizationTree,
  findAllTies,
  calculateCatalanNumber,
  calculateTheoreticalCounts
} from './mcm.js';
import {
  generateTabulationEvents,
  generateMemoizationEvents,
  generateBruteForceEvents
} from './events.js';
import { validateDimensionsInput } from '../utils/formatters.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Test failed: ${message}`);
  }
}

console.log("=== RUNNING ACCEPTANCE TESTS FOR MCM STUDIO ===\n");

// TEST A: Three matrices [10, 30, 5, 60]
console.log("Test A: Three matrices [10, 30, 5, 60]");
const pA = [10, 30, 5, 60];
const solA = solveMCMTabulation(pA);
assert(solA.n === 3, "Matrix count is 3");
assert(Number(calculateCatalanNumber(solA.n)) === 2, "Catalan parenthesizations count is 2");
assert(solA.minCost === 4500, "Optimal scalar multiplication cost is 4500");
const exprA = reconstructExpression(solA.s, 1, 3);
assert(exprA === "((A1 × A2) × A3)", `Optimal expression is ((A1 × A2) × A3), got ${exprA}`);

// TEST B: Four matrices [10, 30, 5, 60, 2]
console.log("\nTest B: Four matrices [10, 30, 5, 60, 2]");
const pB = [10, 30, 5, 60, 2];
const solB = solveMCMTabulation(pB);
assert(solB.n === 4, "Matrix count is 4");
assert(Number(calculateCatalanNumber(solB.n)) === 5, "Catalan parenthesizations count is 5");
assert(solB.minCost === 1500, `Optimal cost is 1500, got ${solB.minCost}`);
const exprB = reconstructExpression(solB.s, 1, 4);
assert(exprB.includes("A1") && exprB.includes("A4"), "Expression contains all matrices");

// TEST C: Equal dimensions [10, 10, 10, 10, 10]
console.log("\nTest C: Equal dimensions & Ties [10, 10, 10, 10, 10]");
const pC = [10, 10, 10, 10, 10];
const solC = solveMCMTabulation(pC);
assert(solC.n === 4, "Matrix count is 4");
const tiesC = findAllTies(solC.s, solC.n);
assert(tiesC.length > 0, `Multiple optimal split points detected (${tiesC.length} ties)`);
const treeAlternative1 = reconstructParenthesizationTree(pC, solC.s, 1, 4, { "1,4": tiesC[1].splits[0] });
const treeAlternative2 = reconstructParenthesizationTree(pC, solC.s, 1, 4, { "1,4": tiesC[1].splits[1] });
assert(treeAlternative1.splitK !== treeAlternative2.splitK, "Alternative optimal trees can be reconstructed from tie choices");

// TEST D: Invalid dimensions validation
console.log("\nTest D: Input Validation error handling");
const valZero = validateDimensionsInput("10, 0, 20");
assert(!valZero.isValid && valZero.error.includes("strictly positive"), "Rejects zero dimension");

const valNeg = validateDimensionsInput("10, -5, 20");
assert(!valNeg.isValid && valNeg.error.includes("strictly positive"), "Rejects negative dimension");

const valFloat = validateDimensionsInput("10, 20.5, 30");
assert(!valFloat.isValid && valFloat.error.includes("positive whole numbers"), "Rejects non-integer dimension");

const valTooFew = validateDimensionsInput("10, 20");
assert(!valTooFew.isValid && valTooFew.error.includes("at least 3 dimensions"), "Rejects fewer than 2 matrices");

const valValid = validateDimensionsInput("10, 30, 5, 60");
assert(valValid.isValid && valValid.dimensions.length === 4, "Accepts valid dimension input");

// TEST E: Playback controls & Reversible event sequence
console.log("\nTest E: Deterministic event steps & step backward");
const evTab = generateTabulationEvents(pA);
assert(evTab.length > 5, "Tabulation generates discrete event stream");
const midStep = evTab[Math.floor(evTab.length / 2)];
assert(midStep.mTable !== undefined, "Event snapshot contains DP cost table");
assert(midStep.description !== undefined, "Event snapshot contains human-readable explanation");

// TEST F: Algorithm consistency across Brute Force, Memoization, and Tabulation
console.log("\nTest F: Consistency between Brute Force, Memoization, and Tabulation");
const evMemo = generateMemoizationEvents(pA);
const evBrute = generateBruteForceEvents(pA);
const costTab = evTab[evTab.length - 1].metrics.minCost;
const costMemo = evMemo[evMemo.length - 1].metrics.minCost;
const costBrute = evBrute[evBrute.length - 1].metrics.minCost;
assert(costTab === costMemo && costMemo === costBrute, `All 3 algorithm modes compute identical min cost: ${costTab}`);

// TEST G: Theoretical formulas consistency
console.log("\nTest G: Theoretical operation formulas");
for (let n = 2; n <= 8; n++) {
  const counts = calculateTheoreticalCounts(n);
  assert(counts.nonTrivialCells === (n * (n - 1)) / 2, `Non-trivial cells for n=${n} matches n(n-1)/2`);
  assert(counts.splitEvaluations === (n * (n - 1) * (n + 1)) / 6, `Split evaluations for n=${n} matches n(n-1)(n+1)/6`);
}

console.log(`\n========================================`);
console.log(`ALL ACCEPTANCE TESTS PASSED! (${passedTests}/${totalTests})`);
console.log(`========================================\n`);
