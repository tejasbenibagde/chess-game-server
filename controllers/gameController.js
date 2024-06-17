const {
  addWaitingUser,
  assignRoom,
  findRoomBySocketId,
  handleDisconnection,
} = require("../utils/roomManager");

function handleConnection(socket, io) {
  addWaitingUser(socket);

  if (!assignRoom(io)) {
    socket.emit("waitingForOpponent", {
      message: "Waiting for an opponent to join...",
    });
  } else {
    // console.log("User connected:", socket.id);
  }

  socket.on("move", (move) => handleMove(socket, move, io));
  socket.on("chatMessage", (message) => handleChatMessage(socket, message, io));
  socket.on("resign", (playerRole) => handleResign(socket, playerRole, io));
  socket.on("offerDraw", (playerRole) =>
    handleOfferDraw(socket, playerRole, io)
  );
  socket.on("drawAccept", (currentPlayer) =>
    handleDrawAccept(socket, currentPlayer, io)
  );
  socket.on("drawDecline", () => handleDrawDecline(socket, io));
  socket.on("disconnect", () => handleDisconnection(socket, io));
}

function handleMove(socket, move, io) {
  const roomName = findRoomBySocketId(socket.id);
  if (roomName) {
    socket.to(roomName).emit("move", move);
  } else {
    // console.log("No room found for move:", move);
  }
}

function handleChatMessage(socket, message, io) {
  const roomName = findRoomBySocketId(socket.id);
  if (roomName) {
    socket.to(roomName).emit("chatMessage", message);
  }
}

function handleResign(socket, playerRole, io) {
  const roomName = findRoomBySocketId(socket.id);
  if (roomName) {
    // console.log(playerRole, "resigned");
    let winner = playerRole === "w" ? "b" : "w";
    io.to(roomName).emit("gameOver", { winner });
  }
}

function handleOfferDraw(socket, playerRole, io) {
  const roomName = findRoomBySocketId(socket.id);
  if (roomName) {
    const opponentRole = playerRole === "w" ? "b" : "w";
    io.to(roomName).emit("offerDraw", { opponentRole });
  }
}

function handleDrawAccept(socket, currentPlayer, io) {
  const roomName = findRoomBySocketId(socket.id);
  if (roomName) {
    io.to(roomName).emit("gameOver", { draw: true });
    // console.log("Draw accepted by", currentPlayer === "w" ? "White" : "Black");
  }
}

function handleDrawDecline(socket, io) {
  const roomName = findRoomBySocketId(socket.id);
  if (roomName) {
    // console.log("Draw declined");
    io.to(roomName).emit("drawDeclined");
  }
}

module.exports = { handleConnection };
