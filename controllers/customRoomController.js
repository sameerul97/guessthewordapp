// customRoom.js - customRoom route module.

var express = require("express");
var path = require("path");
var router = express.Router();
var moment = require("moment-timezone");

const RoomService = require("../services/roomService");
const RoomLinkService = require("../services/roomLinkService");
const { GameRoomLink } = require("../api/model/sequelize");
const { v4: uuidv4 } = require("uuid");

// Home page route.
router.get("/", function (req, res) {
  res.status(200).json({ message: "Guesstheword app Api" });
});

// Generate room link.
router.get("/generateRoom", async function (req, res) {
  var roomName = await RoomService.createRoom();

  console.log(moment().tz("Europe/Lisbon").format());
  var expiryTime = moment().add(1, "hours").format();
  console.log(expiryTime);

  let { gameKey } = await GameRoomLink.create({
    roomName: roomName,
    expiryTime: expiryTime,
    gameStarted: false,
    gameFinished: false,
  });
  // console.log(createdRoomLink.dataValues);
  //  = createdRoomLink.dataValues;
  res.status(200).json({ gameKey, expiryTime });
});

router.get("/:roomInstance", async function (req, res) {
  try {
    var response = await RoomLinkService.gameRoomLinkValid(
      req.params.roomInstance
    );

    var currentTime = moment().tz("Europe/Lisbon").format();
    var roomExpiryTime = moment(response.expiryTime);

    console.log(moment(currentTime).isBefore(moment(roomExpiryTime)));

    if (moment(currentTime).isBefore(moment(roomExpiryTime))) {
      res.status(200).json({ message: response });
    } else {
      console.log("Linked Expired");
      throw new Error("Link Expired!");
    }

    // res.status(200).json({ message: response });
  } catch (err) {
    responsBe = err;
    console.log(err);

    res.status(400).json({ message: err.message });
  }
});

router.post("/gameover", async function (req, res) {
  try {
    var response = await RoomLinkService.expireGameRoomLink(req.body.game_id);

    res.status(200).json({ message: response });

    // res.status(200).json({ message: response });
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
