const Sequelize = require("sequelize");
const GameRoomLinkModel = require("../../entity/gameRoomLink");
const Singleplayer_GuestMode_Model = require("./singleplayer_guestmode");
const Singleplayer_GuestMode_Words_Model = require("./singleplayer_guestMode_words");

const sequelize = new Sequelize(
  process.env.PG_DB_NAME || "guesstheword_db",
  process.env.PG_DB_USERNAME || "guesstheword_user",
  process.env.PG_DB_PASSWORD || "guesstheword_password",
  {
    host: process.env.PG_HOST || "db",
    dialect: "postgres",
    // logging: false,
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

const GameRoomLink = GameRoomLinkModel(sequelize, Sequelize);
const Singleplayer_GuestMode = Singleplayer_GuestMode_Model(
  sequelize,
  Sequelize
);
const Singleplayer_GuestMode_Words = Singleplayer_GuestMode_Words_Model(
  sequelize,
  Sequelize
);

Singleplayer_GuestMode.hasMany(Singleplayer_GuestMode_Words, {
  as: "words",
  foreignKey: "gameid",
  // targetKey: "uuid",
});

Singleplayer_GuestMode_Words.belongsTo(Singleplayer_GuestMode, {
  foreignKey: "gameid",
  targetKey: "uuid",
});

sequelize.sync({ alter: true }).then(() => {
  // sequelize.sync({ force: true }).then(() => {
  console.log(`Database & tables created!`);
});

module.exports = {
  GameRoomLink,
  Singleplayer_GuestMode,
  Singleplayer_GuestMode_Words,
};
