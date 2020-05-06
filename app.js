const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

// var roomNames = ["dog","cat","parrot","monkey","mouse"];
var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('./game_data/data.json', 'utf8'));
var roomNames = obj.roomNames;
var guessWords = obj.guessWords;
var word = require('./components/word');
var room = require('./components/room');
// var game = require('./test');
// var gameClass = require('./ooptest');
var gameClass = require('./logic/game');
var gameInstances = [];
console.log();

app.use(express.static(__dirname + '/public'));

function emitUserId(socket) {
  socket.emit("userId", socket.id);
}

function onConnection(socket) {
  socket.on('drawing', (data) => {
    socket.to(data.currentRoom).emit('drawing', {
      data: data.drawData
    });
  });
  // user creating a room (and sends back created room name to the user )
  socket.on('createRoom', function (userName) {
    // createRoom(socket,user);
    var roomName = room.createRoom(socket, userName, roomNames);
    io.to(roomName).emit('roomNameIs', roomName);
    emitUserId(socket);
  });

  // User joining a specific room (user gives in roomName , username)
  socket.on('joinRoom', (roomToJoin, userName) => {
    room.joinRoom(socket, roomToJoin, userName);
    // console.log("Entered Room name : ", room, " by ", userName);
    // console.log("Connected user name ", socket.userName);

    // Get all users in a room and replies back with array
    room.getAllUsersInARoom(io, roomToJoin, (connectedUsers) => {
      // Notifying all the user in that room
      io.in(roomToJoin).emit('aUserJoined', connectedUsers);
    });
    emitUserId(socket);
  })


  socket.on('playGame', (roomName) => {

    // socket.admin = true;
    // socket._playing = true;
    // socket._round = [false,false,false];
    var clients = io.sockets.adapter.rooms[roomName].sockets;
    // console.log(clients)
    // console.log("ALL SOCKETS IN " + clients + "ROOM");
    // for(i in clients){
    //   // console.log(clients[i]);
    // }
    var sockets = io.in(roomName);
    var socketsPlayingGame = [];
    var tempData = []
    // console.log("All the sockets in current room ", sockets.sockets);
    io.of('/').adapter.clients([roomName], (err, clients) => {
      // console.log("IDS ", clients);
      for (i in clients) {
        var temp = {
          id: clients[i],
          playing: false,
          rounds: [false, false, false],
          scores: 0,
          playing: false
        }
        if (socket.id == clients[i]) {
          var temp = {
            id: clients[i],
            playing: false,
            rounds: [false, false, false],
            scores: 0,
            playing: true
          }
        }
        // socketsPlayingGame.push(temp);
        Object.keys(sockets.sockets).forEach((item) => {
          if (sockets.sockets[item].id == clients[i]) {
            // console.log("@setting props /n",clients[i])
            sockets.sockets[item].played = false;
            sockets.sockets[item].playing = false;
            sockets.sockets[item].rounds = [false, false, false];
            sockets.sockets[item].scores = 0;
            socketsPlayingGame.push(sockets.sockets[item]);
          }
          if (sockets.sockets[item]._admin) {
            sockets.sockets[item].playing = true;
          }
        })
      }

      // console.log("TEMP NEW: ", tempData)
      // socket._playing = true;
      // console.log("All the 2 sockets in current room ", sockets.sockets);
      // console.log("SOCKETS PLAYING GAMEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE " , socketsPlayingGame)
      // for (i in socketsPlayingGame) {
      //   console.log("USER ID ", socketsPlayingGame[i].id)
      //   console.log("Admin ", socketsPlayingGame[i]._admin)
      //   console.log("PLAYING ", socketsPlayingGame[i].playing)
      //   console.log("USERNAME ", socketsPlayingGame[i].userName)
      //   console.log();
      // }
      // fs.writeFileSync('socketData.json', socketsPlayingGame[0]);

      someModule = new gameClass(roomName, socketsPlayingGame);
      var gameInstanceIndex = gameInstances.push(someModule) - 1;
      // socket.emit("setGameInstance", gameInstanceIndex);
      io.in(roomName).emit('setGameInstance', gameInstanceIndex);
      someModule.print(socket, io, gameInstanceIndex, (socket) => {
        // on fisish delete the game instance to free up memory (although js garbage collector will handle it automatiaclly)
        // console.log('Delete');
        // console.log(this.)
        // delete someModule;
        // console.log(someModule)
      });

      // console.log(gameInstances);
      // console.log(gameInstances[0]);


      // game.setSockets(socketsPlayingGame, guessWords, () => {
      //   game.startGame();
      // });

      // callback(connectedUsers);
    });
    // console.log("All sockets ",sockets.sockets);

    // var data = word.getWord(guessWords);
    // multiple destructuring  
    // var { chosenWord } = { options } = data;
    // socket.emit('chosenWord', {
    //   chosenWord
    // })
    // socket.to(roomName).emit('options', {
    //   options
    // });

    /**
     * Steps
     *  get all sockets in the room, 
     */
    var allSockets
    // setInterval(()=>{
    //   var data = word.getWord(guessWords);
    //   var {chosenWord} = {options} = data;
    //   socket.emit('chosenWord', {chosenWord})
    //   socket.to(roomName).emit('options', {options});
    // },10000)


  })
  socket.on('handshakeBoom', (data) => {
    // console.log("Handhake initiated APP.js", data);
    // console.log(socket.userName);
    // gameInstances[data].tempFunc();
    setTimeout(() => gameInstances[data].print(socket), 3000)

  })

  socket.on("selectedAnswer", (data) => {
    console.log(data, data.gameInstanceIndex);
    gameInstances[data.gameInstanceIndex].verifyAnswer(socket.id, data.selectedAnswer)
  })

  socket.on("clearCanvas", (data) => {
    gameInstances[data.gameInstanceIndex].clearSocketsCanvas()
  })
  // remove socket from the room
  socket.on("leaveRoom", (data) => {
    console.log(data)
  })

  socket.on('disconnecting', function () {
    var joinedRooms = [];
    for (i in socket.rooms) {
      joinedRooms.push(socket.rooms[i])
    }
    // socket.emit('aUserLeft')
    // emitting events to all the rooms user were in.
    for (i in joinedRooms) {
      io.in(joinedRooms[i]).emit('aUserLeft', socket.id);
    }
    // emitting events to all except sender
    // socket.broadcast.emit('broadcast', 'hello friends!');
  })
  socket.on('disconnect', function () {
    // io.emit('user disconnected');
    // console.log("Disconnected :" , socket)
  });
}

