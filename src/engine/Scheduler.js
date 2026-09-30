const MemoryManager = require('./MemoryManager');
const SwapManager = require('./SwapManager');
const ProcessManager = require('./ProcessManager');
const PageManager = require('./PageManager');
const EventManager = require('./EventManager');
const MetricsManager = require('./MetricsManager');

const LRUAlgorithm = require('./algorithms/LRUAlgorithm');
const FIFOAlgorithm = require('./algorithms/FIFOAlgorithm');
const PriorityAlgorithm = require('./algorithms/PriorityAlgorithm');
const LargestProcessAlgorithm = require('./algorithms/LargestProcessAlgorithm');
const SmallestProcessAlgorithm = require('./algorithms/SmallestProcessAlgorithm');
const ClockAlgorithm = require('./algorithms/ClockAlgorithm');
const OptimalAlgorithm = require('./algorithms/OptimalAlgorithm');

class Scheduler {
  constructor(io = null) {
    this.io = io;
    this.memoryManager = new MemoryManager(16384, 256);
    this.swapManager = new SwapManager(32768, 256);
    this.processManager = new ProcessManager();
    this.pageManager = new PageManager(4);
    this.eventManager = new EventManager(500);
    this.metricsManager = new MetricsManager();

    // Algorithms map
    this.algorithms = {
      'LRU': new LRUAlgorithm(),
      'FIFO': new FIFOAlgorithm(),
      'Priority Based': new PriorityAlgorithm(),
      'Priority': new PriorityAlgorithm(),
      'Largest Process': new LargestProcessAlgorithm(),
      'Smallest Process': new SmallestProcessAlgorithm(),
      'Clock': new ClockAlgorithm(),
      'Optimal Simulation': new OptimalAlgorithm()
    };

    this.activeSwapAlgorithmName = 'LRU';
    this.activePageReplacementAlgoName = 'LRU';

    // Settings
    this.warningThreshold = 75;
    this.criticalThreshold = 90;
    this.autoSwapThreshold = 85;
    this.autoSwappingEnabled = true;
    this.tickIntervalMs = 1000;

    this.isPaused = false;
    this.timer = null;

    this.lastAlertState = 'NORMAL';
    this.lastAlertTime = 0;

    // Connect event listener to socket broadcast
    this.eventManager.onEvent((evt) => {
      if (this.io) {
        this.io.emit('event:new', evt);
        if (evt.type === 'MEMORY_WARNING' || evt.type === 'MEMORY_CRITICAL') {
          this.io.emit('alert:memory', evt);
        }
      }
    });

    this.start();
  }

  setSocketServer(io) {
    this.io = io;
  }

  getSwapAlgorithm() {
    return this.algorithms[this.activeSwapAlgorithmName] || this.algorithms['LRU'];
  }

  setSwapAlgorithm(algoName) {
    if (this.algorithms[algoName]) {
      const old = this.activeSwapAlgorithmName;
      this.activeSwapAlgorithmName = algoName;
      this.eventManager.logEvent('ALGORITHM_CHANGED', {
        algorithm: algoName,
        details: `Swap algorithm changed from ${old} to ${algoName}`
      });
      return true;
    }
    return false;
  }

  setPageReplacementAlgorithm(algoName) {
    if (this.algorithms[algoName]) {
      this.activePageReplacementAlgoName = algoName;
      return true;
    }
    return false;
  }

