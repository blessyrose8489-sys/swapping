const { getHostMemoryStats } = require('../utils/systemInfo');

/**
 * System Controller - Handles system metrics, status, settings, and host stats
 */
function createSystemController(scheduler, workloadGenerator) {
  return {
    getSystemStatus: (req, res) => {
      try {
        const status = scheduler.getSystemStatus();
        return res.json({ success: true, data: status });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    getSystemMetrics: (req, res) => {
      try {
        const active = scheduler.processManager.getActiveProcesses().length;
        const swapped = scheduler.processManager.getSwappedProcesses().length;
        const metrics = scheduler.metricsManager.getMetrics(
          scheduler.memoryManager,
          scheduler.swapManager,
          active,
          swapped
        );
        return res.json({ success: true, data: metrics });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    getEvents: (req, res) => {
      try {
        const { limit, type } = req.query;
        const events = scheduler.eventManager.getEvents(limit ? parseInt(limit, 10) : 100, type);
        return res.json({ success: true, count: events.length, data: events });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    getHostMemory: async (req, res) => {
      try {
        const stats = await getHostMemoryStats();
        return res.json({ success: true, data: stats });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    getSettings: (req, res) => {
      try {
        const status = scheduler.getSystemStatus();
        return res.json({ success: true, data: status.settings });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    },

    updateSettings: (req, res) => {
      try {
        const newSettings = req.body;
        scheduler.updateSettings(newSettings);
        return res.json({
          success: true,
          message: 'System settings updated successfully',
          data: scheduler.getSystemStatus().settings
        });
      } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
      }
    },

    getWorkloadStatus: (req, res) => {
      return res.json({ success: true, data: workloadGenerator.getStatus() });
    },

    controlWorkload: (req, res) => {
      try {
        const { action, config } = req.body; // 'start', 'pause', 'resume', 'stop', 'reset'
        if (config) workloadGenerator.updateConfig(config);

        if (action === 'start') workloadGenerator.start();
        else if (action === 'pause') workloadGenerator.pause();
        else if (action === 'resume') workloadGenerator.resume();
        else if (action === 'stop') workloadGenerator.stop();
        else if (action === 'reset') {
          workloadGenerator.stop();
          scheduler.reset();
        }

        return res.json({ success: true, message: `Workload action '${action}' executed`, data: workloadGenerator.getStatus() });
      } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
      }
    }
  };
}

module.exports = createSystemController;
