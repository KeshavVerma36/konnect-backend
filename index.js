const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Define allowed origins
const allowedOrigins = [
  "https://konnect1.vercel.app",
  "https://konnect-app-beta.vercel.app"
];

// Setup Socket.IO with CORS policy
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: allowedOrigins // Use the same allowed origins for Express
}));

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", ({ username, room }) => {
    socket.join(room);
    io.to(room).emit("message", {
      username: "System",
      text: `${username} has joined the room`
    });

    // Handle typing start
    socket.on("typing", ({ username }) => {
      socket.broadcast.to(room).emit("typing", { username });
    });

    // Handle typing stop
    socket.on("stopTyping", ({ username }) => {
      socket.broadcast.to(room).emit("stopTyping", { username });
    });

    socket.on("message", (msg) => {
      io.to(room).emit("message", msg); // Broadcast message to the room
    });

    socket.on("disconnect", () => {
      io.to(room).emit("message", {
        username: "System",
        text: `${username} has left the room`
      });
    });
  });
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
