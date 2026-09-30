import React from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { Sliders, Zap, ArrowDownToLine, ArrowUpFromLine, Pause, Play, RefreshCw } from 'lucide-react';

export function SwapControlPanel() {
  const { systemState, updateSettings, forceSwapOut, forceSwapIn, resetMemory } = useSwapOS();
  const { settings } = systemState;

  const handleToggleAutoSwap = () => {
    updateSettings({ autoSwappingEnabled: !settings.autoSwappingEnabled });
  };

  const handleSwapAlgoChange = (e) => {
    updateSettings({ swapAlgorithm: e.target.value });
  };

  const handlePageAlgoChange = (e) => {
    updateSettings({ pageReplacementAlgo: e.target.value });
  };

  const handleThresholdChange = (e) => {
    updateSettings({ autoSwapThreshold: parseInt(e.target.value, 10) });
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-base">Swap Subsystem Controls</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Toggle Auto Swapping */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-white">Automatic Swapping</div>
            <div className="text-[11px] text-slate-400">Trigger on RAM pressure</div>
          </div>
          <button
            onClick={handleToggleAutoSwap}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
              settings.autoSwappingEnabled ? 'bg-indigo-600' : 'bg-slate-700'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
              settings.autoSwappingEnabled ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Swap Algorithm Selection */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
          <label className="text-xs font-semibold text-white block">Swap Selection Algo</label>
          <select
            value={settings.swapAlgorithm}
            onChange={handleSwapAlgoChange}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 font-mono"
          >
            <option value="LRU">LRU (Least Recently Used)</option>
            <option value="FIFO">FIFO (First-In First-Out)</option>
            <option value="Priority Based">Priority Based</option>
            <option value="Largest Process">Largest Process</option>
            <option value="Smallest Process">Smallest Process</option>
          </select>
        </div>

        {/* Page Replacement Algorithm Selection */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
          <label className="text-xs font-semibold text-white block">Page Replacement Algo</label>
          <select
            value={settings.pageReplacementAlgo}
            onChange={handlePageAlgoChange}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 font-mono"
          >
            <option value="LRU">LRU Page Replacement</option>
            <option value="FIFO">FIFO Page Replacement</option>
            <option value="Clock">Clock (Second Chance)</option>
            <option value="Optimal Simulation">Optimal Simulation</option>
          </select>
        </div>

        {/* Pressure Threshold Slider */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-white">Auto-Swap Threshold</span>
            <span className="font-mono text-indigo-400 font-bold">{settings.autoSwapThreshold}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="95"
            value={settings.autoSwapThreshold}
            onChange={handleThresholdChange}
            className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Manual Swapping Action Triggers */}
      <div className="pt-2 flex flex-wrap items-center gap-3">
        <button
          onClick={forceSwapOut}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-pink-600/20 transition-all"
        >
          <ArrowUpFromLine className="w-4 h-4" />
          <span>Force Swap Out (LRU)</span>
        </button>

        <button
          onClick={forceSwapIn}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span>Force Swap In</span>
        </button>

        <button
          onClick={resetMemory}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all ml-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset Memory Subsystem</span>
        </button>
      </div>
    </div>
  );
}
