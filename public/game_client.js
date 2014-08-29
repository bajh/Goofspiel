  $(function(){
    var socket = io();

    //Want to refactor this and move it into page-behavior
    socket.on('assign suit', function(suit){
      for (var i = 1; i < 14; i++) {
        displayCard(suit, '#player-hand', i);
      }
    });

    function displayCard(suit, context, val) {
      suitPositions = {
        "clubs": "0",
        "hearts": "154px",
        "spades": "308px"
      }
      $card = $('<div>');
      $card.attr('id', function(){ return 'card-' + val });
      $card.addClass("card");
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
      $card.css("z-index", function(){ return val });
      $card.data("card-val", val);
      $(context).append($card);
    }

    socket.on('game message', function(msg){
      $('#game-message-panel').text(msg);
    });

    socket.on('begin game', function(){
      $('#game-message-panel').text("Game now beginning!");
    });

    socket.on('nextcard', function(card){
      $('#prize-card').text(card);
      $('#opponent-played-card').text('');
      $('#my-played-card').text('');
      $('.card').on('click', function(){
        socket.emit('card play', $(this).data('card-val'));
        //It would be ideal to require confirmation from the server that the card was submitted before showing it on the client-side
        $('#my-played-card').text($(this).data('card-val'));
        $(this).remove();
        $('.card').off();
      });
    });

    socket.on('opponent move', function() {
      $('#opponent-played-card').text("X");
    });

    socket.on('reveal card', function(choice) {
      $('#opponent-played-card').text(choice);
    });

  });