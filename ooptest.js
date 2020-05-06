// module.exports = {
//     myVar: null,
//     index: 0,
//     data: 'oldata',
//     setMyVar: function (para, callback) {
//         // console.log(data);
//         // console.log(this.data);
//         this.myVar = para;
//         this.index = 0;
//         callback();
//     },
//     showVar: function () {
//         // console.log('arrow',this.data);

//         console.log("YO1 ", this.index)
//         module.exports.logFun(this.index, () => {
//             this.index++;
//             if (this.index == ((this.myVar.length) - 1)) {
//                 console.log('over')
//             }
//         });
//         // this.index++;
//         //    console.log("YO2 ", this.index)

//         var setTimer = setInterval(() => {
//             // if (this.index == ((this.myVar.length) - 1)) {
//                 // console.log('over')
//             // } else {
//                 module.exports.logFun(this.index, () => {
//                     if (this.index == ((this.myVar.length) - 1)) {
//                         console.log('over');
//                         clearInterval(setTimer);
//                     } else{
//                         this.index++;
//                     }
//                 });
//                 // this.index++;
//             // }
//         }, 1000)
//     },
//     logFun: function (index, callbackFn) {
//         // var data = myVar;
//         // console.log("YO", data, this.myVar)

//         // for(i in myVar){
//         console.log("YO")
//         console.log(this.myVar[index]);
//         callbackFn();
//         // }
//     },



// };
var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('./game_data/data.json', 'utf8'));
var roomNames = obj.roomNames;
var guessWords = obj.guessWords;
var word = require('./components/word');

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
        this.roomName = roomName;
        this.users = users;
        this.index = index;
        this.userIndex = userIndex;
        this.roundsIndex = 0;
        this.currentPlayerIndex = null;
        this.gameInstanceIndex = null;
        this.chosenWord = null;
        this.timerSeconds = 5000;
        // this.gameObj = Object.assign(this, {
        //     roomName,
        //     users,
        //     index,
        //     userIndex,
        //     tempIndex
        // });

    }
    // Note for self: Need to re write this class to send data to correct socket at the time.
    // Need a middleware function which returns word data and handle on answer click button  

    print(socket, io, gameInstanceIndex, callback) {
        // console.log("USERS : ", this.users)
        if (this.gameInstanceIndex == null) {
            this.io = io;
            this.gameInstanceIndex = gameInstanceIndex;
            var returnData = this.listAll(socket, this.userIndex);
        }
        // console.log("Game instance ", gameInstanceIndex, this.gameInstanceIndex);

        // console.log('Name is :' + this.name);
        // this.handshakeListerner(socket);

        // console.log('Index is :' + this.userIndex);
        // console.log('GAME INSTANCE is :' + this.gameObj.users[0].userName);
        // console.log("Return data ",returnData)
        // this.index++;
        var interval = setInterval(() => {

            if (this.userIndex === ((this.users.length))) {
                console.log("Game over for ", this.roomName);
                this.io.in(this.roomName).emit("gameOver", "score");
                // console.log(this.name.length);
                clearInterval(interval);
                // delete instance
                if (callback) callback();
            } else {
                // socket and io instance to send data to socket and others in room
                this.listAll(socket, this.userIndex, (word) => {
                    // Word is returned from the function and ready to send to client
                    // =+=++++++++++++++++++++++#########
                    // jus loop through notPlaying users and emit event to them and playing a seperate event.
                    returnData = word;
                    // console.log("Console");
                    if (this.users[this.userIndex].rounds[0]) {
                        if (this.users[this.userIndex].rounds[1]) {
                            if (this.users[this.userIndex].rounds[2]) {
                                // Need to emit a event to client (next user)
                                this.userIndex++;

                                this.roundsIndex = 0;
                                if (this.userIndex === (this.users.length)) { } else {
                                    this.users[this.userIndex].playing = true;
                                    // console.log("Emitting to : ", this.users[this.userIndex] )
                                    this.nextPlayerAlert(socket, this.users[this.userIndex].id, io)
                                    clearInterval(interval);

                                }
                            }
                        }
                    }
                    // return "SUP";
                    // this.index++;
                });
            }


        }, this.timerSeconds)
        return returnData;
    }
    listAll(socket, index, fn) {
        var data = this.users;
        // for(var i in data){
        // console.log("Word for ", data[index].userName, word.getWord(guessWords));
        // var words = word.getWord(guessWords);
        var data = word.getWord(guessWords);
        // multiple destructuring  
        var { chosenWord } = { options } = data;
        this.chosenWord = chosenWord;
        // console.log("Word for ", this.users[this.userIndex].userName, data);
        // console.log("Word for ", this.users[index].id);

        this.users[index].rounds[this.roundsIndex] = true;
        // console.log("Rounds for ", this.users[this.userIndex].rounds);
        this.roundsIndex++;
        console.log();
        socket.emit('word', chosenWord);
        socket.to(this.roomName).emit('options', options);
        // socket.broadcast.emit('options', options);
        if (fn) fn(word);

        // return word;

        // }
    }
    nextPlayerAlert(socket, socketId, io) {
        console.log("INCOMING SOC ID", this.users[this.userIndex].userName);
        // io.to(this.users[this.userIndex].id).emit('handshake', this.users[this.userIndex].userName);
        // socket.on('handshakeBoom', (data) => {
        //     console.log("Handhake initiated NOW", data);
        //     console.log(socket.userName)
        // })
        // // socket.emit('question', 'do you think so?', function (answer) {
        //     console.log(answer)
        // });

        this.io.sockets.connected[socketId].emit('youArePlayingNext', { playing: true, gameInstanceIndex: this.gameInstanceIndex })

        this.io.in(this.roomName).emit('nextPlayerAlert', { userGoingToPlay: socketId, timerSeconds: this.timerSeconds, gameInstanceIndex: this.gameInstanceIndex });

        // Working with acknowledgement
        // io.sockets.connected[socketId].emit('handshake', this.users[this.userIndex].userName , function(data){
        //     console.log(data);
        //     // console.log(socket.userName);
        // });
        // io.on('handshakeBoom', (data) => {
        //     console.log("Handhake initiated 12", data);
        //     console.log(socket.userName)
        // })
        // socket.broadcast.to(socketId).emit('handshake', this.users[this.userIndex].userName);

    }

    handshakeListerner(socket) {
        // socket.on('handshakeBoom', (data)=>{
        //     console.log("Handhake initiated 12",data);
        //     console.log(socket.userName)
        // })
    }
    tempFunc() {
        // console.log("Its okay okay");
        console.log("Next user about to play ", this.users[this.userIndex].id, " in ", this.roomName);
        // console.log(this.roomName);
    }

    verifyAnswer(socketId, selectedAnswer) {
        // console.log("Selected answer: ", selectedAnswer, " ChosenWord : ", this.chosenWord);
        var temp;
        if (selectedAnswer === this.chosenWord) {
            for (i in this.users) {
                if (this.users[i].id === socketId) {
                    this.users[i].scores = this.users[i].scores + 1;
                    temp = this.users[i].userName, this.users[i].scores;
                }
            }
            // emit an score change event to everyone in the room.
            this.io.in(this.roomName).emit('scoresUpdated', { data: this.users.map(function (val) { return { id: val.id, score: val.scores } }) });

        }
    }
}
module.exports = Game;