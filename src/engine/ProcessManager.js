/**
 * ProcessManager - Manages process lifecycles, states, and process control blocks (PCBs)
 */
class ProcessManager {
  constructor() {
    this.processes = new Map();
    this.nextPid = 1000;
  }

  createProcess({ name, memoryRequired, priority = 5, pageCount = null }) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('Process name is required.');
    }
    const memReq = parseInt(memoryRequired, 10);
    if (isNaN(memReq) || memReq <= 0) {
      throw new Error('Memory required must be greater than zero.');
    }
    const prio = parseInt(priority, 10);
    if (isNaN(prio) || prio < 1 || prio > 10) {
      throw new Error('Priority must be an integer between 1 and 10.');
    }

    const pid = this.nextPid++;
    const computedPages = pageCount ? parseInt(pageCount, 10) : Math.ceil((memReq * 1024) / 4);
    const now = new Date();

    const process = {
      id: `proc-${pid}-${Date.now()}`,
      pid,
      name: name.trim(),
      memoryRequired: memReq,
      memoryAllocated: 0,
      priority: prio,
      state: 'NEW',
      createdAt: now,
      lastAccessed: now,
      swapSize: 0,
      pageCount: computedPages,
      ramPages: 0,
      swapPages: 0,
      ramBlockIndices: [],
      swapBlockIndices: [],
      terminatedAt: null
    };

    this.processes.set(pid, process);
    return process;
  }

  getProcessByPid(pid) {
    const numericPid = parseInt(pid, 10);
    return this.processes.get(numericPid) || null;
  }

  getAllProcesses() {
    return Array.from(this.processes.values());
  }

  getActiveProcesses() {
    return this.getAllProcesses().filter(p => p.state !== 'TERMINATED');
  }

  getResidentProcesses() {
    return this.getAllProcesses().filter(p => 
      ['RUNNING', 'READY', 'WAITING'].includes(p.state) && p.ramPages > 0
    );
  }

  getSwappedProcesses() {
    return this.getAllProcesses().filter(p => 
      ['SWAPPED', 'SWAPPING_IN', 'SWAPPING_OUT'].includes(p.state) || p.swapPages > 0
    );
  }

  updateState(pid, newState, details = {}) {
    const process = this.getProcessByPid(pid);
    if (!process) return null;

    process.state = newState;
    if (details.memoryAllocated !== undefined) process.memoryAllocated = details.memoryAllocated;
    if (details.swapSize !== undefined) process.swapSize = details.swapSize;
    if (details.ramPages !== undefined) process.ramPages = details.ramPages;
    if (details.swapPages !== undefined) process.swapPages = details.swapPages;
    if (details.ramBlockIndices) process.ramBlockIndices = details.ramBlockIndices;
    if (details.swapBlockIndices) process.swapBlockIndices = details.swapBlockIndices;

    if (newState === 'TERMINATED') {
      process.terminatedAt = new Date();
    } else {
      process.lastAccessed = new Date();
    }

    return process;
  }

  touchProcess(pid) {
    const process = this.getProcessByPid(pid);
    if (process && process.state !== 'TERMINATED') {
      process.lastAccessed = new Date();
    }
    return process;
  }

  terminateProcess(pid) {
    const process = this.getProcessByPid(pid);
    if (!process) return null;

    process.state = 'TERMINATED';
    process.memoryAllocated = 0;
    process.swapSize = 0;
    process.ramPages = 0;
    process.swapPages = 0;
    process.ramBlockIndices = [];
    process.swapBlockIndices = [];
    process.terminatedAt = new Date();

    return process;
  }

  clear() {
    this.processes.clear();
    this.nextPid = 1000;
  }
}

module.exports = ProcessManager;
