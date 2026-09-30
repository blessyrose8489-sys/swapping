import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const SwapOSContext = createContext();

export function SwapOSProvider({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [socketConnected, setSocketConnected] = useState(false);
  
  // Real-time System State
  const [systemState, setSystemState] = useState({
    settings: {
      totalRam: 16384,
      totalSwap: 32768,
      blockSize: 256,
      pageSizeKb: 4,
      warningThreshold: 75,
      criticalThreshold: 90,
      autoSwapThreshold: 85,
      autoSwappingEnabled: true,
      swapAlgorithm: 'LRU',
      pageReplacementAlgo: 'LRU',
      tickIntervalMs: 1000,
      isPaused: false
    },
    metrics: {
      totalRamMb: 16384,
      usedRamMb: 0,
      freeRamMb: 16384,
      ramUtilization: 0,
      totalSwapMb: 32768,
      usedSwapMb: 0,
      freeSwapMb: 32768,
      swapUtilization: 0,
      activeProcesses: 0,
      swappedProcesses: 0,
      swapOperationsTotal: 0,
      averageSwapDurationMs: 0,
      swapRateOpsPerSec: 0,
      swapThroughputMbPerSec: 0,
      pageFaultRate: 0,
      history: []
    },
    processes: [],
    ramBlocks: [],
    swapBlocks: [],
    recentEvents: []
  });

  const [hostMemory, setHostMemory] = useState(null);
  const [workloadStatus, setWorkloadStatus] = useState({ isRunning: false, isPaused: false });
  const [swapAnimationState, setSwapAnimationState] = useState({ isAnimating: false, stage: 'Idle', pid: null, progress: 0 });
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);

  // Dynamic API Base URL detection
  const getApiUrl = (endpoint) => {
    const isDev = window.location.port === '3000';
    return isDev ? `http://localhost:5000${endpoint}` : endpoint;
  };

  // Socket.IO Setup with robust fallback
  useEffect(() => {
    const socketTarget = window.location.port === '3000' ? 'http://localhost:5000' : window.location.origin;
    
    const socket = io(socketTarget, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      setSocketConnected(true);
      console.log('[Socket.IO] Connected to backend engine:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.IO] Connection error:', err.message);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
      console.log('[Socket.IO] Disconnected from backend engine');
    });

    socket.on('system:update', (data) => {
      if (data) setSystemState(data);
    });

    socket.on('event:new', (evt) => {
      setSystemState(prev => ({
        ...prev,
        recentEvents: [evt, ...(prev.recentEvents || []).slice(0, 99)]
      }));
    });

    socket.on('alert:memory', (alert) => {
      setActiveAlerts(prev => [alert, ...prev.slice(0, 9)]);
    });

    socket.on('swap:progress', (anim) => {
      setSwapAnimationState({
        isAnimating: true,
        stage: anim.stage,
        pid: anim.pid,
        progress: anim.progress
      });
    });

    socket.on('swap:complete', () => {
      setTimeout(() => {
        setSwapAnimationState({ isAnimating: false, stage: 'Idle', pid: null, progress: 100 });
      }, 800);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Initial Data Fetch
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl('/api/system/status'));
      const json = await res.json();
      if (json.success) setSystemState(json.data);

      const hostRes = await fetch(getApiUrl('/api/system/host-memory'));
      const hostJson = await hostRes.json();
      if (hostJson.success) setHostMemory(hostJson.data);

      const wlRes = await fetch(getApiUrl('/api/workload/status'));
      const wlJson = await wlRes.json();
      if (wlJson.success) setWorkloadStatus(wlJson.data);
    } catch (err) {
      console.error('Fetch status error:', err);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); // Polling fallback sync
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // REST API Trigger Helpers
  const createProcess = async (processData) => {
    const res = await fetch(getApiUrl('/api/processes'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(processData)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    fetchStatus();
    return json.data;
  };

  const terminateProcess = async (pid) => {
    const res = await fetch(getApiUrl(`/api/processes/${pid}`), { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    fetchStatus();
    return json.data;
  };

  const accessMemory = async (pid) => {
    const res = await fetch(getApiUrl(`/api/processes/${pid}/access`), { method: 'POST' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    fetchStatus();
    return json.data;
  };

  const swapOut = async (pid) => {
    const res = await fetch(getApiUrl(`/api/processes/${pid}/swap-out`), { method: 'POST' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    fetchStatus();
    return json.data;
  };

  const swapIn = async (pid) => {
    const res = await fetch(getApiUrl(`/api/processes/${pid}/swap-in`), { method: 'POST' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    fetchStatus();
    return json.data;
  };

  const forceSwapOut = async () => {
    const res = await fetch(getApiUrl('/api/swap/out'), { method: 'POST' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    fetchStatus();
    return json.data;
  };

  const forceSwapIn = async () => {
    const res = await fetch(getApiUrl('/api/swap/in'), { method: 'POST' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    fetchStatus();
    return json.data;
  };

  const resetMemory = async () => {
    const res = await fetch(getApiUrl('/api/memory/reset'), { method: 'POST' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    fetchStatus();
    return json;
  };

  const updateSettings = async (settings) => {
    const res = await fetch(getApiUrl('/api/settings'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    fetchStatus();
    return json.data;
  };

  const controlWorkload = async (action, config = null) => {
    const res = await fetch(getApiUrl('/api/workload/control'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, config })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    setWorkloadStatus(json.data);
    fetchStatus();
    return json.data;
  };

  const runBenchmark = async (processCount = 20) => {
    const res = await fetch(getApiUrl('/api/benchmark/run'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ processCount })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  };

  return (
    <SwapOSContext.Provider value={{
      activeTab,
      setActiveTab,
      socketConnected,
      systemState,
      hostMemory,
      workloadStatus,
      swapAnimationState,
      activeAlerts,
      selectedProcess,
      setSelectedProcess,
      isProcessModalOpen,
      setIsProcessModalOpen,
      createProcess,
      terminateProcess,
      accessMemory,
      swapOut,
      swapIn,
      forceSwapOut,
      forceSwapIn,
      resetMemory,
      updateSettings,
      controlWorkload,
      runBenchmark,
      fetchStatus
    }}>
      {children}
    </SwapOSContext.Provider>
  );
}

export function useSwapOS() {
  const context = useContext(SwapOSContext);
  if (!context) throw new Error('useSwapOS must be used within a SwapOSProvider');
  return context;
}
