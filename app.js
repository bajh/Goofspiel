var  app = require('express')(),
     http = require('http').Server(app),
     io = require('socket.io')(http),
     unfilled_rooms = [],
     rooms = 0;

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
    console.log(unfilled_rooms);
    closeRoom(socket.rooms[1]);
    console.log(unfilled_rooms);
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
    unfilled_rooms.push(room);
    socket.emit('game message', "Waiting to match you with an opponent");
  } else {
    room = unfilled_rooms.pop();
    socket.join(room);
  }
  return room
};

function beginGame(room) {
  io.to(room).emit('begin game');
};

http.listen(3000, function() {
  console.log('listening on *:3000');
});