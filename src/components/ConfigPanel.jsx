import React, { useState } from 'react';
import { 
  Play, 
  AlertTriangle, 
  HelpCircle, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { validateDimensionsInput, getMatrixList } from '../utils/formatters';
import WhatIsPModal from './WhatIsPModal';

export default function ConfigPanel({
  dimensions,
  onApplyDimensions,
  algorithmMode,
  setAlgorithmMode,
  onStartVisualization,
  onSelectMatrixToInspect
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputVal, setInputVal] = useState(dimensions.join(', '));
  const [validation, setValidation] = useState({ isValid: true, error: null });
  const [showWhatIsPModal, setShowWhatIsPModal] = useState(false);

  const parsedInput = validateDimensionsInput(inputVal);
  const liveMatrices = parsedInput.isValid ? getMatrixList(parsedInput.dimensions) : [];

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputVal(val);
    const result = validateDimensionsInput(val);
    if (!result.isValid) {
      setValidation({ isValid: false, error: result.error });
    } else {
      setValidation({ isValid: true, error: null });
    }
  };

  const handleApply = () => {
    const result = validateDimensionsInput(inputVal);
    if (result.isValid) {
      onApplyDimensions(result.dimensions);
      setValidation({ isValid: true, error: null });
      onStartVisualization();
    } else {
      setValidation({ isValid: false, error: result.error });
    }
  };

  const getAlgoName = () => {
    if (algorithmMode === 'tabulation') return 'Bottom-Up (Tabulation)';
    if (algorithmMode === 'memoization') return 'Top-Down (Memoization)';
    return 'Brute Force (Recursion)';
  };

  return (
    <div className="config-wrapper panel-card">
      {/* Sleek Single-Line Compact Bar (Always Visible) */}
      <div className="config-compact-bar">
        <div className="compact-left">
          <label className="inline-input-label" htmlFor="p-array-input">p =</label>
          <div className={`inline-input-box ${!validation.isValid ? 'input-error' : ''}`}>
            <span className="bracket font-mono">[</span>
            <input
              id="p-array-input"
              type="text"
              className="inline-dim-input font-mono"
              value={inputVal}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              placeholder="e.g. 10, 30, 5, 60"
              aria-label="Matrix dimension array"
            />
            <span className="bracket font-mono">]</span>
          </div>
          <span
            className="pill-count-tag"
            title={liveMatrices.map(m => `${m.name}(${m.rows}×${m.cols})`).join(', ')}
          >
            {(parsedInput.isValid ? parsedInput.dimensions.length : dimensions.length) - 1} Mats
          </span>
          <button
            type="button"
            className="inline-apply-btn"
            onClick={handleApply}
            disabled={!validation.isValid}
          >
            <Play size={13} fill="currentColor" />
            <span>Apply</span>
          </button>

          {!validation.isValid ? (
            <div className="inline-val-msg error-msg">
              <AlertTriangle size={13} />
              <span>{validation.error}</span>
            </div>
          ) : (
            <div className="mode-summary-pill">
              <span className={`mode-dot dot-${algorithmMode === 'tabulation' ? 'cyan' : algorithmMode === 'memoization' ? 'indigo' : 'coral'}`} />
              <span>{getAlgoName()}</span>
            </div>
          )}
        </div>

        <div className="compact-right">
          {/* What is p button */}
          <button
            type="button"
            className="btn-text-subtle"
            onClick={() => setShowWhatIsPModal(true)}
            title="Explain matrix dimension array convention"
          >
            <HelpCircle size={14} style={{ color: 'var(--accent-pink)' }} />
            <span>What is p?</span>
          </button>

          {/* Toggle Full Setup Drawer */}
          <button
            type="button"
            className={`btn-configure ${isExpanded ? 'active-configure' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Close algorithm setup' : 'Change algorithm mode'}
          >
            <SlidersHorizontal size={13} />
            <span>{isExpanded ? 'Close Setup' : 'Algorithm'}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expandable Configuration Drawer (Only opens when student wants to customize) */}
      {isExpanded && (
        <div className="config-drawer">
          <div className="drawer-grid">
            <div className="drawer-algo-col">
              <span className="input-label">Select Algorithm Mode:</span>
              <div className="drawer-algo-tabs">
                <button
                  type="button"
                  className={`algo-btn ${algorithmMode === 'tabulation' ? 'active-tab' : ''}`}
                  onClick={() => setAlgorithmMode('tabulation')}
                >
                  <span className="dot dot-cyan" />
                  <span>Bottom-Up (Tabulation)</span>
                </button>
                <button
                  type="button"
                  className={`algo-btn ${algorithmMode === 'memoization' ? 'active-memo' : ''}`}
                  onClick={() => setAlgorithmMode('memoization')}
                >
                  <span className="dot dot-indigo" />
                  <span>Top-Down (Memoization)</span>
                </button>
                <button
                  type="button"
                  className={`algo-btn ${algorithmMode === 'brute_force' ? 'active-brute' : ''}`}
                  onClick={() => setAlgorithmMode('brute_force')}
                >
                  <span className="dot dot-coral" />
                  <span>Brute Force (Recursion)</span>
                </button>
              </div>

              <div className="drawer-algo-desc font-mono">
                {algorithmMode === 'tabulation' && (
                  <span><strong>Tabulation:</strong> Solves iteratively from length L=2 to n. Optimal cache locality, no call stack.</span>
                )}
                {algorithmMode === 'memoization' && (
                  <span><strong>Memoization:</strong> Uses recursion, but caches answers to eliminate duplicate calls.</span>
                )}
                {algorithmMode === 'brute_force' && (
                  <span><strong>Brute Force:</strong> Pure recursion without caching; repeatedly re-evaluates identical subproblems.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accessible "What is p?" Modal */}
      <WhatIsPModal
        isOpen={showWhatIsPModal}
        onClose={() => setShowWhatIsPModal(false)}
      />

      <style>{`
        .config-wrapper {
          margin: 0.65rem 1.25rem 0.5rem;
          transition: all var(--transition-fast);
        }

        .config-compact-bar {
          padding: 0.45rem 0.85rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.65rem;
        }

        .compact-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
        }

        .inline-input-label {
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .inline-input-box {
          display: flex;
          align-items: center;
          min-width: 220px;
          max-width: 420px;
          flex: 1;
          background: var(--bg-app);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-sm);
          padding: 0.1rem 0.45rem;
        }

        .inline-dim-input {
          background: transparent;
          border: none;
          color: var(--accent-pink-light);
          font-size: 0.82rem;
          font-weight: 700;
          width: 100%;
          min-width: 140px;
          padding: 0.28rem 0.4rem;
          outline: none;
        }

        .inline-apply-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.28rem 0.7rem;
          background: linear-gradient(135deg, var(--accent-pink), var(--accent-green));
          color: #111714;
          border-radius: var(--radius-sm);
          font-size: 0.74rem;
          font-weight: 700;
        }

        .inline-apply-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .inline-val-msg {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.72rem;
          max-width: 320px;
        }

        .pill-count-tag {
          font-size: 0.68rem;
          background: var(--bg-app);
          color: var(--accent-green-light);
          padding: 0.05rem 0.35rem;
          border-radius: 3px;
        }

        .mode-summary-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.73rem;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-app);
          border: 1px solid var(--border-subtle);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
        }

        .compact-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-text-subtle {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.74rem;
          color: var(--text-muted);
          background: transparent;
          font-weight: 600;
        }

        .btn-text-subtle:hover {
          color: var(--accent-pink-light);
        }

        .btn-configure {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.74rem;
          font-weight: 600;
          color: var(--text-main);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .btn-configure:hover {
          border-color: var(--border-medium);
          background: var(--bg-surface-active);
        }

        .active-configure {
          background: var(--accent-pink-glow);
          color: var(--accent-pink-light);
          border-color: var(--accent-pink);
        }

        .config-drawer {
          border-top: 1px solid var(--border-subtle);
          background: var(--bg-surface-elevated);
          padding: 0.85rem 1rem;
          animation: slideDown 0.15s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .drawer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
          align-items: flex-start;
        }

        .drawer-input-col, .drawer-algo-col {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .input-label {
          font-size: 0.74rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .drawer-input-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .drawer-input-box {
          display: flex;
          align-items: center;
          background: var(--bg-app);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-sm);
          padding: 0.15rem 0.55rem;
          flex: 1;
        }

        .bracket {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .drawer-input {
          background: transparent;
          border: none;
          color: var(--text-main);
          font-size: 0.88rem;
          font-weight: 600;
          width: 100%;
          padding: 0.3rem 0.45rem;
          outline: none;
        }

        .input-error {
          border-color: var(--accent-coral) !important;
        }

        .drawer-apply-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.85rem;
          background: linear-gradient(135deg, var(--accent-pink), var(--accent-green));
          color: #111714;
          box-shadow: 0 0 12px rgba(244, 114, 182, 0.4);
          border-radius: var(--radius-sm);
          font-size: 0.78rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .drawer-apply-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .drawer-val-msg {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
        }

        .error-msg { color: var(--accent-coral-light); }
        .info-msg { color: var(--text-muted); }
        .success-icon { color: var(--accent-green-light); }

        .drawer-algo-tabs {
          display: flex;
          align-items: center;
          background: var(--bg-app);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.15rem;
          gap: 0.15rem;
        }

        .algo-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.6rem;
          border-radius: var(--radius-sm);
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .algo-btn:hover {
          color: var(--text-main);
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .dot-cyan { background: var(--accent-cyan); }
        .dot-indigo { background: var(--accent-primary-light); }
        .dot-coral { background: var(--accent-coral); }

        .active-tab {
          background: var(--accent-cyan-glow);
          color: var(--accent-cyan-light);
          font-weight: 700;
        }

        .active-memo {
          background: var(--accent-primary-glow);
          color: var(--accent-primary-light);
          font-weight: 700;
        }

        .active-brute {
          background: var(--accent-coral-glow);
          color: var(--accent-coral-light);
          font-weight: 700;
        }

        .drawer-algo-desc {
          font-size: 0.72rem;
          color: var(--text-muted);
          background: var(--bg-app);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.35rem 0.65rem;
        }

        .drawer-algo-desc strong {
          color: var(--text-main);
        }

        @media (max-width: 900px) {
          .drawer-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
