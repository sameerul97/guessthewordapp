const Room = require("../services/roomService");
const User = require("../services/userService");
let { NameSpace } = require("../config");

// user Joining a room
// const joinRoom = (io, socket, createdRoom, callback) => (roomToJoin, userName) => {
//     if (Room.roomExist(roomToJoin)) {
//         // if()
//         Room.joinRoom(socket, roomToJoin, userName);
//         // Get all users in a room and replies back with array
//         Room.getAllUsersInARoom(io, roomToJoin, (connectedUsers) => {
//             // Notifying all the user in that room
//             io.in(roomToJoin).emit('aUserJoined', connectedUsers);
//         });
//         callback(null);
//     } else {
//         callback(new Error("errorMessage : Roomname is not valid or verify room name"));
//     }
// }


const joinRoom = (socket) => async (roomToJoin, userName) => {
    // let { username } = userName;
    try {
        var setuserName       = await User.setUsername(socket, userName);
        var setAdmin          = await User.setAdmin(socket, false);
        var roomExist         = await Room.roomExist(roomToJoin);
        var joinRoom          = await Room.joinRoom(socket, roomToJoin);
        var addUserInRoom     = await Room.setUsernameInRedis(User.getUserId(socket), roomToJoin, User.getUsername(socket));
        var clientIdsInRoom   = await Room.getAllClientIdsInRoom(roomToJoin);
        var getAllUsersInRoom = await Room.getAllUsersInRoom(clientIdsInRoom);
        let arr               = await Room.mapUserIdWithUsername(clientIdsInRoom, getAllUsersInRoom);
        socket.emit("roomVerified", {
            success: true,
            message: null
        });
        socket.emit("userId", User.getUserId(socket));
        // let arr = clientIdsInRoom.map((i,ind)=>{var t = {}; t.id = i;  t.name = getAllUsersInRoom[ind];return t; })
        io.in(roomToJoin).emit("aUserJoined", arr);

    } catch (err) {
        if (err instanceof RoomNotInDbError) {
            console.error(err)
            socket.emit("roomVerified", {
                success: false,
                message: err.message
            })
        }
    }
}

const createRoom = (socket) => async (socketData) => {
  // console.log(Room.getRClient())
  var { username } = socketData;
  try {
    // create room, join in that room, sign a token and send that to the user
    var setuserName       = await User.setUsername(socket, username);
    var setAdmin          = await User.setAdmin(socket, true);
    var roomName          = await Room.createRoom();
    var joinRoom          = await Room.joinRoom(socket, roomName);
    var addUserInRoom     = await Room.setUsernameInRedis(User.getUserId(socket), roomName, User.getUsername(socket));
    var clientIdsInRoom   = await Room.getAllClientIdsInRoom(roomName);
    var getAllUsersInRoom = await Room.getAllUsersInRoom(clientIdsInRoom);
    let arr               = await Room.mapUserIdWithUsername(clientIdsInRoom, getAllUsersInRoom);
    // sign a token and send that to user
    io.to(roomName).emit('roomNameIs', roomName);
    socket.emit("userId", User.getUserId(socket));
    // let arr = clientIdsInRoom.map((i,ind)=>{var t = {}; t.id = i;  t.name = getAllUsersInRoom[ind];return t; })

    io.in(roomName).emit("aUserJoined", arr);
    // io.in(roomName).emit('aUserJoined',
    //     { username: User.getUsername(socket), userId: User.getUserId(socket) });
    } catch (err) {
        if (err instanceof InvalidUsernameError) {
            // console.log(err);
            // TODO: Send invalid username error to client with socket.emit 
        } else if {

        } else if{

        }
        // io.in(roomName).emit('aUserJoined',
        //     { username: User.getUsername(socket), userId: User.getUserId(socket) });
    }
}

module.exports = { createRoom, joinRoom };