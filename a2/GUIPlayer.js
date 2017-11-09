/**
 * A Hearts player that interacts with a GUI.
 */
var GUIPlayer = function(playerName) {
  var currentGame;
  var currentMatch;
  var currentPosition;
  var name = playerName;
  var playerKey;

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
  }
}
