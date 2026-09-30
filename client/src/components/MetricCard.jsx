import React from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { Cpu, HardDrive, Layers, Zap } from 'lucide-react';

export function SummaryCards() {
  const { systemState } = useSwapOS();
  const { metrics, processes } = systemState;

  const activeProcessesCount = processes.filter(p => p.state !== 'TERMINATED').length;
  const ramGb = (metrics.totalRamMb / 1024).toFixed(1);

  const cards = [
    {
      title: 'Total RAM',
      icon: Cpu,
      value: ramGb,
      unit: 'GB',
      secondary: `${metrics.totalRamMb.toLocaleString()} MB configured`,
      color: 'text-indigo-400',
      progress: false
    },
    {
      title: 'RAM Usage',
      icon: Cpu,
      value: metrics.ramUtilization,
      unit: '%',
      secondary: `${metrics.usedRamMb.toLocaleString()} MB utilized`,
      color: metrics.ramUtilization >= 85 ? 'text-rose-400' : 'text-sky-400',
      progress: true,
      progressVal: metrics.ramUtilization,
      progressColor: metrics.ramUtilization >= 85 ? 'bg-rose-500' : 'bg-sky-500'
    },
    {
      title: 'Swap Usage',
      icon: HardDrive,
      value: metrics.swapUtilization,
      unit: '%',
      secondary: `${metrics.usedSwapMb.toLocaleString()} MB occupied`,
      color: 'text-purple-400',
      progress: true,
      progressVal: metrics.swapUtilization,
      progressColor: 'bg-purple-500'
    },
    {
      title: 'Active Processes',
      icon: Layers,
      value: activeProcessesCount,
      unit: 'processes',
      secondary: `${processes.filter(p => p.state === 'SWAPPED').length} currently swapped`,
      color: 'text-emerald-400',
      progress: false
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div 
            key={idx} 
            className="swapos-card p-5 flex flex-col justify-between space-y-3 relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300">
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">{card.value}</span>
                <span className="text-sm font-semibold text-slate-400 font-mono">{card.unit}</span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1 font-mono">{card.secondary}</p>
            </div>

            {card.progress && (
              <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden mt-1">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-500 ${card.progressColor}`}
                  style={{ width: `${Math.min(100, Math.max(0, card.progressVal))}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
