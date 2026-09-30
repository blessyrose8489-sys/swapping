/**
 * EventManager - Event logger and real-time alert broadcaster
 */
class EventManager {
  constructor(maxEvents = 500) {
    this.events = [];
    this.maxEvents = maxEvents;
    this.listeners = [];
  }

  onEvent(callback) {
    this.listeners.push(callback);
  }

  logEvent(type, { processId = null, memorySize = 0, algorithm = 'LRU', duration = 0, status = 'SUCCESS', details = '' } = {}) {
    const event = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      processId,
      memorySize,
      algorithm,
      duration: Number(duration.toFixed(2)),
      status,
      details: typeof details === 'object' ? JSON.stringify(details) : String(details),
      timestamp: new Date().toISOString()
    };

    this.events.unshift(event);
    if (this.events.length > this.maxEvents) {
      this.events.pop();
    }

    // Notify listeners (e.g. Socket.IO dispatcher)
    this.listeners.forEach(cb => cb(event));

    return event;
  }

  getEvents(limit = 100, filterType = null) {
    let result = this.events;
    if (filterType && filterType !== 'ALL') {
      result = result.filter(e => e.type === filterType);
    }
    return result.slice(0, limit);
  }

  clear() {
    this.events = [];
  }
}

module.exports = EventManager;
