// libs
const express = require("express"),
  app = express(),
  fs = require("fs"),
  redis = require("redis"),
  jwt = require("jsonwebtoken"),
  http = require("http").Server(app),
  port = process.env.PORT || 3000,
  privateKey = fs.readFileSync("private.key"),
  bodyParser = require("body-parser");
rAdapter = require("socket.io-redis");

global.io = require("socket.io")(http);

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

// controller
const RoomController = require("./controllers/roomController");
const GameController = require("./controllers/gameController");

// service
const word = require("./services/wordService");
const roomService = require("./services/roomService");
const gameService = require("./services/gameService");
const jwtService = require("./services/jwtService");

// Game module
var GameClass = require("./entity/game3");

// Error
require("./errors/gameError");
require("./errors/userError");

// Redis Config
const { Redis } = require("./config");
const { randomBytes } = require("crypto");
const REDIS_STORE_PORT = process.env.REDIS_STORE_PORT || Redis.port;
const REDIS_STORE_HOST = process.env.REDIS_STORE_HOST || Redis.host;
const REDIS_STORE_PASSWORD = process.env.REDIS_STORE_PASSWORD || Redis.password;

const pub = redis.createClient(REDIS_STORE_PORT, REDIS_STORE_HOST, {
  auth_pass: REDIS_STORE_PASSWORD,
});

const sub = redis.createClient(REDIS_STORE_PORT, REDIS_STORE_HOST, {
  auth_pass: REDIS_STORE_PASSWORD,
});

io.adapter(
  rAdapter({ pubClient: pub, subClient: sub, requestsTimeout: 15000 })
);

const client = redis
  .createClient(REDIS_STORE_PORT, REDIS_STORE_HOST)
  .on("error", (err) => console.error("Redis connection error ", err));
client.auth(REDIS_STORE_PASSWORD);

// setting service DB connection
roomService.setRClient(client);
gameService.setRClient(client);
GameClass.setRClient(client);

var customRoom = require("./controllers/customRoomController");
// var singleplayer = require("./controllers/singleplayerController");
// rAdapter.pubClient.on('error', function () {
//   console.log("Redis Labs Error for Pub");
// });
// rAdapter.subClient.on('error', function () {
//   console.log("Redis Labs Error for Sub");
// });

// Game Api
var singleplayerRouter = require("./api/routes/singleplayer.route");
app.use("/api/game", customRoom);

app.use("/api/singleplayer", singleplayerRouter);

const {
  CreateRoomResponse,
  JoinRoomResponse,
} = require("./responses/roomResponse");

// var tbn = require("./controllers/tbn");
// app.use("/api/tbn/", tbn);

// Setting view
app.use(express.static(__dirname + "/public"));

// socket use middleware to check the token
// io.use(existingUser);

function onConnection(socket) {
  socket.on("lol", () => {
    socket.emit("response", "returnLOL");
  });

  socket.on("drawing", (data) => {
    socket.to(data.currentRoom).emit("drawing", {
      data: data.drawData,
    });
  });

  socket.on("createRoom", async function (socketData) {
    var resBe = await RoomController.createRoom(socket)(socketData);

    if (resBe instanceof CreateRoomResponse) {
      console.log(resBe);

      let { roomName, userId, userList } = resBe;

      io.to(roomName).emit("roomNameIs", roomName);
      socket.emit("userId", userId);
      io.in(roomName).emit("aUserJoined", userList);
    }

    if (resBe instanceof InvalidUsernameError) {
      socket.emit("invalidUsername", new InvalidUsernameError());
    }
  });

  socket.on("joinRoom", async function (socketData) {
    try {
      let { roomname } = socketData;

      var response = await RoomController.joinRoom(socket)(socketData);
      console.log(response);

      if (response instanceof JoinRoomResponse) {
        let { success, userId, userList } = response;
        console.log(success, userId, userList);

        socket.emit("roomVerified", {
          success: success,
          message: null,
        });
        socket.emit("userId", userId);
        io.in(roomname).emit("aUserJoined", userList);
      }
    } catch (response) {
      var message;

      if (response instanceof GameAlreadyStarted) {
        message = response.message;
      }

      if (response instanceof RoomNotInDbError) {
        message = response.message;
      }

      if (response instanceof InvalidUsernameError) {
        message = response.message;
      }

      socket.emit("roomVerified", {
        success: false,
        message: message,
      });
    }
  });

  // socket.on("playGame", async function (socket) {
  //   var response = await GameController.playGame(socket)(roomName);
  // });
  socket.on("playGame", GameController.playGame(socket));

  socket.on("handshakeIntialised", GameController.handShakeListerner(socket));

  socket.on("selectedAnswer", GameController.verifyAnswer(socket));

  socket.on("clearCanvas", GameController.clearCanvas(socket));
  // socket.on("clearCanvas", (data) => {
  //   gameInstances[data.gameInstanceIndex].clearSocketsCanvas();
  // });
  socket.on("disconnecting", GameController.disconnecting(socket));

  socket.on("disconnect", function () {});
}

io.on("connection", onConnection);
console.log("ENV", process.env.DATABASE_USER, process.env.DATABASE_URL);
http.listen(port, () => console.log("listening on port " + port));
