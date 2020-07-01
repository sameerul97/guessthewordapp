const Room = require("../services/roomService");
const User = require("../services/userService");
let { NameSpace } = require("../config");

const joinRoom = (socket) => async (roomToJoin, userName) => {
  // let { username } = userName;
  try {
    var setuserName = await User.setUsername(socket, userName);
    var setAdmin = await User.setAdmin(socket, false);
    var roomExist = await Room.roomExist(roomToJoin);
    var joinRoom = await Room.joinRoom(socket, roomToJoin);
    var addUserInRoom = await Room.setUsernameInRedis(
      User.getUserId(socket),
      roomToJoin,
      User.getUsername(socket)
    );
    var clientIdsInRoom = await Room.getAllClientIdsInRoom(roomToJoin);
    var getAllUsersInRoom = await Room.getAllUsersInRoom(clientIdsInRoom);
    let arr = await Room.mapUserIdWithUsername(
      clientIdsInRoom,
      getAllUsersInRoom
    );
    
    socket.emit("roomVerified", {
      success: true,
      message: null,
    });
    socket.emit("userId", User.getUserId(socket));
    io.in(roomToJoin).emit("aUserJoined", arr);
  
  } catch (err) {
    if (err instanceof RoomNotInDbError) {
      console.error(err);
      socket.emit("roomVerified", {
        success: false,
        message: err.message,
      });
  
    }
  }
};

const createRoom = (socket) => async (socketData) => {
  var { username } = socketData;
  try {
    // create room, join in that room, sign a token and send that to the user
    var setuserName = await User.setUsername(socket, username);
    var setAdmin = await User.setAdmin(socket, true);
    var roomName = await Room.createRoom();
    var joinRoom = await Room.joinRoom(socket, roomName);
    var addUserInRoom = await Room.setUsernameInRedis(
      User.getUserId(socket),
      roomName,
      User.getUsername(socket)
    );
    var clientIdsInRoom = await Room.getAllClientIdsInRoom(roomName);
    var getAllUsersInRoom = await Room.getAllUsersInRoom(clientIdsInRoom);
    let arr = await Room.mapUserIdWithUsername(
      clientIdsInRoom,
      getAllUsersInRoom
    );
      console.log(roomName)
    io.to(roomName).emit("roomNameIs", roomName);
    socket.emit("userId", User.getUserId(socket));
    io.in(roomName).emit("aUserJoined", arr);
  
  } catch (err) {
    if (err instanceof InvalidUsernameError) {
      // TODO: Send invalid username error to client with socket.emit
      socket.emit("invalidUsername", new InvalidUsernameError());
    }
  
  }
};


// Implement express pattern (req,res,next) next will be callback
// https://stackoverflow.com/questions/61834610/how-to-write-a-unit-test-an-express-controller-using-jest
const dummyController = async (socket,username) => {
  try {
    let user = await User.dummyUserServiceMethod1();
    let finalUser = await User.dummyUserServiceMethod2(user);
    return finalUser;

  } catch (err) {
    return err;
  }
};

module.exports = { createRoom, joinRoom, dummyController };

// (async () => {
//   let databe = await dummyController();
// })();
