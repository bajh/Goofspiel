var  app = require('express')(),
     express = require('express'),
     http = require('http').Server(app),
     io = require('socket.io')(http),
     unfilled_rooms = [],
     rooms = 0,
     Game = require('./game.js')
     games = {};

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.set('view options', {layout: false})
app.set("views", __dirname + "/views");

app.get('/', function(req, res){
  res.render('index');
});

io.on('connection', function(socket){

  assignRoom(socket);

  socket.on('card play', function(choice){
    handlePlays(socket, choice);
  });

  socket.on('disconnect', function(){
    closeRoom(socket.room);
  });
});

function closeRoom(room) {
  roomFromQueue = findRoomByNum(room);
  if (roomFromQueue != null) {
    unfilled_rooms.splice(roomFromQueue[1],1);
  }
}

function findRoomByNum(room) {
  found_room = null;
  for (var i = 0; i < unfilled_rooms.length; i++) {
    if (unfilled_rooms[i][0] == room) {
      found_room = i;
    }
  }
  return found_room;
}

function assignRoom(socket) {
  if (unfilled_rooms.length == 0) {
    console.log(unfilled_rooms);
    rooms += 1;
    room = 'room-' + rooms;
    //Not a thing
    channel = socket.join(room);
    socket.room = room
    unfilled_rooms.push([room, socket]);
    console.log(unfilled_rooms)
    socket.emit('game message', "Waiting to match you with an opponent");
  } else {
    console.log(unfilled_rooms);
    room = unfilled_rooms.pop();
    console.log(unfilled_rooms);
    socket.join(room[0]);
    beginGame(room[0], socket, room[1]);
    game.player1.emit('assign suit', "clubs");
    game.player2.emit('assign suit', "spades");
  }
  return room;
};

function beginGame(room, player1, player2) {
  io.to(room).emit('begin game');
  //There should be a better way to structure this than passing in the io object
  games[room] = new Game(io, room, player1, player2);
  game = games[room];
  game.playRound();
}

function findRoomFor(player) {
  return player.rooms[1];
}

//May make the most sense to make this find game for a certain player
function findGameFor(room) {
  return games[room];
}

function handlePlays(player, choice) {
  room = findRoomFor(player);
  game = findGameFor(room);
  game.cardPlayed(player, choice);
}

//Need to change this to use a port assigned in environment
http.listen(3000, function() {
});