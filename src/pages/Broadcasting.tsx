import { useState, useMemo } from "react";
import { Radio } from "lucide-react";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, FormulaBar, ShapeBadge, Slider, Select, Divider } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { randMatrix, broadcastAdd, shape, fmt, type Matrix } from "../lib/ndarray";

type Scenario = "2d_row" | "2d_col" | "col_x_row" | "custom";

const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: "2d_row",    label: "2D + row vector" },
  { value: "2d_col",    label: "2D + column vector" },
  { value: "col_x_row", label: "Column x Row -> 2D" },
  { value: "custom",    label: "Custom shapes" },
];

const DESCRIPTION = "Broadcasting is how NumPy handles arithmetic between arrays of different shapes. When dimensions don't match, NumPy virtually stretches the smaller array to align with the larger one \u2014 without copying data. The animation shows three stages: (1) the original shapes, (2) how each array expands to a common shape, and (3) the element-wise computation on the expanded arrays.";

export default function Broadcasting() {
  const [scenario, setScenario] = useState<Scenario>("2d_row");
  const [aRows, setARows] = useState(3);
  const [aCols, setACols] = useState(4);
  const [bRows, setBRows] = useState(1);
  const [bCols, setBCols] = useState(4);

  const A = useMemo(() => {
    if (scenario === "2d_row") return randMatrix(3, 4, 1, 9, 5);
    if (scenario === "2d_col") return randMatrix(4, 3, 1, 9, 5);
    if (scenario === "col_x_row") return randMatrix(4, 1, 1, 9, 5);
    return randMatrix(aRows, aCols, 1, 9, 5);
  }, [scenario, aRows, aCols]);

  const B = useMemo(() => {
    if (scenario === "2d_row") return randMatrix(1, 4, 1, 9, 15);
    if (scenario === "2d_col") return randMatrix(4, 1, 1, 9, 15);
    if (scenario === "col_x_row") return randMatrix(1, 5, 1, 9, 15);
    return randMatrix(bRows, bCols, 1, 9, 15);
  }, [scenario, bRows, bCols]);

  const [rA, cA] = shape(A);
  const [rB, cB] = shape(B);
  const outR = Math.max(rA, rB);
  const outC = Math.max(cA, cB);

  const Aexp: Matrix = Array.from({ length: outR }, (_, i) =>
    Array.from({ length: outC }, (_, j) => A[i % rA][j % cA]));
  const Bexp: Matrix = Array.from({ length: outR }, (_, i) =>
    Array.from({ length: outC }, (_, j) => B[i % rB][j % cB]));

  let result: Matrix;
  let compatible = true;
  try { result = broadcastAdd(A, B); } catch { result = []; compatible = false; }

  const resultCells = outR * outC;
  const totalSteps = 2 + resultCells;
  const anim = useAnimation({ totalSteps, baseMs: 600 });
  const stage = anim.step < 1 ? 0 : anim.step < 2 ? 1 : 2;
  const cellIdx = Math.max(0, anim.step - 2);

  return (
    <PageShell title="Broadcasting" icon={<Radio size={22} />} accent="indigo" description={DESCRIPTION}>
      <div className="flex flex-wrap gap-4 items-end">
        <Select label="Scenario" value={scenario} onChange={setScenario as any} options={SCENARIOS} />
        {scenario === "custom" && (
          <>
            <Slider label="A rows" value={aRows} min={1} max={5} onChange={setARows} />
            <Slider label="A cols" value={aCols} min={1} max={6} onChange={setACols} />
            <Slider label="B rows" value={bRows} min={1} max={5} onChange={setBRows} />
            <Slider label="B cols" value={bCols} min={1} max={6} onChange={setBCols} />
          </>
        )}
      </div>

      <AnimControls {...anim} onToggle={anim.toggle} onReset={anim.reset}
        label={stage === 0 ? "originals" : stage === 1 ? "expanded" : "computing"} />

      {/* Stage 0: Originals */}
      <div>
        <h3 className="text-sm font-semibold text-txt-secondary mb-2 font-mono uppercase tracking-wider">
          Stage 1 &mdash; Original shapes
        </h3>
        <div className="flex gap-6 flex-wrap items-start">
          <ArrayGrid data={A} title="A" accent="blue" decimals={0} label={`${rA}x${cA}`} />
          <ArrayGrid data={B} title="B" accent="pink" decimals={0} label={`${rB}x${cB}`} />
        </div>
      </div>

      {/* Stage 1: Expanded */}
      {stage >= 1 && (
        <div>
          <Divider />
          <h3 className="text-sm font-semibold text-txt-secondary mb-2 mt-4 font-mono uppercase tracking-wider">
            Stage 2 &mdash; Virtual expansion (no data copy)
          </h3>
          <div className="flex gap-6 flex-wrap items-start">
            <ArrayGrid data={Aexp} title="A broadcast" accent="blue" decimals={0} label={`${outR}x${outC}`} />
            <ArrayGrid data={Bexp} title="B broadcast" accent="pink" decimals={0} label={`${outR}x${outC}`} />
          </div>
        </div>
      )}

      {/* Stage 2: Result building */}
      {stage >= 2 && compatible && (
        <div>
          <Divider />
          <h3 className="text-sm font-semibold text-txt-secondary mb-2 mt-4 font-mono uppercase tracking-wider">
            Stage 3 &mdash; Element-wise result
          </h3>
          {(() => {
            const cr = Math.floor(cellIdx / outC);
            const cc = cellIdx % outC;
            const partial: Matrix = result.map((row, i) =>
              row.map((v, j) => (i * outC + j <= cellIdx ? v : NaN)));
            return (
              <>
                <ArrayGrid data={partial} title="A + B" accent="amber" decimals={0}
                  cellMeta={(r, c) => (r === cr && c === cc ? { glow: "amber" } : {})} />
                <FormulaBar accent="amber">
                  [{cr},{cc}]: <span className="accent-blue">{fmt(Aexp[cr]?.[cc] ?? 0, 0)}</span>
                  {" + "}<span className="accent-pink">{fmt(Bexp[cr]?.[cc] ?? 0, 0)}</span>
                  {" = "}<span className="accent-amber font-bold">{fmt(result[cr]?.[cc] ?? 0, 0)}</span>
                </FormulaBar>
              </>
            );
          })()}
        </div>
      )}

      {!compatible && (
        <div className="accent-indigo accent-bg-rose border accent-border-rose rounded-xl px-5 py-3 text-sm">
          Shapes ({rA}x{cA}) and ({rB}x{cB}) are not broadcast-compatible.
        </div>
      )}

      <CodePanel code={`# A.shape = (${rA}, ${cA}), B.shape = (${rB}, ${cB})\nresult = A + B  # broadcast -> (${outR}, ${outC})`} />
    </PageShell>
  );
}
