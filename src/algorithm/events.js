/**
 * Discrete Execution Event Generator for MCM Algorithms
 * 
 * Generates an immutable, deterministic sequence of teaching steps for:
 * 1. Bottom-Up Tabulation
 * 2. Top-Down Memoization
 * 3. Brute-Force Recursion
 * 
 * Every step contains rich pedagogical explanations:
 * - stepTitle
 * - whatSolving
 * - calculation
 * - whyMatters
 * - whatNext
 * - full state snapshots for 100% reversible step backward navigation.
 */

// Helper to clone 2D arrays
function clone2D(arr) {
  return arr.map(row => [...row]);
}

/**
 * Generate Events for Mode C: Bottom-Up Tabulation
 */
export function generateTabulationEvents(p) {
  const n = p.length - 1;
  const events = [];

  // Initialize empty tables
  const m = Array.from({ length: n + 1 }, () => Array(n + 1).fill(null));
  const s = Array.from({ length: n + 1 }, () => Array.from({ length: n + 1 }, () => []));

  // Base cases: diagonal m[i][i] = 0
  for (let i = 1; i <= n; i++) {
    m[i][i] = 0;
  }

  // Initial setup event (Chain length 1 base cases)
  events.push({
    id: 0,
    type: 'INIT',
    mode: 'tabulation',
    chainLength: 1,
    activeCell: null,
    readCells: [],
    candidate: null,
    winningSplit: null,
    mTable: clone2D(m),
    sTable: s.map(r => r.map(c => [...c])),
    stepTitle: 'Initialize DP Table with Base Cases',
    whatSolving: `Single matrices (chain length L = 1)`,
    calculation: `m[i][i] = 0 for all matrices A1 through A${n}`,
    whyMatters: `A single matrix requires zero scalar multiplications because no multiplication operation takes place. This forms the base diagonal of our DP table.`,
    whatNext: `Begin evaluating chains of length L = 2 (pairs of adjacent matrices).`,
    description: `Initialized DP table with base cases: m[i][i] = 0 for single matrices (length 1).`,
    metrics: {
      functionCalls: 0,
      uniqueSubproblems: n,
      duplicateEvaluations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cellsCompleted: n,
      splitEvaluations: 0,
      maxDepth: 0,
      minCost: null
    }
  });

  let splitEvalCount = 0;
  let cellsCompletedCount = n;

  for (let L = 2; L <= n; L++) {
    for (let i = 1; i <= n - L + 1; i++) {
      const j = i + L - 1;
      const numSplits = j - i;

      // Event: Start subproblem m[i][j]
      events.push({
        id: events.length,
        type: 'CELL_START',
        mode: 'tabulation',
        chainLength: L,
        activeCell: [i, j],
        readCells: [],
        candidate: null,
        winningSplit: null,
        mTable: clone2D(m),
        sTable: s.map(r => r.map(c => [...c])),
        stepTitle: `Begin Subproblem m[${i}][${j}] (Chain Length L = ${L})`,
        whatSolving: `Find minimum scalar multiplications to multiply A${i} through A${j} (${p[i - 1]}×${p[j]} output)`,
        calculation: `Evaluating ${numSplits} possible split point${numSplits > 1 ? 's' : ''} k ∈ [${i}, ${j - 1}]`,
        whyMatters: `To multiply matrices A${i}...A${j}, we must partition them into two groups: (A${i}...Ak) × (Ak+1...A${j}) at some split index k.`,
        whatNext: `Evaluate split point k = ${i}.`,
        description: `Starting chain length L=${L}: computing subproblem m[${i}][${j}] (matrices A${i} through A${j}).`,
        metrics: {
          functionCalls: 0,
          uniqueSubproblems: cellsCompletedCount,
          duplicateEvaluations: 0,
          cacheHits: 0,
          cacheMisses: 0,
          cellsCompleted: cellsCompletedCount,
          splitEvaluations: splitEvalCount,
          maxDepth: 0,
          minCost: null
        }
      });

      let currentMinCost = Infinity;
      const currentOptimalSplits = [];
      const candidateList = [];

      for (let k = i; k < j; k++) {
        splitEvalCount++;
        const leftCost = m[i][k];
        const rightCost = m[k + 1][j];
        const multCost = p[i - 1] * p[k] * p[j];
        const totalCost = leftCost + rightCost + multCost;

        const isNewBest = totalCost < currentMinCost;
        const isTie = totalCost === currentMinCost;

        if (isNewBest) {
          currentMinCost = totalCost;
          currentOptimalSplits.length = 0;
          currentOptimalSplits.push(k);
        } else if (isTie) {
          currentOptimalSplits.push(k);
        }

        const candidateInfo = {
          k,
          leftCell: [i, k],
          leftCost,
          rightCell: [k + 1, j],
          rightCost,
          p_im1: p[i - 1],
          p_k: p[k],
          p_j: p[j],
          multCost,
          totalCost,
          isNewBest,
          isTie,
          currentBestCost: currentMinCost,
          currentSplits: [...currentOptimalSplits]
        };

        candidateList.push(candidateInfo);

        // Teaching explanation for candidate
        const candidateCalc = `m[${i}][${k}] (${leftCost}) + m[${k + 1}][${j}] (${rightCost}) + ${p[i - 1]}×${p[k]}×${p[j]} (${multCost}) = ${totalCost}`;
        const whyMattersCand = isNewBest
          ? `Split k=${k} groups (A${i}..A${k}) and (A${k + 1}..A${j}). Total cost ${totalCost} is the lowest found so far for m[${i}][${j}]!`
          : isTie
          ? `Split k=${k} achieves the exact same optimal cost (${totalCost}) as an earlier split! This creates an alternative optimal parenthesization.`
          : `Split k=${k} costs ${totalCost}, which is higher than the current best (${currentMinCost}). This split is not chosen.`;

        const nextStepDesc = k + 1 < j
          ? `Evaluate next split candidate k = ${k + 1}.`
          : `All split candidates evaluated. Finalize cell m[${i}][${j}].`;

        // Event: Candidate split evaluation
        events.push({
          id: events.length,
          type: 'SPLIT_EVALUATE',
          mode: 'tabulation',
          chainLength: L,
          activeCell: [i, j],
          readCells: [[i, k], [k + 1, j]],
          candidate: candidateInfo,
          allCandidatesForCell: [...candidateList],
          winningSplit: currentOptimalSplits[0],
          allWinningSplits: [...currentOptimalSplits],
          mTable: clone2D(m),
          sTable: s.map(r => r.map(c => [...c])),
          stepTitle: `Evaluate Split k = ${k} for m[${i}][${j}]`,
          whatSolving: `Testing partition: (A${i}...A${k}) × (A${k + 1}...A${j})`,
          calculation: candidateCalc,
          whyMatters: whyMattersCand,
          whatNext: nextStepDesc,
          description: `Testing split k=${k}: m[${i}][${k}] (${leftCost}) + m[${k + 1}][${j}] (${rightCost}) + ${p[i - 1]}×${p[k]}×${p[j]} (${multCost}) = ${totalCost}.${isNewBest ? ' New minimum!' : isTie ? ' Tie with current minimum!' : ' Higher than best.'}`,
          metrics: {
            functionCalls: 0,
            uniqueSubproblems: cellsCompletedCount,
            duplicateEvaluations: 0,
            cacheHits: 0,
            cacheMisses: 0,
            cellsCompleted: cellsCompletedCount,
            splitEvaluations: splitEvalCount,
            maxDepth: 0,
            minCost: null
          }
        });
      }

      // Finish cell computation
      m[i][j] = currentMinCost;
      s[i][j] = [...currentOptimalSplits];
      cellsCompletedCount++;

      const isFinalSubproblem = i === 1 && j === n;

      // Event: Cell Complete
      events.push({
        id: events.length,
        type: 'CELL_COMPLETE',
        mode: 'tabulation',
        chainLength: L,
        activeCell: [i, j],
        readCells: [],
        candidate: null,
        allCandidatesForCell: [...candidateList],
        winningSplit: s[i][j][0],
        allWinningSplits: [...s[i][j]],
        mTable: clone2D(m),
        sTable: s.map(r => r.map(c => [...c])),
        stepTitle: `Store Result: m[${i}][${j}] = ${currentMinCost}`,
        whatSolving: `Subproblem m[${i}][${j}] (A${i}...A${j}) solved!`,
        calculation: `Minimum Cost = ${currentMinCost}, Optimal Split${s[i][j].length > 1 ? 's' : ''}: k = ${s[i][j].join(', ')}`,
        whyMatters: `The optimal scalar multiplications cost is saved to m[${i}][${j}] and the winning split is saved to s[${i}][${j}] for future parenthesization reconstruction.`,
        whatNext: isFinalSubproblem
          ? `Overall chain solved! Final answer is ready in m[1][${n}].`
          : `Advance to the next cell along diagonal length L = ${L}.`,
        description: `Completed m[${i}][${j}] = ${currentMinCost} with optimal split${s[i][j].length > 1 ? 's' : ''} k = ${s[i][j].join(', ')}.`,
        metrics: {
          functionCalls: 0,
          uniqueSubproblems: cellsCompletedCount,
          duplicateEvaluations: 0,
          cacheHits: 0,
          cacheMisses: 0,
          cellsCompleted: cellsCompletedCount,
          splitEvaluations: splitEvalCount,
          maxDepth: 0,
          minCost: isFinalSubproblem ? currentMinCost : null
        }
      });
    }
  }

  // Final Event: Solved
  events.push({
    id: events.length,
    type: 'SOLVED',
    mode: 'tabulation',
    chainLength: n,
    activeCell: [1, n],
    readCells: [],
    candidate: null,
    winningSplit: s[1][n][0],
    allWinningSplits: [...s[1][n]],
    mTable: clone2D(m),
    sTable: s.map(r => r.map(c => [...c])),
    stepTitle: 'Optimal Parenthesization Completed',
    whatSolving: `Entire Matrix Chain A1...A${n}`,
    calculation: `Optimal Cost: ${m[1][n]} scalar multiplications`,
    whyMatters: `Bottom-Up Tabulation successfully solved all subproblems in strictly increasing chain length with zero recursive overhead.`,
    whatNext: `Inspect the reconstructed parenthesization tree or explore alternative optimal ties.`,
    description: `Bottom-Up Tabulation complete! Optimal scalar multiplication cost is ${m[1][n]}.`,
    metrics: {
      functionCalls: 0,
      uniqueSubproblems: cellsCompletedCount,
      duplicateEvaluations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cellsCompleted: cellsCompletedCount,
      splitEvaluations: splitEvalCount,
      maxDepth: 0,
      minCost: m[1][n]
    }
  });

  return events;
}

