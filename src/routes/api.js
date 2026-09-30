const express = require('express');
const createProcessController = require('../controllers/processController');
const createMemoryController = require('../controllers/memoryController');
const createSwapController = require('../controllers/swapController');
const createSystemController = require('../controllers/systemController');
const createBenchmarkController = require('../controllers/benchmarkController');

function createApiRouter(scheduler, workloadGenerator) {
  const router = express.Router();

  const processCtrl = createProcessController(scheduler, workloadGenerator);
  const memoryCtrl = createMemoryController(scheduler);
  const swapCtrl = createSwapController(scheduler);
  const systemCtrl = createSystemController(scheduler, workloadGenerator);
  const benchmarkCtrl = createBenchmarkController();

  // Processes
  router.get('/processes', processCtrl.getAllProcesses);
  router.get('/processes/:pid', processCtrl.getProcessByPid);
  router.post('/processes', processCtrl.createProcess);
  router.delete('/processes/:pid', processCtrl.terminateProcess);
  router.post('/processes/:pid/access', processCtrl.accessProcessMemory);
  router.post('/processes/:pid/swap-out', processCtrl.swapOutProcess);
  router.post('/processes/:pid/swap-in', processCtrl.swapInProcess);

  // Memory
  router.get('/memory', memoryCtrl.getMemoryState);
  router.get('/memory/blocks', memoryCtrl.getMemoryBlocks);
  router.post('/memory/reset', memoryCtrl.resetMemory);

  // Swap
  router.get('/swap', swapCtrl.getSwapState);
  router.get('/swap/blocks', swapCtrl.getSwapBlocks);
  router.post('/swap/out', swapCtrl.forceSwapOut);
  router.post('/swap/in', swapCtrl.forceSwapIn);

  // System
  router.get('/system/status', systemCtrl.getSystemStatus);
  router.get('/system/metrics', systemCtrl.getSystemMetrics);
  router.get('/system/events', systemCtrl.getEvents);
  router.get('/system/host-memory', systemCtrl.getHostMemory);

  // Settings
  router.get('/settings', systemCtrl.getSettings);
  router.put('/settings', systemCtrl.updateSettings);

  // Workload Generator
  router.get('/workload/status', systemCtrl.getWorkloadStatus);
  router.post('/workload/control', systemCtrl.controlWorkload);

  // Benchmark
  router.post('/benchmark/run', benchmarkCtrl.runAlgorithmBenchmark);

  return router;
}

module.exports = createApiRouter;
