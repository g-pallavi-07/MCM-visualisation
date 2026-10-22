import React, { useState } from 'react';
import { 
  Network, 
  GitMerge, 
  FileCode, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  Layers, 
  Clock, 
  ArrowRight
} from 'lucide-react';
import { 
  reconstructExpression, 
  reconstructParenthesizationTree, 
  findAllTies 
} from '../algorithm/mcm';
import { formatNumber } from '../utils/formatters';

export default function ParenthesizationTree({
  dimensions,
  currentStepSTable,
  finalSTable,
  isFinished,
  minCost,
  activeCell,
  winningSplit
}) {
  const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'expression' | 'steps'
  const [tieChoices, setTieChoices] = useState({}); // { "1,4": 2 }
  const [selectedNode, setSelectedNode] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const n = dimensions.length - 1;

  // Determine which split table to use:
  // If isFinished or user toggled preview, use finalSTable. Otherwise use currentStepSTable.
  const activeSTable = (isFinished || showPreview) ? finalSTable : currentStepSTable;

  // Check if sTable has root split for A1..An
  const hasRootSplit = activeSTable && activeSTable[1] && activeSTable[1][n] && activeSTable[1][n].length > 0;

  // Find all ties in the active table
  const ties = hasRootSplit ? findAllTies(activeSTable, n) : [];

  // Reconstruct tree and expression
  const treeRoot = hasRootSplit 
    ? reconstructParenthesizationTree(dimensions, activeSTable, 1, n, tieChoices)
    : null;

  const expressionStr = hasRootSplit 
    ? reconstructExpression(activeSTable, 1, n, tieChoices)
    : (activeCell ? `Solving subproblem m[${activeCell[0]}][${activeCell[1]}]...` : 'Initializing...');

  // Handle tie split selection
  const handleSelectTieSplit = (i, j, chosenK) => {
    setTieChoices(prev => ({
      ...prev,
      [`${i},${j}`]: chosenK
    }));
  };

  // Render SVG Binary Tree
  const renderTreeSVG = () => {
    if (!treeRoot) return null;

    const nodeRadius = 22;
    const levelHeight = 65;
    let currentX = 35;
    const placedNodes = [];
    const placedEdges = [];

    const assignCoords = (node, depth = 0) => {
      if (!node) return null;

      let leftCoord = null;
      let rightCoord = null;

      if (node.type === 'internal') {
        leftCoord = assignCoords(node.left, depth + 1);
      }

      const x = currentX;
      currentX += 54;
      const y = depth * levelHeight + 35;

      if (node.type === 'internal') {
        rightCoord = assignCoords(node.right, depth + 1);
      }

      const coord = { x, y, node };
      placedNodes.push(coord);

      if (leftCoord) {
        placedEdges.push({ from: coord, to: leftCoord });
      }
      if (rightCoord) {
        placedEdges.push({ from: coord, to: rightCoord });
      }

      return coord;
    };

    assignCoords(treeRoot);

    const svgWidth = Math.max(340, currentX + 35);
    const svgHeight = (treeRoot.depth + 1) * levelHeight + 140;

    return (
      <svg className="parenthesization-svg" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        <g className="edges-group">
          {placedEdges.map((e, idx) => (
            <line
              key={`edge-${idx}`}
              x1={e.from.x}
              y1={e.from.y}
              x2={e.to.x}
              y2={e.to.y}
              stroke="var(--border-medium)"
              strokeWidth={2}
            />
          ))}
        </g>

        <g className="nodes-group">
          {placedNodes.map((item, idx) => {
            const { x, y, node } = item;
            const isLeaf = node.type === 'leaf';
            const isSelected = selectedNode?.id === node.id;

            return (
              <g
                key={`tree-node-${idx}`}
                className={`tree-node ${isLeaf ? 'node-leaf' : 'node-internal'} ${isSelected ? 'node-selected' : ''}`}
                transform={`translate(${x}, ${y})`}
                onClick={() => setSelectedNode(node)}
              >
                {isLeaf ? (
                  <rect
                    x={-20}
                    y={-16}
                    width={40}
                    height={32}
                    rx={6}
                    className="leaf-rect"
                  />
                ) : (
                  <circle
                    r={nodeRadius}
                    className="internal-circle"
                  />
                )}

                <text
                  textAnchor="middle"
                  dy={isLeaf ? -2 : 4}
                  className="tree-node-text font-mono"
                >
                  {isLeaf ? node.name : `k=${node.splitK}`}
                </text>

                <text
                  textAnchor="middle"
                  dy={isLeaf ? 11 : 32}
                  className="tree-dim-text font-mono"
                >
                  {isLeaf ? node.dimText : node.resultingDim}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    );
  };

  // Step-by-step trace
  const renderStepsBreakdown = () => {
    if (!treeRoot) return null;

    const operations = [];
    const extractOps = (node) => {
      if (node.type === 'leaf') return node.name;
      const leftExpr = extractOps(node.left);
      const rightExpr = extractOps(node.right);
      const leftDim = node.left.type === 'leaf' ? node.left.dimText : node.left.resultingDim;
      const rightDim = node.right.type === 'leaf' ? node.right.dimText : node.right.resultingDim;

      operations.push({
        stepNum: operations.length + 1,
        leftExpr,
        rightExpr,
        leftDim,
        rightDim,
        resultingDim: node.resultingDim,
        scalarMultCost: node.scalarMultCost,
        multEquation: `(${node.dimRow} × ${dimensions[node.splitK]} × ${node.dimCol}) = ${formatNumber(node.scalarMultCost)}`
      });

      return `(${leftExpr} × ${rightExpr})`;
    };

    extractOps(treeRoot);

    return (
      <div className="steps-list">
        <div className="steps-header-desc">
          Total Multiplications Required: <strong>{operations.length}</strong> (always <code>n - 1</code>)
        </div>
        {operations.map(op => (
          <div key={op.stepNum} className="step-card">
            <div className="step-badge badge badge-pink">Step {op.stepNum}</div>
            <div className="step-body">
              <div className="step-expr font-mono">
                {op.leftExpr} × {op.rightExpr}
              </div>
              <div className="step-dims font-mono">
                ({op.leftDim}) × ({op.rightDim}) → <strong>{op.resultingDim}</strong>
              </div>
              <div className="step-cost font-mono">
                Cost: <code>{op.multEquation}</code>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="panel-card parenthesization-panel">
      {/* Compact Header */}
      <div className="panel-header">
        <div>
          <div className="panel-title">
            <Network size={16} style={{ color: 'var(--accent-green)' }} />
            <span>3. Optimal Parenthesization</span>
          </div>
          <div className="panel-subtitle">
            {isFinished 
              ? '★ Confirmed optimal solution' 
              : showPreview 
              ? 'Final result preview (solving in progress...)' 
              : 'Reconstructing from DP split table...'}
          </div>
        </div>

        {/* View Toggle */}
        <div className="view-mode-toggle">
          <button
            type="button"
            className={`view-btn ${viewMode === 'tree' ? 'active-view' : ''}`}
            onClick={() => setViewMode('tree')}
          >
            Tree
          </button>
          <button
            type="button"
            className={`view-btn ${viewMode === 'expression' ? 'active-view' : ''}`}
            onClick={() => setViewMode('expression')}
          >
            Formula
          </button>
          <button
            type="button"
            className={`view-btn ${viewMode === 'steps' ? 'active-view' : ''}`}
            onClick={() => setViewMode('steps')}
          >
            Steps
          </button>
        </div>
      </div>

      {/* Status & Expression Banner */}
      <div className="expression-banner">
        <div className="banner-status-tag">
          {isFinished ? (
            <span className="badge badge-green font-mono">
              <CheckCircle2 size={12} />
              <span>Confirmed Optimal</span>
            </span>
          ) : (
            <span className="badge badge-amber font-mono">
              <Clock size={12} />
              <span>In Progress (Step by Step)</span>
            </span>
          )}
        </div>
        <div className="expression-code font-mono">
          {hasRootSplit ? expressionStr : `Solving subproblems... m[1][${n}] pending`}
        </div>
        {!isFinished && (
          <button
            type="button"
            className="preview-toggle-btn"
            onClick={() => setShowPreview(!showPreview)}
            title="Toggle preview of the final reconstructed tree"
          >
            {showPreview ? 'Hide Preview' : 'Preview Final Tree'}
          </button>
        )}
      </div>

      {/* Multiple Optimal Solutions / Tie Alert */}
      {ties.length > 0 && (
        <div className="ties-banner">
          <div className="ties-header">
            <Sparkles size={13} className="amber" />
            <strong>Multiple Optimal Parenthesizations (Ties):</strong>
          </div>
          <div className="ties-list">
            {ties.map(t => (
              <div key={`tie-${t.i}-${t.j}`} className="tie-selector-row">
                <span className="font-mono">A{t.i}..A{t.j}:</span>
                <div className="tie-pills">
                  {t.splits.map(k => {
                    const currentChosen = tieChoices[`${t.i},${t.j}`] ?? t.splits[0];
                    const isSelected = currentChosen === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        className={`tie-pill ${isSelected ? 'active-tie' : ''}`}
                        onClick={() => handleSelectTieSplit(t.i, t.j, k)}
                      >
                        k={k}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main View Area */}
      <div className="parenthesization-viewport">
        {!hasRootSplit && !showPreview ? (
          <div className="solving-placeholder">
            <Layers size={22} className="text-muted" />
            <div className="placeholder-text">
              <strong>Split Table s[1][{n}] in Progress</strong>
              <p>
                The complete parenthesization tree is reconstructed once cell <code>m[1][{n}]</code> is calculated.
              </p>
              <button
                type="button"
                className="btn-show-preview"
                onClick={() => setShowPreview(true)}
              >
                Preview Final Solution Tree
              </button>
            </div>
          </div>
        ) : viewMode === 'tree' ? (
          <div className="svg-tree-container">
            {renderTreeSVG()}
          </div>
        ) : viewMode === 'expression' ? (
          <div className="expression-detail-view">
            <div className="detail-box">
              <h4>Parenthesized Multiplication Expression</h4>
              <div className="large-expression font-mono">
                {expressionStr}
              </div>
              <div className="detail-metrics-grid">
                <div className="detail-metric">
                  <span className="detail-label">Scalar Cost:</span>
                  <span className="detail-val font-mono highlight-green">
                    {minCost !== null ? formatNumber(minCost) : '—'}
                  </span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">Multiplications:</span>
                  <span className="detail-val font-mono">
                    {n - 1} operations
                  </span>
                </div>
                <div className="detail-metric">
                  <span className="detail-label">Resulting Dimensions:</span>
                  <span className="detail-val font-mono">
                    {dimensions[0]} × {dimensions[n]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="steps-container">
            {renderStepsBreakdown()}
          </div>
        )}
      </div>

      {/* Footer Details */}
      <div className="panel-footer-stats">
        <span className="footer-stat">
          Multiplications: <strong>{n - 1}</strong>
        </span>
        <span className="footer-stat">
          Output: <strong>{dimensions[0]} × {dimensions[n]}</strong>
        </span>
        <span className="footer-stat">
          Cost: <strong className="highlight-green">{minCost !== null ? formatNumber(minCost) : '—'}</strong>
        </span>
      </div>

      <style>{`
        .parenthesization-panel {
          height: 480px;
          display: flex;
          flex-direction: column;
        }

        .view-mode-toggle {
          display: flex;
          align-items: center;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.15rem;
          gap: 0.15rem;
        }

        .view-btn {
          padding: 0.2rem 0.55rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-muted);
          border-radius: var(--radius-sm);
        }

        .view-btn.active-view {
          background: var(--accent-green);
          color: #080d1a;
          font-weight: 700;
        }

        .expression-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.45rem 0.85rem;
          background: var(--bg-app);
          border-bottom: 1px solid var(--border-subtle);
          font-size: 0.75rem;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .expression-code {
          color: var(--accent-green-light);
          font-weight: 700;
          font-size: 0.82rem;
        }

        .preview-toggle-btn {
          font-size: 0.68rem;
          font-weight: 600;
          color: var(--accent-pink-light);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-sm);
        }

        .preview-toggle-btn:hover {
          border-color: var(--accent-pink);
        }

        .ties-banner {
          background: var(--bg-surface-elevated);
          border-bottom: 1px solid var(--border-medium);
          padding: 0.45rem 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.73rem;
          flex-wrap: wrap;
        }

        .ties-header {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--accent-pink-light);
        }

        .ties-list {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
        }

        .tie-selector-row {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .tie-pills {
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }

        .tie-pill {
          padding: 0.1rem 0.35rem;
          border-radius: var(--radius-sm);
          font-size: 0.68rem;
          background: var(--bg-app);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
        }

        .tie-pill.active-tie {
          background: var(--accent-pink-glow);
          color: var(--accent-pink-light);
          border-color: var(--accent-pink);
          font-weight: 700;
        }

        .parenthesization-viewport {
          flex: 1;
          overflow: auto;
          position: relative;
          padding: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .solving-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.65rem;
          text-align: center;
          padding: 1.5rem;
          max-width: 300px;
        }

        .placeholder-text strong {
          color: var(--text-main);
          font-size: 0.85rem;
          display: block;
          margin-bottom: 0.25rem;
        }

        .placeholder-text p {
          font-size: 0.76rem;
          color: var(--text-muted);
          line-height: 1.4;
          margin-bottom: 0.65rem;
        }

        .btn-show-preview {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--accent-pink-light);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--accent-pink);
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
        }

        .svg-tree-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          overflow: auto;
        }

        .parenthesization-svg {
          min-width: 100%;
          min-height: 100%;
        }

        .tree-node {
          cursor: pointer;
        }

        .leaf-rect {
          fill: var(--bg-surface-elevated);
          stroke: var(--accent-pink);
          stroke-width: 1.5;
        }

        .internal-circle {
          fill: var(--bg-surface-elevated);
          stroke: var(--accent-green);
          stroke-width: 2;
        }

        .node-selected .internal-circle,
        .node-selected .leaf-rect {
          stroke: var(--accent-pink);
          filter: drop-shadow(0 0 8px var(--accent-pink-glow));
        }

        .tree-node-text {
          font-size: 11px;
          font-weight: 700;
          fill: var(--text-main);
        }

        .tree-dim-text {
          font-size: 8px;
          font-weight: 600;
          fill: var(--accent-pink-light);
        }

        .expression-detail-view, .steps-container {
          width: 100%;
          height: 100%;
          overflow-y: auto;
        }

        .detail-box {
          background: var(--bg-app);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-box h4 {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .large-expression {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--accent-green-light);
          background: var(--bg-surface-elevated);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-medium);
          text-align: center;
        }

        .detail-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 0.5rem;
        }

        .detail-metric {
          background: var(--bg-surface-elevated);
          padding: 0.5rem 0.65rem;
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .detail-label {
          font-size: 0.68rem;
          color: var(--text-muted);
        }

        .detail-val {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          width: 100%;
        }

        .steps-header-desc {
          font-size: 0.74rem;
          color: var(--text-muted);
        }

        .step-card {
          background: var(--bg-app);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.5rem 0.75rem;
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
        }

        .step-body {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .step-expr {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .step-dims {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .step-cost {
          font-size: 0.7rem;
          color: var(--accent-green-light);
        }

        .panel-footer-stats {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.4rem 0.85rem;
          background: var(--bg-surface-elevated);
          border-top: 1px solid var(--border-subtle);
          font-size: 0.72rem;
        }

        .footer-stat {
          color: var(--text-muted);
        }

        .footer-stat strong {
          color: var(--text-main);
        }
      `}</style>
    </div>
  );
}
