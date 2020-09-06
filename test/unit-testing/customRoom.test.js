// var request = require("supertest");
// require = require("really-need");
const { mockRequest, mockResponse } = require("../utils/interceptor");
const SingleplayerController = require("../../api/controllers/singleplayerController");

const SinglePlayerService = require("../../api/services/singleplayerService");

require("../../errors/gameError");
require("../../errors/userError");
require("../../errors/AppError");

const TestUtils = require("../utils/utils");

var SequelizeMock = require("sequelize-mock");
const { Singleplayer_GuestMode } = require("../../api/model/sequelize");
var DBConnectionMock = new SequelizeMock();

var Singleplayer_Guestmode = DBConnectionMock.define(
  "Singleplayer_Guestmodes",
  {
    uuid: "8712a818-3c59-4d5c-b5bf-fd41b8ee752d",
    username: "blink",
    score: 0,
    gameStarted: false,
    gameFinished: false,
  },
  {
    instanceMethods: {
      myTestFunc: function () {
        return "Test Created Object";
      },
    },
  }
);

// You can also associate mock models as well
var Singleplayer_GuestMode_Words = [
  DBConnectionMock.define("Singleplayer_GuestMode_Words", {
    round_id: 431,
    word: "cup",
    options: ["asparagus", "cup", "triangle", "alarm clock"],
    alreadyGuessed: false,
  }),
  DBConnectionMock.define("Singleplayer_GuestMode_Words", {
    round_id: 432,
    word: "tea",
    options: ["asparagus", "cup", "triangle", "alarm clock"],
    alreadyGuessed: false,
  }),
];

Singleplayer_Guestmode.hasMany(Singleplayer_GuestMode_Words);

describe("Test singleplayer controller index and invalid route method", () => {
  test("should 200 and return api index page", async () => {
    let req = mockRequest();
    req.params.id = 1;
    const res = mockResponse();

    var expected = { message: "Guesstheword app singleplayer Api" };

    await SingleplayerController.index(req, res);

    // expect(response).toBeInstanceOf(JoinRoomResponse);
    // expect(typeof response).toBe("object");
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(expected);
  });

  test("should 404 and return correct value for invalid endpoint", async () => {
    let req = mockRequest();
    var expected = { message: "Not valid endpoint" };
    const res = mockResponse();

    await SingleplayerController.word_not_found(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expected);
  });
});

describe("Singleplayer get word method", () => {
  test("should throw no username error", async () => {
    let req = mockRequest();
    req.query.username = undefined;
    const res = mockResponse();
    var expected = {
      game: { success: false, error: new NoUsernameError() },
    };

    await SingleplayerController.word_get(req, res);

    // expect(response).toBeInstanceOf(expected);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.json).toHaveBeenCalledWith(expected);
  });

  test("should return words with options", async () => {
    let req = mockRequest();
    req.query.username = undefined;

    const res = mockResponse();

    var expected = {
      game: { success: false, error: new NoUsernameError() },
    };

    jest
      .spyOn(SinglePlayerService, "drawingWords")
      .mockReturnValue(TestUtils.getSinglePlayerDrawingWords());

    jest
      .spyOn(SinglePlayerService, "getWordAndOptions")
      .mockReturnValue(TestUtils.getSinglePlayerDrawingWordsWithOptions());

    jest.spyOn(SinglePlayerService, "createGame").mockReturnValue(true);

    console.log(Singleplayer_Guestmode);
    console.log();
    console.log();
    console.log();
    console.log(Singleplayer_GuestMode_Words);

    Singleplayer_Guestmode.findOne().then(async function (user) {
      console.log(user.get("uuid")); // === 1337
      console.log(await user.getSingleplayer_GuestMode_Words());
    });
    // await SingleplayerController.word_get(req, res);

    // // expect(response).toBeInstanceOf(expected);
    // expect(res.status).toHaveBeenCalledTimes(1);
    // expect(res.status).toHaveBeenCalledWith(403);

    // expect(res.json).toHaveBeenCalledWith(expected);
  });
});
//   it("404 everything else", function testPath(done) {
//     console.log("test 404");
//     request(server).get("/foo/bar").expect(404, done);
//   });
