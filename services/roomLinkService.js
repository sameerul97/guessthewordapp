const { GameRoomLink } = require("../entity/sequelize");
module.exports = {
  gameRoomLinkValid: (gameKey) => {
    return new Promise(async (resolve, reject) => {
      let room = await GameRoomLink.findAll({
        where: {
          gameKey: gameKey,
          gameFinished: false,
        },
      });
      if (room.length > 1) {
        console.warn("Shouldn't have happened, Look into this bug");
      }
      if (room.length > 0) resolve(room[0]);
      else reject(new Error("Invalid Room link"));
    });
  },
  expireGameRoomLink: (gameKey) => {
    return new Promise(async (resolve, reject) => {
      let room = await GameRoomLink.update(
        {
          gameFinished: true,
        },
        {
          where: {
            gameKey: gameKey,
          },
        }
      );
      if (room.length > 0) resolve(room[0]);
      else reject(new Error("Invalid Room link"));
    });
  },
};
