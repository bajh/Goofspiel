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

// app.get('/stylesheet.css', function(req, res){
//   res.sendFile(__dirname + '/public/stylesheet.css');
// });


// app.get('/card-faces.svg', function(req, res){
//   res.sendFile(__dirname + '/public/images/card-faces.svg');
// });

io.on('connection', function(socket){

  assignRoom(socket);

  socket.on('card play', function(choice){
    handlePlays(socket, choice);
  });

  socket.on('disconnect', function(){
    closeRoom(findRoomFor(socket));
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

http.listen(3000, function() {
  console.log('listening on *:3000');
});