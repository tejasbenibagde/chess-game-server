
let waitingUsers = [];
let roomCounter = 1;
const rooms = {};

function addWaitingUser(socket) {
  waitingUsers.push(socket);
}

function assignRoom(io) {
  if (waitingUsers.length >= 2) {
    const player1 = waitingUsers.shift();
    const player2 = waitingUsers.shift();

    const roomName = `room${roomCounter++}`;

    player1.join(roomName);
    player2.join(roomName);

    rooms[roomName] = [player1.id, player2.id];

    player1.emit("userrole", { role: "w", room: roomName });
    player2.emit("userrole", { role: "b", room: roomName });

    io.to(roomName).emit("startGame", {
      message: "Game started",
      room: roomName,
    });

    // console.log("Game started in room:", roomName);

    return true;
  }
  return false;
}

function findRoomBySocketId(socketId) {
  for (const room in rooms) {
    if (rooms[room].includes(socketId)) {
      return room;
    }
  }
  return null;
}

function handleDisconnection(socket, io) {
  waitingUsers = waitingUsers.filter((user) => user.id !== socket.id);

  // console.log("user disconnected", socket.id)
  for (const room in rooms) {
    if (rooms[room].includes(socket.id)) {
      rooms[room] = rooms[room].filter((id) => id !== socket.id);

      if (rooms[room].length === 0) {
        delete rooms[room];
        // console.log("Room destroyed:", room);
      }
    }
  }
}

module.exports = {
  addWaitingUser,
  assignRoom,
  findRoomBySocketId,
  handleDisconnection,
};
