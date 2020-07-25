// Processing Google quick draw raw dataset and creating json file with 10 drawing for each word
var fs = require("fs"),
  es = require("event-stream");
const googleDatasetFolder = "../googleduickdrawdatasets/raw/";
var files = [];
fs.readdirSync(googleDatasetFolder).forEach((file) => {
  // console.log(file);
  files.push(file);
});
var fileindex = 0;
var drawings = [];

function writeIntoDisk() {
  var json = JSON.stringify({ drawing: drawings });
  fs.writeFileSync("../data/googledrawing_processed_raw_data.json", json);
}

function fileParser(fileindex, callback) {
  lineC = 0;
  var s = fs
    .createReadStream(googleDatasetFolder + files[fileindex])
    .pipe(es.split())
    .pipe(
      es
        .mapSync(function (line) {
          // pause the readstream
          if (lineC < 10) {
            s.pause();
            let jsonD = JSON.parse(line);
            console.log(typeof jsonD);
            // if (jsonD.recognized) {
            lineC++;
            drawings.push(jsonD);
            console.log(drawings.length);
            // }
            s.resume();
          } else {
            s.destroy();
            fileindex++;
            if (fileindex != files.length) {
              fileParser(fileindex, writeIntoDisk);
            } else {
              s.end();
              console.log("STOP");
              callback();
            }
          }
        })
        .on("error", function (err) {
          console.log("Error while reading file.", err);
        })
        .on("end", function () {
          console.log("Read entire file.");
        })
    );
}
fileParser(fileindex, writeIntoDisk);
