// customRoom.js - customRoom route module.

var express = require("express");
var path = require("path");
var router = express.Router();
var moment = require("moment-timezone");
var utils = require("../utils/getroomexpirytime");
const RoomService = require("../services/roomService");
const RoomLinkService = require("../services/roomLinkService");
const { GameRoomLink } = require("../entity/sequelize");
const { v4: uuidv4 } = require("uuid");

// Home page route.
router.get("/", function (req, res) {
  res.json({ message: "Guesstheword app Api" });
});

// Generate room link.
router.get("/generateRoom", async function (req, res) {
  var roomName = await RoomService.createRoom();
  console.log(new Date())
  console.log(moment().tz("Europe/Lisbon").format());
  var expireT = moment().add(1, "hours").format();
  console.log(expireT)
  var { gameKey } = await GameRoomLink.create({
    roomName: roomName,
    expiryTime: expireT,
  });
  res.status(200).json({ message: gameKey });
});

router.get("/test", function (req, res) {
  res.sendFile(path.resolve("public/index.html"));
});

router.get("/:roomInstance", async function (req, res) {
  try {
    var response = await RoomLinkService.gameRoomLinkValid(
      req.params.roomInstance
    );
    res.status(200).json({ message: response });
  } catch (err) {
    responsBe = err;
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

router.get("*", function (req, res) {
  res.status(404).json({ message: "Not valid endpoint" });
});

module.exports = router;
