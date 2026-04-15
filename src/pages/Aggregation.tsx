import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, FormulaBar, Slider, Select, BigResult } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { randMatrix, sumAxis, meanAxis, maxAxis, minAxis, fmt, type Matrix, type Vector } from "../lib/ndarray";

type AggFn = "sum" | "mean" | "max" | "min";
type AxisChoice = "0" | "1" | "none";

const AGG_FNS: Record<AggFn, (m: Matrix, a: 0 | 1 | null) => Vector | number> = {
  sum: sumAxis, mean: meanAxis, max: maxAxis, min: minAxis,
};

const DESCRIPTION = "Aggregation functions collapse an array along a chosen axis. With axis=0, each column is reduced to a single value; with axis=1, each row is reduced. With axis=None, the entire array becomes one number. The animation processes one group (row or column) at a time, showing which cells feed into each aggregated result.";

export default function Aggregation() {
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(5);
  const [aggKey, setAggKey] = useState<AggFn>("sum");
  const [axisStr, setAxisStr] = useState<AxisChoice>("0");

  const axis: 0 | 1 | null = axisStr === "none" ? null : Number(axisStr) as 0 | 1;
  const arr = useMemo(() => randMatrix(rows, cols, 1, 20, 11), [rows, cols]);
  const result = useMemo(() => AGG_FNS[aggKey](arr, axis), [arr, aggKey, axis]);

  const nGroups = axis === 0 ? cols : axis === 1 ? rows : 1;
  const anim = useAnimation({ totalSteps: nGroups, baseMs: 800 });

  const accentColor = axis === 0 ? "pink" : axis === 1 ? "amber" : "indigo";

  return (
    <PageShell title="Aggregations" icon={<BarChart3 size={22} />} accent="blue" description={DESCRIPTION}>
      <div className="flex flex-wrap gap-4 items-end">
        <Slider label="Rows" value={rows} min={2} max={6} onChange={setRows} />
        <Slider label="Cols" value={cols} min={2} max={6} onChange={setCols} />
        <Select label="Function" value={aggKey} onChange={setAggKey as any}
          options={[{ value: "sum", label: "sum" }, { value: "mean", label: "mean" },
                    { value: "max", label: "max" }, { value: "min", label: "min" }]} />
        <Select label="Axis" value={axisStr} onChange={setAxisStr as any}
          options={[{ value: "0", label: "axis=0 (cols)" }, { value: "1", label: "axis=1 (rows)" },
                    { value: "none", label: "axis=None (all)" }]} />
      </div>

      <AnimControls {...anim} onToggle={anim.toggle} onReset={anim.reset}
        label={axis === 0 ? "column" : axis === 1 ? "row" : "all"} />

      <div className="flex gap-8 flex-wrap items-start">
        <ArrayGrid data={arr} title={`Input (${rows}x${cols})`} accent="blue" decimals={0}
          cellMeta={(r, c) => {
            if (axis === 0 && c === anim.step) return { glow: "pink" };
            if (axis === 1 && r === anim.step) return { glow: "amber" };
            if (axis === null) return { glow: "indigo" };
            return { dim: true };
          }} />

        {axis !== null && Array.isArray(result) && (() => {
          const partial = (result as Vector).map((v, i) => (i <= anim.step ? v : NaN));
          const data: Matrix = axis === 0 ? [partial] : partial.map((v) => [v]);
          return <ArrayGrid data={data} title="Result" accent={accentColor} decimals={2} />;
        })()}

        {axis === null && typeof result === "number" && (
          <BigResult value={fmt(result, 4)} label={`${aggKey}(all)`} accent="indigo" />
        )}
      </div>

      {/* Formula for current group */}
      {(() => {
        let vals: number[] = [];
        if (axis === 0) vals = arr.map((row) => row[anim.step]);
        else if (axis === 1) vals = arr[anim.step] ?? [];
        else vals = arr.flat();
        const groupResult = AGG_FNS[aggKey]([vals], axis === null ? null : 1);
        const gVal = Array.isArray(groupResult) ? groupResult[0] : groupResult;
        return (
          <FormulaBar accent={accentColor}>
            {aggKey}([{vals.slice(0, 8).map((v) => fmt(v, 0)).join(", ")}
            {vals.length > 8 ? ", ..." : ""}]) = <span className="accent-amber font-bold">{fmt(gVal as number, 2)}</span>
          </FormulaBar>
        );
      })()}

      {/* Mini bar chart */}
      {axis !== null && Array.isArray(result) && (
        <div className="flex items-end gap-1 h-32 px-2">
          {(result as Vector).map((v, i) => {
            const maxV = Math.max(...(result as Vector), 1);
            const h = (v / maxV) * 100;
            const active = i <= anim.step;
            return (
              <div key={i} className="flex flex-col items-center flex-1 gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: active ? `${h}%` : "0%" }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={`w-full rounded-t ${active ? "bg-[var(--accent)]" : "bg-surface-2"}`}
                  style={{ minHeight: active ? 4 : 0 }}
                />
                <span className="text-[10px] font-mono text-txt-muted">{axis === 0 ? `c${i}` : `r${i}`}</span>
              </div>
            );
          })}
        </div>
      )}

      <CodePanel code={`np.${aggKey}(arr, axis=${axis === null ? "None" : axis})`} />
    </PageShell>
  );
}
