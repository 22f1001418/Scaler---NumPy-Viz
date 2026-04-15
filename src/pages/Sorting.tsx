import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown } from "lucide-react";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, FormulaBar, Slider, Select } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { randVector, sort, argsort, fmt } from "../lib/ndarray";

type Op = "sort" | "argsort" | "unique";

const DESCRIPTION = "Sorting rearranges elements in ascending order. argsort returns the indices that would sort the array \u2014 useful for reordering related data. unique extracts distinct values and their counts. The animation reveals each position of the sorted output one at a time, showing where each value came from in the original array.";

export default function Sorting() {
  const [op, setOp] = useState<Op>("sort");
  const [n, setN] = useState(10);

  const arr = useMemo(() => randVector(n, 1, 50, 21), [n]);
  const sorted = useMemo(() => sort(arr), [arr]);
  const indices = useMemo(() => argsort(arr), [arr]);
  const maxVal = Math.max(...arr, 1);

  const uniqMap = useMemo(() => {
    const u = [...new Set(arr)].sort((a, b) => a - b);
    const counts = u.map((v) => arr.filter((x) => x === v).length);
    return { values: u, counts };
  }, [arr]);

  const anim = useAnimation({ totalSteps: op === "unique" ? uniqMap.values.length : n, baseMs: 600 });

  return (
    <PageShell title="Sorting" icon={<ArrowUpDown size={22} />} accent="amber" description={DESCRIPTION}>
      <div className="flex flex-wrap gap-4 items-end">
        <Select label="Operation" value={op} onChange={setOp as any}
          options={[{ value: "sort", label: "sort" }, { value: "argsort", label: "argsort" },
                    { value: "unique", label: "unique" }]} />
        <Slider label="Elements" value={n} min={5} max={16} onChange={setN} />
      </div>

      <AnimControls {...anim} onToggle={anim.toggle} onReset={anim.reset} label="element" />

      {op === "sort" && (
        <>
          {/* Bar chart */}
          <div className="flex items-end gap-[3px] h-40 px-1">
            {arr.map((v, i) => {
              const h = (v / maxVal) * 100;
              const sortedV = sorted[i];
              const sH = (sortedV / maxVal) * 100;
              const active = i <= anim.step;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative" style={{ height: "100%" }}>
                    <div className="absolute bottom-0 w-full rounded-t bg-surface-2 transition-all"
                      style={{ height: `${h}%` }} />
                    <motion.div
                      className={`absolute bottom-0 w-full rounded-t ${active ? "bg-[var(--accent)]" : "bg-transparent"}`}
                      initial={{ height: 0 }}
                      animate={{ height: active ? `${sH}%` : 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-txt-muted">{i}</span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-8 flex-wrap items-start">
            <ArrayGrid data={[arr]} title="Original" accent="blue" decimals={0} />
            <ArrayGrid
              data={[sorted.map((v, i) => (i <= anim.step ? v : NaN))]}
              title="Sorted" accent="amber" decimals={0}
              cellMeta={(_, c) => (c === anim.step ? { glow: "amber" } : {})} />
          </div>
          <CodePanel code="np.sort(arr)" />
        </>
      )}

      {op === "argsort" && (
        <>
          <div className="flex gap-6 flex-wrap items-start">
            <ArrayGrid data={[arr]} title="Original" accent="blue" decimals={0}
              cellMeta={(_, c) => (c === indices[anim.step] ? { glow: "blue" } : { dim: true })} />
            <ArrayGrid
              data={[indices.map((v, i) => (i <= anim.step ? v : NaN))]}
              title="argsort indices" accent="pink" decimals={0}
              cellMeta={(_, c) => (c === anim.step ? { glow: "pink" } : {})} />
            <ArrayGrid
              data={[indices.map((idx, i) => (i <= anim.step ? arr[idx] : NaN))]}
              title="arr[argsort]" accent="amber" decimals={0}
              cellMeta={(_, c) => (c === anim.step ? { glow: "amber" } : {})} />
          </div>
          <FormulaBar accent="pink">
            Position {anim.step}: index = <span className="accent-pink">{indices[anim.step]}</span>
            {" -> "} value = <span className="accent-amber font-bold">{fmt(arr[indices[anim.step]], 0)}</span>
          </FormulaBar>
          <CodePanel code={`indices = np.argsort(arr)\nsorted = arr[indices]`} />
        </>
      )}

      {op === "unique" && (
        <>
          <div className="flex gap-8 flex-wrap items-start">
            <ArrayGrid data={[arr]} title={`Original (${n})`} accent="blue" decimals={0} />
            <ArrayGrid
              data={[uniqMap.values.map((v, i) => (i <= anim.step ? v : NaN))]}
              title={`Unique (${uniqMap.values.length})`} accent="amber" decimals={0}
              cellMeta={(_, c) => (c === anim.step ? { glow: "amber" } : {})} />
          </div>
          {/* Counts bars */}
          <div className="flex items-end gap-[3px] h-24 px-1">
            {uniqMap.values.map((v, i) => {
              const maxC = Math.max(...uniqMap.counts, 1);
              const h = (uniqMap.counts[i] / maxC) * 100;
              const active = i <= anim.step;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    className="w-full rounded-t"
                    animate={{ height: active ? `${h}%` : 0, backgroundColor: active ? "var(--accent)" : "var(--s2)" }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  />
                  <span className="text-[9px] font-mono text-txt-muted">{fmt(v, 0)}</span>
                </div>
              );
            })}
          </div>
          <CodePanel code="unique, counts = np.unique(arr, return_counts=True)" />
        </>
      )}
    </PageShell>
  );
}
