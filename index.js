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
var singleplayer = require("./controllers/singleplayer");
// rAdapter.pubClient.on('error', function () {
//   console.log("Redis Labs Error for Pub");
// });
// rAdapter.subClient.on('error', function () {
//   console.log("Redis Labs Error for Sub");
// });

// Game Api
app.use("/api/game", customRoom);

app.use("/api/singleplayer", singleplayer);

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
  socket.on("disconnecting", gameController.disconnecting(socket));

  socket.on("disconnect", function () {});
}

io.on("connection", onConnection);
console.log("ENV", process.env.DATABASE_USER, process.env.DATABASE_URL);
http.listen(port, () => console.log("listening on port " + port));
