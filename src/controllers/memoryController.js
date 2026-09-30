/**
 * Memory Controller - Handles RAM endpoints
 */
function createMemoryController(scheduler) {
  return {
    getMemoryState: (req, res) => {
      try {
        const memoryManager = scheduler.memoryManager;
        return res.json({
          success: true,
          data: {
            totalRam: memoryManager.totalRam,
            usedRam: memoryManager.getUsedRam(),
            freeRam: memoryManager.getFreeRam(),
            reservedRam: memoryManager.reservedRam,
            utilization: memoryManager.getUtilizationPercentage(),
            blockSize: memoryManager.blockSize,
            totalBlocks: memoryManager.totalBlocks,
            freeBlocks: memoryManager.getFreeBlockCount()
          }
        });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    getMemoryBlocks: (req, res) => {
      try {
        const blocks = scheduler.memoryManager.getBlocks();
        return res.json({ success: true, count: blocks.length, data: blocks });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    resetMemory: (req, res) => {
      try {
        scheduler.reset();
        return res.json({ success: true, message: 'Memory engine state reset successfully' });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }
  };
}

module.exports = createMemoryController;
