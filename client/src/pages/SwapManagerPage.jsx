import React from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { SwapBlockGrid } from '../components/SwapBlockGrid';
import { HardDrive, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

export function SwapManagerPage() {
  const { systemState, forceSwapOut, forceSwapIn } = useSwapOS();
  const { metrics, swapBlocks, processes } = systemState;

  const occupiedCount = swapBlocks.filter(b => b.status === 'OCCUPIED').length;
  const freeCount = swapBlocks.filter(b => b.status === 'FREE').length;
  const swappedProcesses = processes.filter(p => p.state === 'SWAPPED' || p.swapPages > 0);

  return (
    <div className="space-y-6">
      {/* Swap Banner */}
      <div className="swapos-card p-6 bg-gradient-to-r from-purple-950/60 via-pink-950/40 to-[#111827] border-purple-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Swap Space Subsystem Inspector</h2>
            <p className="text-xs text-slate-300 font-medium">Monitors secondary storage allocations for swapped processes and non-resident memory pages.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={forceSwapOut}
            className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-pink-600/20 transition-all"
          >
            <ArrowUpFromLine className="w-3.5 h-3.5" />
            <span>Force Swap Out</span>
          </button>
          <button
            onClick={forceSwapIn}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Force Swap In</span>
          </button>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="swapos-card p-5 border-purple-500/30">
          <span className="text-slate-400">Total Swap Capacity</span>
          <div className="text-2xl font-extrabold text-purple-400 mt-1">{metrics.totalSwapMb} MB</div>
          <span className="text-slate-400">{swapBlocks.length} Storage Blocks</span>
        </div>
        <div className="swapos-card p-5 border-pink-500/30">
          <span className="text-slate-400">Occupied Swap Blocks</span>
          <div className="text-2xl font-extrabold text-pink-400 mt-1">{occupiedCount} Blocks</div>
          <span className="text-slate-400">{metrics.usedSwapMb} MB ({metrics.swapUtilization}%)</span>
        </div>
        <div className="swapos-card p-5 border-emerald-500/30">
          <span className="text-slate-400">Available Swap Space</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">{freeCount} Blocks</div>
          <span className="text-slate-400">{metrics.freeSwapMb} MB Free</span>
        </div>
      </div>

      {/* Swap Block Grid */}
      <SwapBlockGrid />

      {/* Swapped Processes Table */}
      <div className="swapos-card p-6 space-y-4">
        <h3 className="font-bold text-slate-100 text-base">Swapped Out Processes Queue</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#070B14]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0A0F1C] text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">PID</th>
                <th className="p-3.5">Process Name</th>
                <th className="p-3.5">Swap Memory</th>
                <th className="p-3.5">Swapped Pages</th>
                <th className="p-3.5">State</th>
                <th className="p-3.5">Last Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {swappedProcesses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">
                    No processes currently swapped out to secondary storage.
                  </td>
                </tr>
              ) : (
                swappedProcesses.map(proc => (
                  <tr key={proc.pid} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3.5 text-pink-400 font-bold">{proc.pid}</td>
                    <td className="p-3.5 font-semibold text-slate-100">{proc.name}</td>
                    <td className="p-3.5 text-slate-300">{proc.swapSize || proc.memoryRequired} MB</td>
                    <td className="p-3.5 text-purple-300">{proc.swapPages} Pages</td>
                    <td className="p-3.5"><span className="badge badge-swapped">{proc.state}</span></td>
                    <td className="p-3.5 text-slate-400">{new Date(proc.lastAccessed).toLocaleTimeString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
