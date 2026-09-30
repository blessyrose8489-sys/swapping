import React, { useState } from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { Cpu, Info } from 'lucide-react';

export function MemoryBlockGrid({ limit = null }) {
  const { systemState, setSelectedProcess, setIsProcessModalOpen } = useSwapOS();
  const { ramBlocks, processes } = systemState;
  const [hoveredBlock, setHoveredBlock] = useState(null);

  const displayBlocks = limit ? ramBlocks.slice(0, limit) : ramBlocks;

  const handleBlockClick = (block) => {
    if (block.processId && block.processId !== 'SYSTEM_KERNEL') {
      const proc = processes.find(p => p.id === block.processId || `proc-${p.pid}` === block.processId);
      if (proc) {
        setSelectedProcess(proc);
        setIsProcessModalOpen(true);
      }
    }
  };

  return (
    <div className="swapos-card p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">Physical Memory (RAM)</h3>
            <p className="text-xs text-slate-400 font-mono">
              Live RAM Allocation ({ramBlocks.length} Blocks @ {systemState.settings.blockSize} MB)
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#172033] border border-slate-700 inline-block" />
            <span className="text-slate-400">Free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
            <span className="text-slate-200">Allocated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-600 inline-block" />
            <span className="text-slate-200">Kernel</span>
          </div>
        </div>
      </div>

      {/* Memory Block Grid */}
      <div className="block-grid max-h-[380px] overflow-y-auto p-3 bg-[#070B14] rounded-xl border border-slate-800/80">
        {displayBlocks.map((block) => {
          let statusClass = 'mem-block-free';
          if (block.status === 'ALLOCATED') statusClass = 'mem-block-allocated';
          else if (block.status === 'RESERVED') statusClass = 'mem-block-reserved';

          const proc = processes.find(p => p.id === block.processId);

          return (
            <div
              key={block.blockIndex}
              onClick={() => handleBlockClick(block)}
              onMouseEnter={() => setHoveredBlock({ ...block, proc })}
              onMouseLeave={() => setHoveredBlock(null)}
              className={`mem-block ${statusClass}`}
              title={`Block #${block.blockIndex} (${block.status})`}
            >
              <span>{block.blockIndex}</span>
            </div>
          );
        })}
      </div>

      {/* Hover Info Banner */}
      {hoveredBlock ? (
        <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/30 text-xs font-mono flex items-center justify-between text-slate-200">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Physical Block #{hoveredBlock.blockIndex} (0x{ (hoveredBlock.blockIndex * systemState.settings.blockSize).toString(16).toUpperCase() }):</span>
            <span className="font-bold text-white">{hoveredBlock.status}</span>
          </div>
          {hoveredBlock.proc && (
            <div className="text-indigo-300 font-semibold">
              Owner: {hoveredBlock.proc.name} (PID: {hoveredBlock.proc.pid})
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs text-slate-400 font-mono text-center py-1">
          Hover over memory blocks to inspect address space & process ownership.
        </div>
      )}
    </div>
  );
}
