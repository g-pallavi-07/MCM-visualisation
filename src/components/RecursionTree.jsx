import React, { useState, useRef, useEffect } from 'react';
import { 
  GitFork, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  RotateCcw,
  Info, 
  AlertCircle, 
  Layers, 
  CheckCircle2, 
  Repeat, 
  Zap 
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export default function RecursionTree({
  treeNodes,
  activeNodeId,
  algorithmMode,
  onNodeClick,
  dimensions
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const n = dimensions.length - 1;

  // Handle Esc key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Reset zoom & pan on new run
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Mouse pan handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only primary click
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Layout tree in 2D coordinates
  const nodesArray = Object.values(treeNodes || {});
  
  // Calculate tree depth and layout positions
  const levels = {};
  nodesArray.forEach(node => {
    if (!levels[node.depth]) levels[node.depth] = [];
    levels[node.depth].push(node);
  });

  const levelHeights = 85;
  const nodeWidth = 140;
  const nodeHeight = 54;
  const horizontalGap = 20;

  // Assign x, y to each node
  const nodeCoords = {};
  Object.keys(levels).forEach(depthStr => {
    const depth = Number(depthStr);
    const rowNodes = levels[depth];
    const totalRowWidth = rowNodes.length * (nodeWidth + horizontalGap) - horizontalGap;
    const startX = -totalRowWidth / 2;

    rowNodes.forEach((node, idx) => {
      nodeCoords[node.id] = {
        x: startX + idx * (nodeWidth + horizontalGap) + nodeWidth / 2,
        y: depth * levelHeights + 40
      };
    });
  });

  return (
    <div className={`panel-card recursion-panel ${isFullscreen ? 'is-fullscreen' : ''}`}>
      {/* Header */}
      <div className="panel-header">
        <div>
          <div className="panel-title">
            <GitFork size={17} style={{ color: 'var(--accent-pink)' }} />
            <span>1. Recursive Computation</span>
          </div>
        </div>

        {/* Tree viewport controls */}
        <div className="tree-ctrls">
          {isFullscreen && (
            <span className="fs-esc-hint font-mono">Press Esc to exit</span>
          )}
          <button 
            type="button"
            className="tree-btn" 
            onClick={() => setZoom(z => Math.min(2, z + 0.15))}
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button 
            type="button"
            className="tree-btn" 
            onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button 
            type="button"
            className="tree-btn" 
            onClick={handleResetView}
            title="Reset Pan & Zoom"
          >
            <RotateCcw size={13} />
          </button>
          <button 
            type="button"
            className={`tree-btn ${isFullscreen ? 'active-fs' : ''}`} 
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen (Expand)"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Legend strip */}
      <div className="recursion-legend">
        <div className="legend-item">
          <span className="legend-dot dot-pink" />
          <span>Active</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot dot-green" />
          <span>Solved</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot dot-coral" />
          <span>Duplicate Call</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot dot-mint" />
          <span>Cache Hit</span>
        </div>
      </div>

      {/* Viewport container */}
      <div 
        className="tree-viewport" 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* If in Tabulation mode, show educational banner explaining no call stack is executed */}
        {algorithmMode === 'tabulation' ? (
          <div className="tabulation-notice-overlay">
            <div className="tabulation-notice-box">
              <div className="notice-icon-box">
                <Layers size={24} style={{ color: 'var(--accent-pink)' }} />
              </div>
              <h4>No Recursion Tree in Tabulation Mode</h4>
              <p>
                Bottom-Up Dynamic Programming works <strong>iteratively</strong>. It solves subproblems in strictly increasing chain length <code>L = 2, 3, ..., n</code> and fills the table directly.
              </p>
              <div className="recurrence-box font-mono">
                m[i, j] = min (m[i, k] + m[k+1, j] + p[i-1]·p[k]·p[j])
              </div>
              <p className="notice-tip">
                Switch to <strong>Brute Force</strong> or <strong>Top-Down (Memoization)</strong> in the top panel to watch the live call stack and duplicate node expansion.
              </p>
            </div>
          </div>
        ) : nodesArray.length === 0 ? (
          <div className="empty-tree-state">
            <Info size={20} className="text-muted" />
            <span>Click <strong>Start Visualization</strong> or <strong>Play</strong> to begin tree expansion.</span>
          </div>
        ) : (
          <svg
            className="tree-svg"
            style={{
              transform: `translate(${pan.x + 250}px, ${pan.y + 20}px) scale(${zoom})`,
              transformOrigin: '0 0'
            }}
          >
            {/* Draw connector edges */}
            <g className="tree-edges">
              {nodesArray.map(node => {
                if (!node.parentId || !nodeCoords[node.parentId] || !nodeCoords[node.id]) {
                  return null;
                }
                const p = nodeCoords[node.parentId];
                const c = nodeCoords[node.id];
                return (
                  <path
                    key={`edge-${node.parentId}-${node.id}`}
                    d={`M ${p.x} ${p.y + nodeHeight / 2} C ${p.x} ${(p.y + c.y) / 2}, ${c.x} ${(p.y + c.y) / 2}, ${c.x} ${c.y - nodeHeight / 2}`}
                    fill="none"
                    stroke={node.id === activeNodeId ? 'var(--accent-pink)' : 'var(--border-medium)'}
                    strokeWidth={node.id === activeNodeId ? 2.5 : 1.5}
                    strokeDasharray={node.isCacheHit ? '4,4' : 'none'}
                  />
                );
              })}
            </g>

            {/* Draw nodes */}
            <g className="tree-nodes">
              {nodesArray.map(node => {
                const pos = nodeCoords[node.id];
                if (!pos) return null;

                const isActive = node.id === activeNodeId;
                const isDuplicate = node.isDuplicate;
                const isCached = node.isCacheHit;
                const isCompleted = node.status === 'completed';

                let nodeClass = 'node-pending';
                if (isActive) nodeClass = 'node-active animate-pulse-pink';
                else if (isCached) nodeClass = 'node-cached';
                else if (isDuplicate) nodeClass = 'node-duplicate';
                else if (isCompleted) nodeClass = 'node-completed';

                return (
                  <g
                    key={node.id}
                    className={`tree-node-group ${nodeClass}`}
                    transform={`translate(${pos.x - nodeWidth / 2}, ${pos.y - nodeHeight / 2})`}
                    onClick={() => onNodeClick && onNodeClick(node)}
                  >
                    <rect
                      width={nodeWidth}
                      height={nodeHeight}
                      rx={8}
                      className="node-rect"
                    />
                    {/* Node title: MCM(i, j) */}
                    <text
                      x={nodeWidth / 2}
                      y={18}
                      textAnchor="middle"
                      className="node-title font-mono"
                    >
                      MCM({node.i}, {node.j})
                    </text>

                    {/* Subproblem details: Call #, Cost or Status */}
                    <text
                      x={nodeWidth / 2}
                      y={34}
                      textAnchor="middle"
                      className="node-subtitle font-mono"
                    >
                      {isCached
                        ? '⚡ Cache Hit'
                        : isDuplicate
                        ? `Call #${node.callNum} (DUPLICATE)`
                        : `Call #${node.callNum}`}
                    </text>

                    {/* Cost pill */}
                    <text
                      x={nodeWidth / 2}
                      y={47}
                      textAnchor="middle"
                      className="node-cost font-mono"
                    >
                      {node.cost !== null ? `cost: ${formatNumber(node.cost)}` : 'evaluating...'}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        )}
      </div>

      <style>{`
        .recursion-panel {
          height: 100%;
          max-height: 100%;
          display: flex;
          flex-direction: column;
          transition: all var(--transition-fast);
        }

        .recursion-panel.is-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          max-height: 100vh;
          z-index: 9999;
          border-radius: 0;
          margin: 0;
          border: none;
          box-shadow: 0 0 60px rgba(0, 0, 0, 0.95);
          background: var(--bg-surface);
        }

        .header-icon.cyan {
          color: var(--accent-cyan-light);
        }

        .tree-ctrls {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .tree-btn {
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
        }

        .tree-btn:hover {
          color: var(--text-main);
          border-color: var(--border-medium);
        }

        .tree-btn.active-fs {
          background: var(--accent-pink-glow);
          color: var(--accent-pink-light);
          border-color: var(--accent-pink);
        }

        .fs-esc-hint {
          font-size: 0.68rem;
          color: var(--text-muted);
          background: var(--bg-app);
          border: 1px solid var(--border-subtle);
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-sm);
          margin-right: 0.25rem;
        }

        .recursion-legend {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.4rem 1rem;
          background: var(--bg-app);
          border-bottom: 1px solid var(--border-subtle);
          font-size: 0.72rem;
          color: var(--text-muted);
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-dot.dot-pink { background: var(--accent-pink); box-shadow: 0 0 8px var(--accent-pink-glow); }
        .legend-dot.dot-green { background: var(--accent-green); box-shadow: 0 0 6px var(--accent-green-glow); }
        .legend-dot.dot-coral { background: var(--accent-coral); box-shadow: 0 0 6px rgba(251, 113, 133, 0.6); }
        .legend-dot.dot-mint { background: var(--accent-green-light); }

        .tree-viewport {
          flex: 1;
          overflow: hidden;
          position: relative;
          background: var(--bg-panel);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tree-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .tree-node-group {
          cursor: pointer;
          transition: transform var(--transition-fast);
        }

        .tree-node-group:hover {
          transform: translateY(-2px);
        }

        .node-rect {
          stroke-width: 1.5px;
          transition: all var(--transition-fast);
        }

        .node-pending .node-rect {
          fill: var(--bg-surface);
          stroke: var(--border-medium);
        }

        .node-active .node-rect {
          fill: var(--bg-surface-elevated);
          stroke: var(--accent-pink);
          filter: drop-shadow(0 0 10px var(--accent-pink-glow));
        }

        .node-completed .node-rect {
          fill: var(--bg-surface-elevated);
          stroke: var(--accent-green);
        }

        .node-duplicate .node-rect {
          fill: rgba(251, 113, 133, 0.15);
          stroke: var(--accent-coral);
          filter: drop-shadow(0 0 6px rgba(251, 113, 133, 0.4));
        }

        .node-cached .node-rect {
          fill: rgba(110, 231, 183, 0.15);
          stroke: var(--accent-green-light);
        }

        .node-title {
          font-size: 11px;
          font-weight: 700;
          fill: var(--text-main);
        }

        .node-subtitle {
          font-size: 9px;
          font-weight: 600;
          fill: var(--text-muted);
        }

        .node-duplicate .node-subtitle {
          fill: var(--accent-coral-light);
          font-weight: 700;
        }

        .node-cached .node-subtitle {
          fill: var(--accent-green-light);
          font-weight: 700;
        }

        .node-cost {
          font-size: 9px;
          font-weight: 600;
          fill: var(--accent-green-light);
        }

        .empty-tree-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-size: 0.85rem;
          text-align: center;
          padding: 2rem;
        }

        .tabulation-notice-overlay {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tabulation-notice-box {
          background: var(--bg-surface);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          max-width: 360px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          box-shadow: var(--shadow-md);
        }

        .notice-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--accent-pink-glow);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tabulation-notice-box h4 {
          font-size: 0.95rem;
          color: var(--text-main);
          font-weight: 700;
        }

        .tabulation-notice-box p {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.45;
        }

        .recurrence-box {
          background: var(--bg-app);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.45rem 0.75rem;
          font-size: 0.72rem;
          color: var(--accent-pink-light);
          word-break: break-all;
        }

        .notice-tip {
          font-size: 0.75rem !important;
          color: var(--accent-green-light) !important;
        }
      `}</style>
    </div>
  );
}
