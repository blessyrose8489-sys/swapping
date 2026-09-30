import React from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { SummaryCards } from '../components/MetricCard';
import { MemoryBlockGrid } from '../components/MemoryBlockGrid';
import { SwapBlockGrid } from '../components/SwapBlockGrid';
import { LiveActivity } from '../components/LiveActivity';
import { ArrowRight, ShieldCheck, Activity } from 'lucide-react';

export function OverviewPage() {
  const { systemState, hostMemory, setActiveTab } = useSwapOS();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="swapos-card p-6 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-[#111827] border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">System Overview</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl font-medium">
            Real-time memory management laboratory monitoring physical RAM allocations, secondary Swap storage partitions, process lifecycles, and page replacement algorithm execution.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('dashboard')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all self-start md:self-auto"
        >
          <span>Open Live Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Cards */}
      <SummaryCards />

      {/* Host OS Memory Statistics (if available) */}
      {hostMemory && hostMemory.success && (
        <div className="swapos-card p-4 bg-[#0D1320] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-semibold">Host OS Physical Memory Stats:</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Total Host RAM: <strong className="text-white">{hostMemory.totalRamMb} MB</strong></span>
            <span>Used: <strong className="text-indigo-300">{hostMemory.usedRamMb} MB</strong> ({hostMemory.ramUtilizationPercent}%)</span>
            <span>Host Swap: <strong className="text-purple-300">{hostMemory.totalSwapMb} MB</strong></span>
          </div>
        </div>
      )}

      {/* Memory Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MemoryBlockGrid limit={32} />
        <SwapBlockGrid limit={32} />
      </div>

      {/* Live System Activity Timeline */}
      <LiveActivity limit={6} />
    </div>
  );
}
