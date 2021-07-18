// var express = require("express");
// var path = require("path");
// var router = express.Router();
var { drawing } = require("../../data/googledrawings.json");
const WordService = require("../../services/wordService");
const SingleplayerService = require("../services/singleplayerService");
const { ValidationError } = require("sequelize");

require("../../errors/singleplayerError");

// router.get("/", function (req, res) {
//   res.json({ message: "Guesstheword app singleplayer Api" });
// });

module.exports = {
  index: async function (req, res) {
    res.status(200).json({ message: "Guesstheword app singleplayer Api" });
  },

  word_get: async function (req, res) {
    try {
      var username = req.query.username;

      if (username === undefined) {
        throw new NoUsernameError();
      }

      var drawingAndWords = await SingleplayerService.drawingWords();

      var drawingAndWords = await SingleplayerService.getWordAndOptions(
        drawingAndWords
      );

      forDb = drawingAndWords.map((item) => ({
        word: item.word,
        options: item.options,
      }));

      words = drawingAndWords;

      var createdSinglePlayerGame = await SingleplayerService.createGame(
        username,
        forDb
      );

      var optionsAndWords = createdSinglePlayerGame.words;

      for (var i = 0, len = words.length; i < len; i++) {
        if (optionsAndWords[i].word === words[i].word) {
          words[i]["round_id"] = optionsAndWords[i].round_id;
        }
      }

      res.json({
        game: {
          id: createdSinglePlayerGame.uuid,
          words: words,
          // test: optionsAndWords,
        },
      });
    } catch (error) {
      if (error instanceof NoUsernameError) {
        res.status(403).json({
          game: { success: false, error: new NoUsernameError() },
        });
      }
    }
  },

  word_post: async function (req, res) {
    try {
      const { game_id, round_id, selected_answer, options } = req.body;

      if (round_id != parseInt(round_id)) {
        throw new InvalidGameDataError();
      }

      const Singleplayer_GuestMode_Record = await SingleplayerService.verifyAnswer(
        game_id,
        round_id,
        selected_answer,
        options
      );

      if (Singleplayer_GuestMode_Record === null) {
        throw new InvalidGameDataError();
      }

      if (!Singleplayer_GuestMode_Record.words[0].alreadyGuessed) {
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
  },

  word_not_found: function (req, res) {
    res.status(404).json({ message: "Not valid endpoint" });
  },
};
