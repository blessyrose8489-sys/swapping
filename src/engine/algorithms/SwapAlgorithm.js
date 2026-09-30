/**
 * Abstract / Base class for Swap Candidate Selection Algorithms
 */
class SwapAlgorithm {
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }

  /**
   * Select a candidate process to swap out of RAM.
   * @param {Array<Object>} residentProcesses - Processes currently residing in RAM (state RUNNING or READY or WAITING)
   * @param {number} requiredMemory - Minimum MB required to free up
   * @returns {Object|null} Selected candidate process or null
   */
  selectSwapOutCandidate(residentProcesses, requiredMemory) {
    throw new Error('selectSwapOutCandidate must be implemented by subclass');
  }

  /**
   * Select candidate pages to swap out within a process or across memory.
   * @param {Array<Object>} pages - Pages residing in RAM
   * @param {number} count - Number of pages needed
   * @returns {Array<Object>} Selected pages
   */
  selectPageReplacementCandidates(pages, count) {
    throw new Error('selectPageReplacementCandidates must be implemented by subclass');
  }
}

module.exports = SwapAlgorithm;
