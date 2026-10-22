import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Gauge, 
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  BarChart2,
  LayoutGrid
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export default function PlayerHUD({
  isPlaying,
  setIsPlaying,
  currentStepIndex,
  totalSteps,
  onStepForward,
  onStepBackward,
  onReset,
  playbackSpeed,
  setPlaybackSpeed,
  onJumpToStep,
  chainLength,
  maxChainLength,
  pauseAfterEachStep,
  setPauseAfterEachStep,
  metrics,
  algorithmMode,
  numMatrices,
  viewFocus,
  setViewFocus
}) {
  const [showPerfDetails, setShowPerfDetails] = useState(false);

  // Keyboard navigation shortcuts: Space (Play/Pause), Left (Step Back), Right (Step Forward), R (Reset)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        onStepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        onStepBackward();
      } else if (e.key === 'r' || e.key === 'R') {
        onReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsPlaying, onStepForward, onStepBackward, onReset]);

  const totalNontrivialCells = numMatrices ? (numMatrices * (numMatrices + 1)) / 2 : 0;

  return (
    <div className="player-hud-card panel-card">
      {/* ROW 1: CONTROLS, SPEED, TIMELINE & LIVE METRICS */}
      <div className="hud-top-row">
        {/* Playback Controls */}
        <div className="hud-controls-group">
          <button
            type="button"
            className="hud-btn btn-reset"
            onClick={onReset}
            title="Restart simulation from beginning (R)"
          >
            <RotateCcw size={14} />
            <span className="btn-label">Reset</span>
          </button>

          <button
            type="button"
            className="hud-btn btn-step"
            onClick={onStepBackward}
            disabled={currentStepIndex <= 0}
            title="Step backward 1 event (Left Arrow)"
          >
            <SkipBack size={14} />
            <span className="btn-label">Back</span>
          </button>

          <button
            type="button"
            className={`hud-btn btn-play ${isPlaying ? 'is-playing' : ''}`}
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause (Space)' : 'Play simulation (Space)'}
          >
            {isPlaying ? (
              <>
                <Pause size={15} fill="currentColor" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={15} fill="currentColor" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="hud-btn btn-step"
            onClick={onStepForward}
            disabled={currentStepIndex >= totalSteps - 1}
            title="Step forward 1 event (Right Arrow)"
          >
            <span className="btn-label">Next</span>
            <SkipForward size={14} />
          </button>
        </div>

        {/* Speed Selector (Default 0.5x) */}
        <div className="hud-speed-group">
          <Gauge size={13} className="text-muted" />
          <div className="speed-pills">
            {[
              { label: '0.5× Slow', speed: 2500, title: 'One step every ~2.5s (Recommended)' },
              { label: '1×', speed: 1500, title: 'One step every ~1.5s' },
              { label: '2×', speed: 750, title: 'One step every ~750ms' }
            ].map(item => (
              <button
                key={item.label}
                type="button"
                className={`speed-pill ${playbackSpeed === item.speed ? 'active-speed' : ''}`}
                onClick={() => setPlaybackSpeed(item.speed)}
                title={item.title}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* "Pause after each step" toggle */}
        <button
          type="button"
          className={`pause-step-pill ${pauseAfterEachStep ? 'active-pause-pill' : ''}`}
          onClick={() => setPauseAfterEachStep(!pauseAfterEachStep)}
          title="When enabled, clicking Play advances one step and pauses automatically"
        >
          {pauseAfterEachStep ? (
            <CheckSquare size={13} style={{ color: 'var(--accent-pink)' }} />
          ) : (
            <Square size={13} className="text-muted" />
          )}
          <span>Pause each step</span>
        </button>

        {/* Step Progress & Timeline Slider */}
        <div className="hud-slider-group">
          <span className="step-counter-text font-mono">
            Step <strong>{currentStepIndex + 1}</strong>/{totalSteps}
          </span>
          <input
            type="range"
            className="hud-slider"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStepIndex}
            onChange={(e) => onJumpToStep(Number(e.target.value))}
            title="Scrub to any step"
          />
        </div>

        {/* Live Metrics Quick Badges */}
        <div className="hud-metrics-strip">
          <span className="metric-tag font-mono highlight-pink" title="Current chain length">
            L = {chainLength || 1}/{numMatrices}
          </span>
          <span className="metric-tag font-mono" title="DP cells solved so far">
            Solved: <strong>{metrics?.cellsCompleted ?? 0}</strong>/{totalNontrivialCells}
          </span>
          <span className="metric-tag font-mono highlight-green" title="Optimal multiplication cost">
            Cost: <strong>{metrics?.minCost !== null ? formatNumber(metrics.minCost) : '—'}</strong>
          </span>

          <button
            type="button"
            className={`btn-perf-toggle ${showPerfDetails ? 'active-perf' : ''}`}
            onClick={() => setShowPerfDetails(!showPerfDetails)}
            title="Toggle secondary performance metrics"
          >
            <BarChart2 size={12} />
            <span>Details</span>
          </button>
        </div>

        {/* View Focus Selector */}
        <div className="view-mode-selector">
          <span className="view-label">Focus:</span>
          <div className="view-mode-pills">
            <button
              type="button"
              className={`view-pill ${viewFocus === 'all' ? 'active-view-pill' : ''}`}
              onClick={() => setViewFocus('all')}
              title="Recursion tree and DP table side by side"
            >
              <LayoutGrid size={12} />
              <span>Both</span>
            </button>
            <button
              type="button"
              className={`view-pill ${viewFocus === 'dp' ? 'active-view-pill' : ''}`}
              onClick={() => setViewFocus('dp')}
              title="Give the DP table more space"
            >
              <span>DP</span>
            </button>
            <button
              type="button"
              className={`view-pill ${viewFocus === 'recursion' ? 'active-view-pill' : ''}`}
              onClick={() => setViewFocus('recursion')}
              title="Give the recursion tree more space"
            >
              <span>Tree</span>
            </button>
          </div>
        </div>
      </div>

      {/* POPDOWN: Secondary Performance Metrics (When toggled) */}
      {showPerfDetails && (
        <div className="hud-perf-popdown">
          <div className="perf-grid">
            <div className="perf-item">
              <span className="perf-label">Function / Recursive Calls:</span>
              <span className="perf-val font-mono">{formatNumber(metrics?.functionCalls ?? 0)}</span>
            </div>
            <div className="perf-item">
              <span className="perf-label">Unique Subproblems:</span>
              <span className="perf-val font-mono">{formatNumber(metrics?.uniqueSubproblems ?? 0)}</span>
            </div>
            <div className="perf-item">
              <span className="perf-label">
                {algorithmMode === 'brute_force' ? 'Repeated Calls:' : 'Saved via Cache/DP:'}
              </span>
              <span className="perf-val font-mono highlight-coral">{formatNumber(metrics?.duplicateEvaluations ?? 0)}</span>
            </div>
            <div className="perf-item">
              <span className="perf-label">Splits Evaluated:</span>
              <span className="perf-val font-mono">{formatNumber(metrics?.splitEvaluations ?? 0)}</span>
            </div>
            {algorithmMode === 'memoization' && (
              <div className="perf-item">
                <span className="perf-label">Cache Hits / Misses:</span>
                <span className="perf-val font-mono highlight-green">{metrics?.cacheHits ?? 0} / {metrics?.cacheMisses ?? 0}</span>
              </div>
            )}
            <div className="perf-item">
              <span className="perf-label">Theoretical Time:</span>
              <span className="perf-val font-mono highlight-green">
                {algorithmMode === 'tabulation' || algorithmMode === 'memoization' ? 'O(n³)' : 'O(2ⁿ)'}
              </span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .player-hud-card {
          margin: 0 1.25rem 0.65rem;
          padding: 0.55rem 0.95rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          border-left: 3px solid var(--accent-pink);
        }

        .hud-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .hud-controls-group {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .hud-btn {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.35rem 0.65rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-main);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          transition: all var(--transition-fast);
        }

        .hud-btn:hover:not(:disabled) {
          border-color: var(--border-medium);
          background: var(--bg-surface-active);
        }

        .hud-btn:disabled {
          opacity: 1;
          color: var(--disabled-text);
          background: var(--disabled-bg);
          border-color: var(--border-default);
          cursor: not-allowed;
        }

        .btn-play {
          background: var(--pink-primary);
          color: var(--text-inverse);
          font-weight: 700;
          border: none;
          box-shadow: none;
          padding: 0.38rem 0.95rem;
        }

        .btn-play:hover:not(:disabled) {
          background: var(--pink-hover);
          box-shadow: none;
        }

        .btn-play.is-playing {
          background: var(--pink-primary);
          color: var(--text-inverse);
        }

        .hud-speed-group {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .speed-pills {
          display: flex;
          align-items: center;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.15rem;
          gap: 0.15rem;
        }

        .speed-pill {
          padding: 0.2rem 0.45rem;
          border-radius: 3px;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .speed-pill:hover {
          color: var(--text-main);
        }

        .active-speed {
          background: var(--accent-pink);
          color: var(--text-inverse);
          font-weight: 700;
        }

        .pause-step-pill {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.55rem;
          border-radius: var(--radius-sm);
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
        }

        .active-pause-pill {
          border-color: var(--accent-pink);
          color: var(--accent-pink-light);
          background: var(--accent-pink-glow);
        }

        .hud-slider-group {
          flex: 1;
          min-width: 170px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .step-counter-text {
          font-size: 0.72rem;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .step-counter-text strong {
          color: var(--text-main);
        }

        .hud-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 5px;
          border-radius: var(--radius-full);
          background: var(--bg-surface-elevated);
          outline: none;
        }

        .hud-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--accent-pink);
          cursor: pointer;
          border: 2px solid var(--text-primary);
          box-shadow: none;
        }

        .hud-metrics-strip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .metric-tag {
          font-size: 0.74rem;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
        }

        .btn-perf-toggle {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-sm);
        }

        .btn-perf-toggle:hover {
          color: var(--text-main);
        }

        .active-perf {
          background: var(--accent-pink-glow);
          color: var(--accent-pink-light);
          border-color: var(--accent-pink);
        }

        .view-mode-selector {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .view-label {
          font-size: 0.68rem;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 700;
        }

        .view-mode-pills {
          display: flex;
          align-items: center;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.15rem;
          gap: 0.15rem;
        }

        .view-pill {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.18rem 0.45rem;
          border-radius: 3px;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .view-pill:hover {
          color: var(--text-main);
        }

        .active-view-pill {
          background: var(--pink-primary);
          color: var(--text-inverse);
          font-weight: 700;
        }

        .hud-perf-popdown {
          border-top: 1px solid var(--border-subtle);
          padding-top: 0.45rem;
          margin-top: 0.25rem;
          animation: fadeIn 0.12s ease-out;
        }

        .perf-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.45rem 1rem;
          font-size: 0.74rem;
        }

        .perf-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-app);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.3rem 0.55rem;
        }

        .perf-label {
          color: var(--text-muted);
        }

        .perf-val {
          font-weight: 700;
          color: var(--text-main);
        }

        @media (max-width: 900px) {
          .btn-label {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
