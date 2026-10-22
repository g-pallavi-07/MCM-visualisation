import React, { useState } from 'react';
import { 
  Calculator, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  CheckCircle2, 
  Info,
  Layers
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export default function CalculationInspector({
  activeCell,
  candidate,
  allCandidates = [],
  dimensions,
  winningSplit,
  allWinningSplits = [],
  mTable,
  isExpanded,
  onToggleExpand
}) {
  if (!activeCell) return null;

  const [i, j] = activeCell;
  const chainLength = j - i + 1;
  const isBaseCase = i === j;
  const cellSolved = mTable[i] && mTable[i][j] !== null;

  // Best cost so far
  const bestCostSoFar = candidate?.currentBestCost ?? (cellSolved ? mTable[i][j] : null);

  return (
    <div className="inspector-container panel-card">
      {/* Inspector Header / Collapsed Summary Bar */}
      <div 
        className="inspector-header-bar"
        onClick={onToggleExpand}
        title={isExpanded ? 'Click to collapse calculation details' : 'Click to expand calculation details'}
      >
        <div className="header-left">
          <div className="icon-box">
            <Calculator size={15} style={{ color: 'var(--accent-pink)' }} />
          </div>
          <div className="summary-tags">
            <span className="summary-cell font-mono">
              m[{i}][{j}]
            </span>
            <span className="summary-dim font-mono">
              A{i}..A{j} (L={chainLength})
            </span>
            {candidate ? (
              <span className="summary-split font-mono">
                Testing split <strong>k = {candidate.k}</strong>: Candidate Cost = <strong>{formatNumber(candidate.totalCost)}</strong>
              </span>
            ) : isBaseCase ? (
              <span className="summary-base font-mono">
                Single matrix: cost = 0
              </span>
            ) : cellSolved ? (
              <span className="summary-solved font-mono highlight-green">
                Completed: min cost = <strong>{formatNumber(mTable[i][j])}</strong>, split k = <strong>{allWinningSplits.join(', ')}</strong>
              </span>
            ) : (
              <span className="summary-idle font-mono text-muted">
                Waiting for candidate evaluation...
              </span>
            )}
          </div>
        </div>

        <div className="header-right">
          <span className="expand-hint">
            {isExpanded ? 'Collapse' : 'Show full calculation'}
          </span>
          <button 
            type="button" 
            className="toggle-icon-btn"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Detailed Breakdown */}
      {isExpanded && (
        <div className="inspector-body">
          {isBaseCase ? (
            <div className="base-case-notice">
              <h4>Base Case: Single Matrix A{i}</h4>
              <p>
                Since <code>i = j = {i}</code>, no multiplication takes place. Scalar multiplications cost: <code>m[{i}][{i}] = 0</code>.
              </p>
            </div>
          ) : (
            <>
              {/* Stage 1 & 2: Subproblem Context */}
              <div className="subproblem-context-row">
                <div className="context-item">
                  <span className="context-label">Subproblem:</span>
                  <span className="context-val font-mono">
                    A{i} ({dimensions[i - 1]}×{dimensions[i]}) through A{j} ({dimensions[j - 1]}×{dimensions[j]})
                  </span>
                </div>
                <div className="context-item">
                  <span className="context-label">Possible Split Points:</span>
                  <span className="context-val font-mono">
                    k ∈ [{Array.from({ length: j - i }, (_, idx) => i + idx).join(', ')}]
                  </span>
                </div>
                <div className="context-item">
                  <span className="context-label">Current Best Cost:</span>
                  <span className="context-val font-mono highlight-green">
                    {bestCostSoFar !== null ? formatNumber(bestCostSoFar) : 'Waiting for candidate evaluation'}
                  </span>
                </div>
              </div>

              {/* Stage 3: Readable Candidate Table */}
              <div className="candidates-table-card">
                <table className="candidates-table font-mono">
                  <thead>
                    <tr>
                      <th>Split (k)</th>
                      <th>Left Subproblem m[i,k]</th>
                      <th>Right Subproblem m[k+1,j]</th>
                      <th>Multiplication Cost (p[i-1]·p[k]·p[j])</th>
                      <th>Total Cost</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="empty-cell">
                          Waiting for candidate evaluation...
                        </td>
                      </tr>
                    ) : (
                      allCandidates.map(c => {
                        const isCurrent = candidate?.k === c.k;
                        const isOptimal = allWinningSplits.includes(c.k) && (cellSolved || c.isNewBest || c.isTie);

                        let rowClass = 'cand-row';
                        if (isOptimal) rowClass += ' row-optimal';
                        else if (isCurrent) rowClass += ' row-active';
                        else rowClass += ' row-neutral';

                        return (
                          <tr key={c.k} className={rowClass}>
                            <td>
                              <strong>k = {c.k}</strong>
                            </td>
                            <td>
                              m[{i},{c.k}] = {formatNumber(c.leftCost)}
                            </td>
                            <td>
                              m[{c.k + 1},{j}] = {formatNumber(c.rightCost)}
                            </td>
                            <td>
                              {c.p_im1} × {c.p_k} × {c.p_j} = {formatNumber(c.multCost)}
                            </td>
                            <td className="total-td">
                              <strong>{formatNumber(c.totalCost)}</strong>
                            </td>
                            <td>
                              {isOptimal ? (
                                <span className="status-pill status-win">★ Optimal</span>
                              ) : isCurrent ? (
                                <span className="status-pill status-eval">Testing</span>
                              ) : (
                                <span className="status-pill status-other">Candidate</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Stage 4: Optimal Split & Dimension Theorem */}
              <div className="inspector-summary-footer font-mono">
                {allWinningSplits.length > 0 ? (
                  <div className="footer-winner">
                    Optimal Split: <strong>k = {allWinningSplits.join(', ')}</strong> with minimum scalar cost = <strong>{formatNumber(bestCostSoFar)}</strong>
                    {allWinningSplits.length > 1 && (
                      <span className="tie-flag"> (Tie: multiple optimal splits!)</span>
                    )}
                  </div>
                ) : (
                  <div className="footer-winner text-muted">
                    Evaluating candidate splits...
                  </div>
                )}
                <div className="footer-dim-rule">
                  Dimension rule: ({dimensions[i - 1]} × {dimensions[candidate?.k || i]}) × ({dimensions[candidate?.k || i]} × {dimensions[j]}) → <strong>{dimensions[i - 1]} × {dimensions[j]}</strong>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        .inspector-container {
          margin: 0 1.25rem 0.65rem;
          transition: border-color var(--transition-fast);
        }

        .inspector-header-bar {
          padding: 0.65rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          user-select: none;
          background: var(--bg-surface);
        }

        .inspector-header-bar:hover {
          background: var(--bg-surface-elevated);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .icon-box {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          background: var(--accent-pink-glow);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cyan { color: var(--accent-pink-light); }

        .summary-tags {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
          font-size: 0.78rem;
        }

        .summary-cell {
          font-weight: 700;
          color: var(--accent-pink-light);
          background: var(--bg-app);
          border: 1px solid rgba(244, 114, 182, 0.3);
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-sm);
        }

        .summary-dim {
          color: var(--text-muted);
        }

        .summary-split {
          color: var(--text-main);
        }

        .summary-split strong {
          color: var(--accent-pink-light);
        }

        .summary-solved {
          color: var(--accent-green-light);
        }

        .summary-base {
          color: var(--accent-green-light);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .expand-hint {
          font-size: 0.73rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .toggle-icon-btn {
          color: var(--text-muted);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .inspector-body {
          border-top: 1px solid var(--border-subtle);
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          background: var(--bg-surface-elevated);
        }

        .base-case-notice {
          padding: 0.5rem;
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .base-case-notice h4 {
          color: var(--text-main);
          margin-bottom: 0.25rem;
        }

        .subproblem-context-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          background: var(--bg-app);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
        }

        .context-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .context-label {
          color: var(--text-muted);
          font-weight: 600;
        }

        .context-val {
          color: var(--text-main);
          font-weight: 600;
        }

        .candidates-table-card {
          overflow-x: auto;
          background: var(--bg-app);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
        }

        .candidates-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.74rem;
        }

        .candidates-table th {
          text-align: left;
          padding: 0.45rem 0.65rem;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-medium);
          background: var(--bg-surface);
          font-weight: 600;
        }

        .candidates-table td {
          padding: 0.45rem 0.65rem;
          border-bottom: 1px solid var(--border-subtle);
          color: var(--text-main);
        }

        .cand-row {
          transition: background var(--transition-fast);
        }

        .row-active {
          background: rgba(244, 114, 182, 0.12) !important;
        }

        .row-optimal {
          background: rgba(110, 231, 183, 0.14) !important;
        }

        .row-neutral {
          opacity: 0.75;
        }

        .total-td {
          color: var(--accent-pink-light);
        }

        .row-optimal .total-td {
          color: var(--accent-green-light);
        }

        .status-pill {
          display: inline-block;
          font-size: 0.68rem;
          padding: 0.1rem 0.45rem;
          border-radius: var(--radius-full);
          font-weight: 700;
        }

        .status-win {
          background: var(--accent-green-glow);
          color: var(--accent-green-light);
          border: 1px solid rgba(110, 231, 183, 0.35);
        }

        .status-eval {
          background: var(--accent-pink-glow);
          color: var(--accent-pink-light);
          border: 1px solid rgba(244, 114, 182, 0.35);
        }

        .status-other {
          background: var(--bg-surface-elevated);
          color: var(--text-muted);
          border: 1px solid var(--border-subtle);
        }

        .empty-cell {
          text-align: center;
          padding: 1rem;
          color: var(--text-muted);
          font-style: italic;
        }

        .inspector-summary-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          font-size: 0.74rem;
          padding: 0.25rem 0;
        }

        .footer-winner {
          color: var(--accent-green-light);
        }

        .tie-flag {
          color: var(--accent-pink-light);
          font-weight: 700;
        }

        .footer-dim-rule {
          color: var(--text-muted);
        }

        .footer-dim-rule strong {
          color: var(--accent-pink-light);
        }
      `}</style>
    </div>
  );
}
