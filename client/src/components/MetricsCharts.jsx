import React from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export function MetricsCharts() {
  const { systemState } = useSwapOS();
  const { metrics } = systemState;

  const historyData = metrics.history || [];

  // Memory Allocation Summary Bar
  const allocSummaryData = [
    { name: 'RAM Space', Used: metrics.usedRamMb, Free: metrics.freeRamMb },
    { name: 'Swap Space', Used: metrics.usedSwapMb, Free: metrics.freeSwapMb }
  ];

  // Swap Operations Count Bar
  const swapOpsData = [
    { name: 'Swap Ops', 'Swap In': metrics.swapInCount, 'Swap Out': metrics.swapOutCount, 'Page In': metrics.pageInCount, 'Page Out': metrics.pageOutCount }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. RAM Utilization AreaChart */}
      <div className="swapos-card p-6 space-y-3">
        <h4 className="font-bold text-slate-100 text-sm">RAM Utilization Timeline (%)</h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="ramColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="timestamp" stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <YAxis domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(148,163,184,0.2)', borderRadius: '12px', color: '#F8FAFC' }} />
              <Area type="monotone" dataKey="ramUtilization" name="RAM %" stroke="#38BDF8" fillOpacity={1} fill="url(#ramColor)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Swap Utilization AreaChart */}
      <div className="swapos-card p-6 space-y-3">
        <h4 className="font-bold text-slate-100 text-sm">Swap Utilization Timeline (%)</h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="swapColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C084FC" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#C084FC" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="timestamp" stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <YAxis domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(148,163,184,0.2)', borderRadius: '12px', color: '#F8FAFC' }} />
              <Area type="monotone" dataKey="swapUtilization" name="Swap %" stroke="#C084FC" fillOpacity={1} fill="url(#swapColor)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Memory Allocation BarChart */}
      <div className="swapos-card p-6 space-y-3">
        <h4 className="font-bold text-slate-100 text-sm">Physical Memory Allocation Breakdown (MB)</h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={allocSummaryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(148,163,184,0.2)', borderRadius: '12px', color: '#F8FAFC' }} />
              <Legend />
              <Bar dataKey="Used" fill="#6366F1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Free" fill="#22C55E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Swap Operations BarChart */}
      <div className="swapos-card p-6 space-y-3">
        <h4 className="font-bold text-slate-100 text-sm">Swap Operations Frequency</h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={swapOpsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(148,163,184,0.2)', borderRadius: '12px', color: '#F8FAFC' }} />
              <Legend />
              <Bar dataKey="Swap In" fill="#38BDF8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Swap Out" fill="#F472B6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Page In" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Page Out" fill="#F59E0B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
