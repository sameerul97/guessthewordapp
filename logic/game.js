var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('./game_data/data.json', 'utf8'));
var roomNames = obj.roomNames;
var guessWords = obj.guessWords;
var word = require('../components/word');

/**
 * Needed a multiton pattern to implement game logic, for every game user starts 'Game' instance is created
 * Game class handles the logic of sending user the cord and other users in the room with optional words. 
 * Automatically assign the next users after each user has played 'rounds' N times.
 * Keeping track of score 
 */

/**
 * @class
 */
class Game {

    constructor(roomName, users, index = 0, userIndex = 0, tempIndex = 0, ) {
        // Current name is used to emit event to all the users in room
        this.roomName = roomName;
        // users var holds array of object containing users data. 
        /**
         * {
         * playing: false,
         * rounds: [false, false, false],
         * scores: 0,
         * playing: false
         * }
         */
        this.users = users;
        // Index is not used
        this.index = index;
        // userIndex refer to currently playing user in the room.
        this.userIndex = userIndex;
        // rounds refers to number of time each user gets to guess the word. ie 3
        // roundsIndex keeps track whether each user played three time and reset it to 0 once a user played all rounds
        this.roundsIndex = 0;
        // currentPlayerIndex not used
        this.currentPlayerIndex = null;
        // holds where the game instance is stored in the server memory (Array) this data is sent to client and received back and forth
        // Possible apprach was to get the socket.Id and check which room socket is in but that would be looping through 
        // N of sockets in server. Using Index we keep performance to the low and event loop is running
        this.gameInstanceIndex = null;
        // When a answer is clickd by the users and sent to server, it is verified against this variable which holds the 
        // current Chosen word (the answer)
        this.chosenWord = null;
        // Refers to seconds each user gets between each rounds to draw the word
        this.timerSeconds = 15000;
    }
    /**
     * Start Game
     * Initiates the setInterval function which gets called every 'this.timeSeconds'. It sends the selected word 
     * the current user (playing socket) and emits a event to other user in the room
     * @param socket sockets Instance who is currently playing
     * @param io Main Socket IO server instance 
     * @param gameInstanceIndex is the index where the created gameinstance stored
     * 
     */
    startGame(socket, io, gameInstanceIndex, callback) {
        // StartGame first run 
        if (this.gameInstanceIndex == null) {
            this.io = io;
            this.gameInstanceIndex = gameInstanceIndex;
            var returnData = this.sendWords(socket, this.userIndex);
        }
        var interval = setInterval(() => {
            this.resetAlreadyGuessedProperty();
            if (this.gameOver()) {
                this.io.in(this.roomName).emit("gameOver", "score");
                clearInterval(interval);
            } else {
                this.sendWords(socket, this.userIndex, (word) => {
                    returnData = word;
                    if (this.userRoundsFinished()) {
                        this.userIndex++;
                        this.roundsIndex = 0;
                        if (this.userIndex === (this.users.length)) {} else {
                            this.users[this.userIndex].playing = true;
                            this.nextPlayerAlert(socket, this.users[this.userIndex].id, io)
                            clearInterval(interval);

                        }
                    }
                });
            }
        }, this.timerSeconds)
        return returnData;
    }
    // sendWords
    sendWords(socket, index, fn) {
        var data = word.getWord(guessWords);
        // multiple destructuring  
        var {
            chosenWord
        } = {
            options
        } = data;
        this.chosenWord = chosenWord;
        this.users[index].rounds[this.roundsIndex] = true;
        this.roundsIndex++;
        socket.emit('word', chosenWord);
        socket.to(this.roomName).emit('options', options);
        if (fn) fn(word);
    }

    tempFunc() {}
    verifyAnswer(socketId, selectedAnswer) {
        var temp;
        if (selectedAnswer === this.chosenWord) {
            for (i in this.users) {
                if (this.users[i].id === socketId) {
                    // console.log(this.users[i]);
                    if (this.users[i].alreadyGuessed == false) {
                        this.users[i].scores = this.users[i].scores + 1;
                        this.users[i].alreadyGuessed = true;
                        temp = this.users[i].userName, this.users[i].scores;
                        this.io.in(this.roomName).emit('scoresUpdated', {
                            data: this.users.map(function (val) {
                                return {
                                    id: val.id,
                                    score: val.scores
                                }
                            })
                        });
                        this.io.sockets.connected[socketId].emit('verifiedAnswer', {
                            correct : true,
                            correctAnswer : this.chosenWord,
                        })
                    }
                }
            }
        } else {
            for (i in this.users) {
                if (this.users[i].id === socketId) {
                    this.users[i].alreadyGuessed = true;
                    this.io.sockets.connected[socketId].emit('verifiedAnswer', {
                        correct : false,
                        correctAnswer : this.chosenWord,
                    })
                }
            }
        }
    }

    nextPlayerAlert(socket, socketId, io) {
        this.io.in(this.roomName).emit('nextPlayerAlert', {
            userGoingToPlay: socketId,
            timerSeconds: this.timerSeconds,
            gameInstanceIndex: this.gameInstanceIndex
        });
        this.io.sockets.connected[socketId].emit('youArePlayingNext', {
            playing: true,
            gameInstanceIndex: this.gameInstanceIndex
        })
    }

    clearSocketsCanvas() {
        this.io.in(this.roomName).emit('clearCanvas', true);
    }
    gameOver() {
        if (this.userIndex === this.users.length) {
            return true;
        }
        return false;
    }
    userRoundsFinished() {
        if (this.users[this.userIndex].rounds[0]) {
            if (this.users[this.userIndex].rounds[1]) {
                if (this.users[this.userIndex].rounds[2]) {
                    return true;
                }
            }
        }
        return false;
    }
    // method fired after each round is finished
    resetAlreadyGuessedProperty(){
        for (i in this.users) {
            this.users[i].alreadyGuessed = false;
        }
    }
}
module.exports = Game;