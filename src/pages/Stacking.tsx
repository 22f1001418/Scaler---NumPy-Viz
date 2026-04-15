import { useState, useMemo } from "react";
import { Layers } from "lucide-react";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, FormulaBar, Slider, Select } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { randMatrix, vstack, hstack, shape, type Matrix } from "../lib/ndarray";

type Op = "vstack" | "hstack";

const DESCRIPTION = "Stacking combines two arrays along a chosen axis. vstack (vertical) stacks rows on top of each other \u2014 both arrays must have the same number of columns. hstack (horizontal) places columns side by side \u2014 both must have the same number of rows. The animation reveals the output one row (or column) at a time, highlighting which source array each slice comes from.";

export default function Stacking() {
  const [op, setOp] = useState<Op>("vstack");
  const [sharedDim, setSharedDim] = useState(4);
  const [dimA, setDimA] = useState(2);
  const [dimB, setDimB] = useState(3);

  const A = useMemo(() => randMatrix(
    op === "hstack" ? sharedDim : dimA,
    op === "vstack" ? sharedDim : dimA,
    1, 9, 3
  ), [op, sharedDim, dimA]);

  const B = useMemo(() => randMatrix(
    op === "hstack" ? sharedDim : dimB,
    op === "vstack" ? sharedDim : dimB,
    10, 19, 53
  ), [op, sharedDim, dimB]);

  const isVert = op === "vstack";
  const result = useMemo(() => isVert ? vstack(A, B) : hstack(A, B), [A, B, isVert]);
  const [rR, cR] = shape(result);

  const totalSteps = isVert ? rR : cR;
  const anim = useAnimation({ totalSteps, baseMs: 700 });

  const [rA] = shape(A);
  const origin = isVert
    ? (anim.step < rA ? "A" : "B")
    : (anim.step < shape(A)[1] ? "A" : "B");

  return (
    <PageShell title="Stacking & Splitting" icon={<Layers size={22} />} accent="pink" description={DESCRIPTION}>
      <div className="flex flex-wrap gap-4 items-end">
        <Select label="Operation" value={op} onChange={setOp as any}
          options={[
            { value: "vstack", label: "vstack (vertical)" },
            { value: "hstack", label: "hstack (horizontal)" },
          ]} />
        <Slider label="Shared dim" value={sharedDim} min={2} max={6} onChange={setSharedDim} />
        <Slider label="A size" value={dimA} min={1} max={4} onChange={setDimA} />
        <Slider label="B size" value={dimB} min={1} max={4} onChange={setDimB} />
      </div>

      <AnimControls {...anim} onToggle={anim.toggle} onReset={anim.reset}
        label={isVert ? "row" : "col"} />

      <div className="flex gap-6 flex-wrap items-start">
        <ArrayGrid data={A} title="A" accent="blue" decimals={0} />
        <ArrayGrid data={B} title="B" accent="pink" decimals={0} />
        <ArrayGrid
          data={isVert
            ? result.map((row, i) => (i <= anim.step ? row : row.map(() => NaN)))
            : result.map((row) => row.map((v, j) => (j <= anim.step ? v : NaN)))
          }
          title={`${op} -> (${rR}x${cR})`}
          accent="amber" decimals={0}
          cellMeta={(r, c) => {
            const active = isVert ? r === anim.step : c === anim.step;
            return active ? { glow: "amber" } : {};
          }}
        />
      </div>

      <FormulaBar accent="amber">
        {isVert ? "Row" : "Col"} {anim.step} comes from <span className={`font-bold ${origin === "A" ? "accent-blue" : "accent-pink"}`}>{origin}</span>
      </FormulaBar>

      <CodePanel code={`np.${op}([A, B])`} />
    </PageShell>
  );
}
