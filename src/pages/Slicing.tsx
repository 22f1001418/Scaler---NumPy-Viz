import { useState, useMemo } from "react";
import { Scissors } from "lucide-react";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, FormulaBar, Slider, Select, ValueInput } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { randMatrix, slice2d, fmt, type Matrix } from "../lib/ndarray";

type Mode = "basic" | "boolean";

const DESCRIPTION = "Slicing extracts a sub-region from an array using start:end index ranges. Boolean masking scans every cell against a condition and collects those that pass. The animation walks through the array cell by cell: in basic mode it highlights which cells fall inside the slice window; in boolean mode it tests each cell against the threshold and builds the selected set.";

export default function Slicing() {
  const [mode, setMode] = useState<Mode>("basic");
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(6);
  const [rStart, setRStart] = useState(1);
  const [rEnd, setREnd] = useState(4);
  const [cStart, setCStart] = useState(1);
  const [cEnd, setCEnd] = useState(5);
  const [thresh, setThresh] = useState(25);
  const [customArr, setCustomArr] = useState<Matrix | null>(null);

  const arr = useMemo(() => customArr ?? randMatrix(rows, cols, 1, 50, 9), [rows, cols, customArr]);
  const aR = arr.length;
  const aC = arr[0]?.length ?? 0;

  // Basic slice
  const sliced = useMemo(() => slice2d(arr, rStart, rEnd, cStart, cEnd), [arr, rStart, rEnd, cStart, cEnd]);

  // Boolean mask
  const mask = useMemo(() => arr.map((row) => row.map((v) => v > thresh)), [arr, thresh]);
  const maskCells = useMemo(() => {
    const cells: [number, number][] = [];
    mask.forEach((row, i) => row.forEach((v, j) => { if (v) cells.push([i, j]); }));
    return cells;
  }, [mask]);

  const totalScan = aR * aC;
  const anim = useAnimation({ totalSteps: totalScan, baseMs: 400 });

  const modeOpts: { value: Mode; label: string }[] = [
    { value: "basic", label: "Basic Slice" },
    { value: "boolean", label: "Boolean Mask" },
  ];

  return (
    <PageShell title="Slicing & Indexing" icon={<Scissors size={22} />} accent="emerald" description={DESCRIPTION}>
      <div className="flex flex-wrap gap-4 items-end">
        <Select label="Mode" value={mode} onChange={setMode as any} options={modeOpts} />
        <Slider label="Rows" value={rows} min={3} max={8} onChange={(v) => { setRows(v); setCustomArr(null); }} />
        <Slider label="Cols" value={cols} min={3} max={8} onChange={(v) => { setCols(v); setCustomArr(null); }} />
      </div>

      <ValueInput label="array values" onParsed={setCustomArr} accent="blue" />

      {mode === "basic" && (
        <>
          <div className="flex flex-wrap gap-4 items-end">
            <Slider label="Row start" value={rStart} min={0} max={aR - 1} onChange={setRStart} />
            <Slider label="Row end" value={rEnd} min={rStart + 1} max={aR} onChange={setREnd} />
            <Slider label="Col start" value={cStart} min={0} max={aC - 1} onChange={setCStart} />
            <Slider label="Col end" value={cEnd} min={cStart + 1} max={aC} onChange={setCEnd} />
          </div>

          <AnimControls {...anim} onToggle={anim.toggle} onReset={anim.reset} label="cell scan" />

          {(() => {
            const scanR = Math.floor(anim.step / aC);
            const scanC = anim.step % aC;
            const inSlice = (r: number, c: number) => r >= rStart && r < rEnd && c >= cStart && c < cEnd;

            const partialSliced: Matrix = sliced.map((row) => row.map(() => NaN));
            for (let idx = 0; idx <= anim.step; idx++) {
              const r = Math.floor(idx / aC);
              const c = idx % aC;
              if (inSlice(r, c)) {
                partialSliced[r - rStart][c - cStart] = arr[r][c];
              }
            }

            return (
              <>
                <div className="flex gap-8 flex-wrap items-start">
                  <ArrayGrid data={arr} title="Scanning..." accent="blue" decimals={0}
                    cellMeta={(r, c) => {
                      const idx = r * aC + c;
                      if (idx === anim.step) return { glow: inSlice(r, c) ? "emerald" : "indigo" };
                      if (idx < anim.step && inSlice(r, c)) return { glow: "emerald" };
                      if (idx > anim.step) return { dim: true };
                      return {};
                    }} />
                  <ArrayGrid data={partialSliced} title={`Sliced (${rEnd - rStart}x${cEnd - cStart})`} accent="emerald" decimals={0} />
                </div>
                <FormulaBar accent="emerald">
                  [{scanR},{scanC}] = {fmt(arr[scanR]?.[scanC] ?? 0, 0)}{" "}
                  {inSlice(scanR, scanC)
                    ? <span className="accent-emerald font-bold"> inside slice</span>
                    : <span className="accent-indigo"> outside slice</span>}
                </FormulaBar>
              </>
            );
          })()}

          <CodePanel code={`arr[${rStart}:${rEnd}, ${cStart}:${cEnd}]`} />
        </>
      )}

      {mode === "boolean" && (
        <>
          <Slider label="Threshold (arr > X)" value={thresh} min={1} max={49} onChange={setThresh} />
          <AnimControls {...anim} onToggle={anim.toggle} onReset={anim.reset} label="cell scan" />
          {(() => {
            const scanR = Math.floor(anim.step / aC);
            const scanC = anim.step % aC;
            const matchesSoFar = maskCells.filter(
              ([r, c]) => r * aC + c <= anim.step
            );
            return (
              <>
                <div className="flex gap-8 flex-wrap items-start">
                  <ArrayGrid data={arr} title="Scanning..." accent="blue" decimals={0}
                    cellMeta={(r, c) => {
                      const idx = r * aC + c;
                      if (idx === anim.step) return { glow: mask[r][c] ? "emerald" : "indigo" };
                      if (idx < anim.step && mask[r][c]) return { glow: "emerald" };
                      if (idx > anim.step) return { dim: true };
                      return {};
                    }} />
                  <ArrayGrid
                    data={[matchesSoFar.map(([r, c]) => arr[r][c])].filter((r) => r.length > 0)}
                    title={`Selected (${matchesSoFar.length})`}
                    accent="emerald" decimals={0}
                    compact />
                </div>
                <FormulaBar accent="emerald">
                  [{scanR},{scanC}] = {fmt(arr[scanR]?.[scanC] ?? 0, 0)}{" "}
                  {mask[scanR]?.[scanC]
                    ? <span className="accent-emerald font-bold"> &gt; {thresh} — selected</span>
                    : <span className="accent-indigo"> &le; {thresh} — skipped</span>}
                </FormulaBar>
              </>
            );
          })()}
          <CodePanel code={`arr[arr > ${thresh}]`} />
        </>
      )}
    </PageShell>
  );
}
