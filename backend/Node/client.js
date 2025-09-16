// client.js
const { io } = require("socket.io-client");

// Connect to the Socket.IO server
const socket = io("http://localhost:3000", {
  transports: ["websocket"], // use WebSocket only
});

// When connected
socket.on("connect", () => {
  console.log("✅ Connected to server with ID:", socket.id);
});

// When disconnected
socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
});

// Listen for train updates (broadcasted every 5s)
socket.on("trainUpdate", (data) => {
  console.log("🚂 Train update received:", data);
});

// Handle errors
socket.on("connect_error", (err) => {
  console.error("⚠️ Connection error:", err.message);
});
