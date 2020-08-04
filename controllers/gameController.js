const GameService = require("../services/gameService");
const RoomService = require("../services/roomService");
const e = require("express");
require("../entity/game3");

const GameClass = require("../entity/game3");
require("../errors/gameError");

const playGame = (socket) => async (roomName, reply) => {
  try {
    console.log("Socket admin", socket._admin);
    if (!socket._admin) {
      throw new OnlyAdminCanStartGameError();
    }
    var roomExist = await RoomService.roomExist(roomName);
    var gameInstanceKey = await RoomService.getRoomKey(roomName);
    console.log(gameInstanceKey);
    var clientsInRoom = await RoomService.getAllClientIdsInRoom(roomName);
    if (clientsInRoom.length < 2) {
      throw new NoOfUserNotMetError();
    }
    reply({ success: true });
    await GameService.generateGameEnvironment(clientsInRoom);
    await GameService.gameInit(
      roomName,
      clientsInRoom,
      socket,
      gameInstanceKey
    );
  } catch (err) {
    if (err instanceof OnlyAdminCanStartGameError) {
      reply({ error: true, errorType: err.name });
    }
    if (err instanceof NoOfUserNotMetError) {
      reply({ error: true, errorType: err.name });
    }
    if (err instanceof RoomNotInDbError) {
      console.error(err);
      socket.emit("roomVerified", {
        success: false,
        message: err.message,
      });
    }
    console.log(err);
  }
};

const handShakeListerner = (socket) => async (gameInstanceKey) => {
  try {
    var gameObject = await GameService.getGameObject(gameInstanceKey);
    var parsedGameObject = await GameService.gameParser(gameObject);
    await GameService.handShakeVerify(socket, parsedGameObject);
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
      console.log(gameInstanceKey);
      let gameObject = await GameService.getGameObject(gameInstanceKey);
      let game = await GameService.gameParser(gameObject);
      let users = game.users;
      let socketUserIndex = users.findIndex((user) => user.id === sid);
      let currentlyPlayingUser = game.user_index;
      if (game.game_over === false) {
        // If the user is last player and he is the last one within 2 player
        // if (socketUserIndex === users.length - 1 && users.length === 2) {
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
        //
        else if (users[currentlyPlayingUser].id === sid) {
          game.pause_game = true;
          game.pause_game_reason = sid;
          console.log("Need to switch next player");
          GameClass.updateCurrentInstanceDataInRedis(game);
        } else {
          console.log("Need to remove this player from the game session");
        }

        // 2) [p1,p2,p3] p2 playing p2 leaving, should switch p3 as currently playing as p2 left
        // Steps:
        //    Hit pause and Clear interval loop and start Game interval
        //    every seconds or 3
        //    Emit handshake with p3
        //    on success increment game user_index and let the room know p3 is playing

        // [p1,p2,p3] p1 playing p2 leaving, should switch to p3 as next player and ignore p2
        // Steps:
        //    Hit pause (where to pause)
        //    Run gameInterval every seconds or 3
        //    Emit handshake with p3
        //    on success increment game user_index and let the room know p3 is playing

        // if (game.users.length === 2) {
        //   console.log("its gameover");
        // }
      }

      /*
        1) [p1,p2] p1 playing p2 leaving, should stop the game and show p1 is winner
        2) [p1,p2] p2 playing p2 leaving, should stop the game and show p1 is winner
        3) [p1,p2] p2 playing p2
      */
      // if(game.user_index === socketUserIndex){

      // }
      // if (socketUserIndex === game.users.length - 1) {
      //   console.log("Gameover")
      // }
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
