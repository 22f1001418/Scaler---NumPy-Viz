import { useState, useRef, useCallback, useEffect } from "react";

interface AnimOpts {
  totalSteps: number;
  baseMs?: number; // interval in ms between steps
}

export function useAnimation({ totalSteps, baseMs = 800 }: AnimOpts) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    setPlaying(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const toggle = useCallback(() => setPlaying((p) => !p), []);
  const reset = useCallback(() => { stop(); setStep(0); }, [stop]);

  // Auto-advance
  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStep((s) => { if (s >= totalSteps - 1) { setPlaying(false); return s; } return s + 1; });
      }, baseMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current); timerRef.current = null;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, baseMs, totalSteps]);

  // Reset on totalSteps change
  useEffect(() => { setStep(0); stop(); }, [totalSteps, stop]);

  return {
    step, playing, progress: totalSteps > 0 ? (step + 1) / totalSteps : 0,
    totalSteps, toggle, reset, setStep,
  };
}
