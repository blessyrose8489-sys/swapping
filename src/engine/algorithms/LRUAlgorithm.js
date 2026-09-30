const SwapAlgorithm = require('./SwapAlgorithm');

/**
 * Least Recently Used (LRU) Swapping Algorithm
 * Selects the process or page with the oldest lastAccessed timestamp.
 */
class LRUAlgorithm extends SwapAlgorithm {
  constructor() {
    super('LRU', 'Select the least recently accessed process/page as the swap candidate.');
  }

  selectSwapOutCandidate(residentProcesses, requiredMemory) {
    if (!residentProcesses || residentProcesses.length === 0) return null;

    // Filter processes eligible for swapping (not already terminating or swapping)
    const eligible = residentProcesses.filter(p => 
      ['RUNNING', 'READY', 'WAITING'].includes(p.state) && p.ramPages > 0
    );

    if (eligible.length === 0) return null;

    // Sort ascending by lastAccessed timestamp (oldest first)
    eligible.sort((a, b) => new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime());

    return eligible[0];
  }

  selectPageReplacementCandidates(pages, count) {
    if (!pages || pages.length === 0) return [];
    
    // Sort pages by lastAccessed timestamp ascending
    const sortedPages = [...pages].sort((a, b) => 
      new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime()
    );

    return sortedPages.slice(0, Math.min(count, sortedPages.length));
  }
}

module.exports = LRUAlgorithm;
