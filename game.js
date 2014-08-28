function shuffle(o){
  for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

function Game(io, room, player1, player2){
  console.log('new game created');
  this.io = io;
  this.room = room;
  this.player1 = {socket: player1, score: 0};
  this.player2 = {socket: player2, score: 0};
  this.current_player = player1;
  this.cards = shuffle([1,2,3,4,5,6,7,8,9,10,11,12,13]);
}

Game.prototype.nextcard = function(){
  return this.cards.pop();
};

Game.prototype.play_round = function(){
  console.log("playing a round");
  nextcard = this.nextcard();
  this.current_player.emit('your turn');
  this.io.to(this.room).emit('nextcard', nextcard)
}

Game.prototype.determineScore = function(){

}

module.exports = Game;