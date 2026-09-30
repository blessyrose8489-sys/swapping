/**
 * Socket.IO Handler - Real-time bidirectional WebSocket events
 */
function initSocketHandler(io, scheduler, workloadGenerator) {
  io.on('connection', (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    // Send initial system status upon connection
    socket.emit('system:update', scheduler.getSystemStatus());

    socket.on('process:create', (data) => {
      try {
        const proc = scheduler.createAndAllocateProcess(data);
        socket.emit('action:response', { success: true, action: 'process:create', data: proc });
      } catch (err) {
        socket.emit('action:response', { success: false, action: 'process:create', error: err.message });
      }
    });

    socket.on('process:terminate', (pid) => {
      try {
        const res = scheduler.terminateProcess(pid);
        socket.emit('action:response', { success: true, action: 'process:terminate', data: res.process });
      } catch (err) {
        socket.emit('action:response', { success: false, action: 'process:terminate', error: err.message });
      }
    });

    socket.on('process:access', (pid) => {
      try {
        const proc = scheduler.accessProcessMemory(pid);
        socket.emit('action:response', { success: true, action: 'process:access', data: proc });
      } catch (err) {
        socket.emit('action:response', { success: false, action: 'process:access', error: err.message });
      }
    });

    socket.on('swap:trigger_out', (pid) => {
      try {
        const res = scheduler.swapOutProcess(pid);
        socket.emit('action:response', { success: true, action: 'swap:trigger_out', data: res.process });
      } catch (err) {
        socket.emit('action:response', { success: false, action: 'swap:trigger_out', error: err.message });
      }
    });

    socket.on('swap:trigger_in', (pid) => {
      try {
        const res = scheduler.swapInProcess(pid);
        socket.emit('action:response', { success: true, action: 'swap:trigger_in', data: res.process });
      } catch (err) {
        socket.emit('action:response', { success: false, action: 'swap:trigger_in', error: err.message });
      }
    });

    socket.on('settings:update', (newSettings) => {
      try {
        scheduler.updateSettings(newSettings);
        socket.emit('action:response', { success: true, action: 'settings:update', data: scheduler.getSystemStatus().settings });
      } catch (err) {
        socket.emit('action:response', { success: false, action: 'settings:update', error: err.message });
      }
    });

    socket.on('workload:control', ({ action, config }) => {
      try {
        if (config) workloadGenerator.updateConfig(config);
        if (action === 'start') workloadGenerator.start();
        else if (action === 'pause') workloadGenerator.pause();
        else if (action === 'resume') workloadGenerator.resume();
        else if (action === 'stop') workloadGenerator.stop();
        else if (action === 'reset') {
          workloadGenerator.stop();
          scheduler.reset();
        }
        socket.emit('action:response', { success: true, action: 'workload:control', data: workloadGenerator.getStatus() });
      } catch (err) {
        socket.emit('action:response', { success: false, action: 'workload:control', error: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = initSocketHandler;
