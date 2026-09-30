# SwapOS - Real-Time Memory Swapping Management System

**SwapOS** is a fully functional real-time operating system resource management application that simulates and manages process movement between physical memory (RAM) and secondary storage (Swap Space) using actual backend C/C++-inspired application engine logic, dynamic memory allocation, page replacement algorithms, and live WebSocket broadcasts.

---

## Key Features & Highlights

- **100% Dynamic Engine**: Zero hardcoded, fake, or prerecorded values. Every memory block, process state, metric, swap duration, and chart is calculated live from the backend memory management engine.
- **Physical Memory & Page Model**:
  - Configurable RAM (Default 16,384 MB / 16 GB, minimum 512 MB, maximum 1 TB).
  - Configurable Swap Space (Default 32,768 MB / 32 GB, minimum 512 MB, maximum 2 TB).
  - 256 MB Physical Memory Blocks & 4 KB Virtual Pages.
- **Multiple Swapping Algorithms**:
  - **LRU (Least Recently Used)**: Selects process with oldest `lastAccessed` timestamp.
  - **FIFO (First-In First-Out)**: Selects process loaded earliest into RAM.
  - **Priority Based**: Prefers swapping out lower-priority processes first.
  - **Largest Process**: Selects largest process footprint to maximize freed RAM.
  - **Smallest Process**: Selects smallest process to minimize I/O swap write time.
- **Page Replacement Algorithms**:
  - **LRU Page Replacement**
  - **FIFO Page Replacement**
  - **Clock (Second Chance)**
  - **Optimal Simulation (Belady's ideal benchmark)**
- **Interactive UI Visualizers**:
  - **Physical RAM Block Visualizer**: 256MB interactive memory block grid with owner PID, physical address translation, and process inspector.
  - **Swap Storage Block Visualizer**: Secondary storage partition grid.
  - **Live Swap Engine Pipeline**: Step-by-step state transition visualization (`Selecting Candidate`, `Preparing Pages`, `Writing To Swap`, `Releasing RAM`, `Swap Complete`, `Restoring From Swap`).
  - **Algorithm Benchmark Suite**: Interactive benchmark tool running synthetic workloads through FIFO, LRU, Priority, Clock, and Optimal algorithms, plotting comparative charts for page faults, swap operations, wait times, and throughput.
  - **Event Monitor**: Streaming event log with filters, search, and CSV export.
  - **Performance Analytics**: Mathematical formulation cards (`(usedRAM / totalRAM) * 100`, `swapRate`, etc.).

---

## Technology Stack

- **Backend**: Node.js, Express.js, Socket.IO, Prisma ORM, SQLite (`dev.db`), `systeminformation`.
- **Frontend**: React.js (Vite), Tailwind CSS custom dark design system, Recharts, Lucide Icons, Socket.IO Client.
- **Testing**: Node.js test runner (`node --test`).

---

## Quick Start & Installation

### 1. Prerequisites
- Node.js v18+ and npm installed.

### 2. Install Dependencies
```bash
# Install root backend dependencies
npm install

# Install client frontend dependencies
cd client
npm install
cd ..
```

### 3. Setup Environment & Database
```bash
# Copy environment file
cp .env.example .env

# Generate Prisma Client
npx prisma generate
```

### 4. Run Development Servers
```bash
# Run both Backend (Port 5000) and Frontend (Port 3000) concurrently
npm run dev:full
```
Open your browser and navigate to `http://localhost:3000`.

---

## Running Tests

Run the automated unit test suite verifying memory allocation math, process state transitions, LRU/FIFO/Priority selection, and swap execution:
```bash
npm test
```

---

## Verification & Acceptance Flow

1. Open `http://localhost:3000`.
2. Go to **Process Manager** (`/processes`).
3. Create **Process A** (2048 MB), **Process B** (4096 MB), and **Process C** (8192 MB).
4. Observe the RAM Block Grid updating dynamically without page refresh.
5. Click **Start Workload** on the Navbar or Workload Generator to spawn processes until RAM utilization exceeds **85%**.
6. Observe automatic swapping trigger: candidate processes selected via LRU/FIFO are moved to Swap Space, freeing RAM.
7. Click **Swap In** on a swapped process to restore it back to RAM.
8. Navigate to **Algorithm Comparison** (`/algorithms`) and click **Run Benchmark** to view comparative page fault and throughput charts across FIFO, LRU, Priority, Clock, and Optimal algorithms.

---

## Troubleshooting Guide

- **WebSocket Disconnected**: Ensure the backend server is running on port `5000`.
- **Port Conflict**: Modify `PORT` in `.env` if port 5000 is occupied.
- **Permission Errors on System Info**: `systeminformation` falls back gracefully if host OS permissions restrict hardware queries.
