const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

//local modules
const formatMessage = require("./utils/formatMessage.js");
const {
  addPlayer,
  getAllPlayers,
  getPlayer,
  removePlayer,
} = require("./utils/players.js");

const port = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app); // create the HTTP server using the Express app created on the previous line
const io = socketio(server); // connect Socket.IO to the HTTP server

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

//watches for connection events from the client
io.on('connection', socket => {
  console.log('A new player just connected');

  //when a connection is established, connect the plyer to a room
  socket.on('join', ({ playerName, room }, callback) => {
    const { error, newPlayer } = addPlayer({ id: socket.id, playerName, room });

    if (error) return callback(error.message);
    callback(); // The callback can be called without data.

    socket.join(newPlayer.room);

    socket.emit('message', formatMessage('Admin', 'Welcome!'));

    socket.broadcast
      .to(newPlayer.room)
      .emit(
        'message',
        formatMessage('Admin', `${newPlayer.playerName} has joined the game!`)
      );

    // Emit a "room" event to all players to update their Game Info sections
    io.in(newPlayer.room).emit('room', {
      room: newPlayer.room,
      players: getAllPlayers(newPlayer.room),
    });

  });

  //listen for player disconnection and send events to the room
  socket.on("disconnect", () => {
    console.log("A player disconnected.");
  
    const disconnectedPlayer = removePlayer(socket.id);
  
    if (disconnectedPlayer) {
      const { playerName, room } = disconnectedPlayer;
      io.in(room).emit(
        "message",
        formatMessage("Admin", `${playerName} has left!`)
      );
  
      io.in(room).emit("room", {
        room,
        players: getAllPlayers(room),
      });
    }
  });

  //listen for message event by player and update the room chat
  socket.on("sendMessage", (message, callback) => {
    const { error, player } = getPlayer(socket.id);
  
    if (error) return callback(error.message);
  
    if (player) {
      io.to(player.room).emit(
        "message",
        formatMessage(player.playerName, message)
      );
      callback(); // invoke the callback to trigger event acknowledgment
    }
  });
})

//listen for get question event from the client
socket.on("getQuestion", (data, callback) => {
  const { error, player } = getPlayer(socket.id);

  if (error) return callback(error.message);

  if (player) {
    // Pass in a callback function to handle the promise that's returned from the API call
    setGame((game) => {
      // Emit the "question" event to all players in the room
      io.to(player.room).emit("question", {
        playerName: player.playerName,
        ...game.prompt,
      });
    });
  }
});


server.listen(port, () => {
  console.log(`Server is up on port ${port}.`);
})
