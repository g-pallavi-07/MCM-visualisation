import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Eye, 
  ArrowRight,
  BrainCircuit,
  Shuffle,
  Layers,
  Calculator,
  Compass
} from 'lucide-react';
import { solveMCMTabulation, reconstructExpression } from '../algorithm/mcm';
import { formatNumber } from '../utils/formatters';

// Rich bank of benchmark matrix chains for dynamic quiz variety
const BENCHMARK_CHAINS = [
  { name: 'Classic 3-Chain', p: [10, 30, 5, 60] },
  { name: 'Four Matrices A', p: [10, 30, 5, 60, 2] },
  { name: 'Four Matrices B', p: [40, 20, 30, 10, 30] },
  { name: 'CLRS Textbook Chain', p: [30, 35, 15, 5, 10, 20] },
  { name: 'Five Matrix Scale', p: [5, 10, 3, 12, 5, 50] },
  { name: 'Tied Minimums Chain', p: [10, 10, 10, 10, 10] },
  { name: 'Asymmetric Growth', p: [10, 100, 5, 50] },
  { name: 'Balanced Five', p: [20, 5, 35, 15, 10] },
  { name: 'Steep Dimensions', p: [2, 10, 50, 20, 5] }
];

// Helper to generate all Catalan parenthesizations for matrices Ai...Aj
function getAllParenthesizations(i, j) {
  if (i === j) return [`A${i}`];
  const result = [];
  for (let k = i; k < j; k++) {
    const lefts = getAllParenthesizations(i, k);
    const rights = getAllParenthesizations(k + 1, j);
    for (const l of lefts) {
      for (const r of rights) {
        result.push(`(${l} × ${r})`);
      }
    }
  }
  return result;
}

