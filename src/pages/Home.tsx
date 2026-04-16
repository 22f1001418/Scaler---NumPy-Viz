import { motion } from "framer-motion";
import { Box, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 h-full w-full overflow-y-auto mesh-bg">
      <div className="min-h-full flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl text-center"
        >
          <div className="inline-flex items-center gap-3 mb-5">
            <Box size={36} className="accent-blue" />
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
              <span className="text-grad-blue">NumPy</span>{" "}
              <span className="text-txt-primary">Visualizer</span>
            </h1>
          </div>

          <p className="text-txt-secondary text-base lg:text-lg leading-relaxed">
            Interactive, step-by-step visual explanations of NumPy operations —
            crafted to accompany the Data Analysis &amp; Visualization module.
          </p>

          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-edge">
            <Sparkles size={14} className="accent-amber" />
            <span className="text-[12px] text-txt-secondary">
              Open the link shared with your cohort to start a lecture
            </span>
          </div>

          <p className="text-txt-muted text-[11px] font-mono mt-10 tracking-wide">
            by <b>Scaler</b>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