  start() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), this.tickIntervalMs);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  updateSettings(settings) {
    if (settings.totalRam || settings.blockSize) {
      const ram = settings.totalRam || this.memoryManager.totalRam;
      const blk = settings.blockSize || this.memoryManager.blockSize;
      this.memoryManager.configure(ram, blk);
    }
    if (settings.totalSwap || settings.blockSize) {
      const swap = settings.totalSwap || this.swapManager.totalSwap;
      const blk = settings.blockSize || this.swapManager.blockSize;
      this.swapManager.configure(swap, blk);
    }
    if (settings.warningThreshold !== undefined) this.warningThreshold = settings.warningThreshold;
    if (settings.criticalThreshold !== undefined) this.criticalThreshold = settings.criticalThreshold;
    if (settings.autoSwapThreshold !== undefined) this.autoSwapThreshold = settings.autoSwapThreshold;
    if (settings.autoSwappingEnabled !== undefined) this.autoSwappingEnabled = settings.autoSwappingEnabled;
    if (settings.swapAlgorithm) this.setSwapAlgorithm(settings.swapAlgorithm);
    if (settings.pageReplacementAlgo) this.setPageReplacementAlgorithm(settings.pageReplacementAlgo);
    if (settings.tickInterval && settings.tickInterval !== this.tickIntervalMs) {
      this.tickIntervalMs = settings.tickInterval;
      this.start();
    }
  }

  /**
   * Core Process Creation & Allocation Workflow
   */
  createAndAllocateProcess({ name, memoryRequired, priority = 5, pageCount }) {
    const startTime = Date.now();

    // 1. Create Process object
    const proc = this.processManager.createProcess({ name, memoryRequired, priority, pageCount });
    this.eventManager.logEvent('PROCESS_CREATED', {
      processId: proc.id,
      memorySize: proc.memoryRequired,
      details: `Created process ${proc.name} (PID: ${proc.pid}) requiring ${proc.memoryRequired} MB RAM`
    });

    // 2. Initialize Page Table
    this.pageManager.createProcessPages(proc.id, proc.memoryRequired, proc.priority);

    // 3. Attempt Allocation
    const allocResult = this.allocateRamForProcess(proc.pid);

    if (!allocResult.success) {
      // If auto-swapping is enabled, try freeing memory by swapping out candidate processes
      if (this.autoSwappingEnabled) {
        let attempts = 0;
        while (!allocResult.success && attempts < 5) {
          const freed = this.triggerAutoSwapOutCandidate(proc.memoryRequired);
          if (!freed) break;
          const retryAlloc = this.allocateRamForProcess(proc.pid);
          if (retryAlloc.success) {
            allocResult.success = true;
            break;
          }
          attempts++;
        }
      }
    }

    if (!allocResult.success) {
      // Could not fit in RAM, try allocating directly into Swap if space permits
      const swapAlloc = this.swapManager.allocateSwapBlocks(proc.id, proc.memoryRequired);
      if (swapAlloc.success) {
        this.pageManager.setPagesLocation(proc.id, 'SWAP', swapAlloc.assignedBlockIndices);
        this.processManager.updateState(proc.pid, 'SWAPPED', {
          swapSize: swapAlloc.allocatedMemoryMb,
          swapPages: proc.pageCount,
          ramPages: 0,
          swapBlockIndices: swapAlloc.assignedBlockIndices
        });

        this.eventManager.logEvent('SWAP_COMPLETED', {
          processId: proc.id,
          memorySize: proc.memoryRequired,
          algorithm: this.activeSwapAlgorithmName,
          duration: Date.now() - startTime,
          status: 'SUCCESS',
          details: `Process ${proc.name} allocated directly into Swap due to constrained RAM.`
        });
      } else {
        // Insufficient RAM and Swap!
        this.processManager.updateState(proc.pid, 'WAITING');
        this.eventManager.logEvent('MEMORY_CRITICAL', {
          processId: proc.id,
          memorySize: proc.memoryRequired,
          status: 'FAILED',
          details: `Failed to allocate RAM or Swap for process ${proc.name}. Process placed in WAITING state.`
        });
      }
    }

    this.broadcastState();
    return this.processManager.getProcessByPid(proc.pid);
  }

  allocateRamForProcess(pid) {
    const proc = this.processManager.getProcessByPid(pid);
    if (!proc) return { success: false, message: 'Process not found' };

    const ramAlloc = this.memoryManager.allocateBlocksForProcess(proc.id, proc.memoryRequired);
    if (ramAlloc.success) {
      this.pageManager.setPagesLocation(proc.id, 'RAM', ramAlloc.assignedBlockIndices);
      this.processManager.updateState(proc.pid, 'RUNNING', {
        memoryAllocated: ramAlloc.allocatedMemoryMb,
        ramPages: proc.pageCount,
        swapPages: 0,
        ramBlockIndices: ramAlloc.assignedBlockIndices
      });

      this.eventManager.logEvent('MEMORY_ALLOCATED', {
        processId: proc.id,
        memorySize: ramAlloc.allocatedMemoryMb,
        status: 'SUCCESS',
        details: `Allocated ${ramAlloc.allocatedBlocks} RAM blocks (${ramAlloc.allocatedMemoryMb} MB) to process ${proc.name} (PID: ${proc.pid}).`
      });
      return { success: true };
    }
    return ramAlloc;
  }

  /**
   * SWAP OUT Process
   */
  swapOutProcess(pid) {
    const startTime = Date.now();
    const proc = this.processManager.getProcessByPid(pid);
    if (!proc || proc.state === 'TERMINATED') {
      return { success: false, message: 'Invalid process for swap-out' };
    }

    if (proc.state === 'SWAPPED' || proc.swapPages >= proc.pageCount) {
      return { success: false, message: 'Process is already swapped out' };
    }

    this.eventManager.logEvent('SWAP_STARTED', {
      processId: proc.id,
      memorySize: proc.memoryRequired,
      algorithm: this.activeSwapAlgorithmName,
      details: `Initiated Swap-Out for process ${proc.name} (PID: ${proc.pid}) using ${this.activeSwapAlgorithmName} algorithm.`
    });

    this.processManager.updateState(proc.pid, 'SWAPPING_OUT');
    if (this.io) this.io.emit('swap:progress', { pid: proc.pid, stage: 'Selecting Candidate', progress: 25 });

    // 1. Allocate Swap blocks
    const swapAlloc = this.swapManager.allocateSwapBlocks(proc.id, proc.memoryRequired);
    if (!swapAlloc.success) {
      this.processManager.updateState(proc.pid, 'RUNNING'); // revert
      this.eventManager.logEvent('SWAP_COMPLETED', {
        processId: proc.id,
        memorySize: proc.memoryRequired,
        algorithm: this.activeSwapAlgorithmName,
        duration: Date.now() - startTime,
        status: 'FAILED',
        details: `Swap-Out failed for process ${proc.name}: ${swapAlloc.message}`
      });
      return { success: false, message: swapAlloc.message };
    }

    if (this.io) this.io.emit('swap:progress', { pid: proc.pid, stage: 'Writing To Swap', progress: 65 });

    // 2. Release RAM blocks
    const ramRelease = this.memoryManager.releaseProcessBlocks(proc.id);

    // 3. Update Page Table location
    this.pageManager.setPagesLocation(proc.id, 'SWAP', swapAlloc.assignedBlockIndices);

    // 4. Update Process state
    this.processManager.updateState(proc.pid, 'SWAPPED', {
      memoryAllocated: 0,
      swapSize: swapAlloc.allocatedMemoryMb,
      ramPages: 0,
      swapPages: proc.pageCount,
      ramBlockIndices: [],
      swapBlockIndices: swapAlloc.assignedBlockIndices
    });

    const duration = Date.now() - startTime;
    this.metricsManager.recordSwapOperation('SWAP_OUT', proc.memoryRequired, duration);

    this.eventManager.logEvent('SWAP_COMPLETED', {
      processId: proc.id,
      memorySize: proc.memoryRequired,
      algorithm: this.activeSwapAlgorithmName,
      duration,
      status: 'SUCCESS',
      details: `Successfully swapped out process ${proc.name} (PID: ${proc.pid}) to Swap space (${swapAlloc.allocatedMemoryMb} MB freed in RAM).`
    });

    this.eventManager.logEvent('PAGE_OUT', {
      processId: proc.id,
      memorySize: proc.memoryRequired,
      algorithm: this.activePageReplacementAlgoName,
      duration,
      status: 'SUCCESS',
      details: `Moved ${proc.pageCount} pages of process ${proc.name} from RAM to Swap.`
    });

    if (this.io) this.io.emit('swap:complete', { pid: proc.pid, state: 'SWAPPED' });
    this.broadcastState();

    return { success: true, process: proc };
  }

  /**
   * SWAP IN Process
   */
  swapInProcess(pid) {
    const startTime = Date.now();
    const proc = this.processManager.getProcessByPid(pid);
    if (!proc || proc.state === 'TERMINATED') {
      return { success: false, message: 'Invalid process for swap-in' };
    }

    if (proc.state === 'RUNNING' && proc.ramPages >= proc.pageCount) {
      return { success: false, message: 'Process is already resident in RAM' };
    }

    this.eventManager.logEvent('SWAP_STARTED', {
      processId: proc.id,
      memorySize: proc.memoryRequired,
      algorithm: this.activeSwapAlgorithmName,
      details: `Initiated Swap-In for process ${proc.name} (PID: ${proc.pid}) into RAM.`
    });

    this.processManager.updateState(proc.pid, 'SWAPPING_IN');
    if (this.io) this.io.emit('swap:progress', { pid: proc.pid, stage: 'Preparing Pages', progress: 30 });

    // 1. Check RAM availability; swap out other processes if RAM is constrained
    let ramAlloc = this.memoryManager.allocateBlocksForProcess(proc.id, proc.memoryRequired);
    if (!ramAlloc.success) {
      let attempts = 0;
      while (!ramAlloc.success && attempts < 5) {
        const freed = this.triggerAutoSwapOutCandidate(proc.memoryRequired);
        if (!freed) break;
        ramAlloc = this.memoryManager.allocateBlocksForProcess(proc.id, proc.memoryRequired);
        if (ramAlloc.success) break;
        attempts++;
      }
    }

    if (!ramAlloc.success) {
      this.processManager.updateState(proc.pid, 'SWAPPED'); // revert
      this.eventManager.logEvent('SWAP_COMPLETED', {
        processId: proc.id,
        memorySize: proc.memoryRequired,
        algorithm: this.activeSwapAlgorithmName,
        duration: Date.now() - startTime,
        status: 'FAILED',
        details: `Swap-In failed for process ${proc.name}: ${ramAlloc.message}`
      });
      return { success: false, message: ramAlloc.message };
    }

    if (this.io) this.io.emit('swap:progress', { pid: proc.pid, stage: 'Restoring From Swap', progress: 75 });

    // 2. Release Swap blocks
    this.swapManager.releaseProcessSwapBlocks(proc.id);

    // 3. Update Page Table
    this.pageManager.setPagesLocation(proc.id, 'RAM', ramAlloc.assignedBlockIndices);

    // 4. Update Process state
    this.processManager.updateState(proc.pid, 'RUNNING', {
      memoryAllocated: ramAlloc.allocatedMemoryMb,
      swapSize: 0,
      ramPages: proc.pageCount,
      swapPages: 0,
      ramBlockIndices: ramAlloc.assignedBlockIndices,
      swapBlockIndices: []
    });

    const duration = Date.now() - startTime;
    this.metricsManager.recordSwapOperation('SWAP_IN', proc.memoryRequired, duration);

    this.eventManager.logEvent('SWAP_COMPLETED', {
      processId: proc.id,
      memorySize: proc.memoryRequired,
      algorithm: this.activeSwapAlgorithmName,
      duration,
      status: 'SUCCESS',
      details: `Successfully restored process ${proc.name} (PID: ${proc.pid}) back into RAM.`
    });

    this.eventManager.logEvent('PAGE_IN', {
      processId: proc.id,
      memorySize: proc.memoryRequired,
      algorithm: this.activePageReplacementAlgoName,
      duration,
      status: 'SUCCESS',
      details: `Restored ${proc.pageCount} pages of process ${proc.name} from Swap to RAM.`
    });

    if (this.io) this.io.emit('swap:complete', { pid: proc.pid, state: 'RUNNING' });
    this.broadcastState();

    return { success: true, process: proc };
  }

  /**
   * Auto Swap-Out Candidate Trigger
   */
  triggerAutoSwapOutCandidate(requiredMemoryMb = 0) {
    const resident = this.processManager.getResidentProcesses();
    if (resident.length === 0) return false;

    const algo = this.getSwapAlgorithm();
    const candidate = algo.selectSwapOutCandidate(resident, requiredMemoryMb);

    if (candidate) {
      const res = this.swapOutProcess(candidate.pid);
      return res.success;
    }
    return false;
  }

  /**
   * Terminate Process
   */
  terminateProcess(pid) {
    const proc = this.processManager.getProcessByPid(pid);
    if (!proc || proc.state === 'TERMINATED') {
      return { success: false, message: 'Process not found or already terminated' };
    }

    const ramRelease = this.memoryManager.releaseProcessBlocks(proc.id);
    const swapRelease = this.swapManager.releaseProcessSwapBlocks(proc.id);
    this.pageManager.deleteProcessPages(proc.id);
    this.processManager.terminateProcess(proc.pid);

    this.eventManager.logEvent('PROCESS_TERMINATED', {
      processId: proc.id,
      memorySize: proc.memoryRequired,
      status: 'SUCCESS',
      details: `Terminated process ${proc.name} (PID: ${proc.pid}). Released ${ramRelease.releasedMb} MB RAM and ${swapRelease.releasedMb} MB Swap.`
    });

    this.broadcastState();
    return { success: true, process: proc };
  }

  /**
   * Simulate Process Memory Access
   */
  accessProcessMemory(pid) {
    const proc = this.processManager.getProcessByPid(pid);
    if (!proc || proc.state === 'TERMINATED') return null;

    if (proc.state === 'SWAPPED') {
      // Page Fault! Process needs to be swapped in
      this.metricsManager.recordPageAccess(false);
      this.swapInProcess(pid);
    } else {
      this.metricsManager.recordPageAccess(true);
      this.processManager.touchProcess(pid);
      this.pageManager.updatePageAccess(proc.id);
    }

    this.broadcastState();
    return proc;
  }

  /**
   * System Tick Loop (1000ms)
   */
  tick() {
    if (this.isPaused) return;

    // 1. Simulate mild access activity on active processes
    const active = this.processManager.getActiveProcesses();
    if (active.length > 0 && Math.random() > 0.4) {
      const randomProc = active[Math.floor(Math.random() * active.length)];
      if (randomProc.state === 'RUNNING' || randomProc.state === 'READY') {
        this.processManager.touchProcess(randomProc.pid);
        this.pageManager.updatePageAccess(randomProc.id);
      }
    }

    // 2. Check RAM pressure
    const ramUtil = this.memoryManager.getUtilizationPercentage();
    const swapUtil = this.swapManager.getUtilizationPercentage();
    const now = Date.now();

    if (ramUtil >= this.criticalThreshold) {
      if (this.lastAlertState !== 'CRITICAL' || (now - (this.lastAlertTime || 0) > 15000)) {
        this.lastAlertState = 'CRITICAL';
        this.lastAlertTime = now;
        this.eventManager.logEvent('MEMORY_CRITICAL', {
          memorySize: this.memoryManager.getUsedRam(),
          status: 'WARNING',
          details: `RAM utilization reached critical level: ${ramUtil}% (Threshold: ${this.criticalThreshold}%)`
        });
      }
    } else if (ramUtil >= this.warningThreshold) {
      if (this.lastAlertState !== 'WARNING' || (now - (this.lastAlertTime || 0) > 15000)) {
        this.lastAlertState = 'WARNING';
        this.lastAlertTime = now;
        this.eventManager.logEvent('MEMORY_WARNING', {
          memorySize: this.memoryManager.getUsedRam(),
          status: 'WARNING',
          details: `RAM utilization exceeds warning threshold: ${ramUtil}% (Threshold: ${this.warningThreshold}%)`
        });
      }
    } else {
      this.lastAlertState = 'NORMAL';
    }

    // 3. Auto-swapping trigger when RAM > autoSwapThreshold
    if (this.autoSwappingEnabled && ramUtil >= this.autoSwapThreshold) {
      this.triggerAutoSwapOutCandidate();
    }

    // 4. Record metrics snapshot
    const residentCount = this.processManager.getResidentProcesses().length;
    const swappedCount = this.processManager.getSwappedProcesses().length;

    const currentMetrics = this.metricsManager.getMetrics(
      this.memoryManager,
      this.swapManager,
      active.length,
      swappedCount
    );

    this.metricsManager.pushHistorySnapshot({
      ramUtilization: ramUtil,
      swapUtilization: swapUtil,
      activeProcesses: active.length,
      swappedProcesses: swappedCount,
      usedRam: this.memoryManager.getUsedRam(),
      usedSwap: this.swapManager.getUsedSwap()
    });

    this.broadcastState();
  }

  getSystemStatus() {
    const active = this.processManager.getActiveProcesses();
    const swapped = this.processManager.getSwappedProcesses();
    const metrics = this.metricsManager.getMetrics(
      this.memoryManager,
      this.swapManager,
      active.length,
      swapped.length
    );

    return {
      settings: {
        totalRam: this.memoryManager.totalRam,
        totalSwap: this.swapManager.totalSwap,
        blockSize: this.memoryManager.blockSize,
        pageSizeKb: this.pageManager.pageSizeKb,
        warningThreshold: this.warningThreshold,
        criticalThreshold: this.criticalThreshold,
        autoSwapThreshold: this.autoSwapThreshold,
        autoSwappingEnabled: this.autoSwappingEnabled,
        swapAlgorithm: this.activeSwapAlgorithmName,
        pageReplacementAlgo: this.activePageReplacementAlgoName,
        tickIntervalMs: this.tickIntervalMs,
        isPaused: this.isPaused
      },
      metrics,
      processes: this.processManager.getAllProcesses(),
      ramBlocks: this.memoryManager.getBlocks(),
      swapBlocks: this.swapManager.getBlocks(),
      recentEvents: this.eventManager.getEvents(50)
    };
  }

  broadcastState() {
    if (this.io) {
      const status = this.getSystemStatus();
      this.io.emit('system:update', status);
      this.io.emit('memory:update', {
        ram: {
          total: this.memoryManager.totalRam,
          used: this.memoryManager.getUsedRam(),
          free: this.memoryManager.getFreeRam(),
          utilization: this.memoryManager.getUtilizationPercentage(),
          blocks: this.memoryManager.getBlocks()
        },
        swap: {
          total: this.swapManager.totalSwap,
          used: this.swapManager.getUsedSwap(),
          free: this.swapManager.getFreeSwap(),
          utilization: this.swapManager.getUtilizationPercentage(),
          blocks: this.swapManager.getBlocks()
        }
      });
      this.io.emit('process:update', status.processes);
    }
  }

  reset() {
    this.memoryManager.reset();
    this.swapManager.reset();
    this.processManager.clear();
    this.pageManager.clear();
    this.eventManager.clear();
    this.metricsManager.reset();
    this.broadcastState();
  }
}

module.exports = Scheduler;