io.on('connection', onConnection);


// // Creating a new room 
// var createRoom = function(socket,userName){
//   socket.userName = userName;
//   var roomName = roomNames[Math.floor(Math.random() * roomNames.length)];
//   // var index2Pop = roomNames.findIndex(room => room === roomName); 
//   socket.join(roomName);
//   // remove the name from the roomNames list once joined
//   roomNames.pop(roomNames.findIndex(room => room === roomName));
//   // console.log(socket.userName , " created a room called ", roomName);
//   io.to(roomName).emit('roomNameIs',roomName);
// }


http.listen(port, () => console.log('listening on port ' + port));


var _tempsockets = {
  users: [{
    id: 1,
    userName: "sameer",
    played: false,
    playing: true,
    rounds: [false, false, false]
  },
  {
    id: 2,
    userName: "shahzaib",
    played: false,
    playing: false,
    rounds: [false, false, false]
  },
  {
    id: 3,
    userName: "danial",
    played: false,
    playing: false,
    rounds: [false, false, false]
  },
  {
    id: 4,
    userName: "jehan",
    played: false,
    playing: false,
    rounds: [false, false, false]
  },
  {
    id: 5,
    userName: "dee",
    played: false,
    playing: false,
    rounds: [false, false, false]
  }
  ]
}

// game.setSockets(_tempsockets.users, guessWords, () => {
//   game.startGame();
// });

var _tempsockets2 = {
  users: [{
    id: 1,
    userName: "popeye",
    played: false,
    playing: true,
    rounds: [false, false, false]
  },
  {
    id: 2,
    userName: "tom",
    played: false,
    playing: false,
    rounds: [false, false, false]
  },
  {
    id: 3,
    userName: "jerry",
    played: false,
    playing: false,
    rounds: [false, false, false]
  }
  ]
}


// setTimeout(()=>{
//   game.setSockets(_tempsockets2.users, guessWords, () => {
//     game.startGame();
//   });
// },1800);

// var testmod = require('./ooptest');

// // var MyModule = require('MyModule');

// someModule1 = new gameClass('cat', _tempsockets.users);
// console.log("APP JS" , someModule1.print());
// someModule1.listAll();
// someModule = new gameClass('dog', _tempsockets2.users);
// // // setTimeout(() => {
//   someModule.print(() => {
//     // on fisish delete the game instance to free up memory (although js garbage collector will handle it automatiaclly)
//     console.log('Delete');
//     // console.log(this.)
//     delete someModule;
//     // console.log(someModule)
//   });
// }, 1200)
// someModule.print();
// someModule1.print();

// someModule.setMyVar(_tempsockets2.users, ()=>{
//     testmod.showVar()
// });
// testmod.setMyVar(_tempsockets2.users, ()=>{
//   testmod.showVar()
// });
// testmod.showVar();