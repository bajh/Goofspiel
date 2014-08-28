function shuffle(o) {
  for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

function Game(io, room, player1, player2) {
  console.log('new game created');
  this.io = io;
  this.room = room;
  this.player1 = player1;
  this.player2 = player2;
  player1.playerNum = 1;
  player2.playerNum = 2;
  player1.score = 0;
  player2.score = 0;
  player1.move = false;
  player2.move = false;
  this.prizePile = [];
  this.cards = shuffle([1,2,3,4,5,6,7,8,9,10,11,12,13]);
}

Game.prototype.nextcard = function() {
  return this.cards.pop();
};

Game.prototype.playRound = function() {
  console.log("playing a round");
  this.prizePile.push(this.nextcard());
  console.log(this.prizePile);
  this.io.to(this.room).emit('nextcard', this.prizePile[this.prizePile.length - 1]);
};

Game.prototype.cardPlayed = function(player, choice) {
  player.move = choice;
  player.broadcast.to(this.room).emit('opponent move');
  if (this.player1.move && this.player2.move) {
    this.determineScore(this.player1.move, this.player2.move);
  }
};

Game.prototype.determineScore = function(player1Move, player2Move) {
  this.player1.emit('reveal card', player2Move);
  this.player2.emit('reveal card', player1Move);
  if (player1Move > player2Move) {
    this.player1.score += this.totalPrize;
    //clear the prize pile
    this.prizePile.length = 0;
    this.io.to(this.room).emit('game message', "Player 1 won that round!");
    this.playRound;
  } else if (player2Move > player1Move) {
    this.player2.score += this.totalPrize;
    this.prizePile.length = 0;
    this.io.to(this.room).emit('game message', "Player 2 won that round!");
  } else {
    this.draw();
  }
  this.player1.move = false;
  this.player2.move = false;
};

Game.prototype.totalPrize = function() {
  return this.prizePile.reduce(function(a, b) {
    return a + b
  });
};

Game.prototype.draw = function() {
  this.io.to(this.room).emit('game message', "Draw!");
  this.playRound();
};

module.exports = Game;