const { GameRoomLink } = require("../entity/sequelize");
module.exports = {
  gameRoomLinkValid: (gameKey) => {
    return new Promise(async (resolve, reject) => {
      let room = await GameRoomLink.findAll({
        where: {
          gameKey: gameKey,
        },
      });
      if (room.length > 0) resolve(room);
      else reject(new Error("Invalid Room link"));
    });
  },
};
