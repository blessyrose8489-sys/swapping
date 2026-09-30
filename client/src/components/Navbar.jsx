import React from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { Cpu, HardDrive, RefreshCw, Play, Pause, Square, AlertTriangle, ShieldCheck } from 'lucide-react';

export function Navbar({ toggleMobileSidebar }) {
  const { 
    socketConnected, 
    systemState, 
    workloadStatus, 
    controlWorkload, 
    resetMemory 
  } = useSwapOS();

  const ramUtil = systemState.metrics.ramUtilization;
  const isWarning = ramUtil >= systemState.settings.warningThreshold;
  const isCritical = ramUtil >= systemState.settings.criticalThreshold;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          aria-label="Toggle Navigation Menu"
        >
          <Cpu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">SwapOS</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">v1.0 Real-Time</span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Memory & Swapping Subsystem Laboratory</p>
          </div>
        </div>
      </div>

      {/* Middle Status Indicator */}
      <div className="hidden md:flex items-center gap-4 text-xs font-mono">
        <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
          isCritical 
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse' 
            : isWarning 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        }`}>
          {isCritical || isWarning ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          <span>RAM Pressure: {ramUtil}%</span>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-indigo-400" />
          <span>Swap: {systemState.metrics.swapUtilization}%</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
          {!workloadStatus.isRunning ? (
            <button
              onClick={() => controlWorkload('start')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
              title="Start Synthetic Workload Generator"
            >
              <Play className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Start Workload</span>
            </button>
          ) : (
            <>
              {workloadStatus.isPaused ? (
                <button
                  onClick={() => controlWorkload('resume')}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1 transition-all"
                  title="Resume Workload Generator"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => controlWorkload('pause')}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium flex items-center gap-1 transition-all"
                  title="Pause Workload Generator"
                >
                  <Pause className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => controlWorkload('stop')}
                className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1 transition-all"
                title="Stop Workload Generator"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <button
            onClick={() => resetMemory()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all"
            title="Reset Memory Engine State"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Live Socket Connection Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-medium text-slate-300">
          <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
          <span className="hidden sm:inline">{socketConnected ? 'Live Socket' : 'Disconnected'}</span>
        </div>
      </div>
    </header>
  );
}
