import React from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { Cpu, HardDrive, ArrowRight, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

export function LiveSwapAnimation() {
  const { swapAnimationState, systemState } = useSwapOS();
  const { isAnimating, stage, pid, progress } = swapAnimationState;

  const targetProc = pid ? systemState.processes.find(p => p.pid === pid || p.id === pid) : null;

  return (
    <div className="swapos-card p-6 relative overflow-hidden space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <RefreshCw className={`w-5 h-5 ${isAnimating ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">Live Swap Operation</h3>
            <p className="text-xs text-slate-400 font-mono">RAM &harr; Swap Subsystem Pipeline</p>
          </div>
        </div>

        <div className="text-xs font-mono px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-indigo-300">
          Algo: <span className="font-bold text-slate-100">{systemState.settings.swapAlgorithm}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-1">
        {/* Source RAM */}
        <div className={`p-4 rounded-xl border transition-all ${
          isAnimating && (stage === 'Releasing RAM' || stage === 'Restoring From Swap' || stage === 'Preparing Pages')
            ? 'bg-indigo-950/40 border-indigo-500/80 shadow-lg shadow-indigo-500/10'
            : 'bg-[#070B14] border-slate-800'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            <h4 className="font-bold text-slate-100 text-xs font-mono">Physical RAM</h4>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-100">
            {systemState.metrics.usedRamMb.toLocaleString()} MB
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1">
            {systemState.metrics.ramUtilization}% Utilized
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-sky-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${systemState.metrics.ramUtilization}%` }}
            />
          </div>
        </div>

        {/* Pipeline Transfer Center */}
        <div className="flex flex-col items-center justify-center p-3 text-center space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300">
            {stage || 'Idle'}
          </span>

          <div className="w-full flex items-center justify-center gap-3 my-1">
            {stage.includes('Restoring') || stage.includes('Swap In') ? (
              <ArrowLeft className={`w-8 h-8 text-sky-400 ${isAnimating ? 'animate-bounce' : ''}`} />
            ) : (
              <ArrowRight className={`w-8 h-8 text-pink-400 ${isAnimating ? 'animate-bounce' : ''}`} />
            )}
          </div>

          {targetProc ? (
            <div className="text-xs font-mono p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 w-full shadow-inner">
              <div className="font-bold text-indigo-300">{targetProc.name} (PID: {targetProc.pid})</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{targetProc.memoryRequired} MB | {targetProc.pageCount} Pages</div>
            </div>
          ) : (
            <div className="text-xs font-mono text-slate-500">Pipeline Ready</div>
          )}

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                stage === 'Idle' ? 'bg-slate-700' : 'bg-gradient-to-r from-indigo-500 to-pink-500 animate-pulse'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Destination Swap Space */}
        <div className={`p-4 rounded-xl border transition-all ${
          isAnimating && (stage === 'Writing To Swap' || stage === 'Swapping Out')
            ? 'bg-purple-950/40 border-purple-500/80 shadow-lg shadow-purple-500/10'
            : 'bg-[#070B14] border-slate-800'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-4 h-4 text-purple-400" />
            <h4 className="font-bold text-slate-100 text-xs font-mono">Swap Space Partition</h4>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-100">
            {systemState.metrics.usedSwapMb.toLocaleString()} MB
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1">
            {systemState.metrics.swapUtilization}% Occupied
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${systemState.metrics.swapUtilization}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
