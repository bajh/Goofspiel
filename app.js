var  app = require('express')(),
     express = require('express'),
     http = require('http').Server(app),
     io = require('socket.io')(http),
     RoomManager = require('./lib/room_manager.js'),
     roomManager = new RoomManager(io);

app.use(express.static(__dirname + '/public'));
//Right now I'm not actually displaying any dynamic content on the index page with ejs.
// But left this in because I may do so later.
app.set('view engine', 'ejs');
app.set('view options', {layout: false})
app.set("views", __dirname + "/views");

app.get('/', function(req, res){
  res.render('index');
});

io.on('connection', function(socket){

  //After user has read the rules, match with opponent and attach event listeners for gameplay
  socket.on('read rules', function(){
    roomManager.assignRoom(socket);

    socket.on('card play', function(choice){
      roomManager.handlePlays(socket, choice);
    });

    socket.on('replay', function(){
      game = roomManager.findGameFor(socket);
      roomManager.beginGame(room, game.player1, game.player2);
    });

    socket.on('disconnect', function(){
      roomManager.removeClientFromQueue(socket);
    });
  });

});

//Need to change this to use a port assigned in environment for heroku deployment
http.listen(3000, function() {
});