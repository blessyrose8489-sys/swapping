import React, { useState } from 'react';
import { useSwapOS, SwapOSProvider } from './context/SwapOSContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ProcessModal } from './components/ProcessModal';
import { ToastContainer } from './components/ToastContainer';

import { OverviewPage } from './pages/OverviewPage';
import { LiveDashboardPage } from './pages/LiveDashboardPage';
import { ProcessManagerPage } from './pages/ProcessManagerPage';
import { RAMManagerPage } from './pages/RAMManagerPage';
import { SwapManagerPage } from './pages/SwapManagerPage';
import { AlgorithmComparisonPage } from './pages/AlgorithmComparisonPage';
import { EventMonitorPage } from './pages/EventMonitorPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

function AppContent() {
  const { activeTab } = useSwapOS();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview': return 'System Overview';
      case 'dashboard': return 'Live Dashboard';
      case 'processes': return 'Process Manager';
      case 'memory': return 'RAM Manager';
      case 'swap': return 'Swap Manager';
      case 'algorithms': return 'Memory Management Algorithms';
      case 'events': return 'System Event Monitor';
      case 'analytics': return 'Performance Analytics';
      case 'settings': return 'System Settings';
      default: return 'Live Dashboard';
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewPage />;
      case 'dashboard': return <LiveDashboardPage />;
      case 'processes': return <ProcessManagerPage />;
      case 'memory': return <RAMManagerPage />;
      case 'swap': return <SwapManagerPage />;
      case 'algorithms': return <AlgorithmComparisonPage />;
      case 'events': return <EventMonitorPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'settings': return <SettingsPage />;
      default: return <LiveDashboardPage />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#070B14] text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header pageTitle={getPageTitle()} toggleMobileSidebar={() => setMobileOpen(!mobileOpen)} />

        <main className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto space-y-6">
          {renderActiveTab()}
        </main>
      </div>

      <ProcessModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <SwapOSProvider>
      <AppContent />
    </SwapOSProvider>
  );
}
