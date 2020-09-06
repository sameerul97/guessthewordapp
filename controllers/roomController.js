const RoomService = require("../services/roomService");
const User = require("../services/userService");
const GameService = require("../services/gameService");
const { NameSpace, Redis } = require("../config");
const {
  CreateRoomResponse,
  JoinRoomResponse,
} = require("../responses/roomResponse");

require("../errors/gameError");
require("../errors/userError");
require("../errors/AppError");

require("../responses/roomResponse");

const joinRoom = (socket) => async (socketData) => {
  let { roomname, username } = socketData;
  // try {

  if (
    !(
      roomname != null &&
      roomname != undefined &&
      roomname.match(/^ *$/) === null
    )
  ) {
    return new RoomNotInDbError();
  }

  if ((await User.setUsername(socket, username)) === false) {
    return new InvalidUsernameError();
  }

  var roomExist = await RoomService.roomExist(roomname);

  if (roomExist === false) {
    return new RoomNotInDbError();
  }

  // check if game started already
  var gameInstanceKey = await RoomService.getRoomKey(roomname);
  var gameObject = await GameService.getGameObject(gameInstanceKey);

  if (gameObject != null) {
    return new GameAlreadyStarted();
  }

  // var setuserName = await User.setUsername(socket, userName);
  var setAdmin = await User.setAdmin(socket, false);
  var joinRoom = await RoomService.joinRoom(socket, roomname);
  var addUserInRoom = await RoomService.setUsernameInRedis(
    User.getUserId(socket),
    roomname,
    User.getUsername(socket)
  );
  var clientIdsInRoom = await RoomService.getAllClientIdsInRoom(roomname);
  var usersInRoom = clientIdsInRoom.map(
    (id) => Redis.KeyNames.SocketIdUsername + id
  );
  var getAllUsersInRoom = await RoomService.getAllUsersInRoom(usersInRoom);

  let arr = await RoomService.mapUserIdWithUsername(
    clientIdsInRoom,
    getAllUsersInRoom
  );

  // return { userList: arr, success: true, userId: User.getUserId(socket) };
  // var res = ;
  return new JoinRoomResponse(true, roomname, User.getUserId(socket), arr);
  // socket.emit("roomVerified", {
  //   success: true,
  //   message: null,
  // });
  // socket.emit("userId", User.getUserId(socket));
  // io.in(roomname).emit("aUserJoined", arr);
  // } catch (err) {
  //   var message;

  //   if (err instanceof GameAlreadyStarted) {
  //     message = err.message;
  //   }

  //   if (err instanceof RoomNotInDbError) {
  //     message = err.message;
  //   }

  //   if (err instanceof InvalidUsernameError) {
  //     message = err.message;
  //   }

  //   socket.emit("roomVerified", {
  //     success: false,
  //     message: message,
  //   });
  // }
};

const createRoom = (socket) => async (socketData) => {
  var { username } = socketData;
  // try {
  // create room, join in that room, sign a token and send that to the user
  // var setuserName = ;

  if ((await User.setUsername(socket, username)) === false) {
    return new InvalidUsernameError();
  }

  await User.setAdmin(socket, true);

  var roomName = await RoomService.createRoom();
  var userid = User.getUserId(socket);

  await RoomService.joinRoom(socket, roomName);
  await RoomService.setUsernameInRedis(
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

  // var jsonResponse = {
  //   roomName: roomName,
  //   userId: userid,
  //   userList: arr,
  // };
  // new CreateRoom(roomName, userid, arr);

  return new CreateRoomResponse(roomName, userid, arr);

  // io.to(roomName).emit("roomNameIs", roomName);
  // socket.emit("userId", User.getUserId(socket));
  // io.in(roomName).emit("aUserJoined", arr);

  // } catch (err) {
  //   var message;
  //   if (err instanceof InvalidUsernameError) {
  //     // TODO: Send invalid username error to client with socket.emit
  //     socket.emit("invalidUsername", new InvalidUsernameError());
  //   }
  //   if (err instanceof InvalidUsernameError) {
  //     message = err.message;
  //   }
  //   console.error(err);
  // }
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
