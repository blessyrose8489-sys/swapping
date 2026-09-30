const SwapAlgorithm = require('./SwapAlgorithm');

/**
 * Smallest Process First Swapping Algorithm
 * Selects the smallest process in RAM to quickly vacate a process slot with minimal swap I/O overhead.
 */
class SmallestProcessAlgorithm extends SwapAlgorithm {
  constructor() {
    super('Smallest Process', 'Select smallest process to minimize I/O write time to Swap.');
  }

  selectSwapOutCandidate(residentProcesses, requiredMemory) {
    if (!residentProcesses || residentProcesses.length === 0) return null;

    const eligible = residentProcesses.filter(p => 
      ['RUNNING', 'READY', 'WAITING'].includes(p.state) && p.ramPages > 0
    );

    if (eligible.length === 0) return null;

    // Sort ascending by memoryAllocated (smallest first)
    eligible.sort((a, b) => a.memoryAllocated - b.memoryAllocated);

    return eligible[0];
  }

  selectPageReplacementCandidates(pages, count) {
    if (!pages || pages.length === 0) return [];
    return pages.slice(0, Math.min(count, pages.length));
  }
}

module.exports = SmallestProcessAlgorithm;
