$(function(){

  $('#opponent-played-card').hide();

  $('#player-hand').on('mouseenter', '.card', function(){
    var cardInFocus = $(this).data("card-val");
    var $cardsInHand = $('#player-hand').find('.card');
    var rotationMultiplier = findIndexofCard(cardInFocus, $cardsInHand);
    $cardsInHand.each(function(i){
      var rotationMultiplier2 = rotationMultiplier;
      console.log(rotationMultiplier2);
      $(this).animate({borderSpacing: -90, "left":"+="+30*-rotationMultiplier2+"px"},
        {step: function(now){
          $(this).css('-webkit-transform','rotate('+rotationMultiplier2*(now/33)+'deg)'); 
          $(this).css('-moz-transform','rotate('+rotationMultiplier2*(now/33)+'deg)');
          $(this).css('transform','rotate('+rotationMultiplier2*(now/33)+'deg)');
          },
          duration:'slow'
        },
        'linear'
      );
      rotationMultiplier = rotationMultiplier2 - 1;
    });
  });

  function findIndexofCard(card, hand){
    var index;
    hand.each(function(i){
      if ($(this).data("card-val") == card) {
        index = i;
        return null;
      }
    });
    return index;
  }

})