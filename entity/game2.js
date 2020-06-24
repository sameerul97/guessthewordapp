// var fs = require("fs");
var wordService = require("../services/wordService");
var rClient;

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
    this.timerSeconds = 8000;
  }
}
// Game.prototype

Game.prototype.updateGameInstanceChosenWord = function (chosenWord) {
  rClient.set(
    "Game:" + this.gameInstanceKey + ":ChosenWord:",
    this.chosenWord,
    (err, reply) => {
      // TODO: error handle if UPDATE gameInstance chosenWord fails
      if (err) console.log("ERR", err);
    }
  );
};

Game.prototype.updateGameInstance = function () {
  // console.log("UPdating redis DB", this.gameInstanceKey, this)
  // console.log()
  rClient.set("Game:" + this.gameInstanceKey, JSON.stringify(this), (err, reply) => {
      // TODO: error handle if UPDATE gameInstance fails
      if (err) console.log("ERR", err);
    }
  );
};

Game.prototype.getGameInstance = function(){
  rClient.get("Game:" + this.gameInstanceKey , (err, reply) => {
    // TODO: error handle if UPDATE gameInstance fails
    if (err) console.log("ERR", err);
    var tempGame = JSON.parse(reply);
    tempGame.__proto__ = Game.prototype;
    console.log("REDIS DATA", tempGame)
    // this.users = tempGame.users;
    // this.roundsIndex = tempGame.roundsIndex;
    // this.userIndex = tempGame.userIndex;
    return tempGame;
    }
  );
}
Game.prototype.gameOver = function () {
  if (this.userIndex === this.users.length) {
    return true;
  }
  return false;
};

Game.prototype.userRoundsFinished = function () {
  // (this.roundsIndex === 2) ? return true; : return false;
  if(this.roundsIndex === 3){
    return true;
  }
  return false; 
  // if (this.users[this.userIndex].rounds[0]) {
  //   if (this.users[this.userIndex].rounds[1]) {
  //     if (this.users[this.userIndex].rounds[2]) {
  //       return true;
  //     }
  //   }
  // }
  // return false;
};

Game.prototype.sendWords = function (socket, fn) {
  var data = wordService.getWord();
  // multiple destructuring
  var { chosenWord } = ({ options } = data);
  this.chosenWord = chosenWord;
  this.users[this.userIndex].rounds[this.roundsIndex] = true;
  this.roundsIndex++;
  // set chosenWord in REdis using rclient
  socket.emit("word", chosenWord);
  this.updateGameInstanceChosenWord();
  // console.log("Send words updating GAME INSTANCE")
  this.updateGameInstance();
  socket.to(this.roomName).emit("options", options);
  if (fn) fn();
};



Game.prototype.nextPlayerAlert = function (socket, socketId, io) {
  // console.log("")
  io.in(this.roomName).emit("nextPlayerAlert", {
    userGoingToPlay: socketId,
    timerSeconds: this.timerSeconds,
    // gameInstanceIndex: this.gameInstanceIndex
  });
  io.to(socketId).emit("youArePlayingNext", {
    // this.io.sockets.connected[socketId].emit('youArePlayingNext', {
    playing: true,
    // gameInstanceIndex: this.gameInstanceIndex
  });
};

Game.prototype.userAlreadyGuessed = function (socketId) {
  for (i in this.sers) {
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
Game.prototype.correctAnswer = function (socketId) {
  // console.log("Going to Looping ", this.users);
  this.users.forEach(function (user, index) {
    // console.log(user, this.users[index].scores);
    // user.id === socketId ? this.users[index].scores++ : false;
    if (user.id === socketId) {
      this.users[index].scores = this.users[index].scores + 1;
      // console.log("SCORE UDPATING GAME INSTANCE")
      this.updateGameInstance();
    }
  },this);

  // udpate correct user score, ??? update drawing user score as well ? SImon
  io.in(this.roomName).emit("scoresUpdated", {
    data: this.users.map(function (val) {
      // console.log({ id: val.id, score: val.scores });
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
Game.prototype.verifyAnswer = function (socketId, selectedAnswer) {
  var temp;
  if (selectedAnswer === this.chosenWord) {
    for (i in this.users) {
      if (this.users[i].id === socketId) {
        // console.log(this.users[i]);
        if (this.users[i].alreadyGuessed == false) {
          this.users[i].scores = this.users[i].scores + 1;
          this.users[i].alreadyGuessed = true;
          (temp = this.users[i].userName), this.users[i].scores;
          io.in(this.roomName).emit("scoresUpdated", {
            data: this.users.map(function (val) {
              return {
                id: val.id,
                score: val.scores,
              };
            }),
          });
          this.io.sockets.connected[socketId].emit("verifiedAnswer", {
            correct: true,
            correctAnswer: this.chosenWord,
          });
        }
      }
    }
  } else {
    for (i in this.users) {
      if (this.users[i].id === socketId) {
        this.users[i].alreadyGuessed = true;
        this.io.sockets.connected[socketId].emit("verifiedAnswer", {
          correct: false,
          correctAnswer: this.chosenWord,
        });
      }
    }
  }
};

Game.prototype.resetAlreadyGuessedProperty = function () {
  for (i in this.users) {
    this.users[i].alreadyGuessed = false;
  }
};

// FIXME: (rewrite) decoupling startgame method
Game.prototype.startGame = function (socket, gameInstanceKey) {
  if (this.gameInstanceKey == null) {
    // this.io = io;
    this.gameInstanceKey = gameInstanceKey;
    this.sendWords(socket);
  }

  // BUG: Interval needs to pull in new data frm REDIS
  var interval = setInterval(() => {
    console.log("COMING FROM INTERVAL ",this)
    this.getGameInstance();
    // console.log("UpdaTE THIs INTERVAL ",this)

    this.resetAlreadyGuessedProperty();
    if (this.gameOver()) {
      io.in(this.roomName).emit("gameOver", "score");
      clearInterval(interval);
    } else {
      this.sendWords(socket, () => {
        // returnData = word;
        // console.log("WORds callback, im assuming this is where the error is as this interval not pulling the data", this.users)

        if (this.userRoundsFinished()) {
          // console.log("User index update now")
          this.userIndex++;
          this.roundsIndex = 0;
          // updateUserIndex

          if (this.userIndex === this.users.length) {
            // console.log("users last round", this.chosenWord);
          } else {
            // BUG:Playing property is not updated on Redis DB
            this.users[this.userIndex].playing = true;
            // rClient.set(
            //   "Game:" + this.gameInstanceKey,
            //   JSON.stringify(this),
            //   (err, reply) => {
            //     if (err) console.log("ERR", err);
            //   }
            // );
            // this.getGameInstance()
            console.log("Send words callback updating GAME INSTANCE")
            this.updateGameInstance();
            this.nextPlayerAlert(socket, this.users[this.userIndex].id, io);
            clearInterval(interval);
          }
        } else{
          this.updateGameInstance();
        }
      });
    }
  }, this.timerSeconds);
};

// static method enables Game module to set the Rclient without initiating new instance
Game.setRClient = (client) => {
  rClient = client;
};

module.exports = Game;

// module.exports = {
//   setRClient: client => { rClient = client },
//   Game
// }
