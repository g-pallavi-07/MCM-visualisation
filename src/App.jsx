import React, { useState, useEffect, useRef, useMemo } from 'react';
import Navbar from './components/Navbar';
import ConfigPanel from './components/ConfigPanel';
import PlayerHUD from './components/PlayerHUD';
import OnboardingBanner from './components/OnboardingBanner';
import RecursionTree from './components/RecursionTree';
import DPTable from './components/DPTable';
import StepDetailPanel from './components/StepDetailPanel';
import LearnMode from './components/LearnMode';
import PracticeMode from './components/PracticeMode';
import ComplexityDashboard from './components/ComplexityDashboard';

import {
  generateTabulationEvents,
  generateMemoizationEvents,
  generateBruteForceEvents
} from './algorithm/events';
import { solveMCMTabulation } from './algorithm/mcm';

export default function App() {
  const [currentMode, setCurrentMode] = useState('visualize'); // 'visualize' | 'learn' | 'practice' | 'complexity'
  const [theme, setTheme] = useState('dark');
  const [dimensions, setDimensions] = useState([10, 30, 5, 60]);
  const [algorithmMode, setAlgorithmMode] = useState('tabulation'); // 'tabulation' | 'memoization' | 'brute_force'

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  // Default playback speed: 0.5x (~2500ms per step, slow enough for students to read)
  const [playbackSpeed, setPlaybackSpeed] = useState(2500);
  const [pauseAfterEachStep, setPauseAfterEachStep] = useState(false);
  const [inspectedCell, setInspectedCell] = useState(null);

  // Onboarding state
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  // View focus ('all' | 'dp' | 'recursion')
  const [viewFocus, setViewFocus] = useState('all');

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Generate deterministic event stream based on dimensions and algorithm mode
  const events = useMemo(() => {
    if (algorithmMode === 'tabulation') {
      return generateTabulationEvents(dimensions);
    } else if (algorithmMode === 'memoization') {
      return generateMemoizationEvents(dimensions);
    } else {
      return generateBruteForceEvents(dimensions);
    }
  }, [dimensions, algorithmMode]);

  // Full tabulation solution for reference
  const fullSolution = useMemo(() => {
    return solveMCMTabulation(dimensions);
  }, [dimensions]);

  // Reset step and stop playback cleanly when dimensions or mode change
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setInspectedCell(null);
  }, [events]);

  // Active step snapshot
  const currentStep = events[currentStepIndex] || events[0] || {};

  // Playback timer loop: cleans up properly and supports "Pause after each step"
  useEffect(() => {
    if (!isPlaying) return;

    if (currentStepIndex >= events.length - 1) {
      setIsPlaying(false);
      return;
    }

    const intervalId = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev >= events.length - 1) {
          return prev;
        }
        return prev + 1;
      });
      if (pauseAfterEachStep) {
        setIsPlaying(false);
      }
    }, playbackSpeed);

    return () => {
      clearInterval(intervalId);
    };
  }, [isPlaying, currentStepIndex, events.length, playbackSpeed, pauseAfterEachStep]);

  // Step Controls
  const handleStepForward = () => {
    if (currentStepIndex < events.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setInspectedCell(null);
  };

  const handleJumpToStep = (index) => {
    if (index >= 0 && index < events.length) {
      setCurrentStepIndex(index);
    }
  };

  const handleJumpToChainLength = (targetL) => {
    const targetIdx = events.findIndex(ev => ev.chainLength === targetL);
    if (targetIdx !== -1) {
      setCurrentStepIndex(targetIdx);
    }
  };

  const handleCellClick = (i, j) => {
    setInspectedCell([i, j]);
    // Find event where this cell was evaluated or completed
    const matchingIdx = events.findIndex(
      ev => ev.activeCell && ev.activeCell[0] === i && ev.activeCell[1] === j
    );
    if (matchingIdx !== -1) {
      setCurrentStepIndex(matchingIdx);
    }
  };

  const handleNodeClick = (node) => {
    if (node && node.i && node.j) {
      handleCellClick(node.i, node.j);
    }
  };

  const handleApplyDimensions = (newDimensions) => {
    setDimensions(newDimensions);
  };

  const numMatrices = dimensions.length - 1;

  // Active cell to inspect: prefer manually selected cell if in bounds, else current step's active cell
  const effectiveActiveCell = inspectedCell || currentStep.activeCell || [1, numMatrices];

  return (
    <div className="app-layout">
      {/* Top Navigation */}
      <Navbar
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
        theme={theme}
        toggleTheme={toggleTheme}
        onReset={handleReset}
      />

      <main className={`main-content-area ${currentMode !== 'visualize' ? 'scrollable-mode' : ''}`}>
        {currentMode === 'visualize' && (
          <div className="visualize-mode-container">
            {/* STAGE 1: SET UP (Collapsible Sleek Strip) */}
            <ConfigPanel
              dimensions={dimensions}
              onApplyDimensions={handleApplyDimensions}
              algorithmMode={algorithmMode}
              setAlgorithmMode={setAlgorithmMode}
              onStartVisualization={handleReset}
              onSelectMatrixToInspect={(m) => {
                handleCellClick(m.index, m.index);
              }}
            />

            {/* Guided First-Run Hint Banner (Dismissible) */}
            <OnboardingBanner
              isVisible={!onboardingDismissed && currentStepIndex === 0}
              onDismiss={() => setOnboardingDismissed(true)}
            />

            {/* STAGE 2: UNIFIED COMPACT PLAYER HUD (Playback, Metrics, Narration & View Switcher) */}
            <PlayerHUD
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              currentStepIndex={currentStepIndex}
              totalSteps={events.length}
              onStepForward={handleStepForward}
              onStepBackward={handleStepBackward}
              onReset={handleReset}
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={setPlaybackSpeed}
              onJumpToStep={handleJumpToStep}
              chainLength={currentStep.chainLength}
              maxChainLength={numMatrices}
              pauseAfterEachStep={pauseAfterEachStep}
              setPauseAfterEachStep={setPauseAfterEachStep}
              metrics={currentStep.metrics}
              algorithmMode={algorithmMode}
              numMatrices={numMatrices}
              viewFocus={viewFocus}
              setViewFocus={setViewFocus}
            />

            {/* MAIN VISUALIZATION WORKSPACE (3 PANELS - 100VH VIEWPORT) */}
            <div className={`workspace-grid focus-mode-${viewFocus}`}>
              {(viewFocus === 'all' || viewFocus === 'recursion') && (
                <div className="workspace-col col-recursion">
                  <RecursionTree
                    treeNodes={currentStep.treeNodes || {}}
                    activeNodeId={currentStep.activeNodeId}
                    algorithmMode={algorithmMode}
                    onNodeClick={handleNodeClick}
                    dimensions={dimensions}
                  />
                </div>
              )}

              {(viewFocus === 'all' || viewFocus === 'dp') && (
                <div className="workspace-col col-dp">
                  <DPTable
                    mTable={currentStep.mTable || fullSolution.m}
                    sTable={currentStep.sTable || fullSolution.s}
                    activeCell={currentStep.activeCell}
                    readCells={currentStep.readCells || []}
                    chainLength={currentStep.chainLength}
                    numMatrices={numMatrices}
                    onCellClick={handleCellClick}
                    candidate={currentStep.candidate}
                    isSolved={currentStep.type === 'SOLVED'}
                  />
                </div>
              )}

              <div className="workspace-col col-steps">
                <StepDetailPanel
                  currentStep={currentStep}
                  currentStepIndex={currentStepIndex}
                  totalSteps={events.length}
                />
              </div>
            </div>
          </div>
        )}

        {currentMode === 'learn' && (
          <LearnMode
            onNavigateToVisualize={() => setCurrentMode('visualize')}
            onNavigateToComplexity={() => setCurrentMode('complexity')}
          />
        )}

        {currentMode === 'practice' && (
          <PracticeMode dimensions={dimensions} />
        )}

        {currentMode === 'complexity' && (
          <ComplexityDashboard numMatrices={numMatrices} />
        )}
      </main>

      <style>{`
        .app-layout {
          height: 100vh;
          max-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-app);
          overflow: hidden;
        }

        .main-content-area {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .main-content-area.scrollable-mode {
          overflow-y: auto;
        }

        .visualize-mode-container {
          display: flex;
          flex-direction: column;
          max-width: 1760px;
          margin: 0 auto;
          width: 100%;
          height: 100%;
          max-height: 100%;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        /* 3 synchronized panels: Current Step panel is bigger and primary */
        .workspace-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 1.15fr) minmax(360px, 1.4fr);
          gap: 0.85rem;
          margin: 0 1.25rem 0.65rem;
          flex: 1;
          min-height: 0;
          transition: all var(--transition-normal);
        }

        .workspace-grid.focus-mode-dp,
        .workspace-grid.focus-mode-recursion {
          grid-template-columns: minmax(0, 1.6fr) minmax(360px, 1.3fr);
        }

        .workspace-col {
          min-width: 0;
          height: 100%;
          max-height: 100%;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1180px) {
          .app-layout {
            height: auto;
            max-height: none;
            overflow-y: auto;
          }

          .main-content-area {
            overflow: visible;
          }

          .visualize-mode-container {
            height: auto;
            max-height: none;
            overflow: visible;
          }

          .workspace-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            flex: none;
          }

          .workspace-col {
            height: 480px;
          }

          .col-steps {
            grid-column: 1 / -1;
            height: 420px;
          }
        }

        @media (max-width: 760px) {
          .workspace-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .workspace-col,
          .col-steps {
            grid-column: auto;
            height: 460px;
          }
        }
      `}</style>
    </div>
  );
}
