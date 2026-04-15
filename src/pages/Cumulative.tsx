import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, FormulaBar, Slider, Select } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { randVector, cumsum, cumprod, diff, fmt } from "../lib/ndarray";

type Op = "cumsum" | "cumprod" | "diff";

const DESCRIPTION = "Cumulative operations build a running result across an array. cumsum keeps a running total, cumprod a running product, and diff computes the difference between consecutive elements. The animation reveals each output value one at a time, showing which input elements contribute and the running formula at each step.";

export default function Cumulative() {
  const [op, setOp] = useState<Op>("cumsum");
  const [n, setN] = useState(8);

  const arr = useMemo(
    () => op === "cumprod" ? randVector(n, 1, 4, 15) : randVector(n, 1, 15, 15),
    [n, op]
  );

  const result = useMemo(() => {
    if (op === "cumsum") return cumsum(arr);
    if (op === "cumprod") return cumprod(arr);
    return diff(arr);
  }, [arr, op]);

  const anim = useAnimation({ totalSteps: result.length, baseMs: 700 });
  const maxResult = Math.max(...result.map(Math.abs), 1);

  const formulaText = useMemo(() => {
    const s = anim.step;
    if (op === "cumsum") {
      const parts = arr.slice(0, s + 1).map((v) => fmt(v, 0)).join(" + ");
      return `${parts} = ${fmt(result[s], 0)}`;
    }
    if (op === "cumprod") {
      const parts = arr.slice(0, s + 1).map((v) => fmt(v, 0)).join(" x ");
      return `${parts} = ${fmt(result[s], 0)}`;
    }
    return `arr[${s + 1}] - arr[${s}] = ${fmt(arr[s + 1], 0)} - ${fmt(arr[s], 0)} = ${fmt(result[s], 0)}`;
  }, [anim.step, arr, result, op]);

  return (
    <PageShell title="Cumulative Operations" icon={<TrendingUp size={22} />} accent="indigo" description={DESCRIPTION}>
      <div className="flex flex-wrap gap-4 items-end">
        <Select label="Operation" value={op} onChange={setOp as any}
          options={[{ value: "cumsum", label: "cumsum" }, { value: "cumprod", label: "cumprod" },
                    { value: "diff", label: "diff" }]} />
        <Slider label="Elements" value={n} min={4} max={14} onChange={setN} />
      </div>

      <AnimControls {...anim} onToggle={anim.toggle} onReset={anim.reset} label="step" />

      {/* Arrays */}
      <div className="flex gap-8 flex-wrap items-start">
        <ArrayGrid data={[arr]} title="Input" accent="blue" decimals={0}
          cellMeta={(_, c) => {
            if (op === "diff") {
              if (c === anim.step || c === anim.step + 1) return { glow: "blue" };
            } else {
              if (c <= anim.step) return { glow: "blue" };
            }
            return { dim: true };
          }} />
        <ArrayGrid
          data={[result.map((v, i) => (i <= anim.step ? v : NaN))]}
          title={`np.${op}()`} accent="indigo" decimals={0}
          cellMeta={(_, c) => (c === anim.step ? { glow: "indigo" } : {})} />
      </div>

      {/* Line chart */}
      <div className="relative h-36 bg-surface-1 border border-edge rounded-xl p-4 overflow-hidden">
        {[0.25, 0.5, 0.75].map((p) => (
          <div key={p} className="absolute left-0 right-0 border-t border-edge/50"
            style={{ bottom: `${p * 100}%` }} />
        ))}

        <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${result.length * 2} 100`}
          preserveAspectRatio="none">
          <motion.path
            d={(() => {
              const pts = result.slice(0, anim.step + 1).map((v, i) => {
                const x = (i / (result.length - 1)) * (result.length * 2);
                const y = 100 - ((v - Math.min(...result)) / (maxResult - Math.min(...result) + 0.01)) * 80 - 10;
                return `${x},${y}`;
              });
              if (!pts.length) return "";
              const lastX = ((anim.step) / (result.length - 1)) * (result.length * 2);
              return `M${pts[0]} L${pts.join(" L")} L${lastX},100 L0,100 Z`;
            })()}
            fill="rgba(129, 140, 248, 0.1)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          <motion.polyline
            points={result.slice(0, anim.step + 1).map((v, i) => {
              const x = (i / (result.length - 1)) * (result.length * 2);
              const y = 100 - ((v - Math.min(...result)) / (maxResult - Math.min(...result) + 0.01)) * 80 - 10;
              return `${x},${y}`;
            }).join(" ")}
            fill="none" stroke="#818CF8" strokeWidth="1.5"
          />
        </svg>

        <div className="absolute inset-0 flex items-end px-4 pb-4">
          {result.slice(0, anim.step + 1).map((v, i) => {
            const left = (i / (result.length - 1)) * 100;
            const bottom = ((v - Math.min(...result)) / (maxResult - Math.min(...result) + 0.01)) * 80 + 10;
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-[var(--accent)]"
                style={{ left: `${left}%`, bottom: `${bottom}%`, marginLeft: -4, marginBottom: -4 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            );
          })}
        </div>
      </div>

      <FormulaBar accent="indigo">{formulaText}</FormulaBar>
      <CodePanel code={`np.${op}(arr)`} />
    </PageShell>
  );
}
