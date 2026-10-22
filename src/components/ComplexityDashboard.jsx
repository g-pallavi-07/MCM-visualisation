import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Layers, 
  HelpCircle, 
  Hash, 
  Cpu, 
  Sparkles,
  Info 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { calculateCatalanNumber, calculateTheoreticalCounts } from '../algorithm/mcm';
import { formatNumber } from '../utils/formatters';

export default function ComplexityDashboard({ numMatrices }) {
  const [isLogScale, setIsLogScale] = useState(true);
  const [sliderN, setSliderN] = useState(Math.max(3, Math.min(10, numMatrices || 4)));

  // Generate data for Recharts up to sliderN
  const chartData = [];
  for (let k = 2; k <= Math.max(sliderN, 8); k++) {
    const counts = calculateTheoreticalCounts(k);
    const catalanVal = Number(counts.catalanParenthesizations > 1000000000n ? 1000000000 : counts.catalanParenthesizations);

    chartData.push({
      n: `n=${k}`,
      catalan: catalanVal,
      splitEvaluations: counts.splitEvaluations,
      dpCells: counts.nonTrivialCells
    });
  }

  // Exact calculations for the selected sliderN
  const selectedCounts = calculateTheoreticalCounts(sliderN);
  const currentChainCounts = calculateTheoreticalCounts(numMatrices || 4);

  return (
    <div className="complexity-container">
      {/* Top Banner */}
      <div className="complexity-header panel-card">
        <div className="header-text-group">
          <div className="header-title-row">
            <BarChart3 size={22} style={{ color: 'var(--accent-pink)' }} />
            <h2>Algorithm Complexity & Theoretical Foundations</h2>
          </div>
          <p className="header-desc">
            Explore how the exponential Catalan space of parenthesizations compares to polynomial Dynamic Programming.
          </p>
        </div>

        {/* Current Matrix Chain Metrics */}
        <div className="current-chain-stats">
          <div className="stat-pill">
            <span className="stat-label">Your Chain (n={numMatrices})</span>
            <span className="stat-value font-mono highlight-green">
              {formatNumber(currentChainCounts.catalanParenthesizations)} orders
            </span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">Tabulation Splits</span>
            <span className="stat-value font-mono highlight-pink">
              {currentChainCounts.splitEvaluations} evals
            </span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">Non-Trivial DP Cells</span>
            <span className="stat-value font-mono highlight-green">
              {currentChainCounts.nonTrivialCells} cells
            </span>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="table-card panel-card">
        <div className="panel-header">
          <div className="panel-title">
            <Cpu size={16} style={{ color: 'var(--accent-pink)' }} />
            <span>Theoretical Complexity Comparison</span>
          </div>
          <span className="badge badge-pink">n = number of matrices</span>
        </div>

        <div className="table-wrapper">
          <table className="comparison-table font-mono">
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>Time Complexity</th>
                <th>Auxiliary Space</th>
                <th>Key Characteristic</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong className="name-coral">Brute-Force Recursion</strong>
                </td>
                <td>
                  Exponential: Ω(4ⁿ / n³/²) ≈ O(2ⁿ)
                </td>
                <td>
                  O(n) recursion call stack
                </td>
                <td className="desc-cell">
                  Evaluates all Catalan parenthesizations repeatedly. Infeasible for n &gt; 12.
                </td>
              </tr>
              <tr>
                <td>
                  <strong className="name-indigo">Top-Down Memoization</strong>
                </td>
                <td>
                  Polynomial: O(n³)
                </td>
                <td>
                  O(n²) table + O(n) call stack
                </td>
                <td className="desc-cell">
                  Computes each of the n(n-1)/2 subproblems at most once. Avoids redundant recomputations.
                </td>
              </tr>
              <tr>
                <td>
                  <strong className="name-green">Bottom-Up Tabulation</strong>
                </td>
                <td>
                  Polynomial: O(n³)
                </td>
                <td>
                  O(n²) table (zero call stack)
                </td>
                <td className="desc-cell">
                  Computes cells diagonally by chain length L. Optimal cache locality and zero stack overhead.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Growth Comparison Chart */}
      <div className="chart-card panel-card">
        <div className="panel-header">
          <div>
            <div className="panel-title">
              <TrendingUp size={16} className="green" />
              <span>Growth Comparison: Parenthesizations vs DP Operations</span>
            </div>
            <div className="panel-subtitle">
              Catalan number C(n-1) vs Tabulation Splits n(n-1)(n+1)/6
            </div>
          </div>

          <div className="chart-controls">
            {/* Scale toggle */}
            <div className="toggle-group">
              <button
                className={`toggle-btn ${isLogScale ? 'active-toggle' : ''}`}
                onClick={() => setIsLogScale(true)}
              >
                Logarithmic
              </button>
              <button
                className={`toggle-btn ${!isLogScale ? 'active-toggle' : ''}`}
                onClick={() => setIsLogScale(false)}
              >
                Linear
              </button>
            </div>

            {/* Slider */}
            <div className="slider-box">
              <span className="slider-label">Max n: <strong>{sliderN}</strong></span>
              <input
                type="range"
                min={3}
                max={14}
                value={sliderN}
                onChange={(e) => setSliderN(Number(e.target.value))}
                className="slider-input"
              />
            </div>
          </div>
        </div>

        {/* Recharts Chart Area */}
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="n" stroke="var(--text-muted)" />
              <YAxis 
                scale={isLogScale ? 'log' : 'auto'} 
                domain={isLogScale ? [1, 'auto'] : [0, 'auto']} 
                stroke="var(--text-muted)" 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-surface-elevated)', 
                  borderColor: 'var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="catalan" 
                name="Catalan Parenthesizations C(n-1)" 
                stroke="var(--accent-coral)" 
                strokeWidth={2.5} 
                dot={{ r: 4 }} 
              />
              <Line 
                type="monotone" 
                dataKey="splitEvaluations" 
                name="Tabulation Splits Evaluated" 
                stroke="var(--accent-pink)" 
                strokeWidth={2} 
                dot={{ r: 3 }} 
              />
              <Line 
                type="monotone" 
                dataKey="dpCells" 
                name="DP Table Cells" 
                stroke="var(--accent-green)" 
                strokeWidth={2} 
                dot={{ r: 3 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Mathematical Formulas Breakdown */}
        <div className="formulas-explanation-grid">
          <div className="formula-card">
            <h4>1. Catalan Number Formula</h4>
            <div className="formula-code font-mono">
              C(n-1) = (1/n) × Binomial(2n - 2, n - 1)
            </div>
            <p>
              Counts the total number of binary bracketings (parenthesizations) for <code>n</code> matrices.
              For <code>n={sliderN}</code>: <strong>{formatNumber(selectedCounts.catalanParenthesizations)}</strong> valid parenthesizations.
            </p>
          </div>

          <div className="formula-card">
            <h4>2. Tabulation Splits Formula</h4>
            <div className="formula-code font-mono">
              Splits = n(n - 1)(n + 1) / 6
            </div>
            <p>
              Total candidate split points evaluated across all DP table cells.
              For <code>n={sliderN}</code>: only <strong>{selectedCounts.splitEvaluations}</strong> operations!
            </p>
          </div>

          <div className="formula-card">
            <h4>3. Non-Trivial DP Cells</h4>
            <div className="formula-code font-mono">
              Cells = n(n - 1) / 2
            </div>
            <p>
              Number of upper-triangular subproblems with chain length <code>L ≥ 2</code>.
              For <code>n={sliderN}</code>: exactly <strong>{selectedCounts.nonTrivialCells}</strong> entries in the DP table.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .complexity-container {
          max-width: 1400px;
          margin: 1rem auto;
          padding: 0 1.25rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .complexity-header {
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.25rem;
        }

        .header-title-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .complexity-header h2 {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .header-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        .current-chain-stats {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
        }

        .stat-pill {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.45rem 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .stat-label {
          font-size: 0.68rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }

        .stat-value {
          font-size: 0.95rem;
          font-weight: 700;
        }

        .table-card {
          overflow: hidden;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8rem;
        }

        .comparison-table th {
          background: var(--bg-app);
          padding: 0.75rem 1rem;
          text-align: left;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-medium);
          font-weight: 600;
        }

        .comparison-table td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid var(--border-subtle);
          color: var(--text-main);
        }

        .name-coral { color: var(--accent-coral-light); }
        .name-indigo { color: var(--accent-primary-light); }
        .name-green { color: var(--accent-green-light); }

        .desc-cell {
          font-family: var(--font-sans);
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .chart-controls {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .toggle-group {
          display: flex;
          align-items: center;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.15rem;
          gap: 0.15rem;
        }

        .toggle-btn {
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-sm);
          font-size: 0.74rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .active-toggle {
          background: var(--accent-cyan);
          color: #080d1a;
          font-weight: 700;
        }

        .slider-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .slider-box strong {
          color: var(--text-main);
        }

        .slider-input {
          width: 100px;
        }

        .chart-wrapper {
          padding: 1rem;
        }

        .formulas-explanation-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
          padding: 1rem 1.25rem 1.5rem;
          border-top: 1px solid var(--border-subtle);
        }

        .formula-card {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .formula-card h4 {
          font-size: 0.85rem;
          color: var(--text-main);
        }

        .formula-code {
          background: var(--bg-app);
          padding: 0.35rem 0.65rem;
          border-radius: var(--radius-sm);
          color: var(--accent-cyan-light);
          font-size: 0.78rem;
          border: 1px solid var(--border-subtle);
        }

        .formula-card p {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.45;
        }

        @media (max-width: 900px) {
          .complexity-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .chart-controls {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
