module.exports = (sequelize, type) => {
  return sequelize.define("Singleplayer_Guestmode", {
    uuid: {
      type: type.UUID,
      defaultValue: type.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: type.STRING,
    },
    score: {
      type: type.INTEGER,
      defaultValue: 0,
    },
    gameStarted: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    gameFinished: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
  });
};
