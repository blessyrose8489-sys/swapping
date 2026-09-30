import React, { useState } from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { ProcessTable } from '../components/ProcessTable';
import { PlusCircle, RefreshCw, AlertCircle, Layers, Cpu } from 'lucide-react';

export function ProcessManagerPage() {
  const { createProcess, systemState } = useSwapOS();

  const [processName, setProcessName] = useState('');
  const [memoryRequired, setMemoryRequired] = useState(2048);
  const [priority, setPriority] = useState(5);
  const [pageCount, setPageCount] = useState(512);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMemChange = (e) => {
    const mem = parseInt(e.target.value, 10) || 0;
    setMemoryRequired(mem);
    setPageCount(Math.ceil((mem * 1024) / 4));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!processName.trim()) {
      setErrorMsg('Validation Error: Process name cannot be empty.');
      return;
    }
    if (memoryRequired <= 0) {
      setErrorMsg('Validation Error: Memory requirement must be greater than zero.');
      return;
    }
    if (memoryRequired > systemState.settings.totalRam) {
      setErrorMsg(`Validation Error: Requested memory (${memoryRequired} MB) exceeds maximum RAM limit (${systemState.settings.totalRam} MB).`);
      return;
    }

    try {
      setIsSubmitting(true);
      const newProc = await createProcess({
        processName: processName.trim(),
        memoryRequired: parseInt(memoryRequired, 10),
        priority: parseInt(priority, 10),
        pageCount: parseInt(pageCount, 10)
      });
      setSuccessMsg(`Process ${newProc.name} (PID: ${newProc.pid}) created successfully!`);
      setProcessName('');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setProcessName('');
    setMemoryRequired(2048);
    setPriority(5);
    setPageCount(512);
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="space-y-6">
      {/* Process Creation Panel */}
      <div className="swapos-card p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">Process Creation & Allocation</h3>
            <p className="text-xs text-slate-400 font-mono">Create processes dynamically with memory requirement validation</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Process Name *</label>
            <input
              type="text"
              placeholder="e.g. WebBrowser_Core"
              value={processName}
              onChange={(e) => setProcessName(e.target.value)}
              className="w-full bg-[#070B14] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Memory Required (MB) *</label>
            <input
              type="number"
              step="256"
              min="256"
              max={systemState.settings.totalRam}
              value={memoryRequired}
              onChange={handleMemChange}
              className="w-full bg-[#070B14] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Priority (1 = Low, 10 = High) *</label>
            <input
              type="number"
              min="1"
              max="10"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-[#070B14] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Calculated Page Count (4KB Pages)</label>
            <input
              type="number"
              value={pageCount}
              onChange={(e) => setPageCount(e.target.value)}
              className="w-full bg-[#070B14] border border-slate-800 rounded-xl p-3 text-indigo-300"
              readOnly
            />
          </div>

          <div className="md:col-span-4 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Form</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Allocating...' : 'Create Process'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Responsive Process Table */}
      <ProcessTable />
    </div>
  );
}
