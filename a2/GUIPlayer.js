/**
 * A Hearts player that interacts with a GUI.
 */
var GUIPlayer = function(playerName, rootComponent) {
  var currentGame;
  var currentMatch;
  var currentPosition;
  var name = playerName;
  var playerKey;

  // Construct the UI
  var $root = rootComponent;
  $root.empty();

  var $messageBox = $('<div class="message-box" />');
  $root.append($messageBox);

  var $hand = $('<div class="card-hand" />');
  $root.append($hand);

  var $actionBar = $('<div class="action-bar" />');
  $root.append($actionBar);

  /**
   * Get the player's name.
   *
   * @returns {string} The player's name.
   */
  this.getName = function() {
    return name;
  }

  /**
   * Set up a Hearts match.
   *
   * @param {Match} match The match being set up.
   * @param {string} position The player's position.
   */
  this.setupMatch = function(match, position) {
    currentMatch = match;
    currentPosition = position;
  }

  /**
   * Set up the next game of hearts.
   *
   * @param {GameOfHearts} game The game to set up.
   * @param {string} key The key the player should use to authenticate their actions.
   */
  this.setupNextGame = function(game, key) {
    currentGame = game;
    playerKey = key;

    game.registerEventHandler(Hearts.ALL_EVENTS, function(e) {
      console.log('Received Event:', e.toString());
    });

    game.registerEventHandler(Hearts.GAME_STARTED_EVENT, handleGameStart);
  }

  /**
   * Get the path to the image for a given card.
   */
  function cardToImageFile(card) {
    var fileRank = '', fileSuit = '';

    var rank = card.getRank();

    if (rank === Card.Rank.JACK) {
      fileRank = 'jack';
    } else if (rank === Card.Rank.QUEEN) {
      fileRank = 'queen';
    } else if (rank == Card.Rank.KING) {
      fileRank = 'king';
    } else if (rank == Card.Rank.ACE) {
      fileRank = 'ace';
    } else {
      fileRank = rank.toString();
    }

    var suit = card.getSuit();

    if (suit === Card.Suit.CLUB) {
      fileSuit = 'clubs';
    } else if (suit === Card.Suit.DIAMOND) {
      fileSuit = 'diamonds';
    } else if (suit === Card.Suit.HEART) {
      fileSuit = 'hearts';
    } else {
      fileSuit = 'spades';
    }

    return 'images/' + fileRank + '_of_' + fileSuit + '.png';
  }

  function handleCardClick() {
    $(this).toggleClass('card-hand__card--selected');
  }

  /**
   * Handle an event of type GAME_STARTED_EVENT.
   *
   * @param {GameStartedEvent} event The even that occurred.
   */
  function handleGameStart(event) {
    if (event.getPassType() === Hearts.PASS_NONE) {
      console.log('No passing required.')

      return;
    }

    setMessage('Please select 3 cards to pass.');

    var $passBtn = $('<button>Pass Cards</button>');
    $passBtn.click(handlePassCards);

    $actionBar.empty();
    $actionBar.append($passBtn);

    var hand = currentGame.getHand(playerKey);
    var cards = hand.getDealtCards(playerKey);

    $hand.empty();

    for (var i = 0; i < cards.length; i++) {
      var $card = $('<image class="card-hand__card"/>');
      $card.attr('alt', cards[i].toString());
      $card.attr('src', cardToImageFile(cards[i]));

      $card.data('suit', cards[i].getSuit());
      $card.data('rank', cards[i].getRank());

      $card.click(handleCardClick);

      $hand.append($card);
    }
  }

  function handlePassCards() {
    var cards = getSelectedCards();

    if (cards.length !== 3) {
      alert('You must pass exactly 3 cards.');
      return;
    }

    currentGame.passCards(getSelectedCards(), playerKey);
  }

  function getSelectedCards() {
    var selected = [];

    $hand.find('.card-hand__card--selected').each(function() {
      var $card = $(this);

      selected.push(new Card($card.data('rank'), $card.data('suit')));
    });

    return selected;
  }

  function setMessage(message) {
    $messageBox.empty();

    $messageBox.append($('<p>' + message + '</p>'));
  }
}
