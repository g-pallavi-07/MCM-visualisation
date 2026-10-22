# MCM Studio — See the Logic Behind Dynamic Programming

> *From exponential recursion to optimal computation.*

An interactive algorithm visualization laboratory designed for computer science students and educators to master **Matrix Chain Multiplication (MCM)** and the core principles of **Dynamic Programming (DP)**.

---

## 🌟 Key Features

### 1. Three Synchronized Workspaces
- **Left Panel — Recursive Computation:**
  - Interactive SVG tree visualizing subproblem invocations $MCM(i, j)$.
  - Visually flags duplicate calls in rose/coral (`Call #5 (DUP)`), cache hits in indigo (`⚡ Cache Hit`), and active evaluations in cyan.
  - Zoom, pan, and click nodes to inspect recurrence branches.
  - In Tabulation mode, clearly explains why no call stack exists in bottom-up DP.
- **Center Panel — DP Cost Table ($m[i, j]$) & Split Table ($s[i, j]$):**
  - Interactive matrix grid populated diagonally by chain length $L = 2, 3, \dots, n$.
  - Highlights active cells, read dependencies ($m[i, k]$ and $m[k+1, j]$), and candidate splits.
  - Toggle between Cost Table and Split Table.
  - Click any cell to inspect its candidate split arithmetic.
- **Right Panel — Optimal Parenthesization Tree & Tie Explorer:**
  - Reconstructs the binary evaluation tree from the DP split table $s[i, j]$.
  - Internal nodes show chosen split $k$, resulting matrix dimensions, and scalar multiplication cost.
  - View switch between SVG Tree, Formula Expression, and Step-by-Step multiplication breakdown.
  - **Ties & Multiple Optima Explorer:** Detects equal-cost splits and allows users to explore alternative optimal parenthesization structures.

### 2. Five-Stage DP Calculation Inspector
Deeply explains every subproblem calculation in real time:
- **Stage 1:** Subproblem identity ($A_i \dots A_j$).
- **Stage 2:** Enumeration of all valid split points $k \in [i, j-1]$.
- **Stage 3:** Candidate cost breakdown ($m[i, k] + m[k+1, j] + p[i-1] \times p[k] \times p[j]$).
- **Stage 4:** Minimum selection and tie detection.
- **Stage 5:** Matrix dimension arithmetic theorem.

### 3. Step-by-Step Execution Engine & Timeline Log
- **Genuine Backward Navigation:** Derives state from discrete, deterministic snapshots. Stepping backward accurately restores tables, trees, highlights, and metrics.
- **Controls:** Play/Pause, Step Forward, Step Backward, Restart, Speed slider (0.5x to 5x), Timeline scrubber, Jump to chain length $L$, Jump to specific DP cell.
- **Keyboard Shortcuts:** `Space` (Play/Pause), `ArrowLeft` (Step Back), `ArrowRight` (Step Forward), `R` (Restart).
- **Clickable Event Log:** Click any historical step to immediately synchronize all 3 panels and metrics to that moment.

### 4. Three Authentic Algorithm Modes
- **Mode A: Brute Force Recursion:** Pure recursive execution without memoization; exposes exponential redundant subproblems. Features safe call limit to prevent browser freezes on large $n$.
- **Mode B: Top-Down Memoization:** Recursion with memo cache; highlights cache hits vs cache misses and real-time memoization.
- **Mode C: Bottom-Up Tabulation:** Pure iterative DP filling the table diagonally; demonstrates optimal $O(n^3)$ table synthesis with zero call stack overhead.

### 5. Active Practice & Challenge Quizzes
- **Challenge 1:** Predict the Minimum Cost for an unfinished DP cell.
- **Challenge 2:** Predict the Optimal Split point $k$.
- **Challenge 3:** Reconstruct the Parenthesization expression from the split table.
- Dynamically generated from the user's active dimensions and DP state (never hardcoded!).
- Hints, score tracking, streak counters, explanations for incorrect answers, and solution reveal.

### 6. Complexity Dashboard & Catalan Growth
- Theoretical vs empirical comparison table.
- Exact BigInt calculation of Catalan numbers: $C(n-1) = \frac{1}{n}\binom{2n-2}{n-1}$.
- Theoretical operation counts: $\frac{n(n-1)(n+1)}{6}$ tabulation split evaluations, $\frac{n(n-1)}{2}$ non-trivial cells.
- Recharts interactive growth chart comparing Catalan parenthesizations vs DP work, with Logarithmic / Linear scale toggle and matrix size slider.

