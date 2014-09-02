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
    var rotationMultiplier = -7;
    for (i = 1; i < 14; i++) {
      $card = $('<div>');
      $card.attr('id', function(){ return 'card-' + i });
      $card.addClass("card");
      $('#player-hand').append($card);
      $card.css('left', i * 22);
      $card.css('-webkit-transform','rotate('+ rotationMultiplier * 3 +'deg)');
      $card.css('-moz-transform','rotate('+ rotationMultiplier * 3 +'deg)');
      $card.css('transform','rotate('+ rotationMultiplier * 3 +'deg)');
      rotationMultiplier = rotationMultiplier + 1;
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

  function clearCards(){
    $('#opponent-played-card-back').css('background', '');
    $('#opponent-played-card-front').css('background', '');
    $('#opponent-played-card').css('-webkit-transform', '');
    $('#opponent-played-card-front').css('-webkit-transform', '');
    $('#my-played-card').css('background', '');
  }

  socket.on('game message', function(msg){
    $('#game-message-panel').html('<span>' + msg + '</span>');
  });

  socket.on('begin game', function(){
    $('#game-message-panel').html("<span>Now starting a new game!</span>");
    $('#game-message-panel span').fadeOut(2300, 'swing');
  });

  socket.on('nextcard', function(card){
    for (var i = 0; i < $('.prize-card').length; i++) {
      if (i != 0) {
        $('.prize-card')[i].remove();
      }
    }
    $('.prize-card').empty();
    $('#opponent-played-card').css("left", "200px");
    console.log($('.prize-card'));
    displayCard("diamonds", $('.prize-card').last(), card);
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

  socket.on('nextcard draw', function(card) {
    $nextCard = $('<div>');
    $nextCard.addClass('card');
    $nextCard.addClass('prize-card');
    $nextCard.css('left', ($('.prize-card').length * 11) + 140);
    $('.prize-card').last().after($nextCard);
    $('#opponent-played-card').css("left", "+= 10");
    displayCard("diamonds", $nextCard, card);
    //This is code duplication, and it's not cool!
    $('#player-hand').on('click', '.card', function() {
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
  });

  socket.on('reveal card', function(choice) {
    displayCard(oppSuit, '#opponent-played-card-front', choice);
    $('#opponent-played-card').animate({borderSpacing: -90},
      {step: function(now) {
          $('#opponent-played-card').css('-webkit-transform','rotateY(180deg)');
          $('#opponent-played-card-front').css('-webkit-transform', 'rotateY(-180deg)')
          },
          duration:'slow'
        },
        'linear'
      );
    setTimeout(function(){
      clearCards();
    }, 2000);
  });

});