OnlyAdminCanStartGameError = function (message) {
  this.name = "OnlyAdminCanStartGame";
};
OnlyAdminCanStartGameError.prototype = Error.prototype;

NoOfUserNotMetError = function (message) {
  this.name = "NoOfUserNotMet";
};
NoOfUserNotMetError.prototype = Error.prototype;
