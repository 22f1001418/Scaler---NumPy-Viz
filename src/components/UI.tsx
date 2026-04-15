import { motion } from "framer-motion";
import { type ReactNode, useState, useCallback } from "react";
import { Terminal, AlertCircle, ArrowRight, Info, PencilLine } from "lucide-react";
import { parseMatrix, type Matrix } from "../lib/ndarray";

/* === Page Shell ==================================================== */
export function PageShell({ title, icon, accent = "blue", description, children }: {
  title: string; icon: ReactNode; accent?: string; description?: string; children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-5 p-6 lg:p-8 max-w-[1400px] mx-auto w-full relative z-10"
    >
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className={`accent-${accent}`}>{icon}</span>
          <h1 className={`text-xl lg:text-2xl font-bold accent-${accent}`}>{title}</h1>
        </div>
        {description && (
          <div className="flex items-start gap-2.5 glass-panel px-4 py-3 border-l-[3px] accent-border-blue">
            <Info size={14} className="text-txt-muted shrink-0 mt-0.5" />
            <p className="text-sm text-txt-secondary leading-relaxed">{description}</p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </motion.div>
  );
}

/* === Section Panel ================================================== */
export function Panel({ title, children, accent }: { title?: string; children: ReactNode; accent?: string }) {
  return (
    <div className="glass-panel p-4 lg:p-5 flex flex-col gap-3">
      {title && <h3 className={`text-xs font-bold uppercase tracking-[0.12em] ${accent ? `accent-${accent}` : "text-txt-muted"}`}>{title}</h3>}
      {children}
    </div>
  );
}

/* === Formula Bar ==================================================== */
export function FormulaBar({ children, accent = "blue" }: { children: ReactNode; accent?: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
      className={`glass-panel font-mono text-sm text-center px-5 py-3 accent-border-${accent} border`}>
      {children}
    </motion.div>
  );
}

/* === Step Explainer ================================================= */
export function StepExplainer({ text, accent = "blue" }: { text: string; accent?: string }) {
  return (
    <div className={`flex items-start gap-2.5 glass-panel px-4 py-3 accent-border-${accent} border-l-[3px]`}>
      <ArrowRight size={14} className={`accent-${accent} shrink-0 mt-0.5`} />
      <p className="text-sm text-txt-secondary leading-relaxed">{text}</p>
    </div>
  );
}

/* === Shape Badge ==================================================== */
export function ShapeBadge({ shape, accent = "blue" }: { shape: number[]; accent?: string }) {
  return (
    <span className={`inline-flex items-center font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-surface-2 border border-edge accent-${accent}`}>
      ({shape.join(" x ")})
    </span>
  );
}

/* === Op Symbol ====================================================== */
export function OpSymbol({ symbol, accent = "blue" }: { symbol: string; accent?: string }) {
  return <div className={`flex items-center justify-center text-2xl font-bold font-mono accent-${accent}`}>{symbol}</div>;
}

/* === Big Result ===================================================== */
export function BigResult({ value, label, accent = "amber" }: { value: string; label: string; accent?: string }) {
  return (
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className={`glass-panel flex flex-col items-center gap-1 px-8 py-5 accent-border-${accent} border`}>
      <span className="text-[9px] uppercase tracking-[0.2em] text-txt-muted font-mono">{label}</span>
      <span className={`text-3xl font-bold font-mono accent-${accent}`}>{value}</span>
    </motion.div>
  );
}

/* === Slider ========================================================= */
export function Slider({ label, value, min, max, onChange, step = 1 }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void; step?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5 min-w-[120px]">
      <div className="flex justify-between items-baseline">
        <span className="text-[11px] text-txt-secondary font-medium">{label}</span>
        <span className="font-mono text-[11px] accent-blue font-bold">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-surface-3 rounded-full appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                   [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:shadow-lg
                   [&::-webkit-slider-thumb]:shadow-[var(--glow)]
                   [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white/20" />
    </label>
  );
}

/* === Select ========================================================= */
export function Select<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 min-w-[140px]">
      <span className="text-[11px] text-txt-secondary font-medium">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}
        className="bg-surface-2 border border-edge rounded-lg px-3 py-2 font-mono text-sm text-txt-primary outline-none focus:border-[var(--accent)]/50 transition-colors cursor-pointer">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

/* === Divider ======================================================== */
export function Divider() { return <div className="h-px bg-edge" />; }

/* === Controls Row =================================================== */
export function ControlsRow({ children }: { children: ReactNode }) {
  return (
    <Panel title="Controls">
      <div className="flex flex-wrap gap-4 items-end">{children}</div>
    </Panel>
  );
}

/* === Value Input — learners can type their own array values ========= */
export function ValueInput({ label, onParsed, onValidate, accent = "blue" }: {
  label: string;
  onParsed: (m: Matrix) => void;
  onValidate?: (m: Matrix) => { ok: true } | { ok: false; error: string };
  accent?: string;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleApply = useCallback(() => {
    const result = parseMatrix(text);
    if (result.ok) {
      // Run custom validation if provided
      if (onValidate) {
        const validationResult = onValidate(result.data);
        if (!validationResult.ok) {
          setError(validationResult.error);
          return;
        }
      }
      onParsed(result.data);
      setError(null);
      setOpen(false);
      setText("");
    } else {
      setError(result.error);
    }
  }, [text, onParsed, onValidate]);

  return (
    <div className="flex flex-col gap-2">
      <button onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 text-[11px] font-medium accent-${accent} hover:underline underline-offset-2`}>
        <PencilLine size={12} /> {open ? "Close" : `Enter custom ${label}`}
      </button>

      {open && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
          className="glass-panel p-3 flex flex-col gap-2 overflow-hidden">
          <textarea
            value={text} onChange={(e) => { setText(e.target.value); setError(null); }}
            placeholder={"Enter values, e.g.:\n1, 2, 3\n4, 5, 6"}
            className="bg-surface-2 border border-edge rounded-lg px-3 py-2 font-mono text-xs text-txt-primary resize-y min-h-[60px] outline-none focus:border-[var(--accent)]/50 placeholder:text-txt-muted/40"
            rows={3}
          />
          <div className="flex items-center gap-2">
            <button onClick={handleApply}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold accent-bg-${accent} accent-${accent} border accent-border-${accent} hover:brightness-110 transition-all`}>
              Apply
            </button>
            {error && (
              <div className="flex items-center gap-1.5 text-xs accent-indigo">
                <AlertCircle size={12} /> {error}
              </div>
            )}
          </div>
          <div className="text-[9px] text-txt-muted">
            Rows on separate lines. Values separated by commas or spaces.
          </div>
        </motion.div>
      )}
    </div>
  );
}
