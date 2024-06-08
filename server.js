const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { handleConnection } = require("./controllers/gameController");

require("dotenv").config();
// Basic setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://chess-paasta.netlify.app/",
    methods: ["GET", "POST"],
  },
});

app.use(express.static("public"));

io.on("connection", (socket) => handleConnection(socket, io));
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Listening on *:", PORT);
});
