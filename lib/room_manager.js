Game = require('./game.js')

function RoomManager(io){
  this.io = io;
  this.unmatchedSockets = [];
  this.rooms = 0;
  this.games = {};
}

RoomManager.prototype.assignRoom = function(socket) {
  if (this.unmatchedSockets.length == 0) {
    this.rooms += 1;
    room = 'room-' + this.rooms;
    channel = socket.join(room);
    socket.room = room;
    this.unmatchedSockets.push(socket);
    socket.emit('game message', "Waiting to match you with an opponent. You may want to ask a friend to play or, to demo the application, open it in another browser window and play against yourself.");
  } else {
    //All sockets are automatically assigned to a universal channel
    //The custom channel they've been assigned to will be the second element in their rooms array
    opponent = this.unmatchedSockets.pop();
    room = opponent.rooms[1];
    socket.join(room);
    this.beginGame(room, opponent, socket);
  }
  return room;
}

RoomManager.prototype.beginGame = function(room, player1, player2) {
  this.io.to(room).emit('begin game');
  //There should be a better way to structure this than passing in the io object...
  this.games[room] = new Game(this.io, room, player1, player2);
  game = this.games[room];
  game.player1.emit('assign suit', 'clubs');
  game.player2.emit('assign suit', 'spades');
  game.playRound();
}

RoomManager.prototype.findGameFor = function(player) {
  room = player.rooms[1];
  return this.games[room];
}

//RoomManager finds the relevant game and redirects the player and choice to it
RoomManager.prototype.handlePlays = function(player, choice) {
  game = this.findGameFor(player);
  game.cardPlayed(player, choice);
}

RoomManager.prototype.removeClient = function(socket) {
  console.log(socket.rooms[1])
  if (socket.rooms[1]) {
    this.io.to(socket.rooms[1]).emit('game message', "Your opponent has signed off");
  } else {
    removeClientFromQueue(socket);
  }
}

RoomManager.prototype.removeClientFromQueue = function(socket) {
  clientIndex = this.findQueuedClientIndex(socket);
  if (clientIndex != null) {
  //Socket.io deletes rooms that have no connections, so we only have to remove the client from the queue
    this.unmatchedSockets.splice(this.unmatchedSockets[clientIndex],1);
  }
}

RoomManager.prototype.findQueuedClientIndex = function(socket) {
  clientIndex = null;
  for (var i = 0; i < this.unmatchedSockets.length; i++) {
    if (this.unmatchedSockets[i] == socket) {
      clientIndex = i;
      break;
    }
  }
  return clientIndex
}

module.exports = RoomManager;