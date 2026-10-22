import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  Repeat, 
  Zap, 
  CheckCircle2, 
  GitBranch, 
  DollarSign, 
  ChevronDown, 
  ChevronUp,
  BarChart2,
  Clock
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export default function MetricsBar({ metrics, algorithmMode, numMatrices, chainLength }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!metrics) return null;

  const totalNontrivialCells = numMatrices ? (numMatrices * (numMatrices + 1)) / 2 : 0;

  return (
    <div className="status-bar-container">
      {/* Primary Compact Status Bar */}
      <div className="status-strip panel-card">
        <div className="status-items-group">
          {/* Item 1: Chain Length */}
          <div className="status-item">
            <span className="status-label">Chain Length:</span>
            <span className="status-val font-mono highlight-cyan">
              L = {chainLength || 1} / {numMatrices}
            </span>
          </div>

          {/* Item 2: Cells Solved */}
          <div className="status-item">
            <span className="status-label">DP Cells Solved:</span>
            <span className="status-val font-mono">
              {metrics.cellsCompleted} 
              <span className="status-sub font-mono">/{totalNontrivialCells}</span>
            </span>
          </div>

          {/* Item 3: Splits Tested */}
          <div className="status-item">
            <span className="status-label">Splits Evaluated:</span>
            <span className="status-val font-mono">
              {metrics.splitEvaluations}
            </span>
          </div>

          {/* Item 4: Current / Final Optimal Cost */}
          <div className="status-item status-highlight">
            <span className="status-label">Optimal Scalar Cost:</span>
            <span className="status-val font-mono highlight-green">
              {metrics.minCost !== null ? formatNumber(metrics.minCost) : 'Computing...'}
            </span>
          </div>
        </div>

        {/* Collapsible Toggle for Performance Details */}
        <button
          type="button"
          className={`details-toggle-btn ${showDetails ? 'active-details-btn' : ''}`}
          onClick={() => setShowDetails(!showDetails)}
          title="Toggle advanced execution instrumentation"
        >
          <BarChart2 size={13} />
          <span>Performance Details</span>
          {showDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Secondary Collapsible Performance Details Panel */}
      {showDetails && (
        <div className="performance-details-panel panel-card">
          <div className="details-grid">
            {/* Function / Recursive Calls */}
            <div className="detail-card">
              <div className="detail-icon-box">
                <Cpu size={14} className="cyan" />
              </div>
              <div className="detail-content">
                <span className="detail-title">
                  {algorithmMode === 'tabulation' ? 'Function Calls' : 'Recursive Calls'}
                </span>
                <span className="detail-number font-mono">
                  {formatNumber(metrics.functionCalls)}
                </span>
                <span className="detail-note">
                  {algorithmMode === 'tabulation' 
                    ? '0 calls (Tabulation runs iteratively)' 
                    : `${metrics.functionCalls} total call stack entries`}
                </span>
              </div>
            </div>

            {/* Unique Subproblems */}
            <div className="detail-card">
              <div className="detail-icon-box">
                <Layers size={14} className="indigo" />
              </div>
              <div className="detail-content">
                <span className="detail-title">Unique Subproblems</span>
                <span className="detail-number font-mono">
                  {formatNumber(metrics.uniqueSubproblems)}
                </span>
                <span className="detail-note">
                  Out of n(n+1)/2 = {totalNontrivialCells} distinct subchains
                </span>
              </div>
            </div>

            {/* Redundancy / Caching */}
            <div className="detail-card">
              <div className="detail-icon-box">
                <Repeat size={14} className="coral" />
              </div>
              <div className="detail-content">
                <span className="detail-title">
                  {algorithmMode === 'brute_force'
                    ? 'Repeated Calls Executed'
                    : algorithmMode === 'memoization'
                    ? 'Cache Hits (Redundant avoided)'
                    : 'Redundant Calls Avoided'}
                </span>
                <span className="detail-number font-mono highlight-coral">
                  {formatNumber(metrics.duplicateEvaluations)}
                </span>
                <span className="detail-note">
                  {algorithmMode === 'brute_force'
                    ? 'Recomputed repeatedly by naive recursion'
                    : 'Saved by memoization / tabulation table'}
                </span>
              </div>
            </div>

            {/* Cache Hits & Misses (Memoization mode) or Theoretical Complexity */}
            <div className="detail-card">
              <div className="detail-icon-box">
                <Zap size={14} className="green" />
              </div>
              <div className="detail-content">
                <span className="detail-title">
                  {algorithmMode === 'memoization' ? 'Cache Hits / Misses' : 'Time Complexity'}
                </span>
                <span className="detail-number font-mono">
                  {algorithmMode === 'memoization' ? (
                    <>
                      <span className="highlight-green">{metrics.cacheHits}</span>
                      <span className="text-muted"> / </span>
                      <span className="highlight-coral">{metrics.cacheMisses}</span>
                    </>
                  ) : algorithmMode === 'tabulation' ? (
                    'O(n³)'
                  ) : (
                    'O(2ⁿ)'
                  )}
                </span>
                <span className="detail-note">
                  {algorithmMode === 'tabulation'
                    ? 'Polynomial: n(n-1)(n+1)/6 split evaluations'
                    : algorithmMode === 'memoization'
                    ? `${metrics.cacheHits} O(1) table lookups`
                    : 'Exponential growth of subproblem branches'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .status-bar-container {
          margin: 0 1.25rem 0.65rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .status-strip {
          padding: 0.45rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .status-items-group {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.78rem;
        }

        .status-label {
          color: var(--text-muted);
          font-weight: 600;
        }

        .status-val {
          font-weight: 700;
          color: var(--text-main);
        }

        .status-sub {
          font-size: 0.68rem;
          color: var(--text-faint);
          font-weight: 500;
        }

        .status-highlight {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 0.15rem 0.65rem;
          border-radius: var(--radius-sm);
        }

        .details-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-sm);
          font-size: 0.73rem;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          transition: all var(--transition-fast);
        }

        .details-toggle-btn:hover {
          color: var(--text-main);
          border-color: var(--border-medium);
        }

        .active-details-btn {
          background: var(--accent-primary-glow);
          color: var(--accent-primary-light);
          border-color: var(--accent-primary);
        }

        .performance-details-panel {
          padding: 0.85rem 1rem;
          animation: fadeIn 0.15s ease-out;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 0.75rem;
        }

        .detail-card {
          background: var(--bg-app);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.65rem 0.85rem;
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
        }

        .detail-icon-box {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          background: var(--bg-surface-elevated);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .detail-content {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .detail-title {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.02em;
        }

        .detail-number {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .detail-note {
          font-size: 0.7rem;
          color: var(--text-faint);
          line-height: 1.3;
        }

        .cyan { color: var(--accent-cyan-light); }
        .indigo { color: var(--accent-primary-light); }
        .coral { color: var(--accent-coral-light); }
        .green { color: var(--accent-green-light); }
      `}</style>
    </div>
  );
}
