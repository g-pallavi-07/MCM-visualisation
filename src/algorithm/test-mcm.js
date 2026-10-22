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

console.log("--- TEST A: [10, 30, 5, 60] ---");
const pA = [10, 30, 5, 60];
const resA = solveMCMTabulation(pA);
console.log("Min Cost:", resA.minCost, "Expected: 4500");
const exprA = reconstructExpression(resA.s, 1, resA.n);
console.log("Expression:", exprA, "Expected: ((A1 × A2) × A3)");
const catalanA = calculateCatalanNumber(resA.n);
console.log("Catalan for n=3:", catalanA.toString(), "Expected: 2");

console.log("\n--- TEST B: [10, 30, 5, 60, 2] ---");
const pB = [10, 30, 5, 60, 2];
const resB = solveMCMTabulation(pB);
console.log("Min Cost:", resB.minCost);
const exprB = reconstructExpression(resB.s, 1, resB.n);
console.log("Expression:", exprB);
const catalanB = calculateCatalanNumber(resB.n);
console.log("Catalan for n=4:", catalanB.toString(), "Expected: 5");

console.log("\n--- TEST C: Ties in [10, 10, 10, 10, 10] ---");
const pC = [10, 10, 10, 10, 10];
const resC = solveMCMTabulation(pC);
const ties = findAllTies(resC.s, resC.n);
console.log("Ties detected:", ties.length, ties);

console.log("\n--- TEST Consistency across all 3 algorithms for [10, 30, 5, 60] ---");
const evTab = generateTabulationEvents(pA);
const evMemo = generateMemoizationEvents(pA);
const evBrute = generateBruteForceEvents(pA);

const tabFinal = evTab[evTab.length - 1].metrics.minCost;
const memoFinal = evMemo[evMemo.length - 1].metrics.minCost;
const bruteFinal = evBrute[evBrute.length - 1].metrics.minCost;

console.log(`Tabulation: ${tabFinal}, Memoization: ${memoFinal}, Brute-Force: ${bruteFinal}`);
if (tabFinal === 4500 && memoFinal === 4500 && bruteFinal === 4500) {
  console.log("SUCCESS: All algorithms agree perfectly!");
} else {
  console.error("FAILURE: Mismatch in algorithm outputs!");
}
