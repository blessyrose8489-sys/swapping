const SwapAlgorithm = require('./SwapAlgorithm');

/**
 * First-In First-Out (FIFO) Swapping Algorithm
 * Selects the oldest loaded process/page based on creation/allocation order.
 */
class FIFOAlgorithm extends SwapAlgorithm {
  constructor() {
    super('FIFO', 'Select the oldest loaded process/page based on creation order.');
  }

  selectSwapOutCandidate(residentProcesses, requiredMemory) {
    if (!residentProcesses || residentProcesses.length === 0) return null;

    const eligible = residentProcesses.filter(p => 
      ['RUNNING', 'READY', 'WAITING'].includes(p.state) && p.ramPages > 0
    );

    if (eligible.length === 0) return null;

    // Sort by createdAt ascending (oldest first)
    eligible.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return eligible[0];
  }

  selectPageReplacementCandidates(pages, count) {
    if (!pages || pages.length === 0) return [];
    
    // Sort pages by allocatedAt ascending
    const sortedPages = [...pages].sort((a, b) => 
      new Date(a.allocatedAt || a.createdAt).getTime() - new Date(b.allocatedAt || b.createdAt).getTime()
    );

    return sortedPages.slice(0, Math.min(count, sortedPages.length));
  }
}

module.exports = FIFOAlgorithm;
