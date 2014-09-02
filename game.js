function shuffle(o) {
  for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

function Game(io, room, player1, player2) {
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

Game.prototype.playRound = function(options) {
  this.prizePile.push(this.nextcard());
  console.log("Prize: " + this.prizePile);
  if (options) {
    options = ' ' + options
  } else {
    options = '';
  }
  this.io.to(this.room).emit('nextcard' + options, this.prizePile[this.prizePile.length - 1]);
};

Game.prototype.cardPlayed = function(player, choice) {
  player.move = parseInt(choice);
  player.broadcast.to(this.room).emit('opponent move');
  if (this.player1.move && this.player2.move) {
    this.determineScore();
  }
};

Game.prototype.determineScore = function() {
  this.player1.emit('reveal card', this.player2.move);
  this.player2.emit('reveal card', this.player1.move);
  self = this;
  if (this.player1.move > this.player2.move) {
    console.log("Player 1 won" + this.totalPrize() + "with " + this.player1.move);
    this.player1.score += this.totalPrize();
    this.player1.emit('game message', "You won " + this.totalPrize() + " points");
    this.player2.emit('game message', "Your opponent won " + this.totalPrize() + " points");
    //clear the prize pile
    this.prizePile.length = 0;
    if (this.cards.length == 0) {
      this.endGame();
    };
    //It doesn't really feel like functions like playRound belong in determineScore
    setTimeout(function(){self.playRound();}, 2000);
  } else if (this.player2.move > this.player1.move) {
    console.log("Player 2 won " + this.totalPrize() + " with " + this.player2.move);
    this.player2.score += this.totalPrize();
    this.player2.emit('game message', "You won " + this.totalPrize() + " points");
    this.player1.emit('game message', "Your opponent won " + this.totalPrize() + " points");
    this.prizePile.length = 0;
    if (this.cards.length == 0) {
      this.endGame();
    };
    setTimeout(function(){self.playRound();}, 2000);
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
  this.player1.move = false;
  this.player2.move = false;
  self = this;
  setTimeout(function(){self.playRound('draw');}, 3000);
};

Game.prototype.endGame = function() {
  if (this.player1.score > this.player2.score) {
    this.player1.emit('game message', "You win!");
    this.player2.emit('game message', "You lose");
  } else if (this.player2.score > this.player1.score) {
    this.player2.emit('game message', "You win!");
    this.player1.emit('game message', "You lose");
  } else {
    this.io.to(this.room).emit('game message', "Tie!");
  }
};

module.exports = Game;