/**
 * Generate Events for Mode B: Top-Down Dynamic Programming with Memoization
 */
export function generateMemoizationEvents(p) {
  const n = p.length - 1;
  const events = [];

  const m = Array.from({ length: n + 1 }, () => Array(n + 1).fill(null));
  const s = Array.from({ length: n + 1 }, () => Array.from({ length: n + 1 }, () => []));

  const treeNodes = {};
  let nodeCounter = 0;
  let totalCalls = 0;
  let cacheHits = 0;
  let cacheMisses = 0;
  let splitEvaluations = 0;
  let maxDepth = 0;
  let duplicateCount = 0;
  const subproblemCallCounts = {};

  // Base cases
  for (let i = 1; i <= n; i++) {
    m[i][i] = 0;
  }

  events.push({
    id: 0,
    type: 'INIT',
    mode: 'memoization',
    activeCell: null,
    readCells: [],
    activeNodeId: null,
    treeNodes: {},
    mTable: clone2D(m),
    sTable: s.map(r => r.map(c => [...c])),
    stepTitle: 'Initialize Top-Down Memoization',
    whatSolving: `Preparing memo table for A1...A${n}`,
    calculation: `m[i][i] = 0 (base cases initialized)`,
    whyMatters: `Top-down dynamic programming uses recursion to explore subproblems, but stores computed answers in a memo table to eliminate redundant work.`,
    whatNext: `Begin top-level recursive call MCM(1, ${n}).`,
    description: `Initialized Top-Down Memoization table. Base cases m[i][i] = 0.`,
    metrics: {
      functionCalls: 0,
      uniqueSubproblems: 0,
      duplicateEvaluations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cellsCompleted: 0,
      splitEvaluations: 0,
      maxDepth: 0,
      minCost: null
    }
  });

  function memoizedMCM(i, j, parentNodeId = null, depth = 0) {
    totalCalls++;
    if (depth > maxDepth) maxDepth = depth;

    const subKey = `${i},${j}`;
    subproblemCallCounts[subKey] = (subproblemCallCounts[subKey] || 0) + 1;
    const callNum = subproblemCallCounts[subKey];

    const nodeId = `node_${++nodeCounter}`;
    const nodeObj = {
      id: nodeId,
      i,
      j,
      label: `MCM(${i},${j})`,
      callNum,
      parentId: parentNodeId,
      depth,
      status: 'computing',
      isCacheHit: false,
      cost: null,
      children: []
    };
    treeNodes[nodeId] = nodeObj;
    if (parentNodeId && treeNodes[parentNodeId]) {
      treeNodes[parentNodeId].children.push(nodeId);
    }

    // Check memo table
    if (m[i][j] !== null) {
      const isBaseCase = i === j;
      if (!isBaseCase) {
        cacheHits++;
        duplicateCount++;
      }
      nodeObj.status = isBaseCase ? 'completed' : 'cached';
      nodeObj.isCacheHit = !isBaseCase;
      nodeObj.cost = m[i][j];

      events.push({
        id: events.length,
        type: isBaseCase ? 'BASE_CASE' : 'CACHE_HIT',
        mode: 'memoization',
        chainLength: j - i + 1,
        activeCell: [i, j],
        readCells: [],
        activeNodeId: nodeId,
        treeNodes: JSON.parse(JSON.stringify(treeNodes)),
        mTable: clone2D(m),
        sTable: s.map(r => r.map(c => [...c])),
        stepTitle: isBaseCase ? `Base Case: MCM(${i}, ${i})` : `⚡ Cache Hit: MCM(${i}, ${j})`,
        whatSolving: `Subproblem MCM(${i}, ${j})`,
        calculation: isBaseCase ? `m[${i}][${i}] = 0 (single matrix)` : `m[${i}][${j}] = ${m[i][j]} retrieved from memo table`,
        whyMatters: isBaseCase
          ? `Single matrix requires 0 multiplications.`
          : `This subproblem was already solved in an earlier branch! Memoization returns the saved result instantly without recomputing splits.`,
        whatNext: `Return ${m[i][j]} to calling branch.`,
        description: isBaseCase
          ? `Base case MCM(${i}, ${i}) = 0 (single matrix A${i}).`
          : `CACHE HIT: MCM(${i}, ${j}) found in memo table with cost ${m[i][j]}! Avoided recomputation.`,
        metrics: {
          functionCalls: totalCalls,
          uniqueSubproblems: Object.keys(subproblemCallCounts).length,
          duplicateEvaluations: duplicateCount,
          cacheHits,
          cacheMisses,
          cellsCompleted: Object.values(treeNodes).filter(n => n.cost !== null).length,
          splitEvaluations,
          maxDepth,
          minCost: null
        }
      });

      return m[i][j];
    }

    // Cache Miss
    cacheMisses++;
    events.push({
      id: events.length,
      type: 'CACHE_MISS',
      mode: 'memoization',
      chainLength: j - i + 1,
      activeCell: [i, j],
      readCells: [],
      activeNodeId: nodeId,
      treeNodes: JSON.parse(JSON.stringify(treeNodes)),
      mTable: clone2D(m),
      sTable: s.map(r => r.map(c => [...c])),
      stepTitle: `Cache Miss: Evaluating MCM(${i}, ${j})`,
      whatSolving: `MCM(${i}, ${j}) not in table (Call #${callNum})`,
      calculation: `Will evaluate splits k from ${i} to ${j - 1}`,
      whyMatters: `This subproblem has not been encountered yet. The algorithm must recursively calculate subchains and test all candidate split points.`,
      whatNext: `Recurse on left and right subchains for split k = ${i}.`,
      description: `CACHE MISS for MCM(${i}, ${j}) (Call #${callNum}). Not in table; evaluating splits k=${i} to ${j - 1}.`,
      metrics: {
        functionCalls: totalCalls,
        uniqueSubproblems: Object.keys(subproblemCallCounts).length,
        duplicateEvaluations: duplicateCount,
        cacheHits,
        cacheMisses,
        cellsCompleted: Object.values(treeNodes).filter(n => n.cost !== null).length,
        splitEvaluations,
        maxDepth,
        minCost: null
      }
    });

    let minCost = Infinity;
    const optimalSplits = [];
    const candidateList = [];

    for (let k = i; k < j; k++) {
      const leftCost = memoizedMCM(i, k, nodeId, depth + 1);
      const rightCost = memoizedMCM(k + 1, j, nodeId, depth + 1);

      splitEvaluations++;
      const multCost = p[i - 1] * p[k] * p[j];
      const totalCost = leftCost + rightCost + multCost;

      const isNewBest = totalCost < minCost;
      const isTie = totalCost === minCost;

      if (isNewBest) {
        minCost = totalCost;
        optimalSplits.length = 0;
        optimalSplits.push(k);
      } else if (isTie) {
        optimalSplits.push(k);
      }

      const cand = {
        k,
        leftCell: [i, k],
        rightCell: [k + 1, j],
        leftCost,
        rightCost,
        multCost,
        totalCost,
        isNewBest,
        isTie,
        currentBestCost: minCost,
        currentSplits: [...optimalSplits],
        p_im1: p[i - 1],
        p_k: p[k],
        p_j: p[j]
      };
      candidateList.push(cand);

      events.push({
        id: events.length,
        type: 'SPLIT_EVALUATE',
        mode: 'memoization',
        chainLength: j - i + 1,
        activeCell: [i, j],
        readCells: [[i, k], [k + 1, j]],
        activeNodeId: nodeId,
        candidate: cand,
        allCandidatesForCell: [...candidateList],
        winningSplit: optimalSplits[0],
        allWinningSplits: [...optimalSplits],
        treeNodes: JSON.parse(JSON.stringify(treeNodes)),
        mTable: clone2D(m),
        sTable: s.map(r => r.map(c => [...c])),
        stepTitle: `MCM(${i},${j}): Candidate Split k = ${k}`,
        whatSolving: `Subproblem MCM(${i}, ${j})`,
        calculation: `${leftCost} + ${rightCost} + ${multCost} = ${totalCost}`,
        whyMatters: `Combines left recursive branch MCM(${i},${k}) and right branch MCM(${k + 1},${j}) with multiplication cost ${p[i - 1]}×${p[k]}×${p[j]}.`,
        whatNext: k + 1 < j ? `Evaluate next split k = ${k + 1}.` : `Store optimal result in memo table.`,
        description: `MCM(${i},${j}): evaluated split k=${k} -> ${leftCost} + ${rightCost} + ${multCost} = ${totalCost}.${isNewBest ? ' New local minimum!' : isTie ? ' Tied with minimum!' : ''}`,
        metrics: {
          functionCalls: totalCalls,
          uniqueSubproblems: Object.keys(subproblemCallCounts).length,
          duplicateEvaluations: duplicateCount,
          cacheHits,
          cacheMisses,
          cellsCompleted: Object.values(treeNodes).filter(n => n.cost !== null).length,
          splitEvaluations,
          maxDepth,
          minCost: null
        }
      });
    }

    // Store in memo table
    m[i][j] = minCost;
    s[i][j] = [...optimalSplits];
    nodeObj.status = 'completed';
    nodeObj.cost = minCost;

    events.push({
      id: events.length,
      type: 'CACHE_STORE',
      mode: 'memoization',
      chainLength: j - i + 1,
      activeCell: [i, j],
      readCells: [],
      activeNodeId: nodeId,
      treeNodes: JSON.parse(JSON.stringify(treeNodes)),
      mTable: clone2D(m),
      sTable: s.map(r => r.map(c => [...c])),
      stepTitle: `Memoize Result for MCM(${i}, ${j})`,
      whatSolving: `Saving optimal answer: m[${i}][${j}] = ${minCost}`,
      calculation: `Optimal Cost: ${minCost}, Split${optimalSplits.length > 1 ? 's' : ''}: k = ${optimalSplits.join(', ')}`,
      whyMatters: `Result is cached in the table! If any other branch requests MCM(${i}, ${j}), it will be returned immediately in O(1) time.`,
      whatNext: `Return ${minCost} to parent caller.`,
      description: `Stored result in memo table: m[${i}][${j}] = ${minCost}, split${optimalSplits.length > 1 ? 's' : ''} k=${optimalSplits.join(', ')}.`,
      metrics: {
        functionCalls: totalCalls,
        uniqueSubproblems: Object.keys(subproblemCallCounts).length,
        duplicateEvaluations: duplicateCount,
        cacheHits,
        cacheMisses,
        cellsCompleted: Object.values(treeNodes).filter(n => n.cost !== null).length,
        splitEvaluations,
        maxDepth,
        minCost: i === 1 && j === n ? minCost : null
      }
    });

    return minCost;
  }

  memoizedMCM(1, n, null, 0);

  events.push({
    id: events.length,
    type: 'SOLVED',
    mode: 'memoization',
    chainLength: n,
    activeCell: [1, n],
    readCells: [],
    activeNodeId: 'node_1',
    winningSplit: s[1][n][0],
    allWinningSplits: [...s[1][n]],
    treeNodes: JSON.parse(JSON.stringify(treeNodes)),
    mTable: clone2D(m),
    sTable: s.map(r => r.map(c => [...c])),
    stepTitle: 'Top-Down Memoization Complete',
    whatSolving: `Solved entire chain A1...A${n}`,
    calculation: `Final Optimal Cost: ${m[1][n]}`,
    whyMatters: `Solved in ${totalCalls} calls with ${cacheHits} cache hits, avoiding redundant recursive branches.`,
    whatNext: `Explore optimal parenthesization tree.`,
    description: `Top-Down Memoization complete! Final cost: ${m[1][n]}. Total calls: ${totalCalls}, Cache hits: ${cacheHits}.`,
    metrics: {
      functionCalls: totalCalls,
      uniqueSubproblems: Object.keys(subproblemCallCounts).length,
      duplicateEvaluations: duplicateCount,
      cacheHits,
      cacheMisses,
      cellsCompleted: Object.values(treeNodes).filter(n => n.cost !== null).length,
      splitEvaluations,
      maxDepth,
      minCost: m[1][n]
    }
  });

  return events;
}

