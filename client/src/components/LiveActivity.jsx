import React from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { ScrollText, Cpu, HardDrive, AlertTriangle, Layers, Activity } from 'lucide-react';

export function LiveActivity({ limit = 10 }) {
  const { systemState } = useSwapOS();
  const events = (systemState.recentEvents || []).slice(0, limit);

  const getEventIcon = (type) => {
    if (type.includes('PROCESS')) return <Layers className="w-4 h-4 text-sky-400" />;
    if (type.includes('SWAP') || type.includes('PAGE')) return <HardDrive className="w-4 h-4 text-purple-400" />;
    if (type.includes('MEMORY') || type.includes('CRITICAL')) return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    return <Activity className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="swapos-card p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ScrollText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">Live System Activity</h3>
            <p className="text-xs text-slate-400 font-mono">Real-time WebSocket event timeline stream</p>
          </div>
        </div>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {events.length === 0 ? (
          <div className="text-xs font-mono text-slate-500 py-4">Waiting for system events...</div>
        ) : (
          events.map((evt) => (
            <div key={evt.id} className="relative flex items-start justify-between gap-4 font-mono text-xs group">
              {/* Timeline Dot */}
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#0D1320] border border-slate-700 flex items-center justify-center">
                {getEventIcon(evt.type)}
              </div>

              <div className="flex-1 bg-[#070B14] p-3 rounded-xl border border-slate-800/80 group-hover:border-indigo-500/30 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      evt.type.includes('CRITICAL') ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                      evt.type.includes('SWAP') ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' :
                      evt.type.includes('WARNING') ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                      'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    }`}>
                      {evt.type}
                    </span>
                    {evt.processId && (
                      <span className="text-indigo-400 font-bold text-[11px]">{evt.processId}</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-300 mt-1.5 text-xs">{evt.details}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
