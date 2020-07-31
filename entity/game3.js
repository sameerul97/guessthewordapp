// var fs = require("fs");
var wordService = require("../services/wordService");
var rClient;
const { Redis } = require("../config");

class Game {
  constructor(roomName, users, index = 0, userIndex = 0, tempIndex = 0) {
    this.roomName = roomName;
    this.users = users;
    this.index = index;
    this.userIndex = userIndex;
    this.roundsIndex = 0;
    this.currentPlayerIndex = null;
    this.gameInstanceKey = null;
    this.chosenWord = null;
    this.timerSeconds = 20000;
  }
}

Game.prototype.updateGameInstanceChosenWord = function (chosenWord) {
  rClient.set(
    Redis.KeyNames.GameInstanceKey +
      this.gameInstanceKey +
      Redis.KeyNames.GameInstanceChosenWord,
    this.chosenWord,
    (err, reply) => {
      // TODO: error handle if UPDATE gameInstance chosenWord fails
      if (err) console.log("ERR", err);
    }
  );
};

Game.prototype.gameOver = function (game) {
  if (game.userIndex === game.users.length) {
    return true;
  }
  return false;
};

Game.prototype.userRoundsFinished = function (game) {
  if (game.users[game.userIndex].rounds[0]) {
    if (game.users[game.userIndex].rounds[1]) {
      if (game.users[game.userIndex].rounds[2]) {
        return true;
      }
    }
  }
  return false;
};

Game.prototype.sendWords = async function (socket, fn) {
  var data = wordService.getWord();
  // multiple destructuring
  var { chosenWord } = ({ options } = data);
  this.chosenWord = chosenWord;
  this.users[this.userIndex].rounds[this.roundsIndex] = true;
  this.roundsIndex++;
  socket.emit("word", chosenWord);
  this.updateGameInstanceChosenWord();
  await updateCurrentInstanceDataInRedis(this);
  socket.to(this.roomName).emit("options", options);
  if (fn) fn();
};

Game.prototype.nextPlayerAlert = function (socket, socketId, game, io) {
  io.in(game.roomName).emit("nextPlayerAlert", {
    userGoingToPlay: socketId,
    timerSeconds: game.timerSeconds,
    // gameInstanceIndex: this.gameInstanceIndex
  });
  io.to(socketId).emit("youArePlayingNext", {
    playing: true,
    // gameInstanceIndex: this.gameInstanceIndex
  });
};

Game.prototype.userAlreadyGuessed = function (socketId) {
  for (i in this.users) {
    if (this.users[i].id === socketId) {
      return this.users[i].alreadyGuessed;
    }
  }
};

Game.prototype.updateAlreadyGuessedProperty = function (socketId) {
  // this.users.forEach((user,index)=> this.users[index].alreadyGuessed = (user.id === socketId) )
  for (i in this.users) {
    if (this.users[i].id === socketId) {
      this.users[i].alreadyGuessed = true;
    }
  }
};

Game.prototype.wrongAnswer = function (socketId) {
  io.sockets.connected[socketId].emit("verifiedAnswer", {
    correct: false,
    correctAnswer: this.chosenWord,
  });
};

Game.prototype.correctAnswer = function (socketId, game) {
  this.users.forEach(async function (user, index) {
    if (user.id === socketId) {
      this.users[index].scores = this.users[index].scores + 1;
      // FIXME: Async neccessary ? need Testing
      await updateCurrentInstanceDataInRedis(this);
    }
  }, this);

  io.in(this.roomName).emit("scoresUpdated", {
    data: this.users.map(function (val) {
      return {
        id: val.id,
        score: val.scores,
      };
    }),
  });
  io.sockets.connected[socketId].emit("verifiedAnswer", {
    correct: true,
    correctAnswer: this.chosenWord,
  });
};

Game.prototype.resetAlreadyGuessedProperty = function (game) {
  for (i in game.users) {
    game.users[i].alreadyGuessed = false;
  }
};

Game.prototype.startGame = function (socket, gameInstanceKey) {
  if (this.gameInstanceKey == null) {
    this.gameInstanceKey = gameInstanceKey;
    this.sendWords(socket);
  }

  var interval = setInterval(() => {
    intervalHandler(socket, this, interval);
  }, this.timerSeconds);
};

Game.prototype.storeInDatabase = async function (game) {};

Game.prototype.deleteGameInstanceFromRedis = async function (game) {
  rClient.DEL(Redis.KeyNames.GameInstanceKey + game.gameInstanceKey);
  rClient.DEL(
    Redis.KeyNames.GameInstanceKey +
      game.gameInstanceKey +
      Redis.KeyNames.GameInstanceChosenWord
  );
};

Game.prototype.deleteRoomnameFromRedis = async function (game) {
  rClient.DEL(Redis.KeyNames.Roomname + game.roomName);
};

Game.prototype.deleteSocketIdUsernameFromRedis = async function (game) {
  for (i in game.users) {
    rClient.DEL(Redis.KeyNames.SocketIdUsername + game.users[i].id);
  }
};

async function intervalHandler(socket, thisGameIntance, thisInterval) {
  let self = await getCurrentInstanceDataFromRedis(thisGameIntance);
  if (self.gameOver(self)) {
    io.in(self.roomName).emit("gameOver", "score");
    clearInterval(thisInterval);
    self.deleteGameInstanceFromRedis(self);
    self.deleteRoomnameFromRedis(self);
    self.deleteSocketIdUsernameFromRedis(self);
  } else {
    self.sendWords(socket, async () => {
      if (self.userRoundsFinished(self)) {
        self.userIndex++;
        self.roundsIndex = 0;
        await updateCurrentInstanceDataInRedis(self);
        if (self.userIndex === self.users.length) {
        } else {
          self.users[self.userIndex].playing = true;
          self.nextPlayerAlert(socket, self.users[self.userIndex].id, self, io);
          clearInterval(thisInterval);
        }
      }
    });
  }
}

// FIXME:add this method within the gameclass ?
function updateCurrentInstanceDataInRedis(game) {
  return new Promise((resolve, reject) => {
    rClient.set(
      Redis.KeyNames.GameInstanceKey + game.gameInstanceKey,
      JSON.stringify(game),
      (err, reply) => {
        // TODO: error handle if SET / UPDATE gameInstance fails
        if (err) {
          console.log("ERR", err);
          resolve(false);
        }
        resolve(true);
      }
    );
  });
}

// FIXME:add this method within the gameclass ?
function getCurrentInstanceDataFromRedis(game) {
  return new Promise((resolve, reject) => {
    rClient.get(
      Redis.KeyNames.GameInstanceKey + game.gameInstanceKey,
      (err, reply) => {
        // TODO: error handle if get gameInstance fails
        if (err) console.log("ERR", err);
        var tempGame = JSON.parse(reply);
        tempGame.__proto__ = Game.prototype;
        // return tempGame;
        resolve(tempGame);
      }
    );
  });
}

// static method for Game class
Game.setRClient = (client) => {
  rClient = client;
};

module.exports = Game;
