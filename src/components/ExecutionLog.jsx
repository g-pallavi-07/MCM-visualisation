import React, { useState, useRef, useEffect } from 'react';
import { 
  History, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  GitCommit, 
  Zap, 
  Repeat, 
  CheckCircle2 
} from 'lucide-react';

export default function ExecutionLog({
  events = [],
  currentStepIndex,
  onSelectEvent
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeItemRef = useRef(null);
  const listContainerRef = useRef(null);

  // Safely scroll ONLY within the internal log list container without moving the window!
  useEffect(() => {
    if (!isExpanded) return;
    if (activeItemRef.current && listContainerRef.current) {
      const container = listContainerRef.current;
      const item = activeItemRef.current;
      const itemTop = item.offsetTop - container.offsetTop;
      const itemBottom = itemTop + item.clientHeight;

      // Adjust container.scrollTop only if item is outside visible range of the log box
      if (itemTop < container.scrollTop) {
        container.scrollTop = itemTop;
      } else if (itemBottom > container.scrollTop + container.clientHeight) {
        container.scrollTop = itemBottom - container.clientHeight;
      }
    }
  }, [currentStepIndex, isExpanded]);

  if (!events || events.length === 0) return null;

  return (
    <div className="log-panel-container panel-card">
      {/* Header / Collapse Bar */}
      <div 
        className="log-header-bar"
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? 'Collapse execution log' : 'Expand detailed execution event history'}
      >
        <div className="log-header-left">
          <History size={16} style={{ color: 'var(--accent-pink)' }} />
          <span className="log-title">Execution Event Log</span>
          <span className="badge badge-pink font-mono">
            {events.length} events
          </span>
          <span className="active-step-tag font-mono">
            Current: Step #{currentStepIndex + 1}
          </span>
        </div>

        <div className="log-header-right">
          <span className="log-expand-hint">
            {isExpanded ? 'Hide Event History' : 'Show Event History'}
          </span>
          <button 
            type="button" 
            className="toggle-btn"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expandable Log List */}
      {isExpanded && (
        <div className="log-list-wrapper" ref={listContainerRef}>
          {events.map((ev, idx) => {
            const isActive = idx === currentStepIndex;

            let badgeClass = 'badge-pink';
            let icon = <GitCommit size={12} />;

            if (ev.type === 'CACHE_HIT') {
              badgeClass = 'badge-green';
              icon = <Zap size={12} />;
            } else if (ev.type === 'CACHE_MISS') {
              badgeClass = 'badge-coral';
              icon = <Repeat size={12} />;
            } else if (ev.type === 'CELL_COMPLETE' || ev.type === 'SOLVED') {
              badgeClass = 'badge-green';
              icon = <CheckCircle2 size={12} />;
            } else if (ev.type === 'SPLIT_EVALUATE') {
              badgeClass = 'badge-amber';
            }

            return (
              <div
                key={ev.id ?? idx}
                ref={isActive ? activeItemRef : null}
                className={`log-row-item ${isActive ? 'log-row-active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectEvent(idx);
                }}
                title="Click to jump simulation state to this event"
              >
                <div className="log-row-left">
                  <span className="step-num-tag font-mono">#{idx + 1}</span>
                  <span className={`badge ${badgeClass} event-type-badge font-mono`}>
                    {icon}
                    <span>{ev.type}</span>
                  </span>
                  {ev.activeCell && (
                    <span className="cell-indicator font-mono">
                      m[{ev.activeCell[0]}][{ev.activeCell[1]}]
                    </span>
                  )}
                  {ev.candidate && (
                    <span className="split-indicator font-mono">
                      k={ev.candidate.k}
                    </span>
                  )}
                </div>

                <div className="log-row-desc">
                  {ev.description}
                </div>

                <ChevronRight size={14} className="jump-icon" />
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .log-panel-container {
          margin: 0 1.25rem 1.25rem;
        }

        .log-header-bar {
          padding: 0.65rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          user-select: none;
          background: var(--bg-surface);
        }

        .log-header-bar:hover {
          background: var(--bg-surface-elevated);
        }

        .log-header-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
        }

        .log-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .active-step-tag {
          font-size: 0.72rem;
          color: var(--accent-cyan-light);
          background: var(--bg-app);
          border: 1px solid var(--border-subtle);
          padding: 0.1rem 0.45rem;
          border-radius: var(--radius-sm);
        }

        .log-header-right {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .log-expand-hint {
          font-size: 0.73rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .toggle-btn {
          color: var(--text-muted);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .log-list-wrapper {
          border-top: 1px solid var(--border-subtle);
          height: 240px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          padding: 0.35rem;
          gap: 0.2rem;
          background: var(--bg-app);
        }

        .log-row-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.65rem;
          padding: 0.4rem 0.65rem;
          border-radius: var(--radius-sm);
          background: var(--bg-surface);
          border: 1px solid transparent;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .log-row-item:hover {
          background: var(--bg-surface-elevated);
          border-color: var(--border-medium);
        }

        .log-row-active {
          background: var(--bg-surface-active) !important;
          border-color: var(--accent-cyan) !important;
        }

        .log-row-left {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-shrink: 0;
        }

        .step-num-tag {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-faint);
          width: 32px;
        }

        .event-type-badge {
          font-size: 0.65rem;
          padding: 0.1rem 0.4rem;
        }

        .cell-indicator {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--accent-cyan-light);
          background: var(--bg-app);
          padding: 0.05rem 0.35rem;
          border-radius: var(--radius-sm);
        }

        .split-indicator {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--accent-amber-light);
          background: var(--bg-app);
          padding: 0.05rem 0.35rem;
          border-radius: var(--radius-sm);
        }

        .log-row-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .log-row-active .log-row-desc {
          color: var(--text-main);
          font-weight: 500;
        }

        .jump-icon {
          color: var(--text-faint);
          flex-shrink: 0;
        }

        .log-row-item:hover .jump-icon {
          color: var(--accent-cyan-light);
        }
      `}</style>
    </div>
  );
}
