// var fs = require("fs");
var wordService = require("../services/wordService");
var rClient;
const { Redis } = require("../config");

class Game {
  constructor(
    roomName,
    users,
    gameInstanceKey,
    index = 0,
    userIndex = 0,
    tempIndex = 0
  ) {
    this.room_name = roomName;
    this.users = users;
    this.index = index;
    this.user_index = userIndex;
    this.rounds_index = 0;
    this.currentPlayerIndex = null;
    this.game_instance_key = gameInstanceKey;
    this.chosenWord = null;
    this.timer_seconds = 20000;
    this.game_started = false;
    // Pause game flag is checked on each interval execution
    // pause game flag is used to check if the currently drawing user exits the game
    this.pause_game = false;
    this.pause_game_reason = null;
    // Users who is not drawing left the game
    this.users_left = false;
    this.users_left_the_game = [];
    // Game over flag is checked on each interval execution
    this.game_over = false;
    this.game_over_reason = null;
  }
}

Game.prototype.updateGameInstanceChosenWord = function (chosenWord) {
  rClient.set(
    Redis.KeyNames.GameInstanceKey +
      this.game_instance_key +
      Redis.KeyNames.GameInstanceChosenWord,
    this.chosenWord,
    (err, reply) => {
      // TODO: error handle if UPDATE gameInstance chosenWord fails
      if (err) console.log("ERR", err);
    }
  );
};

Game.prototype.gameOver = function (game) {
  // if (game.user_index === game.users.length) {
  //   game.game_over = true;
  //   return game.gameOver;
  // }
  return game.user_index === game.users.length || game.game_over;
};

