const GameService = require("../services/gameService");
const RoomService = require("../services/roomService");
const e = require("express");
require("../entity/game3");

const GameClass= require("../entity/game3");
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
      let sid = socket.id;
      console.log(rooms); // an array containing every room a given id has joined.
      let roomname = rooms[1];
      let gameInstanceKey = await RoomService.getRoomKey(roomname);
      console.log(gameInstanceKey);
      let gameObject = await GameService.getGameObject(gameInstanceKey);
      let game = await GameService.gameParser(gameObject);
      let users = game.users;
      let socketUserIndex = users.findIndex((user) => user.id === sid);
      if (game.game_over === false) {
        if (socketUserIndex === game.users.length - 1) {
          game.game_over = true;
          GameClass.updateCurrentInstanceDataInRedis(game);
        }
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
