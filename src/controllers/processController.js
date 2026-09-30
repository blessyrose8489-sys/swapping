/**
 * Process Controller - Handles process REST API endpoints
 */
function createProcessController(scheduler, workloadGenerator) {
  return {
    getAllProcesses: (req, res) => {
      try {
        const processes = scheduler.processManager.getAllProcesses();
        return res.json({ success: true, count: processes.length, data: processes });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    getProcessByPid: (req, res) => {
      try {
        const { pid } = req.params;
        const process = scheduler.processManager.getProcessByPid(pid);
        if (!process) {
          return res.status(404).json({ success: false, error: 'Process not found' });
        }
        const pages = scheduler.pageManager.getProcessPages(process.id);
        return res.json({ success: true, data: { ...process, pages } });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    createProcess: (req, res) => {
      try {
        const { processName, memoryRequired, priority, pageCount } = req.body;
        if (!processName || !memoryRequired) {
          return res.status(400).json({
            success: false,
            error: 'Validation Error: processName and memoryRequired are required.'
          });
        }
        const memReq = parseInt(memoryRequired, 10);
        if (isNaN(memReq) || memReq <= 0) {
          return res.status(400).json({
            success: false,
            error: 'Validation Error: Memory required must be greater than zero.'
          });
        }

        const proc = scheduler.createAndAllocateProcess({
          name: processName,
          memoryRequired: memReq,
          priority: priority || 5,
          pageCount: pageCount || null
        });

        return res.status(201).json({ success: true, message: 'Process created successfully', data: proc });
      } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
      }
    },

    terminateProcess: (req, res) => {
      try {
        const { pid } = req.params;
        const result = scheduler.terminateProcess(pid);
        if (!result.success) {
          return res.status(400).json(result);
        }
        return res.json({ success: true, message: `Process ${pid} terminated successfully`, data: result.process });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    accessProcessMemory: (req, res) => {
      try {
        const { pid } = req.params;
        const proc = scheduler.accessProcessMemory(pid);
        if (!proc) {
          return res.status(404).json({ success: false, error: 'Process not found' });
        }
        return res.json({ success: true, message: `Accessed memory for process PID ${pid}`, data: proc });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    swapOutProcess: (req, res) => {
      try {
        const { pid } = req.params;
        const result = scheduler.swapOutProcess(pid);
        if (!result.success) {
          return res.status(400).json(result);
        }
        return res.json({ success: true, message: `Swapped out PID ${pid}`, data: result.process });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    swapInProcess: (req, res) => {
      try {
        const { pid } = req.params;
        const result = scheduler.swapInProcess(pid);
        if (!result.success) {
          return res.status(400).json(result);
        }
        return res.json({ success: true, message: `Swapped in PID ${pid}`, data: result.process });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }
  };
}

module.exports = createProcessController;
