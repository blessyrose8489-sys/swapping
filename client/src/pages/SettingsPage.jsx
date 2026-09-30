import React, { useState } from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { Settings, Save, AlertCircle, CheckCircle } from 'lucide-react';

export function SettingsPage() {
  const { systemState, updateSettings } = useSwapOS();
  const { settings } = systemState;

  const [totalRam, setTotalRam] = useState(settings.totalRam);
  const [totalSwap, setTotalSwap] = useState(settings.totalSwap);
  const [blockSize, setBlockSize] = useState(settings.blockSize);
  const [warningThreshold, setWarningThreshold] = useState(settings.warningThreshold);
  const [criticalThreshold, setCriticalThreshold] = useState(settings.criticalThreshold);
  const [autoSwapThreshold, setAutoSwapThreshold] = useState(settings.autoSwapThreshold);
  const [tickIntervalMs, setTickIntervalMs] = useState(settings.tickIntervalMs);
  const [swapAlgorithm, setSwapAlgorithm] = useState(settings.swapAlgorithm);
  const [pageReplacementAlgo, setPageReplacementAlgo] = useState(settings.pageReplacementAlgo);

  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSavedMsg('');
    setErrorMsg('');

    if (totalRam < 512 || totalRam > 1048576) {
      setErrorMsg('Total RAM must be between 512 MB and 1,048,576 MB (1 TB).');
      return;
    }
    if (totalSwap < 512 || totalSwap > 2097152) {
      setErrorMsg('Total Swap must be between 512 MB and 2,097,152 MB (2 TB).');
      return;
    }

    try {
      await updateSettings({
        totalRam: parseInt(totalRam, 10),
        totalSwap: parseInt(totalSwap, 10),
        blockSize: parseInt(blockSize, 10),
        warningThreshold: parseInt(warningThreshold, 10),
        criticalThreshold: parseInt(criticalThreshold, 10),
        autoSwapThreshold: parseInt(autoSwapThreshold, 10),
        tickInterval: parseInt(tickIntervalMs, 10),
        swapAlgorithm,
        pageReplacementAlgo
      });
      setSavedMsg('System configuration updated successfully!');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="swapos-card p-6 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-[#111827] border-indigo-500/30 flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">System Settings & Configuration</h2>
          <p className="text-xs text-slate-300 font-medium">Configure physical memory capacity, block partitioning, pressure alert thresholds, and default swapping algorithms.</p>
        </div>
      </div>

      {savedMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="swapos-card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
          {/* Total RAM */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Total Physical RAM (MB)</label>
            <input
              type="number"
              step="512"
              min="512"
              max="1048576"
              value={totalRam}
              onChange={(e) => setTotalRam(e.target.value)}
              className="w-full bg-[#070B14] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[11px] text-slate-500">Configurable (512 MB to 1,048,576 MB)</span>
          </div>

          {/* Total Swap */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Total Swap Space (MB)</label>
            <input
              type="number"
              step="512"
              min="512"
              max="2097152"
              value={totalSwap}
              onChange={(e) => setTotalSwap(e.target.value)}
              className="w-full bg-[#070B14] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[11px] text-slate-500">Configurable (512 MB to 2,097,152 MB)</span>
          </div>

          {/* Block Size */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Physical Memory Block Size (MB)</label>
            <select
              value={blockSize}
              onChange={(e) => setBlockSize(e.target.value)}
              className="w-full bg-[#070B14] border border-slate-800 rounded-xl p-3 text-white focus:outline-none"
            >
              <option value="64">64 MB Blocks</option>
              <option value="128">128 MB Blocks</option>
              <option value="256">256 MB Blocks (Default)</option>
              <option value="512">512 MB Blocks</option>
              <option value="1024">1024 MB Blocks</option>
            </select>
          </div>

          {/* Real-time Tick Interval */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Engine Tick Speed (Milliseconds)</label>
            <input
              type="number"
              step="250"
              min="250"
              max="5000"
              value={tickIntervalMs}
              onChange={(e) => setTickIntervalMs(e.target.value)}
              className="w-full bg-[#070B14] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[11px] text-slate-500">Default tick loop interval (1000ms)</span>
          </div>

          {/* Warning Threshold */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">RAM Warning Threshold (%)</label>
            <input
              type="number"
              min="50"
              max="95"
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(e.target.value)}
              className="w-full bg-[#070B14] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Critical Threshold */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">RAM Critical Threshold (%)</label>
            <input
              type="number"
              min="60"
              max="99"
              value={criticalThreshold}
              onChange={(e) => setCriticalThreshold(e.target.value)}
              className="w-full bg-[#070B14] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Default Swap Algorithm */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Default Swapping Selection Algorithm</label>
            <select
              value={swapAlgorithm}
              onChange={(e) => setSwapAlgorithm(e.target.value)}
              className="w-full bg-[#070B14] border border-slate-800 rounded-xl p-3 text-white focus:outline-none"
            >
              <option value="LRU">LRU (Least Recently Used)</option>
              <option value="FIFO">FIFO (First-In First-Out)</option>
              <option value="Priority Based">Priority Based</option>
              <option value="Largest Process">Largest Process</option>
              <option value="Smallest Process">Smallest Process</option>
            </select>
          </div>

          {/* Default Page Replacement Algorithm */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Default Page Replacement Algorithm</label>
            <select
              value={pageReplacementAlgo}
              onChange={(e) => setPageReplacementAlgo(e.target.value)}
              className="w-full bg-[#070B14] border border-slate-800 rounded-xl p-3 text-white focus:outline-none"
            >
              <option value="LRU">LRU Page Replacement</option>
              <option value="FIFO">FIFO Page Replacement</option>
              <option value="Clock">Clock (Second Chance)</option>
              <option value="Optimal Simulation">Optimal Simulation</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
