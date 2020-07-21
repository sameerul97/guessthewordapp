var express = require("express");
var path = require("path");
var router = express.Router();
// var { drawing } = require("../data/googledrawing_processed_raw_data.json");
var { drawing } = require("../data/googledrawings.json");
const WordService = require("../services/wordService");
const {
  Singleplayer_GuestMode,
  Singleplayer_GuestMode_Words,
} = require("../entity/sequelize");

router.get("/", function (req, res) {
  res.json({ message: "Guesstheword app singleplayer Api" });
});

router.get("/word", async function (req, res) {
  var createdSinglePlayerGame = await Singleplayer_GuestMode.create(
    {
      username: "sameer",
      words: [
        {
          word: "Fire",
          options: ["Water", "Fire", "Car", "Cloud"],
        },
        {
          word: "Water",
          options: ["Rain", "Sky", "Train", "Water"],
        },
      ],
    },
    {
      include: ["words"],
    }
  );
  var selectedDrawing =
    drawing[Math.floor(Math.random() * (drawing.length - 1))];
  res.json({
    drawing: selectedDrawing.drawing,
    words: WordService.getWord(selectedDrawing.word),
    game: createdSinglePlayerGame,
  });
});

module.exports = router;
