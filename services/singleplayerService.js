const WordService = require("./wordService");
const {
  Singleplayer_GuestMode,
  Singleplayer_GuestMode_Words,
} = require("../entity/sequelize");

var { drawing } = require("../data/googledrawings.json");

module.exports = {
  drawingWords: async function () {
    var words = [];
    while (words.length !== 5) {
      var selectedDrawing =
        drawing[Math.floor(Math.random() * (drawing.length - 1))];
      var { word, key_id } = selectedDrawing;
      var selectedDrawing2 = selectedDrawing.drawing;
      var found = false;
      for (var drawings in words) {
        if (words[drawings].word === selectedDrawing.word) {
          found = true;
          break;
        }
      }
      if (!found) {
        words.push({ word, drawing: selectedDrawing2, drawingId: key_id });
      }
    }
    return words;
  },
  createGame: async function (username, words) {
    return Singleplayer_GuestMode.create(
      {
        username: username,
        words: words,
      },
      {
        include: ["words"],
      }
    );
  },
  verifyAnswer: async function (game_id, round_id, selected_answer, options) {
    return Singleplayer_GuestMode.findByPk(game_id, {
      attributes: ["username", "score", "uuid"],
      // where: { uuid: game_id },

      include: [
        {
          attributes: ["word", "alreadyGuessed", "round_id", "gameid"],
          model: Singleplayer_GuestMode_Words,
          as: "words",
          where: {
            round_id: round_id,
            // fk_gameid : game_id
            // alreadyGuessed: false,
            // word: selected_answer,
            // options: options,
          },
        },
      ],
    });
    // .then(function (d) {
    //   console.log(
    //     d.updateAttributes({
    //       alreadyGuessed: true,
    //     })
    //     // [0].updateAttributes({
    //     //   alreadyGuessed: true,
    //     // })
    //   );
    //   // return filter.filteredContent[0].updateAttributes({
    //   //   content: "crap",
    //   // });
    // })
    // .then(function () {
    //   // DONE! :)
    // });
  },
  updateScore: async function (Singleplayer_GuestMode_Record, game_id) {
    var score_holder = Singleplayer_GuestMode_Record.score;
    return Singleplayer_GuestMode_Record.update(
      { score: score_holder + 1 },
      { where: { uuid: game_id } }
    );
  },
  updateAlreadyGuessed: async function (
    Singleplayer_GuestMode_Record,
    round_id,
    game_id
  ) {
    Singleplayer_GuestMode_Record.words.forEach((word) => {
      word.update(
        { alreadyGuessed: true },
        {
          where: {
            game_id: game_id, // alreadyGuessed: false,
            round_id: round_id,
          },
        }
      );
    });
  },
};
