var express = require("express");
var path = require("path");
var router = express.Router();
var { drawing } = require("../data/googledrawing_processed_raw_data.json");

router.get("/", function (req, res) {
  res.json({ message: "Guesstheword app singleplayer Api" });
});

router.get("/word", function (req, res) {
  res.json({
    message: drawing[Math.floor(Math.random() * (drawing.length - 1))],
  });
});

module.exports = router;