/**
 * Generate Events for Mode A: Brute-Force Recursion (No Memoization)
 */
export function generateBruteForceEvents(p, maxCallLimit = 1500) {
  const n = p.length - 1;
  const events = [];

  const treeNodes = {};
  let nodeCounter = 0;
  let totalCalls = 0;
  let splitEvaluations = 0;
  let maxDepth = 0;
  let duplicateEvaluations = 0;
  let truncated = false;
  const subproblemCallCounts = {};

  const finalSplits = Array.from({ length: n + 1 }, () => Array.from({ length: n + 1 }, () => []));

  events.push({
    id: 0,
    type: 'INIT',
    mode: 'brute_force',
    activeCell: null,
    readCells: [],
    activeNodeId: null,
    treeNodes: {},
    stepTitle: 'Start Pure Brute-Force Recursion',
    whatSolving: `Exploring every recursive branch without caching`,
    calculation: `No memoization table will be used`,
    whyMatters: `Demonstrates the exponential redundancy of naive recursion. Identical subproblems will be recomputed over and over across different branches.`,
    whatNext: `Begin top-level call MCM(1, ${n}).`,
    description: `Started Pure Brute-Force Recursion. No memo table: all redundant subproblems will be re-evaluated.`,
    metrics: {
      functionCalls: 0,
      uniqueSubproblems: 0,
      duplicateEvaluations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cellsCompleted: 0,
      splitEvaluations: 0,
      maxDepth: 0,
      minCost: null
    }
  });

  function bruteMCM(i, j, parentNodeId = null, depth = 0) {
    if (totalCalls >= maxCallLimit) {
      truncated = true;
      return 0;
    }

    totalCalls++;
    if (depth > maxDepth) maxDepth = depth;

    const subKey = `${i},${j}`;
    subproblemCallCounts[subKey] = (subproblemCallCounts[subKey] || 0) + 1;
    const callNum = subproblemCallCounts[subKey];
    const isDuplicate = callNum > 1;
    if (isDuplicate) duplicateEvaluations++;

    const nodeId = `node_${++nodeCounter}`;
    const nodeObj = {
      id: nodeId,
      i,
      j,
      label: `MCM(${i},${j})`,
      callNum,
      parentId: parentNodeId,
      depth,
      status: isDuplicate ? 'duplicate' : 'computing',
      isDuplicate,
      cost: null,
      children: []
    };
    treeNodes[nodeId] = nodeObj;
    if (parentNodeId && treeNodes[parentNodeId]) {
      treeNodes[parentNodeId].children.push(nodeId);
    }

    // Base case: i === j
    if (i === j) {
      nodeObj.status = 'completed';
      nodeObj.cost = 0;

      events.push({
        id: events.length,
        type: 'BASE_CASE',
        mode: 'brute_force',
        chainLength: 1,
        activeCell: [i, i],
        readCells: [],
        activeNodeId: nodeId,
        treeNodes: JSON.parse(JSON.stringify(treeNodes)),
        stepTitle: `Base Case: MCM(${i}, ${i})`,
        whatSolving: `Single matrix A${i}`,
        calculation: `Cost = 0 scalar multiplications`,
        whyMatters: `A single matrix requires zero scalar multiplications.`,
        whatNext: `Return 0 to parent caller.`,
        description: `Base case MCM(${i}, ${i}) = 0. Single matrix A${i} requires 0 scalar multiplications.`,
        metrics: {
          functionCalls: totalCalls,
          uniqueSubproblems: Object.keys(subproblemCallCounts).length,
          duplicateEvaluations,
          cacheHits: 0,
          cacheMisses: totalCalls,
          cellsCompleted: 0,
          splitEvaluations,
          maxDepth,
          minCost: null
        }
      });
      return 0;
    }

    events.push({
      id: events.length,
      type: 'RECURSIVE_ENTER',
      mode: 'brute_force',
      chainLength: j - i + 1,
      activeCell: [i, j],
      readCells: [],
      activeNodeId: nodeId,
      treeNodes: JSON.parse(JSON.stringify(treeNodes)),
      stepTitle: isDuplicate ? `⚠️ Redundant Call: MCM(${i}, ${j}) [Call #${callNum}]` : `Enter MCM(${i}, ${j})`,
      whatSolving: `Subproblem MCM(${i}, ${j})`,
      calculation: `Evaluating splits k from ${i} to ${j - 1}`,
      whyMatters: isDuplicate
        ? `This subproblem was already evaluated in another branch! Without dynamic programming, brute force wastes CPU recomputing it from scratch.`
        : `First time seeing MCM(${i}, ${j}). Evaluating splits recursively.`,
      whatNext: `Recurse on split k = ${i}.`,
      description: `Entered MCM(${i}, ${j}) [Call #${callNum}]${isDuplicate ? ' — DUPLICATE SUBPROBLEM: repeatedly recomputed!' : ''}`,
      metrics: {
        functionCalls: totalCalls,
        uniqueSubproblems: Object.keys(subproblemCallCounts).length,
        duplicateEvaluations,
        cacheHits: 0,
        cacheMisses: totalCalls,
        cellsCompleted: 0,
        splitEvaluations,
        maxDepth,
        minCost: null
      }
    });

    let minCost = Infinity;
    const optimalSplits = [];
    const candidateList = [];

    for (let k = i; k < j; k++) {
      if (truncated) break;

      const leftCost = bruteMCM(i, k, nodeId, depth + 1);
      const rightCost = bruteMCM(k + 1, j, nodeId, depth + 1);

      splitEvaluations++;
      const multCost = p[i - 1] * p[k] * p[j];
      const totalCost = leftCost + rightCost + multCost;

      const isNewBest = totalCost < minCost;
      const isTie = totalCost === minCost;

      if (isNewBest) {
        minCost = totalCost;
        optimalSplits.length = 0;
        optimalSplits.push(k);
      } else if (isTie) {
        optimalSplits.push(k);
      }

      const cand = {
        k,
        leftCell: [i, k],
        rightCell: [k + 1, j],
        leftCost,
        rightCost,
        multCost,
        totalCost,
        isNewBest,
        isTie,
        currentBestCost: minCost,
        currentSplits: [...optimalSplits],
        p_im1: p[i - 1],
        p_k: p[k],
        p_j: p[j]
      };
      candidateList.push(cand);

      events.push({
        id: events.length,
        type: 'SPLIT_EVALUATE',
        mode: 'brute_force',
        chainLength: j - i + 1,
        activeCell: [i, j],
        readCells: [[i, k], [k + 1, j]],
        activeNodeId: nodeId,
        candidate: cand,
        allCandidatesForCell: [...candidateList],
        winningSplit: optimalSplits[0],
        allWinningSplits: [...optimalSplits],
        treeNodes: JSON.parse(JSON.stringify(treeNodes)),
        stepTitle: `MCM(${i},${j}): Split k = ${k}`,
        whatSolving: `Subproblem MCM(${i}, ${j})`,
        calculation: `${leftCost} + ${rightCost} + ${multCost} = ${totalCost}`,
        whyMatters: `Computed via recursive calls on (A${i}..A${k}) and (A${k + 1}..A${j}).`,
        whatNext: k + 1 < j ? `Evaluate split k = ${k + 1}.` : `Return minimum to caller.`,
        description: `MCM(${i},${j}): split k=${k} cost = ${leftCost} + ${rightCost} + ${multCost} = ${totalCost}.`,
        metrics: {
          functionCalls: totalCalls,
          uniqueSubproblems: Object.keys(subproblemCallCounts).length,
          duplicateEvaluations,
          cacheHits: 0,
          cacheMisses: totalCalls,
          cellsCompleted: 0,
          splitEvaluations,
          maxDepth,
          minCost: null
        }
      });
    }

    nodeObj.status = 'completed';
    nodeObj.cost = minCost;
    finalSplits[i][j] = [...optimalSplits];

    events.push({
      id: events.length,
      type: 'RECURSIVE_RETURN',
      mode: 'brute_force',
      chainLength: j - i + 1,
      activeCell: [i, j],
      readCells: [],
      activeNodeId: nodeId,
      treeNodes: JSON.parse(JSON.stringify(treeNodes)),
      stepTitle: `MCM(${i}, ${j}) Solved: Cost = ${minCost}`,
      whatSolving: `Completed subproblem MCM(${i}, ${j})`,
      calculation: `Optimal cost for subchain: ${minCost}`,
      whyMatters: `Returning cost to caller. Notice that because this result is NOT cached, other branches will compute this entire subtree all over again!`,
      whatNext: `Continue recursion in caller.`,
      description: `MCM(${i}, ${j}) completed with min cost ${minCost}. Returning to caller.`,
      metrics: {
        functionCalls: totalCalls,
        uniqueSubproblems: Object.keys(subproblemCallCounts).length,
        duplicateEvaluations,
        cacheHits: 0,
        cacheMisses: totalCalls,
        cellsCompleted: 0,
        splitEvaluations,
        maxDepth,
        minCost: i === 1 && j === n ? minCost : null
      }
    });

    return minCost;
  }

  const result = bruteMCM(1, n, null, 0);

  events.push({
    id: events.length,
    type: 'SOLVED',
    mode: 'brute_force',
    chainLength: n,
    activeCell: [1, n],
    readCells: [],
    activeNodeId: 'node_1',
    winningSplit: finalSplits[1][n][0],
    allWinningSplits: [...finalSplits[1][n]],
    sTable: finalSplits.map(r => r.map(c => [...c])),
    treeNodes: JSON.parse(JSON.stringify(treeNodes)),
    stepTitle: 'Brute-Force Recursion Finished',
    whatSolving: `Entire chain A1...A${n}`,
    calculation: `Final Optimal Cost: ${result}`,
    whyMatters: `Completed with ${totalCalls} total calls and ${duplicateEvaluations} redundant recomputations. Dynamic programming solves this same chain with far fewer operations!`,
    whatNext: `Switch to Bottom-Up Tabulation to compare efficiency.`,
    description: truncated
      ? `Brute force reached safe limit (${maxCallLimit} calls). Displaying executed tree.`
      : `Brute-force recursion finished! Final minimum cost: ${result}. Redundant recursive calls executed: ${duplicateEvaluations}.`,
    metrics: {
      functionCalls: totalCalls,
      uniqueSubproblems: Object.keys(subproblemCallCounts).length,
      duplicateEvaluations,
      cacheHits: 0,
      cacheMisses: totalCalls,
      cellsCompleted: 0,
      splitEvaluations,
      maxDepth,
      minCost: result,
      truncated
    }
  });

  return events;
}
