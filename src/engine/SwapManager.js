/**
 * SwapManager - Manages secondary storage (Swap Space) blocks and allocation
 */
class SwapManager {
  constructor(totalSwapMb = 32768, blockSizeMb = 256) {
    this.configure(totalSwapMb, blockSizeMb);
  }

  configure(totalSwapMb = 32768, blockSizeMb = 256) {
    this.totalSwap = Math.max(512, Math.min(2097152, totalSwapMb));
    this.blockSize = Math.max(16, blockSizeMb);
    this.totalBlocks = Math.ceil(this.totalSwap / this.blockSize);

    this.blocks = [];
    for (let i = 0; i < this.totalBlocks; i++) {
      this.blocks.push({
        blockIndex: i,
        size: this.blockSize,
        status: 'FREE',
        processId: null,
        allocatedAt: null
      });
    }
  }

  getUsedSwap() {
    return this.blocks
      .filter(b => b.status === 'OCCUPIED')
      .reduce((sum, b) => sum + b.size, 0);
  }

  getFreeSwap() {
    return Math.max(0, this.totalSwap - this.getUsedSwap());
  }

  getUtilizationPercentage() {
    const used = this.getUsedSwap();
    return Number(((used / this.totalSwap) * 100).toFixed(2));
  }

  getFreeBlockCount() {
    return this.blocks.filter(b => b.status === 'FREE').length;
  }

  allocateSwapBlocks(processId, memoryMb) {
    const neededBlocks = Math.ceil(memoryMb / this.blockSize);
    const freeBlocks = this.blocks.filter(b => b.status === 'FREE');

    if (freeBlocks.length < neededBlocks) {
      return {
        success: false,
        allocatedBlocks: 0,
        neededBlocks,
        availableBlocks: freeBlocks.length,
        message: `Insufficient Swap Space. Needed ${neededBlocks} blocks (${neededBlocks * this.blockSize} MB), but only ${freeBlocks.length} blocks available.`
      };
    }

    const assigned = [];
    const now = new Date();
    for (let i = 0; i < neededBlocks; i++) {
      const block = freeBlocks[i];
      block.status = 'OCCUPIED';
      block.processId = processId;
      block.allocatedAt = now;
      assigned.push(block.blockIndex);
    }

    return {
      success: true,
      allocatedBlocks: neededBlocks,
      assignedBlockIndices: assigned,
      allocatedMemoryMb: neededBlocks * this.blockSize
    };
  }

  releaseProcessSwapBlocks(processId) {
    let releasedCount = 0;
    let releasedMb = 0;

    this.blocks.forEach(b => {
      if (b.processId === processId && b.status === 'OCCUPIED') {
        b.status = 'FREE';
        b.processId = null;
        b.allocatedAt = null;
        releasedCount++;
        releasedMb += b.size;
      }
    });

    return {
      releasedCount,
      releasedMb
    };
  }

  getBlocks() {
    return this.blocks;
  }

  reset() {
    this.blocks.forEach(b => {
      b.status = 'FREE';
      b.processId = null;
      b.allocatedAt = null;
    });
  }
}

module.exports = SwapManager;
