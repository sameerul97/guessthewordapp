InvalidGameIdError = function (message) {
    this.message = "Game Id is invalid, verify and try again"
    this.name    = "Invalid Game Id"
    // if (Error.captureStackTrace) {
    //     Error.captureStackTrace(this, RoomNotInDbError);
    // }
}
InvalidGameIdError.prototype = Error.prototype;