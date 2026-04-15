import { useState, useMemo } from "react";
import { LayoutGrid } from "lucide-react";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, FormulaBar, Slider, Select } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { arange, reshape, transpose, flatten, randMatrix, fmt, type Matrix } from "../lib/ndarray";

const DESCRIPTION = "Reshape, transpose, and flatten change how array elements are arranged without altering the data itself. Reshape reorders a flat sequence into a new grid shape. Transpose swaps rows and columns. Flatten unrolls a 2-D array back into a single row. The animation tracks each element as it moves from source to destination position.";

export default function Reshape() {
  const [mode, setMode] = useState<"reshape" | "transpose" | "flatten">("reshape");
  const [total, setTotal] = useState(12);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);

  const divisors = useMemo(
    () => Array.from({ length: total }, (_, i) => i + 1).filter((d) => total % d === 0),
    [total]
  );
  const newRows = divisors.includes(rows) ? rows : divisors[0];
  const newCols = total / newRows;

  const flat = useMemo(() => arange(1, total + 1), [total]);
  const target = useMemo(() => reshape(flat, newRows, newCols), [flat, newRows, newCols]);

  const srcMat = useMemo(() => randMatrix(rows, cols, 1, 15, 7), [rows, cols]);
  const srcT = useMemo(() => transpose(srcMat), [srcMat]);

  const flatSrc = useMemo(() => reshape(arange(1, rows * cols + 1), rows, cols), [rows, cols]);
  const flatResult = useMemo(() => flatten(flatSrc), [flatSrc]);

  const stepCount =
    mode === "reshape" ? total :
    mode === "transpose" ? rows * cols :
    rows * cols;

  const anim = useAnimation({ totalSteps: stepCount, baseMs: 500 });

  const modeOpts = [
    { value: "reshape" as const, label: "Reshape" },
    { value: "transpose" as const, label: "Transpose" },
    { value: "flatten" as const, label: "Flatten" },
  ];

  return (
    <PageShell title="Reshape & Transpose" icon={<LayoutGrid size={22} />} accent="blue" description={DESCRIPTION}>
      <div className="flex flex-wrap gap-4 items-end">
        <Select label="Mode" value={mode} onChange={setMode as any} options={modeOpts} />
        {mode === "reshape" && (
          <>
            <Slider label="Total elements" value={total} min={4} max={24} onChange={setTotal} />
            <Select label="New rows" value={String(newRows)} onChange={(v) => setRows(Number(v))}
              options={divisors.map((d) => ({ value: String(d), label: `${d} -> (${d}x${total / d})` }))} />
          </>
        )}
        {mode === "transpose" && (
          <>
            <Slider label="Rows" value={rows} min={2} max={6} onChange={setRows} />
            <Slider label="Cols" value={cols} min={2} max={6} onChange={setCols} />
          </>
        )}
        {mode === "flatten" && (
          <>
            <Slider label="Rows" value={rows} min={2} max={6} onChange={setRows} />
            <Slider label="Cols" value={cols} min={2} max={6} onChange={setCols} />
          </>
        )}
      </div>

      <AnimControls {...anim} onToggle={anim.toggle} onReset={anim.reset} label="element" />

      {/* Reshape */}
      {mode === "reshape" && (() => {
        const tr = Math.floor(anim.step / newCols);
        const tc = anim.step % newCols;
        const partial: Matrix = target.map((row) => row.map(() => NaN));
        for (let i = 0; i <= anim.step; i++) {
          const r = Math.floor(i / newCols);
          const c = i % newCols;
          partial[r][c] = target[r][c];
        }
        return (
          <>
            <div className="flex gap-8 flex-wrap items-start">
              <ArrayGrid data={[flat]} title="1-D (source)" accent="blue" decimals={0}
                cellMeta={(_, c) => (c === anim.step ? { glow: "blue" } : c < anim.step ? { computed: true } : { dim: true })} />
              <ArrayGrid data={partial} title={`Reshaped (${newRows}x${newCols})`} accent="amber" decimals={0}
                cellMeta={(r, c) => (r === tr && c === tc ? { glow: "amber" } : {})} />
            </div>
            <FormulaBar accent="blue">
              flat[<span className="accent-blue">{anim.step}</span>] = {fmt(flat[anim.step], 0)}
              {" -> "} reshaped[<span className="accent-amber">{tr}</span>,<span className="accent-amber">{tc}</span>]
            </FormulaBar>
            <CodePanel code={`arr = np.arange(1, ${total + 1})\nreshaped = arr.reshape(${newRows}, ${newCols})`} />
          </>
        );
      })()}

      {/* Transpose */}
      {mode === "transpose" && (() => {
        const r = Math.floor(anim.step / cols);
        const c = anim.step % cols;
        return (
          <>
            <div className="flex gap-8 flex-wrap items-start">
              <ArrayGrid data={srcMat} title="Original" accent="blue" decimals={0}
                cellMeta={(ri, ci) => (ri === r && ci === c ? { glow: "blue" } : { dim: true })} />
              <ArrayGrid data={srcT} title="Transposed (.T)" accent="pink" decimals={0}
                cellMeta={(ri, ci) => (ri === c && ci === r ? { glow: "pink" } : { dim: true })} />
            </div>
            <FormulaBar accent="pink">
              arr[{r},{c}] = <span className="accent-blue">{fmt(srcMat[r]?.[c] ?? 0, 0)}</span>
              {" -> "} arr.T[{c},{r}]
            </FormulaBar>
            <CodePanel code="transposed = arr.T  # np.transpose(arr)" />
          </>
        );
      })()}

      {/* Flatten */}
      {mode === "flatten" && (() => {
        const fr = Math.floor(anim.step / cols);
        const fc = anim.step % cols;
        return (
          <>
            <div className="flex gap-8 flex-wrap items-start">
              <ArrayGrid data={flatSrc} title={`2-D (${rows}x${cols})`} accent="blue" decimals={0}
                cellMeta={(r, c) => (r === fr && c === fc ? { glow: "blue" } : {})} />
              <ArrayGrid
                data={[flatResult.map((v, i) => (i <= anim.step ? v : NaN))]}
                title="Flattened" accent="amber" decimals={0}
                cellMeta={(_, c) => (c === anim.step ? { glow: "amber" } : {})} />
            </div>
            <FormulaBar accent="amber">
              arr[{fr},{fc}] = {fmt(flatSrc[fr]?.[fc] ?? 0, 0)} &rarr; flat[{anim.step}]
            </FormulaBar>
            <CodePanel code="flat = arr.flatten()  # C-order (row-major)" />
          </>
        );
      })()}
    </PageShell>
  );
}
