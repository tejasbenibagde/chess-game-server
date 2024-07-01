// server.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { handleConnection } = require("./controllers/gameController");
require("dotenv").config();

// Basic setup
const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "https://king-gambit.netlify.app",
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOptions));

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.static("public"));

io.on("connection", (socket) => handleConnection(socket, io));

const PORT = process.env.PORT || 7777;
server.listen(PORT, () => {
  console.log(`Listening on *:${PORT}`);
});
