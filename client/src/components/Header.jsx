import React from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { Cpu, HardDrive, RefreshCw, Play, Pause, Square, AlertTriangle, ShieldCheck, Menu, Bell, Wifi, WifiOff } from 'lucide-react';

export function Header({ pageTitle = "Dashboard", toggleMobileSidebar }) {
  const { 
    socketConnected, 
    systemState, 
    workloadStatus, 
    controlWorkload, 
    resetMemory,
    activeAlerts 
  } = useSwapOS();

  const ramUtil = systemState.metrics.ramUtilization;
  const isWarning = ramUtil >= systemState.settings.warningThreshold;
  const isCritical = ramUtil >= systemState.settings.criticalThreshold;

  return (
    <header className="h-[72px] bg-[#0A0F1C] border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60"
          aria-label="Toggle Sidebar Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">{pageTitle}</h1>
          <p className="text-xs text-slate-400 font-medium hidden sm:block">SwapOS Operating System Resource Subsystem</p>
        </div>
      </div>

      {/* Center: System Status Indicator */}
      <div className="hidden md:flex items-center gap-3 font-mono text-xs">
        <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 font-medium ${
          isCritical 
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse' 
            : isWarning 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        }`}>
          {isCritical || isWarning ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          <span>RAM Pressure: {ramUtil}%</span>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-purple-400" />
          <span>Swap: {systemState.metrics.swapUtilization}%</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Workload Quick Controls */}
        <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          {!workloadStatus.isRunning ? (
            <button
              onClick={() => controlWorkload('start')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              title="Start Synthetic Workload Generator"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span className="hidden sm:inline">Start Workload</span>
            </button>
          ) : (
            <>
              {workloadStatus.isPaused ? (
                <button
                  onClick={() => controlWorkload('resume')}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1"
                  title="Resume Generator"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                </button>
              ) : (
                <button
                  onClick={() => controlWorkload('pause')}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1"
                  title="Pause Generator"
                >
                  <Pause className="w-3.5 h-3.5 fill-white" />
                </button>
              )}
              <button
                onClick={() => controlWorkload('stop')}
                className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1"
                title="Stop Generator"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
              </button>
            </>
          )}

          <button
            onClick={resetMemory}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Reset Memory Engine"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* WebSocket Connection Status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
          socketConnected 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        }`}>
          {socketConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{socketConnected ? 'Connected' : 'Reconnecting'}</span>
        </div>
      </div>
    </header>
  );
}
