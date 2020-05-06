var sockets = {
    users: [
        // {
        //     id: 1,
        //     name: "sameer",
        //     played: false,
        //     playing: true,
        //     rounds: [false, false, false]
        // },
        // {
        //     id: 2,
        //     name: "shahzaib",
        //     played: false,
        //     playing: false,
        //     rounds: [false, false, false]
        // },
        // {
        //     id: 3,
        //     name: "danial",
        //     played: false,
        //     playing: false,
        //     rounds: [false, false, false]
        // },
        // {
        //     id: 4,
        //     name: "jehan",
        //     played: false,
        //     playing: false,
        //     rounds: [false, false, false]
        // },
        // {
        //     id: 5,
        //     name: "dee",
        //     played: false,
        //     playing: false,
        //     rounds: [false, false, false]
        // }
    ]
}


var userIndex = 0;
var tempIndex = 0;
var word = require('./components/word');
var fs = require('fs');

var obj = JSON.parse(fs.readFileSync('./game_data/data.json', 'utf8'));
var guessWords = obj.guessWords;
var timerInterval = undefined;
module.exports = {
    gameTimer : () => {
        console.log("Sockets in queue : ", sockets.users);
        // console.log("Words for ", sockets.users[userIndex].userName, word.getWord(guessWords))
        // console.log(sockets.users[userIndex].rounds[index]);
        sockets.users[userIndex].rounds[tempIndex] = true;
        tempIndex++;
        if (sockets.users[userIndex].rounds[0]) {
            if (sockets.users[userIndex].rounds[1]) {
                if (sockets.users[userIndex].rounds[2]) {
                    userIndex++;
                    tempIndex = 0;
                    if (userIndex === (sockets.users.length)) {} else {
                        sockets.users[userIndex].playing = true;
                    }
                }
            }
        }
    },
    gameState : () => {
        if (userIndex === (sockets.users.length)) {
            console.log("GAme over");
            clearInterval(timerInterval);
        } else {
            if (sockets.users[userIndex].playing) {
                module.exports.gameTimer();
            }
        }
    },
    startGame: () =>{
        timerInterval = setInterval(module.exports.gameState, 3000);
        // Init game for the initial run
        module.exports.gameTimer();
    },
    setSockets : (users , guessWords , callback) =>{
        sockets.users = users;
        guessWords = guessWords;
        // console.log(sockets.users);
        callback();
    }
}


// V2 apprach (Failed)
// module.exports = {
//     sockets: {
//         users: []
//     },
//     guessWords: undefined,
//     userIndex: 0,
//     tempIndex: 0,
//     timerInterval : undefined,
//     gameTimer: function () {
//         // console.log("Sockets in queue : ", this.sockets.users);
//         console.log("Words for ", this.sockets.users[this.userIndex].userName, word.getWord(guessWords))
//         // console.log(sockets.users[userIndex].rounds[index]);
//         this.sockets.users[this.userIndex].rounds[this.tempIndex] = true;
//         this.tempIndex++;
//         if (this.sockets.users[this.userIndex].rounds[0]) {
//             if (this.sockets.users[this.userIndex].rounds[1]) {
//                 if (this.sockets.users[this.userIndex].rounds[2]) {
//                     this.userIndex++;
//                     this.tempIndex = 0;
//                     if (this.userIndex === (this.sockets.users.length)) {} else {
//                         this.sockets.users[this.userIndex].playing = true;
//                     }
//                 }
//             }
//         }
//     },
//     gameState: function () {
//         // console.log("Sockets in queue : ", this.sockets);
//         // console.log(this.sockets);
//         // var _socketsLen = this.sockets.users.length;
//         // console.log(_socketsLen,this.sockets.users.length);
//         if (this.userIndex === (this.sockets.users.length)) {
//             console.log("GAme over");
//             clearInterval(timerInterval);
//         } else {
//             if (this.sockets.users[this.userIndex].playing) {
//                 module.exports.gameTimer();
//             }
//         }
//     },
//     startGame: function () {
//         timerInterval = setInterval(()=>{
//             module.exports.gameState();
//         } , 3000);
//         // Init game for the initial run
//         module.exports.gameTimer();
//     },
//     setSockets: function (users, guessWords, callback) {
//         this.sockets.users = users;
//         this.guessWords = guessWords;
//         // console.log(sockets.users);
//         if (callback) callback();
//         // console.log(this.data)
//         // this.data = "data"
//         // console.log(this.data)

