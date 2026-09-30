import React from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { MemoryBlockGrid } from '../components/MemoryBlockGrid';
import { Cpu, Zap, ShieldCheck } from 'lucide-react';

export function RAMManagerPage() {
  const { systemState } = useSwapOS();
  const { metrics, ramBlocks } = systemState;

  const allocatedCount = ramBlocks.filter(b => b.status === 'ALLOCATED').length;
  const reservedCount = ramBlocks.filter(b => b.status === 'RESERVED').length;
  const freeCount = ramBlocks.filter(b => b.status === 'FREE').length;

  return (
    <div className="space-y-6">
      {/* RAM Summary Banner */}
      <div className="swapos-card p-6 bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-[#111827] border-blue-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Physical Memory (RAM) Inspector</h2>
            <p className="text-xs text-slate-300 font-medium">Detailed physical block allocations, physical address translation, and process memory maps.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3.5 py-2 rounded-xl bg-[#070B14] border border-slate-800">
            Capacity: <strong className="text-white">{metrics.totalRamMb} MB</strong>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-[#070B14] border border-slate-800">
            Block Size: <strong className="text-indigo-300">{systemState.settings.blockSize} MB</strong>
          </div>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="swapos-card p-5 border-blue-500/30">
          <span className="text-slate-400">Allocated RAM Blocks</span>
          <div className="text-2xl font-extrabold text-blue-400 mt-1">{allocatedCount} Blocks</div>
          <span className="text-slate-400">{allocatedCount * systemState.settings.blockSize} MB Allocated</span>
        </div>
        <div className="swapos-card p-5 border-amber-500/30">
          <span className="text-slate-400">Kernel Reserved Blocks</span>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">{reservedCount} Blocks</div>
          <span className="text-slate-400">{reservedCount * systemState.settings.blockSize} MB Reserved</span>
        </div>
        <div className="swapos-card p-5 border-emerald-500/30">
          <span className="text-slate-400">Available Free Blocks</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">{freeCount} Blocks</div>
          <span className="text-slate-400">{freeCount * systemState.settings.blockSize} MB Free</span>
        </div>
      </div>

      {/* Memory Block Visualizer Grid */}
      <MemoryBlockGrid />
    </div>
  );
}
