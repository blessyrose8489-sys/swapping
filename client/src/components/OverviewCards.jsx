import React from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { Cpu, HardDrive, Zap, PieChart, Layers, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function OverviewCards() {
  const { systemState } = useSwapOS();
  const { metrics, processes } = systemState;

  const activeProcessesCount = processes.filter(p => p.state !== 'TERMINATED').length;
  const swappedProcessesCount = processes.filter(p => p.state === 'SWAPPED' || p.swapPages > 0).length;

  const cards = [
    {
      title: 'Total RAM',
      value: `${(metrics.totalRamMb / 1024).toFixed(1)} GB`,
      sub: `${metrics.totalRamMb.toLocaleString()} MB`,
      icon: Cpu,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30'
    },
    {
      title: 'Used RAM',
      value: `${metrics.usedRamMb.toLocaleString()} MB`,
      sub: `${((metrics.usedRamMb / metrics.totalRamMb) * 100).toFixed(1)}% Allocated`,
      icon: Zap,
      color: 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30'
    },
    {
      title: 'Free RAM',
      value: `${metrics.freeRamMb.toLocaleString()} MB`,
      sub: `${((metrics.freeRamMb / metrics.totalRamMb) * 100).toFixed(1)}% Available`,
      icon: Cpu,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
    },
    {
      title: 'RAM Utilization',
      value: `${metrics.ramUtilization}%`,
      sub: `Peak: ${metrics.peakRamUtilization}%`,
      icon: PieChart,
      color: metrics.ramUtilization >= 85 ? 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30' : 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30'
    },
    {
      title: 'Total Swap Space',
      value: `${(metrics.totalSwapMb / 1024).toFixed(1)} GB`,
      sub: `${metrics.totalSwapMb.toLocaleString()} MB Partition`,
      icon: HardDrive,
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30'
    },
    {
      title: 'Used Swap Space',
      value: `${metrics.usedSwapMb.toLocaleString()} MB`,
      sub: `${metrics.swapUtilization}% Occupied`,
      icon: HardDrive,
      color: 'from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30'
    },
    {
      title: 'Swap Utilization',
      value: `${metrics.swapUtilization}%`,
      sub: `Peak: ${metrics.peakSwapUtilization}%`,
      icon: PieChart,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30'
    },
    {
      title: 'Active Processes',
      value: activeProcessesCount,
      sub: `${swappedProcessesCount} Swapped Out`,
      icon: Layers,
      color: 'from-sky-500/20 to-indigo-500/20 text-sky-400 border-sky-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="glass-panel p-4 flex flex-col justify-between hover:border-indigo-500/50 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">{card.title}</span>
              <div className={`p-2 rounded-xl bg-gradient-to-br ${card.color} border`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-white font-mono tracking-tight group-hover:text-indigo-300 transition-colors">
                {card.value}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center justify-between font-mono">
                <span>{card.sub}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
