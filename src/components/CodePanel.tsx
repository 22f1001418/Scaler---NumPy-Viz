import { Highlight, themes } from "prism-react-renderer";
import { useStore } from "../store/useStore";
import { Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";

export default function CodePanel({ code, language = "python" }: { code: string; language?: string }) {
  const { theme } = useStore();
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code); setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [code]);

  return (
    <div className="relative group glass-panel overflow-hidden">
      {/* Top accent line */}
      <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg, var(--accent), transparent)" }} />
      <Highlight
        theme={theme === "dark" ? themes.nightOwl : themes.nightOwlLight}
        code={code.trim()} language={language as any}
      >
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre className="font-mono text-[12.5px] leading-relaxed px-4 py-3 overflow-x-auto"
            style={{ ...style, background: "transparent", margin: 0 }}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                <span className="inline-block w-5 text-right mr-3 text-txt-muted/30 select-none text-[10px]">{i + 1}</span>
                {line.map((token, j) => <span key={j} {...getTokenProps({ token })} />)}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
      <button onClick={handleCopy}
        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-md bg-surface-2/80 text-txt-muted hover:text-txt-primary opacity-0 group-hover:opacity-100 transition-all">
        {copied ? <Check size={12} className="accent-emerald" /> : <Copy size={12} />}
      </button>
    </div>
  );
}
