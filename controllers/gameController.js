const GameService = require("../services/gameService");
const RoomService = require("../services/roomService");
const e = require("express");
// const Game = require("../entity/game2");
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
