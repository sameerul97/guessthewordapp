const GameService = require("../services/gameService");
const RoomService = require("../services/roomService");
const { NameSpace, Redis } = require("../config");

require("../entity/game3");

const GameClass = require("../entity/game3");
require("../errors/gameError");

const playGame = (socket) => async (roomName, reply) => {
  // try {
  // if (!socket._admin) {
  //   throw new OnlyAdminCanStartGameError();
  // }
  if (!socket._admin) {
    return new OnlyAdminCanStartGameError();
  }

  var roomExist = await RoomService.roomExist(roomName);

  if (roomExist === false) {
    return new RoomNotInDbError();
  }

  var gameInstanceKey = await RoomService.getRoomKey(roomName);
  var gameObject = await GameService.getGameObject(gameInstanceKey);

  if (gameObject != null) {
    return new GameAlreadyStarted();
  }

  var clientIdsInRoom = await RoomService.getAllClientIdsInRoom(roomName);

  if (clientIdsInRoom.length < 2) {
    return new NoOfUserNotMetError();
  }

  var usersInRoom = clientIdsInRoom.map(
    (id) => Redis.KeyNames.SocketIdUsername + id
  );

  var getAllUsersInRoom = await RoomService.getAllUsersInRoom(usersInRoom);
  var arr = await RoomService.mapUserIdWithUsername(
    clientIdsInRoom,
    getAllUsersInRoom
  );

  reply({ success: true });

  await GameService.generateGameEnvironment(arr);
  await GameService.gameInit(roomName, arr, socket, gameInstanceKey);
  // } catch (err) {
  //   if (err instanceof OnlyAdminCanStartGameError) {
  //     reply({ error: true, errorType: err.name });
  //   }

  //   if (err instanceof NoOfUserNotMetError) {
  //     reply({ error: true, errorType: err.name });
  //   }

  //   if (err instanceof RoomNotInDbError) {
  //     console.error(err);
  //     socket.emit("roomVerified", {
  //       success: false,
  //       message: err.message,
  //     });
  //   }

  //   console.log(err);
  // }
};

const handShakeListerner = (socket) => async (gameInstanceKey) => {
  try {
    var gameObject = await GameService.getGameObject(gameInstanceKey);
    var parsedGameObject = await GameService.gameParser(gameObject);

    if (parsedGameObject.game_over === false) {
      await GameService.handShakeVerify(socket, parsedGameObject);
    } else {
      // io.in(parsedGameObject.room_name).emit(
      //   "gameOver",
      //   "score",
      //   parsedGameObject.game_over_reason
      // );
    }
  } catch (err) {
    console.log(err);
  }
};

const verifyAnswer = (socket) => async (data) => {
  const { gameInstanceIndex, selectedAnswer } = data;
  try {
    // running both function in parallel as one function is not dependent on the other
    let [isCorrect, gameObject] = await Promise.all([
      GameService.checkAnswer(gameInstanceIndex, selectedAnswer),
      GameService.getGameObject(gameInstanceIndex),
    ]);

    var parsedGameObject = await GameService.gameParser(gameObject);
    var userAlreadyGuessed = await GameService.userAlreadyGuessed(
      socket.id,
      parsedGameObject
    );

    if (!userAlreadyGuessed) {
      await GameService.verifyAnswer(socket.id, parsedGameObject, isCorrect);
    }
  } catch (err) {
    console.log(err);
  }
};

const clearCanvas = (socket) => async (data) => {
  const { roomName } = data;
  const { gameInstanceIndex } = data;

  try {
    var gameObject = await GameService.getGameObject(gameInstanceIndex);
    var parsedGameObject = await GameService.gameParser(gameObject);

    io.in(parsedGameObject.roomName).emit("clearCanvas", true);
  } catch (err) {
    console.log("Wrong Game Key");
  }
};

const disconnecting = (socket) => async (reason) => {
  console.log("Disconnect", reason);
  io.of("/").adapter.clientRooms(socket.id, async (err, rooms) => {
    if (err) {
      console.error(err);
    } else {
      var sid = socket.id;
      console.log(rooms); // an array containing every room a given id has joined.
      let roomname = rooms[1];

      let gameInstanceKey = await RoomService.getRoomKey(roomname);
      let gameObject = await GameService.getGameObject(gameInstanceKey);
      if (gameObject != null) {
        let game = await GameService.gameParser(gameObject);

        let users = game.users;
        let socketUserIndex = users.findIndex((user) => user.id === sid);
        let currentlyPlayingUser = game.user_index;

        if (game.game_over === false) {
          // If the user is the last one within 2 player then gameover
          if (users.length === 2) {
            game.game_over = true;
            game.game_over_reason = "Other user left the game!";
            GameClass.updateCurrentInstanceDataInRedis(game);
          }

          // If the user is last player and the user is currently playing then gameover
          else if (
            socketUserIndex === game.users.length - 1 &&
            users[currentlyPlayingUser].id === sid
          ) {
            game.game_over = true;
            game.game_over_reason = "User left !";
            GameClass.updateCurrentInstanceDataInRedis(game);
          }

          // if currently playing user leaves then switch to next user in the room
          else if (users[currentlyPlayingUser].id === sid) {
            game.pause_game = true;
            game.pause_game_reason = sid;
            console.log("Need to switch next player");
            GameClass.updateCurrentInstanceDataInRedis(game);
          }

          // Users whos not drawing leaving
          else {
            game.users_left = true;
            game.users_left_the_game.push(sid);
            GameClass.updateCurrentInstanceDataInRedis(game);
            console.log("Need to remove this player from the game session");
          }
        }
      }
    }
  });
};

module.exports = {
  playGame,
  handShakeListerner,
  verifyAnswer,
  clearCanvas,
  disconnecting,
};
