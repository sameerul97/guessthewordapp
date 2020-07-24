var express = require("express");
var path = require("path");
var router = express.Router();
// var { drawing } = require("../data/googledrawing_processed_raw_data.json");
var { drawing } = require("../data/googledrawings.json");
const WordService = require("../services/wordService");
const SingleplayerService = require("../services/singleplayerService");
const { ValidationError } = require("sequelize");

router.get("/", function (req, res) {
  res.json({ message: "Guesstheword app singleplayer Api" });
});

router.get("/word", async function (req, res) {
  const drawingAndWords = await SingleplayerService.drawingWords();

  for (i in drawingAndWords) {
    drawingAndWords[i]["round_id"] = i;
    drawingAndWords[i]["options"] = WordService.getWord(
      drawingAndWords[i].word
    ).options;
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

  var createdSinglePlayerGame = await SingleplayerService.createGame(forDb);

  res.json({
    message: { game: { id: createdSinglePlayerGame.uuid, words } },
  });
});

router.post("/word", async function (req, res) {
  try {
    const { game_id, round_id, selected_answer, options } = req.body;

    const Singleplayer_GuestMode_Record = await SingleplayerService.verifyAnswer(
      game_id,
      round_id,
      selected_answer,
      options
    );

    if (Singleplayer_GuestMode_Record === null) {
      response = {
        success: false,
        message: "Invalid data",
        game: Singleplayer_GuestMode_Record,
      };
      throw new Error(response.message);
    }

    if (!Singleplayer_GuestMode_Record.words[0].alreadyGuessed) {
      console.log(Singleplayer_GuestMode_Record);
      await SingleplayerService.updateAlreadyGuessed(
        Singleplayer_GuestMode_Record,
        round_id
      );
      if (Singleplayer_GuestMode_Record.words[0].word === selected_answer) {
        var response = {
          success: true,
          message: "Valid answer",
          game: await SingleplayerService.updateScore(
            Singleplayer_GuestMode_Record,
            game_id
          ),
        };
      } else {
        response = {
          success: false,
          message: "Invalid answer",
          game: Singleplayer_GuestMode_Record,
        };
      }
    } else {
      response = {
        success: false,
        message: "Already Guessed",
        game: Singleplayer_GuestMode_Record,
      };
    }

    res.json({
      message: { game: response },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.json({
        message: { success: false, game: error },
      });
    } else {
      res.json({
        message: { success: false, game: error.message },
      });
    }
  }
});

module.exports = router;
