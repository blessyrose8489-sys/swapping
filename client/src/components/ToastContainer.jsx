import React, { useState, useEffect } from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

export function ToastContainer() {
  const { activeAlerts } = useSwapOS();
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (activeAlerts.length > 0) {
      const latest = activeAlerts[0];
      if (!latest || !latest.id) return;

      setToasts(prev => {
        // Prevent duplicate toast if same id or same type+details is currently visible
        const exists = prev.some(t => t.id === latest.id || (t.type === latest.type && t.details === latest.details));
        if (exists) return prev;
        return [latest, ...prev].slice(0, 3);
      });

      // Auto dismiss toast after 4 seconds
      const timer = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== latest.id));
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [activeAlerts]);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2.5 max-w-sm w-full font-mono text-xs pointer-events-none">
      {toasts.map(toast => {
        const isCritical = toast.type?.includes('CRITICAL');
        const isWarning = toast.type?.includes('WARNING');

        return (
          <div 
            key={toast.id}
            className={`p-3.5 rounded-xl border shadow-2xl backdrop-blur-md flex items-start justify-between gap-3 pointer-events-auto transition-all transform ease-out duration-300 ${
              isCritical
                ? 'bg-rose-950/95 text-rose-200 border-rose-500/50 shadow-rose-950/50'
                : isWarning
                  ? 'bg-amber-950/95 text-amber-200 border-amber-500/50 shadow-amber-950/50'
                  : 'bg-slate-900/95 text-slate-200 border-slate-700 shadow-slate-950/50'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {isCritical || isWarning ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold block text-white text-xs tracking-wide">{toast.type}</span>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.details || 'System event notification'}</p>
              </div>
            </div>

            <button 
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

