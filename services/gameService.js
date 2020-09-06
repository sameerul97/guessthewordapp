var rClient;
var Game = require("../entity/game3");
const { v4: uuidv4 } = require("uuid");
const { Redis } = require("../config");
module.exports = {
  setRClient: (client) => {
    rClient = client;
  },

  generateGameEnvironment: async (clients, adminSocketId) => {
    return new Promise((resolve, reject) => {
      resolve(
        clients.forEach(
          (item, i) =>
            (clients[i] = {
              id: item.id,
              name: item.name,
              rounds: [false, false, false],
              scores: 0,
              alreadyGuessed: false,
              playing: item === adminSocketId,
            })
        )
      );
    });
  },

  gameInit: async (roomName, users, socket, gameInstanceKey) => {
    return new Promise((resolve, reject) => {
      const NewGame = new Game(roomName, users, gameInstanceKey);
      // const gameInstanceKey = uuidv4();
      NewGame.startGame(socket);

      io.in(roomName).emit("setGameInstance", gameInstanceKey);
      gameJson = JSON.stringify(NewGame);
      // TODO:Delete the GameObject on Gameover or user leaves
      rClient.set(
        Redis.KeyNames.GameInstanceKey + gameInstanceKey,
        gameJson,
        (err, reply) => {
          // TODO: error handle if UPDATE gameInstance fails
          if (err) console.log("ERR", err);
        }
      );
    });
  },

  handShakeVerify: async (socket, gameInstance) => {
    setTimeout(() => gameInstance.startGame(socket), 3000);
  },

  checkAnswer: async (gameInstanceKey, selectedAnswer) => {
    return new Promise((resolve, reject) => {
      rClient.get(
        Redis.KeyNames.GameInstanceKey +
          gameInstanceKey +
          Redis.KeyNames.GameInstanceChosenWord,
        (err, data) => {
          if (err) {
            // TODO: error handle if chosenword retuns error (tampered key)
            reject(new Error("Unable to get chosenWord for your room"));
          }
          selectedAnswer === data ? resolve(true) : resolve(false);
        }
      );
    });
  },

  userAlreadyGuessed: async (socketId, gameInstance) => {
    return new Promise((resolve, reject) => {
      if (!gameInstance.userAlreadyGuessed(socketId)) {
        // gameInstance.updateAlreadyGuessedProperty(socketId);
        // BUG:Check / test whether updateGameInstance  method is required
        // gameInstance.updateGameInstance()
        resolve(false);
      } else {
        // gameInstance.updateAlreadyGuessedProperty(socketId);
        // BUG:Check whether updateGameInstance  method is required
        // gameInstance.updateGameInstance()
        resolve(true);
      }
    });
  },

  verifyAnswer: async (socketId, gameInstance, isCorrect) => {
    if (isCorrect) {
      gameInstance.correctAnswer(socketId);
    } else {
      gameInstance.wrongAnswer(socketId);
    }
  },

  getGameObject: async (gameInstanceKey) => {
    return new Promise((resolve, reject) => {
      rClient.get(
        Redis.KeyNames.GameInstanceKey + gameInstanceKey,
        (err, reply) => {
          if (err) {
            // TODO: error handle if get gameObject retuns error (tampered key)
            console.log(err);
            reject(err);
          } else {
            resolve(reply);
          }
        }
      );
    });
  },

  gameParser: async (gameObject) => {
    return new Promise((resolve, reject) => {
      var tempGame = JSON.parse(gameObject);
      tempGame.__proto__ = Game.prototype;
      // console.log(tempGame);
      resolve(tempGame);
    });
  },
};
