import React from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { BarChart3, Calculator } from 'lucide-react';

export function AnalyticsPage() {
  const { systemState } = useSwapOS();
  const { metrics } = systemState;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="swapos-card p-6 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-[#111827] border-indigo-500/30 flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Performance & Operational Analytics</h2>
          <p className="text-xs text-slate-300 font-medium">Live operational metrics, throughput calculations, and dynamic mathematical formulas.</p>
        </div>
      </div>

      {/* Primary Analytical Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-mono">
        <div className="swapos-card p-6 space-y-3 border-indigo-500/30">
          <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[11px]">Total Swap Operations</span>
          <div className="text-3xl font-extrabold text-slate-100">{metrics.swapOperationsTotal}</div>
          <div className="flex items-center justify-between text-slate-400 pt-3 border-t border-slate-800">
            <span>Swap Out: <strong className="text-pink-400">{metrics.swapOutCount}</strong></span>
            <span>Swap In: <strong className="text-sky-400">{metrics.swapInCount}</strong></span>
          </div>
        </div>

        <div className="swapos-card p-6 space-y-3 border-purple-500/30">
          <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[11px]">Swap Throughput & Rate</span>
          <div className="text-3xl font-extrabold text-purple-300">{metrics.swapThroughputMbPerSec} MB/s</div>
          <div className="flex items-center justify-between text-slate-400 pt-3 border-t border-slate-800">
            <span>Swap Rate: <strong className="text-amber-300">{metrics.swapRateOpsPerSec} ops/sec</strong></span>
            <span>Elapsed: <strong className="text-slate-200">{metrics.elapsedTimeSeconds}s</strong></span>
          </div>
        </div>

        <div className="swapos-card p-6 space-y-3 border-emerald-500/30">
          <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[11px]">Page Fault Rate</span>
          <div className="text-3xl font-extrabold text-emerald-400">{metrics.pageFaultRate}%</div>
          <div className="flex items-center justify-between text-slate-400 pt-3 border-t border-slate-800">
            <span>Faults: <strong className="text-rose-400">{metrics.pageFaultCount}</strong></span>
            <span>Hits: <strong className="text-emerald-400">{metrics.pageHitCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Additional Analytical Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="swapos-card p-5">
          <span className="text-slate-400">Average Swap Duration</span>
          <div className="text-xl font-bold text-amber-300 mt-1">{metrics.averageSwapDurationMs} ms</div>
        </div>
        <div className="swapos-card p-5">
          <span className="text-slate-400">Peak RAM Utilization</span>
          <div className="text-xl font-bold text-sky-400 mt-1">{metrics.peakRamUtilization}%</div>
        </div>
        <div className="swapos-card p-5">
          <span className="text-slate-400">Peak Swap Utilization</span>
          <div className="text-xl font-bold text-purple-400 mt-1">{metrics.peakSwapUtilization}%</div>
        </div>
        <div className="swapos-card p-5">
          <span className="text-slate-400">Page In / Page Out</span>
          <div className="text-xl font-bold text-indigo-400 mt-1">{metrics.pageInCount} / {metrics.pageOutCount}</div>
        </div>
      </div>

      {/* Explicit Dynamic Mathematical Formulations Card */}
      <div className="swapos-card p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">Mathematical Metric Formulations</h3>
            <p className="text-xs text-slate-400 font-mono">Dynamic formulas evaluating live system telemetry</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-[#070B14] border border-slate-800 space-y-1.5">
            <span className="text-sky-400 font-bold block">RAM Utilization Formula</span>
            <div className="text-slate-300 bg-[#0A0F1C] p-2.5 rounded-lg border border-slate-800">
              RAM Utilization = (usedRAM / totalRAM) * 100
            </div>
            <div className="text-slate-400 text-[11px] pt-1">
              Current: ({metrics.usedRamMb} / {metrics.totalRamMb}) * 100 = <strong className="text-white">{metrics.ramUtilization}%</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#070B14] border border-slate-800 space-y-1.5">
            <span className="text-purple-400 font-bold block">Swap Utilization Formula</span>
            <div className="text-slate-300 bg-[#0A0F1C] p-2.5 rounded-lg border border-slate-800">
              Swap Utilization = (usedSwap / totalSwap) * 100
            </div>
            <div className="text-slate-400 text-[11px] pt-1">
              Current: ({metrics.usedSwapMb} / {metrics.totalSwapMb}) * 100 = <strong className="text-white">{metrics.swapUtilization}%</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#070B14] border border-slate-800 space-y-1.5">
            <span className="text-emerald-400 font-bold block">Free RAM Calculation</span>
            <div className="text-slate-300 bg-[#0A0F1C] p-2.5 rounded-lg border border-slate-800">
              Free RAM = totalRAM - usedRAM
            </div>
            <div className="text-slate-400 text-[11px] pt-1">
              Current: {metrics.totalRamMb} - {metrics.usedRamMb} = <strong className="text-white">{metrics.freeRamMb} MB</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#070B14] border border-slate-800 space-y-1.5">
            <span className="text-amber-400 font-bold block">Swap Rate Formula</span>
            <div className="text-slate-300 bg-[#0A0F1C] p-2.5 rounded-lg border border-slate-800">
              Swap Rate = totalSwapOperations / elapsedTimeInSeconds
            </div>
            <div className="text-slate-400 text-[11px] pt-1">
              Current: {metrics.swapOperationsTotal} / {metrics.elapsedTimeSeconds}s = <strong className="text-white">{metrics.swapRateOpsPerSec} ops/sec</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
