import React from 'react';
import { SummaryCards } from '../components/MetricCard';
import { LiveSwapAnimation } from '../components/LiveSwapAnimation';
import { SwapControlPanel } from '../components/SwapControlPanel';
import { MemoryBlockGrid } from '../components/MemoryBlockGrid';
import { SwapBlockGrid } from '../components/SwapBlockGrid';
import { MetricsCharts } from '../components/MetricsCharts';
import { WorkloadControlBar } from '../components/WorkloadControlBar';
import { LiveActivity } from '../components/LiveActivity';

export function LiveDashboardPage() {
  return (
    <div className="space-y-6">
      {/* 4 Summary Metric Cards */}
      <SummaryCards />

      {/* Live Swap Pipeline Animation & Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveSwapAnimation />
        <SwapControlPanel />
      </div>

      {/* Workload Generator Bar */}
      <WorkloadControlBar />

      {/* Physical RAM & Swap Block Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MemoryBlockGrid />
        <SwapBlockGrid />
      </div>

      {/* Real-time Recharts Suite */}
      <MetricsCharts />

      {/* Live System Activity Timeline Stream */}
      <LiveActivity limit={8} />
    </div>
  );
}
