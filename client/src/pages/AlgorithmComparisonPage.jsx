import React, { useState } from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { AlgorithmCard } from '../components/AlgorithmCard';
import { GitCompare, Play, BarChart2, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AlgorithmComparisonPage() {
  const { systemState, updateSettings, runBenchmark } = useSwapOS();
  const [processCount, setProcessCount] = useState(25);
  const [benchmarkResults, setBenchmarkResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const algorithms = [
    {
      name: 'LRU',
      description: 'Selects the least recently accessed process or page based on lastAccessed timestamps.',
      advantages: 'Optimal for locality of reference; minimizes page faults for repeated access streams.'
    },
    {
      name: 'FIFO',
      description: 'First-In First-Out algorithm replacing the oldest loaded process or memory page in RAM.',
      advantages: 'Simple CPU implementation; zero timestamp tracking overhead.'
    },
    {
      name: 'Priority Based',
      description: 'Prefers swapping out lower-priority processes first while preserving high-priority tasks resident.',
      advantages: 'Protects critical real-time operating system processes from eviction.'
    },
    {
      name: 'Clock',
      description: 'Second-chance circular buffer replacement using page reference bits.',
      advantages: 'Approximates LRU efficiency with low hardware complexity.'
    },
    {
      name: 'Optimal Simulation',
      description: 'Ideal Belady benchmark selecting the page or process referenced farthest in the future.',
      advantages: 'Provides theoretical minimum page fault baseline for performance evaluation.'
    }
  ];

  const handleSelectAlgo = (algoName) => {
    updateSettings({ swapAlgorithm: algoName });
  };

  const handleRunBenchmark = async () => {
    try {
      setIsRunning(true);
      const data = await runBenchmark(parseInt(processCount, 10));
      setBenchmarkResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="swapos-card p-6 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-[#111827] border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <GitCompare className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-slate-100">Memory Management Algorithms</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl font-medium">
            Inspect swapping and page replacement algorithms, change active selection, and execute workload benchmarks to compare efficiency metrics.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <select
            value={processCount}
            onChange={(e) => setProcessCount(e.target.value)}
            className="bg-[#070B14] border border-slate-800 rounded-xl p-2.5 text-white"
          >
            <option value="15">Light Workload (15 Procs)</option>
            <option value="25">Standard Workload (25 Procs)</option>
            <option value="50">Heavy Workload (50 Procs)</option>
          </select>

          <button
            onClick={handleRunBenchmark}
            disabled={isRunning}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all"
          >
            <Play className="w-4 h-4" />
            <span>{isRunning ? 'Running Benchmark...' : 'Run Benchmark'}</span>
          </button>
        </div>
      </div>

      {/* Algorithm Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {algorithms.map((algo) => (
          <AlgorithmCard
            key={algo.name}
            name={algo.name}
            description={algo.description}
            advantages={algo.advantages}
            isSelected={systemState.settings.swapAlgorithm === algo.name || systemState.settings.pageReplacementAlgo === algo.name}
            onSelect={() => handleSelectAlgo(algo.name)}
          />
        ))}
      </div>

      {/* Benchmark Comparative Charts */}
      {benchmarkResults && benchmarkResults.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Page Faults Chart */}
            <div className="swapos-card p-6 space-y-3">
              <h4 className="font-bold text-slate-100 text-sm">Page Fault Count Comparison (Lower is Better)</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={benchmarkResults}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="algorithm" stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                    <YAxis stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(148,163,184,0.2)', borderRadius: '12px', color: '#F8FAFC' }} />
                    <Bar dataKey="pageFaults" name="Page Faults" fill="#EF4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Total Swap Ops */}
            <div className="swapos-card p-6 space-y-3">
              <h4 className="font-bold text-slate-100 text-sm">Total Swap Operations (Lower is Better)</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={benchmarkResults}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="algorithm" stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                    <YAxis stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(148,163,184,0.2)', borderRadius: '12px', color: '#F8FAFC' }} />
                    <Bar dataKey="totalSwapOps" name="Total Swap Ops" fill="#EC4899" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Avg Wait Time */}
            <div className="swapos-card p-6 space-y-3">
              <h4 className="font-bold text-slate-100 text-sm">Average Wait Time per Operation (ms)</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={benchmarkResults}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="algorithm" stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                    <YAxis stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(148,163,184,0.2)', borderRadius: '12px', color: '#F8FAFC' }} />
                    <Bar dataKey="averageWaitTimeMs" name="Avg Wait (ms)" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Throughput */}
            <div className="swapos-card p-6 space-y-3">
              <h4 className="font-bold text-slate-100 text-sm">Swap Throughput (MB/s) (Higher is Better)</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={benchmarkResults}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="algorithm" stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                    <YAxis stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(148,163,184,0.2)', borderRadius: '12px', color: '#F8FAFC' }} />
                    <Bar dataKey="throughputMbSec" name="Throughput (MB/s)" fill="#22C55E" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="swapos-card p-6 space-y-4">
            <h3 className="font-bold text-slate-100 text-base">Benchmark Metrics Summary</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#070B14]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0A0F1C] text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Algorithm</th>
                    <th className="p-3.5">Page Faults</th>
                    <th className="p-3.5">Swap Out Ops</th>
                    <th className="p-3.5">Swap In Ops</th>
                    <th className="p-3.5">Avg Wait Time</th>
                    <th className="p-3.5">Throughput</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {benchmarkResults.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3.5 font-bold text-indigo-400">{row.algorithm}</td>
                      <td className="p-3.5 text-rose-400 font-bold">{row.pageFaults}</td>
                      <td className="p-3.5 text-pink-300">{row.swapOutCount}</td>
                      <td className="p-3.5 text-sky-300">{row.swapInCount}</td>
                      <td className="p-3.5 text-amber-300">{row.averageWaitTimeMs} ms</td>
                      <td className="p-3.5 text-emerald-400 font-bold">{row.throughputMbSec} MB/s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
