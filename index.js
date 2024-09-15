const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow requests from the frontend
    methods: ["GET", "POST"]
  }
});

app.use(cors());

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", ({ username, room }) => {
    socket.join(room);
    io.to(room).emit("message", { username: "System", text: `${username} has joined the room` });

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
      io.to(room).emit("message", { username: "System", text: `${username} has left the room` });
    });
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
