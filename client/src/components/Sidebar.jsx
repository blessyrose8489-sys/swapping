import React from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { 
  LayoutDashboard, 
  Activity, 
  Cpu, 
  HardDrive, 
  GitCompare, 
  ScrollText, 
  BarChart3, 
  Settings,
  X 
} from 'lucide-react';

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const { activeTab, setActiveTab, systemState } = useSwapOS();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'dashboard', label: 'Live Dashboard', icon: Activity, badge: `${systemState.metrics.ramUtilization}%` },
    { id: 'processes', label: 'Processes', icon: Cpu, count: systemState.processes.filter(p => p.state !== 'TERMINATED').length },
    { id: 'memory', label: 'RAM Manager', icon: Cpu },
    { id: 'swap', label: 'Swap Manager', icon: HardDrive },
    { id: 'algorithms', label: 'Algorithms', icon: GitCompare },
    { id: 'events', label: 'Events', icon: ScrollText, count: systemState.recentEvents.length },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-[250px] bg-[#0A0F1C] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out shrink-0 ${
        mobileOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo Section */}
        <div className="h-[72px] px-5 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base text-white tracking-wide">SwapOS</div>
              <p className="text-[11px] text-slate-400 font-medium">Memory Management Lab</p>
            </div>
          </div>

          <button 
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-[10px] text-xs font-semibold transition-all relative group ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {/* Active Left Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-indigo-500" />
                )}

                <div className="flex items-center gap-3 pl-1">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Subsystem Config */}
        <div className="p-4 border-t border-slate-800/80 bg-[#070B14] text-xs text-slate-400 space-y-1.5 font-mono">
          <div className="flex justify-between items-center text-[11px]">
            <span>Swap Algo:</span>
            <span className="text-indigo-300 font-bold">{systemState.settings.swapAlgorithm}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span>Page Algo:</span>
            <span className="text-purple-300 font-bold">{systemState.settings.pageReplacementAlgo}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
