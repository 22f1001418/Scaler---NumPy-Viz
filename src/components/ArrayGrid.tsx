import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useMemo } from "react";
import { type Matrix, fmt, heatLevel } from "../lib/ndarray";
import type { Accent } from "../store/useStore";

interface CellMeta {
  glow?: Accent;   // animated glow border
  dim?: boolean;
  computed?: boolean;
}

interface Props {
  data: Matrix;
  title?: string;
  accent?: Accent;
  cellMeta?: (row: number, col: number) => CellMeta;
  onCellEdit?: (row: number, col: number, value: number) => void;
  decimals?: number;
  compact?: boolean;
  label?: string;
  showIndices?: boolean;
  heatmap?: boolean; // enable value-dependent background
}

export default function ArrayGrid({
  data, title, accent = "blue", cellMeta, onCellEdit,
  decimals = 1, compact = false, label, showIndices = true, heatmap = true,
}: Props) {
  const rows = data.length;
  const cols = data[0]?.length ?? 0;
  const cellSz = compact ? "min-w-[40px] h-[36px] text-[11px]" : "min-w-[54px] h-[46px] text-sm";

  const [editCell, setEditCell] = useState<[number, number] | null>(null);
  const [editVal, setEditVal] = useState("");
  const [hoverCell, setHoverCell] = useState<[number, number] | null>(null);

  // Compute min/max for heatmap
  const { vmin, vmax } = useMemo(() => {
    const vals = data.flat().filter((v) => !isNaN(v) && isFinite(v));
    return { vmin: Math.min(...vals, 0), vmax: Math.max(...vals, 1) };
  }, [data]);

  const startEdit = useCallback((r: number, c: number) => {
    if (!onCellEdit) return;
    setEditCell([r, c]); setEditVal(fmt(data[r][c], decimals));
  }, [onCellEdit, data, decimals]);

  const commitEdit = useCallback(() => {
    if (!editCell || !onCellEdit) return;
    const n = parseFloat(editVal);
    if (!isNaN(n)) onCellEdit(editCell[0], editCell[1], n);
    setEditCell(null);
  }, [editCell, editVal, onCellEdit]);

  return (
    <div className="flex flex-col gap-2">
      {/* Header row */}
      {(title || label) && (
        <div className="flex items-center gap-2">
          {title && <span className={`font-mono text-xs font-bold tracking-wider uppercase accent-${accent}`}>{title}</span>}
          {label && <span className="font-mono text-[10px] text-txt-muted bg-surface-2 px-2 py-0.5 rounded-md border border-edge">{label}</span>}
        </div>
      )}

      <div className="glass-panel p-3 relative">
        {/* Column indices */}
        {showIndices && cols > 0 && (
          <div className="flex ml-8 mb-1 gap-[3px]">
            {Array.from({ length: cols }, (_, j) => (
              <div key={j} className={`${compact ? "min-w-[40px]" : "min-w-[54px]"} text-center font-mono text-[9px] text-txt-muted`}>{j}</div>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="flex flex-col gap-[3px]">
          <AnimatePresence mode="popLayout">
            {data.map((row, i) => (
              <motion.div
                key={`r${i}`} className="flex items-center gap-[3px]"
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ delay: i * 0.025, type: "spring", stiffness: 400, damping: 30 }}
              >
                {showIndices && <div className="w-7 text-right font-mono text-[9px] text-txt-muted pr-1 shrink-0">{i}</div>}

                {row.map((val, j) => {
                  const meta = cellMeta?.(i, j) ?? {};
                  const isEditing = editCell?.[0] === i && editCell?.[1] === j;
                  const isHover = hoverCell?.[0] === i && hoverCell?.[1] === j;
                  const isNan = Number.isNaN(val);
                  const hl = heatmap && !isNan && !meta.glow ? heatLevel(val, vmin, vmax) : 0;
                  const heatClass = heatmap && !meta.glow ? `cell-heat-${accent}-${hl}` : "";
                  const glowClass = meta.glow ? `cell-glow-${meta.glow}` : "";

                  return (
                    <motion.div
                      key={`c${i}-${j}`} layout
                      className={`
                        ${cellSz} flex items-center justify-center
                        rounded-lg border-[1.5px] font-mono font-medium select-none
                        transition-all duration-200
                        ${meta.dim ? "opacity-20" : ""}
                        ${glowClass}
                        ${heatClass}
                        ${!glowClass && !heatClass ? "bg-[var(--cell-base)]" : ""}
                        ${!glowClass ? "border-[var(--cell-border)]" : ""}
                        ${onCellEdit ? "cursor-text" : "cursor-default"}
                        ${isHover && !isEditing ? "ring-1 ring-[var(--accent)]/30 z-10" : ""}
                        ${isNan ? "bg-surface-2 text-txt-muted italic border-edge" : ""}
                      `}
                      onDoubleClick={() => startEdit(i, j)}
                      onMouseEnter={() => setHoverCell([i, j])}
                      onMouseLeave={() => setHoverCell(null)}
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: meta.dim ? 0.2 : 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 28, delay: (i * cols + j) * 0.008 }}
                    >
                      {isEditing ? (
                        <input
                          className="w-full h-full bg-transparent text-center outline-none font-mono accent-blue text-sm"
                          value={editVal} onChange={(e) => setEditVal(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditCell(null); }}
                          autoFocus
                        />
                      ) : (
                        <AnimatePresence mode="popLayout">
                          <motion.span
                            key={val}
                            initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 6, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className={meta.glow ? `accent-${meta.glow} font-bold` : ""}
                          >
                            {isNan ? "—" : fmt(val, decimals)}
                          </motion.span>
                        </AnimatePresence>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Hover tooltip */}
        {hoverCell && !editCell && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-surface-3 text-txt-primary font-mono text-[10px] px-2 py-0.5 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-20 border border-edge">
            [{hoverCell[0]}, {hoverCell[1]}] = {fmt(data[hoverCell[0]]?.[hoverCell[1]] ?? NaN, decimals)}
          </div>
        )}
      </div>
    </div>
  );
}