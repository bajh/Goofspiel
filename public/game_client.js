$(function(){
  var socket = io(),
      mySuit,
      oppSuit;

  $(document).on('click', function(){
    $('#modal').hide();
    $('#lightbox').remove();
  });

  //Want to refactor this and move it into page-behavior
  socket.on('assign suit', function(suit){
    suits = {
      spades: "clubs",
      clubs: "spades"
    }
    layCardDivs();
    mySuit = suit;
    oppSuit = suits[suit];
    for (var i = 1; i < 14; i++) {
      displayCard(suit, '#card-' + i, i);
    }
  });

  function layCardDivs(){
    for (i = 1; i < 14; i++) {
      $card = $('<div>');
      $card.attr('id', function(){ return 'card-' + i });
      $card.addClass("card");
      $('#player-hand').append($card);
    }
  }

  function displayCard(suit, context, val) {
    suitPositions = {
      "clubs": "0",
      "diamonds": "154px",
      "spades": "308px",
      "back": "-154px"
    }
    $card = $(context);
    // $card.css({"left":(val*16)+"px"});
      $card.css("background", function(){
          background = "url('card-faces.svg') ";
          position = (val - 1) * -113;
          //Was getting a problem with the positioning with these values--hopefully will be able to figure out a more unified way to do this later:
          if (val == 5)   { position -= 2 };
          if (val == 6)   { position -= 1 };
          if (val == 7)   { position -= 1 };
          if (val == 12)  { position -= 2 };
          background += position;
          background += "px ";
        background += suitPositions[suit];
        return background;
      });
      $card.css({"background-size": "1469px 616px"});
      $card.data("card-val", val);
  }

  socket.on('game message', function(msg){
    $('#game-message-panel').text(msg);
  });

  socket.on('begin game', function(){
    $('#game-message-panel').text("Game now beginning!");
  });

  socket.on('nextcard', function(card){
    $('#prize-card').empty();
    displayCard("diamonds", $('#prize-card'), card);
    $('#my-played-card').text('');
    $('#player-hand').on('click', '.card', function(){
      cardValue = $(this).data('card-val');
      socket.emit('card play', cardValue);
      //It would be ideal to require confirmation from the server that the card was submitted before showing it on the client-side
      displayCard(mySuit, '#my-played-card', cardValue);
      $(this).remove();
      $('#player-hand').off();
    });
  });

  socket.on('opponent move', function() {
    displayCard('back', '#opponent-played-card-back', 1)
    // $('#opponent-played-card').background("url('card-back.svg')").css({"background-size": "1154px 114px"});
  });

  socket.on('reveal card', function(choice) {
    displayCard(oppSuit, '#opponent-played-card-front', choice);
    $('#opponent-played-card').animate({borderSpacing: -90},
      {step: function(now){
          $('#opponent-played-card').css('-webkit-transform','rotateY(180deg)');
          $('#opponent-played-card-front').css('-webkit-transform', 'rotateY(-180deg)')
          },
          duration:'slow'
        },
        'linear'
      );
  });

});