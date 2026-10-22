import React from 'react';
import {
  Target,
  Calculator,
  ArrowRight
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';

const TYPE_CONFIG = {
  INIT: { label: 'Initialize', badgeClass: 'badge-pink' },
  CELL_START: { label: 'Start Cell', badgeClass: 'badge-pink' },
  SPLIT_EVALUATE: { label: 'Try Split', badgeClass: 'badge-cyan' },
  CELL_COMPLETE: { label: 'Cell Solved', badgeClass: 'badge-green' },
  CACHE_HIT: { label: 'Cache Hit', badgeClass: 'badge-green' },
  CACHE_MISS: { label: 'Cache Miss', badgeClass: 'badge-coral' },
  SOLVED: { label: 'Complete', badgeClass: 'badge-green' }
};

export default function StepDetailPanel({
  currentStep,
  currentStepIndex,
  totalSteps
}) {
  if (!currentStep) return null;

  const {
    stepTitle = 'Algorithm Step',
    type,
    calculation = '',
    whyMatters = '',
    whatNext = '',
    description = '',
    activeCell,
    chainLength,
    candidate
  } = currentStep;

  const typeConfig = TYPE_CONFIG[type] || { label: type || 'Step', badgeClass: 'badge-pink' };

  // Generate a brief single-sentence takeaway (keep it concise and scannable)
  const briefTakeaway = whyMatters || description || '';

  return (
    <div className="panel-card step-detail-panel">
      {/* Panel Header */}
      <div className="panel-header">
        <div>
          <div className="panel-title">
            <Target size={17} style={{ color: 'var(--accent-pink)' }} />
            <span>3. Current Step & Logic</span>
          </div>
        </div>
        <div className="step-counter-badge font-mono">
          <span>Step</span>
          <strong>{currentStepIndex + 1}</strong>
          <span className="step-total-slash">/</span>
          <span>{totalSteps}</span>
        </div>
      </div>

      <div className="step-detail-body">
        {/* Card 1: Active Subproblem & Brief Focus */}
        <div className="step-card hero-card">
          <div className="step-meta-row">
            <span className={`badge ${typeConfig.badgeClass} font-mono`}>
              {typeConfig.label}
            </span>
            {activeCell && (
              <span className="meta-chip font-mono highlight-pink">
                m[{activeCell[0]}][{activeCell[1]}]
              </span>
            )}
            {chainLength != null && (
              <span className="meta-chip font-mono">
                L = {chainLength}
              </span>
            )}
            {candidate?.isNewBest && (
              <span className="badge badge-green font-mono">
                ★ Best So Far
              </span>
            )}
            {candidate?.isTie && (
              <span className="badge badge-amber font-mono">
                ★ Tie (Tie-break)
              </span>
            )}
          </div>

          <h3 className="step-title-heading">{stepTitle}</h3>

          {briefTakeaway && (
            <p className="step-brief-text">{briefTakeaway}</p>
          )}
        </div>

        {/* Card 2: Calculation Breakdown (if present) */}
        {calculation && (
          <div className="step-card math-card">
            <div className="card-mini-label">
              <Calculator size={13} style={{ color: 'var(--accent-green)' }} />
              <span>Arithmetic Calculation</span>
            </div>
            <div className="step-formula-box font-mono">
              {calculation}
            </div>

            {/* If candidate split facts are available, show clean 4-pill horizontal row */}
            {candidate && (
              <div className="split-pills-row font-mono">
                <div className="split-pill">
                  <span className="pill-lbl">Left</span>
                  <span className="pill-val">{formatNumber(candidate.leftCost)}</span>
                </div>
                <span className="pill-op">+</span>
                <div className="split-pill">
                  <span className="pill-lbl">Right</span>
                  <span className="pill-val">{formatNumber(candidate.rightCost)}</span>
                </div>
                <span className="pill-op">+</span>
                <div className="split-pill">
                  <span className="pill-lbl">Multiply</span>
                  <span className="pill-val">{formatNumber(candidate.multCost)}</span>
                </div>
                <span className="pill-op">=</span>
                <div className={`split-pill total-pill ${candidate.isNewBest ? 'optimal-pill' : 'candidate-pill'}`}>
                  <span className="pill-lbl">Cost</span>
                  <span className="pill-val">{formatNumber(candidate.totalCost)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Card 3: Brief Next Step (1-line takeaway) */}
        {whatNext && (
          <div className="step-card next-card">
            <ArrowRight size={14} style={{ color: 'var(--accent-pink)', flexShrink: 0 }} />
            <div className="next-text font-mono">
              <strong>Next:</strong> {whatNext}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .step-detail-panel {
          height: 100%;
          max-height: 100%;
          display: flex;
          flex-direction: column;
          border-left: 3px solid var(--accent-pink);
        }

        .step-counter-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.82rem;
          color: var(--text-muted);
          background: var(--bg-app);
          border: 1px solid var(--border-subtle);
          padding: 0.2rem 0.65rem;
          border-radius: var(--radius-sm);
        }

        .step-counter-badge strong {
          color: var(--accent-pink-light);
          font-size: 0.95rem;
        }

        .step-total-slash {
          color: var(--text-faint);
        }

        .step-detail-body {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .step-card {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .hero-card {
          border-color: var(--border-default);
          background: transparent;
        }

        .step-meta-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-wrap: wrap;
        }

        .meta-chip {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-main);
          background: var(--bg-app);
          border: 1px solid var(--border-subtle);
          padding: 0.12rem 0.45rem;
          border-radius: var(--radius-sm);
        }

        .step-title-heading {
          font-size: 1.15rem;
          font-weight: 750;
          line-height: 1.35;
          color: var(--text-main);
        }

        .step-brief-text {
          font-size: 0.86rem;
          line-height: 1.5;
          color: var(--text-muted);
        }

        .math-card {
          border-color: rgba(110, 231, 183, 0.25);
        }

        .card-mini-label {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .step-formula-box {
          font-size: 0.88rem;
          line-height: 1.45;
          color: var(--text-secondary);
          background: var(--bg-panel);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          padding: 0.6rem 0.75rem;
          word-break: break-word;
        }

        .split-pills-row {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          flex-wrap: wrap;
          padding-top: 0.2rem;
        }

        .split-pill {
          flex: 1;
          min-width: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--bg-app);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.3rem 0.45rem;
        }

        .pill-lbl {
          font-size: 0.62rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }

        .pill-val {
          font-size: 0.84rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .split-op {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .total-pill {
          border-color: rgba(110, 231, 183, 0.4);
          background: rgba(110, 231, 183, 0.08);
        }

        .next-card {
          flex-direction: row;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 0.85rem;
          background: var(--bg-app);
          border-color: var(--border-subtle);
        }

        .next-text {
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .next-text strong {
          color: var(--accent-pink-light);
        }
      `}</style>
    </div>
  );
}
