// controllers/gameController.js

const {
  addWaitingUser,
  assignRoom,
  findRoomBySocketId,
  handleDisconnection,
  storeUserId,
  getUserIdBySocketId,
  getOpponentUserIdBySocketId,
} = require("../utils/roomManager");

function handleConnection(socket, io) {
  socket.on("userConnected", ({ userId }) => {
    storeUserId(socket.id, userId);
    addWaitingUser(socket);

    console.log("User ", userId, " connected");

    if (!assignRoom(io)) {
      socket.emit("waitingForOpponent", {
        message: "Waiting for an opponent to join...",
      });
    }
  });

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
    const userId = getUserIdBySocketId(socket.id);
    const opponentUserId = getOpponentUserIdBySocketId(socket.id);
    let winner = playerRole === "w" ? "b" : "w";
    console.log(userId, opponentUserId);
    io.to(roomName).emit("gameOver", {
      winner,
      draw: false,
      white_player_id: winner === "w" ? userId : opponentUserId,
      black_player_id: winner === "b" ? userId : opponentUserId,
    });
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
    const userId = getUserIdBySocketId(socket.id);
    const opponentUserId = getOpponentUserIdBySocketId(socket.id);
    io.to(roomName).emit("gameOver", {
      winner: "n",
      draw: true,
      white_player_id: userId,
      black_player_id: opponentUserId,
    });
  }
}

function handleDrawDecline(socket, io) {
  const roomName = findRoomBySocketId(socket.id);
  if (roomName) {
    io.to(roomName).emit("drawDeclined");
  }
}

module.exports = { handleConnection };
