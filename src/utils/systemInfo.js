const si = require('systeminformation');

/**
 * Reads host OS memory statistics safely with fallbacks
 */
async function getHostMemoryStats() {
  try {
    const mem = await si.mem();
    return {
      success: true,
      totalRamMb: Math.round(mem.total / (1024 * 1024)),
      usedRamMb: Math.round(mem.active / (1024 * 1024)),
      freeRamMb: Math.round(mem.free / (1024 * 1024)),
      availableRamMb: Math.round(mem.available / (1024 * 1024)),
      totalSwapMb: Math.round(mem.swaptotal / (1024 * 1024)),
      usedSwapMb: Math.round(mem.swapused / (1024 * 1024)),
      freeSwapMb: Math.round(mem.swapfree / (1024 * 1024)),
      ramUtilizationPercent: Number(((mem.active / mem.total) * 100).toFixed(2)),
      swapUtilizationPercent: mem.swaptotal > 0 ? Number(((mem.swapused / mem.swaptotal) * 100).toFixed(2)) : 0
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      totalRamMb: 16384,
      usedRamMb: 4096,
      freeRamMb: 12288,
      totalSwapMb: 32768,
      usedSwapMb: 0,
      freeSwapMb: 32768,
      ramUtilizationPercent: 25,
      swapUtilizationPercent: 0
    };
  }
}

module.exports = { getHostMemoryStats };
