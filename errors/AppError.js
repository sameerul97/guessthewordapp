// class AppError extends Error {
//     constructor(errorType, errorMessage, ...params) {
//         // Pass remaining arguments (including vendor specific ones) to parent constructor
//         super(...params)

//         if (Error.captureStackTrace) {
//             Error.captureStackTrace(this, AppError)
//         }

//         this.name    = errorType
//         this.message = errorMessage
//         // Custom debugging information
//         // this.foo = foo
//         this.date = new Date()
//     }
// }

// module.exports = AppError;


RoomNotInDbError = function (message) {
    this.message = "Room name is not valid or verify room name"
    this.name    = "roomNotInDb"
    // if (Error.captureStackTrace) {
    //     Error.captureStackTrace(this, RoomNotInDbError);
    // }
}
RoomNotInDbError.prototype = Error.prototype;

