  $(function(){
    var socket = io();

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
        socket.emit('card play', $(this).attr('id'));
        //It would be ideal to require confirmation from the server that the card was submitted before showing it on the client-side
        $('#my-played-card').text($(this).attr('id'));
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