InvalidGameDataError = function (message) {
    this.message = "Game data is not valid"
    this.name    = "Invalid Game data"
    // if (Error.captureStackTrace) {
    //     Error.captureStackTrace(this, RoomNotInDbError);
    // }
}
InvalidGameDataError.prototype = Error.prototype;

NoUsernameError = function (message) {
    this.message = "Username required"
    this.name    = "Username required"
    // if (Error.captureStackTrace) {
    //     Error.captureStackTrace(this, RoomNotInDbError);
    // }
}
NoUsernameError.prototype = Error.prototype;