module.exports = (sequelize, type) => {
  return sequelize.define("GameRoomLink", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    roomName: type.STRING,
    gameKey: {
      type: type.UUID,
      defaultValue: type.UUIDV4,
    },
    expiryTime: {
      type: type.DATE,
    }
  });
};
