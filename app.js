var  app = require('express')(),
     http = require('http').Server(app),
     io = require('socket.io')(http),
     unfilled_rooms = [],
     rooms = 0,
     Game = require('./game.js')
     games = {};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/stylesheet.css', function(req, res){
  res.sendFile(__dirname + '/public/stylesheet.css');
});

io.on('connection', function(socket){

  assignRoom(socket);

  socket.on('card play', function(choice){
    console.log(choice);
  });

  socket.on('disconnect', function(){
    closeRoom(socket.rooms[1]);
  });
});

function closeRoom(room) {
  if (unfilled_rooms.indexOf(room) >= 0) {
    unfilled_rooms.splice(unfilled_rooms.indexOf(room),1);
  }
};

function assignRoom(socket) {
  if (unfilled_rooms.length == 0) {
    rooms += 1;
    room = 'room-' + rooms;
    socket.join(room);
    //Doing this so that later on I can know which sockets are in each room--there's probably a better solution
    unfilled_rooms.push([room, socket]);
    socket.emit('game message', "Waiting to match you with an opponent");
  } else {
    room = unfilled_rooms.pop();
    socket.join(room[0]);
    beginGame(room[0], room[1], socket);
  }
  return room;
};

function beginGame(room, player1, player2) {
  io.to(room).emit('begin game');
  //There should be a better way to structure this than passing in the io object
  games[room] = new Game(io, room, player1, player2);
  game = games[room];
  game.play_round();
};

http.listen(3000, function() {
  console.log('listening on *:3000');
});