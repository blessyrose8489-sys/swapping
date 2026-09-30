const MemoryManager = require('../engine/MemoryManager');
const SwapManager = require('../engine/SwapManager');
const ProcessManager = require('../engine/ProcessManager');
const PageManager = require('../engine/PageManager');
const EventManager = require('../engine/EventManager');
const MetricsManager = require('../engine/MetricsManager');

const LRUAlgorithm = require('../engine/algorithms/LRUAlgorithm');
const FIFOAlgorithm = require('../engine/algorithms/FIFOAlgorithm');
const PriorityAlgorithm = require('../engine/algorithms/PriorityAlgorithm');
const ClockAlgorithm = require('../engine/algorithms/ClockAlgorithm');
const OptimalAlgorithm = require('../engine/algorithms/OptimalAlgorithm');

function createBenchmarkController() {
  return {
    runAlgorithmBenchmark: (req, res) => {
      try {
        const { processCount = 20, memoryPressureLevel = 'HIGH' } = req.body;

        const algorithmNames = ['FIFO', 'LRU', 'Priority Based', 'Clock', 'Optimal Simulation'];
        const results = [];

        algorithmNames.forEach(algoName => {
          // Create isolated simulation engine for this benchmark run
          const mem = new MemoryManager(8192, 256); // 8GB RAM
          const swap = new SwapManager(16384, 256);  // 16GB Swap
          const pm = new ProcessManager();
          const pgm = new PageManager(4);
          const em = new EventManager();
          const metrics = new MetricsManager();

          let algo;
          if (algoName === 'FIFO') algo = new FIFOAlgorithm();
          else if (algoName === 'LRU') algo = new LRUAlgorithm();
          else if (algoName === 'Priority Based') algo = new PriorityAlgorithm();
          else if (algoName === 'Clock') algo = new ClockAlgorithm();
          else algo = new OptimalAlgorithm();

          const startTime = Date.now();
          let pageFaults = 0;
          let swapOutCount = 0;
          let swapInCount = 0;

          // Generate synthetic workload sequence
          const workloadSequence = [];
          for (let i = 0; i < processCount; i++) {
            const sizeMb = (Math.floor(Math.random() * 8) + 2) * 256; // 512MB to 2048MB
            const priority = Math.floor(Math.random() * 10) + 1;
            workloadSequence.push({ name: `BenchProc_${i + 1}`, sizeMb, priority });
          }

          // Execute allocations and force memory pressure
          workloadSequence.forEach(item => {
            const proc = pm.createProcess({ name: item.name, memoryRequired: item.sizeMb, priority: item.priority });
            pgm.createProcessPages(proc.id, proc.memoryRequired, proc.priority);

            let alloc = mem.allocateBlocksForProcess(proc.id, proc.memoryRequired);
            if (alloc.success) {
              pgm.setPagesLocation(proc.id, 'RAM', alloc.assignedBlockIndices);
              pm.updateState(proc.pid, 'RUNNING', { memoryAllocated: alloc.allocatedMemoryMb, ramPages: proc.pageCount });
            } else {
              // Trigger Swap candidate selection
              let resident = pm.getResidentProcesses();
              let candidatesToSwap = 0;

              while (!alloc.success && resident.length > 0 && candidatesToSwap < 10) {
                const candidate = algo.selectSwapOutCandidate(resident, item.sizeMb);
                if (!candidate) break;

                // Swap out candidate
                const swapAlloc = swap.allocateSwapBlocks(candidate.id, candidate.memoryRequired);
                if (swapAlloc.success) {
                  mem.releaseProcessBlocks(candidate.id);
                  pgm.setPagesLocation(candidate.id, 'SWAP', swapAlloc.assignedBlockIndices);
                  pm.updateState(candidate.pid, 'SWAPPED', { swapSize: swapAlloc.allocatedMemoryMb, swapPages: candidate.pageCount, ramPages: 0 });
                  swapOutCount++;
                }

                resident = pm.getResidentProcesses();
                alloc = mem.allocateBlocksForProcess(proc.id, proc.memoryRequired);
                candidatesToSwap++;
              }

              if (alloc.success) {
                pgm.setPagesLocation(proc.id, 'RAM', alloc.assignedBlockIndices);
                pm.updateState(proc.pid, 'RUNNING', { memoryAllocated: alloc.allocatedMemoryMb, ramPages: proc.pageCount });
              } else {
                // Swap directly
                const directSwap = swap.allocateSwapBlocks(proc.id, proc.memoryRequired);
                if (directSwap.success) {
                  pgm.setPagesLocation(proc.id, 'SWAP', directSwap.assignedBlockIndices);
                  pm.updateState(proc.pid, 'SWAPPED', { swapSize: directSwap.allocatedMemoryMb, swapPages: proc.pageCount, ramPages: 0 });
                  swapOutCount++;
                }
              }
            }
          });

          // Simulate random memory accesses causing Page Faults
          const allProcs = pm.getAllProcesses();
          for (let k = 0; k < 30; k++) {
            const randomProc = allProcs[Math.floor(Math.random() * allProcs.length)];
            if (randomProc.state === 'SWAPPED') {
              pageFaults++;
              // Restore
              const allocRam = mem.allocateBlocksForProcess(randomProc.id, randomProc.memoryRequired);
              if (allocRam.success) {
                swap.releaseProcessSwapBlocks(randomProc.id);
                pgm.setPagesLocation(randomProc.id, 'RAM', allocRam.assignedBlockIndices);
                pm.updateState(randomProc.pid, 'RUNNING', { memoryAllocated: allocRam.allocatedMemoryMb, ramPages: randomProc.pageCount, swapPages: 0 });
                swapInCount++;
              }
            } else {
              pm.touchProcess(randomProc.pid);
            }
          }

          const durationMs = Date.now() - startTime;
          const totalOps = swapOutCount + swapInCount;
          const ramUtil = mem.getUtilizationPercentage();
          const swapUtil = swap.getUtilizationPercentage();
          const throughput = Number(((totalOps * 512) / Math.max(1, durationMs / 1000)).toFixed(2));
          const avgWaitTime = Number((durationMs / Math.max(1, totalOps)).toFixed(2));

          results.push({
            algorithm: algoName,
            pageFaults,
            swapOutCount,
            swapInCount,
            totalSwapOps: totalOps,
            ramUtilization: ramUtil,
            swapUtilization: swapUtil,
            durationMs,
            averageWaitTimeMs: avgWaitTime,
            throughputMbSec: throughput
          });
        });

        return res.json({
          success: true,
          message: 'Benchmark completed successfully',
          workload: { processCount, memoryPressureLevel },
          data: results
        });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }
  };
}

module.exports = createBenchmarkController;
