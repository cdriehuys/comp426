/**
 * A Hearts player that interacts with a GUI.
 *
 * @param {string} playerName The player's name.
 * @param {JQuery} rootComponent The component to mount the player's interface in.
 */
var GUIPlayer = function(playerName, rootComponent) {
  var CARD_PASS_COUNT = 3;

  var cardClickBehaviour = function() {};
  var currentGame;
  var currentGameScore = {
    [Hearts.NORTH]: 0,
    [Hearts.EAST]: 0,
    [Hearts.SOUTH]: 0,
    [Hearts.WEST]: 0,
  };
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

    game.registerEventHandler(Hearts.CARD_PLAYED_EVENT, handleCardPlayed);
    game.registerEventHandler(Hearts.GAME_OVER_EVENT, handleGameOver);
    game.registerEventHandler(Hearts.GAME_STARTED_EVENT, handleGameStart);
    game.registerEventHandler(Hearts.PASSING_COMPLETE_EVENT, handlePassingComplete);
    game.registerEventHandler(Hearts.TRICK_COMPLETE_EVENT, handleTrickComplete);
    game.registerEventHandler(Hearts.TRICK_CONTINUE_EVENT, handleTrickContinue);
    game.registerEventHandler(Hearts.TRICK_START_EVENT, handleTrickContinue);
  }

  /**
   * Card click handler that allows for selection of multiple cards.
   *
   * @param {HTMLElement} cardElement The card that was clicked.
   */
  function cardClickBehaviorMultiSelect(cardElement) {
    var $clicked = $(cardElement);
    $clicked.toggleClass('card--selected');
  }

  /**
   * Card click handler that plays the selected card.
   *
   * @param {HTMLElement} cardElement The card that was clicked.
   */
  function cardClickBehaviourPlayCard(cardElement) {
    var $card = $(cardElement);

    var rank = $card.data('rank');
    var suit = $card.data('suit');

    var card = new Card(rank, suit);

    currentGame.playCard(card, playerKey);
  }

  /**
   * Get the path to the image for a given card.
   *
   * @param {Card} card The card to get an image for.
   *
   * @returns {string} The filepath to the image for the provided card.
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

  /**
   * Clear the table of any played cards.
   */
  function clearTable() {
    $table.find('.trick__card').each(function() {
        $container = $(this)
        $img = $('<img alt="Card Placholder" class="card" src="images/card_placeholder.png">');

        $container.empty();
        $container.append($img);
    });
  }

  /**
   * Display a hand of cards.
   *
   * The cards will be sorted by suit and rank.
   *
   * @param {Card[]} cards The cards to display
   * @param {boolean} [filterPlayable] A boolean indicating if the unplayable cards should not be
   *                                   selectable. Defaults to false.
   */
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

      // If we are not filtering for playable cards or the card is playable, add a click handler.
      if (!filterPlayable || isPlayable(cards[i])) {
        $card.addClass('card--selectable');
        $card.click(handleCardClick);
      }

      $hand.append($card);
    }
  }

  /**
   * Generic click handler for cards.
   *
   * All it does is delegate the click event to the appropriate click handler for the current game
   * state.
   */
  function handleCardClick() {
    cardClickBehaviour(this);
  }

  /**
   * Handle a card played event.
   *
   * This displays the card on the table.
   *
   * @param {CardPlayedEvent} event The event containing the card played and which position played.
   */
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
    // If no passing is required, we have nothing to do
    if (event.getPassType() === Hearts.PASS_NONE) {
      return;
    }

    // Passing requires selection of multiple cards
    cardClickBehaviour = cardClickBehaviorMultiSelect;

    setMessage('Please select ' + CARD_PASS_COUNT + ' cards to pass.');

    var $passBtn = $('<button>Pass Cards</button>');
    $passBtn.click(handlePassCards);

    $actionBar.empty();
    $actionBar.append($passBtn);

    var hand = currentGame.getHand(playerKey);
    var cards = hand.getDealtCards(playerKey);

    displayCards(cards, false);
  }

  /**
   * Handle passing cards at the beginning of the game.
   *
   * We check to make sure that the appropriate number of cards are passed, and then pass them to
   * the current game.
   */
  function handlePassCards() {
    var cards = getSelectedCards();

    if (cards.length !== CARD_PASS_COUNT) {
      alert('You must pass exactly ' + CARD_PASS_COUNT + ' cards.');
      return;
    }

    currentGame.passCards(getSelectedCards(), playerKey);
  }

  /**
   * Handle the completion of passing cards.
   */
  function handlePassingComplete() {
    // After passing we don't need a card click handler.
    cardClickBehaviour = function() {};

    setMessage('');
    $actionBar.empty();

    var hand = currentGame.getHand(playerKey);
    var cards = hand.getUnplayedCards(playerKey);

    // Display the player's new cards after passing.
    displayCards(cards);
  }

  /**
   * Handle the completion of a game.
   *
   * This updates the scoreboard and clears the table.
   */
  function handleGameOver() {
    currentGameScore = {
      [Hearts.NORTH]: 0,
      [Hearts.EAST]: 0,
      [Hearts.SOUTH]: 0,
      [Hearts.WEST]: 0,
    };

    updateScoreboard();

    clearTable();
  }

  /**
   * Handle the completion of a trick.
   *
   * After a trick is complete, we display the results in the "Last Trick" section and update the
   * current game's scoreboard.
   *
   * @param {TrickCompleteEvent} event The event containing the trick information.
   */
  function handleTrickComplete(event) {
    var pairs = [
        [Hearts.NORTH, $('#last-trick-north')],
        [Hearts.EAST, $('#last-trick-east')],
        [Hearts.SOUTH, $('#last-trick-south')],
        [Hearts.WEST, $('#last-trick-west')]
    ];

    // Display the results of the last trick
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

    // Update the current game's score
    currentGameScore[winner] += points;
    updateScoreboard();
  }

  /**
   * Handle a trick start or trick continue event.
   *
   * @param {TrickContinueEvent|TrickStartEvent} event The event indicating that the trick has
   *                                                   started or is being continued.
   */
  function handleTrickContinue(event) {
    var positionToPlay;

    // Get the position that is supposed to play.
    if (event.event_type === Hearts.TRICK_CONTINUE_EVENT) {
      positionToPlay = event.getNextPos();
    } else {
      // If we're starting the trick, we should clear the table from the previous trick.
      clearTable();
      positionToPlay = event.getStartPos();
    }

    // If the position that is supposed to play is not our position, we don't have to do anything.
    if (positionToPlay !== currentPosition) {
      return;
    }

    setMessage('Please play a card.');

    // We want clicked cards to be played
    cardClickBehaviour = cardClickBehaviourPlayCard;

    // Make sure the player's hand is up to date
    var hand = currentGame.getHand(playerKey);
    displayCards(hand.getUnplayedCards(playerKey), true);
  }

  /**
   * Determine if the provided card is currently playable.
   *
   * @param {Card} card The card to check.
   *
   * @returns {boolean} A boolean indicating if the provided card is currently playable.
   */
  function isPlayable(card) {
    var hand = currentGame.getHand(playerKey);
    var playable = hand.getPlayableCards(playerKey);

    return !!playable.find(function(playableCard) {
      return playableCard.getSuit() === card.getSuit() && playableCard.getRank() === card.getRank();
    });
  }

  /**
   * Get the cards that are currently selected.
   *
   * This is used in the case of passing where we can have multiple selected cards.
   *
   * @returns {Card[]} An array containing the selected cards.
   */
  function getSelectedCards() {
    var selected = [];

    $hand.find('.card--selected').each(function() {
      var $card = $(this);

      selected.push(new Card($card.data('rank'), $card.data('suit')));
    });

    return selected;
  }

  /**
   * Set a message for the player.
   *
   * @param {string} message The message to display to the player.
   */
  function setMessage(message) {
    $messageBox.empty();

    $messageBox.append($('<p>' + message + '</p>'));
  }

  /**
   * Sort a list of cards by suit and rank.
   *
   * Cards are sorted by suit (Spades, Diamonds, Clubs, Hearts), and then by rank, ascending.
   *
   * @param {Card[]} cards An array of cards to sort.
   *
   * @returns {Card[]} The provided cards, ordered by suit and rank.
   */
  function sortCards(cards) {
    var suitOrder = [Card.Suit.SPADE, Card.Suit.DIAMOND, Card.Suit.CLUB, Card.Suit.HEART];

    return cards.sort(function(c1, c2) {
      var suitIndex1 = suitOrder.indexOf(c1.getSuit());
      var suitIndex2 = suitOrder.indexOf(c2.getSuit());

      // If the cards are different suits, return their difference
      if (suitIndex1 - suitIndex2 !== 0) {
        return suitIndex1 - suitIndex2;
      }

      // The cards are the same suit, so return their difference in rank
      return c1.getRank() - c2.getRank();
    });
  }

  /**
   * Update the scoreboard.
   *
   * We display the match total as well as the potential points the player will accumulate from the
   * current game. The only way the player will not get the potential points is if they shoot the
   * moon.
   */
  function updateScoreboard() {
    var scoreboard = currentMatch.getScoreboard();

    var pairs = [
      [Hearts.NORTH, $('#score-north')],
      [Hearts.EAST, $('#score-east')],
      [Hearts.SOUTH, $('#score-south')],
      [Hearts.WEST, $('#score-west')],
    ];

    // Update each player's score.
    for (var i = 0; i < pairs.length; i++) {
      var pos = pairs[i][0];
      var totalScore = scoreboard[pos];
      // If the player has potential points, display them too
      var text = currentGameScore[pos] === 0 ? totalScore.toString() : totalScore + ' + ' + currentGameScore[pos];

      pairs[i][1].text(text);
    }
  }
}
