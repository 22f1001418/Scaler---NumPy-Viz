# 🔬 NumPy Visualizer v3

A cinematic, animation-first interactive tool for visualizing NumPy operations.  
Built with **React 18 + Vite + Framer Motion + Tailwind CSS**.

---

## Quick Start

```bash
cd numpy-viz
npm install
npm run dev          # opens http://localhost:3000
```

Production build:
```bash
npm run build        # static output in dist/
```

---

## What's New in v3

### Proper Light Theme
Every accent color has a **distinct darker variant** for light mode (`#22d3ee` → `#0891b2`, `#a78bfa` → `#7c3aed`, etc.). Cell glow effects, heatmap backgrounds, and panel shadows all adapt automatically via CSS custom properties — not just inverted.

### User Array Input
Every page has a "Paste custom array" button (terminal icon). Type or paste arrays in any format:
- JSON: `[[1,2],[3,4]]`
- Space-separated: `1 2 3\n4 5 6`
- CSV: `1,2,3\n4,5,6`

Plus double-click any cell for inline editing.

### Heatmap Cell Backgrounds
Cells now show 5-level value-intensity backgrounds (`cell-heat-{accent}-{0..4}`). Higher values get deeper color saturation — makes patterns in matrices instantly visible.

### Rich UI — Not Minimalistic
- **Glass-morphism panels** (`backdrop-blur`) for all cards and sections
- **Mesh gradient background** — colored radial gradients + subtle grid overlay
- **Categorized sidebar** — operations grouped into Core, Shape & Transform, Analysis
- **Step Explainer** — prose text explaining what's happening at the current animation step
- **Speed control** — 0.5x / 1x / 1.5x / 2x / 3x buttons on every animation bar
- **Keyboard shortcuts** — Space=play/pause, ←→=step, Home/End=jump
- **Hover tooltips** on cells showing `[row, col] = value`
- **Gradient progress bar** with scrub knob on animation controls
- **Accent-colored top line** on code panels

### Technical Upgrades
- All CSS colors use custom properties — theme switches are instantaneous
- Heatmap levels computed via `heatLevel()` utility
- `parseMatrix()` accepts JSON, whitespace-separated, or CSV input
- Animation hook reads speed multiplier from Zustand store
- Keyboard event handler in `useAnimation` for shortcuts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Animation | Framer Motion 11 |
| Styling | Tailwind CSS 3 + CSS custom properties |
| State | Zustand 5 |
| Code highlight | prism-react-renderer |
| Icons | Lucide React |
| Math engine | Custom `src/lib/ndarray.ts` |

---

## Pages (9 operations + home)

| Page | Key Operations |
|---|---|
| **Element-wise** | `+ − × ÷ ** % >` — cell-by-cell animation + explainer text |
| **Matrix Multiply** | Animated row×column with full dot-product drill-down |
| **Reshape & Transpose** | Elements flow between shapes with position tracking |
| **Broadcasting** | 3-stage: originals → expansion → result building |
| **Slicing & Indexing** | Basic/fancy/boolean — animated mask scan |
| **Aggregations** | Axis collapse with bar chart, group-by-group |
| **Stacking** | vstack/hstack — row/column assembly animation |
| **Sorting** | Bar chart animation + argsort index tracing + unique counts |
| **Cumulative** | cumsum/cumprod/diff with live SVG line chart |

---

## Project Structure

```
src/
├── main.tsx
├── App.tsx
├── index.css                    # Dual theme vars, glass panels, heatmap classes
├── lib/ndarray.ts               # Math engine + parseMatrix()
├── store/useStore.ts            # Zustand: page, theme, speed
├── hooks/useAnimation.ts        # Step controller + keyboard shortcuts
├── components/
│   ├── ArrayGrid.tsx            # ⭐ Heatmap cells, hover tooltip, inline edit
│   ├── AnimControls.tsx         # Transport bar + speed selector
│   ├── Sidebar.tsx              # Categorized nav + theme toggle
│   ├── CodePanel.tsx            # Syntax-highlighted Python
│   └── UI.tsx                   # Panel, ArrayInput, StepExplainer, Slider...
└── pages/                       # 10 page components
```

---

## License

MIT
