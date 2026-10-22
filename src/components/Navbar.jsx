import React from 'react';
import { 
  PlaySquare, 
  BookOpen, 
  Award, 
  BarChart3, 
  Sun, 
  Moon, 
  Layers, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function Navbar({ 
  currentMode, 
  setCurrentMode, 
  theme, 
  toggleTheme, 
  onReset 
}) {
  const navItems = [
    { id: 'visualize', label: 'Visualize Mode', icon: PlaySquare, badge: 'Live DP' },
    { id: 'learn', label: 'Learn Mode', icon: BookOpen },
    { id: 'practice', label: 'Practice Mode', icon: Award, badge: 'Quizzes' },
    { id: 'complexity', label: 'Complexity Mode', icon: BarChart3, badge: 'Catalan' },
  ];

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Brand identity */}
        <div className="brand-section">
          <div className="logo-box">
            <Layers className="logo-icon" />
          </div>
          <div className="brand-text">
            <div className="brand-title">
              MCM <span className="highlight-text">Studio</span>
            </div>
            <div className="brand-tagline">
              From exponential recursion to optimal computation.
            </div>
          </div>
        </div>

        {/* Navigation Modes */}
        <nav className="mode-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentMode === item.id;
            return (
              <button
                key={item.id}
                className={`mode-btn ${isActive ? 'active' : ''}`}
                onClick={() => setCurrentMode(item.id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
              >
                <Icon size={16} className="btn-icon" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`nav-badge ${isActive ? 'active-badge' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right side controls: Theme & Reset */}
        <div className="nav-actions">
          <button 
            className="action-btn"
            onClick={onReset}
            title="Reset algorithm simulation to beginning"
          >
            <RotateCcw size={16} />
            <span className="btn-label-desktop">Reset</span>
          </button>

          <button 
            className="action-btn theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>

      <style>{`
        .navbar-container {
          background: var(--bg-header);
          border-bottom: 1px solid var(--border-subtle);
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(12px);
        }

        .navbar-content {
          max-width: 1700px;
          margin: 0 auto;
          padding: 0.65rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }

        .logo-box {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: var(--pink-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: none;
        }

        .logo-icon {
          width: 20px;
          height: 20px;
        }

        .brand-title {
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .highlight-text {
          color: var(--accent-pink-light);
          background: none;
          -webkit-background-clip: text;
          -webkit-text-fill-color: currentColor;
        }

        .brand-tagline {
          font-size: 0.72rem;
          color: var(--text-muted);
          letter-spacing: 0.01em;
        }

        .mode-nav {
          display: flex;
          align-items: center;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          padding: 0.25rem;
          border-radius: var(--radius-full);
          gap: 0.25rem;
        }

        .mode-btn {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-muted);
          transition: all var(--transition-fast);
        }

        .mode-btn:hover {
          color: var(--text-main);
          background: var(--bg-surface-elevated);
        }

        .mode-btn.active {
          color: var(--pink-primary);
          background: transparent;
          box-shadow: none;
        }

        .nav-badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.1rem 0.4rem;
          border-radius: var(--radius-full);
          background: var(--bg-surface-elevated);
          color: var(--accent-cyan-light);
          border: 1px solid var(--border-medium);
        }

        .active-badge {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.4);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.75rem;
          border-radius: var(--radius-md);
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          font-size: 0.82rem;
          font-weight: 600;
        }

        .action-btn:hover {
          color: var(--text-main);
          border-color: var(--border-medium);
          background: var(--bg-surface-elevated);
        }

        .theme-toggle-btn {
          padding: 0.45rem 0.55rem;
        }

        @media (max-width: 760px) {
          .brand-tagline {
            display: none;
          }
          .mode-btn span:not(.nav-badge) {
            display: none;
          }
          .btn-label-desktop {
            display: none;
          }
        }

        @media (max-width: 760px) {
          .navbar-content {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 0.65rem;
            padding: 0.55rem 0.75rem;
          }

          .brand-section {
            min-width: 0;
            gap: 0.55rem;
          }

          .brand-title {
            font-size: 1rem;
          }

          .mode-nav {
            grid-column: 1 / -1;
            grid-row: 2;
            width: 100%;
            justify-content: space-around;
            border-radius: var(--radius-lg);
          }

          .mode-btn {
            flex: 1;
            justify-content: center;
            padding: 0.5rem 0.35rem;
          }

          .mode-btn span,
          .nav-badge {
            display: none !important;
          }

          .nav-actions {
            grid-column: 2;
            grid-row: 1;
            justify-self: end;
          }

          .action-btn {
            padding: 0.42rem 0.55rem;
          }
        }
      `}</style>
    </header>
  );
}