export default function PracticeMode({ dimensions }) {
  const [challengeType, setChallengeType] = useState('cost'); // 'cost' | 'split' | 'reconstruct'
  const [chainSource, setChainSource] = useState('dynamic'); // 'dynamic' | 'active'
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [questionSeed, setQuestionSeed] = useState(0);

  // Determine active chain array to use
  const activeChain = useMemo(() => {
    if (chainSource === 'active' && dimensions && dimensions.length >= 3) {
      return { name: 'Active Workspace Chain', p: dimensions };
    }
    // Pick from benchmark chains based on questionSeed
    const idx = Math.abs(questionSeed) % BENCHMARK_CHAINS.length;
    return BENCHMARK_CHAINS[idx];
  }, [chainSource, dimensions, questionSeed]);

  // Generate question
  const generateNewQuestion = useCallback((targetType = challengeType, targetSeed = questionSeed) => {
    setIsAnswered(false);
    setSelectedOption(null);
    setShowHint(false);
    setRevealed(false);

    // Pick active chain
    let chain = activeChain;
    if (chainSource === 'dynamic') {
      const idx = Math.abs(targetSeed) % BENCHMARK_CHAINS.length;
      chain = BENCHMARK_CHAINS[idx];
    }

    const p = chain?.p || [10, 30, 5, 60];
    const solution = solveMCMTabulation(p);
    const n = solution.n;

    if (targetType === 'cost') {
      // Pick a non-trivial cell (i, j)
      const validPairs = [];
      for (let L = 2; L <= n; L++) {
        for (let i = 1; i <= n - L + 1; i++) {
          validPairs.push([i, i + L - 1]);
        }
      }
      const pairIdx = Math.floor(Math.random() * validPairs.length);
      const [i, j] = validPairs[pairIdx] || [1, Math.min(2, n)];
      const correctCost = solution.m[i][j];

      // Build split breakdowns
      const candidates = [];
      for (let k = i; k < j; k++) {
        const left = solution.m[i][k];
        const right = solution.m[k + 1][j];
        const mult = p[i - 1] * p[k] * p[j];
        candidates.push({
          k,
          left,
          right,
          mult,
          cost: left + right + mult,
          breakdown: `m[${i},${k}] (${formatNumber(left)}) + m[${k + 1},${j}] (${formatNumber(right)}) + ${p[i - 1]}×${p[k]}×${p[j]} (${formatNumber(mult)})`
        });
      }

      // Generate options
      const optionsSet = new Set([correctCost]);
      candidates.forEach(c => optionsSet.add(c.cost));
      // Add believable distractors
      const offsets = [500, 1000, 1500, 2000, 2500, 3000];
      let offsetIdx = 0;
      while (optionsSet.size < 4 && offsetIdx < offsets.length) {
        optionsSet.add(correctCost + offsets[offsetIdx]);
        if (correctCost - offsets[offsetIdx] > 0) {
          optionsSet.add(correctCost - offsets[offsetIdx]);
        }
        offsetIdx++;
      }
      const options = Array.from(optionsSet).slice(0, 4).sort(() => Math.random() - 0.5);

      setCurrentQuestion({
        type: 'cost',
        chainName: chain.name,
        p,
        i,
        j,
        length: j - i + 1,
        correctCost,
        candidates,
        options,
        optimalSplits: solution.s[i][j],
        hint: `Test each split k from ${i} to ${j - 1}. Calculate m[${i}, k] + m[k+1, ${j}] + p[${i - 1}]×p[k]×p[${j}] and take the minimum.`
      });

    } else if (targetType === 'split') {
      // Pick a cell with length >= 3 so multiple split choices exist
      const validPairs = [];
      for (let L = 3; L <= n; L++) {
        for (let i = 1; i <= n - L + 1; i++) {
          validPairs.push([i, i + L - 1]);
        }
      }

      // If no length >= 3 in active chain (e.g. 2 matrices), use benchmark chain
      let targetP = p;
      let targetSolution = solution;
      let [i, j] = [1, 3];

      if (validPairs.length > 0) {
        const pair = validPairs[Math.floor(Math.random() * validPairs.length)];
        i = pair[0];
        j = pair[1];
      } else {
        // Fallback to classic 3-chain so at least 2 splits exist
        targetP = [10, 30, 5, 60];
        targetSolution = solveMCMTabulation(targetP);
        i = 1;
        j = 3;
      }

      const optimalSplits = targetSolution.s[i][j] || [i];
      const splitBreakdowns = [];
      const splitOptions = [];

      for (let k = i; k < j; k++) {
        const left = targetSolution.m[i][k];
        const right = targetSolution.m[k + 1][j];
        const mult = targetP[i - 1] * targetP[k] * targetP[j];
        const total = left + right + mult;
        const isOptimal = optimalSplits.includes(k);

        const subLeft = k === i ? `A${i}` : `(A${i}...A${k})`;
        const subRight = k + 1 === j ? `A${j}` : `(A${k + 1}...A${j})`;
        const grouping = `${subLeft} × ${subRight}`;

        splitBreakdowns.push({
          k,
          left,
          right,
          mult,
          total,
          isOptimal,
          grouping,
          formula: `m[${i},${k}] (${formatNumber(left)}) + m[${k + 1},${j}] (${formatNumber(right)}) + ${targetP[i - 1]}×${targetP[k]}×${targetP[j]} (${formatNumber(mult)}) = ${formatNumber(total)}`
        });

        splitOptions.push({
          k,
          grouping,
          isOptimal
        });
      }

      setCurrentQuestion({
        type: 'split',
        chainName: chain.name,
        p: targetP,
        i,
        j,
        length: j - i + 1,
        optimalSplits,
        options: splitOptions,
        splitBreakdowns,
        hint: `Compare each split k from ${i} to ${j - 1}. Calculate the total cost for each split and choose the k with the minimum sum.`
      });

    } else {
      // Reconstruct parenthesization (Challenge 3)
      // Pick a chain with 3, 4, or 5 matrices
      const targetP = (p.length - 1 >= 3 && p.length - 1 <= 5) ? p : [10, 30, 5, 60, 2];
      const targetSolution = solveMCMTabulation(targetP);
      const targetN = targetSolution.n;

      const expr = reconstructExpression(targetSolution.s, 1, targetN);
      const allParenthesizations = getAllParenthesizations(1, targetN);
      const wrongExprs = allParenthesizations.filter(e => e !== expr);

      // Shuffle wrong expressions and pick up to 3 distractors
      const shuffledWrong = [...wrongExprs].sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [expr, ...shuffledWrong].sort(() => Math.random() - 0.5);

      setCurrentQuestion({
        type: 'reconstruct',
        chainName: chain.name,
        p: targetP,
        n: targetN,
        expr,
        minCost: targetSolution.minCost,
        rootSplit: targetSolution.s[1][targetN] || [1],
        options,
        hint: `In the optimal split table, the root split is at k = ${(targetSolution.s[1][targetN] || [1]).join(' or ')}. This splits the top-level multiplication into (A1...Ak) and (Ak+1...A${targetN}).`
      });
    }
  }, [activeChain, chainSource, challengeType, questionSeed]);

  // Initial load
  useEffect(() => {
    generateNewQuestion(challengeType, questionSeed);
  }, []);

  const handleSelectChallenge = (newType) => {
    setChallengeType(newType);
    generateNewQuestion(newType, questionSeed);
  };

  const handleNextQuestion = () => {
    const nextSeed = questionSeed + 1;
    setQuestionSeed(nextSeed);
    generateNewQuestion(challengeType, nextSeed);
  };

  const handleSubmit = (userChoice) => {
    if (isAnswered || !currentQuestion) return;
    setIsAnswered(true);
  };

  const handleReveal = () => {
    setRevealed(true);
    setIsAnswered(true);
  };

  return (
    <div className="practice-container">
      {/* Mode Controls: Challenge Tabs & Chain Source Selector */}
      <div className="practice-toolbar">
        <div className="challenge-tabs">
          <button
            type="button"
            className={`challenge-tab ${challengeType === 'cost' ? 'active-challenge' : ''}`}
            onClick={() => handleSelectChallenge('cost')}
          >
            <BrainCircuit size={15} />
            <span>1. Predict Min Cost</span>
          </button>
          <button
            type="button"
            className={`challenge-tab ${challengeType === 'split' ? 'active-challenge' : ''}`}
            onClick={() => handleSelectChallenge('split')}
          >
            <Sparkles size={15} />
            <span>2. Predict Optimal Split (k)</span>
          </button>
          <button
            type="button"
            className={`challenge-tab ${challengeType === 'reconstruct' ? 'active-challenge' : ''}`}
            onClick={() => handleSelectChallenge('reconstruct')}
          >
            <Layers size={15} />
            <span>3. Reconstruct Parenthesization</span>
          </button>
        </div>

        {/* Dynamic vs Active Chain Toggle */}
        <div className="chain-source-toggle">
          <span className="source-label">Source:</span>
          <div className="source-pills">
            <button
              type="button"
              className={`source-pill ${chainSource === 'dynamic' ? 'active-source' : ''}`}
              onClick={() => {
                setChainSource('dynamic');
                setQuestionSeed(s => s + 1);
              }}
              title="Practice with a wide variety of textbook matrix chains"
            >
              <Shuffle size={12} />
              <span>Varied Chains</span>
            </button>
            <button
              type="button"
              className={`source-pill ${chainSource === 'active' ? 'active-source' : ''}`}
              onClick={() => {
                setChainSource('active');
                setQuestionSeed(s => s + 1);
              }}
              title="Practice strictly using the dimensions from your Visualize workspace"
            >
              <Compass size={12} />
              <span>Workspace Chain</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Challenge Card */}
      {currentQuestion && (
        <div className="question-card panel-card">
          <div className="question-header">
            <div className="question-header-left">
              <span className="question-type-badge badge badge-pink font-mono">
                {challengeType === 'cost' ? 'Cost Calculation' : challengeType === 'split' ? 'Optimal Split Index' : 'Tree Synthesis'}
              </span>
              <span className="chain-badge font-mono">
                Chain: [{currentQuestion.p.join(', ')}]
              </span>
            </div>

            <div className="question-actions">
              <button
                type="button"
                className="action-btn-small"
                onClick={() => setShowHint(!showHint)}
                title="View mathematical hint"
              >
                <HelpCircle size={14} />
                <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
              </button>
              <button
                type="button"
                className="action-btn-small"
                onClick={handleReveal}
                disabled={isAnswered}
                title="Reveal correct answer"
              >
                <Eye size={14} />
                <span>Reveal</span>
              </button>
              <button
                type="button"
                className="action-btn-small btn-new-challenge"
                onClick={handleNextQuestion}
                title="Generate another challenge"
              >
                <Shuffle size={14} />
                <span>New Question</span>
              </button>
            </div>
          </div>

          {/* Hint alert */}
          {showHint && (
            <div className="hint-alert-box">
              <HelpCircle size={15} className="hint-icon" />
              <span>{currentQuestion.hint}</span>
            </div>
          )}

          {/* CHALLENGE 1 PROMPT & GIVEN DATA */}
          {currentQuestion && currentQuestion.type === 'cost' && challengeType === 'cost' && (
            <div className="question-content-area">
              <h4 className="prompt-title">
                What is the minimum scalar multiplication cost for subproblem <code>m[{currentQuestion.i}][{currentQuestion.j}]</code> (matrices <code>A{currentQuestion.i}...A{currentQuestion.j}</code>)?
              </h4>

              {/* Given Information Box */}
              <div className="context-card">
                <div className="context-header">
                  <Calculator size={14} style={{ color: 'var(--accent-green)' }} />
                  <span>Problem Context & Given Values:</span>
                </div>
                <div className="context-details font-mono">
                  <div className="context-row">
                    <span className="ctx-lbl">Subproblem:</span>
                    <span className="ctx-val highlight-pink">m[{currentQuestion.i}][{currentQuestion.j}] (Length L = {currentQuestion.length})</span>
                  </div>
                  <div className="context-row">
                    <span className="ctx-lbl">Matrices:</span>
                    <span className="ctx-val">
                      {Array.from({ length: currentQuestion.length || 0 }, (_, idx) => {
                        const mIdx = currentQuestion.i + idx;
                        return `A${mIdx} (${currentQuestion.p?.[mIdx - 1]}×${currentQuestion.p?.[mIdx]})`;
                      }).join(', ')}
                    </span>
                  </div>

                  {/* If length >= 3, show known subproblem costs */}
                  {(currentQuestion.length || 0) >= 3 && currentQuestion.candidates && (
                    <div className="subproblem-known-grid">
                      <span className="ctx-lbl">Known Subproblem Costs:</span>
                      <div className="known-pills-list">
                        {currentQuestion.candidates.map(c => (
                          <div key={c.k} className="known-pill">
                            <span>k = {c.k}:</span>
                            <code>m[{currentQuestion.i},{c.k}] = {formatNumber(c.left)}</code>,
                            <code>m[{c.k + 1},{currentQuestion.j}] = {formatNumber(c.right)}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Answer Options Grid */}
              <div className="options-grid">
                {currentQuestion.options?.map((costOpt, idx) => {
                  const isSelected = selectedOption === costOpt;
                  let btnClass = 'option-btn';

                  if (isAnswered || revealed) {
                    if (costOpt === currentQuestion.correctCost) btnClass += ' option-correct';
                    else if (isSelected) btnClass += ' option-wrong';
                  } else if (isSelected) {
                    btnClass += ' option-selected';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`${btnClass} font-mono`}
                      onClick={() => {
                        if (!isAnswered) {
                          setSelectedOption(costOpt);
                          handleSubmit(costOpt);
                        }
                      }}
                      disabled={isAnswered}
                    >
                      <span className="opt-marker">{String.fromCharCode(65 + idx)}</span>
                      <span className="opt-text">{formatNumber(costOpt)} operations</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CHALLENGE 2 PROMPT & GIVEN DATA */}
          {currentQuestion && currentQuestion.type === 'split' && challengeType === 'split' && (
            <div className="question-content-area">
              <h4 className="prompt-title">
                Which split index <code>k</code> achieves the optimal (minimum) scalar multiplication cost for <code>m[{currentQuestion.i}][{currentQuestion.j}]</code>?
              </h4>

              {/* Given Information Box */}
              <div className="context-card">
                <div className="context-header">
                  <Calculator size={14} style={{ color: 'var(--accent-pink)' }} />
                  <span>Given Subproblem Costs & Formula:</span>
                </div>
                <div className="context-details font-mono">
                  <div className="context-row">
                    <span className="ctx-lbl">Chain:</span>
                    <span className="ctx-val">
                      {Array.from({ length: currentQuestion.length || 0 }, (_, idx) => {
                        const mIdx = currentQuestion.i + idx;
                        return `A${mIdx} (${currentQuestion.p?.[mIdx - 1]}×${currentQuestion.p?.[mIdx]})`;
                      }).join(', ')}
                    </span>
                  </div>
                  <div className="context-row">
                    <span className="ctx-lbl">Recurrence:</span>
                    <span className="ctx-val highlight-green">
                      Cost(k) = m[{currentQuestion.i}, k] + m[k+1, {currentQuestion.j}] + p[{currentQuestion.i - 1}] × p[k] × p[{currentQuestion.j}]
                    </span>
                  </div>

                  {/* Grid of known table values for each candidate split k */}
                  {currentQuestion.splitBreakdowns && (
                    <div className="subproblem-known-grid">
                      <span className="ctx-lbl">Evaluated Subproblems:</span>
                      <div className="known-pills-list">
                        {currentQuestion.splitBreakdowns.map(sb => (
                          <div key={sb.k} className="known-pill">
                            <strong>k = {sb.k}:</strong>
                            <span>m[{currentQuestion.i},{sb.k}] = {formatNumber(sb.left)}</span>
                            <span>m[{sb.k + 1},{currentQuestion.j}] = {formatNumber(sb.right)}</span>
                            <span>combining = {currentQuestion.p?.[currentQuestion.i - 1]}×{currentQuestion.p?.[sb.k]}×{currentQuestion.p?.[currentQuestion.j]} ({formatNumber(sb.mult)})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Answer Options Grid */}
              <div className="options-grid">
                {currentQuestion.options?.map((opt, idx) => {
                  const isSelected = selectedOption === opt.k;
                  let btnClass = 'option-btn';

                  if (isAnswered || revealed) {
                    if (opt.isOptimal) btnClass += ' option-correct';
                    else if (isSelected) btnClass += ' option-wrong';
                  } else if (isSelected) {
                    btnClass += ' option-selected';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`${btnClass} font-mono`}
                      onClick={() => {
                        if (!isAnswered) {
                          setSelectedOption(opt.k);
                          handleSubmit(opt.k);
                        }
                      }}
                      disabled={isAnswered}
                    >
                      <span className="opt-marker">{String.fromCharCode(65 + idx)}</span>
                      <div className="opt-column">
                        <span className="opt-split-k highlight-pink">Split at k = {opt.k}</span>
                        <span className="opt-grouping text-muted">{opt.grouping}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CHALLENGE 3 PROMPT & GIVEN DATA */}
          {currentQuestion && currentQuestion.type === 'reconstruct' && challengeType === 'reconstruct' && (
            <div className="question-content-area">
              <h4 className="prompt-title">
                Which parenthesization represents the optimal computation for the matrix chain <code>A1...A{currentQuestion.n}</code>?
              </h4>

              {/* Given Information Box */}
              <div className="context-card">
                <div className="context-header">
                  <Layers size={14} style={{ color: 'var(--accent-green)' }} />
                  <span>Chain Dimensions & DP Result:</span>
                </div>
                <div className="context-details font-mono">
                  <div className="context-row">
                    <span className="ctx-lbl">Chain:</span>
                    <span className="ctx-val">
                      {Array.from({ length: currentQuestion.n || 0 }, (_, idx) => {
                        const mIdx = idx + 1;
                        return `A${mIdx} (${currentQuestion.p?.[mIdx - 1]}×${currentQuestion.p?.[mIdx]})`;
                      }).join(', ')}
                    </span>
                  </div>
                  <div className="context-row">
                    <span className="ctx-lbl">Optimal Cost:</span>
                    <span className="ctx-val highlight-green">{formatNumber(currentQuestion.minCost)} multiplications</span>
                  </div>
                </div>
              </div>

              {/* Answer Options Grid */}
              <div className="options-grid">
                {currentQuestion.options?.map((exprOpt, idx) => {
                  const isSelected = selectedOption === exprOpt;
                  let btnClass = 'option-btn';

                  if (isAnswered || revealed) {
                    if (exprOpt === currentQuestion.expr) btnClass += ' option-correct';
                    else if (isSelected) btnClass += ' option-wrong';
                  } else if (isSelected) {
                    btnClass += ' option-selected';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`${btnClass} font-mono`}
                      onClick={() => {
                        if (!isAnswered) {
                          setSelectedOption(exprOpt);
                          handleSubmit(exprOpt);
                        }
                      }}
                      disabled={isAnswered}
                    >
                      <span className="opt-marker">{String.fromCharCode(65 + idx)}</span>
                      <span className="opt-text">{exprOpt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Feedback & Mathematical Explanation Box */}
          {isAnswered && currentQuestion && currentQuestion.type === challengeType && (
            <div className="explanation-results-box">
              <div className="result-header">
                {challengeType === 'cost' && selectedOption === currentQuestion.correctCost ? (
                  <div className="result-status correct-status">
                    <CheckCircle2 size={18} />
                    <span>Correct! m[{currentQuestion.i}][{currentQuestion.j}] = {formatNumber(currentQuestion.correctCost)} multiplications.</span>
                  </div>
                ) : challengeType === 'split' && currentQuestion.optimalSplits?.includes(selectedOption) ? (
                  <div className="result-status correct-status">
                    <CheckCircle2 size={18} />
                    <span>Correct! Split k = {selectedOption} minimizes scalar multiplications.</span>
                  </div>
                ) : challengeType === 'reconstruct' && selectedOption === currentQuestion.expr ? (
                  <div className="result-status correct-status">
                    <CheckCircle2 size={18} />
                    <span>Correct! That is the exact optimal parenthesization.</span>
                  </div>
                ) : (
                  <div className="result-status wrong-status">
                    <XCircle size={18} />
                    <span>Incorrect. Let's see the mathematical evaluation:</span>
                  </div>
                )}
              </div>

              {/* Detailed Breakdown */}
              <div className="breakdown-details font-mono">
                {challengeType === 'cost' && currentQuestion.candidates && (
                  <div className="breakdown-list">
                    <strong>Complete Split Cost Comparison:</strong>
                    {currentQuestion.candidates.map(c => (
                      <div key={c.k} className="breakdown-row">
                        <span>k = {c.k}: {c.breakdown} = <strong>{formatNumber(c.cost)}</strong></span>
                        {currentQuestion.optimalSplits?.includes(c.k) && <span className="winner-tag"> ★ MINIMUM</span>}
                      </div>
                    ))}
                  </div>
                )}

                {challengeType === 'split' && currentQuestion.splitBreakdowns && (
                  <div className="breakdown-list">
                    <strong>Cost Evaluated for Every Split k:</strong>
                    {currentQuestion.splitBreakdowns.map(sb => (
                      <div key={sb.k} className="breakdown-row">
                        <span>k = {sb.k} ({sb.grouping}): {sb.formula}</span>
                        {sb.isOptimal && <span className="winner-tag"> ★ OPTIMAL (MINIMUM)</span>}
                      </div>
                    ))}
                  </div>
                )}

                {challengeType === 'reconstruct' && (
                  <div className="breakdown-list">
                    <div>Optimal expression: <strong>{currentQuestion.expr}</strong></div>
                    <div className="text-muted" style={{ fontSize: '0.74rem' }}>
                      Root split at k = {currentQuestion.rootSplit?.join(', ')} divides the chain into (A1...A{currentQuestion.rootSplit?.[0]}) and (A{(currentQuestion.rootSplit?.[0] || 1) + 1}...A{currentQuestion.n}).
                    </div>
                  </div>
                )}
              </div>

              <div className="retry-row">
                <button type="button" className="btn-next-question" onClick={handleNextQuestion}>
                  <span>Next Challenge</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .practice-container {
          max-width: 1100px;
          margin: 1rem auto;
          padding: 0 1.25rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .practice-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .challenge-tabs {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-wrap: wrap;
        }

        .challenge-tab {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.5rem 0.95rem;
          border-radius: var(--radius-md);
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          transition: all var(--transition-fast);
        }

        .challenge-tab:hover {
          color: var(--text-main);
          border-color: var(--border-medium);
        }

        .active-challenge {
          background: var(--accent-pink-glow);
          color: var(--accent-pink-light);
          border-color: var(--accent-pink);
          font-weight: 700;
        }

        .chain-source-toggle {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .source-label {
          font-size: 0.68rem;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--text-muted);
        }

        .source-pills {
          display: flex;
          align-items: center;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.15rem;
          gap: 0.15rem;
        }

        .source-pill {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.2rem 0.55rem;
          border-radius: 3px;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .source-pill:hover {
          color: var(--text-main);
        }

        .active-source {
          background: var(--accent-green);
          color: #111714;
          font-weight: 700;
        }

        .question-card {
          padding: 1.35rem;
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          border-left: 3px solid var(--accent-pink);
        }

        .question-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .question-header-left {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          flex-wrap: wrap;
        }

        .chain-badge {
          font-size: 0.72rem;
          color: var(--text-muted);
          background: var(--bg-app);
          border: 1px solid var(--border-subtle);
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-sm);
        }

        .question-actions {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .action-btn-small {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.65rem;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .action-btn-small:hover:not(:disabled) {
          color: var(--text-main);
          border-color: var(--border-medium);
        }

        .btn-new-challenge {
          background: var(--accent-pink-glow);
          color: var(--accent-pink-light);
          border-color: var(--accent-pink);
        }

        .hint-alert-box {
          background: var(--bg-app);
          border: 1px solid var(--accent-pink);
          border-radius: var(--radius-md);
          padding: 0.65rem 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.8rem;
          color: var(--accent-pink-light);
        }

        .question-content-area {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .prompt-title {
          font-size: 1.05rem;
          color: var(--text-main);
          font-weight: 750;
          line-height: 1.45;
        }

        .prompt-title code {
          color: var(--accent-pink-light);
        }

        .context-card {
          background: var(--bg-app);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.85rem 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }

        .context-header {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-muted);
        }

        .context-details {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          font-size: 0.78rem;
        }

        .context-row {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .ctx-lbl {
          color: var(--text-muted);
          font-weight: 600;
          min-width: 80px;
        }

        .ctx-val {
          color: var(--text-main);
          word-break: break-word;
        }

        .subproblem-known-grid {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          margin-top: 0.25rem;
          padding-top: 0.45rem;
          border-top: 1px dashed var(--border-subtle);
        }

        .known-pills-list {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .known-pill {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          flex-wrap: wrap;
          font-size: 0.75rem;
          background: var(--bg-surface-elevated);
          padding: 0.25rem 0.55rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }

        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .option-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1.15rem;
          border-radius: var(--radius-md);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          color: var(--text-main);
          font-size: 0.92rem;
          font-weight: 600;
          text-align: left;
          transition: all var(--transition-fast);
        }

        .option-btn:hover:not(:disabled) {
          border-color: var(--accent-pink);
          background: var(--bg-surface-active);
          transform: translateY(-1px);
        }

        .opt-column {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .opt-split-k {
          font-weight: 700;
          font-size: 0.9rem;
        }

        .opt-grouping {
          font-size: 0.75rem;
        }

        .opt-marker {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--bg-app);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .option-correct {
          background: var(--accent-green-glow) !important;
          border-color: var(--accent-green) !important;
          color: var(--accent-green-light) !important;
        }

        .option-wrong {
          background: var(--accent-coral-glow) !important;
          border-color: var(--accent-coral) !important;
          color: var(--accent-coral-light) !important;
        }

        .explanation-results-box {
          background: var(--bg-app);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          padding: 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .result-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.92rem;
          font-weight: 700;
        }

        .correct-status {
          color: var(--accent-green-light);
        }

        .wrong-status {
          color: var(--accent-coral-light);
        }

        .breakdown-details {
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .breakdown-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.5rem;
          flex-wrap: wrap;
          padding: 0.25rem 0.5rem;
          background: var(--bg-surface-elevated);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }

        .winner-tag {
          color: var(--accent-green-light);
          font-weight: 700;
        }

        .retry-row {
          display: flex;
          justify-content: flex-end;
        }

        .btn-next-question {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 1.15rem;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, var(--accent-pink), var(--accent-green));
          color: #111714;
          font-weight: 700;
          font-size: 0.82rem;
          box-shadow: 0 2px 8px var(--accent-pink-glow);
        }

        .btn-next-question:hover {
          box-shadow: 0 4px 14px var(--accent-pink-glow);
          filter: brightness(1.08);
        }

        @media (max-width: 768px) {
          .options-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
