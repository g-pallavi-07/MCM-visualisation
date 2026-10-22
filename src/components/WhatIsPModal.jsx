import React, { useEffect, useRef } from 'react';
import { HelpCircle, X, Check, ArrowRight } from 'lucide-react';

export default function WhatIsPModal({ isOpen, onClose }) {
  const modalRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="what-is-p-backdrop" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="what-is-p-title"
    >
      <div 
        className="what-is-p-card"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Header */}
        <div className="what-is-p-header">
          <div className="title-group">
            <div className="icon-badge">
              <HelpCircle size={18} />
            </div>
            <h3 id="what-is-p-title">What is the Dimension Array <code>p</code>?</h3>
          </div>
          <button 
            className="close-btn" 
            onClick={onClose} 
            aria-label="Close explanation"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="what-is-p-content">
          <p className="lead-text">
            In Matrix Chain Multiplication, <code>p</code> is the <strong>array of matrix dimensions</strong>.
          </p>

          <div className="example-box">
            <div className="example-title">Concrete Example:</div>
            <div className="array-preview font-mono">
              p = [10, 30, 5, 60]
            </div>
            <p className="example-desc">
              This array contains <strong>4 numbers</strong>, which defines <strong>3 matrices</strong>:
            </p>
            <ul className="matrix-dim-list font-mono">
              <li>
                <span className="matrix-badge">A1</span>
                <span>dimensions <strong>10 × 30</strong> (rows: p[0], cols: p[1])</span>
              </li>
              <li>
                <span className="matrix-badge">A2</span>
                <span>dimensions <strong>30 × 5</strong> (rows: p[1], cols: p[2])</span>
              </li>
              <li>
                <span className="matrix-badge">A3</span>
                <span>dimensions <strong>5 × 60</strong> (rows: p[2], cols: p[3])</span>
              </li>
            </ul>
          </div>

          <div className="rule-card">
            <h4>General Rule:</h4>
            <p>
              Matrix <code>A<sub>i</sub></code> has dimensions: <code>p[i - 1] × p[i]</code>.
            </p>
            <p className="rule-subtext">
              Notice that the column dimension of <code>A<sub>i</sub></code> (<code>p[i]</code>) automatically matches the row dimension of <code>A<sub>i+1</sub></code> (<code>p[i]</code>). That is why an array of <code>n + 1</code> numbers completely defines <code>n</code> compatible matrices.
            </p>
          </div>

          <div className="multiplication-card">
            <h4>Scalar Multiplication Cost:</h4>
            <p>
              When multiplying a matrix of dimensions <code>(a × b)</code> by a matrix of dimensions <code>(b × c)</code>:
            </p>
            <ul className="bullet-list font-mono">
              <li>Resulting Matrix: <strong>(a × c)</strong></li>
              <li>Scalar Multiplications: <strong>a × b × c</strong></li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="what-is-p-footer">
          <button className="confirm-btn" onClick={onClose}>
            <Check size={16} />
            <span>Got it!</span>
          </button>
        </div>
      </div>

      <style>{`
        .what-is-p-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(4, 7, 15, 0.75);
          backdrop-filter: blur(6px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: fadeIn 0.15s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .what-is-p-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          max-width: 540px;
          width: 100%;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 20px var(--accent-pink-glow);
          overflow: hidden;
          animation: slideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { transform: translateY(12px) scale(0.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }

        .what-is-p-header {
          padding: 1rem 1.25rem;
          background: var(--bg-surface-elevated);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .title-group {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .icon-badge {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: var(--accent-pink-glow);
          color: var(--accent-pink-light);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .what-is-p-header h3 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .what-is-p-header code {
          color: var(--accent-pink-light);
        }

        .close-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
        }

        .close-btn:hover {
          color: var(--text-main);
          border-color: var(--border-medium);
          background: var(--bg-surface-active);
        }

        .what-is-p-content {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          font-size: 0.85rem;
          line-height: 1.5;
        }

        .lead-text {
          color: var(--text-main);
        }

        .example-box {
          background: var(--bg-app);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .example-title {
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--text-muted);
        }

        .array-preview {
          background: var(--bg-surface-elevated);
          padding: 0.4rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--accent-pink-light);
          display: inline-block;
          border: 1px solid var(--border-medium);
        }

        .example-desc {
          color: var(--text-muted);
          font-size: 0.82rem;
        }

        .matrix-dim-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          list-style: none;
        }

        .matrix-dim-list li {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.82rem;
          color: var(--text-main);
        }

        .matrix-badge {
          background: var(--accent-pink-glow);
          color: var(--accent-pink-light);
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 0.75rem;
        }

        .rule-card, .multiplication-card {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .rule-card h4, .multiplication-card h4 {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--accent-pink-light);
        }

        .rule-subtext {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .bullet-list {
          margin-left: 1.25rem;
          color: var(--accent-green-light);
          font-size: 0.8rem;
        }

        .what-is-p-footer {
          padding: 0.75rem 1.25rem;
          background: var(--bg-surface-elevated);
          border-top: 1px solid var(--border-subtle);
          display: flex;
          justify-content: flex-end;
        }

        .confirm-btn {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.45rem 1.15rem;
          background: linear-gradient(135deg, var(--accent-pink), var(--accent-green));
          color: #111714;
          border-radius: var(--radius-md);
          font-weight: 700;
          font-size: 0.82rem;
        }

        .confirm-btn:hover {
          filter: brightness(1.08);
        }
      `}</style>
    </div>
  );
}
