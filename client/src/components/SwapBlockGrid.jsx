import React, { useState } from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { HardDrive, Info } from 'lucide-react';

export function SwapBlockGrid({ limit = null }) {
  const { systemState, setSelectedProcess, setIsProcessModalOpen } = useSwapOS();
  const { swapBlocks, processes } = systemState;
  const [hoveredBlock, setHoveredBlock] = useState(null);

  const displayBlocks = limit ? swapBlocks.slice(0, limit) : swapBlocks;

  const handleBlockClick = (block) => {
    if (block.processId) {
      const proc = processes.find(p => p.id === block.processId);
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
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">Swap Space Storage</h3>
            <p className="text-xs text-slate-400 font-mono">
              Secondary Memory Allocation ({swapBlocks.length} Blocks @ {systemState.settings.blockSize} MB)
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
            <span className="w-3 h-3 rounded bg-pink-600 inline-block" />
            <span className="text-slate-200">Occupied (Swapped)</span>
          </div>
        </div>
      </div>

      {/* Swap Block Grid */}
      <div className="block-grid max-h-[380px] overflow-y-auto p-3 bg-[#070B14] rounded-xl border border-slate-800/80">
        {displayBlocks.map((block) => {
          const statusClass = block.status === 'OCCUPIED' ? 'mem-block-occupied' : 'mem-block-free';
          const proc = processes.find(p => p.id === block.processId);

          return (
            <div
              key={block.blockIndex}
              onClick={() => handleBlockClick(block)}
              onMouseEnter={() => setHoveredBlock({ ...block, proc })}
              onMouseLeave={() => setHoveredBlock(null)}
              className={`mem-block ${statusClass}`}
              title={`Swap Block #${block.blockIndex} (${block.status})`}
            >
              <span>{block.blockIndex}</span>
            </div>
          );
        })}
      </div>

      {/* Hover Info */}
      {hoveredBlock ? (
        <div className="p-3 rounded-xl bg-slate-900 border border-pink-500/30 text-xs font-mono flex items-center justify-between text-slate-200">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Swap Partition #{hoveredBlock.blockIndex}:</span>
            <span className="font-bold text-white">{hoveredBlock.status}</span>
          </div>
          {hoveredBlock.proc && (
            <div className="text-pink-300 font-semibold">
              Swapped Process: {hoveredBlock.proc.name} (PID: {hoveredBlock.proc.pid})
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs text-slate-400 font-mono text-center py-1">
          Hover over swap blocks to view secondary storage allocation & page assignment.
        </div>
      )}
    </div>
  );
}
