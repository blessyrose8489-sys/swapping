import React, { useState, useEffect } from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { X, Layers, Cpu, HardDrive, Clock, ShieldAlert } from 'lucide-react';

export function ProcessModal() {
  const { selectedProcess, isProcessModalOpen, setIsProcessModalOpen } = useSwapOS();
  const [pageDetails, setPageDetails] = useState([]);

  useEffect(() => {
    if (selectedProcess) {
      fetch(`/api/processes/${selectedProcess.pid}`)
        .then(res => res.json())
        .then(json => {
          if (json.success && json.data.pages) {
            setPageDetails(json.data.pages);
          }
        })
        .catch(err => console.error(err));
    }
  }, [selectedProcess]);

  if (!isProcessModalOpen || !selectedProcess) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-white text-base">{selectedProcess.name}</h3>
              <p className="text-xs font-mono text-indigo-300">PID: {selectedProcess.pid} | ID: {selectedProcess.id}</p>
            </div>
          </div>
          <button
            onClick={() => setIsProcessModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block">Memory Required</span>
              <span className="text-sm font-bold text-white mt-1 block">{selectedProcess.memoryRequired} MB</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block">RAM Alloc / Swap</span>
              <span className="text-sm font-bold text-indigo-300 mt-1 block">{selectedProcess.memoryAllocated} MB / {selectedProcess.swapSize} MB</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block">Priority Level</span>
              <span className="text-sm font-bold text-amber-400 mt-1 block">Priority {selectedProcess.priority}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block">Current State</span>
              <span className="text-sm font-bold text-emerald-400 mt-1 block">{selectedProcess.state}</span>
            </div>
          </div>

          {/* Page Table Inspection */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              Page Table Breakdown ({pageDetails.length} Pages @ 4KB)
            </h4>
            <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/80">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="p-2.5">VPN / Page ID</th>
                    <th className="p-2.5">Location</th>
                    <th className="p-2.5">Block Index</th>
                    <th className="p-2.5">Ref Bit</th>
                    <th className="p-2.5">Dirty Bit</th>
                    <th className="p-2.5">Last Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pageDetails.slice(0, 50).map((page, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/60">
                      <td className="p-2.5 text-indigo-300">{page.pageId}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          page.location === 'RAM' ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300'
                        }`}>
                          {page.location}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-300">{page.blockIndex !== null ? `#${page.blockIndex}` : 'N/A'}</td>
                      <td className="p-2.5 text-amber-400 font-bold">{page.refBit}</td>
                      <td className="p-2.5 text-rose-400 font-bold">{page.dirtyBit ? '1 (Dirty)' : '0 (Clean)'}</td>
                      <td className="p-2.5 text-slate-400">{new Date(page.lastAccessed).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            onClick={() => setIsProcessModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
