import React, { useState } from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { ScrollText, Download, Search, Filter } from 'lucide-react';

export function EventMonitorPage() {
  const { systemState } = useSwapOS();
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const events = (systemState.recentEvents || []).filter(evt => {
    const matchesType = filterType === 'ALL' || evt.type === filterType;
    const matchesSearch = evt.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          evt.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Type', 'PID', 'MemorySize_MB', 'Algorithm', 'Duration_MS', 'Status', 'Details'];
    const rows = events.map(e => [
      e.id,
      e.timestamp,
      e.type,
      e.processId || 'N/A',
      e.memorySize,
      e.algorithm,
      e.duration,
      e.status,
      `"${e.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `swapos_events_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="swapos-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ScrollText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">System Event Monitor</h2>
            <p className="text-xs text-slate-400 font-mono">Live operational log of all memory allocations, page faults, swap operations, and system alerts.</p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="swapos-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 bg-[#070B14] px-3.5 py-2.5 rounded-xl border border-slate-800">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search event log..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none w-full font-mono"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#070B14] border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none"
          >
            <option value="ALL">All Event Types</option>
            <option value="PROCESS_CREATED">PROCESS_CREATED</option>
            <option value="PROCESS_TERMINATED">PROCESS_TERMINATED</option>
            <option value="MEMORY_ALLOCATED">MEMORY_ALLOCATED</option>
            <option value="MEMORY_RELEASED">MEMORY_RELEASED</option>
            <option value="SWAP_STARTED">SWAP_STARTED</option>
            <option value="SWAP_COMPLETED">SWAP_COMPLETED</option>
            <option value="PAGE_OUT">PAGE_OUT</option>
            <option value="PAGE_IN">PAGE_IN</option>
            <option value="MEMORY_WARNING">MEMORY_WARNING</option>
            <option value="MEMORY_CRITICAL">MEMORY_CRITICAL</option>
          </select>
        </div>
      </div>

      {/* Event Stream Log */}
      <div className="swapos-card p-6 space-y-3">
        <div className="max-h-[600px] overflow-y-auto space-y-2.5 font-mono text-xs">
          {events.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No events match the selected criteria.
            </div>
          ) : (
            events.map((evt) => (
              <div key={evt.id} className="p-3.5 rounded-xl bg-[#070B14] border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5 hover:border-indigo-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                    evt.type.includes('CRITICAL') ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                    evt.type.includes('SWAP') ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' :
                    evt.type.includes('WARNING') ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                    'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                  }`}>
                    {evt.type}
                  </span>
                  <span className="text-slate-200">{evt.details}</span>
                </div>

                <div className="flex items-center gap-4 text-slate-400 text-[11px] self-end md:self-auto">
                  {evt.duration > 0 && <span>Duration: <strong className="text-amber-300">{evt.duration} ms</strong></span>}
                  <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
