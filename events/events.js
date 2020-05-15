
// events.js
// socket events
var room = require('../components/room');

// user Joining a room
const joinRoom = (io, socket, createdRoom, callback) => (roomToJoin, userName) => {
    if (createdRoom.contains(roomToJoin)) {
        room.joinRoom(socket, roomToJoin, userName);
        // Get all users in a room and replies back with array
        room.getAllUsersInARoom(io, roomToJoin, (connectedUsers) => {
            // Notifying all the user in that room
            io.in(roomToJoin).emit('aUserJoined', connectedUsers);
        });
        callback(null);
    } else {
        callback(new Error("Error : Roomname is not valid or verify room name"));
    }
}


module.exports = { joinRoom }