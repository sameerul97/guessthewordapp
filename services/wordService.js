// Returns chosen word and optional word for user to select one
/*
    @ eg response
    data: {
        chosenWord : airplane,
        options: ["aircraft carrier","airplane","alarm clock","ambulance"]
    }
*/
var fs = require('fs')
var obj = JSON.parse(fs.readFileSync('data/data.json', 'utf8'))
var guessWords = obj.guessWords
module.exports = {
/**
     * Returns chosen word and optional word for user to select one
     *  @param {guessWords} guessWords from game_data json file proprty
     *  @returns {data} data: {
        chosenWord : airplane,
        options: ["aircraft carrier","airplane","alarm clock","ambulance"]
    }
     *  @returns {chosenWord} chosenWord for the game.
     *  @returns {options} options for other user to select one.
     */
  getWord: () => {
    let options = []
    var chosenWord = guessWords[Math.floor(Math.random() * guessWords.length)];
    options.push(chosenWord)
    while (options.length !== 4) {
      var word = guessWords[Math.floor(Math.random() * guessWords.length)]
      var found = false
      for (var i in options) {
        if (options[i] === word) {
          found = true
          break
        }
      }
      if (!found) {
        options.push(word)
      }
    }
    options = module.exports.shuffle(options)
    return {
      // data: {
      chosenWord,
      options
      // }
    }
  },
  shuffle: (a) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
}
// function getWord() {
//     options = [];
//     var chosenWord = guessWords[Math.floor(Math.random() * guessWords.length)];
//     options.push(chosenWord);
//     while (options.length != 4) {
//         var word = guessWords[Math.floor(Math.random() * guessWords.length)];
//         var found = false;
//         for (i in options) {
//             if (options[i] === word) {
//                 found = true;
//                 break;
//             }
//         }
//         if (!found) {
//             options.push(word);
//         }
//     }
//     options = shuffle(options)
//     return {
//         data: {
//             chosenWord,
//             options
//         }
//     }
// }

// function shuffle(a) {
//     for (let i = a.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [a[i], a[j]] = [a[j], a[i]];
//     }
//     return a;
// }

// console.log(getWord())