//     }
// }




// var timer = () => {
//     // console.log(sockets.users[userIndex].name , " Turn to play the game ");
//     console.log("Words for ", sockets.users[userIndex].name, word.getWord(guessWords))
//     // console.log(sockets.users[userIndex].rounds[index]);
//     sockets.users[userIndex].rounds[tempIndex] = true;
//     tempIndex++;
//     if (sockets.users[userIndex].rounds[0]) {
//         if (sockets.users[userIndex].rounds[1]) {
//             if (sockets.users[userIndex].rounds[2]) {
//                 userIndex++;
//                 tempIndex = 0;
//                 if (userIndex === (sockets.users.length)) {} else {
//                     sockets.users[userIndex].playing = true;
//                 }
//             }
//         }
//     }
// }

// function gameState() {
//     if (userIndex === (sockets.users.length)) {
//         console.log("GAme over");
//         clearInterval(timerInterval);
//     } else {
//         if (sockets.users[userIndex].playing) {
//             timer();
//         }
//     }
// }

// function startGame() {
//     var interval = setInterval(gameState, 1500);
// }

// startGame()













// for (i in sockets.users) {
//     console.log(sockets.users[i].name);
//     console.log()
// }

// var index = 0;
// var socketIndexe = 0;
// console.log(sockets.users.length, ((sockets.users.length) - 1), ((sockets.users.length) + 1));
// while (socketIndexe != ((sockets.users.length)+1)) {
//     // if (socketIndexe === sockets.users.length-1) {
//     //     console.log("BREAKING")
//     //     break;
//     // }
//     // while (sockets.users[socketIndexe].playing) {
//     console.log("Currenty playing :", sockets.users[socketIndexe].name);
//     console.log("SOCKET INDEX ", socketIndexe)
//     sockets.users[socketIndexe].rounds[index] = true;
//     console.log(sockets.users[socketIndexe].rounds);

//     if (sockets.users[socketIndexe].rounds[0]) {
//         if (sockets.users[socketIndexe].rounds[1]) {
//             if (sockets.users[socketIndexe].rounds[2]) {
//                 sockets.users[socketIndexe].playing = false;
//                 sockets.users[socketIndexe].played = true;
//                 console.log(sockets.users[socketIndexe].rounds);
//                 socketIndexe++;
//                 index = 0;
//                 // if (socketIndexe === ((sockets.users.length)-1)) {
//                 //     console.log("BREAKING")
//                 //     break;
//                 // }
//                 // console.log(sockets.users[socketIndexe].name);
//                 // console.log(sockets.users[socketIndexe].playing);
//                 sockets.users[socketIndexe].playing = true
//                 // console.log(sockets.users[socketIndexe].playing);
//                 // console.log(sockets.users[socketIndexe].rounds);
//                 sockets.users[socketIndexe].rounds[index] = true;
//                 // console.log(sockets.users[socketIndexe].rounds);
//                 console.log("SOCKET INDEX 2 ", socketIndexe)

//                 // break;
//                 // socketIndexe++;   
//                 // index = 0;
//                 // sockets.users[socketIndexe].playing = true;
//             }
//         }
//     }
//     index++;
// }
// index = [0]
// setInterval(() => {
//     socket.users[index]
//     if (socket.users[index].playing) {

//     }
// }, 3000)


var index = 0;
// for (i in sockets.users){
//     console.log("Currenty playing :", sockets.users[i].name);
//     console.log("SOCKET INDEX ", i)
//     sockets.users[i].rounds[index] = true;
//     console.log(sockets.users[i].rounds);
//     index++;
// }




// timer();
// var timerInterval = setInterval(() => {
//     if (userIndex === (sockets.users.length)) {
//         console.log("GAme over");
//         clearInterval(timerInterval);
//     } else {
//         if (sockets.users[userIndex].playing) {
//             timer();
//         }
//     }
// }, 3000)