Game.prototype.userRoundsFinished = function (game) {
  if (game.users[game.user_index].rounds[0]) {
    if (game.users[game.user_index].rounds[1]) {
      if (game.users[game.user_index].rounds[2]) {
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
  this.users[this.user_index].rounds[this.rounds_index] = true;
  this.rounds_index++;

  socket.emit("word", chosenWord);
  this.updateGameInstanceChosenWord();
  await this.constructor.updateCurrentInstanceDataInRedis(this);

  socket.to(this.room_name).emit("options", options);

  if (fn) fn();
};

Game.prototype.nextPlayerAlert = function (socket, socketId, game, io) {
  io.in(game.room_name).emit("nextPlayerAlert", {
    userGoingToPlay: socketId,
    timerSeconds: game.timer_seconds,
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

      await this.constructor.updateCurrentInstanceDataInRedis(this);
    }
  }, this);

  io.in(this.room_name).emit("scoresUpdated", {
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

Game.prototype.pauseGame = function (socketId, game) {
  io.in(game.room_name).emit("PauseGameAlert", game.pause_game_reason);

  io.in(game.room_name).emit("nextPlayerAlert", {
    userGoingToPlay: socketId,
    timerSeconds: game.timer_seconds,
    // gameInstanceIndex: this.gameInstanceIndex
  });

  io.to(socketId).emit("switchingToNextPlayer", {
    playing: true,
    timerSeconds: game.timer_seconds / 2 + 5000,

    // gameInstanceIndex: this.gameInstanceIndex
  });
};

Game.prototype.removeUser = async function (game, leavingUserId) {
  let usersInGame = game.users;

  return usersInGame.filter((user, index, arr) => user.id != leavingUserId);
};

Game.prototype.removeMultipleUser = async function (game) {
  let usersLeavingGame = game.users_left_the_game;
  var newUsers = [];

  for (gameUser in game.users) {
    var found = false;

    for (j in usersLeavingGame) {
      if (usersLeavingGame[j] === game.users[gameUser].id) {
        found = true;
      }
    }

    found === false ? newUsers.push(game.users[gameUser]) : null;
  }

  return newUsers;
};

Game.prototype.resetAlreadyGuessedProperty = function (game) {
  for (i in game.users) {
    game.users[i].alreadyGuessed = false;
  }
};

Game.prototype.storeInDatabase = async function (game) {};

Game.prototype.deleteGameInstanceFromRedis = async function (game) {
  rClient.DEL(Redis.KeyNames.GameInstanceKey + game.game_instance_key);

  rClient.DEL(
    Redis.KeyNames.GameInstanceKey +
      game.game_instance_key +
      Redis.KeyNames.GameInstanceChosenWord
  );
};

Game.prototype.deleteRoomnameFromRedis = async function (game) {
  rClient.DEL(Redis.KeyNames.Roomname + game.room_name);
};

Game.prototype.deleteSocketIdUsernameFromRedis = async function (game) {
  for (i in game.users) {
    rClient.DEL(Redis.KeyNames.SocketIdUsername + game.users[i].id);
  }
};

Game.prototype.exitGameLoopInterval = function (gameLoopInterval) {
  clearInterval(gameLoopInterval);
};

Game.prototype.startGame = function (socket) {
  // if (this.game_instance_key == null) {
  if (this.user_index === 0) {
    // this.game_instance_key = gameInstanceKey;
    this.game_started = true;
    this.sendWords(socket);
  }

  var interval = setInterval(() => {
    intervalHandler(socket, this, interval);
  }, this.timer_seconds);
};

async function intervalHandler(socket, thisGameIntance, thisInterval) {
  let self = await Game.getCurrentInstanceDataFromRedis(thisGameIntance);
  if (self.users_left) {
    self.users = await self.removeMultipleUser(self);

    io.in(self.room_name).emit("aUserJoined", self.users);

    if (self.users.length === 1) {
      self.game_over = true;
      self.game_over_reason = "Other users leftt!";
      io.in(self.room_name).emit("gameOver", "score", self.game_over_reason);
      self.exitGameLoopInterval(thisInterval);
    }

    self.users_left = false;
    self.users_left_the_game = [];

    await Game.updateCurrentInstanceDataInRedis(self);
  }
  // if the drawing (playing) user left the game
  if (self.pause_game) {
    let self = await Game.getCurrentInstanceDataFromRedis(thisGameIntance);

    self.exitGameLoopInterval(thisInterval);

    self.user_index++;
    self.rounds_index = 0;
    self.pause_game = false;
    self.timer_seconds = 5000;

    await Game.updateCurrentInstanceDataInRedis(self);

    self.users[self.user_index].playing = true;
    self.user_index--;

    var newUsers = await self.removeUser(self, self.pause_game_reason);
    self.users = newUsers;

    // // newly added
    // self.users = await self.removeMultipleUser(self);

    // io.in(self.room_name).emit("aUserJoined", self.users);

    if (self.users.length === 1) {
      self.game_over = true;
      self.game_over_reason = "Other users leftt!";
      io.in(self.room_name).emit("gameOver", "score", self.game_over_reason);
      self.exitGameLoopInterval(thisInterval);
    } else {
      await self.pauseGame(self.users[self.user_index].id, self);
      io.in(self.room_name).emit("aUserJoined", self.users);
    }

    // self.users_left = false;
    // self.users_left_the_game = [];
    // // newly end

    // self.nextPlayerAlert(socket, self.users[self.user_index].id, self, io);
    self.timer_seconds = 20000;

    await Game.updateCurrentInstanceDataInRedis(self);
    // setTimeout(async () => {}, self.timer_seconds);
  }
  // Users left the game
  // else if (self.users_left) {
  //   self.users = await self.removeMultipleUser(self);

  //   io.in(self.room_name).emit("aUserJoined", self.users);

  //   if (self.users.length === 1) {
  //     self.game_over = true;
  //     self.game_over_reason = "Other users leftt!";
  //     io.in(self.room_name).emit("gameOver", "score", self.game_over_reason);
  //     self.exitGameLoopInterval(thisInterval);
  //   }

  //   self.users_left = false;
  //   self.users_left_the_game = [];

  //   await Game.updateCurrentInstanceDataInRedis(self);
  // }
  // Gameover
  else if (self.gameOver(self)) {
    self.game_over = true;

    io.in(self.room_name).emit("gameOver", "score", self.game_over_reason);
    self.exitGameLoopInterval(thisInterval);

    // self.deleteGameInstanceFromRedis(self);
    // self.deleteRoomnameFromRedis(self);
    // self.deleteSocketIdUsernameFromRedis(self);
    await Game.updateCurrentInstanceDataInRedis(self);
  }
  // sendwords (gameloop)
  else {
    console.log(socket.connected);
    self.sendWords(socket, async () => {
      if (self.userRoundsFinished(self)) {
        self.user_index++;
        self.rounds_index = 0;

        await Game.updateCurrentInstanceDataInRedis(self);

        if (self.user_index === self.users.length) {
        } else {
          self.users[self.user_index].playing = true;

          self.nextPlayerAlert(
            socket,
            self.users[self.user_index].id,
            self,
            io
          );

          self.exitGameLoopInterval(thisInterval);
        }
      }
    });
  }
}

Game.updateCurrentInstanceDataInRedis = function (game) {
  return new Promise((resolve, reject) => {
    rClient.set(
      Redis.KeyNames.GameInstanceKey + game.game_instance_key,
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
};

Game.getCurrentInstanceDataFromRedis = function (game) {
  return new Promise((resolve, reject) => {
    rClient.get(
      Redis.KeyNames.GameInstanceKey + game.game_instance_key,
      (err, reply) => {
        // TODO: error handle if get gameInstance fails
        if (err) console.log("ERR", err);

        var tempGame = JSON.parse(reply);
        tempGame.__proto__ = Game.prototype;

        resolve(tempGame);
      }
    );
  });
};

// static method for Game class
Game.setRClient = (client) => {
  rClient = client;
};

module.exports = Game;
