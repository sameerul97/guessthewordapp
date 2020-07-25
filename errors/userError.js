InvalidUsernameError = function (message) {
    this.message = "Username is invalid, verify and try again"
    this.name    = "Invalid Username"
    // if (Error.captureStackTrace) {
    //     Error.captureStackTrace(this, RoomNotInDbError);
    // }
}
InvalidUsernameError.prototype = Error.prototype;