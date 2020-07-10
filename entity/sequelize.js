const Sequelize = require("sequelize");
const GameRoomLinkModel = require("./gameRoomLink");

const sequelize = new Sequelize(
  process.env.PG_DB_NAME || "guessthewordapp_db",
  process.env.PG_DB_USERNAME || "guessthewordappPgAdmin",
  process.env.PG_DB_PASSWORD || "guessthewordappPgAdminPassword",
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

sequelize.sync({ force: false }).then(() => {
  console.log(`Database & tables created!`);
});

module.exports = { GameRoomLink };
