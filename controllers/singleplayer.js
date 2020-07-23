var express = require("express");
var path = require("path");
var router = express.Router();
// var { drawing } = require("../data/googledrawing_processed_raw_data.json");
var { drawing } = require("../data/googledrawings.json");
const WordService = require("../services/wordService");
const SingleplayerService = require("../services/singleplayerService");
const {
  Singleplayer_GuestMode,
  Singleplayer_GuestMode_Words,
} = require("../entity/sequelize");
const singleplayerService = require("../services/singleplayerService");

router.get("/", function (req, res) {
  res.json({ message: "Guesstheword app singleplayer Api" });
});

router.get("/word", async function (req, res) {
  const drawingAndWords = await singleplayerService.drawingWords();
  for (i in drawingAndWords) {
    drawingAndWords[i]["round_id"] = i;
    drawingAndWords[i]["options"] = WordService.getWord(
      drawingAndWords[i].word
    ).options;
    console.log(drawingAndWords[i]);
  }
  forDb = drawingAndWords.map((item) => ({
    round_id: item.round_id,
    word: item.word,
    options: item.options,
  }));
  words =
    process.env.NODE_ENV === "production"
      ? drawingAndWords.filter((item) => delete item.word)
      : drawingAndWords;
  //  drawingAndWords.filter((item) => delete item.word);

  var createdSinglePlayerGame = await Singleplayer_GuestMode.create(
    {
      username: "sameer",
      words: forDb,
    },
    {
      include: ["words"],
    }
  );

  res.json({
    message: { game: { id: createdSinglePlayerGame.uuid, words } },
    // drawing: selectedDrawing.drawing,
    // words: WordService.getWord(selectedDrawing.word),
    // game: createdSinglePlayerGame,
  });
});

module.exports = router;
