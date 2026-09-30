/**
 * Swap Controller - Handles Swap Space endpoints
 */
function createSwapController(scheduler) {
  return {
    getSwapState: (req, res) => {
      try {
        const swapManager = scheduler.swapManager;
        return res.json({
          success: true,
          data: {
            totalSwap: swapManager.totalSwap,
            usedSwap: swapManager.getUsedSwap(),
            freeSwap: swapManager.getFreeSwap(),
            utilization: swapManager.getUtilizationPercentage(),
            blockSize: swapManager.blockSize,
            totalBlocks: swapManager.totalBlocks,
            freeBlocks: swapManager.getFreeBlockCount()
          }
        });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    getSwapBlocks: (req, res) => {
      try {
        const blocks = scheduler.swapManager.getBlocks();
        return res.json({ success: true, count: blocks.length, data: blocks });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    forceSwapOut: (req, res) => {
      try {
        const resident = scheduler.processManager.getResidentProcesses();
        if (resident.length === 0) {
          return res.status(400).json({ success: false, error: 'No active processes residing in RAM to swap out.' });
        }
        const algo = scheduler.getSwapAlgorithm();
        const candidate = algo.selectSwapOutCandidate(resident, 512);
        if (!candidate) {
          return res.status(400).json({ success: false, error: 'No eligible candidate selected by swap algorithm.' });
        }
        const result = scheduler.swapOutProcess(candidate.pid);
        return res.json({ success: true, message: `Force swapped out PID ${candidate.pid}`, data: result.process });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    forceSwapIn: (req, res) => {
      try {
        const swapped = scheduler.processManager.getSwappedProcesses();
        if (swapped.length === 0) {
          return res.status(400).json({ success: false, error: 'No swapped processes available to restore.' });
        }
        const candidate = swapped[0];
        const result = scheduler.swapInProcess(candidate.pid);
        return res.json({ success: true, message: `Force swapped in PID ${candidate.pid}`, data: result.process });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }
  };
}

module.exports = createSwapController;
