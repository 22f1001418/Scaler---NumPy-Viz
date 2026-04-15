import { motion } from "framer-motion";
import { Play, Square } from "lucide-react";

interface Props {
  step: number; totalSteps: number; playing: boolean; progress: number;
  onToggle: () => void; onReset: () => void; label?: string;
}

export default function AnimControls({
  step, totalSteps, playing, progress, onToggle, onReset, label,
}: Props) {
  return (
    <div className="glass-panel px-4 py-3 flex flex-col gap-2">
      {/* Progress bar */}
      <div className="relative h-2 bg-surface-2 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: "linear-gradient(90deg, var(--accent), rgba(167,139,250,0.8))" }}
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between gap-2">
        {/* Play / Stop */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onToggle}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
              accent-bg-blue accent-blue border border-[var(--accent)]/30"
          >
            {playing
              ? <><Square size={14} fill="currentColor" /> Stop</>
              : <><Play size={14} fill="currentColor" /> Start</>
            }
          </motion.button>

          {playing && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReset}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-surface-2 text-txt-secondary hover:text-txt-primary border border-edge transition-colors"
            >
              Restart
            </motion.button>
          )}
        </div>

        {/* Step counter */}
        <div className="font-mono text-xs text-txt-secondary flex items-center gap-2">
          {label && <span className="text-txt-muted">{label}</span>}
          <span className="accent-blue font-bold">{step + 1}</span>
          <span className="text-txt-muted">/</span>
          <span className="text-txt-muted">{totalSteps}</span>
        </div>
      </div>
    </div>
  );
}
