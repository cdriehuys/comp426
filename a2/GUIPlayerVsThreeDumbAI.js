$(document).ready(function() {
  var north = new GUIPlayer('Player', $('#north'));
  var east = new DumbAI('Bob');
  var south = new DumbAI('Carol');
  var west = new DumbAI('David');

  var match = new HeartsMatch(north, east, south, west);

  match.run();
});
