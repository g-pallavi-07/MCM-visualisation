/**
 * Matrix Chain Multiplication (MCM) Core Algorithms & Mathematical Foundations
 * 
 * 1-indexed convention aligned with standard CS textbooks (CLRS):
 * Dimensions array p of length n + 1 defines n matrices A1, A2, ..., An.
 * Matrix Ai has dimensions p[i-1] x p[i].
 * Cost table m[i][j] stores minimum scalar multiplications for Ai...Aj.
 * Split table s[i][j] stores optimal split point(s) k where i <= k < j.
 */

// Compute exact Catalan number C(n-1) = (1/n) * Binomial(2n-2, n-1) using BigInt
export function calculateCatalanNumber(n) {
  if (n <= 1) return 1n;
  const m = BigInt(n - 1);
  // Binomial(2m, m) / (m + 1)
  let num = 1n;
  for (let i = 1n; i <= m; i++) {
    num = (num * (m + i)) / i;
  }
  return num / (m + 1n);
}

// Theoretical operations count for Tabulation
export function calculateTheoreticalCounts(n) {
  // Number of split candidates evaluated across all cells: sum_{L=2}^n sum_{i=1}^{n-L+1} (L - 1)
  // Exact closed form: n(n - 1)(n + 1) / 6
  const splitEvaluations = (n * (n - 1) * (n + 1)) / 6;
  // Number of non-trivial DP cells (L >= 2): n(n - 1) / 2
  const nonTrivialCells = (n * (n - 1)) / 2;
  // Total table cells in upper triangle including diagonal: n(n + 1) / 2
  const totalUpperCells = (n * (n + 1)) / 2;

  return {
    splitEvaluations,
    nonTrivialCells,
    totalUpperCells,
    catalanParenthesizations: calculateCatalanNumber(n)
  };
}

/**
 * Standard Bottom-Up Tabulation (Solves full problem & returns complete tables)
 * Also detects ALL ties for split points
 */
export function solveMCMTabulation(p) {
  const n = p.length - 1;
  // Initialize tables (1-indexed, size (n+1) x (n+1))
  const m = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
  // s will hold an array of all optimal split points for tie exploration
  const s = Array.from({ length: n + 1 }, () => Array.from({ length: n + 1 }, () => []));

  // L is chain length: from 2 to n
  for (let L = 2; L <= n; L++) {
    for (let i = 1; i <= n - L + 1; i++) {
      const j = i + L - 1;
      let minCost = Infinity;
      const optimalSplits = [];

      for (let k = i; k < j; k++) {
        const leftCost = m[i][k];
        const rightCost = m[k + 1][j];
        const multCost = p[i - 1] * p[k] * p[j];
        const total = leftCost + rightCost + multCost;

        if (total < minCost) {
          minCost = total;
          optimalSplits.length = 0;
          optimalSplits.push(k);
        } else if (total === minCost) {
          optimalSplits.push(k);
        }
      }

      m[i][j] = minCost;
      s[i][j] = optimalSplits;
    }
  }

  return { n, p, m, s, minCost: m[1][n] };
}

/**
 * Reconstructs Parenthesization String from Split Table
 * choiceMap allows selecting alternative optimal split points when ties exist:
 * choiceMap: { "i,j": splitIndex }
 */
export function reconstructExpression(s, i, j, choiceMap = {}) {
  if (i === j) {
    return `A${i}`;
  }

  const splits = s[i][j];
  if (!splits || splits.length === 0) return `A${i}...A${j}`;

  const key = `${i},${j}`;
  const chosenSplit = choiceMap[key] !== undefined && splits.includes(choiceMap[key])
    ? choiceMap[key]
    : splits[0];

  const left = reconstructExpression(s, i, chosenSplit, choiceMap);
  const right = reconstructExpression(s, chosenSplit + 1, j, choiceMap);

  return `(${left} × ${right})`;
}

/**
 * Reconstructs Binary Parenthesization Tree from Split Table
 */
export function reconstructParenthesizationTree(p, s, i, j, choiceMap = {}, depth = 0) {
  if (i === j) {
    return {
      id: `leaf-${i}`,
      type: 'leaf',
      name: `A${i}`,
      i,
      j,
      dimRow: p[i - 1],
      dimCol: p[i],
      dimText: `${p[i - 1]} × ${p[i]}`,
      depth
    };
  }

  const splits = s[i][j] || [];
  const key = `${i},${j}`;
  const chosenSplit = choiceMap[key] !== undefined && splits.includes(choiceMap[key])
    ? choiceMap[key]
    : (splits[0] ?? i);

  const leftChild = reconstructParenthesizationTree(p, s, i, chosenSplit, choiceMap, depth + 1);
  const rightChild = reconstructParenthesizationTree(p, s, chosenSplit + 1, j, choiceMap, depth + 1);

  const scalarMultCost = p[i - 1] * p[chosenSplit] * p[j];
  const resultingDim = `${p[i - 1]} × ${p[j]}`;

  return {
    id: `node-${i}-${j}-${chosenSplit}`,
    type: 'internal',
    i,
    j,
    splitK: chosenSplit,
    allSplits: splits,
    hasTie: splits.length > 1,
    scalarMultCost,
    resultingDim,
    dimRow: p[i - 1],
    dimCol: p[j],
    left: leftChild,
    right: rightChild,
    depth
  };
}

/**
 * Collect all tie locations in the split table
 */
export function findAllTies(s, n) {
  const ties = [];
  for (let i = 1; i <= n; i++) {
    for (let j = i + 1; j <= n; j++) {
      if (s[i][j] && s[i][j].length > 1) {
        ties.push({
          i,
          j,
          splits: [...s[i][j]]
        });
      }
    }
  }
  return ties;
}
