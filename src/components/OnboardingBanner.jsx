import React from 'react';
import { Lightbulb, X, Check, ArrowRight } from 'lucide-react';

export default function OnboardingBanner({ isVisible, onDismiss }) {
  if (!isVisible) return null;

  return (
    <div className="onboarding-banner-container">
      <div className="onboarding-banner-card">
        <div className="onboarding-left">
          <div className="onboarding-icon-box">
            <Lightbulb size={18} />
          </div>
          <div className="onboarding-text-content">
            <div className="onboarding-title">
              <strong>Quick Guide:</strong> Start with the DP table — each cell represents the minimum cost of multiplying a consecutive group of matrices.
            </div>
            <div className="onboarding-steps">
              <span className="step-pill">
                <strong>1</strong> Follow the highlighted DP cell
              </span>
              <span className="step-pill">
                <strong>2</strong> Read the current step on the right
              </span>
              <span className="step-pill">
                <strong>3</strong> Watch the matching recursion node update
              </span>
            </div>
          </div>
        </div>

        <button 
          className="onboarding-dismiss-btn"
          onClick={onDismiss}
          title="Dismiss guide"
        >
          <X size={15} />
        </button>
      </div>

      <style>{`
        .onboarding-banner-container {
          margin: 0 1.25rem 0.65rem;
        }

        .onboarding-banner-card {
          background: var(--bg-workspace);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          padding: 0.65rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .onboarding-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .onboarding-icon-box {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--accent-pink-glow);
          color: var(--accent-pink-light);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .onboarding-text-content {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .onboarding-title {
          font-size: 0.82rem;
          color: var(--text-primary);
        }

        .onboarding-steps {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .step-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.78rem;
          color: var(--text-secondary);
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
        }

        .step-pill strong {
          color: var(--accent-pink-light);
          font-family: var(--font-mono);
        }

        .onboarding-dismiss-btn {
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }

        .onboarding-dismiss-btn:hover {
          color: var(--text-main);
          border-color: var(--border-medium);
        }

        @media (max-width: 900px) {
          .onboarding-steps {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
