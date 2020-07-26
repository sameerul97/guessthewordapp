// Processing Google quick draw preproccessed dataset and creating json file with 10 drawing for each word
const ndjsonParser = require("ndjson-parse");
var fs = require("fs");
const path = require("path");
const googleDatasetFolder = path.resolve(
  __dirname,
  "../googleduickdrawdatasets/preprocessed/"
);

var dataFolder = path.resolve(
  __dirname,
  "../data/googledrawing_pre_processed_data_3.json"
);

// const googleDatasetFolder = "../googleduickdrawdatasets/preprocessed/";

var files = [];
fs.readdirSync(googleDatasetFolder).forEach((file) => {
  // console.log(file);
  files.push(file);
});

var drawings = [];
for (file in files) {
  const ndjsonString = fs.readFileSync(
    googleDatasetFolder + "/" + files[file],
    "utf8"
  );
  const parsedNdjson = ndjsonParser(ndjsonString);
  console.log(parsedNdjson.length);
  let tempC = 0;
  for (i = 0; i < parsedNdjson.length; i++) {
    if (parsedNdjson[i].drawing.length > 3) {
      if (parsedNdjson[i].recognized) {
        if (tempC < 15) {
          drawings.push(parsedNdjson[i]);
        }
        tempC++;
      }
    }
  }
}

var json = JSON.stringify({ drawing: drawings });
fs.writeFileSync(dataFolder, json);

// var obj = JSON.parse(fs.readFileSync("./final.json", "utf8"));
// console.log(Math.floor(Math.random() * obj.drawing.length));
// <!DOCTYPE html>
// <html>
// <body>

// <canvas id="canvas" width="300" height="150" style="border:1px solid #d3d3d3;">
// Your browser does not support the HTML5 canvas tag.</canvas>

// <script>
// var points_list =  {"data":[{"line":{"color":"#96c23b","points":[{"x":100,"y":238},{"x":38,"y":207},{"x":11,"y":172},{"x":0,"y":139},{"x":0,"y":116},{"x":4,"y":103},{"x":17,"y":82},{"x":40,"y":62},{"x":81,"y":37},{"x":114,"y":32},{"x":135,"y":41},{"x":153,"y":58},{"x":169,"y":83},{"x":177,"y":104},{"x":187,"y":153},{"x":181,"y":197},{"x":169,"y":223},{"x":153,"y":242},{"x":141,"y":251},{"x":125,"y":255},{"x":99,"y":254},{"x":83,"y":246}]}},{"line":{"color":"#96c23b","points":[{"x":91,"y":64},{"x":94,"y":149},{"x":139,"y":166}]}},{"line":{"color":"#96c23b","points":[{"x":34,"y":90},{"x":36,"y":92}]}},{"line":{"color":"#96c23b","points":[{"x":34,"y":90},{"x":69,"y":78},{"x":75,"y":93},{"x":82,"y":88}]}},{"line":{"color":"#96c23b","points":[{"x":92,"y":66},{"x":94,"y":66}]}},{"line":{"color":"#96c23b","points":[{"x":125,"y":80},{"x":126,"y":82}]}},{"line":{"color":"#96c23b","points":[{"x":145,"y":112},{"x":145,"y":112}]}},{"line":{"color":"#96c23b","points":[{"x":145,"y":112},{"x":162,"y":134},{"x":165,"y":163}]}},{"line":{"color":"#96c23b","points":[{"x":166,"y":166},{"x":166,"y":166}]}},{"line":{"color":"#96c23b","points":[{"x":108,"y":220},{"x":96,"y":219}]}},{"line":{"color":"#96c23b","points":[{"x":108,"y":220},{"x":68,"y":186},{"x":63,"y":196},{"x":58,"y":198},{"x":46,"y":182},{"x":40,"y":170},{"x":31,"y":167}]}},{"line":{"color":"#96c23b","points":[{"x":19,"y":140},{"x":19,"y":140}]}},{"line":{"color":"#96c23b","points":[{"x":99,"y":193},{"x":99,"y":193}]}},{"line":{"color":"#96c23b","points":[{"x":99,"y":193},{"x":130,"y":196},{"x":145,"y":210},{"x":150,"y":210},{"x":153,"y":204}]}},{"line":{"color":"#96c23b","points":[{"x":113,"y":22},{"x":105,"y":30},{"x":106,"y":63},{"x":118,"y":82},{"x":138,"y":85},{"x":153,"y":79},{"x":183,"y":56},{"x":195,"y":35},{"x":197,"y":18},{"x":183,"y":3},{"x":155,"y":1},{"x":124,"y":13},{"x":114,"y":24},{"x":117,"y":31}]}},{"line":{"color":"#96c23b","points":[{"x":35,"y":17},{"x":15,"y":40},{"x":18,"y":54},{"x":28,"y":66},{"x":36,"y":70},{"x":55,"y":72},{"x":68,"y":67},{"x":75,"y":60},{"x":85,"y":37},{"x":86,"y":17},{"x":79,"y":6},{"x":57,"y":3},{"x":44,"y":11},{"x":37,"y":20},{"x":31,"y":44}]}},{"line":{"color":"#96c23b","points":[{"x":71,"y":234},{"x":60,"y":241},{"x":53,"y":252}]}}]
// };

// var lineIndexA = 1;
// var lineIndexB = 0;

// var canvas = document.getElementById("canvas");
// canvas.width = 500;
// canvas.height = 500;
// var context = canvas.getContext("2d");

// function drawLines() {

//   var value = points_list.data[lineIndexB];
//   var info = value.line;
//   var color = info.color;
//   var width = info.width;
//   var points = info.points;

//   context.beginPath();
//   context.moveTo(points[lineIndexA-1].x, points[lineIndexA-1].y);
//   context.lineWidth = width;
//   context.strokeStyle = color;
//   context.fillStyle = color;
//   context.lineTo(points[lineIndexA].x, points[lineIndexA].y);
//   context.stroke();

//   lineIndexA = lineIndexA + 1;
//   if (lineIndexA>points.length-1) {
//   	lineIndexA = 1;
//     lineIndexB = lineIndexB + 1;
//   }

//   //stop the animation if the last line is exhausted...
//   if (lineIndexB>points_list.data.length-1) return;

//   setTimeout(function() {
//   	drawLines()
//   },80);
// }

// drawLines();
// </script>

// </body>
// </html>
