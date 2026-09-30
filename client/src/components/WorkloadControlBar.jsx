import React, { useState } from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { Play, Pause, Square, RefreshCw, Cpu, Flame } from 'lucide-react';

export function WorkloadControlBar() {
  const { workloadStatus, controlWorkload } = useSwapOS();

  const [spawnRateMs, setSpawnRateMs] = useState(3000);
  const [minMemoryMb, setMinMemoryMb] = useState(512);
  const [maxMemoryMb, setMaxMemoryMb] = useState(4096);

  const handleApplyConfig = () => {
    controlWorkload(workloadStatus.isRunning ? 'start' : 'stop', {
      spawnRateMs: parseInt(spawnRateMs, 10),
      minMemoryMb: parseInt(minMemoryMb, 10),
      maxMemoryMb: parseInt(maxMemoryMb, 10)
    });
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white text-base">Real Synthetic Workload Generator</h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className={`w-2.5 h-2.5 rounded-full ${workloadStatus.isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
          <span className="text-slate-300">{workloadStatus.isRunning ? 'Generator Active' : 'Generator Stopped'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div>
          <label className="text-slate-400 block mb-1">Process Spawn Interval (ms)</label>
          <input
            type="number"
            step="500"
            min="1000"
            max="10000"
            value={spawnRateMs}
            onChange={(e) => setSpawnRateMs(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1">Min Process Size (MB)</label>
          <input
            type="number"
            step="256"
            min="256"
            value={minMemoryMb}
            onChange={(e) => setMinMemoryMb(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1">Max Process Size (MB)</label>
          <input
            type="number"
            step="256"
            min="512"
            value={maxMemoryMb}
            onChange={(e) => setMaxMemoryMb(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleApplyConfig}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700"
        >
          Apply Parameters
        </button>

        <div className="flex items-center gap-2">
          {!workloadStatus.isRunning ? (
            <button
              onClick={() => controlWorkload('start')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Play className="w-4 h-4" />
              <span>Start Workload</span>
            </button>
          ) : (
            <>
              {workloadStatus.isPaused ? (
                <button
                  onClick={() => controlWorkload('resume')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Play className="w-4 h-4" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  onClick={() => controlWorkload('pause')}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={() => controlWorkload('stop')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Square className="w-4 h-4" />
                <span>Stop Workload</span>
              </button>
            </>
          )}

          <button
            onClick={() => controlWorkload('reset')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Engine</span>
          </button>
        </div>
      </div>
    </div>
  );
}
