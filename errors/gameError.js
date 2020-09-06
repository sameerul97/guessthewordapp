OnlyAdminCanStartGameError = function (message) {
  this.name = "OnlyAdminCanStartGame";
  this.message = "Only Admin can start game";
};
OnlyAdminCanStartGameError.prototype = Error.prototype;

NoOfUserNotMetError = function (message) {
  this.name = "NoOfUserNotMet";
};
NoOfUserNotMetError.prototype = Error.prototype;

GameAlreadyStarted = function (message) {
  this.name = "GameAlreadyStarted";
  this.message = "Game already started";
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, GameAlreadyStarted);
  }
};
GameAlreadyStarted.prototype = Error.prototype;
