var express = require("express");
var path = require("path");
var router = express.Router();
var { drawing } = require("../data/googledrawings.json");
const WordService = require("../services/wordService");
const SingleplayerService = require("../services/singleplayerService");
const { ValidationError } = require("sequelize");
const { use } = require("./customRoomController");

require("../errors/singleplayerError");

router.get("/", function (req, res) {
  res.json({ message: "Guesstheword app singleplayer Api" });
});

router.get("/word", async function (req, res) {
  try {
    var username = req.query.username;
    console.log(username)
    if (username === undefined) {
      throw new NoUsernameError();
    }
    const drawingAndWords = await SingleplayerService.drawingWords();

    for (i in drawingAndWords) {
      // drawingAndWords[i]["round_id"] = i;
      drawingAndWords[i]["options"] = WordService.getWord(
        drawingAndWords[i].word
      ).options;
    }

    forDb = drawingAndWords.map((item) => ({
      // round_id: item.round_id,
      word: item.word,
      options: item.options,
    }));

    words =
      process.env.NODE_ENV === "production"
        ? drawingAndWords.filter((item) => delete item.word)
        : drawingAndWords;

    var createdSinglePlayerGame = await SingleplayerService.createGame(
      username,
      forDb
    );

    res.json({
      message: { game: { id: createdSinglePlayerGame.uuid, words } },
    });
  } catch (error) {
    console.error(error)
    if (error instanceof NoUsernameError) {
      res.json({
        game: { success: false, message: error.message },
      });
    }
  }
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
    console.log(Singleplayer_GuestMode_Record)
    if (Singleplayer_GuestMode_Record === null) {
      response = {
        success: false,
        message: "Invalid data",
        game: Singleplayer_GuestMode_Record,
      };
      throw new InvalidGameDataError();
    }

    if (!Singleplayer_GuestMode_Record.words[0].alreadyGuessed) {
      // console.log(Singleplayer_GuestMode_Record);
      await SingleplayerService.updateAlreadyGuessed(
        Singleplayer_GuestMode_Record,
        round_id,
        game_id
      );
      if (Singleplayer_GuestMode_Record.words[0].word === selected_answer) {
        var game = {
          success: true,
          message: "Valid answer",
          data: await SingleplayerService.updateScore(
            Singleplayer_GuestMode_Record,
            game_id
          ),
        };
      } else {
        game = {
          success: false,
          message: "Invalid answer",
          data: Singleplayer_GuestMode_Record,
        };
      }
    } else {
      game = {
        success: false,
        message: "Already Guessed",
        data: Singleplayer_GuestMode_Record,
      };
    }

    res.json({ game });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.json({
        game: { success: false, message: error },
      });
    }
    if (error instanceof InvalidGameDataError) {
      res.json({
        game: { success: false, message: error.message },
      });
    }
  }
});

module.exports = router;
