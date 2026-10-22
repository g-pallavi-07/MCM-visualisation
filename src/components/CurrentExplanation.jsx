import React from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  Calculator, 
  ArrowRight, 
  Info, 
  ChevronDown, 
  ChevronUp,
  Target
} from 'lucide-react';

export default function CurrentExplanation({
  currentStep,
  isInspectorExpanded,
  onToggleInspector,
  dimensions
}) {
  if (!currentStep) return null;

  const {
    stepTitle = 'Algorithm Step',
    whatSolving = 'Evaluating matrix chain multiplication',
    calculation = '',
    whyMatters = '',
    whatNext = '',
    activeCell
  } = currentStep;

  return (
    <div className="current-explanation-card">
      <div className="explanation-main-row">
        {/* Step Badge & Title */}
        <div className="explanation-header-group">
          <div className="explanation-step-badge font-mono">
            <Target size={13} className="target-icon" />
            <span>{stepTitle}</span>
          </div>
          {activeCell && (
            <span className="active-subproblem-badge font-mono">
              m[{activeCell[0]}][{activeCell[1]}]
            </span>
          )}
        </div>

        {/* Toggle Detailed Calculation Inspector Button */}
        <button
          className={`toggle-inspector-btn ${isInspectorExpanded ? 'active-inspector-btn' : ''}`}
          onClick={onToggleInspector}
          title={isInspectorExpanded ? 'Collapse detailed calculation breakdown' : 'Expand full 5-stage calculation details'}
        >
          <Calculator size={14} />
          <span>{isInspectorExpanded ? 'Hide Full Calculation' : 'Show Full Calculation'}</span>
          {isInspectorExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Grid of Explanation Fields */}
      <div className="explanation-grid">
        {/* 1. What We're Solving */}
        <div className="explanation-field">
          <span className="field-label">What we're solving:</span>
          <span className="field-value">{whatSolving}</span>
        </div>

        {/* 2. Current Calculation */}
        {calculation && (
          <div className="explanation-field calculation-field">
            <span className="field-label">Current calculation:</span>
            <span className="field-value font-mono calc-text">{calculation}</span>
          </div>
        )}

        {/* 3. Why This Matters */}
        {whyMatters && (
          <div className="explanation-field">
            <span className="field-label">Why this matters:</span>
            <span className="field-value">{whyMatters}</span>
          </div>
        )}

        {/* 4. What Changes Next */}
        {whatNext && (
          <div className="explanation-field next-field">
            <span className="field-label">What changes next:</span>
            <span className="field-value next-text">
              <ArrowRight size={13} className="inline-arrow" />
              <span>{whatNext}</span>
            </span>
          </div>
        )}
      </div>

      <style>{`
        .current-explanation-card {
          margin: 0 1.25rem 0.65rem;
          background: var(--bg-surface);
          border: 1px solid var(--border-medium);
          border-left: 4px solid var(--accent-cyan);
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          box-shadow: var(--shadow-sm);
        }

        .explanation-main-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 0.45rem;
        }

        .explanation-header-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .explanation-step-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--accent-cyan-light);
        }

        .target-icon {
          color: var(--accent-cyan);
        }

        .active-subproblem-badge {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          padding: 0.1rem 0.45rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .toggle-inspector-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.65rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--accent-primary-light);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          transition: all var(--transition-fast);
        }

        .toggle-inspector-btn:hover {
          color: var(--text-main);
          border-color: var(--accent-primary);
          background: var(--bg-surface-active);
        }

        .active-inspector-btn {
          background: var(--accent-primary-glow);
          border-color: var(--accent-primary);
          color: #ffffff;
        }

        .explanation-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 0.5rem 1.25rem;
          font-size: 0.8rem;
        }

        .explanation-field {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .field-label {
          font-size: 0.68rem;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.03em;
          color: var(--text-muted);
        }

        .field-value {
          color: var(--text-main);
          line-height: 1.4;
        }

        .calc-text {
          color: var(--accent-cyan-light);
          background: var(--bg-app);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
          font-size: 0.76rem;
          word-break: break-all;
        }

        .next-text {
          color: var(--accent-green-light);
          display: flex;
          align-items: baseline;
          gap: 0.3rem;
          font-size: 0.78rem;
          font-weight: 500;
        }

        .inline-arrow {
          flex-shrink: 0;
          color: var(--accent-green);
        }

        @media (max-width: 768px) {
          .explanation-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
