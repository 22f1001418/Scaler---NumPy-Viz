import { motion } from "framer-motion";
import { useStore, NAV_ITEMS, CATEGORIES } from "../store/useStore";
import { Box, ArrowRight } from "lucide-react";
import NavIcon from "../components/NavIcon";

export default function Home() {
  const { setPage } = useStore();

  return (
    <div className="flex-1 overflow-y-auto mesh-bg">
      <div className="max-w-[1000px] mx-auto px-6 lg:px-8 py-10 relative z-10">

        {/* Compact Hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-3">
            <Box size={28} className="accent-blue" />
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
              <span className="text-grad-blue">NumPy</span>{" "}
              <span className="text-txt-primary">Visualizer</span>
            </h1>
          </div>
          <p className="text-txt-secondary text-sm lg:text-base max-w-md mx-auto leading-relaxed">
            Interactive, step-by-step visual explanations of NumPy operations.
            Pick a topic below to get started.
          </p>
          <p className="text-txt-muted text-[10px] font-mono mt-2 tracking-wide">by <b>Scaler</b></p>
        </motion.div>

        {/* Categorized cards */}
        {CATEGORIES.map((cat) => {
          const items = NAV_ITEMS.filter((n) => n.category === cat.key);
          return (
            <div key={cat.key} className="mb-7">
              <h2 className="text-[10px] uppercase tracking-[0.15em] text-txt-muted font-bold mb-3 px-1">
                {cat.label}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((item, idx) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.04, type: "spring", stiffness: 200 }}
                    whileHover={{ y: -2, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPage(item.id)}
                    className={`text-left glass-panel px-5 py-4 group hover:accent-border-${item.accent} border transition-all duration-200`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`shrink-0 mt-0.5 accent-${item.accent}`}>
                        <NavIcon iconKey={item.iconKey} size={18} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-sm mb-0.5 accent-${item.accent}`}>{item.label}</div>
                        <div className="text-[11px] text-txt-muted leading-relaxed">{item.desc}</div>
                      </div>
                      <ArrowRight size={14} className="text-txt-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
