const WordService = require("./wordService");

var { drawing } = require("../data/googledrawings.json");

module.exports = {
  drawingWords: async function () {
    // var selectedDrawing =
    //   drawing[Math.floor(Math.random() * (drawing.length - 1))];
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
    // var words = [];
    // while (words.length !== 5) {
    //   var givenword = WordService.getWord();
    //   var { chosenWord } = givenword;
    //   var found = false;
    //   for (var word in words) {
    //     if (words[word].chosenWord === chosenWord) {
    //       found = true;
    //       break;
    //     }
    //   }
    //   if (!found) {
    //     words.push(givenword);
    //   }
    // }
    return words;
  },
};
