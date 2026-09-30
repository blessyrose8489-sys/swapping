const SwapAlgorithm = require('./SwapAlgorithm');

/**
 * Optimal Page Replacement Simulation Algorithm (Belady's Anomaly-free Ideal Benchmark)
 * Evaluates simulated future memory access stream to select page/process accessed furthest in the future.
 */
class OptimalAlgorithm extends SwapAlgorithm {
  constructor() {
    super('Optimal Simulation', 'Ideal algorithm selecting process/page that will not be used for longest time in future.');
  }

  selectPageReplacementCandidates(pages, count, futureAccessList = []) {
    if (!pages || pages.length === 0) return [];
    
    // Calculate next reference distance for each page
    const pageDistances = pages.map((page, index) => {
      const futureIndex = futureAccessList.indexOf(page.pageId || page.id);
      return {
        page,
        index,
        distance: futureIndex === -1 ? Infinity : futureIndex
      };
    });

    // Sort by future distance descending (furthest in future or never accessed again first)
    pageDistances.sort((a, b) => b.distance - a.distance);

    return pageDistances.slice(0, Math.min(count, pages.length)).map(item => item.page);
  }

  selectSwapOutCandidate(residentProcesses, requiredMemory) {
    if (!residentProcesses || residentProcesses.length === 0) return null;
    const eligible = residentProcesses.filter(p => ['RUNNING', 'READY', 'WAITING'].includes(p.state) && p.ramPages > 0);
    if (eligible.length === 0) return null;
    
    // Sort by lastAccessed descending (heuristically simulating farthest future reference for static benchmark)
    eligible.sort((a, b) => new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime());
    return eligible[0];
  }
}

module.exports = OptimalAlgorithm;
