import { useState, useMemo } from "react";
import { Grid3x3 } from "lucide-react";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, FormulaBar, ShapeBadge, ControlsRow, StepExplainer, Slider, Divider, Panel, ValueInput } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { randMatrix, matmul, shape, fmt, validateMatmulCompatible, type Matrix } from "../lib/ndarray";

const DESCRIPTION = "Matrix multiplication computes each cell of the output by taking the dot product of a row from A and a column from B. The goal is to see exactly which elements participate in each output cell. The animation selects one output cell at a time, highlights the corresponding row and column, shows the element-wise products, and sums them to produce the result.";

export default function MatMul() {
  const [m, setM] = useState(3);
  const [n, setN] = useState(3);
  const [p, setP] = useState(4);
  const [customA, setCustomA] = useState<Matrix | null>(null);
  const [customB, setCustomB] = useState<Matrix | null>(null);

  const A = useMemo(() => customA ?? randMatrix(m, n, 1, 9, 7), [m, n, customA]);
  const B = useMemo(() => customB ?? randMatrix(n, p, 1, 9, 57), [n, p, customB]);
  const [rA, cA] = shape(A);
  const [rB, cB] = shape(B);
  const C = useMemo(() => matmul(A, B), [A, B]);
  const outP = cB;
  const totalSteps = rA * outP;
  const anim = useAnimation({ totalSteps, baseMs: 900 });
  const si = Math.floor(anim.step / outP), sj = anim.step % outP;

  const pairs = Array.from({ length: cA }, (_, k) => ({ a: A[si]?.[k] ?? 0, b: B[k]?.[sj] ?? 0, prod: (A[si]?.[k] ?? 0) * (B[k]?.[sj] ?? 0) }));
  const dotVal = pairs.reduce((s, pp) => s + pp.prod, 0);

  return (
    <PageShell title="Matrix Multiply" icon={<Grid3x3 size={22} />} accent="amber" description={DESCRIPTION}>
      <ControlsRow>
        <Slider label="A rows (m)" value={m} min={2} max={5} onChange={(v) => { setM(v); setCustomA(null); }} />
        <Slider label="Shared (n)" value={n} min={2} max={5} onChange={(v) => { setN(v); setCustomA(null); setCustomB(null); }} />
        <Slider label="B cols (p)" value={p} min={2} max={6} onChange={(v) => { setP(v); setCustomB(null); }} />
      </ControlsRow>

      <div className="flex gap-4 flex-wrap">
        <ValueInput label="values for A" onParsed={setCustomA} accent="blue" onValidate={(a) => validateMatmulCompatible(a, B)} />
        <ValueInput label="values for B" onParsed={setCustomB} accent="pink" onValidate={(b) => validateMatmulCompatible(A, b)} />
      </div>

      <div className="flex items-center gap-2 font-mono text-sm text-txt-secondary flex-wrap">
        <span className="accent-blue font-bold">A</span> <ShapeBadge shape={[rA, cA]} accent="blue" />
        <span className="text-txt-muted">@</span>
        <span className="accent-pink font-bold">B</span> <ShapeBadge shape={[rB, cB]} accent="pink" />
        <span className="text-txt-muted">&rarr;</span>
        <span className="accent-amber font-bold">C</span> <ShapeBadge shape={[rA, outP]} accent="amber" />
      </div>

      <Divider />

      <Panel title="Step-by-step Matmul" accent="amber">
        <AnimControls {...anim} onToggle={anim.toggle} onReset={anim.reset} label="cell" />

        <div className="flex gap-5 flex-wrap items-start">
          <ArrayGrid data={A} title="A" accent="blue" decimals={0}
            cellMeta={(r) => (r === si ? { glow: "blue" } : { dim: true })} />
          <ArrayGrid data={B} title="B" accent="pink" decimals={0}
            cellMeta={(_, c) => (c === sj ? { glow: "pink" } : { dim: true })} />
          <ArrayGrid
            data={C.map((row, i) => row.map((v, j) => (i * outP + j <= anim.step ? v : NaN)))}
            title="C = A @ B" accent="amber" decimals={0}
            cellMeta={(r, c) => (r === si && c === sj ? { glow: "amber" } : {})} />
        </div>

        <div className="glass-panel p-4 border border-edge">
          <div className="text-[10px] text-txt-muted font-mono uppercase tracking-wider mb-2">
            C[{si},{sj}] = row {si} of A &middot; col {sj} of B
          </div>
          <div className="flex items-center gap-2 flex-wrap font-mono text-sm">
            {pairs.map((pp, k) => (
              <span key={k} className="flex items-center gap-1">
                {k > 0 && <span className="text-txt-muted">+</span>}
                <span className="accent-blue">{fmt(pp.a, 0)}</span>
                <span className="text-txt-muted">&times;</span>
                <span className="accent-pink">{fmt(pp.b, 0)}</span>
              </span>
            ))}
            <span className="text-txt-muted">=</span>
            {pairs.map((pp, k) => (
              <span key={k} className="flex items-center gap-1">
                {k > 0 && <span className="text-txt-muted">+</span>}
                <span className="text-txt-secondary">{fmt(pp.prod, 0)}</span>
              </span>
            ))}
            <span className="text-txt-muted">=</span>
            <span className="accent-amber font-bold text-lg">{fmt(dotVal, 0)}</span>
          </div>
        </div>

        <StepExplainer accent="amber"
          text={`To compute C[${si},${sj}], NumPy takes the entire row ${si} from A (${cA} values) and the entire column ${sj} from B (${cA} values), multiplies them element-wise, then sums the products. This dot product equals ${fmt(dotVal, 0)}.`} />
      </Panel>

      <CodePanel code={`C = A @ B          # np.matmul(A, B)\n# C[${si},${sj}] = sum(A[${si},:] * B[:,${sj}]) = ${fmt(dotVal, 0)}`} />
    </PageShell>
  );
}
