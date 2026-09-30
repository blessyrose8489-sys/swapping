/**
 * MetricsManager - Calculates and tracks dynamic runtime performance metrics
 */
class MetricsManager {
  constructor() {
    this.startTime = Date.now();
    this.swapInCount = 0;
    this.swapOutCount = 0;
    this.pageInCount = 0;
    this.pageOutCount = 0;
    this.pageFaultCount = 0;
    this.pageHitCount = 0;
    this.totalSwappedMb = 0;
    this.swapDurations = [];
    this.peakRamUtilization = 0;
    this.peakSwapUtilization = 0;
    this.history = [];
    this.maxHistory = 60; // 60 ticks history for charts
  }

  recordSwapOperation(type, memoryMb, durationMs) {
    if (type === 'SWAP_OUT' || type === 'PAGE_OUT') {
      this.swapOutCount++;
      if (type === 'PAGE_OUT') this.pageOutCount++;
    } else if (type === 'SWAP_IN' || type === 'PAGE_IN') {
      this.swapInCount++;
      if (type === 'PAGE_IN') this.pageInCount++;
    }

    this.totalSwappedMb += memoryMb;
    if (durationMs > 0) {
      this.swapDurations.push(durationMs);
      if (this.swapDurations.length > 200) this.swapDurations.shift();
    }
  }

  recordPageAccess(hit = true) {
    if (hit) {
      this.pageHitCount++;
    } else {
      this.pageFaultCount++;
    }
  }

  updatePeakUtilization(ramUtil, swapUtil) {
    if (ramUtil > this.peakRamUtilization) this.peakRamUtilization = ramUtil;
    if (swapUtil > this.peakSwapUtilization) this.peakSwapUtilization = swapUtil;
  }

  pushHistorySnapshot(snapshot) {
    this.history.push({
      timestamp: new Date().toLocaleTimeString(),
      ...snapshot
    });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  getMetrics(memoryManager, swapManager, activeProcessesCount, swappedProcessesCount) {
    const elapsedTimeSec = Math.max(1, (Date.now() - this.startTime) / 1000);
    const totalOps = this.swapInCount + this.swapOutCount;
    const avgDuration = this.swapDurations.length > 0 
      ? this.swapDurations.reduce((a, b) => a + b, 0) / this.swapDurations.length 
      : 0;

    const ramUtil = memoryManager.getUtilizationPercentage();
    const swapUtil = swapManager.getUtilizationPercentage();
    this.updatePeakUtilization(ramUtil, swapUtil);

    const totalAccesses = this.pageHitCount + this.pageFaultCount;
    const pageFaultRate = totalAccesses > 0 ? Number(((this.pageFaultCount / totalAccesses) * 100).toFixed(2)) : 0;

    return {
      totalRamMb: memoryManager.totalRam,
      usedRamMb: memoryManager.getUsedRam(),
      freeRamMb: memoryManager.getFreeRam(),
      ramUtilization: ramUtil,

      totalSwapMb: swapManager.totalSwap,
      usedSwapMb: swapManager.getUsedSwap(),
      freeSwapMb: swapManager.getFreeSwap(),
      swapUtilization: swapUtil,

      activeProcesses: activeProcessesCount,
      swappedProcesses: swappedProcessesCount,

      swapOperationsTotal: totalOps,
      swapInCount: this.swapInCount,
      swapOutCount: this.swapOutCount,
      pageInCount: this.pageInCount,
      pageOutCount: this.pageOutCount,
      pageFaultCount: this.pageFaultCount,
      pageHitCount: this.pageHitCount,
      pageFaultRate,

      averageSwapDurationMs: Number(avgDuration.toFixed(2)),
      peakRamUtilization: Number(this.peakRamUtilization.toFixed(2)),
      peakSwapUtilization: Number(this.peakSwapUtilization.toFixed(2)),

      swapRateOpsPerSec: Number((totalOps / elapsedTimeSec).toFixed(2)),
      swapThroughputMbPerSec: Number((this.totalSwappedMb / elapsedTimeSec).toFixed(2)),
      elapsedTimeSeconds: Math.floor(elapsedTimeSec),
      history: this.history
    };
  }

  reset() {
    this.startTime = Date.now();
    this.swapInCount = 0;
    this.swapOutCount = 0;
    this.pageInCount = 0;
    this.pageOutCount = 0;
    this.pageFaultCount = 0;
    this.pageHitCount = 0;
    this.totalSwappedMb = 0;
    this.swapDurations = [];
    this.peakRamUtilization = 0;
    this.peakSwapUtilization = 0;
    this.history = [];
  }
}

module.exports = MetricsManager;
