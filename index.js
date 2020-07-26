// libs
const express = require("express"),
  app = express(),
  fs = require("fs"),
  redis = require("redis"),
  jwt = require("jsonwebtoken"),
  http = require("http").Server(app),
  port = process.env.PORT || 3000,
  privateKey = fs.readFileSync("private.key"),
  bodyParser = require('body-parser')
  rAdapter = require("socket.io-redis");

global.io = require("socket.io")(http);

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

// controller
var roomController = require("./controllers/roomController");
var gameController = require("./controllers/gameController");

// service
const word = require("./services/wordService");
const roomService = require("./services/roomService");
const gameService = require("./services/gameService");
const jwtService = require("./services/jwtService");

// Game module
var GameClass = require("./entity/game3");

// Redis Config
const { Redis } = require("./config");
const { randomBytes } = require("crypto");
const pub = redis.createClient(Redis.port, Redis.host, {
  auth_pass: Redis.password,
});
const sub = redis.createClient(Redis.port, Redis.host, {
  auth_pass: Redis.password,
});
io.adapter(
  rAdapter({ pubClient: pub, subClient: sub, requestsTimeout: 15000 })
);
const client = redis
  .createClient(Redis.port, Redis.host)
  .on("error", (err) => console.error("Redis connection error ", err));
client.auth(Redis.password);

// setting service DB connection
roomService.setRClient(client);
gameService.setRClient(client);
GameClass.setRClient(client);

var customRoom = require('./controllers/customRoomController')
var singleplayer = require('./controllers/singleplayer')
// rAdapter.pubClient.on('error', function () {
//   console.log("Redis Labs Error for Pub");
// });
// rAdapter.subClient.on('error', function () {
//   console.log("Redis Labs Error for Sub");
// });

// Game Api
app.use('/api/game', customRoom)

app.use('/api/singleplayer', singleplayer)

// Setting view
app.use(express.static(__dirname + "/public"));

// socket use middleware to check the token
// io.use(existingUser);

function onConnection(socket) {
  socket.on("drawing", (data) => {
    socket.to(data.currentRoom).emit("drawing", {
      data: data.drawData,
    });
  });

  socket.on("createRoom", roomController.createRoom(socket));

  socket.on("joinRoom", roomController.joinRoom(socket));

  socket.on("playGame", gameController.playGame(socket));

  socket.on("handshakeIntialised", gameController.handShakeListerner(socket));

  socket.on("selectedAnswer", gameController.verifyAnswer(socket));

  socket.on("clearCanvas", gameController.clearCanvas(socket));
  // socket.on("clearCanvas", (data) => {
  //   gameInstances[data.gameInstanceIndex].clearSocketsCanvas();
  // });

  // Need to rewrite the following methods
  // remove socket from the room
  socket.on("leaveRoom", (data) => {
    console.log(data);
  });

  socket.on("disconnecting", function () {
    // console.log("Sockeet disconnecting", socket.id);
    // io.of("/").adapter.remoteDisconnect(socket.id, true, (err) => {
    //   if (err) {
    //     /* unknown id */
    //   }
    //   // success
    // });
    // var joinedRooms = [];
    // for (i in socket.rooms) {
    //   joinedRooms.push(socket.rooms[i]);
    // }
    // // socket.emit('aUserLeft')
    // // emitting events to all the rooms user were in.
    // for (i in joinedRooms) {
    //   // io.in(joinedRooms[i]).emit('aUserLeft', socket.id);
    // }
    // // emitting events to all except sender
    // // socket.broadcast.emit('broadcast', 'hello friends!');
  });
  socket.on("disconnect", function () {
    // console.log("Sockeet disconnect", socket.id);
    // io.emit('user disconnected');
    // console.log("Disconnected :" , socket)
  });
}

io.on("connection", onConnection);
console.log("ENV", process.env.DATABASE_USER, process.env.DATABASE_URL)
http.listen(port, () => console.log("listening on port " + port));
