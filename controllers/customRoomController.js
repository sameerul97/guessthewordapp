// customRoom.js - customRoom route module.

var express = require("express");
var path = require("path");
var router = express.Router();
const RoomService = require("../services/roomService");
const { v4: uuidv4 } = require("uuid");

// Home page route.
router.get("/", function (req, res) {
  res.json({ message: "Guesstheword app Api" });
});

// Generate room link.
router.get("/generateRoom", async function (req, res) {
  res.json({ message: await generateGameRoom() });
});

router.get('/test', function(req, res) {
    res.sendFile(path.resolve('public/index.html'))
});

router.get("/:roomInstance", async function (req, res) {
  let responsBe;
  try {
    responsBe = await checkRoomValid(req.params.roomInstance);
    res.status(200).json({ message: responsBe });
  } catch (err) {
    responsBe = err;
    res.status(400).json({ message: "Invalid Room link" });
  }
});

router.get("*", function (req, res) {
    res.status(404).json({ message: "Not valid endpoint" });
});

module.exports = router;
let tempDb = [];

async function generateGameRoom() {
  var name = await RoomService.createRoom();
  const roomNameKey = uuidv4();
  tempDb.push({ roomKey: roomNameKey, roomName: name });
  return roomNameKey;
}

async function checkRoomValid(roomInstanceKey) {
  return new Promise((resolve, reject) => {
    tempDb.forEach((element, index, array) => {
      if (element.roomKey === roomInstanceKey) {
        return resolve(element.roomName);
      }
    });
    return reject(false);
  });
}
