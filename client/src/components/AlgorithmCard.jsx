import React from 'react';
import { useSwapOS } from '../context/SwapOSContext';
import { CheckCircle2, GitCompare, Zap, ShieldCheck } from 'lucide-react';

export function AlgorithmCard({ name, description, advantages, isSelected, onSelect }) {
  return (
    <div className={`swapos-card p-5 space-y-4 relative overflow-hidden transition-all ${
      isSelected ? 'border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-500/10' : ''
    }`}>
      {isSelected && (
        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-mono font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>Active Selection</span>
        </div>
      )}

      <div className="flex items-center gap-2.5">
        <div className={`p-2.5 rounded-xl border ${
          isSelected ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
        }`}>
          <GitCompare className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-slate-100 text-base">{name}</h4>
          <span className="text-[11px] font-mono text-slate-400">Swapping & Replacement Engine</span>
        </div>
      </div>

      <p className="text-xs text-slate-300 font-sans leading-relaxed">{description}</p>

      <div className="p-3 rounded-xl bg-[#070B14] border border-slate-800 text-xs font-mono space-y-1">
        <span className="text-indigo-400 font-bold block text-[11px]">Primary Advantage:</span>
        <p className="text-slate-400">{advantages}</p>
      </div>

      <button
        onClick={onSelect}
        disabled={isSelected}
        className={`w-full py-2.5 rounded-xl font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
          isSelected
            ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 cursor-default'
            : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
        }`}
      >
        <Zap className="w-3.5 h-3.5" />
        <span>{isSelected ? 'Active Swap Algorithm' : 'Select Algorithm'}</span>
      </button>
    </div>
  );
}
