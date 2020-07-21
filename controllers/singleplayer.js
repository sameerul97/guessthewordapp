var express = require("express");
var path = require("path");
var router = express.Router();
// var { drawing } = require("../data/googledrawing_processed_raw_data.json");
var { drawing } = require("../data/googledrawings.json");
const WordService = require("../services/wordService");

router.get("/", function (req, res) {
  res.json({ message: "Guesstheword app singleplayer Api" });
});

router.get("/word", function (req, res) {
  var selectedDrawing =
    drawing[Math.floor(Math.random() * (drawing.length - 1))];
  res.json({
    drawing: selectedDrawing.drawing,
    words: WordService.getWord(selectedDrawing.word),
  });
});

module.exports = router;
