// Mergin raw and pre processed dataset. As pre proccessed dataset doesnt have scaled cordinates.
// Why this script: Pre processed dataset doesnt contain time values for each stroke
// raw dataset has time, but the cordinates arent resized.
// Solution: both dataset by getting cordinates from pre proccessed and getting time values from raw if they both have
// matching id

var fs = require("fs"),
  es = require("event-stream");
const googleRawDatasetFolder = "../googleduickdrawdatasets/raw/";
const googlePre_ProcessedDatasetFolder =
  "../googleduickdrawdatasets/preprocessed/";
var raw_files = [];
fs.readdirSync(googleRawDatasetFolder).forEach((file) => {
  // console.log(file);
  raw_files.push(file);
});
var pre_processed_files = [];

fs.readdirSync(googlePre_ProcessedDatasetFolder).forEach((file) => {
  // console.log(file);
  pre_processed_files.push(file);
});
console.log(raw_files.length);
console.log(pre_processed_files.length);
var found_counter = 0;
for (raw_file in raw_files) {
  //   console.log(raw_files[raw_file].split(".")[0]);
  var rf = raw_files[raw_file].split(".")[0];
  for (pre_processed_file in pre_processed_files) {
    var ppf = pre_processed_files[pre_processed_file].split(".")[0];
    if (rf === ppf) {
      console.log(`Found ${rf} and ${ppf}`);
      found_counter++;
    }
  }
}
console.log(found_counter);
 