### 7. Interactive Learning Theory
- 10 modular lessons covering associative multiplication, cost mechanics, optimal substructure, overlapping subproblems, diagonal table order, and split reconstruction.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone or navigate into the project directory
cd "MCM visualisation"

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit the local URL shown in your terminal (typically `http://localhost:5173/`).

### Production Build

```bash
# Create optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

### Running the Acceptance Tests

```bash
node src/algorithm/acceptance-tests.js
```

---

## 📁 Project Structure

```
├── src/
│   ├── algorithm/
│   │   ├── mcm.js               # Mathematical core, DP solver, BigInt Catalan, tree reconstruction
│   │   ├── events.js            # Deterministic discrete event generator for all 3 modes
│   │   └── acceptance-tests.js  # Automated test suite covering acceptance criteria
│   ├── components/
│   │   ├── Navbar.jsx           # App header, mode switcher (Visualize/Learn/Practice/Complexity), theme
│   │   ├── ConfigPanel.jsx      # Dimension inputs, validation, presets, matrix cards, mode selector
│   │   ├── ExecutionControls.jsx# Play/Pause, Step Back/Forward, Speed, Scrubber, L-jumper
│   │   ├── MetricsBar.jsx       # Real-time instrumentation (calls, cache hits/misses, DP cells, cost)
│   │   ├── RecursionTree.jsx    # SVG call tree, zoom/pan, duplicate highlights, memo hit tags
│   │   ├── DPTable.jsx          # Cost & Split table grid, diagonal order, dependency highlights
│   │   ├── ParenthesizationTree.jsx # Binary evaluation tree, expression view, step trace, tie explorer
│   │   ├── CalculationInspector.jsx # 5-stage arithmetic breakdown of active subproblem
│   │   ├── ExecutionLog.jsx     # Clickable timeline of all algorithm events
│   │   ├── LearnMode.jsx        # Comprehensive DP theory with interactive links
│   │   ├── PracticeMode.jsx     # Dynamic quizzes, hint system, score/streak tracking
│   │   └── ComplexityDashboard.jsx # Catalan BigInt analysis, Recharts growth curves
│   ├── styles/
│   │   ├── variables.css        # CSS variables color system (navy/cyan/green/amber/coral)
│   │   └── global.css           # Typography, keyframes, scrollbars, cards
│   ├── utils/
│   │   └── formatters.js        # Dimension validation, number formatters, preset definitions
│   ├── App.jsx                  # Main application orchestrator & state synchronization
│   └── main.jsx                 # Entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## 🧪 Acceptance Test Results

All 34 automated unit assertions pass:
- **Test A:** Three matrices `[10, 30, 5, 60]` $\rightarrow$ $n=3$, $C(2)=2$, Min cost: 4500, Expression: `((A1 × A2) × A3)`.
- **Test B:** Four matrices `[10, 30, 5, 60, 2]` $\rightarrow$ $n=4$, $C(3)=5$, Min cost: 1500, valid tree reconstruction.
- **Test C:** Equal dimensions `[10, 10, 10, 10, 10]` $\rightarrow$ 3 optimal tie locations detected, alternative optimal trees explorable.
- **Test D:** Invalid inputs (`[10, 0, 20]`, `[10, -5, 20]`, `[10, 20.5, 30]`, single matrix) produce clear inline validation messages.
- **Test E:** Deterministic stepping, reversible step backward, scrubber, and restart.
- **Test F:** Algorithmic equivalence: Brute Force, Memoization, and Tabulation compute identical optimal costs.
- **Test G:** Exact agreement with theoretical Catalan and split evaluation formulas.

---

## 🎨 Design Philosophy
- **Dark Laboratory Aesthetic:** Deep navy canvas (`#080d1a`, `#111c33`) with high-contrast text and purposeful semantic accents.
- **Mathematical Integrity:** High-precision monospace notation, exact formula rendering, and genuine algorithmic state rather than mocked sequences.
- **Pedagogical Synchronization:** Advancing one step simultaneously illuminates the recursive call, the DP cell, the candidate split arithmetic, and the parenthesization subtree.
