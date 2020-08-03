const RoomService = require("../services/roomService");
const User = require("../services/userService");
const GameService = require("../services/gameService");
const { NameSpace, Redis } = require("../config");
require("../errors/gameError");
const joinRoom = (socket) => async (roomToJoin, userName) => {
  // let { username } = userName;
  try {
    var roomExist = await RoomService.roomExist(roomToJoin);

    // check if game started already
    var gameInstanceKey = await RoomService.getRoomKey(roomToJoin);
    var gameObject = await GameService.getGameObject(gameInstanceKey);
    if (gameObject != null) {
      throw new GameAlreadyStarted();
    }
    var setuserName = await User.setUsername(socket, userName);
    var setAdmin = await User.setAdmin(socket, false);
    var joinRoom = await RoomService.joinRoom(socket, roomToJoin);
    var addUserInRoom = await RoomService.setUsernameInRedis(
      User.getUserId(socket),
      roomToJoin,
      User.getUsername(socket)
    );
    var clientIdsInRoom = await RoomService.getAllClientIdsInRoom(roomToJoin);
    var usersInRoom = clientIdsInRoom.map(
      (id) => Redis.KeyNames.SocketIdUsername + id
    );
    var getAllUsersInRoom = await RoomService.getAllUsersInRoom(usersInRoom);
    let arr = await RoomService.mapUserIdWithUsername(
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
    var message;

    if (err instanceof GameAlreadyStarted) {
      message = err.message;
    }

    if (err instanceof RoomNotInDbError) {
      message = err.message;
    }

    socket.emit("roomVerified", {
      success: false,
      message: message,
    });
  }
};

const createRoom = (socket) => async (socketData) => {
  var { username } = socketData;
  try {
    // create room, join in that room, sign a token and send that to the user
    var setuserName = await User.setUsername(socket, username);
    var setAdmin = await User.setAdmin(socket, true);
    var roomName = await RoomService.createRoom();
    var joinRoom = await RoomService.joinRoom(socket, roomName);
    var addUserInRoom = await RoomService.setUsernameInRedis(
      User.getUserId(socket),
      roomName,
      User.getUsername(socket)
    );
    var clientIdsInRoom = await RoomService.getAllClientIdsInRoom(roomName);
    var usersInRoom = clientIdsInRoom.map(
      (id) => Redis.KeyNames.SocketIdUsername + id
    );
    var getAllUsersInRoom = await RoomService.getAllUsersInRoom(usersInRoom);
    let arr = await RoomService.mapUserIdWithUsername(
      usersInRoom,
      getAllUsersInRoom
    );
    io.to(roomName).emit("roomNameIs", roomName);
    socket.emit("userId", User.getUserId(socket));
    io.in(roomName).emit("aUserJoined", arr);
  } catch (err) {
    if (err instanceof InvalidUsernameError) {
      // TODO: Send invalid username error to client with socket.emit
      socket.emit("invalidUsername", new InvalidUsernameError());
    }
    console.error(err);
  }
};

// Implement express pattern (req,res,next) next will be callback
// https://stackoverflow.com/questions/61834610/how-to-write-a-unit-test-an-express-controller-using-jest
const dummyController = async (socket, username) => {
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
