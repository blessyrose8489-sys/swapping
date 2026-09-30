/**
 * MemoryManager - Manages physical RAM block allocations and status
 */
class MemoryManager {
  constructor(totalRamMb = 16384, blockSizeMb = 256) {
    this.configure(totalRamMb, blockSizeMb);
  }

  configure(totalRamMb = 16384, blockSizeMb = 256) {
    this.totalRam = Math.max(512, Math.min(1048576, totalRamMb));
    this.blockSize = Math.max(16, blockSizeMb);
    this.totalBlocks = Math.ceil(this.totalRam / this.blockSize);
    
    // System reserve 5% of RAM
    this.reservedRam = Math.round(this.totalRam * 0.05);

    // Initialize physical block array
    this.blocks = [];
    for (let i = 0; i < this.totalBlocks; i++) {
      this.blocks.push({
        blockIndex: i,
        size: this.blockSize,
        status: i === 0 ? 'RESERVED' : 'FREE', // Block 0 reserved for Kernel / SwapOS Core
        processId: i === 0 ? 'SYSTEM_KERNEL' : null,
        allocatedAt: i === 0 ? new Date() : null
      });
    }
  }

  getUsedRam() {
    return this.blocks
      .filter(b => b.status === 'ALLOCATED')
      .reduce((sum, b) => sum + b.size, 0);
  }

  getFreeRam() {
    const allocated = this.blocks
      .filter(b => b.status === 'ALLOCATED' || b.status === 'RESERVED')
      .reduce((sum, b) => sum + b.size, 0);
    return Math.max(0, this.totalRam - allocated);
  }

  getUtilizationPercentage() {
    const used = this.getUsedRam();
    return Number(((used / this.totalRam) * 100).toFixed(2));
  }

  getFreeBlockCount() {
    return this.blocks.filter(b => b.status === 'FREE').length;
  }

  allocateBlocksForProcess(processId, memoryMb) {
    const neededBlocks = Math.ceil(memoryMb / this.blockSize);
    const freeBlocks = this.blocks.filter(b => b.status === 'FREE');

    if (freeBlocks.length < neededBlocks) {
      return {
        success: false,
        allocatedBlocks: 0,
        neededBlocks,
        availableBlocks: freeBlocks.length,
        message: `Insufficient RAM. Needed ${neededBlocks} blocks (${neededBlocks * this.blockSize} MB), but only ${freeBlocks.length} blocks available.`
      };
    }

    const assigned = [];
    const now = new Date();
    for (let i = 0; i < neededBlocks; i++) {
      const block = freeBlocks[i];
      block.status = 'ALLOCATED';
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

  releaseProcessBlocks(processId) {
    let releasedCount = 0;
    let releasedMb = 0;

    this.blocks.forEach(b => {
      if (b.processId === processId && b.status === 'ALLOCATED') {
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
    this.blocks.forEach((b, i) => {
      if (i === 0) {
        b.status = 'RESERVED';
        b.processId = 'SYSTEM_KERNEL';
        b.allocatedAt = new Date();
      } else {
        b.status = 'FREE';
        b.processId = null;
        b.allocatedAt = null;
      }
    });
  }
}

module.exports = MemoryManager;
