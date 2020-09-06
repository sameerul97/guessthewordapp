var SequelizeMock = require("sequelize-mock");
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
var Singleplayer_GuestMode_Words = DBConnectionMock.define(
  "Singleplayer_GuestMode_Words",
  {
    round_id:431,
    word: "cup",
    options: ["asparagus", "cup", "triangle", "alarm clock"],
    alreadyGuessed: false,
  }
);

UserMock.hasMany(Singleplayer_GuestMode_Words);
