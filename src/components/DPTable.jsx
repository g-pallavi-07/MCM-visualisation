import React, { useState } from 'react';
import { 
  Table, 
  HelpCircle, 
  X,
  Layers 
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export default function DPTable({
  mTable,
  sTable,
  activeCell,
  readCells = [],
  chainLength,
  numMatrices,
  onCellClick,
  candidate
}) {
  const [tableMode, setTableMode] = useState('cost'); // 'cost' or 'split'
  const [showExplanation, setShowExplanation] = useState(false);

  const n = numMatrices;
  if (!mTable || mTable.length === 0) return null;

  // Helper to test if cell is active or read
  const isActive = (i, j) => activeCell && activeCell[0] === i && activeCell[1] === j;
  const isRead = (i, j) => readCells.some(([rI, rJ]) => rI === i && rJ === j);

  return (
    <div className="panel-card dp-table-panel">
      {/* Streamlined Compact Header */}
      <div className="panel-header">
        <div className="header-title-box">
          <div className="panel-title">
            <Table size={16} style={{ color: 'var(--accent-pink)' }} />
            <span>2. DP {tableMode === 'cost' ? 'Cost Table m[i, j]' : 'Split Table s[i, j]'}</span>
          </div>
        </div>

        {/* View Toggle & Why Diagonal Info Button */}
        <div className="header-actions">
          <div className="table-view-toggle">
            <button
              type="button"
              className={`view-toggle-btn ${tableMode === 'cost' ? 'active-view' : ''}`}
              onClick={() => setTableMode('cost')}
            >
              Cost (m)
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${tableMode === 'split' ? 'active-view' : ''}`}
              onClick={() => setTableMode('split')}
            >
              Split (s)
            </button>
          </div>

          <button 
            type="button"
            className={`why-diag-icon-btn ${showExplanation ? 'active-why-btn' : ''}`}
            onClick={() => setShowExplanation(!showExplanation)}
            title="Why does the DP table fill along diagonals?"
          >
            <HelpCircle size={14} />
          </button>
        </div>
      </div>

      {/* Optional Compact Diagonal Explanation (Toggled on demand) */}
      {showExplanation && (
        <div className="diagonal-popover">
          <div className="popover-header">
            <strong>Why is the table filled diagonally?</strong>
            <button type="button" onClick={() => setShowExplanation(false)} className="popover-close">
              <X size={13} />
            </button>
          </div>
          <p>
            Computing <code>m[i][j]</code> requires subproblems <code>m[i][k]</code> and <code>m[k+1][j]</code>, both of which have chain lengths strictly shorter than <code>L = j - i + 1</code>.
            Therefore, all shorter lengths must be computed first before a longer chain can be evaluated.
          </p>
        </div>
      )}

      {/* Grid container */}
      <div className="dp-grid-wrapper">
        <div 
          className="dp-grid-container"
          style={{
            gridTemplateColumns: `38px repeat(${n}, minmax(48px, 1fr))`
          }}
        >
          {/* Top-left corner */}
          <div className="grid-header-cell corner-cell font-mono">
            i \ j
          </div>

          {/* Column indices (j = 1 to n) */}
          {Array.from({ length: n }, (_, idx) => idx + 1).map(j => (
            <div key={`col-h-${j}`} className="grid-header-cell col-header font-mono">
              j={j}
            </div>
          ))}

          {/* Table Rows (i = 1 to n) */}
          {Array.from({ length: n }, (_, rIdx) => rIdx + 1).map(i => (
            <React.Fragment key={`row-${i}`}>
              {/* Row index header */}
              <div className="grid-header-cell row-header font-mono">
                i={i}
              </div>

              {/* Cells in row i */}
              {Array.from({ length: n }, (_, cIdx) => cIdx + 1).map(j => {
                const isDiagonal = i === j;
                const isLowerTriangle = i > j;
                const cellActive = isActive(i, j);
                const cellRead = isRead(i, j);
                const val = mTable[i] ? mTable[i][j] : null;
                const splitVal = sTable[i] ? sTable[i][j] : [];

                if (isLowerTriangle) {
                  return (
                    <div 
                      key={`cell-${i}-${j}`} 
                      className="grid-cell cell-disabled font-mono"
                      title="Lower triangle unused: start index i must be <= end index j"
                    >
                      ✕
                    </div>
                  );
                }

                if (isDiagonal) {
                  return (
                    <div 
                      key={`cell-${i}-${j}`} 
                      className={`grid-cell cell-diagonal font-mono ${cellRead ? 'cell-read' : ''}`}
                      onClick={() => onCellClick && onCellClick(i, j)}
                      title={`m[${i}][${i}] = 0 (Base case: single matrix A${i})`}
                    >
                      <span className="cell-content">0</span>
                      <span className="base-label font-mono">A{i}</span>
                    </div>
                  );
                }

                // Upper triangular cell (i < j)
                let cellClass = 'cell-upper';
                if (cellActive) cellClass += ' cell-active animate-pulse-pink';
                else if (cellRead) cellClass += ' cell-read';
                else if (val !== null) cellClass += ' cell-computed';
                else cellClass += ' cell-uncomputed';

                // Displayed content
                let displayVal = '—';
                if (tableMode === 'cost') {
                  if (cellActive && candidate) {
                    displayVal = `${candidate.totalCost}`;
                  } else if (val !== null) {
                    displayVal = formatNumber(val);
                  }
                } else {
                  // Split table mode
                  if (splitVal && splitVal.length > 0) {
                    displayVal = splitVal.length > 1 ? `k=${splitVal.join(',')}` : `k=${splitVal[0]}`;
                  } else {
                    displayVal = '—';
                  }
                }

                return (
                  <div
                    key={`cell-${i}-${j}`}
                    className={`grid-cell ${cellClass} font-mono`}
                    onClick={() => onCellClick && onCellClick(i, j)}
                    title={`Subproblem m[${i}][${j}] (A${i}...A${j})`}
                  >
                    <span className="cell-coords font-mono">{i},{j}</span>
                    <span className="cell-content">{displayVal}</span>
                    {splitVal && splitVal.length > 1 && (
                      <span className="tie-indicator" title="Multiple optimal splits">
                        tie
                      </span>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Streamlined Footer */}
      <div className="dp-footer-strip">
        {activeCell ? (
          <div className="active-cell-info">
            <span className="info-badge font-mono badge badge-pink">
              Active: m[{activeCell[0]}][{activeCell[1]}]
            </span>
            {candidate && (
              <span className="active-candidate-text font-mono">
                k={candidate.k}: {candidate.leftCell ? `m[${candidate.leftCell[0]}][${candidate.leftCell[1]}]` : `m[${activeCell[0]}][${candidate.k}]`} ({formatNumber(candidate.leftCost)}) + {candidate.rightCell ? `m[${candidate.rightCell[0]}][${candidate.rightCell[1]}]` : `m[${candidate.k + 1}][${activeCell[1]}]`} ({formatNumber(candidate.rightCost)}) + mult ({formatNumber(candidate.multCost)}) = <strong>{formatNumber(candidate.totalCost)}</strong>
              </span>
            )}
          </div>
        ) : (
          <span className="empty-footer-text font-mono">
            Click any cell above to inspect split candidates.
          </span>
        )}
      </div>

      <style>{`
        .dp-table-panel {
          height: 100%;
          max-height: 100%;
          display: flex;
          flex-direction: column;
        }

        .header-title-box {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .table-view-toggle {
          display: flex;
          align-items: center;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.15rem;
          gap: 0.15rem;
        }

        .view-toggle-btn {
          padding: 0.2rem 0.5rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-muted);
          border-radius: 3px;
        }

        .view-toggle-btn.active-view {
          background: var(--accent-pink);
          color: #111714;
          font-weight: 700;
        }

        .why-diag-icon-btn {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 3px;
          color: var(--text-muted);
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
        }

        .why-diag-icon-btn:hover, .active-why-btn {
          color: var(--accent-pink-light);
          border-color: var(--accent-pink);
          background: var(--accent-pink-glow);
        }

        .diagonal-popover {
          background: var(--bg-surface-elevated);
          border-bottom: 1px solid var(--border-medium);
          padding: 0.65rem 0.85rem;
          font-size: 0.76rem;
          color: var(--text-main);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          animation: slideDown 0.12s ease-out;
        }

        .popover-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--accent-pink-light);
          font-size: 0.78rem;
        }

        .popover-close {
          color: var(--text-muted);
          background: transparent;
        }

        .dp-grid-wrapper {
          flex: 1;
          overflow: auto;
          padding: 0.65rem;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }

        .dp-grid-container {
          display: grid;
          gap: 4px;
          user-select: none;
        }

        .grid-header-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          padding: 0.25rem;
        }

        .corner-cell {
          background: var(--bg-surface-elevated);
          border-radius: var(--radius-sm);
        }

        .grid-cell {
          min-height: 56px;
          min-width: 56px;
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
          transition: all var(--transition-fast);
          padding: 0.15rem;
        }

        .cell-coords {
          position: absolute;
          top: 2px;
          left: 3px;
          font-size: 0.55rem;
          color: var(--text-faint);
        }

        .cell-content {
          font-size: 0.8rem;
          font-weight: 700;
        }

        .cell-disabled {
          background: rgba(15, 23, 42, 0.4);
          color: var(--border-medium);
          cursor: not-allowed;
          font-size: 0.72rem;
        }

        .cell-diagonal {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
        }

        .base-label {
          font-size: 0.58rem;
          color: var(--accent-green-light);
        }

        .cell-upper {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
        }

        .cell-upper:hover {
          border-color: var(--accent-pink);
          transform: scale(1.02);
          z-index: 10;
        }

        .cell-computed {
          background: var(--bg-surface-elevated);
          border-color: var(--border-medium);
          color: var(--accent-green-light);
        }

        .cell-uncomputed {
          color: var(--text-faint);
          background: var(--bg-app);
        }

        .cell-active {
          background: var(--bg-surface-active) !important;
          border-color: var(--accent-pink) !important;
          color: #ffffff !important;
          box-shadow: 0 0 12px var(--accent-pink-glow);
          transform: scale(1.04);
          z-index: 20;
        }

        .cell-read {
          border: 2px dashed var(--accent-green) !important;
          background: var(--accent-green-glow) !important;
          color: var(--text-main) !important;
          z-index: 15;
        }

        .tie-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          font-size: 0.52rem;
          font-weight: 700;
          color: var(--accent-amber-light);
          background: var(--accent-amber-glow);
          padding: 0 0.15rem;
          border-radius: 2px;
          text-transform: uppercase;
        }

        .dp-footer-strip {
          padding: 0.35rem 0.85rem;
          background: var(--bg-surface-elevated);
          border-top: 1px solid var(--border-subtle);
          min-height: 32px;
          display: flex;
          align-items: center;
        }

        .active-cell-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .active-candidate-text {
          font-size: 0.73rem;
          color: var(--text-main);
        }

        .empty-footer-text {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
