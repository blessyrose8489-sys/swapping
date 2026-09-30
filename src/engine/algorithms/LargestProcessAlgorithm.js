const SwapAlgorithm = require('./SwapAlgorithm');

/**
 * Largest Process First Swapping Algorithm
 * Selects the process with the largest memory size in RAM to maximize freed space.
 */
class LargestProcessAlgorithm extends SwapAlgorithm {
  constructor() {
    super('Largest Process', 'Select process requiring the largest memory footprint to maximize RAM recovery.');
  }

  selectSwapOutCandidate(residentProcesses, requiredMemory) {
    if (!residentProcesses || residentProcesses.length === 0) return null;

    const eligible = residentProcesses.filter(p => 
      ['RUNNING', 'READY', 'WAITING'].includes(p.state) && p.ramPages > 0
    );

    if (eligible.length === 0) return null;

    // Sort descending by memoryAllocated (largest first)
    eligible.sort((a, b) => b.memoryAllocated - a.memoryAllocated);

    return eligible[0];
  }

  selectPageReplacementCandidates(pages, count) {
    if (!pages || pages.length === 0) return [];
    return pages.slice(0, Math.min(count, pages.length));
  }
}

module.exports = LargestProcessAlgorithm;
