const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const Scheduler = require('./engine/Scheduler');
const WorkloadGenerator = require('./engine/WorkloadGenerator');
const createApiRouter = require('./routes/api');
const initSocketHandler = require('./websocket/socketHandler');
const { seedInitialProcesses } = require('./utils/seed');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Core Engines
const scheduler = new Scheduler(io);
const workloadGenerator = new WorkloadGenerator(scheduler);

// Seed initial baseline processes
seedInitialProcesses(scheduler);

// API Routes
app.use('/api', createApiRouter(scheduler, workloadGenerator));

// Initialize Socket Events
initSocketHandler(io, scheduler, workloadGenerator);

// Serve static frontend build in production if available
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('SwapOS API Server is running. Frontend dev server runs on http://localhost:3000');
    }
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` SwapOS Backend Engine running on http://localhost:${PORT}`);
  console.log(` WebSocket Server active on ws://localhost:${PORT}`);
  console.log(`=======================================================`);
});

module.exports = { app, server, scheduler, workloadGenerator };
