/**
 * A Hearts player that interacts with a GUI.
 */
var GUIPlayer = function(playerName, rootComponent) {
  var cardClickBehaviour = function() {};
  var currentGame;
  var currentMatch;
  var currentPosition;
  var lastTrick = {};
  var name = playerName;
  var playerKey;

  // Construct the UI
  var $root = rootComponent;
  $root.empty();

  var $messageBox = $('<div class="message-box" />');
  $root.append($messageBox);

  var $actionBar = $('<div class="action-bar" />');
  $root.append($actionBar);

  var $hand = $('<div class="card-hand" />');
  $root.append($hand);

  var $table = $('#table');

  var $lastTrick = $('#last-trick');

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

    game.registerEventHandler(Hearts.CARD_PLAYED_EVENT, handleCardPlayed);
    game.registerEventHandler(Hearts.GAME_OVER_EVENT, handleGameOver);
    game.registerEventHandler(Hearts.GAME_STARTED_EVENT, handleGameStart);
    game.registerEventHandler(Hearts.PASSING_COMPLETE_EVENT, handlePassingComplete);
    game.registerEventHandler(Hearts.TRICK_COMPLETE_EVENT, handleTrickComplete);
    game.registerEventHandler(Hearts.TRICK_CONTINUE_EVENT, handleTrickContinue);
    game.registerEventHandler(Hearts.TRICK_START_EVENT, handleTrickContinue);
  }

  function cardClickBehaviorMultiSelect(cardElement) {
    var $clicked = $(cardElement);
    $clicked.toggleClass('card--selected');
  }

  function cardClickBehaviourPlayCard(cardElement) {
    var $card = $(cardElement);

    var rank = $card.data('rank');
    var suit = $card.data('suit');

    var card = new Card(rank, suit);

    if (!isPlayable(card)) {
      alert("That card is not playable.");
      return;
    }

    currentGame.playCard(card, playerKey);
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

  function clearTable() {
    $table.find('.trick__card').each(function() {
        $container = $(this)
        $img = $('<img alt="Card Placholder" class="card" src="images/card_placeholder.png">');

        $container.empty();
        $container.append($img);
    });
  }

  function displayCards(cards, filterPlayable) {
    cards = sortCards(cards);
    filterPlayable = filterPlayable || false;

    $hand.empty();

    for (var i = 0; i < cards.length; i++) {
      var $card = $('<img class="card card-hand__card" />');
      $card.attr('alt', cards[i].toString());
      $card.attr('src', cardToImageFile(cards[i]));

      $card.data('suit', cards[i].getSuit());
      $card.data('rank', cards[i].getRank());

      // Handle the case where we need to select cards for passing
      if (!filterPlayable || isPlayable(cards[i])) {
        $card.addClass('card--selectable');
        $card.click(handleCardClick);
      } else {
        $card.addClass('card--unplayable');
      }

      $hand.append($card);
    }
  }

  function handleCardClick() {
    cardClickBehaviour(this);
  }

  function handleCardPlayed(event) {
    var card = event.getCard();
    var pos = event.getPosition();
    var $tablePosition;

    if (pos === Hearts.NORTH) {
      $tablePosition = $('#table-north');
    } else if (pos === Hearts.EAST) {
      $tablePosition = $('#table-east');
    } else if (pos === Hearts.SOUTH) {
      $tablePosition = $('#table-south');
    } else {
      $tablePosition = $('#table-west');
    }

    var $cardDiv = $tablePosition.find('.trick__card');

    var $card = $('<img class="card">');
    $card.attr('alt', card.toString());
    $card.attr('src', cardToImageFile(card));

    $cardDiv.empty();
    $cardDiv.append($card);

    // Save play
    lastTrick[pos] = card;
  }

  /**
   * Handle an event of type GAME_STARTED_EVENT.
   *
   * @param {GameStartedEvent} event The event that occurred.
   */
  function handleGameStart(event) {
    if (event.getPassType() === Hearts.PASS_NONE) {
      console.log('No passing required.')

      return;
    }

    // Passing requires selection of multiple cards
    cardClickBehaviour = cardClickBehaviorMultiSelect;

    setMessage('Please select 3 cards to pass.');

    var $passBtn = $('<button>Pass Cards</button>');
    $passBtn.click(handlePassCards);

    $actionBar.empty();
    $actionBar.append($passBtn);

    var hand = currentGame.getHand(playerKey);
    var cards = hand.getDealtCards(playerKey);

    displayCards(cards, false);
  }

  function handlePassCards() {
    var cards = getSelectedCards();

    if (cards.length !== 3) {
      alert('You must pass exactly 3 cards.');
      return;
    }

    currentGame.passCards(getSelectedCards(), playerKey);
  }

  function handlePassingComplete() {
    cardClickBehaviour = function() {};

    setMessage('');
    $actionBar.empty();

    var hand = currentGame.getHand(playerKey);
    var cards = hand.getUnplayedCards(playerKey);

    displayCards(cards);
  }

  function handleGameOver() {
    var scoreboard = currentMatch.getScoreboard();
    console.log(scoreboard);

    $('#score-north').text(scoreboard[Hearts.NORTH]);
    $('#score-east').text(scoreboard[Hearts.EAST]);
    $('#score-south').text(scoreboard[Hearts.SOUTH]);
    $('#score-west').text(scoreboard[Hearts.WEST]);

    clearTable();
  }

  function handleTrickComplete(event) {
    var pairs = [
        [Hearts.NORTH, $('#last-trick-north')],
        [Hearts.EAST, $('#last-trick-east')],
        [Hearts.SOUTH, $('#last-trick-south')],
        [Hearts.WEST, $('#last-trick-west')]
    ];

    for (var i = 0; i < pairs.length; i++) {
        var card = lastTrick[pairs[i][0]];

        var $container = pairs[i][1].find('.trick__card');
        var $card = $('<img class="card">');
        $card.attr('alt', card.toString());
        $card.attr('src', cardToImageFile(card));

        $container.empty();
        $container.append($card);
    }

    var trick = event.getTrick();

    var winner = trick.getWinner();
    var points = trick.getPoints();
    var plural = points !== 1 ? 'points' : 'point';

    $('#last-trick-message').text(winner + ' won the trick with ' + points + ' ' + plural);
  }

  function handleTrickContinue(event) {
    var positionToPlay;

    if (event.event_type === Hearts.TRICK_CONTINUE_EVENT) {
      positionToPlay = event.getNextPos();
    } else {
      clearTable();
      positionToPlay = event.getStartPos();
    }

    if (positionToPlay !== currentPosition) {
      return;
    }

    setMessage('Please play a card.');

    cardClickBehaviour = cardClickBehaviourPlayCard;

    var hand = currentGame.getHand(playerKey);
    displayCards(hand.getUnplayedCards(playerKey), true);
  }

  function isPlayable(card) {
    var hand = currentGame.getHand(playerKey);
    var playable = hand.getPlayableCards(playerKey);

    return !!playable.find(function(playableCard) {
      return playableCard.getSuit() === card.getSuit() && playableCard.getRank() === card.getRank();
    });
  }

  function getSelectedCards() {
    var selected = [];

    $hand.find('.card--selected').each(function() {
      var $card = $(this);

      selected.push(new Card($card.data('rank'), $card.data('suit')));
    });

    return selected;
  }

  function setMessage(message) {
    $messageBox.empty();

    $messageBox.append($('<p>' + message + '</p>'));
  }

  function sortCards(cards) {
    var suitOrder = [Card.Suit.SPADE, Card.Suit.DIAMOND, Card.Suit.CLUB, Card.Suit.HEART];

    return cards.sort(function(c1, c2) {
      var suitIndex1 = suitOrder.indexOf(c1.getSuit());
      var suitIndex2 = suitOrder.indexOf(c2.getSuit());

      if (suitIndex1 - suitIndex2 !== 0) {
        return suitIndex1 - suitIndex2;
      }

      return c1.getRank() - c2.getRank();
    });
  }
}
