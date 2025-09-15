const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const apiRoutes = require('./routes/api');
const { initializeSimulation, simulateMovement } = require('./services/trainSimulator');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allows all origins, adjust for production
  }
});

const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON requests.
app.use(express.json());

// Main API routes.
app.use('/api', apiRoutes);

// Connect to Redis (used for caching or message queues in a more complex setup).
const redisClient = createClient();
redisClient.on('error', (err) => console.log('Redis Client Error', err));

async function main() {
  await redisClient.connect();
  console.log('Connected to Redis!');

  // Start the train simulation logic.
  await initializeSimulation();
  // Update train positions every 5 seconds and broadcast via WebSockets.
  setInterval(() => {
    simulateMovement(io);
  }, 5000);

  // WebSocket connection handler.
  io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);
    
    // You can send initial data to a new client here if needed.
    
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  // Start the HTTP server.
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

main();