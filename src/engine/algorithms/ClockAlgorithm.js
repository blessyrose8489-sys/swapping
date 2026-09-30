const SwapAlgorithm = require('./SwapAlgorithm');

/**
 * Clock (Second Chance) Page Replacement Algorithm
 * Maintains a circular list pointer with reference bits (0 or 1).
 */
class ClockAlgorithm extends SwapAlgorithm {
  constructor() {
    super('Clock', 'Second chance circular buffer page replacement using reference bits.');
    this.pointer = 0;
  }

  selectPageReplacementCandidates(pages, count) {
    if (!pages || pages.length === 0) return [];
    
    const selected = [];
    const pagesCopy = pages.map(p => ({ ...p, refBit: p.refBit !== undefined ? p.refBit : 1 }));
    let n = pagesCopy.length;
    let pointer = this.pointer % n;

    while (selected.length < count && selected.length < n) {
      const currentPage = pagesCopy[pointer];

      if (!currentPage.selected) {
        if (currentPage.refBit === 1) {
          // Give second chance, clear reference bit
          currentPage.refBit = 0;
        } else {
          // Select this page for replacement
          currentPage.selected = true;
          selected.push(pages[pointer]);
        }
      }

      pointer = (pointer + 1) % n;
    }

    this.pointer = pointer;
    return selected;
  }

  selectSwapOutCandidate(residentProcesses, requiredMemory) {
    if (!residentProcesses || residentProcesses.length === 0) return null;
    const eligible = residentProcesses.filter(p => ['RUNNING', 'READY', 'WAITING'].includes(p.state) && p.ramPages > 0);
    if (eligible.length === 0) return null;
    // Clock selects candidate based on process reference bit simulation
    return eligible[this.pointer % eligible.length];
  }
}

module.exports = ClockAlgorithm;
