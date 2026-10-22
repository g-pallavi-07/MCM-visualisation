import React, { useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Gauge, 
  Target,
  CheckSquare,
  Square
} from 'lucide-react';

export default function ExecutionControls({
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
  onJumpToChainLength,
  pauseAfterEachStep,
  setPauseAfterEachStep
}) {
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

  // Available chain lengths for quick jumping
  const chainLengths = [];
  for (let l = 2; l <= maxChainLength; l++) {
    chainLengths.push(l);
  }

  return (
    <div className="controls-toolbar panel-card">
      <div className="toolbar-row">
        {/* Playback Buttons Group */}
        <div className="playback-btn-group">
          <button
            type="button"
            className="ctrl-btn reset-btn"
            onClick={onReset}
            title="Restart simulation from step 1 (R)"
          >
            <RotateCcw size={15} />
            <span className="btn-text">Reset</span>
          </button>

          <button
            type="button"
            className="ctrl-btn step-btn"
            onClick={onStepBackward}
            disabled={currentStepIndex <= 0}
            title="Step Backward 1 event (Left Arrow)"
          >
            <SkipBack size={15} />
            <span className="btn-text">Back</span>
          </button>

          <button
            type="button"
            className={`ctrl-btn play-main-btn ${isPlaying ? 'is-playing' : ''}`}
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause simulation (Space)' : 'Play simulation (Space)'}
          >
            {isPlaying ? (
              <>
                <Pause size={16} fill="currentColor" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="ctrl-btn step-btn"
            onClick={onStepForward}
            disabled={currentStepIndex >= totalSteps - 1}
            title="Step Forward 1 event (Right Arrow)"
          >
            <span className="btn-text">Next</span>
            <SkipForward size={15} />
          </button>
        </div>

        {/* Speed Controls: Slow (0.5x, ~2500ms), Normal (1x, ~1500ms), Fast (2x, ~750ms) */}
        <div className="speed-group">
          <Gauge size={14} className="control-icon" />
          <span className="control-label">Speed:</span>
          <div className="speed-pills">
            {[
              { label: 'Slow (0.5×)', speed: 2500, title: 'One step every ~2.5s (Recommended for reading)' },
              { label: 'Normal (1×)', speed: 1500, title: 'One step every ~1.5s' },
              { label: 'Fast (2×)', speed: 750, title: 'One step every ~750ms' }
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
          className={`pause-step-toggle ${pauseAfterEachStep ? 'active-pause-toggle' : ''}`}
          onClick={() => setPauseAfterEachStep(!pauseAfterEachStep)}
          title="When enabled, clicking Play advances one teaching step and pauses automatically."
        >
          {pauseAfterEachStep ? (
            <CheckSquare size={14} className="cyan" />
          ) : (
            <Square size={14} className="text-muted" />
          )}
          <span>Pause after each step</span>
        </button>

        {/* Step Progress & Timeline Slider */}
        <div className="timeline-group">
          <div className="timeline-labels">
            <span className="step-counter font-mono">
              Step <strong>{currentStepIndex + 1}</strong> of <strong>{totalSteps}</strong>
            </span>
            {chainLength && maxChainLength > 1 && (
              <span className="chain-length-badge badge badge-cyan font-mono">
                Chain L = {chainLength}/{maxChainLength}
              </span>
            )}
          </div>
          <input
            type="range"
            className="timeline-slider"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStepIndex}
            onChange={(e) => onJumpToStep(Number(e.target.value))}
            title="Scrub timeline to any step"
          />
        </div>
      </div>

      <style>{`
        .controls-toolbar {
          margin: 0 1.25rem 0.65rem;
          padding: 0.55rem 0.95rem;
        }

        .toolbar-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.85rem;
        }

        .playback-btn-group {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .ctrl-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.4rem 0.75rem;
          border-radius: var(--radius-md);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          color: var(--text-main);
          font-size: 0.78rem;
          font-weight: 600;
          transition: all var(--transition-fast);
        }

        .ctrl-btn:hover:not(:disabled) {
          background: var(--bg-surface-active);
          border-color: var(--border-medium);
        }

        .ctrl-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .play-main-btn {
          background: var(--accent-cyan);
          color: #080d1a;
          border-color: var(--accent-cyan-light);
          padding: 0.45rem 1.15rem;
          font-weight: 700;
          box-shadow: var(--shadow-glow-cyan);
        }

        .play-main-btn:hover:not(:disabled) {
          background: var(--accent-cyan-light);
          color: #080d1a;
        }

        .play-main-btn.is-playing {
          background: var(--accent-amber);
          border-color: var(--accent-amber-light);
          color: #080d1a;
        }

        .speed-group {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .control-icon {
          color: var(--text-muted);
        }

        .control-label {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .speed-pills {
          display: flex;
          align-items: center;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.15rem;
          gap: 0.15rem;
        }

        .speed-pill {
          padding: 0.25rem 0.55rem;
          border-radius: var(--radius-sm);
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .speed-pill:hover {
          color: var(--text-main);
        }

        .active-speed {
          background: var(--accent-primary);
          color: #ffffff;
        }

        .pause-step-toggle {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.74rem;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          padding: 0.35rem 0.65rem;
          border-radius: var(--radius-sm);
        }

        .pause-step-toggle:hover {
          color: var(--text-main);
          border-color: var(--border-medium);
        }

        .active-pause-toggle {
          border-color: var(--accent-cyan);
          color: var(--accent-cyan-light);
          background: var(--accent-cyan-glow);
        }

        .timeline-group {
          flex: 1;
          min-width: 200px;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .timeline-labels {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.74rem;
        }

        .step-counter {
          color: var(--text-muted);
        }

        .step-counter strong {
          color: var(--text-main);
        }

        .timeline-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 5px;
          border-radius: var(--radius-full);
          background: var(--bg-surface-elevated);
          outline: none;
        }

        .timeline-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: var(--accent-cyan);
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.6);
          transition: transform var(--transition-fast);
        }

        .timeline-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        @media (max-width: 800px) {
          .btn-text {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
