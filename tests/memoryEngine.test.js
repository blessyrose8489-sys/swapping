const assert = require('assert');
const { test, describe, beforeEach } = require('node:test');

const MemoryManager = require('../src/engine/MemoryManager');
const SwapManager = require('../src/engine/SwapManager');
const ProcessManager = require('../src/engine/ProcessManager');
const PageManager = require('../src/engine/PageManager');
const Scheduler = require('../src/engine/Scheduler');

const LRUAlgorithm = require('../src/engine/algorithms/LRUAlgorithm');
const FIFOAlgorithm = require('../src/engine/algorithms/FIFOAlgorithm');
const PriorityAlgorithm = require('../src/engine/algorithms/PriorityAlgorithm');
const ClockAlgorithm = require('../src/engine/algorithms/ClockAlgorithm');
const OptimalAlgorithm = require('../src/engine/algorithms/OptimalAlgorithm');

describe('SwapOS Memory Management Engine Tests', () => {
  let memoryManager;
  let swapManager;
  let processManager;
  let pageManager;
  let scheduler;

  beforeEach(() => {
    memoryManager = new MemoryManager(4096, 256); // 4GB RAM, 256MB blocks
    swapManager = new SwapManager(8192, 256);   // 8GB Swap, 256MB blocks
    processManager = new ProcessManager();
    pageManager = new PageManager(4);
    scheduler = new Scheduler(null);
    scheduler.updateSettings({ totalRam: 4096, totalSwap: 8192, blockSize: 256, autoSwappingEnabled: false });
    scheduler.reset();
  });

  test('MemoryManager allocates and releases blocks correctly', () => {
    const alloc = memoryManager.allocateBlocksForProcess('proc-1', 1024);
    assert.strictEqual(alloc.success, true);
    assert.strictEqual(alloc.allocatedBlocks, 4);
    assert.strictEqual(memoryManager.getUsedRam(), 1024);

    const rel = memoryManager.releaseProcessBlocks('proc-1');
    assert.strictEqual(rel.releasedCount, 4);
    assert.strictEqual(memoryManager.getUsedRam(), 0);
  });

  test('ProcessManager validates process creation inputs', () => {
    assert.throws(() => {
      processManager.createProcess({ name: '', memoryRequired: 1024 });
    }, /Process name is required/);

    assert.throws(() => {
      processManager.createProcess({ name: 'Test', memoryRequired: -500 });
    }, /Memory required must be greater than zero/);

    const proc = processManager.createProcess({ name: 'ValidProc', memoryRequired: 2048, priority: 8 });
    assert.strictEqual(proc.pid, 1000);
    assert.strictEqual(proc.name, 'ValidProc');
    assert.strictEqual(proc.memoryRequired, 2048);
  });

  test('LRUAlgorithm selects candidate with oldest lastAccessed timestamp', () => {
    const lru = new LRUAlgorithm();
    const now = Date.now();

    const proc1 = { id: 'p1', pid: 1001, state: 'RUNNING', ramPages: 10, lastAccessed: new Date(now - 10000) };
    const proc2 = { id: 'p2', pid: 1002, state: 'RUNNING', ramPages: 10, lastAccessed: new Date(now - 50000) }; // Oldest
    const proc3 = { id: 'p3', pid: 1003, state: 'RUNNING', ramPages: 10, lastAccessed: new Date(now - 2000) };

    const selected = lru.selectSwapOutCandidate([proc1, proc2, proc3], 1024);
    assert.strictEqual(selected.pid, 1002);
  });

  test('FIFOAlgorithm selects candidate with oldest createdAt timestamp', () => {
    const fifo = new FIFOAlgorithm();
    const now = Date.now();

    const proc1 = { id: 'p1', pid: 1001, state: 'RUNNING', ramPages: 10, createdAt: new Date(now - 5000) };
    const proc2 = { id: 'p2', pid: 1002, state: 'RUNNING', ramPages: 10, createdAt: new Date(now - 20000) }; // Oldest
    const proc3 = { id: 'p3', pid: 1003, state: 'RUNNING', ramPages: 10, createdAt: new Date(now - 1000) };

    const selected = fifo.selectSwapOutCandidate([proc1, proc2, proc3], 1024);
    assert.strictEqual(selected.pid, 1002);
  });

  test('PriorityAlgorithm selects process with lowest priority', () => {
    const prio = new PriorityAlgorithm();

    const proc1 = { id: 'p1', pid: 1001, priority: 8, state: 'RUNNING', ramPages: 10, lastAccessed: new Date() };
    const proc2 = { id: 'p2', pid: 1002, priority: 2, state: 'RUNNING', ramPages: 10, lastAccessed: new Date() }; // Lowest priority
    const proc3 = { id: 'p3', pid: 1003, priority: 5, state: 'RUNNING', ramPages: 10, lastAccessed: new Date() };

    const selected = prio.selectSwapOutCandidate([proc1, proc2, proc3], 1024);
    assert.strictEqual(selected.pid, 1002);
  });

  test('ClockAlgorithm replaces page using second chance reference bits', () => {
    const clock = new ClockAlgorithm();
    const pages = [
      { pageId: 'p-0', refBit: 1 },
      { pageId: 'p-1', refBit: 0 }, // Chosen
      { pageId: 'p-2', refBit: 1 }
    ];
    const selected = clock.selectPageReplacementCandidates(pages, 1);
    assert.strictEqual(selected.length, 1);
    assert.strictEqual(selected[0].pageId, 'p-1');
  });

  test('Scheduler performs complete Swap-Out and Swap-In cycle', () => {
    const proc = scheduler.createAndAllocateProcess({ name: 'CycleProc', memoryRequired: 1024, priority: 5 });
    assert.strictEqual(proc.state, 'RUNNING');
    assert.strictEqual(scheduler.memoryManager.getUsedRam() > 0, true);

    const swapOutRes = scheduler.swapOutProcess(proc.pid);
    assert.strictEqual(swapOutRes.success, true);
    assert.strictEqual(proc.state, 'SWAPPED');
    assert.strictEqual(scheduler.swapManager.getUsedSwap(), 1024);

    const swapInRes = scheduler.swapInProcess(proc.pid);
    assert.strictEqual(swapInRes.success, true);
    assert.strictEqual(proc.state, 'RUNNING');
    assert.strictEqual(scheduler.swapManager.getUsedSwap(), 0);
  });

  test('Edge Case: Process larger than total RAM puts process in WAITING or Swap', () => {
    const hugeProc = scheduler.createAndAllocateProcess({ name: 'HugeProc', memoryRequired: 100000, priority: 1 });
    assert.strictEqual(hugeProc.state === 'WAITING' || hugeProc.state === 'NEW', true);
  });

  test('Edge Case: Terminating process releases both RAM and Swap resources', () => {
    const proc = scheduler.createAndAllocateProcess({ name: 'TermProc', memoryRequired: 1024, priority: 5 });
    scheduler.swapOutProcess(proc.pid);
    assert.strictEqual(proc.state, 'SWAPPED');

    const termRes = scheduler.terminateProcess(proc.pid);
    assert.strictEqual(termRes.success, true);
    assert.strictEqual(proc.state, 'TERMINATED');
    assert.strictEqual(scheduler.memoryManager.getUsedRam(), 0);
    assert.strictEqual(scheduler.swapManager.getUsedSwap(), 0);
  });
});
