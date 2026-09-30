/**
 * WorkloadGenerator - Dynamic Synthetic Workload Generator for SwapOS
 * Spawns actual processes in the memory management engine and simulates access patterns.
 */
class WorkloadGenerator {
  constructor(scheduler) {
    this.scheduler = scheduler;
    this.isRunning = false;
    this.isPaused = false;
    this.interval = null;
    this.accessInterval = null;

    // Configurable workload parameters
    this.config = {
      spawnRateMs: 3000,
      minMemoryMb: 512,
      maxMemoryMb: 4096,
      minPriority: 1,
      maxPriority: 10,
      maxActiveProcesses: 15,
      processNames: [
        'WebBrowser_Tab', 'Database_Engine', 'Video_Render', 'IDE_Compiler',
        'Graphics_Shader', 'Audio_DAW', 'AI_Model_Inference', 'Game_Engine',
        'VirtualMachine_Guest', 'Search_Indexer', 'Backup_Daemon', 'Crypto_Node'
      ]
    };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    if (this.isRunning && !this.isPaused) {
      this.start();
    }
  }

  start() {
    this.stop();
    this.isRunning = true;
    this.isPaused = false;

    // 1. Process Spawner Timer
    this.interval = setInterval(() => {
      if (this.isPaused) return;

      const activeProcesses = this.scheduler.processManager.getActiveProcesses();
      if (activeProcesses.length >= this.config.maxActiveProcesses) {
        // Occasionally terminate an older process to simulate process lifecycle
        if (Math.random() > 0.6) {
          const oldest = activeProcesses.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
          if (oldest) {
            this.scheduler.terminateProcess(oldest.pid);
          }
        }
        return;
      }

      // Generate random process properties
      const randomName = `${this.config.processNames[Math.floor(Math.random() * this.config.processNames.length)]}_${Math.floor(Math.random() * 900 + 100)}`;
      const step = 256;
      const memMinBlocks = Math.ceil(this.config.minMemoryMb / step);
      const memMaxBlocks = Math.floor(this.config.maxMemoryMb / step);
      const randomBlocks = Math.floor(Math.random() * (memMaxBlocks - memMinBlocks + 1)) + memMinBlocks;
      const memoryRequired = randomBlocks * step;

      const priority = Math.floor(Math.random() * (this.config.maxPriority - this.config.minPriority + 1)) + this.config.minPriority;

      this.scheduler.createAndAllocateProcess({
        name: randomName,
        memoryRequired,
        priority
      });
    }, this.config.spawnRateMs);

    // 2. Process Memory Access Simulator (simulates CPU execution cycles)
    this.accessInterval = setInterval(() => {
      if (this.isPaused) return;
      const activeProcesses = this.scheduler.processManager.getActiveProcesses();
      if (activeProcesses.length > 0) {
        const proc = activeProcesses[Math.floor(Math.random() * activeProcesses.length)];
        this.scheduler.accessProcessMemory(proc.pid);
      }
    }, 1200);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    if (this.interval) clearInterval(this.interval);
    if (this.accessInterval) clearInterval(this.accessInterval);
    this.interval = null;
    this.accessInterval = null;
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      config: this.config
    };
  }
}

module.exports = WorkloadGenerator;
