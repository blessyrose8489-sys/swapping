const SwapAlgorithm = require('./SwapAlgorithm');

/**
 * Priority Based Swapping Algorithm
 * Prefers swapping lower-priority processes first (e.g. priority 1 is lowest, 10 is highest).
 * If priorities tie, uses LRU as tie-breaker.
 */
class PriorityAlgorithm extends SwapAlgorithm {
  constructor() {
    super('Priority', 'Prefer swapping lower-priority processes first.');
  }

  selectSwapOutCandidate(residentProcesses, requiredMemory) {
    if (!residentProcesses || residentProcesses.length === 0) return null;

    const eligible = residentProcesses.filter(p => 
      ['RUNNING', 'READY', 'WAITING'].includes(p.state) && p.ramPages > 0
    );

    if (eligible.length === 0) return null;

    // Sort ascending by priority (lowest number = lowest priority), then by lastAccessed timestamp
    eligible.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime();
    });

    return eligible[0];
  }

  selectPageReplacementCandidates(pages, count) {
    if (!pages || pages.length === 0) return [];
    
    // Sort pages by process priority ascending
    const sortedPages = [...pages].sort((a, b) => {
      const prioA = a.priority || 5;
      const prioB = b.priority || 5;
      if (prioA !== prioB) return prioA - prioB;
      return new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime();
    });

    return sortedPages.slice(0, Math.min(count, sortedPages.length));
  }
}

module.exports = PriorityAlgorithm;
