  $(function(){
    var socket = io();

    //Want to refactor this
    socket.on('assign suit', function(suit){
      for (var i = 0; i < 13; i++) {
        $card = $('<div>');
        $card.attr('id', function() {return '#card-' + (i + 1)});
        $card.addClass("card");
        $card.css("background", function() {
          background = "url('card-faces.svg') ";
          position = i * -113;
          if (i == 4) {position -= 2};
          if (i == 6) {position -= 1};
          if (i == 5) {position -= 1};
          if (i == 11) {position -= 2};
          background += position;
          background += "px ";
          if (suit == "hearts") {
            background += "0";
          } else if (suit == "diamonds") {
            background += "308px";
          }
          return background;
        });
        $card.css({"background-size": "1469px 616px"});
        $card.css("z-index", function() { return i + 1 });
        $card.data("card-val", i + 1);
        $('#player-hand').append($card);
      }

      // if (suit == "hearts") {
      //   for (var i = 0; i < 13; i++) {
      //     element = $('#card-' + (i + 1));
      //     element.css({"background": "url('card-faces.svg') " + (-113 * i) + "px 0"});
      //     element.css({"background-size": "1469px 616px"});
      //     element.css({"z-index": i + 1});
      //     element.css({"left": ((i * 20) + 30) + "px"})
      //     element.data("card-val", i + 1);
      //   }
      // } else {
      //   for (var i = 0; i < 13; i++) {
      //     element = $('#card-' + (i + 1));
      //     element.css({"background": "url('card-faces.svg') " + (-113 * i) + "px 308px"}); 
      //     element.css({"background-size": "1469px 616px"});
      //     element.css({"z-index": i + 1});
      //     element.css({"left": ((i * 20) + 30) + "px"})
      //     element.data("card-val", i + 1);
      //   }
      // }
    });

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