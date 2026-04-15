import { motion } from "framer-motion";
import { Sun, Moon, PanelLeftClose, PanelLeft, Box } from "lucide-react";
import { useStore, NAV_ITEMS, CATEGORIES } from "../store/useStore";
import NavIcon from "./NavIcon";

export default function Sidebar() {
  const { page, setPage, theme, toggleTheme, sidebarOpen, toggleSidebar } = useStore();

  return (
    <>
      {/* Collapsed: floating open button */}
      {!sidebarOpen && (
        <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-lg bg-surface-1 border border-edge text-txt-secondary hover:text-txt-primary transition-colors">
          <PanelLeft size={16} />
        </motion.button>
      )}

      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 270 : 0, opacity: sidebarOpen ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="shrink-0 h-full border-r border-edge flex flex-col overflow-hidden"
        style={{ background: "var(--s1)" }}
      >
        <div className="min-w-[270px] flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-5 pb-3">
            <button className="flex items-center gap-2.5" onClick={() => setPage("home")}>
              <Box size={20} className="accent-blue" />
              <div>
                <div className="font-bold text-sm text-grad-blue leading-tight">NumPy Visualizer</div>
                <div className="text-[9px] text-txt-muted font-mono mt-0.5">by <b>Scaler</b></div>
              </div>
            </button>
            <div className="flex items-center gap-0.5">
              <IconBtn onClick={toggleTheme} tip={theme === "dark" ? "Light mode" : "Dark mode"}>
                {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              </IconBtn>
              <IconBtn onClick={toggleSidebar} tip="Collapse"><PanelLeftClose size={14} /></IconBtn>
            </div>
          </div>

          <div className="h-px bg-edge mx-4" />

          {/* Categorized nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-3">
            {CATEGORIES.map((cat) => {
              const items = NAV_ITEMS.filter((n) => n.category === cat.key);
              return (
                <div key={cat.key} className="mb-3">
                  <div className="text-[9px] uppercase tracking-[0.15em] text-txt-muted font-bold px-2 mb-1.5">
                    {cat.label}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {items.map((item) => {
                      const active = page === item.id;
                      return (
                        <motion.button
                          key={item.id}
                          whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setPage(item.id)}
                          className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all duration-150
                            ${active
                              ? `accent-bg-${item.accent} border border-transparent`
                              : "border border-transparent hover:bg-surface-2"
                            }
                          `}
                        >
                          <span className={`shrink-0 ${active ? `accent-${item.accent}` : "text-txt-muted"}`}>
                            <NavIcon iconKey={item.iconKey} size={16} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className={`text-[13px] font-semibold truncate ${active ? `accent-${item.accent}` : "text-txt-secondary"}`}>
                              {item.label}
                            </div>
                            <div className="text-[10px] text-txt-muted truncate leading-tight mt-0.5">
                              {item.desc}
                            </div>
                          </div>
                          {active && (
                            <motion.div
                              layoutId="nav-dot"
                              className={`w-1.5 h-1.5 rounded-full shrink-0 accent-${item.accent}`}
                              style={{ backgroundColor: "currentColor" }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </motion.aside>
    </>
  );
}

function IconBtn({ children, onClick, tip }: { children: React.ReactNode; onClick: () => void; tip: string }) {
  return (
    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
      onClick={onClick} title={tip}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-txt-muted hover:text-txt-primary hover:bg-surface-2 transition-colors">
      {children}
    </motion.button>
  );
}
