import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  GitFork, 
  Table, 
  Network, 
  HelpCircle, 
  ChevronRight, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Sparkles,
  BarChart3
} from 'lucide-react';

export default function LearnMode({ onNavigateToVisualize, onNavigateToComplexity }) {
  const [activeTopic, setActiveTopic] = useState('what-is-mcm');

  const topics = [
    { id: 'what-is-mcm', title: '1. What is Matrix Chain Multiplication?' },
    { id: 'why-parenthesization', title: '2. Why Does Parenthesization Matter?' },
    { id: 'cost-mechanics', title: '3. Scalar Multiplication Cost Mechanics' },
    { id: 'optimal-substructure', title: '4. Optimal Substructure Property' },
    { id: 'overlapping-subproblems', title: '5. Overlapping Subproblems & Recursion' },
    { id: 'mcm-recurrence', title: '6. The Fundamental MCM Recurrence' },
    { id: 'memo-vs-tabulation', title: '7. Memoization vs Bottom-Up Tabulation' },
    { id: 'diagonal-order', title: '8. Why the DP Table Fills Diagonally' },
    { id: 'split-reconstruction', title: '9. Reconstructing from Split Table s[i, j]' },
    { id: 'complexity-catalan', title: '10. Time Complexity & Catalan Numbers' }
  ];

  return (
    <div className="learn-container">
      <div className="learn-sidebar panel-card">
        <div className="sidebar-header">
          <BookOpen size={17} style={{ color: 'var(--accent-pink)' }} />
          <span>Core Concepts</span>
        </div>
        <nav className="topic-list">
          {topics.map(t => (
            <button
              key={t.id}
              className={`topic-btn ${activeTopic === t.id ? 'active-topic' : ''}`}
              onClick={() => setActiveTopic(t.id)}
            >
              <span>{t.title}</span>
              <ChevronRight size={14} className="arrow-icon" />
            </button>
          ))}
        </nav>
      </div>

      <div className="learn-main-content panel-card">
        {activeTopic === 'what-is-mcm' && (
          <article className="article-body">
            <h2>1. What is Matrix Chain Multiplication?</h2>
            <p className="lead-paragraph">
              Given a sequence (chain) of matrices <code>A1, A2, ..., An</code>, we wish to compute their product:
            </p>
            <div className="math-callout font-mono">
              A1 × A2 × A3 × ... × An
            </div>
            <p>
              Matrix multiplication is <strong>associative</strong>: <code>(A × B) × C = A × (B × C)</code>.
              This means no matter where we place the parentheses, the final matrix product will always be identical.
            </p>
            <div className="alert-box alert-pink">
              <strong>The Crucial Catch:</strong> While the final numerical result is identical, the <em>computational work</em> (number of scalar multiplications) required varies astronomically depending on the parenthesization order!
            </div>
            <div className="action-row">
              <button className="action-link-btn" onClick={onNavigateToVisualize}>
                <Layers size={15} />
                <span>Try this in Visualize Mode</span>
              </button>
            </div>
          </article>
        )}

        {activeTopic === 'why-parenthesization' && (
          <article className="article-body">
            <h2>2. Why Does Parenthesization Matter?</h2>
            <p>
              Let us take a classic introductory example with 3 matrices:
            </p>
            <ul className="bullet-list font-mono">
              <li>A1 of dimensions 10 × 100</li>
              <li>A2 of dimensions 100 × 5</li>
              <li>A3 of dimensions 5 × 50</li>
            </ul>
            <p>
              There are exactly two possible parenthesizations:
            </p>
            <div className="comparison-cards">
              <div className="comp-card card-bad">
                <h4>Order 1: (A1 × (A2 × A3))</h4>
                <p>1. Compute (A2 × A3): <code>100 × 5 × 50 = 25,000</code> operations (result is 100 × 50).</p>
                <p>2. Multiply A1 by result: <code>10 × 100 × 50 = 50,000</code> operations.</p>
                <div className="comp-total font-mono">Total = 75,000 scalar ops</div>
              </div>
              <div className="comp-card card-good">
                <h4>Order 2: ((A1 × A2) × A3)</h4>
                <p>1. Compute (A1 × A2): <code>10 × 100 × 5 = 5,000</code> operations (result is 10 × 5).</p>
                <p>2. Multiply result by A3: <code>10 × 5 × 50 = 2,500</code> operations.</p>
                <div className="comp-total font-mono highlight-green">Total = 7,500 scalar ops (10× faster!)</div>
              </div>
            </div>
            <p className="summary-note">
              Order 2 requires <strong>10 times less work</strong> than Order 1! For chains with 10 or 20 matrices, an optimal parenthesization can be millions of times faster than a poor one.
            </p>
          </article>
        )}

        {activeTopic === 'cost-mechanics' && (
          <article className="article-body">
            <h2>3. Scalar Multiplication Cost Mechanics</h2>
            <p>
              Recall standard matrix multiplication: if matrix <strong>X</strong> has dimensions <code>(a × b)</code> and matrix <strong>Y</strong> has dimensions <code>(b × c)</code>:
            </p>
            <div className="math-callout font-mono">
              Result dimensions = (a × c)
              <br />
              Scalar multiplications = a × b × c
            </div>
            <p>
              Each of the <code>a × c</code> entries in the product matrix is the dot product of a length-<code>b</code> row from X and a length-<code>b</code> column from Y, requiring <code>b</code> multiplications.
            </p>
            <div className="alert-box alert-green">
              <strong>In MCM:</strong> For a split point <code>k</code> between <code>Ai...Ak</code> and <code>Ak+1...Aj</code>, the resulting left matrix has dimensions <code>p[i-1] × p[k]</code> and the right matrix has dimensions <code>p[k] × p[j]</code>. Multiplying them costs <code>p[i-1] × p[k] × p[j]</code>.
            </div>
          </article>
        )}

        {activeTopic === 'optimal-substructure' && (
          <article className="article-body">
            <h2>4. Optimal Substructure Property</h2>
            <p>
              Dynamic programming applies because MCM exhibits <strong>optimal substructure</strong>:
            </p>
            <blockquote className="quote-block">
              "An optimal solution to the chain <code>A1...An</code> contains within it optimal solutions to the subchains <code>A1...Ak</code> and <code>Ak+1...An</code>."
            </blockquote>
            <p>
              <strong>Proof by cut-and-paste:</strong> Suppose the subchain <code>A1...Ak</code> was not evaluated optimally. Then we could substitute a cheaper parenthesization for <code>A1...Ak</code> into the overall expression, reducing the total cost. This contradicts the assumption that the overall parenthesization was optimal!
            </p>
          </article>
        )}

        {activeTopic === 'overlapping-subproblems' && (
          <article className="article-body">
            <h2>5. Overlapping Subproblems & Recursion</h2>
            <p>
              If we solve MCM with naive recursion without caching, the algorithm repeatedly solves the exact same subproblems exponentially many times:
            </p>
            <div className="alert-box alert-coral">
              For example, in a chain of 6 matrices, subproblem <code>MCM(2, 4)</code> is invoked dozens of times across independent recursive branches!
            </div>
            <p>
              There are only <code>n(n+1)/2</code> distinct subproblems <code>MCM(i, j)</code> for <code>1 ≤ i ≤ j ≤ n</code>. By storing each subproblem answer in a table, we turn an exponential \(O(2^n)\) recursion into a polynomial \(O(n^3)\) table fill.
            </p>
            <div className="action-row">
              <button className="action-link-btn" onClick={onNavigateToVisualize}>
                <GitFork size={15} />
                <span>See Repeated Subproblems in Recursion Tree</span>
              </button>
            </div>
          </article>
        )}

        {activeTopic === 'mcm-recurrence' && (
          <article className="article-body">
            <h2>6. The Fundamental MCM Recurrence</h2>
            <p>
              Let <code>m[i, j]</code> be the minimum number of scalar multiplications needed to compute <code>Ai...Aj</code>:
            </p>
            <div className="math-callout font-mono">
              m[i, i] = 0   (base case: single matrix)
              <br /><br />
              m[i, j] = min &#123; m[i, k] + m[k+1, j] + p[i-1]·p[k]·p[j] &#125;
              <br />
              for all k where i ≤ k &lt; j
            </div>
            <p>
              We try every possible split point <code>k</code> from <code>i</code> up to <code>j - 1</code>, compute the candidate sum, and pick the minimum.
            </p>
          </article>
        )}

        {activeTopic === 'memo-vs-tabulation' && (
          <article className="article-body">
            <h2>7. Memoization vs Bottom-Up Tabulation</h2>
            <div className="comparison-cards">
              <div className="comp-card">
                <h4>Top-Down Memoization</h4>
                <ul className="bullet-list">
                  <li>Natural recursive structure following the mathematical recurrence.</li>
                  <li>Solves subproblems on-demand; stores results in a memo table.</li>
                  <li>Incurs function call overhead and recursion call-stack space \(O(n)\).</li>
                </ul>
              </div>
              <div className="comp-card">
                <h4>Bottom-Up Tabulation</h4>
                <ul className="bullet-list">
                  <li>Iterative loops; fills table diagonally by increasing chain length \(L\).</li>
                  <li>Zero recursion overhead, cache-friendly memory locality.</li>
                  <li>Guarantees subproblems are ready when larger chains query them.</li>
                </ul>
              </div>
            </div>
          </article>
        )}

        {activeTopic === 'diagonal-order' && (
          <article className="article-body">
            <h2>8. Why the DP Table Fills Diagonally</h2>
            <p>
              Standard 2D loops iterate row-by-row or column-by-column. <strong>MCM cannot do that!</strong>
            </p>
            <p>
              To compute a cell <code>m[i, j]</code> of chain length <code>L = j - i + 1</code>, we need values <code>m[i, k]</code> and <code>m[k+1, j]</code>. Both of these dependencies represent subchains of length strictly less than <code>L</code>.
            </p>
            <div className="alert-box alert-cyan">
              <strong>Diagonal Filling Order:</strong>
              <br />
              1. Length L = 1 (main diagonal): <code>m[i, i] = 0</code>
              <br />
              2. Length L = 2 (chains of 2 matrices): <code>m[1,2], m[2,3], ...</code>
              <br />
              3. Length L = 3 (chains of 3 matrices): <code>m[1,3], m[2,4], ...</code>
              <br />
              4. Continue until L = n: <code>m[1, n]</code> gives the final answer!
            </div>
          </article>
        )}

        {activeTopic === 'split-reconstruction' && (
          <article className="article-body">
            <h2>9. Reconstructing from Split Table s[i, j]</h2>
            <p>
              The cost table <code>m[i, j]</code> tells us <em>how many multiplications</em> we need, but not <em>how to parenthesize</em>.
              To reconstruct the optimal expression, we maintain a companion split table <code>s[i, j]</code> that records the winning split index <code>k</code>.
            </p>
            <div className="math-callout font-mono">
              Print-Optimal-Parens(s, i, j):
              <br />
              &nbsp;&nbsp;if i == j: print "Ai"
              <br />
              &nbsp;&nbsp;else:
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;k = s[i, j]
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;print "("
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;Print-Optimal-Parens(s, i, k)
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;print " × "
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;Print-Optimal-Parens(s, k + 1, j)
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;print ")"
            </div>
          </article>
        )}

        {activeTopic === 'complexity-catalan' && (
          <article className="article-body">
            <h2>10. Time Complexity & Catalan Numbers</h2>
            <p>
              How many distinct parenthesizations exist for <code>n</code> matrices?
              The answer is given by the <strong>Catalan number</strong>:
            </p>
            <div className="math-callout font-mono">
              C(n-1) = (1/n) × Binomial(2n-2, n-1)
            </div>
            <p>
              Catalan numbers grow as \(\Omega(4^n / n^{3/2})\), which is strictly exponential!
              For \(n = 10\), there are 4,862 parenthesizations; for \(n = 20\), over 1.76 billion!
            </p>
            <p>
              In contrast, Bottom-Up DP evaluates only:
            </p>
            <div className="math-callout font-mono">
              Split evaluations = n(n - 1)(n + 1) / 6 = O(n³)
            </div>
            <div className="action-row">
              <button className="action-link-btn" onClick={onNavigateToComplexity}>
                <BarChart3 size={15} />
                <span>Explore the Interactive Catalan vs DP Chart</span>
              </button>
            </div>
          </article>
        )}
      </div>

      <style>{`
        .learn-container {
          max-width: 1500px;
          margin: 1rem auto;
          padding: 0 1.25rem;
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 1.25rem;
        }

        .learn-sidebar {
          padding: 0.85rem;
          height: fit-content;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-main);
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 0.5rem;
        }

        .topic-list {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .topic-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.55rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
          text-align: left;
        }

        .topic-btn:hover {
          background: var(--bg-surface-elevated);
          color: var(--text-main);
        }

        .active-topic {
          background: var(--accent-pink-glow);
          color: var(--accent-pink-light);
          border: 1px solid var(--accent-pink);
        }

        .learn-main-content {
          padding: 2rem;
          min-height: 580px;
        }

        .article-body {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          max-width: 850px;
        }

        .article-body h2 {
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .lead-paragraph {
          font-size: 1.02rem;
          color: var(--text-main);
        }

        .math-callout {
          background: var(--bg-app);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          padding: 1rem 1.25rem;
          color: var(--accent-pink-light);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .alert-box {
          border-radius: var(--radius-md);
          padding: 0.85rem 1.15rem;
          font-size: 0.85rem;
          line-height: 1.5;
        }

        .alert-pink {
          background: var(--accent-pink-glow);
          border: 1px solid var(--accent-pink);
          color: var(--text-main);
        }

        .alert-green {
          background: var(--accent-green-glow);
          border: 1px solid var(--accent-green);
          color: var(--text-main);
        }

        .alert-coral {
          background: var(--accent-coral-glow);
          border: 1px solid var(--accent-coral);
          color: var(--text-main);
        }

        .comparison-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .comp-card {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.82rem;
        }

        .comp-card h4 {
          font-size: 0.92rem;
          color: var(--text-main);
        }

        .card-bad {
          border-color: rgba(251, 113, 133, 0.4);
        }

        .card-good {
          border-color: rgba(110, 231, 183, 0.4);
        }

        .comp-total {
          margin-top: 0.5rem;
          font-weight: 700;
          font-size: 0.88rem;
        }

        .bullet-list {
          margin-left: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-size: 0.84rem;
          color: var(--text-muted);
        }

        .quote-block {
          border-left: 4px solid var(--accent-pink);
          padding-left: 1rem;
          font-style: italic;
          color: var(--text-main);
          font-size: 0.95rem;
        }

        .action-row {
          margin-top: 1rem;
        }

        .action-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1.15rem;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--accent-pink);
          border-radius: var(--radius-md);
          color: var(--accent-pink-light);
          font-weight: 600;
          font-size: 0.85rem;
        }

        .action-link-btn:hover {
          background: var(--accent-pink-glow);
          transform: translateY(-1px);
        }

        @media (max-width: 900px) {
          .learn-container {
            grid-template-columns: 1fr;
          }
          .comparison-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
