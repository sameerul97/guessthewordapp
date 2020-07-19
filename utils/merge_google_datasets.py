from os import listdir
from os.path import isfile, join
import json
import ndjson

rawDataFolder = "../googleduickdrawdatasets/raw/"
preProcessedDataFolder = "../googleduickdrawdatasets/preprocessed/"
rawFilesExtension = ".ndjson_.gstmp"
preProcessedFileExtension = ".ndjson"
drawings = {"drawing": []}

raw_files = [f for f in listdir(rawDataFolder)
             if isfile(join(rawDataFolder, f))]
pre_processed_files = [f for f in listdir(
    preProcessedDataFolder) if isfile(join(preProcessedDataFolder, f))]

found_counter = 0
matching_files = []

for raw_file in range(len(raw_files)):
    rf = raw_files[raw_file].split(".")[0]
    for pre_processed_file in range(len(pre_processed_files)):
        ppf = pre_processed_files[pre_processed_file].split(".")[0]
        if (rf == ppf):
            matching_files.append(rf)
            found_counter += 1

print(found_counter, matching_files)

def writeInTemporaryArray(data):
    drawings["drawing"].append(data)


def WriteIntoDisk():
    with open('../data/googledrawing_merged_data.json', 'w') as fp:
        json.dump(drawings, fp)


for matching_file in range(len(matching_files)):
    with open(rawDataFolder + matching_files[matching_file] + rawFilesExtension) as file:
        rawDataParsedJson = ndjson.reader(file)
        found_counter = 0
        for rawDataParsedJsonObject in rawDataParsedJson:
            if(found_counter < 10):
                if(rawDataParsedJsonObject["recognized"]):
                    with open(preProcessedDataFolder+matching_files[matching_file] + preProcessedFileExtension) as preProcessedfile:
                        preProcessedParsedJsonData = ndjson.reader(
                            preProcessedfile)
                        for preProcessedParsedJsonObject in preProcessedParsedJsonData:
                            if(preProcessedParsedJsonObject["key_id"] == rawDataParsedJsonObject["key_id"]):
                                if(preProcessedParsedJsonObject["recognized"] and rawDataParsedJsonObject["recognized"]):
                                    writeInTemporaryArray(
                                        preProcessedParsedJsonObject)
                                    found_counter += 1
                                    break
            else:
                break


WriteIntoDisk()
