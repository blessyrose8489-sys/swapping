import React, { useState, useMemo } from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { Search, Filter, ArrowUpDown, Eye, ArrowUpFromLine, ArrowDownToLine, XCircle, Zap, PlusCircle } from 'lucide-react';

export function ProcessTable({ onOpenCreateModal }) {
  const { 
    systemState, 
    setSelectedProcess, 
    setIsProcessModalOpen, 
    terminateProcess, 
    accessMemory, 
    swapOut, 
    swapIn 
  } = useSwapOS();

  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('pid');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredProcesses = useMemo(() => {
    return systemState.processes.filter(proc => {
      const matchesSearch = proc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            String(proc.pid).includes(searchTerm);
      const matchesState = stateFilter === 'ALL' || proc.state === stateFilter;
      const matchesPriority = priorityFilter === 'ALL' || proc.priority === parseInt(priorityFilter, 10);
      return matchesSearch && matchesState && matchesPriority;
    }).sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'lastAccessed' || sortBy === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [systemState.processes, searchTerm, stateFilter, priorityFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredProcesses.length / pageSize) || 1;
  const paginatedProcesses = filteredProcesses.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getBadgeClass = (state) => {
    switch (state) {
      case 'RUNNING': return 'badge-running';
      case 'READY': return 'badge-ready';
      case 'SWAPPED': return 'badge-swapped';
      case 'SWAPPING_OUT':
      case 'SWAPPING_IN': return 'badge-swapping';
      case 'WAITING': return 'badge-waiting';
      case 'TERMINATED': return 'badge-terminated';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="swapos-card p-6 space-y-4">
      {/* Title & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-bold text-slate-100 text-base">Active Processes</h3>
          <p className="text-xs text-slate-400 font-mono">Managed system process control blocks (PCBs)</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-[#070B14] rounded-xl px-3 py-2 border border-slate-800 text-xs flex-1 sm:flex-none">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search PID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-white placeholder-slate-500 focus:outline-none font-mono w-full sm:w-44"
            />
          </div>

          {/* State Filter */}
          <div className="flex items-center gap-2 bg-[#070B14] rounded-xl px-3 py-2 border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="bg-transparent text-slate-300 border-none focus:outline-none font-mono cursor-pointer"
            >
              <option value="ALL">All States</option>
              <option value="RUNNING">RUNNING</option>
              <option value="READY">READY</option>
              <option value="SWAPPED">SWAPPED</option>
              <option value="WAITING">WAITING</option>
              <option value="TERMINATED">TERMINATED</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2 bg-[#070B14] rounded-xl px-3 py-2 border border-slate-800 text-xs">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-slate-300 border-none focus:outline-none font-mono cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="10">Prio 10 (Highest)</option>
              <option value="8">Prio 8</option>
              <option value="5">Prio 5 (Normal)</option>
              <option value="1">Prio 1 (Lowest)</option>
            </select>
          </div>

          {onOpenCreateModal && (
            <button
              onClick={onOpenCreateModal}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Process</span>
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-800 bg-[#070B14]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#0A0F1C] text-slate-400 uppercase text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-3.5 cursor-pointer" onClick={() => handleSort('pid')}>
                <div className="flex items-center gap-1">PID <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="p-3.5 cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">Process Name <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="p-3.5 cursor-pointer" onClick={() => handleSort('memoryRequired')}>
                <div className="flex items-center gap-1">Memory <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="p-3.5">RAM Pages</th>
              <th className="p-3.5">Swap Pages</th>
              <th className="p-3.5 cursor-pointer" onClick={() => handleSort('priority')}>
                <div className="flex items-center gap-1">Priority <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="p-3.5">State</th>
              <th className="p-3.5 cursor-pointer" onClick={() => handleSort('lastAccessed')}>
                <div className="flex items-center gap-1">Last Access <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {paginatedProcesses.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-8 text-slate-500">
                  No active processes found matching criteria.
                </td>
              </tr>
            ) : (
              paginatedProcesses.map((proc) => (
                <tr key={proc.pid} className="hover:bg-slate-900/60 transition-colors">
                  <td className="p-3.5 font-bold text-indigo-400">{proc.pid}</td>
                  <td className="p-3.5 font-semibold text-slate-100">{proc.name}</td>
                  <td className="p-3.5 text-slate-300">{proc.memoryRequired} MB</td>
                  <td className="p-3.5 text-sky-400">{proc.ramPages}</td>
                  <td className="p-3.5 text-purple-400">{proc.swapPages}</td>
                  <td className="p-3.5 text-amber-400 font-bold">{proc.priority}</td>
                  <td className="p-3.5">
                    <span className={`badge ${getBadgeClass(proc.state)}`}>
                      {proc.state}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {new Date(proc.lastAccessed).toLocaleTimeString()}
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setSelectedProcess(proc); setIsProcessModalOpen(true); }}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                        title="View Details & Page Table"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {proc.state !== 'TERMINATED' && (
                        <>
                          <button
                            onClick={() => accessMemory(proc.pid)}
                            className="p-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 transition-all"
                            title="Simulate CPU Access (Touch Memory)"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>

                          {proc.ramPages > 0 && (
                            <button
                              onClick={() => swapOut(proc.pid)}
                              className="p-2 rounded-lg bg-purple-950/80 hover:bg-purple-800 text-purple-300 transition-all"
                              title="Swap Out to Storage"
                            >
                              <ArrowUpFromLine className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {proc.swapPages > 0 && (
                            <button
                              onClick={() => swapIn(proc.pid)}
                              className="p-2 rounded-lg bg-sky-950/80 hover:bg-sky-800 text-sky-300 transition-all"
                              title="Swap In to RAM"
                            >
                              <ArrowDownToLine className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => terminateProcess(proc.pid)}
                            className="p-2 rounded-lg bg-rose-950/80 hover:bg-rose-800 text-rose-300 transition-all"
                            title="Terminate Process"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Process Cards */}
      <div className="sm:hidden space-y-3">
        {paginatedProcesses.map((proc) => (
          <div key={proc.pid} className="p-4 rounded-xl bg-[#070B14] border border-slate-800 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-400">PID #{proc.pid}</span>
              <span className={`badge ${getBadgeClass(proc.state)}`}>{proc.state}</span>
            </div>
            <div className="font-semibold text-slate-100 text-sm">{proc.name}</div>
            <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px]">
              <div>Memory: <strong className="text-slate-200">{proc.memoryRequired} MB</strong></div>
              <div>Priority: <strong className="text-amber-400">{proc.priority}</strong></div>
              <div>RAM Pages: <strong className="text-sky-400">{proc.ramPages}</strong></div>
              <div>Swap Pages: <strong className="text-purple-400">{proc.swapPages}</strong></div>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
              <button onClick={() => { setSelectedProcess(proc); setIsProcessModalOpen(true); }} className="p-2 rounded-lg bg-slate-800 text-slate-300">
                <Eye className="w-4 h-4" />
              </button>
              {proc.state !== 'TERMINATED' && (
                <>
                  <button onClick={() => accessMemory(proc.pid)} className="p-2 rounded-lg bg-emerald-950 text-emerald-300">
                    <Zap className="w-4 h-4" />
                  </button>
                  {proc.ramPages > 0 && (
                    <button onClick={() => swapOut(proc.pid)} className="p-2 rounded-lg bg-purple-950 text-purple-300">
                      <ArrowUpFromLine className="w-4 h-4" />
                    </button>
                  )}
                  {proc.swapPages > 0 && (
                    <button onClick={() => swapIn(proc.pid)} className="p-2 rounded-lg bg-sky-950 text-sky-300">
                      <ArrowDownToLine className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => terminateProcess(proc.pid)} className="p-2 rounded-lg bg-rose-950 text-rose-300">
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/80">
        <span>Showing {paginatedProcesses.length} of {filteredProcesses.length} processes</span>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40"
          >
            Prev
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
