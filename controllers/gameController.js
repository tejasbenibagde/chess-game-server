const {
  addWaitingUser,
  assignRoom,
  findRoomBySocketId,
  handleDisconnection,
} = require("../utils/roomManager");

function handleConnection(socket, io) {
  console.log("A user connected", socket.id);

  addWaitingUser(socket);

  if (!assignRoom(io)) {
    // Notify the user to wait for an opponent if no room is assigned
    socket.emit("waitingForOpponent", {
      message: "Waiting for an opponent to join...",
    });
  }

  socket.on("move", (move) => handleMove(socket, move, io));
  socket.on("chatMessage", (message) => handleChatMessage(socket, message, io)); // Handle chat messages
  socket.on("disconnect", () => handleDisconnection(socket, io));
}

function handleMove(socket, move, io) {
  console.log("Move received:", move);

  const roomName = findRoomBySocketId(socket.id);
  console.log("Room name:", roomName);

  if (roomName) {
    socket.to(roomName).emit("move", move);
  } else {
    console.log("No room found for move:", move);
  }
}

function handleChatMessage(socket, message, io) {
  const roomName = findRoomBySocketId(socket.id);
  if (roomName) {
    io.to(roomName).emit("chatMessage", message);
  }
}

module.exports = { handleConnection };
